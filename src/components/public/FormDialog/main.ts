import Vue from "vue";
const FormDialog = Vue.extend(require("./index.vue").default);
let instance: any;
const formDialog = function (options: any) {
  // 生成组件
  instance = new FormDialog({
    data: options,
  });
  // 组件需要挂载在dom元素上
  instance.vm = instance.$mount();
  document.body.appendChild(instance.vm.$el);
};

export default formDialog;
