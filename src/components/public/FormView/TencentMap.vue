<template>
  <div class="map-view" :class="{on:isFull}">
    <div ref="tencentMap" class="map" />
    <div class="mask" @click="isFull =!isFull">
      <!-- 全屏 -->
      <svg v-if="!isFull" t="1604905697007" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1916" width="32" height="32">
        <path d="M143 613c17.673 0 32 14.327 32 32v139c0 34.993 28.084 63.426 62.942 63.991L239 848h140c17.673 0 32 14.327 32 32 0 17.496-14.042 31.713-31.47 31.996L379 912H239c-70.692 0-128-57.308-128-128V645c0-17.496 14.042-31.713 31.47-31.996L143 613z m736 0c17.673 0 32 14.327 32 32v139c0 70.692-57.308 128-128 128H643c-17.673 0-32-14.327-32-32 0-17.496 14.042-31.713 31.47-31.996L643 848h140c34.993 0 63.426-28.084 63.991-62.942L847 784V645c0-17.496 14.042-31.713 31.47-31.996L879 613zM379 112c17.673 0 32 14.327 32 32 0 17.673-14.327 32-32 32H239c-34.993 0-63.426 28.084-63.991 62.942L175 240v140c0 17.496-14.042 31.713-31.47 31.996L143 412c-17.673 0-32-14.327-32-32V240c0-70.692 57.308-128 128-128h140z m265 64c-17.673 0-32-14.327-32-32 0-17.496 14.042-31.713 31.47-31.996L644 112h139c70.692 0 128 57.308 128 128v140c0 17.496-14.042 31.713-31.47 31.996L879 412c-17.673 0-32-14.327-32-32V240c0-35.346-28.654-64-64-64l-122-0.001-17 0.001z" fill="#333333" p-id="1917" />
      </svg>
      <!-- 退出全屏 -->
      <svg v-else t="1604905726243" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2230" width="32" height="32">
        <path d="M144 612h140c69.986 0 126.853 56.167 127.983 125.883L412 740v140c0 17.496-14.042 31.713-31.47 31.996L380 912c-17.496 0-31.713-14.042-31.996-31.47L348 880V740l-0.009-1.058c-0.56-34.51-28.432-62.38-62.943-62.934L284 676H144c-17.496 0-31.713-14.042-31.996-31.47L112 644c0-17.496 14.042-31.713 31.47-31.996L144 612z m736.5 0c17.397 0 31.5 14.103 31.5 31.5S897.897 675 880.5 675l-40.5-0.001V676H740c-34.993 0-63.426 28.084-63.991 62.942L676 740v140c0 17.496-14.042 31.713-31.47 31.996L644 912c-17.673 0-32-14.327-32-32V740c0-70.692 57.308-128 128-128h140.5zM380 112c17.673 0 32 14.327 32 32v140c0 70.692-57.308 128-128 128H144c-17.673 0-32-14.327-32-32 0-17.673 14.327-32 32-32h140c34.993 0 63.426-28.084 63.991-62.942L348 284V144c0-17.496 14.042-31.713 31.47-31.996L380 112z m264 0c17.496 0 31.713 14.042 31.996 31.47l0.004 0.53v140l0.009 1.058c0.56 34.51 28.432 62.38 62.943 62.934L740 348h140c17.673 0 32 14.327 32 32 0 17.496-14.042 31.713-31.47 31.996L880 412H740c-69.986 0-126.853-56.167-127.983-125.883L612 284V144c0-17.496 14.042-31.713 31.47-31.996L644 112z" fill="#330000" p-id="2231" />
      </svg>
    </div>
  </div>
