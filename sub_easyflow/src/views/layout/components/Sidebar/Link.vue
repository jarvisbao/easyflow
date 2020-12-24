
<template>
  <!-- eslint-disable vue/require-component-is -->
  <component v-bind="linkProps(to)" @click.native="set_menuaccess(menuid, to)">
    <slot />
  </component>
</template>

<script>
export default {
  props: {
    to: {
      type: String,
      required: true
    },
    menuid: {
      type: String,
      required: true
    }
  },
  // 接收注入的数据
  inject: ['refresh'],
  methods: {
    linkProps(url) {
      if (this.$Utils.validate.isExternal(url)) {
        return {
          is: 'a',
          href: url,
          target: '_blank',
          rel: 'noopener'
        }
      }
      return {
        is: 'router-link',
        to: url
      }
    },
    set_menuaccess(menuid, to) {
      this.$Apis.set_menuaccess(menuid)
      this.refresh()
      this.$store.commit('SET_RELOAD', to)
    }
  }
}
</script>
