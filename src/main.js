import Vue from 'vue'
import App from './App.vue'

import VueUpload from './index.js'
Vue.use(VueUpload)

new Vue({
  el: '#app',
  render: h => h(App)
})
