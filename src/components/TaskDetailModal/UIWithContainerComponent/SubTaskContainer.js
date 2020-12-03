import React, { Component } from 'react'
import AppendSubTask from '../components/AppendSubTask'
import { message, Menu, Modal } from 'antd'
import {
  compareTwoTimestamp,
  timeToTimestamp,
  timestampToTime
} from '@/utils/util'
import {
  getCurrentDrawerContentPropsModelFieldData,
  filterCurrentUpdateDatasField,
  compareStartDueTime
} from '../handleOperateModal'
import { isApiResponseOk } from '@/utils/handleResponseData'
import { MESSAGE_DURATION_TIME } from '@/globalset/js/constant'
import { arrayNonRepeatfy, getRelativeTimeTamp } from '../../../utils/util'
import { deleteTaskFile } from '../../../services/technological/task'
import { getSubfixName } from '@/utils/businessFunction'
import { rebackCreateNotify } from '../../NotificationTodos'

const SubTaskLogic = {
  // 添加子任务
  addSubTask: function(e) {
    e && e.stopPropagation()
    const {
      drawContent: { deliverables = [] }
    } = this.props
    if (deliverables && deliverables.length) return
    this.setState({
      is_add_sub_task: true
    })
  },

  // 点击取消
  handleCancel: function(e) {
    e && e.stopPropagation()
    this.initState()
  },

  // 点击确定
  handleSave: function(e) {
    e && e.stopPropagation()
    const { drawContent, dispatch } = this.props
    const { board_id, card_id, list_id, properties = [] } = drawContent
    const { data: executors = [] } = getCurrentDrawerContentPropsModelFieldData(
      {
        properties,
        code: 'EXECUTOR'
      }
    )
    const { inputValue, sub_executors, due_time, start_time } = this.state
    if (!compareStartDueTime(start_time, due_time)) {
      message.warn('开始时间不能大于截止时间')
      return
    }
    const { data = [] } = drawContent['properties'].filter(
      item => item.code == 'SUBTASK'
    )[0]
    let temp_subExecutors = [...sub_executors]
    let user_ids = []
    let tempData = [...data]
    temp_subExecutors.map(item => {
      user_ids.push(item.user_id)
    })
    const obj = {
      parent_id: card_id,
      board_id,
      list_id,
      name: inputValue,
      executors: sub_executors,
      users: sub_executors.length ? user_ids.join(',') : '',
      start_time: start_time,
      due_time: due_time,
      card_name: inputValue
    }
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/addChirldTaskVTwo',
        payload: {
          ...obj
        }
      })
    ).then(res => {
      if (!isApiResponseOk(res)) {
        message.warn(res.message, MESSAGE_DURATION_TIME)
        this.initState()
        return
      }
      let { card_info = {}, dependencys = [] } = res.data
      let new_data = [...dependencys]
      new_data = new_data.filter(item => item.id == card_id) || []
      // drawContent['child_data'] && drawContent['child_data'].unshift({...obj, card_id: res.data.card_id})
      tempData.unshift({ ...obj, card_id: card_info.card_id })
      if (sub_executors && sub_executors.length) {
        executors.push(...sub_executors)
        drawContent['properties'] = filterCurrentUpdateDatasField({
          properties: drawContent['properties'],
          code: 'EXECUTOR',
          value: arrayNonRepeatfy(executors, 'user_id')
        })
        this.props.handleTaskDetailChange &&
          this.props.handleTaskDetailChange({
            drawContent,
            card_id,
            operate_properties_code: 'EXECUTOR'
          })
      }
      drawContent['properties'] = filterCurrentUpdateDatasField({
        properties: drawContent['properties'],
        code: 'SUBTASK',
        value: tempData
      })
      this.props.handleChildTaskChange &&
        this.props.handleChildTaskChange({
          parent_card_id: card_id,
          data: card_info,
          action: 'add',
          rely_card_datas: dependencys
        })
      this.props.whetherUpdateParentTaskTime &&
        this.props.whetherUpdateParentTaskTime(new_data)
      this.initState()
    })
  },

  // 子 执行人的下拉回调
  chirldrenTaskChargeChange: function(dataInfo) {
    let sub_executors = []
    const {
      projectDetailInfoData: { data = [] },
      drawContent = {},
      dispatch
    } = this.props
    const { card_id, properties = [] } = drawContent
    const { data: executors = [] } = getCurrentDrawerContentPropsModelFieldData(
      {
        properties,
        code: 'EXECUTOR'
      }
    )
    const { selectedKeys = [] } = dataInfo
    let new_data = [...data]
    let new_executors = [...executors]
    new_data.map(item => {
      if (selectedKeys.indexOf(item.user_id) != -1) {
        sub_executors.push(item)
      }
    })
    this.setState({
      sub_executors: arrayNonRepeatfy(sub_executors, 'user_id')
    })
  },

  // 禁用截止时间
  disabledDueTime: function(due_time) {
    const { start_time } = this.state
    if (!start_time || !due_time) {
      return false
    }
    const newStartTime =
      start_time.toString().length > 10
        ? Number(start_time).valueOf() / 1000
        : Number(start_time).valueOf()
    return Number(due_time.valueOf()) / 1000 < newStartTime
  },

  // 禁用开始时间
  disabledStartTime: function(start_time) {
    const { due_time } = this.state
    if (!start_time || !due_time) {
      return false
    }
    const newDueTime =
      due_time.toString().length > 10
        ? Number(due_time).valueOf() / 1000
        : Number(due_time).valueOf()
    return Number(start_time.valueOf()) / 1000 >= newDueTime //Number(due_time).valueOf();
  },

  //子任务名称设置
  setchildTaskNameChange: function(e) {
    if (e.target.value.trimLR() == '') {
      // message.warn('名称不能为空哦~', MESSAGE_DURATION_TIME)
      this.setState({
        inputValue: '',
        saveDisabled: true
      })
      return false
    }
    this.setState({
      inputValue: e.target.value,
      saveDisabled: e.target.value ? false : true
    })
  },

  //开始时间
  startDatePickerChange: function(timeString) {
    const { drawContent = {} } = this.props
    const { data = [] } =
      drawContent['properties'] &&
      drawContent['properties'].filter(item => item.code == 'MILESTONE')
        .length &&
      drawContent['properties'].filter(item => item.code == 'MILESTONE')[0]
    const nowTime = timeToTimestamp(new Date())
    const start_timeStamp = timeToTimestamp(timeString)
    if (!compareTwoTimestamp(data.deadline, start_timeStamp)) {
      message.warn('任务的截止日期不能大于关联里程碑的截止日期')
      return false
    }
    if (!compareTwoTimestamp(start_timeStamp, nowTime)) {
      setTimeout(() => {
        message.warn(
          `您设置了一个今天之前的日期: ${timestampToTime(timeString, true)}`
        )
      }, 500)
    }
    setTimeout(() => {
      this.setState({
        start_time: start_timeStamp
      })
    }, 500)
  },

  // 删除开始时间
  handleDelStartTime: function(e) {
    e && e.stopPropagation()
    setTimeout(() => {
      this.setState({
        start_time: null
      })
    }, 500)
  },

  //截止时间
  endDatePickerChange: function(timeString) {
    const { drawContent = {} } = this.props
    const { data = [] } =
      drawContent['properties'] &&
      drawContent['properties'].filter(item => item.code == 'MILESTONE')
        .length &&
      drawContent['properties'].filter(item => item.code == 'MILESTONE')[0]
    const nowTime = timeToTimestamp(new Date())
    const due_timeStamp = timeToTimestamp(timeString)
    if (!compareTwoTimestamp(data.deadline, due_timeStamp)) {
      message.warn('任务的截止日期不能大于关联里程碑的截止日期')
      return false
    }
    if (!compareTwoTimestamp(due_timeStamp, nowTime)) {
      setTimeout(() => {
        message.warn(
          `您设置了一个今天之前的日期: ${timestampToTime(timeString, true)}`
        )
      }, 500)
    }
    setTimeout(() => {
      this.setState({
        due_time: due_timeStamp
      })
    }, 500)
  },

  // 删除结束时间
  handleDelDueTime: function(e) {
    e && e.stopPropagation()
    setTimeout(() => {
      this.setState({
        due_time: null
      })
    }, 500)
  },
  showTimerRange: function() {
    const { projectDetailInfoData = {} } = this.props
    const { date_format } = projectDetailInfoData
    let flag = false
    flag = date_format == '1'
    return flag
  },
  // 判断时间模式 为1 表示相对时间
  showTimerMode: function() {
    const { projectDetailInfoData = {} } = this.props
    const { board_set = {} } = projectDetailInfoData
    const { date_mode } = board_set
    let flag = false
    flag = date_mode == '1'
    return flag
  },
  handleStartRelativeChange: function(value) {
    const { projectDetailInfoData = {} } = this.props
    const { board_set = {} } = projectDetailInfoData
    const { relative_time } = board_set
    let start_timeStamp =
      value == '' || String(value).trimLR() == ''
        ? '0'
        : getRelativeTimeTamp(value, relative_time)
    this.setState({
      start_time: start_timeStamp
    })
  },
  handleDueRelativeChange: function(value) {
    const { projectDetailInfoData = {} } = this.props
    const { board_set = {} } = projectDetailInfoData
    const { relative_time } = board_set
    let due_timeStamp =
      value == '' || String(value).trimLR() == ''
        ? '0'
        : getRelativeTimeTamp(value, relative_time)
    this.setState({
      due_time: due_timeStamp
    })
  }
}

