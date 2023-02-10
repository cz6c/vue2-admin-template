// 表单组件
import FormView from "./FormView/index.vue";
// 表格组件
import TableView from "./TableView.vue";
// 表格筛选
import TableScreen from "./TableScreen.vue";
// 表格操作
import TabelOperate from "./TableOperate.vue";
// 分页组件
import Pagination from "./Pagination.vue";
// 标题组件
import TitleView from "./TitleView.vue";
// 数字输入框组件
import DigitalInput from "./DigitalInput.vue";
// 复制功能
import VueClipboard from "vue-clipboard2";
// svg组件
import SvgIcon from "./SvgIcon.vue";
// 弹框拖拽自定义指令
import dragDialog from "./directive/dragDialog/index";
// 多级联动
import DiyCascader from "./DiyCascader.vue";
// 远程搜索
import RemoteSearch from "./RemoteSearch.vue";
// 空组件
import Empty from "./Empty.vue";
// 选择商品分配
import SelectCategoryDialog from "./SelectCategoryDialog/index.vue";
// 表格下拉选择框
import TableSelect from "./TableSelect.vue";
import TableMultipleSelect from "./TableMultipleSelect.vue";
// 图片文件上传
import UploadView from "./UploadView/index.vue";

// 权限树
import NodeTree from "./NodeTree/index.vue";

import ElementUI from "element-ui";
import { Image } from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import { VueConstructor } from "vue";
import VueTagsInput from "@johmun/vue-tags-input";
import InputNumber from "./InputNumber.vue"
// 组件列表
const components = [
  FormView,
  TableView,
  TableScreen,
  Pagination,
  TitleView,
  DigitalInput,
  SvgIcon,
  DiyCascader,
  RemoteSearch,
  Empty,
  SelectCategoryDialog,
  TableSelect,
  TableMultipleSelect,
  UploadView,
  VueTagsInput,
  NodeTree,
  TabelOperate,
];

const install = function (Vue: VueConstructor) {
  // 弹框拖拽自定义指令
  Vue.use(dragDialog as any);
  // ElementUI组件
  Vue.use(ElementUI);
  // 图片预览组件
  Vue.component("el-image-viewer", (Image as any).components.ImageViewer);
  // 数字输入框
  Vue.component("el-input-number", InputNumber);
  // 复制组件
  Vue.use(VueClipboard);

  // 组件循环注册
  components.forEach((component: any) => {
    Vue.component(component.options ? component.options.name : component.name, component);
  });
};

if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

// svg操作
const req = require.context("@/assets/svg", false, /\.svg$/);
const requireAll = (requireContext: any) => requireContext.keys().map(requireContext);
// 获取svg文件的绝对路径
requireAll(req);

// 出口组件
export default {
  version: "1.0.0",
  install,
  FormView,
  TableView,
  TableScreen,
  Pagination,
  TitleView,
  DigitalInput,
  SvgIcon,
  Empty,
  TableSelect,
  TableMultipleSelect,
};
