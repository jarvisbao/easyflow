<template>
  <div class="add-tool">
    <el-form ref="form" :model="addTool" :rules="rules" label-width="120px">
      <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane label="自定义URL" name="userDefined">
          <el-form-item label="URL地址" prop="ss_path">
            <el-input id="path" v-model="addTool.ss_path" placeholder="请输入URL地址" />
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="菜单" name="userMenu">
          <el-form-item label="选择菜单" prop="menu">
            <el-cascader
              v-model="addTool.menu"
              :options="menuOptions"
              :props="prop"
              :emit-path="false"
              :show-all-levels="false"
              placeholder="请选择菜单"
              @change="handleChange"
            />
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="管理" name="user-shortcut">
          <div class="shortcut-box">
            <template v-if="visible">
              您还没有自定义的菜单
            </template>
            <ul v-else>
              <li v-for="(item, index) in userList" :key="index">
                <i v-if="item.icon" :class="item.icon" class="iconfont" />
                <i v-else class="el-icon-folder" />
                <span>{{ item.ss_title }}<i class="el-icon-circle-close" @click="handleRemove(index)" /></span>
              </li>
            </ul>
          </div>
        </el-tab-pane>
      </el-tabs>
      <template v-if="show">
        <el-form-item label="标题" prop="ss_title">
          <el-input v-if="activeName=='userDefined'" id="title" v-model="addTool.ss_title" placeholder="请输入自定义菜单标题" />
          <el-input v-if="activeName=='userMenu'" id="mentTitle" v-model="addTool.ss_title" placeholder="请输入自定义菜单标题" />
        </el-form-item>
        <el-form-item label="是否新窗口打开">
          <el-switch v-model="addTool.open_type" />
        </el-form-item>
      </template>
      <el-form-item>
        <el-button id="submit" v-loading="loading" type="danger" @click="submitForm('form')">
          保存
        </el-button>
        <el-button id="cancel" plain @click="resetForm('form')">
          取消
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>

export default {
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      activeName: 'userDefined',
      addTool: {
        ss_type: '',
        ss_path: '',
        ss_title: '',
        open_type: false,
        menu: '',
        icon: ''
      },
      rules: {
        ss_path: [{ required: true, message: '请输入URL地址', trigger: 'blur' }],
        ss_title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        menu: [{ required: true, message: '请选择菜单', trigger: 'change' }]
      },
      menuOptions: [],
      prop: { value: 'menu_code', label: 'label', children: 'children' },
      show: true,
      meunPath: [],
      visible: false,
      loading: false,
      new_content_config: [],
      wdgtItems: [],
      userList: this.data
    }
  },
  watch: {
    // data: {
    //   deep: true,
    //   handler(val) {
    //   }
    // }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.$Apis.menu.menu_all_tree().then(response => {
        this.menuOptions = response.payload
        const meunPath = []
        const getStr = function(list) {
          list.forEach(function(row) {
            if (row.children) {
              getStr(row.children)
            } else {
              meunPath.push({
                title: row.title,
                path: row.uri,
                menu_code: row.menu_code,
                icon: row.icon
              })
            }
          })
        }
        getStr(response.payload)
        this.meunPath = meunPath
      })
      this.$store.dispatch('GetInfo').then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.userinfo = response.payload
          this.wdgtItems = JSON.parse(JSON.stringify(this.userinfo.widgets_json.tool_config))
        }
      })
    },
    handleClick(tab) {
      if (tab.name === 'user-shortcut') {
        this.show = false
      } else {
        this.show = true
      }
    },
    handleChange(value) {
      this.meunPath.forEach(item => {
        if (value[value.length - 1] === item.menu_code) {
          this.addTool.ss_title = item.title
        }
      })
    },
    submitForm(formName) {
      switch (this.activeName) {
        case 'userDefined':
          this.addTool.ss_type = 'url'
          this.rules.menu.splice(0, 1)
          break
        case 'userMenu':
          this.addTool.ss_type = 'menu'
          this.meunPath.forEach(item => {
            if (item.menu_code === this.addTool.menu[this.addTool.menu.length - 1]) {
              this.addTool.ss_path = item.path
              this.addTool.icon = item.icon
            }
          })
          this.rules.ss_path.splice(0, 1)
          break
        case 'user-shortcut':
          this.rules.menu.splice(0, 1)
          this.rules.ss_path.splice(0, 1)
          this.rules.ss_title.splice(0, 1)
          break
      }
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.loading = true
          const openid = this.userinfo.openid
          const gender = this.userinfo.gender
          const birthday = this.userinfo.birthday
          const last_name = this.userinfo.last_name
          const first_name = this.userinfo.first_name
          const props = this.userinfo.props
          const head_id = this.userinfo.head_id

          if (this.activeName !== 'user-shortcut') {
            this.userinfo.widgets_json.tool_config.push(this.addTool)
          }

          this.$Apis.user.user_update(openid, gender, birthday, last_name, first_name, props, head_id, this.userinfo.widgets_json).then(response => {
            if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
              this.$alert('更新成功!', '提示', {
                confirmButtonText: '确定',
                callback: action => {
                  this.$emit('show', this.userinfo.widgets_json.tool_config)
                }
              })
            } else {
              this.$alert(response.message, '提示', {
                confirmButtonText: '确定'
              })
            }
          })
        } else {
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
      this.$emit('show', this.wdgtItems)
    },
    handleRemove(index) {
      this.userList.splice(index, 1)
      this.userinfo.widgets_json.tool_config.splice(index, 1)
    }
  }
}
</script>
<style lang="scss" scoped>
.add-tool {
  margin-top: -20px;
  .el-cascader {
    width: 100%;
  }
  .shortcut-box {
    margin-bottom: 20px;
    li {
      padding: 8px;
      line-height: 24px;
      .el-icon-folder {
        font-size: 20px;
        color: #519fe4;
        vertical-align: -2px;
      }
      i {
        font-size: 20px;
        color: #519fe4;
      }
      span {
        position: relative;
        i {
          position: absolute;
          top: -6px;
          margin-left: 4px;
          font-size: 16px;
          cursor: pointer;
        }
      }
    }
  }
}
</style>

