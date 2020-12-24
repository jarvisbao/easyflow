<template>
  <div class="countersign-vote">
    <van-form ref="form" :model="form">
      <van-field
        v-model="sign_name"
        :rules="[{ required: true, message: '请选择会签意见' }]"
        :disabled="isDisabled"
        name="sign_value"
        required
        clickable
        readonly
        label="任务节点"
        placeholder="请选择"
        @click="showPicker = true"
      />
      <van-popup v-if="!isDisabled" v-model="showPicker" position="bottom">
        <van-picker
          :columns="sign_options"
          value-key="label"
          show-toolbar
          title=""
          @confirm="checkOption"
          @cancel="showPicker = false"
        />
      </van-popup>
      <van-field
        v-model="form.summary"
        :disabled="isDisabled"
        autosize
        type="textarea"
        rows="3"
        name="summary"
        label="评论"
        placeholder="请输入内容"
      />
    </van-form>
  </div>
</template>
<script>
export default {
  name: 'countersign_vote',
  label: '会签投票表单',
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
        sign_value: null,
        summary: null
      },
      sign_name: null,
      sign_options: [
        {
          label: '同意',
          value: 'agree'
        },
        {
          label: '反对',
          value: 'against'
        },
        {
          label: '弃权',
          value: 'waiver'
        }
      ],
      dataValid: false,
      isDisabled: false,
      showPicker: false
    }
  },
  created() {
    if (this.isEdit) {
      this.moduleInit.deal_or_view = true
      this.isDisabled = false
    } else {
      this.moduleInit.deal_or_view = false
      this.isDisabled = true
      this.form = this.formValue
      if (this.form.sign_value === 'agree') {
        this.sign_name = '同意'
      } else if (this.form.sign_value === 'against') {
        this.sign_name = '反对'
      } else {
        this.sign_name = '弃权'
      }
    }
  },
  methods: {
    checkOption(val) {
      this.form.sign_value = val.value
      this.sign_name = val.label
      this.showPicker = false
    },
    valid() {
      return new Promise((resolve, reject) => {
        this.$refs['form'].validate().then(() => {
          this.dataValid = true
          resolve(this.dataValid)
        }).catch(() => {
          this.dataValid = false
          resolve(this.dataValid)
        })
      })
    },
    get_data() {
      if (this.dataValid) {
        this.$emit('get_data', this.form)
      }
    }
  }
}
</script>
