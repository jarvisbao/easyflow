<template>
  <div class="json-editor">
    <div class="left">
      <el-form v-model="user_select" label-width="80px">
        <el-tabs v-model="activeName">
          <el-tab-pane label="人员" name="user">
            <el-form-item label="人员">
              <el-select v-model="users" multiple value-key="code" placeholder="请选择">
                <el-option v-for="item in userList" :key="item.code" :label="item.text" :value="item" />
              </el-select>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="小组" name="group">
            <el-form-item label="小组">
              <el-select v-model="group" multiple value-key="code" placeholder="请选择">
                <el-option v-for="item in groupList" :key="item.code" :label="item.text" :value="item" />
              </el-select>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="角色" name="role">
            <el-form-item label="角色">
              <el-select v-model="role" multiple value-key="code" placeholder="请选择">
                <el-option v-for="item in roleList" :key="item.code" :label="item.text" :value="item" />
              </el-select>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="多选" name="mutil">
            <el-form-item label="是否多选">
              <el-switch v-model="user_select.mutil" />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="抽取" name="chouqu">
            <el-form-item label="是否抽取">
              <el-switch v-model="user_select.chouqu" />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
        <el-form-item>
          <el-button type="danger" @click="save">生成JSON</el-button>
        </el-form-item>
      </el-form>
      <i class="el-icon-arrow-right" />
    </div>
    <textarea ref="textarea" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CodeMirror from 'codemirror'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/rubyblue.css'
require('script-loader!jsonlint')
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/lint/json-lint'

export default {
  name: 'JsonEditor',
  /* eslint-disable vue/require-prop-types */
  props: ['value'],
  data() {
    return {
      jsonEditor: false,
      activeName: 'user',
      user_select: {
        users: [],
        mutil: false,
        chouqu: false
      },
      users: [],
      group: [],
      role: []
    }
  },
  computed: {
    ...mapGetters([
      'routeList',
      'groupList',
      'roleList',
      'userList'
    ])
  },
  watch: {
    value(value) {
      const editorValue = this.jsonEditor.getValue()
      if (value !== editorValue) {
        this.jsonEditor.setValue(JSON.stringify(this.value, null, 2))
      }
    }
  },
  created() {
    if (JSON.stringify(this.value) !== '{}') {
      this.user_select.mutil = this.value.mutil
      this.user_select.chouqu = this.value.chouqu
      this.value.users.forEach(item => {
        if (item.code.indexOf('user@') !== -1) {
          this.users.push({
            text: item.label,
            code: item.code
          })
        }
        if (item.code.indexOf('group@') !== -1) {
          this.group.push({
            text: item.label,
            code: item.code
          })
        }
        if (item.code.indexOf('role@') !== -1) {
          this.role.push({
            text: item.label,
            code: item.code
          })
        }
      })
    }
  },
  mounted() {
    this.jsonEditor = CodeMirror.fromTextArea(this.$refs.textarea, {
      lineNumbers: true,
      mode: 'application/json',
      gutters: ['CodeMirror-lint-markers'],
      theme: 'rubyblue',
      lint: true
    })

    this.jsonEditor.setValue(JSON.stringify(this.value, null, 2))
    this.jsonEditor.on('blur', cm => {
      this.$emit('get_val', cm.getValue())
      // this.$emit('input', cm.getValue())
    })
  },
  methods: {
    getValue() {
      return this.jsonEditor.getValue()
    },
    save() {
      this.user_select.users = []
      const _users = [...this.users, ...this.group, ...this.role]
      _users.forEach(item => {
        this.user_select.users.push({
          label: item.text,
          code: item.code
        })
      })
      this.jsonEditor.setValue(JSON.stringify(this.user_select, null, 2))
      this.$emit('get_val', this.jsonEditor.getValue())
    }
  }
}
</script>

<style lang="scss" scoped>
.json-editor{
  height: 100%;
  position: relative;
  display: flex;
  .left {
    width: 45%;
    margin-right: 30px;
    padding-right: 30px;
    border-right: 1px solid #ececec;
    position: relative;
    i {
      position: absolute;
      right: -9px;
      top: 50%;
      margin-top: -7px;
      color: #ececec;
      background: #fff;
    }
  }
}
.json-editor /deep/ .CodeMirror {
  flex: 1;
  // height: auto;
  min-height: 350px;
}
.json-editor >>> .CodeMirror-scroll{
  min-height: 350px;
}
.json-editor >>> .cm-s-rubyblue span.cm-string {
  color: #F08047;
}
</style>
