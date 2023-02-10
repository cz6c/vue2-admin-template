import drag from './drag'

const install = function(Vue:any) {
  Vue.directive('dragDialog', drag)
}

if (window.Vue) {
  (window as any)['dragDialog'] = drag;
  (window as any).Vue .use(install); // eslint-disable-line
}

(drag as any).install = install
export default drag
