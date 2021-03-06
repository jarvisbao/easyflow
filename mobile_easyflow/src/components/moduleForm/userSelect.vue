<template>
  <div class="select-person">
    <van-form>
      <van-field
        v-for="(item, index) in userSelect"
        :key="index"
        :disabled="isDisabled"
        :label="item.node_name"
        :name="item.node_name"
      >
        <template #input>
          <van-checkbox v-if="isNodeMultiple" v-model="item.check" :disabled="disabled" @change="handleChange" />
          <van-radio v-else v-model="radio" :name="item.node_id" :disabled="isDisabled" @change="handleChange" />
          <van-field v-model="item.user_name" :disabled="isDisabled" :border="false" readonly @click="showPicker(item, index)" placeholder="请选择" class="picker-cell" />
          <van-popup v-model="item.showPicker" position="bottom">
            <template v-if="item.mutil">
              <div class="van-picker__toolbar">
                <button type="button" class="van-picker__cancel" @click="item.showPicker = false">
                  取消
                </button>
                <button type="button" class="van-picker__confirm" @click="checkOption">
                  确认
                </button>
              </div>
              <van-checkbox-group v-model="item.userMutil">
                <van-cell
                  v-for="(sub, subIndex) in item.userList"
                  :key="subIndex"
                  :title="sub.label"
                  clickable
                  @click="toggle(index)"
                >
                  <van-checkbox ref="selectMutil" :name="sub" slot="right-icon" />
                </van-cell>
              </van-checkbox-group>
            </template>
            <van-picker
              v-else
              :columns="item.userList"
              value-key="label"
              show-toolbar
              title=""
              @confirm="checkOption"
              @cancel="item.showPicker = false"
            />
          </van-popup>
        </template>
      </van-field>
    </van-form>
  </div>
</template>
<script>
import BpmnViewer from '@/components/bpmn-js/lib/Viewer'
import { getExtension } from '@/utils'

