import React, { Component } from 'react'
import ConfirmInfoOne from './component/ConfirmInfoOne'
import ConfirmInfoTwo from './component/ConfirmInfoTwo'
import ConfirmInfoThree from './component/ConfirmInfoThree'
import { connect } from 'dva'

@connect(mapStateToProps)
export default class ProcessStartConfirm extends Component {
  filterForm = (value, key) => {
    const { node_type } = value
    let container = <div></div>
    switch (node_type) {
      case '1':
        container = <ConfirmInfoOne itemKey={key} itemValue={value} />
        break
      case '2':
        container = <ConfirmInfoTwo itemKey={key} itemValue={value} />
        break
      case '3':
        container = <ConfirmInfoThree itemKey={key} itemValue={value} />
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
