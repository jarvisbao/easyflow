<template>
  <div class="box">
    <div v-if="formItems.length < 1 && module_forms.length < 1 && !url_forms" class="no-forms">
      <van-empty description="无表单数据" />
    </div>
    <div v-else>
      <div v-for="(item) in formItems" :key="item.name">
        <h2 class="van-doc-demo-block__title">
          {{ item.name }}
        </h2>
        <div>
          <generate-form-mobile v-if="show" ref="generateFormMobile" :data="item.jsonData" :value="item.editData" :remote="remoteFuncs" :id="item.owner" :edit="edit" :module-init="moduleInit" />
        </div>
      </div>
      <div v-for="item in module_forms" :key="item.name">
        <h2 class="van-doc-demo-block__title">
          {{ item.label }}
        </h2>
        <div>
          <component :ref="item.name" :is="item.name" :module-init="moduleInit" :is-start="isStart" keep-alive @get_data="get_module_data" />
        </div>
      </div>
      <div v-if="url_forms">
        <h2 class="van-doc-demo-block__title">
          URL表单
        </h2>
        <div>
          <iframe :src="url_forms" width="100%" height="500" frameborder="0" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    formItems: {
      type: Array,
      default: () => []
    },
    module_forms: {
      type: Array,
      default: () => []
    },
    url_forms: {
      type: String,
      default: null
    },
    edit: {
      type: Boolean,
      default: true
    },
    isStart: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const that = this
    return {
      remoteFuncs: {
        remote_http_get(uri, body) {
          if (uri) {
            return that.$Utils.request({
              url: uri,
              method: 'get',
              params: body
            })
          } else {
            return new Promise((resolve, reject) => {
              resolve()
            })
          }
        },
        remote_http_post(uri, body) {
          if (uri) {
            return that.$Utils.request({
              url: uri,
              method: 'post',
              data: body
            })
          } else {
            return new Promise((resolve, reject) => {
              resolve()
            })
          }
        }
      },
      // tabActiveNames: 1,
      forms: {},
      isValidate: [],
      show: true,
      moduleValid: false,
      moduleData: null
    }
  },
  computed: {
    ...mapGetters([
      'moduleInit'
    ])
  },
  methods: {
    getData() {
      this.isValidate = []
      const generateForm = this.$refs.generateFormMobile
      if (this.module_forms.length > 0) {
        this.module_forms.forEach(item => {
          this.$refs[item.name][0].valid().then((data) => {
            this.isValidate.push(data)
            if (data) {
              this.$refs[item.name][0].get_data()
              this.$set(this.forms, item.name, this.moduleData)
            }
          })
        })
      }
      if (generateForm) {
        generateForm.forEach(item => {
          item.getData().then(data => {
            this.isValidate.push(true)
            this.$set(this.forms, item.$el.id, data)
          }).catch(e => {
            // 数据校验失败
            this.isValidate.push(false)
          })
        })
      }
      if (!generateForm && this.module_forms.length < 1) {
        this.$emit('getFormData', this.forms)
      } else {
        setTimeout(() => {
          // 把表单数组传递给父组件
          if (this.isValidate.indexOf(false) === -1) {
            this.$emit('getFormData', this.forms)
          }
        }, 300)
      }
    },
    // get_valid(events) {
    //   this.moduleValid = events
    //   this.isValidate.push(events)
    // },
    get_module_data(data) {
      this.moduleData = data
    }
  }
}
</script>
<style lang="scss" scoped>
.van-doc-demo-block__title {
  margin: 0;
  padding: 20px 16px 16px;
  color: rgba(69, 90, 100, 0.6);
  font-weight: normal;
  font-size: 14px;
  line-height: 16px;
  background: #f7f8fa;
}
</style>
