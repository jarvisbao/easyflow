<template>
  <el-form ref="form" :model="urlModule" label-width="100px" style="width: 100%">
    <el-form-item label="url表单">
      <el-input id="url-form" v-model="urlModule.url" clearable @change="changeUrl" />
    </el-form-item>
    <el-form-item label="vue模块表单">
      <el-select id="module-form" v-model="urlModule.module" multiple filterable placeholder="请选择" @change="moduleChange">
        <el-option v-for="item in module_list" :key="item.name" :value="item.name" :label="item.label">
          <span style="float: left">{{ item.label }}</span>
          <span style="float: right; color: #8492a6; font-size: 13px">{{ item.name }}</span>
        </el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>
<script>
import { getExtension } from '@/utils'
import moduleForm from '@/components/moduleForm/index'

export default {
  props: {
    modeler: {
      type: Object,
      default: () => {}
    },
    bpmnElements: {
      type: Object,
      default: () => {}
    },
    urlModuleForm: {
      type: Object,
      default: () => {}
    },
    isEmptyStart: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      urlModule: {
        url: null,
        module: []
      },
      module_list: moduleForm
    }
  },
  watch: {
    urlModuleForm: {
      handler(val) {
        this.urlModule = val
      }
    }
  },
  created() {
    this.urlModule = this.urlModuleForm
    if (this.bpmnElements.type === 'bpmn:Process') {
      this.urlModule = this.urlModuleForm
    }
  },
  methods: {
    changeUrl(val) {
      const moddle = this.modeler.get('moddle')
      const businessObject = this.bpmnElements.businessObject
      let analysis = null

      if (this.isEmptyStart) {
        analysis = getExtension(businessObject, 'enfo:NoneEventDefinition')
        if (!analysis) {
          if (val) {
            analysis = getExtension(businessObject, 'enfo:NoneEventDefinition')
            businessObject.extensionElements = businessObject.extensionElements || moddle.create('bpmn:ExtensionElements')
            businessObject.extensionElements.get('values').push(analysis)
            analysis.url_form = [moddle.create('enfo:UrlForm', { url: val })]
          }
        } else {
          analysis.url_form = [moddle.create('enfo:UrlForm', { url: val })]
        }
      } else {
        analysis = getExtension(businessObject, 'enfo:UrlForm')
      
        if (!analysis) {
          if (val) {
            analysis = moddle.create('enfo:UrlForm', { url: val })
            businessObject.extensionElements = businessObject.extensionElements || moddle.create('bpmn:ExtensionElements')
            businessObject.extensionElements.get('values').push(analysis)
          }
        } else {
          analysis.url = val
          if (!val) {
            const values = businessObject.extensionElements.values
            values.forEach((item, index) => {
              if (item.$type === 'enfo:UrlForm') {
                values.splice(index, 1)
              }
            })
            if (values.length < 1) {
              businessObject.extensionElements = undefined
            }
          }
        }
      }
    },
    moduleChange(val) {
      const moddle = this.modeler.get('moddle')
      const businessObject = this.bpmnElements.businessObject
      businessObject.extensionElements = businessObject.extensionElements || moddle.create('bpmn:ExtensionElements')
      const values = businessObject.extensionElements.get('values')
      if (this.isEmptyStart) {
        this.$nextTick(() => {
          const analysis = getExtension(businessObject, 'enfo:NoneEventDefinition')
          if (!analysis) {
            businessObject.extensionElements.get('values').push(analysis)
          }
          analysis.module_form = []
          val.forEach(item => {
            const moduleForm = moddle.create('enfo:ModuleForm', { module_name: item })
            analysis.module_form.push(moduleForm)
          })
        })
      } else {
        if (values) {
          for (let i = values.length - 1; i >= 0; i--) {
            if (values[i].$type === 'enfo:ModuleForm') {
              values.splice(i, 1)
            }
          }
        }
        this.$nextTick(() => {
          val.forEach(item => {
            const analysis = moddle.create('enfo:ModuleForm', { module_name: item })
            businessObject.extensionElements.get('values').push(analysis)
          })
        })
      }
    }
  }
}
</script>
