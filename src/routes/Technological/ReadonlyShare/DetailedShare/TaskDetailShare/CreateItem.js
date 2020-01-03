//创建分组

import React from 'react'
import CreateTaskStyle from './CreateTask.less'
import { Input, message } from 'antd'
import {
  MESSAGE_DURATION_TIME, NOT_HAS_PERMISION_COMFIRN, PROJECT_TEAM_CARD_GROUP,
} from "../../../../../globalset/js/constant";
import { checkIsHasPermissionInBoard } from "../../../../../utils/businessFunction";
import { connect } from 'dva';

@connect(mapStateToProps)
export default class CreateItem extends React.Component {
  state = {
    isInEditAdd: false,
    inputValue: '',
  }

  setIsInEditAdd() {
    if (!checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_GROUP)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    this.setState({
      isInEditAdd: true
    })
  }

  inputEditOk(e) {
    this.setState({
      isInEditAdd: false,
      inputValue: '',
    })
    if (!this.state.inputValue) {
      return false
    }
    const { projectDetailInfoData = {}, taskGroupList = [] } = this.props
    const { board_id } = projectDetailInfoData
    const obj = {
      board_id,
      name: this.state.inputValue,
      list_name: this.state.inputValue,
      length: taskGroupList.length
    }
    taskGroupList.push(obj)
    const { dispatch } = this.props
    dispatch({
      type: 'projectDetailTask/addTaskGroup',
      payload: {
        ...obj
      }
    })
  }
  inputChange(e) {
    this.setState({
      inputValue: e.target.value
    })
  }

  render() {
    const { isInEditAdd, inputValue } = this.state

    return (
      <div className={CreateTaskStyle.createTaskItem}>
        {!isInEditAdd ? (
          <div className={CreateTaskStyle.createTaskItemTitle} onClick={this.setIsInEditAdd.bind(this)}>创建新分组…</div>
        ) : (
            <div>
              <Input autoFocus value={inputValue} placeholder={'创建新分组…'} className={CreateTaskStyle.createTaskItemInput} onChange={this.inputChange.bind(this)} onPressEnter={this.inputEditOk.bind(this)} onBlur={this.inputEditOk.bind(this)} />
            </div>
          )}
      </div>
    )
  }
}
function mapStateToProps({
  projectDetailTask: {
    datas: {
      taskGroupList = []
    }
  },
  projectDetail: {
    datas: {
      projectDetailInfoData = {},
    }
  }
}) {
  return {
    taskGroupList,
    projectDetailInfoData
  }
}