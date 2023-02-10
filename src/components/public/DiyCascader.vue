<template>
  <div class="diy-cascader">
    <el-popover
      placement="bottom-start"
      popper-class="cascader-view"
      @show="isOpen = true"
      @hide="isOpen = false"
      v-model="isOpen"
      :disabled="disabled"
      ref="popover"
    >
      <div
        class="el-cascader" 
        slot="reference"
        :class="{ clearable: clearable && (isMultiple ? value.length : value) }"
      >
        <!-- 联动输入框 -->
        <el-input
          v-model="choseText"
          :placeholder="placeholder"
          readonly
          @click.stop="isOpen = !isOpen"
          :disabled="disabled"
          ref="inputView"
          class="input-view"
        >
          <i
            class="el-icon-arrow-down el-input__icon"
            slot="suffix"
            @click.stop="isOpen = !isOpen"
            :class="{ 'is-reverse': !disabled && isOpen }"
          />
          <i class="el-icon-circle-close el-input__icon" v-if="clearable" slot="suffix" @click.stop="clearData" />
        </el-input>
        <!-- 多选标签（全） -->
        <div class="el-cascader__tags" ref="cascaderTags" v-if="!oneTag">
          <span class="el-tag el-tag--info el-tag--small el-tag--light" v-for="(x, i) in choseList" :key="i">
            <span>{{ x.name }}</span>
            <i @click.stop="delTag(x.id)" v-if="!disabled" class="el-tag__close el-icon-close" />
          </span>
        </div>
        <!-- 多选标签（单） -->
        <div class="el-cascader__tags" ref="cascaderTags" v-else-if="choseList[0]">
          <span class="el-tag el-tag--info el-tag--small el-tag--light">
            <span>{{ choseList[0].name }}</span>
            <i @click.stop="delTag(choseList[0].id)" v-if="!disabled" class="el-tag__close el-icon-close" />
          </span>
          <span class="el-tag el-tag--info el-tag--small el-tag--light" v-if="choseList.length > 1"
            ><span>+ {{ choseList.length - 1 }}</span></span
          >
        </div>
      </div>
      <!-- 选择列表 -->
      <div v-if="optionArr.length !== 0" class="cascader-list-view">
        <template v-for="(x, i) in list">
          <el-scrollbar ref="scrollbar" :key="i" class="el-cascader-menu">
            <div class="el-cascader-menu__wrap">
              <ul class="el-cascader-menu__list">
                <template v-for="(item, index) in x">
                  <li
                    class="el-cascader-node"
                    :key="index"
                    @mouseenter="hoverItem(item)"
                    @click="clickItem(item)"
                    :class="{
                      'in-active-path': isHasActive(item),
                      active: isMultiple ? value.includes(item.id) : value === item.id,
                    }"
                  >
                    <!-- 勾 -->
                    <i
                      class="el-icon-check el-cascader-node__prefix"
                      v-if="isMultiple ? value.includes(item.id) : value === item.id"
                    />
                    <span class="el-cascader-node__label">{{ item.label }}</span>
                    <!-- 箭头 -->
                    <i
                      class="el-icon-arrow-right el-cascader-node__postfix"
                      v-if="item.children && item.children.length > 0"
                    />
                  </li>
                </template>
              </ul>
            </div>
          </el-scrollbar>
        </template>
      </div>
      <div v-else class="optionArr-empty">
        <div>暂无数据</div>
      </div>
    </el-popover>
  </div>
