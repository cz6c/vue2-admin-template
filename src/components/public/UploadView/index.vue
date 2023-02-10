<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { CreateElement } from "vue";
import { common } from "@/api/public/index";
// 获取token
import { getToken } from "@/utils/auth";
// 拖拽排序组件
import draggable from "vuedraggable";
import { ElUploadInternalFileDetail } from "element-ui/types/upload.d";
import { download } from "./lib";

export interface valueType {
  uid: number;
  url: string;
  status: string;
  name: string;
}

interface uploadViewAttrs {
  data?: valueType[] | string;
  single?: boolean;
  sizeTips?: string;
  // acceptText?: string;
  limit?: number;
  beforeUpload?: any;
  beforeRemove?: any;
  isMainGraph?: boolean;
  isAvatar?: boolean;
  accept?: string;
  acceptTips?: string;
  disabled?: boolean;
  isDownload?: boolean;
  isDelConfirm?: boolean;
}

interface uploadType extends ElUploadInternalFileDetail {
  response: { code: number; data: { src: string } };
}

@Component({
  name: "UploadView",
  components: {
    draggable,
  },
})
export default class ComponentName extends Vue {
  isShowDialog = false;
  nowImg?: string = "";
  isPosting = false;
  isUpload = false;
  suffixType = [
    {
      type: ".pdf",
      icon: "pdf",
    },
    {
      type: ".docx",
      icon: "word",
    },
    {
      type: ".doc",
      icon: "word",
    },
    {
      type: ".xlsx",
      icon: "excel",
    },
    {
      type: ".xls",
      icon: "excel",
    },
  ];
  @Prop({
    type: [Array, String],
    default() {
      return [];
    },
  })
  readonly value!: valueType[] | string;

  get item() {
    return this.$attrs;
  }

  created() {}

