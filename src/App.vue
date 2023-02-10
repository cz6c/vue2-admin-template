<template>
  <div id="app">
    <router-view class="view-main" />
  </div>
</template>
<script>
export default {
  data() {
    return {};
  },
  mounted() {
    // 检测浏览器路由改变页面不刷新问题,hash模式的工作原理是hashchange事件
    window.addEventListener(
      "hashchange",
      () => {
        const currentPath = window.location.hash.slice(1);
        if (this.$route.path !== currentPath) {
          this.$router.push(currentPath);
        }
      },
      false,
    );
  },
  methods: {},
};
</script>
<style scoped lang="scss"></style>
