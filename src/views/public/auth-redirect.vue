<template>
  <div />
</template>
<script>
export default {
  name: "AuthRedirect",
  created() {
    const redirect = this.$route.query.redirect;
    console.log("AuthRedirect", redirect);
    this.$router.push(redirect);
  }
};
</script>
