<template>
  <div class="app-container">
    <common-title />
    <el-table
      v-loading="loading"
      :data="items"
      tooltip-effect="dark"
      style="width: 100%"
    >
      <el-table-column prop="name" label="流程标题" width="" />
      <el-table-column prop="namespace" show-overflow-tooltip label="命名空间" />
      <el-table-column prop="version" label="版本" width="" />
      <el-table-column prop="description" show-overflow-tooltip label="描述" />
      <el-table-column align="right">
        <template slot-scope="scope">
          <el-button id="start" type="text" @click="start(scope.row)">
            启动
          </el-button>
          <!-- <el-button type="text" @click="flowImg(scope.row)">
            流程图
          </el-button> -->
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-if="dialogVisible" :visible.sync="dialogVisible" :title="dialogTitle" :close-on-click-modal="false" width="80%">
      <flow-img :flow-info="def_setting" />
    </el-dialog>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import CommonTitle from '@/components/CommonTitle'
import flowImg from './components/flowImg'

export default {
  components: {
    CommonTitle,
    flowImg
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
      layout: 'sizes, prev, pager, next',
      dialogVisible: false,
      dialogTitle: '',
      flowInfo: {},
      ticketInfo: {}
    }
  },
  computed: {
    ...mapGetters([
      'openid'
    ])
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.loading = true
      this.$Apis.flow.flows_auth(this.openid).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.loading = false
          this.items = response.payload
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
    flowImg(row) {
      this.$Apis.flow.flow_info(row.flow_id).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.flowInfo = response.payload
          this.dialogVisible = !this.dialogVisible
          this.dialogTitle = '流程图'
        }
      })
    },
    start(row) {
      this.$router.push({ name: 'ticket_start', query: { flow_id: row.flow_id }})
    },
    isShow() {
      this.dialogVisible = !this.dialogVisible
    }
  }
}
</script>
