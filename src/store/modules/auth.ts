import { VuexModule, Module, Mutation, Action, getModule, config } from "vuex-module-decorators";
import store from "@/store";
import { getToken, setToken, removeToken } from "@/utils/auth";
import { login, getLoginUserInfo, getLoginUserMenu } from "@api/public/index";
import { loginParams, userInfo } from "@api/public/index.d";
import router, { resetRouter } from "@/router/index";
config.rawError = true; // 暴露原生error,防止未异常拦截，出现一堆action相关的报错信息
export interface AuthState {
  token?: string;
  userName: string;
  avatar: string;
  name: string;
  id: number | string;
  // 暂时设置，待改
  menu: Array<string>;
}

@Module({ dynamic: true, store, name: "auth" })
class Auth extends VuexModule implements AuthState {
  token?: string = getToken();
  userName = "";
  name = "";
  avatar = "";
  phone: string | number = "";
  id: string | number = "";
  menu: Array<string> = [];
  isLoginTimeOut = false;

  @Mutation
  private SET_TOKEN(token: string) {
    this.token = token;
  }
  @Mutation
  private SET_USERNAME(userName: string) {
    this.userName = userName;
  }
  @Mutation
  private SET_NAME(name: string) {
    this.name = name;
  }
  @Mutation
  private SET_AVATAR(avatar: string) {
    this.avatar = avatar;
  }
  @Mutation
  private SET_PHONE(phone: number | string) {
    this.phone = phone;
  }
  @Mutation
  private SET_ID(id: number | string) {
    this.id = id;
  }
  @Mutation
  private SET_MENU(menu: Array<string>) {
    this.menu = menu;
  }
  @Mutation
  private SET_LOGIN_TIME_OUT(data: boolean) {
    this.isLoginTimeOut = data;
  }

  /**
   * @description: 登录回调
   * @param {*}
   * @return {*}
   */
  @Action
  public login(loginParams: loginParams): Promise<string> {
    const { userName, password, code } = loginParams;
    return new Promise((resolve, reject) => {
      login({ userName: userName.trim(), password, code })
        .then(response => {
          const { data } = response;
          this.SET_TOKEN(data.token);
          setToken(data.token);
          resolve(data.token);
        })
        .catch(error => {
          if (error.message.indexOf("Request aborted") !== -1) {
            return;
          }
          reject(error);
        });
    });
  }

  /**
   * @description: 获取用户数据
   * @param {*}
   * @return {*}
   */
  @Action
  getLoginUserInfo(): Promise<userInfo> {
    return new Promise((resolve, reject) => {
      getLoginUserInfo()
        .then(async response => {
          const { data } = response;
          if (!data) {
            reject("登录过期，请重新登录");
          }
          const { id, userName, avatar, name, phone } = data;
          this.SET_USERNAME(userName);
          this.SET_NAME(name);
          this.SET_AVATAR(avatar);
          this.SET_ID(id);
          this.SET_PHONE(phone);
          await this.getLoginUserMenu();
          resolve(data);
        })
        .catch(error => {
          if (error.message.indexOf("Request aborted") !== -1) {
            return;
          }
          reject(error);
        });
    });
  }
  /**
   * @description: 获取用户权限菜单
   * @param {*}
   * @return {*}
   */
  @Action
  getLoginUserMenu(): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
      const menuList = sessionStorage.getItem("menuData");
      if (menuList) {
        // 判断本地是否有缓存
        const menu = JSON.parse(menuList);
        this.SET_MENU(menu);
        router.flushRoute(menu);
        resolve(menu);
      } else {
        // 无则请求接口
        getLoginUserMenu()
          .then(({ data }) => {
            sessionStorage.setItem("menuData", JSON.stringify(data.menu));
            this.SET_MENU(data.menu);
            router.flushRoute(data.menu);
            resolve(data.menu);
          })
          .catch(error => {
            reject(error);
          });
        return;
      }
      // 无则请求接口
      getLoginUserMenu().then(({ data }) => {
        sessionStorage.setItem("menuData", JSON.stringify(data.menu));
      });
    });
  }

  /**
   * @description: 全局修改头像
   * @param {*}
   * @return {*}
   */
  @Action
  setAvatar(avatar: string) {
    this.SET_AVATAR(avatar);
  }

  /**
   * @description: 登出
   * @param {*}
   * @return {*}
   */
  @Action
  async logout() {
    this.SET_USERNAME("");
    this.SET_NAME("");
    this.SET_AVATAR("");
    this.SET_ID("");
    this.SET_PHONE("");
    removeToken();
    sessionStorage.removeItem("menuList");
    console.error(router);
    resetRouter();
  }

  /**
   * @description: 超时设置
   * @param {*}
   * @return {*}
   */
  @Action
  setLoginTimeOut(data: boolean) {
    this.SET_LOGIN_TIME_OUT(data);
  }
}

export const AuthModule = getModule(Auth);
