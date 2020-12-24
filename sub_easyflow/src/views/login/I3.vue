<template>
</template>

<script>
export default {
  name: 'Lark',
  props: {
    target: {
      type: String,
      default: ''
    },
    isLogin: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      myWindow: null,
      I3_HOST: 'http://192.168.100.28:8080',
      features: '',
      app_id: null
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
            that.$emit('setI3', event.data.payload)
          }
        } else if (event.data && '_type' in event.data) {
          that.$alert(event.data.message, '提示', {
            confirmButtonText: '确定'
          })
        }
      }
      window.removeEventListener('message', receiveMessage, false)
      this.$Apis.sysControl.ParamInfoByKey('I3_HOST').then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.I3_HOST = response.payload.sys_value
          if (!this.I3_HOST) {
            this.$alert('请配置系统参数:I3_HOST', '提示', {
              confirmButtonText: '确定'
            })
            return
          }
          const redirect_uri = window.location.protocol + '//' + window.location.host + '/login?platform=i3&isLogin=' + this.isLogin
          const param = {
            redirect_uri: encodeURIComponent(redirect_uri)
          }
          let url = this.I3_HOST + '/getssotoken'
          if (url.indexOf('?') === -1) {
            url += '?'
          }
          for (var key in param) {
            url = url + key + '=' + param[key] + '&'
          }
          if (this.target !== '_self') {
            console.info(url)
            window.addEventListener('message', receiveMessage, false)
            this.myWindow = window.open(url, this.target, this.features)
            this.myWindow.focus()
          } else {
            window.location.href = url
          }
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