</template>
<script>
export default {
  name: "DiyCascader",
  props: {
    // 输入框占位
    placeholder: {
      type: String,
      default: "请选择",
    },
    value: {
      type: Array | Number,
    },
    // 选择选项
    options: {
      type: Array,
      default: [],
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false,
    },
    disabledIds: {
      type: [Number, Array],
    },
    // 多选模式下只显示一个tag
    oneTag: {
      type: Boolean,
      default: false,
    },
    // 是否启用清空选项
    clearable: {
      type: Boolean,
      default: false,
    },
    // 是否可选父级
    isCanSelectParent: {
      type: Boolean,
      default: false,
    },
    // 是否显示全部节点
    isShowAllNode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isOpen: false,
      // 当前数据
      list: [],
      // 当前选中名
      choseText: "",
      choseList: [],
      nowHover: [],
      isMultiple: false,
      optionArr: [],
    };
  },
  watch: {
    // 监听列表
    options: {
      immediate: true,
      handler(data) {
        if (data && data.length > 0) {
          this.optionArr = this.setLevel(data);
          this.list[0] = this.optionArr;
        }
        this.changeValue();
      },
    },
    // 监听当前选中id
    value: {
      immediate: true,
      handler() {
        this.optionArr.length && this.changeValue();
      },
    },
  },
  methods: {
    /**
     * @description: 值改变
     * @param {*}
     * @return {*}
     */
    changeValue() {
      let data = this.value;
      this.isMultiple = Array.isArray(data);
      if (!this.isMultiple) {
        let value = this.getParentIdList(this.optionArr, data);
        if (value.length !== 0) {
          this.choseText =
            this.isCanSelectParent || this.isShowAllNode
              ? value.map(x => x.label).join("/")
              : value[value.length - 1].label;
        } else {
          this.choseText = "";
        }
        this.choseData = value;
        this.nowHover = value.map(x => x.id);
        this.list.length = 1;
        this.setDefaultList(value);
      } else {
        // 多选操作
        // 判断是否有值
        this.choseText = data.length === 0 ? "" : " ";
        // 查找当前ids对应名称
        this.choseList = this.getChildrenId(this.optionArr);
        // 判断当前选择id高度
        let i = !!this.isOpen;
        i && (this.isOpen = false);
        this.$nextTick(() => {
          let h = this.$refs.cascaderTags ? this.$refs.cascaderTags.offsetHeight : 32;
          this.$refs.inputView.$refs.input.setAttribute("style", `height:${h <= 32 ? 32 : h + 10}px`);
          i && (this.isOpen = true);
        });
      }
    },
    /**
     * @description: 设置默认列表
     * @param {*}
     * @return {*}
     */
    setDefaultList(data) {
      data.forEach((x, i) => {
        if (i + 1 === data.length || !x.children || x.children.length === 0) return;
        this.list.push(x.children);
      });
    },
    /**
     * @description: 根据id获取树结构父级
     * @param {*} list
     * @param {*} id
     * @return {*}
     */
    getParentIdList(list, id) {
      if (!list || id === "" || id === undefined || id === null) {
        return [];
      }
      const arr = [];
      const findParent = (data, nodeId, parentId) => {
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
    },
    /**
     * @description: 循环插入树结构level字段
     * @param {*}
     * @return {*}
     */
    setLevel(data, level = 1, pName = "", pId = []) {
      data.forEach(item => {
        item.pId = pId;
        item.pName = pName;
        item.children &&
          (item.children = this.setLevel(item.children, level + 1, `${item.pName}${item.label}/`, item.pId));
        item.level = level;
      });
      return data.filter(item => {
        return (
          !this.disabledIds ||
          (!Array.isArray(this.disabledIds) ? this.disabledIds !== item.id : !this.disabledIds.includes(item.id))
        );
      });
    },
    /**
     * @description: 树结构根据id查名称
     * @param {*} data
     * @param {*} level
     * @param {*} arr
     * @return {*}
     */
    getChildrenId(data, level = 1, arr = []) {
      data.forEach(item => {
        // 判断是否多选
        let value = this.isMultiple ? this.value : [this.value];
        // 查找
        let it = value.find(x => {
          return item.id === x;
        });
        // 插入
        it !== undefined &&
          arr.push({
            id: item.id,
            name: this.isCanSelectParent || this.isShowAllNode ? `${item.pName}${item.label}` : `${item.label}`,
          });
        // 再查询
        item.children && this.getChildrenId(item.children, level + 1, arr);
      });
      return arr;
    },
    /**
     * @description: 鼠标经过显示对于子级
     * @param {*} level
     * @param {*} children
     * @param {*} id
     * @return {*}
     */
    hoverItem({ level, children, id }) {
      // 显示子级
      if (children && children.length) {
        this.list.length = level;

        this.$set(this.list, level, children);
      } else {
        this.list = this.list.filter((x, i) => i < level);
      }
      // 高亮
      this.nowHover.length = level - 1;
      this.nowHover[level - 1] = id;
      this.$refs.scrollbar[level - 1].update();

      setTimeout(() => {
        this.$refs.popover && this.$refs.popover.updatePopper && this.$refs.popover.updatePopper();
      });
    },
    /**
     * @description: 点击
     * @param {*} item
     * @return {*}
     */
    clickItem(item) {
      if (!this.isCanSelectParent && item.children && item.children.length > 0) {
        return;
      }
      if (!this.isMultiple) {
        // 单选
        this.isOpen = false;
        this.$emit("input", item.id, item);
      } else {
        // 多选
        this.choseText = ` `;
        // 判断是否已选
        let index = this.value.findIndex(x => {
          return x === item.id;
        });
        if (index !== -1) {
          // 已选则删除
          this.value.splice(index, 1);
        } else {
          // 未选插入
          this.value.push(item.id);
        }
        // 更新
        this.$emit("input", this.value);
      }
      console.log(item);
      this.list.length = item.level;
    },
    /**
     * @description: 多选删除tag
     * @param {*} id
     * @return {*}
     */
    delTag(id) {
      let index = this.value.findIndex(x => {
        return x === id;
      });
      index !== -1 && this.value.splice(index, 1);
    },
    /**
     * @description: 清除内容
     * @param {*}
     * @return {*}
     */
    clearData() {
      this.$emit("input", this.isMultiple ? [] : "");
    },
    isHasActive(item) {
      if (!item.children || item.children.length === 0) return false;
      return (
        this.nowHover[item.level - 1] === item.id ||
        (this.isMultiple ? this.value.includes(item.id) : this.value === item.id)
      );
    },
  },
};
</script>

