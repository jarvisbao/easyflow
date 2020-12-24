<template>
  <div class="main-container">
    <div class="top-save" @click="submit">
      保存
    </div>
    <van-form ref="mobile">
      <van-field
        v-model="mobile"
        :rules="[{ pattern, message: '请输入正确的手机号码' }]"
        required
        name="mobile"
        label="手机号"
        type="tel"
        placeholder="请输入手机号"
      />
    </van-form>
  </div>
</template>
<script>
export default {
  data() {
    return {
      mobile: null,
      pattern: /^1[3-9]\d{9}$/
    }
  },
  methods: {
    submit() {
      this.$refs.mobile.validate().then(() => {
        this.$Apis.user.user_loginid_create_mobile(this.mobile).then(response => {
          if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
            this.$emit('setMobile', this.mobile.mobile)
            this.$router.go(-1)
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
