export interface nodeItem {
  id: number;
  // 是否展开
  isExpand: boolean;
  // 是否选中
  isChecked: boolean;
  // 不确定状态
  isIndeterminate: boolean;
  children: nodeItem[];
}
