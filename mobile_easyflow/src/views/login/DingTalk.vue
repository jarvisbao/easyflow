<template>
</template>

<script>
import * as dd from 'dingtalk-jsapi'
export default {
  name: 'DingTalk',
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
      DingTalkIndex: 'https://oapi.dingtalk.com/connect/qrconnect?response_type=code&scope=snsapi_login&',
      features: '',
      appId: null,
      code: null
    }
  },
  created() {
    const winWidth = screen.width
    const winHeight = screen.height
    const width = winWidth * 0.2
    const height = winHeight * 0.5
    this.features = 'width=' + width + ',height=' + height
    if (this.isLogin && this.target === '_self') {
      this.$Apis.security.connect().then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          if (this.injected || dd.env.platform !== 'notInDingTalk') {
            this.getddCode()
          } else {
            this.Login()
          }
        } else {
          this.$alert(response.message, '提示', {
            confirmButtonText: '确定'
          })
        }
      })
    }
  },
  methods: {
    getddCode() {
      this.$Apis.sysControl.ParamInfoByKey('CorpId').then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.CorpId = response.payload.sys_value
          if (!this.CorpId) {
            this.$alert('请配置系统参数:CorpId(钉钉企业ID)', '提示', {
              confirmButtonText: '确定'
            })
            return
          }
          const that = this
          dd.ready(function() {
            dd.runtime.permission.requestAuthCode({
              corpId: that.CorpId, // 企业id
              onSuccess: function(info) {
                that.code = info.code // 通过该免登授权码可以获取用户身份
                const redirect = that.$route.query.redirect
                that.$router.push({ path: 'login', query: { 'code': info.code, 'isLogin': 'true', 'redirects': redirect }})
                that.$router.go(0)
              }
            })
          })
        } else {
          this.$alert(response.payload, '提示', {
            confirmButtonText: '确定'
          })
        }
      })
    },
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
            that.$emit('setDingTalk', event.data.payload)
          }
        } else if (event.data && '_type' in event.data) {
          that.$alert(event.data.message, '提示', {
            confirmButtonText: '确定'
          })
        }
      }
      window.removeEventListener('message', receiveMessage, false)
      this.$Apis.sysControl.ParamInfoByKey('appId').then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.appId = response.payload.sys_value
          if (!this.appId) {
            this.$alert('请配置系统参数:appId(钉钉扫码登录授权)', '提示', {
              confirmButtonText: '确定'
            })
            return
          }
          const redirect_uri = window.location.protocol + '//' + window.location.host + '/login?platform=dingtalk&isLogin=' + this.isLogin
          const param = {
            appid: this.appId,
            redirect_uri: encodeURIComponent(redirect_uri)
          }
          let url = this.DingTalkIndex
          for (var key in param) {
            url = url + key + '=' + param[key] + '&'
          }
          if (this.target !== '_self') {
            window.addEventListener('message', receiveMessage, false)
          }
          this.myWindow = window.open(url, this.target, this.features)
          this.myWindow.focus()
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
