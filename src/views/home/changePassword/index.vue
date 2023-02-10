<template>
  <div class="change-password">
    <!-- 修改密码 -->
    <TitleView />
    <div class="content">
      <div class="form-wrap">
        <el-upload
          class="avatar-uploader"
          accept="image/*"
          :headers="headers"
          :action="common.imgApi"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
        >
          <el-image v-if="post.avatar" fit="cover" :src="post.avatar" class="avatar" />
          <el-image v-else fit="cover" class="el-icon-plus avatar-uploader-icon" src="@images/default.png" />
          <div class="tips">点击上传头像</div>
        </el-upload>
        <form-view
          v-model="formList"
          cancel-text=""
          label-position="right"
          label-width="100px"
          :isLoading="isLoading"
          submitText="保存"
          :isFixed="false"
          @submit="handleSubmit"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { common } from "@/api/public/index";
import { AuthModule } from "@/store/modules/auth";
// 获取token
import { getToken } from "@/utils/auth";
import { editAccount } from "@api/home/index";
// const defaultSettings = require("@/settings");
@Component
export default class SetPassword extends Vue {
  headers = {
    token: getToken(),
  };
  common = common;
  isLoading = false;
  confirmPwd = (rule: any, value: string, callback: any) => {
    const newPwd = this.formData.get("password");
    if (value !== newPwd) {
      callback(new Error("两次输入密码不一致!"));
    } else {
      callback();
    }
  };
  formList = [
    // 用户名
    {
      label: "用户名",
      prop: "userName",
      data: AuthModule.userName,
      disabled: true,
      rule: [
        { required: true, message: "请输入用户名", trigger: "blur" },
        {
          pattern: /^[a-zA-Z0-9]+$/,
          message: "请输入正确的用户名！",
          trigger: ["blur", "change"],
        },
      ],
    },
    // 旧密码
    {
      label: "旧密码",
      prop: "oldPassword",
      data: "",
      inputType: "password",
      rule: [
        { required: true, message: "请输入旧密码", trigger: "blur" },
        { pattern: /\S+/, message: "不允许输入空格" },
        { required: true, min: 6, message: "新密码不能少于6位", trigger: "blur" },
      ],
    },
    // 新密码
    {
      label: "新密码",
      prop: "password",
      inputType: "password",
      data: "",
      rule: [
        { required: true, trigger: "blur", message: "请输入新密码" },
        { pattern: /\S+/, message: "不允许输入空格" },
        { required: true, min: 6, message: "新密码不能少于6位", trigger: "blur" },
      ],
    },
    // 确认密码
    {
      label: "确认密码",
      prop: "confirmPassword",
      inputType: "password",
      data: "",
      placeholder: "请再次确认密码",
      rule: [
        { required: true, trigger: "blur", message: "请再次输入新密码" },
        { pattern: /\S+/, message: "不允许输入空格" },
        { required: true, min: 6, validator: this.confirmPwd, trigger: "blur" },
      ],
    },
  ];
  post = {
    id: AuthModule.id,
    avatar: AuthModule.avatar,
  };
  // get avatar() {
  //   return defaultSettings.baseURL + "/" + AuthModule.avatar;
  // }
  get formData() {
    const temp = new Map();
    this.formList.forEach(({ prop, data }) => {
      temp.set(prop, data);
    });
    return temp;
  }
  async handleSubmit() {
    const params = {
      oldPassword: this.formData.get("oldPassword"),
      password: this.formData.get("password"),
      confirmPassword: this.formData.get("confirmPassword"),
      avatar: this.post.avatar,
    };
    const password = this.formData.get("password");
    if (password && password.trim()) {
      params.password = password.trim();
    }
    try {
      this.isLoading = true;
      await editAccount(params);
      this.isLoading = false;
      this.$message.success("编辑成功，请重新登录");
      AuthModule.logout();
      this.$router.push("/login");
    } catch (error) {
      this.isLoading = false;
    }
  }
  async handleAvatarSuccess(res: any) {
    if (res.code != 200) {
      this.$message.error("上传头像失败，请重试");
      return;
    }
    await editAccount({
      avatar: res.data.src,
    });
    this.post.avatar = res.data.src;
    this.$store.commit("SET_AVATAR", res.data.src);
    this.$message.success("上传成功");
  }
}
</script>

<style scoped lang="scss">
.content {
  display: flex;
  justify-content: center;
  .form-wrap {
    padding-top: 100px;
    width: 400px;
  }
  .avatar-uploader {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 100px;
    margin-bottom: 20px;
    .avatar {
      border-radius: 75px;
      width: 80px;
      height: 80px;
    }
    .el-icon-plus {
      border-radius: 75px;
      width: 80px;
      height: 80px;
    }
    .tips {
      font-size: 12px;
      color: #ccc;
      line-height: 30px;
    }
  }
  /deep/.el-form-item:last-of-type {
    margin-top: 50px;
    .el-form-item__content {
      justify-content: center;
    }
  }
  /deep/.submit-btn {
    padding: 4px 30px;
    border-radius: 4px;
  }
}
</style>
