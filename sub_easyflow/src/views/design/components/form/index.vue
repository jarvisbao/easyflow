<template>
  <div>
    <el-form ref="form" :model="form" label-width="100px" style="width: 100%">
      <el-form-item :label="label">
        <el-select id="display-form" v-model="form.method" multiple filterable value-key="mtd_id" placeholder="请选择" @change="visibleChange" @remove-tag="remove">
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
    displayForm: {
      type: Array,
      default: () => []
    },
    label: {
      type: String,
      default: ''
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
      'flow_form',
      'display_form',
      'method_list'
    ])
  },
  watch: {
    flow_form: {
      handler(val) {}
    },
    display_form: {
      handler(val) {
        this.form.method = this.displayForm
      }
    }
  },
  created() {
    if (this.displayForm) {
      this.form.method = this.displayForm
    }
  },
  methods: {
    remove(val) {
      const businessObject = this.bpmnElements.businessObject
      let objElement = null
      const values = this.bpmnElements.businessObject.extensionElements.values
      const flow_form = this.form.method

      if (this.isEmptyStart) {
        objElement = getExtension(businessObject, 'enfo:NoneEventDefinition')
        if (objElement.object) {
          objElement.object.forEach(element => {
            if (element.edit_forms) {
              if (element.display_forms.length < 1 && element.edit_forms.length < 1) {
                objElement.object = undefined
              }
            } else if (element.display_forms.length < 1) {
              objElement.object = undefined
            }
          })
        }
        this.$store.commit('SET_DISPLAY_FORM', flow_form)
      } else {
        objElement = getExtension(businessObject, 'enfo:Object')
        if (this.bpmnElements.type === 'bpmn:Process') {
          // remove bpmn:Process 下的 enfo:Object
          if (objElement.display_forms.length < 1 && objElement.quote_objects.length < 1) {
            values.forEach((item, index) => {
              if (item.$type === 'enfo:Object') {
                values.splice(index, 1)
              }
            })
          }
          this.$store.commit('SET_FLOW_FORM', flow_form)
        } else {
          // remove enfo:Object
          if (objElement.edit_forms) {
            if (objElement.display_forms.length < 1 && objElement.edit_forms.length < 1) {
              values.forEach((item, index) => {
                if (item.$type === 'enfo:Object') {
                  values.splice(index, 1)
                }
              })
            }
          } else if (objElement.display_forms.length < 1) {
            values.forEach((item, index) => {
              if (item.$type === 'enfo:Object') {
                values.splice(index, 1)
              }
            })
          }
          this.$store.commit('SET_DISPLAY_FORM', flow_form)
        }
      }
      // remove extensionElements
      if (values.length < 1) {
        delete this.bpmnElements.businessObject.extensionElements
      }
    },
    visibleChange(val) {
      const moddle = this.modeler.get('moddle')
      const businessObject = this.bpmnElements.businessObject
      let analysis = null
      let displayForm = null

      // 如果是空开始节点
      if (this.isEmptyStart) {
        analysis = getExtension(businessObject, 'enfo:NoneEventDefinition')
        if (!analysis) {
          analysis = moddle.create('enfo:NoneEventDefinition')
          businessObject.extensionElements = businessObject.extensionElements || moddle.create('bpmn:ExtensionElements')
          businessObject.extensionElements.get('values').push(analysis)
        }
        analysis.object = analysis.object || [moddle.create('enfo:Object')]
        analysis.object[0].display_forms = []
        val.forEach(item => {
          displayForm = moddle.create('enfo:DisplayForm', { text: item.mtd_id, owner: item.object_code, proj_code: item.proj_code })
          analysis.object[0].display_forms.push(displayForm)
        })


      } else {
        analysis = getExtension(businessObject, 'enfo:Object')
        if (!analysis) {
          analysis = moddle.create('enfo:Object')
          businessObject.extensionElements = businessObject.extensionElements || moddle.create('bpmn:ExtensionElements')
          businessObject.extensionElements.get('values').push(analysis)
        }

        analysis.display_forms = []
        val.forEach(item => {
          displayForm = moddle.create('enfo:DisplayForm', { text: item.mtd_id, owner: item.object_code, proj_code: item.proj_code })
          analysis.display_forms.push(displayForm)
        })
      }
      this.$store.commit('SET_FLOW_FORM', val)
    }
  }
}
</script>
