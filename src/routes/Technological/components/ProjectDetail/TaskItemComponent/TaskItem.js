//分组列表
import React from 'react'
import CreateTaskStyle from './CreateTask.less'
import globalStyle from '../../../../../globalset/css/globalClassName.less'
import { Icon, Checkbox, Collapse, Input, message, Dropdown, Menu, Modal, Button, Avatar, DatePicker } from 'antd'
import QueueAnim from 'rc-queue-anim'
// import ItemOne from './ItemOne'
import ItemTwo from './ItemTwo'
import DCMenuItemOne from './DCMenuItemOne'
import { timeToTimestamp, stopPropagation} from '../../../../../utils/util'

import {
  MESSAGE_DURATION_TIME, PROJECT_TEAM_CARD_GROUP,
  NOT_HAS_PERMISION_COMFIRN, PROJECT_TEAM_CARD_CREATE,
  ORG_UPMS_ORGANIZATION_GROUP
} from "../../../../../globalset/js/constant";
import {checkIsHasPermission, checkIsHasPermissionInBoard} from "../../../../../utils/businessFunction";
import VisitControl from './../../VisitControl/index'
import {toggleContentPrivilege, setContentPrivilege, removeContentPrivilege} from './../../../../../services/technological/project'

const TextArea = Input.TextArea
const Panel = Collapse.Panel
const { RangePicker } = DatePicker;

export default class TaskItem extends React.Component {
  state = {
    isAddEdit: false, //添加任务编辑状态
    isInEditName: false, //任务分组名称编辑状态
    executor: {}, //任务负责人
    addNewTaskName: '', //新增任务名字
    start_time: '',
    due_time: '',
    addTaskType: '0', //0默认 1日程
    elseElementHeight: 342, //除了list高度之外其他元素高度总和
    taskGroupOperatorDropdownMenuVisible: false, //分组操作 dropdown 菜单 visible
    isShouldBeTaskGroupOperatorDropdownMenuVisible: false,
    shouldHideVisitControlPopover: false,
  }
  constructor(props) {
    super(props)
  }
  gotoAddItem() {
    if(!checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_CREATE)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    this.setState({
      isAddEdit: true,
      elseElementHeight: 395+21
    })
  }
  addItem(data, e) {
    const name = e.target.value
    if(name){
      const obj = Object.assign(data, {name})
      this.props.addTask(obj)
    }
    this.setState({
      isAddEdit: false,
      elseElementHeight: 342
    })
  }
  //任务名
  addNewTaskNameTextAreaChange(e) {
    this.setState({
      addNewTaskName: e.target.value
    })
  }
  //负责人
  setList(id) {
    const { datas: { projectDetailInfoData = {} } } = this.props.model
    const { board_id } = projectDetailInfoData
    this.props.removeProjectMenbers({board_id, user_id: id})
  }
  chirldrenTaskChargeChange(data) {
     this.setState({
       executor: data
     })
  }
  //设置日期
  rangePickerChange(data, dateString) {
    this.setState({
      start_time: timeToTimestamp(dateString[0]),
      due_time: timeToTimestamp(dateString[1]),
    })
  }
  //设置任务类型
  setAddTaskType(type){
    this.setState({
      addTaskType: type
    })
  }
  //还原添加子任务操作
  reductionAddTaskOperate(){
    this.setState({
      isAddEdit: false,
      elseElementHeight: 342,
      executor: {}, //任务负责人
      addNewTaskName: '', //新增任务名字
      start_time: '',
      due_time: '',
      addTaskType: '0', //0默认 1日程
    })
  }
  cancelAddNewTask() {
    this.reductionAddTaskOperate()
  }
  checkAddNewTask() {
    const {addTaskType, due_time, start_time, addNewTaskName, executor } = this.state
    const { projectDetailInfoData: { board_id}, getTaskGroupListArrangeType } = this.props.model.datas
    const { taskItemValue: {list_id}} = this.props
    const obj = {
      board_id,
      list_id,
      name: addNewTaskName,
      users: executor['user_id'],
      start_time,
      due_time,
      type: addTaskType,
      add_type: !!list_id? getTaskGroupListArrangeType: '0', //如果是 分组‘其他’，则固定0
    }
    this.props.addTask(obj)
    this.reductionAddTaskOperate()
  }

