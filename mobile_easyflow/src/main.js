import '@/public-path'
import './install'
import { lifeCycle, render } from './life-cycle'
/**
 * @name 导出微应用生命周期
 */
const { bootstrap, mount, unmount } = lifeCycle()
export { bootstrap, mount, unmount }

/**
 * @name 单独环境直接实例化vue
 */
const __qiankun__ = window.__POWERED_BY_QIANKUN__
// 测试模式下需要独立运行时,且portal下的library移到本项目
// import props from './independent'
// __qiankun__ || bootstrap(props)

__qiankun__ || render()
