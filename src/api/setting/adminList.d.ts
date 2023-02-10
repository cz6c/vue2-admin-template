export interface GetDataParams {
  page?: number;
  limit?: number;
  count?: number;
  type?: string;
}
export interface GetDataResponse<T> {
  list: T[];
  count: number;
  limit: number;
  page: number;
  pageCount: number;
}

// 管理员列表
export interface AdminListParams {
  avatar: string; // 头像
  createTime; number, // 账号创建时间
  id: number; // id
  lastLoginTime; number, // 最后一次登录时间
  mobile: string; // 联系电话
  roleId: number; // 角色ID
  roleName: string; // 角色名称
  status: number; // 状态 2 禁用 1 正常
  storeType: number; // 3 超级管理 4 普通管理 (用于判断是否允许删除)
  userName: string; // 用户名
}

