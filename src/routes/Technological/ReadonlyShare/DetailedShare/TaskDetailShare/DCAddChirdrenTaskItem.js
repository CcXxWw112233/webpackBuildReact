import React from 'react'
import DrawerContentStyles from './DrawerContent.less'
import { Icon, Input, Button, DatePicker, Dropdown, Menu, Avatar, Tooltip, Popconfirm, } from 'antd'
import DCMenuItemOne from './DCMenuItemOne'
import { timestampToTimeNormal, timeToTimestamp } from '../../../../../utils/util'
import globalStyles from '../../../../../globalset/css/globalClassName.less'
import { connect } from 'dva'
const TextArea = Input.TextArea

@connect(mapStateToProps)
export default class DCAddChirdrenTaskItem extends React.Component {

  state = {
    isCheck: false,
    local_card_name: '',
    isInEditTaskName: false,
    local_due_time: '',
    local_executor: {
      user_id: '',
      user_name: '',
      avatar: '',
      name: ''
    }
  }

  componentWillMount() {
    //设置默认项目名称
    this.initSet(this.props)
  }
  // componentWillReceiveProps (nextProps) {
  //   this.initSet(nextProps)
  // }
  //初始化根据props设置state
  initSet(props) {
    const { chirldTaskItemValue } = this.props
    const { due_time, executors = [], card_name } = chirldTaskItemValue
    let local_executor = {//任务执行人信息
      user_id: '',
      user_name: '',
      avatar: '',
    }
    if (executors.length) {
      local_executor = executors[0]
      local_executor.user_name = executors[0]['name']
    }

    this.setState({
      local_due_time: due_time,
      local_card_name: card_name,
      local_executor
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
      local_card_name: e.target.value
    })
  }
  editTaskNameComplete(e) {
    this.setIsInEditTaskName()
    const { chirldTaskItemValue, dispatch } = this.props
    const { local_card_name } = this.state
    if (chirldTaskItemValue['card_name'] == local_card_name) {
      return false
    }
    if (!local_card_name) {
      this.setState({
        local_card_name: chirldTaskItemValue['card_name']
      })
      return false
    }
    chirldTaskItemValue['card_name'] = local_card_name

    const { card_id } = chirldTaskItemValue
    const updateObj = {
      card_id,
      name: local_card_name
    }
    dispatch({
      type: 'projectDetailTask/updateTask',
      payload: {
        updateObj
      }
    })
  }

  setChirldTaskIndrawContent = ({ name, value }) => {
    const { chirldDataIndex } = this.props
    const { drawContent = {}, dispatch } = this.props
    drawContent['child_data'][chirldDataIndex][name] = value

    dispatch({
      type: 'projectDetailTask/updateDatas',
      payload: {
        drawContent
      }
    })
  }

  itemOneClick() {
    const { chirldTaskItemValue, chirldDataIndex } = this.props
    const { drawContent = {}, dispatch } = this.props
    const { card_id, is_realize = '0' } = chirldTaskItemValue
    const obj = {
      card_id,
      is_realize: is_realize === '1' ? '0' : '1'
    }
    drawContent['child_data'][chirldDataIndex]['is_realize'] = is_realize === '1' ? '0' : '1'

    dispatch({
      type: 'projectDetailTask/updateDatas',
      payload: {
        drawContent
      }
    })
    dispatch({
      type: 'projectDetailTask/completeTask',
      payload: {
        ...obj
      }
    })
  }
  //设置子任务负责人组件---------------start
  setList(id) {
    const { projectDetailInfoData = {}, dispatch } = this.props
    const { board_id } = projectDetailInfoData
    dispatch({
      type: 'projectDetailTask/removeProjectMenbers',
      payload: {
        board_id, user_id: id
      }
    })
  }
  chirldrenTaskChargeChange({ user_id, full_name, avatar }) {
    const { chirldTaskItemValue, dispatch } = this.props
    const { card_id } = chirldTaskItemValue

    this.setState({
      local_executor: {
        user_id,
        user_name: full_name,
        avatar: avatar,
        name: full_name
      }
    })

    dispatch({
      type: 'projectDetailTask/addTaskExecutor',
      payload: {
        card_id,
        users: user_id,
      }
    })
  }

  deleteExcutor({ user_id, full_name, avatar }) {
    const { chirldTaskItemValue, dispatch } = this.props
    const { card_id } = chirldTaskItemValue

    this.setState({
      local_executor: {
        user_id: '',
        user_name: '',
        avatar: ''
      }
    })
    dispatch({
      type: 'projectDetailTask/removeTaskExecutor',
      payload: {
        card_id,
        user_id: user_id,
      }
    })

  }

  datePickerChange(date, dateString) {
    if (!dateString) {
      return false
    }
    const { chirldTaskItemValue, dispatch } = this.props
    const { card_id } = chirldTaskItemValue
    const time = timeToTimestamp(dateString).toString()

    this.setState({
      local_due_time: time
    })
    const updateObj = {
      card_id,
      due_time: time
    }
    dispatch({
      type: 'projectDetailTask/updateTask',
      payload: {
        updateObj
      }
    })
  }
  deleteConfirm({ card_id, chirldDataIndex }) {
    const { dispatch } = this.props
    dispatch({
      type: 'projectDetailTask/deleteChirldTask',
      payload: {
        card_id, chirldDataIndex
      }
    })
  }

