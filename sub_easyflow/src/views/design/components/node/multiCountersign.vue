<template>
  <div class="multi-countersign">
    <el-form :model="countersign" label-width="120px">
      <el-form-item label="是否多实例会签">
        <el-switch v-model="countersign.open" @change="handleChange" />
      </el-form-item>
      <template v-if="countersign.open">
        <el-form-item label="计票策略">
          <el-radio-group v-model="countersign.strategy" size="small" @change="changeStrategy">
            <el-radio-button id="percentage" label="percentage">
              百分比
            </el-radio-button>
            <el-radio-button id="vote" label="vote">
              投票数
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="countersign.strategy == 'percentage' ? '百分比' : '投票数'">
          <el-input id="win-out" v-model="countersign.win_out" type="number" min="0" @change="changeWinOut" @input="countersign.win_out=countersign.win_out.replace(/[^\d.]/g, '')">
            <template v-if="countersign.strategy == 'percentage'" slot="append">
              %
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="搜集所有投票">
          <el-switch v-model="countersign.all_user" @change="changeAllUser" />
        </el-form-item>
        <el-form-item label="抽取人员">
          <el-switch v-model="countersign.extract" @change="changeExtract" />
        </el-form-item>
        <el-form-item label="权重">
          <el-radio-group v-model="countersign.weight_mode" @change="changeWeightMode">
            <el-radio :label="true">
              同意
            </el-radio>
            <el-radio :label="false">
              否决
            </el-radio>
          </el-radio-group>
          <el-form label-width="50px" style="width: 100%">
            <el-form-item label="人员">
              <span class="add-user" @click="addUser"><i class="el-icon-circle-plus-outline" /></span>
              <ul class="list">
                <li v-for="(item, index) in countersign.user_list" :key="item.code">
                  <el-input v-model="item.weight" placeholder="请输入权重值" type="number" size="small" min="0" class="input-group" @change="changeUserWeight" @input="item.weight=item.weight.replace(/[^\d.]/g, '')">
                    <template slot="prepend">
                      {{ item.text }}
                    </template>
                  </el-input>
                  <i class="el-icon-delete delete" @click="removeUser(item, index)" />
                </li>
              </ul>
            </el-form-item>
            <el-form-item label="小组">
              <span class="add-group" @click="addGroup"><i class="el-icon-circle-plus-outline" /></span>
              <ul class="list">
                <li v-for="(item, index) in countersign.group_list" :key="item.code">
                  <el-input v-model="item.weight" placeholder="请输入权重值" type="number" size="small" min="0" class="input-group" @change="changeGroupWeight" @input="item.weight=item.weight.replace(/[^\d.]/g, '')">
                    <template slot="prepend">
                      {{ item.text }}
                    </template>
                  </el-input>
                  <i class="el-icon-delete delete" @click="removeGroup(item, index)" />
                </li>
              </ul>
            </el-form-item>
            <el-form-item label="角色">
              <span class="add-role" @click="addRole"><i class="el-icon-circle-plus-outline" /></span>
              <ul class="list">
                <li v-for="(item, index) in countersign.role_list" :key="item.code">
                  <el-input v-model="item.weight" placeholder="请输入权重值" type="number" size="small" min="0" class="input-group" @change="changeRoleWeight" @input="item.weight=item.weight.replace(/[^\d.]/g, '')">
                    <template slot="prepend">
                      {{ item.text }}
                    </template>
                  </el-input>
                  <i class="el-icon-delete delete" @click="removeRole(item, index)" />
                </li>
              </ul>
            </el-form-item>
            <el-form-item label="机构">
              <span class="add-organ" @click="addOrgan"><i class="el-icon-circle-plus-outline" /></span>
              <ul class="list">
                <li v-for="(item, index) in countersign.organ_list" :key="item.code">
                  <el-input v-model="item.weight" placeholder="请输入权重值" type="number" size="small" min="0" class="input-group" @change="changeOrganWeight" @input="item.weight=item.weight.replace(/[^\d.]/g, '')">
                    <template slot="prepend">
                      {{ item.text }}
                    </template>
                  </el-input>
                  <i class="el-icon-delete delete" @click="removeOrgan(item, index)" />
                </li>
              </ul>
            </el-form-item>
          </el-form>
        </el-form-item>
        <el-form-item label="背靠背">
          <el-select v-model="countersign.backToBack" multiple placeholder="请选择" @change="changeBackToBack">
            <el-option label="过程中不可见" value="course_no_see" />
            <el-option label="结果不可见" value="result_no_see" />
            <el-option label="完成后过程可见" value="complete_course_see" />
          </el-select>
        </el-form-item>
        <el-form-item label="过程/结果可见">
          <person :modeler="modeler" :bpmn-elements="bpmnElements" :is-countersign="true" />
        </el-form-item>
        <el-form-item label="投票表单">
          <el-radio-group v-model="countersign.formType" size="small" @change="changeType">
            <el-radio-button label="method">
              自定义表单
            </el-radio-button>
            <el-radio-button label="vmodule">
              系统表单
            </el-radio-button>
          </el-radio-group>
          <el-select id="method-form" v-if="countersign.formType === 'method'" v-model="countersign.voteform" filterable clearable value-key="mtd_id" placeholder="请选择" @change="changeMethodForm">
            <el-option v-for="item in method_list" :key="item.mtd_id" :label="item.mtd_name" :value="item" />
          </el-select>
          <el-select id="method-form" v-if="countersign.formType === 'vmodule'" v-model="countersign.voteform" filterable clearable placeholder="请选择" @change="changeVform">
            <el-option v-for="item in module_list" :key="item.name" :value="item.name" :label="item.label">
              <span style="float: left">{{ item.label }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.name }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="投票结果表单">
          <el-radio-group v-model="countersign.resultFormType" size="small" @change="changeResultType">
            <el-radio-button label="method">
              自定义表单
            </el-radio-button>
            <el-radio-button label="vmodule">
              系统表单
            </el-radio-button>
          </el-radio-group>
          <el-select id="method-form" v-if="countersign.resultFormType === 'method'" v-model="countersign.voteResultForm" filterable clearable value-key="mtd_id" placeholder="请选择" @change="changeResultMform">
            <el-option v-for="item in method_list" :key="item.mtd_id" :label="item.mtd_name" :value="item" />
          </el-select>
          <el-select id="method-form" v-if="countersign.resultFormType === 'vmodule'" v-model="countersign.voteResultForm" filterable clearable placeholder="请选择" @change="changeResultVform">
            <el-option v-for="item in module_list" :key="item.name" :value="item.name" :label="item.label">
              <span style="float: left">{{ item.label }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.name }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </template>
    </el-form>
    <el-dialog v-if="dialogVisible" :visible.sync="dialogVisible" :close-on-click-modal="false" :title="dialogTitle" append-to-body destroy-on-close>
      <div>
        <el-form ref="weightForm" :model="weight" label-width="80px">
          <template v-if="dialogUser">
            <el-form-item label="人员">
              <el-select id="change-solo" v-model="weight.user" multiple filterable value-key="code" placeholder="请选择人员">
                <el-option v-for="(item, index) in userList" :key="index" :label="item.text" :value="item" />
              </el-select>
            </el-form-item>
          </template>
          <template v-else-if="dialogGroup">
            <el-form-item label="小组">
              <el-select id="change-group" v-model="weight.group" multiple filterable value-key="code" placeholder="请选择小组">
                <el-option v-for="(item, index) in groupList" :key="index" :label="item.text" :value="item" />
              </el-select>
            </el-form-item>
          </template>
          <template v-else-if="dialogRole">
            <el-form-item label="角色">
              <el-select id="change-role" v-model="weight.role" multiple filterable value-key="code" placeholder="请选择角色">
                <el-option v-for="(item, index) in roleList" :key="index" :label="item.text" :value="item" />
              </el-select>
            </el-form-item>
          </template>
          <template v-else>
            <el-form-item label="机构">
              <el-select id="change-organ" v-model="weight.organ" multiple filterable value-key="code" placeholder="请选择角色">
                <el-option v-for="(item, index) in orgList" :key="index" :label="item.text" :value="item" />
              </el-select>
            </el-form-item>
          </template>
          <el-form-item>
            <el-button id="confirm" type="primary" @click="getModale">
              确 定
            </el-button>
            <el-button id="cancel" @click="dialogVisible = false">
              取 消
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { getExtension } from '@/utils'
import moduleForm from '@/components/moduleForm/index'
import person from './person'