const SubTaskItemLogic = {
  // 执行人下拉回调
  chirldrenTaskChargeChange: function(dataInfo) {
    // let sub_executors = []
    const {
      projectDetailInfoData: { data = [] },
      drawContent = {},
      dispatch,
      childTaskItemValue
    } = this.props
    const { properties = [] } = drawContent
    const { data: executors = [] } = getCurrentDrawerContentPropsModelFieldData(
      {
        properties,
        code: 'EXECUTOR'
      }
    )
    const { card_id, executors: sub_executors = [] } = childTaskItemValue
    const { selectedKeys = [], type, key } = dataInfo
    let new_data = [...data]
    let new_executors = [...executors]
    let new_drawContent = { ...drawContent }
    let new_sub_executors = [...sub_executors]
    if (type == 'add') {
      // 这里是将选中的人添加进子任务执行人以及更新父级任务执行人
      new_data.map(item => {
        if (selectedKeys.indexOf(item.user_id) != -1) {
          new_sub_executors.push(item)
          new_executors.push(item)
        }
      })
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
          new_drawContent['properties'] = filterCurrentUpdateDatasField({
            properties: new_drawContent['properties'],
            code: 'EXECUTOR',
            value: arrayNonRepeatfy(new_executors, 'user_id')
          })
          dispatch({
            type: 'publicTaskDetailModal/updateDatas',
            payload: {
              drawContent: new_drawContent
            }
          })
          this.setChildTaskIndrawContent(
            {
              name: 'executors',
              value: arrayNonRepeatfy(new_sub_executors, 'user_id'),
              operate_properties_code: 'EXECUTOR'
            },
            card_id
          )
          // this.props.handleTaskDetailChange && this.props.handleTaskDetailChange({ drawContent: drawContent, card_id, name: 'executors', value: arrayNonRepeatfy(new_executors, 'user_id'), overlay_sub_pricipal: 'EXECUTOR' })
        }
      })
    } else if (type == 'remove') {
      new_sub_executors = new_sub_executors.filter(i => i.user_id != key) || []
      dispatch({
        type: 'publicTaskDetailModal/removeTaskExecutor',
        payload: {
          card_id,
          executor: key
        }
      })
      this.setChildTaskIndrawContent(
        {
          name: 'executors',
          value: arrayNonRepeatfy(new_sub_executors, 'user_id'),
          operate_properties_code: 'EXECUTOR'
        },
        card_id
      )
      // this.props.handleTaskDetailChange && this.props.handleTaskDetailChange({ drawContent: drawContent, card_id, name: 'executors', value: new_executors, overlay_sub_pricipal: 'EXECUTOR' })
      // this.props.handleChildTaskChange && this.props.handleChildTaskChange({ parent_card_id: drawContent.card_id, data: { ...childTaskItemValue, executors: new_sub_executors }, card_id, action: 'update' })
    }
    this.setState({
      local_executor: arrayNonRepeatfy(new_sub_executors, 'user_id')
    })
  },

  // 子任务点击完成回调
  itemOneClick: function() {
    const {
      childTaskItemValue,
      dispatch,
      drawContent: { board_id }
    } = this.props
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
      this.setChildTaskIndrawContent(
        { name: 'is_realize', value: is_realize === '1' ? '0' : '1' },
        card_id
      )
    })
  },

  // 修改子任务名称
  handleSubTaskName: function() {
    this.setState({
      is_edit_sub_name: true
    })
  },

  // 失去焦点事件
  setchildTaskNameBlur: function() {
    const {
      dispatch,
      childTaskItemValue = {},
      drawContent: { board_id }
    } = this.props
    const { card_id } = childTaskItemValue
    const { local_card_name } = this.state
    if (childTaskItemValue['card_name'] == local_card_name) {
      // 表示名称没有变化
      this.setState({
        is_edit_sub_name: false
      })
      return false
    }
    if (local_card_name && local_card_name != '') {
      childTaskItemValue['card_name'] = local_card_name
      const updateObj = {
        card_id,
        name: local_card_name,
        board_id
      }
      dispatch({
        type: 'publicTaskDetailModal/updateTaskVTwo',
        payload: {
          updateObj
        }
      })
      this.setChildTaskIndrawContent(
        { name: 'card_name', value: local_card_name },
        card_id
      )
    } else {
      this.setState({
        local_card_name: childTaskItemValue['card_name']
      })
    }
    this.setState({
      is_edit_sub_name: false
    })
  },

  // 文本框onChange事件
  setchildTaskNameChange: function(e) {
    if (e.target.value.trimLR() == '') {
      this.setState({
        local_card_name: ''
      })
      return false
    }
    this.setState({
      local_card_name: e.target.value
    })
  },

  // 子任务更新弹窗数据 rely_card_datas,更新后返回的相关依赖的更新任务列表
  setChildTaskIndrawContent: function(
    { name, value, operate_properties_code },
    card_id,
    rely_card_datas,
    res
  ) {
    const { childDataIndex } = this.props
    const { drawContent = {}, dispatch, childTaskItemValue } = this.props
    let new_drawContent = { ...drawContent }
    const { data = [] } = drawContent['properties'].filter(
      item => item.code == 'SUBTASK'
    )[0]
    let new_data = [...data]
    new_data[childDataIndex][name] = value
    new_drawContent['properties'] = filterCurrentUpdateDatasField({
      properties: new_drawContent['properties'],
      code: 'SUBTASK',
      value: new_data
    })
    dispatch({
      type: 'projectDetailTask/updateDatas',
      payload: {
        drawContent: new_drawContent
      }
    })
    if ((name && value) || (name && value == null)) {
      this.props.handleTaskDetailChange &&
        this.props.handleTaskDetailChange({
          drawContent: new_drawContent,
          card_id: drawContent.card_id,
          name: 'card_data',
          value: new_data,
          operate_properties_code
        })
      this.props.handleChildTaskChange &&
        this.props.handleChildTaskChange({
          parent_card_id: drawContent.card_id,
          data: { ...childTaskItemValue, [name]: value },
          card_id,
          action: 'update',
          rely_card_datas
        })
      const {
        group_view_type,
        drawContent: { board_id }
      } = this.props
      typeof res == 'object' &&
        rebackCreateNotify.call(this, {
          res,
          id: card_id,
          board_id,
          group_view_type,
          dispatch,
          parent_card_id: drawContent.card_id,
          operate_in_card_detail_panel: true
        }) //创建撤回弹窗
    }
  },

  // 按下回车事件
  handlePressEnter: function(e) {
    if (e.keyCode == 13) {
      this.setchildTaskNameBlur()
    }
  },

  // 删除子任务回调
  deleteConfirm: function({ card_id, childDataIndex }) {
    const { drawContent = {}, dispatch } = this.props
    // const { child_data = [] } = drawContent
    const { data: child_data = [] } = drawContent['properties'].filter(
      item => item.code == 'SUBTASK'
    )[0]
    let newChildData = [...child_data]
    let new_drawContent = { ...drawContent }
    newChildData.map((item, index) => {
      if (item.card_id == card_id) {
        newChildData.splice(index, 1)
      }
    })
    new_drawContent['properties'] = filterCurrentUpdateDatasField({
      properties: new_drawContent['properties'],
      code: 'SUBTASK',
      value: newChildData
    })
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/deleteTaskVTwo',
        payload: {
          id: card_id
        }
      })
    ).then(res => {
      if (!isApiResponseOk(res)) {
        message.warn(res.message, MESSAGE_DURATION_TIME)
        return
      }
      let new_data = []
      if (!(res.data.scope_content instanceof Array)) {
        new_data = []
      } else {
        new_data = [...res.data.scope_content]
      }
      this.props.handleChildTaskChange &&
        this.props.handleChildTaskChange({
          parent_card_id: drawContent.card_id,
          card_id,
          action: 'delete',
          rely_card_datas: res.data.scope_content
        })
      dispatch({
        type: 'publicTaskDetailModal/updateDatas',
        payload: {
          drawContent: new_drawContent
        }
      })
      this.props.whetherUpdateParentTaskTime &&
        this.props.whetherUpdateParentTaskTime(new_data)
      this.props.handleTaskDetailChange &&
        this.props.handleTaskDetailChange({
          drawContent: new_drawContent,
          card_id: drawContent.card_id,
          name: 'card_data',
          value: newChildData
        })
      const {
        group_view_type,
        drawContent: { board_id }
      } = this.props
      typeof res == 'object' &&
        rebackCreateNotify.call(this, {
          res,
          id: card_id,
          board_id,
          group_view_type,
          dispatch,
          parent_card_id: drawContent.card_id,
          operate_in_card_detail_panel: true
        }) //创建撤回弹窗
    })
  },

  // 禁用截止时间
  disabledDueTime: function(due_time) {
    const {
      childTaskItemValue: { start_time }
    } = this.props
    if (!start_time || !due_time) {
      return false
    }
    const newStartTime =
      start_time.toString().length > 10
        ? Number(start_time).valueOf() / 1000
        : Number(start_time).valueOf()
    return Number(due_time.valueOf()) / 1000 < newStartTime
  },

  // 禁用开始时间
  disabledStartTime: function(start_time) {
    const {
      childTaskItemValue: { due_time }
    } = this.props
    if (!start_time || !due_time) {
      return false
    }
    const newDueTime =
      due_time.toString().length > 10
        ? Number(due_time).valueOf() / 1000
        : Number(due_time).valueOf()
    return Number(start_time.valueOf()) / 1000 >= newDueTime //Number(due_time).valueOf();
  },

  startDatePickerChange: function(timeString) {
    const { drawContent = {}, childTaskItemValue, dispatch } = this.props
    const {
      milestone_data = {},
      card_id: parent_card_id,
      board_id
    } = drawContent
    const { data = [] } =
      drawContent['properties'] &&
      drawContent['properties'].filter(item => item.code == 'MILESTONE')
        .length &&
      drawContent['properties'].filter(item => item.code == 'MILESTONE')[0]
    const { card_id } = childTaskItemValue
    const nowTime = timeToTimestamp(new Date())
    const start_timeStamp = timeToTimestamp(timeString)
    const updateObj = {
      card_id,
      start_time: start_timeStamp,
      board_id
    }
    if (!compareTwoTimestamp(data.deadline, start_timeStamp)) {
      message.warn('任务的开始日期不能大于关联里程碑的截止日期')
      return false
    }
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/updateTaskVTwo',
        payload: {
          updateObj
        }
      })
    ).then(res => {
      if (!isApiResponseOk(res)) {
        message.warn(res.message, MESSAGE_DURATION_TIME)
        return
      }
      if (!compareTwoTimestamp(start_timeStamp, nowTime)) {
        setTimeout(() => {
          message.warn(
            `您设置了一个今天之前的日期: ${timestampToTime(timeString, true)}`
          )
        }, 500)
      }
      this.setState({
        local_start_time: start_timeStamp
      })
      let new_data = []
      if (!(res.data.scope_content instanceof Array)) {
        new_data = []
      } else {
        new_data = [...res.data.scope_content]
      }
      new_data = new_data.filter(item => item.id == parent_card_id) || []
      this.setChildTaskIndrawContent(
        { name: 'start_time', value: start_timeStamp },
        card_id,
        res.data.scope_content,
        res
      )
      this.props.whetherUpdateParentTaskTime &&
        this.props.whetherUpdateParentTaskTime(new_data)
      this.props.updateRelyOnRationList &&
        this.props.updateRelyOnRationList(res.data.scope_content)
    })
  },

  // 删除开始时间
  handleDelStartTime: function(e) {
    e && e.stopPropagation()
    const {
      dispatch,
      childTaskItemValue,
      drawContent: { card_id: parent_card_id, board_id }
    } = this.props
    const { card_id, due_time } = childTaskItemValue
    let update_child_item = {
      id: card_id,
      start_time: '',
      due_time: due_time
    }
    const updateObj = {
      card_id,
      start_time: '0',
      board_id
    }
    if (!card_id) return false
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/updateTaskVTwo',
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
        local_start_time: null
      })
      let new_data = []
      let update_data = []
      if (!(res.data.scope_content instanceof Array)) {
        new_data = []
        update_data = [].concat(update_child_item)
      } else {
        new_data = [...res.data.scope_content]
        update_data = [].concat(update_child_item, ...res.data.scope_content)
      }
      new_data = new_data.filter(item => item.id == parent_card_id) || []
      this.setChildTaskIndrawContent(
        { name: 'start_time', value: null },
        card_id,
        update_data,
        res
      )
      this.props.whetherUpdateParentTaskTime &&
        this.props.whetherUpdateParentTaskTime(new_data)
      this.props.updateRelyOnRationList &&
        this.props.updateRelyOnRationList(res.data.scope_content)
    })
  },

  //截止时间
  endDatePickerChange: function(timeString) {
    const { drawContent = {}, childTaskItemValue, dispatch } = this.props
    const {
      milestone_data = {},
      card_id: parent_card_id,
      board_id
    } = drawContent
    const { data = [] } =
      drawContent['properties'] &&
      drawContent['properties'].filter(item => item.code == 'MILESTONE')
        .length &&
      drawContent['properties'].filter(item => item.code == 'MILESTONE')[0]
    const { card_id } = childTaskItemValue
    const nowTime = timeToTimestamp(new Date())
    const due_timeStamp = timeToTimestamp(timeString)
    const updateObj = {
      card_id,
      due_time: due_timeStamp,
      board_id
    }
    if (!compareTwoTimestamp(data.deadline, due_timeStamp)) {
      message.warn('任务的截止日期不能大于关联里程碑的截止日期')
      return false
    }
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/updateTaskVTwo',
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
          message.warn(
            `您设置了一个今天之前的日期: ${timestampToTime(timeString, true)}`
          )
        }, 500)
      }
      this.setState({
        local_due_time: due_timeStamp
      })
      let new_data = []
      if (!(res.data.scope_content instanceof Array)) {
        new_data = []
      } else {
        new_data = [...res.data.scope_content]
      }
      new_data = new_data.filter(item => item.id == parent_card_id) || []
      this.setChildTaskIndrawContent(
        { name: 'due_time', value: due_timeStamp },
        card_id,
        res.data.scope_content,
        res
      )
      this.props.whetherUpdateParentTaskTime &&
        this.props.whetherUpdateParentTaskTime(new_data)
      this.props.updateRelyOnRationList &&
        this.props.updateRelyOnRationList(res.data.scope_content)
    })
  },

  // 删除结束时间
  handleDelDueTime: function(e) {
    e && e.stopPropagation()
    const {
      dispatch,
      childTaskItemValue,
      drawContent: { card_id: parent_card_id, board_id }
    } = this.props
    const { card_id, start_time } = childTaskItemValue
    let update_child_item = {
      id: card_id,
      start_time: start_time,
      due_time: ''
    }
    const updateObj = {
      card_id,
      due_time: '0',
      board_id
    }
    if (!card_id) return false
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/updateTaskVTwo',
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
      let new_data = []
      let update_data = []
      if (!(res.data.scope_content instanceof Array)) {
        new_data = []
        update_data = [].concat(update_child_item)
      } else {
        new_data = [...res.data.scope_content]
        update_data = [].concat(update_child_item, ...res.data.scope_content)
      }
      new_data = new_data.filter(item => item.id == parent_card_id) || []
      this.setChildTaskIndrawContent(
        { name: 'due_time', value: null },
        card_id,
        update_data,
        res
      )
      this.props.whetherUpdateParentTaskTime &&
        this.props.whetherUpdateParentTaskTime(new_data)
      this.props.updateRelyOnRationList &&
        this.props.updateRelyOnRationList(res.data.scope_content)
    })
  },

  /**附件下载、删除等操作 */
  attachmentItemOpera: function({ type, data = {}, card_id }, e) {
    e && e.stopPropagation()
    //debugger
    const { dispatch } = this.props
    const attachment_id =
      data.id ||
      (data.response && data.response.data && data.response.data.attachment_id)
    const file_resource_id =
      data.file_resource_id ||
      (data.response && data.response.data.file_resource_id)
    if (!attachment_id) {
      message.warn('上传中，请稍后...')
      return
    }
    if (type == 'remove') {
      this.deleteAttachmentFile({ attachment_id, card_id })
    } else if (type == 'download') {
      dispatch({
        type: 'projectDetailFile/fileDownload',
        payload: {
          ids: file_resource_id,
          card_id,
          fileIds: data.file_id
        }
      })
    }
  },

  /**附件删除 */
  deleteAttachmentFile: function(data) {
    const { attachment_id, card_id } = data
    const that = this
    const { drawContent = {}, dispatch, childDataIndex } = this.props
    const { data: sub_attachment_data } = drawContent['properties'].filter(
      item => item.code == 'SUBTASK'
    )[0]
    const modal = Modal.confirm()
    modal.update({
      title: `确认要删除这个附件吗？`,
      zIndex: 1007,
      content: (
        <div style={{ color: 'rgba(0,0,0, .8)', fontSize: 14 }}>
          <span>删除后不可恢复</span>
        </div>
      ),
      okText: '确认',
      cancelText: '取消',
      onOk() {
        return new Promise(resolve => {
          deleteTaskFile(data).then(value => {
            if (value.code !== '0') {
              message.error(value.message)
              resolve()
            } else {
              let new_drawContent = { ...drawContent }
              sub_attachment_data[
                childDataIndex
              ].deliverables = sub_attachment_data[
                childDataIndex
              ].deliverables.filter(n => n.id != attachment_id)
              new_drawContent['properties'] = filterCurrentUpdateDatasField({
                properties: new_drawContent['properties'],
                code: 'SUBTASK',
                value: sub_attachment_data
              })
              that.props.dispatch({
                type: 'publicTaskDetailModal/updateDatas',
                payload: {
                  drawContent: new_drawContent
                }
              })

              // that.setChildTaskIndrawContent({ name: 'deliverables', value: [...sub_attachment_data[childDataIndex].deliverables] })
              resolve()
            }
          })
          // .catch((e) => {
          //   // console.log(e);

          //   message.warn('删除出了点问题，请重新删除。')
          //   resolve()
          // })
        })
      },
      onCancel: () => {
        modal.destroy()
      }
    })
  },

  // 渲染子任务交付物点点点内容
  getAttachmentActionMenus: function(fileInfo, card_id) {
    return (
      <Menu>
        <Menu.Item>
          <a
            onClick={this.attachmentItemOpera.bind(this, {
              type: 'download',
              data: fileInfo,
              card_id
            })}
          >
            下载到本地
          </a>
        </Menu.Item>
        <Menu.Item>
          <a
            onClick={this.attachmentItemOpera.bind(this, {
              type: 'remove',
              data: fileInfo,
              card_id
            })}
          >
            删除该附件
          </a>
        </Menu.Item>
      </Menu>
    )
  },

  /**附件预览 */
  openFileDetailModal: function(e, fileInfo) {
    e && e.stopPropagation()
    const file_name = fileInfo.name
    const file_resource_id = fileInfo.file_resource_id
    const file_id = fileInfo.file_id
    const board_id = fileInfo.board_id
    const { dispatch } = this.props
    dispatch({
      type: 'projectDetail/projectDetailInfo',
      payload: {
        id: board_id
      }
    })
    dispatch({
      type: 'publicFileDetailModal/updateDatas',
      payload: {
        filePreviewCurrentFileId: file_id,
        fileType: getSubfixName(file_name),
        isInOpenFile: true,
        filePreviewCurrentName: file_name
      }
    })
    this.updatePrivateVariablesWithOpenFile &&
      this.updatePrivateVariablesWithOpenFile()
    this.props.updatePrivateVariablesWithOpenFile &&
      this.props.updatePrivateVariablesWithOpenFile()
  },

  // 上传文件 事件 S
  onUploadFileListChange: function(data) {
    let { drawContent = {}, dispatch, childDataIndex } = this.props
    const { data: sub_attachment_data } = drawContent['properties'].filter(
      item => item.code == 'SUBTASK'
    )[0]
    if (data && data.length > 0) {
      sub_attachment_data[childDataIndex].deliverables = sub_attachment_data[
        childDataIndex
      ].deliverables
        ? [...sub_attachment_data[childDataIndex].deliverables]
        : []
      sub_attachment_data[childDataIndex].deliverables.push(...data)
      // this.setChildTaskIndrawContent({ name: 'deliverables', value: [...attachment_data[childDataIndex].deliverables] })
      let new_drawContent = { ...drawContent }
      new_drawContent['properties'] = filterCurrentUpdateDatasField({
        properties: new_drawContent['properties'],
        code: 'SUBTASK',
        value: sub_attachment_data
      })
      this.props.dispatch({
        type: 'publicTaskDetailModal/updateDatas',
        payload: {
          drawContent: new_drawContent
        }
      })
    }
  },
  // 判断时间格式 为1 表示精度为 天
  showTimerRange: function() {
    const { projectDetailInfoData = {} } = this.props
    const { board_set = {} } = projectDetailInfoData
    const { date_format } = board_set
    let flag = false
    flag = date_format == '1'
    return flag
  },
  // 判断时间模式 为1 表示相对时间
  showTimerMode: function() {
    const { projectDetailInfoData = {} } = this.props
    const { board_set = {} } = projectDetailInfoData
    const { date_mode } = board_set
    let flag = false
    flag = date_mode == '1'
    return flag
  },
  handleStartRelativeChange: function(value) {
    const {
      childTaskItemValue = {},
      dispatch,
      projectDetailInfoData = {},
      drawContent: { card_id: parent_card_id }
    } = this.props
    const { board_set = {} } = projectDetailInfoData
    const { relative_time } = board_set
    const { card_id, board_id } = childTaskItemValue
    if (!isNaN(value)) {
      // 表示是数字的时候才做处理
      let start_timeStamp =
        value == '' || String(value).trimLR() == ''
          ? '0'
          : getRelativeTimeTamp(value, relative_time)
      const updateObj = {
        card_id,
        start_time: start_timeStamp,
        board_id
      }
      Promise.resolve(
        dispatch({
          type: 'publicTaskDetailModal/updateTaskVTwo',
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
          local_start_time: start_timeStamp
        })
        let new_data = []
        if (!(res.data.scope_content instanceof Array)) {
          new_data = []
        } else {
          new_data = [...res.data.scope_content]
        }
        new_data = new_data.filter(item => item.id == parent_card_id) || []
        this.setChildTaskIndrawContent(
          { name: 'start_time', value: start_timeStamp },
          card_id,
          res.data.scope_content,
          res
        )
        this.props.whetherUpdateParentTaskTime &&
          this.props.whetherUpdateParentTaskTime(new_data)
        this.props.updateRelyOnRationList &&
          this.props.updateRelyOnRationList(res.data.scope_content)
      })
    } else {
    }
  },
  handleDueRelativeChange: function(value) {
    const {
      childTaskItemValue = {},
      dispatch,
      projectDetailInfoData = {},
      drawContent: { card_id: parent_card_id }
    } = this.props
    const { board_set = {} } = projectDetailInfoData
    const { relative_time } = board_set
    const { card_id, board_id } = childTaskItemValue
    if (!isNaN(value)) {
      // 表示是数字的时候才做处理
      let due_timeStamp =
        value == '' || String(value).trimLR() == ''
          ? '0'
          : getRelativeTimeTamp(value, relative_time)
      const updateObj = {
        card_id,
        due_time: due_timeStamp,
        board_id
      }
      Promise.resolve(
        dispatch({
          type: 'publicTaskDetailModal/updateTaskVTwo',
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
          local_due_time: due_timeStamp
        })
        let new_data = []
        if (!(res.data.scope_content instanceof Array)) {
          new_data = []
        } else {
          new_data = [...res.data.scope_content]
        }
        new_data = new_data.filter(item => item.id == parent_card_id) || []
        this.setChildTaskIndrawContent(
          { name: 'due_time', value: due_timeStamp },
          card_id,
          res.data.scope_content,
          res
        )
        this.props.whetherUpdateParentTaskTime &&
          this.props.whetherUpdateParentTaskTime(new_data)
        this.props.updateRelyOnRationList &&
          this.props.updateRelyOnRationList(res.data.scope_content)
      })
    } else {
    }
  }
}

