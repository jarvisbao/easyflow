<template>
  <div class="app-container">
    <common-title />
    <div class="action-btn clearfix">
      <div id="create" class="btn create-btn" @click="create">
        新建
      </div>
      <div id="removes" class="btn create-btn" @click="removes">
        删除所选
      </div>
      <div class="btn export-btn" @click="download">
        导出
      </div>
      <el-upload
        :show-file-list="false"
        :auto-upload="false"
        :on-change="Upload"
        action=""
        class="upload-demo"
      >
        <el-button size="small" type="primary" class="btn import-btn">
          导入
        </el-button>
      </el-upload>
      <div class="right-btn">
        <el-input v-model="text" prefix-icon="el-icon-search" id="search" placeholder="请输入内容" class="search-input" @keyup.enter.native="schfilter" />
      </div>
    </div>
    <div class="flow-container-box">
      <div class="side">
        <div class="side-title">
          流程分类 <i id="add-classify" class="el-icon-plus" @click="addClassify" />
        </div>
        <el-tree :data="classifyTree" :props="defaultProps" :expand-on-click-node="false" default-expand-all>
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span class="text" @click="handleNodeClick(node, data)">{{ data.text }}</span>
            <span v-if="data.text !== '所有分类'">
              <i :id="'remove_' + data.class_id" class="el-icon-delete classify_delete" @click="removeClassify(node, data)" />
            </span>
          </span>
        </el-tree>
      </div>
      <div class="main">
        <el-table
          v-loading="loading"
          :data="items"
          tooltip-effect="dark"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            width="55"
          />
          <el-table-column prop="name" label="流程标题" width="220" />
          <el-table-column prop="namespace" show-overflow-tooltip label="命名空间" />
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
          <el-table-column v-if="showColumn" align="right">
            <template slot-scope="scope">
              <i id="remove" class="el-icon-delete flow_delete" @click="remove(scope.row.namespace)" />
              <i id="design" class="iconfont icon-liucheng" @click="design(scope.row)" />
              <span id="version" class="cell-btn" @click="version(scope.row)">版本管理</span>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="showPage"
          :page-size="page_size"
          :layout="layout"
          :total="pagination.total"
          :current-page="pagination.page"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <el-dialog v-if="dialogVisible" :visible.sync="dialogVisible" :title="dialogTitle" :close-on-click-modal="false">
      <flow-create v-if="isflow" :classify-tree="tree" @show="isShow" @refresh="refresh" />
      <classify-create v-else :classify-tree="tree" @show="isShow" @refresh="refreshClassify" />
    </el-dialog>
    <el-dialog v-if="dialogDesign" :visible.sync="dialogDesign" :fullscreen="true" :close-on-click-modal="false" :show-close="false" class="design-dialog">
      <flow-design @show="designShow" />
    </el-dialog>
  </div>
</template>
<script>
import CommonTitle from '@/components/CommonTitle'
import flowCreate from './components/flowCreate'
import flowDesign from '@/views/design/index'
import classifyCreate from './components/classifyCreate'

