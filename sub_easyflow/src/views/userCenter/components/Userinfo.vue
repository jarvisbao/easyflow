<template>
  <div class="userinfo">
    <el-upload
      :action="action"
      :show-file-list="false"
      :auto-upload="false"
      :on-change="changeUpload"
      class="avatar-uploader"
    >
      <div class="user-avatar">
        <img :src="avatar">
      </div>
      <div class="user-code">
        {{ userinfo.full_name }} <span>{{ userinfo.nickname }}</span>
      </div>
      <div class="avatar-uploader-icon avatar-upload">
        <i class="el-icon-upload2" />上传头像
      </div>
    </el-upload>
    <div class="userinfo-box">
      <div v-if="roles.length" class="user-role">
        <label>角色</label>
        <div class="role-item">
          <div v-for="item in roles" :key="item.role_id">
            {{ item.role_name }}
          </div>
        </div>
      </div>
      <el-form ref="userinfo" :model="userinfo" :rules="rules" label-width="120px">
        <el-form-item label="姓名">
          <el-input v-model="userinfo.full_name" :disabled="true" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="userinfo.nickname" :disabled="true" />
        </el-form-item>
        <el-form-item label="性别">
          <el-input v-model="userinfo.gender" :disabled="true" />
        </el-form-item>
        <el-form-item label="名">
          <el-input v-model="userinfo.first_name" :disabled="true" />
        </el-form-item>
        <el-form-item label="姓">
          <el-input v-model="userinfo.last_name" :disabled="true" />
        </el-form-item>
        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model="mobile" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email" class="email-form-item">
          <el-input v-if="email ? true : false" v-model="email" :disabled="email ? true: false" />
          <!-- <el-button v-if="email" type="primary" round @click="update_email">更改邮箱</el-button> -->
          <span v-else class="action-email" @click="bind_email"><i class="el-icon-edit" />绑定邮箱</span>
        </el-form-item>
        <!-- <el-form-item>
          <el-button type="danger" @click="submitForm('userinfo')">保存修改</el-button>
        </el-form-item> -->
      </el-form>
    </div>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="30%"
    >
      <bind-email v-if="dialogBind" :send-code="sendCode" @timeDown="timeDown" @show="isShow" />
      <update-email v-else :send-code="sendCode" @timeDown="timeDown" @show="isShow" />
    </el-dialog>
    <!-- vueCropper 剪裁图片实现-->
    <el-dialog :visible.sync="dialogCropperVisible" title="图片剪裁" append-to-body>
      <div class="cropper-content">
        <div class="tips">
          提示：图片尺寸不要小于145*145
        </div>
        <div class="cropper" style="text-align:center">
          <vueCropper
            ref="cropper"
            :img="option.img"
            :output-size="option.size"
            :output-type="option.outputType"
            :info="true"
            :full="option.full"
            :can-move="option.canMove"
            :can-move-box="option.canMoveBox"
            :original="option.original"
            :auto-crop="option.autoCrop"
            :fixed="option.fixed"
            :center-box="option.centerBox"
            :info-true="option.infoTrue"
            :fixed-box="option.fixedBox"
            :auto-crop-width="option.autoCropWidth"
            :auto-crop-height="option.autoCropHeight"
          />
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button :loading="loading" type="danger" @click="finish">
          确认
        </el-button>
        <el-button plain @click="dialogCropperVisible = false">
          取 消
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import updateEmail from './updateEmail'
import bindEmail from './bindEmail'
import { mapGetters } from 'vuex'
import { VueCropper } from 'vue-cropper'

