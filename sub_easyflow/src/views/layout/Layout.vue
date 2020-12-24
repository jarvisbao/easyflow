<template>
  <div :class="classObj" class="app-wrapper">
    <div v-if="inIframe">
      <router-view v-if="isShow" :key="$route.fullPath" />
    </div>
    <div v-else>
      <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
      <sidebar v-if="!qiankun" :class="{subSidebarContainer: !qiankun}" class="sidebar-container" />
      <div class="main-container">
        <navbar />
        <section class="app-main">
          <div v-if="$route.meta.isBack" class="enfo-header-tips">
            <span class="goback" @click="goBack"><i class="el-icon-arrow-left" />返回</span>
            <div v-if="$route.query.name" class="current-state">
              {{ $route.query.name }}
            </div>
          </div>
          <transition name="fade-transform" mode="out-in">
            <router-view v-if="isShow" :key="$route.fullPath" />
          </transition>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { Navbar, Sidebar } from './components'
import ResizeMixin from './mixin/ResizeHandler'

export default {
  name: 'Layout',
  components: {
    Navbar,
    Sidebar
  },
  mixins: [ResizeMixin],
  data() {
    return {
      isShow: true,
      menu_code: null,
      qiankun: window.__POWERED_BY_QIANKUN__,
      inIframe: false
    }
  },
  // 提供可注入子组件属性
  provide() {
    return {
      refresh: this.refresh
    }
  },
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar
    },
    device() {
      return this.$store.state.app.device
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    },
    reload() {
      return this.$store.state.app.reload
    }
  },
  created() {
    if (self.frameElement && self.frameElement.tagName === 'IFRAME') {
      this.inIframe = true
    }
  },
  watch: {
    $route: {
      handler(val) {
        if (val.query.menu_code) {
          this.menu_code = val.query.menu_code
          sessionStorage.setItem('menu_code', this.menu_code)
        }
      },
      immediate: true
    },
    reload: {
      handler(val) {
        if (val.indexOf(this.$route.path) !== -1) {
          this.isShow = false
          this.$nextTick(() => {
            this.isShow = true
          })
        }
        this.$store.commit('SET_RELOAD', '')
      }
    }
  },
  methods: {
    refresh() {
      this.isShow = false
      this.$nextTick(() => {
        this.isShow = true
      })
    },
    handleClickOutside() {
      this.$store.dispatch('CloseSideBar', { withoutAnimation: false })
    },
    goBack() {
      sessionStorage.removeItem(this.$route.name)
      sessionStorage.removeItem('label')
      this.$router.go(-1)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import url('//at.alicdn.com/t/font_1321656_3l4po36nn9s.css');
.app-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}
.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}
.subSidebarContainer {
  top: 0;
}
</style>
