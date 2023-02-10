<template>
  <div class="spec">
    <!--- SKU列表 --->
    <el-table :data="value" border>
      <el-table-column label="天数" width="100" align="center" prop="dayTitle" />
      <el-table-column width="230" label="奖励积分" align="center">
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.gold"
            type="number"
            placeholder="请输入积分"
            style="width: 200px"
            @change="e => changeInput(e, scope.row)"
          >
          </el-input>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  props: {
    value: {
      type: Array,
      default: [{}]
    },
    scale: {
      type: Number,
      default: 10
    }
  },
  data() {
    return {
    };
  },
  created() {
  },
  methods: {
    // 完成编辑
    changeInput(gold, {dayTitle,id}) {
      this.$emit("change", {gold, id, dayTitle})
    }
  }
};
</script>
<style lang="scss" scoped>
p {
  margin: 0;
  padding: 0;
}
/deep/.el-table {
  display: inline-block;
  width: auto;
  .el-input{
    .el-input__inner{
      text-align: center;
    }
  }
}
</style>
