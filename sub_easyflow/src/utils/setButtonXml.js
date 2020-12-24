import store from '@/store'
import { getExtension } from '@/utils'

// bpmn xml中添加按钮信息元素
export function setButton(events, bpmnModeler, bpmnElements, isNode) {
  const moddle = bpmnModeler.get('moddle')
  const businessObject = bpmnElements.businessObject

  let analysis = null
  if (isNode) {
    analysis = getExtension(businessObject, 'enfo:NodeInstanceBtnList')
  } else {
    analysis = getExtension(businessObject, 'enfo:FlowInstanceBtnList')
  }
  const buttonsElement = moddle.create('enfo:Button', { name: events.name, action: events.action })

  if (!analysis) {
    if (isNode) {
      analysis = moddle.create('enfo:NodeInstanceBtnList')
    } else {
      analysis = moddle.create('enfo:FlowInstanceBtnList')
    }
    businessObject.extensionElements = businessObject.extensionElements || moddle.create('bpmn:ExtensionElements')
    businessObject.extensionElements.get('values').push(analysis)
  }

  analysis.buttons = analysis.buttons || []
  analysis.buttons.push(buttonsElement)

  if (events.prep_script) {
    const jsElements = moddle.create('enfo:JavaScript', { text: encodeURI(`<![CDATA[${events.prep_script}]]>`) })
    buttonsElement.prep_script = [jsElements]
  }
  if (events.allow_cls && events.allow_fun) {
    const pythonElements = moddle.create('enfo:AllowScript', { cls: events.allow_cls, fun: events.allow_fun })
    buttonsElement.allow_script = [pythonElements]
  } else {
    delete buttonsElement.allow_script
  }
  if (events.submit_cls && events.submit_fun) {
    const submitElements = moddle.create('enfo:SubmitScript', { cls: events.submit_cls, fun: events.submit_fun })
    buttonsElement.submit_script = [submitElements]
  } else {
    delete buttonsElement.submit_script
  }
  if (events.object && events.object.length > 0) {
    const object = moddle.create('enfo:Object')
    buttonsElement.object = [object]
    let editForm = null
    object.edit_forms = []
    events.object.forEach(item => {
      editForm = moddle.create('enfo:EditForm', { text: item.mtd_id, owner: item.object_code, proj_code: item.proj_code })
      object.edit_forms.push(editForm)
    })
  }
  if (events.url) {
    const urlEle = moddle.create('enfo:UrlForm', { url: events.url })
    buttonsElement.url_form = [urlEle]
  }
  if (events.model_forms && events.model_forms.length > 0) {
    buttonsElement.module_form = []
    let moduleEle = null
    events.model_forms.forEach(item => {
      moduleEle = moddle.create('enfo:ModuleForm', { module_name: item })
      buttonsElement.module_form.push(moduleEle)
    })
  }
}

// 获取XML中按钮信息
export function getBtnList(btnElements, isNode) {
  if (btnElements.buttons) {
    const buttonsList = []
    const rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g
    btnElements.buttons.forEach(item => {
      buttonsList.push({
        name: item.name,
        action: item.action,
        prep_script: item.prep_script ? decodeURI(item.prep_script[0].text).replace(rcleanScript, '') : '',
        // allow_script: item.allow_script ? [item.allow_script[0].cls, item.allow_script[0].fun] : null,
        // submit_script: item.submit_script ? [item.submit_script[0].cls, item.submit_script[0].fun] : null,
        allow_cls: item.allow_script ? item.allow_script[0].cls : null,
        allow_fun: item.allow_script ? item.allow_script[0].fun : null,
        submit_cls: item.submit_script ? item.submit_script[0].cls : null,
        submit_fun: item.submit_script ? item.submit_script[0].fun : null,
        object: [],
        url: item.url_form ? item.url_form[0].url : null,
        model_forms: []
      })
      buttonsList.forEach(n => {
        if (n.action === item.action && item.object) {
          item.object.forEach(val => {
            val.edit_forms.forEach(i => {
              n.object.push({
                mtd_id: i.text,
                object_code: i.$attrs.owner,
                proj_code: i.$attrs.proj_code
              })
            })
          })
        }
        if (n.action === item.action && item.module_form) {
          item.module_form.forEach(m => {
            n.model_forms.push(m.module_name)
          })
        }
      })
    })
    if (isNode) {
      store.commit('SET_NODE_BUTTONS', buttonsList)
    } else {
      store.commit('SET_FLOW_BUTTONS', buttonsList)
    }
  }
}
