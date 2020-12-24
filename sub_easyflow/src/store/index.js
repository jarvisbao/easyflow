import Vue from 'vue'
import Vuex from 'vuex'
import flow from './flow'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    flow
  }
})

export default store
