// 文本映射组件
import TextMap from "./TextMap.vue";
// 底部抽屉
import BottomDrawer from "./BottomDrawer.vue";
// 列表的控制台区域
import ConsoleView from "./ConsoleView/index.vue";
import { VueConstructor } from "vue";

// 组件列表
const components = [TextMap, ConsoleView, BottomDrawer];

const install = function (Vue: VueConstructor) {
  // 组件循环注册
  components.forEach((component: any) => {
    Vue.component(component.options ? component.options.name : component.name, component);
  });
};

// 出口组件
export default { install };
