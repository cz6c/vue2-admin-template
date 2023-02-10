<template>
  <div class="select-view">
    <span class="tips">
      已选
      <span class="color">{{ $parent.selectNumber }}</span>
      项
    </span>
    <slot name="select"></slot>
    <el-button class="close-all" @click="closeAll">取消选中</el-button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { Table } from "element-ui";
@Component({
  name: "SelectView",
})
export default class SelectView extends Vue {
  @Prop({ required: true })
  private tableClass!: Table; // tableClass是table实例或者table实例的父类
  checkedKeys=false;
  filterTable(): Table {
    let table;
    if (this.tableClass.$options.name === "ElTable") {
      table = this.tableClass;
    } else if (this.tableClass.$children[0].$options.name === "ElTable") {
      table = this.tableClass.$children[0];
    }
    return table as Table;
  }
  closeAll() {
    const table:any = this.filterTable();
    table.checkedKeys = true;
    table.clearSelection();
  }
}
</script>

<style scoped lang="scss">
.select-view {
  justify-content: flex-start !important;
  .tips {
    margin-right: 16px;
    font-size: 14px;
    color: #666666;
    .color {
      color: $--color-primary;
    }
  }
  .close-all {
    margin-left: auto;
    margin-right: 0;
  }
}
</style>
