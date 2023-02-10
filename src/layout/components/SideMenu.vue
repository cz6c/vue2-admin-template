<template>
  <div class="sider-menu" :style="{ backgroundColor: backgroundColor }">
    <div v-if="logoUrl" class="logo-wrap" :class="{ fixed: isFixed, off: !isActive }" @click="$router.push('/')">
      <slot name="logo">
        <template v-for="logo of logoList">
          <div :key="logo" class="logo-item">
            <img :src="logo" alt="logo" class="logo-image" />
          </div>
        </template>
      </slot>
    </div>
    <div v-if="isFixed && logoUrl" class="logo-wrap" @click="$router.push('/')">
      <div v-for="logo of logoList" :key="logo" class="logo-item" />
    </div>
    <el-scrollbar class="scrollbar">
      <el-menu
        ref="menu"
        :default-active="defaultActive"
        :collapse="!isActive"
        :class="{ off: !isActive }"
        @select="handleSelect"
      >
        <template v-for="item of routes" :index="item.path">
          <template v-if="!(!item.meta || item.meta.hidden)">
            <el-submenu v-if="isSubmenu(item)" :key="item.path" :index="item.path">
              <template slot="title">
                <SvgIcon v-if="item.meta && item.meta.icon" class="menu-icon" :icon="item.meta.icon"></SvgIcon>
                <span v-else class="icon-dot"></span>
                <span class="menu-text"> {{ item.meta && item.meta.name }}</span>
              </template>
              <template v-for="childItem of item.children">
                <el-submenu v-if="isSubmenu(childItem)" :key="childItem.path" :index="childItem.path">
                  <template slot="title"> {{ childItem.meta && childItem.meta.name }}</template>
                  <el-menu-item
                    v-for="x of childItem.children"
                    v-show="!(x.meta && x.meta.hidden)"
                    :key="x.path"
                    :index="x.path"
                    @click="linkRoute(x)"
                  >
                    {{ x.meta && x.meta.name }}
                  </el-menu-item>
                </el-submenu>
                <el-menu-item
                  v-else
                  v-show="!(childItem.meta && childItem.meta.hidden)"
                  :key="childItem.path"
                  :index="childItem.path"
                  @click="linkRoute(childItem)"
                >
                  <SvgIcon
                    v-if="childItem.meta && childItem.meta.icon"
                    class="menu-icon"
                    :icon="childItem.meta.icon"
                  ></SvgIcon>
                  <span v-else class="icon-dot"></span>
                  <span class="menu-text"> {{ childItem.meta && childItem.meta.name }}</span>
                </el-menu-item>
              </template>
            </el-submenu>

            <el-menu-item v-else :key="item.path" :index="item.redirect || item.path" @click="linkRoute(item)">
              <SvgIcon v-if="item.meta && item.meta.icon" class="menu-icon" :icon="item.meta.icon"></SvgIcon>
              <span v-else class="icon-dot"></span>
              <span class="menu-text"> {{ item.meta && item.meta.name }}</span>
            </el-menu-item>
          </template>
        </template>
      </el-menu>
    </el-scrollbar>
    <div class="foot-text">
      <div class="dt">技术支持</div>
      <el-link href="https://www.xchl.xyz" target="_blank">深圳市小草互联网科技有限公司</el-link>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { LayoutMenuModule } from "@/store/modules/layoutMenu";
import { RouteConfig } from "xchl-vue-router";

@Component({})
export default class SideMenu extends Vue {
  @Prop({
    type: Boolean,
    default: false,
  })
  isOnlySide!: boolean;
  @Prop({
    type: Array,
    default: () => [],
  })
  routes!: RouteConfig[];
  @Prop({
    type: [String, Array],
    default: "",
  })
  logoUrl!: string | string[];
  @Prop({
    type: String,
    default: "",
  })
  logoText!: string;
  @Prop({
    type: String,
    default: "#545c64",
  })
  backgroundColor!: string;
  @Prop({
    type: String,
    default: "#F9F9F9",
  })
  textColor!: string;

  isFixed = false;
  defaultActive = "";

