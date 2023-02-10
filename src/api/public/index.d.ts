import { TableResponse } from "@/utils/public.d";

// 登录参数
export interface loginParams {
  userName: string;
  password: string;
  code: string;
}

// 用户信息
export interface userInfo {
  id: string;
  token: string;
  userName: string;
  avatar: string;
  phone: string;
  name: string;
}

// 菜单数据
export interface menuData {
  menu: [];
}
