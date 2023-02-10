import router from "./router";
import "nprogress/nprogress.css";
import NProgress from "nprogress";
import { Message } from "element-ui";
import { Route } from "vue-router";
import { getToken } from "@/utils/auth";
import { AuthModule } from "@/store/modules/auth";
NProgress.configure({ showSpinner: false }); // NProgress Configuration
const defaultSettings = require("@/settings");

const getPageTitle = (to: Route) => {
  if (to.meta && to.meta.name) {
    return `${to.meta.name}-${defaultSettings.title}`;
  }
  return `${defaultSettings.title}`;
};

const whiteList = ["/login", "/auth-redirect"]; // no redirect whitelist

router.beforeEach(async (to: Route, from: Route, next: any) => {
  // start progress bar
  NProgress.start();
  // set page title
  document.title = getPageTitle(to);
  // determine whether the user has logged in
  const hasToken = getToken();
  if (hasToken) {
    if (to.path === "/login") {
      next({ path: "/" });
      NProgress.done();
    } else {
      const userId = AuthModule.id;
      if (userId) {
        next();
      } else {
        try {
          await AuthModule.getLoginUserInfo();
          next({ ...to, replace: true });
        } catch (error) {
          await AuthModule.logout();
          // Message.error(error || "Has Error");
          AuthModule.setLoginTimeOut(true);
          next({
            path: "/login",
            query: {
              redirect: `${to.fullPath}`,
            },
          });
          NProgress.done();
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next();
    } else {
      await AuthModule.logout();
      next({
        path: "/login",
        query: {
          redirect: `${to.fullPath}`,
        },
      });
      NProgress.done();
    }
  }
});

router.afterEach(() => {
  // finish progress bar
  NProgress.done();
});
