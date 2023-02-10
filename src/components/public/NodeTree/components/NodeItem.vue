<template>
  <div class="node-view">
    <div class="node-label">
      <div class="icon-view" @click.stop="data.isExpand = !data.isExpand">
        <div v-if="isChildren" class="icon">
          <i :class="`${data.isExpand ? 'el-icon-minus' : 'el-icon-plus'}`"></i>
        </div>
      </div>
      <el-checkbox
        :value="data.isChecked"
        :indeterminate="data.isIndeterminate"
        @click.native.prevent="checkChange(data)"
      >{{ data.name }}</el-checkbox>
    </div>
    <div v-if="isChildren" class="node-children">
      <template v-if="data.isExpand">
        <NodeItem v-for="(x, i) in data.children" :key="i" :data="x" :parentData="data" />
      </template>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { nodeItem } from "../index.d";

@Component({
  name: "NodeItem",
})
export default class NodeItem extends Vue {
  @Prop() data!: nodeItem;
  @Prop() parentData!: nodeItem;
  get isChildren() {
    return this.data.children && this.data.children.length > 0;
  }
  @Watch("data", { deep: true })
  changeData() {
    if (this.parentData) {
      const length = this.parentData.children.filter(x => x.isChecked).length;
      const indeterminateLength = this.parentData.children.filter(x => x.isIndeterminate).length;
      this.parentData.isIndeterminate =
        !!indeterminateLength || (!!length && length !== this.parentData.children.length);
      this.parentData.isChecked = !!length && length === this.parentData.children.length;
    }
  }
  /**
   * @description: 复选框点击
   * @param {*}
   * @return {*}
   */
  checkChange(data: nodeItem) {
    this.changeAllCheck([data], !data.isChecked);
  }
  /**
   * @description: 全部选择更改
   * @param {*} data
   * @return {*}
   */
  changeAllCheck(data: nodeItem[], isChecked: boolean) {
    data.forEach(x => {
      x.isChecked = isChecked;
      if (x.children && x.children.length > 0) {
        this.changeAllCheck(x.children, isChecked);
      }
    });
  }
}
</script>
<style lang="scss" scoped>
.node-view {
  position: relative;
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 15px;
    width: 0px;
    height: 100%;
  }
  .node-view {
    padding-left: 20px;
    &:before {
      border-left: 1px solid #ddd;
    }
  }
  .node-label {
    height: 30px;
    display: flex;
    align-items: center;
    transition: 0.3s;
    &:hover {
      background-color: #f5f7fa;
    }
    .el-checkbox {
      flex: 1;
    }
    .icon-view {
      width: 30px;
      height: 40px;
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
</style>
