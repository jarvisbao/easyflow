<template>
  <div v-if="!item.hidden" class="menu-wrapper">
    <template v-if="hasOneShowingChild(item.children,item) && (!onlyOneChild.children||onlyOneChild.noShowingChildren)&&!alwaysShow">
      <app-link :to="resolvePath(onlyOneChild.uri)" :menuid="onlyOneChild.menu_id" :class="onlyOneChild.menu_code">
        <el-menu-item :index="resolvePath(onlyOneChild.uri)" :class="{'submenu-title-noDropdown':!isNest}" @click="removeSession">
          <item :meta="Object.assign({},item.meta,onlyOneChild.meta)" />
        </el-menu-item>
      </app-link>
    </template>

    <el-submenu v-else ref="subMenu" :index="item.menu_code" popper-append-to-body>
      <template slot="title">
        <item :meta="item.meta" />
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.menu_code"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.uri)"
        class="nest-menu"
      />
    </el-submenu>
  </div>
</template>

<script>
import path from 'path'
import Item from './Item'
import AppLink from './Link'

export default {
  name: 'SidebarItem',
  components: { Item, AppLink },
  props: {
    // route object
    item: {
      type: Object,
      required: true
    },
    isNest: {
      type: Boolean,
      default: false
    },
    basePath: {
      type: String,
      default: ''
    }
  },
  data() {
    // To fix https://github.com/PanJiaChen/vue-admin-template/issues/237
    // TODO: refactor with render function
    this.onlyOneChild = null
    this.alwaysShow = false
    return {
      // qiankun: window.__POWERED_BY_QIANKUN__
    }
  },
  methods: {
    hasOneShowingChild(children = [], parent) {
      const showingChildren = children.filter(item => {
        if (item.hidden) {
          return false
        } else {
          // Temp set(will be used if only has one showing child)
          this.onlyOneChild = item
          return true
        }
      })

      // When there is only one child router, the child router is displayed by default
      if (showingChildren.length === 1) {
        this.alwaysShow = true
        return true
      }

      // Show parent if there are no child router to display
      if (showingChildren.length === 0) {
        this.onlyOneChild = { ... parent, path: '', noShowingChildren: true }
        return true
      }

      return false
    },
    resolvePath(routePath) {
      if (this.$Utils.validate.isExternal(routePath)) {
        return routePath
      }
      return path.resolve(this.basePath, routePath)
    },
    removeSession() {
      let menu_code = ''
      if (sessionStorage.getItem('menu_code')) {
        menu_code = sessionStorage.getItem('menu_code')
      }
      sessionStorage.clear()
      sessionStorage.setItem('menu_code', menu_code)
    }
  }
}
</script>
<style lang="scss">
.el-submenu__title i, .el-menu-item i {
  width: auto !important;
  margin-right: 8px !important;
  color: #e4e4e4;
  font-family: "iconfont";
  font-size: 16px !important;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
