import recall from './recall'
import countersignVote from './countersignVote'
import countersignResult from './countersignResult'
import backToNode from './backToNode'
import userSelect from './userSelect'
import turnToUser from './turnToUser'
import callActivityRecord from './callActivityRecord'

const components = [
  recall,
  countersignVote,
  countersignResult,
  backToNode,
  userSelect,
  turnToUser,
  callActivityRecord
]

components.forEach((component) => {
  component.install = function(Vue) {
    Vue.component(component.name, (resolve) => {
      resolve(component)
    })
  }
})
export default components
