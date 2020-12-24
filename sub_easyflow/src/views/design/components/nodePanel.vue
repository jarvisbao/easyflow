<template>
  <div class="config-node">
    <el-form ref="form" :model="form" label-width="100px" style="width: 100%;">
      <el-collapse v-model="activeNames">
        <el-collapse-item name="baseinfo">
          <template slot="title">
            节点
          </template>
          <div>
            <el-form-item :rules="{required: true, message: '节点id不能为空', trigger: 'blur'}" label="ID" prop="id">
              <el-input v-model="form.id" @change="changeId" />
            </el-form-item>
            <el-form-item :rules="{required: true, message: '节点名称不能为空', trigger: 'blur'}" label="名称" prop="name">
              <el-input id="node-name" v-model="form.name" @input="changeName" />
            </el-form-item>
            <el-form-item label="描述">
              <el-input id="node-desc" v-model="form.description" :autosize="{ minRows: 2, maxRows: 5 }" type="textarea" @change="updateProperties({description: form.description})" />
            </el-form-item>
          </div>
        </el-collapse-item>
        <template v-if="nodeType !== 'bpmn:ExclusiveGateway'">
          <template v-if="nodeType === 'bpmn:UserTask'">
            <el-collapse-item name="auth">
              <template slot="title">
                节点人员 (必选)
              </template>
              <node-person :modeler="modeler" :bpmn-elements="element" />
            </el-collapse-item>
            <el-collapse-item name="buttons">
              <template slot="title">
                节点按钮
              </template>
              <flow-buttons :modeler="modeler" :bpmn-elements="element" :buttons="node_buttons" :is-node="true" :title="dialogTitle" />
            </el-collapse-item>
          </template>
          <!-- 任务节点添加展示表单 UserTask 添加编辑表单 -->
          <template v-if="nodeType.indexOf('Task') !== -1 && nodeType !== 'bpmn:ScriptTask'">
            <el-collapse-item name="form">
              <template slot="title">
                节点表单
              </template>
              <flow-form :modeler="modeler" :bpmn-elements="element" :display-form="display_form" :label="form_label" />
              <edit-form v-if="nodeType === 'bpmn:UserTask'" :modeler="modeler" :bpmn-elements="element" :edit-form="edit_form" />
              <url-module-form :modeler="modeler" :bpmn-elements="element" :url-module-form="url_module_node" />
            </el-collapse-item>
          </template>
          <!-- 空开始节点编辑表单 -->
          <template v-if="nodeType === 'EmptyStartEvent'">
            <el-collapse-item name="auth">
              <template slot="title">
                节点人员 (必选)
              </template>
              <empty-start-person :modeler="modeler" :bpmn-elements="element" />
            </el-collapse-item>
            <el-collapse-item name="form">
              <template slot="title">
                节点表单
              </template>
              <flow-form :modeler="modeler" :bpmn-elements="element" :display-form="display_form" :label="form_label" :is-empty-start="true" />
              <edit-form :modeler="modeler" :bpmn-elements="element" :edit-form="edit_form" :is-empty-start="true" />
              <url-module-form :modeler="modeler" :bpmn-elements="element" :url-module-form="url_module_node" :is-empty-start="true" />
            </el-collapse-item>
          </template>
          <!-- 时间事件 -->
          <template v-if="nodeType === 'timerEvent'">
            <el-collapse-item name="timer">
              <template slot="title">
                定时设置
              </template>
              <div>
                <timer-setting :modeler="modeler" :bpmn-elements="element" :is-intermediate-catch-event="isIntermediateCatchEvent" />
              </div>
            </el-collapse-item>
          </template>
          <!-- 消息事件 -->
          <template v-if="nodeType === 'messageEvent'">
            <el-collapse-item name="message">
              <template slot="title">
                节点消息配置
              </template>
              <div>
                <el-form-item required :show-message="false" label="消息源">
                  <el-input v-model="message.ref" @change="handleMessage" />
                </el-form-item>
                <el-form-item v-if="isThrowEvent" required :show-message="false" label="生产者">
                  <div style="display: flex">
                    <el-input v-model="message.cls" placeholder="请填写服务" @change="handlePayload" />
                    <el-input v-model="message.fun" placeholder="请填写服务对应的方法" style="margin-left: 12px;" @change="handlePayload" />
                  </div>
                </el-form-item>
                <el-form-item v-else required :show-message="false" label="消费者">
                  <div style="display: flex">
                    <el-input v-model="message.cls" placeholder="请填写服务" @change="handlePayload" />
                    <el-input v-model="message.fun" placeholder="请填写服务对应的方法" style="margin-left: 12px;" @change="handlePayload" />
                  </div>
                </el-form-item>
              </div>
            </el-collapse-item>
          </template>
          <!-- 信号事件 -->
          <template v-if="nodeType === 'signalEvent'">
            <el-collapse-item name="signal">
              <template slot="title">
                节点信号配置
              </template>
              <div>
                <el-form-item required :show-message="false" label="信号引用">
                  <el-input v-model="signal.ref" @change="handleSignal" />
                </el-form-item>
                <el-form-item label="信号路由">
                  <el-input v-model="signal.route" @change="handleRoute" />
                </el-form-item>
                <el-form-item v-if="isThrowEvent" required :show-message="false" label="生产者">
                  <div style="display: flex">
                    <el-input v-model="signal.cls" placeholder="请填写服务" @change="handlePayload" />
                    <el-input v-model="signal.fun" placeholder="请填写服务对应的方法" style="margin-left: 12px;" @change="handlePayload" />
                  </div>
                </el-form-item>
                <el-form-item v-else required :show-message="false" label="消费者">
                  <div style="display: flex">
                    <el-input v-model="signal.cls" placeholder="请填写服务" @change="handlePayload" />
                    <el-input v-model="signal.fun" placeholder="请填写服务对应的方法" style="margin-left: 12px;" @change="handlePayload" />
                  </div>
                </el-form-item>
              </div>
            </el-collapse-item>
          </template>

          <!-- 多实例 -->
          <template v-if="isMultiInstance">
            <el-collapse-item name="multiInstance">
              <template slot="title">
                多实例配置
              </template>
              <multi-instance :modeler="modeler" :bpmn-elements="element" :node-type="nodeType" :multi-instance-type="multiInstanceType" />
            </el-collapse-item>
            <el-collapse-item v-if="multiInstanceType === 'parallel'" name="multiCountersign">
              <template slot="title">
                多实例会签
              </template>
              <multi-countersign :modeler="modeler" :bpmn-elements="element" />
            </el-collapse-item>
          </template>

          <!-- 调用子流程 -->
          <template v-if="nodeType === 'bpmn:CallActivity'">
            <el-collapse-item name="callActivity">
              <template slot="title">
                子流程设置
              </template>
              <call-activity :modeler="modeler" :bpmn-elements="element" :called-activity="calledActivity" />
            </el-collapse-item>
          </template>
          <!-- 脚本任务 -->
          <el-collapse-item v-if="nodeType === 'bpmn:ScriptTask'" name="script">
            <template slot="title">
                脚本配置
              </template>
            <el-form-item label="服务">
              <el-input v-model="script.cls" @change="handleScript" />
            </el-form-item>
            <el-form-item label="方法">
              <el-input v-model="script.fun" @change="handleScript" />
            </el-form-item>
          </el-collapse-item>

          <el-collapse-item name="variate">
            <template slot="title">
              变量设置
            </template>
            <div>
              <fieldset class="code-fieldset">
                <legend>
                  <span>编辑变量 <i id="set-rule" class="el-icon-edit edit_code" @click="setVariable" /></span>
                </legend>
                <div v-if="jsonVariable" class="code-box">
                  {{ jsonVariable }}
                </div>
              </fieldset>
            </div>
          </el-collapse-item>
        </template>
      </el-collapse>
    </el-form>
    <el-dialog v-if="dialogVariable" :visible.sync="dialogVariable" :close-on-click-modal="false" append-to-body title="变量设置" width="65%">
      <json-editor ref="jsonEditor" v-model="Variable" @get_val="get_json_var" />
      <span slot="footer" class="dialog-footer">
        <el-button id="cancel" @click="dialogVariable = false">取 消</el-button>
        <el-button id="confirm" type="primary" @click="confirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { setJsonVar } from '@/utils/setJsonVarXml'
