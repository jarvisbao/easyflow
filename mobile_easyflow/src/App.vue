<template>
  <div id="root">
    <router-view v-if="!content" />
    <div v-else>
      <layout :content="content" :loading="loading" />
    </div>
  </div>
</template>
<script>
export default {
  name: 'App',
  components: {
    Layout: () => import('./views/layout/Layout')
  },
  props: {
    content: String,
    loading: Boolean
  }
}
</script>
