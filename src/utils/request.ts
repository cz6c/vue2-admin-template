/* eslint-disable indent */
const { baseURL } = require("@/settings");
import router from "@/router/index";
import { getToken, removeToken } from "@/utils/auth";
import { AuthModule } from "@/store/modules/auth";
import { ResponseType } from "axios/index";
import { Message } from "element-ui";
// 封装axios
import axios, { AxiosRequestConfig } from "axios";
const service = axios.create({
  baseURL,
  withCredentials: true, // 设置跨域cookie上传
  timeout: 5000, // 请求超时
});

// request 拦截器 ==> 对请求参数做处理
service.interceptors.request.use(
  config => {
    // 判断为模板文件
    const isFileApi = config.params && config.params.isExportApi;
    // 判断为模板文件
    if (isFileApi) {
      config.responseType = "blob";
    }
    // 判断如为导入接口则接口超时设置为0，即不超时
    if (config.url === "/device/assets/importExcel") {
      config.timeout = 0;
    }
    config.headers["token"] = config.headers["token"] || getToken();
    return config;
  },
  error => {
    console.log(error); // for debug
    return Promise.reject(error);
  },
);
// response 拦截器 ==> 对响应做处理
service.interceptors.response.use(
  response => {
    const res = response.data;
    if (response.config.url === "/auth/logout") {
      return res;
    }
    const isFileApi = response.config.params && response.config.params.isExportApi;
    // 判断为模板文件
    if (isFileApi) {
      return response;
    }
    // 当请求不为200时，报错
    if (res.code !== 200) {
      if (res.code === -406 || res.code === -407) {
        removeToken();
        AuthModule.setLoginTimeOut(true);
        router.push(`/login?redirect=${router.currentRoute.fullPath}`);
        return;
      }
      (Message as any).closeAll(); // 关闭之前的所有消息提示
      Message({
        message: res.msg,
        type: "warning",
      });
      return Promise.reject(new Error(res.msg || "Error"));
    } else {
      return res;
    }
  },
  error => {
    console.log("err" + error); // for debug
    return Promise.reject(error);
  },
);
interface Response<T> {
  code: number; // 接口数据状态码,不是接口状态码
  msg: string; // 接口消息
  data: T;
}
export const createGet =
  <P extends Record<string, any>, R extends unknown>(url: string, responseType?: ResponseType) =>
  (params?: P, config: AxiosRequestConfig = {}): Promise<Response<R>> =>
    service.request({
      method: "get",
      url,
      params,
      responseType,
      ...config,
    });
export const createPost =
  <P extends Record<string, any>, R extends any>(url: string) =>
  (data?: P, config: AxiosRequestConfig = {}): Promise<Response<R>> =>
    service.request({
      method: "post",
      url,
      data,
      ...config,
    });

export default service;
