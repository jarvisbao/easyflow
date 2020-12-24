<template>
  <div class="config-canvas">
    <el-form ref="form" :model="flow_info" label-width="100px" style="width: 100%;">
      <el-collapse v-model="activeNames">
        <el-collapse-item name="baseinfo">
          <template slot="title">
            流程属性配置
          </template>
          <el-form-item label="状态">
            <el-radio-group v-model="flow_info.status">
              <el-radio id="draft" label="draft">
                草稿
              </el-radio>
              <el-radio id="activate" label="activate">
                激活
              </el-radio>
              <el-radio class="suspend" label="suspend">
                中止
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="支持移动端">
            <el-switch id="support-mobile" v-model="flow_info.support_mobile" />
          </el-form-item>
          <el-form-item label="标题规则">
            <el-radio-group v-model="condition_type">
              <el-radio id="simple-title" label="simple">
                自定义
              </el-radio>
              <el-radio id="complex-title" label="complex">
                接口API
              </el-radio>
            </el-radio-group>
            <template>
              <fieldset v-if="condition_type === 'simple'" class="code-fieldset">
                <legend>
                  <span>标题规则 <i id="set-rule" class="el-icon-edit edit_code" @click="setRule" /></span>
                </legend>
                <div v-if="flowTitleRule" class="code-box">
                  {{ flowTitleRule }}
                </div>
              </fieldset>
              <div v-if="condition_type === 'complex'">
                <el-form-item label="服务" label-width="55px" style="margin-bottom: 10px;">
                  <el-input v-model="titleApi.cls" @change="handleTitleRule" />
                </el-form-item>
                <el-form-item label="方法" label-width="55px">
                  <el-input v-model="titleApi.fun" @change="handleTitleRule" />
                </el-form-item>
              </div>
            </template>
          </el-form-item>
        </el-collapse-item>
        <el-collapse-item name="buttons">
          <template slot="title">
            实例详情按钮
          </template>
          <flow-buttons :modeler="modeler" :bpmn-elements="rootElements" :buttons="flow_buttons" :is-node="false" :title="dialogTitle" />
        </el-collapse-item>
        <el-collapse-item name="form">
          <template slot="title">
            全局表单设置
          </template>
          <div>
            <el-form-item label="业务对象">
              <div v-show="flow_obj.length > 0" class="assign-list">
                <span v-for="(item, index) in flow_obj" :key="index">
                  {{ item.proj_name }} - {{ item.object_name }}
                  <i :id="'assign-remove_' + index" class="el-icon-close" @click="remove(item)" />
                </span>
              </div>
              <el-select id="flow-obj" v-model="proj" filterable value-key="proj_code" placeholder="请选择项目" @change="changeProj">
                <el-option
                  v-for="item in projItems"
                  :key="item.proj_code"
                  :label="item.proj_name"
                  :value="item"
                />
              </el-select>
              <el-select
                id="obj-list"
                v-model="obj_code"
                v-loadmore="loadMore"
                :loading="searchLoading"
                :disabled="isDisable"
                multiple
                filterable
                value-key="object_code"
                placeholder="请选择业务对象"
                style="margin-top: 10px;"
                @visible-change="visibleChange">
                <el-option
                  v-for="item in objItems"
                  :key="item.object_code"
                  :label="item.object_name"
                  :value="{ object_name: item.object_name, object_code: item.object_code, object_id: item.object_id, proj_code: item.proj_code, biz_code: item.biz_code }"
                />
              </el-select>
            </el-form-item>
            <flow-form :modeler="modeler" :bpmn-elements="rootElements" :display-form="flow_form" :label="form_label" />
            <url-module-form :modeler="modeler" :bpmn-elements="rootElements" :url-module-form="url_module_flow" />
          </div>
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
              <div v-if="jsonVar" class="code-box">
                {{ jsonVar }}
              </div>
            </fieldset>
          </div>
        </el-collapse-item>
        <el-collapse-item name="observer">
          <template slot="title">
            观察者配置
          </template>
          <div>
            <observer :modeler="modeler" :bpmn-elements="rootElements" :observer="observer" />
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-form>
    <el-dialog v-if="dialogVisible" :visible.sync="dialogVisible" :close-on-click-modal="false" append-to-body title="标题规则设置">
      <python-codemirror :prop_code="flowTitleRule" :placeholder="code_placeholder" :code-mode="mode" param-code="titleRule" @get_code="get_code($event)" />
      <span slot="footer" class="dialog-footer">
        <el-button id="cancel" @click="dialogVisible = false">取 消</el-button>
        <el-button id="confirm" type="primary" @click="confirm">确 定</el-button>
      </span>
    </el-dialog>
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
import { getExtension } from '@/utils'
import { getBtnList } from '@/utils/setButtonXml'
import { setJsonVar } from '@/utils/setJsonVarXml'
import flowButtons from './buttons'
import flowForm from './form'
import urlModuleForm from './form/urlModuleForm'
import pythonCodemirror from '@/components/pythonCodemirror'
import jsonEditor from '@/components/jsonEditor'

