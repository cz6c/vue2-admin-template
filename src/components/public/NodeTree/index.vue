<template>
  <div class="node-content">
    <el-form ref="form" :labelWidth="labelWidth">
      <el-form-item :label="`${formLabel}:`">
        <div class="handle-item">
          <div class="icon-view" @click.stop="(isAllExpand = !isAllExpand), changeAllExpand(nowData)">
            <div class="icon">
              <i :class="`${isAllExpand ? 'el-icon-minus' : 'el-icon-plus'}`"></i>
            </div>
          </div>
          <el-checkbox v-model="isAllCheck" :indeterminate="isAllIndeterminate" @change="changeAllCheck(nowData)">全选</el-checkbox>
        </div>
      </el-form-item>
    </el-form>
    <div class="now-wrapper" :style="{ paddingLeft: labelWidth }">
      <NodeItem v-for="(x, i) in nowData" :key="i" :data="x" />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { nodeItem } from "./index.d";
import NodeItem from "./components/NodeItem.vue";
@Component({
  name: "NodeTree",
  components: { NodeItem },
})
export default class NodeTree extends Vue {
  @Prop() data!: nodeItem[];
  @Prop({ default: "权限" }) formLabel!: string;
  @Prop({ default: "90px" }) labelWidth!: number;
  @Prop({ default: false }) isReturnPid!: boolean;
  @Prop({ default: true }) isExpand!: boolean;
  // 默认勾选数据
  @Prop() idsData!: string[];
  // 是否全选
  isAllCheck = false;
  // 是否全展开
  isAllExpand = false;
  // 是否不确定勾选
  isAllIndeterminate = false;
  // 当前数据
  nowData: nodeItem[] = [];
  // 监听最顶级数据
  @Watch("data")
  changeData() {
    this.changeDefaults(this.data);
    this.nowData = JSON.parse(JSON.stringify(this.data));
  }
  @Watch("nowData", { deep: true })
  changeNowData() {
    const length = this.nowData.filter(x => x.isChecked).length;
    const indeterminateLength = this.nowData.filter(x => x.isIndeterminate).length;
    this.isAllIndeterminate = !!indeterminateLength || (!!length && length !== this.data.length);
    this.isAllCheck = length === this.data.length;
  }

  /**
   * @description: 更改默认数据
   * @param {*}
   * @return {*}
   */
  changeDefaults(data: nodeItem[]) {
    console.log(data);
    
    data.forEach(x => {
      x.isExpand = this.isExpand;
      x.isIndeterminate = false;
      x.isChecked = false;
      const isChildren = x.children && x.children.length > 0;
      if (!isChildren) {
        x.isChecked = this.idsData.map(x => String(x)).includes(String(x.id));
      } else {
        this.changeDefaults(x.children);
      }
    });
  }
  /**
   * @description: 全部展开更改
   * @param {*} data
   * @return {*}
   */
  changeAllExpand(data: nodeItem[]) {
    data.forEach(x => {
      this.$set(x, "isExpand", this.isAllExpand);
      if (x.children && x.children.length > 0) {
        this.changeAllExpand(x.children);
      }
    });
  }
  /**
   * @description: 全部选择更改
   * @param {*} data
   * @return {*}
   */
  changeAllCheck(data: nodeItem[]) {
    data.forEach(x => {
      this.$set(x, "isChecked", this.isAllCheck);
      if (x.children && x.children.length > 0) {
        this.changeAllCheck(x.children);
      }
    });
  }
  /**
   * @description: 递归查询所有父级
   * @param {object} list
   * @param {number} id
   * @return {*}
   */
  getParentIdList(list: nodeItem[], id: number): nodeItem[] {
    if (!list || !id) {
      return [];
    }
    const arr: nodeItem[] = [];
    const findParent = (data: nodeItem[], nodeId: number, parentId?: number) => {
      for (let i = 0, length = data.length; i < length; i++) {
        const node = data[i];
        // 由于后端返回的树状结构数组里面的value值为string类型,所以为了避免判断全等有问题,所以将传入的城市id使用toString进行了类型转换
        if (node.id === nodeId) {
          arr.unshift(node);
          if (nodeId === list[0].id) {
            break;
          }
          parentId && findParent(list, parentId);
          break;
        } else {
          if (node.children) {
            findParent(node.children, nodeId, node.id);
          }
          continue;
        }
      }
      return arr;
    };
    return findParent(list, id);
  }
  /**
   * @description: 循环查询匹配数据
   * @param {*}
   * @return {*}
   */
  findTreeData(data: nodeItem[]): number[] {
    const ids: number[] = [];
    const findTree = (x: nodeItem[]) => {
      x.forEach(({ id, isChecked, children }) => {
        if (children && children.length > 0) {
          findTree(children);
        } else if (isChecked) {
          ids.push(id);
        }
      });
    };
    findTree(data);
    return ids;
  }
  /**
   * @description: 获取选择内容(外层refs调用该方法即返回选择id)
   * @param {*}
   * @return {*}
   */
  getNodeValue() {
    // 已选择项(注：只是最后一级的id，即无子级项)
    const ids = this.findTreeData(this.nowData);
    this.isReturnPid &&
      ids.forEach(x => {
        const node = this.getParentIdList(this.nowData, x);
        node.pop();
        node.forEach(({ id }) => {
          ids.push(id);
        });
      });

    return [...new Set(ids)];
  }
}
</script>

<style lang="scss" scoped>
.node-content {
  .el-form {
    .el-form-item {
      &:last-of-type {
        margin: 0;
      }
      .handle-item {
        display: flex;
        align-items: center;
        &:hover {
          background-color: #f5f7fa;
        }
        .icon-view {
          width: 30px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          .icon {
            font-size: 12px;
            height: 12px;
            width: 12px;
            border: 1px solid #13c2c2;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
            i {
              color: #13c2c2;
              line-height: 11px;
              transform: scale(0.6);
              display: flex;
              align-items: center;
              justify-content: center;
              transform-origin: center center;
            }
          }
        }
      }
    }
  }
  .el-checkbox {
    flex: 1;
    display: flex;
    align-items: center;
    line-height: normal;
    /deep/.el-checkbox__input {
      display: block;
      height: 14px;
    }
  }
}
</style>
