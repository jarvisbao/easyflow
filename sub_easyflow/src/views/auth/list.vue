<template>
  <div class="app-container">
    <common-title />
    <div class="action-btn clearfix">
      <div id="create" class="btn create-btn" @click="create">
        新建
      </div>
      <div class="right-btn">
        <el-input v-model="text" prefix-icon="el-icon-search" id="search" placeholder="请输入内容" class="search-input" @keyup.enter.native="schfilter" />
      </div>
    </div>
    <el-table
      v-loading="loading"
      :data="items"
      tooltip-effect="dark"
      style="width: 100%"
    >
      <el-table-column prop="to_from_name" label="授权人" />
      <el-table-column prop="to_user_name" label="被授权人" />
      <el-table-column label="授权类型">
        <template slot-scope="scope">
          <span v-if="scope.row.auth_type === 'people'">授权人</span>
          <span v-if="scope.row.auth_type === 'role'">角色</span>
          <span v-if="scope.row.auth_type === 'group'">小组</span>
          <span v-if="scope.row.auth_type === 'organs'">组织</span>
        </template>
      </el-table-column>
      <el-table-column label="开始时间">
        <template slot-scope="scope">
          {{ format(scope.row.start_time) }}
        </template>
      </el-table-column>
      <el-table-column prop="end_time" label="结束时间">
        <template slot-scope="scope">
          {{ format(scope.row.end_time) }}
        </template>
      </el-table-column>
      
      <el-table-column v-if="showColumn" align="right">
        <template slot-scope="scope">
          <i id="edit" class="el-icon-edit" @click="edit(scope.row.auth_id)" />
          <i id="remove" class="el-icon-delete" @click="remove(scope.row.auth_id)" />
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="showPage"
      :page-size="page_size"
      :layout="layout"
      :total="pagination.total"
      :current-page="pagination.page"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <el-dialog v-if="dialogVisible" :visible.sync="dialogVisible" :title="dialogTitle" :close-on-click-modal="false">
      <auth-add-edit :auth_info="auth_info" :auth_id="auth_id" @show="isShow" @refresh="refresh" />
    </el-dialog>
  </div>
</template>
<script>
import CommonTitle from '@/components/CommonTitle'
import authAddEdit from './authEdit'

export default {
  components: {
    CommonTitle,
    authAddEdit
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
      showColumn: false,
      showPage: false,
      dialogVisible: false,
      dialogTitle: '',
      auth_info: {},
      auth_id: null,
      user_list: []
    }
  },
  computed: {
    format() {
      return function(value) {
        if (!value) return ''
        if (Number.isFinite(value)) {
          return this.$Utils.util.formatDate(new Date(value * 1000), 'yyyy-MM-dd hh:mm')
        } else {
          return value
        }
      }
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
    this.getUserList()
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
    getUserList() {
      return new Promise((resolve, reject) => {
        this.$Apis.flowCommon.list_user().then(response => {
          if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
            this.userList = response.payload.map(item => {
              return {
                text: item.text,
                code: item.code.replace('user@','')
              }
            })
          }
          resolve(this.userList)
        })
      })
    },
    fetchData() {
      this.loading = true
      this.$Apis.flow.auth_list(this.text, true, this.pagination.page, this.page_size).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.loading = false
          this.items = response.payload.items
          this.getUserList().then(data => {
            data.forEach(val => {
              this.items.forEach(item => {
                if (item.from_user === val.code) {
                  this.$set(item, 'to_from_name', val.text)
                }
                if (item.to_user === val.code) {
                  this.$set(item, 'to_user_name', val.text)
                }
              })
            })
          })
          this.pagination = response.payload.pagination
          if (this.items.length > 0) {
            this.showColumn = true
            this.showPage = true
          } else {
            this.showColumn = false
            this.showPage = false
          }
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
      this.$Apis.flow.auth_list(this.text, true, this.pagination.page, this.page_size).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.loading = false
          this.items = response.payload.items
          this.getUserList().then(data => {
            data.forEach(val => {
              this.items.forEach(item => {
                if (item.from_user === val.code) {
                  this.$set(item, 'to_from_name', val.text)
                }
                if (item.to_user === val.code) {
                  this.$set(item, 'to_user_name', val.text)
                }
              })
            })
          })
          this.pagination = response.payload.pagination
          if (this.items.length > 0) {
            this.showColumn = true
            this.showPage = true
          } else {
            this.showColumn = false
            this.showPage = false
          }
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
    create() {
      this.dialogVisible = !this.dialogVisible
      this.dialogTitle = '新建授权'
      this.auth_id = null
    },
    edit(auth_id) {
      this.$Apis.flow.auth_view(auth_id).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.dialogVisible = !this.dialogVisible
          this.dialogTitle = '编辑授权'
          this.auth_id = auth_id
          this.auth_info = response.payload
          this.auth_info.start_time = this.format(response.payload.start_time)
          this.auth_info.end_time = this.format(response.payload.end_time)
        }
      })
    },
    remove(auth_id) {
      this.$confirm('是否删除所选?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'confirm-button',
        cancelButtonClass: 'cancel-button'
      }).then(() => {
        this.$Apis.flow.auth_delete(auth_id).then(response => {
          if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
            this.fetchData()
          } else {
            this.$alert(response.message, '提示', {
              confirmButtonText: '确定'
            })
          }
        })
      }).catch(() => {
      })
    },
    set_session() {
      sessionStorage.setItem(this.$route.name, JSON.stringify({ 'path': this.$route.path, 'text': this.text, 'page_index': this.pagination.page, 'page_size': this.page_size }))
    },
    isShow() {
      this.dialogVisible = !this.dialogVisible
    },
    refresh() {
      this.fetchData()
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
