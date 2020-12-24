<template>
  <section class="ticket-list">
    <van-cell v-for="(item, index) in items" :key="index" :title="item.name" is-link :to="{ name: 'ticket-start', query: {flow_id: item.flow_id} }" />
  </section>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      items: []
    }
  },
  computed: {
    ...mapGetters([
      'openid'
    ])
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.$Apis.flow.flows_auth(this.openid).then(response => {
        if (response.code === this.$Utils.Constlib.ERROR_CODE_OK) {
          this.items = response.payload
        } else {
          this.$dialog.alert({
            message: response.message
          })
        }
      })
    }
  }
}
</script>
