import React, { Component } from 'react'
import EditStepTypeOne from './component/EditStepTypeOne'
import EditStepTypeTwo from './component/EditStepTypeTwo'
import EditStepTypeThree from './component/EditStepTypeThree'
import { connect } from 'dva'

@connect(mapStateToProps)
export default class EditProcess extends Component {
  filterForm = (value, key) => {
    const { node_type } = value
    let container = <div></div>
    switch (node_type) {
      case '1':
        container = <EditStepTypeOne itemKey={key} itemValue={value} />
        break
      case '2':
        container = <EditStepTypeTwo itemKey={key} itemValue={value} />
        break
      case '3':
        container = <EditStepTypeThree itemKey={key} itemValue={value} />
        break
      default:
        container = <div></div>
        break
    }
    return container
  }

  render() {
    const { processEditDatas = [], itemValue, itemKey } = this.props
    return <div>{this.filterForm(itemValue, itemKey)}</div>
  }
}

function mapStateToProps({
  publicProcessDetailModal: { processEditDatas = [] }
}) {
  return { processEditDatas }
}