export default class SubTaskContainer extends Component {
  render() {
    const {
      children,
      SubTaskUIComponent,
      handleTaskDetailChange,
      handleChildTaskChange,
      whetherUpdateParentTaskTime,
      updateRelyOnRationList,
      boardFolderTreeData,
      handleRelyUploading,
      updatePrivateVariablesWithOpenFile
    } = this.props
    return (
      <>
        {SubTaskUIComponent ? (
          <SubTaskUIComponent
            SubTaskLogic={SubTaskLogic}
            SubTaskItemLogic={SubTaskItemLogic}
            handleTaskDetailChange={handleTaskDetailChange}
            handleChildTaskChange={handleChildTaskChange}
            whetherUpdateParentTaskTime={whetherUpdateParentTaskTime}
            updateRelyOnRationList={updateRelyOnRationList}
            boardFolderTreeData={boardFolderTreeData}
            children={children}
            handleRelyUploading={handleRelyUploading}
            updatePrivateVariablesWithOpenFile={
              updatePrivateVariablesWithOpenFile
            }
          />
        ) : (
          <AppendSubTask
            SubTaskLogic={SubTaskLogic}
            SubTaskItemLogic={SubTaskItemLogic}
            handleTaskDetailChange={handleTaskDetailChange}
            handleChildTaskChange={handleChildTaskChange}
            whetherUpdateParentTaskTime={whetherUpdateParentTaskTime}
            updateRelyOnRationList={updateRelyOnRationList}
            boardFolderTreeData={boardFolderTreeData}
            children={children}
          />
        )}
      </>
    )
  }
}
