import React, { Component } from 'react'
import {DatePicker } from 'antd'
import {timestampToTimeNormal, timeToTimestamp} from "../../../../../../../utils/util";
import indexStyles from '../../index.less'
import globalStyles from '../../../../../../../globalset/css/globalClassName.less'
import {connect} from "dva/index";

@connect(({ projectDetailProcess: {
  processDoingList = [], processStopedList, processComepletedList
}
}) => ({
  processDoingList, processStopedList, processComepletedList
}))
export default class FlowsInstanceItem extends Component {

  state = {
    due_time: '', //最终的截止时间
    due_time_trans: '', //改变的过程中做变化
  }
  componentDidMount() {
    const { itemValue = {} } = this.props
    const { deadline } = itemValue
    this.setState({
      due_time: deadline || ''
    })
  }
  filterProgress = (status, completed_node_num, total_node_num) => {
    let ele = `（${completed_node_num}/${total_node_num}）`
    switch (status) {
      case '1':
        ele = `（${completed_node_num}/${total_node_num}）`
        break
      case '2':
        ele = `已终止`
        break
      case '3':
        ele = ``
        break
      default:
        ele = `（${completed_node_num}/${total_node_num}）`
        break
    }
    return ele
  }
  processItemClick = (data) => {
    this.props.processItemClick && this.props.processItemClick(data)
  }

  //截止日期
  datePikerOnOpenChange =(bool, id) => {
    //关闭后
    if(!bool) {
      const { due_time_trans, due_time } = this.state
      if(!due_time_trans) {
        return
      }
      if(due_time == due_time_trans) {
        return
      }else {
        this.setState({
          due_time: due_time_trans
        })
      }

      const { itemValue = {}, dispatch } = this.props
      const { id } = itemValue
      dispatch({
        type: 'projectDetailProcess/setDueTimeInFlowsInstance',
        payload: {
          deadline: due_time_trans,
          flow_instance_id: id
        }
      })
      this.updateListData(due_time_trans, id)
    }
  }
  datePickerChange = (date, dateString, e) => {
    if(!dateString) {
      return
    }
    this.setState({
      due_time_trans: timeToTimestamp(dateString)
    })
  }
  updateListData = (due_time_trans, id) => {
    const { status, dispatch } = this.props
    const { listDataObj: { processDoingList = [], processStopedList = [], processComepletedList = [] } } = this.props
    let listName
    let selectList = []
    switch (status ) {
      case '1':
        listName = 'processDoingList'
        selectList = processDoingList
        break
      case '2':
        listName = 'processStopedList'
        selectList = processStopedList
        break
      case '3':
        listName = 'processComepletedList'
        selectList = processComepletedList
        break
      default:
        listName = 'processDoingList'
        selectList = processDoingList
        break
    }
    selectList = selectList.map(item => {
      let item_new = {...item}
      if(item_new.id == id) {
        item_new.deadline = due_time_trans
      }
      return item_new
    })
    dispatch({
      type: 'projectDetailProcess/updateDatas',
      payload: {
        [listName]: selectList,
      }
    })
  }
  stopPropagation = (e) => {
    e.stopPropagation()
  }

  render() {

    const { due_time } = this.state
    const { itemValue = {}, status } = this.props
    const { name, curr_node_name, id, board_id, percentage = '100%', completed_node_num, total_node_num, deadline } = itemValue

    return (
      <div className={indexStyles.panelHead} onClick={this.processItemClick.bind(this, { flow: id, board: board_id})}>
        <div className={`${indexStyles.panelHead_l} ${globalStyles.authTheme}`}>&#xe605;</div>
        <div className={indexStyles.panelHead_m}>
          <div className={indexStyles.panelHead_m_l}>{name}{this.filterProgress.bind(this, { status, completed_node_num, total_node_num })}</div>
          <div className={indexStyles.panelHead_m_r}>{curr_node_name}</div>
        </div>
        <div className={indexStyles.panelHead_r} onClick={this.stopPropagation}>
          {timestampToTimeNormal(due_time, '/', true) || (
            <div className={globalStyles.authTheme} style={{fontSize: 16}}>&#xe789;</div>
          )}
          {
            <DatePicker onChange={this.datePickerChange}
                        onOpenChange={(bool) => this.datePikerOnOpenChange(bool, id)}
                        placeholder={'选择截止时间'}
                        showTime
                        format="YYYY-MM-DD HH:mm"
                        style={{opacity: 0, height: 16, minWidth: 0, top: 0, maxWidth: '108px', background: '#000000', position: 'absolute', right: 0, zIndex: 2, cursor: 'pointer'}} />
          }
        </div>
      </div>
    )

  }

}
