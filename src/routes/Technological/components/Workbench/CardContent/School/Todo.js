import React from 'react'
import indexstyles from '../../index.less'
import { Icon } from 'antd'
import Cookies from 'js-cookie'

export default class TaskItem extends React.Component {
  itemOneClick(e) {
    e.stopPropagation();
    // const { itemValue, taskGroupListIndex, taskGroupListIndex_index } = this.props
    // const {  datas:{ taskGroupList } } = this.props.model
    // const { card_id, is_realize = '0' } = itemValue
    const { datas: { todoList=[] } } = this.props.model
    const { itemValue = {}, itemKey } = this.props
    const { is_realize, board_id, board_name, name, id } = itemValue
    const obj = {
      card_id: id,
      is_realize: is_realize === '1' ? '0' : '1'
    }
    todoList[itemKey]['is_realize'] = is_realize === '1' ? '0' : '1'
    this.props.updateDatas({todoList})
    this.props.completeTask(obj)
  }
  gotoBoardDetail(board_id, e) {
    e.stopPropagation();
    Cookies.set('board_id', board_id, {expires: 30, path: ''})
    this.props.routingJump('/technological/projectDetail')
  }
  itemClick(data, e) {
    const { id, board_id } = data
    // this.props.updateTaskDatas({board_id})
    // this.props.updateFileDatas({board_id})
    this.props.updatePublicDatas({ board_id })
    this.props.getCardDetail({id, board_id})
    this.props.setTaskDetailModalVisibile()
  }
  render() {
    const { itemValue = {} } = this.props
    const { is_realize, board_id, board_name, name, id } = itemValue

    //父级任务
    let parentCards= []
    const returnParentCard = (value) => {
      const { parent_card } = value
      if(parent_card) {
        const { name, id, board_id } = parent_card
        parentCards.push({
          board_id,
          id,
          name
        })
        returnParentCard(parent_card)
      }
    }
    returnParentCard(itemValue)

    return (
      <div className={indexstyles.taskItem} >
        <div className={is_realize === '1' ? indexstyles.nomalCheckBoxActive: indexstyles.nomalCheckBox} onClick={this.itemOneClick.bind(this)}>
          <Icon type="check" style={{color: '#FFFFFF', fontSize: 12, fontWeight: 'bold'}}/>
        </div>
        <div>
          <span style={{textDecoration: is_realize === '1'? 'line-through': 'none'}} onClick={this.itemClick.bind(this, {id, board_id })}>{name}</span>
          {parentCards.map((value, key) => {
            const { name, id, board_id } = value
            return (
              <span style={{marginLeft: 6, color: '#8c8c8c', cursor: 'pointer', }} key={key} onClick={this.itemClick.bind(this, {id, board_id })}>{`< ${name}`}</span>
            )
          })}
          <span style={{marginLeft: 6, color: '#8c8c8c', cursor: 'pointer', }} onClick={this.gotoBoardDetail.bind(this, board_id)}>#{board_name}</span>
        </div>
      </div>
    )
  }
}
