<template>
  <div class="add-admin">
    <!-- 添加管理员 -->
    <TitleView :isBack="true" />
    <div class="content-wrap">
      <FormView ref="formView" v-model="formList" label-width="100px" itemContentWidth="400px" labelPosition="right" />
    </div>
    <div class="bottom-btn">
      <el-button @click="$router.go(-1)"> 取消 </el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit"> 保存 </el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch } from "vue-property-decorator";
import { mixins } from "vue-class-component";
import formFormat from "@/mixin/formFormat";
import { Form } from "element-ui";
import { getUserInfo, saveUser, updateUser } from "@api/setting/adminList";
import { isMobile } from "@utils/validate";
import { validatePassWord } from "@utils/formValidate";
import { getRoleList } from "@api/setting/roleList";
interface formDataType {
  avatar?: string; // 用户头像
  id?: number; // id
  mobile?: string; // 联系电话
  password?: string; // 用户密码
  roleId?: number; // 角色ID
  status?: number; // 状态 2 禁用 1 正常
  userName?: string; // 用户名
}
@Component
export default class AddAdmin extends mixins(formFormat) {
  id: any = 0;
  isLoading = false;
  formList: any[] = [
    {
      label: "头像:",
      prop: "avatar",
      data: "",
      type: "upload",
      accept: ".jpg,.png,.jpeg,.pdf",
      single: true,
    },
    {
      label: "账号:",
      data: "",
      prop: "userName",
      required: true,
      rule: [
        {
          pattern: /^[a-zA-Z0-9]+$/,
          message: "请输入正确的账号！",
          trigger: ["blur", "change"],
        },
      ],
    },
    {
      label: "密码:",
      data: "",
      prop: "password",
      inputType: "password",
      required: true,
      rule: [
        {
          validator: validatePassWord,
          message: "请输入正确的密码！",
          trigger: "blur",
        },
      ],
    },
    {
      label: "联系电话:",
      data: "",
      prop: "mobile",
    },
    {
      label: "启用状态:",
      data: 1,
      prop: "status",
      type: "switch",
      activeText: "启用",
      inactiveText: "停用",
    },
    {
      label: "分配角色:",
      data: "",
      required: true,
      prop: "roleId",
      type: "select",
      options: [],
    },
  ];
  submitLoading = false;

  // --------------------------- methods -----------------------------
  created() {
    this.init();
    this.getRoleList();
  }
  activated() {
    this.init();
  }
  @Watch("id")
  watchOrderId() {
    if (this.$route.meta.name === "编辑管理员") {
      this.formDataMap.password.required = false;
    } else {
      this.formDataMap.password.required = true;
    }
  }
  /**
   * @description: 提交
   * @param {*} isContinue
   * @return {*}
   */
  handleSubmit() {
    const formEle = this.$refs.formView as any;
    (formEle.$refs.form as Form).validate(async valid => {
      if (valid) {
        this.submitLoading = true;
        const formData = formEle.normalExtractData(formEle.value);
        // 验证手机号码
        if (formData.mobile && !isMobile(formData.mobile)) {
          this.$message("请填写正确联系电话");
          return;
        }
        // 拿到所有表单数据
        const json = {
          ...formData,
          id: this.id,
        };
        try {
          this.id ? await updateUser(json) : await saveUser(json);
          this.$message.success(this.id ? "编辑成功" : "添加成功");
          this.submitLoading = false;
          this.$router.go(-1);
        } catch (error) {
          this.submitLoading = false;
        }
      }
    });
  }
  init() {
    const { id } = this.$route.query;
    const isReGet = id && Number(id) !== this.id;
    const isReInit = !id;
    this.id = Number(id);
    this.id ? (this.$route.meta.name = "编辑管理员") : (this.$route.meta.name = "添加管理员");
    isReGet && this.getUserInfo();
    isReInit && this.handleInitData();
  }
  // 获取详情
  async getUserInfo() {
    this.isLoading = true;
    const { data } = await getUserInfo({ id: this.id });
    // 数据处理
    this.formList.forEach(x => {
      if (typeof x.prop === "string") {
        if (x.entryHanlder) {
          this.formDataMap[x.prop].data = x.entryHanlder(data);
          return;
        }
        this.formDataMap[x.prop].data = data[x.prop as keyof formDataType];
      }
    });
    this.isLoading = false;
  }
  // 初始化
  handleInitData() {
    this.id &&
      this.$router.replace({
        query: {},
      });
    this.id = 0;
    const initData: formDataType = {
      avatar: "",
      // id: 0,
      mobile: "",
      password: "",
      roleId: 0,
      status: 1,
      userName: "",
    };
    // 清除表单内容
    (Object.keys(initData) as (keyof formDataType)[]).forEach(key => {
      this.formDataMap[key].data = initData[key];
    });

    // 清除表单验证
    const formEle = this.$refs.formView as any;
    (formEle?.$refs.form as Form).resetFields();
  }
  // 获取角色列表
  async getRoleList() {
    const {
      data: { list: data },
    } = await getRoleList();
    const index = this.formList.findIndex(x => {
      return x.prop === "roleId";
    });
    this.formList[index].options = data.map((x: any) => {
      const value = x.id;
      const label = x.name;
      return { value, label };
    });
  }
}
</script>

<style lang="scss" scoped>
.add-admin {
  height: 100%;
  overflow: auto;
  .content-wrap {
    overflow: auto;
    height: calc(100% - 130px);
  }
  .bottom-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    bottom: 0;
    width: 100%;
    padding: 10px 20px;
    box-sizing: border-box;
    border-top: 1px solid #ddd;
  }
  /deep/.el-form {
    .el-form-item {
      .upload-wrap {
        .upload-view {
          width: 86px;
          .el-upload {
            width: 86px;
            height: 86px;
            border-radius: 50%;
            .add-view {
              height: 86px;
            }
            .single-img-mode {
              .single-img-hover {
                .el-upload-list__item-preview:nth-of-type(1) {
                  position: absolute;
                  top: -30px;
                  left: 0;
                }
                .el-upload-list__item-preview:nth-of-type(2) {
                  position: absolute;
                  top: -30px;
                  left: 27px;
                }
                .el-upload-list__item-preview:nth-of-type(3) {
                  position: absolute;
                  top: -30px;
                  right: 0;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
