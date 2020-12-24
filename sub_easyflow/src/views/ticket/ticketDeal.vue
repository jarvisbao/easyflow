<template>
  <div class="design-containers flow-start">
    <div class="top-fixed">
      <div class="topbar">
        <div class="flow-title">
          {{ title }} - {{ flow_name }}
          <span style="color: #969696; font-size: 14px;">({{ global_no }})</span>
        </div>
        <el-button id="back" plain size="small" @click="back">
          返回
        </el-button>
      </div>
      <div class="btn-list">
        <el-button
          :id="'btn_' + index"
          v-for="(item, index) in ticket_buttons"
          :key="index"
          :loading="item.loading"
          type="primary"
          plain
          size="medium"
          @click="handleButton(item)"
        >
          {{ item.name }}
        </el-button>
      </div>
    </div>
    <div class="container-box">
      <div class="top-msg">
        <div class="h1-title">
          {{ title }}
        </div>
        <div v-if="tasksInfo.length > 0" class="tips-msg">
          <div>
            <i class="iconfont icon-dangdi" />
            <span v-for="(item, index) in beforeNode" :key="index">{{ item }}</span>
            <el-dropdown v-if="nodeItems.length > 0" style="margin-right: 0">
              <span style="cursor: pointer;">
                <i class="el-icon-arrow-down el-icon--right" />
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="(item, index) in nodeItems" :key="index">
                  {{ item }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <div>
            <i class="iconfont icon-geren" />
            <span v-for="(item, index) in beforeOwners" :key="index">{{ item }}</span>
            <el-dropdown v-if="nodeOwners.length > 0" style="margin-right: 0">
              <span style="cursor: pointer;">
                <i class="el-icon-arrow-down el-icon--right" />
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="(item, index) in nodeOwners" :key="index">
                  {{ item }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <div>
            <i class="iconfont icon-shijian" />
            {{ last_time | formatData }}
          </div>
        </div>
      </div>
      <form-base-data
        ref="formBaseData"
        :form-items="formItems"
        :module_forms="module_forms"
        :url_forms="url_forms"
        :edit="isView ? false : true"
        :ttype="isView ? 'tile' : 'tabs'"
        @getFormData="getFormData"
        @hideLoading="hideLoading"
      />
      <!-- 处理记录 -->
      <div v-if="tasksRecord.length > 0" class="ticket-deal-record">
        <tasks-record :tasks-record="tasksRecord" :module-init="moduleInit" />
      </div>
    </div>
    <el-dialog
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      :title="dialogTitle"
      :close-on-click-modal="false"
      :width="dialogWidth"
      append-to-body
      destroy-on-close
    >
      <flow-img v-if="isFlowImg" :def_setting="def_setting" :completed-nodes="tasksRecord" :active-nodes="tasksInfo" :process-info="processInfo" :module-init="moduleInit" />
      <div v-else>
        <div v-if="button_all_form.length > 1">
          <el-tabs v-model="activeName" type="card">
            <el-tab-pane v-for="(item, index) in button_obj" :key="index" :name="'btn_'+index">
              <span slot="label">{{ item.name }}</span>
              <div>
                <fm-generate-form v-if="item.fmShow" ref="generateForm" :id="item.owner" :key="index" :data="item.jsonData" :value="item.editData" :remote="remoteFuncs" :module-init="moduleInit" :show-btn="false" />
              </div>
            </el-tab-pane>
            <el-tab-pane v-for="item in button_module_form" :key="item.name" :name="item.name">
              <span slot="label">{{ item.label }}</span>
              <component
                :ref="item.name"
                :is="item.name"
                :module-init="moduleInit"
                :active_option="active_option"
                keep-alive
                @get_valid="get_valid"
                @get_data="get_module_data"
                @close="closeDialog"
              />
            </el-tab-pane>
            <el-tab-pane v-if="button_url_form" label="URL表单" name="url">
              <div>
                <iframe :src="button_url_form" width="100%" height="500" frameborder="0" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div v-else>
          <template v-for="(item, index) in button_obj">
            <fm-generate-form v-if="item.fmShow" ref="generateForm" :id="item.owner" :key="index" :data="item.jsonData" :value="item.editData" :remote="remoteFuncs" :module-init="moduleInit" :show-btn="false" />
          </template>
          <template v-if="button_module_form.length > 0">
            <component
              v-for="item in button_module_form"
              :ref="item.name"
              :is="item.name"
              :key="item.name"
              :module-init="moduleInit"
              :active_option="active_option"
              :back_to_node="backToNode"
              keep-alive
              @get_valid="get_valid"
              @get_data="get_module_data"
              @close="closeDialog"
            />
          </template>
          <template v-if="button_url_form">
            <iframe :src="button_url_form" width="100%" height="500" frameborder="0" />
          </template>
        </div>
        <div style="text-align: right;">
          <el-button id="confirm" :loading="loadingAction" type="primary" size="medium" @click="btnSubmit">
            确定
          </el-button>
          <el-button id="cancel" plain size="medium" @click="dialogVisible = false">
            取消
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import formBaseData from './components/formBaseData'
import flowImg from './components/flowImg'
import tasksRecord from './components/tasksRecord'
import moduleForm from '@/components/moduleForm/index'

export default {
  components: {
    formBaseData,
    flowImg,
    tasksRecord
  },
  props: {
    isView: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const that = this
    return {
      loading: false,
      loadingAction: false,
      formItems: [],
      module_forms: [],
      url_forms: null,
      ticketInfo: {},
      ticket_id: null,
      task_id: null,
      flow_name: null,
      title: null,
      tasksRecord: [],
      comment: {
        content: null
      },
      // defaultImg: require('@/assets/images/user_default.png'),
      commentItems: [],
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
      tasksInfo: [],
      nodeItems: [],
      nodeOwners: [],
      last_time: '',
      dialogVisible: false,
      dialogTitle: '',
      isFlowImg: false,
      dialogWidth: '50%',
      def_setting: '',
      completedNodes: [], // 已完成的节点
      ticket_buttons: [],
      button_obj: [],
      button_module_form: [],
      button_url_form: null,
      button_all_form: [],
      belong: '',
      action: '',
      owner_id: null,
      isValidate: [],
      button_forms: {},
      processInfo: {
        title: '',
        initiator_name: '',
        status: '',
        forms: []
      },
      active_id: null,
      back_node: null,
      active_option: [],
      late_id: null,
      moduleInit: {
        ticket_id: null,
        task_id: null,
        ticket_data: null,
        forms: null,
        deal_or_view: null
      },
      moduleValid: false,
      moduleData: null,
      moduleSubmit: false,
      backToNode: [],
      global_no: null
    }
  },
  computed: {
    beforeNode() {
      const { nodeItems } = this
      return nodeItems.splice(0, 4)
    },
    beforeOwners() {
      const { nodeOwners } = this
      return nodeOwners.splice(0, 4)
    },
    activeName: {
      get() {
        if (this.button_obj.length > 0) {
          return 'btn_0'
        } else if (this.button_module_form.length > 0) {
          return this.button_module_form[0].name
        } else {
          return 'url'
        }
      },
      set() {}
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    getQuery() {
      this.ticket_id = this.$route.query.ticket_id ? this.$route.query.ticket_id : null
      this.task_id = this.$route.query.task_id ? this.$route.query.task_id : null
    },
    fetchData() {
      this.getQuery()
      let apis = ''
      if (this.isView) {
        apis = this.$Apis.ticket.plan_ticket_view
        this.moduleInit.deal_or_view = false
      } else {
        apis = this.$Apis.ticket.plan_ticket_deal
        this.moduleInit.deal_or_view = true
      }
      apis(this.ticket_id, this.task_id).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.ticketInfo = response.payload
          this.flow_name = this.ticketInfo.ticket_info.flow_name
          this.title = this.ticketInfo.ticket_info.title
          this.last_time = this.ticketInfo.ticket_info.last_time
          this.def_setting = this.ticketInfo.ticket_info.def_setting
          this.active_option = this.ticketInfo.recall_active
          this.late_id = this.ticketInfo.ticket_info.late_id
          this.global_no = this.ticketInfo.ticket_info.global_no
          this.tasksInfo = this.ticketInfo.tasks.filter(item => {
            return item.status === 'active'
          })
          this.tasksInfo.forEach(item => {
            this.nodeItems.push(item.node_name)
            this.nodeOwners = [...this.nodeOwners, ...item.owners_name]
          })
          this.nodeItems = Array.from(new Set(this.nodeItems))
          this.nodeOwners = Array.from(new Set(this.nodeOwners))
          this.tasksRecord = this.ticketInfo.records.sort(function(a, b) {
            if (a.exec_time && b.exec_time) {
              return a.exec_time < b.exec_time ? 1 : -1
            }
          })

          const ticket_btn = []
          const task_btn = []
          if (this.isView) {
            // 查看页面
            this.getForms(this.ticketInfo.display, this.formItems)
          } else {
            // 编辑页面
            const meta_form = this.ticketInfo.deal_task.meta_form
            if (meta_form.edit_form) {
              this.getForms(this.ticketInfo.deal_task.meta_form.edit_form, this.formItems)
            }
            if (this.ticketInfo.deal_task.module_forms) {
              this.getModuleForms(this.ticketInfo.deal_task.module_forms, this.module_forms)
            }
            if (this.ticketInfo.deal_task.url_forms.length > 0) {
              this.url_forms = this.ticketInfo.deal_task.url_forms[0].url
            }
            this.ticketInfo.deal_task.buttons.forEach(item => {
              this.$set(item, 'loading', false)
              task_btn.push(item)
            })
          }
          // 处理记录
          this.tasksRecord.forEach(element => {
            this.$set(element, 'display_forms', [])
            this.$set(element, 'module_forms', [])
            this.$set(element, 'url_forms', null)
            this.$set(element, 'comment_list', [])
            if (Object.keys(element.object).length > 0) {
              if (element.object.displays) {
                element.object.displays.forEach(item => {
                  if (item.form.indexOf('-default') === -1) {
                    this.$Apis.object.method_info(item.form).then(response => {
                      if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
                        element.display_forms.push({
                          name: response.payload.operate_name,
                          jsonData: JSON.parse(response.payload.design_form),
                          editData: element.forms[item.owner],
                          fmShow: true
                        })
                      }
                    })
                  } else {
                    // 获取默认的表单
                    const items = this.ticketInfo.object.filter(val => {
                      return val.project_code === item.project_code && val.object_code === item.owner
                    })
                    items.forEach(val => {
                      this.$Apis.object.get_object_design_by_id(val.object_id).then(response => {
                        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
                          element.display_forms.push({
                            name: val.name,
                            jsonData: JSON.parse(response.payload),
                            editData: element.forms[item.owner],
                            fmShow: true
                          })
                        }
                      })
                    })
                  }
                })
              }
              if (element.object.module_forms) {
                element.object.module_forms.forEach(item => {
                  moduleForm.forEach(ii => {
                    if (ii.name === item.name) {
                      if (ii.show === undefined) {
                        ii.show = true
                      }
                      element.module_forms.push({
                        name: item.name,
                        label: ii.label,
                        editData: element.forms[item.name.toLowerCase()] || element.forms[item.name],
                        show: ii.show
                      })
                    }
                  })
                  // element.module_forms.push({
                  //   name: item.name,
                  //   editData: element.forms[item.name.toLowerCase()]
                  // })
                })
              }
              if (element.object.url_forms && element.object.url_forms.length > 0) {
                element.url_forms = element.object.url_forms[0].url
              }
            }
          })

          // 按钮
          this.ticketInfo.ticket_info.buttons.forEach(item => {
            this.$set(item, 'loading', false)
            ticket_btn.push(item)
          })
          this.ticket_buttons = [...ticket_btn, ...task_btn]
          // 流程信息
          this.processInfo.title = this.ticketInfo.ticket_info.title
          this.processInfo.initiator_name = this.ticketInfo.ticket_info.initiator_name
          if (this.ticketInfo.ticket_info.status === 'active') {
            this.processInfo.status = '活跃'
          }
          this.getForms(this.ticketInfo.display, this.processInfo.forms)
          // moduleInit
          this.moduleInit.ticket_id = this.ticket_id
          this.moduleInit.task_id = this.task_id
          this.moduleInit.ticket_data = response.payload
          this.moduleInit.forms = this.ticketInfo.forms
          this.$store.commit('SET_MODULE_INIT', this.moduleInit)
          // back_to_node
          this.backToNode = this.ticketInfo.back_to_node
        }
      })
    },
    getForms(Elements, formItems) {
      Elements.forEach(item => {
        if (item.form.indexOf('-default') === -1) {
          const methodsFrom = this.ticketInfo.object.filter(val => {
            return val.project_code === item.project_code && val.object_code === item.owner
          })
          methodsFrom.forEach(val => {
            this.$Apis.object.method_info(item.form).then(response => {
              if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
                formItems.push({
                  owner: item.owner,
                  name: response.payload.operate_name,
                  jsonData: JSON.parse(response.payload.design_form),
                  editData: this.ticketInfo.forms[item.owner]
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
                formItems.push({
                  owner: item.owner,
                  name: val.name,
                  jsonData: JSON.parse(response.payload),
                  editData: this.ticketInfo.forms[item.owner]
                })
              }
            })
          })
        }
      })
    },
    getModuleForms(Elements, formItems) {
      Elements.forEach(item => {
        moduleForm.forEach(ii => {
          if (ii.name === item.name) {
            formItems.push({
              name: item.name,
              label: ii.label
            })
          }
        })
      })
    },
    back() {
      this.$router.go(-1)
      if (window.history.length <= 1) {
        this.$router.push({path: '/'})
      }
    },
    submit() {
      // 调用子组件 getdata() 方法
      this.$refs.formBaseData.getData()
    },
    hideLoading() {
      this.ticket_buttons.forEach(item => {
        item.loading = false
      })
    },
    getFormData(params) {
      const forms = params
      this.$Apis.ticket.ticket_deal(this.ticket_id, this.task_id, forms, this.late_id).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.$alert('提交成功！', '提示', {
            confirmButtonText: '确定',
            callback: action => {
              this.ticket_buttons.forEach(item => {
                if (item.loading) {
                  item.loading = false
                }
              })
              this.back()
            }
          })
        } else {
          this.$alert(response.message, '提示', {
            confirmButtonText: '确定',
            callback: action => {
              this.hideLoading()
            }
          })
        }
      })
    },
    viewFlowimg() {
      this.dialogVisible = !this.dialogVisible
      this.dialogTitle = '流程图'
      this.dialogWidth = '95%'
      this.isFlowImg = true
    },
    btnEvents(item) {
      this.dialogVisible = !this.dialogVisible
      this.dialogTitle = item.name
      this.dialogWidth = '50%'
      this.isFlowImg = false
      if (item) {
        this.button_all_form = []
        this.button_obj = []
        this.button_module_form = []
        this.button_url_form = null
        if (item.object.edit_form && item.object.edit_form.length > 0) {
          this.getEditForm(item.object.edit_form)
          this.button_all_form.push('method')
        }
        if (item.module_forms.length > 0) {
          this.getModuleForms(item.module_forms, this.button_module_form)
          this.button_all_form.push('module')
        }
        if (item.url_forms.length > 0) {
          this.button_url_form = item.url_forms[0].name
          this.button_all_form.push('url')
        }
      }
    },
    recall(item) {
      this.btnEvents(item)
    },
    back_to_node(item) {
      this.btnEvents(item)
    },
    turn(item) {
      this.btnEvents(item)
    },
    process_view(item, payload) {
      let routeData = this.$router.resolve({
        name: "ticket_view",
        query: { ticket_id: payload.ticket_info.parent_id }
      })
      window.open(routeData.href, '_blank')
    },
    getEditForm(edit_form) {
      this.button_obj = []
      edit_form.forEach(element => {
        this.$Apis.object.method_info(element.form).then(response => {
          if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
            this.button_obj.push({
              name: response.payload.operate_name,
              owner: element.owner,
              jsonData: JSON.parse(response.payload.design_form),
              editData: {},
              fmShow: true
            })
          }
        })
      })
    },
    execuFn(item) {
      if (!item.js_code) return true
      const script = new Function('that', 'action', 'payload', item.js_code)
      const result = script(this, item, this.ticketInfo)
      if (result === false) {
        return false
      } else {
        return true
      }
    },
    handleButton(item) {
      this.belong = item.belong
      this.action = item.action
      this.owner_id = item.owner_id
      item.loading = true
      this.moduleInit.deal_or_view = true
      if (this.execuFn(item, this.ticketInfo)) {
        this.hideLoading()
        // return
        this.$confirm('是否执行' + item.name + '操作', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          this.button_all_form = []
          if ((item.object.edit_form && item.object.edit_form.length > 0) || item.module_forms.length > 0 || item.url_forms.length > 0) {
            if (item.object.edit_form && item.object.edit_form.length > 0) {
              this.getEditForm(item.object.edit_form)
              this.button_all_form.push('method')
            }
            if (item.module_forms.length > 0) {
              this.button_module_form = []
              this.getModuleForms(item.module_forms, this.button_module_form)
              this.button_all_form.push('module')
            }
            if (item.url_forms.length > 0) {
              this.button_url_form = item.url_forms[0].name
              this.button_all_form.push('url')
            }
            this.dialogVisible = !this.dialogVisible
            this.dialogTitle = item.name
            this.dialogWidth = '50%'
            this.isFlowImg = false
          } else {
            this.btnSubmit()
          }
        }).catch(() => {})
      } else {
        this.hideLoading()
      }
    },
    btnSubmit() {
      this.isValidate = []
      const generateForm = this.$refs.generateForm
      if (this.button_module_form.length > 0) {
        this.button_module_form.forEach(item => {
          this.$refs[item.name][0].valid()
          if (this.moduleValid) {
            if (this.$refs[item.name][0].submit) {
              this.moduleSubmit = true
              this.$refs[item.name][0].submit(this.action, this.owner_id)
              return false
            }
            this.$refs[item.name][0].get_data()
            this.$set(this.button_forms, item.name, this.moduleData)
          }
        })
      }

      if (generateForm) {
        generateForm.forEach(item => {
          item.getData().then(data => {
            this.isValidate.push(true)
            this.$set(this.button_forms, item.$el.id, data)
          }).catch(e => {
            // 数据校验失败
            this.isValidate.push(false)
          })
        })
      }
      if (!generateForm && this.button_module_form.length < 1) {
        this.button_forms = {}
      }
      setTimeout(() => {
        if (this.isValidate.indexOf(false) === -1 && !this.moduleSubmit) {
          // 提交数据
          this.loadingAction = true
          const data = {
            ticket_id: this.ticket_id,
            action: this.action,
            owner_id: this.owner_id,
            task_id: this.task_id,
            forms: this.button_forms,
            late_id: this.late_id
          }
          this.$Apis.ticket.action_do(data).then(response => {
            if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
              this.$alert('提交成功！', '提示', {
                confirmButtonText: '确定',
                callback: action => {
                  this.loadingAction = false
                  this.dialogVisible = false
                  this.$router.replace('/ticket/participate')
                }
              })
            } else {
              this.$alert(response.message, '提示', {
                confirmButtonText: '确定',
                callback: action => {
                  this.loadingAction = false
                }
              })
            }
          })
        }
      }, 300)
    },
    get_valid(events) {
      this.moduleValid = events
      this.isValidate.push(events)
    },
    get_module_data(data) {
      this.moduleData = data
    },
    closeDialog() {
      this.dialogVisible = false
    }
  }
}
</script>
