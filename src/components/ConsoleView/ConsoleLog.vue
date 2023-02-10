<template>
  <div class="console-wrapper">
    <slot name="leftWrapper">
      <el-radio-group v-model="syncStatus">
        <el-radio-button v-for="item of statusList" :key="item.value" :label="item.value">
          {{ item.label }}
        </el-radio-button>
      </el-radio-group>
      <!-- <el-tabs :value="syncStatus" @tab-click="tabChange">
        <el-tab-pane v-for="item of statusList" :key="item.value" :label="item.label" :name="item.value"></el-tab-pane>
      </el-tabs> -->
    </slot>
    <div class="right-wrapper">
      <!-- <div v-if="$slots.search" class="btn-item" @click="$parent.viewStatus = 'SearchView'">
        <svg-icon icon="consoleView-search" style="width: 20px; height: 20px" />
        <span>搜索</span>
      </div> -->
      <slot name="rightWrapper"> </slot>
      <div class="btn-item" @click="$parent.$emit('refresh')">
        <!-- <svg-icon icon="consoleView-refresh" /> -->
        <el-button>刷新</el-button>
      </div>
      <el-dropdown trigger="click" placement="top-end" :hide-on-click="false">
        <div class="btn-item">
          <!-- <svg-icon icon="consoleView-setting" /> -->
          <el-button>设置</el-button>
        </div>
        <el-dropdown-menu slot="dropdown" ref="dropdownMenu" class="set-dropdown">
          <div class="btn-wrapper">
            <el-checkbox v-model="allChecked" :indeterminate="isIndeterminate" @change="handleAllChecked">
              全选
            </el-checkbox>
            <el-button type="text" @click="handleClearLocalStorage">重置</el-button>
          </div>
          <el-checkbox-group v-model="settingSelected" @change="handleChangeTable">
            <el-dropdown-item v-for="(item, index) of filterSettingOptions" :key="index">
              <el-checkbox :label="item"></el-checkbox>
            </el-dropdown-item>
          </el-checkbox-group>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script lang="ts">
import { Table, TableColumn, DropdownMenu } from "element-ui";
import { Component, Vue, PropSync, Prop, Watch, Ref } from "vue-property-decorator";
import { TagsViewModule } from "@/store/modules/tagsView";
import Sortable from "sortablejs";
export type StatusList = { label: string; value: string | number }[];
export type tableSetting = { label: string; visible: boolean; width?: string }[];
const blackList = ["selection", "序号"];
@Component({
  name: "ConsoleLog",
})
export default class ConsoleLog extends Vue {
  @Prop({ type: Array })
  statusList!: StatusList;
  @Prop({ type: Array, default: () => [] })
  public titleList!: any[];

  @Prop({ required: true })
  private tableClass!: Table; // tableClass是table实例或者table实例的父类

  @PropSync("status", { type: [String, Number] })
  private syncStatus!: string | number;

  private settingSelected: string[] = [];

  private settingOptions: string[] = [];

  private tableOriginColumns: TableColumn[] = []; // 把table的初始columns数据保存起来,用于排序,删除,新增

  private tableColumns: TableColumn[] = [];

  private fixedColumns: TableColumn[] = [];

  private tableSetting: Record<string, tableSetting> = {};

  private table!: Table;

  private allChecked = true;
  private isIndeterminate = false;
  private get routePath() {
    const { path } = this.$route;
    return path;
  }

  // 代理模式,此处做黑名单进行筛选
  private get filterSettingOptions() {
    const list = JSON.parse(JSON.stringify(this.settingOptions));
    blackList.forEach(blackItem => {
      const blackItemIndex = list.indexOf(blackItem);
      if (blackItemIndex !== -1) {
        list.splice(blackItemIndex, 1);
      }
    });
    return list;
  }

  @Ref() readonly dropdownMenu!: DropdownMenu;
  @Watch("settingSelected", { deep: true })
  syncAllChecked(value: string[]) {
    const checkedCount = value.length - (this.settingOptions.length - this.filterSettingOptions.length);
    this.isIndeterminate = checkedCount > 0 && checkedCount < this.filterSettingOptions.length;
    this.allChecked = this.filterSettingOptions.length === checkedCount;
  }

