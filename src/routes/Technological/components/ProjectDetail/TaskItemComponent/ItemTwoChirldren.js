//子任务
import React from 'react'
import CreateTaskStyle from './CreateTask.less'
import { Icon, Checkbox, Collapse, message } from 'antd'
import QueueAnim from 'rc-queue-anim'
import {checkIsHasPermissionInBoard} from "../../../../../utils/businessFunction";
import {MESSAGE_DURATION_TIME, PROJECT_TEAM_CARD_COMPLETE, NOT_HAS_PERMISION_COMFIRN} from "../../../../../globalset/js/constant";
const Panel = Collapse.Panel

export default class ItemTwoChirldren extends React.Component {
  state = {
  }
  itemOneClick() {
    if(!checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_COMPLETE)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const { ItemTwoChirldrenVaue, ItemTwoChirldrenIndex, taskGroupListIndex, taskGroupListIndex_index } = this.props
    const { datas: { taskGroupList } } = this.props.model
    const { card_id, is_realize = '0' } = ItemTwoChirldrenVaue
    const obj = {
      card_id,
      is_realize: is_realize === '1' ? '0' : '1'
    }
    taskGroupList[taskGroupListIndex]['card_data'][taskGroupListIndex_index]['child_data'][ItemTwoChirldrenIndex]['is_realize'] = is_realize === '1' ? '0' : '1'
    this.props.updateDatasTask({taskGroupList})
    this.props.completeTask(obj)
  }
  render() {
    const { ItemTwoChirldrenVaue: { card_name, card_id, is_realize = '0' } } = this.props
    // console.log(this.props.ItemTwoChirldrenVaue)
    return (
      <div key={'1'} className={CreateTaskStyle.item_2_chirld} >
        <div className={is_realize === '1' ? CreateTaskStyle.nomalCheckBoxActive: CreateTaskStyle.nomalCheckBox} onClick={this.itemOneClick.bind(this, card_id)}>
          <Icon type="check" style={{color: is_realize === '1' ? '#FFFFFF': '#F5F5F5', fontSize: 12, fontWeight: 'bold'}}/>
        </div>
        <div style={{textDecoration: is_realize === '1'? 'line-through': 'none'}}>{card_name}</div>
      </div>
    )
  }
}

