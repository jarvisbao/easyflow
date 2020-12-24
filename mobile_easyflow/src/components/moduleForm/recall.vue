<template>
  <div>
    <van-form ref="form" :model="form">
      <van-field
        v-model="active_name"
        :rules="[{ required: true, message: '请选择任务节点' }]"
        :disabled="isDisabled"
        name="active_id"
        required
        clickable
        readonly
        label="任务节点"
        placeholder="请选择"
        @click="showPicker = true"
      />
      <van-popup v-if="!isDisabled" v-model="showPicker" position="bottom">
        <van-picker
          :columns="active_options"
          value-key="name"
          show-toolbar
          title=""
          @confirm="checkOption"
          @cancel="showPicker = false"
        />
      </van-popup>
      <van-field
        v-model="form.summary"
        :disabled="isDisabled"
        autosize
        type="textarea"
        rows="3"
        name="summary"
        label="撤回意见"
        placeholder="请填写撤回意见"
      />
    </van-form>
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
      active_name: null,
      dataValid: false,
      isDisabled: false,
      active_options: this.active_option,
      showPicker: false
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
        this.active_options.push({
          id: item.node_id,
          name: item.node_name
        })
      })
    }
    this.active_options.forEach(item => {
      if (item.id === this.form.active_id) {
        this.active_name = item.name
      }
    })
  },
  methods: {
    checkOption(val) {
      this.active_name = val.name
      this.form.active_id = val.id
      this.showPicker = false
    },
    valid() {
      return new Promise((resolve, reject) => {
        this.$refs['form'].validate().then(() => {
          this.dataValid = true
          resolve(this.dataValid)
        }).catch(() => {
          this.dataValid = false
          // reject(new Error('表单数据校验失败').message)
          resolve(this.dataValid)
        })
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
          this.$emit('close_overlay')
          this.$toast({
            message: '提交成功！',
            forbidClick: true,
            onClose: () => {
              this.$emit('close')
            }
          })
        } else {
          this.$emit('close_overlay')
          this.$dialog.alert({
            message: response.message
          })
        }
      })
    }
  }
}
</script>
