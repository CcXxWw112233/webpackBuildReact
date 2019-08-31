import React from 'react'
import DrawerContentStyles from './DrawerContent.less'
import { Icon, Input, Button, DatePicker, Dropdown, Menu, Avatar, Tooltip, Popconfirm, } from 'antd'
import DCMenuItemOne from './DCMenuItemOne'
import { timestampToTimeNormal, timeToTimestamp } from '../../../../../../../utils/util'
import globalStyles from '../../../../../../../globalset/css/globalClassName.less'
const TextArea = Input.TextArea

export default class DCAddChirdrenTaskItem extends React.Component{

  state = {
    isCheck: false,
    localChildTaskName: '',
    isInEditTaskName: false,
  }

  componentWillMount () {
    //设置默认项目名称
    this.initSet(this.props)
  }
  // componentWillReceiveProps (nextProps) {
  //   this.initSet(nextProps)
  // }
  //初始化根据props设置state
  initSet(props) {
    const { chirldTaskItemValue } = this.props
    const { card_name } = chirldTaskItemValue
    this.setState({
      localChildTaskName: card_name
    })
  }
  //项目操作----------------start
  //设置项目名称---start
  setIsInEditTaskName() {
    this.setState({
      isInEditTaskName: !this.state.isInEditTaskName,
    })
  }
  localChildTaskNameChange(e) {
    this.setState({
      localChildTaskName: e.target.value
    })
  }
  editTaskNameComplete(e) {
    this.setIsInEditTaskName()
    const { chirldTaskItemValue } = this.props
    const { localChildTaskName } = this.state
    if(chirldTaskItemValue['card_name'] == localChildTaskName) {
      return false
    }
    if(!localChildTaskName) {
      this.setState({
        localChildTaskName: chirldTaskItemValue['card_name']
      })
      return false
    }
    chirldTaskItemValue['card_name'] = localChildTaskName

    const { card_id } = chirldTaskItemValue
    const updateObj = {
      card_id,
      name: localChildTaskName
    }
    this.props.updateTask({updateObj})
  }

  itemOneClick() {
    const { chirldTaskItemValue, chirldDataIndex } = this.props
    const { datas: { drawContent = {}, } } = this.props.model
    const { card_id, is_realize = '0' } = chirldTaskItemValue
    const obj = {
      card_id,
      is_realize: is_realize === '1' ? '0' : '1'
    }
    drawContent['child_data'][chirldDataIndex]['is_realize'] = is_realize === '1' ? '0' : '1'
    this.props.updateDatas({drawContent})
    this.props.completeTask(obj)
  }
  //设置子任务负责人组件---------------start
  setList(id) {
    const { datas: { projectDetailInfoData = {} } } = this.props.model
    const { board_id } = projectDetailInfoData
    this.props.removeProjectMenbers({board_id, user_id: id})
  }
  chirldrenTaskChargeChange({ user_id, full_name, avatar }) {
    const { chirldTaskItemValue } = this.props
    const { card_id, executors=[] } = chirldTaskItemValue

    executors[0] = {
      user_id,
      user_name: full_name,
      avatar: avatar,
      name: full_name,
    }
    this.props.addTaskExecutor({
      card_id,
      users: user_id,
    })

  }

  deleteExcutor({ user_id, full_name, avatar }){
    const { chirldTaskItemValue } = this.props
    const { card_id, executors=[] } = chirldTaskItemValue
    executors[0] = {
      user_id: '',
      user_name: '',
      avatar: ''
    }
    this.props.removeTaskExecutor({
      card_id,
      user_id: user_id,
    })
    this.setState({
      ss: 1
    })
  }

