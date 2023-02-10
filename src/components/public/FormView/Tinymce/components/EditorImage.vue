<template>
  <div class="upload-container">
    <!-- <el-button
      :style="{ background: color, borderColor: color }"
      icon="el-icon-upload"
      size="mini"
      type="primary"
      @click="dialogVisible = true"
    >
      上传图片
    </el-button> -->
    <el-dialog :visible.sync="dialogVisible" width="812px" title="上传图片">
      <el-upload
        :multiple="true"
        :file-list="fileList"
        :show-file-list="true"
        :on-remove="handleRemove"
        :on-success="handleSuccess"
        class="editor-slide-upload"
        :action="apiUrl"
        list-type="picture-card"
        :headers="headers"
      >
        <el-button size="small" type="primary"> 点击上传图片 </el-button>
      </el-upload>
      <div class="align-center">
        <el-button @click="dialogVisible = false"> 取消 </el-button>
        <el-button type="primary" @click="handleSubmit"> 插入 </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { common } from "@/api/public";
// 获取token
import { getToken } from "@/utils/auth";
export default {
  name: "EditorSlideUpload",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: "#1890ff",
    },
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(value) {
        this.$emit("update:visible", value);
      },
    },
  },
  data() {
    return {
      fileList: [],
      imgArr: [],
      apiUrl: "",
      headers: {
        token: getToken(),
      },
    };
  },
  created() {
    this.apiUrl = common.imgApi;
  },
  methods: {
    handleSuccess({ data: src }, file, fileList) {
      this.imgArr.push(src.src);
    },
    handleRemove(file, fileList) {
      const delUrl = file.response.data.src;
      this.imgArr.map((item, i) => {
        console.log();
        if (item == delUrl) {
          this.imgArr.splice(i, 1);
        }
      });
    },
    handleSubmit() {
      this.$emit("successCBK", this.imgArr);
      this.dialogVisible = false;
      this.imgArr = [];
      this.fileList = [];
    },
  },
};
</script>

<style lang="scss" scoped>
.editor-slide-upload {
  margin-bottom: 20px;
  /deep/ .el-upload--picture-card {
    width: 100%;
  }
}
/deep/.el-upload-list__item:nth-of-type(5n) {
  margin-right: 0;
}
.align-center {
  text-align: center;
}
</style>