  @Watch("tableClass")
  private initTableSetting() {
    this.tableSetting = this.getLocalStorage();
    // prop tableClass 是table实例或者table实例的父类,这里筛选出table
    const tempTable = this.filterTable();
    if (tempTable) {
      this.table = tempTable;
    } else {
      throw new Error("您传入的tableClass组件不为ElTable或者TableView");
    }
    // 复制table的columns数据
    const states = (this.table as any).store.$data.states;
    // console.log(states.originColumns);
    this.tableOriginColumns = states.originColumns;
    this.tableColumns = states.columns;
    // this.fixedColumns = [...states.fixedColumns, ...states.rightFixedColumns];
    this.fixedColumns = states.fixedColumns;
    // 重置setting下拉菜单
    const tableColumns: TableColumn[] = (this.table as any).columns;
    const result: string[] = tableColumns.map(({ label, type }) => label || type);
    const currentSetting = this.tableSetting[this.routePath];
    if (currentSetting) {
      // 判断表单是否已经改变了,如果改变就清空localstorage的数据
      if (this.validateTableUpdate()) {
        this.settingOptions = currentSetting.map(({ label }) => label);
        const selected = currentSetting.filter(({ visible }) => visible).map(({ label }) => label);
        this.settingSelected = JSON.parse(JSON.stringify(selected));
        this.handleChangeTable();
      } else {
        Reflect.deleteProperty(this.tableSetting, this.routePath);
        window.localStorage.setItem("tableSetting", JSON.stringify(this.tableSetting));
        this.tableSetting = this.getLocalStorage();
        this.settingOptions = result;
        this.settingSelected = JSON.parse(JSON.stringify(result));
      }
    } else {
      this.settingOptions = result;
      const settingSelected = result.filter(item => {
        const row = this.titleList.find(it => it.label === item);
        return (row && row.visible) !== false;
      });
      this.settingSelected = settingSelected;
      this.handleChangeTable(false);
    }
    // 添加下拉拖拽排序
    this.$nextTick(() => {
      this.setSort();
    });
    // table组件添加header-dragend事件
    this.table.$on("header-dragend", this.handleSaveLocalStorage);
  }
  private handleAllChecked(value: boolean) {
    if (value) {
      this.settingSelected = this.settingOptions;
    } else {
      const list = blackList.filter(item => this.settingOptions.includes(item));
      this.settingSelected = list;
    }
    this.handleChangeTable();
  }

