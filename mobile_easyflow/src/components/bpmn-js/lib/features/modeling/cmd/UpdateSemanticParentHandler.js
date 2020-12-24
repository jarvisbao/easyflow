export default function UpdateSemanticParentHandler(bpmnUpdater) {
  this._bpmnUpdater = bpmnUpdater
}

UpdateSemanticParentHandler.$inject = ['bpmnUpdater']

UpdateSemanticParentHandler.prototype.execute = function(context) {
  var dataStoreBo = context.dataStoreBo
  var newSemanticParent = context.newSemanticParent
  var newDiParent = context.newDiParent

  context.oldSemanticParent = dataStoreBo.$parent
  context.oldDiParent = dataStoreBo.di.$parent

  // update semantic parent
  this._bpmnUpdater.updateSemanticParent(dataStoreBo, newSemanticParent)

  // update DI parent
  this._bpmnUpdater.updateDiParent(dataStoreBo.di, newDiParent)
}

UpdateSemanticParentHandler.prototype.revert = function(context) {
  var dataStoreBo = context.dataStoreBo
  var oldSemanticParent = context.oldSemanticParent
  var oldDiParent = context.oldDiParent

  // update semantic parent
  this._bpmnUpdater.updateSemanticParent(dataStoreBo, oldSemanticParent)

  // update DI parent
  this._bpmnUpdater.updateDiParent(dataStoreBo.di, oldDiParent)
}

