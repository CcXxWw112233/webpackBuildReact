//分组列表
import React from 'react'
import CreateTaskStyle from './CreateTask.less'
import { Icon, Checkbox, Collapse, Input, message, Menu, Modal, Dropdown, Avatar } from 'antd'
import QueueAnim from 'rc-queue-anim'
import ItemTwo from './ItemTwo'
import ItemOne from './ItemOne'
import {
  MESSAGE_DURATION_TIME, NOT_HAS_PERMISION_COMFIRN,
  ORG_UPMS_ORGANIZATION_MEMBER_ADD, ORG_UPMS_ORGANIZATION_GROUP, ORG_UPMS_ORGANIZATION_MEMBER_EDIT
} from "../../../../globalset/js/constant";
import ShowAddMenberModal from './ShowAddMenberModal'
import TreeGroupModal from './TreeGroupModal'
import MenuSearchSingleNormal from '../../../../components/MenuSearchSingleNormal'
import {checkIsHasPermission} from "../../../../utils/businessFunction";
import {ORGANIZATION, TASKS, FLOWS, DASHBOARD, PROJECTS, FILES, MEMBERS, CATCH_UP} from "../../../../globalset/js/constant";
import {currentNounPlanFilterName} from "../../../../utils/businessFunction";
const Panel = Collapse.Panel

export default class TaskItem extends React.Component {