import nodePerson from './node/person'
import flowButtons from './buttons'
import flowForm from './form'
import editForm from './form/editForm'
import urlModuleForm from './form/urlModuleForm'
import multiInstance from './node/multiInstance'
import multiCountersign from './node/multiCountersign'
import emptyStartPerson from './node/emptyStartPerson'
import timerSetting from './node/timerSetting'
import jsonEditor from '@/components/jsonEditor'
import { getExtension } from '@/utils'

export default {
  components: {
    nodePerson,
    flowButtons,
    flowForm,
    editForm,
    urlModuleForm,
    multiInstance,
    emptyStartPerson,
    multiCountersign,
    timerSetting,
    jsonEditor,
    callActivity: () => import('./node/callActivity')
  },
  props: {
    modeler: {
      type: Object,
      default: () => {}
    },
    element: {
      type: Object,
      default: () => {}
    },
    form: {
      type: Object,
      default: () => {}
    },
    nodeType: {
      type: String,
      default: ''
    },
    isMultiInstance: {
      type: Boolean,
      default: false
    },
    multiInstanceType: {
      type: String,
      default: ''
    },
    jsonVar: {
      type: String,
      default: null
    },
    isIntermediateCatchEvent: {
      type: Boolean,
      default: false
    },
    isThrowEvent: {
      type: Boolean,
      default: false
    },
    messageInfo: {
      type: Object,
      default: () => {}
    },
    signalInfo: {
      type: Object,
      default: () => {}
    },
    calledActivity: {
      type: Object,
      default: () => {}
    },
    scriptInfo: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      activeNames: ['baseinfo', 'auth', 'buttons', 'form', 'multiInstance', 'multiCountersign', 'variate', 'timer', 'message', 'signal', 'callActivity', 'script'],
      dialogTitle: '节点按钮设置',
      form_label: '展示表单',
      dialogVariable: false,
      Variable: {},
      jsonVariable: this.jsonVar,
      message: {
        ref: null,
        consumer: [],
        producer: [],
        cls: null,
        fun: null
      },
      signal: {
        ref: null,
        consumer: [],
        producer: [],
        cls: null,
        fun: null,
        route: null
      },
      script: this.scriptInfo
    }
  },
  computed: {
    ...mapGetters([
      'node_buttons',
      'display_form',
      'edit_form',
      'url_module_node'
    ])
  },
  watch: {
    nodeType: {
      handler(val) {
      }
    },
    jsonVar: {
      handler(val) {
        this.jsonVariable = val
      }
    },
    isIntermediateCatchEvent: {
      handler(val) {}
    },
    isThrowEvent: {
      handler(val) {}
    },
    messageInfo: {
      handler(val) {
        this.message = val
      }
    },
    signalInfo: {
      handler(val) {
        this.signal = val
      }
    },
    scriptInfo: {
      handler(val) {
        this.script = val
      }
    }
  },
  created() {
    this.message = this.messageInfo
    this.signal = this.signalInfo
  },
  methods: {
    changeId(id) {
      if (id) {
        this.updateProperties({ id: id })
        this.$store.commit('SET_IS_SAVE', false)
      } else {
        this.$store.commit('SET_IS_SAVE', true)
      }
    },
    changeName(name) {
      const modeling = this.modeler.get('modeling')
      modeling.updateLabel(this.element, name)
      if (name) {
        this.$store.commit('SET_IS_SAVE', false)
      } else {
        this.$store.commit('SET_IS_SAVE', true)
      }
    },
    // 在这里我们封装一个通用的更新节点属性的方法
    updateProperties(properties) {
      const modeling = this.modeler.get('modeling')
      modeling.updateProperties(this.element, properties)
    },
    get_json_var(event) {
      if (event && event !== '{}') {
        this.jsonVariable = event
      } else {
        this.jsonVariable = null
      }
    },
    setVariable() {
      this.dialogVariable = !this.dialogVariable
      if (this.jsonVariable) {
        this.Variable = JSON.parse(this.jsonVariable)
      } else {
        this.Variable = {}
      }
    },
    confirm() {
      this.dialogVariable = !this.dialogVariable
      setJsonVar(this.jsonVariable, this.modeler, this.element)
    },
    handleMessage(val) {
      const _messageRef = this.element.businessObject.eventDefinitions[0].messageRef
      if (val) {
        const messageRef = this.modeler.get('moddle').create('bpmn:Message', {id: val, name: val})
        if (_messageRef) {
          this.modeler._definitions.rootElements.forEach((item, index) => {
            if (item.$type === 'bpmn:Message' && item.id === _messageRef.id) {
              item.id = val
              item.name = val
            }
          })
        } else {
          this.modeler._definitions.rootElements.push(messageRef)
        }
        const message = this.modeler.get('moddle').create('bpmn:MessageEventDefinition',
          {
            messageRef: messageRef,
            producer: this.message.producer.length > 0 ? this.message.producer.join('.') : undefined,
            consumer: this.message.consumer.length > 0 ? this.message.consumer.join('.') : undefined
          }
        )
        this.modeler.get('modeling').updateProperties(this.element, {eventDefinitions: [message]})
      } else {
        this.modeler._definitions.rootElements.forEach((item, index) => {
          if (item.$type === 'bpmn:Message' && item.id === _messageRef.id) {
            this.modeler._definitions.rootElements.splice(index, 1)
          }
        })
        this.$nextTick(() => {
          delete this.element.businessObject.eventDefinitions[0].messageRef
        })
      }
    },
    handlePayload() {
      if (this.isThrowEvent) {
        if (this.nodeType === 'signalEvent') {
          if (this.signal.cls && this.signal.fun) {
            this.signal.producer = [this.signal.cls, this.signal.fun]
            this.element.businessObject.eventDefinitions[0].$attrs.producer = this.signal.producer.join('.')
          } else {
            this.signal.producer = []
            delete this.element.businessObject.eventDefinitions[0].$attrs.producer
          }
        } else {
          if (this.message.cls && this.message.fun) {
            this.message.producer = [this.message.cls, this.message.fun]
            this.element.businessObject.eventDefinitions[0].$attrs.producer = this.message.producer.join('.')
          } else {
            this.message.producer = []
            delete this.element.businessObject.eventDefinitions[0].$attrs.producer
          }
        }
        // this.element.businessObject.eventDefinitions[0].$attrs.producer = val.length > 0 ? val.join('.') : undefined
      } else {
        // this.element.businessObject.eventDefinitions[0].$attrs.consumer = val.length > 0 ? val.join('.') : undefined
        if (this.nodeType === 'signalEvent') {
          if (this.signal.cls && this.signal.fun) {
            this.signal.consumer = [this.signal.cls, this.signal.fun]
            this.element.businessObject.eventDefinitions[0].$attrs.consumer = this.signal.consumer.join('.')
          } else {
            this.signal.consumer = []
            delete this.element.businessObject.eventDefinitions[0].$attrs.consumer
          }
        } else {
          if (this.message.cls && this.message.fun) {
            this.message.consumer = [this.message.cls, this.message.fun]
            this.element.businessObject.eventDefinitions[0].$attrs.consumer = this.message.consumer.join('.')
          } else {
            this.message.consumer = []
            delete this.element.businessObject.eventDefinitions[0].$attrs.consumer
          }
        }
      }
    },
    handleSignal(val) {
      const _signalRef = this.element.businessObject.eventDefinitions[0].signalRef
      if (val) {
        const signalRef = this.modeler.get('moddle').create('bpmn:Signal', {id: val, name: val})
        if (_signalRef) {
          this.modeler._definitions.rootElements.forEach((item, index) => {
            if (item.$type === 'bpmn:Signal' && item.id === _signalRef.id) {
              item.id = val
              item.name = val
            }
          })
        } else {
          this.modeler._definitions.rootElements.push(signalRef)
        }
        const signal = this.modeler.get('moddle').create('bpmn:SignalEventDefinition',
          {
            signalRef: signalRef,
            producer: this.signal.producer.length > 0 ? this.signal.producer.join('.') : undefined,
            consumer: this.signal.consumer.length > 0 ? this.signal.consumer.join('.') : undefined,
            route: this.signal.route ? this.signal.route : undefined
          }
        )
        this.modeler.get('modeling').updateProperties(this.element, {eventDefinitions: [signal]})
      } else {
        this.modeler._definitions.rootElements.forEach((item, index) => {
          if (item.$type === 'bpmn:Signal' && item.id === _signalRef.id) {
            this.modeler._definitions.rootElements.splice(index, 1)
          }
        })
        this.$nextTick(() => {
          delete this.element.businessObject.eventDefinitions[0].signalRef
        })
      }
    },
    handleRoute(val) {
      if (val) {
        this.element.businessObject.eventDefinitions[0].$attrs.route = val
      } else {
        delete this.element.businessObject.eventDefinitions[0].$attrs.route
      }
    },
    handleScript(val) {
      const moddle = this.modeler.get('moddle')
      const businessObject = this.element.businessObject
      if (this.script.cls && this.script.fun) {
        let analysis = getExtension(businessObject, 'enfo:PythonApi')
        if (!analysis) {
          analysis = moddle.create('enfo:PythonApi', { cls: this.script.cls, fun: this.script.fun })
          businessObject.extensionElements = businessObject.extensionElements || moddle.create('bpmn:ExtensionElements')
          businessObject.extensionElements.get('values').push(analysis)
        } else {
          analysis.cls = this.script.cls
          analysis.fun = this.script.fun
        }
      } else {
        delete businessObject.extensionElements
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.config-node {
  & /deep/ .el-collapse-item__content {
    padding: 16px 8px;
  }
}
.node-assign {
  & /deep/ .el-input__inner{
    border: none;
  }
  & /deep/ .el-input__suffix {
    display: none;
  }
  & /deep/ .el-input.is-disabled .el-input__inner {
    background: transparent;
    cursor: text;
    padding: 0;
    line-height: 23px;
    height: auto;
    color: #606266;
  }
}
</style>
