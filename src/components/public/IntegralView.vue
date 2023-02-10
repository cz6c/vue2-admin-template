<template>
  <div class="spec">
    <!--- SKU列表 --->
    <el-table :data="value" border style="width: 100%">
      <el-table-column label="序号" type="index" width="50" align="center"> </el-table-column>
      <el-table-column label="充值金额(元)" align="center">
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.money"
            type="number"
            placeholder="请输入价格"
            style="width: 200px"
            @blur="e => handleInput(scope.row, scope.$index)"
          >
            <template slot="prepend">￥</template>
          </el-input>
        </template>
      </el-table-column>
      <el-table-column label="对应积分" align="center" width="230px">
        <template slot-scope="scope">
          <!-- <span>{{ scope.row.money * scale || 0 }}</span> -->
          <span>{{ setGold(scope.row.gold) }}</span>
        </template>
      </el-table-column>
      <!-- 操作 -->
      <el-table-column label="操作" width="160px" align="center">
        <template slot-scope="prop">
          <el-button type="primary" size="small" @click="handleAdd()">新增</el-button>
          <el-button type="danger" size="small" @click="handleDelectSpec(prop.$index)">删除</el-button>
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
  computed: {
    setGold() {
      return function (gold) {
        gold = gold || 0
        return Number(gold) < 1 ? gold : parseInt(gold)
      }
    }
  },
  watch: {
    scale(val) {
      this.value.forEach(ele => {
        ele.gold = Number(ele.money) * this.scale
      });
    }
  },
  methods: {
    // 新增
    handleAdd() {
      this.value.push({ money: "", gold: "" })
    },
    // 删除
    handleDelectSpec(key) {
      if (this.value.length == 1) {
        this.$message.warning("至少保留一个充值选项");
        return
      }
      this.$delete(this.value, key);
    },
    handleInput({ money, gold }, index) {
      // console.log("money:",money,",gold:",money*this.scale,",index:",index);
      if (!this.scale) {
        this.$message.warning("请先输入积分兑换比例！");
      }
      // this.value[index].gold = Number(money)*this.scale;
      this.value.forEach(ele => {
        ele.gold = Number(ele.money) * this.scale
      });
      this.value[index].money = Number(money).toFixed(2);
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
  width: 680px !important;
  .el-input__inner {
    text-align: center;
  }
}
.cursor {
  cursor: pointer;
}
</style>
