<template>
  <div class="search">
    <div class="search-box" @click="toSearch">
      <van-icon name="search" />
      <span class="text">{{ text }}</span>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Search',
  props: {
    searchText: {
      type: String,
      default: '搜索我的事务'
    },
    searchApi: {
      type: String,
      default: 'initiated_ticket'
    }
  },
  data() {
    return {
      text: this.searchText
    }
  },
  methods: {
    toSearch() {
      this.$router.push({ name: 'search', params: { api: this.searchApi }})
    }
  }
}
</script>
<style lang="scss" scoped>
.search {
  flex: 1;
  .search-box {
    display: flex;
    height: 34px;
    padding-left: 12px;
    background: #f7f8fa;
    border-radius: 999px;
    align-items: center;
    font-size: 16px;
    .text {
      margin-left: 4px;
      font-size: 14px;
      color: #c3c3c3;
    }
  }
}
</style>
