<template>
  <div
    class="digital-input"
    :class="`${unit && 'unit unit--' + unitPosition} digital-input--${size}`"
    :style="`width: ${width}`"
  >
    <div v-if="unit" class="unit-icon">{{ unit }}</div>
    <!-- 文本输入框 -->
    <el-input
      v-if="inputType === 'text'"
      :value="inputValue"
      :placeholder="placeholder"
      :size="size"
      :disabled="disabled"
      :class="`${submitText && 'el-input-number--right'} input-text--${textAlign}`"
      @blur="$emit('blur')"
      @keyup.enter="$emit('enter')"
      @input="changeText"
    />
    <!-- 数字输入框 -->
    <el-input-number
      v-if="inputType === 'number'"
      :value="inputValue"
      :placeholder="placeholder"
      :size="size"
      :precision="precision"
      :max="max"
      :controls="false"
      :min="minNum"
      :disabled="disabled"
      :class="`${submitText && 'el-input-number--right'} input-text--${textAlign}`"
      @blur="$emit('blur')"
      @change="change"
    />
    <!-- <el-button slot="append">{{ unit }}</el-button> -->
    <el-button v-if="submitText" ref="rightButton" type="primary" @click="$emit('submit', inputValue)">{{
      submitText
    }}</el-button>
  </div>
</template>

<script>
export default {
  name: "DigitalInput",
  props: {
    value: String | Number,
    // 宽度
    width: String,
    // 最大
    max: Number,
    // 最小
    min: Number,
    // 输入框小数位
    precision: {
      type: Number,
      default: 2,
    },
    // 输入框大小 medium/small/mini
    size: {
      type: String,
      default: "",
    },
    // 输入框占位
    placeholder: {
      type: String,
      default: "",
    },
    // 输入框单位
    unit: {
      type: String,
      default: "",
    },
    // 输入框单位位置，支持 left/right 默认left
    unitPosition: {
      type: String,
      default: "right",
    },
    // 后置按钮文本
    submitText: {
      type: String,
      default: "",
    },
    // 输入框文件居中方式
    textAlign: {
      type: String,
      default: "left",
    },
    // 输入框类型
    inputType: {
      type: String,
      default: "number",
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      inputValue: undefined,
    };
  },
  computed: {
    // 右侧宽度
    rightWidth() {
      const i = 5;
      if (this.submitText) {
        return this.$refs.rightButton.$el.offsetWidth + i;
      }
      return i;
    },
    // 最小值
    minNum() {
      if (!this.min && this.min !== 0) {
        const i = 0;
        const x = this.precision;
        if (x === 0) return 0;
        if (x === 1) return 0.1;
        return Number(i.toFixed(this.precision - 1) + 1);
      }
      return this.min;
    },
  },
  watch: {
    value: {
      handler(val) {
        this.inputType === "number" ? this.change(val) : this.changeText(val);
      },
      immediate: false,
    },
  },
  mounted() {
    this.value && (this.inputValue = this.value);
    // this.inputValue = this.value;
  },
  created() {},
  methods: {
    // 更新数字value
    change(val) {
      const value = val ? Number(val).toFixed(this.precision) : val;
      this.inputValue = value;
      this.$emit("input", value);
    },
    // 更新文本value
    changeText(val) {
      this.inputValue = val;
      this.$emit("input", val);
    },
  },
};
</script>

<style lang="scss" scoped>
.digital-input {
  position: relative;
  line-height: 30px;

  .el-input-number {
    width: 100%;
    vertical-align: top;
    &--right {
      /deep/ .el-input__inner {
        padding-right: 55px !important;
      }
    }
  }
  .input-text {
    &--left {
      /deep/ .el-input__inner {
        text-align: left;
      }
    }
    &--center {
      /deep/ .el-input__inner {
        text-align: center;
      }
    }
    &--right {
      /deep/ .el-input__inner {
        text-align: right;
      }
    }
  }

  /deep/ .el-input__inner {
    padding-left: 6px;
    padding-right: 6px;
  }
  &.unit {
    /deep/.el-input-number .el-input__inner {
      padding-left: 50px;
    }
    /deep/.el-input-number--medium .el-input__inner {
      padding-left: 43px;
    }
    /deep/.el-input-number--small .el-input__inner {
      padding-left: 39px;
    }
    /deep/.el-input-number--mini .el-input__inner {
      padding-left: 35px;
    }
    .unit-icon {
      display: block;
      position: absolute;
      z-index: 1;
      top: 1px;
      height: auto;
      text-align: center;
      background: #f5f7fa;
      color: #909399;
      font-size: 14px;
      padding: 0 20px;
    }

    &--left {
      .unit-icon {
        left: 1px;
        border-radius: 4px 0 0 4px;
        border-right: 1px solid #dcdfe6;
      }
      /deep/ .el-input-number .el-input__inner {
        padding-left: 43px;
        padding-right: 6px;
      }
    }
    &--right {
      .unit-icon {
        right: 1px;
        border-radius: 0 4px 4px 0;
        border-left: 1px solid #dcdfe6;
      }
      /deep/ .el-input-number .el-input__inner {
        padding-left: 15px;
        padding-right: 46px;
      }
    }
  }
  &--medium {
    line-height: 34px;
    .unit-icon {
      width: 36px;
    }
  }
  &--small {
    line-height: 30px;
    .el-button {
      font-size: 13px;
    }
    .unit-icon {
      // width: 32px;
      padding: 0 12.5px !important;
      font-size: 13px;
    }
  }
  &--mini {
    line-height: 26px;
    .el-button {
      font-size: 12px;
    }
    .unit-icon {
      width: 28px;
      font-size: 12px;
    }
  }
  .el-button {
    display: block;
    position: absolute;
    z-index: 1;
    right: 0;
    top: 0;
    width: 50px;
    height: 100%;
    border-left: 0;
    border-radius: 0 4px 4px 0;
    padding: 0;
  }
}
</style>
