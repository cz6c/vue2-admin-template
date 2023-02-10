import { Message } from "element-ui";
const matchLang = {
  en: "english",
  hebrew: "hebrew",
} as any;
import Vue from "vue";
const icon = {
  en: "En",
  hebrew: "היברית",
} as any;
export default class {
  store: any;
  constructor(store: any) {
    this.store = store;
  }

  get(state: any) {
    return this.store[state];
  }
  getParams(state: any, suffix = "") {
    const rawData = this.get(state);
    const results = {} as any;
    Object.entries(rawData).forEach(([key, value]: any) => {
      if (Reflect.has(value, "data")) {
        results[`${key + suffix}`] = value.data;
      }
    });
    return results;
  }
  // 保存数据至当前state语言
  save(state: any, formData: any, suffix = "") {
    const data = JSON.parse(JSON.stringify(formData));
    const flyweightData = this.get(state);

    Object.keys(flyweightData).forEach(key => {
      const storeItem = flyweightData[key];
      let target = {} as any;
      if (Reflect.has(storeItem, "data")) {
        // 筛选掉pid,没有data的
        target = data[`${key + suffix}`]; // formData项
      } else {
        target = data[key];
      }
      if (target === false && target === undefined) {
        // formData中并没有key为
        console.error(`formData中并没有键为${key}的属性`);
        return;
      }
      if (typeof target === "string") {
        target = { data: target };
      }
      Object.keys(storeItem).forEach(flyKey => {
        const targetData = target[flyKey];
        if (targetData !== undefined && targetData !== false) {
          storeItem[flyKey] = target[flyKey];
        }
      });
    });
  }
  // 拿到state数据,替换formData
  tranform(state: any, formData: any) {
    const flyweightData = this.get(state);
    Object.keys(flyweightData).forEach(key => {
      const formItem = formData[key];
      if (formItem) {
        const storeItem = flyweightData[key];
        Object.assign(formItem, storeItem);
        // 没有data隐藏z中英文切换icon
        if (Reflect.has(storeItem, "data")) {
          Vue.set(formItem, "langIcon", icon[state]);
        }
      }
    });
  }
  // 验证数据
  validate() {
    const store = Object.entries(this.store) as any;
    for (const [key, value] of store) {
      for (let index = 0; index < Object.values(value).length; index++) {
        const { data, required, placeholder } = Object.values(value)[index] as any;
        if (required && data === "") {
          Message.warning(placeholder);
          return false;
        }
      }
    }
    return true;
  }
  // 获取表单数据
  langFormData() {
    const json = {} as any;
    const store = Object.entries(this.store) as any;
    for (const [key, value] of store) {
      for (let index = 0; index < Object.values(value).length; index++) {
        const { data, langProp } = Object.values(value)[index] as any;
        json[langProp] = String(data).trim();
      }
    }
    return json;
  }
}
