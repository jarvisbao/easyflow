<template>
  <div class="app-container">
    <common-title />
    <div class="action-btn clearfix">
      <div class="right-btn">
        <el-input v-model="text" prefix-icon="el-icon-search" placeholder="请输入内容" class="search-input" @keyup.enter.native="schfilter" />
      </div>
    </div>
    <el-table
      v-loading="loading"
      :data="items"
      tooltip-effect="dark"
      style="width: 100%"
    >
      <el-table-column prop="global_no" label="序号" />
      <el-table-column prop="flow_name" show-overflow-tooltip label="项目名称" width="280" />
      <el-table-column prop="title" show-overflow-tooltip label="工单标题" width="350" />
      <el-table-column label="任务类型" width="80">
        <template slot-scope="scope">
          <el-button v-if="scope.row.ttype==='parallel'" type="success" size="mini" style="cursor: text;">
            并行
          </el-button>
          <el-button v-if="scope.row.ttype==='sole'" type="success" size="mini" style="cursor: text;">
            单一
          </el-button>
          <el-button v-if="scope.row.ttype==='serial'" type="success" size="mini" style="cursor: text;">
            串行
          </el-button>
          <el-button v-if="scope.row.ttype==='loop'" type="success" size="mini" style="cursor: text;">
            循环
          </el-button>
          <!-- {{ scope.row.ttype }} -->
        </template>
      </el-table-column>
      <el-table-column prop="node_name" show-overflow-tooltip label="节点名称" width="160" />
      <el-table-column prop="owners_name" show-overflow-tooltip label="处理人/组" width="120" />
      <el-table-column prop="last_name" label="最后处理人" width="120" />
      <el-table-column label="创建时间" width="160">
        <template slot-scope="scope">
          {{ scope.row.create_time | formatData }}
        </template>
      </el-table-column>
      <el-table-column label="最后处理时间" width="160">
        <template slot-scope="scope">
          {{ scope.row.last_time | formatData }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" align="right">
        <template slot-scope="scope">
          <el-button id="task-deal" type="text" @click="taskDeal(scope.row)">
            处理
          </el-button>
          <el-button id="task-view" type="text" @click="taskView(scope.row)">
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :page-size="page_size"
      :layout="layout"
      :total="pagination.total"
      :current-page="pagination.page"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>
<script>
import CommonTitle from '@/components/CommonTitle'

export default {
  components: {
    CommonTitle
  },
  data() {
    return {
      loading: false,
      items: [],
      text: null,
      page_size: 10,
      pagination: {
        total: 10,
        page: 1
      },
      layout: 'sizes, prev, pager, next'
    }
  },
  watch: {
    'pagination.total': function(val) {
      if (this.pagination.total === (this.pagination.page - 1) * this.page_size && this.pagination.total !== 0) {
        this.pagination.page -= 1
        this.fetchData()
      }
    }
  },
  created() {
    this.get_page_params()
    this.fetchData()
  },
  methods: {
    get_page_params() {
      if (sessionStorage.getItem(this.$route.name)) {
        const pageParams = JSON.parse(sessionStorage.getItem(this.$route.name))
        if (this.$route.path === pageParams.path) {
          this.text = pageParams.text
          this.pagination.page = pageParams.page_index
          this.page_size = pageParams.page_size
        }
      }
    },
    fetchData() {
      this.loading = true
      this.$Apis.ticket.ticket_backlog(this.text, this.pagination.page, this.page_size).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.loading = false
          this.items = response.payload.items
          this.pagination = response.payload.pagination
        } else {
          this.$alert(response.message, '提示', {
            confirmButtonText: '确定',
            callback: action => {
              this.loading = false
            }
          })
        }
      })
    },
    operateData() {
      this.$Apis.ticket.ticket_backlog(this.text, this.pagination.page, this.page_size).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.loading = false
          this.items = response.payload.items
          this.pagination = response.payload.pagination
        } else {
          this.$alert(response.message, '提示', {
            confirmButtonText: '确定',
            callback: action => {
              this.loading = false
            }
          })
        }
      })
    },
    schfilter() {
      this.pagination.page = 1
      this.operateData()
    },
    handleSizeChange(val) {
      this.page_size = val
      this.operateData()
    },
    handleCurrentChange(val) {
      this.pagination.page = val
      this.operateData()
    },
    set_session() {
      sessionStorage.setItem(this.$route.name, JSON.stringify({ 'path': this.$route.path, 'text': this.text, 'page_index': this.pagination.page, 'page_size': this.page_size }))
    },
    taskDeal(row) {
      this.set_session()
      this.$router.push({ name: 'ticket_deal', query: { ticket_id: row.ticket_id, task_id: row.task_id }})
    },
    taskView(row) {
      this.set_session()
      this.$router.push({ name: 'ticket_view', query: { ticket_id: row.ticket_id }})
    }
  }
}
</script>
