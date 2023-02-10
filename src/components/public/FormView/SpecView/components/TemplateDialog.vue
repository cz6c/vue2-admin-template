<template>
 <div class="template-dialog">
   <el-dialog title="选择规格模板" class="template-dialog" :visible.sync="internalVisible" width="500px">
    <span class="ground-tips">选择规格组</span>
    <span class="value-tips">选择规格值</span>
    <el-cascader-panel v-model="internalValue" :options="templateOptions" :props="{ multiple: true}"></el-cascader-panel>
    <span slot="footer" class="dialog-footer">
      <el-button @click="syncVisible = false">取 消</el-button>
      <el-button type="primary" @click="handleSubmit">确 认</el-button>
    </span>
  </el-dialog>
 </div>
</template>
 
<script lang="ts">
import { Component, VModel, Prop, PropSync, Watch } from "vue-property-decorator";
import { mixins } from "vue-class-component";
import initDialog from "@/mixin/initDialog";
import { Cascader } from "element-ui";
@Component({
  name: "TemplateDialog"
})
export default class TemplateDialog extends mixins(initDialog) {
  @VModel({ type: Array, default: true })
  private syncValue!: string[][];

  @Prop({ type: Boolean, required: true })
  private visible!: boolean;

  @Prop({ type: Array, required: true })
  private templateOptions!: Cascader["options"];

  private internalValue: string[][] = [];

  // 用户点击<选择规格模板>有两种模式,1.有数据打开<弹窗>,2.没数据打开<提示>
  public get internalVisible(): boolean {
    return !!(this.visible && this.templateOptions.length)
  }
  public set internalVisible(value: boolean) {
    this.$emit("update:visible", value)
  }

  @Watch("visible")
  openTips(newVal: boolean) {
    // 用户点击了<选择规格模板>但是弹窗没有打开,所以这里开启<提示>
    if (newVal && !this.internalVisible) {
      const h = this.$createElement;
      this.$msgbox({
        title: '提示',
        message: h('div', {}, [
          h('p', {}, '暂无规格模板数据'),
          h('p', {}, [
            h('span', {}, '请先至'),
            h('span', {
              style: 'color: #1890FF;cursor: pointer'
            }, '商品-规格模板'),
            h('span', {}, '中添加'),
          ]),
        ]),
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        beforeClose: (action, instance, done) => {
          this.internalVisible = false;
          done();
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.template-dialog{
  /deep/.el-dialog__body {
    padding: 20px 20px 10px 20px !important;
  }
  /deep/.el-cascader-menu{
    min-width: 226px;
  }
  .ground-tips,.value-tips{
    position: absolute;
    top: 50px;
  }
  .value-tips{
    left: 250px;
  }
}
</style>
<style lang="scss">
.el-message-box{
    .el-message-box__title{
        font-size: 14px;
        margin-left: 38px;
    }
    .el-message-box__status{
        position: absolute;
        top: -26px;
    }
}
</style>