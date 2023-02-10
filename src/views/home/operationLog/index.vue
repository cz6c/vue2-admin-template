<template>
  <div class="login-log">
    <!-- 操作日志 -->
    <TitleView />
    <TableView ref="tableView" v-loading="loading" :column="titleList" :data="tableData" :heightOffset="126">
    </TableView>
    <Pagination
      :total="listQuery.count"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
  </div>
</template>
<script lang="ts">
import { GetDataParams } from "@/api/home/index.d";
import { Component, Vue } from "vue-property-decorator";
import { getAdminLog } from "@api/home/index";
@Component
export default class LoginLog extends Vue {
  loading = false;
  tableData: any = [];
  titleList = [
    {
      prop: "userName",
      label: "操作账号",
    },
    {
      prop: "action",
      label: "行为",
    },
    {
      prop: "content",
      label: "日志内容",
      width: "600",
    },
    {
      prop: "url",
      label: "接口路由",
      width: "200",
    },
    {
      prop: "ip",
      label: "IP",
      width: "150",
    },
    {
      prop: "userId",
      label: "操作用户ID",
      width: "120",
    },
    {
      prop: "createTime",
      label: "操作日期",
      width: "150",
    },
  ];
  listQuery: GetDataParams = {
    page: 1,
    limit: 30,
    count: 0,
  };
  created() {
    this.getList();
  }
  /**
   * @description: 获取日志接口列表
   * @param {*}
   * @return {*}
   */
  async getList() {
    this.loading = true;
    const {
      data: { list, count },
    } = await getAdminLog(this.listQuery);
    this.listQuery.count = count || 0;
    this.tableData = list || [];
    this.loading = false;
  }
}
</script>

<style lang="scss" scoped>
.login-log {
  height: 100%;
}
</style>