  state = {
    isInEditAdd: false,
    inputValue: '',
    ShowAddMenberModalVisibile: false,
  }
  //添加成员
  gotoAddItem() {
    if(!checkIsHasPermission(ORG_UPMS_ORGANIZATION_MEMBER_ADD)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    this.setShowAddMenberModalVisibile()
  }
  setShowAddMenberModalVisibile() {
    this.setState({
      ShowAddMenberModalVisibile: !this.state.ShowAddMenberModalVisibile
    })
  }
  addMembers(data) {
    const { itemValue = {} } = this.props
    const { id } = itemValue
    const { users } = data
    this.props.inviteMemberToGroup({
      members: users,
      group_id: id
    })
  }

  //点击分组操作
  handleMenuClick(e ) {
    e.domEvent.stopPropagation();
    if(!checkIsHasPermission(ORG_UPMS_ORGANIZATION_GROUP)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const { key } = e
    switch (key) {
      case '1':
        this.setIsInEditAdd()
        break
      case '2':
        this.deleteConfirm()
        break
      default:
        break
    }
  }
  deleteConfirm( ) {
    const that = this
    Modal.confirm({
      title: '确认删除？',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        that.deleteGroupItem()
      }
    });
  }
  deleteGroupItem() {
    const { itemValue = {} } = this.props
    const { id } = itemValue
    this.props.deleteGroup({
      id
    })
  }

  //  修改分组名称
  setIsInEditAdd() {
    this.setState({
      isInEditAdd: true
    })
  }
  inputEditOk(e) {
    this.setState({
      isInEditAdd: false,
    })
    const { inputValue } = this.state
    const { itemValue = {} } = this.props
    const { id, name } = itemValue
    if(!this.state.inputValue || name == inputValue) {
      return false
    }
    this.setState({
      inputValue: '',
    })
    this.props.updateGroup({
      group_id: id,
      name: inputValue
    })
  }
  inputChange(e) {
    this.setState({
      inputValue: e.target.value
    })
  }

  //设置分组负责人
  getMembersInOneGroup() {
    if(!checkIsHasPermission(ORG_UPMS_ORGANIZATION_MEMBER_EDIT)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const { itemValue = {}, itemKey } = this.props
    const { id } = itemValue
    this.props.getMembersInOneGroup({group_id: id, parentKey: itemKey})
  }
  MenuSearchSingleClick(data) {
    const { itemKey } = this.props
    this.props.setGroupLeader({
      ...data, parentKey: itemKey
    })
  }
  render() {
    const { isInEditAdd, inputValue } = this.state
    const { itemValue = {}, itemKey } = this.props
    const { name, is_default, members = [], leader_id='', leader_avatar='', leader_members = []} = itemValue //is_default ==='1' 默认分组不可操作
    //is_default 0 1 2 普通分组/未分组/访客分组
    const { datas: { menuSearchSingleSpinning }} = this.props.model

    const operateMenu = (is_default) => {
      return (
        <Menu onClick={this.handleMenuClick.bind(this)}>
          <Menu.Item key={'1'} style={{textAlign: 'center', padding: 0, margin: 0}}>
            <div className={CreateTaskStyle.elseProjectMemu}>
              重命名
            </div>
          </Menu.Item>
          {is_default === '0' && (
            <Menu.Item key={'2'} style={{textAlign: 'center', padding: 0, margin: 0}}>
              <div className={CreateTaskStyle.elseProjectDangerMenu}>
                删除
              </div>
            </Menu.Item>
          )}

        </Menu>
      );
    }

    return (
      <div className={CreateTaskStyle.taskItem}>
        {!isInEditAdd?(
          <div className={CreateTaskStyle.title}>
            <div className={CreateTaskStyle.title_l}>
              {is_default === '0'? (
                <Dropdown trigger={['click']} overlay={<MenuSearchSingleNormal menuSearchSingleSpinning={menuSearchSingleSpinning} Inputlaceholder={`搜索${currentNounPlanFilterName(MEMBERS)}`} searchName={'name'} listData={leader_members} MenuSearchSingleClick={this.MenuSearchSingleClick.bind(this)}/>}>
                  {!leader_id?(
                    <div className={CreateTaskStyle.leader} onClick={this.getMembersInOneGroup.bind(this)}>
                      <Icon type="ellipsis" theme="outlined" />
                    </div>
                  ) : (
                    <Avatar onClick={this.getMembersInOneGroup.bind(this)} src={leader_avatar} size={20} icon={"user"} style={{marginRight: 6, color: '#8c8c8c', backgroundColor: '#d9d9d9'}}></Avatar>
                  )}
                </Dropdown>
              ) : (
                ''
              )}

              <div className={CreateTaskStyle.title_l_name}>{name}</div>
              <div style={{marginRight: 4, marginLeft: 4}}>·</div>
              <div>{members.length}</div>
              {is_default === '0' || is_default === '2' && checkIsHasPermission(ORG_UPMS_ORGANIZATION_GROUP)?(
                <Dropdown overlay={operateMenu(is_default)}>
                  <div className={CreateTaskStyle.titleOperate}>
                    <Icon type="ellipsis" theme="outlined" />
                  </div>
                </Dropdown>
              ):('')}
            </div>
            <div className={CreateTaskStyle.title_r}>
              {/*暂时未开放*/}
              {/*<div>子分组</div><div style={{marginRight: 4, marginLeft: 4}}>·</div>2 <Icon type="down" style={{marginLeft:6}} theme="outlined" />*/}
            </div>
          </div>
        ) : (
          <div>
            <Input autoFocus defaultValue={name} placeholder={'修改名称'} className={CreateTaskStyle.createTaskItemInput} onChange={this.inputChange.bind(this)} onPressEnter={this.inputEditOk.bind(this)} onBlur={this.inputEditOk.bind(this)}/>
          </div>
        )}

        <QueueAnim >
          {members.map((value, key) => {
            const { status } = value
            let contain
            if(status === '2') {
              contain = (
                <ItemOne {...this.props} itemValue={value}
                         parentItemValue={itemValue}
                         parentKey={itemKey}
                         itemKey={key}
                         key={key} />
               )
            }else if (status === '1'){
              contain = (
                <ItemTwo {...this.props} itemValue={value}
                         parentItemValue={itemValue}
                         itemKey={key}
                         key={key} />
               )
            }else {

            }
            return contain
          })}
          {is_default === '0' && checkIsHasPermission(ORG_UPMS_ORGANIZATION_MEMBER_ADD)? (
            <div key={'add'} className={CreateTaskStyle.addItem} onClick={this.gotoAddItem.bind(this)}>
              <Icon type="plus-circle-o" />
            </div>
          ) : ('')}

        </QueueAnim>
        <ShowAddMenberModal {...this.props} addMembers={this.addMembers.bind(this)} modalVisible={this.state.ShowAddMenberModalVisibile} setShowAddMenberModalVisibile={this.setShowAddMenberModalVisibile.bind(this)}/>
        {/*<TreeGroupModal  {...this.props}/>*/}
      </div>
    )
  }
}
