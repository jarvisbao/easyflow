<template>
  <transition v-if="!code" name="tab">
    <component :is="platform" :target="'_self'" :isLogin="true" :injected="injected" />
  </transition>
</template>

<script>
import * as dd from 'dingtalk-jsapi'
export default {
  components: {
    lark: () => import('./Lark'),
    dingtalk: () => import('./DingTalk'),
    login: () => import('./Login'),
    wechat: () => import('./WeChat')
  },
  props: {
  },
  data() {
    return {
      platform: 'login',
      code: null,
      state: null,
      isLogin: null,
      injected: false
    }
  },
  created() {
    this.code = this.$route.query.code
    this.state = this.$route.query.state
    this.isLogin = this.$route.query.isLogin
    const wechat = navigator.userAgent.toLowerCase().match(/MicroMessenger/i)
    const lark = navigator.userAgent.toLowerCase().match(/Lark|LarkLocale/i)
    if (dd.env.platform !== 'notInDingTalk') {
      this.platform = 'dingtalk'
      this.injected = true
    } else if (wechat && wechat.toString() === 'micromessenger') {
      this.platform = 'wechat'
      this.injected = true
    } else if (lark && ('lark', 'larklocale').includes(lark.toString())) {
      this.platform = 'lark'
      this.injected = true
    } else {
      this.platform = this.$route.query.platform || this.platform
    }
    if (this.code && this.platform) {
      if (this.islogin) {
        this.Login()
      } else {
        this.Bind()
      }
    }
  },
  computed: {
    islogin() {
      if (typeof this.isLogin === 'string') {
        return this.isLogin === 'true'
      }
      return this.isLogin
    }
  },
  methods: {
    Bind() {
      this.$Apis.user.bindThrid(this.code, this.platform).then(response => {
        response['_type'] = 'bind'
        window.opener.postMessage(response, '*')
        window.close()
      })
    },
    Login() {
      this.$store.dispatch('ThridLogin', { code: this.code, platform: this.platform, injected: this.injected }).then(response => {
        response['_type'] = 'login'
        if (!this.injected && window.opener && Object.keys(window.opener.location).length > 2) {
          window.opener.postMessage(response, '*')
          window.close()
        } else {
          if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
            let redirect = this.$route.query.redirect || this.$route.query.redirects
            if (!redirect) {
              redirect = '/'
            }
            this.$router.push({ path: redirect })
          } else {
            this.$alert(response.message, '提示', {
              confirmButtonText: '确定'
            })
          }
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
