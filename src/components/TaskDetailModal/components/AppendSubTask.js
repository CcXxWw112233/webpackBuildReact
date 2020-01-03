import React, { Component } from 'react'
import { Tooltip, Button, Dropdown, DatePicker, message } from 'antd'
// import NameChangeInput from '@/components/NameChangeInput'
import MenuSearchPartner from '@/components/MenuSearchMultiple/MenuSearchPartner.js'
import globalStyles from '@/globalset/css/globalClassName.less'
import appendSubTaskStyles from './appendSubTask.less'
import AvatarList from '../AvatarList'
import defaultUserAvatar from '@/assets/invite/user_default_avatar@2x.png';
import AppendSubTaskItem from './AppendSubTaskItem'
import { isApiResponseOk } from '../../../utils/handleResponseData'
import { timestampToTimeNormal3, compareTwoTimestamp, timeToTimestamp, timestampToTimeNormal, timestampToTime } from '@/utils/util'
import { MESSAGE_DURATION_TIME } from '@/globalset/js/constant'
import { connect } from 'dva'

@connect(({ publicTaskDetailModal: { drawContent = {} } }) => ({
  drawContent
}))
export default class AppendSubTask extends Component {

  state = {
    is_add_sub_task: false, // 是否添加子任务, 默认为 false
    sub_executors: [], // 子任务的执行人
    saveDisabled: true, // 是否可以点击确定按钮
    inputValue: '', // 用来保存子任务的名称
    due_time: '', // 时间选择
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

  // 添加子任务
  addSubTask(e) {
    e && e.stopPropagation();
    this.setState({
      is_add_sub_task: true
    })
  }

  // 点击取消
  handleCancel(e) {
    e && e.stopPropagation();
    this.setState({
      is_add_sub_task: false,
      sub_executors: []
    })
  }

  // 点击确定
  handleSave(e) {
    e && e.stopPropagation();
    const { drawContent, dispatch } = this.props
    const { board_id, card_id, list_id } = drawContent
    const { inputValue, sub_executors, due_time } = this.state
    const { data = [] } = drawContent['properties'].filter(item => item.code == 'SUBTASK')[0]
    let temp_subExecutors = [...sub_executors]
    let user_ids = []
    let tempData = [...data]
    temp_subExecutors.map(item => {
      user_ids.push(item.user_id)
    })
    const obj = {
      card_id,
      board_id,
      list_id,
      name: inputValue,
      executors: sub_executors,
      users: sub_executors.length ? user_ids.join(',') : '',
      due_time: due_time,
      card_name: inputValue,
    }
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/addChirldTask',
        payload: {
          ...obj
        }
      })
    ).then(res => {
      if (!isApiResponseOk(res)) {
        message.warn(res.message, MESSAGE_DURATION_TIME)
        return
      }
      // drawContent['child_data'] && drawContent['child_data'].unshift({...obj, card_id: res.data.card_id})
      tempData.unshift({...obj, card_id: res.data.card_id})
      drawContent['properties'] = this.filterCurrentUpdateDatasField('SUBTASK', tempData)
      this.props.handleTaskDetailChange && this.props.handleTaskDetailChange({drawContent, card_id})
      this.setState({
        is_add_sub_task: false,
        sub_executors: [],
        due_time: null
      })
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

  // 子 执行人的下拉回调
  chirldrenTaskChargeChange = (dataInfo) => {
    let sub_executors = []
    const { data, drawContent = {}, dispatch } = this.props
    const { card_id } = drawContent
    const { data: executors = [] } = this.getCurrentDrawerContentPropsModelDatasExecutors()
    const { selectedKeys = [] } = dataInfo
    let new_data = [...data]
    let new_executors = [...executors]
    new_data.map(item => {
      if (selectedKeys.indexOf(item.user_id) != -1) {
        sub_executors.push(item)
        new_executors.push(item)
      }
    })
    let new_drawContent = {...drawContent}
    // new_drawContent['executors'] = this.arrayNonRepeatfy(new_executors)
    new_drawContent['properties'] = this.filterCurrentUpdateDatasField('EXECUTOR', this.arrayNonRepeatfy(new_executors))
    dispatch({
      type: 'publicTaskDetailModal/updateDatas',
      payload: {
        drawContent: new_drawContent
      }
    })
    this.props.handleTaskDetailChange && this.props.handleTaskDetailChange({drawContent: drawContent, card_id, name: 'executors', value: new_executors, overlay_sub_pricipal: 'EXECUTOR'})
    this.setState({
      sub_executors
    })
  }

  //子任务名称设置
  setchildTaskNameChange = (e) => {
    this.setState({
      inputValue: e.target.value,
      saveDisabled: e.target.value ? false : true
    })
  }

  //截止时间
  endDatePickerChange(timeString) {
    const { drawContent = {}, } = this.props
    const { data = [] } = drawContent['properties'] && drawContent['properties'].filter(item => item.code == 'MILESTONE').length && drawContent['properties'].filter(item => item.code == 'MILESTONE')[0]
    const nowTime = timeToTimestamp(new Date())
    const due_timeStamp = timeToTimestamp(timeString)
    if (!compareTwoTimestamp(data.deadline, due_timeStamp)) {
      message.warn('任务的截止日期不能大于关联里程碑的截止日期')
      return false
    }
    if (!compareTwoTimestamp(due_timeStamp, nowTime)) {
      setTimeout(() => {
        message.warn(`您设置了一个今天之前的日期: ${timestampToTime(timeString, true)}`)
      }, 500)
    }
    setTimeout(() => {
      this.setState({
        due_time: due_timeStamp
      })
    }, 500)
  }

  // 删除结束时间
  handleDelDueTime = (e) => {
    e && e.stopPropagation()
    setTimeout(() => {
      this.setState({
        due_time: null
      })
    }, 500)
  }


  render() {
    const { children, drawContent = {}, data: dataInfo, dispatch, handleTaskDetailChange } = this.props
    const { card_id, board_id } = drawContent
    const { data: child_data = [] } = drawContent['properties'].filter(item => item.code == 'SUBTASK')[0]
    const { is_add_sub_task, sub_executors = [], saveDisabled, due_time } = this.state
    let executor = [{//任务执行人信息
      user_id: '',
      full_name: '',
      avatar: '',
    }]

    return (
      <div>
        <div style={{marginBottom: '12px'}}>
          {
            !is_add_sub_task ? (
              <span onClick={ (e) => { this.addSubTask(e) } }>
                {children}
              </span>
            ) : (
              <>
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '12px'}}>
                  {/* 文本框部分 */}
                  <span style={{flex: '1', marginRight: '16px'}}>
                    <input 
                    autosize={true}
                    onBlur={this.setchildTaskNameBlur}
                    onChange={this.setchildTaskNameChange}
                    autoFocus={true}
                    // goldName={card_name}
                    maxLength={100}
                    nodeName={'input'}
                    style={{ width: '100%', display: 'block', fontSize: 14, color: '#262626', resize: 'none', height: '38px', background: 'rgba(255,255,255,1)', boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.15)', borderRadius: '4px', border: 'none', outline: 'none', paddingLeft: '12px' }}
                    />
                  </span>
                  <span>
                    {
                      due_time ? (
                        <div className={appendSubTaskStyles.due_time}>
                          <div>
                            <span>{timestampToTimeNormal3(due_time, true)}</span>
                            <span onClick={this.handleDelDueTime} className={`${ due_time && appendSubTaskStyles.timeDeleBtn}`}></span>
                          </div>
                          <DatePicker
                            onChange={this.endDatePickerChange.bind(this)}
                            placeholder={due_time ? timestampToTimeNormal(due_time, '/', true) : '截止时间'}
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
                              placeholder={due_time ? timestampToTimeNormal(due_time, '/', true) : '截止时间'}
                              format="YYYY/MM/DD HH:mm"
                              showTime={{ format: 'HH:mm' }}
                              style={{ opacity: 0, width: 'auto', background: '#000000', position: 'absolute', right: 0, top: '12px', zIndex: 2 }} />
                          </div>
                        </Tooltip>
                      )
                    }
                  </span>
                  {/* 执行人部分 */}
                  <span style={{position: 'relative'}} className={appendSubTaskStyles.user_pr}>
                    <Dropdown overlayClassName={appendSubTaskStyles.overlay_sub_pricipal} getPopupContainer={triggerNode => triggerNode.parentNode}
                      overlay={
                        <MenuSearchPartner
                          handleSelectedAllBtn={this.handleSelectedAllBtn}
                          isInvitation={true}
                          listData={dataInfo} keyCode={'user_id'} searchName={'name'} currentSelect={ sub_executors.length ? sub_executors : executor} chirldrenTaskChargeChange={this.chirldrenTaskChargeChange}
                          board_id={board_id} />
                      }>
                      {
                        sub_executors && sub_executors.length ? (
                          <div>
                            <AvatarList
                              size="mini"
                              maxLength={3}
                              excessItemsStyle={{
                                color: '#f56a00',
                                backgroundColor: '#fde3cf'
                              }}
                            >
                              {sub_executors && sub_executors.length ? sub_executors.map(({ name, avatar }, index) => (
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
                <div style={{textAlign: 'right'}}>
                  <span onClick={ (e) => { this.handleCancel(e) } } className={appendSubTaskStyles.cancel}>取消</span>
                  <Button onClick={ (e) => { this.handleSave(e) } } disabled={saveDisabled} type="primary" style={{ marginLeft: '16px', width: '60px', height: '34px' }}>确定</Button>
                </div>
              </>
            )
          }
        </div>

        {/* 显示子任务列表 */}
        <div>
          {child_data.map((value, key) => {
            const { card_id, card_name, due_time, executors = [] } = value
            const { user_id } = executors[0] || {}
            return (
              <AppendSubTaskItem handleTaskDetailChange={handleTaskDetailChange} board_id={board_id} data={dataInfo} childTaskItemValue={value} key={`${card_id}-${card_name}-${user_id}-${due_time}`} childDataIndex={key} />
            )
          })}
        </div>
      </div>
    )
  }
}
