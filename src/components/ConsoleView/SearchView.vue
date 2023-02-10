<template>
  <div class="search-wrapper">
    <div>
      <slot name="search"> </slot>
    </div>
    <i class="el-icon-close" @click="$parent.viewStatus = 'ConsoleLog'"></i>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
@Component({
  name: "SearchView",
})
export default class SearchView extends Vue {}
</script>

<style scoped lang="scss">
.search-wrapper {
  .el-icon-close {
    font-size: 24px;
    cursor: pointer;
  }
  /deep/.el-form--inline {
    display: flex;
    align-items: center;
    > * {
      margin-bottom: 0 !important;
    }
  }
}
</style>
