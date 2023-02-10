<template>
  <div class="header">
    <div class="logo-wrap">
      <img :src="mainLogo" alt="logo" class="logo-image" />
    </div>
    <div class="menu-right">
      <slot name="menu-right">
        <NavRight />
      </slot>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import NavRight from "./NavRight.vue";
import { LayoutMenuModule } from "@/store/modules/layoutMenu";
@Component({
  components: {
    NavRight,
  },
})
export default class Header extends Vue {
  mainLogo = require("@images/logo.png");
  get matched() {
    return this.$route.matched;
  }
  get isActive() {
    return LayoutMenuModule.sideOpen;
  }
  toggleClick() {
    LayoutMenuModule.sideOpenChange(!this.isActive);
  }
}
</script>

<style lang="scss" scoped>
.header {
  height: 50px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #dddddd;
  box-sizing: border-box;
  .logo-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 179px;
    .logo-image {
      max-height: 38px;
    }
  }
  .menu-right {
    margin-right: 25px;
    margin-left: auto;
    /deep/.menu-content {
      color: #333;
    }
  }
}
</style>
