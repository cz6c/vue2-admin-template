import { createGet, createPost } from "@utils/request";
import { TableParams, ChangeParams } from "@utils/public.d";
// 角色列表
export const getRoleList = createGet<TableParams, any>("/adminapi/getRoleList");

// 角色详情
export const getRoleInfo = createGet<{ id: number }, any>("/adminapi/getRole");

// 角色删除
export const delRole = createPost("/adminapi/deleteRole");

// 角色保存
export const saveRole = createPost("/adminapi/createRole");

// 角色修改
export const updateRole = createPost("/adminapi/createRole");

// 角色状态切换
export const roleChangeStatus = createPost<ChangeParams, never>("/adminapi/changeRoleStatus");

// 权限管理
export const getPermissionList = createGet<TableParams, any>("/adminapi/getPermissionCategoryList");
