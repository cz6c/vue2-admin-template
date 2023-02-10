<template>
  <div :class="{ hidden: hidden }" class="pagination-container">
    <el-pagination
      :background="background"
      :current-page.sync="currentPage"
      :page-size.sync="pageSize"
      :layout="layout"
      :page-sizes="pageSizes"
      :total="total"
      v-bind="$attrs"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <div class="left-wrapper">
      <p>共{{ total }}条记录 第 {{ page }} / {{ allPageNumber }} 页</p>
    </div>
  </div>
</template>

<script>
import { scrollTo } from "@/utils/scroll-to";

export default {
  name: "Pagination",
  props: {
    // 分页总数
    total: {
      required: true,
      type: Number,
    },
    // 当前页数
    page: {
      type: Number,
      default: 1,
    },
    // 每页数量
    limit: {
      type: Number,
      default: 30,
    },
    // 可调整每页显示条数
    pageSizes: {
      type: Array,
      default() {
        return [this.limit, 50, 100];
      },
    },
    layout: {
      type: String,
      default: "prev, pager, next,sizes,jumper",
    },
    background: {
      type: Boolean,
      default: true,
    },
    autoScroll: {
      type: Boolean,
      default: true,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
    // 是否更改url地址
    isChangeUrl: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    allPageNumber() {
      return Math.ceil(this.total / this.limit) || 1;
    },
    currentPage: {
      get() {
        return this.page;
      },
      set(val) {
        this.$emit("update:page", val);
      },
    },
    pageSize: {
      get() {
        return this.limit;
      },
      set(val) {
        this.$emit("update:limit", val);
      },
    },
  },
  methods: {
    handleSizeChange(val) {
      this.$emit("pagination", { page: this.currentPage, limit: val });
      if (this.autoScroll) {
        scrollTo(0, 800);
      }
    },
    handleCurrentChange(val) {
      if (this.isChangeUrl) {
        this.$router.push({
          query: {
            page: val,
          },
        });
      }
      this.$emit("pagination", { page: val, limit: this.pageSize });
      if (this.autoScroll) {
        scrollTo(0, 800);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.pagination-container {
  position: relative;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: #fff;
  padding: 11px 10px;
  /deep/.el-pagination__jump {
    margin-left: 0 !important;
  }
  .left-wrapper {
    position: absolute !important;
    font-weight: 400;
    font-style: normal;
    font-size: 13px;
    color: rgba(0, 0, 0, 0.427451);
    left: 10px;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    line-height: 28px;
  }
}
</style>
