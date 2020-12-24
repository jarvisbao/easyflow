<template>
  <el-form ref="form" :model="auth" :rules="rules" label-width="100px">
    <el-form-item label="被授权人" prop="to_user">
      <el-select v-model="auth.to_user">
        <el-option v-for="(item, index) in userList" :key="index" :label="item.text" :value="item.code" :disabled="item.disabled" />
      </el-select>
    </el-form-item>
    <el-form-item label="授权类型" prop="auth_type">
      <el-select v-model="auth.auth_type" @change="handleChange">
        <el-option v-for="(item, index) in authType" :key="index" :label="item.label" :value="item.value" />
      </el-select>
    </el-form-item>
    <el-form-item v-if="auth.auth_type && auth.auth_type !== 'people'" :label="title" prop="value">
      <el-select v-model="auth.value" v-loadmore="loadMore">
        <template v-if="auth.auth_type === 'flow'">
          <el-option v-for="(item, index) in flowList" :key="index" :label="item.name" :value="item.flow_id" />
        </template>
        <template v-if="auth.auth_type === 'ticket'">
          <el-option v-for="(item, index) in ticketList" :key="index" :label="item.title" :value="item.ticket_id" />
        </template>
        <template v-if="auth.auth_type === 'role'">
          <el-option v-for="(item, index) in myroles" :key="index" :label="item.role_name" :value="item.role_id" />
        </template>
        <template v-if="auth.auth_type === 'group'">
          <el-option v-for="(item, index) in groups" :key="index" :label="item.group_name" :value="item.group_id" />
        </template>
        <template v-if="auth.auth_type === 'organs'">
          <el-option v-for="(item, index) in orgs" :key="index" :label="item.name" :value="item.org_code" />
        </template>
      </el-select>
    </el-form-item>
    <el-form-item label="授权状态" prop="status">
      <el-radio-group v-model="auth.status">
        <el-radio label="enable">启用</el-radio>
        <el-radio label="disable">禁用</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="开始时间">
      <el-date-picker
        v-model="auth.start_time"
        type="datetime"
        format="yyyy-MM-dd HH:mm"
        value-format="yyyy-MM-dd HH:mm"
        placeholder="选择开始时间" />
        <span class="tips">不填日期表示立即生效</span>
    </el-form-item>
    <el-form-item label="结束时间">
      <el-date-picker
        v-model="auth.end_time"
        type="datetime"
        format="yyyy-MM-dd HH:mm"
        value-format="yyyy-MM-dd HH:mm"
        placeholder="选择结束时间" />
        <span class="tips">不填日期表示永久有效</span>
    </el-form-item>
    <el-form-item>
      <el-button id="confirm" :loading="loading" type="danger" @click="submitForm('form')">
        {{ auth_id ? '立即修改' : '立即创建'}}
      </el-button>
      <el-button id="cancel" plain @click="resetForm('form')">
        取消
      </el-button>
    </el-form-item>
  </el-form>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    auth_id: {
      type: String,
      default: null
    },
    auth_info: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      loading: false,
      auth: {
        to_user: null,
        auth_type: null,
        start_time: null,
        end_time: null,
        value: null,
        status: null
      },
      rules: {
        to_user: { required: true, message: '请选择被授权人', trigger: 'change' },
        auth_type: { required: true, message: '请选择授权类型', trigger: 'change' },
        value: { required: true, message: '请选择授权值', trigger: 'change' },
        status: { required: true, message: '请选择授权状态', trigger: 'change' },
      },
      userList: [],
      flowList: [],
      ticketList: [],
      authType: [
        {
          label: '授权人',
          value: 'people'
        },
        {
          label: '角色',
          value: 'role'
        },
        {
          label: '小组',
          value: 'group'
        },
        {
          label: '组织',
          value: 'organs'
        },
      ],
      title: null,
      text: null,
      page_size: 10,
      pagination: {
        total: 10,
        page: 1
      },
      flowPages: 1,
      flowPageIndex: 1,
      ticketPages: 1,
      ticketPageIndex: 1
    }
  },
  computed: {
    ...mapGetters([
      'openid',
      'myroles',
      'orgs',
      'groups'
    ])
  },
  watch: {
    'auth.auth_type'(val) {
      switch(val) {
        case 'flow':
          this.title = '授权流程'
          if (this.flowList.length < 1) {
            this.getFlow()
          }
          break
        case 'ticket':
          this.title = '授权工单'
          if (this.ticketList.length < 1) {
            this.getTicket()
          }
          break
        case 'role':
          this.title = '授权角色'
          break
        case 'group':
          this.title = '授权小组'
          break
        case 'organs':
          this.title = '授权组织'
          break
      }
    }
  },
  created() {
    if (this.auth_id) {
      this.auth = this.auth_info
    }
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.$Apis.flowCommon.list_user().then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.userList = response.payload.map(item => {
            if (item.code.replace('user@','') === this.openid) {
              return {
                text: item.text,
                code: item.code.replace('user@',''),
                disabled: true
              }
            } else {
              return {
                text: item.text,
                code: item.code.replace('user@','')
              }
            }
          })
        }
      })
    },
    getFlow() {
      this.$Apis.flow.flow_list(this.text, true, this.flowPageIndex, this.page_size).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.flowList = [...this.flowList, ...response.payload.items]
          this.flowPages = response.payload.pagination.pages
        }
      })
    },
    getTicket() {
      this.$Apis.ticket.ticket_backlog(this.text, this.ticketPageIndex, this.page_size).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.ticketList = response.payload.items
          this.ticketPages = response.payload.pagination.pages
        }
      })
    },
    loadMore() {
      if (this.auth.auth_type === 'flow' || this.auth.auth_type === 'ticket') {
        if (this.flowPageIndex < this.flowPages) {
          this.flowPageIndex++
          this.getFlow()
        }
        if (this.ticketPageIndex < this.ticketPages) {
          this.getTicket()
        }
      }
    },
    handleChange(val) {
      this.auth.value = null
    },
    submitForm(formName) {
      this.loading = true
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const from_user = this.openid
          const to_user = this.auth.to_user
          const start_time = this.auth.start_time ? Math.round(new Date(this.auth.start_time).valueOf()/1000) : Math.round(new Date().valueOf()/1000)
          const end_time = this.auth.end_time ? Math.round(new Date(this.auth.end_time).valueOf()/1000) : Math.round(new Date('2099-12-31 23:59').valueOf()/1000)
          const auth_type = this.auth.auth_type
          const value = this.auth.value
          const status = this.auth.status
          const auth_id = this.auth_id
          this.$Apis.flow.auth_add_edit(from_user, to_user, start_time, end_time, auth_type, value, status, auth_id).then(response => {
            if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
              this.loading = false
              this.resetForm('form')
              this.$emit('refresh')
            } else {
              this.$alert(response.message, '提示', {
                confirmButtonText: '确定',
                callback: action => {
                  this.loading = false
                }
              })
            }
          })
        } else {
          this.loading = false
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
      this.$emit('show')
    }
  }
}
</script>
<style lang="scss" scoped>
.tips {
  margin-left: 15px;
}
</style>
