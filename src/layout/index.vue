<template>
  <el-container class="app-container">
    <el-aside :width="isActive ? '180px' : '64px'" :class="{ off: !isActive }">
      <!-- 侧边栏 -->
      <side-menu
        ref="sideMenu"
        :is-only-side="isOnlySide"
        :logo-url="logoList"
        :logo-text="logoText"
        :routes="isOnlySide ? routes : sideRoutes"
        background-color="#F9F9F9"
        text-color="#96A0B5"
        active-text-color="#cc3f35"
      />
    </el-aside>
    <div class="el-main-view" :style="`width: ${!isActive ? '100%' : 'calc(100% - 180px)'}`">
      <el-header v-if="!isOnlySide" :style="`padding-left: ${isActive ? 0 : '180px'}`">
        <!-- 导航条 -->
        <nav-menu
          :is-only-side="isOnlySide"
          :routes="routes"
          :avatar-url="avatar"
          background-color="#333333"
          :cascade="false"
          active-text-color="#eaeaea"
          @select="changeRouteChildren"
        />
      </el-header>
      <view-breadcrumb :is-only-side="isOnlySide" />
      <div class="container">
        <router-view class="page-container" />
      </div>
    </div>
  </el-container>
</template>
<script lang="ts">
import NavMenu from "./components/NavMenu.vue";
import SideMenu from "./components/SideMenu.vue";
import ViewBreadcrumb from "./components/ViewBreadcrumb.vue";
const defaultSettings = require("@/settings");
import { LayoutMenuModule } from "@/store/modules/layoutMenu";
import { AuthModule } from "@/store/modules/auth";
import { Component, Vue } from "vue-property-decorator";
// 公司logo
const mainLogo = require("@images/logo/logo.png");
const miniLogo = require("@images/logo/logo_m.png");
import { RouteConfig } from "xchl-vue-router";

@Component({
  components: {
    NavMenu,
    SideMenu,
    ViewBreadcrumb,
  },
})
export default class Layout extends Vue {
  remark = "";
  sideRoutes: RouteConfig[] = [];
  isOnlySide = true;
  logoList = [mainLogo, miniLogo];
  logoText = defaultSettings.title;
  get isActive() {
    return LayoutMenuModule.sideOpen;
  }
  get userName() {
    return AuthModule.userName;
  }
  get avatar() {
    return AuthModule.avatar;
  }
  get routes() {
    return this.$router.options.routes;
  }
  get title() {
    return this.$route.name;
  }
  changeRouteChildren(key: string) {
    const route = (this.findCurrentRoute(key) as RouteConfig) || {};
    // 2.children赋值给侧边栏
    if (this.sideRoutes === route.children) {
      (this.$refs.sideMenu as SideMenu).linkFirstChildrenRoute();
    } else if (route.children) {
      this.sideRoutes = route.children;
    }
  }
  findCurrentRoute(key: string) {
    if (typeof key === "string" && this.routes) {
      return this.routes.find(item => {
        return key === item.path;
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  height: 100%;
  flex: auto;
}
.el-header {
  padding-right: 0;
  transition: 0.3s;
  border-bottom: solid 1px #e6e6e6;
}

.logo-remark {
  height: 50px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #dddddd;
  color: #535353;
  font-size: 15px;
}
.el-aside {
  transition: 0.3s;
  &.off {
    /deep/.foot-text {
      opacity: 0;
    }
  }
}
.el-main-view {
  padding: 0px;
  .title {
    font-size: 20px;
    font-weight: bold;
    padding-bottom: 10px;
    border-bottom: 1px solid gray;
    margin: 20px 20px 0 20px;
  }
  .container {
    height: calc(100% - 110px);
    overflow-y: auto;
    position: relative;
    padding: 0 16px;
    box-sizing: border-box;
    .page-container {
      background: #fff;
      min-height: 100%;
    }
  }
}
</style>
