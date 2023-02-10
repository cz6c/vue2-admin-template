<template>
  <div
    :style="{ cursor, userSelect }"
    class="vue-splitter-container clearfix"
    :class="{ notMoved: active }"
    @mouseup="onMouseUp"
    @mousemove="onMouseMove"
  >
    <pane class="splitter-pane splitter-paneL" :className="paneName" :split="split" :style="{ [type]: percent + '%' }">
      <slot name="paneL"></slot>
    </pane>

    <resizer
      :className="className"
      :style="{ [resizeType]: percent + '%' }"
      :split="split"
      :hideArrow="hideArrow"
      @mousedown.native="onMouseDown"
      @click.native="onClick"
    ></resizer>
    <div
      v-if="!hideArrow"
      class="trapezoid"
      :class="split === 'vertical' ? 'trapezoid-vertical' : ''"
      :style="{ [resizeType]: percent + '%' }"
      @click="shrinkBtn"
    >
      <i
        class="el-icon-d-arrow-right"
        :style="
          isShow
            ? ` transform: rotate(${split === 'vertical' ? 0 : 90}deg)`
            : ` transform: rotate(${split === 'vertical' ? 180 : 270}deg)`
        "
      />
    </div>

    <pane class="splitter-pane splitter-paneR" :split="split" :style="{ [type]: 100 - percent + '%' }">
      <slot name="paneR"></slot>
    </pane>
    <div v-if="active" class="vue-splitter-container-mask"></div>
  </div>
</template>

<script>
import Resizer from "./resizer.vue";
import Pane from "./pane.vue";

export default {
  name: "SplitPane",
  components: { Resizer, Pane },
  props: {
    minPercent: {
      type: Number,
      default: 10,
    },
    defaultPercent: {
      type: Number,
      default: 50,
    },
    isShow: {
      type: Boolean,
      default: true,
    },
    split: {
      validator(value) {
        return ["vertical", "horizontal"].indexOf(value) >= 0;
      },
      required: true,
    },
    className: { type: String, default: "" },
    paneName: { type: String, default: "" },
    hideArrow: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      active: false,
      hasMoved: false,
      height: null,
      percent: this.defaultPercent,
      type: this.split === "vertical" ? "width" : "height",
      resizeType: this.split === "vertical" ? "left" : "top",
    };
  },
  computed: {
    userSelect() {
      return this.active ? "none" : "";
    },
    cursor() {
      return this.active ? (this.split === "vertical" ? "col-resize" : "n-resize") : "";
    },
  },
  watch: {
    defaultPercent(newValue) {
      this.percent = newValue;
    },
  },
  methods: {
    shrinkBtn() {
      this.$emit("shrink");
    },
    onClick() {
      if (!this.hasMoved) {
        this.percent = 50;
        this.$emit("resize", this.percent);
      }
    },
    onMouseDown() {
      this.active = true;
      this.hasMoved = false;
    },
    onMouseUp() {
      this.active = false;
    },
    onMouseMove(e) {
      if (e.buttons === 0 || e.which === 0) {
        this.active = false;
      }

      if (this.active) {
        let offset = 0;
        let target = e.currentTarget;
        if (this.split === "vertical") {
          while (target) {
            offset += target.offsetLeft;
            target = target.offsetParent;
          }
        } else {
          while (target) {
            offset += target.offsetTop;
            target = target.offsetParent;
          }
        }

        const currentPage = this.split === "vertical" ? e.pageX : e.pageY;
        const targetOffset = this.split === "vertical" ? e.currentTarget.offsetWidth : e.currentTarget.offsetHeight;
        const percent = Math.floor(((currentPage - offset) / targetOffset) * 10000) / 100;

        if (percent > this.minPercent && percent < 100 - this.minPercent) {
          this.percent = percent;
        }

        this.$emit("resize", this.percent);
        this.hasMoved = true;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.clearfix:after {
  visibility: hidden;
  display: block;
  font-size: 0;
  content: " ";
  clear: both;
  height: 0;
}

.vue-splitter-container {
  height: 100%;
  position: relative;
  .trapezoid,
  .splitter-pane-resizer,
  .splitter-pane {
    transition: 0.5s;
  }
}

.notMoved {
  .trapezoid,
  .splitter-pane-resizer,
  .splitter-pane {
    transition: none !important;
  }
}

.vue-splitter-container-mask {
  z-index: 9999;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.trapezoid {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  height: 0;
  width: 55px;
  border-bottom: 15px solid $--color-primary;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  text-align: center;
  cursor: pointer;
  z-index: 2000;
  transform: translate(-50%, -15px);
  .el-icon-d-arrow-right {
    position: relative;
    transform: rotate(270deg);
    transform-origin: center;
    color: #fff;
    margin-bottom: 5px;
    vertical-align: 3px;
  }
  &.trapezoid-vertical {
    top: 50%;
    width: 0;
    height: 46px;
    border-right: 14px solid $--color-primary;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    transform: translate(-22px, -50%);
    .el-icon-d-arrow-right {
      position: absolute;
      transform: rotate(0deg);
      margin: 0;
      top: calc(50% - 6px);
      left: 0;
      font-size: 12px;
    }
  }
}
</style>
