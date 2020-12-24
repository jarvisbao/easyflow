<template>
  <div class="design-containers">
    <div class="topbar">
      <div class="flow-title">
        {{ flow_info.name }}
      </div>
      <el-button id="back" type="primary" plain size="small" @click="back">
        返回
      </el-button>
    </div>
    <div class="toolbar">
      <div class="space">
        <el-button id="save" :disabled="isSave" type="primary" size="mini" @click="save">
          保存
        </el-button>
      </div>
      <div id="undo" @click="undo">
        <i class="iconfont icon-chexiao" />
      </div>
      <div id="redo" class="space" @click="redo">
        <i class="iconfont icon-redo" />
      </div>
      <div id="zoom-in" @click="zoomIn">
        <i class="iconfont icon-fangda-copy" />
      </div>
      <div id="zoom-out" @click="zoomOut">
        <i class="iconfont icon-suoxiao" />
      </div>
      <div id="zoom-reset" @click="resetZoom">
        <i class="iconfont icon-actual-size" />
      </div>
    </div>
    <div ref="bpmnContainer" :style="{height: height + 'px'}" class="bpmn-container">
      <div id="canvas" ref="canvas" />
      <panel
        v-if="bpmnModeler"
        :modeler="bpmnModeler"
        :root-elements="rootElements"
        :flow-info="flow_info"
        :node-default-btns="nodeDefaultBtns"
        :flow-default-btns="flowDefaultBtns"
        class="panel"
      />
    </div>
    <el-dialog v-if="dialogVisible" :visible.sync="dialogVisible" append-to-body :close-on-click-modal="false" title="保存流程定义" width="30%">
      <el-form ref="form" :model="flow_info" label-width="80px" style="width: 95%;">
        <el-form-item label="名称" prop="name">
          <el-input id="flow-name" v-model="flow_info.name" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input id="flow-desc" v-model="flow_info.description" :autosize="{ minRows: 2, maxRows: 5}" type="textarea" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button id="cancel" @click="dialogVisible = false">取 消</el-button>
        <el-button id="publish" type="primary" :loading="loading" @click="publish">保存</el-button>
        <el-button id="publish-new" type="primary" :loading="loadingNew" @click="publishNew">发布新版本</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import BpmnModeler from '@/components/bpmn-js/lib/Modeler'
import panel from './propertyPanel'
import customTranslate from './i18n/customTranslate'
import BpmnData from './BpmnData'
import { mapGetters } from 'vuex'
import { getExtension, hasEventDefinition } from '@/utils'
import enfoPackage from '@/resources/enfo.js'
import shortid from 'js-shortid'
import { setButton } from '@/utils/setButtonXml'

