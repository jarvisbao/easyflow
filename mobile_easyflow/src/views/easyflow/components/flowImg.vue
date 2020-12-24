i<template>
  <div class="flow-img-box">
    <div :style="{width: '100%'}" class="canvas-box">
      <div id="canvas" ref="canvas" />
    </div>
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
    }
  },
  data() {
    return {
      BpmnViewer: null
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

        if (completeTask) {
          canvas.addMarker(item.id, 'highlight')
          // 如果已完成节点输入线源节点是网关，该网关高亮
          if (item.incoming) {
            item.incoming.forEach(i => {
              if (i.sourceRef.$type.indexOf('Gateway') !== -1) {
                canvas.addMarker(i.sourceRef.id, 'highlight')
              }
            })
          }
          // 如果已完成节点输出线目标节点是结束节点，结束节点高亮显示
          if (!activeTask) {
            item.outgoing.forEach(i => {
              if (i.targetRef.$type === 'bpmn:EndEvent') {
                canvas.addMarker(i.targetRef.id, 'highlight')
              }
            })
          }

          if (item.$type !== 'bpmn:StartEvent') {
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
            overlays.add(item.id, {
              position: { top: 8, left: 30 },
              html: overlayHtml
            })
          }
          // 如果当前节点既是已完成又是活跃的，则去掉已完成标记
          if (activeTask && completeTask.owner_id === activeTask.node_id) {
            overlays.remove({ element: item.id })
          }
          // 如果当前节点是网关类，去掉节点标记
          if (item.$type.indexOf('Gateway') !== -1) {
            overlays.remove({ element: item.id })
          }
          // 同一节点有两条记录时，以最后完成时间的一条为准添加标记
          sameElements.forEach((ii, index) => {
            if (ii.owner_id === completeTask.owner_id) {
              overlays.remove({ element: item.id })
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
                overlays.add(item.id, {
                  position: { top: 8, left: 30 },
                  html: overlayHtml
                })
              }
            }
          })
        }

        if (activeTask) {
          canvas.addMarker(item.id, 'active')
          const overlayHtml = `
            <div ref="active" style="display: flex; align-items: center; font-size: 12px; color: #f38841;">
              <i class="el-icon-loading" style="font-size: 16px;"></i>
              <span style="margin-left:5px; white-space: nowrap;">待处理</span>
            </div>
          `
          overlays.add(item.id, {
            position: { top: 8, left: 30 },
            html: overlayHtml
          })
        }
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
