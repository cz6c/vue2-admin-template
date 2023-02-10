<script>
import moment from "moment";
import Sortable from "sortablejs";
import Vue from "vue";
export default {
  name: "TableView",
  props: {
    // 表格接口数据
    data: {
      type: Array,
      default: () => [],
    },
    // 表格列表数据
    column: {
      type: Array,
      default: () => [],
    },
    // 是否需要序号
    indexColum: {
      type: Boolean,
      default: true,
    },
    // 是否多选操作
    isSelection: {
      type: Boolean,
      default: false,
    },
    // 是否拖动排序
    dragSort: {
      type: Boolean,
      default: false,
    },
    // 操作宽度
    handleWidth: {
      type: Number,
      default: 160,
    },
    handleFixed: {
      type: [Boolean, String],
      default: false,
    },
    // 是否loading
    isLoading: {
      type: Boolean,
      default: false,
    },
    isHideOperation: {
      type: Boolean,
      default: false,
    },
    // 禁用选中的判断条件字段
    selectProp: {
      type: Object,
      default: () => {
        return {
          label: "",
          value: "",
        };
      },
    },
    // 判断tab切换时，是否需要checkbox
    needSelect: {
      type: Boolean,
      default: true,
    },
    // 表格线条
    border: {
      type: Boolean,
      default: true,
    },
    // 表格高度
    tableHeight: {
      type: String,
      default: "",
    },
    // 表格宽度
    tableWidth: {
      type: String,
      default: "100%",
    },
    // 表格可点击
    highlightCurrentRow: {
      type: Boolean,
      default: false,
    },
    // 是否显示双击查看详情提示
    isDclickDetails: {
      type: Boolean,
      default: false,
    },
    // 是否显文本化表格
    isTextTable: {
      type: Boolean,
      default: false,
    },
    // 高度100%，偏差值
    heightOffset: {
      type: Number,
      default: 0,
    },
    // 是否为斑马纹 table
    stripe: {
      type: Boolean,
      default: false,
    },
    // 是否可以通过点击行实现切换当前行的状态，不清除其他行的状态，多选
    isMultiple: {
      type: Boolean,
      default: false,
    },
    // 单元格的 className 的回调方法，也可以使用字符串为所有单元格设置一个固定的 className。
    cellClassName: {
      type: [String, Function],
    },
    rowClassName: {
      type: [String, Function],
    },
    // 是否默认展开所有行，当 Table 包含展开行存在或者为树形表格时有效
    defaultExpandAll: {
      type: Boolean,
      default: false,
    },
    // 单元格的 style 的回调方法，也可以使用字符串为所有单元格设置一个固定的 style
    cellStyle: {
      type: [String, Function],
    },
  },
  data() {
    return {
      // 这里的数据主要用于拖拽排序
      sortable: null,
      list: [],
      videoShow: false,
      videoUrl: "",
      tipsLeft: 0,
      tipsTop: 0,
      isShowTips: false,
      tableKey: +new Date(),
      scrollX: false,
      isShrinkData: this.defaultExpandAll,
      checkedKeys: false,
    };
  },
  watch: {
    isLoading(val) {},
    data: {
      handler(to) {
        this.list = to;
        if (this.$refs.dragTable) {
          this.$nextTick(() => {
            this.$refs.dragTable.doLayout();
          });
        }
      },
      immediate: true,
    },
  },
  mounted() {
    if (this.dragSort) {
      this.setSort();
    }
  },
  created() {
    this.init(this.column);
  },
  methods: {
    init(list) {
      list.forEach(item => {
        if (Array.isArray(item)) {
          this.init(item);
        } else {
          item.oPlaceholder = item.placeholder;
          item.oDisabled = item.disabled;
        }
      });
    },
    change() {
      this.videoShow = !this.videoShow;
    },
    setSort() {
      const el = this.$refs.dragTable.$el.querySelectorAll(".el-table__body-wrapper > table > tbody")[0];
      this.sortable = Sortable.create(el, {
        ghostClass: "sortable-ghost", // drop占位符的类名，
        handle: ".drag-handler",
        setData: function (dataTransfer) {
          // to avoid Firefox bug
          // Detail see : https://github.com/RubaXa/Sortable/issues/1012
          dataTransfer.setData("Text", "");
        },
        onEnd: evt => {
          const targetRow = this.list.splice(evt.oldIndex, 1)[0];
          this.list.splice(evt.newIndex, 0, targetRow);
          this.$emit("sort", this.list);
        },
      });
    },
    handleFun(funName) {
      return this.$refs.dragTable[funName]();
    },
    getTableData(dataName) {
      return this.$refs.dragTable[dataName];
    },
    shrinkAll(list, value) {
      list.forEach(row => {
        this.$refs.dragTable.toggleRowExpansion(row, this.isShrinkData);
        if (row.children && row.children.length > 0) {
          this.shrinkAll(row.children, value);
        }
      });
    },
    selectAll() {
      const selectAll = this.$refs.dragTable.checkedKeys;
      if (selectAll === true) {
        this.checkedKeys = true;
        this.$refs.dragTable.checkedKeys = false;
      } else {
        this.checkedKeys = !this.checkedKeys;
      }
      let arr = this.data.filter(row => {
        const { label, value } = this.selectProp;
        return !value.includes(row[label]);
      });
      this.select(arr, this.checkedKeys);
    },
    select(data, flag) {
      if (data) {
        data.forEach(row => {
          this.$refs.dragTable.toggleRowSelection(row, flag);
          if (row.children != undefined || row.children != "") {
            this.select(row.children, this.checkedKeys);
          }
        });
      }
    },
  },
  render(h) {
    // ----------- 策略模式 --------------
    const strategy = {
      /**
       * 远程搜索
       */
      remoteSearch: (props, titleItem) => {
        const { prop, searchProp, apiMethod, selectPlaceholder } = titleItem;
        return ({ row }) => {
          return h("remote-search", {
            props: {
              value: row[prop],
              searchProp,
              apiMethod,
              selectPlaceholder,
            },
          });
        };
      },
      /**
       * 精简用户数据
       */
      userInfo: (props, titleItem) => {
        return ({ row }) => {
          const { avatar, userName, phone } = titleItem;
          const vnodeList = [
            h(
              "div",
              {
                class: "info",
              },
              [h("span", [row[userName]]), phone && h("span", [row[phone] || "-"])],
            ),
          ];
          if (avatar) {
            vnodeList.unshift(
              h("el-image", {
                props: {
                  src: row[avatar],
                  title: "头像",
                  fit: "cover",
                },
                style: {
                  width: "30px",
                  height: "30px",
                },
                scopedSlots: {
                  error: () =>
                    h("SvgIcon", {
                      attrs: {
                        icon: "avatar",
                        style: {
                          width: "30px",
                          height: "30px",
                        },
                      },
                    }),
                },
              }),
            );
          }
          return h(
            "div",
            {
              class: "userInfo",
            },
            vnodeList,
          );
        };
      },
      /**
       * 默认文本框
       */
      text: (props, titleItem) => {
        let { map } = titleItem;
        const { unit, unitAlign = "left", color, textType } = titleItem;
        if (map) {
          map = JSON.parse(JSON.stringify(map));
          // 格式化map
          Object.entries(map).forEach(([key, value]) => {
            if (typeof value === "string") {
              map[key] = {
                name: value,
              };
            }
          });
        }

        return ({ row: data }) => {
          const propList = props.trim().split(".");
          propList.forEach(item => {
            if (!data) return;
            data = data[item];
          });
          const titleData = map ? map[data] : { name: data, color };
          if (titleData && !titleData.color && color) {
            titleData.color = color;
          }
          let val = "- -";
          if (titleData && titleData.name) {
            val = unit == "￥" || unit == "$" ? Number(titleData.name).toFixed(2) : titleData.name;
            val = unit ? (unitAlign === "left" ? unit + val : val + unit) : val;
          } else if (titleData && titleData.name === 0) {
            val = 0;
          }
          let icon = "";
          if (titleData && titleData.icon) {
            icon = h("svg-icon", {
              attrs: {
                icon: titleData.icon,
                style: {
                  width: "8px",
                  height: "8px",
                  verticalAlign: "1px",
                  marginRight: "5px",
                },
              },
            });
          }
          return [icon, h("span", { style: titleData }, val)];
        };
      },
      /**
       * icon文本
       */
      iconText: (props, titleItem) => {
        let { map } = titleItem;
        const { unit, unitAlign = "left", color, icon, showIconProp } = titleItem;
        map = JSON.parse(JSON.stringify(map || {}));
        if (map) {
          // 格式化map
          Object.entries(map).forEach(([key, value]) => {
            if (typeof value === "string") {
              map[key] = {
                name: value,
              };
            }
          });
        }
        return ({ row: rowData }) => {
          const propList = props.split(".");
          let data;
          propList.forEach(item => {
            data = rowData[item];
          });
          const titleData = map ? map[data] : { name: data, color };
          let val = "- -";
          if (titleData && titleData.name) {
            val = unit == "￥" || unit == "$" ? Number(titleData.name).toFixed(2) : titleData.name;
            val = unit ? (unitAlign === "left" ? unit + val : val + unit) : val;
          } else if (titleData && titleData.name === 0) {
            val = 0;
          }
          const elList = [h("span", { style: titleData }, val)];
          if (icon && rowData[showIconProp] === 1) {
            elList.push(
              h("svg-icon", {
                props: {
                  icon: icon,
                },
              }),
            );
          }
          return h("div", { class: "status" }, elList);
        };
      },
      /**
       * icon文本
       */
      icon: (prop, titleItem) => {
        const { map } = titleItem;
        let nowIcon = "";
        return ({ row: data }) => {
          if (map) {
            Object.entries(map).forEach(([key, value]) => {
              if (key == data[prop]) {
                nowIcon = value;
              }
            });
          }
          let childrenVnode = [];
          if (/^[\u4e00-\u9fa5]+$/.test(nowIcon)) {
            // 如果是汉字直接返回
            childrenVnode.push(nowIcon);
          } else {
            // 不为汉字调用svg-icon
            childrenVnode.push(
              h("svg-icon", {
                props: {
                  icon: nowIcon,
                },
              }),
            );
          }
          return h(
            "div",
            {
              class: "icon-type",
            },
            childrenVnode,
          );
        };
      },
      /**
       * 标签文本
       */
      tags:
        (prop, props) =>
        ({ row }) => {
          const { map, tagType } = props;
          if (map) {
            // 格式化map
            Object.entries(map).forEach(([key, value]) => {
              if (typeof value === "string") {
                map[key] = {
                  name: value,
                };
              }
            });
          }
          const propList = prop.split(".");
          propList.forEach(item => {
            row = row[item];
          });
          if (Array.isArray(row)) {
            if (row.length === 0) {
              return "-";
            }
            const tags = [];
            row.forEach(x => {
              tags.push(
                h(
                  "el-tag",
                  {
                    attrs: {
                      disableTransitions: true,
                      size: "mini",
                      type: tagType,
                    },
                    style: {
                      margin: "2px",
                    },
                  },
                  x,
                ),
              );
            });
            return tags;
          } else if (row) {
            return h(
              "el-tag",
              {
                attrs: {
                  disableTransitions: true,
                  size: "mini",
                  type: map ? map[row].type : tagType,
                },
              },
              map ? map[row].name : row,
            );
          } else {
            return "-";
          }
        },
      /**
       * 可修改输入框
       */
      editText:
        (prop, item) =>
        ({ row }) => {
          return h("el-input", {
            attrs: {
              value: row[prop],
              class: "edit-input",
            },
            ref: `editInput${row.id}`,
            refInFor: true,
            on: {
              input: value => {
                Vue.set(row, prop, value);
              },
              blur: () => {
                item.editData && item.editData(row);
              },
            },
            nativeOn: {
              keyup: ({ code }) => {
                if (code == "Enter" || code == "NumpadEnter") {
                  this.$refs[`editInput${row.id}`][0].blur();
                  this.$refs[`editInput${row.id}`][1].blur();
                }
              },
            },
          });
        },
      /**
       * 可复制文本框
       */
      copyText:
        prop =>
        ({ row }) => {
          return h(
            "el-link",
            {
              attrs: {
                underline: true,
              },
              on: {
                click: () => {
                  this.$copyText(row[prop]).then(
                    e => {
                      this.$message.success("复制成功");
                    },
                    e => {
                      this.$message.success("复制失败，请重试");
                    },
                  );
                },
              },
            },
            row[prop],
          );
        },
      /**
       * 图片文本
       */
      imageText:
        (prop, { imgProp, text, imageWidth }) =>
        ({ row }) => {
          const aggregate = [
            row[imgProp] &&
              h("el-image", {
                props: {
                  src: row[imgProp],
                  title: "图片",
                  "preview-src-list": [row[imgProp]],
                },
                style: {
                  width: imageWidth || "60px",
                },
                class: "table-image",
              }),
            row[prop] &&
              h(
                "div",
                {
                  style: {
                    width: "60%",
                    marginLeft: "5px",
                  },
                },
                row[prop],
              ),
          ];
          return h(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              },
            },
            aggregate,
          );
        },
      /**
       * 图片或文本
       */
      /**
       * 视频
       */
      video:
        (prop, { coverProp }) =>
        ({ row }) => {
          const { isShowDialog = false } = row;
          return [
            h(
              "div",
              {
                class: "video-view",
                on: {
                  click: e => {
                    Vue.set(row, "isShowDialog", true);
                  },
                },
              },
              [
                // 视频封面
                h("el-image", { attrs: { src: row[coverProp], fit: "cover" } }),
                // 视频播放按钮
                h(
                  "div",
                  {
                    class: "play-btn",
                  },
                  [h("svg-icon", { attrs: { icon: "play" } })],
                ),
              ],
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
                    Vue.set(row, "isShowDialog", false);
                  },
                },
              },
              [
                // 视频
                h("video", {
                  attrs: {
                    src: row[prop],
                    width: "100%",
                    controls: true,
                  },
                }),
              ],
            ),
          ];
        },
      /**
       * 数字输入框
       */
      digitalInput:
        (prop, item) =>
        ({ row }) => {
          let { inputProp = {}, label, disabled } = item;
          const { size = "small", submit, blurHandle, placeholder = item.placeholder || `请输入${label}` } = inputProp;
          return h("DigitalInput", {
            attrs: {
              value: row[prop],
              size,
              placeholder,
              disabled,
              ...inputProp,
            },
            on: {
              input: val => {
                Vue.set(row, prop, val);
              },
              blur: () => {
                blurHandle && blurHandle({ prop, row });
              },
              submit: () => {
                submit && submit({ prop, row });
              },
            },
          });
        },
      /**
       * 文本输入框
       */
      input: (prop, item) => {
        const {
          size = "mini",
          placeholder = `请输入${item.label}`,
          disabled = false,
          align = "center",
          inputProp = {},
        } = item;
        return ({ row }) => {
          return h("el-input", {
            class: `align-${align}`,
            attrs: {
              size,
              value: row[prop],
              placeholder,
              disabled,
              ...inputProp,
            },
            on: {
              input: val => {
                Vue.set(row, prop, val);
              },
              blur: () => {
                item.blurHandle && item.blurHandle({ prop, row });
              },
              change: () => {
                item.change && item.change(row);
              },
            },
            nativeOn: {
              keyup: ({ code }) => {
                if (code == "Enter" || code == "NumpadEnter") {
                  item.enterHandle && item.enterHandle({ prop, row });
                }
              },
            },
          });
        };
      },
      /**
       * 时间戳
       * color：只有需要过期日期字体变色才传
       */
      timeStamp:
        (props, { color, nullText = "- -", format = "YYYY-MM-DD HH:mm:ss" }) =>
        ({ row }) => {
          const nowTime = moment(new Date().getTime()).format(format);
          let data = row[props];
          if (!data) {
            return nullText;
          } else if (String(data).length === 10) {
            data = Number(data + "000");
            data = moment(data).format(format);
          } else {
            data = moment(new Date(data).getTime()).format(format);
          }
          return h(
            "span",
            {
              style: {
                color: nowTime > data && data != "- -" ? color : "",
              },
            },
            data,
          );
        },
      /**
       * 有效期
       */
      validity:
        (props, { map }) =>
        ({ row }) => {
          const data = row[props];
          let value = "- -";
          let color = "";
          const nowTime = moment(new Date().getTime()).format("YYYY-MM-DD");
          if (Array.isArray(data)) {
            // 有效期内
            const startTime = moment(data[0] * 1000).format("YYYY-MM-DD");
            const endTime = moment(data[1] * 1000).format("YYYY-MM-DD");
            value = startTime + " 至 " + endTime;
            nowTime > endTime ? (color = "#aaa") : (color = ""); // 过期日期字体颜色变淡
          } else if (map) {
            // 过期，未开通
            value = map[data] && (map[data].name || map[data]);
            color = map[data] && (map[data].color || "");
          }
          return h("span", { style: { color } }, value);
        },
      /**
       * 根据别的字段来判断颜色
       */
      contactColor:
        (props, { map, contactProp, defaultUnit, defaultColor, unitAlign = "left", isPrice }) =>
        ({ row }) => {
          const data = isPrice ? Number(row[props]).toFixed(2) : row[props];
          const { color = "", unit = "" } = map[row[contactProp]] || {};
          const value = unitAlign === "left" ? (unit || defaultUnit || 0) + data : data + (unit || defaultUnit);
          return h("span", { style: { color: color || defaultColor } }, value);
        },
      /**
       * 8/10，8/10个,500/单，3-10类型
       *
       */
      proporp:
        (props, { cutSign = "/", keyList, unit }) =>
        ({ row }) => {
          const value = keyList.length && row[keyList[0].key];
          const leftValue = row[keyList[0].key];
          const leftColor = keyList[0].color;
          const rightValue = keyList.length > 1 && row[keyList[1].key];
          const rightColor = keyList.length > 1 && keyList[1].color;
          return [
            h("span", { style: { color: leftColor } }, leftValue),
            h("span", cutSign),
            h("span", { style: { color: rightColor } }, rightValue),
            h("span", unit),
          ];
        },
      /**
       * 头像
       */
      avatar: props => {
        return ({ row }) => {
          const data = row[props];
          if (data) {
            return h("el-avatar", {
              attrs: {
                src: data || avatar,
                icon: "el-icon-user-solid",
              },
              class: "avatar",
            });
          } else {
            return h("SvgIcon", { attrs: { icon: "avatar" } });
          }
        };
      },
      /**
       * 开关
       */
      switch: (props, item) => {
        const {
          activeValue = 1,
          inactiveValue = 2,
          activeText = "活跃",
          inactiveText = "冻结",
          show,
          constactDisable,
          disable = () => {},
        } = item;
        return ({ row }) => {
          const data = row[props];
          if (show) {
            const results = show(row);
            if (!results) {
              return;
            }
          }
          return data == "- -"
            ? "- -"
            : h("el-switch", {
                props: {
                  activeValue,
                  inactiveValue,
                  activeText,
                  inactiveText,
                  disabled: constactDisable ? row[constactDisable[0]] == constactDisable[1] : false,
                  value: data,
                },
                on: {
                  change: value => {
                    row[props] = value;
                    item.switchHandle && item.switchHandle(value, row);
                    item.change && item.change(row);
                  },
                },
              });
        };
      },
      /**
       * 图片
       */
      image:
        (props, { imageWidth, imageHeight }) =>
        ({ row }) => {
          let data = row[props];
          if ((Array.isArray(data) && !data.length) || !data) {
            return h(
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
          } else {
            // data = Array.isArray(data) ? data : [data];
            data = Array.isArray(data) ? data : data.split(",");
            return data.map(item => {
              return h("el-image", {
                props: {
                  src: item || "",
                  title: "图片",
                  previewSrcList: [item],
                  fit: "cover",
                },
                style: {
                  width: imageWidth,
                  height: imageHeight,
                  margin: "0 5px 0",
                },
                class: "table-image" + (imageHeight ? " autoWidth-image" : ""),
              });
            });
          }
        },
      /**
       * 拖拽icon
       */
      drag: props => {
        return () => {
          return h("svg-icon", {
            props: {
              icon: "drag",
            },
            class: "drag-handler",
          });
        };
      },
      /**
       * 商品信息
       */
      info: props => {
        return ({ row }) => {
          return h(
            "div",
            {
              class: "goodsInfo",
            },
            [
              h("el-image", {
                props: {
                  src: row.thumbImg,
                },
              }),
              h(
                "div",
                {
                  class: "info",
                },
                [
                  h("span", "创建时间：" + moment(Number(row.createTime + "000")).format("YYYY-MM-DD HH:mm")),
                  h("span", [row.goodsName]),
                  h(
                    "div",
                    {
                      style: "text-align: left",
                    },
                    row.lableName &&
                      row.lableName.split(",").map(it => (
                        <el-tag size="mini" effect="dark" type="warning" key={it}>
                          {it}
                        </el-tag>
                      )),
                  ),
                ],
              ),
            ],
          );
        };
      },
      /**
       * 商品信息
       */
      infoMult: (prop, { attrName }) => {
        return ({ row }) => {
          return h(
            "div",
            {
              class: "infoMult",
            },
            [
              attrName.img &&
                h("el-image", {
                  props: {
                    src: row[attrName.updateTime],
                  },
                }),
              h(
                "div",
                {
                  class: "info",
                },
                [
                  //  h("span", "创建时间：" + moment(Number(row[attrName.updateTime] + "000")).format("YYYY-MM-DD HH:mm")),
                  h("span", row[attrName.projectName]),
                  h("span", "创建时间：" + row[attrName.updateTime] + "000"),
                  h("span", "商品来源：" + row[attrName.source]),
                ],
              ),
            ],
          );
        };
      },
      /**
       * 排序
       */
      sort: (props, item) => {
        return ({ row }) => {
          const data = row[props];
          return h("el-input-number", {
            props: {
              controlsPosition: "right",
              stepStrictly: true,
              size: "small",
              min: 0,
              value: data,
            },
            class: "sortInput",
            on: {
              change: value => {
                row[props] = value;
                item.sortHandle && item.sortHandle(value, row);
              },
            },
          });
        };
      },
      /**
       * 链接
       */
      link: (props, { isNew, button, submit, clickHandle, isLink, replaceLink }) => {
        return ({ row }) => {
          const data = row[props];
          const json = {};
          if (isLink) {
            if (data === "") {
              return [
                h(
                  "el-link",
                  {
                    props: {
                      type: "primary",
                      underline: false,
                      ...json,
                    },
                    attrs: {
                      target: isNew ? "_blank" : "_self",
                    },
                    on: {
                      click: value => {
                        clickHandle && clickHandle(row, props);
                      },
                    },
                  },
                  [replaceLink],
                ),
                h("div", [
                  button &&
                    h(
                      "el-button",
                      {
                        props: {
                          size: "mini",
                          type: "success",
                        },
                        on: {
                          click: () => {
                            submit(row);
                          },
                        },
                      },
                      button,
                    ),
                ]),
              ];
            } else {
              return h("span", data);
            }
          } else {
            if (data === "") {
              return h("span", "- -");
            } else {
              return [
                h(
                  "el-link",
                  {
                    props: {
                      type: "primary",
                      underline: false,
                      ...json,
                    },
                    attrs: {
                      target: isNew ? "_blank" : "_self",
                    },
                    on: {
                      click: value => {
                        clickHandle && clickHandle(row, props);
                      },
                    },
                  },
                  [data],
                ),
                h("div", [
                  button &&
                    h(
                      "el-button",
                      {
                        props: {
                          size: "mini",
                          type: "success",
                        },
                        on: {
                          click: () => {
                            submit(row);
                          },
                        },
                      },
                      button,
                    ),
                ]),
              ];
            }
          }
        };
      },
      /**
       * 多链接
       */
      links:
        (prop, { btnHandle = () => {}, isNew, props }) =>
        ({ row }) => {
          return props.map(item => {
            return h(
              "el-link",
              {
                props: {
                  type: "primary",
                  underline: false,
                },
                style: "display: block",
                attrs: {
                  target: isNew ? "_blank" : "_self",
                },
                on: {
                  click: () => {
                    btnHandle && btnHandle(row, item);
                  },
                },
              },
              row[item],
            );
          });
        },
      progress: (props, { color }) => {
        return ({ row }) => {
          const data = row[props];
          return h("el-progress", {
            props: {
              color: color,
              percentage: data,
            },
          });
        };
      },
      /**
       * 选择器
       */
      select: (prop, item) => {
        return ({ row }) => {
          /**
           * item字段解析
           * @param {*} inputType // 输入框类型
           * @param {*} unit // 输入框单位
           *
           */
          const { options, slot, width, size = "mini" } = item;

          const data = row[prop];
          if (!options) {
            console.error("select必须有options参数");
          }
          const children = options.map(({ value, label }) => {
            return h("el-option", {
              attrs: { key: value, label, value },
            });
          });
          return [
            h(
              "el-select",
              {
                attrs: {
                  value: data,
                  size,
                  ...item,
                },
                style: {
                  // 宽度
                  width,
                },
                on: {
                  change: val => {
                    Vue.set(row, prop, val);
                    item.editData && item.editData(row, val);
                  },
                },
              },
              [children],
            ),
            this.$scopedSlots[slot] && this.$scopedSlots[slot](),
          ];
        };
      },
      /**
       * 日期选择器
       */
      datePicker:
        (prop, item) =>
        ({ row }) => {
          /**
           * item字段解析
           * @param {*} dateType // 日期类型，同elementUi的type，	year/month/date/dates/week/datetime/datetimerange/daterange/monthrange
           * @param {*} rangeSeparator // 间隔文本
           * @param {*} startPlaceholder // 开始选择框占位
           * @param {*} endPlaceholder // 结束选择框占位
           * @param {*} placeholder // 选择框占位
           *
           */
          const { handle, inputProp } = item;
          let {
            props,
            dateType,
            valueFormat = "yyyy-MM-dd",
            format,
            rangeSeparator = "至",
            startPlaceholder = "开始日期",
            endPlaceholder = "结束日期",
            placeholder = `-`,
            width = "100%",
            size = "mini",
            disabled = item.disabled,
          } = inputProp;

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
              value: row[prop],
              size,
              disabled,
              ...props,
            },
            style: {
              width,
            },
            on: {
              input: val => {
                Vue.set(row, prop, val);
                handle && handle({ prop, row });
              },
            },
          });
        },
      /**
       * 计数器
       */
      inputNumber: (prop, item) => {
        return ({ row }) => {
          const { min = 0, constactDisable } = item;
          const data = row[prop];
          item.maxProp && (item.max = row[item.maxProp]);
          return h("el-input-number", {
            props: {
              value: data,
              size: "mini",
              min,
              ...item,
              disabled: constactDisable ? row[constactDisable[0]] == constactDisable[1] : false,
            },
            style: {
              width: "100%",
            },
            on: {
              input: val => {
                Vue.set(row, prop, val);
                item.editData && item.editData(row);
              },
              change: value => {
                item.change && item.change(row);
              },
            },
          });
        };
      },
      /**
       * 级联选择器
       */
      cascader: (prop, item) => {
        return ({ row }) => {
          const {
            disabled = false,
            oneTag = false,
            clearable = true,
            isCanSelectParent = true,
            label,
            width = this.formItemWidth,
            placeholder = `请选择${label}`,
          } = item;
          const data = row[prop];
          return h("DiyCascader", {
            attrs: {
              value: data,
              options: item.options,
              clearable,
              oneTag,
              isCanSelectParent,
              placeholder,
              disabled: this.isTextForm || disabled,
              ...item,
            },
            style: {
              width,
            },
            on: {
              input: val => {
                Vue.set(row, prop, val);
              },
            },
          });
          // return h("el-cascader", {
          //   props: {
          //     value: data,
          //     options,
          //     size: "mini",
          //     ...item,
          //   },
          //   style: {
          //     width: "100%",
          //   },
          //   on: {
          //     input: val => {
          //       Vue.set(row, prop, val);
          //       item.editData && item.editData(row);
          //     },
          //   },
          // });
        };
      },
      /**
       * 多功能表格下拉选择
       */
      tableSelect: (prop, item) => {
        return ({ row }) => {
          /**
           * item字段解析
           * @param {*} returnKey // 是否禁用
           *
           */
          let { width } = item;
          const data = row[prop];
          return h("TableSelect", {
            attrs: {
              value: data,
              size: "mini",
              ...item,
              width: 600,
            },
            style: {
              width,
            },
            on: {
              input: val => {
                Vue.set(row, prop, val);
                item.change && item.change(val);
              },
            },
          });
        };
      },
    };
    // ----------- 策略结束 --------------

    // ----------- 组合el-table-column -------------
    const spliceColumn = data => {
      const columnList = [];
      data.forEach((titleItem, index) => {
        let {
          label,
          prop,
          type = "text",
          children,
          align = "center",
          sortable,
          width,
          minWidth,
          hidden = false,
          fixed,
          showOverflowTooltip = true,
          required,
          headerSlot,
          // 头部是否展示收缩
          isShrink,
        } = titleItem;

        // 判断是否为文本表单
        titleItem.disabled = titleItem.oDisabled ? titleItem.oDisabled : this.isTextTable;
        // console.log("判断是否为文本表单",titleItem.disabled)
        if (this.isTextTable) {
          titleItem.placeholder = "-";
        } else {
          if (titleItem.oPlaceholder) {
            titleItem.placeholder = titleItem.oPlaceholder;
          } else {
            delete titleItem.placeholder;
          }
        }

        // 计算label共多少个字符
        let realLength = 0;
        const len = label.length;
        let charCode = -1;
        if (!label) {
          realLength = 0;
        }
        for (let i = 0; i < len; i++) {
          charCode = label.charCodeAt(i);
          if (charCode >= 0 && charCode <= 128) realLength += 1;
          else realLength += 2;
        }
        // 每格宽度
        const thWidth = 20 + realLength * 8 + (sortable ? 25 : 0);
        let childrenVnode = [];
        if (children) {
          childrenVnode = spliceColumn(children);
        }
        try {
          const vnode = h(
            "el-table-column",
            {
              props: {
                key: index,
                prop: prop,
                label: `${required ? "*" : ""} ${label}`,
                align,
                sortable,
                width,
                minWidth: minWidth || thWidth,
                fixed,
                showOverflowTooltip,
              },
              key: index,
              scopedSlots: {
                default: strategy[type](prop, titleItem),
                header: headerSlot
                  ? () => {
                      return this.$scopedSlots[headerSlot] && this.$scopedSlots[headerSlot](titleItem);
                    }
                  : isShrink
                  ? () => {
                      return [
                        label,
                        [
                          h(
                            "div",
                            {
                              class: "top-shrink",
                              on: {
                                click: () => {
                                  this.isShrinkData = !this.isShrinkData;
                                  this.shrinkAll(this.data, this.isShrinkData);
                                },
                              },
                            },
                            [
                              h("i", {
                                class: this.isShrinkData ? "el-icon-minus" : "el-icon-plus",
                              }),
                            ],
                          ),
                        ],
                      ];
                    }
                  : "",
              },
            },
            childrenVnode,
          );
          !hidden && columnList.push(vnode);
        } catch (error) {
          console.error(`没有${type}这个类型`, error);
        }
      });
      return columnList;
    };
    const columnList = spliceColumn(this.column);
    // ----------- 组合结束 ------------------------

    // ------------- 功能 开始 --------------
    // 操作
    if (this.$scopedSlots.default) {
      if (!this.isHideOperation) {
        const vh = h("el-table-column", {
          props: {
            align: "center",
            label: "操作",
            width: this.handleWidth,
            fixed: this.handleFixed,
          },
          scopedSlots: {
            default: ({ row, $index }) => {
              return h(
                "div",
                this.$scopedSlots.default({
                  props: row,
                  index: $index,
                }),
              );
            },
          },
        });
        if ([false, "right"].indexOf(this.handleFixed) > -1) {
          columnList.push(vh);
        } else {
          columnList.unshift(vh);
        }
      }
    }
    // 序号
    if (this.indexColum) {
      columnList.unshift(
        h("el-table-column", {
          props: {
            type: "index",
            align: "center",
            label: "序号",
            width: "50",
            fixed: "left",
          },
        }),
      );
    }
    // checkbox选择
    if (this.isSelection) {
      columnList.unshift(
        h("el-table-column", {
          props: {
            type: "selection",
            align: "center",
            width: "50",
            reserveSelection: true,
            selectable: row => {
              const { label, value } = this.selectProp;
              return row[label] != value;
            },
          },
        }),
      );
    }
    // 拖拽
    if (this.dragSort) {
      columnList.push(
        h("el-table-column", {
          props: {
            align: "center",
            label: "拖拽",
            width: "100",
          },
          scopedSlots: {
            default: strategy["drag"](),
          },
        }),
      );
    }

    // ------------- 功能 结束 --------------

    const table = h(
      "el-table",
      {
        props: {
          data: this.list,
          border: this.border,
          height: this.tableHeight || this.heightOffset ? "100%" : undefined,
          rowKey: "id",
          highlightCurrentRow: this.highlightCurrentRow,
          stripe: this.stripe,
          "cell-class-name": this.cellClassName,
          "row-class-name": this.rowClassName,
          defaultExpandAll: this.defaultExpandAll,
          "cell-style": this.cellStyle,
        },
        style: {
          width: this.tableWidth,
        },
        class: {
          "is-text": this.isTextTable,
        },
        directives: [
          {
            name: "loading",
            value: this.isLoading,
          },
        ],
        key: this.tableKey,
        ref: "dragTable",
        on: {
          // 选择改变
          "selection-change": value => {
            this.$emit("selectionChange", value);
            if (value.length > 1 || value.length === 0) {
              this.$parent.className === "pane" && this.$parent.$parent.$parent.changeShow(false);
            }
          },
          // 排序改变
          "sort-change": value => {
            this.$emit("sortChange", value);
          },
          // 双击改变
          "row-dblclick": value => {
            this.$emit("dclick", value);
          },
          // 单击改变
          "row-click": row => {
            // 如果此行禁止选中,单机时也不选中
            const { label, value } = this.selectProp;
            if (row[label] === value) {
              return;
            }
            if ((!this.highlightCurrentRow && !this.isMultiple) || row === -1) return;
            !this.isMultiple && this.$refs.dragTable.clearSelection();
            this.$refs.dragTable.toggleRowSelection(row);
            this.$emit("currentChange", row);
            this.$parent.className === "pane" && this.$parent.$parent.$parent.changeShow(true);
          },
          "cell-mouse-enter": () => {
            this.isShowTips = true;
          },
          "cell-mouse-leave": () => {
            this.isShowTips = false;
          },
          // 当表格宽度发生改变时，更新表格列宽度
          "header-dragend": () => {
            this.$refs.dragTable.layout.updateColumnsWidth();
          },
          "select-all": value => {
            this.$emit("selectAll", value);
            this.selectAll();
          },
        },
      },
      columnList,
    );

    const dblclick =
      this.isDclickDetails &&
      h(
        "div",
        {
          class: "table-tips",
          style: {
            left: `${this.tipsLeft}px`,
            top: `${this.tipsTop}px`,
            // display: this.isShowTips ? "block" : "none",
            opacity: this.isShowTips ? 1 : 0,
          },
        },
        "双击列表查看详情",
      );

    // return [table];

    return h(
      "div",
      {
        class: `table-wrap ${this.scrollX ? "repair-fixed" : ""}`,
        style: {
          height: this.heightOffset ? `calc(100% - ${this.heightOffset}px)` : this.tableHeight,
        },
        on: {
          mousemove: e => {
            this.tipsLeft = e.clientX + 8;
            this.tipsTop = e.clientY + 16;
          },
        },
      },
      [table, dblclick],
    );
  },
};
</script>
<style lang="scss" scoped>
.status {
  display: flex;
  align-items: center;
  > span {
    margin-right: 5px;
  }
  /deep/.svg-icon {
    padding-top: 2px;
    width: 20px;
    height: 20px;
  }
}
.el-table {
  .top-shrink {
    display: inline-block;
    vertical-align: middle;
    margin-left: 5px;
    cursor: pointer;
    position: relative;
    height: 11px;
    width: 11px;
    line-height: 10px;
    border: 1px solid $--color-primary;
    vertical-align: middle;
    box-sizing: border-box;

    i {
      position: absolute;
      left: 0;
      top: 0;
      font-weight: normal;
      color: $--color-primary !important;
      transform: scale(0.6);
      font-size: 12px;
      transform-origin: center;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
    }
  }
  /deep/.caret-wrapper {
    height: 18px;
    vertical-align: -4px;
    .sort-caret {
      left: 5px;
      &.ascending {
        top: -2px;
      }
      &.descending {
        bottom: -2px;
      }
    }
  }
  /deep/.cell {
    > .el-input {
      input {
        padding: 0 8px;
      }
    }
    .el-cascader,
    .table-select {
      input {
        padding-left: 8px;
        padding-right: 30px;
      }
    }
    .table-select {
      .el-input__suffix {
        line-height: 28px;
      }
    }
    > .el-date-editor {
      input {
        padding-right: 8px;
        padding-left: 30px;
      }
    }
  }
  /deep/ .digital-input,
  /deep/ .el-select {
    input {
      padding-left: 8px;
    }
  }
}
/deep/.el-table td.is-center,
/deep/.el-table th.is-center {
  text-align: center;
}
/deep/.el-table th {
  background-color: #f6f7fb !important;
  // text-align: center;
}
.avatar {
  // border-radius: 50px;
  width: 20px;
  height: 20px;
  display: block;
  margin: 0 auto;
}
/deep/.table-image {
  width: 80px;
  .el-image__error {
    height: 40px;
  }
}
/deep/ .autoWidth-image {
  img {
    width: auto;
  }
}
/deep/.sortable-ghost {
  opacity: 0.8;
  color: #fff !important;
  background: #42b983 !important;
}
/deep/.drag-handler {
  width: 20px !important;
  height: 20px !important;
  cursor: move;
}
.goodsInfo {
  display: flex;
  justify-content: center;
  align-items: center;
  .el-image {
    flex: 0 0 80px;
    width: 80px;
    height: 80px;
  }
  .info {
    margin-left: 10px;
    flex: 1;
    > span {
      display: block;
      text-align: left;
      &:first-of-type {
        color: #797979;
        font-size: 12px;
      }
      &:last-of-type {
        display: -webkit-box;
        word-break: break-all;
        text-overflow: ellipsis;
        overflow: hidden;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        min-height: 20px;
      }
    }
  }
}
.infoMult {
  display: flex;
  justify-content: center;
  align-items: center;
  .el-image {
    flex: 0 0 100px;
    width: 100px;
    height: 100px;
  }
  .info {
    margin-left: 10px;
    flex: 1;
    > span {
      display: block;
      text-align: left;
      color: #797979;
      font-size: 12px;
      padding-bottom: 0 !important;
      &:first-of-type {
        font-size: 14px;
        font-weight: bold;
        padding-bottom: 6px;
      }
      &:last-of-type {
        display: -webkit-box;
        word-break: break-all;
        text-overflow: ellipsis;
        overflow: hidden;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        min-height: 20px;
      }
    }
    > div {
      &:last-of-type {
        padding-top: 6px;
      }
    }
  }
}
.infoMult /deep/ .el-tag--dark.el-tag--warning {
  margin-right: 5px;
}
/deep/.el-form-item {
  margin-bottom: 0;
}
/deep/.table-video {
  width: 110px;
  height: 50px;
}
.goodsInfo /deep/ .el-tag--dark.el-tag--warning {
  margin-right: 5px;
}
.table-copy {
  cursor: pointer;
  color: #409efe;
}
.video-view {
  position: relative;
  width: 100%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  background-color: #000;
  max-width: 300px;
  margin: auto;
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba($color: #000000, $alpha: 0.3);
    z-index: 2;
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
}
// /deep/ .el-table__row--level-0 .is-left {
//   .el-icon-arrow-right {
//     font-weight: bold;
//     font-size: 14px;
//     color: #409efe !important;
//   }
// }
/deep/ .el-link--default .el-link--inner {
  color: #409efe;
}
/deep/ .el-link + .el-link {
  margin-left: 10px;
}
/deep/ .el-table__header-wrapper {
  background-color: #f6f7fb;
  // .el-checkbox {
  //   &::after {
  //     content: "全选";
  //     display: inline-block;
  //     padding-left: 3px;
  //     color: #409efe;
  //     font-size: 12px;
  //   }
  // }
}
/deep/.el-switch__label {
  font-weight: normal;
}
.sortInput {
  /deep/ &.el-input-number--small {
    width: 110px;
  }
}
/deep/.edit-input {
  border: 0;
  outline: none;
  background-color: transparent;
  color: #606266;
  padding: 0;
  height: 23px;
  line-height: 23px;
}

.userInfo {
  display: flex;
  justify-content: center;
  align-items: center;
  .el-image {
    border-radius: 40px;
    width: 40px;
    height: 40px;
    display: block;
    margin: 0 auto;
    flex-shrink: 0;
    margin-right: 10px;
  }
  .info {
    flex: 1;
    overflow: hidden;
    > span {
      display: block;
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 1.3;
    }
  }
}
/deep/ .icon-type {
  .svg-icon {
    width: 20px !important;
    height: 20px !important;
  }
}
.table-tips {
  background: #f0f0f0;
  border: 1px solid #bfbfbf;
  border-radius: 3px;
  padding: 2px 4px;
  position: fixed;
  top: -9999px;
  left: -9999px;
  font-size: 12px;
  z-index: 9999;
  opacity: 0;
  // display: none;
}
.table-wrap {
  height: 100%;
}

// 文本表单处理
/deep/.el-table.is-text {
  .cell {
    .unit-icon {
      display: none;
    }
    .el-input-number.is-disabled {
      .el-input-number__decrease,
      .el-input-number__increase {
        display: none;
      }
    }
    .el-input.is-disabled {
      input {
        background-color: transparent;
        border: 0;
        padding: 0;
        cursor: text;
        text-align: center;
        color: #606266;
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
  }
}
</style>
