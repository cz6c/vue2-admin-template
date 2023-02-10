<template>
  <div class="add-role">
    <!-- 添加角色 -->
    <TitleView :isBack="true" />
    <div class="content-wrap">
      <FormView ref="formView" v-model="formList" label-width="100px" itemContentWidth="400px" labelPosition="right" />
      <NodeTree ref="nodeTree" :isReturnPid="true" :idsData="permissionIds" :data="permissionData" />
    </div>
    <div class="bottom-btn">
      <el-button @click="$router.go(-1)"> 取消 </el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit"> 保存 </el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import { mixins } from "vue-class-component";
import formFormat from "@/mixin/formFormat";
import { Form } from "element-ui";
import { getRoleInfo, saveRole, updateRole, getPermissionList } from "@api/setting/roleList";
interface formDataType {
  description?: string; // 角色描述
  id?: number; // id
  name?: string; // 角色名
  password?: Array<string>; // 权限节点ID信息
  status?: number; // 状态 2 未启用 1 正常
}
@Component({
  name: "AddRole",
})
export default class AddRole extends mixins(formFormat) {
  id: any = 0;
  permissionData = [];
  permissionIds: string[] = [];
  submitLoading = false;
  formList = [
    {
      label: "角色名称:",
      data: "",
      prop: "name",
      required: true,
      width: 200,
    },
    {
      label: "角色描述:",
      data: "",
      prop: "description",
      inputType: "textarea",
      props: {
        rows: 3,
        maxlength: "200",
        showWordLimit: true,
      },
    },
  ];
  isLoading = false;

  // --------------------------- methods -----------------------------
  created() {
    this.getPermissionList();
    this.init();
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
        // 拿到所有表单数据
        const json = {
          ...formData,
          permissionIds: (this.$refs.nodeTree as any).getNodeValue(),
          id: this.id,
        };
        try {
          this.id ? await updateRole(json) : await saveRole(json);
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
    this.id ? (this.$route.meta.name = "编辑角色") : (this.$route.meta.name = "添加角色");
    isReGet && this.getRoleInfo();
    isReInit && this.handleInitData();
  }
  // 获取详情
  async getRoleInfo() {
    this.isLoading = true;
    const { data } = await getRoleInfo({ id: this.id });
    this.permissionIds = data.permissionIds;
    this.getPermissionList();
    // 数据处理
    this.formList.forEach(x => {
      if (typeof x.prop === "string") {
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
    const initData: any = {
      description: "",
      name: "",
    };
    // 清除表单内容
    Object.keys(initData).forEach(key => {
      this.formDataMap[key].data = initData[key];
    });
    this.permissionIds = [];
    this.getPermissionList();
    // 清除表单验证
    const formEle = this.$refs.formView as any;
    (formEle.$refs.form as Form).resetFields();
  }
  // 获取权限
  async getPermissionList() {
    this.isLoading = true;
    const {
      data: { list: data },
    } = await getPermissionList();
    this.permissionData = data;
    this.isLoading = false;
  }
}
</script>

<style lang="scss" scoped>
.add-role {
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
}
</style>