export default {
  components: {
    updateEmail,
    bindEmail,
    VueCropper
  },
  data() {
    return {
      action: 'string',
      // userinfo: {
      //   full_name: '',
      //   nickname: '',
      //   gender: '',
      //   first_name: '',
      //   last_name: ''
      // },
      roles: [],
      mobile: '',
      email: '',
      rules: {
        mobile: [
          // { required: true, message: '请输入手机号码', trigger: 'blur' },
          { pattern: /^(13[0-9]|147|15[0-9]|17[0-9]|18[0-9])\d{8}$/, message: '请输入正确的手机号码', trigger: ['blur', 'change'] }
        ]
      },
      dialogTitle: '',
      dialogVisible: false,
      dialogBind: false,
      sendCode: {
        disabled: false,
        sending: true,
        second: 60
      },
      dialogCropperVisible: false,
      option: {
        img: '', // 裁剪图片的地址
        info: true, // 裁剪框的大小信息
        outputSize: 0.5, // 裁剪生成图片的质量
        outputType: 'jpg', // 裁剪生成图片的格式
        canScale: true, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        autoCropWidth: 160, // 默认生成截图框宽度
        autoCropHeight: 160, // 默认生成截图框高度
        fixedBox: false, // 固定截图框大小 不允许改变
        fixed: true, // 是否开启截图框宽高固定比例
        // fixedNumber: [1, 1], // 截图框的宽高比例
        full: false, // 是否输出原图比例的截图
        canMoveBox: true, // 截图框能否拖动
        original: false, // 上传图片按照原始比例渲染
        centerBox: true, // 截图框是否被限制在图片里面
        infoTrue: true // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
      },
      uploadFile: {},
      // 防止重复提交
      loading: false,
      head_id: null
    }
  },
  computed: {
    ...mapGetters([
      'avatar',
      'userinfo',
      'myroles'
    ])
  },
  created() {
    this.head_id = this.userinfo.head_id
    this.$Apis.user.user_loginid_list().then(response => {
      if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
        response.payload.forEach((value, key) => {
          if (value.login_type === 'email') {
            this.email = value.login_id
          }
        })
      }
    })
    this.roles = this.unique(this.myroles)
  },
  methods: {
    changeUpload(file) {
      this.uploadFile = file.raw
      this.$nextTick(() => {
        const isJPG = file.raw.type === 'image/jpg'
        const isJPEG = file.raw.type === 'image/jpeg'
        const isPNG = file.raw.type === 'image/png'
        const isLt2M = file.raw.size / 1024 / 1024 < 1
        if (!isJPG && !isJPEG && !isPNG) {
          this.$message.error('上传头像图片必须是 JPG/JPEG/PNG 格式!')
          if (!isLt2M) {
            this.$message.error('上传头像图片大小不能超过 1MB!')
          }
          return (isJPG || isJPEG || isPNG) && isLt2M
        } else {
          this.option.img = URL.createObjectURL(file.raw)
          this.dialogCropperVisible = true
          this.loading = false
        }
      })
    },
    // 点击裁剪，这一步是可以拿到处理后的地址
    finish() {
      this.$refs.cropper.getCropData((data) => {
        this.loading = true
        var file_name = this.uploadFile.uid + '.jpg'
        // 判断 head_id 是否存在
        if (this.head_id) {
          this.$Apis.attachment.update_attachment(this.head_id, data).then(response => {
            if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
              this.$store.commit('SET_AVATAR', data)
              this.dialogCropperVisible = false
            } else {
              this.$alert(response.message, '标题名称', {
                confirmButtonText: '确定',
                callback: action => {
                  this.loading = false
                }
              })
            }
          })
        } else {
          this.$Apis.attachment.save_attachment(file_name, data).then(response => {
            if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
              var openid = null
              var first_name = this.userinfo.first_name
              var last_name = this.userinfo.last_name
              var gender = this.userinfo.gender
              var props = this.userinfo.props
              var birthday = this.userinfo.birthday
              var head_id = response.payload
              this.head_id = head_id
              this.$Apis.user.user_update(openid, gender, birthday, last_name, first_name, props, head_id)
              this.$store.commit('SET_AVATAR', data)
              this.dialogCropperVisible = false
            } else {
              this.$alert(response.message, '标题名称', {
                confirmButtonText: '确定',
                callback: action => {
                  this.loading = false
                }
              })
            }
          })
        }
      })
    },
    // submitForm(formName) {
    //   this.$refs[formName].validate((valid) => {
    //     if (valid) {
    //       this.$alert('submit!', '标题名称', {
    //         confirmButtonText: '确定'
    //       })
    //     } else {
    //       console.log('error submit!!')
    //       return false
    //     }
    //   })
    // },
    bind_email() {
      this.dialogVisible = !this.dialogVisible
      this.dialogTitle = '绑定邮箱'
      this.dialogBind = true
    },
    update_email() {
      this.dialogVisible = !this.dialogVisible
      this.dialogTitle = '更改邮箱'
      this.dialogBind = false
    },
    isShow() {
      this.dialogVisible = !this.dialogVisible
    },
    timeDown() {
      const timer = setInterval(() => {
        this.sendCode.second--
        if (this.sendCode.second === 0) {
          clearInterval(timer)
          this.sendCode.second = 60
          this.sendCode.sending = true
          this.sendCode.disabled = false
        }
      }, 1000)
    },
    unique(arr) {
      const res = new Map()
      // 返回arr数组过滤后的结果，结果为一个数组  过滤条件是，如果res中没有某个键，就设置这个键的值为1
      return arr.filter((arr) => !res.has(arr.role_name) && res.set(arr.role_name, 1))
    }
  }
}
</script>
<style lang="scss" scoped>
$color_333: #333;
.userinfo {
  margin-top: 75px;
  text-align: center;
  .user-avatar {
    width: 145px;
    height: 145px;
    margin: 0 auto;
    background: #ddd;
    border-radius: 50%;
    overflow: hidden;
    img {
      display: block;
      width: 100%;
      margin: 0 auto;
    }
  }
  .user-code {
    font-size: 16px;
    color: $color_333;
    line-height: 50px;
    span {
      font-size: 14px;
    }
  }
  .avatar-upload {
    display: flex;
    width: 108px;
    height: 30px;
    margin: 0 auto;
    background: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 3px;
    text-align: center;
    line-height: 30px;
    font-size: 14px;
    color: #666666;
    align-items: center;
    justify-content: center;
    .el-icon-upload2 {
      margin-right: 6px;
      font-size: 18px;
      color: #9c9c9c;
    }
  }
  .userinfo-box {
    width: 50%;
    margin: 35px auto 0;
    text-align: left;
    .user-role {
      display: flex;
      margin-bottom: 30px;
      align-items: center;
      label {
        display: block;
        width: 120px;
        padding-right: 15px;
        text-align: right;
        color: #666;
      }
      .role-item {
        display: flex;
        flex-wrap: wrap;
        flex: 1;
        padding: 5px 10px;
        background: #fdf6ec;
        border: 1px solid #fcead1;
        font-size: 12px;
        color: #d78101;
        line-height: 22px;
        border-radius: 3px;
        div {
          margin: 0 8px;
        }
      }
    }
  }
  .el-input__inner {
    border: 1px solid #dcdfe6 !important;
  }
  .el-form {
    width: 100%;
    .email-form-item {
      .el-form-item__content {
        display: flex;
        .action-email {
          display: block;
          color: #797979;
          cursor: pointer;
          i {
            margin-right: 6px;
            font-size: 16px;
            color: #4da0fd;
          }
        }
      }
    }
  }
  .el-dialog__wrapper {
    text-align: left;
  }
  .bind-email /deep/ .el-form-item__content {
    display: flex;
  }
  $bg: #4a9ff8;
  $bg_disabled: #bed5ed;
  .bind-email /deep/ .el-form {
    width: 90%;
    .send-btn {
      width: 160px;
      margin-left: 20px;
      padding: 0;
      background: $bg;
      border-color: $bg;
      color: #fff;
      &:disabled {
        background: $bg_disabled;
        border-color: $bg_disabled;
      }
    }
  }
}
// 截图
.cropper-content {
  .tips {
    margin-top: -20px;
    margin-bottom: 12px;
  }
  .cropper {
    width: auto;
    height: 300px;
  }
}
.el-button.is-plain:hover,
.el-button.is-plain:focus {
  border-color: #f56868;
  color: #f56868;
}
</style>
