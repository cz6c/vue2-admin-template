<template>
  <div :class="classes"></div>
</template>

<script>
export default {
  props: {
    hideArrow: {
      type: Boolean,
      default: false,
    },
    split: {
      validator(value) {
        return ["vertical", "horizontal"].indexOf(value) >= 0;
      },
      required: true,
    },
    className: { type: String, default: "" },
  },
  computed: {
    classes() {
      const noBck = this.hideArrow ? "noBck" : "";
      const classes = ["splitter-pane-resizer", this.split, this.className, noBck];
      return classes.join(" ");
    },
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
.splitter-pane-resizer {
  box-sizing: border-box;
  background: $--color-primary;
  position: absolute;
  opacity: 1;
  z-index: 1;
  -moz-background-clip: padding;
  -webkit-background-clip: padding;
  background-clip: padding-box;
  &.horizontal {
    height: 6px;
    margin: 0 0;
    border-top: 4px solid $--color-primary;
    border-bottom: 4px solid $--color-primary;
    cursor: n-resize;
    width: 100%;
  }
  &.vertical {
    width: 6px;
    height: 100%;
    cursor: w-resize;
    margin: 0;
    border-left: 1px solid $--border-color;
  }
  &.noBck {
    background: none;
  }
}
</style>
