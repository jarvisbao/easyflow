<template>
  <div>
    <el-form ref="form" :model="flow" :rules="rules" label-width="120px">
      <el-form-item label="流程标题" prop="name">
        <el-input id="flow-name" v-model="flow.name" />
      </el-form-item>
      <el-form-item label="命名空间" prop="namespace">
        <el-input id="flow-namespace" v-model="flow.namespace" />
      </el-form-item>
      <el-form-item label="流程分类">
        <el-cascader id="flow-classify" v-model="flow.classify" :options="classifyTree" :props="defaultProps" style="width: 100%" />
      </el-form-item>
      <el-form-item label="流程描述">
        <el-input id="flow-desc" v-model="flow.description" :autosize="{ minRows: 2, maxRows: 5}" type="textarea" />
      </el-form-item>
      <el-form-item>
        <el-button id="confirm" :loading="loading" type="danger" @click="submitForm('form')">
          立即创建
        </el-button>
        <el-button id="cancel" plain @click="resetForm('form')">
          取消
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>

export default {
  props: {
    classifyTree: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      flow: {
        name: '',
        namespace: '',
        description: ''
      },
      rules: {
        name: { required: true, message: '请输入流程标题', trigger: 'blur' },
        namespace: { required: true, message: '请输入命名空间', trigger: 'blur' }
      },
      loading: false,
      defaultProps: {
        children: 'children',
        label: 'text',
        value: 'class_id',
        checkStrictly: true,
        emitPath: false
      }
    }
  },
  created() {
    const getStr = function(list) {
      list.forEach(function(row) {
        if (row.children) {
          getStr(row.children)
          if (row.children.length < 1) {
            row.children = ''
          }
        }
      })
    }
    getStr(this.classifyTree)
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true
          const name = this.flow.name
          const namespace = this.flow.namespace
          const classify = this.flow.classify
          const description = this.flow.description
          this.$Apis.flow.flow_create(name, namespace, classify, description).then(response => {
            if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
              this.loading = false
              this.$alert('新建成功!', '提示', {
                confirmButtonText: '确定',
                callback: action => {
                  this.resetForm('form')
                  this.$emit('refresh')
                }
              })
            } else {
              this.$alert(response.message, '提示', {
                confirmButtonText: '确定',
                callback: action => {
                  this.loading = false
                }
              })
            }
          })
        } else {
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
      this.$emit('show', false)
    }
  }
}
</script>

