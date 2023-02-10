<script lang="ts">
import { Vue, Prop, Component, Watch } from "vue-property-decorator";
import { CreateElement } from "vue";
@Component({
  name: "TableSelect",
})
export default class TableSelect extends Vue {
  @Prop({
    type: [Object, String, Number],
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
  // 是否只返回id,否则返回选中数据项
  @Prop({ type: Number })
  valueId!: number;
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
  // 是否需要组件创建就加载
  @Prop({
    type: Boolean,
    default: true,
  })
  readonly isImmediate!: boolean;
  search = 0;
  @Watch("value", { immediate: true })
  getPiedata(value: object, OldValue: object) {
    if (value && String(value) !== "{}") {
      this.searchText = this.value[this.valueKey];
      // 如果为表格选择赋值传1，不是传0
      this.search = 1;
    } else {
      this.searchText = "";
      this.lastSeachText = "";
    }
    if (OldValue && !value) {
      this.filterMethod();
    }
  }
  @Watch("apiParams", { deep: true })
  changeApiParams() {
    Object.assign(this.listQuery, this.apiParams);
    this.init();
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
  lastSeachText = "";
  isLoading = false;
  created() {
    this.isImmediate && this.init();
  }
  async init() {
    await this.filterMethod();
  }
  async filterMethod(page?: number) {
    this.isLoading = true;
    try {
      // 搜索字段
      (this.listQuery as any)[this.searchProp] = this.lastSeachText;
      if (page) {
        this.listQuery.page = page;
      }
      // 请求接口
      let { data } = await this.apiMethod(this.listQuery);
      this.listQuery.count = data[this.countKey];
      this.columnData = this.apiFormat(data);
      this.isLoading = false;
    } catch (error: any) {
      console.error(error.message);
    }
  }
  // 输入框延迟
  delayData() {
    clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      if (this.searchText !== undefined) {
        this.listQuery.page = 1;
      }
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
          // transition: "el-zoom-in-top",
        },
        ref: "selectPopper",
      },
      [
        h("TableView", {
          ref: "tableView",
          attrs: {
            highlightCurrentRow: true,
            tableHeight: "250px",
            indexColum: false,
            data: this.columnData,
            column: this.column,
            ...this.otherTable,
            isLoading: this.isLoading,
          },
          on: {
            currentChange: (value: any) => {
              (this.$refs.selectPopper as any).doClose();
              value && (value.value = value.name);
              this.$emit("input", value);
              this.$emit("update:valueId", value.id);
              if ((this.$parent.$options as any).componentName === "ElFormItem") {
                this.$parent.$emit("el.form.change", [value]);
              }
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
              (this.$refs.selectPopper as any).doShow();
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
                  if (value) {
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
                else {
                  // this.$emit(
                  //   "input",
                  //   this.value.value
                  //     ? this.value
                  //     : {
                  //         name: this.searchText,
                  //       },
                  // );
                  this.$emit("input", {
                    name: this.searchText,
                  });
                }
                this.delayData();
                this.lastSeachText = value;
                if (!value) {
                  // this.$emit("input", {});
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
