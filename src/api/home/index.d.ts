import { TableResponse } from "@/utils/public.d";
export interface GetDataParams {
  page?: number;
  limit?: number;
  count?: number;
  type?: string;
}
export interface editAccountType {
  avatar?: string;
  oldPassword?: string;
  password?: string;
  confirmPassword?:string;
}
export interface GetDataResponse {
  data: [];
  list: [];
}
// 操作日志
export interface AdminLogItem {
  action: string; // 动作
  content: string; // 日志内容
  createTime: number; // 操作时间
  id: number // id
  ip: string; // ip地址
  type: number // 1 管理员日志 2 前台操作日志 3 财务日志
  url: string; // 操作的url
  userId: number; // 操作用户id
  userName: string; // 账号
}
export type GetAdminLogListResponse = TableResponse<AdminLogItem>;
// 登录日志
export interface LoginLogItem {
  country: string; //  ip下的城市信息
  id: number;// id
  ip: string; // ip地址
  createTime: number; // 登录时间
  name: string; // 浏览器名称
  platform: string; // 操作系统
  userId: number // 所属用户ID
  userName: string; // 账号
  useragent: string; // 浏览器agent信息
}
export type GetLoginLogResponse = TableResponse<LoginLogItem>;
