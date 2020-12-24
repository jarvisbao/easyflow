<template>
  <div class="login-container">
    <div class="login">
      <h3 class="logo">
        <svg-icon icon-class="logo" class="logo-svg" />
      </h3>
      <van-form @submit="onSubmit">
        <van-field
          v-model="loginForm.username"
          :rules="[{ required: true, message: '请填写用户名' }]"
          name="username"
          label="用户名"
          placeholder="用户名"
        />
        <van-field
          v-model="loginForm.password"
          :rules="[{ validator, message: '密码不能小于5位' }]"
          type="password"
          name="password"
          label="密码"
          placeholder="密码"
        />
        <van-field
          v-model="loginForm.captcha"
          :rules="[{ required: true, message: '请输入验证码' }]"
          :error-message="errorMsg"
          center
          clearable
          label="验证码"
          placeholder="请输入验证码"
        >
          <template #extra>
            <img :src="verificationCode" alt="验证码" class="verificationCode" @click="getcaptcha">
          </template>
        </van-field>
        <div style="margin: 50px 30px 0;">
          <van-button :loading="loading" round block type="info" native-type="submit" loading-text="提交" color="#f56868">
            提交
          </van-button>
        </div>
        <router-link class="forget-pass" to="/retrieve_password">
          忘记密码？
        </router-link>
      </van-form>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Login',
  data() {
    this.$Apis.security.connect().then(response => {
      if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
        this.getcaptcha()
      } else {
        this.$dialog.alert({
          message: response.message
        })
      }
    })
    return {
      loginForm: {
        username: '',
        password: '',
        captcha: ''
      },
      loading: false,
      redirect: undefined,
      verificationCode: undefined,
      captcha_str: '',
      errorMsg: ''
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
        Object.keys(route.query).forEach(key => {
          if (key !== 'redirect') {
            const value = route.query[key]
            this.redirect += '&' + key + '=' + value
          }
        })
      },
      immediate: true
    }
  },
  methods: {
    getcaptcha() {
      // 获取验证码
      this.$Apis.security.captcha().then(response => {
        var data = response
        if (data.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.verificationCode = data['payload']['captcha']
          this.captcha_str = data.payload.captcha_str
        }
      })
    },
    validator(val) {
      return val.length >= 5
    },
    onSubmit(values) {
      this.loading = true
      const captcha = this.loginForm.captcha
      if (captcha.trim().length < 4) {
        this.errorMsg = '请输入正确的验证码'
        this.getcaptcha()
        this.loading = false
      } else {
        this.errorMsg = ''
        this.$Apis.security.captcha_test(captcha).then(response => {
          var data = response
          if (data.code === this.$Utils.Constlib.ERROR_CODE_OK) {
            if (data['payload']['test']) {
              this.$store
                .dispatch('Login', values)
                .then(response => {
                  if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
                    this.$router.push({ path: this.redirect || '/' })
                  } else {
                    this.$dialog.alert({
                      message: response.message
                    })
                    this.getcaptcha()
                  }
                  this.loading = false
                })
                .catch(() => {
                  this.loading = false
                })
            } else {
              this.errorMsg = '请输入正确的验证码'
              this.getcaptcha()
              this.loading = false
            }
          } else {
            this.$dialog.alert({
              message: data.message
            })
            this.loading = false
          }
        })
      }
    }
  }
}
</script>
