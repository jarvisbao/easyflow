<template>
  <div>
    <van-sticky>
      <van-nav-bar
        title="找回密码"
        left-text="返回"
        left-arrow
        @click-left="back"
      />
    </van-sticky>
    <div class="retrieve_password">
      <div class="tips">
        忘记账号密码了吗？<div>如果没有绑定过邮箱请联系管理员</div>
      </div>
      <van-form @submit="onSubmit">
        <van-field
          v-model="retrievePwd.nickname"
          :rules="[{ required: true, message: '请填写用户名' }]"
          name="nickname"
          label="用户名"
          placeholder="用户名"
        />
        <van-field
          v-model="retrievePwd.email"
          :rules="[{ pattern, message: '请填写正确的邮箱' }]"
          name="email"
          label="邮箱"
          placeholder="邮箱"
        />
        <div style="margin: 50px 30px 0;">
          <van-button round block type="info" native-type="submit" color="#f56868">
            提交
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>
<script>

export default {
  data() {
    return {
      retrievePwd: {
        nickname: '',
        email: ''
      },
      pattern: /^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$/
    }
  },
  methods: {
    onSubmit(values) {
      const nickname = this.retrievePwd.nickname
      const email = this.retrievePwd.email
      this.$Apis.login.retrieve_pwd(nickname, email).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.$dialog.alert({
            title: '提示',
            message: '密码重置成功，新密码已发送至邮箱'
          }).then(() => {
            this.$router.push({ path: '/' })
          })
        } else {
          this.$dialog.alert({
            title: '提示',
            message: response.message
          })
        }
      })
    },
    back() {
      this.$router.push({ path: '/' })
    }
  }
}
</script>

<style lang="scss" scoped>
.retrieve_password {
  margin-top: 50px;
  .title {
    margin-bottom: 40px;
  }
  .tips {
    margin: 0 20px 30px;
    padding: 6px 16px;
    font-size: 14px;
    color: #6c7785;
    line-height: 24px;
    background: #e4f1f9;
    border-left: 5px solid #50bfff;
    border-radius: 4px;
  }
}
</style>
