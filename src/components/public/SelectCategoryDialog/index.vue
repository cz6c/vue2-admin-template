<template>
    <div class="select-category-dialog">
        <div class="tag-wrapper" v-if="tagList.length">
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
        <el-button class="select-btn" type="primary" @click="openDialog">选择分类</el-button>
        <select-dialog  v-model="syncValue" :visible.sync="dialogVisible" :options="options"></select-dialog>
    </div>
</template>
 
<script lang="ts">
import { Component, Vue, Prop, VModel } from "vue-property-decorator"
import { Cascader } from "element-ui";
import SelectDialog from "./SelectDialog.vue"
@Component({
  name: "SelectCategoryDialog",
  components: {
    SelectDialog
  }
})
export default class SelectCategoryDialog extends Vue {
  @VModel({ type: Array, required: true })
  private syncValue!: string[];

  @Prop({ type: Array, required: true, default: [] })
  private options!: Cascader["options"]

  public get optionsMap(): { [key: string]: string } {
    let result: { [key: string]: string } = {};
    const extractValue = (list: Cascader["options"]) => {
      list.forEach(({ label, value, children }) => {
        if (children) {
          extractValue(children)
        }
        result[value] = label;
      })
    }
    extractValue(this.options)
    return result;
  }

  dialogVisible = false;

  private get tagList(): string[] {
    return this.syncValue.map(item => this.optionsMap[item]);
  }

  private deleteTag(index: number) {
    const { syncValue } = this;
    this.syncValue = syncValue.filter((n, i) => i !== index);
  }
  openDialog() {
    this.dialogVisible = true;
  }
}
</script>

<style lang="scss" scoped>
.select-category-dialog{
    display: flex;
    align-items: center;
    .tag-wrapper+.select-btn{
        margin-left: 5px;   
    }
}
</style>