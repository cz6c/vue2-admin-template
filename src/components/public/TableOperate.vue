<template>
  <div class="table-operate">
    <div>
      <slot name="leftBtn"> </slot>
    </div>
    <div>
      <slot name="rightBtn"> </slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
@Component({
  name: "TableOperate",
  components: {},
})
export default class TableOperate extends Vue {}
</script>

<style scoped lang="scss">
.table-operate {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
