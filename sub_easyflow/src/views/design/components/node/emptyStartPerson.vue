<template>
  <div>
    <el-form :model="person" label-width="80px" style="width: 100%;">
      <el-form-item label="人员">
        <el-radio-group v-model="person.solo">
          <el-radio id="single-all" label="route@all" @click.native.prevent="clickitem('route@all')">
            全体用户
          </el-radio>
          <el-radio id="single-user" label="user@" @click.native.prevent="clickitem('user@')">
            指定用户
          </el-radio>
        </el-radio-group>
        <el-select id="change-user" v-if="showUser" v-model="user" multiple filterable placeholder="请选择" @change="handleChange(['route@', 'user@'], user)">
          <el-option v-for="(item, index) in userList" :key="index" :label="item.text" :value="item.code" />
        </el-select>
      </el-form-item>
      <el-form-item label="小组">
        <el-select id="change-group" v-model="person.group" multiple filterable placeholder="请选择小组" @change="handleChange('group@', person.group)">
          <el-option v-for="(item, index) in groupList" :key="index" :label="item.text" :value="item.code" />
        </el-select>
      </el-form-item>
      <el-form-item label="角色">
        <el-select id="change-role" v-model="person.role" multiple filterable placeholder="请选择角色" @change="handleChange('role@', person.role)">
          <el-option v-for="(item, index) in roleList" :key="index" :label="item.text" :value="item.code" />
        </el-select>
      </el-form-item>
      <el-form-item label="机构">
        <el-select id="change-role" v-model="person.organ" multiple filterable placeholder="请选择角色" @change="handleChange('organ@', person.organ)">
          <el-option v-for="(item, index) in orgList" :key="index" :label="item.text" :value="item.code" />
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { getExtension } from '@/utils'

export default {
  props: {
    modeler: {
      type: Object,
      default: () => {}
    },
    bpmnElements: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      person: {
        solo: null,
        group: [],
        role: [],
        organ: []
      },
      user: [],
      showUser: false
    }
  },
  computed: {
    ...mapGetters([
      'groupList',
      'roleList',
      'userList',
      'orgList',
      'emptyStartAssign'
    ])
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      // 初始化节点人员显示
      if (this.emptyStartAssign) {
        const solo = this.emptyStartAssign.solo
        solo.forEach(item => {
          if (item === 'route@all') {
            this.person.solo = 'route@all'
            this.user = []
            this.showUser = false
          } else {
            this.person.solo = 'user@'
            this.user = solo
            this.showUser = true
          }
        })
        this.person.group = this.emptyStartAssign.group
        this.person.role = this.emptyStartAssign.role
        this.person.organ = this.emptyStartAssign.organ
      }
    },
    changeRemove(val) {
      const analysis = getExtension(this.bpmnElements.businessObject, 'enfo:NoneEventDefinition')
      if (analysis) {
        const extensionElements = this.bpmnElements.businessObject.get('extensionElements')
        const values = this.bpmnElements.businessObject.extensionElements.values
        if (analysis.assigns) {
          analysis.assigns.forEach((element, index) => {
            element.assign = element.assign.filter(item => {
              return item.text.indexOf(val) === -1
            })
            if (element.assign.length < 1) {
              delete analysis.assigns
            }
          })
        }

        this.modeler.get('modeling').updateProperties(this.bpmnElements, {extensionElements: values.length > 0 ? extensionElements : undefined})
      }
    },
    setPerson(events) {
      // bpmn xml中添加人员信息元素
      const moddle = this.modeler.get('moddle')
      const businessObject = this.bpmnElements.businessObject
      let assignElements = null
      let analysis = getExtension(businessObject, 'enfo:NoneEventDefinition')
      let extensionElements = businessObject.get('extensionElements')

      if (!analysis) {
        analysis = moddle.create('enfo:NoneEventDefinition')
        extensionElements = businessObject.extensionElements || moddle.create('bpmn:ExtensionElements')
        extensionElements.get('values').push(analysis)

      }
      analysis.assigns = analysis.assigns || [moddle.create('enfo:Assigns')]
      analysis.assigns[0].assign = analysis.assigns[0].assign || []

      events.forEach(item => {
        assignElements = moddle.create('enfo:Assign', { text: item })
        analysis.assigns[0].assign.push(assignElements)
      })

      this.modeler.get('modeling').updateProperties(this.bpmnElements, {extensionElements: extensionElements})
    },
    handleChange(code, val) {
      if (Array.isArray(code)) {
        code.forEach(item => {
          this.changeRemove(item)
        })
      } else {
        this.changeRemove(code)
      }
      if (val.length > 0) {
        this.setPerson(val)
      }
    },
    clickitem(e) {
      e === this.person.solo ? this.person.solo = '' : this.person.solo = e

      if (this.person.solo === '') {
        this.showUser = false
        this.user = []
        this.changeRemove('user@')
        this.changeRemove('route@')
      } else if (this.person.solo === 'user@') {
        this.showUser = true
        this.changeRemove('route@')
      } else {
        this.showUser = false
        this.user = []
        this.changeRemove('user@')
        this.setPerson([this.person.solo])
      }
    }
  }
}
</script>
