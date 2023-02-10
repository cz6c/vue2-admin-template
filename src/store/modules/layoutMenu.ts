import {
  VuexModule,
  Module,
  Mutation,
  Action,
  getModule,
} from "vuex-module-decorators";
import store from "@/store";
export interface LayoutMenuState {
  sideOpen: boolean;
}

@Module({ dynamic: true, store, name: "layoutMenu" })
class LayoutMenu extends VuexModule implements LayoutMenuState {
  sideOpen = true;
  @Mutation
  private SET_SIDEOPEN(value: boolean) {
    this.sideOpen = value;
  }
  /**
   * @description: 侧边栏打开或收缩
   * @param {*}
   * @return {*}
   */
  @Action
  public sideOpenChange(value: boolean) {
    this.SET_SIDEOPEN(value);
  }
}

export const LayoutMenuModule = getModule(LayoutMenu);
