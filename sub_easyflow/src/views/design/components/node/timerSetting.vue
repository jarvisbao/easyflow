<template>
  <div class="timer-setting">
    <el-form :model="timer" label-width="100px">
      <el-form-item label="启动方式">
        <template v-if="isIntermediateCatchEvent">
          <el-radio-group v-model="start_way" style="display: flex; align-items: center;" @change="changeWay">
            <el-radio :label="1">表单数据</el-radio>
            <el-radio :label="2">
              <el-select v-model="timer.trigger" :disabled="start_way !== 2" @change="changeTrigger">
                <el-option label="cron表达式" value="cron" />
                <el-option label="日期时间选择" value="date" />
                <el-option label="循环间隔" value="interval" />
              </el-select>
            </el-radio>
          </el-radio-group>
        </template>
        <el-select v-else v-model="timer.trigger" @change="changeTrigger">
          <el-option label="cron表达式" value="cron" />
          <el-option label="日期时间选择" value="date" />
          <el-option label="循环间隔" value="interval" />
        </el-select>
      </el-form-item>
      <template v-if="show">
        <el-form-item v-if="timer.trigger === 'cron'">
          <el-popover v-model="cronPopover">
            <cron i18n="cn" @change="changeCron" @close="cronPopover=false" class="cron" />
            <el-input v-model="timer.cronExpress.cron" slot="reference" placeholder="请输入定时策略" @click="cronPopover=true" @change="setCronProp('cron')" />
          </el-popover>
          <div class="date-box">
            <label>开始日期</label>
            <el-date-picker
              v-model="timer.cronExpress.start_date"
              :picker-options="expireTimeOption"
              :clearable="false"
              type="datetime"
              placeholder="开始日期"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="timestamp"
              @change="changeStartDate"
            />
          </div>
          <div class="date-box">
            <label>结束日期</label>
            <el-date-picker
              v-model="timer.cronExpress.end_date"
              :clearable="false"
              type="datetime"
              placeholder="结束日期"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="timestamp"
              @change="changeEndDate"
            />
          </div>
          <div class="date-box">
            <label>时区</label>
            <el-input v-model.trim="timer.cronExpress.timezone" @change="setCronProp('cron')" />
          </div>
          <div class="date-box">
            <label>抖动</label>
            <el-input v-model="timer.cronExpress.jitter" type="number" min="1" @change="setCronProp('cron')" />
          </div>
        </el-form-item>
        <el-form-item v-if="timer.trigger === 'date'">
          <el-date-picker
            v-model="timer.date"
            :picker-options="expireTimeOption"
            type="datetime"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择日期时间"
            style="width: 100%"
            @change="changeDate"
          />
        </el-form-item>
        <el-form-item v-if="timer.trigger === 'interval'">
          <el-input v-model="timer.interval" type="number" min="0" placeholder="请输入内容" class="input-with-select" @change="changeInterval">
            <el-select v-model="interval_type" slot="append" placeholder="请选择" @change="handleChange">
              <el-option label="天" value="day" />
              <el-option label="小时" value="hour" />
              <el-option label="分" value="min" />
              <el-option label="秒" value="second" />
            </el-select>
          </el-input>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>
<script>
import { cron } from 'vue-cron'
import { mapGetters } from 'vuex'

