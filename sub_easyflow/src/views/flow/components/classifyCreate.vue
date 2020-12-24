<template>
  <el-form ref="form" :model="classify" :rules="rules" label-width="120px">
    <el-form-item label="分类标题" prop="name">
      <el-input id="name" v-model="classify.name" />
    </el-form-item>
    <el-form-item label="父分类">
      <el-cascader id="parent" v-model="classify.parent_id" :options="classifyTree" :props="defaultProps" style="width: 100%" />
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
      classify: {
        name: null,
        parent_id: null
      },
      rules: {},
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
          const name = this.classify.name
          const parent_id = this.classify.parent_id
          this.$Apis.flow.classify_add(name, parent_id).then(response => {
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
