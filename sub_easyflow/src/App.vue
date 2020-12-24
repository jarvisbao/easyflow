<template>
  <div id="app">
    <router-view />
    <el-backtop :right="10" />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
