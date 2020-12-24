<template>
  <div class="link-btn">
    <div>
      <span v-for="(item, index) in textList" :key="index" :class="{active: currentTab == item.label}" @click="toggleTab(item.label)">{{ item.name }}</span>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    textList: {
      type: Array,
      default() {
        return []
      }
    },
    currentTab: {
      type: String,
      default: ''
    }
  },
  data() {
    return {

    }
  },
  methods: {
    toggleTab(label) {
      sessionStorage.removeItem(this.$route.name)
      this.$emit('toggle', label)
    }
  }
}
</script>
<style lang="scss" scoped>
$color: #dd6161;
.link-btn {
  margin-bottom: 20px;
  font-size: 0;
  border-bottom: 1px solid #e4e7ed;
  div {
    display: inline-block;
    border-radius: 5px 5px 0 0;
    border: 1px solid #ddd;
    border-bottom-width: 0;
    background: #fff;
    span {
      display: inline-block;
      padding: 10px 25px;
      font-size: 14px;
      color: #666;
      cursor: pointer;
      border-right: 1px solid #ddd;
      position: relative;
      top: 1px;
      &:last-of-type {
        border-right: none;
      }
      &:hover {
        color: $color;
      }
      &.active {
        color: $color;
        border-bottom: 1px solid #fff;
      }
    }
  }
}
</style>
