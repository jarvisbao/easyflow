<template>
  <div>
    <el-form :model="multiple" label-width="90px" style="width: 100%;">
      <el-form-item label="类型">
        <el-select id="change-type" v-model="multiInstance_type" @change="changeType">
          <el-option label="请选择" value="none" />
          <el-option label="并行多实例" value="parallel" />
          <el-option label="串行多实例" value="sequential" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="nodeType !== 'bpmn:UserTask'" label="数量">
        <el-radio-group v-model="multiple.number" @change="handleChange">
          <el-radio id="form-field" label="form_field">
            表单字段
          </el-radio>
          <el-radio id="choose-assign" label="choose_assign">
            任务候选人
          </el-radio>
        </el-radio-group>
        <template v-if="showForm">
          <el-select id="route-form" v-model="route_form" value-key="object_code" placeholder="请选择" style="margin-top: 8px;" @change="changeBiz">
            <el-option v-for="(item, index) in obj_list" :key="index" :label="item.proj_name + ' - ' + item.object_name" :value="item" />
          </el-select>
          <el-select id="route-field" v-if="showField" v-model="route_field" placeholder="请选择" style="margin-top: 8px;" @change="changeField">
            <el-option v-for="(item, index) in fieldList" :key="index" :label="item.field_name" :value="item.field_code" />
          </el-select>
        </template>
      </el-form-item>
      <el-form-item v-if="nodeType === 'bpmn:UserTask'" label="抽取候选人">
        <el-switch v-model="isextract" @change="changeExtract" />
      </el-form-item>
      <el-form-item label="结束条件">
        <el-radio-group v-model="condition_type" @change="changeCondition">
          <el-radio label="simple">
            一般表达式
          </el-radio>
          <el-radio label="complex">
            复杂条件
          </el-radio>
        </el-radio-group>
        <template>
          <fieldset v-if="condition_type==='simple'" class="code-fieldset">
            <legend>
              <span>连接条件 <i id="end-condition" class="el-icon-edit edit_code" @click="end_condition" /></span>
            </legend>
            <div v-if="multiple.end_condition" class="code-box">
              {{ multiple.end_condition }}
            </div>
          </fieldset>
          <div v-if="condition_type==='complex'">
            <el-form-item label="服务" label-width="55px" style="margin-bottom: 10px;">
              <el-input v-model="multiple.cls" @change="handlerEndCondition" />
            </el-form-item>
            <el-form-item label="方法" label-width="55px">
              <el-input v-model="multiple.fun" @change="handlerEndCondition" />
            </el-form-item>
          </div>
        </template>
      </el-form-item>
      <!-- <fieldset class="code-fieldset">
        <legend>
          <span>结果处理 <i class="el-icon-edit edit_code" @click="result_reduction" /></span>
        </legend>
        <div v-if="multiple.result_reduction" class="code-box">
          {{ multiple.result_reduction }}
        </div>
      </fieldset> -->
    </el-form>
    <el-dialog v-if="dialogVisible" :visible.sync="dialogVisible" :close-on-click-modal="false" title="多实例脚本设置" append-to-body>
      <python-codemirror :prop_code="multiple.end_condition" :placeholder="code_placeholder" :code-mode="mode" param-code="end_condition" @get_code="get_code($event)" />
      <span slot="footer" class="dialog-footer">
        <el-button id="cancel" @click="dialogVisible = false">取 消</el-button>
        <el-button id="confirm" type="primary" @click="confirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { getExtension } from '@/utils'
import pythonCodemirror from '@/components/pythonCodemirror'

