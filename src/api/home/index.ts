import { createGet, createPost } from "@utils/request";
import { GetDataParams, editAccountType, GetAdminLogListResponse, GetLoginLogResponse } from "./index.d";

// 修改账户信息
export const editAccount = createPost<editAccountType, never>("/adminapi/editPwd");

// 获取登录日志
export const getLoginLog = createGet<GetDataParams, GetLoginLogResponse>("/adminapi/loginLogList");

// 获取操作日志
export const getAdminLog = createGet<GetDataParams, GetAdminLogListResponse>("/adminapi/getAdminLogList");
