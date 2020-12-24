<template>
  <div class="countersign-result">
    <el-form ref="form" :model="form" :disabled="isDisabled" label-width="100px">
      <el-form-item label="同意票数">
        <el-input v-model="form.agree" />
      </el-form-item>
      <el-form-item label="反对票数">
        <el-input v-model="form.against" />
      </el-form-item>
      <el-form-item label="弃权票数">
        <el-input v-model="form.waiver" />
      </el-form-item>
      <el-form-item label="投票结果">
        <!-- <el-switch v-model="form.result" /> -->
        <el-radio-group v-model="form.result">
          <el-radio :label="true">通过</el-radio>
          <el-radio :label="false">否决</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="结果评论">
        <el-input v-model="form.message" :autosize="{ minRows: 3, maxRows: 6 }" type="textarea" placeholder="请输入内容" />
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: 'countersign_result',
  label: '会签结果表单',
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
        agree: null,
        against: null,
        waiver: null,
        result: false,
        message: null
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
