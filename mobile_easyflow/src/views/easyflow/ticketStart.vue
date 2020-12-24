<template>
  <div class="ticket-start">
    <div class="start-form">
      <form-base-data ref="formBaseData" :form-items="formItems" :module_forms="module_forms" :url_forms="url_forms" :is-start="true" @getFormData="getFormData" />
    </div>
    <van-tabbar :border="false">
      <div style="padding: 0 16px; width: 100%">
        <van-button :disabled="disabled" round type="info" style="width: 100%" @click="submit">
          提交
        </van-button>
      </div>
    </van-tabbar>
    <overlay-loading :show="showOverlay" :text="loadingText" />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import formBaseData from './components/formBaseData'
import moduleForm from '@/components/moduleForm/index'

export default {
  components: {
    formBaseData
  },
  data() {
    return {
      formItems: [],
      module_forms: [],
      url_forms: null,
      ticketInfo: {},
      flow_id: null,
      currentTab: '',
      nextNode: '',
      dialogVisible: false,
      def_setting: '',
      moduleInit: {
        ticket_id: null,
        task_id: null,
        ticket_data: null,
        forms: null,
        deal_or_view: null
      },
      disabled: false,
      showOverlay: false,
      loadingText: null
    }
  },
  computed: {
    ...mapGetters([
      'openid'
    ])
  },
  created() {
    this.fetchData()
  },
  methods: {
    getFlowId() {
      this.flow_id = this.$route.query.flow_id ? this.$route.query.flow_id : null
    },
    fetchData() {
      this.getFlowId()
      this.$Apis.ticket.none_plan_start(this.flow_id).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.ticketInfo = response.payload
          if (this.ticketInfo.start_form.edit_form || this.ticketInfo.module_forms || this.ticketInfo.url_forms) {
            if (this.ticketInfo.start_form.edit_form) {
              this.ticketInfo.start_form.edit_form.forEach(item => {
                if (item.form.indexOf('-default') === -1) {
                  // 获取操作定义中个性修改的表单
                  const methodsFrom = this.ticketInfo.object.filter(val => {
                    return val.project_code === item.project_code && val.object_code === item.owner
                  })
                  methodsFrom.forEach(val => {
                    this.$Apis.object.method_info(item.form).then(response => {
                      if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
                        this.formItems.push({
                          owner: item.owner,
                          name: response.payload.operate_name,
                          jsonData: JSON.parse(response.payload.design_form),
                          biz_code: val.biz_code,
                          editData: {}
                        })
                      }
                    })
                  })
                } else {
                  // 获取默认的表单
                  const items = this.ticketInfo.object.filter(val => {
                    return val.project_code === item.project_code && val.object_code === item.owner
                  })
                  items.forEach(val => {
                    this.$Apis.object.get_object_design_by_id(val.object_id).then(response => {
                      if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
                        this.formItems.push({
                          owner: item.owner,
                          name: val.name,
                          jsonData: JSON.parse(response.payload),
                          biz_code: val.biz_code,
                          editData: {}
                        })
                      }
                    })
                  })
                }
              })
            }
            if (this.ticketInfo.module_forms.length > 0) {
              this.ticketInfo.module_forms.forEach(item => {
                moduleForm.forEach(ii => {
                  if (ii.name === item.name) {
                    this.module_forms.push({
                      name: item.name,
                      label: ii.label
                    })
                  }
                })
                // this.module_forms.push(item.name)
              })
            }
            if (this.ticketInfo.url_forms.length > 0) {
              this.url_forms = this.ticketInfo.url_forms[0].url
            }
          } else {
            this.$toast({
              message: '请先设置流程发起表单',
              forbidClick: true,
              onClose: () => {
                this.back()
              }
            })
          }
          this.nextNode = this.ticketInfo.next_node[0].name
          this.moduleInit.ticket_data = response.payload
          this.$store.commit('SET_MODULE_INIT', this.moduleInit)
        }
      })
    },
    back() {
      this.$router.go(-1)
    },
    submit() {
      // 调用子组件 getdata() 方法
      this.$refs.formBaseData.getData()
    },
    getFormData(params) {
      const forms = params
      this.disabled = true
      this.showOverlay = true
      this.loadingText = '提交中...'
      this.$Apis.ticket.none_start(this.flow_id, this.openid, forms).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.showOverlay = false
          this.loadingText = null
          this.$toast({
            message: '提交成功！',
            forbidClick: true,
            onClose: () => {
              this.disabled = false
              this.back()
            }
          })
        } else {
          this.showOverlay = false
          this.loadingText = null
          this.$dialog.alert({
            message: response.message
          }).then(() => {
            this.disabled = false
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.ticket-start {
  .start-form {
    padding-bottom: 80px;
  }
}
</style>