export default {
  name: 'TimerSetting',
  components: {
    cron
  },
  props: {
    modeler: {
      type: Object,
      default: () => {}
    },
    bpmnElements: {
      type: Object,
      default: () => {}
    },
    isIntermediateCatchEvent: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      start_way: null,
      timer: {
        trigger: null,
        date: new Date(),
        interval: null,
        cronExpress: {
          cron: '* * * * * ? *',
          start_date: new Date().getTime(),
          end_date: 4102415999000, // 2099-12-31 23:59:59
          timezone: null,
          jitter: null
        }
      },
      interval_type: 'second',
      interval: null,
      expireTimeOption: {
        disabledDate(date) {
          // disabledDate 文档上：设置禁用状态，参数为当前日期，要求返回 Boolean
          return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
        }
      },
      cronPopover: false,
      show: true
    }
  },
  computed: {
    ...mapGetters([
      'timer_info'
    ])
  },
  watch: {
    timer_info: {
      handler(val) {
        if (val) {
          this.fetchDate()
        }
      }
    },
    isIntermediateCatchEvent: {
      handler(val) {
      }
    }
  },
  created() {
    this.fetchDate()
  },
  methods: {
    fetchDate() {
      if (this.timer_info) {
        this.timer = this.timer_info
        if (this.timer_info.intertype) {
          this.interval_type = this.timer_info.intertype
          switch (this.interval_type) {
            case 'day':
              this.timer.interval = this.timer_info.interval / 24 / 60 / 60
              break
            case 'hour':
              this.timer.interval = this.timer_info.interval / 60 / 60
              break
            case 'min':
              this.timer.interval = this.timer_info.interval / 60
              break
            case 'second':
              this.timer.interval = this.timer_info.interval
              break
          }
        }
        if (this.timer_info.trigger) {
          if (this.timer_info.trigger === 'form') {
            this.timer.trigger = null
            this.start_way = 1
          } else {
            this.start_way = 2
            this.show = true
          }
        } else {
          this.start_way = null
        }
        
      }
    },
    setTimerEvent(properties) {
      const eventDefinitions = this.modeler.get('moddle').create('bpmn:TimerEventDefinition', properties)
      this.modeler.get('modeling').updateProperties(this.bpmnElements, { eventDefinitions: [eventDefinitions] })
    },
    setCronProp(val) {
      const _result = []
      Object.values(this.timer.cronExpress).forEach(item => {
        if (item) {
          _result.push(item)
        } else {
          _result.push('*')
        }
      })
      this.setTimerEvent({ trigger: val, cron: _result.join(' ') })
    },
    handleChange(val) {
      switch (val) {
        case 'day':
          this.interval = this.timer.interval * 24 * 60 * 60
          break
        case 'hour':
          this.interval = this.timer.interval * 60 * 60
          break
        case 'min':
          this.interval = this.timer.interval * 60
          break
        case 'second':
          this.interval = this.timer.interval
          break
      }
      this.setTimerEvent({ trigger: this.timer.trigger, interval: this.interval, intertype: val })
    },
    changeTrigger(val) {
      if (val === 'cron') {
        this.setCronProp(val)
      } else if (val === 'date') {
        const date = this.$Utils.util.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')
        this.setTimerEvent({ trigger: this.timer.trigger, date: date })
      } else {
        this.setTimerEvent({ trigger: val })
      }
    },
    changeDate(val) {
      this.setTimerEvent({ trigger: this.timer.trigger, date: val })
    },
    changeInterval(val) {
      switch (this.interval_type) {
        case 'day':
          this.interval = this.timer.interval * 24 * 60 * 60
          break
        case 'hour':
          this.interval = this.timer.interval * 60 * 60
          break
        case 'min':
          this.interval = this.timer.interval * 60
          break
        case 'second':
          this.interval = this.timer.interval
          break
      }
      this.setTimerEvent({ trigger: this.timer.trigger, interval: this.interval, intertype: this.interval_type })
    },
    changeCron(val) {
      this.timer.cronExpress.cron = val
      this.setCronProp('cron')
    },
    changeStartDate(val) {
      this.setCronProp('cron')
    },
    changeEndDate(val) {
      this.setCronProp('cron')
    },
    changeWay(val) {
      this.setTimerEvent(null)
      if (val === 1) {
        this.setTimerEvent({ trigger: 'form' })
        this.show = false
      } else {
        this.show = true
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.input-with-select /deep/ .el-input-group__append {
  background-color: #fff;
}
.input-with-select /deep/ .el-select .el-input {
  width: 80px;
}
.cron {
  & /deep/ .el-button.language {
    display: none;
  }
  & /deep/ .el-tabs__content {
    max-height: 200px;
    overflow: auto;
  }
}
.date-box {
  display: flex;
  margin-top: 10px;
  label {
    display: block;
    width: 56px;
    margin-right: 15px;
    text-align: right;
    color: #666;
  }
  & /deep/ .el-date-editor {
    flex: 1;
  }
  & /deep/ .el-input {
    width: auto;
    flex: 1;
  }
}
</style>
