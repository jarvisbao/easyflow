import Vue from 'vue'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

Vue.use(ElementUI, { locale })
import jQuery from 'jquery'

import Vant from 'vant'
import 'vant/lib/index.css'
Vue.use(Vant)

window.jQuery = jQuery
window.$ = jQuery

import '@/styles/index.scss' // global css
import '@/iconfont/iconfont.css'
import '@/icons' // icon

// 注册公共组件
import '@/components/moduleForm/install'

// 全局过滤器，时间戳转换
Vue.filter('formatData', function(value) {
  if (!value) return ''
  if (Number.isFinite(value)) {
    const time = parseInt(value / 1000000)
    return Vue.prototype.$Utils.util.formatDate(new Date(time), 'yyyy-MM-dd hh:mm:ss')
  } else {
    return value
  }
})
