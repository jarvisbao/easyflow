<template>
  <div>
    <section class="app-main">
      <div>
        <router-view :key="$route.fullPath" />
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Layout',
  data() {
    return {
      isShow: true
    }
  },
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import url("//at.alicdn.com/t/font_1321656_qrlhtqp5ah.css");
.app-main {
  // min-height: calc(100vh);
}
</style>
