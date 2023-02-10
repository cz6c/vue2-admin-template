import { MessageBox } from "element-ui";

/**
 * 获取 blob
 * @param  {String} url 目标文件地址
 * @return {Promise}
 */
export function getBlob(url: string) {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.response);
      }
    };

    xhr.send();
  });
}

/**
 * 保存
 * @param  {Blob} blob
 * @param  {String} filename 想要保存的文件名称
 */
export function saveAs(blob: Blob | unknown, filename: string) {
  const link = document.createElement("a");
  const body = document.querySelector("body");

  link.href = window.URL.createObjectURL(blob);
  link.download = filename;

  // fix Firefox
  link.style.display = "none";
  body?.appendChild(link);

  link.click();
  body?.removeChild(link);

  window.URL.revokeObjectURL(link.href);
}

/**
 * 下载
 * @param  {String} url 目标文件地址
 * @param  {String} filename 想要保存的文件名称
 */
export async function download(url: string, filename: string) {
  const blob = await getBlob(url);
  saveAs(blob, filename);
}

/**
 * 递归处理数据
 */
export function recursiveData(data: any[]) {
  return data.map(({ id: value, name: label, children }) => {
    const json: any = {
      value,
      label,
      id: value,
    };
    if (children && children.length > 0) {
      json.children = recursiveData(children);
    }
    return json;
  });
}

/**
 * @description: 导出文件方法
 * @param {any} apiMethod 导出接口
 * @param {any} otherProp 其他属性
 * @param {any} params 接口参数
 * @param {any} exportName 导出文件名（默认接口返回名
 * @param {any} isConfirm 是否提示（
 * @return {*}
 */
export async function exportingFile(apiMethod: any, otherProp: any = {}) {
  const { params, exportName, isConfirm = true } = otherProp;
  isConfirm &&
    (await MessageBox.confirm("如果导出数据较大,请耐心等待1~3分钟", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }));
  if (params) {
    delete params["page"];
    delete params["limit"];
    delete params["count"];
  }
  const res = (await apiMethod({
    ...params,
    isExportApi: 1,
  })) as any;
  const filename = res.headers["content-disposition"];
  const blob = new Blob([res.data]);
  const downloadElement = document.createElement("a");
  const href = window.URL.createObjectURL(blob);
  downloadElement.href = href;
  downloadElement.download = filename ? decodeURIComponent(filename.split("filename=")[1]) : `${exportName}.xls`;
  document.body.appendChild(downloadElement);
  downloadElement.click();
  document.body.removeChild(downloadElement);
  window.URL.revokeObjectURL(href);
}
