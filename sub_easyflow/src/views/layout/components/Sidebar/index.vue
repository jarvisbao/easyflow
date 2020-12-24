<template>
  <el-scrollbar wrap-class="scrollbar-wrapper">
    <el-menu
      :show-timeout="200"
      :collapse="isCollapse"
      :background-color="variables.menuBg"
      :text-color="variables.menuText"
      :active-text-color="variables.menuActiveText"
      :default-active="$route.path"
      :default-openeds="openeds"
      mode="vertical"
      unique-opened
    >
      <sidebar-item v-for="menu in permission_menus" :key="menu.menu_code" :item="menu" :base-path="menu.uri" />
    </el-menu>
  </el-scrollbar>
</template>

<script>
import { mapGetters } from 'vuex'
import variables from '@/styles/variables.scss'
import SidebarItem from './SidebarItem'

export default {
  components: { SidebarItem },
  data() {
    return {
      openeds: []
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'permission_menus'
    ]),
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  created() {
    if (this.permission_menus.length >= 1) {
      this.openeds.push(this.permission_menus[0].menu_code)
    } else {
      this.openeds = []
    }
  }
}
</script>
