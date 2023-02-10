import Vue, { VNode } from "vue";
const emptyTipsClass = "empty-tips";
const addEmptyTips = (el: HTMLElement) => {
  const oldEmptyTipsEl = el.querySelector("." + emptyTipsClass) as HTMLElement;
  if (oldEmptyTipsEl) {
    return;
  }
  el.style.position = "relative";
  const emptyTipsEl = document.createElement("div");
  emptyTipsEl.className = emptyTipsClass;
  emptyTipsEl.style.cssText = `
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  font-size: 15px;`;
  emptyTipsEl.innerHTML = "暂无数据";
  el.appendChild(emptyTipsEl);
};
const removeEmptyTips = (el: HTMLElement) => {
  const oldEmptyTipsEl = el.querySelector("." + emptyTipsClass) as HTMLElement;
  if (oldEmptyTipsEl) {
    el.removeChild(oldEmptyTipsEl);
  }
};
const validLoading = (vnode: VNode) => {
  const directives = vnode?.data?.directives;
  let isLoading = false;
  if (directives) {
    const loadingDirective = directives.find(({ name }) => name === "loading");
    if (loadingDirective) {
      isLoading = !!loadingDirective.value;
    }
  }
  return isLoading;
};
Vue.directive("empty", {
  bind: function (el, binding, vnode) {
    if (!validLoading(vnode) && binding.value) {
      addEmptyTips(el);
    }
  },
  update: function (el, binding, vnode) {
    if (!validLoading(vnode)) {
      binding.value ? addEmptyTips(el) : removeEmptyTips(el);
    }
  },
  unbind: function (el) {
    if (el.querySelector(emptyTipsClass)) {
      removeEmptyTips(el);
    }
  },
});
