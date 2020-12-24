<template>
  <div>
    <el-form ref="form" :model="form">
      <el-form-item>
        <!-- <el-input v-model="form.content" :rows="4" type="textarea" /> -->
        <rich-text-editor @getValue="getValue" />
        <div v-show="show" class="tips" style="color: #f56c6c;">
          请输入评论或回复内容
        </div>
      </el-form-item>
      <el-form-item>
        <el-button id="confirm" type="primary" @click.native="addComment('form')">
          确定
        </el-button>
        <el-button id="cancel" @click.native="closeCom">
          取消
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import richTextEditor from '@/components/richTextEditor'

export default {
  name: 'Comment',
  components: {
    richTextEditor
  },
  props: {
    moduleInit: {
      type: Object,
      default: () => {}
    },
    element: {
      type: Object,
      default: () => {}
    },
    parentElement: {
      type: Object,
      default: () => {}
    },
    isReplay: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: {
        content: null
      },
      create_time: this.$Utils.util.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
      show: false
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  methods: {
    getValue(value) {
      this.form.content = value
    },
    addComment(formName) {
      if (!this.form.content) {
        this.show = true
        return false
      }
      this.show = false
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const ticket_id = this.moduleInit.ticket_id
          const comment = {
            comment: this.form
          }
          const parent_id = this.element.record_id
          const object = {
            module_forms: ['comment']
          }
          this.$Apis.ticket.comment_add(ticket_id, comment, parent_id, object).then(response => {
            if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
              const content = {
                record_id: response.payload,
                parent: parent_id,
                handler_name: this.name,
                create_time: this.create_time,
                forms: comment,
                child: []
              }
              this.$alert('提交成功！', '提示', {
                confirmButtonText: '确定',
                callback: action => {
                  if (this.element.parent === null) {
                    this.element.comment_list.push({
                      ...content,
                      reply_name: ''
                    })
                  } else if (this.isReplay) {
                    this.parentElement.child.push({
                      ...content,
                      reply_name: this.element.handler_name
                    })
                  } else {
                    this.element.child.push({
                      ...content,
                      reply_name: this.element.handler_name
                    })
                  }
                  this.closeCom()
                }
              })
            } else {
              this.$alert(response.message, '提示', {
                confirmButtonText: '确定'
              })
            }
          })
        } else {
          return false
        }
      })
    },
    closeCom() {
      this.$emit('close')
    }
  }
}
</script>
