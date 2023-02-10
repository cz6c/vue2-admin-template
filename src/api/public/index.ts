const { baseURL } = require("@/settings");
import { createPost, createGet } from "./lib";
import { loginParams, userInfo, menuData } from "./index.d";

// 登录
export const login = createPost<loginParams, userInfo>("/adminapi/login");
// 获取用户信息
export const getLoginUserInfo = createGet<never, userInfo>("/adminapi/getUserInfo");
// 获取当前用户菜单
export const getLoginUserMenu = createGet<never, menuData>("/adminapi/getLoginUserMenu");
// 获取城市地区
export const getAreaList = createGet<never, never>("/adminapi/getAreaList");

// 统一后台七牛云存储接口（单文件/多文件）
export const common = {
  imgApi: `${baseURL}/adminapi/qiNiuUpload`,
};

// 上传图片
export const qiNiuUpload = createPost<never, never>("/adminapi/qiNiuUpload");
// 七牛云上传视频接口
export const getQiNiuToken = createGet<never, never>("/adminapi/getQiNiuToken");
// 商品列表
export const goodsList = createGet<never, never>("/adminapi/goodsList");
// 分类列表
export const goodsCateList = createGet<never, never>("/adminapi/goodsCateList");
// 搜索已选中的商品
export const selectedGoods = createGet<never, never>("/adminapi/selectedGoods");
// 获取二级地址
export const getTowAreaList = createGet<never, never>("/adminapi/getTowAreaList");
// 消息
export const messageAlertList = createGet<never, never>("/adminapi/messageAlertList");
