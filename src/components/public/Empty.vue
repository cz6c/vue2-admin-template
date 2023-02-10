<template>
  <div class="empty-view" :style="{minHeight: `${minHeight}px`}">
    <svgIcon class="svg-icon" icon="empty" />
    <div class="empty-text">{{ text }}</div>
    <el-button v-if="btnText" :loading="btnLoading" type="primary" class="add-btn" size="mini" @click="submit">{{ btnText }}</el-button>
  </div>
</template>

<script>
export default {
  name: "Empty",
  props: {
    // 最小高度
    minHeight: {
      type: Number,
      default: 200
    },
    // 空文案
    text: {
      type: String,
      default: "暂无数据"
    },
    // 添加按钮文案
    btnText: {
      type: String,
      default: ""
    },
    // 按钮loading
    btnLoading: {
      type: Boolean,
      default: false
    },
  },
  methods: {
    submit() {
      this.$emit("submit");
    }
  },
};
</script>

<style lang="scss" scoped>
.empty-view {
  flex: 1;
  height: 100%;
  min-height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  .svg-icon {
    width: 64px;
    height: 64px;
  }
  .empty-text {
    color: rgba(0, 0, 0, 0.25);
    font-size: 14px;
    margin-bottom: 10px;
  }
  .add-btn {
    margin-bottom: 10px;
    min-width: 80px;
  }
}
</style>
