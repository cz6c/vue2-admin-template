import Vue from "vue";
import Vuex from "vuex";
import { AuthState } from "./modules/auth";
import { ITagsViewState } from "./modules/tagsView";

Vue.use(Vuex);

export interface IRootState {
  tagsView: ITagsViewState;
  auth: AuthState;
}

// Declare empty store first, dynamically register all modules later.
// 先声明空存储，然后动态注册所有模块。
export default new Vuex.Store<IRootState>({});
