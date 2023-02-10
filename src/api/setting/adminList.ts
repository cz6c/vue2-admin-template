import { createGet, createPost } from "@utils/request";
import { GetDataParams, GetDataResponse, AdminListParams } from "@api/setting/adminList.d";
import { ChangeParams } from "@utils/public.d";

// 管理员列表
export const getUserList = createGet<GetDataParams, GetDataResponse<AdminListParams>>("/adminapi/userList");

// 管理员详情
export const getUserInfo = createGet<{ id: number }, any>("/adminapi/getUser");

// 管理员删除
export const delUser = createPost("/adminapi/deleteUser");

// 管理员保存
export const saveUser = createPost("/adminapi/updateUser");

// 管理员修改
export const updateUser = createPost("/adminapi/updateUser");

// 管理员状态切换
export const userChangeStatus = createPost<ChangeParams, never>("/adminapi/changeUserStatus");
