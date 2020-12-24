import Vue from 'vue'
import VueRouter from 'vue-router'

// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(VueRouter)

/* Layout */
import Layout from '../views/layout/Layout'
import subLayout from '../views/layout/subLayout'
// import commonRouterMap from '@/library/commonRouter'

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirect in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in subMenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if false, the item will hidden in breadcrumb(default is true)
  }
**/
export const asyncRoutes = []
export const constantRouterMap = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/retrieve_password',
    component: () => import('@/views/login/retrievePassword'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    name: 'easyflow',
    children: [
      {
        path: '',
        name: 'easyflow',
        component: () => import('@/views/easyflow/index'),
        meta: { title: '工作流系统' }
      }
    ]
  },
  {
    path: '/ticket',
    component: subLayout,
    children: [
      {
        path: 'list',
        name: 'ticket-list',
        component: () => import('@/views/easyflow/ticketList'),
        meta: { title: '发起申请' }
      },
      {
        path: 'backlog',
        name: 'ticket-backlog',
        component: () => import('@/views/easyflow/backlog'),
        meta: { title: '待办事务' }
      },
      {
        path: 'initiated',
        name: 'ticket-initiated',
        component: () => import('@/views/easyflow/ticketRelated'),
        props: { api_name: 'initiated_ticket' },
        meta: { title: '我的工单' }
      },
      {
        path: 'participate',
        name: 'ticket-participate',
        component: () => import('@/views/easyflow/ticketRelated'),
        props: { api_name: 'participate_ticket' },
        meta: { title: '我参与的工单' }
      },
      {
        path: 'finished',
        name: 'ticket-finished',
        component: () => import('@/views/easyflow/ticketRelated'),
        props: { api_name: 'finished_ticket' },
        meta: { title: '已结束工单' }
      },
      {
        path: 'start',
        name: 'ticket-start',
        component: () => import('@/views/easyflow/ticketStart'),
        meta: { title: '工单发起' }
      },
      {
        path: 'deal',
        name: 'ticket-deal',
        component: () => import('@/views/easyflow/ticketDeal'),
        meta: { title: '事务处理' }
      },
      {
        path: 'view',
        name: 'ticket-view',
        component: () => import('@/views/easyflow/ticketDeal'),
        meta: { title: '事务详情' },
        props: { isView: true }
      }
    ]
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/components/search/list')
  },
  {
    path: '/user-center',
    component: Layout,
    children: [
      {
        path: '/user-center',
        name: 'user-center',
        component: () => import('@/views/userCenter/index')
      },
      {
        path: 'info',
        component: subLayout,
        children: [
          {
            path: 'index',
            name: 'user-info',
            alias: '/user-center/info',
            component: () => import('@/views/userCenter/components/Userinfo'),
            meta: { title: '个人中心' }
          },
          {
            path: 'bind_mobile',
            name: 'bind-mobile',
            component: () => import('@/views/userCenter/components/bindMobile'),
            meta: { title: '手机号绑定', icon: '' }
          },
          {
            path: 'bind_email',
            name: 'bind-email',
            component: () => import('@/views/userCenter/components/bindEmail'),
            meta: { title: '', icon: '' }
          }
        ]
      }
    ]
  },
  { path: '*', component: () => import('@/components/404'), redirect: '/404', hidden: true }
]
