<template>
  <div class="app-container">
    <div class="userinfo" @click="gotoInfo">
      <div class="avatar">
        <img :src="avatar">
      </div>
      <div class="info">
        <div class="name">
          {{ userinfo.full_name }}
        </div>
        <span class="nickname">{{ userinfo.nickname }}</span>
      </div>
      <van-icon name="arrow" />
    </div>
    <van-cell title="退出登录" @click="logout" style="text-align: center; color: #F56C6C; font-weight: bold;" />
    <page-footer />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  data() {
    return {}
  },
  computed: {
    ...mapGetters([
      'avatar',
      'userinfo'
    ])
  },
  created() {
  },
  methods: {
    logout() {
      this.$store.dispatch('LogOut').then(() => {
        location.reload() // 为了重新实例化vue-router对象 避免bug
      })
    },
    gotoInfo() {
      this.$router.push({ name: 'user-info' })
    }
  }
}
</script>
<style lang="scss" scoped>
.app-container {
  min-height: calc(100vh - 50px);
  background: #f3f3f3;
  .userinfo {
    display: flex;
    align-items: center;
    padding: 20px;
    margin-bottom: 8px;
    background: #fff;
    .avatar {
      width: 50px;
      height: 50px;
      margin-right: 15px;
      border-radius: 8px;
      overflow: hidden;
      img {
        width: 100%;
      }
    }
    .info {
      flex: 1;
      .name {
        margin-bottom: 10px;
      }
      .nickname {
        padding: 3px;
        font-size: 13px;
        background: #f2f2f2;
        border: 1px solid #f2f2f2;
        border-radius: 3px;
        color: #969696;
      }
    }
  }
}
</style>

