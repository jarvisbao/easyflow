import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App'
import store from './store'
import { constantRouterMap } from './router'
const __qiankun__ = window.__POWERED_BY_QIANKUN__
let router = null
let instance = null
Vue.use(VueRouter)
Vue.config.productionTip = false
let routerMap = constantRouterMap
import Layout from '@/views/layout/Layout'
/**
 * @name 导出生命周期函数
 */
const lifeCycle = () => {
  return {
    /**
     * @name 微应用初始化
     * @param {Object} props 主应用下发的props
     * @description  bootstrap 只会在微应用初始化的时候调用一次，下次微应用重新进入时会直接调用 mount 钩子，不会再重复触发
     * @description 通常我们可以在这里做一些全局变量的初始化，比如不会在 unmount 阶段被销毁的应用级别的缓存等
     */
    async bootstrap(props) {
      const store_modules = props.store_modules
      Object.keys(store_modules).forEach(module_name => {
        const module = store_modules[module_name]
        if (module.preserveState) {
          const state = {}
          Object.keys(module.state).forEach(state_name => {
            state[state_name] = module.state
          })
          module.state = state
        }
        store.registerModule(module_name, module)
      })
      // 把工具函数挂载在vue $Utils对象
      Vue.prototype.$Utils = props.utils

      // 注册全局指令
      Vue.use(props.directive)
      // 注册公共组件
      props.components.forEach((component) => {
        Vue.use(component)
      })
      // 把接口挂载在vue $Apis对象
      Vue.prototype.$Apis = props.Apis
      const commonRouterMap = props.commonRouterMap
      commonRouterMap.forEach(router => {
        if (router.sub_component) {
          router.component = Layout
        }
      })
      routerMap = constantRouterMap.concat(commonRouterMap)
      if (props.emits) {
        props.emits.forEach(Element => {
          Object.keys(Element).forEach(item => {
            Vue.prototype[`$${item}`] = Element[item]
          })
        })
      }
    },
    /**
     * @name 实例化微应用
     * @param {Object} props 主应用下发的props
     * @description 应用每次进入都会调用 mount 方法，通常我们在这里触发应用的渲染方法
     */
    async mount(props) {
      store.commit('SET_VUE_APP_NAME', process.env.VUE_APP_NAME)
      // 注册应用间通信
      props.onGlobalStateChange((state, prev) => {
        // state: 变更后的状态; prev 变更前的状态
        // 表单设计器 注册组件
        if (state.rsgComponent) {
          Vue.component(state.rsgComponent.name, {
            props: state.rsgComponent.props,
            template: state.rsgComponent.component
          })
        }
        // 表单生成器 注册组件
        if (state.showComponent) {
          Vue.component(state.showComponent.name, {
            props: state.showComponent.props,
            data: () => ({
              dataModel: state.showComponent.value
            }),
            watch: {
              dataModel(val) {
                if (this.ui === 'antd') {
                  Vue.prototype.$Utils.EventBus.$emit('on-field-change', this.$attrs.id, val)
                } else {
                  this.$emit('input', val)
                }
              },
              value(val) {
                this.dataModel = val
              }
            },
            template: state.showComponent.component
          })
        }
      })
      props.setGlobalState(state => {
      })
      // 注册微应用实例化函数
      render(props)
    },
    /**
     * @name 微应用卸载/切出
     */
    async unmount() {
      instance.$destroy()
      instance = null
      router = null
      store.commit('SET_VUE_APP_NAME', 'portal')
    }
  }
}
/**
 * @name 子应用实例化函数
 * @param {Object} props param0 qiankun将用户添加信息和自带信息整合，通过props传给子应用
 * @description {Array} routes 主应用请求获取注册表后，从服务端拿到路由数据
 * @description {String} 子应用路由前缀 主应用请求获取注册表后，从服务端拿到路由数据
 */
const render = props => {
  router = new VueRouter({
    base: __qiankun__ ? props.routerBase : '/',
    mode: 'history',
    routes: routerMap
  })
  // 测试模式下需要独立运行时,且portal下的library移到本项目
  if (!__qiankun__) {
    props.LibraryJs.router_permission(router)
  }
  instance = new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
}

export { lifeCycle, render, instance, router }
