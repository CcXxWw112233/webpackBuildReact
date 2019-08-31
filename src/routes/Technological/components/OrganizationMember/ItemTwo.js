//任务
import React from 'react'
import CreateTaskStyle from './CreateTask.less'
import { Icon, Checkbox, Collapse, Avatar, Button, Menu, Dropdown, message } from 'antd'
import QueueAnim from 'rc-queue-anim'
import {
  MESSAGE_DURATION_TIME, NOT_HAS_PERMISION_COMFIRN,
  ORG_UPMS_ORGANIZATION_MEMBER_EDIT, ORG_UPMS_ORGANIZATION_MEMBER_ADD
} from "../../../../globalset/js/constant";
import {checkIsHasPermission} from "../../../../utils/businessFunction";

const Panel = Collapse.Panel

export default class ItemTwo extends React.Component {
  state = {
    collapseClose: true, //折叠面板变化回调
  }
  //拒绝
  handleMenuClick(e) {
    if(!checkIsHasPermission(ORG_UPMS_ORGANIZATION_MEMBER_EDIT)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const { key } = e
    if(key === '1') {
      const { itemValue: { member_id} } = this.props
      this.props.approvalMember({
        member_id,
        status: '0'
      })
    }
  }
  //通过
  passMember (data) {
    if(!checkIsHasPermission(ORG_UPMS_ORGANIZATION_MEMBER_ADD)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    this.props.approvalMember(data)
  }
  render() {
    const { itemValue } = this.props
    const { member_id, avatar, name, role_name } = itemValue
    const operateMenu = () => (
      <Menu onClick={this.handleMenuClick.bind(this)}>
        <Menu.Item key={'1'}>
           拒绝
        </Menu.Item>
      </Menu>
    )

    return (
      <div key={'2'} className={CreateTaskStyle.item_2} >
        <div className={CreateTaskStyle.item_2_left}>
          <div className={CreateTaskStyle.avatar}>
            <Avatar size={40} icon="user" src={avatar}/>
          </div>
          <div className={CreateTaskStyle.detail}>
             <div>{name}</div>
             <div>{role_name}</div>
          </div>
        </div>
        <div className={CreateTaskStyle.item_2_right}>
          {checkIsHasPermission(ORG_UPMS_ORGANIZATION_MEMBER_ADD) && (
            <Dropdown overlay={operateMenu()}>
              <Button onClick={this.passMember.bind(this, {member_id, status: '2'})} type={'primary'} size={'small'}><Icon type="file" theme="outlined" style={{fontSize: 12}} />批准<Icon type="down" theme="outlined" style={{fontSize: 12}}/></Button>
            </Dropdown>
          )}

        </div>
      </div>
    )
  }
}

const customPanelStyle = {
  background: '#f5f5f5',
  borderRadius: 4,
  fontSize: 12,
  color: '#8c8c8c',
  border: 0,
  overflow: 'hidden',
};
