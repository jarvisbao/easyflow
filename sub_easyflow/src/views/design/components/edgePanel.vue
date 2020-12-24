<template>
  <div class="config-edge">
    <el-form ref="form" :model="form" label-width="100px" style="width: 100%;">
      <el-collapse v-model="activeNames">
        <el-collapse-item name="baseinfo">
          <template slot="title">
            连线
          </template>
          <div>
            <el-form-item label="连线标题">
              <el-input v-model="form.name" @input="changeName" />
            </el-form-item>
            <el-form-item v-if="isConditional" label="连接条件">
              <el-radio-group v-model="condition_type">
                <el-radio id="simple-condition" label="simple">
                  一般表达式
                </el-radio>
                <el-radio id="complex-condition" label="complex">
                  复杂条件
                </el-radio>
              </el-radio-group>
              <template>
                <fieldset v-if="condition_type==='simple'" class="code-fieldset">
                  <legend>
                    <span>连接条件 <i id="set-condition" class="el-icon-edit edit_code" @click="set_condition_code" /></span>
                  </legend>
                  <div v-if="form.condition_code" class="code-box">
                    {{ form.condition_code }}
                  </div>
                </fieldset>
                <div v-if="condition_type==='complex'">
                  <el-form-item label="服务" label-width="55px" style="margin-bottom: 10px;">
                    <el-input id="cls" v-model="form.cls" @change="handleCondition" />
                  </el-form-item>
                  <el-form-item label="方法" label-width="55px">
                    <el-input id="fun" v-model="form.fun" @change="handleCondition" />
                  </el-form-item>
                </div>
              </template>
            </el-form-item>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-form>
    <el-dialog v-if="dialogVisible" :visible.sync="dialogVisible" :close-on-click-modal="false" title="条件分支脚本设置" append-to-body class="flow-codemirror">
      <python-codemirror :prop_code="form.condition_code" :placeholder="code_placeholder" :code-mode="mode" param-code="condition_code" @get_code="get_code($event)" />
      <div style="padding-top: 12px; font-size: 13px; color: #999;">
        请填写Python代码的条件判断
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button id="cancel" @click="dialogVisible = false">取 消</el-button>
        <el-button id="confirm" type="primary" @click="confirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
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
    element: {
      type: Object,
      default: () => {}
    },
    form: {
      type: Object,
      default: () => {}
    },
    isConditional: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      activeNames: 'baseinfo',
      condition_code: null,
      code_placeholder: '',
      mode: 'python',
      dialogVisible: false,
      condition_type: null
    }
  },
  watch: {
    isConditional: {
      handler(val) {}
    },
    element: {
      handler(val) {
        if (val.businessObject.conditionExpression) {
          if (this.element.businessObject.conditionExpression.body) {
            this.condition_type = 'simple'
            const code = decodeURI(this.element.businessObject.conditionExpression.body)
            const rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g
            this.form.condition_code = code.replace(rcleanScript, '')
          } else {
            const cls = this.element.businessObject.conditionExpression.$attrs.cls
            const fun = this.element.businessObject.conditionExpression.$attrs.fun
            this.form.cls = cls
            this.form.fun = fun
            this.condition_type = 'complex'
          }
        } else {
          this.condition_type = null
        }
      }
    }
  },
  created() {
    if (this.element.businessObject.conditionExpression) {
      if (this.element.businessObject.conditionExpression.body) {
        this.condition_type = 'simple'
        const code = decodeURI(this.element.businessObject.conditionExpression.body)
        const rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g
        this.form.condition_code = code.replace(rcleanScript, '')
      } else {
        const cls = this.element.businessObject.conditionExpression.$attrs.cls
        const fun = this.element.businessObject.conditionExpression.$attrs.fun
        this.form.cls = cls
        this.form.fun = fun
        this.condition_type = 'complex'
      }
    }
  },
  methods: {
    changeName(name) {
      const modeling = this.modeler.get('modeling')
      modeling.updateLabel(this.element, name)
    },
    get_code($event) {
      this.form['condition_code'] = $event['condition_code']
    },
    set_condition_code() {
      this.dialogVisible = !this.dialogVisible
    },
    setCondition(code) {
      const moddle = this.modeler.get('moddle')
      const modeling = this.modeler.get('modeling')
      if (this.condition_type === 'simple') {
        const conditionExpression = moddle.create('bpmn:FormalExpression', { body: encodeURI(code), condition_type: this.condition_type })
        modeling.updateProperties(this.element, {
          conditionExpression: code ? conditionExpression : undefined
        })
      } else {
        const conditionExpression = moddle.create('bpmn:FormalExpression', { cls: code[0], fun: code[1], condition_type: this.condition_type })
        modeling.updateProperties(this.element, {
          conditionExpression: code.length > 0 ? conditionExpression : undefined
        })
      }
    },
    confirm() {
      this.dialogVisible = !this.dialogVisible
      const code = `<![CDATA[${this.form.condition_code}]]>`
      this.setCondition(code)
    },
    handleCondition(val) {
      if (this.form.cls && this.form.fun) {
        const _value = [this.form.cls, this.form.fun]
        this.setCondition(_value)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.config-edge {
  & /deep/ .el-collapse-item__content {
    padding: 16px 8px;
  }
}
</style>
