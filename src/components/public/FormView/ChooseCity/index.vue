<template>
  <div class="city-wrap">
    <div class="city-input">
      <a class="dialog-btn" @click="dialogVisible=!dialogVisible">[-{{ checkedDataList.length === 0 ? '新增' : '编辑' }}城市]</a>
      <el-tag v-for="(item,index) of checkedDataList" :key="item.id" @close="handleTagClose(item,index)">{{ item.name }}</el-tag>
    </div>
    <el-dialog title="选择城市" :visible.sync="dialogVisible" width="1000px" @opened.once="initValue">
      <!-- 省 -->
      <city-item v-for="({id,name,children},index) in allAreaList" :key="id" ref="item" :name="name" :disable-type="propsType" :value="valueList" :parent-id="id" :list="children" :isVisitCity="nowIndex === index" @changeVisit="changeVisit(index)" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getTowAreaList } from "@/api/public/index";
import cityItem from "./cityItem";
export default {
  components: {
    cityItem
  },
  props: {
    value: {
      type: String,
      default: ""
    },
    parentId: {
      type: String,
      default: ""
    },
    areaName: {
      type: String,
      default: ""
    },
    disabledType: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      nowIndex: "",
      dialogVisible: false,
      showDialog: false,
      allAreaList: false,
      checkedList: [],
      rawList: []
    };
  },
  computed: {
    valueList() {
      return this.value.split(",");
    },
    // 从checkedList提取出checkedDataList并组成数组
    checkedDataList() {
      const checkedDataList = this.checkedList.map(
        ({ checkedDataList }) => checkedDataList
      );
      return Array.prototype.concat(...checkedDataList);
    },
    // 选中的id组合成字符串
    checkedIdStr() {
      const checkedList = this.checkedList.map(
        ({ checkedList }) => checkedList
      );
      return Array.prototype.concat(...checkedList).join(",");
    },
    // 选中的parentId组合成字符串
    parentIdStr() {
      const checkedList = this.checkedList.map(
        ({ checkedDataList }) => checkedDataList.map(it => {
          return it.parentId;
        })
      );
      return Array.prototype.concat(...checkedList).join(",");
    },
    // 选中的id组合成字符串
    areaNameStr() {
      const checkedList = this.checkedList.map(
        ({ checkedDataList }) => checkedDataList.map(it => {
          return it.name;
        })
      );
      return Array.prototype.concat(...checkedList).join(",");
    },
    // 映射 当前id属于哪一个checkedList
    parentMap() {
      const map = new Map();
      this.checkedList.forEach((parent) => {
        parent.checkedList.forEach((id) => {
          map.set(id, parent);
        });
      });
      return map;
    },
    // 映射 父级id = city组件
    itemMap() {
      const itemList = this.$refs.item;
      const map = new Map();
      itemList.forEach((item) => {
        map.set(item.parentId, item);
      });
      return map;
    },
    propsType() {
      const map = {
        1: "deliveryType",
        2: "fullPostType"
      };
      return map[this.disabledType];
    }
  },
  watch: {
    propsType: {
      handler() {
        this.allAreaList = this.allAreaAdapter(this.rawList);
      }
    }

  },
  created() {
    // 函数
    this.initData();
    const unwatch = this.$watch(
      () => {
        return this.value && this.parentId && this.areaName && this.allAreaList;
      },
      (value) => {
        if (value) {
          this.initTagsData();
          unwatch();
        }
      }
    );
  },
  methods: {
    changeVisit(index) {
      if (this.nowIndex !== "" && (this.nowIndex === index)) {
        this.nowIndex = "";
      } else {
        this.nowIndex = index;
      }
    },
    async initData() {
      const {
        data: { list }
      } = await getTowAreaList();
      this.rawList = Object.freeze(list);
      this.allAreaList = this.allAreaAdapter(list);
    },
    initTagsData() {
      const idList = this.value.split(",");
      const nameList = this.areaName.split(",");
      this.checkedList = idList.map((id, index) => {
        return {
          checkedDataList: {
            id,
            name: nameList[index]
          }
        };
      });
    },
    initValue() {
      if (!this.value) {
        return;
      }
      const valueList = this.value.split(",").map(Number);
      const parentIdList = this.parentId.split(",");
      const resultData = {};
      valueList.forEach((id, index) => {
        const parentId = parentIdList[index];
        if (!resultData[parentId]) resultData[parentId] = [];
        const idList = resultData[parentId];
        idList.push(id);
      });
      this.$nextTick(() => {
        Object.entries(resultData).forEach(([key, value]) => {
          const cityItem = this.itemMap.get(Number(key));
          cityItem.checkedList = value;
        });
      });
    },
    allAreaAdapter(list) {
      const provinceList = list;
      return provinceList.map(({ id, name, children }) => {
        children = children.map(({ id, name, [this.propsType]: disabled, parentId }) => {
          return { id, name, disabled, parentId };
        });
        return { id, name, children };
      });
    },
    // 计算子组件选中的内容
    // {checkedDataList:选中的对象,checkedList：选中的id}
    computedValue() {
      console.log(this.$refs.item, "this.$refs.item");
      const allItemList = this.$refs.item.map(
        ({ checkedDataList, checkedList }) => {
          return {
            checkedDataList: JSON.parse(JSON.stringify(checkedDataList)),
            checkedList
          };
        }
      );
      const checkedItem = allItemList.filter(
        (item) => item.checkedDataList.length
      );
      return checkedItem;
    },
    // tag 删除
    handleTagClose({ id }) {
      const delData = this.parentMap.get(id);
      const index = delData.checkedList.indexOf(id);
      this.$nextTick(() => {
        delData.checkedList.splice(index, 1);
        delData.checkedDataList.splice(index, 1);
      });
    },
    confirm() {
      this.checkedList = this.computedValue();
      this.$emit("input", this.checkedIdStr);
      this.$emit("changeParentId", this.parentIdStr);
      this.$emit("changeaAeaName", this.areaNameStr);
      this.dialogVisible = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.city-input {
  display: inline-block;
  max-width: 600px;
  box-sizing: border-box;
  border-radius: 4px;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #ebeef5;
  overflow: hidden;
  .dialog-btn {
    color: #0275d8;
    float: right !important;
    cursor: pointer;
    line-height: 1.2;
  }
  :not(:last-child).el-tag {
    margin-right: 5px;
  }
}
/deep/.el-dialog__body {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  box-sizing: border-box;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
