//创建分组

import React from 'react'
import CreateTaskStyle from './CreateTask.less'
import { Icon, Checkbox, Collapse, Input, message } from 'antd'
import Cookies from 'js-cookie'
import {
  MESSAGE_DURATION_TIME, NOT_HAS_PERMISION_COMFIRN,
  ORG_UPMS_ORGANIZATION_GROUP
} from "../../../../globalset/js/constant";
import {checkIsHasPermission} from "../../../../utils/businessFunction";
const Panel = Collapse.Panel

export default class CreateItem extends React.Component {
  state = {
    isInEditAdd: false,
    inputValue: '',
  }

  setIsInEditAdd() {
    if(!checkIsHasPermission(ORG_UPMS_ORGANIZATION_GROUP)){
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
    if(!this.state.inputValue) {
      return false
    }

    const obj = {
      name: this.state.inputValue,
      org_id: Cookies.get('org_id'),
    }
    this.props.CreateGroup(obj)
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
        {!isInEditAdd?(
          <div className={CreateTaskStyle.createTaskItemTitle} onClick={this.setIsInEditAdd.bind(this)}>创建新分组…</div>
        ):(
          <div>
            <Input autoFocus value={inputValue} placeholder={'创建新分组…'} className={CreateTaskStyle.createTaskItemInput} onChange={this.inputChange.bind(this)} onPressEnter={this.inputEditOk.bind(this)} onBlur={this.inputEditOk.bind(this)}/>
          </div>
        )}
      </div>
    )
  }
}
