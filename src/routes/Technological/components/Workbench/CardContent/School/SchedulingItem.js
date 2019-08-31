import React from 'react'
import indexstyles from '../../index.less'
import { Icon } from 'antd'
import globalStyles from '../../../../../../globalset/css/globalClassName.less'
import { timestampToTimeNormal } from '../../../../../../utils/util'
import Cookies from 'js-cookie'

export default class SchedulingItem extends React.Component {

  itemClick(e) {
    const { itemValue = {} } = this.props
    const { id, board_id } = itemValue
    // this.props.updateTaskDatas({board_id})
    // this.props.updateFileDatas({board_id})
    this.props.updatePublicDatas({ board_id })
    this.props.getCardDetail({id, board_id})
    this.props.setTaskDetailModalVisibile()
  }

  render() {
    const { itemValue = {}, itemKey } = this.props
    const { name, start_time, due_time } = itemValue
    return (
      <div className={indexstyles.meetingItem} onClick={this.itemClick.bind(this)} >
        <div>
          <Icon type="calendar" style={{fontSize: 16, color: '#8c8c8c'}}/>
        </div>
        <div>{name}<span style={{marginLeft: 6, color: '#8c8c8c', cursor: 'pointer'}}>{`${timestampToTimeNormal(start_time, '', true)}~${timestampToTimeNormal(due_time, '', true)}`}</span></div>
      </div>
    )
  }
}
