<template>
  <div class="breadcrumb">
    <div class="side-control">
      <div @click="toggleClick">
        <svg
          :class="{ 'is-active': isActive }"
          class="hamburger"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
        >
          <path
            d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM142.4 642.1L298.7 519a8.84 8.84 0 0 0 0-13.9L142.4 381.9c-5.8-4.6-14.4-.5-14.4 6.9v246.3a8.9 8.9 0 0 0 14.4 7z"
          />
        </svg>
      </div>
    </div>
    <el-breadcrumb>
      <el-breadcrumb-item v-for="(item, index) of matched" :key="index" :to="{ path: item.path }">{{
        item.meta.name
      }}</el-breadcrumb-item>
    </el-breadcrumb>
    <div v-if="isOnlySide" class="menu-right">
      <slot name="menu-right">
        <NavRight />
      </slot>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import NavRight from "./NavRight.vue";
import { LayoutMenuModule } from "@/store/modules/layoutMenu";
@Component({
  components: {
    NavRight,
  },
})
export default class ViewBreadcrumb extends Vue {
  @Prop({
    type: Boolean,
    default: false,
  })
  isOnlySide!: boolean;
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
.breadcrumb {
  height: 50px;
  display: flex;
  align-items: center;
  padding-left: 20px;
  border-bottom: 1px solid #EBEDF4;
  box-sizing: border-box;
  .vertical {
    background: $--color-primary;
    width: 8px;
    height: 22px;
  }

  .menu-right {
    margin-right: 25px;
    margin-left: auto;
    /deep/.menu-content {
      color: #333;
    }
  }
  .side-control {
    margin-right: 15px;
    cursor: pointer;
    .hamburger {
      display: inline-block;
      vertical-align: middle;
      width: 20px;
      height: 20px;
    }

    .hamburger.is-active {
      transform: rotate(180deg);
    }
  }
}
</style>
