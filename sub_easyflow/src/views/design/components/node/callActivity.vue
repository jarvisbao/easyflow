<template>
  <div>
    <el-form-item label="命名空间">
      <el-input v-model="called.element" placeholder="请填写流程的命名空间" @change="changeName" />
    </el-form-item>
    <el-form-item label="流程绑定" placeholder="请选择流程绑定方式">
      <el-select v-model="called.binding" @change="changeBind">
        <el-option value="latest" label="最新版本" />
        <el-option value="deployment" label="部署版本" />
        <el-option value="version" label="指定版本" />
      </el-select>
    </el-form-item>
    <el-form-item v-if="called.binding == 'version'" label="版本号">
      <el-input v-model="called.version" placeholder="请输入版本号" @change="changeVersion" />
    </el-form-item>
  </div>
</template>
<script>
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
    calledActivity: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      called: {
        element: null,
        binding: null,
        version: null
      }
    }
  },
  watch: {
    calledActivity: {
      handler(val) {
        this.called = val
      }
    }
  },
  created() {
    this.called = this.calledActivity
  },
  methods: {
    setCalledElement(props) {
      this.modeler.get('modeling').updateProperties(this.bpmnElements, props)
    },
    changeName(val) {
      const _value = val ? val : undefined
      this.setCalledElement({ calledElement: _value })
    },
    changeBind(val) {
      this.setCalledElement({
        calledElement: this.called.element ? this.called.element : undefined,
        calledElementBinding: val,
        calledElementVersion: undefined
      })
    },
    changeVersion(val) {
      this.setCalledElement({
        calledElement: this.called.element ? this.called.element : undefined,
        calledElementBinding: this.called.binding,
        calledElementVersion: val
      })
    }
  }
}
</script>