  /**
   * @description: 添加拖动排序
   */
  private setSort() {
    const el = this.dropdownMenu.$el.querySelector<HTMLDivElement>(".el-checkbox-group");
    if (el) {
      Sortable.create(el, {
        ghostClass: "sortable-ghost",
        setData: function (dataTransfer: any) {
          dataTransfer.setData("Text", "");
        },
        onEnd: ({ oldIndex, newIndex }: any) => {
          if (typeof oldIndex === "number" && typeof newIndex === "number") {
            const tempItem = this.filterSettingOptions.splice(oldIndex, 1)[0];
            this.filterSettingOptions.splice(newIndex, 0, tempItem);
            // 黑名单是禁止拖拽的,一直保持在最前列
            const beforeList = blackList.filter(item => this.settingOptions.includes(item));
            this.settingOptions = [...beforeList, ...this.filterSettingOptions];
            this.handleChangeTable();
          }
        },
      });
    }
  }
  filterTable(): Table {
    let table;
    if (this.tableClass.$options.name === "ElTable") {
      table = this.tableClass;
    } else if (this.tableClass.$children[0].$options.name === "ElTable") {
      table = this.tableClass.$children[0];
    }
    return table as Table;
  }
  /**
   * @description: 更新table
   */
  private handleChangeTable(saveLocal = true) {
    // 给settingSelected按照settingOptions进行数据排序,因为checkboxGroup数据是乱序
    const settingValue = this.settingOptions.filter(item => this.settingSelected.includes(item));

    // 排序功能
    //   1.columns控制table-body
    //   2.originColumns控制table-header
    //   3.因为header需要originColumns和columns一起控制,所以两个都要改
    const states = (this.table as any).store.$data.states;
    if (this.tableOriginColumns.length !== this.tableColumns.length) {
      return;
    }
    states.originColumns = settingValue.map(settingLabel => {
      return this.tableOriginColumns.find(({ label, type }) => [type, label].includes(settingLabel));
    });
    states.columns = settingValue.map(settingLabel => {
      return this.tableColumns.find(({ label, type }) => [type, label].includes(settingLabel));
    });
    states.fixedColumns = settingValue.map(settingLabel => {
      return this.fixedColumns.find(({ label, type }) => [type, label].includes(settingLabel));
    });

    states.fixedColumns = states.fixedColumns.filter((x: any) => x);
    states.fixedLeafColumnsLength = states.fixedColumns.length;

    const currentSetting = this.tableSetting[this.routePath];
    if (currentSetting) {
      const tableColumn: TableColumn[] = states.columns;
      for (let index = 0; index < tableColumn.length; index++) {
        const columns = tableColumn[index];
        const { label, type } = columns;
        const settingColumn = currentSetting.find(({ label: columnsLabel }) => [label, type].includes(columnsLabel));
        if (settingColumn && settingColumn.width) {
          columns.width = settingColumn.width;
        }
      }
      // // 最后一个宽度清零,铺满表单
      // Reflect.deleteProperty(tableColumn[tableColumn.length - 1], "width");
    }

    this.$nextTick(() => {
      (this.table as any).layout.updateColumnsWidth();
    });
    saveLocal && this.handleSaveLocalStorage();
  }
  // --------------------------------- localstroage保存
  getLocalStorage() {
    // localStorage中保存的tableSetting,数据只拿一次,后面的操作是修改对象的值,所以不涉及到get不可修改报错
    const tableSettingStr = window.localStorage.getItem("tableSetting");
    let tableSetting;
    try {
      if (tableSettingStr) {
        tableSetting = JSON.parse(tableSettingStr);
      } else {
        tableSetting = {};
      }
    } catch (error) {
      tableSetting = {};
      console.error("tableSetting JSON.parse失败,已重置为空对象");
    }
    return tableSetting;
  }
  private handleSaveLocalStorage() {
    const settingValue = this.settingOptions.map(item => {
      const columns = this.tableColumns.find(({ label, type }) => [type, label].includes(item));
      return {
        visible: this.settingSelected.includes(item),
        label: item,
        width: (columns as any).width,
      };
    });
    this.tableSetting[this.routePath] = settingValue;
    window.localStorage.setItem("tableSetting", JSON.stringify(this.tableSetting));
  }
  /**
   * @description: 重置table
   */
  private handleClearLocalStorage() {
    // 清除localstorage的数据
    const newTableSetting = JSON.parse(JSON.stringify(this.tableSetting));
    Reflect.deleteProperty(newTableSetting, this.routePath); // 去除页面表格缓存
    window.localStorage.setItem("tableSetting", JSON.stringify(newTableSetting));
    // 页面刷新
    TagsViewModule.delCachedView(this.$route);
    this.$nextTick(() => {
      this.$router.replace({
        path: "/auth-redirect-layout",
        query: {
          redirect: this.$route.fullPath,
        },
      });
    });
  }
  /**
   * @description: 判断页面与table是否完全一致
   */
  private validateTableUpdate(): boolean {
    const { tableColumns, tableSetting } = this;
    const currentSetting = tableSetting[this.routePath] || [];
    if (tableColumns.length !== currentSetting.length) {
      return false;
    } else {
      const tableSettingList = currentSetting.map(({ label }) => label);
      const tableColumnsList = tableColumns.map(({ label, type }) => label || type);
      const result = tableSettingList.every(item => tableColumnsList.includes(item));
      const result1 = tableColumnsList.every(item => tableSettingList.includes(item));
      return result && result1;
    }
  }
  // tabChange({ name }: any) {
  //   this.$emit("update:status", name);
  // }
}
</script>

<style scoped lang="scss">
.console-wrapper {
  div.right-wrapper {
    // padding-right: 20px;
    height: 100%;
    display: flex;
    // margin-right: -10px;
    align-items: center; // 删掉样式会炸
    margin-left: 15px;
    div.btn-item {
      margin-left: 12px;
      // margin-right: 10px;
      display: flex;
      align-items: center;
      cursor: pointer;
      user-select: none;
      .el-button {
        border: 1px solid #e0e0e0;
        background: #f6f7fb;
        width: 66px;
      }
      /deep/.svg-icon {
        margin-right: 6px;
        width: 16px;
        height: 16px;
      }
      span {
        font-size: 14px;
        font-weight: 400;
        color: #666666;
        white-space: nowrap;
      }
    }
    /deep/ .el-dropdown {
      display: flex;
      align-items: center;
    }
  }
  /deep/.el-form--inline {
    display: flex;
    align-items: center;
    > * {
      margin-bottom: 0 !important;
    }
  }
}
</style>
<style lang="scss">
.sortable-ghost {
  opacity: 0.8;
  color: #fff !important;
}
.set-dropdown {
  max-height: 500px;
  height: initial !important;
  overflow-y: auto;
  div.btn-wrapper {
    display: flex;
    justify-content: space-between;
    padding: 0 20px;
    align-items: center;
    width: 100px;
    // el-checkbox {
    // }

    // el-button {
    // }
  }
  .el-dropdown-menu__item {
    padding: 0 20px !important;
  }
}
</style>
