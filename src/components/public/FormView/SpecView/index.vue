<template>
  <div class="spec">
    <!-- 规格添加框 -->
    <el-input v-model.trim="appendSpec" placeholder="如颜色,尺寸,套餐" class="spec-input">
      <template slot="prepend">规格组</template>
      <template slot="append">
        <el-button type="primary" :disabled="!appendSpec" class="append-btn" @click="handleAppendSpec">添加</el-button>
      </template>  
    </el-input>
    <el-button class="select-spec-btn" type="primary" plain @click="templateDialogVisible=true">选择规格模板</el-button>
    <span class="select-spec-tips">注：规格组最多添加5个</span>
    <!-- 规格展示 -->
    <div class="spec-wrap">
      <div v-for="(specValueData, key, index) of specData" :key="key" class="spec-item">
        <el-tag effect="dark" closable @close="handleDelectSpec(key)">{{key}}</el-tag>
        <div class="spec-value-wrap">
          <el-tag v-for="tag in specValueData.sepcValueList" :key="tag" closable :disable-transitions="false" @close="handleCloseSpecValue(specValueData.sepcValueList, tag)">
            {{ tag }}
          </el-tag>
          <el-input v-if="specValueData.specValueInputVisible" ref="specValueInput" v-model="appendSpecValue" class="input-new-tag" size="small" @keyup.enter.native="handleAppendSpecValue(specValueData)" @blur="handleAppendSpecValue(specValueData)" />
          <el-button v-else class="button-new-tag" size="small" @click="showSpecValue(index, specValueData)">+ 规格值</el-button>
        </div>
      </div>
    </div>
    <div class="suk-view">
      <div class="sub-title">价格和库存</div>
      <!--- SKU列表 --->
      <el-table :data="skuList" border class="table-view">
        <el-table-column v-for="spec of specList" :key="spec" :label="spec" :prop="spec" align="center" />

        <el-table-column align="center" fixed="right" width="180px" v-for="({type,thead,tbody},index) in skuValueList" :key="index">
          <template slot="header" slot-scope>
            <DigitalInput v-model="thead.value" submitText="设置" size="small" @submit="unifiedChange(tbody.props,thead.value)" :placeholder="thead.placeholder" :inputType="type" />
          </template>
          <template slot-scope="scope">
            <DigitalInput v-model="scope.row[tbody.props]" :unit="tbody.unit" unitPosition="right" size="small" :placeholder="tbody.placeholder" :inputType="type" />
          </template>
        </el-table-column>
      </el-table>
    </div>
    <template-dialog v-model="templateDialogValue" :visible.sync="templateDialogVisible" v-bind="$attrs"></template-dialog>
  </div>
