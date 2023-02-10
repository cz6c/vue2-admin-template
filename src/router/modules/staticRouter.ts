/* eslint-disable object-curly-spacing */
import { RouteConfig } from "vue-router";
import Layout from "@/layout/index.vue";
const staticRouter: RouteConfig[] = [
  {
    path: "/home",
    component: Layout,
    meta: {
      name: "首页",
      icon: "example",
    },
    redirect: "/home/loginLog",
    children: [
      {
        path: "/home/loginLog",
        name: "LoginLog",
        meta: {
          name: "登录日志",
        },
        component: () => import("@views/home/loginLog/index.vue"),
      },
      {
        path: "/home/operationLog",
        name: "OperationLog",
        meta: {
          name: "操作日志",
        },
        component: () => import("@views/home/operationLog/index.vue"),
      },
      {
        path: "/home/changePassword",
        name: "ChangePassword",
        meta: {
          name: "修改密码",
          // icon: "navMenu-user"
        },
        component: () => import("@views/home/changePassword/index.vue"),
      },
    ],
  },
  {
    path: "/setting",
    name: "Setting",
    component: Layout,
    meta: {
      name: "设置",
    },
    redirect: "/setting/adminList",
    children: [
      {
        path: "/setting/adminList",
        name: "AdminList",
        component: () => import("@views/setting/adminList/index.vue"),
        meta: {
          name: "管理员列表",
        },
        children: [
          {
            path: "/setting/addAdmin",
            name: "AddAdmin",
            meta: {
              activeMenu: "/setting/adminList",
              name: "添加管理员",
              hidden: true,
            },
            component: () => import("@views/setting/adminList/addAdmin.vue"),
          },
        ],
      },
      {
        path: "/setting/roleList",
        name: "RoleList",
        meta: {
          name: "角色列表",
        },
        component: () => import("@views/setting/roleList/index.vue"),
        children: [
          {
            path: "/setting/addRole",
            name: "addRole",
            meta: {
              activeMenu: "/setting/roleList",
              name: "添加角色",
              hidden: true,
            },
            component: () => import("@views/setting/roleList/addRole.vue"),
          },
        ],
      },
    ],
  },
];
export const consoleLogPathList = staticRouter.map(({ path }) => path);
export default staticRouter;
