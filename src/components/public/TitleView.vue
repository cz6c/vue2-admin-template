<template>
  <div class="title-wrap">
    <h1 class="title" :class="{ back: isBack }" @click="isBack && $router.go(-1)">
      <span v-if="isBack" class="back-icon"><i class="el-icon-back"></i></span>
      <span class="title-name">{{ title || defaultTitle }}</span>
      <span v-if="subTitle" class="sub-title">{{ subTitle }}</span>
      <slot name="titleAfter"></slot>
    </h1>
    <slot>
      <el-button v-if="btnText" type="primary" @click="handleSubmit">{{ btnText }}</el-button>
      <div v-if="rightLabel" class="rightText">
        <span>{{ rightLabel }}</span
        ><span class="red">{{ rightValue }}</span>
      </div>
    </slot>
  </div>
</template>
<script>
const defaultSettings = require("@/settings");
export default {
  name: "TitleView",
  props: {
    btnText: {
      type: [String, Boolean],
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    subTitle: {
      type: String,
      default: "",
    },
    to: {},
    isBack: {
      type: Boolean,
      default: false,
    },
    rightLabel: {
      type: String,
      default: "",
    },
    rightValue: {
      type: String,
      default: "",
    },
  },
  computed: {
    defaultTitle() {
      return this.$route.meta?.name;
    },
  },
  created() {
    if (window.history.length === 1) {
      // 新开的标签页不展示返回按钮
      this.isBack = false;
    }
  },
  methods: {
    handleSubmit() {
      this.$emit("submit");
      if (this.to) {
        this.$router.push(this.to);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.title-wrap {
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  // padding-bottom: 15px;

  .title {
    font-size: 20px;
    font-weight: normal;
    margin: 0;
    display: flex;
    align-items: center;
    &.back {
      cursor: pointer;
    }
    .title-name {
      margin: 0 8px;
    }
    .back-icon {
      display: inline-block;
      vertical-align: middle;
      // width: 26px;
    }
    .sub-title {
      margin-right: 8px;
      color: rgba(0, 0, 0, 0.45);
      font-size: 14px;
    }
  }
  .rightText {
    margin-right: 20px;
    .red {
      color: red;
    }
  }

  .pan-btn {
    font-size: 14px;
    padding: 14px 36px;
    border-radius: 8px;
    border: none;
    outline: none;
    transition: 600ms ease all !important;
    position: relative;
    display: inline-block;
    &:hover {
      color: $--color-primary !important;
      background: #fff !important;
      &:before,
      &:after {
        background: $--color-primary;
        width: 100%;
        transition: 600ms ease all;
      }
    }

    &:before,
    &:after {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      height: 2px;
      width: 0;
      transition: 400ms ease all;
    }

    &::after {
      right: inherit;
      top: inherit;
      left: 0;
      bottom: 0;
    }
  }
}
</style>
