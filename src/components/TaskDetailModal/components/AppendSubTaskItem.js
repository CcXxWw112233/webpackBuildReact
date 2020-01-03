import React, { Component } from 'react'
import { Icon, Dropdown, Tooltip, Popconfirm, DatePicker, message } from 'antd'
import appendSubTaskStyles from './appendSubTask.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import MenuSearchPartner from '@/components/MenuSearchMultiple/MenuSearchPartner.js'
import AvatarList from '../AvatarList'
import defaultUserAvatar from '@/assets/invite/user_default_avatar@2x.png';
import { timestampToTimeNormal3, compareTwoTimestamp, timeToTimestamp, timestampToTimeNormal, timestampToTime } from '@/utils/util'
import { isApiResponseOk } from '@/utils/handleResponseData'
import {
  MESSAGE_DURATION_TIME
} from "@/globalset/js/constant";
import { connect } from 'dva'

@connect(({ publicTaskDetailModal: { drawContent = {} } }) => ({
  drawContent
}))
export default class AppendSubTaskItem extends Component {

  state = {
    is_edit_sub_name: false, // 是否修改子任务名称, 默认为 false
  }

  componentWillMount() {
    //设置默认项目名称
    this.initSet(this.props)
  }

  // 过滤那些需要更新的字段
  filterCurrentUpdateDatasField = (code, value) => {
    const { drawContent: { properties = [] } } = this.props
    let new_properties = [...properties]
    new_properties = new_properties.map(item => {
      if (item.code == code) {
        let new_item = item
        new_item = { ...item, data: value }
        return new_item
      } else {
        let new_item = item
        return new_item
      }
    })
    return new_properties
  }

  // 是否是有效的头像
  isValidAvatar = (avatarUrl = '') =>
    avatarUrl.includes('http://') || avatarUrl.includes('https://');

  //初始化根据props设置state
  initSet(props) {
    const { childTaskItemValue } = props
    const { due_time, executors = [], card_name } = childTaskItemValue
    // let local_executor = [{//任务执行人信息
    //   user_id: '',
    //   user_name: '',
    //   avatar: '',
    // }]
    let local_executor
    if (executors.length) {
      local_executor = executors
    }

    this.setState({
      local_due_time: due_time,
      local_card_name: card_name,
      local_executor
    })
  }

  // 执行人列表去重
  arrayNonRepeatfy = arr => {
    let temp_arr = []
    let temp_id = []
    for (let i = 0; i < arr.length; i++) {
      if (!temp_id.includes(arr[i]['user_id'])) {//includes 检测数组是否有某个值
        temp_arr.push(arr[i]);
        temp_id.push(arr[i]['user_id'])
      }
    }
    return temp_arr
  }

   // 获取 currentDrawerContent 数据
   getCurrentDrawerContentPropsModelDatasExecutors = () => {
    const { drawContent: { properties = [] } } = this.props
    const pricipleInfo = properties.filter(item => item.code == 'EXECUTOR')[0]
    return pricipleInfo || {}
  }

  // 执行人下拉回调
  chirldrenTaskChargeChange = (dataInfo) => {
    let sub_executors = []
    const { data = [], drawContent = {}, dispatch, childTaskItemValue } = this.props
    // const { executors = [] } = drawContent
    const { data: executors = [] } = this.getCurrentDrawerContentPropsModelDatasExecutors()
    const { card_id } = childTaskItemValue
    const { selectedKeys = [], type, key } = dataInfo
    let new_data = [...data]
    let new_executors = [...executors]
    // 这里是将选中的人添加进子任务执行人以及更新父级任务执行人
    new_data.map(item => {
      if (selectedKeys.indexOf(item.user_id) != -1) {
        sub_executors.push(item)
        new_executors.push(item)
      }
    })
    let new_drawContent = {...drawContent}
    
    if (type == 'add') {
      Promise.resolve(
        dispatch({
          type: 'publicTaskDetailModal/addTaskExecutor',
          payload: {
            card_id,
            executor: key
          }
        })
      ).then(res => {
        if (isApiResponseOk(res)) {
          new_drawContent['properties'] = this.filterCurrentUpdateDatasField('EXECUTOR', this.arrayNonRepeatfy(new_executors))
          this.setChildTaskIndrawContent({ name: 'executors', value: sub_executors }, card_id)// 先弹窗中子任务执行人中的数据
          dispatch({
            type: 'publicTaskDetailModal/updateDatas',
            payload: {
              drawContent: new_drawContent
            }
          })
          this.props.handleTaskDetailChange && this.props.handleTaskDetailChange({drawContent: drawContent, card_id, name: 'executors', value: new_executors, overlay_sub_pricipal: 'EXECUTOR'})
        }
      })
    } else if (type == 'remove') {
      dispatch({
        type: 'publicTaskDetailModal/removeTaskExecutor',
        payload: {
          card_id,
          executor: key
        }
      })
      this.props.handleTaskDetailChange && this.props.handleTaskDetailChange({drawContent: drawContent, card_id, name: 'executors', value: new_executors, overlay_sub_pricipal: 'EXECUTOR'})
    }
    this.setState({
      local_executor: sub_executors
    })
  }

