<template>
  <div class="login">
    <div class="right-wrapper">
      <div class="content-wrapper">
        <div class="title-wrapper">
          <h1 class="title" @click="isShowWx = false">
            <i v-if="isShowWx" class="el-icon-arrow-left"></i>
            登录
          </h1>
          <p class="description">{{ defaultSettings.title }}</p>
        </div>
        <div v-show="!isShowWx">
          <el-form ref="FormEle" :rules="rules" label-position="top" :model="loginForm" label-width="80px">
            <el-form-item label="账号" prop="userName">
              <el-input v-model="loginForm.userName" tabindex="2" placeholder="请输入账号"></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <template #label>
                <span>密码</span>
              </template>
              <el-input v-model="loginForm.password" tabindex="3" type="password" placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-form-item label="验证码" prop="code">
              <el-input
                ref="code"
                v-model="loginForm.code"
                tabindex="4"
                placeholder="验证码"
                name="code"
                type="text"
                autocomplete="on"
                @keyup.enter.native="handleLogin"
              />
              <el-image
                :key="codeKey"
                :src="`${defaultSettings.baseURL}/adminapi/code?uuid=${codeKey}`"
                class="code-view"
                @click.native="flushCode"
              >
                <div slot="error" class="el-image__error">点击刷新</div>
              </el-image>
            </el-form-item>
          </el-form>
          <el-button type="primary" class="large-btn login-btn" :loading="loading" tabindex="5" @click="handleLogin"
            >登 录</el-button
          >
          <el-alert
            v-if="isLoginTimeOut"
            title="由于登录时间超时，您已被注销登录！"
            type="warning"
            show-icon
            :closable="false"
            class="login-timeout"
          >
          </el-alert>
        </div>
      </div>
      <div class="version-tips">版权信息 | 深圳市小草互联网科技有限公司</div>
    </div>
  </div>
</template>

<script lang="ts">
const defaultSettings = require("@/settings");
import { AuthModule } from "@/store/modules/auth";
import { Component, Vue, Watch, Ref } from "vue-property-decorator";
import { Route } from "vue-router";
import { Form } from "element-ui";
Component.registerHooks(["beforeRouteEnter"]);
@Component({
  name: "Login",
})
export default class Login extends Vue {
  isShowWx = false;
  loginForm = {
    code: "",
    password: "",
    userName: "",
  };
  rules = {
    code: [{ required: true, message: "请输入验证码", trigger: "blur" }],
    password: [{ required: true, message: "请输入密码", trigger: "blur" }],
    userName: [{ required: true, message: "请输入账号", trigger: "blur" }],
  };
  // -------- 验证码重新渲染，防止暴力破解
  defaultSettings = defaultSettings;
  loading = false;
  redirect = "";
  codeKey = +new Date();
  @Watch("name")
  getWatchValue(newVal: string, oldVal: string) {
    console.log(newVal, oldVal);
  }
  @Ref("FormEle")
  FormEle!: Form;

  @Watch("$route", { immediate: true })
  onPersonChanged1(route: Route) {
    const query = route.query;
    if (query.redirect) {
      this.redirect = String(query.redirect);
    }
  }
  get isLoginTimeOut() {
    return AuthModule.isLoginTimeOut;
  }

  /**
   * @description: 刷新验证码
   * @param {*}
   * @return {*}
   */
  flushCode() {
    this.codeKey = +new Date();
  }
  /**
   * @description: 登录
   * @param {*}
   * @return {*}
   */
  handleLogin() {
    this.FormEle.validate(async valid => {
      if (valid) {
        try {
          this.loading = true;
          await AuthModule.login(this.loginForm);
          this.$router.push({
            path: this.redirect || "/",
          });
          this.loading = false;
        } catch (error) {
          this.flushCode();
          this.loading = false;
        }
      }
    });
  }
  forgetPwd() {
    this.$alert("请联系管理员 15512345678，找回登录密码", "忘记密码", {
      type: "warning",
      confirmButtonText: "知道了",
    });
  }
  beforeRouteEnter(to: Route, from: Route, next: any) {
    console.log(to);

    next(() => {
      // vm.id = to.query.id;
      // vm.type = to.query.type;
    });
  }
}
</script>

<style scoped lang="scss">
.login {
  display: flex;
  height: 100%;
  div.left-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 361px;
    background: rgba(19, 194, 194, 0.1);
    img.background {
      width: 281px;
    }
    .logo {
      position: absolute;
      left: 40px;
      top: 24px;
      width: 126px;
    }
  }
  .right-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    .content-wrapper {
      margin-top: -48px;
      width: 437px;
      .title-wrapper {
        display: flex;
        align-items: baseline;

        .title {
          font-size: 32px;
          font-weight: bold;
          color: #333333;
          line-height: 45px;
          position: relative;
          i {
            position: absolute;
            left: -32px;
            top: 8px;
            cursor: pointer;
          }
        }
        .description {
          margin-left: 16px;
          font-size: 16px;
          font-weight: 400;
          color: #999999;
          line-height: 22px;
        }
      }
      /deep/.el-form {
        margin: 40px 0;
        margin-top: 10px;
        .el-form-item {
          position: relative;
          margin-bottom: 24px;
          .el-form-item__label {
            width: 56px;
            height: 32px;
            line-height: 32px !important;
            text-align: justify;
            vertical-align: top;
            color: #333333;
            padding-bottom: 8px;
            line-height: 1;
            &::after {
              display: inline-block;
              width: 100%;
              content: "";
              height: 0;
            }
            &::before {
              display: none;
            }
            .forget-password {
              position: absolute;
              right: 0;
              color: #999999;
              cursor: pointer;
            }
          }
          .el-input__inner {
            height: 40px;
            line-height: 40px;
          }
          .code-view {
            position: absolute;
            right: 1px;
            top: 1px;
            height: 38px;
            width: 120px;
            cursor: pointer;
            z-index: 2;
            border-radius: 4px;
            user-select: none;
          }
        }
      }
      /deep/.large-btn {
        width: 100%;
        height: 40px;
        line-height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        &.login-btn {
          margin-bottom: 16px;
        }
        & > span {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .svg-icon {
          width: 20px;
          height: 20px;
          margin-right: 8px;
        }
      }
      .el-button + .el-button {
        margin-left: 0;
      }
      .wx-wrap {
        height: 416px;
        margin: 40px 0;
        margin-bottom: 78px;
        width: 416px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        border-radius: 4px;
        border: 1px solid #d9d9d9;
        .code-view {
          width: 300px;
          height: 310px;
          position: relative;
          iframe {
            width: 100%;
            height: 100%;
            z-index: 2;
            position: relative;
          }
          .loading-view {
            position: absolute;
            left: 0;
            top: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            width: 100%;
            height: 100%;
            z-index: 1;
          }
        }
        .tips-view {
          color: #13c2c2;
          font-size: 16px;
          margin-bottom: 10px;
        }
      }
    }
    .version-tips {
      position: absolute;
      bottom: 8px;
      font-size: 12px;
      font-weight: 400;
      color: #999999;
      line-height: 17px;
    }
  }
  .login-timeout {
    margin-top: 20px;
  }
}
</style>
