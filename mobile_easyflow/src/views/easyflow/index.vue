<template>
  <div>
    <header class="header">
      <search />
    </header>
    <div class="container">
      <van-grid :column-num="1" :border="false" direction="horizontal">
        <van-grid-item :to="{name: 'ticket-list'}">
          <template #icon>
            <van-icon name="add-o" size="28" color="#409EFF" />
          </template>
          <template #text>
            <span class="add-text">新建工单</span>
          </template>
        </van-grid-item>
      </van-grid>
      <van-grid :column-num="2">
        <van-grid-item :to="{name: 'ticket-backlog'}">
          <template #icon>
            <i class="iconfont icon-lingdang" />
          </template>
          <template #text>
            <span class="text">待处理工单</span>
          </template>
        </van-grid-item>
        <van-grid-item :to="{name: 'ticket-initiated'}">
          <template #icon>
            <van-icon name="user-circle-o" size="26" color="#f96a28" />
          </template>
          <template #text>
            <span class="text">我的工单</span>
          </template>
        </van-grid-item>
        <van-grid-item :to="{name: 'ticket-participate'}">
          <template #icon>
            <i class="iconfont icon-jigou" />
          </template>
          <template #text>
            <span class="text">参与的工单</span>
          </template>
        </van-grid-item>
        <van-grid-item :to="{name: 'ticket-finished'}">
          <template #icon>
            <van-icon name="passed" size="26" color="#67C23A" />
          </template>
          <template #text>
            <span class="text">已结束工单</span>
          </template>
        </van-grid-item>
      </van-grid>
    </div>
  </div>
</template>
<script>
import search from '@/components/search/index'

export default {
  components: {
    search
  }
}
</script>
<style lang="scss" scoped>
header {
  display: flex;
  padding: 12px 16px;
  align-items: center;
  background: #409eff;
  .avatar {
    width: 40px;
    height: 40px;
    margin-right: 12px;
    overflow: hidden;
    border-radius: 50%;
    border: 2px solid #fff;
    img {
      width: 100%;
    }
  }
}
.container {
  // min-height: calc(100vh - 108px);
  position: relative;
  &::before {
    content: ' ';
    display: block;
    width: 100%;
    height: 18px;
    background: #409eff;
  }
  &::after{
    content: ' ';
    display: block;
    width: 100%;
    height: 15px;
    background: #fff;
    border-radius: 15px 15px 0 0;
    position: absolute;
    top: 5px;
  }
}
.icon-lingdang {
  font-size: 22px;
  color: #e02b0b;
}
.icon-jigou {
  font-size: 26px;
  color: #409EFF;
}
.text {
  margin-top: 8px;
}
.add-text {
  margin-left: 10px;
}
</style>
