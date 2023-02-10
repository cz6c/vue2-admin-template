<template>
  <div class="add-list">
    <el-select
      :style="'width:' + width"
      v-model="choseList[index]"
      :disabled="disabled"
      placeholder="请选择"
      value-key="id"
      @change="choseChange"
      v-for="(item, index) in areaList"
      :key="index"
    >
      <el-option v-for="x in item" :key="x.id" :label="x.name" :value="x" />
    </el-select>
  </div>
</template>

<script>
import { getAreaList } from "@/api/public/index";

export default {
  name: "AreaChose",
  props: {
    value: {
      type: Array,
      default() {
        return [];
      },
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    width: {
      type: String,
      default: "160px",
    },
  },
  data() {
    return {
      choseList: [],
      areaList: [[], [], []],
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(data) {
        data &&
          data.forEach((item, index) => {
            this.$set(this.choseList, index, { id: item });
            if (index === 2) return;
            this.init(index + 2, item);
          });
      },
    },
    choseList(val) {},
  },
  mounted() {
    this.init();
  },
  methods: {
    cleanForm() {
      this.form = {
        province: "",
        city: "",
        area: "",
      };
      this.cityList = [];
      this.areaList = [];
    },
    async init(level = 1, parentId) {
      // 数据请求
      const {
        data: { list },
      } = await getAreaList({ level, parentId });
      this.$set(this.areaList, level - 1, list);
    },
    choseChange({ level, id }) {
      let lv = Number(level);
      if (lv === 3) {
        let ids = this.choseList.map(item => item.id).map(Number);
        let names = this.choseList.map(item => item.name);
        this.$emit("input", ids, names);
        return;
      }
      this.init(lv + 1, id);
      if (lv === 1) {
        this.choseList[2] = "";
        this.areaList[2] = [];
      }
      this.choseList[lv] = "";
      this.areaList[lv] = [];
    },
  },
};
</script>
<style lang="scss" scoped>
.add-list {
  display: flex;
  > div {
    margin-right: 10px;
  }
  /deep/.el-input {
    width: 100%;
  }
}
</style>
