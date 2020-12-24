export function getExtension(element, type) {
  if (!element.extensionElements) {
    return null
  }

  return element.extensionElements.values.filter(function(e) {
    return e.$instanceOf(type)
  })[0]
}

export function is(element, type) {
  var bo = getBusinessObject(element)
  return bo && (typeof bo.$instanceOf === 'function') && bo.$instanceOf(type)
}

export function getBusinessObject(element) {
  return (element && element.businessObject) || element
}