  render(h: CreateElement) {
    /**
     * item字段解析
     * @param {*} data // 当前数据
     * @param {*} single // 是否只能选择单个
     * @param {*} sizeTips // 上传图片提示
     * @param {*} limit // 最大允许上传个数
     * @param {*} beforeUpload // 上传文件之前的钩子
     * @param {*} beforeRemove // 删除文件之前的钩子
     * @param {*} isMainGraph // 是否设置主图
     * @param {*} nowImg // 当前预览图片，非传字段
     * @param {*} isUpload // 单图是否上传中，非传字段
     * @param {*} accept // 上传的图片类型
     * @param {*} isDownload // 是否允许下载
     */
    const item: uploadViewAttrs = this.item;
    var {
      data = this.value,
      single,
      sizeTips,
      // acceptText,
      limit,
      beforeUpload,
      beforeRemove,
      isMainGraph,
      accept,
      isAvatar,
      acceptTips,
      disabled,
      isDownload = true,
      isDelConfirm = false,
    } = item;
    var imgUrl;

    // 图片预览弹框
    const previewImg =
      this.isShowDialog &&
      h("el-image-viewer", {
        attrs: {
          urlList: [this.nowImg],
          onClose: () => {
            this.isShowDialog = false;
          },
        },
      });
    // 删除图片
    const delIcon = (x: valueType) => {
      return h(
        "span",
        {
          class: "el-upload-list__item-preview el-upload-list-del",
          attrs: { title: "删除图片" },
          on: {
            // 删除图片事件
            click: () => {
              if (!data || typeof data === "string") return;
              // 获取到当前图片
              const index = data.findIndex(y => {
                return y.url === x.url;
              });
              // 删除当前图片
              if (index !== -1) {
                if (isDelConfirm) {
                  this.$emit("remove", data[index]);
                } else {
                  data.splice(index, 1);
                }
              }
            },
          },
        },
        [h("i", { class: "el-icon-delete" })],
      );
    };
    // 加载中样式
    const loadIcon = (text: string, attr = {}) => {
      return h("div", { class: "loading-view", ...attr }, [h("i", { class: "el-icon-loading" }), h("span", text)]);
    };
    // 当前图片样式
    const nowImgView = (src: string, icon?: string) => {
      if (icon) {
        return h("SvgIcon", {
          attrs: {
            icon,
          },
        });
      }
      return h("el-image", { class: "upload-img-view", attrs: { fit: "cover", src } }, [
        loadIcon("加载中...", { slot: "placeholder" }),
      ]);
    };
    // 单图样式
    const singleImgView = () => {
      return h("div", { class: "single-img-mode" }, [
        h("el-image", { class: "upload-img-view", attrs: { fit: "cover", src: data } }, [
          loadIcon("加载中...", { slot: "placeholder" }),
        ]),
        // hover显示内容
        h("div", { class: "single-img-hover" }, [
          // 更换图片
          h(
            "span",
            {
              class: "el-upload-list__item-preview",
              attrs: { title: "更换图片" },
            },
            [h("i", { class: "el-icon-refresh-right" })],
          ),
          // 预览图片
          typeof data === "string" &&
            data.indexOf(".pdf") === -1 &&
            h(
              "span",
              {
                class: "el-upload-list__item-preview",
                attrs: { title: "预览图片" },
                on: {
                  click: (e: Event) => {
                    if (typeof data === "string") {
                      // 预览图片事件
                      this.isShowDialog = true;
                      // 更新
                      this.nowImg = data;
                      e.stopPropagation();
                    }
                  },
                },
              },
              [h("i", { class: "el-icon-zoom-in" })],
            ),
          // 删除图片
          h(
            "span",
            {
              class: "el-upload-list__item-preview",
              attrs: { title: "预览图片" },
              on: {
                // 删除图片事件
                click: (e: Event) => {
                  this.isPosting = true;
                  Vue.set(item, "data", "");
                  this.isPosting = false;
                  e.stopPropagation();
                  this.$emit("input", this.item.data);
                },
              },
            },
            [h("i", { class: "el-icon-delete" })],
          ),
        ]),
      ]);
    };
    // 单图处理
    if ((typeof data === "string" && data && single) || (Array.isArray(data) && data.length === 1 && single)) {
      // 单图且有数据显示图片
      if (!this.isUpload) {
        imgUrl = [singleImgView()];
      } else {
        imgUrl = [loadIcon("上传中...")];
      }
    } else {
      // 默认上传样式
      imgUrl = h("div", { class: "add-view" }, [
        h("i", { class: "el-icon-plus" }),
        sizeTips && h("p", { class: "size-tips" }, sizeTips),
      ]);
    }
    return [
      h("div", { class: "upload-wrap" }, [
        h(
          "div",
          {
            class: "img-upload",
          },
          [
            // 上传组件
            h(
              "el-upload",
              {
                class: `upload-view ${isAvatar ? "avatar-upload" : ""}`,
                props: {
                  accept: accept || "image/*",
                  action: common.imgApi,
                  disabled,
                  limit: limit,
                  multiple: !single,
                  headers: {
                    token: getToken(),
                  },
                  listType: "picture-card",
                  showFileList: false,
                  ...(single ? {} : { fileList: data }),
                  onSuccess: (response: any, file: uploadType, fileList: uploadType[]) => {
                    if (single) {
                      if (response.code !== 200) {
                        this.$message(response.msg || "上传失败，请重试");
                        this.isUpload = false;
                        Vue.set(item, "data", "");
                        return;
                      }
                      // 单图
                      Vue.set(item, "data", response.data.src);
                      this.isUpload = false;
                      this.$emit("uploadAccountImg");
                      this.$emit("input", this.item.data);
                    } else {
                      // 多图
                      fileList.forEach(item => {
                        // 判断是否上传完成
                        if (item.response) {
                          item.url = item.response.data.src || "";
                          // 判断是否上传失败
                          if (item.response.code !== 200) {
                            item.status = "fail";
                          }
                        }
                      });
                      // 双向绑定样式
                      Vue.set(
                        item,
                        "data",
                        fileList.map(({ uid, url, status, name, raw }) => {
                          return {
                            uid,
                            url,
                            status,
                            name: name || raw?.name,
                          };
                        }),
                      );

                      this.$emit("input", this.item.data);
                      this.isUpload = false;
                    }
                    this.$emit("success", file);
                  },
                  onChange: (file: uploadType, fileList: uploadType[]) => {
                    if (!single) {
                      Vue.set(
                        item,
                        "data",
                        fileList.map(({ uid, url, status, raw, name }) => {
                          return {
                            uid,
                            url,
                            status,
                            name: name || raw?.name,
                          };
                        }),
                      );
                    } else {
                      if (!file.response) {
                        Vue.set(item, "data", file.url);
                        this.isUpload = true;
                      }
                    }
                    this.$emit("input", this.item.data);
                  },
                  beforeUpload: () => {
                    this.isUpload = true;
                    beforeUpload && beforeUpload();
                  },
                  beforeRemove: () => {
                    beforeRemove && beforeRemove();
                  },
                  onExceed: () => {
                    this.$message("上传失败，您已经超出" + limit + "张图片");
                  },
                },
              },
              [imgUrl],
            ),
            // 多图列表内容
            !single &&
              data &&
              typeof data !== "string" &&
              h(
                "draggable",
                {
                  class: "img-list-view el-upload-list el-upload-list--picture-card",
                  attrs: {
                    value: data,
                  },
                  on: {
                    input: (val: valueType[]) => {
                      Vue.set(item, "data", val);
                      this.$emit("input", this.item.data);
                    },
                  },
                },
                data.map(x => {
                  const { url: src, name } = x;
                  const fileName = name || src || "";
                  const item = this.suffixType.find(x => {
                    return fileName.indexOf(x.type) !== -1;
                  });

                  return h(
                    "div",
                    {
                      class: "el-upload-list__item",
                    },
                    [
                      h("div", { class: "file-list-view" }, [
                        // 当前图片
                        x.status !== "fail" && [nowImgView(x.url || "", item?.icon)],
                        // hover显示内容

                        h("span", { class: "el-upload-list__item-actions" }, [
                          // 预览图片
                          (!item || item.icon === "pdf") &&
                            h(
                              "span",
                              {
                                class: "el-upload-list__item-preview",
                                attrs: { title: "预览" },
                                on: {
                                  click: () => {
                                    if (item?.icon === "pdf") {
                                      window.open(x.url);
                                      return;
                                    }
                                    // 预览图片事件
                                    this.isShowDialog = true;
                                    // 更新
                                    this.nowImg = x.url;
                                  },
                                },
                              },
                              [h("i", { class: "el-icon-view" })],
                            ),
                          // 下载
                          isDownload &&
                            h(
                              "span",
                              {
                                class: "el-upload-list__item-preview",
                                attrs: { title: "下载" },
                                on: {
                                  click: () => {
                                    download(x.url || "", x.name || "未命名");
                                  },
                                },
                              },
                              [h("i", { class: "el-icon-download" })],
                            ),
                          disabled || delIcon(x),
                        ]),
                        // 主图元素
                        isMainGraph &&
                          !single &&
                          h(
                            "span",
                            {
                              class: "main-graph",
                              on: {
                                click: () => {
                                  if (data && typeof data !== "string" && !(data[0].url === x.url)) {
                                    // 获取到当前图片
                                    const index = data.findIndex(y => {
                                      return y.url === x.url;
                                    });
                                    // 当前图片arr
                                    const nowItem = data[index];
                                    // 删除当前图片
                                    index !== -1 && data.splice(index, 1);
                                    // 往前插入
                                    data.unshift(nowItem);
                                  }
                                },
                              },
                            },
                            data && typeof data !== "string" && data[0].url === x.url ? "主图" : "设为主图",
                          ),
                        // 上传中loading
                        x.status === "uploading" && loadIcon("上传中..."),
                        // 上传失败样式
                        x.status === "fail" &&
                          h("div", { class: "loading-view" }, [
                            h("span", "上传失败"),
                            // 删除图片
                            delIcon(x),
                          ]),
                      ]),
                    ],
                  );
                }),
              ),
            [previewImg],
          ],
        ),
        acceptTips && h("div", { class: "accept-text" }, "支持扩展名：" + acceptTips),
        // accept && h("div", acceptText || "支持扩展名：" + accept),
      ]),
    ];
  }
}
</script>

