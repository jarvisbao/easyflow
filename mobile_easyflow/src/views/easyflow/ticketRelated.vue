<template>
  <section class="ticket-list">
    <van-sticky :offset-top="46">
      <search :search-api="api_name" search-text="" />
    </van-sticky>
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-cell v-for="(item, index) in items" :key="index" class="title-elli" :to="{ name: 'ticket-view', query: { ticket_id: item.ticket_id } }">
          <template #title>
            <div class="title">
              {{ item.title }}
            </div>
          </template>
          <template #label>
            <div class="tips">
              <span>{{ item.last_name }}</span><span class="border-left">{{ item.last_time | formatData }}</span>
            </div>
          </template>
        </van-cell>
      </van-list>
    </van-pull-refresh>
  </section>
</template>
<script>
export default {
  components: {
    search: () => import('@/components/search/index')
  },
  props: {
    api_name: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      items: [],
      page_size: 10,
      pagination: {
        total: 10,
        page: 1
      },
      pages: 1,
      loading: false,
      finished: false,
      refreshing: false,
      searchText: null
    }
  },
  methods: {
    onRefresh() {
      // 清空列表数据
      this.finished = false

      // 重新加载数据
      // 将 loading 设置为 true，表示处于加载状态
      this.loading = true
      this.onLoad()
    },
    onLoad() {
      setTimeout(() => {
        if (this.refreshing) {
          this.items = []
          this.pagination.page = 1
          this.refreshing = false
        }
        this.fetchData()
      }, 1000)
    },
    fetchData() {
      this.loading = true
      const api = this.api_name
      this.$Apis.ticket[api](null, this.pagination.page, this.page_size, true).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          if (response.payload.items.length === 0) {
            this.finished = true
          }
          this.items = [...this.items, ...response.payload.items]
          this.pagination = response.payload.pagination
          if (this.pagination.page === this.pagination.pages) {
            this.finished = true
          } else {
            this.pagination.page += 1
          }
        } else {
          this.finished = true
          this.$dialog.alert({
            message: response.message
          })
        }
        this.loading = false
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.ticket-list {
  /deep/ .search {
    padding: 16px 16px 0;
    background: #fff;
  }
  /deep/ .van-sticky--fixed .search {
    padding-bottom: 16px;
    box-shadow: 0 1px 5px rgba(0,0,0,.15);
  }
}
</style>
