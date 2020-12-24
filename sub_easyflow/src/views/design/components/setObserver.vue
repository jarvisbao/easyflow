<template>
  <div class="observer">
    <div class="action-btn">
      <el-button id="create-btn" type="danger" round size="small" @click="createObserver">
        新建
      </el-button>
    </div>
    <el-table
      :data="observerData"
      tooltip-effect="dark"
      style="width: 100%">
      <el-table-column show-overflow-tooltip label="服务接口">
        <template slot-scope="scope">
          {{ scope.row.cls }}.{{ scope.row.fun }}
        </template>
      </el-table-column>
      <el-table-column prop="event" label="执行时机">
        <template slot-scope="scope">
          {{ scope.row.event.name }}
        </template>
      </el-table-column>
      <el-table-column label="执行节点">
        <template slot-scope="scope">
          <span v-if="scope.row.node">{{ scope.row.node.label}}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" align="right">
        <template slot-scope="scope">
          <i id="edit" class="el-icon-edit" @click="update(scope.row, scope.$index)" />
          <i id="remove" class="el-icon-delete" @click="remove(scope.row, scope.$index)" />
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-if="dialogVisible" :visible.sync="dialogVisible" :close-on-click-modal="false" append-to-body title="观察者设置">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="服务" prop="cls">
          <el-input v-model="form.cls" />
        </el-form-item>
        <el-form-item label="方法" prop="fun">
          <el-input v-model="form.fun" />
        </el-form-item>
        <el-form-item label="执行时机" prop="event">
          <el-select id="event" v-model="form.event" value-key="value" @change="handleChange">
            <el-option v-for="(item, index) in the_observer" :key="index" :label="item.name" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="show" label="执行节点" prop="node">
          <el-select id="node" v-model="form.node" value-key="id">
            <el-option v-for="(item, index) in nodeOptions" :key="index" :label="item.name" :value="{id: item.id, label: item.name}" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button id="confirm" :loading="loading" type="danger" @click="submitForm('form')">
            {{ isUpdate ? '立即修改' : '立即创建'}}
          </el-button>
          <el-button id="cancel" plain @click="resetForm">
            取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
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
    observer: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      observerData: [],
      loading: false,
      form: {
        cls: null,
        fun: null,
        event: null,
        node: null
      },
      rules: {
        cls: { required: true, message: '请填写服务名称', trigger: 'blur' },
        fun: { required: true, message: '请填写服务名对应的方法', trigger: 'blur' },
        event: { required: true, message: '请选择执行时机', trigger: 'change' },
        node: { required: true, message: '请选择执行节点', trigger: 'change' }
      },
      show: true,
      the_observer: [],
      nodeOptions: [
        {
          id: '*',
          name: '所有节点'
        }
      ],
      dialogVisible: false,
      isUpdate: false,
      upIndex: 0
    }
  },
  created() {
    // 观察者执行时机
    this.$Apis.flow.the_observed().then(response => {
      if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
        this.the_observer = response.payload
      }
    })
    if (this.observer.length > 0) {
      this.observerData = this.observer
    }
  },
  mounted() {
    // 获取除网关和连线之外的节点
    const flowElements = this.modeler._definitions.rootElements[0].flowElements
    if (flowElements) {
      flowElements.forEach(item => {
        if (item.$type !== 'bpmn:SequenceFlow' && item.$type.indexOf('Gateway') === -1) {
          this.nodeOptions.push({
            id: item.id,
            name: item.name
          })
        }
      })
    }
  },
  methods: {
    update(row, index) {
      this.dialogVisible = !this.dialogVisible
      this.isUpdate = true
      this.upIndex = index
      this.form = row
    },
    remove(row, index) {
      this.observerData.splice(index, 1)
      this.setObserver()
    },
    handleChange(val) {
      if (val.value === 'process_create') {
        this.show = false
        this.form.node = null
      } else {
        this.show = true
      }
    },
    createObserver() {
      this.dialogVisible = !this.dialogVisible
      this.form = {}
    },
    submitForm(formName) {
      this.loading = true
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.setTableData()
          this.resetForm()
          this.loading = false
        } else {
          this.loading = false
          return false
        }
      })
    },
    resetForm() {
      this.dialogVisible = !this.dialogVisible
    },
    setTableData() {
      if (this.isUpdate) {
        this.observerData[this.upIndex] = this.form
      } else {
        this.observerData.push(this.form)
      }
      this.setObserver()
    },
    setObserver() {
      const moddle = this.modeler.get('moddle')
      const businessObject = this.bpmnElements.businessObject
      businessObject.extensionElements = businessObject.extensionElements || moddle.create('bpmn:ExtensionElements')
      const values = this.bpmnElements.businessObject.extensionElements.values
      if (values) {
        this.bpmnElements.businessObject.extensionElements.values = values.filter(item => {
          return item.$type !== 'enfo:Observer'
        })
      }

      this.$nextTick(() => {
        this.observerData.forEach(item => {
          const observer = item.cls + '.' + item.fun
          let the_observer = null
          let params = null
          if (item.event.value.indexOf('@') !== -1) {
            const _re = item.event.value.split('@')[0]
            the_observer = _re + '@' + item.node.id
            params = {
              eventVal: item.event.value,
              eventName: item.event.name,
              nodeId: item.node ? item.node.id : null,
              nodeName: item.node ? item.node.label : null
            }
          } else {
            the_observer = item.event.value
            params = {
              eventVal: item.event.value,
              eventName: item.event.name
            }
          }

          const analysis = moddle.create('enfo:Observer', {
            observer: observer,
            the_observer: the_observer,
            ...params
          })
          businessObject.extensionElements.get('values').push(analysis)
        })
      })
    }
  }
}
</script>
