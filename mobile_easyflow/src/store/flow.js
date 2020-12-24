const flow = {
  state: {
    flow_buttons: [],
    node_buttons: [],
    moduleInit: {}
  },
  mutations: {
    SET_FLOW_BUTTONS: (state, flow_buttons) => {
      state.flow_buttons = flow_buttons
    },
    SET_NODE_BUTTONS: (state, node_buttons) => {
      state.node_buttons = node_buttons
    },
    SET_MODULE_INIT: (state, moduleInit) => {
      state.moduleInit = moduleInit
    }
  },
  actions: {
    getFlowButtons: ({ commit }, flow_buttons) => {
      commit('SET_FLOW_BUTTONS', flow_buttons)
    },
    getNodeButtons: ({ commit }, node_buttons) => {
      commit('SET_NODE_BUTTONS', node_buttons)
    },
    getFlowDefaultBtns: ({ commit }, flowDefaultBtns) => {
      commit('SET_FLOW_DEFAULT_BTNS', flowDefaultBtns)
    },
    getNodeDefaultBtns: ({ commit }, nodeDefaultBtns) => {
      commit('SET_NODE_DEFAULT_BTNS', nodeDefaultBtns)
    }
  },
  getters: {
    flow_buttons: state => state.flow_buttons,
    node_buttons: state => state.node_buttons,
    moduleInit: state => state.moduleInit
  },
  preserveState: true
}
export default flow
