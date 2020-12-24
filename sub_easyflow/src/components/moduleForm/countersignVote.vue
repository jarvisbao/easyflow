<template>
  <div class="countersign-vote">
    <el-form ref="form" :model="form" :rules="rules" :disabled="isDisabled" label-width="100px">
      <el-form-item label="会签意见" prop="sign_value">
        <el-select v-model="form.sign_value">
          <el-option label="同意" value="agree" />
          <el-option label="反对" value="against" />
          <el-option label="弃权" value="waiver" />
        </el-select>
      </el-form-item>
      <el-form-item label="评论">
        <el-input v-model="form.summary" :autosize="{ minRows: 3, maxRows: 6 }" type="textarea" placeholder="请输入内容" />
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: 'countersign_vote',
  label: '会签投票表单',
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
        sign_value: null,
        summary: null
      },
      rules: {
        sign_value: { required: true, message: '请选择会签意见', trigger: 'change' }
      },
      dataValid: false,
      isDisabled: false
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
    }
  }
}
</script>
