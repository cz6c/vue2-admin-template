const qiniu = require("qiniu-js");
import { getQiNiuToken, qiNiuUpload } from "@/api/public/index";
import Vue from "vue";

/**
 * 上传七牛云函数
 * @param {*} fileData // 接收文件信息，返回raw同级信息
 * @param {*} item // 接收可执行操作对象
 * 
 */
export function qiniuUplod(fileData, item) {
  let file = fileData.raw;
  return new Promise(async (resolve, reject) => {
    // 获取七牛token
    let { data: { key, token, domain } } = await getQiNiuToken();
    // 存储的文件名
    const putExtra = {
      fname: key
    };
    // 是否使用 cdn 加速域名
    const config = {
      useCdnDomain: true
    };
    // 上传至七牛云
    const observable = qiniu.upload(file, key, token, putExtra, config);
    // 回调
    observable.subscribe({
      // 接收上传进度信息的回调函数
      next(res) {
        Vue.set(item, "percent", Math.round(res.total.percent));
      },
      // 上传错误后触发；
      error(err) {
        //  错误回调
        reject("上传失败");
      },
      // 接收上传完成后的后端返回信息
      async complete(res) {
        // 视频地址
        let videoUrl = `${domain}${res.key}`;
        // 设置上传中状态
        Vue.set(item, "isUpload", false);
        // 恢复进度
        Vue.set(item, "percent", 0);
        // 回调视频地址
        resolve(videoUrl);
      }
    });
  });

}

// 获取视频封面
/**
 * 获取视频封面
 * @param {*} fileData // 接收视频地址，包括线上地址和bolb
 * 
 */
export function getVideoBase64(url) {
  return new Promise((resolve, reject) => {
    // 创建视频标签
    let video = document.createElement("video");
    // 设置允许跨域字段
    video.setAttribute("crossOrigin", "anonymous"); //处理跨域
    // 设置视频地址
    video.setAttribute("src", url);
    // 设置宽度
    video.setAttribute("width", 300);
    // 设置高度
    video.setAttribute("height", 146);
    // 设置样式
    video.setAttribute("style", `opacity: 0;position: fixed;left: -999px;top:-999px;z-index:-999;`);
    // 插入body里
    document.body.appendChild(video);
    // 视频跳转到1秒
    video.currentTime = 1;
    // 加载完毕事件
    video.onloadeddata = () => {
      // 等待执行
      setTimeout(async () => {
        // 创建canvas
        const canvas = document.createElement("canvas");
        // 设置宽度
        canvas.width = video.width;
        // 设置高度
        canvas.height = video.height;
        // 设置允许跨域
        canvas.setAttribute("crossOrigin", "anonymous");
        // 初始化
        let ctx = canvas.getContext("2d");
        // 插入视频
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // 获取封面
        const base64Url = canvas.toDataURL("image/jpeg");
        // 删除video标签
        document.body.removeChild(video);
        // base64转bolb及上传视频
        let coverUrl = await dataURLtoFile(base64Url)
        // 回调视频地址
        resolve(coverUrl);
      }, 1500);
    };
  });
}
// // 封面base64转地址
function dataURLtoFile(dataurl) {
  return new Promise(async (resolve, reject) => {
    var arr = dataurl.split(",");
    var mime = arr[0].match(/:(.*?);/)[1];
    var bstr = atob(arr[1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const boldData = new File([u8arr], 'coverImg.jpg', { type: mime });
    const formData = new FormData();
    formData.append("file", boldData);
    const { data: { src } } = await qiNiuUpload(formData);
    resolve(src)
  })
}