import { Form, Message } from "element-ui";
/**
 * @description: 手机号验证
 */
export function isMobile(str: string): boolean {
  return /^1[3|4|5|7|8][0-9]{9}$/.test(str);
}

/**
 * @description: 办公/座机电话
 */
export function isPhone(str: string): boolean {
  return /^\d{3}-\d{8}$|^\d{4}-\d{7}$/.test(str);
}

/**
 * @description: 身份证验证
 */
export function isIdCard(str: string): boolean {
  return /^[1-9]\d{5}(?:18|19|20)\d{2}(?:0\d|10|11|12)(?:0[1-9]|[1-2]\d|30|31)\d{3}[\dXx]$/.test(str);
}
/**
 * @description Email验证
 */
export function validEmail(email: string) {
  const reg =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return reg.test(email);
}
/**
 * @description 密码验证器 8〜20个非纯数字或英文密码组合
 */
export function validPassword(email: string) {
  const reg = /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z\d]{6,20}$/;
  return reg.test(email);
}
/**
 * @description 社保号验证
 */
export function validSocial(email: string) {
  const reg = /\d{10,32}$/;
  return reg.test(email);
}
/**
 * @description 银行卡验证
 */
export function validBankCard(email: string) {
  const reg = /^[1-9]\d{9,29}$/;
  return reg.test(email);
}
// ------------------------------------- 验证器
/**
 * @description: 手机号验证器
 */
export const validateMobile = (rule: any, value: string, callback: any) => {
  // 如果值为空也通过
  if (!value || isMobile(value)) {
    callback();
  } else {
    callback(new Error("请输入正确的手机号!"));
  }
};
/**
 * @description: 身份证验证器
 */
export const validateIdCard = (rule: any, value: string, callback: any) => {
  if (!value || isIdCard(value)) {
    callback();
  } else {
    callback(new Error("请输入正确的身份证号码!"));
  }
};

/**
 * @description: 银行卡验证器
 */
export const validateBankCard = (rule: any, value: string, callback: any) => {
  if (validBankCard(value)) {
    callback();
  } else {
    callback(new Error("请输入正确的银行卡号!"));
  }
};

/**
 * @description:  办公/座机电话
 */
export const validatePhone = (rule: any, value: string, callback: any) => {
  if (!value || isPhone(value)) {
    callback();
  } else {
    callback(new Error("请输入正确的办公电话(座机)!"));
  }
};

/**
 * @description: Email验证器
 */
export const validateEmail = (rule: any, value: string, callback: any) => {
  if (validEmail(value) || !value) {
    callback();
  } else {
    callback(new Error("email格式错误，请输入正确的email!"));
  }
};

/**
 * @description: 社保号验证器
 */
export const validateSocial = (rule: any, value: string, callback: any) => {
  if (validSocial(value)) {
    callback();
  } else {
    callback(new Error("社保号格式错误，请输入正确的社保号!"));
  }
};

/**
 * @description: 密码验证器
 */
export const validatevalidPassword = (rule: any, value: string, callback: any) => {
  if (validPassword(value)) {
    callback();
  } else {
    callback(new Error("请输入8〜20个非纯数字或英文密码组合"));
  }
};

/**
 * @description: 是否为空对象
 */
export const validateEmptyObject = (Obj: Record<string, any>) => {
  return Object.keys(Obj).length && Object.values(Obj).some(value => value);
};

/**
 * @description: 密码验证回调方法
 * @param {*}
 * @return {*}
 */
export const validatePassWord = (rule: any, value: any, callback: any) => {
  const pattrn = /[\u4e00-\u9fa5\s]+/;
  if (pattrn.test(value)) {
    callback(new Error("请输入正确的密码格式！"));
  } else {
    callback();
  }
};
// 过滤器
/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path: any) {
  return /^(https?:|mailto:|tel:)/.test(path);
}
// ------------------------------------- 表单提交验证
export const formValidate = async (form: Form | Form[], callback: () => void) => {
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
