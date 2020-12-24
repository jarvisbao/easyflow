i<template>
  <div class="flow-img-box">
    <div :style="{width: isStart ? '100%' : '50%'}" class="canvas-box">
      <div id="canvas" ref="canvas" />
    </div>
    <el-scrollbar v-if="!isStart" wrap-class="scrollbar-wrapper" class="scroll-box">
      <div v-if="showProcess" class="process-info">
        <div class="flow-title">
          {{ processInfo.title }}
        </div>
        <div class="tips">
          <span><i class="iconfont icon-geren" />{{ processInfo.initiator_name }}</span>
          <span><i class="el-icon-position" />{{ processInfo.status }}</span>
        </div>
        <template v-for="(item, index) in processInfo.forms">
          <fm-generate-form ref="generateForm" :key="index" :data="item.jsonData" :value="item.editData" :remote="remoteFuncs" :edit="false" :show-btn="false" />
        </template>
      </div>
      <div v-if="isShow" class="node-info">
        <div class="flow-title">
          {{ processInfo.title }}
        </div>
        <div v-if="completedInfo.length > 0" class="record">
          <div v-for="(item, index) in completedInfo" :key="index">
            <div class="name">
              {{ item.title }}<span class="status">(已完成)</span>
            </div>
            <div class="time">
              <div>
                <i class="iconfont icon-geren" />{{ item.handler_name }}
              </div>
              <div>
                <i class="iconfont icon-shijian" />{{ item.create_time | formatData }} - {{ item.exec_time | formatData }}
              </div>
            </div>
            <template v-if="item.display_forms.length > 0 && item.module_forms.length > 0" && !item.url_forms>
              <el-tabs>
                <el-tab-pane v-for="i in item.display_forms" :key="i.name">
                  <span slot="label">{{ i.name }}</span>
                  <div>
                    <fm-generate-form ref="generateForm" :data="i.jsonData" :value="i.editData" :remote="remoteFuncs" :edit="false" :show-btn="false" />
                  </div>
                </el-tab-pane>
                <el-tab-pane v-for="i in item.module_forms" :key="i.name">
                  <span slot="label">{{ i.label }}</span>
                  <div>
                    <component :ref="i.name" :is="i.name" :key="index" :module-init="moduleInit" :is-edit="false" :form-value="i.editData" keep-alive />
                  </div>
                </el-tab-pane>
                <el-tab-pane v-if="item.url_forms">
                  <iframe :src="item.url_forms" width="100%" height="500" frameborder="0" />
                </el-tab-pane>
              </el-tabs>
            </template>
            <div v-else>
              <template v-for="(i, colIndex) in item.display_forms">
                <fm-generate-form ref="generateForm" :key="colIndex" :data="i.jsonData" :value="i.editData" :remote="remoteFuncs" :edit="false" :show-btn="false" />
              </template>
              <template v-for="(i, colIndex) in item.module_forms">
                <component :ref="i.name" :is="i.name" :key="colIndex" :module-init="moduleInit" :is-edit="false" :form-value="i.editData" keep-alive />
              </template>
              <template v-if="item.url_forms">
                <iframe :src="item.url_forms" width="100%" height="500" frameborder="0" />
              </template>
            </div>
          </div>
        </div>
        <div v-if="activeInfo.length > 0">
          <div v-for="(element, colIndex) in activeInfo" :key="colIndex">
            <div class="name">
              {{ element.title }} <span class="status">(待处理)</span>
            </div>
            <div class="time">
              <div>
                <i class="iconfont icon-geren" />
                <span v-for="(item, subIndex) in element.before_owners" :key="subIndex">{{ item }}</span>
                <el-dropdown v-if="element.owners_name.length > 0" style="margin-right: 0">
                  <span style="cursor: pointer;">
                    <i class="el-icon-arrow-down el-icon--right" />
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-for="(item, subIndex) in element.owners_name" :key="subIndex">
                      {{ item }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
              <div>
                <i class="iconfont icon-shijian" />{{ element.create_time | formatData }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>
<script>
import BpmnViewer from '@/components/bpmn-js/lib/Viewer'
import { getExtension } from '@/utils'

export default {
  props: {
    flowInfo: {
      type: Object,
      default: () => {}
    },
    def_setting: {
      type: String,
      default: ''
    },
    isStart: {
      type: Boolean,
      default: false
    },
    completedNodes: {
      type: Array,
      default: () => []
    },
    activeNodes: {
      type: Array,
      default: () => []
    },
    processInfo: {
      type: Object,
      default: () => {}
    },
    moduleInit: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    const that = this
    return {
      BpmnViewer: null,
      isShow: false,
      showProcess: true,
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
      completedInfo: [],
      activeInfo: []
    }
  },
  mounted() {
    const canvas = this.$refs.canvas
    this.BpmnViewer = new BpmnViewer({
      container: canvas
    })
    const bpmnXmlStr = this.def_setting
    this.BpmnViewer.importXML(bpmnXmlStr, err => {
      if (err) {
        console.log(err)
      } else {
        this.BpmnViewer.get('canvas').zoom('fit-viewport', 'auto')
        // 多实例会签节点添加图标
        this.BpmnViewer._definitions.rootElements[0].flowElements.forEach(item => {
          if (getExtension(item, 'enfo:countersign')) {
            this.BpmnViewer.get('overlays').add(item.id, {
              position: { bottom: 20, left: 60 },
              html: '<i class="confont icon-huiqianrenwu" style="font-size: 14px; color: #000; font-weight: bold"></i>'
            })
          }
        })
        if (!this.isStart) {
          this.handleModeler()
        }
      }
    })
  },
  methods: {
    handleModeler() {
      const flowElements = this.BpmnViewer._definitions.rootElements[0].flowElements
      const canvas = this.BpmnViewer.get('canvas')
      const overlays = this.BpmnViewer.get('overlays')
      let sameElements = []
      // 取已完成节点里相同的节点数据
      this.completedNodes.forEach(item => {
        if (sameElements.some(ob => ob.owner_id === item.owner_id)) {
          sameElements.push(item)
        }
      })
      sameElements = sameElements.sort(function(a, b) {
        return a.exec_time < b.exec_time ? -1 : 1
      })

      flowElements.forEach(item => {
        const completeTask = this.completedNodes.find(m => m.owner_id === item.id) // 已完成节点
        const activeTask = this.activeNodes.find(m => m.node_id === item.id) // 当前活跃节点

        if (item.$type === 'bpmn:SubProcess') {
          const subFlowElements = item.flowElements
          subFlowElements.forEach(sub => {
            const subComplete = this.completedNodes.find(m => m.owner_id === sub.id)
            const subActive = this.activeNodes.find(m => m.node_id === sub.id)
            if (subComplete) {
              this.markComplete(canvas, overlays, sub, subComplete, subActive, sameElements)
            }
            if (subActive) {
              this.markActive(canvas, overlays, sub)
            }
          })
        }
        if (completeTask) {
          this.markComplete(canvas, overlays, item, completeTask, activeTask, sameElements)
        }

        if (activeTask) {
          this.markActive(canvas, overlays, item)
        }
      })
      // 鼠标点击节点显示节点信息
      this.BpmnViewer.on('element.click', e => {
        const { element } = e
        if (element.type === 'bpmn:Process') {
          this.showProcess = true
          this.isShow = false
        } else {
          this.showProcess = false
          this.isShow = false
          this.nodeForms = []
          this.activeInfo = []
          this.completedInfo = []

          this.completedNodes.forEach(item => {
            if (item.owner_id === element.id) {
              this.isShow = true
              this.completedInfo.push(item)
            }
          })
          this.activeNodes.forEach(item => {
            if (item.node_id === element.id) {
              this.isShow = true
              const owners_name = Array.from(new Set(item.owners_name))
              const before_owners = owners_name.splice(0, 4)
              this.activeInfo.push({
                title: item.node_name,
                owners_name: owners_name,
                before_owners: before_owners.splice(0, 4),
                create_time: item.create_time
              })
            }
          })
        }
      })
    },
    markComplete(canvas, overlays, element, completeTask, activeTask, sameElements) {
      canvas.addMarker(element.id, 'highlight')
      // 如果已完成节点输入线源节点是网关，该网关高亮
      if (element.incoming) {
        element.incoming.forEach(i => {
          if (i.sourceRef.$type.indexOf('Gateway') !== -1) {
            canvas.addMarker(i.sourceRef.id, 'highlight')
          }
        })
      }
      // 如果已完成节点输出线目标节点是结束节点，结束节点高亮显示
      if (!activeTask) {
        element.outgoing.forEach(i => {
          if (i.targetRef.$type === 'bpmn:EndEvent') {
            canvas.addMarker(i.targetRef.id, 'highlight')
          }
        })
      }
      if (element.$type !== 'bpmn:StartEvent') {
        let overlayHtml = ''
        // 如果当前已完成节点是操作类，则节点标记为该操作名称，否则显示已完成
        if (completeTask.rtype === 'button' && completeTask.title.indexOf('操作') !== -1) {
          const title = completeTask.title.split('-')[1]
          overlayHtml = `
            <div ref="completed" style="display: flex; align-items: center; font-size: 12px; color: #67C23A;">
              <i class="el-icon-refresh-left" style="font-size: 16px;"></i>
              <span style="margin-left:5px; white-space: nowrap;">${title}</span>
            </div>
          `
        } else {
          overlayHtml = `
            <div ref="completed" style="display: flex; align-items: center; font-size: 12px; color: #67C23A;">
              <i class="el-icon-circle-check" style="font-size: 16px;"></i>
              <span style="margin-left:5px; white-space: nowrap;">已完成</span>
            </div>
          `
        }
        overlays.add(element.id, {
          position: { top: 8, left: 30 },
          html: overlayHtml
        })
      }
      // 如果当前节点既是已完成又是活跃的，则去掉已完成标记
      if (activeTask && completeTask.owner_id === activeTask.node_id) {
        overlays.remove({ element: element.id })
      }
      // 如果当前节点是网关类，去掉节点标记
      if (element.$type.indexOf('Gateway') !== -1) {
        overlays.remove({ element: element.id })
      }
      // 同一节点有两条记录时，以最后完成时间的一条为准添加标记
      sameElements.forEach((ii, index) => {
        if (ii.owner_id === completeTask.owner_id) {
          overlays.remove({ element: element.id })
          if (index === sameElements.length - 1) {
            let overlayHtml = ''
            if (ii.title.indexOf('操作') !== -1) {
              const title = ii.title.split('-')[1]
              overlayHtml = `
                <div ref="completed" style="display: flex; align-items: center; font-size: 12px; color: #67C23A;">
                  <i class="el-icon-circle-check" style="font-size: 16px;"></i>
                  <span style="margin-left:5px; white-space: nowrap;">${title}</span>
                </div>
              `
            } else {
              overlayHtml = `
                <div ref="completed" style="display: flex; align-items: center; font-size: 12px; color: #67C23A;">
                  <i class="el-icon-circle-check" style="font-size: 16px;"></i>
                  <span style="margin-left:5px; white-space: nowrap;">已完成</span>
                </div>
              `
            }
            overlays.add(element.id, {
              position: { top: 8, left: 30 },
              html: overlayHtml
            })
          }
        }
      })
    },
    markActive(canvas, overlays, element) {
      canvas.addMarker(element.id, 'active')
      const overlayHtml = `
        <div ref="active" style="display: flex; align-items: center; font-size: 12px; color: #f38841;">
          <i class="el-icon-loading" style="font-size: 16px;"></i>
          <span style="margin-left:5px; white-space: nowrap;">待处理</span>
        </div>
      `
      overlays.add(element.id, {
        position: { top: 8, left: 30 },
        html: overlayHtml
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.flow-img-box {
  position: relative;
  display: flex;
  height: 600px;
  .canvas-box {
    width: 50%;
    height: 100%;
    overflow: auto;
  }
  #canvas {
    height: 100%;
  }
  .scroll-box {
    flex: 1;
    height: 100%;
    border-left: 1px solid #ddd;
  }
  .flow-title {
    margin-bottom: 15px;
    font-weight: bold;
    text-align: center;
    line-height: 32px;
    font-size: 16px;
  }
  .node-info {
    padding: 15px;
    .record {
      margin-bottom: 35px;
    }
    .name {
      font-weight: bold;
      .status {
        margin-left: 8px;
        color: #409EFF;
        font-size: 12px;
      }
    }
    .time {
      margin-top: 12px;
      margin-bottom: 25px;
      font-size: 13px;
      color: #8A8A8A;
      display: flex;
      div {
        margin-right: 20px;
        display: flex;
        align-items: center;
        i {
          color: #bdbcbc;
          font-size: 20px;
          margin-right: 5px;
        }
      }
    }
  }
  .process-info {
    padding: 15px;
    .tips {
      margin-bottom: 25px;
      margin-left: 20px;
      color: #8A8A8A;
      display: flex;
      span {
        margin-right: 12px;
        display: flex;
        align-items: center;
        i {
          color: #bdbcbc;
          font-size: 20px;
          margin-right: 5px;
        }
      }
    }
  }
}
/deep/ .highlight.djs-shape .djs-visual > :nth-child(1) {
  stroke: #67C23A !important;
  fill-opacity: 0.2 !important;
}
/deep/ .highlight.djs-shape .djs-visual > :nth-child(2) {
  fill: #67C23A !important;
}
/deep/ .highlight.djs-shape .djs-visual > path {
  fill: #67C23A !important;
  fill-opacity: 0.2 !important;
  stroke: #67C23A !important;
}
/deep/ .highlight.djs-connection > .djs-visual > path {
  stroke: #67C23A !important;
}
/deep/ .highlight .icon-huiqianrenwu {
  color: #67C23A !important;
}
/deep/ .active.djs-shape .djs-visual > :nth-child(1) {
  stroke: #f38841 !important;
  fill-opacity: 0.2 !important;
}
/deep/ .active.djs-shape .djs-visual > :nth-child(2) {
  fill: #f38841 !important;
}
/deep/.active.djs-shape .djs-visual > path {
  fill: #f38841 !important;
  fill-opacity: 0.4 !important;
  stroke: #f38841 !important;
}
/deep/ .active .icon-huiqianrenwu {
  color: #f38841 !important;
}
</style>
