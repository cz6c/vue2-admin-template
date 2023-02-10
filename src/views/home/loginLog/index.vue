<template>
  <div class="login-log">
    <!-- 登录日志 -->
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
import { getLoginLog } from "@api/home/index";
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
      prop: "createTime",
      label: "日期",
      type: "timeStamp",
      width: 170,
    },
    {
      prop: "ip",
      label: "IP",
      width: "500",
    },
    {
      prop: "country",
      label: "地区",
      width: 200,
    },
    {
      prop: "name",
      label: "浏览器",
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
    const {data: { list, count } } = await getLoginLog(this.listQuery);
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
