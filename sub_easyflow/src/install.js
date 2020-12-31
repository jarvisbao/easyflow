import Vue from 'vue'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

Vue.use(ElementUI, { locale })
import jQuery from 'jquery'

window.jQuery = jQuery
window.$ = jQuery

import '@/styles/index.scss' // global css
import '@/iconfont/iconfont.css'
import '@/icons' // icon

/* bpmnjs左边工具栏以及编辑节点的样式*/
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'

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

import VeChart from 'v-charts/lib/chart.common'
import VeLine from 'v-charts/lib/line.common' // 折线图
import VeHistogram from 'v-charts/lib/histogram.common' // 柱状图
import VePie from 'v-charts/lib/pie.common' // 饼图
import 'v-charts/lib/style.css'

[VeChart, VeLine, VeHistogram, VePie].forEach(comp => {
  Vue.component(comp.name, comp);
})