<style lang="scss" scoped>
.img-upload {
  display: flex;
  position: relative;
  .upload-view {
    width: 156px;
    &.avatar-upload {
      /deep/.el-upload {
        height: 100px;
        width: 100px;
        flex: 0 0 100px;
        line-height: 100px;
        .add-view {
          height: 100px;
        }
      }
    }
  }
  .img-list-view {
    flex: 1;
  }
  /deep/.el-upload {
    display: block;
    order: -1;
    margin-right: 8px;
    overflow: hidden;
    flex: 0 0 148px;
    height: 148px;
    position: relative;
    margin-bottom: 5px;
  }
  .avatar {
    width: 148px;
    height: 148px;
    display: block;
    position: absolute;
    z-index: 99;
    border-radius: 6px;
  }
  .add-view {
    height: 148px;
    line-height: 1.5;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    .size-tips {
      color: #999;
    }
  }
  .loading-view {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    flex-direction: column;
    z-index: 9;
    > i {
      font-size: 30px;
      color: #fff;
    }
    > span {
      line-height: 1.5;
    }
  }

  .upload-img-view {
    width: 100%;
    height: 100%;
  }

  .single-img-mode {
    width: 100%;
    height: 100%;

    .single-img-hover {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      cursor: default;
      text-align: center;
      color: #fff;
      opacity: 0;
      font-size: 20px;
      background-color: rgba(0, 0, 0, 0.5);
      transition: opacity 0.3s;
      > span {
        display: inline-block;
        cursor: pointer;
        margin: 0 5px;
        i {
          font-size: 20px;
          color: #fff;
        }
      }
      .del-icon {
        position: absolute;
        right: 0;
        top: 5px;
        width: 20px;
        height: 20px;
        display: block;
        margin-left: 0;
        i {
          opacity: 1;
          font-size: 20px;
          display: block;
          color: #fff;
          left: 0;
          right: 0;
          top: 0;
          position: relative;
        }
      }
    }

    &:hover {
      .single-img-hover {
        opacity: 1;
      }
    }
  }

  /deep/ .el-upload-list__item {
    margin-bottom: 5px;
    vertical-align: middle;
    border: 0;
    .file-list-view {
      width: 100%;
      height: 100%;
      object-fit: cover;

      > .svg-icon {
        width: 100%;
        height: 100%;
      }

      &:hover {
        .main-graph {
          opacity: 1;
        }
      }
      .main-graph {
        position: absolute;
        width: 100%;
        height: 20%;
        left: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.3s;
        color: #fff;
        opacity: 0;
        cursor: pointer;
      }
      .del-icon {
        position: absolute;
        right: 5px;
        top: 5px;
        width: 20px;
        height: 20px;
        display: block;
        margin-left: 0;
        i {
          opacity: 1;
          font-size: 20px;
          display: block;
          color: #fff;
          left: 0;
          right: 0;
          top: 0;
          position: relative;
        }
      }
    }
    &:first-of-type {
      .el-upload-list__item-left {
        display: none;
      }
      .file-list-view {
        .main-graph {
          opacity: 1;
          cursor: default;
        }
      }
    }
    &:last-of-type {
      .el-upload-list__item-right {
        display: none;
      }
    }
  }
}
</style>
