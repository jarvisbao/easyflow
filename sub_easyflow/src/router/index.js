import Layout from '@/views/layout/Layout'

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
    redirect: '/easyflow/list',
    children: [
      {
        path: '/',
        name: 'index',
        component: () => import('@/views/dashboard/index')
      }
    ]
  },

  {
    path: '/flow',
    name: 'flow',
    component: Layout,
    redirect: '/flow/list',
    meta: { title: '流程管理', isBack: false },
    children: [
      {
        path: 'list',
        name: 'flow_list',
        component: () => import('@/views/flow/list'),
        meta: { title: '流程列表', isBack: false }
      },
      {
        path: 'version',
        name: 'flow_version',
        component: () => import('@/views/flow/flowVersion'),
        meta: { title: '版本管理', isBack: true }
      }
    ]
  },
  {
    path: '/ticket',
    name: 'ticket',
    component: Layout,
    redirect: '/ticket/list',
    meta: { title: '工单', isBack: false },
    children: [
      {
        path: 'list',
        name: 'ticket_list',
        component: () => import('@/views/ticket/ticketList'),
        meta: { title: '发起申请', isBack: false }
      },
      {
        path: 'backlog',
        name: 'backlog',
        component: () => import('@/views/ticket/backlog'),
        meta: { title: '待办事务', isBack: false }
      },
      {
        path: 'initiated',
        name: 'ticket_initiated',
        component: () => import('@/views/ticket/ticketInitiated'),
        meta: { title: '我发起的工单', isBack: false }
      },
      {
        path: 'participate',
        name: 'ticket_participate',
        component: () => import('@/views/ticket/ticketParticipate'),
        meta: { title: '我参与的工单', isBack: false }
      },
      {
        path: 'finished',
        name: 'ticket_finished',
        component: () => import('@/views/ticket/ticketFinished'),
        meta: { title: '已结束的工单', isBack: false }
      }
    ]
  },
  {
    path: '/ticket/start',
    name: 'ticket_start',
    component: () => import('@/views/ticket/ticketStart')
  },
  {
    path: '/ticket/deal',
    name: 'ticket_deal',
    component: () => import('@/views/ticket/ticketDeal')
  },
  {
    path: '/ticket/view',
    name: 'ticket_view',
    component: () => import('@/views/ticket/ticketDeal'),
    props: { isView: true }
  },
  {
    path: '/authlist',
    name: 'auth_list',
    component: Layout,
    children: [
      {
        path: '/authlist',
        component: () => import('@/views/auth/list'),
        meta: { title: '授权管理' }
      }
    ]
  },
  {
    path: '/user-center',
    component: Layout,
    children: [
      {
        path: '/user-center',
        name: 'user-center',
        component: () => import('@/views/userCenter/index'),
        meta: { title: '个人中心', icon: 'user_center' }
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true }
]
