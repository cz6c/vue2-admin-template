<template>
  <div class="role-list">
    <!-- 角色列表 -->
    <title-view btnText="添加角色" to="/setting/addRole" />
    <TableScreen :data="tableSelectLayout" @search="handleTableSearch" />
    <div class="table-wrapper">
      <TableView
        ref="tableView"
        :is-loading="isLoading"
        :column="titleList"
        :data="tableData"
        indexColum
        :handleFixed="false"
        :handleWidth="160"
        tableHeight="100%"
        :highlight-current-row="true"
        :isSelection="false"
      >
        <template v-slot:default="{ props }">
          <div>
            <el-button type="primary" size="small" @click="handleLinkEditUser(props.id)"> 编辑 </el-button>
            <el-button type="danger" size="small" @click="handleAddRecycle(props.id)">删除</el-button>
          </div>
        </template>
      </TableView>
      <Pagination
        :total="listQuery.count"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        @pagination="getTableData"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { getRoleList, delRole, roleChangeStatus } from "@api/setting/roleList";
import { ChangeParams } from "@utils/public.d";
@Component({
  components: {},
  name: "RoleList",
})
export default class RoleList extends Vue {
  isLoading = false;
  tableData: any[] = [];
  titleList = [
    {
      label: "角色名称",
      prop: "name",
    },
    {
      label: "角色描述",
      prop: "description",
    },
    {
      label: "启用状态",
      prop: "status",
      type: "switch",
      switchHandle: this.switchHandle,
      activeText: "启用",
      inactiveText: "停用",
    },
  ];
  tableSelectLayout = [
    {
      prop: "name",
      placeholder: "用户名",
    },
  ];
  listQuery = {
    page: 1,
    limit: 30,
    count: 0,
  };
  // --------------------------- methods -----------------------------

  created() {
    this.getTableData();
  }
  activated() {
    this.getTableData();
  }
  handleTableSearch(value: any) {
    this.listQuery.page = 1;
    this.listQuery = { ...this.listQuery, ...value };
    this.getTableData();
  }
  // 获取列表
  async getTableData() {
    this.isLoading = true;
    const {
      data: { list, count },
    } = await getRoleList(this.listQuery);
    this.tableData = list || [];
    this.listQuery.count = count || 0;
    this.isLoading = false;
  }
  // 角色详情
  handleLinkEditUser(id: number) {
    this.$router.push(`/setting/adminManage/roleList/addRole?id=${id}`);
  }
  // 删除
  handleAddRecycle(id: number) {
    this.$confirm("是否删除这个角色?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }).then(async () => {
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      try {
        await delRole([id]);
        await this.getTableData();
        this.$message.success("删除成功");
      } finally {
        loading.close();
      }
    });
  }
  // 开关
  async switchHandle(value: 1 | 2, { id }: any) {
    console.log("开关", value, id);

    const parmas: ChangeParams = {
      id: [id],
      field: "status",
      value: [value],
    };
    await roleChangeStatus(parmas);
    this.$message.success("启用状态切换成功");
    this.getTableData();
  }
}
</script>

<style scoped lang="scss">
.role-list {
  height: 100%;
  .table-wrapper {
    padding: 0;
    height: calc(100% - 172px);
  }
}
</style>
