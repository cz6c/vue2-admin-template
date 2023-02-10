import Vue from "vue";
import Router, { RouteConfig, RawLocation } from "xchl-vue-router";
import staticRouter from "./modules/staticRouter";
import Layout from "@/layout/index.vue";
Vue.use(Router);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultSettings = require("@/settings");
interface CustomRouter extends Router {
  flushRoute(menu: RouteConfig[]): void;
}
// 公共菜单
const routesList: RouteConfig[] = [
  {
    path: "/login",
    component: () => import("@views/public/login.vue"),
  },
  {
    path: "/auth-redirect",
    component: () => import("@views/public/auth-redirect.vue"),
  },
  {
    path: "/auth-redirect-layout",
    component: Layout,
    children: [
      {
        path: "/auth-redirect-layout",
        name: "重定向",
        component: () => import("@views/public/auth-redirect.vue"),
      },
    ],
  },
  {
    path: "*",
    component: () => import("@views/public/404.vue"),
  },
];
const createRouter = (routes: RouteConfig[]) =>
  new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0, x: 0 }),
    routes: [
      {
        path: "/",
        redirect: "/home",
      },
      ...routesList,
      ...staticRouter,
    ],
  });

const route = createRouter(routesList);

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
function resetRouter(routes: RouteConfig[] = routesList) {
  const newRouter: any = createRouter(routes);
  (route as any).matcher = newRouter.matcher; // reset router
  (route as any).options = newRouter.options; // reset router
}
(Router as any).prototype.flushRoute = (menu: RouteConfig[]) => {
  // 判断是否使用动态路由
  if (defaultSettings.isDynamicMenu) {
    menu.forEach((item: any) => {
      item.component = Layout;
      if (item.redirect && item.children.length) {
        item.redirect = item.children[0].path;
      }
      setRoutesData(item);
    });
    const arr = [
      {
        path: "/",
        redirect: menu[0].path || "/home",
      },
      ...routesList,
      ...menu,
    ];

    resetRouter(arr);
    route.options.routes = arr;
  } else {
    const arr = [
      {
        path: "/",
        redirect: "/home",
      },
      ...routesList,
      ...staticRouter,
    ];

    resetRouter(arr);
    route.options.routes = arr;
  }
};
// 递归处理component
function setRoutesData(row: any) {
  if (row.children && row.children.length) {
    row.children.forEach((item: any) => {
      if (item.redirect && item.children.length) {
        item.redirect = item.children[0].path;
      }
      const newName = item.component.replace(/@[\/]?views\//, "");
      item.component = item.component && item.component != "Layout" ? () => import("@views/" + newName) : Layout;
      setRoutesData(item);
    });
  }
}
// 解决相同路由报错
const originalPush = Router.prototype.push;
(Router as any).prototype.push = function (location: RawLocation) {
  return (originalPush as any).call(this, location).catch((err: Error) => err);
};
export { resetRouter };
export default route as CustomRouter;
