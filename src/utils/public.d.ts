export interface TableParams {
  page: number;
  limit: number;
  count?: number;
  id?:number;
}

export interface TableResponse<T> {
  count: number;
  limit: number;
  list: T[];
  page: number;
  pageCount: number;
}

export interface formJsonType {
  label?: string;
  data?: any;
  prop?: string | string[];
  disabled?: boolean;
  type?: string;
  required?: boolean;
  options?: { value: number | string; label: string; id?: number }[];
  searchProp?: string;
  valueKey?: string;
  apiMethod?: any;
  apiFormat?: any;
  column?: { label: string; prop: string }[];
  placeholder?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  dateType?: string;
  format?: string;
  valueFormat?: string;
  formItemWidth?: string;
  entryHanlder?: (data: any, prop?: string) => any;
  exportHanlder?: (data: any, prop?: string) => any;
  sizeTips?: string;
  acceptTips?: string;
  accept?: string;
  title?: string;
  slot?: string;
  unit?: string;
  hidden?: boolean;
  show?: boolean;
  width?: string | number;
  startAndEndProp?: string[];
  isSecond?: boolean;
  labelWidth?: string;
  clearable?: boolean;
  min?: number;
  precision?: number;
  inputType?: string;
  formItemHeight?: string;
  showLevel?: number;
  single?: boolean;
  propArr?: string[];
  isTopLabel?: boolean;
  borderContent?: [boolean, boolean, boolean, boolean]
  filterable?:boolean;
  pickerOptions?:{disabledDate(time:Date):boolean;};
}

export interface tableJsonType {
  entryHanlder?: (data: any, prop?: string) => any;
  exportHanlder?: (data: any, prop?: string) => any;
  label?: string;
  prop: string | string[];
  type?: string;
  required?: boolean;
  options?: { value: number | string; label: string; id?: number }[];
  width?: number | undefined;
  min?: number;
  unit?: string;
  unitAlign?: string;
}

export interface ChangeParams {
  id: number[] | number;
  field?: string; // 字段名称，对应需要切换的字段小驼峰名称
  value: number[] | number; // 启用状态 1 是 2 否
}
