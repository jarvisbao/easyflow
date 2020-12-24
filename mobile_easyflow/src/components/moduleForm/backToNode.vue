<template>
  <div class="back-to-node">
    <!-- <el-form ref="form" :model="form" :rules="rules" :disabled="isDisabled" label-width="100px">
      <el-form-item label="任务节点" prop="back_node">
        <el-select v-model="form.back_node" placeholder="请选择">
          <el-option v-for="item in active_options" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="撤回意见">
        <el-input v-model="form.summary" :autosize="{ minRows: 3, maxRows: 4}" type="textarea" />
      </el-form-item>
    </el-form> -->
    <van-form ref="form" :model="form">
      <van-field
        v-model="back_node_name"
        :rules="[{ required: true, message: '请选择任务节点' }]"
        :disabled="isDisabled"
        name="back_node"
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
      back_node_name: null,
      dataValid: false,
      isDisabled: false,
      active_options: this.back_to_node,
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

    if (this.back_to_node.length < 1 && this.moduleInit.ticket_data) {
      this.moduleInit.ticket_data.tasks.some(item => {
        this.active_options.push({
          id: item.node_id,
          name: item.node_name
        })
      })
    }
    this.active_options.forEach(item => {
      if (item.id === this.form.back_node) {
        this.back_node_name = item.name
      }
    })
  },
  methods: {
    checkOption(val) {
      this.back_node_name = val.name
      this.form.back_node = val.id
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
          this.$toast({
            message: '提交成功！',
            forbidClick: true,
            onClose: () => {
              this.$emit('close')
            }
          })
        } else {
          this.$dialog.alert({
            message: response.message
          })
        }
      })
    }
  }
}
</script>
