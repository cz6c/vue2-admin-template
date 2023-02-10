import AuditDialog from "./index.vue";
import { formJsonType } from "@/utils/public";
export interface ruleFormType {
  status: number;
  remark: string;
}

export interface optionsType {
  success?: (value: any, instance: AuditDialog, done: () => void) => void;
  change?: (value: any, instance: AuditDialog) => void;
  cancel?: () => void;
  title?: string;
  submitText?: string;
  tipsText?: string;
  formList?: formJsonType[];
}

export interface AuditDialogType {
  (options: optionsType): void;
}
