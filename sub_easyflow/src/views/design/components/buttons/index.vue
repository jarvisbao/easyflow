<template>
  <div>
    <div class="action-btn">
      <el-button id="create-btn" type="danger" round size="small" @click="createButton">
        新建
      </el-button>
      <el-button id="init-btn" :loading="loading" round size="small" @click="initBtns">
        恢复默认按钮
      </el-button>
      <div class="tips" style="margin-left: 12px">
        拖动可改变按钮顺序
      </div>
    </div>
    <draggable v-loading="loading" :list="buttonsList" @end="handleMoveEnd" class="btn-box">
      <div v-for="(item, index) in buttonsList" :key="index">
        {{ item.name }}
        <i :id="'update_' + index" class="el-icon-edit update" @click="update(index, item)" />
        <i :id="'remove_' + index" class="el-icon-error remove" @click="remove(index, item)" />
      </div>
    </draggable>
    <el-dialog v-if="dialogVisible" :visible.sync="dialogVisible" :close-on-click-modal="false" :title="title" append-to-body top="8vh">
      <buttons-create v-if="dialogCreate" :is-node="isNode" :modeler="modeler" :bpmn-elements="bpmnElements" @show="isShow" />
      <buttons-update v-else :button-info="buttonInfo" :update-index="updateIndex" :buttons="buttonsList" @show="isShow" @updateButton="updateButton" />
    </el-dialog>
  </div>
</template>
<script>
import draggable from 'vuedraggable'
import { getExtension } from '@/utils'
import { setButton, getBtnList } from '@/utils/setButtonXml'
import buttonsCreate from './buttonsCreate'
import buttonsUpdate from './buttonsUpdate'

