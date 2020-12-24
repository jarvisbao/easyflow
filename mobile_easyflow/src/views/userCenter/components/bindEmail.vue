<template>
  <div class="main-container">
    <div class="top-save" @click="submit">
      保存
    </div>
    <van-form ref="bindEmail" validate-first>
      <van-field
        ref="email"
        v-model="email.email"
        :rules="[{ pattern, message: '请输入正确的邮箱地址' }]"
        required
        name="email"
        label="邮箱"
        placeholder="请输入邮箱地址"
      />
      <van-field
        v-model="email.code"
        :rules="[{ required: true, message: '请输入验证码' }]"
        required
        center
        clearable
        name="code"
        label="发送验证码"
        placeholder="请输入验证码"
      >
        <template #button>
          <van-button :disabled="sendCode.disabled" size="small" type="primary" native-type="button" @click="send">
            <template v-if="sendCode.sending">
              发送验证码
            </template>
            <template v-else>
              {{ sendCode.second }}秒后可重试
            </template>
          </van-button>
        </template>
      </van-field>
    </van-form>
  </div>
</template>
<script>

export default {
  data() {
    return {
      email: {
        email: '',
        code: null
      },
      sendCode: {
        disabled: false,
        sending: true,
        second: 60
      },
      pattern: /^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$/
    }
  },
  methods: {
    timeDown() {
      const timer = setInterval(() => {
        this.sendCode.second--
        if (this.sendCode.second === 0) {
          clearInterval(timer)
          this.sendCode.second = 60
          this.sendCode.sending = true
          this.sendCode.disabled = false
        }
      }, 1000)
    },
    send() {
      if (this.email.email && this.pattern.test(this.email.email)) {
        this.sendCode.sending = false
        this.sendCode.disabled = true
        this.timeDown()
        this.$Apis.email.this.$Apis.email.user_loginid_create_email(this.email.email).then(response => {
          if (response.code !== this.$Utils.Constlib.ERROR_CODE_OK) {
            this.$dialog.alert({
              message: response.message
            })
          }
        })
      } else {
        this.$refs.email.focus()
        this.$toast('请输入邮箱地址')
      }
    },
    submit() {
      this.$refs.bindEmail.validate().then(() => {
        const captcha = this.email.code
        this.$Apis.security.captcha_test(captcha).then(response => {
          var data = response
          if (data.code === this.$Utils.Constlib.ERROR_CODE_OK) {
            if (data['payload']['test']) {
              this.$Apis.email.this.$Apis.email.user_loginid_create_email(this.email.email).then(response => {
                if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
                  this.$router.go(-1)
                } else {
                  this.$dialog.alert({
                    message: response.message
                  })
                }
              })
            }
          } else {
            this.$dialog.alert({
              message: response.message
            })
          }
        })
      }).catch(() => {})
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
