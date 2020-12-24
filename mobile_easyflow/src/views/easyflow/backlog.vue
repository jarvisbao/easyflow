<template>
  <section class="ticket-list">
    <van-sticky :offset-top="46">
      <search search-text="" search-api="ticket_backlog" />
    </van-sticky>
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-swipe-cell v-for="(item, index) in items" :key="index">
          <van-cell class="title-elli" :to="{name: 'ticket-deal', query: { ticket_id: item.ticket_id, task_id: item.task_id }}">
            <template #title>
              <div class="title">
                {{ item.title }}
              </div>
            </template>
            <template #label>
              <div class="tips">
                <van-tag type="warning">
                  {{ item.node_name }}
                </van-tag>
                <span>{{ item.last_name }}</span><span class="border-left">{{ item.last_time | formatData }}</span>
              </div>
            </template>
          </van-cell>
          <template #right>
            <van-button square type="info" text="查看" @click="taskView(item)" />
          </template>
        </van-swipe-cell>
      </van-list>
    </van-pull-refresh>
  </section>
</template>
<script>
export default {
  components: {
    search: () => import('@/components/search/index')
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
      sText: '搜索我的待办事务'
    }
  },
  created() {
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
      this.$Apis.ticket.ticket_backlog(null, this.pagination.page, this.page_size).then(response => {
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
    },
    taskView(item) {
      this.$router.push({ name: 'ticket-view', query: { ticket_id: item.ticket_id }})
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