export default {
  components: {
    pythonCodemirror
  },
  props: {
    modeler: {
      type: Object,
      default: () => {}
    },
    bpmnElements: {
      type: Object,
      default: () => {}
    },
    nodeType: {
      type: String,
      default: ''
    },
    multiInstanceType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      multiple: {
        number: null,
        end_condition: '',
        cls: null,
        fun: null
        // result_reduction: ''
      },
      route_number: null,
      route_form: null,
      route_field: null,
      pyScript: null,
      fieldList: [],
      showForm: false,
      showField: false,
      isextract: false,
      multiInstance_type: this.multiInstanceType,
      condition_type: null,
      mode: 'python',
      code_placeholder: '',
      dialogVisible: false
    }
  },
  computed: {
    ...mapGetters([
      'obj_list',
      'multiInstance_info'
    ])
  },
  watch: {
    multiInstance_info: {
      handler(val) {
        if (val) {
          this.fetchData()
        } else {
          this.multiple.number = null
          this.multiple.end_condition = null
          this.multiple.cls = null
          this.multiple.fun = null
          this.route_form = null
          this.route_field = null
          this.showForm = false
          this.showField = false
        }
      }
    },
    nodeType: {
      handler(val) {}
    },
    multiInstanceType: {
      handler(val) {
        this.multiInstance_type = val
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      if (this.multiInstance_info) {
        this.multiple.number = this.multiInstance_info.number
        if (this.multiInstance_info.number) {
          if (this.multiInstance_info.number === 'choose_assign') {
            this.multiple.number = 'choose_assign'
            this.showForm = false
            this.showField = false
            this.route_form = null
            this.route_field = null
          } else {
            this.multiple.number = 'form_field'
            this.showForm = true
            this.showField = true
            const number = this.multiInstance_info.number.match('\\{(.+?)\\}')[1]
            this.obj_list.forEach(item => {
              if (item.object_code === number.split('.')[0]) {
                this.route_form = item
              }
            })
            this.changeBiz(this.route_form)
            this.route_field = number.split('.')[1]
          }
        }
        if (this.multiInstance_info.condition_type === 'simple') {
          this.condition_type = 'simple'
          const end_condition = decodeURI(this.multiInstance_info.end_condition)
          const rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g
          this.multiple.end_condition = end_condition.replace(rcleanScript, '')
        } else if (this.multiInstance_info.condition_type === 'complex') {
          this.condition_type = 'complex'
          // this.multiple.end_condition = this.multiInstance_info.end_condition
          this.multiple.cls = this.multiInstance_info.cls
          this.multiple.fun = this.multiInstance_info.fun
        } else {
          this.condition_type = null
          this.multiple.end_condition = null
          this.multiple.cls = null
          this.multiple.fun = null
        }
        this.route_number = this.multiInstance_info.number
        this.isextract = this.multiInstance_info.isextract
      }
    },
    handleChange(val) {
      if (val === 'form_field') {
        this.showForm = true
        this.route_number = null
        delete this.bpmnElements.businessObject.loopCharacteristics.loopCardinality
      } else {
        this.showForm = false
        this.route_number = 'choose_assign'
        // 添加并行/串行多实例数量
        const moddle = this.modeler.get('moddle')
        const loopCharacteristics = this.bpmnElements.businessObject.loopCharacteristics
        if (loopCharacteristics.$type === 'bpmn:MultiInstanceLoopCharacteristics') {
          const loopCardinality = moddle.create('bpmn:FormalExpression', { body: 'choose_assign' })
          loopCharacteristics.loopCardinality = loopCardinality
        }
        this.multiInstanceInfo()
      }
    },
    changeBiz(val) {
      this.showField = true
      this.$Apis.bizclass.bizfield_list(val.proj_code, val.biz_code, null, 1, 10, false).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.fieldList = response.payload.items
        }
      })
    },
    changeField(val) {
      const value = this.route_form.object_code + '.' + val
      this.route_number = `\${${value}\}`
      // 添加并行/串行多实例数量
      const moddle = this.modeler.get('moddle')
      const loopCharacteristics = this.bpmnElements.businessObject.loopCharacteristics
      if (loopCharacteristics.$type === 'bpmn:MultiInstanceLoopCharacteristics') {
        const loopCardinality = moddle.create('bpmn:FormalExpression', { body: this.route_number })
        loopCharacteristics.loopCardinality = loopCardinality
      }
      this.multiInstanceInfo()
    },
    changeExtract(val) {
      // 添加是否抽取候选人属性
      this.bpmnElements.businessObject.loopCharacteristics.loopCardinality.$attrs.isextract = val
      this.multiInstanceInfo()
    },
    get_code($event) {
      this.pyScript = $event
      for (var key in $event) {
        this.multiple[key] = $event[key]
      }
    },
    end_condition() {
      this.dialogVisible = !this.dialogVisible
    },
    confirm() {
      this.dialogVisible = !this.dialogVisible
      this.setMultiInstance(this.pyScript)
      this.multiInstanceInfo()
    },
    setMultiInstance(pyScript) {
      const moddle = this.modeler.get('moddle')
      const businessObject = this.bpmnElements.businessObject
      // 添加并行/串行多实例结束条件
      if (this.condition_type === 'simple') {
        const loopCharacteristics = this.modeler.get('moddle').create('bpmn:MultiInstanceLoopCharacteristics', { condition_type: 'simple' })
        this.modeler.get('modeling').updateProperties(this.bpmnElements, { loopCharacteristics: loopCharacteristics })
        if ('end_condition' in pyScript) {
          if (pyScript.end_condition) {
            const code = `<![CDATA[${pyScript.end_condition}]]>`
            if (businessObject.loopCharacteristics.$type === 'bpmn:MultiInstanceLoopCharacteristics') {
              const end_condition = moddle.create('bpmn:FormalExpression', { body: encodeURI(code) })
              businessObject.loopCharacteristics.completionCondition = end_condition
            }
          } else {
            delete businessObject.loopCharacteristics.completionCondition
          }
        }
      } else {
        const loopCharacteristics = this.modeler.get('moddle').create('bpmn:MultiInstanceLoopCharacteristics', { condition_type: 'complex' })
        this.modeler.get('modeling').updateProperties(this.bpmnElements, { loopCharacteristics: loopCharacteristics })
        if (pyScript.length > 0) {
          if (businessObject.loopCharacteristics.$type === 'bpmn:MultiInstanceLoopCharacteristics') {
            const end_condition = moddle.create('bpmn:FormalExpression', { cls: pyScript[0], fun: pyScript[1] })
            businessObject.loopCharacteristics.completionCondition = end_condition
          }
        } else {
          delete businessObject.loopCharacteristics.completionCondition
        }
      }

      const loopCardinality = moddle.create('bpmn:FormalExpression', { body: this.route_number })
      businessObject.loopCharacteristics.loopCardinality = this.route_number ? loopCardinality : undefined
    },
    multiInstanceInfo() {
      // multiInstance_info 数据更新
      const multiInstance_info = {
        number: this.route_number,
        isextract: this.isextract,
        end_condition: this.multiple.end_condition,
        condition_type: this.condition_type,
        cls: this.multiple.cls,
        fun: this.multiple.fun
      }
      this.$store.commit('SET_MULTIINSTANCE_INFO', multiInstance_info)
    },
    handlerEndCondition() {
      if (this.multiple.cls && this.multiple.fun) {
        const _value = [this.multiple.cls, this.multiple.fun]
        this.setMultiInstance(_value)
      }
      this.multiInstanceInfo()
    },
    changeType(val) {
      let isSequentialVal = false
      if (val === 'parallel') {
        isSequentialVal = false
      } else if (val === 'sequential') {
        isSequentialVal = true
        // 串行多实例时删除多实例会签
        const analysis = getExtension(this.bpmnElements.businessObject, 'enfo:Countersign')
        if (analysis) {
          const overlays = this.modeler.get('overlays')
          overlays.remove({ element: this.bpmnElements.id })

          this.bpmnElements.businessObject.extensionElements.values = this.bpmnElements.businessObject.extensionElements.values.filter(item => {
            return item.$type !== 'enfo:Countersign'
          })
        }
      } else {
        this.modeler.get('modeling').updateProperties(this.bpmnElements, { loopCharacteristics: undefined })
        // 取消多实例时删除多实例会签
        const analysis = getExtension(this.bpmnElements.businessObject, 'enfo:Countersign')
        if (analysis) {
          const overlays = this.modeler.get('overlays')
          overlays.remove({ element: this.bpmnElements.id })

          this.bpmnElements.businessObject.extensionElements.values = this.bpmnElements.businessObject.extensionElements.values.filter(item => {
            return item.$type !== 'enfo:Countersign'
          })
        }
        return
      }
      // 添加多实例的属性
      const loopCharacteristics = this.modeler.get('moddle').create('bpmn:MultiInstanceLoopCharacteristics', { isSequential: isSequentialVal })
      this.modeler.get('modeling').updateProperties(this.bpmnElements, { loopCharacteristics: loopCharacteristics })
      this.multiple.number = null
      this.multiple.end_condition = null
      this.multiple.cls = null
      this.multiple.fun = null
      this.isextract = false
      this.route_field = null
      this.showForm = false
      this.showField = false
    },
    changeCondition(val) {
      if (val === 'simple') {
        if (!this.multiInstance_info.end_condition || Array.isArray(this.multiInstance_info.end_condition)) {
          this.multiple.end_condition = ''
        } else {
          const end_condition = decodeURI(this.multiInstance_info.end_condition)
          const rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g
          this.multiple.end_condition = end_condition.replace(rcleanScript, '')
        }
      } else {
        this.multiple.end_condition = this.multiInstance_info.end_condition
      }
    }
  }
}
</script>
