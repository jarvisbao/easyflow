<template>
  <div class="turn-to-user">
    <el-form ref="form" :model="form" :disabled="isDisabled" label-width="100px">
      <el-form-item label="人员">
        <el-select v-model="form.user" multiple filterable placeholder="请选择">
          <el-option v-for="(item, index) in userList" :key="index" :label="item.text" :value="item.code" />
        </el-select>
      </el-form-item>
      <el-form-item label="小组">
        <el-select v-model="form.group" multiple filterable placeholder="请选择">
          <el-option v-for="(item, index) in groupList" :key="index" :label="item.text" :value="item.code" />
        </el-select>
      </el-form-item>
      <el-form-item label="角色">
        <el-select v-model="form.role" multiple filterable placeholder="请选择">
          <el-option v-for="(item, index) in roleList" :key="index" :label="item.text" :value="item.code" />
        </el-select>
      </el-form-item>
      <el-form-item label="机构">
        <el-select v-model="form.organ" multiple filterable placeholder="请选择">
          <el-option v-for="(item, index) in organList" :key="index" :label="item.text" :value="item.code" />
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: 'turn_to_user',
  label: '转办',
  props: {
    moduleInit: { // 父组件传下来的默认参数供子组件调用
      type: Object,
      default: () => {}
    },
    isEdit: {
      type: Boolean,
      default: true
    },
    formValue: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      form: {
        user: null,
        group: null,
        role: null,
        organ: null
      },
      userList: [],
      groupList: [],
      roleList: [],
      organList: [],
      isDisabled: false
    }
  },
  created() {
    this.fetchData()
    if (this.isEdit) {
      this.moduleInit.deal_or_view = true
      this.isDisabled = false
    } else {
      this.moduleInit.deal_or_view = false
      this.isDisabled = true
      this.form = this.formValue
    }
  },
  methods: {
    fetchData() {
      this.$Apis.flowCommon.list_user().then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.userList = response.payload
        }
      })
      this.$Apis.flowCommon.list_group().then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.groupList = response.payload
        }
      })
      this.$Apis.flowCommon.list_role().then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.roleList = response.payload
        }
      })
      this.$Apis.flowCommon.list_org().then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.organList = response.payload
        }
      })
    },
    valid() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.dataValid = true
          this.$emit('get_valid', true)
        } else {
          this.dataValid = false
          this.$emit('get_valid', false)
          return false
        }
      })
    },
    get_data() {
      if (this.dataValid) {
        this.$emit('get_data', this.form)
      }
    },
    submit(action, owner_id) {
      const forms = {
        turn_to_user: this.form
      }
      const turns = []
      Object.values(this.form).forEach(item => {
        console.log(item)
        turns.push(...item)
      })
      const data = {
        ticket_id: this.moduleInit.ticket_id,
        action: action,
        owner_id: owner_id,
        task_id: this.moduleInit.task_id,
        forms: forms,
        late_id: this.moduleInit.ticket_data.ticket_info.late_id,
        turns: turns
      }
      this.$Apis.ticket.action_do(data).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.$alert('提交成功！', '提示', {
            confirmButtonText: '确定',
            callback: action => {
              this.$emit('close')
              this.$router.replace('/ticket/participate')
            }
          })
        } else {
          this.$alert(response.message, '提示', {
            confirmButtonText: '确定'
          })
        }
      })
    }
  }
}
</script>
