<template>
  <div class="navbar">
    <hamburger :toggle-click="toggleSideBar" :is-active="sidebar.opened" class="hamburger-container" />
    <breadcrumb />
    <el-dropdown v-if="!qiankun" class="avatar-container" trigger="click">
      <div class="avatar-wrapper">
        <div class="user-avatar">
          <img :src="avatar">
        </div>
        <span class="name">{{ name }}</span>
        <!-- <i class="el-icon-caret-bottom"/> -->
      </div>
      <el-dropdown-menu slot="dropdown" class="user-dropdown">
        <router-link class="inlineBlock" :to="{name: 'user-center'}">
          <el-dropdown-item>
            <svg-icon icon-class="user_center" />个人中心
          </el-dropdown-item>
        </router-link>
        <el-dropdown-item divided>
          <div @click="logout">
            <svg-icon icon-class="logout" />LogOut
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'

export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  data() {
    return {
      qiankun: window.__POWERED_BY_QIANKUN__
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'name'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('ToggleSideBar')
    },
    logout() {
      this.$store.dispatch('LogOut').then(() => {
        location.reload() // 为了重新实例化vue-router对象 避免bug
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.navbar {
  height: 50px;
  line-height: 50px;
  box-shadow: 0 1px 3px 0 rgba(0,0,0,.12), 0 0 3px 0 rgba(0,0,0,.04);
  .hamburger-container {
    line-height: 58px;
    height: 50px;
    float: left;
    padding: 0 10px;
  }
  .screenfull {
    position: absolute;
    right: 90px;
    top: 16px;
    color: red;
  }
  .avatar-container {
    height: 50px;
    display: inline-block;
    position: absolute;
    right: 35px;
    .avatar-wrapper {
      cursor: pointer;
      margin-top: 5px;
      position: relative;
      line-height: initial;
      display: flex;
      align-items: center;
      .user-avatar {
        width: 40px;
        height: 40px;
        margin-right: 10px;
        background: #e0e0e0;
        overflow: hidden;
        border-radius: 50%;
        img {
          width: 100%;
        }
      }
      .name {
        color: #333;
      }
      .el-icon-caret-bottom {
        position: absolute;
        right: -20px;
        top: 25px;
        font-size: 12px;
      }
    }
  }
}
.user-dropdown .el-dropdown-menu__item {
  padding: 0 40px 0 20px;
  color: #666;
  .svg-icon {
    width: 20px;
    height: 20px;
    margin-right: 12px;
    vertical-align: -5px;
  }
}
.user-dropdown .el-dropdown-menu__item--divided {
  border-color: #eee;
  &:before {
    margin: 0 -40px 0 -20px;
  }
}
</style>

