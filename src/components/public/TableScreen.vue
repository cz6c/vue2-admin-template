<script>
import AreaChose from "@/components/public/AreaChose";
import CascaderArea from "@/components/public/CascaderArea";
import Vue from "vue";
const moment = require("moment");
export default {
  name: "TableScreen",
  components: {
    AreaChose,
    CascaderArea,
  },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    labelWidth: {
      type: String,
      default: "100px",
    },
    otherBtnAlign: {
      type: String,
      default: "right",
    },
    postData: {
      type: Object,
      default: () => {},
    },
    marginBottom: {
      type: String,
      default: "10px",
    },
  },
  data() {
    return {
      apiData: {},
      pickerOptions: {
        shortcuts: [
          {
            text: "本月",
            onClick(picker) {
              let now = new Date();
              let year = now.getFullYear();
              let month = now.getMonth() + 1;
              let day = now.getDate();
              const start = new Date(year + "-" + month + "-01 00:00:00");
              const end = new Date(year + "-" + month + "-" + day + " 23:59:59");
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "今年至今",
            onClick(picker) {
              const end = new Date();
              const start = new Date(new Date().getFullYear(), 0);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近六个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 180);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "重置",
            onClick(picker) {
              const end = "";
              const start = "";
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
    };
  },
  mounted() {
    this.postData &&
      Object.keys(this.postData).forEach(key => {
        this.$set(this.apiData, key, this.postData[key]);
      });
  },
  methods: {
    initData() {
      Object.keys(this.apiData).forEach(key => {
        this.$set(this.apiData, key, Array.isArray(this.apiData[key]) ? [] : "");
      });
      this.data.forEach(x => {
        this.$set(x, "value", Array.isArray(x.value) ? [] : "");
      });
      this.$refs.cascaderArea && this.$refs.cascaderArea.$children[0].handleClear();
      this.$emit(`search`, this.apiData);
    },
    init() {
      Object.keys(this.apiData).forEach(key => {
        this.apiData[key] = "";
      });
      this.$refs.cascaderArea && this.$refs.cascaderArea.$children[0].handleClear();
      this.$forceUpdate();
    },
  },
  render(h) {
    const strategy = {
      /**
       * 远程搜索
       */
      remoteSearch: ({ prop, searchProp, apiMethod, placeholder }) => {
        return h("remote-search", {
          props: {
            value: this.apiData[prop],
            searchProp,
            apiMethod,
            placeholder,
          },
        });
      },
      /**
       * 输入框
       */
      input: ({ prop, label, placeholder, width }) => {
        return h("el-input", {
          props: {
            value: this.apiData[prop],
          },
          attrs: {
            placeholder: placeholder || `请输入${label}`,
          },
          style: {
            width,
          },
          on: {
            input: value => {
              this.$set(this.apiData, prop, value);
              this.$forceUpdate();
            },
          },
        });
      },
      /**
       * 下拉框
       */
      select: ({
        prop,
        label,
        options,
        placeholder,
        multiple = false,
        clearable = true,
        width,
        collapseTags = false,
      }) => {
        const childrenVnode = options.map(item => {
          return h("el-option", {
            props: {
              value: item.value,
              key: item.value,
              label: item.label,
            },
          });
        });

        return h(
          "el-select",
          {
            props: {
              value: this.apiData[prop],
              multiple: multiple,
              clearable,
              collapseTags,
            },
            attrs: {
              placeholder: placeholder || `请选择${label}`,
            },
            style: {
              width,
            },
            on: {
              input: value => {
                this.$set(this.apiData, prop, value);
              },
            },
          },
          childrenVnode,
        );
      },
      /**
       * 单个日期选择
       */
      date: ({
        prop,
        label,
        format,
        valueFormat = "yyyy-MM-dd",
        placeholder,
        dateType = "date",
        disabled = false,
        pickerOptions,
      }) => {
        return h("el-date-picker", {
          props: {
            value: this.apiData[prop],
            format: format || valueFormat,
            valueFormat,
            type: dateType,
            disabled,
          },
          attrs: {
            placeholder: placeholder || `请输入${label}`,
            pickerOptions,
          },
          on: {
            input: value => {
              this.$set(this.apiData, prop, value);
            },
          },
        });
      },
      /**
       * 日期范围选择
       */
      daterange: item => {
        let {
          dateType = "daterange",
          prop,
          value,
          label,
          format,
          valueFormat = "yyyy-MM-dd",
          startPlaceholder = "开始日期",
          endPlaceholder = "结束日期",
        } = item;
        return h("el-date-picker", {
          attrs: {
            value,
            type: dateType,
            clearable: false,
            format: format || valueFormat,
            "picker-options": this.pickerOptions,
            valueFormat,
            startPlaceholder,
            endPlaceholder,
          },
          on: {
            input: value => {
              Vue.set(item, "value", value);
              this.apiData[prop[0]] = valueFormat === "timestamp" ? value[0] / 1000 : value[0];
              this.apiData[prop[1]] = valueFormat === "timestamp" ? value[1] / 1000 : value[1];
            },
          },
        });
      },
      // 地区选择
      areaChose: ({ prop = ["provinceId", "cityId", "areaId"], label, format, placeholder }) => {
        return h("AreaChose", {
          attrs: {
            placeholder,
          },
          on: {
            input: value => {
              prop.forEach((x, i) => {
                Vue.set(this.apiData, x, value[i]);
              });
            },
          },
        });
      },
      /**
       * 级联下拉地区选择
       */
      cascaderArea: item => {
        const { placeholder = "请选择" + props.label, prop = ["provinceId", "cityId", "areaId"] } = item;
        return h("CascaderArea", {
          ref: "cascaderArea",
          attrs: {
            placeholder,
          },
          on: {
            changeArea: value => {
              prop.forEach((x, i) => {
                Vue.set(this.apiData, x, value[i]);
              });
            },
          },
        });
      },
      /**
       * 级联下拉选择
       */
      cascader: item => {
        /**
         * item字段解析
         * @param {*} disabled // 是否禁用
         * @param {*} oneTag // 多选模式下只显示一个tag
         * @param {*} clearable // 是否支持清空选项
         *
         */
        let { disabled = false, oneTag = false, clearable = true, prop } = item;
        return h("DiyCascader", {
          attrs: {
            ...item,
            value: this.apiData[prop],
            options: item.options,
            disabled,
            clearable,
            oneTag,
          },
          on: {
            input: val => {
              Vue.set(this.apiData, prop, val);
            },
          },
        });
      },
      /**
       * 多功能表格下拉选择
       */
      tableSelect: item => {
        /**
         * item字段解析
         * @param {*} returnKey // 是否禁用
         *
         */
        let { value, prop, width } = item;
        return h("TableSelect", {
          attrs: {
            value,
            ...item,
          },
          style: {
            width,
          },
          on: {
            input: val => {
              Vue.set(item, "value", val);
              if (prop && Array.isArray(prop)) {
                prop.forEach(x => {
                  Vue.set(this.apiData, x, val[x]);
                });
              } else {
                Vue.set(this.apiData, prop, val[prop]);
              }
            },
          },
        });
      },
    };
    // console.log(1);
    // 表单数据
    const formList = [];
    this.data.forEach(item => {
      const childrenVnode = item.type ? strategy[item.type](item) : strategy["input"](item);
      const vnode = h(
        "el-form-item",
        {
          style: {
            marginBottom: this.marginBottom,
          },
          props: {
            "label-width": this.labelWidth,
            label: item.label && item.label + "：",
          },
        },
        [childrenVnode],
      );
      !item.hidden && formList.push(vnode);
    });

    // 搜索按钮
    formList.push(
      h(
        "el-button",
        {
          props: {
            type: "primary",
          },
          style: {
            marginBottom: this.marginBottom,
          },
          on: {
            click: value => {
              this.$emit(`search`, this.apiData);
            },
          },
        },
        ["搜索"],
      ),
    );
    // 清空按钮
    formList.push(
      h(
        "el-button",
        {
          style: {
            marginBottom: this.marginBottom,
          },
          on: {
            click: value => {
              this.initData();
            },
          },
        },
        ["清空"],
      ),
    );

    if (this.$scopedSlots.default) {
      // 其他按钮
      formList.push(
        h(
          "div",
          {
            class: `other-btn-${this.otherBtnAlign}`,
          },
          this.$scopedSlots.default(),
        ),
      );
    }

    return h(
      "el-form",
      {
        props: {
          inline: true,
        },
        class: "table-search",
        style: {
          marginTop: this.marginBottom,
        },
      },
      formList,
    );
  },
};
</script>

<style lang="scss" scoped>
.other-btn-left {
  display: inline-block;
  margin-left: 10px;
}

.other-btn-right {
  float: right;
}
</style>
