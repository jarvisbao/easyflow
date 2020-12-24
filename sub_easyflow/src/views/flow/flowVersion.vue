<template>
  <div class="app-container">
    <common-title />
    <el-table
      v-loading="loading"
      :data="items"
      tooltip-effect="dark"
      style="width: 100%"
    >
      <el-table-column prop="name" label="流程标题" width="220" />
      <el-table-column prop="namespace" show-overflow-tooltip label="命名空间" width="260" />
      <el-table-column prop="status" label="状态" width="120">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status==='draft'" type="primary" size="mini">
            草稿
          </el-button>
          <el-button v-if="scope.row.status==='activate'" type="success" size="mini">
            激活
          </el-button>
          <el-button v-if="scope.row.status==='suspend'" type="info" size="mini">
            中止
          </el-button>
        </template>
      </el-table-column>
      <el-table-column prop="version" label="版本" width="120" />
      <el-table-column prop="description" show-overflow-tooltip label="描述" />
      <el-table-column :formatter="bool_to_str" prop="isMain" show-overflow-tooltip label="主版本" />
      <el-table-column align="right">
        <template slot-scope="scope">
          <i id="design" class="iconfont icon-liucheng" @click="design(scope.row)" />
          <!-- <span v-if="!scope.row.isMain" @click="setMain(scope.row)" class="cell-btn">设为主版本</span> -->
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-if="dialogDesign" :visible.sync="dialogDesign" :fullscreen="true" :close-on-click-modal="false" :show-close="false" class="design-dialog">
      <flow-design :obj-items="objItems" @show="designShow" />
    </el-dialog>
  </div>
</template>
<script>
import CommonTitle from '@/components/CommonTitle'
import flowDesign from '@/views/design/index'

export default {
  components: {
    CommonTitle,
    flowDesign
  },
  data() {
    return {
      loading: false,
      items: [],
      namespace: null,
      dialogDesign: false,
      text: null,
      page_size: 10,
      pagination: {
        total: 10,
        page: 1
      },
      layout: 'sizes, prev, pager, next',
      objItems: []
    }
  },
  created() {
    this.fetchData()
    this.initData()
  },
  methods: {
    get_namespace() {
      if ('namespace' in this.$route.query) {
        this.namespace = this.$route.query.namespace
      }
    },
    fetchData() {
      this.get_namespace()
      this.loading = true
      this.$Apis.flow.version_all(this.namespace).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.loading = false
          this.items = response.payload.items
        }
      })
    },
    initData() {
      // 业务对象列表
      this.$Apis.project.project_list(this.text, this.pagination.page, this.page_size, false).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          response.payload.items.forEach(element => {
            this.objItems.push({
              name: element.proj_name,
              code: element.proj_code,
              obj: []
            })
          })
          this.objItems.forEach(element => {
            this.$Apis.object.object_list(element.code, this.text, this.pagination.page, this.page_size, false).then(response => {
              if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
                element.obj.push(...response.payload.items)
              }
            })
          })
        }
      })
    },
    bool_to_str(row, column, cellValue, index) {
      if (cellValue) {
        return '是'
      } else {
        return '否'
      }
    },
    design(row) {
      this.$Apis.flow.flow_info(row.flow_id).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.$store.commit('SET_FLOW_INFO', response.payload)
          this.dialogDesign = !this.dialogDesign
        } else {
          this.$alert(response.message, '提示', {
            confirmButtonText: '确定'
          })
        }
      })
    },
    // setMain(row) {
    //   this.$confirm('确认设为主版本吗?', '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   }).then(() => {
    //     this.$Apis.flow.set_main_version(row.flow_id).then(response => {
    //       if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
    //         this.fetchData()
    //       } else {
    //         this.$alert(response.message, '提示', {
    //           confirmButtonText: '确定'
    //         })
    //       }
    //     })
    //   }).catch(() => {
    //   })
    // },
    refresh() {
      this.fetchData()
    },
    designShow() {
      this.dialogDesign = !this.dialogDesign
      this.refresh()
    }
  }
}
</script>
<style lang="scss" scoped>
.icon-liucheng {
  margin: 0 3px;
  color: #c5c5c5;
  cursor: pointer;
  &:hover {
    color: #f84c5d;
  }
}
.design-dialog {
  & /deep/ .el-dialog__header {
    display: none;
  }
  & /deep/ .el-dialog__body {
    padding: 0;
  }
}
</style>
