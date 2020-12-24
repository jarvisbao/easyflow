import { getExtension } from '@/utils'

export function setJsonVar(event, bpmnModeler, bpmnElements) {
  const moddle = bpmnModeler.get('moddle')
  const businessObject = bpmnElements.businessObject
  let analysis = getExtension(businessObject, 'enfo:Variable')

  if (event && event !== '{}') {
    if (!analysis) {
      // const code = `<![CDATA[${event}]]>`
      analysis = moddle.create('enfo:Variable', { jsonVar: event })
      businessObject.extensionElements = businessObject.extensionElements || moddle.create('bpmn:ExtensionElements')
      businessObject.extensionElements.get('values').push(analysis)
    } else {
      analysis.jsonVar = event
    }
  } else {
    if (analysis) {
      const values = bpmnElements.businessObject.extensionElements.values
      values.forEach((item, index) => {
        if (item.$type === 'enfo:Variable') {
          values.splice(index, 1)
        }
      })
      if (values.length < 1) {
        bpmnElements.businessObject.extensionElements = undefined
      }
    }
  }
}
