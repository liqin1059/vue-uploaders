import vueUpload from './vue-uploaders'

vueUpload.install = Vue => Vue.component(vueUpload.name, vueUpload);

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(vueUpload);
}

export default vueUpload