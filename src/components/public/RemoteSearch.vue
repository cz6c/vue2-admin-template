<script>
var timer;
export default {
  name: "RemoteSearch",
  props: {
    value: {
      type: String | Number,
      default: "",
    },
    // 请求接口
    apiMethod: {
      type: Function,
      required: true,
      default() {},
    },
    // 请求接口回调数据格式化
    apiFormat: {
      type: Function,
      required: true,
      default() {},
    },
    // 搜索字段名
    searchProp: {
      type: String,
      required: true,
      default: "key",
    },
    // 其他请求字段
    apiParams: {
      type: Object,
      default() {
        return {};
      },
    },
    // 输入框占位
    placeholder: {
      type: String,
      default: "请选择",
    },
    // 是否启用清空选项
    clearable: {
      type: Boolean,
      default: true,
    },
    // 禁用
    disabled: {
      type: Boolean,
      default: false,
    },
    // 是否多选
    isMultiple: {
      type: Boolean,
      default: false,
    },
    // 多选模式下只显示一个tag
    oneTag: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isLoading: false,
      options: [],
      selectValue: {},
    };
  },
  created() {
    this.init();
  },
  methods: {
    async init() {
      this.selectValue = this.value;
      await this.filterMethod();
    },
    async filterMethod(value) {
      this.isLoading = true;
      let json = {
        limit: 30,
        // 其他字段
        ...this.apiParams,
      };
      // 搜索字段
      json[this.searchProp] = value;
      // 请求接口
      let { data } = await this.apiMethod(json);
      this.options = this.apiFormat(data).map(x => {
        return {
          ...x,
          value: `${x.label}/${x.desc || ""}`,
        };
      });
      this.isLoading = false;
    },
    // 输入框延迟
    delayData() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        this.filterMethod();
      }, 300);
    },
  },
  render(h) {
    let { placeholder, delayData, isLoading, clearable, options, selectValue, isMultiple, disabled } = this;
    return h(
      "el-select",
      {
        attrs: {
          filterable: true,
          value: selectValue,
          placeholder,
          filterMethod: delayData,
          loading: isLoading,
          clearable,
          popperClass: "remoteSearch",
          multiple: isMultiple,
          collapseTags: this.oneTag,
          disabled,
        },
        on: {
          input: value => {
            this.selectValue = value;
            if (!this.isMultiple) {
              let item = this.options.find(x => {
                return x.value === value;
              });
              this.$emit("input", item);
            } else {
              let item = this.options.filter(x => {
                return value.indexOf(x.value) !== -1;
              });
              this.$emit("input", Array.from(new Set([...this.value, ...item])));
            }
          },
        },
      },
      [
        options.map(({ id: key, label, desc, value }) => {
          return h(
            "el-option",
            {
              attrs: {
                key,
                value,
              },
            },
            [
              h("div", { class: "autocomplete-dt" }, [
                h("div", { class: "autocomplete-label" }, label),
                h("div", { class: "autocomplete-desc" }, desc),
              ]),
            ],
          );
        }),
      ],
    );
  },
};
</script>
<style lang="scss">
.remoteSearch {
  li {
    .autocomplete-dt {
      display: flex;
      justify-content: space-between;
      align-items: center;
      overflow: hidden;
      .autocomplete-label {
        width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .autocomplete-desc {
        font-size: 12px;
        color: #b4b4b4;
      }
    }
  }
}
</style>
