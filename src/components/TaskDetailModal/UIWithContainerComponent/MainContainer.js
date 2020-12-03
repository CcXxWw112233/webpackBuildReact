import React, { Component } from 'react'
import { message, Modal, Menu } from 'antd'
import {
  timestampToTime,
  compareTwoTimestamp,
  timeToTimestamp
} from '@/utils/util'
import {
  MESSAGE_DURATION_TIME,
  NOT_HAS_PERMISION_COMFIRN,
  PROJECT_TEAM_CARD_COMPLETE,
  PROJECT_TEAM_CARD_EDIT,
  PROJECT_FILES_FILE_INTERVIEW
} from '@/globalset/js/constant'
import { isApiResponseOk } from '../../../utils/handleResponseData'
import {
  addTaskExecutor,
  removeTaskExecutor,
  deleteTaskFile,
  getTaskGroup
} from '../../../services/technological/task'
import {
  checkIsHasPermissionInBoard,
  checkIsHasPermissionInVisitControl,
  isPaymentOrgUser
} from '@/utils/businessFunction'
import { getFolderList } from '@/services/technological/file'
import { getMilestoneList } from '@/services/technological/prjectDetail'
import { arrayNonRepeatfy, getRelativeTimeTamp } from '../../../utils/util'
import {
  getCurrentDrawerContentPropsModelFieldData,
  filterCurrentUpdateDatasField,
  getCurrentPropertiesData,
  compareStartDueTime
} from '../handleOperateModal'
import { rebackCreateNotify } from '../../NotificationTodos'
import { lx_utils } from 'lingxi-im'
import {
  checkIsHasPermissionInVisitControlWithGroup,
  getSubfixName
} from '../../../utils/businessFunction'

