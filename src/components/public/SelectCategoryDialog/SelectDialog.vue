<template>
  <el-dialog title="选择分类" class="select-category-dialog" :visible.sync="syncVisible" :close-on-click-modal="false">
    <el-cascader-panel v-model="internalValue" :options="options" :props="{ multiple: true, checkStrictly: true,emitPath:false }"></el-cascader-panel>
    <div class="tag-wrapper">
      <el-tag
        v-for="(tag,index) in tagList"
        :key="tag"
        closable
        disable-transitions
        @close="deleteTag(index)"
      >
        <span>{{ tag }}</span>
      </el-tag>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="syncVisible = false">取 消</el-button>
      <el-button type="primary" @click="handleSubmit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script lang="ts">
import { Component, VModel, Prop } from "vue-property-decorator";
import { mixins } from "vue-class-component";
import { Cascader } from "element-ui";
import initDialog from "@/mixin/initDialog";
import SelectCategoryDialog from "./index.vue"
@Component({
  name: "SelectDialog"
})
export default class SelectDialog extends mixins(initDialog) {
  @VModel({ type: Array, required: true })
  private syncValue!: string[];

  @Prop({ type: Array, required: true, default: [] })
  private options!: Cascader["options"]

  private internalValue: string[] = [];

  private get tagList(): string[] {
    const optionsMap=(this.$parent as SelectCategoryDialog).optionsMap;
    return this.internalValue.map(item => optionsMap[item]);
  }

  private deleteTag(index: number) {
    const { internalValue } = this;
    this.internalValue = internalValue.filter((n, i) => i !== index);
  }
}
</script>

<style scoped lang="scss">
.select-category-dialog{
  .tag-wrapper{
    min-height: 30px;
    padding: 5px;
    border: 1px solid #E4E7ED;
    margin-top: 5px;
    /deep/.el-tag{
      margin-bottom: 5px;
    }
    /deep/:not(:last-child).el-tag{
      margin-right: 5px;
    }
  }
}
</style>
