<script>
// 公共接口
import { common } from "@/api/public/index";
// 富文本组件
import Tinymce from "./Tinymce";
// 规格组件
import SpecView from "./SpecView";
// 地区选择组件
import AreaChose from "../AreaChose";
// 选择城市组件
import ChooseCity from "./ChooseCity";
// 腾讯地图组件
import TencentMap from "./TencentMap";
// 级联下拉地区选择
import CascaderArea from "../CascaderArea";
// 选择商品
import ChoseGoods from "./ChoseGoods";
// 获取token
import { getToken } from "@/utils/auth";

// 时间格式化
import moment from "moment";

// 七牛云公共接口
import { qiniuUplod, getVideoBase64 } from "./lib.js";
// 自定义表格组件
import IntegralView from "../IntegralView";
import SignView from "../SignView";

import Vue from "vue";

import VueTagsInput from "@johmun/vue-tags-input";

import UploadList from "./UploadList";

export default {
  name: "FormView",
  components: {
    Tinymce,
    SpecView,
    ChooseCity,
    CascaderArea,
    AreaChose,
    TencentMap,
    ChoseGoods,
    IntegralView,
    SignView,
    VueTagsInput,
    UploadList,
  },
  /**
   * 传入值
   * @param {*} value
   * @param {*} submitText  // 确认文本
   * @param {*} deleteText  // 删除文本
   * @param {*} cancelText  // 取消文本
   * @param {*} showList // 限制显示prop字段
   * @param {*} isValidateform // 提交时是否验证表单
   * @param {*} labelWidth // label所占宽度
   * @param {*} labelPosition // label文字位置
   * @param {*} isLoading // 保存按钮loading
   * @param {*} btnSize // 保存按钮大小
   * @param {*} isLabelColon // 标签是否统一加冒号
   * @param {*} itemContentWidth // item内容宽度
   * @param {*} columns // 栅格布局（*列布局
   * @param {*} maxFormWidth // 表单最大宽度
   * @param {*} isTextForm // 是否为文本表单
   * @param {*} hasBorder // 是否是带边框的报告表格式
   */
  props: {
    value: {
      type: Array,
      required: true,
    },
    submitText: {
      type: String,
      default: "",
    },
    cancelText: {
      type: String,
      default: "",
    },
    deleteText: {
      type: String,
      default: "",
    },
    showList: {
      type: Array,
      default: () => [],
    },
    isValidateform: {
      type: Boolean,
      default: true,
    },
    labelWidth: {
      type: String,
      default: "100px",
    },
    labelPosition: {
      type: String,
      default: "right",
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    btnSize: {
      type: String,
      default: "",
    },
    isFixed: {
      type: Boolean,
      default: true,
    },
    isTextForm: {
      type: Boolean,
      default: false,
    },
    itemContentWidth: {
      type: String,
      default: "300px",
    },
    isLabelColon: {
      type: Boolean,
      default: false,
    },
    columns: {
      type: Number,
      default: 0,
    },
    maxFormWidth: {
      type: Number,
      default: 0,
    },
    hasBorder: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      visible: false,
    };
  },
  mounted() {
    this.$refs.form.$el.addEventListener("dblclick", e => {
      if (e.target.className !== "el-form-item__label") {
        this.$emit("changeTextStatus");
      }
    });
  },
  computed: {
    formItemWidth() {
      return this.columns ? "100%" : this.itemContentWidth;
    },
    formData: {
      get() {
        // 循环处理表单列表
        const temp = {};
        const flatValue = Array.prototype.concat(...this.value);
        flatValue.forEach(({ prop, data }) => {
          temp[prop] = data;
        });
        return temp;
      },
      set(item) {},
    },
    rules() {
      // 处理表单验证规则
      const temp = {};
      const value = Array.prototype.concat(...this.value);
      value.forEach(({ label, prop, type = "input", maximumInput, rule = [], required, rulesLabel }) => {
        // 基础验证规则
        const tipsType = type.toLowerCase().indexOf("input") !== -1 ? "请输入" : "请选择";
        const tipsTrigger =
          type.toLowerCase().indexOf("input") !== -1 || type.indexOf("eleCascader") !== -1 ? "blur" : "change";
        const arr = required
          ? [{ required: true, message: rulesLabel || `${tipsType}${label}`, trigger: tipsTrigger }]
          : [];
        const maxInput = maximumInput
          ? [{ max: maximumInput, message: `${label}输入信息已超出最大限制`, trigger: tipsTrigger }]
          : [];
        // 合并验证规则
        const ruleList = [...arr, ...rule, ...maxInput];
        temp[prop] = ruleList;
      });
      return temp;
    },
  },
  created() {
    // 初始化数据处理
    this.init(this.value);
    if (window.history.length === 1) {
      // 新开的标签页不展示返回按钮
      this.cancelText = "";
    }
  },
  methods: {
    init(list) {
      list.forEach(item => {
        if (Array.isArray(item)) {
          this.init(item);
        } else {
          let { label, labelText } = item;
          item.placeholder && (item.oPlaceholder = item.placeholder);
          if (!label || labelText) return;
          // 是否带冒号
          let hasColon = [":", "："].indexOf(label.charAt(label.length - 1)) !== -1;
          if (hasColon) {
            item.label = label.slice(0, label.length - 1);
            item.labelText = `${item.label}:`;
          } else {
            item.labelText = `${item.label}${this.isLabelColon ? ":" : ""}`;
          }
        }
      });
    },
    // 执行事件
    handleEvent(prop) {
      return () => {
        this.$emit(`handle-${prop}`);
      };
    },
    getValue() {
      return this.value;
    },
    // 数据处理
    normalExtractData(rawList) {
      const temp = {};
      const list = Array.prototype.concat(...rawList);
      console.log(list);
      list.forEach(item => {
        const { prop, data, type, disabled, isHandleData, valueFormat, multiple, dateType, startAndEndProp, isSecond } =
          item;
        // 不处理禁用字段
        if (disabled && !isHandleData) return;
        // 不处理标题
        if (prop === undefined) return;
        // 下拉表格选择控件数据处理
        if (type === "tableSelect") {
          temp[prop] = multiple ? data.map(it => it[prop]) : data[prop];
          return;
        }
        // 日期或时间需要传秒数
        if (type === "datePicker" && valueFormat === "timestamp" && isSecond) {
          if (dateType === "daterange" && data.length == 2 && startAndEndProp) {
            this.$set(temp, startAndEndProp[0], Number((Number(data[0]) / 1000).toFixed(0)));
            this.$set(temp, startAndEndProp[1], Number((Number(data[1]) / 1000).toFixed(0)));
            console.log(temp);
            return;
          }
          temp[prop] = data && Number((Number(data) / 1000).toFixed(0));
          return;
        }
        temp[prop] = data;
      });
      return temp;
    },
    // 提交事件
    handleSubmit() {
      try {
        // 如果存在上传图片/视频/录音组件，且正在上传中，将禁止用户提交
        console.log(this.value);
        this.value.forEach(item => {
          if (["upload", "video", "record", "uploadFile"].indexOf(item.type > -1) && item.status === "uploading") {
            console.log(item.isUpload, item);
            throw Error();
          }
        });
      } catch (err) {
        console.log(err);
        this.$message.warning("请等待上传完成");
        this.isLoading = false;
        return;
      }
      if (this.isValidateform) {
        this.$refs["form"].validate(valid => {
          if (valid) {
            this.$emit("submit", this.normalExtractData(this.value), this.$refs["form"]);
          }
        });
      } else {
        this.$emit("submit", this.normalExtractData(this.value), this.$refs["form"]);
      }
    },
    // 获取富文本内容
    flushTinymceData() {
      this.$refs["tinymce"].flushTinymceData();
    },
    // 获取规格数据
    getSpecResults() {
      if (this.$refs["specView"]) {
        return this.$refs["specView"].getSpecResults();
      } else {
        return false;
      }
    },
  },
  render(h) {
    // ----------- 策略模式 --------------
    const strategy = {
      /**
       * 选择分类
       */
      selectCategoryDialog: item => {
        const { data, options } = item;
        return h("select-category-dialog", {
          props: {
            options,
            value: data,
          },
          on: {
            input: function (event) {
              Vue.set(item, "data", event);
            },
          },
        });
      },
      /**
       * 单文本
       */
      text: ({ data, style }) => {
        return h(
          "div",
          {
            style: {
              border: "1px solid transparent",
              width: "100%",
              wordWrap: "break-word",
              lineHeight: "30px",
              ...style,
            },
          },
          data || "--",
        );
      },
      /**
       * 输入框
       */
      input: item => {
        // console.log(item.labelText, this.formItemWidth);
        /**
         * item字段解析
         * @param {*} inputType // 输入框类型
         * @param {*} button // 右侧按钮文本
         * @param {*} handle // 右侧按钮事件
         * @param {*} leftUnit // 左侧单位文本
         * @param {*} unit // 右侧单位文本
         * @param {*} data // 默认数据
         * @param {*} placeholder // 输入框占位文本
         * @param {*} label // 当前字段名
         * @param {*} props // 其他字段
         * @param {*} width // 输入框宽度
         * @param {*} hidden // 是否隐藏
         * @param {*} disabled // 是否禁止
         * @param {*} slot // 其他插槽名称
         * @param {*} splitBtn // 隔开的按钮名称
         */
        const {
          inputType = "text",
          splitBtn,
          button,
          handle,
          unit,
          leftUnit,
          data,
          props,
          width = this.formItemWidth,
          hidden,
          slot,
          disabled = false,
          clearable = true,
          placeholder = item.label ? `请输入${item.label}` : `请输入${item.labelText}`,
        } = item;
        let append, prepend;
        // 判断插入输入框右侧按钮或单位
        if (button || unit) {
          append = h(
            "el-button",
            {
              slot: "append",
              class: button ? "append-btn" : "append-default",
              on: {
                click: () => {
                  // 右侧按钮执行
                  handle && handle(data);
                },
              },
            },
            button || unit,
          );
        }
        if (leftUnit) {
          prepend = h(
            "el-button",
            {
              slot: "prepend",
              class: "append-default",
            },
            leftUnit,
          );
        }
        let lastBtn;
        if (splitBtn) {
          lastBtn = h(
            "el-button",
            {
              props: {
                type: "primary",
              },
              style: {
                marginLeft: "30px",
              },
              on: {
                click: () => {
                  // 右侧按钮执行
                  handle && handle(data);
                },
              },
            },
            splitBtn,
          );
        }
        // 返回整体html
        return [
          // 输入框
          h(
            "el-input",
            {
              // 属性
              attrs: {
                // 是否显示切换密码图标
                showPassword: !!(inputType === "password"),
                // 输入框类型
                type: inputType,
                // 输入框占位文本
                placeholder,
                // 当前绑定值
                value: data,
                disabled: this.isTextForm || disabled,
                clearable: disabled ? false : clearable,
                // 其他属性
                ...props,
              },
              class: inputType === "number" ? "number-btn" : "",
              style: {
                // 宽度
                width,
                // 是否显示
                display: hidden && "none",
                textAlign: "center",
              },
              on: {
                // 输入事件
                input: val => {
                  inputType === "number" && data < 0 && data != ""
                    ? Vue.set(item, "data", 0)
                    : Vue.set(item, "data", val);
                },
              },
            },
            [prepend, append],
          ),
          // 同级别插槽内容
          this.$scopedSlots[slot] && this.$scopedSlots[slot](),
          lastBtn,
        ];
      },
      /**
       * 用户信息
       */
      userInfo: ({ data: { avatar, name, phone } }) => {
        /**
         * item字段解析
         * @param {*} avatar // 头像地址
         * @param {*} name // 用户名称
         * @param {*} phone // 用户电话
         *
         */
        return h(
          "div",
          {
            style: {
              width: "fit-content",
              textAlign: "center",
            },
          },
          [
            // 头像
            h("el-avatar", {
              class: "userImage",
              attrs: {
                size: 80,
                src: avatar,
                icon: "el-icon-user-solid",
              },
            }),
            // 名称
            h(
              "div",
              {
                style: {
                  lineHeight: "20px",
                },
              },
              name,
            ),
            // 手机号
            h("div", phone),
          ],
        );
      },
      /**
       * 间隔输入框
       */
      inputStage: ({
        inputType = "text",
        unit,
        width,
        hidden,
        data,
        placeholder = ["最小年龄", "最大年龄"],
        props,
      }) => {
        /**
         * item字段解析
         * @param {*} inputType // 输入框类型
         * @param {*} unit // 输入框单位
         * @param {*} width // 输入框宽度
         * @param {*} hidden // 是否隐藏
         * @param {*} data // 输入框数据
         * @param {*} placeholder // 输入框占位
         * @param {*} props // 输入框其他属性
         *
         */
        let append;
        if (unit) {
          // 输入框单位
          append = h(
            "el-button",
            {
              slot: "append",
              class: "append-default",
            },
            unit,
          );
        }
        return [
          // 最小
          h(
            "el-input",
            {
              style: {
                width,
                display: hidden && "none",
              },
              attrs: {
                type: inputType,
                value: data[0],
                placeholder: placeholder[0],
                ...props,
              },
              on: {
                // 输入事件
                input: val => {
                  inputType === "number" && data[0] < 0 && data[0] != "" ? Vue.set(data, 0, 0) : Vue.set(data, 0, val);
                },
              },
            },
            [append],
          ),
          // 间隔文本
          h(
            "span",
            {
              style: {
                padding: "0 8px",
                display: hidden && "none",
              },
            },
            "至",
          ),
          // 最大
          h(
            "el-input",
            {
              style: {
                width,
                display: hidden && "none",
              },
              attrs: {
                type: inputType,
                value: data[1],
                placeholder: placeholder[1],
                ...props,
              },
              on: {
                // 输入事件
                input: val => {
                  inputType === "number" && data[1] < 0 && data[1] != "" ? (data[1] = 0) : Vue.set(data, 1, val);
                },
              },
            },
            [append],
          ),
        ];
      },
      /**
       * 选择器
       */
      select: item => {
        /**
         * item字段解析
         * @param {*} inputType // 输入框类型
         * @param {*} unit // 输入框单位
         *
         */
        const {
          options,
          data,
          slot,
          label,
          width = this.formItemWidth,
          clearable = true,
          placeholder = `请选择${label}`,
          disabled,
          input,
          filterable = false,
        } = item;
        if (!options) {
          console.error("select必须有options参数");
        }
        const children = options.map(({ value, label, disabled }) => {
          return h("el-option", {
            attrs: { key: value, label, value, disabled },
          });
        });
        return [
          h(
            "el-select",
            {
              attrs: {
                value: data,
                placeholder,
                clearable,
                disabled: this.isTextForm || disabled,
                ...item,
                filterable,
              },
              style: {
                // 宽度
                width,
              },
              on: {
                change: val => {
                  Vue.set(item, "data", val);
                  item.change && item.change(val);
                  input && input(val);
                },
                // blur: val =>{
                //   Vue.set(item, "data", val.target.value);
                // }
              },
            },
            [children],
          ),
          this.$scopedSlots[slot] && this.$scopedSlots[slot](),
        ];
      },
      /**
       * 颜色选择器
       */
      colorChose: item => {
        /**
         * item字段解析
         * @param {*} colorList // 颜色列表
         *
         */
        const {
          colorList = [
            "#F0F7FF",
            "#FFF0F0",
            "#FFF5F0",
            "#F2FFF0",
            "#F1F0FF",
            "#FDF0FF",
            "#FFFEF0",
            "#F0FFFF",
            "#FFF0F7",
            "#F9F9FB",
            "",
          ],
          nullColor = "linear-gradient(45deg, transparent 49.5%, deeppink 49.5%, deeppink 50.5%, transparent 50.5%)",
        } = item;
        return [
          h(
            "el-popover",
            {
              attrs: {
                placement: "bottom-start",
                width: "160",
                class: "color-box",
                value: item.isShow,
              },
              on: {
                show: () => {
                  Vue.set(item, "isShow", true);
                },
              },
            },
            [
              h(
                "div",
                {
                  class: "color-list",
                },
                [
                  colorList.map(it => {
                    return h("div", {
                      style: {
                        background: it == "" ? nullColor : it,
                      },
                      class: "color-item",
                      on: {
                        click() {
                          item.data = it;
                          Vue.set(item, "isShow", false);
                        },
                      },
                    });
                  }),
                ],
              ),
              h(
                "el-button",
                {
                  slot: "reference",
                },
                [
                  h("div", [
                    h("div", {
                      class: "box",
                      style: {
                        background: item.data === "" ? nullColor : item.data,
                      },
                    }),
                    h("i", {
                      class: "el-icon-arrow-down",
                      style: {
                        "font-size": "12px",
                      },
                    }),
                  ]),
                ],
              ),
            ],
          ),
        ];
      },
      /**
       * 图片上传
       */
      upload: item => {
        /**
         * item字段解析
         * @param {*} data // 当前数据
         * @param {*} single // 是否只能选择单个
         * @param {*} sizeTips // 上传图片提示
         * @param {*} limit // 最大允许上传个数
         * @param {*} beforeUpload // 上传文件之前的钩子
         * @param {*} beforeRemove // 删除文件之前的钩子
         * @param {*} isMainGraph // 是否设置主图
         * @param {*} isShowDialog // 是否预览图片，非传字段
         * @param {*} nowImg // 当前预览图片，非传字段
         * @param {*} isUpload // 单图是否上传中，非传字段
         * @param {*} uploadType // 上传的图片类型
         */

        let { disabled } = item;
        return h("UploadView", {
          attrs: {
            ...item,
            disabled: this.isTextForm || disabled,
            value: item.data,
          },
          on: {
            input: value => {
              Vue.set(item, "data", value);
            },
          },
        });
      },
      /**
       * 纯图片展示
       */
      image: item => {
        const { width = this.formItemWidth, height, data } = item;
        const avatar = h("el-image", {
          props: {
            src: Array.isArray(data) ? data[0] : data,
            fit: "cover",
            previewSrcList: [data],
          },
          style: {
            width,
            height,
            paddingTop: "15px",
          },
        });
        const nullImagetext = h(
          "span",
          {
            style: {
              color: "#C0C4CC",
              padding: "5px 10px",
              background: "#F5F7FA",
              lineHeight: "40px",
            },
          },
          "暂无图片",
        );
        if (data && !data.length) {
          return nullImagetext;
        } else {
          return avatar;
        }
      },
      /**
       * 上传视频
       */
      video: item => {
        /**
         * item字段解析
         * @param {*} coverUrl // 视频封面，注：组件会根据当前字段判断是否已有或已上传视频
         * @param {*} maxSize // 视频大小限制，不传则不限制
         * @param {*} data // 视频地址
         *
         */
        const { coverUrl, maxSize, videoSize, percent = 0, isUpload = false, isShowDialog = false, data } = item;
        // 上传图片按钮
        const uploadBtn = [
          h("i", { class: "el-icon-plus" }),
          h("div", { class: "el-upload__text" }, maxSize ? `上传视频（小于${maxSize}）` : "上传视频"),
        ];
        // 已有上传，设置封面
        const coverView = [
          // 视频封面
          h("el-image", { attrs: { src: coverUrl, fit: "cover" } }),
          // 视频播放按钮
          h(
            "div",
            {
              class: "play-btn",
              on: {
                click: e => {
                  e.stopPropagation();
                  Vue.set(item, "isShowDialog", true);
                },
              },
            },
            [h("svg-icon", { attrs: { icon: "play" } })],
          ),
          // 视频大小
          h("div", { class: "video-size" }, `${videoSize && "视频大小：" + videoSize}`),
        ];
        // 上传中，当进度为0时，显示视频解析中，反之显示上传进度
        const uploading =
          percent === 0
            ? [h("i", { class: "el-icon-loading" }), h("span", { style: { color: "#666" } }, "视频解析中...")]
            : h("el-progress", {
                attrs: {
                  type: "circle",
                  percentage: percent,
                },
                style: {
                  width: "126px",
                  height: "126px",
                  margin: "0 auto",
                },
              });
        // 判断当前显示状态，判断是否上传中，无则判断是否已有或未上传
        const uploadView = isUpload ? uploading : coverUrl ? coverView : uploadBtn;
        return [
          // 上传视频控件
          h(
            "el-upload",
            {
              attrs: {
                accept: "video/mp4",
                class: "upload-video-view",
                action: "#",
                listType: "picture-card",
                showFileList: false,
                autoUpload: false,
                onChange: async fileData => {
                  const file = fileData.raw;
                  // 视频大小
                  const fileSize = (file.size / 1024 / 1024).toFixed(1);
                  // 限制只允许上传mp4格式
                  if (["video/mp4"].indexOf(file.type) == -1) {
                    this.$message("请上传正确的视频格式");
                    return false;
                  }
                  // 限制视频大小，该字段为空则不限制
                  if (maxSize && fileSize > maxSize) {
                    this.$message(`视频大小不能超过${maxSize}MB`);
                    return false;
                  }
                  // 响应视频大小
                  Vue.set(item, "videoSize", `${fileSize}MB`);
                  // 响应上传中字段
                  Vue.set(item, "isUpload", true);
                  // 上传视频封面
                  const coverUrl = await getVideoBase64(fileData.url);
                  // 响应视频封面
                  Vue.set(item, "coverUrl", coverUrl);
                  // 上传视频
                  const videoUrl = await qiniuUplod(fileData, item);
                  // 响应视频地址
                  Vue.set(item, "data", videoUrl);
                },
              },
            },
            [uploadView],
          ),
          // 视频弹框
          h(
            "el-dialog",
            {
              class: "video-dialog-view",
              attrs: {
                visible: isShowDialog,
                destroyOnClose: true,
                width: "700px",
              },
              style: {},
              on: {
                close: () => {
                  Vue.set(item, "isShowDialog", false);
                },
              },
            },
            [
              // 视频
              h("video", {
                attrs: {
                  src: data,
                  width: "100%",
                  controls: true,
                },
              }),
            ],
          ),
        ];
      },
      /**
       * 开关
       */
      switch: item => {
        const { activeValue = 1, inactiveValue = 2, tipText, disabled } = item;
        return [
          h("el-switch", {
            attrs: {
              value: Number(item.data),
              activeValue,
              inactiveValue,
              disabled: this.isTextForm || disabled,
              ...item,
            },
            on: {
              change: value => {
                Vue.set(item, "data", value);
                item.switchHandle && item.switchHandle(value, item);
              },
            },
          }),
          h(
            "span",
            {
              style: {
                color: "#999",
                paddingLeft: "20px",
              },
            },
            tipText,
          ),
        ];
      },
      /**
       * 富文本内容
       */
      richText: item => {
        const { width = 1000, height = 300, disabled, langIcon } = item;
        return h("tinymce", {
          props: {
            value: item.data,
            height,
            width,
            disabled: this.isTextForm || disabled,
            langIcon,
            ...item,
          },
          on: {
            input: val => {
              item.data = val;
            },
          },
          ref: "tinymce",
        });
      },
      /**
       * 单选内容
       */
      radio: item => {
        /**
         * item字段解析
         * @param {*} options // 单选选项
         * @param {*} data // 绑定数据
         * @param {*} slot // 其他插槽
         *
         */
        const { options, data, slot, disabled } = item;
        if (!options) {
          console.error("select必须有options参数");
        }
        // 选项循环
        const children = options.map(({ value, label }) => {
          return h(
            "el-radio",
            {
              attrs: {
                disabled: this.isTextForm || disabled,
                label: value,
                key: value,
              },
            },
            label,
          );
        });
        return [
          h(
            "el-radio-group",
            {
              attrs: {
                value: data,
                ...item,
              },
              on: {
                input: val => {
                  Vue.set(item, "data", val);
                },
              },
            },
            [children],
          ),
          this.$scopedSlots[slot] && this.$scopedSlots[slot](),
        ];
      },
      /**
       * 多级联动(自定义)
       */
      cascader: item => {
        /**
         * item字段解析
         * @param {*} disabled // 是否禁用
         * @param {*} oneTag // 多选模式下只显示一个tag
         * @param {*} clearable // 是否支持清空选项
         * @param {*} slot // 其他插槽
         *
         */
        const {
          disabled = false,
          oneTag = false,
          clearable = true,
          // filterable= true,
          disabledIds,
          isCanSelectParent = true,
          label,
          props = { label: "name" },
          width = this.formItemWidth,
          placeholder = `请选择${label}`,
          slot,
          input,
        } = item;
        return [
          h("DiyCascader", {
            attrs: {
              ...item,
              value: item.data,
              options: item.options,
              // filterable,
              disabledIds,
              clearable,
              isCanSelectParent,
              oneTag,
              placeholder,
              props,
              disabled: this.isTextForm || disabled,
            },
            style: {
              width,
            },
            on: {
              input: val => {
                Vue.set(item, "data", val);
                item.change && item.change(val);
                input && input(val);
              },
            },
          }),
          this.$scopedSlots[slot] && this.$scopedSlots[slot](),
        ];
      },
      eleCascader: item => {
        /**
         * item字段解析
         * @param {*} disabled // 是否禁用
         * @param {*} oneTag // 多选模式下只显示一个tag
         * @param {*} clearable // 是否支持清空选项
         *
         */
        const {
          disabled = false,
          oneTag = false,
          clearable = true,

          filterable = true,
          label,
          props,
          // props={ multiple:true,label:'name',expandTrigger:'click'    },
          width = this.formItemWidth,
          placeholder = `请选择${label}`,
        } = item;
        return h("el-cascader", {
          attrs: {
            value: item.data,
            options: item.options,
            disabled: this.isTextForm || disabled,

            filterable,
            clearable,
            oneTag,
            placeholder,
            // props
            ...props,
          },
          style: {
            width,
          },
          on: {
            input: val => {
              if (props && props.props && props.props.multiple) {
                Vue.set(item, "data", val);
              } else {
                Vue.set(item, "data", val.length ? val[val.length - 1] : "");
              }
            },
          },
        });
      },
      /**
       * 多选按钮
       */
      checkBox: item => {
        /**
         * item字段解析
         * @param {*} options // 多选选项
         * @param {*} data // 绑定数据
         *
         */
        const { options, data, disabled } = item;
        if (!options) {
          console.error("select必须有options参数");
        }
        if (options.length === 1) {
          const { label, value } = options[0];
          return h("el-checkbox", {
            attrs: {
              disabled: this.isTextForm || disabled,
              label: label,
              key: value,
              value: data,
            },
            on: {
              input: val => {
                Vue.set(item, "data", val);
              },
            },
          });
        }
        const children = options.map(({ value, label }) => {
          return h(
            "el-checkbox",
            {
              attrs: {
                disabled: this.isTextForm || disabled,
                label: value,
                key: value,
              },
            },
            label,
          );
        });
        return h(
          "el-checkbox-group",
          {
            attrs: {
              value: data,
              ...item,
            },
            on: {
              input: val => {
                Vue.set(item, "data", val);
              },
            },
          },
          [children],
        );
      },
      /**
       * 规格组合规格值选择
       */
      specView: item => {
        return h("SpecView", {
          attrs: {
            value: item.data,
            ...item,
          },
          on: {
            change: val => {
              Vue.set(item, "data", val);
            },
          },
        });
      },
      /**
       * 标签
       */
      tag: item => {
        const { tagType = "", data = [], effect = "dark", disabled } = item;
        return data.map(item => {
          return h(
            "el-tag",
            {
              props: {
                effect,
                type: tagType,
                size: "mini",
                disabled: this.isTextForm || disabled,
              },
              style: {
                marginRight: "10px",
              },
            },
            item,
          );
        });
      },
      /**
       * 头像
       */
      avatar: item => {
        /**
         * item字段解析
         * @param {*} width // 头像宽度
         * @param {*} text // 用户名称
         *
         */
        const { width = "50px", height, data, text } = item;
        const avatar = h("el-image", {
          props: {
            src: data,
            fit: "cover",
            previewSrcList: [data],
          },
          style: {
            width,
            height: height || width,
            borderRadius: "50%",
            verticalAlign: "middle",
          },
          scopedSlots: {
            error: () => {
              return h("i", {
                class: "el-icon-user",
                style: {
                  fontSize: "50px",
                },
              });
            },
          },
        });
        return h("div", [
          avatar,
          text &&
            h(
              "div",
              {
                style: {
                  lineHeight: "15px",
                  minWidth: "50px",
                },
              },
              text,
            ),
        ]);
      },
      /**
       * 用户选择列表
       */
      userList: item => {
        /**
         * item字段解析
         * @param {*} width // 头像宽度
         * @param {*} data // 选择数据
         * @param {*} userList // 用户列表
         *
         */
        const { width = "50px", data, userList } = item;
        return h(
          "div",
          {
            style: {
              display: "flex",
              textAlign: "center",
              flexFlow: "wrap",
            },
          },
          userList.map(it => {
            const avatar = h("el-image", {
              props: {
                src: it.avatar,
                fit: "cover",
              },
              style: {
                width,
                height: width,
                borderRadius: "50%",
              },
              scopedSlots: {
                error: () => {
                  return h("i", {
                    class: "el-icon-user",
                    style: {
                      fontSize: "50px",
                    },
                  });
                },
              },
            });
            return h(
              "div",
              {
                style: {
                  border: `1px solid ${data === it.id ? "#409efe" : "transparent"}`,
                  width: "100px",
                  cursor: "pointer",
                  boxSizing: "border-box",
                  padding: "10px",
                  borderRadius: "3px",
                },
                on: {
                  click() {
                    item.data = it.id;
                  },
                },
              },
              [
                avatar,
                it.name &&
                  h(
                    "div",
                    {
                      style: {
                        lineHeight: "15px",
                        textAlign: "center",
                      },
                    },
                    it.name,
                  ),
              ],
            );
          }),
        );
      },
      /**
       * 地区选择
       */
      areaChose: item => {
        const { disabled = false, data, width } = item;
        return h("AreaChose", {
          attrs: {
            disabled: this.isTextForm || disabled,
            value: data,
            width,
          },
          on: {
            input: (val, names) => {
              Vue.set(item, "data", val);
              Vue.set(item, "names", names);
            },
          },
        });
      },
      /**
       * 级联下拉地区选择
       */
      cascaderArea: item => {
        const {
          placeholder = "请选择" + item.label,
          showLevel,
          width = this.formItemWidth,
          data,
          disabled,
          propArr,
        } = item;
        return h("CascaderArea", {
          ref: "cascaderArea",
          props: {
            placeholder,
            disabled: this.isTextForm || disabled,
            value: data,
            showLevel,
            width,
          },
          on: {
            changeArea: value => {
              // let json = {};
              // propArr.forEach((x, i) => {
              //   json[x] = value[i];
              // });
              // Vue.set(item, "data", json);
              Vue.set(item, "data", value);
            },
          },
        });
      },
      /**
       * 占位
       */
      empty: item => {
        return;
      },
      /**
       * 标题
       */
      title: ({ fontSize = "16px", title }) => {
        return h(
          "div",
          {
            style: {
              fontSize,
              lineHeight: "50px",
              margin: `0 0 -15px -${this.labelPosition !== "top" ? this.labelWidth : 0}`,
            },
            class: "title-type",
          },
          title,
        );
      },
      /**
       * 横线
       */
      divider: ({ width = "800px", marginBottom = "-5px" }) => {
        return h("el-divider", {
          attrs: {
            style: {
              margin: `15px 0 ${marginBottom} -${this.labelWidth}`,
              width,
            },
          },
        });
      },
      /**
       * 搜索模块
       */
      remoteSearch: item => {
        /**
         * item字段解析
         * @param {*} apiMethod // 接口api方法
         * @param {*} searchProp // 请求搜索字段名
         * @param {*} otherParams // 其他请求参数
         * @param {*} isMultiple // 是否多选
         * @param {*} oneTag // 多选默认下是否显示所有tag
         * @param {*} clearable // 是否启用清空选项
         * @param {*} selectPlaceholder // 选择框占位文本
         * @param {*} inputPlaceholder // 输入框占位文本
         * @param {*} isAllKey // 是否返回选择的全部key，
         *
         */
        const {
          apiMethod,
          searchProp,
          otherParams,
          isMultiple,
          oneTag,
          clearable,
          selectPlaceholder,
          inputPlaceholder,
          isAllKey,
          width = this.formItemWidth,
          disabled,
        } = item;
        return h("RemoteSearch", {
          attrs: {
            apiMethod,
            searchProp,
            otherParams,
            isMultiple,
            oneTag,
            disabled: this.isTextForm || disabled,
            clearable,
            selectPlaceholder,
            inputPlaceholder,
            isAllKey,
            ...item,
          },
          style: {
            width,
          },
          on: {
            input: val => {
              Vue.set(item, "data", val);
            },
          },
        });
      },
      /**
       * 时间选择器
       */
      timePicker: item => {
        /**
         * item字段解析
         * @param {*} valueFormat // 时间格式
         * @param {*} data // 选择数据
         *
         */
        const {
          valueFormat = "HH:mm",
          data,
          rangeSeparator = "至",
          startPlaceholder = "开始时间",
          endPlaceholder = "结束时间",
          width = this.formItemWidth,
          isRange = true,
          disabled,
        } = item;
        return [
          this.$scopedSlots[item.slot] && this.$scopedSlots[item.slot](),
          h("el-time-picker", {
            attrs: {
              isRange,
              value: data,
              valueFormat,
              format: valueFormat,
              rangeSeparator,
              startPlaceholder,
              endPlaceholder,
              disabled: this.isTextForm || disabled,
              ...item,
            },
            style: {
              width,
            },
            on: {
              input: val => {
                Vue.set(item, "data", val);
              },
            },
          }),
        ];
      },
      /**
       * 时间选择器
       */
      diyTimePicker: item => {
        /**
         * item字段解析
         * @param {*} valueFormat // 时间格式
         * @param {*} data // 选择数据
         * @param {*} rangeSeparator // 间隔文本
         * @param {*} startPlaceholder // 开始选择框占位
         * @param {*} endPlaceholder // 结束选择框占位
         * @param {*} nowIndex // 当天类型序号0：上午，1：下午，2：晚上
         * @param {*} selectableRange // 可选时间段
         * @param {*} width // 选择框宽度
         *
         */
        var {
          valueFormat = "HH:mm",
          data,
          rangeSeparator = "至",
          startPlaceholder = "开始时间",
          endPlaceholder = "结束时间",
          nowIndex = 0,
          selectableRange,
          width = "130px",
        } = item;
        item.changeTime = () => {};
        // 当天类型
        const options = [
          {
            label: "上午",
            value: ["08:00", "08:30"],
            range: "08:00:00- 13:00:00",
          },
          {
            label: "下午",
            value: ["13:00", "13:40"],
            range: "13:00:00 - 18:00:00",
          },
          {
            label: "晚上",
            value: ["18:00", "18:40"],
            range: "18:00:00 - 22:00:00",
          },
        ];
        // 默认限制第一个类型
        selectableRange = options[nowIndex].range;
        // 循环插入
        const children = options.map(({ value, label }, index) => {
          return h(
            "el-radio",
            {
              attrs: {
                label: index,
                key: value,
              },
            },
            label,
          );
        });
        // 时间选择参数
        const json = {
          format: valueFormat,
          valueFormat,
          pickerOptions: {
            selectableRange,
          },
          ...item,
        };
        return [
          this.$scopedSlots[item.slot] && this.$scopedSlots[item.slot](),
          // 开始时间
          h("el-time-picker", {
            attrs: {
              value: data[0],
              startPlaceholder,
              ...json,
            },
            style: {
              width,
            },
            on: {
              input: val => {
                Vue.set(data, 0, val);
              },
            },
          }),
          h(
            "span",
            {
              style: {
                display: "inline-block",
                width: "40px",
                textAlign: "center",
              },
            },
            rangeSeparator,
          ),
          // 结束时间
          h("el-time-picker", {
            attrs: {
              value: data[1],
              endPlaceholder,
              ...json,
            },
            style: {
              width,
            },
            on: {
              input: val => {
                Vue.set(data, 1, val);
              },
            },
          }),
          // 当天类型
          h(
            "el-radio-group",
            {
              attrs: {
                value: nowIndex,
              },
              style: {
                marginLeft: "15px",
              },
              on: {
                input: index => {
                  Vue.set(item, "nowIndex", index);
                  Vue.set(item, "data", options[index].value);
                  Vue.set(item, "selectableRange", options[index].range);
                },
              },
            },
            [children],
          ),
          // 添加
          h(
            "el-button",
            {
              attrs: {
                type: "primary",
                size: "small",
              },
              style: {
                marginLeft: "20px",
              },
              on: {
                click: item.changeTime,
              },
            },
            "添加",
          ),
        ];
      },
      /**
       * 星期选择器
       */
      weekPicker: item => {
        /**
         * item字段解析
         * @param {*} rangeSeparator // 间隔文本
         * @param {*} startPlaceholder // 开始选择框占位
         * @param {*} endPlaceholder // 结束选择框占位
         * @param {*} width // 选择框宽度
         *
         */
        const { rangeSeparator = "至", startPlaceholder = "开始", endPlaceholder = "结束", width = "130px" } = item;

        const options = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
        const weekList = options.map((x, i) => {
          return h("el-option", {
            attrs: {
              label: options[i],
              value: i + 1,
              key: i + 1,
            },
          });
        });
        return [
          // 开始选择
          h(
            "el-select",
            {
              class: "week-select",
              attrs: {
                placeholder: startPlaceholder,
                value: item.data[0],
              },
              style: {
                width,
              },
              on: {
                change: val => {
                  Vue.set(item.data, 0, val);
                },
              },
            },
            [weekList],
          ),
          // 间隔文本
          h(
            "span",
            {
              style: {
                display: "inline-block",
                margin: "0 10px",
              },
            },
            rangeSeparator,
          ),
          // 结束选择
          h(
            "el-select",
            {
              class: "week-select",
              attrs: {
                placeholder: endPlaceholder,
                value: item.data[1],
              },
              style: {
                width,
              },
              on: {
                change: val => {
                  Vue.set(item.data, 1, val);
                },
              },
            },
            [weekList],
          ),
        ];
      },
      /**
       * 日期选择器
       */
      datePicker: item => {
        /**
         * item字段解析
         * @param {*} dateType // 日期类型，同elementUi的type，	year/month/date/dates/week/datetime/datetimerange/daterange/monthrange
         * @param {*} rangeSeparator // 间隔文本
         * @param {*} startPlaceholder // 开始选择框占位
         * @param {*} endPlaceholder // 结束选择框占位
         * @param {*} selectableRange // 可选时间段
         * @param {*} placeholder // 选择框占位
         *
         */
        const {
          props,
          dateType,
          valueFormat = "yyyy-MM-dd",
          data,
          rangeSeparator = "至",
          startPlaceholder = "开始日期",
          endPlaceholder = "结束日期",
          placeholder = `请选择${item.label}`,
          width = this.formItemWidth,
          format,
          pickerOptions = {},
          disabled,
        } = item;
        return h("el-date-picker", {
          attrs: {
            type: dateType,
            align: "right",
            unlinkPanels: true,
            rangeSeparator,
            placeholder,
            startPlaceholder,
            endPlaceholder,
            format: format || valueFormat,
            valueFormat,
            value: data === 0 ? "" : data,
            disabled: this.isTextForm || disabled,
            pickerOptions,
            ...props,
          },
          style: {
            width,
          },
          on: {
            input: val => {
              Vue.set(item, "data", val);
            },
          },
        });
      },
      /**
       * 腾讯地图
       */
      map: item => {
        const { data, searchText = "", upLngAndLat, btnText = "搜索", width = "600px" } = item;
        // 执行搜索
        const search = () => {
          if (!searchText) {
            this.$message("请输入小区详细地址");
            return;
          }
          this.$refs.tencentMap.searchKeyword(searchText);
        };
        // 搜索按钮
        const append = h(
          "el-button",
          {
            slot: "append",
            class: "append-btn",
            on: {
              click: search,
            },
          },
          btnText,
        );
        // 搜索占位文本
        !item.placeholder && (item.placeholder = `请输入小区地址关键字`);
        return [
          // 搜索输入框
          h(
            "el-input",
            {
              attrs: {
                value: searchText,
                clearable: true,
                ...item,
              },
              style: {
                width,
              },
              nativeOn: {
                // 回车事件
                keyup: ({ key }) => {
                  if (key === "Enter") {
                    search();
                  }
                },
              },
              on: {
                // 输入更新
                input: val => {
                  Vue.set(item, "searchText", val);
                },
              },
            },
            [append],
          ),
          // 提示
          h(
            "div",
            {
              style: {
                color: "rgb(105 104 104)",
              },
            },
            "输入关键字搜索，点击定位获得商户的经纬度(如定位不准，可手动拖动定位)",
          ),
          // 地图
          h("TencentMap", {
            ref: "tencentMap",
            attrs: {
              item,
            },
            on: {
              changeLocation: location => {
                // 地图点击事件
                const add = JSON.parse(JSON.stringify(location));
                add.lng = add.lng.toFixed(6);
                add.lat = add.lat.toFixed(6);
                Vue.set(item, "data", add);
                // 下面输入框更新
                upLngAndLat(add);
              },
            },
          }),
        ];
      },
      /**
       * 经纬度显示
       */
      lngAndLat: item => {
        const { disabled = false, data } = item;
        return [
          h("el-input", {
            attrs: {
              value: data[0],
              type: "text",
              disabled,
              placeholder: "经度",
            },
            style: {
              width: "140px",
              marginRight: "20px",
            },
            on: {
              // 输入更新
              input: val => {
                Vue.set(data, 0, val);
              },
            },
          }),
          h("el-input", {
            attrs: {
              value: data[1],
              type: "text",
              disabled,
              placeholder: "纬度",
            },
            style: {
              width: "140px",
            },
            on: {
              // 输入更新
              input: val => {
                Vue.set(data, 1, val);
              },
            },
          }),
        ];
      },

      /**
       * 时间戳转换
       */
      timeStamp: item => {
        /**
         * item字段解析
         * @param {*} data // 时间戳
         * @param {*} format // 格式化格式
         *
         */
        var { data, format = "YYYY-MM-DD HH:mm:ss" } = item;
        if (String(data).length === 10) {
          data = Number(item.data + "000");
        }
        return h("span", moment(data).format(format));
      },
      /**
       * 数字输入框
       */
      number: item => {
        const { data, disabled } = item;
        return [
          h("el-input-number", {
            attrs: {
              value: data,
              controlsPosition: "right",
              disabled: this.isTextForm || disabled,
              ...item,
            },
            on: {
              input: val => {
                Vue.set(item, "data", val);
              },
            },
          }),
          this.$scopedSlots[item.slot] && this.$scopedSlots[item.slot](),
        ];
      },
      /**
       * 价格输入框
       */
      digitalInput: item => {
        const { data, width = this.formItemWidth, placeholder = `请输入${item.label}`, disabled } = item;
        // console.log(placeholder);
        return [
          h("DigitalInput", {
            attrs: {
              value: data,
              width,
              ...item,
              placeholder,
              disabled: this.isTextForm || disabled,
            },
            on: {
              input: val => {
                Vue.set(item, "data", val);
              },
            },
          }),
          this.$scopedSlots[item.slot] && this.$scopedSlots[item.slot](),
        ];
      },
      /**
       * 选择商品
       */
      choseGoods: item => {
        /**
         * item字段解析
         * @param {*} data // 当前选择ids
         * @param {*} list // 当前选择商品数据，不用传
         *
         */
        const { data, placeholder = "点击右侧按钮选择商品", isShowDialog = false, list = [] } = item;
        return [
          // 选择商品按钮
          h(
            "el-input",
            {
              attrs: {
                value: list.length !== 0 ? `已选${list.length}件商品` : "",
                placeholder,
                disabled: true,
              },
            },
            [
              h(
                "el-button",
                {
                  slot: "append",
                  class: "append-btn",
                  on: {
                    click: () => {
                      Vue.set(item, "isShowDialog", true);
                    },
                  },
                },
                "选择商品",
              ),
            ],
          ),
          // 选择商品列表
          h("div", { class: "goods-list-view" }, [
            ...list.map(({ goodsName, thumbImg, id }) => {
              return h("div", { class: "goods-item" }, [
                h("div", { class: "img-wrap" }, [
                  h("el-image", {
                    attrs: {
                      src: thumbImg,
                      fit: "cover",
                    },
                  }),
                ]),
                // 商品名称
                h("div", { class: "name" }, goodsName),
                // 商品删除按钮
                h("div", { class: "del-btn" }, [
                  h("i", {
                    class: "el-icon-delete",
                    attrs: { title: `点击删除-${goodsName}` },
                    on: {
                      click: () => {
                        // 当前选择ids
                        const arr = data.split(",").map(Number);
                        // 删除当前id
                        arr.splice(arr.indexOf(Number(id)), 1);
                        const val = arr.join(",");
                        // 更新数据，更新data数据后会触发choseGoods里的监听，会重新调取选择商品数据，从而更新已选数据
                        Vue.set(item, "data", val);
                      },
                    },
                  }),
                ]),
              ]);
            }),
          ]),
          // 选择商品弹框
          h("ChoseGoods", {
            attrs: {
              value: data,
              visible: isShowDialog,
            },
            on: {
              // 更新ids数据
              input: val => {
                Vue.set(item, "data", val);
              },
              // 关闭弹框
              close: () => {
                Vue.set(item, "isShowDialog", false);
              },
              // 更新list数据
              updataList: val => {
                Vue.set(item, "list", val);
              },
            },
          }),
        ];
      },
      /**
       * 选择城市
       */
      chooseCity: item => {
        const { data, parentId, areaName } = item;
        return h("ChooseCity", {
          attrs: {
            value: data,
            parentId,
            areaName,
            ...item,
          },
          on: {
            input: val => {
              Vue.set(item, "data", val);
            },
            changeParentId: val => {
              Vue.set(item, "parentId", val);
            },
            changeaAeaName: val => {
              Vue.set(item, "areaName", val);
            },
          },
        });
      },
      /**
       * 价格倍数
       */
      priceMultiple: item => {
        const {
          data,
          isMultiple,
          leftUnit = "元/包",
          rightUnit = "倍",
          leftPlaceholder = "请输入倍数",
          rightPlaceholder = "请输入商品单价",
          width = "220px",
        } = item;
        return [
          ...data.map((xItem, index) => {
            const nowItem = [
              h(
                "el-input",
                {
                  attrs: {
                    value: xItem.multiple,
                    placeholder: leftPlaceholder,
                  },
                  style: { width },
                  on: {
                    input: val => {
                      xItem.multiple = val;
                    },
                  },
                },
                [h("el-button", { slot: "append" }, leftUnit)],
              ),
              h(
                "span",
                {
                  style: {
                    margin: "0 50px",
                  },
                },
                "商品单价",
              ),
              h(
                "el-input",
                {
                  attrs: {
                    value: xItem.price,
                    placeholder: rightPlaceholder,
                  },
                  style: { width },
                  on: {
                    input: val => {
                      xItem.price = val;
                    },
                  },
                },
                [h("el-button", { slot: "append" }, rightUnit)],
              ),
              isMultiple &&
                (index === 0
                  ? h(
                      "el-button",
                      {
                        attrs: {
                          type: "primary",
                        },
                        style: {
                          marginLeft: "20px",
                        },
                        on: {
                          click: () => {
                            data.push({
                              multiple: "",
                              price: "",
                            });
                          },
                        },
                      },
                      "添加",
                    )
                  : h("span", {
                      class: "el-icon-delete",
                      style: {
                        marginLeft: "20px",
                        width: "70px",
                        textAlign: "center",
                        fontSize: "20px",
                        cursor: "pointer",
                      },
                      on: {
                        click: () => {
                          data.splice(index, 1);
                        },
                      },
                    })),
            ];
            return [
              h(
                "div",
                {
                  style: {
                    marginBottom: "10px",
                    width: "700px",
                  },
                },
                nowItem,
              ),
            ];
          }),
        ];
      },
      /**
       * 内置表格
       * 充值金额设置
       */
      integralView: item => {
        const { data, concontProp } = item;
        return (
          <integral-view
            is-loading={false}
            value={data}
            scale={concontProp ? Number(this.formData[concontProp]) : 10}
          ></integral-view>
        );
      },
      /**
       * 内置表格
       * 一周签到奖励设置
       */
      signView: item => {
        const { data, scale, handle } = item;
        return h("sign-view", {
          attrs: {
            isLoading: false,
            value: data,
            scale,
            ...item,
          },
          on: {
            change: val => {
              handle && handle(val);
            },
          },
        });
      },
      /**
       * 上传录音
       */
      record: item => {
        /**
         * item字段解析
         * @param {*} maxSize // 录音大小限制，不传则不限制
         * @param {*} data // 录音地址
         * @param {*} downTips // 上传录音提示
         *
         */
        const {
          maxSize,
          recordSize,
          downTips,
          percent = 0,
          isUpload = false,
          recordPlay = false,
          data,
          count = "00:00:00", // 倒计时
        } = item;
        const addZero = item => {
          // 0:0:0 => 00:00:00
          if (item < 10) {
            return "0" + item;
          } else {
            return item;
          }
        };
        const timeFormat = e => {
          // 时间秒数转为需要的格式
          let timer = moment.duration(Number(e), "seconds");
          const time = addZero(timer.hours()) + ":" + addZero(timer.minutes()) + ":" + addZero(timer.seconds());
          return time;
        };
        // 上传录音按钮
        const uploadBtn = [
          h("i", { class: "el-icon-plus" }),
          h("div", { class: "el-upload__text" }, maxSize ? `上传录音（小于${maxSize}MB）` : "上传录音"),
        ];
        // 已有上传，设置封面
        const coverView = [
          // 录音播放按钮
          h(
            "div",
            {
              class: "play-btn",
              on: {
                click: e => {
                  e.stopPropagation();
                  const audio = document.getElementById(item.prop);
                  if (recordPlay) {
                    audio.pause();
                    Vue.set(item, "recordPlay", false);
                  } else {
                    audio.play();
                    Vue.set(item, "recordPlay", true);
                  }
                },
              },
            },
            [h("svg-icon", { attrs: { icon: recordPlay ? "record-pause" : "record-play" } })],
          ),
          h("div", { class: "record-time" }, count),
          // 录音大小
          h("audio", {
            attrs: {
              src: data,
              preload: true,
              id: item.prop,
              hidden: true,
            },
            on: {
              canplay: e => {
                Vue.set(item, "count", timeFormat(e.target.duration));
              },
              timeupdate: e => {
                let count = e.target.duration - e.target.currentTime;
                Vue.set(item, "count", timeFormat(count));
              },
              ended: e => {
                // 播放完成后重置时间和播放状态
                Vue.set(item, "count", timeFormat(e.target.duration));
                Vue.set(item, "recordPlay", false);
              },
            },
          }),
          recordSize && h("div", { class: "record-size" }, `${recordSize && "录音大小：" + recordSize}`),
        ];
        // 上传中，当进度为0时，显示录音解析中，反之显示上传进度
        const uploading =
          percent === 0
            ? [h("i", { class: "el-icon-loading" }), h("span", { style: { color: "#666" } }, "录音解析中...")]
            : h("el-progress", {
                attrs: {
                  type: "circle",
                  percentage: percent,
                },
                style: {
                  width: "126px",
                  height: "126px",
                  margin: "0 auto",
                },
              });
        // 判断当前显示状态，判断是否上传中，无则判断是否已有或未上传
        const uploadView = isUpload ? uploading : data ? coverView : uploadBtn;
        return [
          // 上传录音控件
          h(
            "el-upload",
            {
              attrs: {
                accept: ".wav,.mp3,.aac",
                class: "upload-record-view",
                action: "#",
                listType: "picture-card",
                showFileList: false,
                autoUpload: false,
                onChange: async fileData => {
                  const file = fileData.raw;
                  // 录音大小
                  const fileSize = (file.size / 1024 / 1024).toFixed(1);
                  // 限制只允许上传音频格式
                  if (["audio/mpeg"].indexOf(file.type) == -1) {
                    this.$message("请上传正确的录音格式");
                    return false;
                  }
                  // 限制录音大小，该字段为空则不限制
                  if (maxSize && fileSize > maxSize) {
                    this.$message(`录音大小不能超过${maxSize}MB`);
                    return false;
                  }
                  // 响应录音大小
                  Vue.set(item, "recordSize", `${fileSize}MB`);
                  // 响应上传中字段
                  Vue.set(item, "isUpload", true);
                  // 上传录音
                  const recordUrl = await qiniuUplod(fileData, item);
                  // 响应录音地址
                  Vue.set(item, "data", recordUrl);
                },
              },
            },
            [
              uploadView,
              downTips && // 下方提示
                h(
                  "p",
                  {
                    class: "size-tips",
                    style:
                      "position: absolute;bottom: -20px;margin: 0;font-size: 12px;line-height: 16px;color: #999;left: 0px;white-space: nowrap;",
                  },
                  downTips,
                ),
            ],
          ),
        ];
      },
      /**
       * 多功能表格下拉选择
       */
      tableSelect: item => {
        let { data, width, disabled, input } = item;
        if (!item.multiple) {
          return h("TableSelect", {
            attrs: {
              value: data,
              ...item,
              disabled: this.isTextForm || disabled,
            },
            style: {
              width: width || this.formItemWidth,
            },
            on: {
              input: value => {
                Vue.set(item, "data", value);
                item.change && item.change(value);
                input && input(value);
              },
            },
          });
        } else {
          return h("TableMultipleSelect", {
            attrs: {
              value: data,
              disabled: this.isTextForm || disabled,
              ...item,
            },
            style: {
              width: width || this.formItemWidth,
            },
            on: {
              input: value => {
                Vue.set(item, "data", value);
                item.change && item.change(value);
              },
            },
          });
        }
      },
      /**
       * 标签动态添加
       */
      tagDynamicAdd: item => {
        let { data, addText, isShow, btnText = "+ 添加", disabled } = item;

        let inputTag = isShow
          ? h("el-input", {
              attrs: {
                value: addText,
                disabled: this.isTextForm || disabled,
              },
              ref: "tagDynamicInput",
              on: {
                input: value => {
                  Vue.set(item, "addText", value);
                },
                blur: value => {
                  if (addText) {
                    data.push(addText);
                  }
                  Vue.set(item, "addText", "");
                  Vue.set(item, "isShow", false);
                },
              },
              nativeOn: {
                keyup: e => {
                  if (e.keyCode === 13) {
                    this.$refs.tagDynamicInput.blur();
                  }
                },
              },
            })
          : h(
              "el-button",
              {
                on: {
                  click: () => {
                    Vue.set(item, "isShow", true);
                    setTimeout(() => {
                      this.$refs.tagDynamicInput.focus();
                    });
                  },
                },
              },
              btnText,
            );
        let tagList = data.map(x => {
          return h(
            "el-tag",
            {
              attrs: {
                closable: true,
                disableTransitions: true,
              },
              on: {
                close: tag => {
                  data.splice(data.indexOf(tag), 1);
                },
              },
            },
            x,
          );
        });
        return h(
          "div",
          {
            class: "tag-dynamic-add",
          },
          [tagList, inputTag],
        );
      },
      /**
       * 输入框标签
       */
      inputTags: item => {
        let {
          data,
          addText,
          width = this.formItemWidth,
          label,
          placeholder = `请输入${label}(可添加多个)`,
          disabled,
        } = item;
        return h("vue-tags-input", {
          attrs: {
            placeholder,
            value: addText,
            disabled: this.isTextForm || disabled,
            tags: data.map(x => {
              return { text: x };
            }),
            ...item,
          },
          style: {
            width,
          },
          on: {
            input: value => {
              Vue.set(item, "addText", value);
            },
            "tags-changed": value => {
              Vue.set(
                item,
                "data",
                value.map(_ => _.text),
              );
            },
          },
        });
      },
      /**
       * 上传文件控件
       */
      uploadFile: item => {
        /**
         * item字段解析
         * @param {*} data // 当前数据
         * @param {*} sizeTips // 上传图片提示
         * @param {*} limit // 最大允许上传个数
         *
         */
        var { data, sizeTips, limit, accept, disabled } = item;

        return [
          h("div", { class: "upload-file" }, [
            h(
              "el-upload",
              {
                attrs: {
                  disabled: this.isTextForm || disabled,
                  accept,
                  drag: true,
                  action: common.imgApi,
                  headers: {
                    token: getToken(),
                  },
                  fileList: data,
                  multiple: true,
                  showFileList: false,
                  limit,
                  onSuccess: (response, file) => {
                    let index = data.findIndex(({ uid }) => {
                      return uid === file.uid;
                    });
                    if (index === -1) return;
                    if (response && response.code === 200) {
                      Vue.set(data[index], "status", "success");
                      Vue.set(data[index], "url", response.data.src);
                    } else {
                      Vue.set(data[index], "status", "fail");
                      Vue.set(data[index], "percentage", 0);
                    }
                  },
                  onError: (response, file) => {
                    let index = data.findIndex(({ uid }) => {
                      return uid === file.uid;
                    });
                    if (index === -1) return;
                    Vue.set(data[index], "status", "fail");
                    Vue.set(data[index], "percentage", 0);
                  },

                  onProgress: (event, file, data) => {
                    let fileArr = data.map(({ name, percentage, status, uid, raw, response }) => {
                      if (response && response.code !== 200) {
                        status = "fail";
                      }
                      return { name, percentage, status, uid, raw };
                    });
                    Vue.set(item, "data", fileArr);
                  },
                  onExceed: () => {
                    this.$message("无法上传，超出了" + limit + "张图片限制");
                  },
                },
              },
              [
                h("i", { class: "el-icon-upload" }),
                h("div", { class: "el-upload__text" }, [`将文件拖到此处，或`, h("em", {}, "点击上传")]),
                h("div", { class: "el-upload__tip", slot: "tip" }, sizeTips),
              ],
            ),
            h("UploadList", {
              attrs: {
                files: data,
                listType: "text",
              },
              on: {
                remove: file => {
                  data.splice(data.indexOf(file), 1);
                },
              },
            }),
          ]),
        ];
      },
      /**
       * 盘点编号
       */
      codeGroup: item => {
        const { prependSlot, codeInput, appendSlot, width = "500px" } = item;
        const prepend = prependSlot.map(it => {
          return h("el-input", {
            slot: "prepend",
            attrs: {
              placeholder: it.placeholder || "",
              value: it.data,
              disabled: it.disabled,
            },
            style: {
              width: it.width || "100px",
            },
            on: {
              input: val => {
                Vue.set(it, "data", val);
              },
            },
          });
        });
        const append = appendSlot.map(it => {
          return h("el-input", {
            slot: "append",
            attrs: {
              placeholder: it.placeholder || "",
              value: it.data,
              disabled: it.disabled,
            },
            style: {
              width: it.width || "100px",
            },
            on: {
              input: val => {
                Vue.set(it, "data", val);
              },
            },
          });
        });
        return h(
          "div",
          {
            class: "input-group",
            style: {
              width,
            },
          },
          [
            h(
              "el-input",
              {
                attrs: {
                  placeholder: codeInput.placeholder,
                  value: codeInput.data,
                  ...codeInput.props,
                },
                style: {
                  width: codeInput.width,
                },
                on: {
                  input: val => {
                    Vue.set(codeInput, "data", val);
                  },
                },
              },
              [prepend, append],
            ),
          ],
        );
      },
    };
    // ----------- 策略结束 --------------

    // 判断是否需要限制显示
    const isShow = item => {
      if (Reflect.has(item, "show")) {
        return item.show;
      }
      if (this.showList && this.showList.length > 0) {
        if (this.showList.includes(item.prop)) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    };

    const createFormItem = list => {
      const itemList = list.map(item => {
        let {
          type = "input",
          prop,
          icon,
          elIcon,
          tipsTxt,
          labelWidth,
          marginRight,
          labelText,
          langIcon,
          formItemWidth,
          formItemHeight,
          borderContent = [false, false, false, false], // 上右下左边框是否存在
          isTopLabel = false, // label是否在上面，表单内容在下面
        } = item;

        let langIconEl;
        if (langIcon && isLangIcon) {
          langIconEl = h("div", { class: "lang-icon" }, langIcon);
        }
        let iconEl = "";
        if (icon) {
          const iconEle = h("svg-icon", {
            attrs: {
              icon,
            },
          });
          if (tipsTxt) {
            iconEl = h("div", { class: "icon" }, [
              h(
                "el-tooltip",
                {
                  attrs: {
                    content: tipsTxt,
                    placement: "top",
                  },
                },
                [iconEle],
              ),
            ]);
          } else {
            iconEl = h("div", { class: "icon" }, [iconEle]);
          }
        } else if (elIcon && !this.isTextForm) {
          // 文本状态不展示图标，不然显得突兀
          const iconEle = h("i", {
            class: elIcon,
          });
          if (tipsTxt) {
            iconEl = h("div", { class: "icon" }, [
              h(
                "el-tooltip",
                {
                  attrs: {
                    content: tipsTxt,
                    placement: "top",
                  },
                },
                [iconEle],
              ),
            ]);
          } else {
            iconEl = h("div", { class: "icon" }, [iconEle]);
          }
        }
        // 遇到了数组
        if (Array.isArray(item)) {
          const children = createFormItem(item);
          return <div class="form-children">{children}</div>;
        } else {
          try {
            if (isShow(item)) {
              if (this.isTextForm) {
                Vue.set(item, "placeholder", "-");
                item.startPlaceholder &&
                  item.endPlaceholder &&
                  (Vue.set(item, "startPlaceholder", "-"), Vue.set(item, "endPlaceholder", "-"));
              } else {
                Vue.set(item, "placeholder", item.oPlaceholder);
              }
              // 判断此项是否需要展示
              return h(
                "el-form-item",
                {
                  attrs: {
                    label: labelText,
                    prop,
                    labelWidth,
                  },
                  class: [
                    item.isFlex ? "is-flex" : "",
                    this.hasBorder ? "hasBorder" : "",
                    borderContent[0] ? "hasTopBorder" : "",
                    borderContent[1] ? "hasRightBorder" : "",
                    borderContent[2] ? "hasBottomBorder" : "",
                    borderContent[3] ? "hasLeftBorder" : "",
                    isTopLabel ? "isTopLabel" : "",
                  ],
                  style: {
                    paddingRight: this.columns && this.labelPosition !== "right" ? "40px" : "",
                    marginRight: marginRight,
                    width: formItemWidth ? formItemWidth : `${(100 / this.columns).toFixed(2)}%`,
                    height: formItemHeight,
                  },
                },
                [strategy[type](item), iconEl, langIconEl],
              );
            }
          } catch (error) {
            console.error(`${type}策略错误：${error.message}`);
          }
        }
      });
      return itemList;
    };

    const itemList = createFormItem(this.value);

    if (this.$scopedSlots.default) {
      // 其他按钮
      itemList.push(this.$scopedSlots.default());
    }
    // 确认&取消&删除按钮元素
    itemList.push(
      h(
        "el-form-item",
        {
          class: {
            auth: this.submitText && !this.cancelText,
            isFixed: this.isFixed,
          },
          style: {
            display: !this.submitText && !this.cancelText && !this.deleteText ? "none" : "block",
            left: this.isFixed ? (this.$store.state.sideOpen ? "200px" : "20px") : "",
            width: this.isFixed ? (this.$store.state.sideOpen ? "calc(100% - 280px)" : "calc(100% - 100px)") : "auto",
          },
        },
        [
          // 取消按钮
          this.cancelText &&
            h(
              "el-button",
              {
                attrs: { size: this.btnSize || "small" },
                on: {
                  click: () => {
                    this.$refs["form"].clearValidate();
                    this.$emit("cancel");
                  },
                },
              },
              this.cancelText,
            ),
          // 删除按钮
          this.deleteText &&
            h(
              "el-button",
              {
                attrs: { type: "danger", size: this.btnSize || "small" },
                on: {
                  click: this.$emit("delete"),
                },
              },
              this.deleteText,
            ),
          // 确认按钮
          this.submitText &&
            h(
              "el-button",
              {
                attrs: { type: "primary", size: this.btnSize || "small", loading: this.isLoading },
                class: "submit-btn",
                on: {
                  click: this.handleSubmit,
                },
              },
              this.submitText,
            ),
        ],
      ),
    );

    return h(
      "el-form",
      {
        class: {
          "form-view": true,
          "is-columns": this.columns,
          "is-text": this.isTextForm,
        },
        props: {
          model: this.formData,
          rules: this.rules,
          validateOnRuleChange: false,
          labelPosition: this.labelPosition,
          labelWidth: this.labelWidth,
          ...this.$attrs,
        },
        style: {
          "max-width": this.maxFormWidth ? `${this.maxFormWidth}px` : "",
        },
        ref: "form",
      },
      itemList,
    );
  },
};
</script>
<style lang="scss" scoped>
/deep/ .el-form-item {
  box-sizing: border-box;
  &.is-flex {
    .el-form-item__content {
      display: flex;
    }
  }
  &.hasBorder {
    margin-right: 0 !important;
    margin-bottom: 0 !important;
    padding: 6px;
    .title-type {
      line-height: 40px !important;
      margin-bottom: 0 !important;
      font-weight: bold;
    }
  }
  &.hasTopBorder {
    border-top: 1px solid;
  }
  &.hasRightBorder {
    border-right: 1px solid;
  }
  &.hasBottomBorder {
    border-bottom: 1px solid;
  }
  &.hasLeftBorder {
    border-left: 1px solid;
  }
  &.isTopLabel {
    .el-form-item__label {
      float: none !important;
    }
    .el-form-item__content {
      margin-left: 0 !important;
    }
  }
}

/deep/ .el-form-item__label {
  line-height: 32px;
}

/deep/ .el-form-item__content {
  cursor: pointer;
  > .el-autocomplete,
  > .el-date-editor,
  > .el-cascader,
  > .el-select,
  > .el-input,
  > .diy-cascader {
    width: 300px;
  }

  .el-input.is-disabled {
    input {
      color: #606266;
    }
  }
  .el-textarea {
    textarea {
      color: #606266;
    }
  }
}

// 文本表单处理
.el-form.is-text {
  /deep/.el-form-item {
    margin-bottom: 8px;
    .digital-input {
      display: flex;
      flex-direction: row-reverse;
      .el-input-number {
        width: auto;
      }
      .unit-icon {
        flex: 1;
        padding: 0;
        text-align: left;
        background: transparent;
        border: 0;
        position: initial;
        line-height: 32px;
        color: #606266;
      }
    }
    .el-input.is-disabled {
      input {
        background-color: transparent;
        border: 0;
        padding: 0;
        cursor: text;
        & + .el-input__suffix,
        & + .el-input__prefix,
        & + .el-input-group__append {
          display: none;
        }
        &::placeholder {
          color: #606266;
        }
      }
    }
    .el-textarea.is-disabled {
      .el-textarea__inner {
        background-color: transparent;
        border: 0;
        padding: 0;
        cursor: text;
        margin-top: 5px;
        resize: none;
        &::placeholder {
          color: #606266;
        }
      }
    }
    .el-form-item__error {
      display: none;
    }
    .upload-wrap {
      .img-upload {
        .upload-view {
          display: none;
        }
        .el-upload-list__item-preview {
          &.el-upload-list-del {
            display: none;
          }
        }
      }
      .accept-text {
        display: none;
      }
    }
    .el-textarea .el-textarea__inner {
      color: #606266;
    }
    .el-radio-group {
      .el-radio {
        display: none;
        &.is-checked {
          display: block;
          .el-radio__input {
            display: none;
          }
          .el-radio__label {
            color: #606266;
            padding: 0;
          }
        }
      }
    }
    .el-date-editor {
      background: transparent;
      border: 0;
      &.is-disabled {
        input {
          color: #606266;
        }
      }
      .el-range-input {
        background: transparent;
        width: 80px;

        &::placeholder {
          color: #606266;
        }
      }
      i {
        display: none;
      }
      .el-range-separator {
        color: #606266;
        line-height: 28px;
      }
    }
  }
}

.vue-tags-input {
  /deep/.ti-input {
    padding: 4px 8px;
  }
  &.ti-disabled {
    /deep/.ti-input {
      border: 0;
      padding-left: 0;
    }
    /deep/.ti-actions,
    /deep/.ti-new-tag-input-wrapper {
      display: none;
    }
  }

  /deep/.week-select,
  /deep/.el-input-number {
    .el-input {
      width: auto;
    }
  }
}
.form-children {
  display: flex;
  .el-form-item {
    &:not(:last-child) {
      margin-right: 50px;
    }
    &.hasBorder {
      width: 50%;
      .el-form-item__content {
        > div {
          width: 100% !important;
        }
      }
    }
  }
}
/deep/.auth {
  .el-form-item__content {
    display: flex !important;
    // justify-content: center !important;
  }
}
.icon {
  display: inline-block;
  align-items: center;
  margin-left: 10px;
  img {
    vertical-align: middle;
  }
}

// 选择商品样式
.goods-list-view {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
  max-width: 1200px;
  min-width: 600px;
  .goods-item {
    flex: 0 0 112px;
    width: 112px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid transparent;
    overflow: hidden;
    margin-right: 8px;
    margin-bottom: 8px;
    border-radius: 4px;
    position: relative;

    &:hover {
      .del-btn {
        opacity: 1;
      }
    }

    &.active {
      border: 1px solid #409eff;
      .name {
        background-color: #f6f6f6;
      }
    }

    .img-wrap {
      width: 100%;
      height: 110px;
      overflow: hidden;
      .el-image {
        width: 100%;
        height: 100%;
      }
    }

    .name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 5px;
      width: 100%;
      box-sizing: border-box;
      line-height: 1.5;
      background-color: #f6f6f6;
    }

    .del-btn {
      transition: 0.3s;
      opacity: 0;
      position: absolute;
      right: 0;
      top: 0;
      width: 100%;
      height: 100%;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgba($color: #000000, $alpha: 0.3);
      i {
        cursor: pointer;
        font-size: 20px;
      }
    }
  }
}

// 视频上传样式
.upload-video-view {
  /deep/.el-upload--picture-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    // width:256px;
    width: 300px;
    line-height: normal;
    position: relative;
    overflow: hidden;

    .el-image {
      height: 100%;
    }

    .el-image::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba($color: #000000, $alpha: 0.3);
      z-index: 2;
    }

    .el-upload__text {
      color: #606266;
      font-size: 14px;
      text-align: center;
      line-height: 1.5;
      margin-top: 10px;
    }
    .play-btn {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
      margin: auto;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      z-index: 3;

      img {
        display: block;
        width: 100%;
      }
    }
    .video-size {
      position: absolute;
      right: 8px;
      font-size: 12px;
      bottom: 5px;
      color: #fff;
      z-index: 4;
    }
  }
}

