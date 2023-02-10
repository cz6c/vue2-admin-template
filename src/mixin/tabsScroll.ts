import Vue from "vue";
import Component from "vue-class-component";
import { Ref } from "vue-property-decorator";
import { TabPane, Tabs } from "element-ui";
import { debounce } from "throttle-debounce";
interface scrollObject {
  [keys: string]: {
    name: string;
    el: HTMLElement;
  };
}
type scrollArray = {
  name: string;
  offsetTop: number;
}[];
// 使用方式
// 1.给el-tabs ref 设置为 tabs
// 2.给需要滚动父级元素 ref 设置为 scrollEl
// 3.给每个锚点元素的id设置为与el-tab-pane.name相应对
@Component
export default class TabsScroll extends Vue {
  @Ref("tabs")
  private readonly tabsInstance!: Tabs; // el-tabs实例

  @Ref("scrollEl")
  private readonly scrollEl!: HTMLElement; // 滚动窗口元素

  private scrollObject: scrollObject = {};
  private scrollArray: scrollArray = []; // 通过锚点元素的offsetTop从大到小排列
  mounted() {
    const validateRefResult = this.validateRef();
    if (validateRefResult) {
      this.initScrollObject();
      this.tabsInstance.$on("tab-click", this.scrollAnchor);
      const debounceFunc: any = debounce(500, false, this.activeTabs);
      this.scrollEl.addEventListener("scroll", debounceFunc);
    }
  }

  validateRef() {
    if (!this.tabsInstance) {
      alert("请把el-tabs ref 设置为 tabs");
    } else if (!this.scrollEl) {
      alert("请把滚动窗口元素 ref 设置为 tabs");
    } else {
      return true;
    }
  }
  initScrollObject() {
    const tabPaneArray: TabPane[] = (this.tabsInstance as any).panes;
    tabPaneArray.forEach(({ name }) => {
      const el = document.querySelector(`#${name}`) as HTMLElement;
      if (el) {
        this.scrollObject[name] = { name, el };
        this.scrollArray.push({ name, offsetTop: el.offsetTop });
      }
    });
    this.scrollArray = this.scrollArray.sort((a, b) => a.offsetTop - b.offsetTop).reverse();
    // console.log("this.scrollArray", this.scrollArray);
  }
  /**
   * @description: 滚动到指定锚点
   */
  scrollAnchor(data: TabPane) {
    const scrollData = this.scrollObject[data.name];
    if (scrollData) {
      this.scrollEl.scrollTo({
        top: scrollData.el.offsetTop,
        behavior: "smooth",
      });
    } else {
      alert(`并未找到id为${data.name}的元素`);
    }
  }
  /**
   * @description: 滚动触发锚点时进行tabs value切换
   */
  activeTabs(event: Event) {
    const scrollTop = (event.target as any)?.scrollTop + 100;
    for (let index = 0; index < this.scrollArray.length; index++) {
      const { name, offsetTop } = this.scrollArray[index];
      if (scrollTop >= offsetTop) {
        (this.tabsInstance as any).currentName = name;
        return;
      }
    }
  }
}