export default {
  components: {
    panel
  },
  data() {
    return {
      height: 500,
      bpmnModeler: null,
      viewer: null,
      canvas: null,
      bpmnData: new BpmnData(),
      scale: 1,
      process_id: new Date().getTime(),
      flow_title: '',
      element: {},
      dialogVisible: false,
      act_def_id: null,
      def_setting: '',
      status: 'draft',
      rootElements: {},
      loading: false,
      loadingNew: false,
      flowDefaultBtns: [],
      nodeDefaultBtns: []
    }
  },
  computed: {
    ...mapGetters([
      'flow_info',
      'isSave'
    ])
  },
  watch: {
    flowDefaultBtns: {
      handler(val) {
        // 打开空流程图时，XML中添加默认按钮信息
        if (val.length > 0 && this.bpmnModeler._definitions.rootElements[0].flowElements === undefined) {
          val.forEach(item => {
            setButton(item, this.bpmnModeler, this.rootElements, false)
          })
        }
      }
    }
  },
  created() {
    this.$Apis.flowCommon.list_route().then(response => {
      if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
        this.$store.commit('SET_ROUTE_LIST', response.payload)
      }
    })
    this.$Apis.flowCommon.list_group().then(response => {
      if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
        this.$store.commit('SET_GROUP_LIST', response.payload)
      }
    })
    this.$Apis.flowCommon.list_role().then(response => {
      if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
        this.$store.commit('SET_ROLE_LIST', response.payload)
      }
    })
    this.$Apis.flowCommon.list_org().then(response => {
      if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
        this.$store.commit('SET_ORG_LIST', response.payload)
      }
    })
    this.$Apis.flowCommon.list_user().then(response => {
      if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
        this.$store.commit('SET_USER_LIST', response.payload)
      }
    })
    // 默认按钮
    this.$Apis.flow.buttons_default().then(response => {
      if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
        const items = response.payload
        this.flowDefaultBtns = items.filter(item => {
          return item.belong === 'process'
        })
        this.nodeDefaultBtns = items.filter(item => {
          return item.belong === 'user_task'
        })
      }
    })
  },
  mounted() {
    this.$store.commit('SET_IS_SAVE', false)
    this.height = this.$refs.canvas.clientHeight
    const canvas = this.$refs.canvas
    const customTranslateModule = {
      translate: ['value', customTranslate]
    }
    // 生成实例
    this.bpmnModeler = new BpmnModeler({
      container: canvas,
      additionalModules: [
        customTranslateModule
      ],
      moddleExtensions: {
        enfo: enfoPackage
      }
      // 修改节点颜色
      // bpmnRenderer: {
      //   defaultFillColor: '#fff',
      //   defaultStrokeColor: '#ff900d'
      // }
    })
    this.createNewDiagram()
  },
  methods: {
    createNewDiagram() {
      let bpmnXmlStr = ''
      if (JSON.stringify(this.flow_info.def_setting) !== '{}') {
        bpmnXmlStr = this.flow_info.def_setting
      } else {
        bpmnXmlStr = `
        <?xml version="1.0" encoding="UTF-8"?>
          <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:vendor="http://vendor" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
            <bpmn:process id="process_${this.process_id}" name="${this.flow_info.name}">
            </bpmn:process>
            <bpmndi:BPMNDiagram id="BPMNDiagram_1">
              <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="process_${this.process_id}">
              </bpmndi:BPMNPlane>
            </bpmndi:BPMNDiagram>
          </bpmn:definitions>
        `
      }
      this.bpmnModeler.importXML(bpmnXmlStr, err => {
        if (err) {
          console.log(err)
        } else {
          this.bpmnModeler.get('canvas').zoom('fit-viewport', 'auto')
          this.adjustPalette()
          // var eventBus = this.bpmnModeler.get('eventBus')
          // 添加默认节点名称
          this.bpmnModeler.on('shape.added', e => {
            const { element } = e
            const nodetype = element.type
            switch (nodetype) {
              case 'bpmn:StartEvent':
                element.businessObject.name = '开始'
                break
              case 'bpmn:EndEvent':
                element.businessObject.name = '结束'
                break
              case 'bpmn:Task':
                element.businessObject.name = element.businessObject.name ? element.businessObject.name : '任务_' + shortid.gen()
                break
              case 'bpmn:ExclusiveGateway':
                element.businessObject.name = '网关'
                break
              case 'bpmn:IntermediateThrowEvent':
                element.businessObject.name = '事件'
                break
            }
          })
          // 获取流程图的根元素
          this.rootElements = this.bpmnModeler.get('canvas').getRootElement()

          if (this.bpmnModeler._definitions.rootElements[0].flowElements !== undefined) {
            // 转码流程按钮
            const flowbtnElements = getExtension(this.rootElements.businessObject, 'enfo:FlowInstanceBtnList')
            if (flowbtnElements) {
              flowbtnElements.buttons.forEach(btn => {
                if (btn.prep_script) {
                  const js_script = `<![CDATA[${btn.prep_script[0].text}]]>`
                  btn.prep_script[0].text = encodeURI(js_script)
                }
                if (btn.allow_script) {
                  const allow_script = `<![CDATA[${btn.allow_script[0].text}]]>`
                  btn.allow_script[0].text = encodeURI(allow_script)
                }
                if (btn.submit_script) {
                  const submit_script = `<![CDATA[${btn.submit_script[0].text}]]>`
                  btn.submit_script[0].text = encodeURI(submit_script)
                }
              })
            }
          }

          this.$store.commit('SET_FLOW_BUTTONS', [])
          this.$store.commit('SET_OBJ_LIST', [])
          this.$store.commit('SET_FLOW_FORM', [])
          this.$store.commit('SET_METHOD_LIST', [])
          this.$store.commit('SET_TITLE_RULE', '')
          this.$store.commit('SET_URL_MODULE_FLOW', {})

          const objectElement = getExtension(this.rootElements.businessObject, 'enfo:Object')
          // 流程业务对象
          if (objectElement && objectElement.quote_objects) {
            const objList = []
            objectElement.quote_objects.forEach(item => {
              objList.push({
                object_name: item.$attrs.name,
                object_code: item.text,
                object_id: item.$attrs.object_id,
                proj_code: item.$attrs.proj_code,
                proj_name: item.$attrs.proj_name,
                biz_code: item.$attrs.biz_code
              })
            })
            this.$store.commit('SET_OBJ_LIST', objList)
          }
          // 流程展示表单
          if (objectElement && objectElement.display_forms) {
            const flowForm = []
            objectElement.display_forms.forEach(item => {
              flowForm.push({
                mtd_id: item.text,
                object_code: item.$attrs.owner,
                proj_code: item.$attrs.proj_code
              })
            })
            this.$store.commit('SET_FLOW_FORM', flowForm)
          }
          // url module 表单
          if (this.rootElements.businessObject.extensionElements) {
            const urlModuleForm = {
              url: null,
              module: []
            }
            var values = this.rootElements.businessObject.extensionElements.get('values')
            values.forEach(item => {
              if (item.$type === 'enfo:UrlForm') {
                urlModuleForm.url = item.url
              }
              if (item.$type === 'enfo:ModuleForm') {
                urlModuleForm.module.push(item.module_name)
              }
            })
            this.$store.commit('SET_URL_MODULE_FLOW', urlModuleForm)
          }
          // 流程标题规则
          const titleRule = getExtension(this.rootElements.businessObject, 'enfo:FlowTitleRule')
          if (titleRule) {
            if (titleRule.$attrs.text) {
              titleRule.$attrs.text = encodeURI(titleRule.$attrs.text)
              const code = decodeURI(titleRule.$attrs.text)
              const rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g
              this.$store.commit('SET_TITLE_RULE', code.replace(rcleanScript, ''))
            } else {
              this.$store.commit('SET_TITLE_RULE', [titleRule.cls, titleRule.fun])
            }
          }
          // 多实例会签节点添加图标
          const overlays = this.bpmnModeler.get('overlays')
          if (this.rootElements.businessObject.flowElements) {
            this.rootElements.businessObject.flowElements.forEach(item => {
              if (getExtension(item, 'enfo:Countersign')) {
                overlays.add(item.id, {
                  position: { bottom: 20, left: 60 },
                  html: '<i class="confont icon-huiqianrenwu" style="font-size: 14px; color: #000; font-weight: bold"></i>'
                })
              }
            })
          }
          // 保存后再次修改流程图时先把条件转码，不然保存时没有CDATA，没找到其他更好的解决办法暂时先这样
          const flowElements = this.bpmnModeler.getDefinitions().rootElements[0].flowElements
          if (flowElements) {
            // 连接
            const sequenceFlow = flowElements.filter(item => {
              return item.$type === 'bpmn:SequenceFlow' && item.conditionExpression
            })
            sequenceFlow.forEach(item => {
              const code = `<![CDATA[${item.conditionExpression.body}]]>`
              item.conditionExpression.body = encodeURI(code)
            })
            // 多实例
            const multiInstance = flowElements.filter(item => {
              return item.loopCharacteristics && item.loopCharacteristics.$type === 'bpmn:MultiInstanceLoopCharacteristics' && item.loopCharacteristics.completionCondition
            })
            multiInstance.forEach(item => {
              if (item.loopCharacteristics.completionCondition.body) {
                const code = `<![CDATA[${item.loopCharacteristics.completionCondition.body}]]>`
                item.loopCharacteristics.completionCondition.body = encodeURI(code)
              }
            })
            // 节点按钮
            const nodebtnElements = flowElements.filter(item => {
              return item.$type === 'bpmn:UserTask' && getExtension(item, 'enfo:NodeInstanceBtnList')
            })
            nodebtnElements.forEach(element => {
              element.extensionElements.values.forEach(item => {
                if (item.buttons) {
                  item.buttons.forEach(btn => {
                    if (btn.prep_script) {
                      const js_script = `<![CDATA[${btn.prep_script[0].text}]]>`
                      btn.prep_script[0].text = encodeURI(js_script)
                    }
                    if (btn.allow_script) {
                      const allow_script = `<![CDATA[${btn.allow_script[0].text}]]>`
                      btn.allow_script[0].text = encodeURI(allow_script)
                    }
                    if (btn.submit_script) {
                      const submit_script = `<![CDATA[${btn.submit_script[0].text}]]>`
                      btn.submit_script[0].text = encodeURI(submit_script)
                    }
                  })
                }
              })
            })
          }
        }
      })
    },
    // 调整左侧工具栏排版
    adjustPalette() {
      try {
        // 获取 bpmn 设计器实例
        const canvas = this.$refs.canvas
        const djsPalette = canvas.children[0].children[1].children[4]
        const djsPalStyle = {
          width: '130px',
          padding: '5px',
          background: 'white',
          borderRadius: 0
        }
        for (var key in djsPalStyle) {
          djsPalette.style[key] = djsPalStyle[key]
        }
        const palette = djsPalette.children[0]
        const allGroups = palette.children
        // 修改控件样式
        for (var gKey in allGroups) {
          const group = allGroups[gKey]
          for (var cKey in group.children) {
            const control = group.children[cKey]
            const controlStyle = {
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              width: '100%',
              padding: '5px'
            }
            if (control.className && control.dataset && control.className.indexOf('entry') !== -1) {
              const controlProps = this.bpmnData.getControl(control.dataset.action)
              control.innerHTML = `
                <div style='font-size: 14px;font-weight:500;margin-left:10px;'>${controlProps['title']}</div>
              `
              for (var csKey in controlStyle) {
                control.style[csKey] = controlStyle[csKey]
              }
            }
          }
        }
      } catch (e) {
        console.log(e)
      }
    },
    save() {
      // 获取所有节点信息
      // const elementRegistry = this.bpmnModeler.get('elementRegistry')
      const allNode = this.bpmnModeler.getDefinitions().rootElements[0]
      const flowElements = allNode.flowElements
      // 如果没有节点则提示先绘制流程图
      if (flowElements && flowElements.length > 0) {
        const validate = []
        let message = null
        flowElements.forEach(item => {
          if (item.$type === 'bpmn:StartEvent' && !item.eventDefinitions) {
            const noneEvent = getExtension(item, 'enfo:NoneEventDefinition')
            if (!noneEvent || !noneEvent.assigns) {
              validate.push(false)
              message = '请完成开始节点人员配置'
            }
          }
          if (item.$type === 'bpmn:UserTask') {
            if (!getExtension(item, 'enfo:Assigns')) {
              validate.push(false)
              message = '请完成人工任务节点人员配置'
            }
          }
          if (hasEventDefinition(item, 'bpmn:MessageEventDefinition')) {
            if (item.$type === 'bpmn:IntermediateThrowEvent') {
              if (!item.eventDefinitions[0].messageRef || !item.eventDefinitions[0].$attrs.producer) {
                validate.push(false)
                message = '请完成消息事件的节点相关配置'
              }
            } else {
              if (!item.eventDefinitions[0].messageRef || !item.eventDefinitions[0].$attrs.consumer) {
                validate.push(false)
                message = '请完成消息事件的节点相关配置'
              }
            }
          }
          if (hasEventDefinition(item, 'bpmn:SignalEventDefinition')) {
            if (item.$type === 'bpmn:IntermediateThrowEvent') {
              if (!item.eventDefinitions[0].signalRef || !item.eventDefinitions[0].$attrs.producer) {
                validate.push(false)
                message = '请完成信号事件的节点相关配置'
              }
            } else {
              if (!item.eventDefinitions[0].signalRef || !item.eventDefinitions[0].$attrs.consumer) {
                validate.push(false)
                message = '请完成信号事件的节点相关配置'
              }
            }
          }
        })

        // 获取空开始节点事件
        const startEvent = flowElements.filter(item => {
          return item.$type === 'bpmn:StartEvent' && !item.eventDefinitions
        })
        if (startEvent.length > 1) {
          this.$alert('流程图不允许有两个空开始节点！', '提示', {
            confirmButtonText: '确定'
          })
        } else if (validate.includes(false)) {
          this.$alert(message, '提示', {
            confirmButtonText: '确定'
          })
        } else {
          this.act_def_id = allNode.id
          this.dialogVisible = !this.dialogVisible
        }
      } else {
        this.$alert('请绘制流程图后再保存！', '提示', {
          confirmButtonText: '确定'
        })
      }
    },
    publish() {
      // 修改根节点名称
      this.bpmnModeler.get('modeling').updateProperties(this.bpmnModeler.get('canvas').getRootElement(), { name: this.flow_info.name })
      this.bpmnModeler.saveXML({ format: true }, (err, xml) => {
        if (err) { return }
        this.def_setting = decodeURI(xml)
        console.log('xml', this.def_setting)
      })
      const flow_id = this.flow_info.flow_id
      const name = this.flow_info.name
      const act_def_id = this.act_def_id
      const description = this.flow_info.description
      const def_setting = this.def_setting
      const status = this.flow_info.status
      const support_mobile = this.flow_info.support_mobile
      this.loading = true
      this.saveData(flow_id, name, act_def_id, status, support_mobile, description, def_setting, false)
    },
    publishNew() {
      this.bpmnModeler.get('modeling').updateProperties(this.bpmnModeler.get('canvas').getRootElement(), { name: this.flow_info.name })
      this.bpmnModeler.saveXML({ format: true }, (err, xml) => {
        if (err) { return }
        this.def_setting = decodeURI(xml)
        console.log('xml', this.def_setting)
      })
      const flow_id = this.flow_info.flow_id
      const name = this.flow_info.name
      const act_def_id = this.act_def_id
      const description = this.flow_info.description
      const def_setting = this.def_setting
      const status = this.flow_info.status
      const support_mobile = this.flow_info.support_mobile
      this.loadingNew = true
      this.saveData(flow_id, name, act_def_id, status, support_mobile, description, def_setting, true)
    },
    saveData(flow_id, name, act_def_id, status, support_mobile, description, def_setting, is_new_version) {
      this.$Apis.flow.flow_design(flow_id, name, act_def_id, status, support_mobile, description, def_setting, is_new_version).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.$alert(response.message, '提示', {
            confirmButtonText: '确定',
            callback: action => {
              this.dialogVisible = !this.dialogVisible
              this.loading = false
              this.loadingNew = false
            }
          })
        } else {
          this.$alert(response.message, '提示', {
            confirmButtonText: '确定',
            callback: action => {
              this.loading = false
              this.loadingNew = false
            }
          })
        }
      })
    },
    undo() {
      this.bpmnModeler.get('commandStack').undo()
    },
    redo() {
      this.bpmnModeler.get('commandStack').redo()
    },
    zoomIn() {
      this.scale += 0.2
      this.bpmnModeler.get('canvas').zoom(this.scale)
    },
    zoomOut() {
      this.scale -= 0.2
      if (this.scale <= 0.4) {
        return
      }
      this.bpmnModeler.get('canvas').zoom(this.scale)
    },
    resetZoom() {
      this.bpmnModeler.get('canvas').zoom(1)
    },
    back() {
      this.$emit('show')
    }
  }
}
</script>
