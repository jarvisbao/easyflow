<template>
  <div class="bind-email">
    <el-form ref="bindemail" :model="email" :rules="rules" label-width="120px">
      <el-form-item label="邮箱" prop="email">
        <el-input id="email" v-model="email.email" />
      </el-form-item>
      <el-form-item label="验证码" prop="code">
        <el-input id="code" v-model="email.code" />
        <el-button id="send" :disabled="sendCode.disabled" class="send-btn" @click="send">
          <template v-if="sendCode.sending">
            发送验证码
          </template>
          <template v-else>
            {{ sendCode.second }}秒后可重试
          </template>
        </el-button>
      </el-form-item>
      <el-form-item>
        <el-button id="submit" type="danger" @click="submitForm('bindemail')">
          绑定
        </el-button>
        <el-button id="cancel" plain @click.stop="resetForm('bindemail')">
          取消
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  props: {
    timeDown: {
      type: Function,
      default: null
    },
    sendCode: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      email: {
        email: '',
        code: null
      },
      rules: {
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    send() {
      this.sendCode.sending = false
      this.sendCode.disabled = true
      this.$emit('timeDown')
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$alert('submit!', '标题名称', {
            confirmButtonText: '确定'
          })
        } else {
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
      this.$emit('show', false)
    }
  }
}
</script>
<style lang="scss" scoped>

</style>