</template>
<script>
import TemplateDialog from "./components/TemplateDialog.vue"
export default {
  components: {
    TemplateDialog
  },
  props: {
    value: {
      type: Object,
      default: () => { }
    },
    // 开启中英文两种格式
    i18n: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      // ---------- 规格模板弹窗
      templateDialogVisible: false,
      // ---------- 规格
      appendSpec: "",
      specData: {},
      // ---------- 规格值
      appendSpecValue: "",
      // ---------- SKU列表
      unifyPrice: "", // 统一价格
      unifyStock: "", // 统一库存
      unifyWeight: "", // 统一重量
      unifyProductCode: "", // 统一货号
      // 规格值循环
      skuValueList: [
        {
          thead: {
            value: '',
            placeholder: '统一价格',
            event: this.unifyPriceConfig,
          },
          tbody: {
            props: 'sellingPrice',
            unit: '元',
            placeholder: '请输入价格',
          }
        },
        {
          thead: {
            value: '',
            placeholder: '统一库存',
            event: this.unifyStockConfig,
          },
          tbody: {
            props: 'goodsNum',
            unit: '件',
            placeholder: '请输入库存',
          }
        },
        {
          thead: {
            value: '',
            placeholder: '统一重量',
            event: this.unifyPriceConfig,
          },
          tbody: {
            props: 'goodsWeight',
            unit: 'g',
            placeholder: '请输入重量',
          }
        },
        {
          type: 'text',
          thead: {
            value: '',
            placeholder: '统一货号',
            event: this.unifyPriceConfig,
          },
          tbody: {
            props: 'productCode',
            unit: '',
            placeholder: '请输入货号',
          }
        }
      ]
    };
  },
  computed: {
    templateDialogValue: {
      get() {
        let result = [];
        this.specList.forEach((group, index) => {
          const valueList = this.specValueList[index];
          valueList.forEach((value) => {
            result.push([group, value])
          })
        })
        return result;
      },
      // 拿到模板弹窗的数据后,解析添加进specList和specValueList
      set(templateValue) {
        console.log("templatasdaeValue")
        templateValue.forEach(([group, value]) => {
          if (this.specData[group]) {
            const specValueList = this.specData[group].sepcValueList;
            if (!specValueList.includes(value)) {
              specValueList.push(value)
            }
          } else {
            this.$set(this.specData, group, {
              sepcValueList: [value],
              specValueInputVisible: false
            });
          }
        })
        // this.$set(this.specData, this.appendSpec, {
        //   sepcValueList: [],
        //   specValueInputVisible: false
        // });
      }
    },
    specList() {
      return Object.keys(this.specData);
    },
    specValueList() {
      return Object.values(this.specData).map(({ sepcValueList }) => {
        return sepcValueList;
      });
    },
    skuList() {
      const skuRawList = this.specValueList;
      if (!(skuRawList && skuRawList.length)) {
        return [];
      }
      const skuList = this.descartes(skuRawList);
      let data = [];
      if (skuList) {
        data = skuList.map((sku) => {
          const temp = {};
          sku.forEach((specValue, index) => {
            temp[this.specList[index]] = specValue;
            this.$set(temp, "sellingPrice", "");
            this.$set(temp, "goodsNum", "");
            this.$set(temp, "goodsWeight", "");
            this.$set(temp, "productCode", "");
          });
          return temp;
        });
      }
      return data;
    },
    // 组合数据调用v-model
    zhData() {
      const results = {
        attrName: [],
        attrValue: []
      };
      if (this.i18n) {
        // attrName
        results.attrName = this.specList.map((item) => {
          return this.extractLangData(item);
        });
        // attrValue
        results.attrValue = this.normalAttrValueLangData();
      } else {
        results.attrName = this.specList;
        results.attrValue = this.specValueList;
      }
      return results;
    },
    // spu列表结果数据
    skuListResults() {
      const results = {
        specValue: {}
      };
      const specMap = this.specList;
      this.skuList.forEach((item) => {
        // const { sellingPrice, goodsNum, goodsWeight, productCode } = item;
        const keysList = specMap.map((key) => {
          return item[key];
        });
        const Key = this.extractLangSpecValue(keysList);
        results.specValue[Key] = item;
      });
      return results;
    },
    results() {
      const { attrName, attrValue } = this.zhData;
      const { specValue } = this.skuListResults;
      return { attrName, attrValue, specValue };
    }
  },
  watch: {
    results: {
      handler() {
        this.$emit("change", this.results);
      },
      deep: true
    }
  },
  created() {
    const { attrValue, specNumPrive } = this.value;
    if (attrValue && specNumPrive) {
      this.initSpecData(attrValue);
      this.$nextTick(() => {
        this.initSkuList(specNumPrive);
      });
    }
  },
  methods: {
    isInteger(event, key) {
      const num = event[key];
      if (num <= 0 && num != "") {
        event[key] = 0;
      }
    },
    initSpecData(data) {
      const result = {};
      Object.entries(data).forEach(([key, value]) => {
        const sepcValueList = value.map(({ attrValue }) => {
          return attrValue;
        });
        result[key] = { sepcValueList, specValueInputVisible: false };
      });
      this.specData = result;
    },
    initSkuList(data) {
      const specList = this.specList;
      this.skuList.forEach((skuData) => {
        const keys = specList
          .reduce((target, value) => {
            target.push(skuData[value]);
            return target;
          }, [])
          .join("-");
        const { goodsNum, productCode, goodsWeight, sellingPrice, specImg } = data[keys];
        Object.assign(skuData, {
          goodsNum,
          goodsWeight,
          productCode,
          sellingPrice,
          specImg
        });
      });
    },
    // -------------------- 规格 开始 -------------------------
    // 添加spec
    handleAppendSpec() {
      if (!this.appendSpec) {
        this.$message.warning("规格不能为空");
        return;
      }
      if (this.specData[this.appendSpec]) {
        this.$message.warning("已有相同的规格");
        return;
      }
      this.$set(this.specData, this.appendSpec, {
        sepcValueList: [],
        specValueInputVisible: false
      });
      this.appendSpec = "";
    },
    // 删除spec
    handleDelectSpec(key) {
      this.$delete(this.specData, key);
    },
    // -------------------- 规格 结束 -------------------------
    // -------------------- 规格值 开始 -------------------------
    // 展示 《规格值框》
    showSpecValue(index, specValueData) {
      specValueData.specValueInputVisible = true;
      this.$nextTick(() => {
        this.$refs.specValueInput[0].$refs.input.focus();
      });
    },
    // 添加spec-value
    handleAppendSpecValue(sepcValueList) {
      const appendValue = this.appendSpecValue;
      const isSame = () => {
        const temp = [];
        Object.values(this.specData).forEach(({ sepcValueList }) => {
          temp.push(sepcValueList);
        });
        const allSpecValue = new Set(Array.prototype.concat(...temp));
        if (allSpecValue.has(appendValue)) {
          return true;
        } else {
          return false;
        }
      };
      if (!appendValue) {
        // this.$message.warning("规格值不能为空");
      } else if (sepcValueList.sepcValueList.includes(appendValue)) {
        this.$message.warning("已有相同的规格值");
      } else if (isSame()) {
        this.$message.warning(`已有重复的规格值`);
      } else {
        sepcValueList.sepcValueList.push(appendValue);
      }
      sepcValueList.specValueInputVisible = false;
      this.appendSpecValue = "";
    },
    // -------------------- 规格值 结束 -------------------------
    // -------------------- SKU列表 开始 ---------------------------
    // 算法-笛卡尔积
    descartes(array) {
      if (array.length < 2) {
        return (
          array[0].map((item) => {
            return [item];
          }) || []
        );
      }
      return [].reduce.call(array, function (col, set) {
        var res = [];
        col.forEach(function (c) {
          set.forEach(function (s) {
            var t = [].concat(Array.isArray(c) ? c : [c]);
            t.push(s);
            res.push(t);
          });
        });
        return res;
      });
    },
    // 统一设置值
    unifiedChange(props, val) {
      this.skuList.forEach((item) => {
        item[props] = val
      });
    },
    // 删除规格组
    handleCloseSpecValue(specValueList, tag) {
      const index = specValueList.indexOf(tag);
      specValueList.splice(index, 1);
    },
    // -------------------- SKU列表 结束 ---------------------------
    // -------------------- 结果处理 开始 ---------------------------
    // 提取语言数据
    extractLangData(text, index = 0) {
      const langList = text.split("|");
      return langList[index] ? langList[index] : langList[--index];
    },
    // 格式化attrValue,中英文切换
    normalAttrValueLangData(index = 0) {
      return this.specValueList.map((valueList) => {
        return valueList.map((value) => {
          return this.extractLangData(value, index);
        });
      });
    },
    extractLangSpecValue(list, index = 0) {
      return list
        .map((text) => {
          return this.extractLangData(text, index);
        })
        .join("|");
    },
    getSpecResults() {
      return this.results;
    }
  }
};
</script>
<style lang="scss" scoped>
.select-spec-btn{
  margin: 0 10px;
}
.select-spec-tips{
  font-weight: 400;
  font-style: normal;
  font-size: 13px;
  color: #999999;
}
.spec-input {
  width: 350px !important;
  margin-bottom: 10px;
}
.suk-view {
  position: relative;
  .sub-title {
    position: absolute;
    top: 0;
    left: -100px;
    width: 100px;
    text-align: right;
    color: #606266;
    padding-right: 12px;
    box-sizing: border-box;
  }
  .table-view {
    min-width: 800px;
    max-width: 1200px;
    border-radius: 4px;
    /deep/th {
      padding: 5px 0;
    }
  }
}

