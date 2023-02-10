<template>
  <el-dialog
    v-dragDialog
    :close-on-click-modal="closeOnClickModal"
    class="form-dialog-wrap"
    :title="title"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    :width="width"
    :class="{ coverd: isFullscreen }"
    :show-close="isHasClose"
    append-to-body
  >
    <!-- <div slot="title" class="title-view">
      <div class="left-vi">
        {{ title }}
      </div>
      <div class="right-vi">
        <div v-if="isHasClose" class="icon-btn" @click="isCovered ? goHome() : (isVisible = false)">
          <i class="el-icon-close"></i>
        </div>
      </div>
    </div> -->
    <div class="dialog-content" :class="{ 'hide-label': isHideLabel }">
      <el-alert
        v-if="tipsText"
        class="tips-view"
        :title="tipsText"
        type="warning"
        show-icon
        :closable="false"
      ></el-alert>
      <FormView
        ref="formView"
        v-model="formList"
        :labelWidth="labelWidth"
        :itemContentWidth="itemContentWidth"
        :labelPosition="labelPosition"
        :isLabelColon="isLabelColon"
        :isFixed="false"
        :columns="columns"
      />
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button v-if="isHasClose" @click="handleClose">取 消</el-button>
      <el-button type="primary" :loading="isLoading" @click="handleAction">{{ submitText }}</el-button>
    </span>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { ruleFormType } from "./index.d";
import { Form } from "element-ui";
import { formJsonType } from "@/utils/public";
import { mixins } from "vue-class-component";
import formFormat from "@/mixin/formFormat";

@Component({
  name: "FormDialog",
})
export default class FormDialog extends mixins(formFormat) {
  public success!: (value: ruleFormType, instance: FormDialog, done: () => void) => void;
  public change!: (value: any, instance: FormDialog) => void;
  public cancel!: () => void;
  tipsText = "";
  title = "";
  isLoading = false;
  dialogVisible = true;
  submitText = "提 交";
  formList: formJsonType[] = [];
  labelWidth = "80px";
  itemContentWidth = "270px";
  labelPosition = "left";
  columns = 0;
  closeOnClickModal = false;
  isHasClose = true;
  width = "450px";
  isHideLabel = false;
  isLabelColon = false;
  isFullscreen = false;
  @Watch("extractData", { deep: true })
  changeList(value: any, oValue: any) {
    console.log(value, oValue);
    if (JSON.stringify(value) === JSON.stringify(oValue)) return;
    this.change && this.change(this.extractData, this);
  }
  mounted() {
    this.$nextTick(() => {
      this.$refs.formView && (this.$refs.formView as any).$el[0] && (this.$refs.formView as any).$el[0].focus();
    });
  }

  handleClose() {
    this.dialogVisible = false;
    this.$el.parentNode?.removeChild(this.$el);
    this.cancel && this.cancel();
  }
  handleAction() {
    const formEle = this.$refs.formView as any;
    (formEle.$refs.form as Form).validate(async valid => {
      if (valid) {
        const formData = formEle.normalExtractData(formEle.value);
        this.success && this.success(formData, this, this.handleClose);
      }
    });
  }
}
</script>

<style lang="scss" scoped>
.el-form {
  .el-form-item {
    &:last-of-type {
      margin-bottom: 0;
    }
  }
}
.tips-view {
  margin-bottom: 20px;
}
.form-dialog-wrap {
  &.coverd {
    /deep/.el-dialog {
      width: 100% !important;
      height: 100%;
      border-radius: 0;
      .el-dialog__header {
        cursor: default !important;
      }
      .el-dialog__headerbtn {
        display: none;
      }
      .el-dialog__body {
        height: calc(100% - 96px) !important;
        > div {
          height: 100%;
          .dialog-content {
            max-height: initial;
            box-sizing: border-box;
          }
        }
      }
    }
  }

  /deep/.el-dialog {
    width: 100%;
    .el-dialog__body {
      padding: 0;
      max-height: initial;
      overflow: hidden;
      .dialog-content {
        max-height: 80vh;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 15px 5px;
        padding-bottom: 0;
        &.hide-label {
          .el-form-item__label {
            display: none;
          }
        }
      }
      .dialog-footer {
        text-align: right;
        padding: 11px 10px;
        border-top: 1px solid #f0f0f0;
      }
    }
    // .el-dialog__header {
    //   padding: 0;
    //   user-select: none;
    //   .title-view {
    //     height: 44px;
    //     display: flex;
    //     align-items: center;
    //     justify-content: space-between;
    //     padding: 0 15px;
    //     .left-vi {
    //       display: flex;
    //       align-items: center;
    //       .sub-task {
    //         margin: 0 10px;
    //         font-size: 12px;
    //         color: #666;
    //       }
    //     }
    //     .right-vi {
    //       display: flex;
    //       align-items: center;
    //       height: 100%;
    //       .go-home {
    //         margin-left: auto;
    //         margin-right: 0;
    //       }
    //       .icon-btn {
    //         display: flex;
    //         align-items: center;
    //         font-size: 20px;
    //         margin-right: 5px;
    //         margin-left: 10px;
    //         height: 100%;
    //         cursor: pointer;
    //         color: #909399;
    //         transition: 0.3s;
    //         &.svg-icon {
    //           width: 16px;
    //           height: 16px;
    //         }
    //         &.active,
    //         &:hover {
    //           color: $--color-primary;
    //         }
    //       }
    //     }
    //   }
    // }
  }
}
</style>
