import Vue from "vue";
import Component from "vue-class-component";
import { Watch, PropSync, Ref } from "vue-property-decorator";
import { Form, Message } from "element-ui";
// 表单提交验证
export const formValidate = async (form: Form | Form[], callback: any) => {
  if (Array.isArray(form)) {
    let isAlreadyMessage = false;
    while (form.length) {
      const item = form.shift() as Form;
      item.validate((valid, invalidFields: any) => {
        if (!isAlreadyMessage && !valid) {
          // 如果没有提示且验证不通过,则 弹出一次唯一Message
          Message.warning(invalidFields[Object.keys(invalidFields)[0]][0].message);
          isAlreadyMessage = true;
        }
      });
    }
    if (!isAlreadyMessage) {
      // 没有弹出唯一Message则代表所有验证都通过,执行回调
      callback();
    }
  } else {
    form.validate((valid, invalidFields: any) => {
      if (valid) {
        callback();
      } else {
        Message.warning(invalidFields[Object.keys(invalidFields)[0]][0].message);
      }
    });
  }
};
const deepCopy = (value: any) => {
  return typeof value === "object" ? JSON.parse(JSON.stringify(value)) : value;
};
@Component
export default class InitDialog extends Vue {
  // eslint-disable-next-line no-undef
  [x: string]: any;
  private defalutData!: any;
  @PropSync("visible", { type: Boolean, required: true })
  private syncVisible!: boolean;

  @Ref()
  private readonly form!: Form | undefined;

  @Watch("syncVisible")
  async watchSyncVisible(newVal: boolean) {
    if (newVal) {
      this.form?.resetFields();
      // 打开弹窗时,如果传入了value则使用value初始化数据,否则使用默认数据
      if (this.value !== undefined) {
        this.internalValue = deepCopy(this.value);
      } else {
        this.internalValue = deepCopy(this.defalutData);
      }
    }
  }
  created() {
    this.defalutData = deepCopy(this.internalValue); // 保存一份用于打开弹出时初始化
  }

  private handleSubmit() {
    const resultFn = () => {
      this.syncVisible = false;
      // 1.如果使用vmodel导入数据,会进行数据同步
      // 2.如果使用value导入数据,仅初始化弹窗,不会数据同步,编辑后的数据将在@submit的参数中
      this.syncValue = deepCopy(this.internalValue);
      console.log("emit submit");
      this.$emit("submit", this.internalValue);
      this.$emit("input", this.internalValue);
    };
    if (this.form) {
      formValidate(this.form, resultFn);
    } else {
      resultFn();
    }
  }
}
