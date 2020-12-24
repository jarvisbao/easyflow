<template>
  <portal-widget />
</template>
<style lang="scss" scoped>
.portal-container {
  padding: 20px;
  & /deep/ .msg-box {
    min-height: calc(100vh - 96px);
    position: relative;
  }
  & /deep/ .msg {
    font-size: 18px;
    color: #9c9595;
    position: absolute;
    left: 50%;
    top: 50%;
    margin-top: -10px;
    margin-left: -162px;
  }
  & /deep/ .el-row {
    display: flex;
  }
}
</style>
