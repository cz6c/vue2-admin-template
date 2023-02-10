import axios, { AxiosRequestConfig } from "axios";
import service from "@utils/request";

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