export default {
  components: {
    person
  },
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
      countersign: {
        open: false,
        strategy: 'percentage',
        win_out: null,
        all_user: false,
        extract: false,
        weight_mode: true,
        user_list: [],
        group_list: [],
        role_list: [],
        organ_list: [],
        backToBack: [],
        formType: null,
        voteform: null,
        resultFormType: null,
        voteResultForm: null
      },
      weight: {
        user: [],
        group: [],
        role: [],
        organ: []
      },
      module_list: moduleForm,
      dialogVisible: false,
      dialogTitle: '',
      dialogUser: false,
      dialogGroup: false,
      dialogRole: false
    }
  },
  computed: {
    ...mapGetters([
      'groupList',
      'userList',
      'roleList',
      'orgList',
      'countersign_info',
      'method_list'
    ])
  },
  watch: {
    countersign_info: {
      handler(val) {
        if (val) {
          this.countersign = val
        } else {
          this.countersign.open = false
        }
      }
    }
  },
  created() {
    if (this.countersign_info) {
      this.countersign = this.countersign_info
    }
  },
  methods: {
    addUser() {
      this.dialogVisible = !this.dialogVisible
      this.dialogTitle = '选择人员'
      this.dialogUser = true
      this.dialogGroup = false
      this.dialogRole = false
      this.weight.user = []
    },
    addGroup() {
      this.dialogVisible = !this.dialogVisible
      this.dialogTitle = '选择小组'
      this.dialogUser = false
      this.dialogGroup = true
      this.dialogRole = false
      this.weight.group = []
    },
    addRole() {
      this.dialogVisible = !this.dialogVisible
      this.dialogTitle = '选择角色'
      this.dialogUser = false
      this.dialogGroup = false
      this.dialogRole = true
      this.weight.role = []
    },
    addOrgan() {
      this.dialogVisible = !this.dialogVisible
      this.dialogTitle = '选择角色'
      this.dialogUser = false
      this.dialogGroup = false
      this.dialogRole = false
      this.weight.organ = []
    },
    addWeight(arr1, arr2, removecode) {
      const moddle = this.modeler.get('moddle')
      const businessObject = this.bpmnElements.businessObject
      const analysis = getExtension(businessObject, 'enfo:Countersign')
      analysis.weight = analysis.weight || []

      const arr1Ids = arr2.map(item => item.code)
      const result = arr1.filter(item => !arr1Ids.includes(item.code))
      result.forEach(item => {
        this.$set(item, 'weight', null)
      })
      arr2.push(...result)
      analysis.weight = analysis.weight.filter(item => {
        return item.text.indexOf(removecode) === -1
      })

      if (arr2.length > 0) {
        arr2.forEach(item => {
          const ele = moddle.create('enfo:Weight', { weight: item.weight, text: item.code, label: item.text })
          analysis.weight.push(ele)
        })
      }
    },
    getModale() {
      if (this.dialogUser) {
        this.addWeight(this.weight.user, this.countersign.user_list, 'user@')
      } else if (this.dialogGroup) {
        this.addWeight(this.weight.group, this.countersign.group_list, 'group@')
      } else if (this.dialogRole) {
        this.addWeight(this.weight.role, this.countersign.role_list, 'role@')
      } else {
        this.addWeight(this.weight.organ, this.countersign.organ_list, 'organ@')
      }
      this.dialogVisible = !this.dialogVisible
    },
    remove(val) {
      const analysis = getExtension(this.bpmnElements.businessObject, 'enfo:Countersign')
      analysis.weight = analysis.weight.filter(item => {
        return item.text.indexOf(val) === -1
      })
    },
    removeUser(item, index) {
      this.countersign.user_list.splice(index, 1)
      this.remove(item.code)
    },
    removeGroup(item, index) {
      this.countersign.group_list.splice(index, 1)
      this.remove(item.code)
    },
    removeRole(item, index) {
      this.countersign.role_list.splice(index, 1)
      this.remove(item.code)
    },
    removeOrgan(item, index) {
      this.countersign.organ_list.splice(index, 1)
      this.remove(item.code)
    },
    handleChange(val) {
      const moddle = this.modeler.get('moddle')
      const overlays = this.modeler.get('overlays')
      const businessObject = this.bpmnElements.businessObject
      let analysis = getExtension(businessObject, 'enfo:Countersign')
      if (val) {
        if (!analysis) {
          analysis = moddle.create('enfo:Countersign', {
            strategy: this.countersign.strategy,
            all_user: this.countersign.all_user,
            win_out: this.countersign.win_out,
            extract: this.countersign.extract,
            weight_mode: this.countersign.weight_mode
          })
          businessObject.extensionElements = businessObject.extensionElements || moddle.create('bpmn:ExtensionElements')
          businessObject.extensionElements.get('values').push(analysis)

          overlays.add(this.bpmnElements.id, {
            position: { bottom: 20, left: 60 },
            html: '<i class="confont icon-huiqianrenwu" style="font-size: 14px; color: #000; font-weight: bold"></i>'
          })
        }
      } else {
        if (analysis) {
          const values = this.bpmnElements.businessObject.extensionElements.values
          values.forEach((item, index) => {
            if (item.$type === 'enfo:Countersign') {
              values.splice(index, 1)
            }
          })
          if (values.length < 1) {
            delete this.bpmnElements.businessObject.extensionElements
          }
          overlays.remove({ element: this.bpmnElements.id })
        }
      }
    },
    changeStrategy(val) {
      const analysis = getExtension(this.bpmnElements.businessObject, 'enfo:Countersign')
      analysis.strategy = val
    },
    changeWinOut(val) {
      const analysis = getExtension(this.bpmnElements.businessObject, 'enfo:Countersign')
      analysis.win_out = val
    },
    changeAllUser(val) {
      const analysis = getExtension(this.bpmnElements.businessObject, 'enfo:Countersign')
      analysis.all_user = val
    },
    changeExtract(val) {
      const analysis = getExtension(this.bpmnElements.businessObject, 'enfo:Countersign')
      analysis.extract = val
    },
    changeWeightMode(val) {
      const analysis = getExtension(this.bpmnElements.businessObject, 'enfo:Countersign')
      analysis.weight_mode = val
    },
    changeUserWeight(val) {
      this.addWeight([], this.countersign.user_list, 'user@')
    },
    changeGroupWeight(val) {
      this.addWeight([], this.countersign.group_list, 'group@')
    },
    changeRoleWeight(val) {
      this.addWeight([], this.countersign.role_list, 'role@')
    },
    changeOrganWeight(val) {
      this.addWeight([], this.countersign.organ_list, 'organ@')
    },
    changeBackToBack(val) {
      const moddle = this.modeler.get('moddle')
      const businessObject = this.bpmnElements.businessObject
      const analysis = getExtension(businessObject, 'enfo:Countersign')
      analysis.backToBack = []
      val.forEach(item => {
        const ele = moddle.create('enfo:BackToBack', { text: item })
        analysis.backToBack.push(ele)
      })
    },
    addForm(node, props, result, bool, formType) {
      const moddle = this.modeler.get('moddle')
      const businessObject = this.bpmnElements.businessObject
      const analysis = getExtension(businessObject, 'enfo:Countersign')

      if (bool) {
        const ele = moddle.create(node, props)
        if (formType === 'vote') {
          analysis.voteForm = [moddle.create('enfo:VoteForm')]
          analysis.voteForm[0][result] = []
          analysis.voteForm[0][result] = [ele]
        }
        if (formType === 'voteResult') {
          analysis.voteResultForm = [moddle.create('enfo:VoteResultForm')]
          analysis.voteResultForm[0][result] = []
          analysis.voteResultForm[0][result] = [ele]
        }
      } else {
        if (formType === 'vote') {
          analysis.voteForm = null
        }
        if (formType === 'voteResult') {
          analysis.voteResultForm = null
        }
      }
    },
    changeMethodForm(val) {
      let bool = false
      if (val) {
        bool = true
      } else {
        bool = false
      }
      this.addForm('enfo:EditForm', { text: val.mtd_id, owner: val.object_code, proj_code: val.proj_code }, 'edit_forms', bool, 'vote')
    },
    changeVform(val) {
      let bool = false
      if (val) {
        bool = true
      } else {
        bool = false
      }
      this.addForm('enfo:ModuleForm', { module_name: val }, 'moduleForm', bool, 'vote')
    },
    changeType(val) {
      this.$nextTick(() => {
        this.countersign.voteform = null
      })
    },
    changeResultMform(val) {
      let bool = false
      if (val) {
        bool = true
      } else {
        bool = false
      }
      this.addForm('enfo:EditForm', { text: val.mtd_id, owner: val.object_code, proj_code: val.proj_code }, 'edit_forms', bool, 'voteResult')
    },
    changeResultVform(val) {
      let bool = false
      if (val) {
        bool = true
      } else {
        bool = false
      }
      this.addForm('enfo:ModuleForm', { module_name: val }, 'moduleForm', bool, 'voteResult')
    },
    changeResultType(val) {
      this.$nextTick(() => {
        this.countersign.voteResultForm = null
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.add-user, .add-group, .add-role, .add-organ {
  font-size: 20px;
  color: #969696;
  cursor: pointer;
  &:hover {
    color: #409eff;
  }
}
.list li {
  display: flex;
  align-items: center;
  .input-group {
    width: 90% !important;
  }
  .delete {
    margin-left: 12px;
    font-size: 18px;
    color: #969696;
    cursor: pointer;
    &:hover {
      color: #409eff;
    }
  }
  & + li {
    margin-top: 8px;
  }
}
.assign-list {
  // border: 1px solid #DCDFE6;
  // border-radius: 4px;
  margin-bottom: 8px;
  // padding: 0 8px;
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
