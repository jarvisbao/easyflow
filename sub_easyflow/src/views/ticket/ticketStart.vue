<template>
  <div class="design-containers flow-start">
    <div class="top-fixed">
      <div class="topbar">
        <div class="flow-title">
          {{ ticketInfo.flow_name }} - {{ ticketInfo.start_name }}
        </div>
        <el-button id="back" plain size="small" @click="back">
          返回
        </el-button>
      </div>
      <div class="btn-list">
        <el-button id="submit" :loading="loading" type="primary" size="medium" @click="submit">
          提交
        </el-button>
        <!-- <el-button :loading="loadingSave" type="primary" plain size="medium" @click="save">
          暂存
        </el-button>
        <el-button :loading="loadingTest" type="primary" plain size="medium" @click="testSubmit">
          测试提交
        </el-button> -->
        <el-button id="view-flowimg" type="primary" plain size="medium" @click="viewFlowimg">
          流程图
        </el-button>
      </div>
    </div>
    <div class="container-box">
      <form-base-data ref="formBaseData" :form-items="formItems" :module_forms="module_forms" :url_forms="url_forms" :is-start="true" @getFormData="getFormData" />
    </div>
    <el-dialog v-if="dialogVisible" :visible.sync="dialogVisible" title="流程图" :close-on-click-modal="false" append-to-body width="80%">
      <flow-img :def_setting="def_setting" :is-start="true" />
    </el-dialog>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import formBaseData from './components/formBaseData'
import flowImg from './components/flowImg'
import moduleForm from '@/components/moduleForm/index'

export default {
  components: {
    formBaseData,
    flowImg
  },
  data() {
    return {
      loading: false,
      loadingSave: false,
      loadingTest: false,
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
      }
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
            this.$alert('请先设置流程发起表单', '提示', {
              confirmButtonText: '确定',
              callback: action => {
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
      this.loading = true
      this.$Apis.ticket.none_start(this.flow_id, this.openid, forms).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.$alert('提交成功！下一个节点：' + this.nextNode, '提示', {
            confirmButtonText: '确定',
            callback: action => {
              this.loading = false
              this.back()
            }
          })
        } else {
          this.$alert(response.message, '提示', {
            confirmButtonText: '确定',
            callback: action => {
              this.loading = false
            }
          })
        }
      })
    },
    save() {},
    testSubmit() {},
    viewFlowimg() {
      this.$Apis.flow.flow_info(this.flow_id).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          // this.flowInfo = response.payload
          this.def_setting = response.payload.def_setting
          this.dialogVisible = !this.dialogVisible
        }
      })
    }
  }
}
</script>
