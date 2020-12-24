<template>
  <div class="login-container retrieve_password">
    <el-form ref="retrievePwd" :model="retrievePwd" :rules="retrievePwdRules" class="password-form" auto-complete="on" label-position="left">
      <h3 class="title">
        ENFO I5 Platform
      </h3>
      <div class="tips">
        忘记账号密码了吗？<div>如果没有绑定过邮箱请联系管理员</div>
      </div>
      <el-form-item prop="nickname">
        <span class="svg-container">
          <svg-icon icon-class="user_center" />
        </span>
        <el-input id="nickname" v-model="retrievePwd.nickname" name="nickname" type="text" auto-complete="on" placeholder="用户" />
      </el-form-item>
      <el-form-item prop="email">
        <span class="svg-container">
          <i class="el-icon-message" />
        </span>
        <el-input id="email" v-model="retrievePwd.email" name="email" type="text" auto-complete="on" placeholder="邮箱" />
      </el-form-item>
      <div class="button">
        <el-button id="submit" type="danger" @click="submitForm('retrievePwd')">
          提交
        </el-button>
        <el-button id="cancel" plain @click="back">
          返回
        </el-button>
      </div>
    </el-form>
  </div>
</template>
<script>
import { instance as Vue } from '@/life-cycle'
const isvalidUsername = Vue.$Utils.validate.isvalidUsername

export default {
  data() {
    const validateNickname = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入用户名'))
      } else if (!isvalidUsername(value)) {
        callback(new Error('请输入正确的用户名'))
      } else {
        callback()
      }
    }
    return {
      retrievePwd: {
        nickname: '',
        email: ''
      },
      retrievePwdRules: {
        nickname: [{ required: true, trigger: 'blur', validator: validateNickname }],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ]
      }
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const nickname = this.retrievePwd.nickname
          const email = this.retrievePwd.email
          this.$Apis.login.retrieve_pwd(nickname, email).then(response => {
            if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
              this.$alert('密码重置成功，新密码已发送至邮箱', '提示', {
                confirmButtonText: '确定',
                callback: action => {
                  this.$router.push({ path: '/' })
                }
              })
            } else {
              this.$alert(response.message, '提示', {
                confirmButtonText: '确定'
              })
            }
          })
        } else {
          return false
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
  position: fixed;
  height: 100%;
  width: 100%;
  background-color: #f7f8fa;
  background: url('~@/assets/images/loing_bg.svg') center center no-repeat;
  .password-form {
    width: 500px;
    max-width: 100%;
    margin: 180px auto;
  }
  .title {
    font-size: 30px;
    color: #7e6b6b;
    margin: 0px auto 40px auto;
    text-align: center;
    font-weight: normal;
  }
  .tips {
    margin-bottom: 30px;
    padding: 6px 16px;
    font-size: 14px;
    color: #6c7785;
    line-height: 24px;
    background: #e4f1f9;
    border-left: 5px solid #50bfff;
    border-radius: 4px;
  }
  .svg-container {
    padding: 0 0 0 12px;
    color: #bababa;
    vertical-align: middle;
    display: inline-block;
    .svg-icon {
      width: 18px;
      height: 18px;
    }
    i {
      font-size: 19px;
    }
  }
  .button {
    display: flex;
    margin-top: 60px;
    justify-content: space-between;
    .el-button {
      width: 42%;
    }
  }
}
</style>

