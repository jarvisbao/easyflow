import Vue from 'vue'
import moduleForm from './index'

moduleForm.forEach((component) => {
  Vue.use(component)
})
