<template>
  <div class="change-password">
    <div class="top-save" @click="submit">
      保存
    </div>
    <van-form ref="passForm">
      <van-field
        v-model="passForm.oldPass"
        :rules="[{ validator, message: '密码不能小于5位' }]"
        clearable
        name="oldPass"
        label="原密码"
        type="password"
        placeholder="请输入原密码"
      />
      <van-field
        v-model="passForm.newPass"
        :rules="[{ validator, message: '密码不能小于5位' }]"
        type="password"
        name="newPass"
        clearable
        label="新密码"
        placeholder="请输入新密码"
      />
      <van-field
        v-model="passForm.checkPass"
        :rules="[{ validator: checkPass, message: '两次输入密码不一致' }]"
        type="password"
        name="checkPass"
        clearable
        label="确认密码"
        placeholder="再次填写确认"
      />
    </van-form>
  </div>
</template>
<script>
export default {
  data() {
    return {
      passForm: {
        oldPass: '',
        newPass: '',
        checkPass: ''
      }
    }
  },
  methods: {
    validator(val) {
      return val.length >= 5
    },
    checkPass(val) {
      return val === this.passForm.newPass
    },
    submit() {
      this.$refs.passForm.validate().then(() => {
        this.$Apis.user.update_pwd(this.passForm.oldPass, this.passForm.newPass).then(response => {
          if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
            this.$toast({
              message: '修改成功',
              forbidClick: true,
              onClose: () => {
                this.$router.go(-1)
              }
            })
          } else {
            this.$dialog.alert({
              message: response.message
            })
          }
        })
      }).catch(() => {})
    }
  }
}
</script>
<style lang="scss" scoped>

</style>