export default {
  components: {
    draggable,
    buttonsCreate,
    buttonsUpdate
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
    buttons: {
      type: Array,
      default: () => []
    },
    isNode: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      dialogCreate: false,
      buttonInfo: {},
      updateIndex: 0,
      buttonsElement: [],
      buttonsList: this.buttons
    }
  },
  watch: {
    buttons: {
      handler(val) {
        this.buttonsList = val
      }
    }
  },
  methods: {
    createButton() {
      this.dialogVisible = !this.dialogVisible
      this.dialogCreate = true
    },
    update(index, row) {
      this.buttonInfo = row
      this.updateIndex = index
      this.dialogVisible = !this.dialogVisible
      this.dialogCreate = false
    },
    remove(index, row) {
      this.$confirm('确定删除所选按钮?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'confirm-button',
        cancelButtonClass: 'cancel-button'
      }).then(() => {
        this.buttonsList.splice(index, 1)
        // 获取bpmn中的按钮
        if (this.bpmnElements.type === 'bpmn:Process') {
          this.buttonsElement = getExtension(this.bpmnElements.businessObject, 'enfo:FlowInstanceBtnList')
        } else {
          this.buttonsElement = getExtension(this.bpmnElements.businessObject, 'enfo:NodeInstanceBtnList')
        }
        const buttonsElement = this.buttonsElement.buttons
        const values = this.bpmnElements.businessObject.extensionElements.values

        buttonsElement.splice(index, 1)
        if (buttonsElement.length < 1) {
          if (this.bpmnElements.type === 'bpmn:Process') {
            values.forEach((item, index) => {
              if (item.$type === 'enfo:FlowInstanceBtnList') {
                values.splice(index, 1)
              }
            })
          } else {
            values.forEach((item, index) => {
              if (item.$type === 'enfo:NodeInstanceBtnList') {
                values.splice(index, 1)
              }
            })
          }
        }
        if (values.length < 1) {
          delete this.bpmnElements.businessObject.extensionElements
        }
      }).catch(() => {
      })
    },
    isShow() {
      this.dialogVisible = !this.dialogVisible
    },
    updateButton(events) {
      if (this.bpmnElements.type === 'bpmn:Process') {
        this.buttonsElement = getExtension(this.bpmnElements.businessObject, 'enfo:FlowInstanceBtnList')
      } else {
        this.buttonsElement = getExtension(this.bpmnElements.businessObject, 'enfo:NodeInstanceBtnList')
      }
      const buttonsElement = this.buttonsElement.buttons

      const moddle = this.modeler.get('moddle')
      if (events.prep_script) {
        const jsElements = moddle.create('enfo:JavaScript', { text: encodeURI(`<![CDATA[${events.prep_script}]]>`) })
        buttonsElement[this.updateIndex].prep_script = [jsElements]
      } else {
        delete buttonsElement[this.updateIndex].prep_script
      }
      if (events.allow_cls && events.allow_fun) {
        const pythonElements = moddle.create('enfo:AllowScript', { cls: events.allow_cls, fun: events.allow_fun })
        buttonsElement[this.updateIndex].allow_script = [pythonElements]
      } else {
        delete buttonsElement[this.updateIndex].allow_script
      }
      if (events.submit_cls && events.submit_fun) {
        const submitElements = moddle.create('enfo:SubmitScript', { cls: events.submit_cls, fun: events.submit_fun })
        buttonsElement[this.updateIndex].submit_script = [submitElements]
      } else {
        delete buttonsElement[this.updateIndex].submit_script
      }
      if (events.object && events.object.length > 0) {
        const object = moddle.create('enfo:Object')
        buttonsElement[this.updateIndex].object = [object]
        let editForm = null
        object.edit_forms = []
        events.object.forEach(item => {
          editForm = moddle.create('enfo:EditForm', { text: item.mtd_id, owner: item.object_code, proj_code: item.proj_code })
          object.edit_forms.push(editForm)
        })
      } else {
        delete buttonsElement[this.updateIndex].edit_forms
      }
      if (events.url) {
        const urlEle = moddle.create('enfo:UrlForm', { url: events.url })
        buttonsElement[this.updateIndex].url_form = [urlEle]
      } else {
        delete buttonsElement[this.updateIndex].url_form
      }
      if (events.model_forms && events.model_forms.length > 0) {
        buttonsElement[this.updateIndex].module_form = []
        let moduleEle = null
        events.model_forms.forEach(item => {
          moduleEle = moddle.create('enfo:ModuleForm', { module_name: item })
          buttonsElement[this.updateIndex].module_form.push(moduleEle)
        })
      } else {
        delete buttonsElement[this.updateIndex].module_form
      }
      Object.keys(buttonsElement[this.updateIndex]).forEach(item => {
        if (item === 'name' || item === 'action') {
          Object.keys(events).forEach(key => {
            if (item === key) {
              buttonsElement[this.updateIndex][item] = events[key]
            }
          })
        }
      })
    },
    handleMoveEnd(evt) {
      // 拖动后重新排序
      const oldIndex = evt.oldIndex
      const newIndex = evt.newIndex
      if (this.bpmnElements.type === 'bpmn:Process') {
        this.buttonsElement = getExtension(this.bpmnElements.businessObject, 'enfo:FlowInstanceBtnList')
      } else {
        this.buttonsElement = getExtension(this.bpmnElements.businessObject, 'enfo:NodeInstanceBtnList')
      }
      const buttonsElement = this.buttonsElement.buttons
      const bpmnDownData = buttonsElement[oldIndex]
      buttonsElement.splice(oldIndex, 1)
      buttonsElement.splice(newIndex, 0, bpmnDownData)
    },
    initBtns() {
      this.loading = true
      this.$Apis.flow.buttons_default().then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          const items = response.payload
          const flowDefaultBtns = items.filter(item => {
            return item.belong === 'process'
          })
          const nodeDefaultBtns = items.filter(item => {
            return item.belong === 'user_task'
          })
          if (this.bpmnElements.type === 'bpmn:Process') {
            this.buttonsElement = getExtension(this.bpmnElements.businessObject, 'enfo:FlowInstanceBtnList')
            this.defaultBtn(flowDefaultBtns, this.buttonsElement, this.bpmnElements, 'enfo:FlowInstanceBtnList')
          } else {
            this.buttonsElement = getExtension(this.bpmnElements.businessObject, 'enfo:NodeInstanceBtnList')
            this.defaultBtn(nodeDefaultBtns, this.buttonsElement, this.bpmnElements, 'enfo:NodeInstanceBtnList')
          }
          this.loading = false
        } else {
          this.$alert(response.message, '提示', {
            confirmButtonText: '确定',
            callback: action => {
              this.loading = false
            }
          })
        }
      })
    },
    defaultBtn(defaultBtnList, buttonsElement, bpmnElements, btnType) {
      const buttonsList = JSON.parse(JSON.stringify(this.buttonsList))
      defaultBtnList.forEach(element => {
        this.buttonsList.forEach((item, index) => {
          if (element.action === item.action) {
            this.buttonsList.splice(index, 1)
          }
        })
      })
      if (buttonsElement) {
        const values = bpmnElements.businessObject.extensionElements.values
        values.forEach((item, index) => {
          if (item.$type === btnType) {
            values.splice(index, 1)
          }
        })
      }
      this.buttonsList = defaultBtnList.concat(this.buttonsList)
      this.buttonsList.forEach(item => {
        item.allow_cls = item.allow_script[0] || null
        item.allow_fun = item.allow_script[1] || null
        item.submit_cls = item.submit_script[0] || null
        item.submit_fun = item.submit_script[1] || null
        setButton(item, this.modeler, this.bpmnElements, this.isNode)
      })
      let btnElements = null
      if (this.isNode) {
        btnElements = getExtension(this.bpmnElements.businessObject, 'enfo:NodeInstanceBtnList')
      } else {
        btnElements = getExtension(this.bpmnElements.businessObject, 'enfo:FlowInstanceBtnList')
      }
      if (buttonsElement) {
        getBtnList(btnElements, this.isNode)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.btn-box {
  display: flex;
  flex-wrap: wrap;
  div {
    margin: 0 12px 15px;
    padding: 6px 15px;
    color: #409eff;
    background: #ecf5ff;
    border: 1px solid #b3d8ff;
    border-radius: 4px;
    cursor: move;
    position: relative;
    .update {
      margin-left: 5px;
      color: #969494;
      font-size: 16px;
      cursor: pointer;
      &:hover {
        color: #525252;
      }
    }
    .remove {
      position: absolute;
      right: -6px;
      top: -8px;
      color: #716d6d;
      font-size: 16px;
      cursor: pointer;
    }
  }
}
</style>
