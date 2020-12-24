<template>
  <div class="popup-comment">
    <van-field
      v-model="form.content"
      center
      clearable
      :placeholder="isReplay ? '回复' : '评论'"
      rows="1"
      autosize
      autofocus
      type="textarea"
    >
      <template #button>
        <van-button :disabled="!form.content" size="small" type="primary" @click="addComment">
          发送
        </van-button>
      </template>
    </van-field>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Comment',
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
      }
      // create_time: this.$Utils.util.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  methods: {
    addComment() {
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
            // create_time: this.create_time,
            forms: comment,
            child: []
          }
          this.$toast({
            message: '提交成功！',
            forbidClick: true,
            onClose: () => {
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
          this.$dialog.alert({
            message: response.message
          })
        }
      })
    },
    closeCom() {
      this.$emit('close')
    }
  }
}
</script>
<style lang="scss" scoped>
.popup-comment {
  padding: 8px 12px;
}
</style>
