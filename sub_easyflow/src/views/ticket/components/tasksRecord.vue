<template>
  <div>
    <div v-for="(item, index) in tasksRecord" :key="index" class="record-list">
      <div class="node-name">
        {{ item.title }}
      </div>
      <div class="record-info">
        <div class="photo">
          <img :src="defaultImg">
        </div>
        <div class="info">
          <div class="owner">
            <div class="name">
              <div>
                {{ item.handler_name }}
              </div>
              <p>{{ item.exec_time | formatData }}</p>
            </div>
            <div class="tool">
              <span :id="'add-comment_'+index" @click="changeShowComment(index, item)">
                <i class="el-icon-chat-dot-square" />添加评论
              </span>
            </div>
          </div>
          <div v-if="item.display_forms.length > 0 || item.module_forms.length > 0 || item.url_forms" class="task-info">
            <el-tabs>
              <el-tab-pane v-for="fm in item.display_forms" :key="fm.name">
                <span slot="label">{{ fm.name }}</span>
                <div>
                  <fm-generate-form
                    v-if="fm.fmShow"
                    ref="tasksRecordForm"
                    :data="fm.jsonData"
                    :value="fm.editData"
                    :remote="remoteFuncs"
                    :edit="false"
                    :module-init="moduleInit"
                    :show-btn="false"
                  />
                </div>
              </el-tab-pane>
              <el-tab-pane v-for="md in item.module_forms" :key="md.name" v-if="md.show">
                <span slot="label">{{ md.label }}</span>
                <div>
                  <component :ref="md.name" :is="md.name" :module-init="moduleInit" :form-value="md.editData" :active_option="active_option" :is-edit="false" keep-alive />
                </div>
              </el-tab-pane>
              <el-tab-pane v-if="item.url_forms">
                <iframe :src="item.url_forms" width="100%" height="500" frameborder="0" />
              </el-tab-pane>
            </el-tabs>
          </div>
          <div v-if="item.comment_list.length > 0" class="comment-list">
            <div>评论信息</div>
            <div class="list-box">
              <i class="el-icon-caret-top icon" />
              <div v-for="(com, comIndex) in item.comment_list" :key="comIndex" class="record-box">
                <div class="record-info">
                  <div class="photo">
                    <img :src="defaultImg">
                  </div>
                  <div class="info">
                    <div class="owner">
                      <div class="name">
                        <div>
                          {{ com.handler_name }}
                        </div>
                        <p>
                          {{ com.create_time | formatData }}
                        </p>
                      </div>
                      <div class="tool">
                        <span :id="'add-replay_'+comIndex" style="color: #969696;" @click="handleReplay(index, comIndex, com)"><i class="el-icon-chat-line-round" />回复</span>
                      </div>
                    </div>
                    <div v-html="com.forms.comment.content" />
                  </div>
                </div>
                <!-- 回复 -->
                <div v-if="com.child.length > 0" class="replay-box">
                  <div v-for="(rep, repIndex) in com.child" :key="repIndex" class="record-info">
                    <div class="info">
                      <div class="owner">
                        <div class="name">
                          <div>
                            {{ rep.handler_name }} <span style="color: #949494;">回复</span> {{ rep.reply_name }} <span class="repaly-time">( {{ rep.create_time | formatData }} )</span>
                          </div>
                        </div>
                        <div class="tool">
                          <span :id="'com-replay_'+repIndex" style="color: #969696;" @click="comReplay(rep, com)"><i class="el-icon-chat-line-round" />回复</span>
                        </div>
                      </div>
                      <div v-html="rep.forms.comment.content" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      :title="dialogTitle"
      :close-on-click-modal="false"
      append-to-body
      destroy-on-close
    >
      <tasks-comment :module-init="moduleInit" :element="element" :parent-element="parentElement" :is-replay="isReplay" @close="close" />
    </el-dialog>
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
      dialogVisible: false,
      dialogTitle: '',
      element: null,
      tasksComment: this.moduleInit.ticket_data.comments,
      isReplay: false,
      parentElement: null
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
    })
  },
  methods: {
    changeShowComment(index, item) {
      this.element = item
      this.dialogVisible = !this.dialogVisible
      this.dialogTitle = '添加评论'
    },
    handleReplay(index, comIndex, com) {
      this.element = com
      this.dialogVisible = !this.dialogVisible
      this.dialogTitle = '回复'
    },
    comReplay(item, com) {
      this.element = item
      this.parentElement = com
      this.isReplay = true
      this.dialogVisible = !this.dialogVisible
      this.dialogTitle = '回复'
    },
    close() {
      this.dialogVisible = !this.dialogVisible
      this.isReplay = false
      this.parentElement = null
    }
  }
}
</script>