  render() {
    const { chirldTaskItemValue, chirldDataIndex } = this.props
    const { card_id, is_realize = '0' } = chirldTaskItemValue
    const { projectDetailInfoData = {}, drawContent = {}, } = this.props
    const { data = [] } = projectDetailInfoData //任务执行人列表
    const { local_card_name, isInEditTaskName, local_executor = {}, local_due_time } = this.state

    return (
      <div className={DrawerContentStyles.taskItem}>
        <div key={'1'} className={DrawerContentStyles.item_1} >
          {/*完成*/}
          <div className={is_realize === '1' ? DrawerContentStyles.nomalCheckBoxActive : DrawerContentStyles.nomalCheckBox} onClick={this.itemOneClick.bind(this)}>
            <Icon type="check" style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }} />
          </div>
          {/*名称和日期*/}
          <div>
            {!isInEditTaskName ? (
              <div style={{ wordWrap: 'break-word', width: 250, paddingTop: 2 }} onClick={this.setIsInEditTaskName.bind(this)}>
                {`${local_card_name}`}
              </div>
            ) : (
                <TextArea value={local_card_name}
                  autoFocus
                  autosize={{ minRows: 1 }}
                  size={'small'}
                  onChange={this.localChildTaskNameChange.bind(this)}
                  onPressEnter={this.editTaskNameComplete.bind(this)}
                  onBlur={this.editTaskNameComplete.bind(this)} />
              )}
            <div style={{ color: '#d5d5d5' }}>{local_due_time ? (local_due_time.indexOf('-') !== -1 ? local_due_time : timestampToTimeNormal(local_due_time, '', true)) + '截止' : ''}</div>
          </div>
          {/*cuozuo*/}
          <div style={{ position: 'relative', height: 22, display: 'flex', justifyContent: 'align-items' }}>
            <Popconfirm onConfirm={this.deleteConfirm.bind(this, { card_id, chirldDataIndex })} title={'删除该子任务？'}>
              <div className={`${globalStyles.authTheme} ${DrawerContentStyles.userIconNormal}`} style={{ fontSize: 16 }}>&#xe70f;</div>
            </Popconfirm>
            <Dropdown overlay={
              <DCMenuItemOne
                deleteExcutor={this.deleteExcutor.bind(this)} currentExecutor={local_executor}
                execusorList={data}
                setList={this.setList.bind(this)}
                chirldrenTaskChargeChange={this.chirldrenTaskChargeChange.bind(this)} isInvitation={true}
                invitationType='4'
                invitationId={drawContent.list_id} />
            }>
              {local_executor.user_id ? (
                <Tooltip title={local_executor.user_name || local_executor.full_name || '佚名'}>
                  {/*{imgOrAvatar(local_executor.avatar)}*/}
                  <Avatar size={16} src={local_executor.avatar} style={{ fontSize: 14, margin: '4px 12px 0 12px' }}>
                    {(local_executor.user_name || local_executor.full_name) ? (local_executor.user_name || local_executor.full_name).substring(0, 1) : '佚'}
                  </Avatar>
                </Tooltip>
              ) : (
                  <div>
                    {/*<Icon type="user" style={{fontSize: 16,margin:'0 12px',marginTop: 2,cursor: 'pointer'}} className={DrawerContentStyles.userIconNormal}/>*/}
                    <div className={`${globalStyles.authTheme} ${DrawerContentStyles.userIconNormal}`} style={{ fontSize: 16, margin: '0 12px', cursor: 'pointer' }}>&#xe70c;</div>
                  </div>
                )}

            </Dropdown>
            <div>
              {!local_due_time ? (
                <div className={`${globalStyles.authTheme} ${DrawerContentStyles.userIconNormal}`} style={{ fontSize: 16, marginRight: '12px', cursor: 'pointer' }}>&#xe709;</div>
              ) : (
                  <div className={`${globalStyles.authTheme} ${DrawerContentStyles.userIconNormal}`} style={{ fontSize: 16, marginRight: '12px', cursor: 'pointer' }}>&#xe8e0;</div>
                )}
            </div>
            <DatePicker
              onChange={this.datePickerChange.bind(this)}
              placeholder={'选择截止日期'}
              format="YYYY/MM/DD HH:mm"
              showTime={{ format: 'HH:mm' }}
              style={{ opacity: 0, height: 16, width: 16, background: '#000000', position: 'absolute', right: 0, zIndex: 2 }} />
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps({
  projectDetailTask: {
    datas: {
      drawContent = {},
    }
  },
  projectDetail: {
    datas: {
      projectDetailInfoData = {},
    }
  },
}) {
  return {
    drawContent,
    projectDetailInfoData
  }
}