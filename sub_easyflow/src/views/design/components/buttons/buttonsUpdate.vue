<template>
  <div>
    <el-form ref="form" :model="form" :rules="rules" label-width="100px" style="width: 100%;">
      <el-form-item label="名称" prop="name">
        <el-input id="btn-name" v-model="form.name" />
      </el-form-item>
      <el-form-item label="别名" prop="action">
        <el-input id="btn-action" v-model="form.action" :disabled="true" />
      </el-form-item>
      <el-form-item label="前端验证">
        <el-input id="prep-script" v-model="form.prep_script" :autosize="{ minRows: 4, maxRows: 6}" type="textarea" />
      </el-form-item>
      <el-form-item label="后端验证">
        <div style="display: flex">
          <el-input v-model="form.allow_cls" placeholder="请填写服务" />
          <el-input v-model="form.allow_fun" placeholder="请填写服务对应的方法" style="margin-left: 12px;" />
        </div>
      </el-form-item>
      <el-form-item label="后端处理">
        <div style="display: flex">
          <el-input v-model="form.submit_cls" placeholder="请填写服务" />
          <el-input v-model="form.submit_fun" placeholder="请填写服务对应的方法" style="margin-left: 12px;" />
        </div>
      </el-form-item>
      <el-form-item label="配置页">
        <el-select id="btn-object" v-model="form.object" multiple filterable value-key="mtd_id" placeholder="请选择">
          <el-option v-for="item in method_list" :key="item.mtd_id" :label="item.mtd_name" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="URL表单">
        <el-input id="btn-url" v-model="form.url" />
      </el-form-item>
      <el-form-item label="vue模块表单">
        <el-select id="btn-module" v-model="form.model_forms" multiple filterable placeholder="请选择">
          <el-option v-for="item in module_list" :key="item.name" :value="item.name" :label="item.label">
            <span style="float: left">{{ item.label }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.name }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button id="confirm" :loading="loading" type="danger" @click="submitForm('form')">
          立即修改
        </el-button>
        <el-button id="cancel" plain @click="resetForm('form')">
          取消
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import moduleForm from '@/components/moduleForm/index'

export default {
  props: {
    buttonInfo: {
      type: Object,
      default: () => {}
    },
    updateIndex: {
      type: Number,
      required: true
    },
    buttons: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      form: JSON.parse(JSON.stringify(this.buttonInfo)),
      rules: {
        name: { required: true, message: '请输入按钮名称', trigger: 'blur' },
        action: { required: true, message: '请输入按钮别名', trigger: 'blur' }
      },
      loading: false,
      module_list: moduleForm
    }
  },
  computed: {
    ...mapGetters([
      'method_list',
    ])
  },
  methods: {
    submitForm(formName) {
      this.loading = true
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$emit('updateButton', this.form)
          this.resetForm('form')
          const item = this.buttons[this.updateIndex]
          Object.keys(item).forEach((key) => {
            this.$delete(item, key)
            for (const k of Object.keys(this.form)) {
              this.$set(item, k, this.form[k])
            }
          })
          this.loading = false
        } else {
          return false
        }
      })
    },
    resetForm(formName) {
      this.$emit('show')
    }
  }
}
</script>
