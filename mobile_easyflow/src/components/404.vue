<template>
  <div class="wscn-http404-container">
    <van-empty image="network" description="描述文字">
      <template #description>
        <div class="bullshit__oops">
          您访问的页面不存在
        </div>
        <div>
          请检查您输入的网址是否正确
        </div>
      </template>
      <van-button round type="info" to="/" style="width: 160px; height: 40px;">
        返回首页
      </van-button>
    </van-empty>
  </div>
</template>

<script>

export default {
  name: 'Page404'
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.wscn-http404-container{
  /deep/ .van-empty {
    min-height: calc(100vh);
  }
  .bullshit__oops {
    margin-bottom: 12px;
    font-size: 18px;
  }
}
</style>