export default {
  components: {
    flowButtons,
    flowForm,
    urlModuleForm,
    pythonCodemirror,
    jsonEditor,
    observer: () => import('./setObserver')
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
    flowDefaultBtns: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      activeNames: ['baseinfo', 'buttons', 'form', 'variate', 'observer'],
      dialogTitle: '流程实例按钮设置',
      proj: null,
      flow_obj: [],
      obj_code: [],
      form_label: '实例详情表单',
      method_list: [],
      methods: [],
      flowTitleRule: null,
      buttonsList: [],
      condition_type: null,
      dialogVisible: false,
      mode: 'python',
      code_placeholder: '',
      jsonVar: null,
      Variable: {},
      dialogVariable: false,
      objItems: [],
      projItems: [],
      isDisable: true,
      page_size: 10,
      pagination: {
        total: 10,
        page: 1
      },
      pageCount: 1,
      searchLoading: false,
      dialogObserver: false,
      observer: [],
      titleApi: {
        cls: null,
        fun: null
      }
    }
  },
  computed: {
    ...mapGetters([
      'flow_info',
      'flow_buttons',
      'obj_list',
      'flow_form',
      'titleRule',
      'url_module_flow'
    ])
  },
  watch: {
    titleRule: {
      handler(val) {
        if (Array.isArray(val)) {
          this.titleApi.cls = val[0]
          this.titleApi.fun = val[1]
        } else {
          this.flowTitleRule = val
        }
      }
    },
    flowDefaultBtns: {
      handler(val) {
        // 流程按钮
        const buttonElement = getExtension(this.rootElements.businessObject, 'enfo:FlowInstanceBtnList')
        if (buttonElement) {
          getBtnList(buttonElement, false)
        }
      }
    }
  },
  created() {
    // 业务对象列表
    this.$Apis.project.project_list().then(response => {
      if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
        this.projItems = response.payload.items
      }
    })
    // 流程标题规则
    const titleRule = getExtension(this.rootElements.businessObject, 'enfo:FlowTitleRule')
    if (titleRule) {
      if (titleRule.$attrs.text) {
        this.condition_type = 'simple'
        this.flowTitleRule = this.titleRule
      } else {
        this.condition_type = 'complex'
        this.titleApi.cls = titleRule.cls
        this.titleApi.fun = titleRule.fun
      }
    }

    this.flow_obj = this.obj_list
    if (this.obj_list.length > 0) {
      this.getMethod(this.obj_list)
    }

    // js变量
    const jsonVariate = getExtension(this.rootElements.businessObject, 'enfo:Variable')
    if (jsonVariate) {
      this.jsonVar = jsonVariate.jsonVar
    }
    // 观察者
    const observerEle = getExtension(this.rootElements.businessObject, 'enfo:Observer')
    if (observerEle) {
      const _result = this.rootElements.businessObject.extensionElements.values.filter(item => {
        return item.$type === 'enfo:Observer'
      })
      _result.forEach(item => {
        const observer = item.observer.split('.')
        const fun = observer[observer.length - 1]
        const cls = observer.splice(0, observer.length - 1).join('.')
        this.observer.push({
          cls: cls,
          fun: fun,
          event: {
            name: item.$attrs.eventName,
            value: item.$attrs.eventVal
          },
          node: {
            id: item.$attrs.nodeId ? item.$attrs.nodeId : null,
            label: item.$attrs.nodeName ? item.$attrs.nodeName : null
          }
        })
      })
    }
  },
  methods: {
    changeProj(val) {
      this.isDisable = false
      this.obj_code = []
      this.pagination.page = 1
      this.objItems = []
      this.getList()
    },
    loadMore() {
      this.pagination.page++
      if (this.pagination.page <= this.pageCount) {
        this.getList()
      }
    },
    getList() {
      this.$Apis.object.object_list(this.proj.proj_code, null, this.pagination.page, this.page_size, true).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.objItems = [...this.objItems, ...response.payload.items]
          this.pageCount = response.payload.pagination.pages // 总页数
          this.searchLoading = false
        }
      })
    },
    visibleChange(val) {
      if (!val) {
        const _result = []
        this.obj_code.forEach(item => {
          _result.push({
            proj_name: this.proj.proj_name,
            ...item
          })
        })

        const arr1Ids = _result.map(item => item.object_code)
        this.flow_obj = this.flow_obj.filter(item => !arr1Ids.includes(item.object_code))
        this.flow_obj.push(..._result)

        const moddle = this.modeler.get('moddle')
        const businessObject = this.rootElements.businessObject
        let analysis = getExtension(businessObject, 'enfo:Object')
        let quoteObject = null

        if (!analysis) {
          analysis = moddle.create('enfo:Object')
          businessObject.extensionElements = businessObject.extensionElements || moddle.create('bpmn:ExtensionElements')
          businessObject.extensionElements.get('values').push(analysis)
        }

        analysis.quote_objects = []
        this.flow_obj.forEach(item => {
          quoteObject = moddle.create('enfo:QuoteObject', {
            text: item.object_code,
            name: item.object_name,
            object_id: item.object_id,
            proj_code: item.proj_code,
            proj_name: item.proj_name,
            biz_code: item.biz_code
          })
          analysis.quote_objects.push(quoteObject)
        })
        if (this.flow_obj.length < 1) {
          const values = this.rootElements.businessObject.extensionElements.values
          values.forEach((item, index) => {
            if (item.$type === 'enfo:Object') {
              values.splice(index, 1)
            }
          })
          if (values.length < 1) {
            delete this.rootElements.businessObject.extensionElements
          }
        }
        this.$store.commit('SET_OBJ_LIST', this.flow_obj)
        this.getMethod(this.flow_obj)
        if (this.obj_code.length > 0) {
          this.$nextTick(() => {
            this.proj = null
            this.obj_code = []
            this.isDisable = true
          })
        }
        
      }
    },
    remove(val) {
      const businessObject = this.rootElements.businessObject
      const objElement = getExtension(businessObject, 'enfo:Object')
      if (objElement) {
        const values = this.rootElements.businessObject.extensionElements.values
        objElement.quote_objects.forEach((item, index) => {
          if (item.text === val.object_code) {
            objElement.quote_objects.splice(index, 1)
          }
        })

        // remove bpmn:Process 下的 enfo:Object
        if (objElement.display_forms) {
          if (objElement.quote_objects.length < 1 && objElement.display_forms.length < 1) {
            values.forEach((item, index) => {
              if (item.$type === 'enfo:Object') {
                values.splice(index, 1)
              }
            })
          }
        } else if (objElement.quote_objects.length < 1) {
          values.forEach((item, index) => {
            if (item.$type === 'enfo:Object') {
              values.splice(index, 1)
            }
          })
        }

        // remove extensionElements
        if (values.length < 1) {
          delete this.rootElements.businessObject.extensionElements
        }
      }
      this.flow_obj.forEach((item, index) => {
        if (item.object_code === val.object_code) {
          this.flow_obj.splice(index, 1)
        }
      })
      this.$store.commit('SET_OBJ_LIST', this.flow_obj)
      this.getMethod(this.flow_obj)
    },
    getMethod(obj_list) {
      // 定义表单选择列表
      this.method_list = []
      obj_list.forEach(element => {
        this.$Apis.object.method_list_by_id(element.object_id).then(response => {
          if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
            this.methods = response.payload.items
            this.methods.forEach(item => {
              if (item.operate_type === 3) {
                this.method_list.push({
                  mtd_name: element.proj_name + ' - ' + element.object_name + ' - ' + item.operate_name,
                  mtd_id: item.mtd_id,
                  ...element
                })
              }
            })
          }
          this.method_list.push({
            mtd_name: element.proj_name + ' - ' + element.object_name + ' - 默认表单',
            mtd_id: element.object_code + '-default',
            ...element
          })
          // if (this.methods.length < 1) {
          //   this.method_list.push({
          //     mtd_name: element.proj_name + ' - ' + element.object_name + ' - 默认表单',
          //     mtd_id: element.object_code + '-default',
          //     ...element
          //   })
          // }
        })
      })
      this.$store.commit('SET_METHOD_LIST', this.method_list)
    },
    setTitleRule(val) {
      const moddle = this.modeler.get('moddle')
      const businessObject = this.rootElements.businessObject
      let analysis = getExtension(businessObject, 'enfo:FlowTitleRule')
      if (val || val.length > 0) {
        if (!analysis) {
          if (this.condition_type === 'simple') {
            const code = `<![CDATA[${val}]]>`
            analysis = moddle.create('enfo:FlowTitleRule', { text: encodeURI(code) })
          } else {
            analysis = moddle.create('enfo:FlowTitleRule', { cls: val[0], fun: val[1] })
          }
          businessObject.extensionElements = businessObject.extensionElements || moddle.create('bpmn:ExtensionElements')
          businessObject.extensionElements.get('values').push(analysis)
        } else {
          if (this.condition_type === 'simple') {
            analysis.text = encodeURI(`<![CDATA[${val}]]>`)
          } else {
            analysis.cls = val[0]
            analysis.fun = val[1]
          }
        }
      }
      this.$store.commit('SET_TITLE_RULE', val)
    },
    get_code($event) {
      this.flowTitleRule = $event['titleRule']
    },
    setRule() {
      this.dialogVisible = !this.dialogVisible
    },
    confirm() {
      if (this.dialogVisible) {
        this.dialogVisible = !this.dialogVisible
        this.removeTitle()
        this.setTitleRule(this.flowTitleRule)
      } else {
        this.dialogVariable = !this.dialogVariable
        setJsonVar(this.jsonVar, this.modeler, this.rootElements)
      }
    },
    handleTitleRule() {
      this.removeTitle()
      if (this.titleApi.cls && this.titleApi.fun) {
        const _value = [this.titleApi.cls, this.titleApi.fun]
        this.setTitleRule(_value)
      }
    },
    removeTitle() {
      const analysis = getExtension(this.rootElements.businessObject, 'enfo:FlowTitleRule')
      if (analysis) {
        const values = this.rootElements.businessObject.extensionElements.values
        values.forEach((item, index) => {
          if (item.$type === 'enfo:FlowTitleRule') {
            values.splice(index, 1)
          }
        })
        if (values.length < 1) {
          this.rootElements.businessObject.extensionElements = undefined
        }
      }
    },
    // changeCondition(val) {
    //   if (val === 'simple') {
    //     if (!this.flowTitleRule || Array.isArray(this.flowTitleRule)) {
    //       this.flowTitleRule = ''
    //     }
    //   } else {
    //     this.flowTitleRule = this.titleRule
    //   }
    // },
    get_json_var(event) {
      if (event && event !== '{}') {
        this.jsonVar = event
      } else {
        this.jsonVariable = null
      }
    },
    setVariable() {
      this.dialogVariable = !this.dialogVariable
      if (this.jsonVar) {
        this.Variable = JSON.parse(this.jsonVar)
      } else {
        this.Variable = {}
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.config-canvas {
  & /deep/ .el-collapse-item__content {
    padding: 16px 8px 0;
  }
}
.assign-list {
  margin-bottom: 8px;
  line-height: 35px;
  span {
    display: inline-block;
    height: 24px;
    padding: 0 8px;
    margin-right: 8px;
    background-color: #f4f4f5;
    border: 1px solid #e9e9eb;
    border-radius: 4px;
    color: #909399;
    line-height: 22px;
    font-size: 12px;
    i {
      background: #c0c4cc;
      display: inline-block;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      text-align: center;
      line-height: 14px;
      font-size: 12px;
      cursor: pointer;
      &:hover {
        background: #909399;
        color: #fff;
      }
    }
  }
}
</style>
