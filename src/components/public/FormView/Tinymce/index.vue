<template>
  <div
    v-loading="!hasInit"
    :class="{ fullscreen: fullscreen }"
    class="tinymce-container"
    :style="{ width: containerWidth }"
  >
    <textarea :id="tinymceId" class="tinymce-textarea" />
    <!-- <div class="editor-custom-btn-container"> -->
    <editorImage
      :visible.sync="dialogVisible"
      color="#1347f2"
      class="editor-upload-btn"
      @successCBK="imageSuccessCBK"
    />
    <!-- </div> -->
  </div>
</template>

<script>
/**
 * docs:
 * https://panjiachen.github.io/vue-element-admin-site/feature/component/rich-editor.html#tinymce
 */
import editorImage from "./components/EditorImage";
import plugins from "./plugins";
import toolbar from "./toolbar";
import load from "./dynamicLoadScript";

// why use this cdn, detail see https://github.com/PanJiaChen/tinymce-all-in-one
const tinymceCDN = "./static/tinymce/tinymce.min.js";

export default {
  name: "Tinymce",
  components: { editorImage },
  props: {
    id: {
      type: String,
      default: function () {
        return "vue-tinymce-" + +new Date() + ((Math.random() * 1000).toFixed(0) + "");
      },
    },
    value: {
      type: String,
      default: "",
    },
    toolbar: {
      type: Array,
      required: false,
      default() {
        return [];
      },
    },
    menubar: {
      type: String,
      default: "file edit insert view format table",
    },
    langIcon: {
      type: String,
      default: "langIcon",
    },
    height: {
      type: [Number, String],
      required: false,
      default: 360,
    },
    width: {
      type: [Number, String],
      required: false,
      default: "auto",
    },
  },
  data() {
    return {
      dialogVisible: false,
      hasChange: false,
      hasInit: false,
      tinymceId: this.id,
      fullscreen: false,
      isUpdate: false,
      languageTypeList: {
        en: "en",
        zh: "zh_CN",
        es: "es_MX",
        ja: "ja",
      },
    };
  },
  computed: {
    containerWidth() {
      const width = this.width;
      if (/^[\d]+(\.[\d]+)?$/.test(width)) {
        // matches `100`, `'100'`
        return `${width}px`;
      }
      return width;
    },
  },
  watch: {
    value(val, oldVal) {
      if (!this.hasChange && this.hasInit) {
        window.tinymce && window.tinymce.get(this.tinymceId).setContent(val || "");
        // val && !oldVal && (this.isUpdate = true);
      }
    },
    langIcon() {
      if (this.hasChange) {
        window.tinymce && window.tinymce.get(this.tinymceId).setContent(this.value || "");
        this.hasChange = false;
      }
    },
  },
  mounted() {
    this.init();
  },
  activated() {
    if (window.tinymce) {
      this.initTinymce();
    }
  },
  deactivated() {
    this.destroyTinymce();
  },
  destroyed() {
    this.destroyTinymce();
  },
  methods: {
    init() {
      // dynamic load tinymce from cdn
      load(tinymceCDN, err => {
        if (err) {
          this.$message.error(err.message);
          return;
        }
        this.initTinymce();
      });
    },
    initTinymce() {
      const _this = this;
      window.tinymce.init({
        selector: `#${this.tinymceId}`,
        // language: this.languageTypeList["en"],
        // language: this.languageTypeList["zh"],
        // language_url: require("./zh_CN.js"),
        height: this.height,
        body_class: "panel-body ",
        object_resizing: false,
        toolbar: this.toolbar.length > 0 ? this.toolbar : toolbar,
        // 添加下行
        fontsize_formats: "12px 14px 18px 24px 36px",
        // 删除原本的menubar，替换为下行
        menubar: false,
        statusbar: false,
        plugins: plugins,
        end_container_on_empty_block: true,
        powerpaste_word_import: "clean",
        code_dialog_height: 450,
        code_dialog_width: 1000,
        content_style: "p {margin: 5px 0;}",
        advlist_bullet_styles: "square",
        advlist_number_styles: "default",
        imagetools_cors_hosts: ["www.tinymce.com", "codepen.io"],
        default_link_target: "_blank",
        link_title: false,
        nonbreaking_force_tab: true, // inserting nonbreaking space &nbsp; need Nonbreaking Space Plugin
        fontFamily: "微软雅黑",
        branding: false,
        font_formats:
          "微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;宋体=simsun,serif;仿宋体=FangSong,serif;黑体=SimHei,sans-serif;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;",
        init_instance_callback: editor => {
          if (_this.value) {
            editor.setContent(_this.value);
          }
          _this.hasInit = true;
          editor.on("KeyUp NodeChange", () => {
            this.hasChange = editor.getContent();
            this.$emit("input", editor.getContent());
          });
        },
        setup(editor) {
          editor.on("FullscreenStateChanged", e => {
            _this.fullscreen = e.state;
          });
          editor.on("init", function (e) {
            this.getBody().style.fontSize = "14px";
            this.getBody().style.fontFamily = "Microsoft YaHei";
          });

          editor.addButton("diyImage", {
            title: "上传图片",
            image: require("./assets/image.png"),
            onclick: function () {
              _this.dialogVisible = true;
              // Add you own code to execute something on click
            },
          });
        },
      });
      require("./zh_CN.js");
    },
    destroyTinymce() {
      const tinymce = window.tinymce.get(this.tinymceId);
      if (this.fullscreen) {
        tinymce.execCommand("mceFullScreen");
      }

      if (tinymce) {
        tinymce.destroy();
      }
    },
    setContent(value) {
      window.tinymce.get(this.tinymceId).setContent(value);
    },
    getContent() {
      window.tinymce.get(this.tinymceId).getContent();
    },
    imageSuccessCBK(arr) {
      const _this = this;
      arr.forEach(v => {
        window.tinymce.get(_this.tinymceId).insertContent(`<img class="wscnph" src="${v}" >`);
      });
    },
    flushTinymceData() {
      window.tinymce.get(this.tinymceId).setContent(this.value || "");
    },
  },
};
</script>

<style lang="scss" scoped>
.tinymce-container {
  position: relative;
  line-height: normal;
}
.tinymce-container >>> .mce-fullscreen {
  z-index: 10000;
}
.tinymce-textarea {
  visibility: hidden;
  z-index: -1;
}
.editor-custom-btn-container {
  position: absolute;
  right: 4px;
  top: 4px;
  /*z-index: 2005;*/
}
.fullscreen .editor-custom-btn-container {
  z-index: 10000;
  position: fixed;
}
.editor-upload-btn {
  display: inline-block;
}
/deep/.mce-top-part::before {
  box-shadow: none !important;
}
.tinymce-container {
  /deep/.mce-tinymce {
    border-radius: 4px;
    overflow: hidden;
  }

  /deep/.mce-panel {
    border-color: #e4eaff !important;
    box-shadow: none !important;
  }
}
/deep/.mce-btn button {
  padding: 2px 4px;
  border-radius: 4px;
}
</style>
