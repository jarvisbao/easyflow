<template>
  <div class="master-userinfo">
    <van-cell-group>
      <van-cell center is-link title="头像">
        <template #default>
          <van-uploader :before-read="beforeRead" :after-read="afterRead">
            <div class="avatar">
              <img :src="avatar">
            </div>
          </van-uploader>
        </template>
      </van-cell>
      <van-cell title="姓名" :value="userinfo.full_name" />
      <van-cell title="昵称" :value="userinfo.nickname" />
      <van-cell title="性别" :value="userinfo.gender" />
      <van-cell title="角色" :value="roles.join(',')" />
      <van-cell title="当前所属组织机构" :value="active_org" />
      <van-cell title="手机号码" :value="mobile" :is-link="mobile ? false : true" :to="mobile ? '' : { name: 'bind-mobile' }" />
      <van-cell title="邮箱" :value="email" :is-link="email ? false : true" :to="email ? '' : { name: 'bind-email' }" />
    </van-cell-group>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  data() {
    return {
      action: 'string',
      roles: [],
      mobile: '',
      email: '',
      rules: {
        mobile: [
          // { required: true, message: '请输入手机号码', trigger: 'blur' },
          { pattern: /^(13[0-9]|147|15[0-9]|17[0-9]|18[0-9])\d{8}$/, message: '请输入正确的手机号码', trigger: ['blur', 'change'] }
        ]
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
      head_id: null,
      active_org_id: null,
      active_org: null
    }
  },
  computed: {
    ...mapGetters([
      'avatar',
      'userinfo',
      'myroles',
      'orgs'
    ])
  },
  created() {
    this.head_id = this.userinfo.head_id
    this.$Apis.user.user_loginid_list().then(response => {
      if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
        response.payload.forEach((value, key) => {
          if (value.login_type === 'email') {
            this.email = value.login_id
          } else if (value.login_type === 'lark') {
            this.Lark = value.login_id
          } else if (value.login_type === 'dingtalk') {
            this.DingTalk = value.login_id
          } else if (value.login_type === 'mobile') {
            this.mobile = value.login_id
          } else if (value.login_type === 'wechat') {
            this.WeChat = value.login_id
          }
        })
      }
    })
    this.active_org_id = this.$store.getters.active_org_id
    const roles = this.unique(this.myroles)
    roles.forEach(item => {
      this.roles.push(item.role_name)
    })
    // this.roles = this.unique(this.myroles)
    this.orgs.forEach(item => {
      if (item.org_id === this.active_org_id) {
        this.active_org = item.name
      }
    })
  },
  methods: {
    ...mapActions([
      'SetUserActiveOrg'
    ]),
    change(val) {
      this.SetUserActiveOrg(val)
    },
    beforeRead(file) {
      const isJPG = file.type === 'image/jpg'
      const isJPEG = file.type === 'image/jpeg'
      const isPNG = file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 1
      if (!isJPG && !isJPEG && !isPNG) {
        this.$toast('上传头像图片必须是 JPG/JPEG/PNG 格式!')
        if (!isLt2M) {
          this.$toast('上传头像图片大小不能超过 1MB!')
        }
        return false
      } else {
        return true
      }
    },
    afterRead(file) {
      const file_name = file.file.name
      const data = file.content
      if (this.head_id) {
        this.$Apis.attachment.update_attachment(this.head_id, data).then(response => {
          if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
            this.$store.commit('SET_AVATAR', data)
          } else {
            this.$dialog.alert({
              message: response.message
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
          } else {
            this.$dialog.alert({
              message: response.message
            })
          }
        })
      }
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
.avatar {
  float: right;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  img {
    width: 100%;
  }
}
</style>