// 录音上传样式
.upload-record-view {
  position: relative;
  width: 300px;
  /deep/.el-upload--picture-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    line-height: normal;
    position: relative;
    .el-upload__text {
      color: #606266;
      font-size: 14px;
      text-align: center;
      line-height: 1.5;
      margin-top: 10px;
    }
    .play-btn {
      position: absolute;
      left: 0;
      top: -20px;
      bottom: 0;
      right: 0;
      margin: auto;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      z-index: 3;
      img {
        display: block;
        width: 100%;
      }
    }
    .record-time {
      margin-top: 50px;
      color: #2c3e50;
    }
    .record-size {
      position: absolute;
      right: 8px;
      font-size: 12px;
      bottom: 5px;
      color: #000;
      z-index: 4;
    }
  }
}

/deep/.colorBtn {
  width: 30px !important;
  height: 30px !important;
  cursor: pointer;
}
/deep/ .m-colorPicker {
  margin-top: 5px;
  z-index: 9;
}
/deep/ .m-colorPicker > .box .bd > h3:last-of-type {
  cursor: pointer;
}

/deep/.color-box .el-button {
  padding: 6px 12px;
  div {
    display: flex;
    align-items: center;
    color: #9c9a9c;
    .box {
      margin: 0 4px;
      width: 20px;
      height: 20px;
      border: 1px solid #d4d7dc;
    }
  }
}
.color-list {
  display: grid;
  grid-template-columns: 40px 40px 40px;
  grid-column-gap: 20px;
  grid-row-gap: 20px;
  .color-item {
    width: 40px;
    height: 40px;
    border: 1px solid #d4d7dc;
    cursor: pointer;
    transition: all 0.5s;
    -moz-transition: all 0.5s;
    -webkit-transition: all 0.5s;
    -o-transition: all 0.5s;
    &:hover {
      transform: scale(1.1);
    }
  }
}

