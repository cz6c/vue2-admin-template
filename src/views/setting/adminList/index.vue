<template>
  <div class="admin-list">
    <!-- 管理员列表 -->
    <title-view btnText="添加管理员" to="/setting/addAdmin" />
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
import { getUserList, delUser, userChangeStatus } from "@api/setting/adminList";
import { ChangeParams } from "@utils/public.d";

@Component({
  components: {},
  name: "AdminList",
})
export default class AdminList extends Vue {
  isLoading = false;
  tableData: any[] = [];
  titleList = [
    {
      label: "账号",
      avatar: "avatar",
      userName: "userName",
      prop: "userName",
      type: "userInfo",
      imageWidth: "23px",
      imageHeight: "23px",
    },
    {
      label: "角色",
      prop: "roleName",
    },
    {
      label: "电话",
      prop: "mobile",
      width: 120,
    },
    {
      label: "创建时间",
      prop: "createTime",
      type: "timeStamp",
      width: 160,
    },
    {
      label: "最后登录时间",
      prop: "lastLoginTime",
      type: "timeStamp",
      width: 160,
    },
    {
      label: "启用状态",
      prop: "status",
      type: "switch",
      activeText: "启用",
      inactiveText: "停用",
      switchHandle: this.switchHandle,
    },
  ];
  tableSelectLayout = [
    {
      prop: "keywords",
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
    } = await getUserList(this.listQuery);
    this.tableData = list || [];
    this.listQuery.count = count || 0;
    this.isLoading = false;
  }
  // 管理员详情
  handleLinkEditUser(id: number) {
    this.$router.push(`/setting/addAdmin?id=${id}`);
  }
  // 删除
  handleAddRecycle(id: number) {
    this.$confirm("是否删除这个管理员?", "提示", {
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
        await delUser([id]);
        await this.getTableData();
        this.$message.success("删除成功");
      } finally {
        loading.close();
      }
    });
  }
  // 开关
  async switchHandle(value: 1 | 2, { id }: any) {
    const parmas: ChangeParams = {
      id: [id],
      field: "status",
      value: [value],
    };
    await userChangeStatus(parmas);
    this.$message.success("启用状态切换成功");
    this.getTableData();
  }
}
</script>

<style scoped lang="scss">
.admin-list {
  height: 100%;
  .table-wrapper {
    padding: 0;
    height: calc(100% - 172px);
  }
}
</style>
