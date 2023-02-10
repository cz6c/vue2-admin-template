<template>
  <div class="console-view">
    <transition :name="transitionName" :duration="500">
      <keep-alive>
        <component
          :is="viewStatus"
          v-bind="$attrs"
          :status.sync="syncStatus"
          :tableClass="tableComponents"
          class="component-wrapper"
        >
          <template #search>
            <slot name="search"> </slot>
          </template>
          <template #select>
            <slot name="select"> </slot>
          </template>
          <template #rightWrapper>
            <slot name="rightWrapper"> </slot>
          </template>
          <template #leftWrapper>
            <slot name="leftWrapper"> </slot>
          </template>
        </component>
      </keep-alive>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Prop } from "vue-property-decorator";
import { Table } from "element-ui";
import SearchView from "./SearchView.vue";
import SelectView from "./SelectView.vue";
import ConsoleLog from "./ConsoleLog.vue";
type ViewStatus = "ConsoleLog" | "SearchView" | "SelectView";
type TransitionName = "component-down" | "component-up";
@Component({
  name: "ConsoleView",
  components: {
    SearchView,
    ConsoleLog,
    SelectView,
  },
})
export default class ConsoleView extends Vue {
  @PropSync("status", { type: [String, Number], required: false })
  private syncStatus!: string | number;

  @Prop({ type: Number, default: 0 })
  public selectNumber!: number;

  @Prop({ required: true })
  public tableClass!: string;

  private tableComponents: Table | string = "";

  private transitionName: TransitionName = "component-up";

  public viewStatus: ViewStatus = "ConsoleLog";

  // @Watch("viewStatus")
  // async watchViewStatus(val: ViewStatus) {
  //   this.transitionName = val === "ConsoleLog" ? "component-up" : "component-down";
  // }
  // @Watch("selectNumber")
  // async watchSelectNumber(val: number) {
  //   this.viewStatus = val ? "SelectView" : "ConsoleLog";
  // }
  mounted() {
    // $ref不是响应式数据,第一次传入prop是undefined,$ref组件实例之后,$ref并不会触发prop
    // 所以这里重新刷新,即页面完成之后强制性穿有值的$ref

    this.$nextTick(async () => {
      let vueComponents = this.$parent;
      while (!this.tableComponents) {
        if (!vueComponents) {
          break;
        }
        const tableComponents = vueComponents.$refs[this.tableClass] as Table;
        if (tableComponents) {
          this.tableComponents = tableComponents;
          break;
        }
        vueComponents = vueComponents.$parent;
      }
    });
  }
}
</script>

<style scoped lang="scss">
.console-view {
  position: relative;
  overflow: hidden;
  border-top: 1px solid $--border-color;
  box-sizing: border-box;
  .component-wrapper {
    // position: absolute;
    display: flex;
    top: 0;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 10px 0;
    width: 100%;
    border-radius: 2px 2px 0px 0px;
    background: #fff;
  }
  .component-down-enter-active,
  .component-down-leave-active,
  .component-up-enter-active,
  .component-up-leave-active {
    transition: 0.5s all;
  }
  .component-down-enter {
    transform: translateY(-48px);
  }
  .component-down-leave-to {
    transform: translateY(48px);
  }
  .component-up-enter {
    transform: translateY(48px);
  }
  .component-up-leave-to {
    transform: translateY(-48px);
  }
}
</style>
