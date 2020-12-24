<template>
  <div class="title-nav">
    <span class="title">{{ title }}</span>
  </div>
</template>
<script>
export default {
  data() {
    return {
      title: ''
    }
  },
  created() {
    this.title = this.$route.meta.title
  }
}
</script>
<style lang="scss" scoped>
.title-nav {
  display: flex;
  margin-top: -20px;
  margin-bottom: 30px;
  color: #666666;
  border-bottom: 1px solid #eee;
  align-items: center;
  .title {
    position: relative;
    display: inline-block;
    padding: 18px 10px;
    color: #666666;
    &::after {
      content: "";
      display: block;
      width: 100%;
      height: 1px;
      background: #ff333b;
      position: absolute;
      left: 0;
      bottom: 0;
    }
  }
}
</style>
