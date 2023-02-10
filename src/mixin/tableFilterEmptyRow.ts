import Vue from "vue";
import Component from "vue-class-component";
import { Ref } from "vue-property-decorator";
@Component
export default class formFormat extends Vue {
  @Ref()
  readonly tableView!: any;
  tableData!: any;
  multipleSelection!: any;
  filterEmptyRow() {
    // 取消不在table的行的选中状态
    const tableIds = this.tableData.map(({ id }: { id: number }) => id);
    const elTable = this.tableView.$children[0];
    this.multipleSelection.forEach((row: any) => {
      if (!tableIds.includes(row.id)) {
        elTable.toggleRowSelection(row);
      } else {
        // 更新相同row的数据
        const index = tableIds.findIndex((id: any) => id === row.id);
        Object.assign(row, this.tableData[index]);
      }
    });
  }
}
