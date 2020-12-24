<template>
  <div class="view-record">
    <div class="view-record__box">
      <div class="item">
        <label>同意票数:</label>
        <div class="msg">
          {{ form.agree }}
        </div>
      </div>
      <div class="item">
        <label>反对票数:</label>
        <div class="msg">
          {{ form.against }}
        </div>
      </div>
      <div class="item">
        <label>弃权票数:</label>
        <div class="msg">
          {{ form.waiver }}
        </div>
      </div>
      <div class="item">
        <label>投票结果:</label>
        <div class="msg">
          {{ form.result ? '通过' : '否决' }}
        </div>
      </div>
      <div class="item">
        <label>结果评论:</label>
        <div class="msg">
          <pre>{{ form.message }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'countersign_result',
  label: '会签结果表单',
  props: {
    moduleInit: { // 父组件传下来的默认参数供子组件调用
      type: Object,
      default: () => {}
    },
    formValue: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      form: {
        agree: null,
        against: null,
        waiver: null,
        result: false,
        message: null
      }
    }
  },
  created() {
    this.form = this.formValue
  },
  methods: {
  }
}
</script>