.appendSpec {
  width: 100%;
  height: 100%;
}
.spec-wrap {
  .spec-item {
    border: 1px solid #ebeef5;
    min-width: 500px;
    max-width: 50%;
    margin-bottom: 10px;
    padding: 10px;
    padding-bottom: 5px;
    border-radius: 4px;
    .spec-value-wrap {
      line-height: normal;
    }
    .el-tag {
      margin-right: 10px;
      vertical-align: top;
      margin-bottom: 5px;
    }
    .button-new-tag {
      height: 32px;
      padding-top: 0;
      padding-bottom: 0;
      width: 90px !important;
      vertical-align: top;
      border-radius: 4px;
      // border-color: #EBEEF5;
    }
    .input-new-tag {
      width: 90px !important;
      vertical-align: top;
    }
  }
}
/deep/.has-gutter .el-input {
  width: 330px !important;
}
p {
  margin: 0;
  padding: 0;
}

/deep/.el-input-group__append {
  border: 0;
  button {
    border: 1px solid #dcdfe6;
    border-left: 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    /deep/ &.append-btn {
      border-color: #409efe;
      background: $--color-primary !important;
      border-radius: 4px;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border: 0;
      height: 40px;
      overflow: hidden;
      color: white !important;
      margin-left: -21px;
      &.is-disabled {
        color: #fff;
        background-color: #a0cfff !important;
        border-color: #a0cfff !important;
      }
    }
  }
}
</style>
