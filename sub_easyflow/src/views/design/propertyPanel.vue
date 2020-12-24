<template>
  <div class="config-panel">
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <div class="scrollbar-box">
        <div v-if="element === undefined" id="canvas_detailpannel" class="pannel">
          <div class="pannel-title">
            画布
          </div>
          <canvas-panel :modeler="modeler" :root-elements="rootElements" :obj-items="objItems" :flow-default-btns="flowDefaultBtns" />
        </div>
        <div v-else-if="sequenceFlow">
          <div class="pannel-title">
            属性配置
          </div>
          <edge-panel :modeler="modeler" :element="element" :form="form" :is-conditional="isConditional" />
        </div>
        <div v-else>
          <div class="pannel-title">
            属性配置
          </div>
          <node-panel
            :modeler="modeler"
            :element="element"
            :form="form"
            :node-type="nodeType"
            :is-multi-instance="isMultiInstance"
            :multi-instance-type="multiInstance_type"
            :json-var="jsonVar"
            :is-intermediate-catch-event="isIntermediateCatchEvent"
            :is-throw-event="isThrowEvent"
            :message-info="messageInfo"
            :signal-info="signalInfo"
            :called-activity="calledActivity"
            :script-info="scriptInfo"
          />
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>
<script>
import { getExtension, getBusinessObject, is, hasEventDefinition } from '@/utils'
import { getBtnList, setButton } from '@/utils/setButtonXml'
import canvasPanel from './components/canvasPanel'
import nodePanel from './components/nodePanel'
import edgePanel from './components/edgePanel'

