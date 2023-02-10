<template>
  <div class="bottom-drawer">
    <split-pane
      :min-percent="1"
      :default-percent="defaultPercent"
      :split="split"
      :isShow="isShow"
      :hideArrow="hideArrow"
      :paneName="paneName"
      @shrink="shrinkChange"
    >
      <template slot="paneL">
        <slot></slot>
      </template>
      <template slot="paneR">
        <slot name="drawer"></slot>
      </template>
    </split-pane>
  </div>
</template>

<script lang="ts">
import { Component, Vue, VModel, Prop } from "vue-property-decorator";
import SplitPane from "./SplitPane/index.vue";
@Component({
  name: "BottomDrawer",
  components: {
    SplitPane,
  },
})
export default class BottomDrawer extends Vue {
  @VModel({ type: Boolean })
  isShow!: boolean;
  @Prop({
    type: String,
    default: "horizontal",
  })
  readonly split!: "horizontal" | "vertical";
  @Prop({
    type: Number,
    default: 65,
  })
  readonly defaultLen!: number;
  @Prop({
    type: Boolean,
    default: false,
  })
  readonly hideArrow!: boolean;
  @Prop({
    type: String,
    default: "",
  })
  readonly paneName!: string;
  isDrag = false;
  shrinkChange() {
    this.isShow = !this.isShow;
  }
  changeShow(value: boolean) {
    this.isShow = value;
  }

  get defaultPercent() {
    return !this.isShow ? 100 : this.defaultLen;
  }
}
</script>

<style scoped lang="scss">
.page-wrapper {
  overflow-y: auto;
}
.bottom-drawer {
  height: 100%;
  overflow: hidden;
  background-color: transparent !important;
  /deep/.splitter-pane {
    overflow: hidden;
    box-sizing: border-box;
    > div {
      background-color: #fff;
      height: 100% !important;
      box-sizing: border-box;
    }
    &.splitter-paneR.horizontal {
      > div {
        padding: 10px 20px 10px;
      }
    }
  }
  /deep/.table-wrapper {
    height: calc(100% - 130px);
  }
}
</style>