  datePickerChange(date, dateString) {
    if(!dateString) {
      return false
    }
    const { datas: { drawContent = {} } } = this.props.model
    const { chirldTaskItemValue } = this.props
    const { card_id } = chirldTaskItemValue
    chirldTaskItemValue['due_time'] = timeToTimestamp(dateString).toString()
    const updateObj = {
      card_id,
      due_time: timeToTimestamp(dateString).toString()
    }
    this.props.updateTask({updateObj})
  }
  deleteConfirm( {card_id, chirldDataIndex}) {
    this.props.deleteChirldTask({card_id, chirldDataIndex})


    const { datas: { drawContent = {} } } = this.props.model
    drawContent['child_data'].splice(chirldDataIndex, 1)
    this.props.updateTaskDatas({drawContent})
  }
  render() {
    const { chirldTaskItemValue, chirldDataIndex } = this.props
    const { card_id, card_name, due_time, is_realize = '0', executors = []} = chirldTaskItemValue
    const { datas: { projectDetailInfoData = {} } } = this.props.model
    const { data = [] } = projectDetailInfoData //任务执行人列表
    const { localChildTaskName, isInEditTaskName} = this.state

    let executor = {//任务执行人信息
      user_id: '',
      user_name: '',
      avatar: '',
    }
    if(executors.length) {
      executor = executors[0]
      executor.user_name = executors[0]['name']
    }

    const imgOrAvatar = (img) => {
      return img ? (
        <div>
          <img src={img} style={{width: 16, height: 16, marginRight: 8, borderRadius: 16, margin: '0 12px'}} />
        </div>
      ):(
        <div style={{width: 16, height: 16, marginRight: 8, borderRadius: 16, margin: '0 12px', backgroundColor: '#8c8c8c'}}>
          <Avatar size={16} >ss</Avatar>
        </div>
      )
    }

    return (
      <div className={DrawerContentStyles.taskItem}>
        <div key={'1'} className={DrawerContentStyles.item_1} >
          {/*完成*/}
          <div className={is_realize === '1' ? DrawerContentStyles.nomalCheckBoxActive: DrawerContentStyles.nomalCheckBox} onClick={this.itemOneClick.bind(this)}>
            <Icon type="check" style={{color: '#FFFFFF', fontSize: 12, fontWeight: 'bold'}}/>
          </div>
          {/*名称和日期*/}
          <div>
            {!isInEditTaskName?(
              <div style={{wordWrap: 'break-word', width: 250, paddingTop: 2}} onClick = {this.setIsInEditTaskName.bind(this)}>
               {`${localChildTaskName}`}
              </div>
            ):(
              <TextArea value={localChildTaskName}
                     autoFocus
                        autosize={{minRows: 1}}
                     size={'small'}
                     onChange={this.localChildTaskNameChange.bind(this)}
                     onPressEnter={this.editTaskNameComplete.bind(this)}
                     onBlur={this.editTaskNameComplete.bind(this)} />
            )}
          <div style={{color: '#d5d5d5'}}>{due_time? (due_time.indexOf('-') !==-1? due_time : timestampToTimeNormal(due_time, '', true))+ '截止' : ''}</div>
          </div>
          {/*cuozuo*/}
          <div style={{position: 'relative', height: 22, display: 'flex', justifyContent: 'align-items'}}>
            <Popconfirm onConfirm={this.deleteConfirm.bind(this, {card_id, chirldDataIndex})} title={'删除该子任务？'}>
              <div className={`${globalStyles.authTheme} ${DrawerContentStyles.userIconNormal}`} style={{fontSize: 16}}>&#xe70f;</div>
            </Popconfirm>
            <Dropdown overlay={
              <DCMenuItemOne deleteExcutor={this.deleteExcutor.bind(this)} currentExecutor={executor} execusorList={data} setList={this.setList.bind(this)} chirldrenTaskChargeChange={this.chirldrenTaskChargeChange.bind(this)}/>
            }>
              {executor.user_id? (
                <Tooltip title={executor.user_name || executor.full_name || '佚名'}>
                  {/*{imgOrAvatar(executor.avatar)}*/}
                  <Avatar size={16} src={executor.avatar} style={{fontSize: 14, margin: '4px 12px 0 12px'}}>
                    {(executor.user_name || executor.full_name) ? (executor.user_name || executor.full_name).substring(0, 1): '佚' }
                    </Avatar>
                </Tooltip>
              ) : (
                <div>
                  {/*<Icon type="user" style={{fontSize: 16,margin:'0 12px',marginTop: 2,cursor: 'pointer'}} className={DrawerContentStyles.userIconNormal}/>*/}
                  <div className={`${globalStyles.authTheme} ${DrawerContentStyles.userIconNormal}`} style={{fontSize: 16, margin: '0 12px', cursor: 'pointer'}}>&#xe70c;</div>
                </div>
              )}

            </Dropdown>
            <div>
              {!due_time?(
                <div className={`${globalStyles.authTheme} ${DrawerContentStyles.userIconNormal}`} style={{fontSize: 16, marginRight: '12px', cursor: 'pointer'}}>&#xe709;</div>
              ):(
                <div className={`${globalStyles.authTheme} ${DrawerContentStyles.userIconNormal}`} style={{fontSize: 16, marginRight: '12px', cursor: 'pointer'}}>&#xe8e0;</div>
              )}
            </div>
            <DatePicker
              onChange={this.datePickerChange.bind(this)}
              placeholder={'选择截止日期'}
              format="YYYY/MM/DD HH:mm"
              showTime={{format: 'HH:mm'}}
              style={{opacity: 0, height: 16, width: 16, background: '#000000', position: 'absolute', right: 0, zIndex: 2}} />
          </div>
        </div>
      </div>
    )
  }
}