/deep/.userImage > img {
  width: 100% !important;
}
/deep/ .el-form-item__content .el-input-group {
  vertical-align: middle;
}
/deep/.el-input-group__append {
  // border: 0;
  button {
    // border: 1px solid #dcdfe6;
    border-left: 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    &.append-btn {
      border-color: #409efe;
      background: $--color-primary !important;
      border-radius: 4px;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border: 0;
      height: 40px;
      overflow: hidden;
      color: white !important;
      margin-left: -21px;
    }
    &.append-default {
      border-radius: 0;
      // border: 1px solid #dcdfe6;
      border-left: 0;
      border-bottom-right-radius: 4px;
      border-top-right-radius: 4px;
    }
    &.is-disabled {
      color: #fff;
      background-color: #a0cfff !important;
      border-color: #a0cfff !important;
    }
  }
}
.isFixed {
  position: fixed;
  background: #fff;
  left: 200px;
  width: calc(100% - 280px);
  bottom: 20px;
  border-top: 1px solid #ddd;
  margin: 0 0 0 20px;
  padding: 10px 0;
  button {
    padding: 10px 15px;
  }
}

.form-view {
  &.is-columns {
    display: flex;
    flex-wrap: wrap;
  }
}

.tag-dynamic-add {
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  /deep/.el-button {
    margin-left: 10px;
    width: 90px;
    height: 28px;
    line-height: 28px;
    padding: 0;
    text-align: center;
    font-size: 12px;
  }
  /deep/.el-input {
    width: 90px;
    margin-left: 10px;
    input {
      height: 28px;
      line-height: 28px;
    }
  }
}
.upload-file {
  width: 360px;
  .el-upload__tip {
    line-height: 1;
    margin: 0;
  }
}
.input-group {
  /deep/ .el-input {
    .el-input-group__prepend {
      padding: 0;
      border: none;
      input {
        border-right-color: transparent;
        &:focus {
          border-right-color: #13c2c2;
        }
      }
    }
    .el-input-group__append {
      padding: 0;
      border: none;
      input {
        border-left-color: transparent;
        &:focus {
          border-left-color: #13c2c2;
        }
      }
    }
    input {
      text-align: center;
    }
  }
}
</style>
