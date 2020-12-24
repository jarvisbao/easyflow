<template>
  <div :class="{hasBorder: showType==='tile'}" class="box">
    <div v-if="formItems.length < 1 && module_forms.length < 1 && !url_forms" class="no-forms">
      <el-alert :closable="false" title="无表单数据" type="warning" />
    </div>
    <div v-else>
      <div class="box-title">
        <span v-if="showType === 'tile'" class="tit">业务数据</span>
        <el-button id="show-type" type="text" class="show-type" @click="changeShowType">
          {{ showType==='tabs' ? '平铺显示' : '标签显示' }}
        </el-button>
      </div>
      <el-tabs v-if="showType === 'tabs'" v-model="tabActiveNames" type="border-card" class="show-tabs">
        <el-tab-pane v-for="(item, index) in formItems" :key="item.name" :name="'form_'+index">
          <span slot="label">{{ item.name }}</span>
          <div>
            <fm-generate-form v-if="show" ref="generateForm" :data="item.jsonData" :value="item.editData" :remote="remoteFuncs" :id="item.owner" :edit="edit" :module-init="moduleInit" :show-btn="false" @on-change="onChange" />
          </div>
        </el-tab-pane>
        <el-tab-pane v-for="item in module_forms" :key="item.name" :name="item.name">
          <span slot="label">{{ item.label }}</span>
          <div>
            <component :ref="item.name" :is="item.name" :module-init="moduleInit" :is-start="isStart" keep-alive @get_valid="get_valid" @get_data="get_module_data" />
          </div>
        </el-tab-pane>
        <el-tab-pane v-if="url_forms" label="URL表单" name="url">
          <div>
            <iframe :src="url_forms" width="100%" height="500" frameborder="0" />
          </div>
        </el-tab-pane>
      </el-tabs>

      <div v-else class="flow-form">
        <el-collapse v-model="activeNames">
          <el-collapse-item v-for="(item, index) in formItems" :key="index" :name="index" class="list">
            <template slot="title">
              {{ item.name }}
            </template>
            <div>
              <fm-generate-form v-if="show" ref="generateForm" :data="item.jsonData" :value="item.editData" :remote="remoteFuncs" :id="item.owner" :edit="edit" :module-init="moduleInit" :show-btn="false" @on-change="onChange" />
            </div>
          </el-collapse-item>
          <el-collapse-item v-for="item in module_forms" :key="item.name" :name="item.name" class="list">
            <template slot="title">
              {{ item.label }}
            </template>
            <component :ref="item.name" :is="item.name" :module-init="moduleInit" :is-start="isStart" keep-alive @get_valid="get_valid" @get_data="get_module_data" />
          </el-collapse-item>
          <el-collapse-item v-if="url_forms" name="url" class="list">
            <template slot="title">
              URL表单
            </template>
            <div>
              <iframe :src="url_forms" width="100%" height="500" frameborder="0" />
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    formItems: {
      type: Array,
      default: () => []
    },
    module_forms: {
      type: Array,
      default: () => []
    },
    url_forms: {
      type: String,
      default: null
    },
    edit: {
      type: Boolean,
      default: true
    },
    ttype: {
      type: String,
      default: 'tabs'
    },
    isStart: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const that = this
    return {
      showType: this.ttype,
      remoteFuncs: {
        remote_http_get(uri, body) {
          if (uri) {
            return that.$Utils.request({
              url: uri,
              method: 'get',
              params: body
            })
          } else {
            return new Promise((resolve, reject) => {
              resolve()
            })
          }
        },
        remote_http_post(uri, body) {
          if (uri) {
            return that.$Utils.request({
              url: uri,
              method: 'post',
              data: body
            })
          } else {
            return new Promise((resolve, reject) => {
              resolve()
            })
          }
        }
      },
      // activeNames: [],
      forms: {},
      isValidate: [],
      show: true,
      moduleValid: false,
      moduleData: null
    }
  },
  computed: {
    ...mapGetters([
      'moduleInit'
    ]),
    activeNames: {
      get() {
        if (this.formItems.length > 0) {
          return [0]
        } else if (this.module_forms.length > 0) {
          return [this.module_forms[0].name]
        } else {
          return ['url']
        }
      },
      set() {}
    },
    tabActiveNames: {
      get() {
        if (this.formItems.length > 0) {
          return 'form_0'
        } else if (this.module_forms.length > 0) {
          return this.module_forms[0].name
        } else {
          return 'url'
        }
      },
      set() {}
    }
  },
  methods: {
    changeShowType() {
      this.showType = this.showType === 'tabs' ? 'tile' : 'tabs'
      // 切换时表单先隐藏再显示，不然不显示已填写的数据
      this.show = false
      setTimeout(() => {
        this.show = true
      }, 30)
    },
    getData() {
      this.isValidate = []
      const generateForm = this.$refs.generateForm
      if (this.module_forms.length > 0) {
        this.module_forms.forEach(item => {
          this.$refs[item.name][0].valid()
          if (this.moduleValid) {
            this.$refs[item.name][0].get_data()
            this.$set(this.forms, item.name, this.moduleData)
          }
        })
      }
      if (generateForm) {
        generateForm.forEach(item => {
          item.getData().then(data => {
            this.isValidate.push(true)
            this.$set(this.forms, item.$el.id, data)
          }).catch(e => {
            // 数据校验失败
            this.isValidate.push(false)
            // this.$emit('hideLoading')
          })
        })
      }
      if (!generateForm && this.module_forms.length < 1) {
        this.$emit('getFormData', this.forms)
      } else {
        setTimeout(() => {
          // 把表单数组传递给父组件
          if (this.isValidate.indexOf(false) === -1) {
            this.$emit('getFormData', this.forms)
          } else {
            this.$emit('hideLoading')
          }
        }, 300)
      }
    },
    // 表单数据变化时触发
    onChange(field, value, data) {
      // field: 数据改变的字段标识, value: 数据改变后的值, data: 表单数据
      this.formItems.forEach(item => {
        item.editData = data
      })
    },
    get_valid(events) {
      this.moduleValid = events
      this.isValidate.push(events)
    },
    get_module_data(data) {
      this.moduleData = data
    }
  }
}
</script>