</template>
<script>
import { resolve } from "url";
import { setTimeout } from 'timers';
export default {
  props: {
    item: {
      type: Object,
      required: true,
      default: () => { }
    }
  },
  data() {
    return {
      isFull: false,
      nowMarkr: null,
      markers: [],
      map: null,
      mapInfo: null,
      mapOption: {
        zoom: this.item.zoom,
        center: new window.qq.maps.LatLng((this.item.location && this.item.location.lat) || 22.694811, (this.item.location && this.item.location.lng) || 114.231791),
        mapTypeId: window.qq.maps.MapTypeId.ROADMAP,
        draggableCursor: "pointer"
      }
    };
  },

  mounted() {
    this.init();
  },
  methods: {
    async init() {
      // window.qq = await this.TMap()
      this.initMap();
    },
    // TMap() {
    //   return new Promise((resolve, reject) => {
    //     var script = document.createElement("script");
    //     script.setAttribute('charset', 'utf-8')
    //     let key = '4JGBZ-BONRX-FFX42-TM7IG-BVBS3-GFB6P';
    //     script.src = `https://map.qq.com/api/js?v=2.exp&key=${key}`;
    //     script.onerror = reject;
    //     document.body.appendChild(script);
    //     setTimeout(() => {
    //       // console.log(window.qq)
    //       resolve(window.qq)
    //     }, 2000)
    //   })
    // },
    initMap() {
      // 初始化地图
      this.map = new window.qq.maps.Map(this.$refs.tencentMap, this.mapOption);
      // 初始化弹出窗口
      this.mapInfo = new window.qq.maps.InfoWindow({
        map: this.map
      });
      // 地图点击事件，点击添加标记
      window.qq.maps.event.addListener(this.map, "click", (e) => {
        this.mapInfo.close();
        this.$emit("changeLocation", e.latLng);
        if (!this.nowMarkr) {
          this.nowMarkr = new window.qq.maps.Marker({
            position: e.latLng,
            // draggable: true,
            map: this.map
          });
          return;
        }
        this.nowMarkr.setPosition(e.latLng);
      });
    },
    // 清除标记点
    clearMarker() {
      this.markers.forEach(item => {
        item.setMap(null);
      });
    },
    // 搜索
    searchKeyword(keyword) {
      this.mapInfo.close();
      if (this.nowMarkr) {
        this.nowMarkr.setMap(null);
        this.nowMarkr = null;
      }
      // 搜索
      var searchOptions = {
        complete: (results) => {
          const list = results.detail.pois;
          console.log(list);
          if (!list || (list && list.length === 0)) {
            this.$message.error("搜索内容为空，请重新输入（如深圳市xxx）");
            return;
          }
          this.clearMarker();
          list.forEach((item, index) => {
            if (index === 0) {
              this.map.panTo(item.latLng);
            }
            const marker = new window.qq.maps.Marker({
              position: item.latLng,
              map: this.map
            });
            this.markers.push(marker);
            window.qq.maps.event.addListener(marker, "click", (e) => {
              if (this.nowMarkr) {
                this.nowMarkr.setMap(null);
                this.nowMarkr = null;
              }
              this.mapInfo.open();
              this.mapInfo.setContent(`<div style="text-align:center;width:200px;line-height: 1.5;">${item.address || ""}${item.name}</div>`);
              this.mapInfo.setPosition(e.latLng);
              this.$emit("changeLocation", item.latLng);
            });
          });
        },
        // 若服务请求失败，则运行以下函数
        error: () => {
          this.$message.error("搜索内容为空，请重新输入（如深圳市xxx）");
        },
        pageIndex: 1,
        pageCapacity: 10
      };
      // 搜索
      var searchService = new window.qq.maps.SearchService(searchOptions);
      searchService.search(keyword);
    }
  }
};
</script>
<style lang="scss" scoped>
.map-view {
  width: 600px;
  height: 400px;
  border-radius: 4px;
  position: relative;

  &.on {
    width: 1200px;
    height: 600px;
  }
  .map {
    width: 100%;
    height: 100%;
  }
  .mask {
    position: absolute;
    right: 15px;
    bottom: 15px;
    box-shadow: 1px px 1px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    width: 26px;
    height: 26px;
    overflow: hidden;
    background-color: #fff;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: #333;
    svg {
      width: 16px;
      height: 16px;
    }
  }
}
</style>
