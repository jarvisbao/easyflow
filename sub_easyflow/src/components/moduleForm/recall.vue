<template>
  <div>
    <el-form ref="form" :model="form" :rules="rules" :disabled="isDisabled" label-width="100px">
      <el-form-item label="任务节点" prop="active_id">
        <el-select v-model="form.active_id" placeholder="请选择">
          <el-option v-for="item in active_options" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="撤回意见">
        <el-input v-model="form.summary" :autosize="{ minRows: 3, maxRows: 4}" type="textarea" />
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: 'recall',
  label: '撤回',
  props: {
    moduleInit: { // 父组件传下来的默认参数供子组件调用
      type: Object,
      default: () => {}
    },
    active_option: {
      type: Array,
      default: () => []
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
        active_id: null,
        summary: null
      },
      rules: {
        active_id: { required: true, message: '请选择任务节点', trigger: 'change' }
      },
      dataValid: false,
      isDisabled: false,
      active_options: this.active_option
    }
  },
  created() {
    if (this.isEdit) {
      this.moduleInit.deal_or_view = true
      this.isDisabled = false
    } else {
      this.moduleInit.deal_or_view = false
      this.isDisabled = true
      this.form = this.formValue
    }

    if (this.active_option.length < 1 && this.moduleInit.ticket_data) {
      this.moduleInit.ticket_data.tasks.some(item => {
        if (item.rtype !== 'button') {
          this.active_options.push({
            id: item.node_id,
            name: item.node_name
          })
          return true
        }
      })
    }
  },
  methods: {
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
        recall: this.form
      }
      const data = {
        ticket_id: this.moduleInit.ticket_id,
        action: action,
        owner_id: owner_id,
        task_id: this.moduleInit.task_id,
        forms: forms,
        active_id: this.form.active_id,
        late_id: this.moduleInit.ticket_data.ticket_info.late_id
      }
      this.$Apis.ticket.action_do(data).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.$alert('提交成功！', '提示', {
            confirmButtonText: '确定',
            callback: action => {
              this.$emit('close')
              this.$router.replace('/ticket/backlog')
            }
          })
        } else {
          this.$alert(response.message, '提示', {
            confirmButtonText: '确定',
            callback: action => {
              // this.loadingAction = false
            }
          })
        }
      })
    }
  }
}
</script>
