<script lang="ts">
import { Vue, Prop, Component, Watch } from "vue-property-decorator";
import { CreateElement } from "vue";
import { log } from "console";
@Component({
  name: "TableMultipleSelect",
})
export default class TableMultipleSelect extends Vue {
  @Prop({
    type: [Object, String, Number, Array],
    default() {
      return {};
    },
  })
  readonly value!: any;
  @Prop({
    type: Function,
    required: true,
    default() {
      return {};
    },
  })
  readonly apiMethod!: Function;

  // 请求接口回调数据格式化
  @Prop({
    type: Function,
    required: true,
    default() {
      return {};
    },
  })
  readonly apiFormat!: Function;
  // 搜索字段名
  @Prop({
    type: String,
    default: "key",
  })
  readonly searchProp!: string;
  // 作为 value 唯一标识的键名
  @Prop({
    type: String,
    required: true,
    default: "",
  })
  readonly valueKey!: string;
  // 接口总数字段
  @Prop({
    type: String,
    default: "count",
  })
  readonly countKey!: string;
  // 表格内容
  @Prop({
    type: Array,
    default() {},
  })
  readonly column!: Array<object>;
  // 表格其他属性
  @Prop({
    type: Object,
    default() {
      return {};
    },
  })
  readonly otherTable!: object;
  // 输入框提示
  @Prop({
    type: String,
    default: "请选择或关键字查询",
  })
  readonly placeholder!: string;
  @Prop({
    type: Boolean,
    default: false,
  })
  readonly disabled!: boolean;
  // 其他请求参数
  @Prop({
    type: Object,
    default() {
      return {};
    },
  })
  readonly apiParams!: object;
  @Prop({
    type: [Number, String],
    default: 600,
  })
  readonly width!: number | string;
  @Prop({
    type: String,
  })
  readonly size!: string;
  // 是否支持回调输入文本
  @Prop({
    type: Boolean,
  })
  readonly isInput!: boolean;
  @Watch("value", { immediate: true })
  getPiedata(value: any) {
    if (value.length) {
      this.searchText = this.value
        .map((it: any) => {
          return it[this.valueKey];
        })
        .join(",");
    } else {
      this.searchText = "";
    }
  }

  timer = 0;
  searchText = "";
  columnData = [];
  listQuery = {
    page: 1,
    limit: 10,
    count: 0,
    ...this.apiParams,
  };
  lastSearchText = "";
  isLoading = false;
  created() {
    this.init();
  }
  async init() {
    await this.filterMethod();
  }
  async filterMethod(page?:any) {
    this.isLoading = true;
    try {
      // 搜索字段
      // (this.listQuery as any)[this.searchProp] = this.searchText;
      (this.listQuery as any)[this.searchProp] = this.lastSearchText;
      if (page) {
        this.listQuery.page = page;
      }      
      // 请求接口
      let { data } = await this.apiMethod(this.listQuery);
      this.listQuery.count = data[this.countKey];
      this.columnData = this.apiFormat(data);
      this.isLoading = false;
    } catch (error:any) {
      console.error(error.message);
    }
  }
  // 输入框延迟
  delayData() {
    clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      this.filterMethod(1);
    }, 300);
  }
  render(h: CreateElement) {
    let popover = h(
      "el-popover",
      {
        attrs: {
          popperClass: "table-select-popper",
          placement: "bottom-start",
          trigger: "focus",
          disabled: this.disabled,
          width: this.width,
        },
        ref: "selectPopper",
      },
      [
        h("TableView", {
          ref: "tableView",
          attrs: {
            tableHeight: "250px",
            indexColum: false,
            data: this.columnData,
            column: this.column,
            ...this.otherTable,
            isLoading: this.isLoading,
            isSelection: true,
            isMultiple: true,
            rowKey: "id",
            reserveSelection: true,
          },
          on: {
            selectionChange: (value: any) => {
              let arr = value.filter((it:any)=>{
                return it.id === -1
              })
              const isAll = value.some((x:any)=>{return x.id === -1})
              if(isAll){
                if(value.length >1) this.$message.warning("已选中所有全部科室！")
                value = arr
              }
              this.$emit("input", value);
            },
          },
        }),
        h("Pagination", {
          attrs: {
            total: this.listQuery.count,
            page: this.listQuery.page,
            limit: this.listQuery.limit,
          },
          on: {
            pagination: (obj: any) => {
              Object.assign(this.listQuery, obj);
              this.filterMethod();
            },
          },
        }),
        h(
          "el-input",
          {
            slot: "reference",
            attrs: {
              size: this.size,
              value: this.searchText,
              placeholder: this.placeholder,
              disabled: this.disabled,
            },
            on: {
              input: (value: string) => {                
                this.searchText = value;                
                if (this.isInput) {
                  if (this.value.value) {
                    this.value.value = this.searchText;
                  }
                  this.$emit(
                    "input",
                    this.value.value           
                      ? this.value
                      : {
                          value: this.searchText,
                        },
                  );
                }
                this.lastSearchText=value;
                this.delayData();
                if (!value) {
                  this.$emit("input", {});
                }
              },
            },
          },
          [
            h("i", {
              class: "el-icon-arrow-down",
              slot: "suffix",
              style: {
                width: "25px",
                cursor: "pointer",
              },
            }),
          ],
        ),
      ],
    );
    return h("div", { class: "table-select" }, [popover]);
  }
  mounted() {
    if (Array.isArray(this.value)) {
      this.value.forEach(item => {
        console.log(item);
      });
    }
  }
}
</script>

<style lang="scss">
.table-select-popper {
  padding: 0 !important;
  .el-table {
    th {
      padding: 5px 0;
    }
    td {
      padding: 4px 0;
    }
  }
  .pagination-container {
    padding: 5px;
    .el-pagination__jump,
    .el-pagination__sizes {
      display: none;
    }
  }
  .popper__arrow::after {
    border-bottom-color: #f9fafc;
  }
}
</style>
<style lang="scss" scoped></style>
