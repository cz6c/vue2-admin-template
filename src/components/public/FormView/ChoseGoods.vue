<template>
  <el-dialog title="选择商品" :visible.sync="visible" width="1240px" :before-close="handleClose">
    <TableScreen :data="searchForm" class="form-screen" labelWidth="70px" @search="searchList">
      <el-checkbox v-model="isAllcheck">本页全选</el-checkbox>
    </TableScreen>
    <div v-loading="isLoading" class="goods-wrap">
      <div class="goods-list">
        <div v-for="{ id, goodsName , thumbImg } of goodsList" :key="id" :title="goodsName" class="goods-item" :class="{ active: choseGoods.includes(id)}" @click="chose(id)">
          <div class="img-wrap">
            <el-image fit="cover" :src="thumbImg" />
          </div>
          <div class="name">{{ goodsName }}</div>
        </div>
      </div>
    </div>
    <Pagination :total="apiData.count" :page.sync="apiData.page" :limit.sync="apiData.limit" @pagination="getList" />
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" :loading="btnLoading" @click="submit">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { goodsList, goodsCateList, selectedGoods } from "@/api/public/index";
export default {
  props: {
    // 选中值
    value: {
      type: String,
      required: true,
      default: ""
    },
    // 是否显示
    visible: {
      type: Boolean
    }
  },
  data() {
    return {
      searchForm: [
        {
          label: "商品分类",
          prop: "cateId",
          type: "select",
          options: []
        },
        {
          label: "商品名称",
          prop: "goodsName"
        }
      ],
      // 是否全选
      isAllcheck: false,
      // 选择商品
      choseGoods: [],
      dialogVisible: false,
      isLoading: true,
      btnLoading: false,
      apiData: {
        page: 1,
        limit: 30,
        count: 0
      },
      goodsList: []
    };
  },
  watch: {
    value: {
      async handler(val) {
        val && (this.choseGoods = val.split(",").map(Number));
        const { data: { list } } = await selectedGoods({ id: val, type: 2 });
        this.$emit("updataList", list);
      },
      immediate: true
    },
    isAllcheck(val) {
      if (val) {
        this.goodsList.forEach(({ id }) => {
          !this.choseGoods.includes(id) && this.chose(id);
        });
      } else {
        this.goodsList.forEach(({ id }) => {
          this.choseGoods.includes(id) && this.chose(id);
        });
      }
    }
  },
  created() {
    this.getList();
    this.goodsCateList();
  },
  methods: {
    // 获取分类列表
    async goodsCateList() {
      const { data: { list } } = await goodsCateList();
      const arr = [
        {
          value: "",
          label: "请选择"
        },
        ...list.map(({ id, cateName }) => {
          return {
            value: id,
            label: cateName
          };
        })
      ];
      this.searchForm[0].options = arr;
    },
    // 获取商品列表
    async getList() {
      // 加载中
      this.isLoading = true;
      const { data: { page, limit, count, list } } = await goodsList(this.apiData);
      // 加载完毕
      this.isLoading = false;
      // 商品列表
      this.goodsList = list;

      Object.assign(this.apiData, { page, limit, count });
    },
    // // 搜索
    searchList(value) {
      this.apiData = { ...this.apiData, ...value };
      this.getList();
    },
    // 确认添加
    async submit() {
      this.btnLoading = true;
      // 已选id
      const ids = this.choseGoods.join(",");
      // 获取已选商品数据
      const { data: { list } } = await selectedGoods({ id: ids, type: 2 });
      this.btnLoading = false;
      // 更新数据
      this.$emit("input", ids);
      this.$emit("updataList", list);
      // 关闭弹框
      this.handleClose();
    },
    // 选中商品
    chose(id) {
      const { choseGoods } = this;
      if (choseGoods.includes(id)) {
        choseGoods.splice(choseGoods.indexOf(id), 1);
      } else {
        choseGoods.push(id);
      }
    },
    // 关闭弹框
    handleClose() {
      this.$emit("close");
    }
  }
};
</script>
<style lang="scss" scoped>
/deep/.el-dialog__body {
  padding-top: 0px;
  padding-bottom: 20px;
}
.checkedTips-wrap {
  margin-bottom: 5px;
  .checkedTips {
    font-size: 15px;
    margin-bottom: 4px;
  }
}
.form-screen {
  /deep/.el-form-item {
    margin-bottom: 11px;
  }
}

.goods-wrap {
  min-height: 100px;
}

.goods-list {
  display: flex;
  flex-wrap: wrap;
  .goods-item {
    width: 110px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid transparent;
    overflow: hidden;
    cursor: pointer;
    margin-right: 11px;
    margin-bottom: 11px;
    border-radius: 4px;

    &.active {
      border: 1px solid #409eff;
      .name {
        background-color: #f6f6f6;
      }
    }
    &:nth-of-type(10n) {
      margin-right: 0;
    }

    .img-wrap {
      width: 110px;
      height: 110px;
      .el-image {
        width: 100%;
        height: 100%;
      }
    }

    .name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 5px;
      width: 100%;
      box-sizing: border-box;
      line-height: 1.5;
      flex: 1;
      background-color: #f6f6f6;
    }
  }
}

.pagination-container {
  padding: 0 !important;
  text-align: right;
}
/deep/.el-tag:not(:last-child) {
  margin-right: 5px;
}
</style>
