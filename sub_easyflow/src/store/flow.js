const flow = {
  state: {
    routeList: [],
    groupList: [],
    roleList: [],
    userList: [],
    orgList: [],
    flow_info: {},
    flow_buttons: [],
    node_buttons: [],
    node_assign: null,
    node_list: [],
    obj_list: [],
    flow_form: [],
    display_form: [],
    edit_form: [],
    url_module_flow: {},
    url_module_node: {},
    method_list: [],
    multiInstance_info: null,
    countersign_info: null,
    emptyStartAssign: null,
    titleRule: null,
    moduleInit: {},
    timer_info: {},
    isSave: false
  },
  mutations: {
    SET_ROUTE_LIST: (state, routeList) => {
      state.routeList = routeList
    },
    SET_GROUP_LIST: (state, groupList) => {
      state.groupList = groupList
    },
    SET_ROLE_LIST: (state, roleList) => {
      state.roleList = roleList
    },
    SET_USER_LIST: (state, userList) => {
      state.userList = userList
    },
    SET_ORG_LIST: (state, orgList) => {
      state.orgList = orgList
    },
    SET_FLOW_INFO: (state, flow_info) => {
      state.flow_info = flow_info
    },
    SET_FLOW_BUTTONS: (state, flow_buttons) => {
      state.flow_buttons = flow_buttons
    },
    SET_NODE_BUTTONS: (state, node_buttons) => {
      state.node_buttons = node_buttons
    },
    SET_NODE_ASSIGN: (state, node_assign) => {
      state.node_assign = node_assign
    },
    SET_NODE_LIST: (state, node_list) => {
      state.node_list = node_list
    },
    SET_OBJ_LIST: (state, obj_list) => {
      state.obj_list = obj_list
    },
    SET_FLOW_FORM: (state, flow_form) => {
      state.flow_form = flow_form
    },
    SET_DISPLAY_FORM: (state, display_form) => {
      state.display_form = display_form
    },
    SET_EDIT_FORM: (state, edit_form) => {
      state.edit_form = edit_form
    },
    SET_METHOD_LIST: (state, method_list) => {
      state.method_list = method_list
    },
    SET_MULTIINSTANCE_INFO: (state, multiInstance_info) => {
      state.multiInstance_info = multiInstance_info
    },
    SET_COUNTERSIGN_INFO: (state, countersign_info) => {
      state.countersign_info = countersign_info
    },
    SET_EMPTY__START_ASSIGN: (state, emptyStartAssign) => {
      state.emptyStartAssign = emptyStartAssign
    },
    SET_TITLE_RULE: (state, titleRule) => {
      state.titleRule = titleRule
    },
    SET_URL_MODULE_FLOW: (state, url_module_flow) => {
      state.url_module_flow = url_module_flow
    },
    SET_URL_MODULE_NODE: (state, url_module_node) => {
      state.url_module_node = url_module_node
    },
    SET_MODULE_INIT: (state, moduleInit) => {
      state.moduleInit = moduleInit
    },
    SET_TIMER_INFO: (state, timer_info) => {
      state.timer_info = timer_info
    },
    SET_IS_SAVE: (state, isSave) => {
      state.isSave = isSave
    }
  },
  actions: {
    getFlowInfo: ({ commit }, flow_info) => {
      commit('SET_FLOW_INFO', flow_info)
    },
    getFlowButtons: ({ commit }, flow_buttons) => {
      commit('SET_FLOW_BUTTONS', flow_buttons)
    },
    getNodeButtons: ({ commit }, node_buttons) => {
      commit('SET_NODE_BUTTONS', node_buttons)
    },
    getNodeAssign: ({ commit }, node_assign) => {
      commit('SET_NODE_ASSIGN', node_assign)
    },
    getNodeList: ({ commit }, node_list) => {
      commit('SET_NODE_LIST', node_list)
    },
    getObjList: ({ commit }, obj_list) => {
      commit('SET_OBJ_LIST', obj_list)
    },
    getFlowForm: ({ commit }, flow_form) => {
      commit('SET_FLOW_FORM', flow_form)
    },
    getDisplayForm: ({ commit }, display_form) => {
      commit('SET_DISPLAY_FORM', display_form)
    },
    getEditForm: ({ commit }, edit_form) => {
      commit('SET_EDIT_FORM', edit_form)
    },
    getFlowDefaultBtns: ({ commit }, flowDefaultBtns) => {
      commit('SET_FLOW_DEFAULT_BTNS', flowDefaultBtns)
    },
    getNodeDefaultBtns: ({ commit }, nodeDefaultBtns) => {
      commit('SET_NODE_DEFAULT_BTNS', nodeDefaultBtns)
    },
    getUrlModuleFlow: ({ commit }, url_module_flow) => {
      commit('SET_URL_MODULE_FLOW', url_module_flow)
    },
    getUrlModuleNode: ({ commit }, url_module_node) => {
      commit('SET_URL_MODULE_NODE', url_module_node)
    }
  },
  getters: {
    routeList: state => state.routeList,
    groupList: state => state.groupList,
    roleList: state => state.roleList,
    userList: state => state.userList,
    orgList: state => state.orgList,
    flow_info: state => state.flow_info,
    flow_buttons: state => state.flow_buttons,
    node_buttons: state => state.node_buttons,
    node_assign: state => state.node_assign,
    node_list: state => state.node_list,
    obj_list: state => state.obj_list,
    flow_form: state => state.flow_form,
    display_form: state => state.display_form,
    edit_form: state => state.edit_form,
    method_list: state => state.method_list,
    multiInstance_info: state => state.multiInstance_info,
    countersign_info: state => state.countersign_info,
    emptyStartAssign: state => state.emptyStartAssign,
    titleRule: state => state.titleRule,
    url_module_flow: state => state.url_module_flow,
    url_module_node: state => state.url_module_node,
    moduleInit: state => state.moduleInit,
    timer_info: state => state.timer_info,
    isSave: state => state.isSave
  },
  preserveState: true
}
export default flow
