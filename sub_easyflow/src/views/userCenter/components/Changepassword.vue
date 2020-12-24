<template>
  <div class="change-password">
    <el-form ref="passForm" :model="passForm" :rules="rules" label-width="120px">
      <el-form-item label="原密码" prop="oldPass">
        <el-input v-model="passForm.oldPass" type="password" autocomplete="off" />
      </el-form-item>
      <el-form-item label="新密码" prop="newPass">
        <el-input v-model="passForm.newPass" type="password" autocomplete="off" />
      </el-form-item>
      <el-form-item label="确认密码" prop="checkPass">
        <el-input v-model="passForm.checkPass" type="password" autocomplete="off" />
      </el-form-item>
      <el-form-item>
        <el-button type="danger" @click="submitForm('passForm')">
          提交
        </el-button>
        <el-button plain @click="resetForm('passForm')">
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  data() {
    var validateOldPass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (value.length < 5) {
          callback(new Error('密码不能小于5位'))
        } else {
          callback()
        }
      }
      callback()
    }
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      }
      if (value.length < 5) {
        return callback(new Error('密码不能小于5位'))
      } else {
        if (this.passForm.checkPass !== '') {
          this.$refs.passForm.validateField('checkPass')
        }
      }
      callback()
    }
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.passForm.newPass) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      passForm: {
        oldPass: '',
        newPass: '',
        checkPass: ''
      },
      rules: {
        oldPass: [
          { required: true, validator: validateOldPass, trigger: 'blur' }
        ],
        newPass: [
          { required: true, validator: validatePass, trigger: 'blur' }
        ],
        checkPass: [
          { required: true, validator: validatePass2, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$Apis.user.update_pwd(this.passForm.oldPass, this.passForm.newPass).then(response => {
            if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
              this.$alert('修改成功', '标题名称', {
                confirmButtonText: '确定'
              })
            } else {
              this.$alert(response.message, '标题名称', {
                confirmButtonText: '确定'
              })
            }
            this.resetForm('passForm')
          })
        } else {
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>
<style lang="scss" scoped>
.change-password {
  width: 50%;
  margin: 85px auto 0;
}
</style>
