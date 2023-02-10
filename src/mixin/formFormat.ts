import Vue from "vue";
import Component from "vue-class-component";

interface formJsonType {
  label: string;
  data: string;
  prop: string;
  disabled?: boolean;

}

@Component
export default class formFormat extends Vue {
  public formList!: any;
  get extractData() {
    return this.normalExtractData(this.formList);
  }
  get formDataMap() {
    return this.normalFormDataMap(this.formList);
  }
  // 将prop字段作为key，data作为value
  normalExtractData(rawList: Array<formJsonType>) {
    rawList = JSON.parse(JSON.stringify(rawList));
    const temp = {} as any;
    const list = Array.prototype.concat(...rawList);
    list.forEach(({ prop, data }) => {
      if (prop) {
        temp[prop] = data;
      }
    });
    return temp;
  }
  // 将prop作为key,每一项作为value
  normalFormDataMap(rawList: Array<formJsonType>) {
    const temp = {} as any;
    const list = Array.prototype.concat(...rawList);
    list.forEach(data => {
      const { prop } = data;
      temp[prop] = data;
    });
    return temp;
  }
}
