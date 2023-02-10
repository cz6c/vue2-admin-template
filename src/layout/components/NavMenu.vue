<template>
  <div class="my-menu" :style="{ backgroundColor: backgroundColor }">
    <!----------  logo 开始  ------------>
    <div class="menu-left">
      <slot name="logo">
        <div v-if="!isOnlySide && (logoText || logoUrl)" class="logo-wrap">
          <img v-if="logoUrl" :src="logoUrl" alt="logo" class="menu-logo" />
          <mallki v-else-if="logoText" class-name="mallki-text" style="font-size: 24px" :text="logoText" />
        </div>
      </slot>
      <!----------  logo 结束  ------------>
      <el-menu
        v-bind="$attrs"
        text-color="#fff"
        :default-active="activeIndex"
        mode="horizontal"
        :background-color="backgroundColor"
        :router="false"
        @select="handleSelect"
      >
        <template v-for="(item, index) of routes" :index="item.path">
          <template v-if="item.meta && item.meta.name && !(item.meta && item.meta.hidden)">
            <el-submenu v-if="item.children && cascade" :key="index" :index="item.path">
              <template slot="title">{{ item.meta && item.meta.name }}</template>
              <el-menu-item v-for="(childItem, childIndex) of item.children" :key="childIndex" :index="childItem.path">
                {{ childItem.meta.name }}
              </el-menu-item>
            </el-submenu>
            <el-menu-item v-else :key="item.meta && item.meta.name" :index="item.path">
              {{ item.meta && item.meta.name }}
            </el-menu-item>
          </template>
        </template>
      </el-menu>
    </div>
    <div class="menu-right">
      <slot name="menu-right">
        <NavRight />
      </slot>
    </div>
  </div>
</template>
<script lang="ts">
// 点击导航条时
// 1.点击导航条拿到children
// 2.children赋值给侧边栏
// 3.侧边栏跳转第一个router

// 当路由改变时
// 1.判断路由的路径,截取第一个，更新menu的activeItem
// 2.更新侧边栏children
// 3.拿到url判断属于active

// 导航条监听route:判断路由改变,匹配active
// 侧边栏监听chidlren来渲染,监听route来匹配active
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Mallki from "@/components/public/TextHoverEffect.vue";
import NavRight from "./NavRight.vue";
import { RouteConfig, Route } from "xchl-vue-router";

@Component({
  components: {
    NavRight,
    Mallki,
  },
})
export default class NavMenu extends Vue {
  // 是否只显示侧边栏
  @Prop({
    type: Boolean,
    default: false,
  })
  isOnlySide!: boolean;
  @Prop({
    type: Boolean,
    default: true,
  })
  cascade!: boolean;
  @Prop({
    type: Array,
    default: () => [],
  })
  routes!: RouteConfig[];
  @Prop({
    type: String,
    default: "#ffffff",
  })
  backgroundColor!: string;
  // logo地址
  @Prop({
    type: String,
    default: "",
  })
  logoUrl!: string;
  // 文字logo
  @Prop({
    type: String,
    default: "",
  })
  logoText!: string;
  @Prop({
    type: Boolean,
    default: false,
  })
  closeUser!: boolean;
  @Prop({
    type: Boolean,
    default: false,
  })
  closeMessage!: boolean;

  activeIndex = "";
  menuList = [];

  // 返回控制台
  sonBtn() {
    this.$store.dispatch("setStoreId");
  }
  // 1.点击导航条拿到children
  handleSelect(key: string, keyPath: string) {
    this.$emit("select", key, keyPath);
    this.activeIndex = key;
    this.$router.push(key);
  }
  @Watch("$route", { immediate: true })
  handleRouteChange(route: Route) {
    // 问题: 刚进来的时候这里是有效的，但是点击后会触发select，route触发又来一次,侧边栏调整路由又来一次，总共三次
    // 解决：url相同则跳过改变
    let activeMenuItem = this.activeIndex;
    if (route.fullPath.includes(activeMenuItem) && !!activeMenuItem) {
      return;
    }
    if (!this.cascade) {
      // 如果为双级导航栏
      if (route.matched[0]) {
        // 且当前路由有匹配到路由
        // 1.判断路由的路径,截取第一个，更新menu的activeItem
        activeMenuItem = route.matched[0].path;
        // 2.更新侧边栏children
        this.activeIndex = activeMenuItem;
        this.$emit("select", activeMenuItem);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.menu-right {
  display: flex;
  .sonBtn {
    margin-right: 20px;
  }
}
/deep/.el-menu--horizontal .el-menu-item:not(.is-disabled):hover,
/deep/.el-menu--horizontal .el-menu-item:not(.is-disabled):focus {
  outline: none;
  color: rgb(204, 63, 53) !important;
}
/deep/.el-menu.el-menu--horizontal {
  border-bottom: 0;
}
.el-menu-item.is-active {
  color: rgb(204, 63, 53) !important;
  border-bottom-color: rgb(204, 63, 53) !important;
}
.h1-title {
  font-size: 24px;
  color: #fff;
  font-weight: normal;
}
.my-menu {
  display: flex;
  align-items: center;
  padding-right: 40px;
  justify-content: space-between;
  height: 60px;
  .menu-left {
    display: flex;
    align-items: center;
    flex: 1;
    .logo-wrap {
      width: 180px;
      display: flex;
      justify-content: center;
      align-items: center;
      .menu-logo {
        max-height: 38px;
      }
    }
    /deep/ .el-menu-item {
      font-size: 14px;
    }
  }
}
</style>
