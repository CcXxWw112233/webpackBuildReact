import React from 'react'
import DrawerContentStyles from './DrawerContent.less'
import { Icon, Input, Button, DatePicker, Dropdown, Menu, Avatar, Tooltip } from 'antd'
import DCMenuItemOne from './DCMenuItemOne'
import DCAddChirdrenTaskItem from './DCAddChirdrenTaskItem'
import {deepClone, timeToTimestamp} from '../../../../../../../utils/util'
import {currentNounPlanFilterName} from "../../../../../../../utils/businessFunction";
import {FLOWS, TASKS} from "../../../../../../../globalset/js/constant";
import globalStyles from '../../../../../../../globalset/css/globalClassName.less'

const TextArea = Input.TextArea

export default class DCAddChirdrenTask extends React.Component{
  state = {
    isSelectUserIcon: false, // default '#8c8c8c, hover #595959
    isSelectCalendarIcon: false,
    isShowUserCalendar: false,
    List: [1, 2, 3, 4],
    due_time: '', //日期选择后的日期‘2018-08-07’
    name: '',
    executors: [],
    saveDisabled: true,
    isCanBlurDo: true, //input失焦是否可以触发设置区域隐藏标志
  }
  datePickerChange(date, dateString) {
    this.setState({
      due_time: timeToTimestamp(dateString).toString(),
      isSelectCalendarIcon: true
    })
  }
  //设置子任务负责人组件---------------start
  setList(id) {
    const { datas: { projectDetailInfoData = {} } } = this.props.model
    const { board_id } = projectDetailInfoData
    this.props.removeProjectMenbers({board_id, user_id: id})
  }
  chirldrenTaskChargeChange(data) {
    let executors = []
    executors.push(data)
    this.setState({
      isSelectUserIcon: true,
      executors
    })
  }

  deleteExcutor(data){
    let executors = []
     const obj = {
      user_id: '',
      user_name: '',
      avatar: ''
    }
    executors.push(obj)
    this.setState({
      isSelectUserIcon: true,
      executors
    })
  }
  //设置子任务负责人组件---------------end

  //添加子任务
  addChirldTask() {
    const { datas: { drawContent = {}, board_id } } = this.props.model
    const { card_id, child_data = [], list_id } = drawContent
    const obj = {
      card_id,
      board_id,
      list_id,
      name: this.state.name,
      executors: this.state.executors,
      users: this.state.executors.length ? this.state.executors[0].user_id : '',
      due_time: this.state.due_time,
      card_name: this.state.name,
      taskGroupListIndex: this.props.model.datas.taskGroupListIndex,
      taskGroupListIndex_index: this.props.model.datas.taskGroupListIndex_index,
      length: child_data.length,
    }
    drawContent['child_data'].unshift(obj)
    this.props.addChirldTask(obj)
    this.setState({
      isShowUserCalendar: false,
      isSelectUserIcon: false, // default '#8c8c8c, hover #595959
      isSelectCalendarIcon: false,
      due_time: '', //日期选择后的日期‘2018-08-07’
      executors: [],
      name: ''
    })
  }

  setAreaMouseOver() {
    this.setState({
      isCanBlurDo: false
    })
  }
  setAreaMouseLeave() {
    this.setState({
      isCanBlurDo: true
    })
  }

  //子任务名称设置
  setchirldTaskNameChange(e) {
    this.setState({
      name: e.target.value,
      saveDisabled: e.target.value ? false : true
    })
  }
  setchirldTaskNameBlur(e) {
    if(!this.state.isCanBlurDo) {
      return false
    }
    this.setState({
      isShowUserCalendar: false,
      isSelectUserIcon: false, // default '#8c8c8c, hover #595959
      isSelectCalendarIcon: false,
      due_time: '', //日期选择后的日期‘2018-08-07’
      executors: [],
      saveDisabled: true,
      name: ''
    })
  }
  addInputFocus(e) {
    this.setState({
      isShowUserCalendar: true,
      saveDisabled: e.target.value ? false : true
    })
  }

