<template>
  <div class="login-container">
    <div>
      <el-form
        ref="loginForm"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        auto-complete="on"
        label-position="left"
      >
        <h3 class="title">
          ENFO I5 Platform
        </h3>
        <el-form-item prop="username">
          <span class="svg-container">
            <svg-icon icon-class="user_center" />
          </span>
          <el-input
            v-model="loginForm.username"
            name="username"
            type="text"
            auto-complete="on"
            placeholder="用户"
          />
        </el-form-item>
        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            v-model="loginForm.password"
            :type="pwdType"
            name="password"
            auto-complete="on"
            placeholder="密码"
            @keyup.enter.native="handleLogin"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="pwdType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
        <el-form-item prop="captcha" class="ver-code">
          <span class="svg-container">
            <svg-icon icon-class="verificationcode" />
          </span>
          <el-input v-model="loginForm.captcha" type="text" name="captcha" placeholder="验证码" @keyup.enter.native="handleLogin" @input="handleInput" />
          <img :src="verificationCode" alt="验证码" class="verificationCode" @click="getcaptcha">
          <div v-if="isCode" class="code-msg">
            请输入正确的验证码
          </div>
        </el-form-item>
        <p v-if="captcha_str" id="captcha" style="display:none">
          {{ captcha_str }}
        </p>
        <el-form-item class="remember">
          <router-link class="forget-pass" to="/retrieve_password">
            忘记密码？
          </router-link>
        </el-form-item>
        <el-form-item class="login-button">
          <el-button
            id="login"
            :loading="loading"
            type="primary"
            style="width:100%;"
            @click.native.prevent="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="other-login">
        <el-divider>使用第三方帐号登录</el-divider>
        <div class="list">
          <span class="icon-box" @click="LarkLogin">
            <svg-icon icon-class="feishu" />
            <lark ref="lark" :is-login="true" />
          </span>
          <span class="icon-box" @click="DingTalkLogin">
            <svg-icon icon-class="ding-talk" />
            <ding-talk ref="dingtalk" :is-login="true" />
          </span>
          <span class="icon-box" @click="WeChatLogin">
            <svg-icon icon-class="wechat" />
            <we-chat ref="wechat" :is-login="true" />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import lark from './Lark'
import DingTalk from './DingTalk'
import WeChat from './WeChat'
import { instance as Vue } from '@/life-cycle'
const isvalidUsername = Vue.$Utils.validate.isvalidUsername

export default {
  name: 'Login',
  components: {
    DingTalk,
    lark,
    WeChat
  },
  data() {
    this.$Apis.login.connect().then(response => {
      if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
        this.getcaptcha()
      } else {
        this.$alert(response.message, '提示', {
          confirmButtonText: '确定'
        })
      }
    })
    const validateUsername = (rule, value, callback) => {
      if (!isvalidUsername(value)) {
        callback(new Error('请输入正确的用户名'))
      } else {
        callback()
      }
    }
    const validatePass = (rule, value, callback) => {
      if (value.length < 5) {
        callback(new Error('密码不能小于5位'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: '',
        password: '',
        captcha: ''
      },
      loginRules: {
        username: [
          { required: true, trigger: 'blur', validator: validateUsername }
        ],
        password: [
          { required: true, trigger: 'blur', validator: validatePass }
        ],
        captcha: [
          { required: true, trigger: 'blur', message: '请输入验证码' }
        ]
      },
      loading: false,
      pwdType: 'password',
      redirect: undefined,
      verificationCode: undefined,
      isCode: false,
      captcha_str: ''
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
    showPwd() {
      if (this.pwdType === 'password') {
        this.pwdType = ''
      } else {
        this.pwdType = 'password'
      }
    },
    getcaptcha() {
      // 获取验证码
      this.$Apis.login.captcha().then(response => {
        var data = response
        if (data.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.verificationCode = data['payload']['captcha']
          this.captcha_str = data.payload.captcha_str
        }
      })
    },
    handleInput(val) {
      if (this.loginForm.captcha !== '') {
        this.isCode = false
      }
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          const captcha = this.loginForm.captcha
          if (captcha.trim().length < 4) {
            this.isCode = true
            this.getcaptcha()
            this.loading = false
          } else {
            this.isCode = false
            this.$Apis.login.captcha_test(captcha).then(response => {
              var data = response
              if (data.code === this.$Utils.Constlib.ERROR_CODE_OK) {
                if (data['payload']['test']) {
                  this.$store
                    .dispatch('Login', this.loginForm)
                    .then(response => {
                      if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
                        this.$router.push({ path: this.redirect || '/' })
                      } else {
                        this.$alert(response.message, '提示', {
                          confirmButtonText: '确定'
                        })
                        this.getcaptcha()
                      }
                      this.loading = false
                    })
                    .catch(() => {
                      this.loading = false
                    })
                } else {
                  this.isCode = true
                  this.getcaptcha()
                  this.loading = false
                }
              } else {
                this.$alert(data.message, '提示', {
                  confirmButtonText: '确定'
                })
                this.loading = false
              }
            })
          }
        } else {
          return false
        }
      })
    },
    LarkLogin() {
      this.$refs.lark.Login()
    },
    DingTalkLogin() {
      this.$refs.dingtalk.Login()
    },
    WeChatLogin() {
      this.$refs.wechat.Login()
    }
  }
}
</script>