export default {
  components: {
    canvasPanel,
    nodePanel,
    edgePanel
  },
  props: {
    modeler: {
      type: Object,
      default: () => {}
    },
    rootElements: {
      type: Object,
      default: () => {}
    },
    flowInfo: {
      type: Object,
      default: () => {}
    },
    objItems: {
      type: Array,
      default: () => []
    },
    nodeDefaultBtns: {
      type: Array,
      default: () => []
    },
    flowDefaultBtns: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      element: {},
      form: {},
      nodeType: '',
      isConditional: false,
      isMultiInstance: false,
      multiInstance_type: 'none',
      jsonVar: null,
      isIntermediateCatchEvent: false,
      isThrowEvent: false,
      messageInfo: {
        ref: null,
        consumer: [],
        producer: [],
        cls: null,
        fun: null
      },
      signalInfo: {
        ref: null,
        route: null,
        consumer: [],
        producer: [],
        cls: null,
        fun: null
      },
      calledActivity: {
        element: null,
        binding: null,
        version: null
      },
      scriptInfo: {
        cls: null,
        fun: null
      }
    }
  },
  computed: {
    sequenceFlow() {
      if (!this.element) {
        return
      }
      return this.element.type === 'bpmn:SequenceFlow'
    }
  },
  mounted() {
    this.handleModeler()
  },
  methods: {
    handleModeler() {
      // 监听节点选择变化
      this.modeler.on('selection.changed', e => {
        const element = e.newSelection[0]
        this.element = element
        if (!element) return
        this.form = {
          ...element.businessObject,
          ...element.businessObject.$attrs
        }
        // console.log('$$', element)

        this.nodeType = element.type
        // 判断是否是空开始节点
        if (this.nodeType === 'bpmn:StartEvent' && !element.businessObject.eventDefinitions) {
          this.nodeType = 'EmptyStartEvent'
        }
        // 判断是否是多实例,目前只判断是并行或串行
        this.multiInstance_type = 'none'
        if (element.businessObject.loopCharacteristics && element.businessObject.loopCharacteristics.$type === 'bpmn:MultiInstanceLoopCharacteristics') {
          this.isMultiInstance = true
          // 判断多实例类型
          if (element.businessObject.loopCharacteristics.isSequential) {
            this.multiInstance_type = 'sequential'
          } else {
            this.multiInstance_type = 'parallel'
          }
        } else {
          this.isMultiInstance = false
        }
        // 判断是否是时间事件
        if (hasEventDefinition(element, 'bpmn:TimerEventDefinition')) {
          this.nodeType = 'timerEvent'
          if (element.type === 'bpmn:IntermediateCatchEvent') {
            this.isIntermediateCatchEvent = true
          } else {
            this.isIntermediateCatchEvent = false
          }
          this.$store.commit('SET_TIMER_INFO', {})
          const timer_info = {}
          element.businessObject.eventDefinitions.forEach(item => {
            const cronExpress = {
              cron: '* * * * * ? *',
              start_date: new Date().getTime(),
              end_date: 4102415999000, // 2099-12-31 23:59:59
              timezone: null,
              jitter: null
            }
            if (item.$attrs.cron) {
              const _result = item.$attrs.cron.split(' ')
              const cron = []
              _result.forEach((sub, index) => {
                if (index < 7) {
                  cron.push(sub)
                }
              })
              cronExpress.cron = cron.join(' ')
              cronExpress.start_date = _result[7]
              cronExpress.end_date = _result[8]
              cronExpress.timezone = _result[9] === '*' ? null : _result[9]
              cronExpress.jitter = _result[10] === '*' ? null : _result[10]
            }
            timer_info.trigger = item.$attrs.trigger
            timer_info.date = item.$attrs.date ? item.$attrs.date : new Date()
            timer_info.interval = item.$attrs.interval ? item.$attrs.interval : null
            timer_info.intertype = item.$attrs.intertype ? item.$attrs.intertype : null
            timer_info.cronExpress = cronExpress
          })
          this.$store.commit('SET_TIMER_INFO', timer_info)
        }
        // 判断是否是消息事件
        if (hasEventDefinition(element, 'bpmn:MessageEventDefinition')) {
          this.nodeType = 'messageEvent'
          if (element.businessObject.eventDefinitions[0].messageRef) {
            this.messageInfo.ref = element.businessObject.eventDefinitions[0].messageRef.name
          } else {
            this.messageInfo.ref = null
          }
          if (element.businessObject.$type === 'bpmn:IntermediateThrowEvent') {
            this.isThrowEvent = true
            const producer = element.businessObject.eventDefinitions[0].$attrs.producer ? element.businessObject.eventDefinitions[0].$attrs.producer.split('.') : []
            const api_val = this.get_api_val(producer)
            this.messageInfo.producer = api_val.length > 0 ? api_val : []
            this.messageInfo.cls = api_val.length > 0 ? api_val[0] : null
            this.messageInfo.fun = api_val.length > 0 ? api_val[1] : null
          } else {
            this.isThrowEvent = false
            const consumer = element.businessObject.eventDefinitions[0].$attrs.consumer ? element.businessObject.eventDefinitions[0].$attrs.consumer.split('.') : []
            const api_val = this.get_api_val(consumer)
            this.messageInfo.consumer = api_val.length > 0 ? api_val : []
            this.messageInfo.cls = api_val.length > 0 ? api_val[0] : null
            this.messageInfo.fun = api_val.length > 0 ? api_val[1] : null
          }
        }
        // 判断是否是信号事件
        if (hasEventDefinition(element, 'bpmn:SignalEventDefinition')) {
          this.nodeType = 'signalEvent'
          if (element.businessObject.eventDefinitions[0].signalRef) {
            this.signalInfo.ref = element.businessObject.eventDefinitions[0].signalRef.name
          } else {
            this.signalInfo.ref = null
          }
          this.signalInfo.route = element.businessObject.eventDefinitions[0].$attrs.route || null
          if (element.businessObject.$type === 'bpmn:IntermediateThrowEvent') {
            this.isThrowEvent = true
            const producer = element.businessObject.eventDefinitions[0].$attrs.producer ? element.businessObject.eventDefinitions[0].$attrs.producer.split('.') : []
            const api_val = this.get_api_val(producer)
            this.signalInfo.producer = api_val.length > 0 ? api_val : []
            this.signalInfo.cls = api_val.length > 0 ? api_val[0] : null
            this.signalInfo.fun = api_val.length > 0 ? api_val[1] : null
          } else {
            this.isThrowEvent = false
            const consumer = element.businessObject.eventDefinitions[0].$attrs.consumer ? element.businessObject.eventDefinitions[0].$attrs.consumer.split('.') : []
            const api_val = this.get_api_val(consumer)
            this.signalInfo.consumer = api_val.length > 0 ? api_val : []
            this.signalInfo.cls = api_val.length > 0 ? api_val[0] : null
            this.signalInfo.fun = api_val.length > 0 ? api_val[1] : null
          }
        }

        this.$store.commit('SET_NODE_BUTTONS', [])
        this.$store.commit('SET_NODE_ASSIGN', null)
        this.$store.commit('SET_EDIT_FORM', [])
        this.$store.commit('SET_DISPLAY_FORM', [])
        this.$store.commit('SET_MULTIINSTANCE_INFO', null)
        this.$store.commit('SET_EMPTY__START_ASSIGN', null)
        this.$store.commit('SET_URL_MODULE_NODE', {})
        this.$store.commit('SET_COUNTERSIGN_INFO', null)

        const noneEventElements = getExtension(element.businessObject, 'enfo:NoneEventDefinition')
        const assignElements = getExtension(element.businessObject, 'enfo:Assigns') // assign 人员信息
        const objectElement = getExtension(element.businessObject, 'enfo:Object')

        if (element.type === 'bpmn:StartEvent') {
          if (noneEventElements) {
            // 空开始节点人员信息
            if (noneEventElements.assigns) {
              const solo = []
              const role = []
              const group = []
              const organ = []
              noneEventElements.assigns.forEach(element => {
                element.assign.forEach(item => {
                  if (item.text.indexOf('user@') !== -1 || item.text.indexOf('route@') !== -1) {
                    solo.push(item.text)
                  } else if (item.text.indexOf('role@') !== -1) {
                    role.push(item.text)
                  } else if (item.text.indexOf('group@') !== -1) {
                    group.push(item.text)
                  } else if (item.text.indexOf('organ@') !== -1) {
                    organ.push(item.text)
                  }
                })
              })
              const emptyStartAssign = {
                solo: solo,
                group: group,
                role: role,
                organ: organ
              }
              this.$store.commit('SET_EMPTY__START_ASSIGN', emptyStartAssign)
            }
            if (noneEventElements.object) {
              noneEventElements.object.forEach(element => {
                // 展示表单
                if (element.display_forms) {
                  this.get_display_forms(element.display_forms)
                }
                // 编辑表单
                if (element.edit_forms) {
                  this.get_edit_forms(element.edit_forms)
                }
              })
            }
            // url module 表单
            const urlModuleForm = {
              url: null,
              module: []
            }
            if (noneEventElements.url_form) {
              urlModuleForm.url = noneEventElements.url_form[0].url
            }
            if (noneEventElements.module_form) {
              noneEventElements.module_form.forEach(item => {
                urlModuleForm.module.push(item.module_name)
              })
            }
            this.$store.commit('SET_URL_MODULE_NODE', urlModuleForm)
          }
        } else {
          // userTask 节点人员信息
          if (assignElements && assignElements.assign) {
            const assign = []
            const role = []
            const group = []
            const user = []
            const organ = []
            assignElements.assign.forEach(item => {
              if (item.text.indexOf('route@') !== -1) {
                assign.push({
                  text: item.$attrs.name,
                  code: item.text
                })
              } else if (item.text.indexOf('role@') !== -1) {
                role.push({
                  text: item.$attrs.name,
                  code: item.text
                })
              } else if (item.text.indexOf('group@') !== -1) {
                group.push({
                  text: item.$attrs.name,
                  code: item.text
                })
              } else if (item.text.indexOf('user@') !== -1) {
                user.push({
                  text: item.$attrs.name,
                  code: item.text
                })
              } else if (item.text.indexOf('organ@') !== -1) {
                organ.push({
                  text: item.$attrs.name,
                  code: item.text
                })
              }
            })
            const nodeAssign = {
              assign: assign,
              group: group,
              role: role,
              user: user,
              organ: organ
            }
            this.$store.commit('SET_NODE_ASSIGN', nodeAssign)
          }
          if (objectElement) {
            // 编辑表单
            if (objectElement.edit_forms) {
              this.get_edit_forms(objectElement.edit_forms)
            }
            // 展示表单
            if (objectElement.display_forms) {
              this.get_display_forms(objectElement.display_forms)
            }
          }
          // url module 表单
          if (element.businessObject.extensionElements) {
            const urlModuleForm = {
              url: null,
              module: []
            }
            var values = element.businessObject.extensionElements.get('values')
            values.forEach(item => {
              if (item.$type === 'enfo:UrlForm') {
                urlModuleForm.url = item.url
              }
              if (item.$type === 'enfo:ModuleForm') {
                urlModuleForm.module.push(item.module_name)
              }
            })
            this.$store.commit('SET_URL_MODULE_NODE', urlModuleForm)
          }
        }
        // 节点 buttons
        const btnElements = getExtension(element.businessObject, 'enfo:NodeInstanceBtnList')
        if (btnElements) {
          getBtnList(btnElements, true)
        }
        // MultiInstance 多实例
        const multiInstance = element.businessObject.loopCharacteristics
        if (multiInstance) {
          // 如果是并行或串行
          if (multiInstance.$type === 'bpmn:MultiInstanceLoopCharacteristics') {
            const multiInstance_info = {
              number: multiInstance.loopCardinality ? multiInstance.loopCardinality.body : null,
              isextract: false,
              end_condition: multiInstance.completionCondition ? multiInstance.completionCondition.body : '',
              cls: multiInstance.completionCondition ? multiInstance.completionCondition.$attrs.cls : null,
              fun: multiInstance.completionCondition ? multiInstance.completionCondition.$attrs.fun : null,
              condition_type: multiInstance.$attrs.condition_type ? multiInstance.$attrs.condition_type : null
            }
            if (multiInstance.loopCardinality && multiInstance.loopCardinality.$attrs.isextract) {
              multiInstance_info.isextract = JSON.parse(multiInstance.loopCardinality.$attrs.isextract)
            }
            this.$store.commit('SET_MULTIINSTANCE_INFO', multiInstance_info)
          }
        }
        // 多实例会签
        const countersign = getExtension(element.businessObject, 'enfo:Countersign')
        if (countersign) {
          const countersign_info = {
            open: true,
            strategy: countersign.strategy,
            win_out: countersign.win_out,
            all_user: JSON.parse(countersign.all_user),
            extract: JSON.parse(countersign.extract),
            weight_mode: JSON.parse(countersign.weight_mode),
            user_list: [],
            group_list: [],
            role_list: [],
            organ_list: [],
            backToBack: [],
            resultSess: null,
            formType: null,
            resultFormType: null,
            voteform: null,
            voteResultForm: []
          }
          if (countersign.weight) {
            countersign.weight.forEach(item => {
              if (item.text.indexOf('user@') !== -1) {
                countersign_info.user_list.push({
                  text: item.$attrs.label,
                  code: item.text,
                  weight: item.weight
                })
              }
              if (item.text.indexOf('group@') !== -1) {
                countersign_info.group_list.push({
                  text: item.$attrs.label,
                  code: item.text,
                  weight: item.weight
                })
              }
              if (item.text.indexOf('role@') !== -1) {
                countersign_info.role_list.push({
                  text: item.$attrs.label,
                  code: item.text,
                  weight: item.weight
                })
              }
              if (item.text.indexOf('organ@') !== -1) {
                countersign_info.organ_list.push({
                  text: item.$attrs.label,
                  code: item.text,
                  weight: item.weight
                })
              }
            })
          }
          if (countersign.backToBack) {
            countersign.backToBack.forEach(item => {
              countersign_info.backToBack.push(item.text)
            })
          }
          if (countersign.courseResultSess) {
            const assign = []
            const group = []
            const role = []
            const user = []
            const organ = []
            countersign.courseResultSess.forEach(item => {
              if (item.text.indexOf('route@') !== -1) {
                assign.push({
                  text: item.$attrs.name,
                  code: item.text
                })
              } else if (item.text.indexOf('user@') !== -1) {
                user.push({
                  text: item.$attrs.name,
                  code: item.text
                })
              } else if (item.text.indexOf('group@') !== -1) {
                group.push({
                  text: item.$attrs.name,
                  code: item.text
                })
              } else if (item.text.indexOf('role@') !== -1) {
                role.push({
                  text: item.$attrs.name,
                  code: item.text
                })
              } else {
                organ.push({
                  text: item.$attrs.name,
                  code: item.text
                })
              }
            })
            countersign_info.resultSess = {
              assign: assign,
              group: group,
              role: role,
              user: user,
              organ: organ
            }
          }
          if (countersign.voteForm) {
            if (countersign.voteForm[0].edit_forms) {
              countersign_info.formType = 'method'
              countersign.voteForm[0].edit_forms.forEach(item => {
                countersign_info.voteform = {
                  mtd_id: item.text,
                  object_code: item.$attrs.owner,
                  proj_code: item.$attrs.proj_code
                }
              })
            } else if (countersign.voteForm[0].moduleForm) {
              countersign_info.formType = 'vmodule'
              countersign_info.voteform = countersign.voteForm[0].moduleForm[0].module_name
            }
          }
          if (countersign.voteResultForm) {
            if (countersign.voteResultForm[0].edit_forms) {
              countersign_info.resultFormType = 'method'
              countersign.voteResultForm[0].edit_forms.forEach(item => {
                countersign_info.voteResultForm = {
                  mtd_id: item.text,
                  object_code: item.$attrs.owner,
                  proj_code: item.$attrs.proj_code
                }
              })
            } else if (countersign.voteResultForm[0].moduleForm) {
              countersign_info.resultFormType = 'vmodule'
              countersign_info.voteResultForm = countersign.voteResultForm[0].moduleForm[0].module_name
            }
          }
          this.$store.commit('SET_COUNTERSIGN_INFO', countersign_info)
        }

        // 判断是否是有条件的连接, 源节点是排他网关 / 包容网关
        const businessObject = getBusinessObject(element)
        if (element.type === 'bpmn:SequenceFlow' && (is(businessObject.sourceRef, 'bpmn:ExclusiveGateway') || is(businessObject.sourceRef, 'bpmn:InclusiveGateway'))) {
          this.isConditional = true
        } else {
          this.isConditional = false
        }

        // 获取流程图中除连线外的所有的UserTask节点
        let flowElements = this.modeler.getDefinitions().rootElements[0].flowElements
        if (flowElements) {
          flowElements = flowElements.filter(item => {
            return item.$type === 'bpmn:UserTask'
          })
          const nodeList = []
          let i = 0
          flowElements.forEach(item => {
            i++
            nodeList.push({
              node_id: item.id,
              name: item.name ? item.name : 'UserTask' + i,
              node_type: item.$type
            })
          })
          this.$store.commit('SET_NODE_LIST', nodeList)
        }
        // 节点js变量
        const jsonVariate = getExtension(element.businessObject, 'enfo:Variable')
        if (jsonVariate) {
          this.jsonVar = jsonVariate.jsonVar
        } else {
          this.jsonVar = null
        }
        // 调用子流程
        if (element.type === 'bpmn:CallActivity') {
          this.calledActivity.element = element.businessObject.calledElement || null
          this.calledActivity.binding = element.businessObject.$attrs.calledElementBinding || null
          this.calledActivity.version = element.businessObject.$attrs.calledElementVersion || null
        }
        //脚本任务
        const scriptElement = getExtension(element.businessObject, 'enfo:PythonApi')
        if (scriptElement) {
          this.scriptInfo.cls = scriptElement.cls
          this.scriptInfo.fun = scriptElement.fun
        } else {
          this.scriptInfo.cls = null
          this.scriptInfo.fun = null
        }
      })

      // 监听节点属性变化
      this.modeler.on('element.changed', e => {
        const { element } = e
        if (!element) return
        //  新增节点需要更新回属性面板
        if (element.id === this.form.id) {
          this.form.name = element.businessObject.name
          this.form = { ...this.form }
        }
        this.nodeType = element.type
        // 判断是否是空开始节点
        if (this.nodeType === 'bpmn:StartEvent' && !element.businessObject.eventDefinitions) {
          this.nodeType = 'EmptyStartEvent'
        }
        // 判断是否是时间事件
        if (hasEventDefinition(element, 'bpmn:TimerEventDefinition')) {
          this.nodeType = 'timerEvent'
        }
        // 判断是否是消息事件
        if (hasEventDefinition(element, 'bpmn:MessageEventDefinition')) {
          this.nodeType = 'messageEvent'
          if (element.businessObject.eventDefinitions[0].messageRef) {
            this.messageInfo.ref = element.businessObject.eventDefinitions[0].messageRef.name
          } else {
            this.messageInfo.ref = null
          }
        }
        // 判断是否是信息事件
        if (hasEventDefinition(element, 'bpmn:SignalEventDefinition')) {
          this.nodeType = 'signalEvent'
          if (element.businessObject.eventDefinitions[0].signalRef) {
            this.signalInfo.ref = element.businessObject.eventDefinitions[0].signalRef.name
          } else {
            this.signalInfo.ref = null
          }
        }
        // 切换到其他类型的开始节点时删除原开始节点 NoneEventDefinition 扩展属性
        if (element.type === 'bpmn:StartEvent' && element.businessObject.eventDefinitions) {
          if (element.businessObject.extensionElements && element.businessObject.extensionElements.values) {
            element.businessObject.extensionElements.values = element.businessObject.extensionElements.values.filter(item => {
              return item.$type !== 'enfo:NoneEventDefinition'
            })
          }
        }
        // 判断是否是多实例,目前只判断是并行或串行
        this.multiInstance_type = 'none'
        if (element.businessObject.loopCharacteristics && element.businessObject.loopCharacteristics.$type === 'bpmn:MultiInstanceLoopCharacteristics') {
          this.isMultiInstance = true
          if (element.type === 'bpmn:UserTask') {
            const moddle = this.modeler.get('moddle')
            const loopCardinality = moddle.create('bpmn:FormalExpression', { isextract: false, type: 'Assigns' })
            element.businessObject.loopCharacteristics.loopCardinality = loopCardinality
          }
          // 判断多实例类型
          if (element.businessObject.loopCharacteristics.isSequential) {
            this.multiInstance_type = 'sequential'
            // 串行多实例时删除多实例会签
            const analysis = getExtension(element.businessObject, 'enfo:Countersign')
            if (analysis) {
              const overlays = this.modeler.get('overlays')
              overlays.remove({ element: element.id })

              element.businessObject.extensionElements.values = element.businessObject.extensionElements.values.filter(item => {
                return item.$type !== 'enfo:Countersign'
              })
            }
          } else {
            this.multiInstance_type = 'parallel'
          }
          const multiInstance_info = {
            number: null,
            isextract: false,
            end_condition: null,
            cls: null,
            fun: null
          }
          this.$store.commit('SET_MULTIINSTANCE_INFO', multiInstance_info)
        } else {
          this.isMultiInstance = false
          // 取消多实例时删除多实例会签
          const analysis = getExtension(element.businessObject, 'enfo:Countersign')
          if (analysis) {
            const overlays = this.modeler.get('overlays')
            overlays.remove({ element: element.id })

            element.businessObject.extensionElements.values = element.businessObject.extensionElements.values.filter(item => {
              return item.$type !== 'enfo:Countersign'
            })
          }
        }
      })

      // 监听节点类型变化
      this.modeler.on('shape.changed', e => {
        const { element } = e
        const type = element.type
        if (this.nodeType === 'EmptyStartEvent' && type === 'bpmn:StartEvent') return
        if (this.nodeType !== type && element.businessObject.extensionElements && type !== 'label' && type !== 'bpmn:StartEvent') {
          delete element.businessObject.extensionElements
        }
        // 如果类型是UserTask，XML中添加默认按钮信息
        if (this.nodeType !== type && element.type === 'bpmn:UserTask') {
          this.nodeDefaultBtns.forEach(item => {
            setButton(item, this.modeler, element, true)
          })
        }
      })
      // 监听节点删除时删除信号事件、消息事件在根元素下的标签
      this.modeler.on('shape.removed', e => {
        const { element } = e
        if (element.type !== 'label') {
          if (hasEventDefinition(element, 'bpmn:MessageEventDefinition')) {
            this.$nextTick(() => {
              this.modeler._definitions.rootElements.forEach((item, index) => {
                if (item.$type === 'bpmn:Message' && item.id === element.businessObject.eventDefinitions[0].messageRef.id) {
                  this.modeler._definitions.rootElements.splice(index, 1)
                }
              })
            })
          }
          if (hasEventDefinition(element, 'bpmn:SignalEventDefinition')) {
            this.$nextTick(() => {
              this.modeler._definitions.rootElements.forEach((item, index) => {
                if (item.$type === 'bpmn:Signal' && item.id === element.businessObject.eventDefinitions[0].signalRef.id) {
                  this.modeler._definitions.rootElements.splice(index, 1)
                }
              })
            })
          }
        }
      })
    },
    get_display_forms(display_forms) {
      const displayForm = []
      display_forms.forEach(item => {
        displayForm.push({
          mtd_id: item.text,
          object_code: item.$attrs.owner,
          proj_code: item.$attrs.proj_code
        })
      })
      this.$store.commit('SET_DISPLAY_FORM', displayForm)
    },
    get_edit_forms(edit_forms) {
      const editForm = []
      edit_forms.forEach(item => {
        editForm.push({
          mtd_id: item.text,
          object_code: item.$attrs.owner,
          proj_code: item.$attrs.proj_code
        })
      })
      this.$store.commit('SET_EDIT_FORM', editForm)
    },
    get_api_val(element) {
      let cls = null
      let _cls = []
      let fun = null
      if (element.length > 0) {
        element.forEach((item, index) => {
          if (index === element.length - 1) {
            fun = item
          } else {
            _cls.push(item)
          }
        })
        cls = _cls.join('.')
        return [cls, fun]
      } else {
        return []
      }
    }
  }
}
</script>