  //新增任务回车键处理
  handlerMultiEnter(e) {
    if(!e.target.value) {
      return
    }
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
      this.addChirldTask()
      this.refs.childTaskInput.blur()
    }
  }

  render() {
    const { isSelectUserIcon, isSelectCalendarIcon, List, isShowUserCalendar, executors = [] } = this.state
    const { datas: { drawContent = {}, projectDetailInfoData = {} } } = this.props.model
    let { card_id, card_name, child_data = [], start_time, due_time, description, label_data = [] } = drawContent
    const { data = [] } = projectDetailInfoData //任务执行人列表

    let executor = {//任务执行人信息
      user_id: '',
      full_name: '',
      avatar: '',
    }
    if(executors.length) {
      executor = executors[0]
    }

    return(
      <div className={DrawerContentStyles.divContent_1}>
        {child_data.map((value, key) => {
          return (
            <DCAddChirdrenTaskItem {...this.props} chirldTaskItemValue ={value} key={value.card_id} chirldDataIndex={key} />
          )
        })}
        <div className={DrawerContentStyles.contain_7}>
          <div style={{width: '100%'}}>
            <div className={DrawerContentStyles.contain_7_add}>
              <div>
                <Icon type="plus" style={{marginRight: 4}}/>
                <input
                       ref={'childTaskInput'}
                       onFocus={this.addInputFocus.bind(this)}
                       placeholder={`子${currentNounPlanFilterName(TASKS)}`}
                       onChange={this.setchirldTaskNameChange.bind(this)}
                       onBlur={this.setchirldTaskNameBlur.bind(this)}
                       onKeyDown={this.handlerMultiEnter.bind(this)}
                       value={this.state.name}
                />
              </div>
              <div style={{display: isShowUserCalendar ? 'flex':'none'}} onMouseOver={this.setAreaMouseOver.bind(this)} onMouseLeave={this.setAreaMouseLeave.bind(this)}>
                <Dropdown overlay={
                  <DCMenuItemOne deleteExcutor={this.deleteExcutor.bind(this)} currentExecutor={executor} execusorList={data} setList={this.setList.bind(this)} chirldrenTaskChargeChange={this.chirldrenTaskChargeChange.bind(this)}/>
                }>
                  {executor.user_id? (
                    <Tooltip title={executor.full_name || '佚名'}>
                      {/*{imgOrAvatar(executor.avatar)}*/}
                      <Avatar size={16} src={executor.avatar} style={{fontSize: 14, margin: '4px 12px 0 12px', }}>{executor.full_name.substring(0, 1) || '佚'}</Avatar>
                    </Tooltip>
                  ) : (
                    <div>
                      {/*<Icon type="user" style={{fontSize: 16,margin:'0 12px',marginTop: 2,cursor: 'pointer'}} className={DrawerContentStyles.userIconNormal}/>*/}
                      <div className={`${globalStyles.authTheme} ${DrawerContentStyles.userIconNormal}`} style={{fontSize: 16, margin: '0 12px', cursor: 'pointer'}}>&#xe70c;</div>
                    </div>
                  )}
                  {/*<Icon type="user" style={{fontSize: 16,margin:'0 12px',cursor: 'pointer'}} className={!isSelectUserIcon ? DrawerContentStyles.userIconNormal: DrawerContentStyles.userIconSelected}/>*/}
                </Dropdown>
                <div className={`${globalStyles.authTheme} ${!isSelectCalendarIcon?DrawerContentStyles.calendarIconNormal:DrawerContentStyles.calendarIconSelected}`} style={{fontSize: 16, marginRight: '12px', cursor: 'pointer'}}>&#xe709;</div>
                {/*<Icon type="calendar" style={{fontSize: 16, marginRight: 12 ,cursor: 'pointer'}} className={!isSelectCalendarIcon?DrawerContentStyles.calendarIconNormal:DrawerContentStyles.calendarIconSelected}/>*/}
                <DatePicker onChange={this.datePickerChange.bind(this)}
                            placeholder={'选择截止日期'}
                            format="YYYY/MM/DD HH:mm"
                            showTime={{format: 'HH:mm'}}
                            style={{opacity: 0, width: 16, background: '#000000', position: 'absolute', right: 50, zIndex: 2}} />
                <Button disabled={this.state.saveDisabled} onClick={this.addChirldTask.bind(this)} type={'primary'} style={{width: 40, height: 20, padding: '0 5px', fontSize: 12, }}>保存</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
