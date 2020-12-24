<template>
  <div>
    <el-form ref="form" :model="form" label-width="100px" style="width: 100%">
      <el-form-item label="编辑表单">
        <el-select id="edit-form" v-model="form.method" multiple filterable value-key="mtd_id" placeholder="请选择" @change="visibleChange" @remove-tag="remove">
          <el-option v-for="item in method_list" :key="item.mtd_id" :label="item.mtd_name" :value="item" />
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { getExtension } from '@/utils'

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
    editForm: {
      type: Array,
      default: () => []
    },
    isEmptyStart: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: {
        method: []
      }
    }
  },
  computed: {
    ...mapGetters([
      'method_list'
    ])
  },
  watch: {
    editForm: {
      handler(val) {
        this.form.method = this.editForm
      }
    }
  },
  created() {
    if (this.editForm) {
      this.form.method = this.editForm
    }
  },
  methods: {
    visibleChange(val) {
      const moddle = this.modeler.get('moddle')
      const businessObject = this.bpmnElements.businessObject
      let analysis = null
      let editForm = null

      // 如果是空开始节点
      if (this.isEmptyStart) {
        analysis = getExtension(businessObject, 'enfo:NoneEventDefinition')
        if (!analysis) {
          analysis = moddle.create('enfo:NoneEventDefinition')
          businessObject.extensionElements = businessObject.extensionElements || moddle.create('bpmn:ExtensionElements')
          businessObject.extensionElements.get('values').push(analysis)
        }
        analysis.object = analysis.object || [moddle.create('enfo:Object')]
        analysis.object[0].edit_forms = []
        val.forEach(item => {
          editForm = moddle.create('enfo:EditForm', { text: item.mtd_id, owner: item.object_code, proj_code: item.proj_code })
          analysis.object[0].edit_forms.push(editForm)
        })


      } else {
        analysis = getExtension(businessObject, 'enfo:Object')
        if (!analysis) {
          analysis = moddle.create('enfo:Object')
          businessObject.extensionElements = businessObject.extensionElements || moddle.create('bpmn:ExtensionElements')
          businessObject.extensionElements.get('values').push(analysis)
        }

        analysis.edit_forms = []
        val.forEach(item => {
          editForm = moddle.create('enfo:EditForm', { text: item.mtd_id, owner: item.object_code, proj_code: item.proj_code })
          analysis.edit_forms.push(editForm)
        })
      }
    },
    remove(val) {
      const businessObject = this.bpmnElements.businessObject
      let userObject = null
      const values = this.bpmnElements.businessObject.extensionElements.values

      if (this.isEmptyStart) {
        userObject = getExtension(businessObject, 'enfo:NoneEventDefinition')
        if (userObject.object) {
          userObject.object.forEach(element => {
            if (element.display_forms) {
              if (element.display_forms.length < 1 && element.edit_forms.length < 1) {
                userObject.object = undefined
              }
            } else if (element.edit_forms.length < 1) {
              userObject.object = undefined
            }
          })
        }
      } else {
        // remove enfo:Object
        userObject = getExtension(businessObject, 'enfo:Object')
        if (userObject.display_forms) {
          if (userObject.edit_forms.length < 1 && userObject.display_forms.length < 1) {
            values.forEach((item, index) => {
              if (item.$type === 'enfo:Object') {
                values.splice(index, 1)
              }
            })
          }
        } else if (userObject.edit_forms.length < 1) {
          values.forEach((item, index) => {
            if (item.$type === 'enfo:Object') {
              values.splice(index, 1)
            }
          })
        }
      }

      if (values.length < 1) {
        delete this.bpmnElements.businessObject.extensionElements
      }
    }
  }
}
</script>
