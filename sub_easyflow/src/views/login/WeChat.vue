<template>
</template>

<script>
import * as dd from 'dingtalk-jsapi'

export default {
  name: 'WeChat',
  props: {
    target: {
      type: String,
      default: ''
    },
    isLogin: {
      type: Boolean,
      default: false
    },
    injected: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      myWindow: null,
      WeChatIndex: 'https://open.work.weixin.qq.com/wwopen/sso/qrConnect?',
      WeChatinjected: 'https://open.weixin.qq.com/connect/oauth2/authorize?response_type=code&scope=snsapi_base&',
      features: '',
      CORPID: null,
      code: null,
      AGENTID: null
    }
  },
  created() {
    const winWidth = screen.width
    const winHeight = screen.height
    const width = winWidth * 0.2
    const height = winHeight * 0.5
    this.features = 'width=' + width + ',height=' + height
    const wechat = navigator.userAgent.toLowerCase().match(/MicroMessenger/i)
    if (this.isLogin && this.target === '_self') {
      this.$Apis.security.connect().then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          if (this.injected || (wechat && wechat.toString() === 'micromessenger')) {
            this.injected = true
          }
          this.Login()
        } else {
          this.$alert(response.message, '提示', {
            confirmButtonText: '确定'
          })
        }
      })
    }
  },
  methods: {
    bind() {
      const that = this
      // eslint-disable-next-line no-inner-declarations
      function receiveMessage(event) {
        window.removeEventListener('message', receiveMessage, false)
        if (event.data.code === that.$Utils.Constlib.ERROR_CODE_OK) {
          if (that.isLogin) {
            let redirect = that.$route.query.redirect
            if (!redirect) {
              redirect = '/'
            }
            that.$router.push({ path: redirect })
          } else {
            that.$emit('setWeChat', event.data.payload)
          }
        } else if (event.data && '_type' in event.data) {
          that.$alert(event.data.message, '提示', {
            confirmButtonText: '确定'
          })
        }
      }
      window.removeEventListener('message', receiveMessage, false)
      this.$Apis.sysControl.ParamInfoByKey('WeChatcorpid').then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.CORPID = response.payload.sys_value
          if (!this.CORPID) {
            this.$alert('请配置系统参数:WeChatcorpid(企业微信企业ID)', '提示', {
              confirmButtonText: '确定'
            })
            return
          }
          this.$Apis.sysControl.ParamInfoByKey('WeChatAgentId').then(response => {
            if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
              this.AGENTID = response.payload.sys_value
              if (!this.AGENTID) {
                this.$alert('请配置系统参数:WeChatAgentId(企业微信应用ID)', '提示', {
                  confirmButtonText: '确定'
                })
                return
              }
              const redirect_uri = window.location.protocol + '//' + window.location.host + '/login?platform=wechat&isLogin=' + this.isLogin
              const param = {
                appid: this.CORPID,
                agentid: this.AGENTID,
                redirect_uri: encodeURIComponent(redirect_uri)
              }
              let url = this.injected ? this.WeChatinjected : this.WeChatIndex
              for (var key in param) {
                url = url + key + '=' + param[key] + '&'
              }
              url = this.injected ? url + '#wechat_redirect' : url
              if (this.target !== '_self') {
                window.addEventListener('message', receiveMessage, false)
              }
              this.myWindow = window.open(url, this.target, this.features)
              this.myWindow.focus()
            }
          })
        } else {
          this.$alert(response.payload, '提示', {
            confirmButtonText: '确定'
          })
        }
      })
    },
    Login() {
      this.bind()
    }
  }
}
</script>