  //点击分组操作
  handleMenuClick(e ) {
    e.domEvent.stopPropagation();
    const { projectDetailInfoData = {} } = this.props.model.datas
    const { org_id } = projectDetailInfoData
    if(!checkIsHasPermission(ORG_UPMS_ORGANIZATION_GROUP, org_id)){
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
    const { taskItemValue = {}, itemKey } = this.props
    const { list_id } = taskItemValue
    this.props.deleteTaskGroup({
      id: list_id,
      itemKey
    })
  }

  //  修改分组名称
  setIsInEditAdd() {
    this.setState({
      isInEditName: true
    })
  }
  inputEditOk(e) {
    const { inputValue } = this.state
    const { taskItemValue, itemKey } = this.props
    const { list_name, list_id } = taskItemValue

    this.setState({
      isInEditName: false,
    })

    if(!inputValue || list_name == inputValue) {
      return false
    }

    this.props.updateTaskGroup({
      id: list_id,
      name: inputValue,
      itemKey
    })
    this.setState({
      inputValue: '',
    })
  }
  inputChange(e) {
    this.setState({
      inputValue: e.target.value
    })
  }

  //阻止父组件冒泡滚轮

  taskGroupListMouseOver() {
    this.setState({
      taskGroupListMouseOver: true
    })
  }
  taskGroupListMouseLeave() {
    this.setState({
      taskGroupListMouseOver: false
    })
  }
  fnWhee1_2(e) {
    stopPropagation(e)
  }

  //新增任务回车键处理
  handlerMultiEnter(e) {
    let code = e.keyCode;
    let ctrl = e.ctrlKey;
    let shift = e.shiftKey;
    let alt = e.altKey;
    if(code == '10' && ctrl && !shift && !alt) {
      //ctrl + enter
      // return;
    }
    if(code == '13' && !ctrl && shift && !alt) {
      //shift + enter
      // return;
    }
    if(code == '13' && !ctrl && !shift && !alt) {
      //只按了enter
      this.checkAddNewTask()
    }
  }
  visitControlUpdateCurrentProjectData = (obj) => {
    const { taskItemValue = {}, itemKey } = this.props
    const {list_id, list_name} = taskItemValue
    const data = Object.assign({}, {id: list_id, itemKey, name: list_name})
    this.props.updateTaskGroup(data)
    this.setState({
      isShouldBeTaskGroupOperatorDropdownMenuVisible: false,
      taskGroupOperatorDropdownMenuVisible: false,
        shouldHideVisitControlPopover: true,
    })
  }
  handleVisitControlChange = flag => {
    const { taskItemValue = {}, itemKey } = this.props
    const {list_id, is_privilege} = taskItemValue
    const toBool = str => !!Number(str)
    const is_privilege_bool = toBool(is_privilege)
    if(flag === is_privilege_bool) {
      return
    }
    //toggole 权限
    const data = {
      content_id: list_id,
      content_type: 'lists',
      is_open: flag ? 1 : 0
    }
    toggleContentPrivilege(data).then(res => {
      if(res && res.code === '0') {
        //更新数据
        this.visitControlUpdateCurrentProjectData({is_privilege: flag ? '1' : '0'})
      } else {
        message.error('设置任务列表内容权限失败，请稍后再试')
      }
    })
  }
  handleVisitControlRemoveContentPrivilege = id => {
    const { taskItemValue = {}} = this.props
    const {list_id, privileges} = taskItemValue
    const content_type = 'lists'
    const content_id = list_id
    removeContentPrivilege({
      content_id,
      content_type,
      user_id: id
    }).then(res => {
      const isResOk = res => res && res.code === '0'
      if(isResOk(res)) {
        message.success('移出用户成功')
        const obj = {}
        for(let item in privileges) {
          if(id !== item) {
            obj[item] = privileges[item]
          }
        }

        this.visitControlUpdateCurrentProjectData({privileges: obj})
      } else {
        message.error('移出用户失败')
      }
    })
  }
  handleClickedOtherPersonListOperatorItem = (id, type) => {
    if(type === 'remove') {
      this.handleVisitControlRemoveContentPrivilege(id)
    } else {
      this.handleSetContentPrivilege(id, type, '更新用户控制类型失败')
    }
    console.log(id, type, 'handleClickedOtherPersonListOperatorItem')
  }
  handleVisitControlAddNewMember = (ids = []) => {
    if(!ids.length) return
    const user_ids = ids.reduce((acc, curr) => {
      if(!acc) return curr
      return `${acc},${curr}`
    }, '')
    this.handleSetContentPrivilege(user_ids, 'read')
  }
  handleSetContentPrivilege = (ids, type, errorText='访问控制添加人员失败，请稍后再试') => {
    const { taskItemValue = {}} = this.props
    const {list_id, privileges} = taskItemValue
    const content_type = 'lists'
    const privilege_code = type
    const user_ids = ids
    const content_id = list_id
    setContentPrivilege({
      content_id,
      content_type,
      privilege_code,
      user_ids
    }).then(res => {
      if(res && res.code === '0') {
        const obj = Object.assign({}, privileges, ids.split(',').reduce((acc, curr) => Object.assign({}, acc, {[curr]: 'read'}), {}))
        this.visitControlUpdateCurrentProjectData({privileges: obj})
      } else {
        message.error(errorText)
      }
    })
  }
  handleVisitControlPopoverVisible = (flag) => {
    if(!flag) {
      this.setState({
        taskGroupOperatorDropdownMenuVisible: false
      })
    }
    this.setState({
      isShouldBeTaskGroupOperatorDropdownMenuVisible: flag,
    })
}
  handleTaskGroupOperatorDropdownMenuVisibleChange = visible => {
    const {isShouldBeTaskGroupOperatorDropdownMenuVisible} = this.state
    if(isShouldBeTaskGroupOperatorDropdownMenuVisible) return
    if(visible === true) {
      this.setState({
        shouldHideVisitControlPopover: false,
      })
    }
    this.setState({
      taskGroupOperatorDropdownMenuVisible: visible
    })
  }
  hideTaskGroupOperatorDropdownMenuWhenScroll = nextProps => {
    const {isScrolling: nextIsScrolling} = nextProps
    if(nextIsScrolling) {
      this.setState({
        isShouldBeTaskGroupOperatorDropdownMenuVisible: false,
        taskGroupOperatorDropdownMenuVisible: false,
        shouldHideVisitControlPopover: true,
      })
    }
  }
  componentWillReceiveProps(nextProps) {
    this.hideTaskGroupOperatorDropdownMenuWhenScroll(nextProps)
  }
  render() {
    const { isAddEdit, isInEditName, executor={}, start_time, due_time, addTaskType, addNewTaskName, elseElementHeight, taskGroupOperatorDropdownMenuVisible, shouldHideVisitControlPopover } = this.state
    const { taskItemValue = {}, clientHeight } = this.props
    const { projectDetailInfoData = {} } = this.props.model.datas
    const { board_id, data = [], } = projectDetailInfoData
    const { list_name, list_id, card_data = [], editable, is_privilege = '0', privileges} = taskItemValue

    const projectParticipant = card_data.reduce((acc, curr) => [...acc, ...(curr&&curr.executors&&curr.executors.length ? curr.executors.filter(i => !acc.find(e => e.user_id === i.user_id)) : [] )], [])
    const visitControlOtherPersonOperatorMenuItem = [
      {
        key: '可访问',
        value: 'read'
      },
      {
        key: '移出',
        value: 'remove',
        style: {
          color: '#f73b45'
        }
      }
    ]
    let isCheckDisabled = false
    if(!addNewTaskName) {
      isCheckDisabled = true
    }
    if(addTaskType === '1') {
      if(!start_time || !due_time) {
        isCheckDisabled = true
      }
    }

    const operateMenu = () => {
      return (
        <Menu onClick={this.handleMenuClick.bind(this)}>
          <Menu.Item key={'1'} style={{textAlign: 'center', padding: 0, margin: 0}}>
            <div className={CreateTaskStyle.elseProjectMemu}>
              重命名
            </div>
          </Menu.Item>
          <Menu.Item key={'99'} style={{textAlign: 'center', padding: 0, margin: 0}}>
            {!shouldHideVisitControlPopover && (
              <div style={{marginLeft: '-35px', minWidth: '130px'}}>
            <VisitControl
              popoverPlacement={'rightTop'}
              isPropVisitControl={is_privilege === '0' ? false : true}
              principalList={projectParticipant}
              principalInfo='位任务列表负责人'
              otherPrivilege={privileges}
              otherPersonOperatorMenuItem={visitControlOtherPersonOperatorMenuItem}
              removeMemberPromptText='移出后用户将不能访问此任务列表'
              handleVisitControlChange={this.handleVisitControlChange}
              handleVisitControlPopoverVisible={this.handleVisitControlPopoverVisible}
              handleClickedOtherPersonListOperatorItem={this.handleClickedOtherPersonListOperatorItem}
              handleAddNewMember={this.handleVisitControlAddNewMember}
              >
              <span>访问控制&nbsp;&nbsp;<span className={globalStyle.authTheme}>&#xe7eb;</span></span>
            </VisitControl>
            </div>
            )}
          </Menu.Item>
          {card_data.length ? (''): (
            <Menu.Item key={'2'} style={{textAlign: 'center', padding: 0, margin: 0}}>
              <div className={CreateTaskStyle.elseProjectDangerMenu}>
                删除
              </div>
            </Menu.Item>
          )}
        </Menu>
      );
    }

    let corretDegree = 0 //  修正度，媒体查询变化两条header高度
    if(clientHeight < 900) {
      corretDegree = 44
    }
    let cardListOut = clientHeight - elseElementHeight + corretDegree
    cardListOut = cardListOut < 0? 0 : cardListOut

    return (
      <div className={CreateTaskStyle.taskItem}
           onWheel={this.fnWhee1_2.bind(this)}
           onScroll={this.fnWhee1_2.bind(this)}>
          {!isInEditName?(
            <div className={CreateTaskStyle.title}>
              <div className={CreateTaskStyle.title_l}>
                <div className={CreateTaskStyle.title_l_name}>{list_name}</div>
                <div><Icon type="right" className={[CreateTaskStyle.nextIcon]}/></div>
                {editable==='1' && checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_GROUP)? (
                <Dropdown overlay={operateMenu()} trigger={['click']} visible={taskGroupOperatorDropdownMenuVisible} onVisibleChange={this.handleTaskGroupOperatorDropdownMenuVisibleChange}>
                    <div className={CreateTaskStyle.titleOperate}>
                      <Icon type="ellipsis" theme="outlined" />
                    </div>
                  </Dropdown>
                ):('')}
              </div>
              <div className={CreateTaskStyle.title_r}>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 16}} >
              <Input autoFocus defaultValue={list_name} placeholder={'修改名称'} className={CreateTaskStyle.createTaskItemInput} onChange={this.inputChange.bind(this)} onPressEnter={this.inputEditOk.bind(this)} onBlur={this.inputEditOk.bind(this)}/>
            </div>
          )}
        <div className={CreateTaskStyle.cardListOut} style={{maxHeight: cardListOut }}>
        {/*<QueueAnim  interval={20}>*/}
          {card_data.map((value, key) => {
            const { card_id } = value
            return(
              <ItemTwo itemValue={value} {...this.props}
                       taskGroupListIndex_index={key}
                       key={card_id} {...this.props} />
            )
          })}
        {/*</QueueAnim>*/}
        </div>
        {checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_CREATE) && (
          !isAddEdit? (
            <div key={'add'} className={CreateTaskStyle.addItem} onClick={this.gotoAddItem.bind(this)}>
              <Icon type="plus-circle-o" />
            </div>
          ) : (
            <div key={'adds'} className={CreateTaskStyle.addNewTask} >
              <div className={CreateTaskStyle.addNewTask_top}>
                <TextArea autoFocus={true} autosize={{ minRows: 2, maxRows: 2 }} style={{ resize: 'none'}} onKeyDown={this.handlerMultiEnter.bind(this)} onChange={this.addNewTaskNameTextAreaChange.bind(this)} />
              </div>
              <div className={CreateTaskStyle.addNewTask_bott}>
                <div className={CreateTaskStyle.addNewTask_bott_left}>
                  {/*选择类型*/}
                  <div className={CreateTaskStyle.addNewTask_bott_left_select}>
                    <div className={addTaskType==='0'?CreateTaskStyle.select_left2:CreateTaskStyle.select_left} onClick={this.setAddTaskType.bind(this, '0')}>
                      <i className={globalStyle.authTheme}>&#xe70a;</i>
                    </div>
                    <div className={addTaskType==='1'?CreateTaskStyle.select_right2: CreateTaskStyle.select_right} onClick={this.setAddTaskType.bind(this, '1')}>
                      <i className={globalStyle.authTheme}>&#xe709;</i>
                    </div>
                  </div>
                  {/*任务负责人*/}
                  <div>
                    <Dropdown overlay={<DCMenuItemOne execusorList={data} canNotRemoveItem={true} setList={this.setList.bind(this)} chirldrenTaskChargeChange={this.chirldrenTaskChargeChange.bind(this)}/>}>
                      <div style={{display: 'flex', alignItems: 'center'}}>
                        {executor.user_id?(
                          executor.avatar? (
                            <img style={{ width: 20, height: 20, borderRadius: 20, marginRight: 8}} src={executor.avatar} />
                          ) : (
                            <div style={{width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#f5f5f5', marginRight: 8, lineHeight: '20px'}}>
                              {executor.full_name.substring(0, 1)}
                            </div>
                          )
                        ):(
                          <div style={{width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#f5f5f5', marginRight: 8, }}>
                            <i className={globalStyle.authTheme}>&#xe70c;</i>
                          </div>
                        )}
                      </div>
                    </Dropdown>
                  </div>
                  {/*选择会议日期*/}
                  <div className={CreateTaskStyle.addNewTask_bott_left_selectMeeting}>
                    <Icon type={'calendar'} style={{color: start_time && due_time ?'#262626': '#8c8c8c'}} />
                    <RangePicker onChange={this.rangePickerChange.bind(this)}
                                 showTime={{format: 'HH:mm'}}
                                 format="YYYY/MM/DD HH:mm"
                                 className={CreateTaskStyle.addNewTask_bott_left_rangePicker}
                                 style={{width: 20}} />
                  </div>
                </div>
                <div className={CreateTaskStyle.addNewTask_bott_right}>
                  <Button size={'small'} style={{fontSize: 12, marginRight: 8}} onClick={this.cancelAddNewTask.bind(this)} >取消</Button>
                  <Button type={'primary'} size={'small'} style={{fontSize: 12}} disabled={isCheckDisabled} onClick={this.checkAddNewTask.bind(this)}>确认</Button>
                </div>
              </div>
              {/*<div  key={'adds'} className={CreateTaskStyle.addItem} > //原来需求*/}
              {/*<Input  onPressEnter={this.addItem.bind(this,{board_id, list_id})} onBlur={this.addItem.bind(this,{board_id, list_id})} autoFocus={true}/>*/}
              {/*</div>*/}

            </div>
          )
        )}

      </div>
    )
  }
}