  // 子任务点击完成回调
  itemOneClick = () => {
    const { childTaskItemValue, dispatch, board_id } = this.props
    const { card_id, is_realize = '0' } = childTaskItemValue
    const obj = {
      card_id,
      is_realize: is_realize === '1' ? '0' : '1',
      board_id
    }

    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/completeTask',
        payload: {
          ...obj
        }
      })
    ).then(res => {
      if (!isApiResponseOk(res)) {
        message.warn(res.message, MESSAGE_DURATION_TIME)
        return
      }
      this.setChildTaskIndrawContent({ name: 'is_realize', value: is_realize === '1' ? '0' : '1' }, card_id)
    })
    
  }

  // 修改子任务名称
  handleSubTaskName = () => {
    this.setState({
      is_edit_sub_name: true
    })
  }

  // 失去焦点事件
  setchildTaskNameBlur = () => {
    const { dispatch, childTaskItemValue } = this.props
    const { card_id } = childTaskItemValue
    const { local_card_name } = this.state
    if (childTaskItemValue['card_name'] == local_card_name) { // 表示名称没有变化
      this.setState({
        is_edit_sub_name: false
      })
      return false
    }
    // if (!local_card_name) {
    //   this.setState({
    //     local_card_name: childTaskItemValue['card_name']
    //   })
    //   return false
    // }
    if (local_card_name && local_card_name != '') {
      childTaskItemValue['card_name'] = local_card_name
      const updateObj = {
        card_id,
        name: local_card_name
      }
      dispatch({
        type: 'publicTaskDetailModal/updateTask',
        payload: {
          updateObj
        }
      })
      this.setChildTaskIndrawContent({ name: 'card_name', value: local_card_name }, card_id)
    } else {
      this.setState({
        local_card_name: childTaskItemValue['card_name']
      })
    }
    this.setState({
      is_edit_sub_name: false
    })
  }

  // 文本框onChange事件
  setchildTaskNameChange = (e) => {
    this.setState({
      local_card_name: e.target.value
    })
  }

  // 子任务更新弹窗数据
  setChildTaskIndrawContent = ({ name, value }, card_id) => {
    const { childDataIndex } = this.props
    const { drawContent = {}, dispatch } = this.props
    let new_drawContent = {...drawContent}
    const { data = [] } = drawContent['properties'].filter(item => item.code == 'SUBTASK')[0]
    let new_data = [...data]
    // new_drawContent['child_data'][childDataIndex][name] = value
    new_data[childDataIndex][name] = value
    new_drawContent['properties'] = this.filterCurrentUpdateDatasField('SUBTASK', new_data)
    dispatch({
      type: 'projectDetailTask/updateDatas',
      payload: {
        drawContent: new_drawContent
      }
    })
    if (name && value) {
      this.props.handleTaskDetailChange && this.props.handleTaskDetailChange({ drawContent: new_drawContent, card_id: drawContent.card_id, name: 'card_data', value: new_data })
    }
  }

  // 按下回车事件
  handlePressEnter = (e) => {
    if (e.keyCode == 13) {
      this.setchildTaskNameBlur()
    }
  }

  // 删除子任务回调
  deleteConfirm({ card_id, childDataIndex }) {
    const { drawContent = {}, dispatch } = this.props
    // const { child_data = [] } = drawContent
    const { data: child_data = [] } = drawContent['properties'].filter(item => item.code == 'SUBTASK')[0]
    let newChildData = [...child_data]
    let new_drawContent = {...drawContent}
    newChildData.map((item, index) => {
      if (item.card_id == card_id) {
        newChildData.splice(index, 1)
      }
    })
    // new_drawContent['child_data'] = newChildData
    new_drawContent['properties'] = this.filterCurrentUpdateDatasField('SUBTASK', newChildData)
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/deleteChirldTask',
        payload: {
          card_id
        }
      })
    ).then(res => {
      if (!isApiResponseOk(res)) {
        message.warn(res.message, MESSAGE_DURATION_TIME)
        return
      }
      dispatch({
        type: 'publicTaskDetailModal/updateDatas',
        payload: {
          drawContent: new_drawContent
        }
      })
      this.props.handleTaskDetailChange && this.props.handleTaskDetailChange({drawContent: new_drawContent, card_id: drawContent.card_id, name: 'card_data', value: newChildData})
    })
  }

  //截止时间
  endDatePickerChange(timeString) {
    const { drawContent = {}, childTaskItemValue, dispatch } = this.props
    const { milestone_data = {} } = drawContent
    const { data = [] } = drawContent['properties'] && drawContent['properties'].filter(item => item.code == 'MILESTONE').length && drawContent['properties'].filter(item => item.code == 'MILESTONE')[0]
    const { card_id } = childTaskItemValue
    const nowTime = timeToTimestamp(new Date())
    const due_timeStamp = timeToTimestamp(timeString)
    const updateObj = {
      card_id, due_time: due_timeStamp
    }
    if (!compareTwoTimestamp(data.deadline, due_timeStamp)) {
      message.warn('任务的截止日期不能大于关联里程碑的截止日期')
      return false
    }
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/updateTask',
        payload: {
          updateObj
        }
      })
    ).then(res => {
      if (!isApiResponseOk(res)) {
        message.warn(res.message, MESSAGE_DURATION_TIME)
        return
      }
      if (!compareTwoTimestamp(due_timeStamp, nowTime)) {
        setTimeout(() => {
          message.warn(`您设置了一个今天之前的日期: ${timestampToTime(timeString, true)}`)
        }, 500)
      }
      this.setState({
        local_due_time: due_timeStamp
      })
      this.setChildTaskIndrawContent({ name: 'due_time', value: due_timeStamp }, card_id)
    })
  }

  // 删除结束时间
  handleDelDueTime = (e) => {
    e && e.stopPropagation()
    const { dispatch, childTaskItemValue } = this.props
    const { card_id, due_time } = childTaskItemValue
    const updateObj = {
      card_id, due_time: '0'
    }
    if (!card_id) return false
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/updateTask',
        payload: {
          updateObj
        }
      })
    ).then(res => {
      if (!isApiResponseOk(res)) {
        message.warn(res.message, MESSAGE_DURATION_TIME)
        return
      }
      this.setState({
        local_due_time: null
      })
      this.setChildTaskIndrawContent({ name: due_time, value: '0' }, card_id)
    })

  }

  render() {
    const { childTaskItemValue, childDataIndex, dispatch, data = {}, drawContent = {}, board_id } = this.props
    const { card_id, is_realize = '0' } = childTaskItemValue
    const { local_card_name, local_executor = [], local_due_time, is_edit_sub_name } = this.state


    return (
      <div style={{display: 'flex', position: 'relative'}} className={appendSubTaskStyles.active_icon}>
        {/* <Tooltip title="删除">
          <div className={`${appendSubTaskStyles.del_icon}`}>
            <span className={`${globalStyles.authTheme}`}>&#xe7c3;</span>
          </div>
        </Tooltip> */}
        <Popconfirm getPopupContainer={triggerNode => triggerNode.parentNode} onConfirm={() => { this.deleteConfirm({card_id, childDataIndex}) }} title={'删除该子任务？'}>
          <div className={`${appendSubTaskStyles.del_icon}`}>
            <span className={`${globalStyles.authTheme}`}>&#xe7c3;</span>
          </div>
        </Popconfirm>
        <div className={`${appendSubTaskStyles.subTaskItemWrapper} ${appendSubTaskStyles.subTaskItemWrapper_active}`} key={childDataIndex}>
          {/*完成*/}
          <div className={is_realize === '1' ? appendSubTaskStyles.nomalCheckBoxActive : appendSubTaskStyles.nomalCheckBox} onClick={this.itemOneClick}>
            <Icon type="check" style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold', position: 'absolute', top: '0', right: '0', left: '0', bottom: '0', margin: '1px auto' }} />
          </div>
          {/* 名字 */}
          <div style={{flex: '1', cursor: 'pointer'}}>
            {
              !is_edit_sub_name ? (
                <div onClick={this.handleSubTaskName} className={appendSubTaskStyles.card_name}>
                  <span>{local_card_name}</span>
                </div>
              ) : (
                <div>
                  <input
                    autosize={true}
                    onBlur={this.setchildTaskNameBlur}
                    onChange={this.setchildTaskNameChange}
                    onKeyDown={this.handlePressEnter}
                    autoFocus={true}
                    // goldName={card_name}
                    maxLength={100}
                    nodeName={'input'}
                    style={{ width: '100%', display: 'block', fontSize: 14, color: '#262626', resize: 'none', height: '38px', background: 'rgba(255,255,255,1)', boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.15)', borderRadius: '4px', border: 'none', outline: 'none', paddingLeft: '12px' }}
                  />
                </div>
              )
            }
          </div>
          {/* 时间 */}
          <div>
            {
              local_due_time ? (
                <div className={appendSubTaskStyles.due_time}>
                  <div>
                    <span>{timestampToTimeNormal3(local_due_time, true)}</span>
                    <span onClick={this.handleDelDueTime} className={`${ local_due_time && appendSubTaskStyles.timeDeleBtn}`}></span>
                  </div>
                  <DatePicker
                    onChange={this.endDatePickerChange.bind(this)}
                    placeholder={local_due_time ? timestampToTimeNormal(local_due_time, '/', true) : '截止时间'}
                    format="YYYY/MM/DD HH:mm"
                    showTime={{ format: 'HH:mm' }}
                    style={{ opacity: 0, width: 'auto', background: '#000000', position: 'absolute', right: 0, top: '12px', zIndex: 2 }} />
                </div>
              ) : (
                <Tooltip title="截止时间" getPopupContainer={triggerNode => triggerNode.parentNode}>
                  <div className={`${appendSubTaskStyles.add_due_time}`}>
                    <div>
                      <span className={`${globalStyles.authTheme} ${appendSubTaskStyles.sub_icon}`}>&#xe686;</span>
                    </div>
                    <DatePicker
                      onChange={this.endDatePickerChange.bind(this)}
                      placeholder={local_due_time ? timestampToTimeNormal(local_due_time, '/', true) : '截止时间'}
                      format="YYYY/MM/DD HH:mm"
                      showTime={{ format: 'HH:mm' }}
                      style={{ opacity: 0, width: 'auto', background: '#000000', position: 'absolute', right: 0, top: '12px', zIndex: 2 }} />
                  </div>
                </Tooltip>
              )
            }
          </div>
          
          {/* 执行人 */}
          <div>
            <span style={{ position: 'relative', cursor: 'pointer' }} className={appendSubTaskStyles.user_pr}>
              <Dropdown overlayClassName={appendSubTaskStyles.overlay_sub_pricipal} getPopupContainer={triggerNode => triggerNode.parentNode}
                overlay={
                  <MenuSearchPartner
                    handleSelectedAllBtn={this.handleSelectedAllBtn}
                    isInvitation={true}
                    listData={data} keyCode={'user_id'} searchName={'name'} currentSelect={local_executor} chirldrenTaskChargeChange={this.chirldrenTaskChargeChange}
                    board_id={board_id} />
                }>
                {
                  local_executor.length ? (
                    <div>
                      <AvatarList
                        size="mini"
                        maxLength={3}
                        excessItemsStyle={{
                          color: '#f56a00',
                          backgroundColor: '#fde3cf'
                        }}
                      >
                        {local_executor && local_executor.length ? local_executor.map(({ name, avatar }, index) => (
                          <AvatarList.Item
                            key={index}
                            tips={name}
                            src={this.isValidAvatar(avatar) ? avatar : defaultUserAvatar}
                          />
                        )) :(
                          <Tooltip title="执行人">
                            <span className={`${globalStyles.authTheme} ${appendSubTaskStyles.sub_executor}`}>&#xe7b2;</span>
                          </Tooltip>
                        )}
                      </AvatarList>
                    </div>
                  ) : (
                      <Tooltip title="执行人">
                        <span className={`${globalStyles.authTheme} ${appendSubTaskStyles.sub_executor}`}>&#xe7b2;</span>
                      </Tooltip>
                    )
                }
              </Dropdown>
            </span>
          </div>
        </div>
      </div>
    )
  }
}
