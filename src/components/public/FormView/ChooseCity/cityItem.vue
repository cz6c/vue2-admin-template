<template>
  <div class="city-item-wrap" :style="`padding-bottom:${isVisitCity ? `${cityHeight}px` : ''}`">
    <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" :disabled="allDisabled" @change="handleCheckAllChange($event)">
      <span>{{ name }}</span>
      <i :class="!isVisitCity ? 'el-icon-circle-plus-outline' : 'el-icon-remove-outline'" @click.stop.prevent="$emit('changeVisit')" />
      <div v-if="isVisitCity" class="arrow-icon" />
    </el-checkbox>
    <!-- 市 -->
    <el-checkbox-group v-model="checkedList">
      <div v-if="isVisitCity" ref="cityWrap" class="city-wrap">
        <div v-for="city of normalList " :key="city.id" class="sub-item">
          <el-checkbox :label="city.id" :disabled="city.disabled">
            <span>{{ city.name }}</span>
          </el-checkbox>
        </div>
      </div>
    </el-checkbox-group>
  </div>
</template>
<script>
export default {
  props: {
    value: {
      type: Array,
      default: () => { }
    },
    parentId: {
      type: Number,
      default: 0
    },
    name: {
      type: String,
      default: ""
    },
    list: {
      type: Array,
      default: () => { }
    },
    disableType: {
      type: String,
      default: ""
    },
    isVisitCity: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      checkAll: false,
      isIndeterminate: false,
      checkedList: [],
      cityHeight: 0
    };
  },
  computed: {
    // 列表数据，处理过了disabled
    normalList() {
      return this.list.map((item) => {
        item.disabled = item.disabled === 1 && !this.value.includes(String(item.id));
        return item;
      });
    },
    listIds() {
      return this.list.map(({ id }) => id);
    },
    listDataMap() {
      const map = new Map();
      this.list.forEach(item => {
        map.set(item.id, item);
      });
      return map;
    },
    checkedDataList() {
      return this.checkedList.map(id => {
        return this.listDataMap.get(id);
      });
    },
    allDisabled() {
      return this.normalList.every(({ disabled }) => {
        return disabled;
      });
    }
  },
  watch: {
    isVisitCity(val) {
      if (val) {
        this.$nextTick(() => {
          this.cityHeight = this.$refs.cityWrap.offsetHeight;
        });
      }
    },
    async checkedList(val) {
      this.handleCheckedItemChange(val);
    }
  },
  methods: {
    async handleCheckAllChange(val) {
      this.$nextTick(() => {
        this.checkedList = val
          ? JSON.parse(JSON.stringify(this.listIds))
          : [];
        this.isIndeterminate = false;
      });
    },
    handleCheckedItemChange(value) {
      const checkedCount = value.length;
      this.checkAll = checkedCount === this.listIds.length;
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.listIds.length;
    }
  }
};
</script>
<style lang="scss" scoped>
.city-item-wrap {
  width: 25%;
  box-sizing: border-box;
  padding: 0 5px;
  i {
    font-size: 15px;
    color: #409efe;
    padding-left: 10px;
  }
  .sub-item {
    margin-right: 20px;
    line-height: 1.2;
    float: left;
    margin-bottom: 10px;
  }
  .arrow-icon {
    position: absolute;
    display: block;
    width: 0;
    height: 0;
    border-color: transparent;
    border-style: solid;
    border-width: 6px;
    filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.03));
    right: 0;
    bottom: 0;
    border-top-width: 0;
    border-bottom-color: #ebeef5;
    z-index: 2;
    &::after {
      content: " ";
      border-width: 6px;
      position: absolute;
      display: block;
      width: 0;
      height: 0;
      border-color: transparent;
      border-style: solid;
      top: 1px;
      margin-left: -6px;
      border-top-width: 0;
      border-bottom-color: #fff;
    }
  }
  .city-wrap {
    overflow: hidden;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;
    box-sizing: border-box;
    padding: 10px 20px 0;
    box-sizing: border-box;
    // box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    position: absolute;
    width: 96%;
    right: 0;
    left: 0;
    margin: auto;
  }
}
</style>