// 逻辑组件
const LogicWithMainContent = {
  // 打开圈子
  linkImWithCard: function(data) {
    const { user_set = {} } = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : {}
    const { is_simple_model } = user_set
    if (!data) {
      lx_utils && lx_utils.setCommentData(null)
      return false
    }
    lx_utils && lx_utils.setCommentData({ ...data })
    if (is_simple_model == '1') {
      this.props.dispatch({
        type: 'simplemode/updateDatas',
        payload: {
          chatImVisiable: true
        }
      })
    }
  },

  // 点击动态消息 联动圈子
  handleDynamicComment: function(e) {
    e && e.stopPropagation()
    const {
      drawContent: { card_name, board_id, card_id }
    } = this.props
    this.linkImWithCard({
      name: card_name,
      type: 'card',
      board_id: board_id,
      id: card_id
    })
  },

  //获取项目里文件夹列表
  getProjectFolderList: function(board_id) {
    getFolderList({ board_id }).then(res => {
      if (isApiResponseOk(res)) {
        this.setState({
          boardFolderTreeData: res.data
        })
      } else {
        message.error(res.message)
      }
    })
  },

  //获取项目里程碑列表
  getMilestone: function(id, callBackObject, milestoneId) {
    getMilestoneList({ id }).then(res => {
      if (isApiResponseOk(res)) {
        this.props.dispatch({
          type: 'publicTaskDetailModal/updateDatas',
          payload: {
            milestoneList: res.data
          }
        })
        this.setState(
          {
            milestoneList: res.data
          },
          () => {
            callBackObject &&
              callBackObject.callBackFun(res.data, callBackObject.param)
          }
        )
      } else {
        message.error(res.message)
      }
    })
  },

  // 初始化过滤当前已经存在的字段
  // filterCurrentExistenceField: function(currentData) {
  //   const { propertiesList = [] } = this.state
  //   let newCurrentData = { ...currentData }
  //   let newPropertiesList = [...propertiesList]
  //   newPropertiesList = newPropertiesList.filter((value, index) => {
  //     const gold_code = (
  //       newCurrentData['properties'].find(item => item.code === value.code) ||
  //       {}
  //     ).code
  //     if (value.code != gold_code) {
  //       return value
  //     }
  //   })
  //   this.setState({
  //     propertiesList: newPropertiesList
  //   })
  // },

  // 获取组织成员列表
  getOrgMemberList: function(org_id) {
    this.props.dispatch({
      type: 'technological/getCorrespondingOrganizationMmembers',
      payload: {
        _organization_id: org_id
      }
    })
  },

  getTaskGroup: function(board_id) {
    getTaskGroup({ board_id }).then(res => {
      if (isApiResponseOk(res)) {
        this.props.dispatch({
          type: 'publicTaskDetailModal/updateDatas',
          payload: {
            card_list_group: res.data || []
          }
        })
      }
    })
  },

  // 获取任务详情数据
  getInitCardDetailDatas: function(props) {
    const { card_id, dispatch } = props
    if (!card_id) return false
    const that = this
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/getCardWithAttributesDetail',
        payload: {
          id: card_id
        }
      })
    ).then(res => {
      if (isApiResponseOk(res)) {
        // 检测 该组织是否付费 --> 是否有访问文件权限--> 有 则调接口获取
        if (
          isPaymentOrgUser(res.data.org_id) &&
          checkIsHasPermissionInBoard(
            PROJECT_FILES_FILE_INTERVIEW,
            res.data.board_id
          )
        ) {
          this.getProjectFolderList(res.data.board_id)
        }
        // 获取分组详情数据
        this.getTaskGroup(res.data.board_id)
        this.getMilestone(res.data.board_id)
        // 初始化获取字段信息 (需过滤已经存现在的字段)
        // this.filterCurrentExistenceField(res.data)
        // 初始化组织成员列表
        this.getOrgMemberList(res.data.org_id)
        // 是否可以修改父任务时间
        this.whetherUpdateParentTaskTime()
        // this.linkImWithCard({ name: res.data.card_name, type: 'card', board_id: res.data.board_id, id: res.data.card_id })
      } else {
        setTimeout(() => {
          dispatch({
            type: 'publicTaskDetailModal/updateDatas',
            payload: {
              drawerVisible: false
            }
          })
          if (this.props.selected_card_visible) {
            dispatch({
              type: 'gantt/updateDatas',
              payload: {
                selected_card_visible: false
              }
            })
          }
          this.linkImWithCard(null)
        }, 500)
      }
    })
  },

  // 检测不同类型的权限控制类型的是否显示
  checkDiffCategoriesAuthoritiesIsVisible: function(code) {
    const {
      drawContent = {},
      drawContent: { properties = [] },
      card_list_group = []
    } = this.props
    const { data = [] } = getCurrentDrawerContentPropsModelFieldData({
      properties,
      code: 'EXECUTOR'
    })
    const { privileges = [], board_id, is_privilege, list_id } = drawContent
    const is_valid_group = true
    // 表示先判断分组权限 然后在判断访问控制
    return {
      visit_control_edit: function() {
        // 是否是有编辑权限
        return checkIsHasPermissionInVisitControlWithGroup({
          code: 'read',
          list_id: list_id,
          list_group: card_list_group,
          permissionsValue: checkIsHasPermissionInBoard(code, board_id)
        })
          ? checkIsHasPermissionInVisitControl(
              'edit',
              privileges,
              is_privilege,
              [],
              checkIsHasPermissionInBoard(code, board_id),
              is_valid_group
            )
          : checkIsHasPermissionInVisitControl(
              'edit',
              privileges,
              is_privilege,
              [],
              checkIsHasPermissionInBoard(code, board_id),
              is_valid_group
            )
          ? false
          : true
        return checkIsHasPermissionInVisitControl(
          'edit',
          privileges,
          is_privilege,
          [],
          checkIsHasPermissionInBoard(code, board_id),
          is_valid_group
        )
          ? true
          : checkIsHasPermissionInVisitControlWithGroup({
              code: 'read',
              list_id: list_id,
              list_group: card_list_group,
              permissionsValue: checkIsHasPermissionInBoard(code, board_id)
            })
      },
      visit_control_comment: function() {
        return checkIsHasPermissionInVisitControl(
          'comment',
          privileges,
          is_privilege,
          data ? data : [],
          checkIsHasPermissionInBoard(code, board_id)
        )
      }
    }
  },

  // 更新drawContent中的数据以及调用父级列表更新数据
  updateDrawContentWithUpdateParentListDatas: function({
    drawContent,
    card_id,
    name,
    value,
    operate_properties_code,
    rely_card_datas
  }) {
    const { dispatch } = this.props
    dispatch({
      type: 'publicTaskDetailModal/updateDatas',
      payload: {
        drawContent
      }
    })
    if (name && value) {
      this.props.handleTaskDetailChange &&
        this.props.handleTaskDetailChange({
          drawContent,
          card_id,
          name,
          value,
          operate_properties_code,
          rely_card_datas
        })
    }
  },

  // 设置卡片是否完成 S
  setIsCheck: function() {
    const { drawContent = {} } = this.props
    const { is_realize = '0', card_id, board_id } = drawContent
    if (
      this.checkDiffCategoriesAuthoritiesIsVisible &&
      this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit &&
      !this.checkDiffCategoriesAuthoritiesIsVisible(
        PROJECT_TEAM_CARD_COMPLETE
      ).visit_control_edit()
    ) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const obj = {
      card_id,
      is_realize: is_realize === '1' ? '0' : '1',
      board_id
    }
    const { dispatch } = this.props
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
      let new_drawContent = { ...drawContent }
      new_drawContent['is_realize'] = is_realize === '1' ? '0' : '1'
      new_drawContent['finish_time'] = res.data.finish_time
      this.updateDrawContentWithUpdateParentListDatas({
        drawContent: new_drawContent,
        card_id,
        name: 'is_realize',
        value: is_realize === '1' ? '0' : '1'
      })
    })
  },
  // 设置卡片是否完成 E

  // 设置标题textarea区域修改 S
  setTitleEdit: function(e, card_name) {
    e && e.stopPropagation()
    if (
      this.checkDiffCategoriesAuthoritiesIsVisible &&
      this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit &&
      !this.checkDiffCategoriesAuthoritiesIsVisible(
        PROJECT_TEAM_CARD_EDIT
      ).visit_control_edit()
    ) {
      return false
    }
    this.setState({
      is_edit_title: true,
      local_title_value: card_name,
      inputValue: card_name
    })
  },
  // 点击设置标题事件 E

  // 设置标题文本内容change事件 S
  titleTextAreaChange: function(e) {
    let val = e.target.value
    let reStr = val.trim()
    this.setState({
      inputValue: reStr
    })
  },
  // 设置标题文本内容change事件 E

  // 设置标题文本失去焦点回调 S
  titleTextAreaChangeBlur: function(e) {
    e && e.stopPropagation()
    let val = e.target.value
    const { local_title_value } = this.state
    const { dispatch, drawContent = {} } = this.props
    const { card_id, board_id, card_name } = drawContent
    const { local_card_name } = this.state
    let reStr = val.trim()
    if (reStr == '' || reStr == ' ' || !reStr || val == local_title_value) {
      this.setState({
        is_edit_title: false
      })
      return
    }
    drawContent['card_name'] = reStr
    const updateObj = {
      card_id,
      card_name: val,
      name: val,
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
        is_edit_title: false
      })
      dispatch({
        type: 'publicTaskDetailModal/updateDatas',
        payload: {
          drawContent
        }
      })
      // this.updateDrawContentWithUpdateParentListDatas({ drawContent, card_id })
      // 需要调用父级的列表
      this.props.handleTaskDetailChange &&
        this.props.handleTaskDetailChange({
          drawContent,
          card_id,
          name: 'card_name',
          value: val
        })
    })
  },
  // 设置标题文本失去焦点回调 E

  // 设置是否完成状态的下拉回调 S
  handleFiledIsComplete: function(e) {
    const { dispatch, drawContent = {} } = this.props
    const { board_id, card_id, is_realize } = drawContent
    let temp_realize
    let new_drawContent = { ...drawContent }
    if (e.key == 'incomplete') {
      // 表示未完成
      temp_realize = '0'
      new_drawContent['is_realize'] = temp_realize
    } else if (e.key == 'complete' && is_realize != '1') {
      // 表示已完成
      temp_realize = '1'
      new_drawContent['is_realize'] = temp_realize
    }

    // 阻止重复点击
    if (is_realize == temp_realize || !temp_realize) return false
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/completeTask',
        payload: {
          is_realize: temp_realize,
          card_id,
          board_id
        }
      })
    ).then(res => {
      if (!isApiResponseOk(res)) {
        message.warn(res.message, MESSAGE_DURATION_TIME)
        return
      }
      this.updateDrawContentWithUpdateParentListDatas({
        drawContent: new_drawContent,
        card_id,
        name: 'is_realize',
        value: temp_realize
      })
    })
  },
  // 设置是否完成状态的下拉回调 E

  // 邀请他人参与回调 并设置为执行人
  inviteOthersToBoardCalback: function({ users = [] }) {
    if (!users) return
    const {
      dispatch,
      projectDetailInfoData = {},
      drawContent = {}
    } = this.props
    const { board_id, data = [] } = projectDetailInfoData
    const { card_id } = drawContent
    const gold_data = getCurrentPropertiesData(
      drawContent['properties'],
      'EXECUTOR'
    )
    const calback = res => {
      const new_users = res.data
      const arr = new_users.filter(item => users.indexOf(item.user_id) != -1)
      const newExecutors = arrayNonRepeatfy(
        [].concat(gold_data, arr),
        'user_id'
      )
      let new_drawContent = { ...drawContent }
      // new_drawContent['executors'] = newExecutors
      new_drawContent['properties'] = filterCurrentUpdateDatasField({
        properties: new_drawContent['properties'],
        code: 'EXECUTOR',
        value: newExecutors
      })
      this.updateDrawContentWithUpdateParentListDatas({
        drawContent: new_drawContent,
        card_id,
        name: 'executors',
        value: newExecutors,
        operate_properties_code: 'EXECUTOR'
      })
    }
    dispatch({
      type: 'projectDetail/projectDetailInfo',
      payload: {
        id: board_id,
        calback
      }
    })
  },

  // 添加执行人的回调 S
  chirldrenTaskChargeChange: function(dataInfo) {
    const {
      drawContent = {},
      projectDetailInfoData = {},
      dispatch
    } = this.props
    const { card_id } = drawContent

    // 多个任务执行人
    const excutorData = projectDetailInfoData['data'] //所有的人
    // const excutorData = new_userInfo_data //所有的人
    let newExecutors = []
    const { selectedKeys = [], type, key } = dataInfo
    for (let i = 0; i < selectedKeys.length; i++) {
      for (let j = 0; j < excutorData.length; j++) {
        if (selectedKeys[i] === excutorData[j]['user_id']) {
          newExecutors.push(excutorData[j])
        }
      }
    }
    let new_drawContent = { ...drawContent }
    // new_drawContent['executors'] = newExecutors
    new_drawContent['properties'] = filterCurrentUpdateDatasField({
      properties: new_drawContent['properties'],
      code: 'EXECUTOR',
      value: newExecutors
    })
    if (type == 'add') {
      addTaskExecutor({ card_id, executor: key }).then(res => {
        if (isApiResponseOk(res)) {
          message.success(`已成功设置执行人`, MESSAGE_DURATION_TIME)
          this.updateDrawContentWithUpdateParentListDatas({
            drawContent: new_drawContent,
            card_id,
            name: 'executors',
            value: newExecutors,
            operate_properties_code: 'EXECUTOR'
          })
        } else {
          message.warn(res.message, MESSAGE_DURATION_TIME)
        }
      })
    } else if (type == 'remove') {
      removeTaskExecutor({ card_id, executor: key }).then(res => {
        if (isApiResponseOk(res)) {
          message.success(`已成功删除执行人`, MESSAGE_DURATION_TIME)
          this.updateDrawContentWithUpdateParentListDatas({
            drawContent: new_drawContent,
            card_id,
            name: 'executors',
            value: newExecutors,
            operate_properties_code: 'EXECUTOR'
          })
        } else {
          message.warn(res.message, MESSAGE_DURATION_TIME)
        }
      })
    }
  },
  // 添加执行人的回调 E

  // 移除执行人的回调 S
  handleRemoveExecutors: function(e, shouldDeleteItem) {
    e && e.stopPropagation()
    const { drawContent = {}, dispatch } = this.props
    const { card_id, properties = [] } = drawContent
    const { data = [] } = getCurrentDrawerContentPropsModelFieldData({
      properties,
      code: 'EXECUTOR'
    })
    let new_executors = [...data]
    let new_drawContent = { ...drawContent }
    new_executors.map((item, index) => {
      if (item.user_id == shouldDeleteItem) {
        new_executors.splice(index, 1)
      }
    })
    new_drawContent['properties'] = filterCurrentUpdateDatasField({
      properties: new_drawContent['properties'],
      code: 'EXECUTOR',
      value: new_executors
    })
    removeTaskExecutor({ card_id, executor: shouldDeleteItem }).then(res => {
      if (isApiResponseOk(res)) {
        message.success(`已成功删除执行人`, MESSAGE_DURATION_TIME)
        this.updateDrawContentWithUpdateParentListDatas({
          drawContent: new_drawContent,
          card_id,
          name: 'executors',
          value: new_executors,
          operate_properties_code: 'EXECUTOR'
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    })
  },
  // 移除执行人的回调 E

  // 禁用截止时间
  disabledDueTime: function(due_time) {
    const { drawContent = {} } = this.props
    const { start_time } = drawContent
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
    const { drawContent = {} } = this.props
    const { due_time } = drawContent
    if (!start_time || !due_time) {
      return false
    }
    const newDueTime =
      due_time.toString().length > 10
        ? Number(due_time).valueOf() / 1000
        : Number(due_time).valueOf()
    return Number(start_time.valueOf()) / 1000 >= newDueTime //Number(due_time).valueOf();
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
      drawContent = {},
      dispatch,
      projectDetailInfoData = {}
    } = this.props
    const { board_set = {} } = projectDetailInfoData
    const { relative_time } = board_set
    const { card_id, board_id } = drawContent
    if (!isNaN(value)) {
      // 表示是数字的时候才做处理
      let start_timeStamp =
        value === 0
          ? relative_time
          : value == '' || String(value).trimLR() == ''
          ? '0'
          : getRelativeTimeTamp(value, relative_time)
      const updateObj = {
        card_id,
        start_time: start_timeStamp,
        board_id
      }
      let new_drawContent = { ...drawContent }
      new_drawContent['start_time'] = start_timeStamp
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
        this.updateDrawContentWithUpdateParentListDatas({
          drawContent: new_drawContent,
          card_id,
          name: 'start_time',
          value: start_timeStamp,
          rely_card_datas: res.data
        })
        rebackCreateNotify.call(this, {
          res,
          id: card_id,
          board_id,
          dispatch,
          operate_in_card_detail_panel: true
        }) //创建撤回弹窗
      })
    } else {
    }
  },

  handleDueRelativeChange: function(value) {
    const {
      drawContent = {},
      dispatch,
      projectDetailInfoData = {}
    } = this.props
    const { board_set = {} } = projectDetailInfoData
    const { relative_time } = board_set
    const { card_id, board_id } = drawContent
    if (!isNaN(value)) {
      // 表示是数字的时候才做处理
      let due_timeStamp =
        value === 0
          ? relative_time
          : value == '' || String(value).trimLR() == ''
          ? '0'
          : getRelativeTimeTamp(value, relative_time)
      const updateObj = {
        card_id,
        due_time: due_timeStamp,
        board_id
      }
      let new_drawContent = { ...drawContent }
      new_drawContent['due_time'] = due_timeStamp
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
        this.updateDrawContentWithUpdateParentListDatas({
          drawContent: new_drawContent,
          card_id,
          name: 'due_time',
          value: due_timeStamp,
          rely_card_datas: res.data
        })
        rebackCreateNotify.call(this, {
          res,
          id: card_id,
          board_id,
          dispatch,
          operate_in_card_detail_panel: true
        }) //创建撤回弹窗
      })
    }
  },

  // 开始时间 chg事件 S
  startDatePickerChange: function(timeString) {
    const { drawContent = {}, dispatch } = this.props
    const nowTime = timeToTimestamp(new Date())
    const start_timeStamp = timeToTimestamp(timeString)
    const { card_id, due_time, board_id } = drawContent
    const { data = [] } =
      drawContent['properties'] &&
      drawContent['properties'].filter(item => item.code == 'MILESTONE')
        .length &&
      drawContent['properties'].filter(item => item.code == 'MILESTONE')[0]
    const updateObj = {
      card_id,
      start_time: start_timeStamp,
      board_id
    }
    if (!compareStartDueTime(start_timeStamp, due_time)) {
      message.warn('开始时间不能大于结束时间')
      return false
    }
    if (!compareTwoTimestamp(data.deadline, start_timeStamp)) {
      message.warn('任务的开始时间不能大于关联里程碑的截止日期')
      return false
    }
    let new_drawContent = { ...drawContent }
    new_drawContent['start_time'] = start_timeStamp
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
      this.updateDrawContentWithUpdateParentListDatas({
        drawContent: new_drawContent,
        card_id,
        name: 'start_time',
        value: start_timeStamp,
        rely_card_datas: res.data
      })
      rebackCreateNotify.call(this, {
        res,
        id: card_id,
        board_id,
        dispatch,
        operate_in_card_detail_panel: true
      }) //创建撤回弹窗
    })
  },
  // 开始时间 chg事件 E

  // 截止时间 chg事件 S
  endDatePickerChange: function(timeString) {
    const { drawContent = {}, dispatch } = this.props
    const { card_id, start_time, milestone_data = {}, board_id } = drawContent
    const { data = [] } =
      drawContent['properties'] &&
      drawContent['properties'].filter(item => item.code == 'MILESTONE')
        .length &&
      drawContent['properties'].filter(item => item.code == 'MILESTONE')[0]
    const nowTime = timeToTimestamp(new Date())
    const due_timeStamp = timeToTimestamp(timeString)
    const updateObj = {
      card_id,
      due_time: due_timeStamp,
      board_id
    }

    if (!compareStartDueTime(start_time, due_timeStamp)) {
      message.warn('开始时间不能大于结束时间')
      return false
    }

    if (!compareTwoTimestamp(data.deadline, due_timeStamp)) {
      message.warn('任务的截止日期不能大于关联里程碑的截止日期')
      return false
    }

    let new_drawContent = { ...drawContent }
    new_drawContent['due_time'] = due_timeStamp
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
            `您设置了一个今天之前的日期: ${timestampToTime(timeString, true)}`,
            MESSAGE_DURATION_TIME
          )
        }, 500)
      }
      this.updateDrawContentWithUpdateParentListDatas({
        drawContent: new_drawContent,
        card_id,
        name: 'due_time',
        value: due_timeStamp,
        rely_card_datas: res.data
      })
      rebackCreateNotify.call(this, {
        res,
        id: card_id,
        board_id,
        dispatch,
        operate_in_card_detail_panel: true
      }) //创建撤回弹窗
    })
  },
  // 截止时间 chg事件 E

  // 删除开始时间 S
  handleDelStartTime: function(e) {
    e && e.stopPropagation()
    const { dispatch, drawContent = {} } = this.props
    const { card_id, start_time, board_id } = drawContent
    const updateObj = {
      card_id,
      start_time: '0',
      board_id
    }
    let new_drawContent = { ...drawContent }
    new_drawContent['start_time'] = null
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
      this.updateDrawContentWithUpdateParentListDatas({
        drawContent: new_drawContent,
        card_id,
        name: 'start_time',
        value: '0',
        rely_card_datas: res.data
      })
      rebackCreateNotify.call(this, {
        res,
        id: card_id,
        board_id,
        dispatch,
        operate_in_card_detail_panel: true
      }) //创建撤回弹窗
    })
  },
  // 删除开始时间 E

  // 删除结束时间 S
  handleDelDueTime: function(e) {
    e && e.stopPropagation()
    const { dispatch, drawContent = {} } = this.props
    const { card_id, due_time, board_id } = drawContent
    const updateObj = {
      card_id,
      due_time: '0',
      board_id
    }
    let new_drawContent = { ...drawContent }
    new_drawContent['due_time'] = null
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
      this.updateDrawContentWithUpdateParentListDatas({
        drawContent: new_drawContent,
        card_id,
        name: 'due_time',
        value: '0',
        rely_card_datas: res.data
      })
      rebackCreateNotify.call(this, {
        res,
        id: card_id,
        board_id,
        dispatch,
        operate_in_card_detail_panel: true
      }) //创建撤回弹窗
    })
  },
  // 删除结束时间 E

  updateParentPropertiesList: function({ shouldDeleteId }) {
    const { attributesList = [], propertiesList = [] } = this.props
    // const { } = this.state
    let new_attributesList = [...attributesList]
    let new_propertiesList = [...propertiesList]
    const currentDataItem = new_attributesList.filter(
      item => item.id == shouldDeleteId
    )[0]
    new_propertiesList.push(currentDataItem)
    this.props.dispatch({
      type: 'publicTaskDetailModal/updateDatas',
      payload: {
        propertiesList: arrayNonRepeatfy(new_propertiesList, 'id')
      }
    })
    // this.setState({
    //   propertiesList: new_propertiesList
    // })
  },

  // 对应字段的删除 S
  handleDelCurrentField: function(shouldDeleteId, code) {
    if (
      this.checkDiffCategoriesAuthoritiesIsVisible &&
      this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit &&
      !this.checkDiffCategoriesAuthoritiesIsVisible(
        PROJECT_TEAM_CARD_EDIT
      ).visit_control_edit()
    ) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const that = this
    this.setState({
      showDelColor: true,
      currentDelId: shouldDeleteId
    })
    let flag = false // 判断删除的时候当前是否有数据, 默认为false 表示没有数据直接删除
    const {
      dispatch,
      drawContent = {},
      drawContent: { card_id }
    } = that.props
    let new_drawContent = { ...drawContent }
    let filter_drawContent = { ...drawContent }
    // 删除的时候判断data类型以及是否有数据
    filter_drawContent['properties'].find(item => {
      if (item.id == shouldDeleteId) {
        // 表示找到当前item
        if (Array.isArray(item.data)) {
          flag = item.data.length
        } else if (item.data instanceof Object) {
          let arr = Object.keys(item.data)
          flag = !(arr.length == '0')
        } else if (item.data) {
          flag = true
        }
      }
    })
    new_drawContent['properties'] = new_drawContent['properties'].filter(
      item => item.id != shouldDeleteId
    )
    let gold_executor = (
      new_drawContent['properties'].find(item => item.code == 'EXECUTOR') || {}
    ).data
    if (flag) {
      Modal.confirm({
        title: `确认要删除这条字段吗？`,
        zIndex: 1007,
        content: (
          <div style={{ color: 'rgba(0,0,0, .65)', fontSize: 14 }}>
            <span>删除包括删除这条字段已填写的内容。</span>
          </div>
        ),
        okText: '确认',
        cancelText: '取消',
        onOk() {
          Promise.resolve(
            dispatch({
              type: 'publicTaskDetailModal/removeCardAttributes',
              payload: {
                card_id,
                property_id: shouldDeleteId
              }
            })
          ).then(res => {
            if (isApiResponseOk(res)) {
              that.setState({
                shouldDeleteId: '',
                showDelColor: ''
              })
              that.updateParentPropertiesList &&
                that.updateParentPropertiesList({ shouldDeleteId })
              that.props.updateParentPropertiesList &&
                that.props.updateParentPropertiesList({ shouldDeleteId })
              dispatch({
                type: 'publicTaskDetailModal/updateDatas',
                payload: {
                  drawContent: new_drawContent
                }
              })
              if (!(gold_executor && gold_executor.length)) {
                that.props.handleTaskDetailChange &&
                  that.props.handleTaskDetailChange({
                    card_id,
                    drawContent: new_drawContent,
                    operate_properties_code: 'EXECUTOR'
                  })
              }
              that.deleteCodeCalback(code, new_drawContent)
            }
          })
        },
        onCancel() {
          that.setState({
            shouldDeleteId: '',
            showDelColor: ''
          })
        }
      })
    } else {
      Promise.resolve(
        dispatch({
          type: 'publicTaskDetailModal/removeCardAttributes',
          payload: {
            card_id,
            property_id: shouldDeleteId
          }
        })
      ).then(res => {
        if (isApiResponseOk(res)) {
          that.setState({
            shouldDeleteId: '',
            showDelColor: ''
          })
          that.updateParentPropertiesList &&
            that.updateParentPropertiesList({ shouldDeleteId })
          that.props.updateParentPropertiesList &&
            that.props.updateParentPropertiesList({ shouldDeleteId })
          dispatch({
            type: 'publicTaskDetailModal/updateDatas',
            payload: {
              drawContent: new_drawContent
            }
          })
          if (!(gold_executor && gold_executor.length)) {
            that.props.handleTaskDetailChange &&
              that.props.handleTaskDetailChange({
                card_id,
                drawContent: new_drawContent,
                operate_properties_code: 'EXECUTOR'
              })
          }
        }
      })
    }
  },
  // 对应字段的删除 E

  // 会议的状态值, 比较当前时间和开始时间结束时间的对比 S
  getMeetingStatus: function() {
    let meetingField
    meetingField = <span></span>
    const { drawContent = {} } = this.props
    const { start_time, due_time, type } = drawContent
    if (type == '0' || !start_time || !due_time) return
    let timeString
    timeString = new Date().getTime().toString()
    if (timeString.length == 13) {
      // 表示是13位的时间戳
      timeString = parseInt(timeString / 1000)
    }
    if (compareTwoTimestamp(timeString, start_time)) {
      // 如果说当前时间大于开始时间表示进行中
      meetingField = (
        <span
          style={{
            display: 'inline-block',
            width: '58px',
            height: '26px',
            background: '#FFE7BA',
            borderRadius: '4px',
            lineHeight: '26px',
            textAlign: 'center',
            color: '#FA8C16'
          }}
        >
          {'进行中'}
        </span>
      )
      if (compareTwoTimestamp(timeString, due_time)) {
        // 如果说当前时间大于截止时间表示已完成
        meetingField = (
          <span
            style={{
              display: 'inline-block',
              width: '58px',
              height: '26px',
              background: '#D0EFB4',
              borderRadius: '4px',
              lineHeight: '26px',
              textAlign: 'center',
              color: '#389E0D'
            }}
          >
            {'已完成'}
          </span>
        )
      }
    } else {
      // 表示未开始
      meetingField = (
        <span
          style={{
            display: 'inline-block',
            width: '58px',
            height: '26px',
            background: '#D4F1FF',
            borderRadius: '4px',
            lineHeight: '26px',
            textAlign: 'center',
            color: '#1890FF'
          }}
        >
          {'未开始'}
        </span>
      )
    }
    return meetingField
  },
  // 会议的状态值, 比较当前时间和开始时间结束时间的对比 E

  // 添加自定义字段
  handleAddCustomField: function(checkedKeys = [], calback) {
    const {
      drawContent: { board_id, card_id }
    } = this.props
    this.props
      .dispatch({
        type: 'organizationManager/createRelationCustomField',
        payload: {
          fields: checkedKeys,
          relation_id: card_id,
          source_type: '2'
        }
      })
      .then(res => {
        if (isApiResponseOk(res)) {
          this.props.dispatch({
            type: 'publicTaskDetailModal/getCardWithAttributesDetail',
            payload: {
              id: card_id
            }
          })
          if (calback && typeof calback == 'function') calback()
        } else {
          if (calback && typeof calback == 'function') calback()
        }
      })
  },

  // 修改弹窗数据
  handleUpdateModelDatas: function({ data, type }) {
    const {
      drawContent = {},
      drawContent: { fields = [] }
    } = this.props
    let new_fields = [...fields]
    switch (type) {
      case 'update':
        const { id, field_value } = data
        new_fields = new_fields.map(item => {
          if (item.id == id) {
            let new_item = { ...item }
            new_item = { ...item, field_value: field_value }
            return new_item
          } else {
            return item
          }
        })
        break
      case 'delete':
        new_fields = new_fields.filter(item => item.id != data)
        break

      default:
        break
    }
    let new_drawContent = { ...drawContent }
    new_drawContent['fields'] = new_fields
    this.props.dispatch({
      type: 'publicTaskDetailModal/updateDatas',
      payload: {
        drawContent: new_drawContent
      }
    })
  },

  // 属性选择的下拉回调 S
  handleMenuReallySelect: function(e, value) {
    const { dispatch, card_id } = this.props
    const { propertiesList = [] } = this.state
    const that = this
    let new_propertiesList = [...propertiesList]
    new_propertiesList = new_propertiesList.filter(item => {
      if (item.id != value.id) {
        return item
      }
    })
    dispatch({
      type: 'publicTaskDetailModal/setCardAttributes',
      payload: {
        card_id,
        property_id: value.id,
        calback: () => {
          that.setState({
            propertiesList: new_propertiesList
          })
        }
      }
    })
  },
  // 属性选择的下拉回调 E

  // 判断是否存在执行人
  whetherExistencePriciple: function(code) {
    const {
      drawContent: { properties = [] }
    } = this.props
    let flag
    if (!properties.length) return false
    flag = properties.filter(item => item.code == code)
    if (flag.length == '0') return (flag = false)
    return flag
  },

  // 更新一个私有变量开启文件弹窗
  updatePrivateVariablesWithOpenFile: function() {
    this.setState({
      whetherIsOpenFileVisible: !this.state.whetherIsOpenFileVisible
    })
  },

  // 附件关闭回调
  setPreviewFileModalVisibile: function() {
    // this.setState({
    //   previewFileModalVisibile: !this.state.previewFileModalVisibile
    // })
    this.props.dispatch({
      type: 'publicFileDetailModal/updateDatas',
      payload: {
        filePreviewCurrentFileId: '',
        fileType: '',
        isInOpenFile: false,
        filePreviewCurrentName: ''
      }
    })
    this.props.dispatch({
      type: 'publicTaskDetailModal/getCardWithAttributesDetail',
      payload: {
        id: this.props.card_id
      }
    })
    this.updatePrivateVariablesWithOpenFile &&
      this.updatePrivateVariablesWithOpenFile()
    this.props.updatePrivateVariablesWithOpenFile &&
      this.props.updatePrivateVariablesWithOpenFile()
  },

  /* 附件版本更新数据  */
  whetherUpdateFolderListData: function({
    folder_id,
    file_id,
    file_name,
    create_time
  }) {
    if (file_name) {
      const { drawContent = {}, dispatch } = this.props
      const gold_data = getCurrentPropertiesData(
        drawContent['properties'],
        'ATTACHMENT'
      )
      let newData = [...gold_data]
      newData =
        newData &&
        newData.map(item => {
          if (item.file_id == this.props.filePreviewCurrentFileId) {
            let new_item = item
            new_item = {
              ...item,
              file_id: file_id,
              name: file_name,
              create_time: create_time
            }
            return new_item
          } else {
            let new_item = item
            return new_item
          }
        })
      drawContent['properties'] = filterCurrentUpdateDatasField({
        properties: drawContent['properties'],
        code: 'ATTACHMENT',
        value: newData
      })
      dispatch({
        type: 'publicTaskDetailModal/updateDatas',
        payload: {
          drawContent
        }
      })
    }
  },

  // 是否可以修改父任务中的时间
  whetherUpdateParentTaskTime: function(data) {
    const { drawContent = {}, dispatch } = this.props
    const gold_data = getCurrentPropertiesData(
      drawContent['properties'],
      'SUBTASK'
    )
    if (!gold_data) return false
    let newData = [...gold_data]
    newData = newData.find(item => item.due_time || item.start_time)
    if (newData && Object.keys(newData).length) {
      this.setState({
        is_change_parent_time: true
      })
    } else {
      this.setState({
        is_change_parent_time: false
      })
    }
    if (data) {
      if (!(data && data.length)) return
      const { start_time, id: card_id, due_time } = data[0]
      let new_drawContent = { ...drawContent }
      new_drawContent['start_time'] = start_time
      new_drawContent['due_time'] = due_time
      this.updateDrawContentWithUpdateParentListDatas({
        drawContent: new_drawContent,
        card_id,
        name: 'start_time',
        value: start_time
      })
      this.updateDrawContentWithUpdateParentListDatas({
        drawContent: new_drawContent,
        card_id,
        name: 'due_time',
        value: due_time
      })
    }
  },

  // 更新对应的依赖项
  updateRelyOnRationList: function(change_data) {
    const {
      drawContent = {},
      drawContent: { dependencies = {} },
      dispatch
    } = this.props
    if (!dependencies) return
    if (
      !(dependencies['last'] && dependencies['last'].length) &&
      !(dependencies['next'] && dependencies['next'].length)
    )
      return
    let obj = {}
    let new_drawContent = { ...drawContent }
    let preposeList = dependencies['last'] // 前置
    let postpositionList = dependencies['next'] // 后置

    preposeList = preposeList.map(item => {
      let new_item = {}
      const node = change_data.find(n => n.id == item.id) || {}
      new_item = { ...item, ...node }
      return new_item
    })
    postpositionList = postpositionList.map(item => {
      let new_item = {}
      const node = change_data.find(n => n.id == item.id) || {}
      new_item = { ...item, ...node }
      return new_item
    })
    obj = {
      ...dependencies,
      last: preposeList,
      next: postpositionList
    }
    new_drawContent['dependencies'] = obj
    dispatch({
      type: 'publicTaskDetailModal/updateDatas',
      payload: {
        drawContent: new_drawContent
      }
    })
  },

  // -------------------- 子组件逻辑 -------------------------------

  // 里程碑选择回调 S
  onMilestoneSelectedChange: function(data) {
    const { dispatch, drawContent } = this.props
    const { card_id, type, due_time } = drawContent
    const { key, type: actionType, info } = data
    const id_time_arr = key.split('__')
    const id = id_time_arr[0]
    const deadline = id_time_arr[1]
    if (!compareTwoTimestamp(deadline, due_time)) {
      message.warn('关联里程碑的截止日期不能小于任务的截止日期')
      return
    }
    if (actionType === 'add') {
      const params = {
        rela_id: card_id,
        id,
        origin_type: type
      }
      dispatch({
        type: 'publicTaskDetailModal/joinMilestone',
        payload: {
          ...params
        }
      }).then(res => {
        if (isApiResponseOk(res)) {
          drawContent['properties'] = filterCurrentUpdateDatasField({
            properties: drawContent['properties'],
            code: 'MILESTONE',
            value: info
          })
          dispatch({
            type: 'publicTaskDetailModal/updateDatas',
            payload: {
              drawContent: { ...drawContent }
            }
          })
          this.props.handleTaskDetailChange &&
            this.props.handleTaskDetailChange({
              drawContent,
              card_id,
              operate_properties_code: 'MILESTONE'
            })
        }
      })
    }
    if (actionType === 'remove') {
      const params = {
        rela_id: card_id,
        id
      }
      dispatch({
        type: 'publicTaskDetailModal/shiftOutMilestone',
        payload: {
          ...params
        }
      }).then(res => {
        if (isApiResponseOk(res)) {
          drawContent['properties'] = filterCurrentUpdateDatasField({
            properties: drawContent['properties'],
            code: 'MILESTONE',
            value: []
          })
          dispatch({
            type: 'publicTaskDetailModal/updateDatas',
            payload: {
              drawContent: { ...drawContent }
            }
          })
          this.props.handleTaskDetailChange &&
            this.props.handleTaskDetailChange({
              drawContent,
              card_id,
              operate_properties_code: 'MILESTONE'
            })
        }
      })
    }

    if (actionType === 'update') {
      // const { data } = drawContent['properties'].filter(item => item.code == 'MILESTONE')[0]
      const gold_data = getCurrentPropertiesData(
        drawContent['properties'],
        'MILESTONE'
      )
      const removeParams = {
        rela_id: card_id,
        id: gold_data.id
      }

      const addParams = {
        rela_id: card_id,
        id,
        origin_type: type
      }

      dispatch({
        type: 'publicTaskDetailModal/updateMilestone',
        payload: {
          addParams,
          removeParams
        }
      }).then(res => {
        if (isApiResponseOk(res)) {
          drawContent['properties'] = filterCurrentUpdateDatasField({
            properties: drawContent['properties'],
            code: 'MILESTONE',
            value: info
          })
          dispatch({
            type: 'publicTaskDetailModal/updateDatas',
            payload: {
              drawContent: { ...drawContent }
            }
          })
          this.props.handleTaskDetailChange &&
            this.props.handleTaskDetailChange({
              drawContent,
              card_id,
              operate_properties_code: 'MILESTONE'
            })
        }
      })
    }
  },
  // 里程碑选择回调 E

  // 编辑富文本事件 S
  saveBrafitEdit: function(brafitEditHtml) {
    const { drawContent = {}, dispatch } = this.props

    let { card_id, board_id } = drawContent
    this.setState({
      isInEdit: false
    })
    const updateObj = {
      card_id,
      board_id,
      description: brafitEditHtml
    }

    drawContent['properties'] = filterCurrentUpdateDatasField({
      properties: drawContent['properties'],
      code: 'REMARK',
      value: brafitEditHtml
    })
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
      this.updateDrawContentWithUpdateParentListDatas({
        drawContent,
        card_id,
        name: 'description',
        value: brafitEditHtml
      })
    })
  },
  // 编辑富文本事件 E

  // 控制标签的显示隐藏的回调 S
  handleVisibleChange: function(visible) {
    this.setState({
      visible: visible
    })
  },
  // 控制标签的显示隐藏的回调 E

  // 标签关闭回调 S
  handleClose: function(e) {
    this.setState({
      visible: false
    })
  },
  // // 标签关闭回调 E

  /**
   *  添加项目标签事件 S
   * @param {String} name 当前添加标签的名称
   * @param {String} color 当前添加标签的颜色
   */
  handleAddBoardTag: function({ name, color }) {
    const { drawContent = {}, dispatch } = this.props
    const { card_id, board_id } = drawContent
    let new_drawContent = { ...drawContent }
    const glod_data = (
      drawContent['properties'].find(item => item.code == 'LABEL') || {}
    ).data
    let temp = [...glod_data]
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/addBoardTag',
        payload: {
          board_id,
          name,
          color
        }
      })
    ).then(res => {
      if (isApiResponseOk(res)) {
        temp.push(res.data)
        new_drawContent['properties'] = filterCurrentUpdateDatasField({
          properties: drawContent['properties'],
          code: 'LABEL',
          value: temp
        })
        this.updateDrawContentWithUpdateParentListDatas({
          drawContent: new_drawContent,
          card_id,
          name: 'label_data',
          value: temp,
          operate_properties_code: 'LABEL'
        })
        dispatch({
          type: 'publicTaskDetailModal/addTaskTag',
          payload: {
            board_id,
            card_id,
            label_id: res.data.label_id
          }
        })
      }
    })
  },
  // 添加项目标签事件 E

  /**
   * 更新项目标签的回调 S
   * @param {String} label_id 当前需要修改的标签ID
   * @param {String} name 当前修改后的标签名称
   * @param {String} color 当前修改后的标签颜色
   */
  handleUpdateBoardTag: function({ label_id, name, color }) {
    const { drawContent = {}, dispatch } = this.props
    const { card_id, board_id } = drawContent
    const { data: label_data } = drawContent['properties'].filter(
      item => item.code == 'LABEL'
    )[0]
    let new_labelData = [...label_data]
    new_labelData = new_labelData.map(item => {
      if (item.label_id == label_id) {
        let new_item = item
        new_item = {
          ...item,
          label_name: name ? name : item.label_name,
          label_color: color
        }
        return new_item
      } else {
        let new_item = item
        return new_item
      }
    })
    let new_drawContent = { ...drawContent }
    // new_drawContent['label_data'] = new_labelData
    new_drawContent['properties'] = filterCurrentUpdateDatasField({
      properties: drawContent['properties'],
      code: 'LABEL',
      value: new_labelData
    })
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/updateBoardTag',
        payload: {
          board_id,
          id: label_id,
          color,
          name: name && name
        }
      })
    ).then(res => {
      if (isApiResponseOk(res)) {
        this.updateDrawContentWithUpdateParentListDatas({
          drawContent: new_drawContent,
          card_id,
          name: 'label_data',
          value: new_labelData,
          operate_properties_code: 'LABEL'
        })
      }
    })
  },
  // 更新项目标签的回调 E

  /**
   * 删除项目标签的回调 S
   * @param {String} label_id 当前需要删除的标签ID
   */
  handleRemoveBoardTag: function({ label_id }) {
    const { drawContent = {}, dispatch } = this.props
    const { card_id, board_id } = drawContent
    const { data: label_data } = drawContent['properties'].filter(
      item => item.code == 'LABEL'
    )[0]
    let new_labelData = [...label_data]
    new_labelData = new_labelData.filter(item => {
      if (item.label_id != label_id) {
        let new_item = item
        return new_item
      }
    })
    let new_drawContent = { ...drawContent }
    // new_drawContent['label_data'] = new_labelData
    new_drawContent['properties'] = filterCurrentUpdateDatasField({
      properties: drawContent['properties'],
      code: 'LABEL',
      value: new_labelData
    })
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/deleteBoardTag',
        payload: {
          id: label_id,
          board_id
        }
      })
    ).then(res => {
      if (isApiResponseOk(res)) {
        this.updateDrawContentWithUpdateParentListDatas({
          drawContent: new_drawContent,
          card_id,
          name: 'label_data',
          value: new_labelData,
          operate_properties_code: 'LABEL'
        })
      }
    })
  },
  // 删除项目标签的回调 E

  // 下拉标签的回调 S
  handleChgSelectedLabel: function(data) {
    const { drawContent, boardTagList = [], dispatch } = this.props
    const { board_id, card_id, label_data = [] } = drawContent
    let newLabelData = []
    const { selectedKeys = [], type, key } = data
    // 将选中的ID在标签列表中查询, 找到后push一个新的数组中保存
    for (let i = 0; i < selectedKeys.length; i++) {
      for (let j = 0; j < boardTagList.length; j++) {
        if (selectedKeys[i] === boardTagList[j]['id']) {
          let obj = {
            // 这个obj是label_data需要的数据结构
            label_id: boardTagList[j]['id'],
            label_name: boardTagList[j]['name'],
            label_color: boardTagList[j]['color']
          }
          newLabelData.push(obj)
        }
      }
    }
    let new_drawContent = { ...drawContent }
    // new_drawContent['label_data'] = newLabelData
    new_drawContent['properties'] = filterCurrentUpdateDatasField({
      properties: new_drawContent['properties'],
      code: 'LABEL',
      value: newLabelData
    })
    if (type == 'add') {
      Promise.resolve(
        dispatch({
          type: 'publicTaskDetailModal/addTaskTag',
          payload: {
            board_id,
            card_id,
            label_id: key
          }
        })
      ).then(res => {
        if (isApiResponseOk(res)) {
          this.updateDrawContentWithUpdateParentListDatas({
            drawContent: new_drawContent,
            card_id,
            name: 'label_data',
            value: newLabelData,
            operate_properties_code: 'LABEL'
          })
        }
      })
    } else if (type == 'remove') {
      Promise.resolve(
        dispatch({
          type: 'publicTaskDetailModal/removeTaskTag',
          payload: {
            card_id,
            label_id: key
          }
        })
      ).then(res => {
        if (isApiResponseOk(res)) {
          this.updateDrawContentWithUpdateParentListDatas({
            drawContent: new_drawContent,
            card_id,
            name: 'label_data',
            value: newLabelData,
            operate_properties_code: 'LABEL'
          })
        }
      })
    }
  },
  // 下拉标签的回调 E

  /**
   * 删除标签 icon 回调 S
   * @param {Object} e 当前的事件对象
   * @param {String} shouldDeleteId 当前需要删除的标签ID
   */
  handleRemoveTaskTag: function(e, shouldDeleteId) {
    e && e.stopPropagation()
    const {
      dispatch,
      drawContent,
      drawContent: { card_id }
    } = this.props
    const { data: label_data } = drawContent['properties'].filter(
      item => item.code == 'LABEL'
    )[0]
    let new_drawContent = { ...drawContent }
    let new_labelData = [...label_data]
    new_labelData = new_labelData.filter(item => {
      // 过滤掉删除的那一条item
      if (item.label_id != shouldDeleteId) {
        return item
      }
    })
    // new_drawContent['label_data'] = new_labelData
    new_drawContent['properties'] = filterCurrentUpdateDatasField({
      properties: new_drawContent['properties'],
      code: 'LABEL',
      value: new_labelData
    })
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/removeTaskTag',
        payload: {
          card_id,
          label_id: shouldDeleteId
        }
      })
    ).then(res => {
      if (isApiResponseOk(res)) {
        this.updateDrawContentWithUpdateParentListDatas({
          drawContent: new_drawContent,
          card_id,
          name: 'label_data',
          value: new_labelData,
          operate_properties_code: 'LABEL'
        })
      }
    })
  },
  // 删除标签 icon 回调 E

  // 上传文件 事件 S
  onUploadFileListChange: function(data) {
    const { drawContent = {}, dispatch } = this.props
    let new_drawContent = { ...drawContent }
    if (data && data.length > 0) {
      new_drawContent['deliverables'].push(...data)
      this.props.dispatch({
        type: 'publicTaskDetailModal/updateDatas',
        payload: {
          drawContent: new_drawContent
        }
      })
    }
    const { folder_path = {} } = data[0]
    const { id: folder_id } = folder_path
    if (typeof this.props.handleRelyUploading == 'function' && folder_id)
      this.props.handleRelyUploading({ folder_id })
  },

  // 任务说明上传
  onUploadDescFileListChange: function(data) {
    const { drawContent = {}, dispatch } = this.props
    let new_drawContent = { ...drawContent }
    if (data && data.length > 0) {
      new_drawContent['dec_files'].push(...data)
      this.props.dispatch({
        type: 'publicTaskDetailModal/updateDatas',
        payload: {
          drawContent: new_drawContent
        }
      })
    }
    const { folder_path = {} } = data[0]
    const { id: folder_id } = folder_path
    if (typeof this.props.handleRelyUploading == 'function' && folder_id)
      this.props.handleRelyUploading({ folder_id })
  },
  // 上传文件 事件 E

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

  /**附件下载、删除等操作 */
  attachmentItemOpera: function({ type, data = {}, card_id, code }, e) {
    e.stopPropagation()
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
      if (
        this.checkDiffCategoriesAuthoritiesIsVisible &&
        this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit &&
        !this.checkDiffCategoriesAuthoritiesIsVisible(
          PROJECT_TEAM_CARD_EDIT
        ).visit_control_edit()
      ) {
        message.warn('权限不足,操作未被许可', MESSAGE_DURATION_TIME)
        return false
      }
      this.deleteAttachmentFile({ attachment_id, card_id, code })
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
    if (
      this.checkDiffCategoriesAuthoritiesIsVisible &&
      this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit &&
      !this.checkDiffCategoriesAuthoritiesIsVisible(
        PROJECT_TEAM_CARD_EDIT
      ).visit_control_edit()
    ) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const { attachment_id, code } = data
    const that = this
    const { drawContent = {}, dispatch } = this.props
    const { deliverables = [] } = drawContent
    Modal.confirm({
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
              // drawContentNew['attachment_data'] = atta_arr
              if (code == 'REMARK') {
                new_drawContent['dec_files'] = new_drawContent[
                  'dec_files'
                ].filter(n => n.id != attachment_id)
              } else if (code == 'SUBTASK_DELIVERABLES') {
                new_drawContent['deliverables'] = new_drawContent[
                  'deliverables'
                ].filter(n => n.id != attachment_id)
              }
              dispatch({
                type: 'publicTaskDetailModal/updateDatas',
                payload: {
                  drawContent: new_drawContent
                }
              })
              resolve()
            }
          })
          // .catch((e) => {
          //   // console.log(e);

          //   message.warn('删除出了点问题，请重新删除。')
          //   resolve()
          // })
        })
      }
    })
  },

  /* 附件点点点字段 */
  getAttachmentActionMenus: function({ fileInfo, code, card_id }) {
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
              card_id,
              code
            })}
          >
            删除该附件
          </a>
        </Menu.Item>
      </Menu>
    )
  },

  // 删除字段的回调
  deleteCodeCalback: function(code, new_value = {}) {
    const { handleTaskDetailChange } = this.props
    const { card_id } = new_value
    switch (code) {
      case 'MILESTONE':
        handleTaskDetailChange({
          card_id,
          drawContent: { ...new_value },
          operate_properties_code: 'MILESTONE'
        })
        break
      case 'LABEL':
        handleTaskDetailChange({
          card_id,
          drawContent: { ...new_value },
          operate_properties_code: 'LABEL'
        })
        break
      case 'SUBTASK':
        handleTaskDetailChange({
          card_id,
          drawContent: { ...new_value },
          operate_properties_code: 'SUBTASK'
        })
        break
      default:
        break
    }
  }
}
export default class DepositMainComponent extends Component {
  render() {
    const {
      MainUIComponent,
      handleRelyUploading,
      handleTaskDetailChange,
      handleChildTaskChange
    } = this.props
    return (
      <MainUIComponent
        handleRelyUploading={handleRelyUploading}
        handleTaskDetailChange={handleTaskDetailChange}
        handleChildTaskChange={handleChildTaskChange}
        LogicWithMainContent={LogicWithMainContent}
      />
    )
  }
}

// 存放传入的组件容器
DepositMainComponent.defautProps = {}
