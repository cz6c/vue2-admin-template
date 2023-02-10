import Vue from "vue";
import App from "./App.vue";
import router from "@/router/index";
import store from "./store";
import publicCom from "@com/public/index";
import moment from "moment";
// 根据browserslist补充所有的Polyfill
import "@/assets/styles/global.scss";
import "normalize.css/normalize.css";
import "core-js/stable";
import "regenerator-runtime/runtime";
import "@utils/filters";
import "@/directive";
// 页面前置导航守卫
import "@/permission";

// 全部公共组件
Vue.use(publicCom);

Vue.prototype.$moment = moment;
moment.updateLocale("zh-cn", {});

Vue.config.productionTip = false;

// 模拟数据
import Mock from "@utils/mockjs";
Vue.prototype.$mock = Mock;

// 公共表单弹框
import FormDialog from "@com/public/FormDialog/main";
Vue.prototype.$formDialog = FormDialog;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount("#app");