export default {
  components: {
    CommonTitle,
    flowCreate,
    flowDesign,
    classifyCreate
  },
  data() {
    return {
      loading: false,
      items: [],
      text: null,
      page_size: 10,
      pagination: {
        total: 10,
        page: 1
      },
      layout: 'sizes, prev, pager, next',
      showColumn: false,
      showPage: false,
      flow_namespaces: [],
      dialogVisible: false,
      dialogTitle: '',
      isflow: false,
      dialogDesign: false,
      classifyTree: [
        {
          text: '所有分类',
          children: []
        }
      ],
      defaultProps: {
        children: 'children',
        label: 'text'
      },
      tree: [],
      class_id: null
    }
  },
  watch: {
    'pagination.total': function(val) {
      if (this.pagination.total === (this.pagination.page - 1) * this.page_size && this.pagination.total !== 0) {
        this.pagination.page -= 1
        this.fetchData(this.text, true, this.pagination.page, this.page_size, this.class_id)
      }
    }
  },
  created() {
    this.get_page_params()
    this.fetchData(this.text, true, this.pagination.page, this.page_size, this.class_id)
    this.treeClassify()
  },
  methods: {
    get_page_params() {
      if (sessionStorage.getItem(this.$route.name)) {
        const pageParams = JSON.parse(sessionStorage.getItem(this.$route.name))
        if (this.$route.path === pageParams.path) {
          this.text = pageParams.text
          this.pagination.page = pageParams.page_index
          this.page_size = pageParams.page_size
        }
      }
    },
    fetchData(text, page, page_index, page_size, class_id) {
      this.loading = true
      this.$Apis.flow.flow_list(text, page, page_index, page_size, class_id).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.loading = false
          this.items = response.payload.items
          this.pagination = response.payload.pagination
          if (this.items.length > 0) {
            this.showColumn = true
            this.showPage = true
          } else {
            this.showColumn = false
            this.showPage = false
          }
        } else {
          this.$alert(response.message, '提示', {
            confirmButtonText: '确定',
            callback: action => {
              this.loading = false
            }
          })
        }
      })
    },
    treeClassify() {
      // 获取流程分类树
      this.$Apis.flow.classify_tree().then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.classifyTree[0].children = response.payload
          this.tree = response.payload
        }
      })
    },
    operateData() {
      this.$Apis.flow.flow_list(this.text, true, this.pagination.page, this.page_size, this.class_id).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.loading = false
          this.items = response.payload.items
          this.pagination = response.payload.pagination
          if (this.items.length > 0) {
            this.showColumn = true
            this.showPage = true
          } else {
            this.showColumn = false
            this.showPage = false
          }
        } else {
          this.$alert(response.message, '提示', {
            confirmButtonText: '确定',
            callback: action => {
              this.loading = false
            }
          })
        }
      })
    },
    schfilter() {
      this.pagination.page = 1
      this.operateData()
    },
    handleSizeChange(val) {
      this.page_size = val
      this.operateData()
    },
    handleCurrentChange(val) {
      this.pagination.page = val
      this.operateData()
    },
    handleSelectionChange(val) {
      this.flow_namespaces = []
      val.forEach(item => {
        this.flow_namespaces.push(item.namespace)
      })
    },
    create() {
      this.dialogVisible = !this.dialogVisible
      this.dialogTitle = '新建流程'
      this.isflow = true
    },
    remove(namespace) {
      this.$confirm('是否删除所选?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'confirm-button',
        cancelButtonClass: 'cancel-button'
      }).then(() => {
        this.$Apis.flow.flow_remove(namespace).then(response => {
          if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
            this.fetchData(this.text, true, this.pagination.page, this.page_size, this.class_id)
          } else {
            this.$alert(response.message, '提示', {
              confirmButtonText: '确定'
            })
          }
        })
      }).catch(() => {
      })
    },
    removes() {
      if (this.flow_namespaces.length > 0) {
        this.$confirm('是否删除所选?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          confirmButtonClass: 'confirm-button',
          cancelButtonClass: 'cancel-button'
        }).then(() => {
          this.$Apis.flow.flow_removes(this.flow_namespaces).then(response => {
            if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
              this.fetchData(this.text, true, this.pagination.page, this.page_size, this.class_id)
            } else {
              this.$alert(response.message, '提示', {
                confirmButtonText: '确定'
              })
            }
          })
        }).catch(() => {
        })
      } else {
        this.$alert('请选择要删除的条目！', '提示', {
          confirmButtonText: '确定'
        })
      }
    },
    set_session() {
      sessionStorage.setItem(this.$route.name, JSON.stringify({ 'path': this.$route.path, 'text': this.text, 'page_index': this.pagination.page, 'page_size': this.page_size }))
    },
    design(row) {
      this.$Apis.flow.flow_info(row.flow_id).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.$store.commit('SET_FLOW_INFO', response.payload)
          this.dialogDesign = !this.dialogDesign
        }
      })
    },
    isShow() {
      this.dialogVisible = !this.dialogVisible
    },
    refresh() {
      this.fetchData(this.text, true, this.pagination.page, this.page_size, this.class_id)
    },
    designShow() {
      this.dialogDesign = !this.dialogDesign
      this.refresh()
    },
    version(row) {
      this.set_session()
      this.$router.push({ name: 'flow_version', query: { namespace: row.namespace, name: row.name }})
    },
    refreshClassify() {
      this.treeClassify()
    },
    addClassify() {
      this.dialogVisible = !this.dialogVisible
      this.dialogTitle = '新建流程分类'
      this.isflow = false
    },
    handleNodeClick(node, data) {
      this.class_id = data.class_id
      this.fetchData(this.text, true, 1, 10, data.class_id)
    },
    removeClassify(node, data) {
      const class_id = data.class_id
      this.$Apis.flow.classify_del(class_id).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.refreshClassify()
        } else {
          this.$alert(response.message, '提示', {
            confirmButtonText: '确定'
          })
        }
      })
    },
    download() {
      this.$Apis.flow.download(this.flow_namespaces).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          var data = response.payload
          var count = Object.keys(data).length
          var fileDownload = require('js-file-download')
          try {
            var isFileSaverSupported = !!new Blob()
          } catch (e) {}
          if (count > 1) {
            var JSZip = require('jszip')
            var zip = JSZip()
            for (var key in data) {
              zip.file(key + '.json', JSON.stringify(data[key]))
            }
            zip.generateAsync({ type: 'blob' })
              .then(function(blob) {
                if (isFileSaverSupported) {
                  saveAs(blob, '流程定义备份.zip')
                } else {
                  fileDownload(blob, '流程定义备份.zip')
                }
              })
          } else if (count === 1) {
            for (var key in data) {
              if (isFileSaverSupported) {
                var blob = new Blob([JSON.stringify(data[key])], { type: 'text/plain;charset=utf-8' })
                saveAs(blob, key + '.json')
              } else {
                fileDownload(JSON.stringify(data[key]), key + '.json')
              }
            }
          } else {
            fileDownload(data, 'flow.json')
          }
        } else {
          this.$alert(response.data.message, '提示', {
            confirmButtonText: '确定'
          })
        }
      })
    },
    Upload(f, fileList) {
      var file = f.raw
      this.datas = []
      if (file.name.endsWith('.zip')) {
        var JSZip = require('jszip')
        var zip = JSZip()
        const that = this
        zip.loadAsync(file) // 1) read the Blob
          .then(function(zip) {
            var datas = []
            var count = 0
            var json_num = Object.getOwnPropertyNames(zip.files).length
            zip.forEach(function(relativePath, zipEntry) { // 2) print entries
              if (zipEntry.name.endsWith('.json')) {
                zip.file(zipEntry.name).async('string').then(function(data) {
                  try {
                    JSON.parse(data)
                  } catch (error) {
                    that.$alert('文件内容需要是json格式', '提示', {
                      confirmButtonText: '确定',
                      callback: action => {
                        return false
                      }
                    })
                  }
                  datas.push(JSON.parse(data))
                  count += 1
                  if (json_num === count) {
                    that.$Apis.flow.upload(datas).then(response => {
                      if (response.code !== that.$Utils.Constlib.ERROR_CODE_OK) {
                        that.$alert(response.message, '提示', {
                          confirmButtonText: '确定'
                        })
                      } else {
                        that.$alert('导入成功!', '提示', {
                          confirmButtonText: '确定',
                          callback: action => {
                            that.refresh()
                          }
                        })
                      }
                    })
                  }
                })
              }
            })
          })
      } else if (file.name.endsWith('.json')) {
        this.datas = []
        var reader = new FileReader()
        const that = this
        reader.readAsText(file, 'UTF-8')
        reader.onload = function(evt) {
          var data = evt.target.result
          try {
            JSON.parse(data)
          } catch (error) {
            that.$alert('文件内容需要是json格式', '提示', {
              confirmButtonText: '确定',
              callback: action => {
                return false
              }
            })
          }
          that.datas.push(JSON.parse(data))
          that.$Apis.flow.upload(that.datas).then(response => {
            if (response.code !== that.$Utils.Constlib.ERROR_CODE_OK) {
              that.$alert(response.message, '提示', {
                confirmButtonText: '确定'
              })
            } else {
              that.$alert('导入成功!', '提示', {
                confirmButtonText: '确定',
                callback: action => {
                  that.refresh()
                }
              })
            }
          })
        }
      } else {
        this.$alert('请导入.zip格式或.json格式的文件', '提示', {
          confirmButtonText: '确定',
          callback: action => {
            return false
          }
        })
      }
      fileList = []
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
