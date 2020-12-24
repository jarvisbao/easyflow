<template>
  <textarea ref="code" v-model="code" :placeholder="placeholder" />
</template>
<script>
import _CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css' // 核心样式
import 'codemirror/theme/cobalt.css' // 引入主题后还需要在 options 中指定主题才会生效
// vue 貌似没有无法在实例初始化后再动态加载对应 JS ，所以此处才把对应的 JS 提前引入
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/css/css.js'
import 'codemirror/mode/xml/xml.js'
import 'codemirror/mode/clike/clike.js'
import 'codemirror/mode/markdown/markdown.js'
import 'codemirror/mode/python/python.js'
import 'codemirror/mode/r/r.js'
import 'codemirror/mode/shell/shell.js'
import 'codemirror/mode/sql/sql.js'
import 'codemirror/mode/swift/swift.js'
import 'codemirror/mode/vue/vue.js'
import 'codemirror/addon/display/placeholder.js'
import 'codemirror/keymap/sublime.js'
// closebrackets
import 'codemirror/addon/edit/closebrackets.js'

const CodeMirror = window.CodeMirror || _CodeMirror

export default {
  props: {
    prop_code: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    codeMode: {
      type: String,
      default: ''
    },
    paramCode: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      code: this.prop_code,
      mode: this.codeMode, // 默认的语法类型
      coder: null, // 编辑器实例
      options: {
        tabSize: 4, // 缩进格式
        theme: '', // 主题，对应主题库 JS 需要提前引入
        lineNumbers: true, // 显示行号
        line: true,
        autoCloseBrackets: true, // 括号自动补齐
        keyMap: 'sublime' // 绑定快捷键
      }
    }
  },
  mounted() {
    this._initialize()
  },
  methods: {
    _initialize() {
      this.coder = CodeMirror.fromTextArea(this.$refs.code, this.options) // 初始化编辑器实例，传入需要被实例化的文本域对象和默认配置
      this.coder.setValue(this.prop_code) // 编辑器赋值
      this.coder.on('blur', (coder) => {
        this.code = coder.getValue()
        if (this.$emit) {
          if (this.paramCode) {
            var result = {}
            result[this.paramCode] = this.code
            this.$emit('get_code', result)
          } else {
            this.$emit('get_code', this.code)
          }
        }
      })
    }
  }
}
</script>
<style lang="scss">
.CodeMirror {
  height: 200px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  line-height: 26px;
  font-family: sans-serif;
  color: #606266;
  .CodeMirror-linenumber {
    text-align: center;
  }
}
.CodeMirror-placeholder {
  color: #c0c4d6 !important;
}
</style>