export default {
  name: 'user_select',
  label: '人员选择',
  show: false, // 设置表单是否在记录中显示，默认显示
  props: {
    moduleInit: { // 父组件传下来的默认参数供子组件调用
      type: Object,
      default: () => {}
    },
    isStart: {
      type: Boolean,
      default: false
    },
    isEdit: {
      type: Boolean,
      default: true
    },
    formValue: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      BpmnViewer: null,
      nodes: {},
      isMultiple: false,
      isNodeMultiple: true,
      personList: [],
      nodeList: [],
      flowElements: [],
      user: null,
      userSelect: [],
      nextNode: {
        id: null,
        type: ''
      },
      currentNode: null,
      radio: null,
      disabled: true,
      isDisabled: false,
      cIndex: 0
    }
  },
  created() {
    if (this.isEdit) {
      this.moduleInit.deal_or_view = true
      this.isDisabled = false
    } else {
      this.moduleInit.deal_or_view = false
      this.isDisabled = true
    }
  },
  mounted() {
    this.BpmnViewer = new BpmnViewer()
    let bpmnXmlStr = null
    if (this.isStart) {
      bpmnXmlStr = this.moduleInit.ticket_data.def_setting
      this.nextNode.id = this.moduleInit.ticket_data.next_node[0].id
      this.nextNode.type = this.moduleInit.ticket_data.next_node[0].type
    } else {
      bpmnXmlStr = this.moduleInit.ticket_data.ticket_info.def_setting
      this.nextNode.id = this.moduleInit.ticket_data.deal_task.next_node[0].node_id
      this.nextNode.type = this.moduleInit.ticket_data.deal_task.next_node[0].type
      this.currentNode = this.moduleInit.ticket_data.deal_task.node_id
    }
    this.BpmnViewer.importXML(bpmnXmlStr, err => {
      if (err) {
        console.log(err)
      } else {
        this.handleModeler()
      }
    })
  },
  methods: {
    handleModeler() {
      this.flowElements = this.BpmnViewer._definitions.rootElements[0].flowElements
      if (this.nextNode.type.indexOf('Gateway') !== -1) {
        this.flowElements.forEach(item => {
          if (item.id === this.nextNode.id) {
            item.outgoing.forEach(out => {
              if (out.targetRef.$type === 'bpmn:UserTask') {
                this.userSelect.push({
                  node_id: out.targetRef.id,
                  node_name: out.targetRef.name,
                  user: null,
                  user_name: null,
                  check: false,
                  userList: [],
                  mutil: false,
                  userDisable: true,
                  showPicker: false
                })
                if (getExtension(out.targetRef, 'enfo:variable')) {
                  const userList = JSON.parse(getExtension(out.targetRef, 'enfo:variable').$body)
                  this.userSelect.forEach(ii => {
                    if (ii.node_id === out.targetRef.id) {
                      ii.userList = userList.users
                      ii.mutil = userList.mutil
                    }
                  })
                }
              }
            })
          }
        })
        this.$nextTick(() => {
          // 根据网关类型判断节点是多选还是单选 排他-单选，并行-多选且不可编辑，包容-多选
          this.disabled = false
          if (this.nextNode.type === 'bpmn:exclusiveGateway') {
            this.isNodeMultiple = false
          } else if (this.nextNode.type === 'bpmn:parallelGateway') {
            this.isNodeMultiple = true
            this.disabled = true
            this.userSelect.forEach(item => {
              item.check = true
              item.userDisable = false
            })
          } else {
            this.isNodeMultiple = true
          }
        })
      } else {
        if (this.currentNode) {
          const currentList = this.BpmnViewer.get('elementRegistry').get(this.currentNode).businessObject
          currentList.incoming.forEach(item => {
            if (item.sourceRef.$type.indexOf('Gateway') !== -1) {
              item.sourceRef.outgoing.forEach(out => {
                if (out.targetRef.$type === 'bpmn:UserTask') {
                  this.userSelect.push({
                    node_id: out.targetRef.id,
                    node_name: out.targetRef.name,
                    user: null,
                    check: false,
                    userList: [],
                    mutil: false,
                    userDisable: true,
                    userMutil: []
                  })
                  if (getExtension(out.targetRef, 'enfo:variable')) {
                    const userList = JSON.parse(getExtension(out.targetRef, 'enfo:variable').$body)
                    this.userSelect.forEach(ii => {
                      if (ii.node_id === out.targetRef.id) {
                        ii.userList = userList.user_select.users
                        ii.mutil = userList.user_select.mutil
                      }
                    })
                  }
                }
              })
              this.$nextTick(() => {
                if (item.sourceRef.$type === 'bpmn:ExclusiveGateway') {
                  this.isNodeMultiple = false
                } else if (item.sourceRef.$type === 'bpmn:ParallelGateway') {
                  this.isNodeMultiple = true
                  this.disabled = true
                  this.userSelect.forEach(item => {
                    item.check = true
                    item.userDisable = false
                  })
                } else {
                  this.isNodeMultiple = true
                }
              })
            }
          })
          Object.keys(this.formValue.nodes).forEach(element => {
            this.userSelect.forEach(item => {
              if (element === item.node_id) {
                this.radio = element
                if (item.mutil) {
                  item.user = this.formValue.nodes[element]
                } else {
                  item.user = this.formValue.nodes[element].join('')
                }
              }
            })
          })
        }
      }
    },
    handleChange(val) {
      if (this.isNodeMultiple) {
        this.userSelect.forEach(item => {
          if (item.check) {
            item.userDisable = false
          } else {
            item.userDisable = true
            item.user = null
          }
        })
      } else {
        this.userSelect.forEach(item => {
          if (item.node_id === val) {
            item.userDisable = false
          } else {
            item.userDisable = true
            item.user = null
          }
        })
      }
    },
    valid() {
      return new Promise((resolve, reject) => {
        if (this.isNodeMultiple) {
          this.userSelect.forEach(item => {
            if (item.check) {
              if (item.mutil) {
                this.nodes[item.node_id] = item.user
              } else {
                this.nodes[item.node_id] = [item.user]
              }
            } else {
              delete this.nodes[item.node_id]
            }
          })
        } else {
          this.nodes = {}
          this.userSelect.forEach(item => {
            if (item.node_id === this.radio) {
              if (item.mutil) {
                this.nodes[item.node_id] = item.user
              } else {
                this.nodes[item.node_id] = [item.user]
              }
            }
          })
        }
        if (JSON.stringify(this.nodes) === '{}') {
          resolve(false)
          this.$toast('请选择要提交的表单项！')
          return false
        } else {
          resolve(true)
        }
      })
    },
    get_data() {
      this.$emit('get_data', { nodes: this.nodes })
    },
    submit(action, owner_id) {
      const ticket_id = this.moduleInit.ticket_id
      const task_id = this.moduleInit.task_id
      const active_id = null
      const late_id = this.moduleInit.ticket_data.ticket_info.late_id
      const forms = {
        user_select: { nodes: this.nodes }
      }
      this.$Apis.ticket.action_do(ticket_id, action, owner_id, task_id, forms, active_id, late_id, null).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.$emit('close_overlay')
          this.$toast({
            message: '提交成功！',
            forbidClick: true,
            onClose: () => {
              this.$emit('close')
            }
          })
        } else {
          this.$emit('close_overlay')
          this.$dialog.alert({
            message: response.message
          })
        }
      })
    },
    showPicker(item, index) {
      item.showPicker = true
      this.cIndex = index
    },
    checkOption(val) {
      this.userSelect[this.cIndex].showPicker = false
      if (val) {
        if (this.userSelect[this.cIndex].mutil) {
          this.userSelect[this.cIndex].user = []
          this.userSelect[this.cIndex].user_name = []
          this.userSelect[this.cIndex].userMutil.forEach(item => {
            this.userSelect[this.cIndex].user.push(item.code)
            this.userSelect[this.cIndex].user_name.push(item.label)
          })
        } else {
          this.userSelect[this.cIndex].user = val.code
          this.userSelect[this.cIndex].user_name = val.label
        }
      }
    },
    toggle(index) {
      this.$refs.selectMutil[index].toggle()
    }
  }
}
</script>
<style lang="scss" scoped>
.picker-cell {
  padding: 0;
  flex: 1;
  margin-left: 12px;
}
</style>
