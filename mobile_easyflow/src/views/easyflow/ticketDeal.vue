<template>
  <div class="design-containers flow-start">
    <van-sticky :offset-top="46">
      <div class="btn-list">
        <div
          :id="'btn_' + index"
          v-for="(item, index) in ticket_buttons"
          :key="index"
          class="button"
          @click="handleButton(item)"
        >
          {{ item.name }}
        </div>
      </div>
    </van-sticky>
    <div class="container-box">
      <div class="top-msg">
        <div class="h1-title">
          {{ title }}
        </div>
        <div v-if="tasksInfo.length > 0" class="tips-msg">
          <div class="item">
            <i class="iconfont icon-dangdi" />
            <div @click="moreNode">
              <span v-for="(item, index) in nodeItems.slice(0, 3)" :key="index">
                {{ item }}
              </span>
              <div v-if="nodeItems.length > 3" class="more">
                <i class="el-icon-d-arrow-right" style="font-size: 14px;" />
              </div>
            </div>
          </div>
          <div class="item">
            <i class="iconfont icon-geren" />
            <div @click="moreNodeOwners">
              <span v-for="(item, index) in nodeOwners.slice(0, 5)" :key="index">
                {{ item }}
              </span>
              <div v-if="nodeOwners.length > 5" class="more">
                <i class="el-icon-d-arrow-right" style="font-size: 14px;" />
              </div>
            </div>
          </div>
          <div class="item">
            <i class="iconfont icon-shijian" />
            <div>
              {{ last_time | formatData }}
            </div>
          </div>
        </div>
      </div>
      <form-base-data
        ref="formBaseData"
        :form-items="formItems"
        :module_forms="module_forms"
        :url_forms="url_forms"
        :edit="isView ? false : true"
        @getFormData="getFormData"
      />
      <!-- 处理记录 -->
      <div v-if="tasksRecord.length > 0" class="ticket-deal-record">
        <div class="title">
          处理记录
        </div>
        <tasks-record :tasks-record="tasksRecord" :module-init="moduleInit" />
      </div>
    </div>
    <van-popup v-model="popupShow" :overlay="false" position="right" :style="{ height: '100%', width: '100%' }">
      <van-sticky>
        <van-nav-bar
          :title="dialogTitle"
          left-arrow
          @click-left="popupShow = false"
        />
      </van-sticky>
      <flow-img v-if="isFlowImg" :def_setting="def_setting" :completed-nodes="tasksRecord" :active-nodes="tasksInfo" />
      <div v-else>
        <div v-if="button_all_form.length > 1">
          <el-tabs v-model="activeName" type="card">
            <el-tab-pane v-for="(item, index) in button_obj" :key="index" :name="'btn_'+index">
              <span slot="label">{{ item.name }}</span>
              <div>
                <generate-form-mobile v-if="item.fmShow" ref="generateForm" :id="item.owner" :key="index" :data="item.jsonData" :value="item.editData" :remote="remoteFuncs" :module-init="moduleInit" />
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
            <generate-form-mobile v-if="item.fmShow" ref="generateForm" :id="item.owner" :key="index" :data="item.jsonData" :value="item.editData" :remote="remoteFuncs" :module-init="moduleInit" />
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
              @get_data="get_module_data"
              @close="closeDialog"
              @close_overlay="closeOverlay"
            />
          </template>
          <template v-if="button_url_form">
            <iframe :src="button_url_form" width="100%" height="500" frameborder="0" />
          </template>
        </div>
        <div style="padding: 20px 16px 0; width: 100%">
          <van-button id="confirm" :disabled="disabled" round type="info" style="width: 100%" @click="btnSubmit">
            提交
          </van-button>
        </div>
      </div>
    </van-popup>
    <van-overlay :show="showALL" @click="showALL = false">
      <div class="overlay-wrapper" @click="showALL = false">
        <div v-if="showOwners" class="block">
          <span v-for="(item, index) in nodeOwners" :key="index">{{ item }}</span>
        </div>
        <div v-else class="block">
          <span v-for="(item, index) in nodeItems" :key="index">{{ item }}</span>
        </div>
      </div>
    </van-overlay>
    <overlay-loading :show="showOverlay" :text="loadingText" />
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
      popupShow: false,
      showALL: false,
      showOwners: false,
      showOverlay: false,
      loadingText: null,
      disabled: false

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
                  // const _name = item.name.split('_')
                  // for (var i = 0; i < _name.length; i++) {
                  //   _name[i] = _name[i][0].toUpperCase() + _name[i].slice(1)
                  // }
                  // item.name = _name.join('')
                  // console.log('$$%%', item.name)
                  moduleForm.forEach(ii => {
                    if (ii.name === item.name) {
                      if (ii.show === undefined) {
                        ii.show = true
                      }
                      element.module_forms.push({
                        name: item.name,
                        label: ii.label,
                        editData: element.forms[item.name.toLowerCase()],
                        show: ii.show
                      })
                    }
                  })
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
    },
    submit() {
      // 调用子组件 getdata() 方法
      this.$refs.formBaseData.getData()
    },
    getFormData(params) {
      const forms = params
      this.showOverlay = true
      this.loadingText = '处理中...'
      this.$Apis.ticket.ticket_deal(this.ticket_id, this.task_id, forms, this.late_id).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.showOverlay = false
          this.loadingText = null
          this.$toast({
            message: '提交成功！',
            forbidClick: true,
            onClose: () => {
              this.back()
            }
          })
        } else {
          this.showOverlay = false
          this.loadingText = null
          this.$dialog.alert({
            message: response.message
          })
        }
      })
    },
    viewFlowimg() {
      this.dialogTitle = '流程图'
      this.popupShow = !this.popupShow
      this.isFlowImg = true
    },
    btnEvents(item) {
      this.dialogTitle = item.name
      this.popupShow = !this.popupShow
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
      const script = new Function('that', 'action', item.js_code)
      const result = script(this, item)
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
      this.moduleInit.deal_or_view = true
      if (this.execuFn(item)) {
        // return
        this.$dialog.confirm({
          message: '是否执行' + item.name + '操作'
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
            this.dialogTitle = item.name
            this.popupShow = !this.popupShow
            this.isFlowImg = false
          } else {
            this.btnSubmit()
          }
        }).catch(() => {})
      }
    },
    btnSubmit() {
      this.isValidate = []
      const generateForm = this.$refs.generateForm
      if (this.button_module_form.length > 0) {
        this.button_module_form.forEach(item => {
          this.$refs[item.name][0].valid().then((data) => {
            this.isValidate.push(data)
            if (data) {
              if (this.$refs[item.name][0].submit) {
                this.moduleSubmit = true
                this.showOverlay = true
                this.loadingText = '处理中...'
                this.disabled = true
                this.$refs[item.name][0].submit(this.action, this.owner_id)
                return false
              }
              this.$refs[item.name][0].get_data()
              this.$set(this.button_forms, item.name, this.moduleData)
            }
          })
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
          this.showOverlay = true
          this.loadingText = '处理中...'
          this.disabled = true
          // 提交数据
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
              this.closeOverlay()
              this.$toast({
                message: '提交成功！',
                forbidClick: true,
                onClose: () => {
                  this.closeDialog()
                  this.$router.push({ name: 'ticket-participate' })
                }
              })
            } else {
              this.closeOverlay()
              this.$dialog.alert({
                message: response.message
              })
            }
          })
        }
      }, 300)
    },
    // get_valid(events) {
    //   this.moduleValid = events
    //   this.isValidate.push(events)
    // },
    get_module_data(data) {
      this.moduleData = data
    },
    closeDialog() {
      this.popupShow = false
    },
    closeOverlay() {
      this.showOverlay = false
      this.loadingText = null
      this.disabled = false
    },
    moreNodeOwners() {
      if (this.nodeOwners.length < 6) {
        return
      }
      this.showALL = true
      this.showOwners = true
    },
    moreNode() {
      if (this.nodeOwners.length < 4) {
        return
      }
      this.showALL = true
      this.showOwners = false
    }
  }
}
</script>
<style lang="scss" scoped>
.design-containers {
  // margin-top: -20px;
  // background: #fafafa;
  .btn-list {
    // margin-bottom: 20px;
    padding: 14px 16px;
    // display: flex;
    // flex-wrap: wrap;
    display: -webkit-box;
    overflow-x: scroll;
    -webkit-overflow-scrolling:touch;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,.06);
    .button {
      padding: 6px 12px;
      color: #409EFF;
      background: #ecf5ff;
      border: 1px solid #b3d8ff;
      border-radius: 4px;
      & + .button {
        margin-left: 12px;
      }
    }
  }
  .container-box {
    padding-top: 20px;
  }
  .top-msg {
    padding: 0 16px;
    .h1-title {
      margin-bottom: 10px;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      line-height: 28px;
    }
    .tips-msg {
      margin-bottom: 20px;
      color: #8A8A8A;
      .item {
        margin-bottom: 2px;
        display: flex;
        line-height: 20px;
        div {
          margin-left: 8px;
          display: flex;
          /* flex: 1; */
          flex-wrap: wrap;
          align-items: center;
          font-size: 13px;
          i {
            font-size: 18px;
          }
          span + span {
            margin-left: 8px;
          }
          span:empty {
            margin: 0;
          }
          .more {
            margin-left: 0;
          }
        }
      }
    }
  }
  .ticket-deal-record {
    margin-top: 30px;
    padding: 20px 16px;
    border-top: 8px solid #eaeaea;
    .title {
      font-size: 15px;
      font-weight: bold;
      color: #333;
    }
  }
}
.overlay-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  .block {
    max-width: 70%;
    max-height: 60%;
    padding: 15px;
    background: #fff;
    line-height: 24px;
    overflow-y: auto;
    span {
      margin: 0 8px;
      white-space: nowrap;
    }
  }
}
</style>