  get isActive() {
    return LayoutMenuModule.sideOpen;
  }
  get routesFirstPath() {
    // 做为key 强制刷新侧边栏
    if (this.routes && this.routes[0]) {
      return this.routes[0].path;
    } else {
      return "";
    }
  }
  get logoList() {
    const logoUrl = this.logoUrl;
    return typeof logoUrl === "string" ? [logoUrl] : logoUrl;
  }
  get activeRoutePath() {
    return this.getActiveRoutePath();
  }

  @Watch("isActive")
  changeIsActive(val: boolean) {
    if (!val) {
      this.isFixed = !this.isOnlySide;
    } else {
      setTimeout(() => {
        this.isFixed = false;
      }, 200);
    }
  }
  @Watch("activeRoutePath", { immediate: true })
  changeActiveRoutePath(data: string) {
    console.log(data);

    this.$nextTick(() => {
      (this.$refs.menu as any).activeIndex = this.defaultActive = data;
    });
  }
  @Watch("routes")
  changeRoutes() {
    if (this.routesFirstPath && this.$route.matched.length === 1) {
      this.linkFirstChildrenRoute();
    }
  }

  linkRoute(item: RouteConfig) {
    const { path } = item;
    if (path === this.$route.path) {
      this.$router.push({
        path: "/auth-redirect-layout",
        query: {
          redirect: path,
        },
      });
    } else {
      this.$router.push(path);
    }
  }
  getActiveRoutePath() {
    const route = this.$route;
    if (route.meta && route.meta.activeMenu) {
      return route.meta.activeMenu;
    } else {
      return route.path;
    }
  }
  // 3.侧边栏跳转第一个router
  linkFirstChildrenRoute() {
    this.$router.push(this.routesFirstPath);
  }
  handleSelect(key: string, keyPath: string) {
    this.$emit("select", key, keyPath);
  }
  isSubmenu(item: RouteConfig) {
    const childItem = item.children || [];
    const showItemList = childItem.filter(({ meta }) => !meta?.hidden);
    return showItemList.length;
  }
}
</script>

<style lang="scss" scoped>
.h1-title {
  font-size: 24px;
  color: #fff;
  font-weight: normal;
}
.scrollbar {
  height: calc(100% - 120px);
  /deep/.el-scrollbar__wrap {
    overflow-x: hidden;
  }
}
.sider-menu {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  // border-right: solid 1px #e6e6e6;
  /deep/ .el-menu {
    border: 0;
    background-color: transparent;
    &.off {
      .menu-text {
        opacity: 0;
        padding: 0 !important;
      }
    }
  }
  .logo-wrap {
    position: relative;
    transform: 0.3s;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    &.off {
      .logo-item {
        &:first-of-type {
          display: none;
        }
        &:last-of-type {
          display: flex;
        }
      }
    }
    .logo-item {
      width: 100%;
      height: 50px;
      display: flex;
      width: 100%;
      justify-content: center;
      align-items: center;
      .logo-image {
        max-height: 38px;
      }
      &:first-of-type {
        display: flex;
      }
      &:last-of-type {
        display: none;
      }
    }
  }

  .icon-dot {
    margin-left: 8px;
  }
  /deep/.el-submenu__title {
    font-size: 14px;
    height: 44px;
    line-height: 44px;
    display: flex;
    align-items: center;
    opacity: 1 !important;
    .svg-icon {
      flex: 0 0 20px;
      width: 20px;
      height: 20px;
      vertical-align: middle;
    }
    .menu-text {
      padding-left: 10px;
    }
    &:hover {
      background: #f1f1f1 !important;
    }
  }
  /deep/.el-submenu__icon-arrow {
    margin-top: -5px;
  }

  .foot-text {
    position: absolute;
    bottom: 10px;
    text-align: center;
    transition: 0.3s;
    font-size: 13px;
    width: 100%;
    line-height: 20px;
    /deep/.el-link {
      font-size: 12px;
      color: #2c3e50 !important;
    }
  }

  /deep/.el-menu-item {
    min-width: 170px !important;
    font-size: 14px;
    height: 44px;
    line-height: 44px;
    &:hover {
      background: #f1f1f1 !important;
    }
    &.is-active {
      color: rgb(204, 63, 53) !important;
    }
  }
}
</style>
