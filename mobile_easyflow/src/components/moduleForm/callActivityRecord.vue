<template>
  <div class="view-record">
    <div class="view-record__box">
      <div class="item">
        <label>流程标题:</label>
        <div class="msg">
          {{ process.child_flow_name }}
        </div>
      </div>
      <div class="item">
        <label>工单标题:</label>
        <div class="msg">
          {{ process.child_title }}
        </div>
      </div>
      <div class="item">
        <label>命名空间:</label>
        <div class="msg">
          {{ process.child_namespace }}
        </div>
      </div>
      <div class="item">
        <label>流程绑定:</label>
        <div class="msg">
          <span v-if="process.child_element_binding === 'latest'">最新版本</span>
          <span v-else-if="process.child_element_binding === 'deployment'">部署版本</span>
          <span v-else>指定版本</span>
        </div>
      </div>
      <div v-if="process.child_element_binding === 'version'" class="item">
        <label>绑定版本号:</label>
        <div class="msg">
          {{ process.child_element_version }}
        </div>
      </div>
    </div>
    <div class="view-sub-process">
      <el-button type="primary" plain size="mini" @click="view_process">
        查看工单
      </el-button>
    </div>
  </div>
</template>
<script>
export default {
  name: 'CallActivityRecord',
  label: '基本信息',
  props: {
    moduleInit: { // 父组件传下来的默认参数供子组件调用
      type: Object,
      default: () => {}
    },
    formValue: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      process: {}
    }
  },
  created() {
    this.process = this.formValue
  },
  methods: {
    view_process() {
      const routeData = this.$router.resolve({
        name: 'ticket_view',
        query: { ticket_id: this.formValue.child_id }
      })
      window.open(routeData.href, '_blank')
    }
  }
}
</script>
