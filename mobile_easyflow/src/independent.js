import store_modules from '@/library/store_modules'
import directive from '@/library/directive'
import LibraryJs from '@/library/js'
import LibraryUi from '@/library/ui'
import LibraryApi from '@/library/api'
import commonRouterMap from '@/library/commonRouter'
// 项目独立运行时需要加载的common.scss
import '@/library/styles/common.scss'
const props = {
  store_modules: store_modules,
  directive: directive,
  utils: LibraryJs,
  components: LibraryUi,
  Apis: LibraryApi,
  commonRouterMap: commonRouterMap
}

export default props
