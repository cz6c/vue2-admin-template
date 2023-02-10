<template>
  <div class="menu-content">
    <div class="user-wrap">
      <el-avatar v-if="avatarUrl" :size="35" :src="avatarUrl" />
      <SvgIcon v-else class="avatar-icon" icon="avatar" />
      <span class="userName">{{ userName }}</span>
      <!-- <el-divider direction="vertical" /> -->
    </div>
    <!-- <el-tooltip placement="top">
      <div slot="content" class="message-content">
        <div v-for="(item, index) of showList" :key="index" @click="linkMessageDetail(item.link)">
          {{ item.name }}
        </div>
        <div @click="linkMessageDetail('/operations/message')">全部消息</div>
      </div>
      <div class="message-wrap">
        <i class="el-icon-message-solid message-icon" />
        <span v-show="messageTotal" class="message-total">{{ messageTotal | maximum }}</span>
      </div>
    </el-tooltip> -->
    <i class="el-icon-switch-button close-icon" @click="logout" />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { AuthModule } from "@/store/modules/auth";

@Component({
  filters: {
    maximum(total: number) {
      if (total > 99) {
        return "99+";
      }
      return total;
    },
  },
})
export default class NavRight extends Vue {
  avatar = require("@ass/svg/avatar.svg");
  messageTotal = 0;
  showList = [];

  get userName() {
    return AuthModule.userName;
  }
  get avatarUrl() {
    return AuthModule.avatar;
  }

  logout() {
    this.$confirm("是否退出登录?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }).then(() => {
      this.$store.dispatch("logout");
      this.$router.push("/login");
    });
  }
  linkMessageDetail(link: string) {
    this.$router.push(link);
  }
  // 消息弹窗
  openMessage({ name, link }: any, createTime: number, updateTime: number) {
    const nowTime = +new Date();
    createTime = Number(createTime + "000");
    updateTime = updateTime ? Number(updateTime + "000") : 0;
    const maxTime = Math.max(createTime, updateTime);
    if (nowTime - maxTime < 5000) {
      this.$nextTick(() => {
        this.$notify({
          title: "消息",
          type: "warning",
          dangerouslyUseHTMLString: true,
          message: `<router-link to=${link}>${name}</router-link>`,
        });
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.menu-content {
  display: flex;
  align-items: center;
  color: #fff;
  .user-wrap {
    display: flex;
    align-items: center;
    cursor: pointer;
    /deep/.svg-icon,
    /deep/.el-avatar {
      width: 35px;
      height: 35px;
      img {
        width: 100%;
      }
    }
    .userName {
      margin-left: 10px;
    }
    .avatar-icon {
      width: 35px;
      height: 35px;
    }
  }
  .message-wrap {
    position: relative;
    cursor: pointer;
    .message-icon {
      font-size: 20px;
    }
    .message-total {
      padding: 2px 4px;
      border-radius: 10px;
      background: red;
      position: absolute;
      top: -8px;
      left: 12px;
      font-size: 11px;
    }
  }
  .close-icon {
    margin-left: 10px;
    font-size: 20px;
    cursor: pointer;
  }
}
.message-content {
  div {
    margin: 10px 0;
    text-align: center;
    cursor: pointer;
  }
}
</style>
