<template>
  <div class="turn-to-user">
    <van-form ref="form" :model="form">
      <van-field
        name="user"
        label="人员"
      >
        <template #input>
          <van-cell-select
            v-model="form.user"
            :border="false"
            placeholder="请选择"
            :disabled="isDisabled"
            clickable
            is-link
            multiple
            :columns="userList"
          />
        </template>
      </van-field>
      <van-field
        name="group"
        label="小组"
      >
        <template #input>
          <van-cell-select
            v-model="form.group"
            :border="false"
            placeholder="请选择"
            :disabled="isDisabled"
            clickable
            is-link
            multiple
            :columns="groupList"
          />
        </template>
      </van-field>
      <van-field
        name="role"
        label="角色"
      >
        <template #input>
          <van-cell-select
            v-model="form.role"
            :border="false"
            placeholder="请选择"
            :disabled="isDisabled"
            clickable
            is-link
            multiple
            :columns="roleList"
          />
        </template>
      </van-field>
      <van-field
        name="organ"
        label="机构"
      >
        <template #input>
          <van-cell-select
            v-model="form.organ"
            :border="false"
            placeholder="请选择"
            :disabled="isDisabled"
            clickable
            is-link
            multiple
            :columns="organList"
          />
        </template>
      </van-field>
    </van-form>
  </div>
</template>
<script>
export default {
  name: 'turn_to_user',
  label: '转办',
  props: {
    moduleInit: { // 父组件传下来的默认参数供子组件调用
      type: Object,
      default: () => {}
    },
    isEdit: {
      type: Boolean,
      default: true
    },
    formValue: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      form: {
        user: null,
        group: null,
        role: null,
        organ: null
      },
      userList: [],
      groupList: [],
      roleList: [],
      organList: [],
      isDisabled: false
    }
  },
  created() {
    this.fetchData()
    if (this.isEdit) {
      this.moduleInit.deal_or_view = true
      this.isDisabled = false
    } else {
      this.moduleInit.deal_or_view = false
      this.isDisabled = true
      this.form = this.formValue
    }
  },
  methods: {
    fetchData() {
      this.$Apis.flowCommon.list_user().then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.userList = response.payload.map(item => {
            return {
              label: item.text,
              value: item.code
            }
          })
        }
      })
      this.$Apis.flowCommon.list_group().then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.groupList = response.payload.map(item => {
            return {
              label: item.text,
              value: item.code
            }
          })
        }
      })
      this.$Apis.flowCommon.list_role().then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.roleList = response.payload.map(item => {
            return {
              label: item.text,
              value: item.code
            }
          })
        }
      })
      this.$Apis.flowCommon.list_org().then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.organList = response.payload.map(item => {
            return {
              label: item.text,
              value: item.code
            }
          })
        }
      })
    },
    valid() {
      return new Promise((resolve, reject) => {
        this.$refs['form'].validate().then(() => {
          this.dataValid = true
          resolve(this.dataValid)
        }).catch(() => {
          this.dataValid = false
          // reject(new Error('表单数据校验失败').message)
          resolve(this.dataValid)
        })
      })
    },
    get_data() {
      if (this.dataValid) {
        this.$emit('get_data', this.form)
      }
    },
    submit(action, owner_id) {
      const forms = {
        turn_to_user: this.form
      }
      const turns = []
      Object.values(this.form).forEach(item => {
        if (item) {
          turns.push(...item)
        }
      })
      const data = {
        ticket_id: this.moduleInit.ticket_id,
        action: action,
        owner_id: owner_id,
        task_id: this.moduleInit.task_id,
        forms: forms,
        late_id: this.moduleInit.ticket_data.ticket_info.late_id,
        turns: turns
      }
      this.$Apis.ticket.action_do(data).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.$emit('close_overlay')
          this.$toast({
            message: '提交成功！',
            forbidClick: true,
            onClose: () => {
              this.$emit('close')
              this.$router.replace('/ticket/participate')
            }
          })
        } else {
          this.$emit('close_overlay')
          this.$dialog.alert({
            message: response.message
          })
        }
      })
    }
  }
}
</script>
