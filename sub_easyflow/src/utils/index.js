export function getExtension(element, type) {
  if (!element.extensionElements) {
    return null
  }
  if (element.extensionElements.values && element.extensionElements.values.length > 0) {
    return element.extensionElements.values.filter(function(e) {
      return e.$instanceOf(type)
    })[0]
  }
}

export function is(element, type) {
  var bo = getBusinessObject(element)
  return bo && (typeof bo.$instanceOf === 'function') && bo.$instanceOf(type)
}

export function getBusinessObject(element) {
  return (element && element.businessObject) || element
}

export function hasEventDefinition(element, eventType) {
  var bo = getBusinessObject(element)
  var hasEventDefinition = false

  if (bo.eventDefinitions) {
    bo.eventDefinitions.forEach(event => {
      if (is(event, eventType)) {
        hasEventDefinition = true
      }
    })
  }

  return hasEventDefinition
}