<style lang="scss">
.cascader-view {
  padding: 0 !important;
  .cascader-list-view {
    border-radius: 4px;
    font-size: 14px;
    display: flex;
    .el-cascader-menu {
      overflow: hidden;
      width: 182px;
      height: 180px;
      &:last-child {
        border-right: solid 1px transparent;
      }
    }
    .el-scrollbar__wrap {
      overflow-x: hidden;
    }
    .el-cascader-menu__wrap {
      height: initial;
    }

    .el-cascader-node {
      .el-icon-check {
        color: $--color-primary;
      }
      .el-cascader-node__label {
        font-weight: normal;
      }

      &:hover {
        background-color: #f5f5f5;
      }
      &.in-active-path {
        background-color: #e6f7ff;
      }
      &.active {
        color: $--color-primary;
      }
    }
  }
  .optionArr-empty {
    width: 182px;
    padding: 5px;
    div {
      display: flex;
      justify-content: center;
    }
  }
}
</style>

<style lang="scss" scoped>
.diy-cascader {
  > span {
    display: block;
  }
  .el-popover__reference-wrapper {
    display: block;
  }
  .el-cascader {
    width: 100%;
    &:focus {
      outline: none;
    }
  }
  .clearable {
    &:hover {
      .el-icon-circle-close {
        display: block;
      }
      .el-icon-arrow-down {
        display: none;
      }
    }
  }
  /deep/.el-input {
    &:focus {
      outline: none;
    }
    .el-icon-circle-close {
      display: none;
    }
  }
  /deep/.el-tag {
    height: 25px !important;
  }
}
</style>
