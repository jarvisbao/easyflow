<template>
  <div>
    <div v-for="(item, index) in tasksRecord" :key="index" v-if="item.rtype !== 'comment'" class="record-list">
      <div class="node-name">
        {{ item.title }}
      </div>
      <div class="record-info">
        <div class="basic">
          <div style="flex: 1; display: flex;">
            <div class="photo">
              <img :src="defaultImg">
            </div>
            <div class="name">
              <div>
                {{ item.handler_name }}
              </div>
              <p>{{ item.exec_time | formatData }}</p>
            </div>
          </div>
          <div class="tool">
            <van-tag type="primary" size="medium" color="#c5c5c5" @click="changeShowComment(index, item)">
              评论
            </van-tag>
          </div>
        </div>

        <div class="info">
          <div v-if="item.display_forms.length > 0 || item.module_forms.length > 0 || item.url_forms" class="task-info">
            <van-tabs>
              <van-tab v-for="fm in item.display_forms" :key="fm.name" :title="fm.name">
                <!-- <span slot="label">{{ fm.name }}</span> -->
                <div style="margin-top: 15px;">
                  <generate-form-mobile
                    v-if="fm.fmShow"
                    ref="tasksRecordForm"
                    :data="fm.jsonData"
                    :value="fm.editData"
                    :remote="remoteFuncs"
                    :edit="false"
                    :module-init="moduleInit"
                  />
                </div>
              </van-tab>
              <van-tab v-for="md in item.module_forms" :key="md.name" v-if="md.show" :title="md.label">
                <!-- <span slot="label">{{ md.label }}</span> -->
                <div style="margin-top: 15px;">
                  <component :ref="md.name" :is="md.name" :module-init="moduleInit" :form-value="md.editData" :active_option="active_option" :is-edit="false" keep-alive />
                </div>
              </van-tab>
              <van-tab v-if="item.url_forms" title="URL表单">
                <iframe :src="item.url_forms" width="100%" height="500" frameborder="0" style="margin-top: 15px;" />
              </van-tab>
            </van-tabs>
          </div>
          <div v-if="item.comment_list && item.comment_list.length > 0" class="comment-list">
            <div class="list-box">
              <div v-for="(com, comIndex) in item.comment_list" :key="comIndex" class="record-box">
                <div class="comment" @click="handleReplay(index, comIndex, com)">
                  <span class="name">{{ com.handler_name }}:</span>
                  <div v-html="com.forms.comment.content" class="content" />
                </div>
                <!-- 回复 -->
                <div v-if="com.child.length > 0" class="replay-box">
                  <div v-for="(rep, repIndex) in com.child" :key="repIndex" class="comment" @click="comReplay(rep, com)">
                    <span class="name">{{ rep.handler_name }} <span style="color: #949494;">回复</span> {{ rep.reply_name }}:</span>
                    <div v-html="rep.forms.comment.content" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <van-popup v-model="popupShow" safe-area-inset-bottom position="bottom">
      <tasks-comment :module-init="moduleInit" :element="element" :parent-element="parentElement" :is-replay="isReplay" @close="close" />
    </van-popup>
  </div>
</template>
<script>
import tasksComment from './tasksComment'

export default {
  components: {
    tasksComment
  },
  props: {
    tasksRecord: {
      type: Array,
      default: () => []
    },
    moduleInit: {
      type: Object,
      default: () => {}
    },
    active_option: {
      type: Array,
      default: () => []
    }
  },
  data() {
    const that = this
    return {
      showAddComment: false,
      defaultImg: require('@/assets/images/user_default.png'),
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
      comment: {
        content: null
      },
      isComment: false,
      element: null,
      tasksComment: this.moduleInit.ticket_data.comments,
      isReplay: false,
      parentElement: null,
      popupShow: false
    }
  },
  created() {
    Object.keys(this.tasksComment).forEach(element => {
      if (this.tasksComment[element].length > 0) {
        this.tasksRecord.forEach(item => {
          if (element === item.record_id) {
            item.comment_list = this.tasksComment[element]
          }
        })
      }
    })

    this.tasksRecord.forEach(element => {
      if (element.comment_list) {
        const getChild = function(list) {
          list.forEach(function(row) {
            if (row.child) {
              getChild(row.child)
            } else {
              // row.child = row.child
              return
            }
          })
        }
        getChild(element.comment_list)
      }
    })
  },
  methods: {
    changeShowComment(index, item) {
      this.element = item
      this.isReplay = false
      this.popupShow = !this.popupShow
    },
    handleReplay(index, comIndex, com) {
      this.element = com
      this.isReplay = true
      this.popupShow = !this.popupShow
    },
    comReplay(item, com) {
      this.element = item
      this.parentElement = com
      this.isReplay = true
      this.popupShow = !this.popupShow
    },
    close() {
      this.popupShow = !this.popupShow
      this.isReplay = false
      this.parentElement = null
    }
  }
}
</script>
