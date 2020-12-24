<template>
  <div class="back-to-node">
    <el-form ref="form" :model="form" :rules="rules" :disabled="isDisabled" label-width="100px">
      <el-form-item label="任务节点" prop="back_node">
        <el-select v-model="form.back_node" placeholder="请选择">
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
  name: 'back_to_node',
  label: '回退到',
  props: {
    moduleInit: { // 父组件传下来的默认参数供子组件调用
      type: Object,
      default: () => {}
    },
    back_to_node: {
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
        back_node: null,
        summary: null
      },
      rules: {
        back_node: { required: true, message: '请选择任务节点', trigger: 'change' }
      },
      dataValid: false,
      isDisabled: false,
      active_options: this.back_to_node
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

    if (this.back_to_node.length < 1 && this.moduleInit.ticket_data) {
      this.moduleInit.ticket_data.tasks.some(item => {
        this.active_options.push({
          id: item.node_id,
          name: item.node_name
        })
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
        back_to_node: this.form
      }
      const data = {
        ticket_id: this.moduleInit.ticket_id,
        action: action,
        owner_id: owner_id,
        task_id: this.moduleInit.task_id,
        forms: forms,
        late_id: this.moduleInit.ticket_data.ticket_info.late_id,
        back_node: this.form.back_node
      }
      this.$Apis.ticket.action_do(data).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.$alert('提交成功！', '提示', {
            confirmButtonText: '确定',
            callback: action => {
              this.$emit('close')
              this.$router.go(-1)
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
