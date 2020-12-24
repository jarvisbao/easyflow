<template>
  <div>
    <div v-if="element.wdgt_type==='磁贴式'" :id="'wdgt_' + element.wdgt_id" :style="{background: element.wdgt_color}" class="wdgt-paste">
      <div class="content">
        <i v-if="element.wdgt_icon" :class="element.wdgt_icon" class="confont" />
        <template v-for="(item, index) in element.contentUrlData">
          <div :key="index" class="paste-con">
            <div>
              <p>{{ item[JSON.parse(element.content_config).prop] }}</p>
              {{ JSON.parse(element.content_config).title }}
            </div>
            <div>
              <p>{{ item[JSON.parse(element.content_config).prop2] }}</p>
              {{ JSON.parse(element.content_config).title2 }}
            </div>
          </div>
        </template>
      </div>
      <div v-if="element.more_url" class="more-link">
        <app-link :id="'more'+element.wdgt_id" :to="element.more_url">
          查看更多<i class="el-icon-d-arrow-right" />
        </app-link>
      </div>
    </div>
    <div v-else-if="element.wdgt_type==='0'||element.wdgt_type==='1'">
      <template v-if="element.wdgt_title==='常用工具'">
        <div :id="'wdgt_' + element.wdgt_id" :style="{borderColor: element.wdgt_color}" :class="classObject" class="widget-item">
          <div :style="{background: element.wdgt_color, borderColor: element.wdgt_color}" class="title-bar">
            <div class="name">
              <i v-if="element.wdgt_icon" :class="element.wdgt_icon" />{{ element.wdgt_title }}
            </div>
            <div class="tools">
              <i :id="'edit'+element.wdgt_id" class="el-icon-edit" @click="updateWdgt(element.wdgt_id)" />
              <i :class="{'el-icon-arrow-down':currentTab==element.wdgt_id}" class="el-icon-arrow-up" @click="handleCollapse(element.wdgt_id)" />
            </div>
          </div>
          <div class="wdgt-tools-box">
            <div v-show="currentTab!==element.wdgt_id" style="display: flex; align-items: center;">
              <ul>
                <li v-for="(item, index) in toolList" :key="index">
                  <a :id="'toolLink'+index" :href="item.ss_path" :target="item.open_type?'_blank':'_self'">
                    <i v-if="item.icon" :class="item.icon" />
                    <i v-else class="el-icon-folder" />
                    {{ item.ss_title }}
                  </a>
                </li>
              </ul>
              <i class="el-icon-circle-plus-outline add-icon" @click="addTool" />
            </div>
          </div>
        </div>
      </template>
      <template v-if="element.wdgt_title==='最常使用菜单'">
        <div :id="'wdgt_' + element.wdgt_id" :style="{borderColor: element.wdgt_color}" :class="classObject" class="widget-item">
          <div :style="{background: element.wdgt_color, borderColor: element.wdgt_color}" class="title-bar">
            <div class="name">
              <i v-if="element.wdgt_icon" :class="element.wdgt_icon" />{{ element.wdgt_title }}
            </div>
            <div class="tools">
              <i :id="'edit'+element.wdgt_id" class="el-icon-edit" @click="updateWdgt(element.wdgt_id)" />
              <i :class="{'el-icon-arrow-down':currentTab==element.wdgt_id}" class="el-icon-arrow-up" @click="handleCollapse(element.wdgt_id)" />
            </div>
          </div>
          <div class="wdgt-tools-box">
            <ul v-show="currentTab!==element.wdgt_id">
              <li v-for="(item, index) in lastMenu" :key="index">
                <a :id="'menuLink'+index" :href="item.path">
                  <i v-if="item.icon" :class="item.icon" />
                  <i v-else class="el-icon-folder" />
                  {{ item.title }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </template>
    </div>
    <div v-else :id="'wdgt_' + element.wdgt_id" :style="{borderColor: JSON.parse(element.content_config).border==='obvious'?element.wdgt_color:''}" :class="classObject" class="widget-item">
      <div :style="{background: JSON.parse(element.content_config).border==='obvious'?element.wdgt_color:'', borderColor: JSON.parse(element.content_config).border==='obvious'?element.wdgt_color:''}" class="title-bar">
        <div class="name">
          <i v-if="element.wdgt_icon" :class="element.wdgt_icon" />{{ element.wdgt_title }}
        </div>
        <div class="tools">
          <i v-if="element.wdgt_type==='条目式'||element.wdgt_type==='占比式'" :id="'refresh'+element.wdgt_id" class="el-icon-refresh" @click="handleRefresh(element.wdgt_id)" />
          <i :id="'edit'+element.wdgt_id" class="el-icon-edit" @click="updateWdgt(element.wdgt_id)" />
          <app-link v-if="element.more_url" :id="'more'+element.wdgt_id" :to="element.more_url">
            <i class="icon-gengduo" />
          </app-link>
          <i :class="{'el-icon-arrow-down':currentTab==element.wdgt_id}" class="el-icon-arrow-up" @click="handleCollapse(element.wdgt_id)" />
        </div>
      </div>
      <div class="content">
        <template v-if="element.wdgt_type==='条目式'">
          <ul v-show="currentTab!==element.wdgt_id" v-loading="loading" class="wdgt-list">
            <li v-for="(item, index) in element.contentUrlData" :key="index">
              <a :href="item.mtd_link" :target="JSON.parse(element.content_config).linkopentype==0?'_self':'_blank'">
                <div class="title">{{ item[JSON.parse(element.content_config).title] }}</div>
                <el-tag type="info">{{ item[JSON.parse(element.content_config).label] }}</el-tag>
                <div class="tips">
                  <span>{{ item[JSON.parse(element.content_config).sign] }}</span>
                  <!-- <span class="time">2018-09-27</span> -->
                </div>
              </a>
            </li>
          </ul>
        </template>
        <template v-if="element.wdgt_type==='占比式'">
          <template v-for="(item, index) in element.contentUrlData">
            <div v-show="currentTab!==element.wdgt_id" :key="index" v-loading="loading" class="wdgt-percent">
              <div>
                <el-progress :percentage="parseInt((item[JSON.parse(element.content_config).num_field]/item[JSON.parse(element.content_config).den_field])*100)" :width="80" :color="JSON.parse(element.content_config).color" type="circle" />
                <div class="title">
                  {{ JSON.parse(element.content_config).title }}
                </div>
              </div>
              <div class="percent-con">
                <div>{{ JSON.parse(element.content_config).numerator }}： {{ item[JSON.parse(element.content_config).num_field] }}</div>
                <div>{{ JSON.parse(element.content_config).denominator }}： {{ item[JSON.parse(element.content_config).den_field] }}</div>
              </div>
            </div>
          </template>
        </template>
        <template v-if="element.wdgt_type==='嵌入式'">
          <div v-show="currentTab!==element.wdgt_id" class="wdgt_inset">
            <iframe :height="JSON.parse(element.content_config).height" :src="element.content_url" frameborder="0" width="100%" />
          </div>
        </template>
      </div>
    </div>
    <el-dialog v-if="dialogVisible" :visible.sync="dialogVisible" title="添加常用工具" width="45%" append-to-body>
      <add-tool :data="toolList" @show="isShow($event)" />
    </el-dialog>
  </div>
</template>
<script>
import addTool from './addTool'
import appLink from './link'
import { instance as Vue } from '@/life-cycle'
const request = Vue.$Utils.request

export default {
  components: {
    addTool,
    appLink
  },
  props: {
    el: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      element: this.el,
      shownumber: 10,
      dialogVisible: false,
      wdgtElement: {},
      lastMenu: [],
      currentTab: '',
      wdgtItems: [],
      loading: false,
      toolList: [],
      addon: process.env.VUE_APP_NAME
    }
  },
  computed: {
    classObject: {
      get() {
        if (this.element.content_config !== null && JSON.parse(this.element.content_config).border && this.element.wdgt_color) {
          return {
            hasColor: JSON.parse(this.element.content_config).border
          }
        } else {
          return {
            hasColor: this.element.wdgt_color
          }
        }
      }
    },
    contentUrlData() {
      return this.fetchData()
    }
  },
  created() {
    this.fetchData()
    if (this.element.wdgt_type === '1') {
      this.$Apis.widget.get_menuaccess().then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.lastMenu = response.payload
        }
      })
    }
    if (this.element.wdgt_type === '0') {
      this.$store.dispatch('GetInfo').then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.userinfo = response.payload
          this.toolList = this.userinfo.widgets_json.tool_config
        }
      })
    }
  },
  methods: {
    fetchData() {
      this.loading = true
      if (this.element.content_url) {
        this.$set(this.element, 'contentUrlData', [])
        if (this.element.wdgt_type === '条目式') {
          const content_config = JSON.parse(this.element.content_config)
          if (!content_config.shownumber) {
            this.shownumber = 10
          } else {
            this.shownumber = content_config.shownumber
          }
          request.get(this.element.content_url + '?page=on&page_index=1&page_size=' + this.shownumber).then(response => {
            if (this.element.content_prop) {
              const data = eval(this.element.content_prop)
              if (Array.isArray(data)) {
                this.element.contentUrlData = data
              } else {
                this.element.contentUrlData.push(data)
              }
              const mainkey = content_config.key ? content_config.key.replace(/\s/g, '').split('||') : []
              this.element.contentUrlData.forEach(item => {
                const _result = []
                mainkey.forEach(m => {
                  _result.push(m + '=' + item[m])
                  this.$set(item, 'mtd_link', content_config.link.split('?')[0] + '?' + _result.join('&'))
                })
              })
            }
            this.loading = false
          })
        }
        if (this.element.wdgt_type === '占比式' || this.element.wdgt_type === '磁贴式') {
          request.get(this.element.content_url).then(response => {
            if (this.element.content_prop) {
              const data = eval(this.element.content_prop)
              if (Array.isArray(data)) {
                this.element.contentUrlData = data
              } else {
                this.element.contentUrlData.push(data)
              }
              this.loading = false
            }
          })
        }
      }
    },
    updateWdgt(wdgt_id) {
      window.open('/widget/index?name=' + this.addon, '_self')
    },
    addTool() {
      this.dialogVisible = !this.dialogVisible
    },
    isShow($event) {
      this.toolList = $event
      this.dialogVisible = !this.dialogVisible
    },
    handleCollapse(tab) {
      this.currentTab = this.currentTab === tab ? '' : tab
    },
    handleRefresh(wdgt_id) {
      this.loading = true
      if (this.element.wdgt_type === '条目式') {
        if (!JSON.parse(this.element.content_config).shownumber) {
          this.shownumber = 10
        } else {
          this.shownumber = JSON.parse(this.element.content_config).shownumber
        }
        request.get(this.element.content_url + '?page=on&page_index=1&page_size=' + this.shownumber).then(response => {
          if (this.element.content_prop) {
            const data = eval(this.element.content_prop)
            if (Array.isArray(data)) {
              this.element.contentUrlData = data
            } else {
              this.element.contentUrlData = []
              this.element.contentUrlData.push(data)
            }
            this.loading = false
          }
        })
      }
      if (this.element.wdgt_type === '占比式') {
        request.get(this.element.content_url).then(response => {
          if (this.element.content_prop) {
            const data = eval(this.element.content_prop)
            if (Array.isArray(data)) {
              this.element.contentUrlData = data
            } else {
              this.element.contentUrlData = []
              this.element.contentUrlData.push(data)
            }
            this.loading = false
          }
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.widget-item {
  padding-bottom: 0;
}
</style>
