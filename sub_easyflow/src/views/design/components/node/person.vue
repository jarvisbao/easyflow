<template>
  <div>
    <el-form :model="person" label-width="80px" style="width: 100%;">
      <el-form-item label="人员">
        <div v-show="assign.length > 0" class="assign-list">
          <span v-for="(item, index) in assign" :key="index">{{ item.text }} <i :id="'assign-remove_' + index" class="el-icon-close" @click="remove(item)" /></span>
        </div>
        <el-select id="change-solo" v-model="person.solo" filterable value-key="code" placeholder="请选择人员" @change="changeSolo">
          <el-option v-for="(item, index) in route_list" :key="index" :label="item.text" :value="item" />
        </el-select>
        <el-select id="change-user" v-if="showUser" v-model="user" filterable value-key="code" placeholder="请选择" style="margin-top: 8px;">
          <el-option v-for="(item, index) in userList" :key="index" :label="item.text" :value="item" />
        </el-select>
        <el-select id="change-node" v-if="showNode" v-model="node" :multiple="person.solo.code=='route@node_post@[node_name]@[role_code]' ? false : true" filterable value-key="node_id" placeholder="请选择" style="margin-top: 8px;" @visible-change="changeNode">
          <el-option v-for="(item, index) in node_list" :key="index" :label="item.name" :value="item" />
        </el-select>
        <template v-if="showForm">
          <el-input v-model="route_form" placeholder="请填写表单名" style="margin-top: 8px;" />
          <el-input v-model="field" placeholder="请填写字段名" style="margin-top: 8px;" @change="changeField" />
        </template>
        <el-select id="change-assign-org" v-if="showOrg" v-model="org" filterable value-key="code" placeholder="请选择" style="margin-top: 8px;" @visible-change="changeOrg">
          <el-option v-for="(item, index) in postList" :key="index" :label="item.text" :value="item" />
        </el-select>
        <div v-if="showServe" style="display: flex; margin-top: 8px;">
          <el-input v-model="cls" placeholder="请填写服务" @change="changeServe" />
          <el-input v-model="fun" placeholder="请填写服务对应的方法" @change="changeServe" style="margin-left: 12px;" />
        </div>
      </el-form-item>
      <el-form-item :style="{'margin-top': isCountersign ? '10px' : '0'}" label="指定用户">
        <el-select id="change-user-code" v-model="person.user" multiple filterable value-key="code" placeholder="请选择" @change="changeUserCode">
          <el-option v-for="(item, index) in userList" :key="index" :label="item.text" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item :style="{'margin-top': isCountersign ? '10px' : '0'}" label="小组">
        <el-select id="change-group" v-model="person.group" multiple filterable value-key="code" placeholder="请选择小组" @change="changeGroup" @remove-tag="remove">
          <el-option v-for="(item, index) in groupList" :key="index" :label="item.text" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item :style="{'margin-top': isCountersign ? '10px' : '0'}" label="角色">
        <el-select id="change-role" v-model="person.role" multiple filterable value-key="code" placeholder="请选择角色" @change="changeRole" @remove-tag="remove">
          <el-option v-for="(item, index) in roleList" :key="index" :label="item.text" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item :style="{'margin-top': isCountersign ? '10px' : '0'}" label="机构">
        <el-select id="change-org" v-model="person.organ" multiple filterable value-key="code" placeholder="请选择机构" @change="changeOrgCode" @remove-tag="remove">
          <el-option v-for="(item, index) in orgList" :key="index" :label="item.text" :value="item" />
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
    },
    isCountersign: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      person: {
        solo: null,
        group: [],
        role: [],
        user: [],
        organ: []
      },
      assign: [],
      route_to: null,
      user: null,
      node: null,
      org: null,
      cls: null,
      fun: null,
      postList: [],
      route_form: null,
      field: null,
      showUser: false,
      showNode: false,
      showServe: false,
      showForm: false,
      showOrg: false,
      route_list: [],
      countersign: {}
    }
  },
  computed: {
    ...mapGetters([
      'routeList',
      'groupList',
      'roleList',
      'userList',
      'orgList',
      'node_assign',
      'node_list',
      'obj_list',
      'countersign_info'
    ])
  },
  watch: {
    node_assign: {
      handler(val) {
        if (val) {
          this.fetchData()
        } else {
          this.person.group = []
          this.person.role = []
          this.person.user = []
          this.person.organ = []
          this.assign = []
        }
      }
    },
    countersign_info: {
      handler(val) {
        if (val) {
          this.fetchData()
        }
      }
    }
  },
  created() {
    this.fetchData()
  },
  mounted() {
    this.postList = this.roleList.filter(item => {
      return item.type === 'post'
    })
    if (this.isCountersign) {
      this.route_list = this.routeList.filter(item => {
        return item.code !== 'route@all@'
      })
    } else {
      this.route_list = this.routeList
    }
  },
  methods: {
    fetchData() {
      // 初始化节点人员显示
      if (this.node_assign && !this.isCountersign) {
        this.person.group = this.node_assign.group
        this.person.role = this.node_assign.role
        this.person.user = this.node_assign.user
        this.person.organ = this.node_assign.organ
        this.assign = this.node_assign.assign
      } else {
        if (this.countersign_info) {
          this.assign = this.countersign_info.resultSess ? this.countersign_info.resultSess.assign : []
          this.person.group = this.countersign_info.resultSess ? this.countersign_info.resultSess.group : []
          this.person.role = this.countersign_info.resultSess ? this.countersign_info.resultSess.role : []
          this.person.user = this.countersign_info.resultSess ? this.countersign_info.resultSess.user : []
          this.person.organ = this.countersign_info.resultSess ? this.countersign_info.resultSess.organ : []
        }
      }
    },
    changeRemove(val) {
      let analysis = null
      if (!this.isCountersign) {
        analysis = getExtension(this.bpmnElements.businessObject, 'enfo:Assigns')
      } else {
        analysis = getExtension(this.bpmnElements.businessObject, 'enfo:Countersign')
      }

      if (analysis) {
        const values = this.bpmnElements.businessObject.extensionElements.values
        if (!this.isCountersign) {
          analysis.assign = analysis.assign.filter(item => {
            return item.text.indexOf(val) === -1
          })
          if (analysis.assign.length < 1) {
            values.forEach((item, index) => {
              if (item.$type === 'enfo:Assigns') {
                values.splice(index, 1)
              }
            })
          }
          this.getNodeAssign()
        } else {
          // 会签
          if (analysis.courseResultSess) {
            analysis.courseResultSess = analysis.courseResultSess.filter(item => {
              return item.text.indexOf(val) === -1
            })
          }
        }
        if (values.length < 1) {
          delete this.bpmnElements.businessObject.extensionElements
        }
      }
    },
    setPerson(events) {
      const moddle = this.modeler.get('moddle')
      const businessObject = this.bpmnElements.businessObject
      let assignElements = null
      let analysis = null

      if (!this.isCountersign) {
        analysis = getExtension(businessObject, 'enfo:Assigns')
        if (!analysis) {
          analysis = moddle.create('enfo:Assigns')
          businessObject.extensionElements = businessObject.extensionElements || moddle.create('bpmn:ExtensionElements')
          businessObject.extensionElements.get('values').push(analysis)
        }

        analysis.assign = analysis.assign || []
        events.forEach(item => {
          assignElements = moddle.create('enfo:Assign', { text: item.code, name: item.text })
          analysis.assign.push(assignElements)
        })

        this.getNodeAssign()
      } else {
        // 多实例
        analysis = getExtension(businessObject, 'enfo:Countersign')
        analysis.courseResultSess = analysis.courseResultSess || []
        events.forEach(item => {
          assignElements = moddle.create('enfo:CourseResultSess', { text: item.code, name: item.text })
          analysis.courseResultSess.push(assignElements)
        })
      }
    },
    getNodeAssign() {
      const nodeAssign = {
        assign: this.assign,
        group: this.person.group,
        role: this.person.role,
        user: this.person.user,
        organ: this.person.organ
      }
      this.$store.commit('SET_NODE_ASSIGN', nodeAssign)
    },
    changeSolo(val) {
      this.user = null
      this.node = null
      this.org = null
      this.route_to = null
      this.route_form = null
      this.cls = null
      this.fun = null

      if (val.code.indexOf('cls.fun') !== -1) {
        this.showServe = true
      } else {
        this.showServe = false
      }
      if (val.code.indexOf('user_post') !== -1) {
        this.showOrg = true
        this.showUser = true
        this.showNode = false
        this.showForm = false
      } else if (val.code.indexOf('start_post') !== -1 || val.code.indexOf('login_post') !== -1) {
        this.showOrg = true
        this.showUser = false
        this.showNode = false
        this.showForm = false
      } else if (val.code.indexOf('node_post') !== -1) {
        this.showOrg = true
        this.showUser = false
        this.showNode = true
        this.showForm = false
      } else if (val.code.indexOf('node_name') !== -1) {
        this.showNode = true
        this.showOrg = false
        this.showUser = false
      } else if (val.code.indexOf('field_post') !== -1) {
        this.showOrg = true
        this.showUser = false
        this.showForm = true
        this.showNode = false
      } else if (val.code.indexOf('form_name.field_name') !== -1) {
        this.showForm = true
        this.showOrg = false
        this.showNode = false
        this.showUser = false
      } else {
        this.showOrg = false
        this.showUser = false
        this.showNode = false
        this.showForm = false
      }

      if (!this.showUser && !this.showNode && !this.showServe && !this.showForm && !this.showOrg) {
        const solo = this.assign.find(item => {
          return item.code === this.person.solo.code
        })

        if (solo !== undefined) {
          this.$message({
            message: '该选项已存在',
            type: 'warning'
          })
          this.person.solo = null
          return false
        }

        this.assign.push(this.person.solo)
        this.person.solo = null
        this.changeRemove('route@')
        this.setPerson(this.assign)
      }
    },
    changeUserCode(val) {
      this.changeRemove('user@')
      this.setPerson(val)
    },
    changeOrg(val) {
      if (!val && this.org) {
        const assign = []
        const org_code = this.org.code.replace('role@', '')
        if (this.person.solo.code.indexOf('user_post') !== -1) {
          const user_code = this.user.code.replace('user@', '')
          assign.push({
            text: this.person.solo.text + '-' + this.user.text + '-' + this.org.text,
            code: 'route@user_post@' + user_code + '@' + org_code
          })
        }
        if (this.person.solo.code.indexOf('start_post') !== -1 || this.person.solo.code.indexOf('login_post') !== -1) {
          assign.push({
            text: this.person.solo.text + '-' + this.org.text,
            code: this.person.solo.code.replace(/\[(.+?)\]/g, org_code)
          })
        }
        if (this.person.solo.code.indexOf('node_post') !== -1) {
          assign.push({
            text: this.person.solo.text + '-' + this.node.name + '-' + this.org.text,
            code: 'route@node_post@' + this.node.node_id + '@' + org_code
          })
        }
        if (this.person.solo.code.indexOf('field_post') !== -1) {
          assign.push({
            text: this.person.solo.text + '-' + this.route_form + '.' + this.field + '-' + this.org.text,
            code: 'route@field_post@' + this.route_form + '.' + this.field + '@' + org_code
          })
        }

        const arr1Ids = assign.map(item => item.code)
        this.assign = this.assign.filter(item => !arr1Ids.includes(item.code))
        this.assign.push(...assign)
        
        this.changeRemove('route@')
        this.setPerson(this.assign)
        this.$nextTick(() => {
          this.person.solo = null
          this.showUser = false
          this.showOrg = false
          this.showNode = false
          this.showForm = false
        })
      }
    },
    changeNode(val) {
      if (!val && !this.showOrg) {
        const assign = []
        this.node.forEach(item => {
          assign.push({
            text: this.person.solo.text + '-' + item.name,
            code: this.person.solo.code.replace(/\[(.+?)\]/g, item.node_id)
          })
        })
        const arr1Ids = this.node.map(item => item.code)
        this.assign = this.assign.filter(item => !arr1Ids.includes(item.code))

        this.assign.push(...assign)
        this.person.solo = null
        this.node = null
        this.showNode = false
        this.showOrg = false
        this.changeRemove('route@')
        this.setPerson(this.assign)
      }
    },
    changeField(val) {
      if (val && !this.showOrg) {
        const assign = []
        let solo = null
        if (this.person.solo.code.indexOf('field@') !== -1) {
          solo = 'field'
        } else {
          solo = 'field_organ_lead'
        }
        assign.push({
          text: solo + '@' + this.route_form + '.' + val,
          code: this.person.solo.code.replace(/\[(.+?)\]/g, this.route_form + '.' + val)
        })

        const arr1Ids = assign.map(item => item.code)
        this.assign = this.assign.filter(item => !arr1Ids.includes(item.code))

        this.assign.push(...assign)
        this.changeRemove('route@')
        this.setPerson(this.assign)
        this.$nextTick(() => {
          this.person.solo = null
          this.route_form = null
          this.field = null
          this.showForm = false
        })
      }
    },
    changeServe() {
      if (this.cls && this.fun) {
        const value = this.cls + '.' + this.fun
        const single = this.person.solo.code.replace(/\[(.+?)\]/g, value)
        this.assign.push({
          text: value,
          code: single
        })
        this.person.solo = null
        this.route_to = null
        this.showServe = false
        this.changeRemove('route@')
        this.setPerson(this.assign)
      }
    },
    changeRole(val) {
      this.changeRemove('role@')
      this.setPerson(val)
    },
    changeGroup(val) {
      this.changeRemove('group@')
      this.setPerson(val)
    },
    changeOrgCode(val) {
      this.changeRemove('organ@')
      this.setPerson(val)
    },
    remove(val) {
      this.assign.forEach((item, index) => {
        if (item.code === val.code) {
          this.assign.splice(index, 1)
        }
      })
      this.changeRemove(val.code)
    }
  }
}
</script>
<style lang="scss" scoped>
.assign-list {
  margin-bottom: 8px;
  line-height: 35px;
  span {
    display: inline-block;
    height: 24px;
    padding: 0 8px;
    margin-right: 8px;
    background-color: #f4f4f5;
    border: 1px solid #e9e9eb;
    border-radius: 4px;
    color: #909399;
    line-height: 22px;
    font-size: 12px;
    i {
      background: #c0c4cc;
      display: inline-block;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      text-align: center;
      line-height: 14px;
      font-size: 12px;
      cursor: pointer;
      &:hover {
        background: #909399;
        color: #fff;
      }
    }
  }
}
</style>
