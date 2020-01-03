import React, { Component } from 'react'
import { connect } from 'dva'
import { Icon, message, Dropdown, Menu, DatePicker, Modal } from 'antd'
import mainContentStyles from './MainContent.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import NameChangeInput from '@/components/NameChangeInput'
import UploadAttachment from '@/components/UploadAttachment'
import RichTextEditor from '@/components/RichTextEditor'
import MilestoneAdd from '@/components/MilestoneAdd'
import LabelDataComponent from '@/components/LabelDataComponent'
import AppendSubTask from './components/AppendSubTask'
import PreviewFileModal from '@/routes/Technological/components/ProjectDetail/TaskItemComponent/PreviewFileModal'
import MenuSearchPartner from '@/components/MenuSearchMultiple/MenuSearchPartner.js'
import InformRemind from '@/components/InformRemind'
import DiffCategoriesAttributeComponent from './components/DiffCategoriesAttributeComponent'
import { timestampFormat, timestampToTime, compareTwoTimestamp, timeToTimestamp, timestampToTimeNormal } from '@/utils/util'
import { getSubfixName } from "@/utils/businessFunction";
import {
  MESSAGE_DURATION_TIME, NOT_HAS_PERMISION_COMFIRN, PROJECT_TEAM_CARD_COMPLETE
} from "@/globalset/js/constant";
import { isApiResponseOk } from '../../utils/handleResponseData'
import { addTaskExecutor, removeTaskExecutor, deleteTaskFile, getBoardTagList } from '../../services/technological/task'
import {
  checkIsHasPermissionInBoard, checkIsHasPermissionInVisitControl,
} from "@/utils/businessFunction";


@connect(mapStateToProps)
export default class MainContent extends Component {

  constructor(props) {
    super(props)
    this.state = {
      previewFileModalVisibile: false,
      // attributesList: props.attributesList
    }
  }

  componentDidMount() {
    const { card_id } = this.props
    if (!card_id) return false
    this.props.dispatch({
      type: 'publicTaskDetailModal/getCardDetail',
      payload: {
        id: card_id
      }
    })
    this.props.dispatch({
      type: 'publicTaskDetailModal/getCardWithAttributesDetail',
      payload: {
        id: card_id
      }
    })
    this.props.dispatch({
      type: 'publicTaskDetailModal/getCardAttributesList',
      payload: {
      }
    })
  }

  // componentWillReceiveProps(nextProps) {
  //   const { projectDetailInfoData = {} } = nextProps
  //   const { projectDetailInfoData: oldInfoData = {} } = this.props
  //   if (projectDetailInfoData.board_id != oldInfoData.board_id) {
  //     this.getInitBoardTag(projectDetailInfoData.board_id)
  //   }
  // }

  // 检测不同类型的权限控制类型的是否显示
  checkDiffCategoriesAuthoritiesIsVisible = () => {
    const { drawContent = {} } = this.props
    const { privileges = [], board_id, is_privilege, executors = [] } = drawContent
    return {
      'visit_control_edit': function () {// 是否是有编辑权限
        return checkIsHasPermissionInVisitControl('edit', privileges, is_privilege, executors, checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_COMPLETE, board_id))
      },
      'visit_control_comment': function () {
        return checkIsHasPermissionInVisitControl('comment', privileges, is_privilege, executors, checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_COMPLETE, board_id))
      },
    }
  }

  // 更新drawContent中的数据以及调用父级列表更新数据
  updateDrawContentWithUpdateParentListDatas = ({ drawContent, card_id }) => {
    const { dispatch } = this.props
    dispatch({
      type: 'publicTaskDetailModal/updateDatas',
      payload: {
        drawContent
      }
    })
    this.props.handleTaskDetailChange && this.props.handleTaskDetailChange({ drawContent, card_id })
  }

  // 设置卡片是否完成 S
  setIsCheck = () => {
    const { drawContent = {}, } = this.props
    const { is_realize = '0', card_id, board_id } = drawContent
    if ((this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit()) {
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
      this.updateDrawContentWithUpdateParentListDatas({ drawContent: new_drawContent, card_id })
    })
  }
  // 设置卡片是否完成 E

  // 设置标题textarea区域修改 S
  setTitleEdit = (e) => {
    e && e.stopPropagation();
    if ((this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit()) {
      return false
    }
    this.props.dispatch({
      type: 'publicTaskDetailModal/updateDatas',
      payload: {
        is_edit_title: true
      }
    })
  }
  // 设置标题文本内容修改 E

  // 设置标题文本失去焦点回调 S
  titleTextAreaChangeBlur = (e) => {
    let val = e.target.value
    const { dispatch, drawContent = {} } = this.props
    const { card_id } = drawContent
    drawContent['card_name'] = val
    const updateObj = {
      card_id,
      card_name: val,
      name: val
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
      dispatch({
        type: 'publicTaskDetailModal/updateDatas',
        payload: {
          is_edit_title: false,
          drawContent,
        }
      })
      // 需要调用父级的列表
      this.props.handleTaskDetailChange && this.props.handleTaskDetailChange({ drawContent, card_id })
    })
  }
  // 设置标题文本失去焦点回调 E

  // 设置是否完成状态的下拉回调 S
  handleFiledIsComplete = (e) => {
    const { dispatch, drawContent = {} } = this.props
    const { board_id, card_id, is_realize } = drawContent
    let temp_realize
    let new_drawContent = { ...drawContent }
    if (e.key == 'incomplete') { // 表示未完成
      temp_realize = '0'
      new_drawContent['is_realize'] = temp_realize
    } else if (e.key == 'complete' && is_realize != '1') { // 表示已完成
      temp_realize = '1'
      new_drawContent['is_realize'] = temp_realize
    }

    // 阻止重复点击
    if (!temp_realize) return false
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/completeTask',
        payload: {
          is_realize: temp_realize, card_id, board_id
        }
      })
    ).then(res => {
      if (!isApiResponseOk(res)) {
        message.warn(res.message, MESSAGE_DURATION_TIME)
        return
      }
      this.updateDrawContentWithUpdateParentListDatas({ drawContent: new_drawContent, card_id })
    })
  }
  // 设置是否完成状态的下拉回调 E

  // 添加执行人的回调 S
  chirldrenTaskChargeChange = (data) => {
    const { drawContent = {}, projectDetailInfoData = {}, dispatch } = this.props
    const { card_id } = drawContent

    // 多个任务执行人
    const excutorData = projectDetailInfoData['data'] //所有的人
    // const excutorData = new_userInfo_data //所有的人
    let newExecutors = []
    const { selectedKeys = [], type, key } = data
    for (let i = 0; i < selectedKeys.length; i++) {
      for (let j = 0; j < excutorData.length; j++) {
        if (selectedKeys[i] === excutorData[j]['user_id']) {
          newExecutors.push(excutorData[j])
        }
      }
    }
    let new_drawContent = { ...drawContent }
    new_drawContent['executors'] = newExecutors

    if (type == 'add') {
      addTaskExecutor({ card_id, executor: key }).then(res => {
        if (isApiResponseOk(res)) {
          message.success(`已成功设置执行人`, MESSAGE_DURATION_TIME)
          this.updateDrawContentWithUpdateParentListDatas({ drawContent: new_drawContent, card_id })
        } else {
          message.warn(res.message, MESSAGE_DURATION_TIME)
        }
      })
    } else if (type == 'remove') {
      removeTaskExecutor({ card_id, executor: key }).then(res => {
        if (isApiResponseOk(res)) {
          message.success(`已成功删除执行人`, MESSAGE_DURATION_TIME)
          this.updateDrawContentWithUpdateParentListDatas({ drawContent: new_drawContent, card_id })
        } else {
          message.warn(res.message, MESSAGE_DURATION_TIME)
        }
      })
    }
  }
  // 添加执行人的回调 E

  // 移除执行人的回调 S
  handleRemoveExecutors = (e, shouldDeleteItem) => {
    e && e.stopPropagation()
    const { drawContent = {}, dispatch } = this.props
    const { card_id, executors = [] } = drawContent
    let new_executors = [...executors]
    let new_drawContent = { ...drawContent }
    new_executors.map((item, index) => {
      if (item.user_id == shouldDeleteItem) {
        new_executors.splice(index, 1)
      }
    })
    new_drawContent['executors'] = new_executors
    removeTaskExecutor({ card_id, executor: shouldDeleteItem }).then(res => {
      if (isApiResponseOk(res)) {
        message.success(`已成功删除执行人`, MESSAGE_DURATION_TIME)
        this.updateDrawContentWithUpdateParentListDatas({ drawContent: new_drawContent, card_id })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    })
  }
  // 移除执行人的回调 E

  // 编辑富文本事件 S
  saveBrafitEdit = (brafitEditHtml) => {
    const { drawContent = {}, dispatch } = this.props;

    let { card_id } = drawContent
    this.setState({
      isInEdit: false,
    })
    const updateObj = {
      card_id,
      description: brafitEditHtml,
    }

    drawContent['description'] = brafitEditHtml;
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
      this.updateDrawContentWithUpdateParentListDatas({ drawContent, card_id })
    })
  }
  // 编辑富文本事件 E

  // 获取上传文件时, 当前操作人 S
  showMemberName = (userId) => {
    const { projectDetailInfoData = {} } = this.props
    const { data = [] } = projectDetailInfoData;
    const users = data.filter((item) => item.user_id == userId);

    if (users.length > 0) {
      return <span>{users[0].name}</span>
    }
    return;
  }
  // 获取上传文件时, 当前操作人 E

  // 上传文件 事件 S
  onUploadFileListChange = (data) => {
    let { drawContent = {}, dispatch } = this.props;
    if (data && data.length > 0) {
      drawContent['attachment_data'] = [...this.props.drawContent.attachment_data, ...data];
      dispatch({
        type: 'publicTaskDetailModal/updateDatas',
        payload: {
          drawContent: { ...drawContent }
        }
      })
    }
  }
  // 上传文件 事件 E

  // 里程碑选择回调 S
  onMilestoneSelectedChange = (data) => {
    const { dispatch, drawContent } = this.props;
    const { card_id, type, due_time } = drawContent
    const { key, type: actionType, info } = data;
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
      };
      dispatch({
        type: 'publicTaskDetailModal/joinMilestone',
        payload: {
          ...params
        }
      });

      drawContent['milestone_data'] = info;
      dispatch({
        type: 'publicTaskDetailModal/updateDatas',
        payload: {
          drawContent: { ...drawContent }
        }
      })
    }
    if (actionType === 'remove') {
      const params = {
        rela_id: card_id,
        id,
      }
      dispatch({
        type: 'publicTaskDetailModal/shiftOutMilestone',
        payload: {
          ...params
        }
      });
      drawContent['milestone_data'] = [];
      dispatch({
        type: 'publicTaskDetailModal/updateDatas',
        payload: {
          drawContent: { ...drawContent }
        }
      })
    }

    if (actionType === 'update') {
      const removeParams = {
        rela_id: card_id,
        id: drawContent['milestone_data'].id,
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
      });
      drawContent['milestone_data'] = info;
      dispatch({
        type: 'publicTaskDetailModal/updateDatas',
        payload: {
          drawContent: { ...drawContent }
        }
      })
    }
  }
  // 里程碑选择回调 E

  // 比较开始和结束时间
  compareStartDueTime = (start_time, due_time) => {
    if (!start_time || !due_time) {
      return true
    }
    const newStartTime = start_time.toString().length > 10 ? Number(start_time) / 1000 : Number(start_time)
    const newDueTime = due_time.toString().length > 10 ? Number(due_time) / 1000 : Number(due_time)
    if (newStartTime >= newDueTime) {
      return false
    }
    return true
  }

  // 禁用截止时间
  disabledDueTime = (due_time) => {
    const { drawContent = {} } = this.props
    const { start_time } = drawContent
    if (!start_time || !due_time) {
      return false;
    }
    const newStartTime = start_time.toString().length > 10 ? Number(start_time).valueOf() / 1000 : Number(start_time).valueOf()
    return Number(due_time.valueOf()) / 1000 < newStartTime;
  }

  // 禁用开始时间
  disabledStartTime = (start_time) => {
    const { drawContent = {} } = this.props
    const { due_time } = drawContent
    if (!start_time || !due_time) {
      return false;
    }
    const newDueTime = due_time.toString().length > 10 ? Number(due_time).valueOf() / 1000 : Number(due_time).valueOf()
    return Number(start_time.valueOf()) / 1000 >= newDueTime//Number(due_time).valueOf();
  }

  // 开始时间 chg事件 S
  startDatePickerChange(timeString) {
    const { drawContent = {}, dispatch } = this.props
    const start_timeStamp = timeToTimestamp(timeString)
    const { card_id, due_time } = drawContent
    const updateObj = {
      card_id, start_time: start_timeStamp
    }
    if (!this.compareStartDueTime(start_timeStamp, due_time)) {
      message.warn('开始时间不能大于结束时间')
      return false
    }
    let new_drawContent = { ...drawContent }
    new_drawContent['start_time'] = start_timeStamp
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
      this.updateDrawContentWithUpdateParentListDatas({ drawContent: new_drawContent, card_id })
    })
  }
  // 开始时间 chg事件 E

  // 截止时间 chg事件 S
  endDatePickerChange(timeString) {
    const { drawContent = {}, milestoneList = [], dispatch } = this.props
    const { card_id, start_time, milestone_data = {} } = drawContent
    const { deadline } = milestone_data
    // const milestone_deadline = (milestoneList.find((item => item.id == milestone_data.id)) || {}).deadline//关联里程碑的时间
    const due_timeStamp = timeToTimestamp(timeString)
    const updateObj = {
      card_id, due_time: due_timeStamp
    }
    if (!this.compareStartDueTime(start_time, due_timeStamp)) {
      message.warn('开始时间不能大于结束时间')
      return false
    }
    if (!compareTwoTimestamp(deadline, due_timeStamp)) {
      message.warn('任务的截止日期不能大于关联里程碑的截止日期')
      return
    }
    let new_drawContent = { ...drawContent }
    new_drawContent['due_time'] = due_timeStamp
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
      this.updateDrawContentWithUpdateParentListDatas({ drawContent: new_drawContent, card_id })
    })
  }
  // 截止时间 chg事件 E

  // 删除开始时间 S
  handleDelStartTime = (e) => {
    e && e.stopPropagation()
    const { dispatch, drawContent = {} } = this.props
    const { card_id, start_time } = drawContent
    const updateObj = {
      card_id, start_time: '0'
    }
    let new_drawContent = { ...drawContent }
    new_drawContent['start_time'] = null
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
      this.updateDrawContentWithUpdateParentListDatas({ drawContent: new_drawContent, card_id })
    })

  }
  // 删除开始时间 E

  // 删除结束时间 S
  handleDelDueTime = (e) => {
    e && e.stopPropagation()
    const { dispatch, drawContent = {} } = this.props
    const { card_id, due_time } = drawContent
    const updateObj = {
      card_id, due_time: '0'
    }
    let new_drawContent = { ...drawContent }
    new_drawContent['due_time'] = null
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
      this.updateDrawContentWithUpdateParentListDatas({ drawContent: new_drawContent, card_id })
    })

  }
  // 删除结束时间 E

  // 会议的状态值, 比较当前时间和开始时间结束时间的对比 S
  getMeetingStatus = () => {
    let meetingField
    meetingField = (<span></span>)
    const { drawContent = {} } = this.props
    const { start_time, due_time, type } = drawContent
    if (type == '0' || !start_time || !due_time) return
    let timeString
    timeString = new Date().getTime().toString()
    if (timeString.length == 13) { // 表示是13位的时间戳
      timeString = parseInt(timeString / 1000)
    }
    if (compareTwoTimestamp(timeString, start_time)) { // 如果说当前时间大于开始时间表示进行中
      meetingField = (
        <span style={{ display: 'inline-block', width: '58px', height: '26px', background: '#FFE7BA', borderRadius: '4px', lineHeight: '26px', textAlign: 'center', color: '#FA8C16' }}>{'进行中'}</span>
      )
      if (compareTwoTimestamp(timeString, due_time)) { // 如果说当前时间大于截止时间表示已完成
        meetingField = (
          <span style={{ display: 'inline-block', width: '58px', height: '26px', background: '#D0EFB4', borderRadius: '4px', lineHeight: '26px', textAlign: 'center', color: '#389E0D' }}>{'已完成'}</span>
        )
      }
    } else { // 表示未开始
      meetingField = (
        <span style={{ display: 'inline-block', width: '58px', height: '26px', background: '#D4F1FF', borderRadius: '4px', lineHeight: '26px', textAlign: 'center', color: '#1890FF' }}>{'未开始'}</span>
      )
    }
    return meetingField
  }
  // 会议的状态值, 比较当前时间和开始时间结束时间的对比 E

  // 控制标签的显示隐藏的回调 S
  handleVisibleChange = (visible) => {
    this.setState({
      visible: visible
    })
  }
  // 控制标签的显示隐藏的回调 E

  // 标签关闭回调 S
  handleClose = (e) => {
    this.setState({
      visible: false,
    })
  }
  // // 标签关闭回调 E

  /**
   *  添加项目标签事件 S
   * @param {String} name 当前添加标签的名称
   * @param {String} color 当前添加标签的颜色
   */
  handleAddBoardTag = ({ name, color }) => {
    const { drawContent = {}, dispatch } = this.props
    const { card_id, board_id } = drawContent
    let new_drawContent = { ...drawContent }
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/addBoardTag',
        payload: {
          board_id, name, color
        }
      })
    ).then(res => {
      if (isApiResponseOk(res)) {
        new_drawContent['label_data'].push(res.data)
        this.updateDrawContentWithUpdateParentListDatas({ drawContent: new_drawContent, card_id })
      }
    })
  }
  // 添加项目标签事件 E

  /**
   * 更新项目标签的回调 S
   * @param {String} label_id 当前需要修改的标签ID
   * @param {String} name 当前修改后的标签名称
   * @param {String} color 当前修改后的标签颜色
   */
  handleUpdateBoardTag = ({ label_id, name, color }) => {
    const { drawContent = {}, dispatch } = this.props
    const { card_id, board_id, label_data = [] } = drawContent
    let new_labelData = [...label_data]
    new_labelData = new_labelData.map(item => {
      if (item.label_id == label_id) {
        let new_item = item
        new_item = { ...item, label_name: name ? name : item.label_name, label_color: color }
        return new_item
      } else {
        let new_item = item
        return new_item
      }
    })
    let new_drawContent = { ...drawContent }
    new_drawContent['label_data'] = new_labelData
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/updateBoardTag',
        payload: {
          board_id, id: label_id, color, name: name && name
        }
      })
    ).then(res => {
      if (isApiResponseOk(res)) {
        this.updateDrawContentWithUpdateParentListDatas({ drawContent: new_drawContent, card_id })
      }
    })
  }
  // 更新项目标签的回调 E

  /**
   * 删除项目标签的回调 S
   * @param {String} label_id 当前需要删除的标签ID
   */
  handleRemoveBoardTag = ({ label_id }) => {
    const { drawContent = {}, dispatch } = this.props
    const { card_id, board_id, label_data = [] } = drawContent
    let new_labelData = [...label_data]
    new_labelData = new_labelData.filter(item => {
      if (item.label_id != label_id) {
        let new_item = item
        return new_item
      }
    })
    let new_drawContent = { ...drawContent }
    new_drawContent['label_data'] = new_labelData
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/deleteBoardTag',
        payload: {
          id: label_id
        }
      })
    ).then(res => {
      if (isApiResponseOk(res)) {
        this.updateDrawContentWithUpdateParentListDatas({ drawContent: new_drawContent, card_id })
      }
    })
  }
  // 删除项目标签的回调 E

  // 下拉标签的回调 S
  handleChgSelectedLabel = (data) => {
    const { drawContent, boardTagList = [], dispatch } = this.props
    const { board_id, card_id, label_data = [] } = drawContent
    let newLabelData = []
    const { selectedKeys = [], type, key } = data
    // 将选中的ID在标签列表中查询, 找到后push一个新的数组中保存
    for (let i = 0; i < selectedKeys.length; i++) {
      for (let j = 0; j < boardTagList.length; j++) {
        if (selectedKeys[i] === boardTagList[j]['id']) {
          let obj = {// 这个obj是label_data需要的数据结构
            label_id: boardTagList[j]['id'],
            label_name: boardTagList[j]['name'],
            label_color: boardTagList[j]['color']
          }
          newLabelData.push(obj)
        }
      }
    }
    let new_drawContent = { ...drawContent }
    new_drawContent['label_data'] = newLabelData
    if (type == 'add') {
      Promise.resolve(
        dispatch({
          type: 'publicTaskDetailModal/addTaskTag',
          payload: {
            board_id, card_id, label_id: key
          }
        })
      ).then(res => {
        if (isApiResponseOk(res)) {
          this.updateDrawContentWithUpdateParentListDatas({ drawContent: new_drawContent, card_id })
        }
      })
    } else if (type == 'remove') {
      Promise.resolve(
        dispatch({
          type: 'publicTaskDetailModal/removeTaskTag',
          payload: {
            card_id, label_id: key
          }
        })
      ).then(res => {
        if (isApiResponseOk(res)) {
          this.updateDrawContentWithUpdateParentListDatas({ drawContent: new_drawContent, card_id })
        }
      })
    }
  }
  // 下拉标签的回调 E

  /**
   * 删除标签 icon 回调 S
   * @param {Object} e 当前的事件对象
   * @param {String} shouldDeleteId 当前需要删除的标签ID
   */
  handleRemoveTaskTag = (e, shouldDeleteId) => {
    e && e.stopPropagation()
    const { dispatch, drawContent, drawContent: { label_data = [], card_id } } = this.props
    let new_drawContent = { ...drawContent }
    let new_labelData = [...label_data]
    new_labelData = new_labelData.filter(item => {// 过滤掉删除的那一条item
      if (item.label_id != shouldDeleteId) {
        return item
      }
    })
    new_drawContent['label_data'] = new_labelData
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/removeTaskTag',
        payload: {
          card_id, label_id: shouldDeleteId
        }
      })
    ).then(res => {
      if (isApiResponseOk(res)) {
        this.updateDrawContentWithUpdateParentListDatas({ drawContent: new_drawContent, card_id })
      }
    })
  }
  // 删除标签 icon 回调 E

  /**附件预览 */
  openFileDetailModal = (fileInfo) => {
    const file_name = fileInfo.name
    const file_resource_id = fileInfo.file_resource_id
    const file_id = fileInfo.file_id;
    const { dispatch } = this.props
    dispatch({
      type: 'projectDetailFile/updateDatas',
      payload: {
        isInOpenFile: true,
        seeFileInput: 'taskModule',
        filePreviewCurrentId: file_resource_id,
        filePreviewCurrentFileId: file_id,
        pdfDownLoadSrc: '',
      }
    })

    if (getSubfixName(file_name) == '.pdf') {
      dispatch({
        type: 'projectDetailFile/getFilePDFInfo',
        payload: {
          id: file_id
        }
      })
    } else {
      dispatch({
        type: 'projectDetailFile/filePreview',
        payload: {
          file_id
        }
      })
      dispatch({
        type: 'projectDetailFile/fileInfoByUrl',
        payload: {
          file_id
        }
      })
    }

  }
  /**附件下载、删除等操作 */
  attachmentItemOpera({ type, data = {}, card_id }, e) {
    e.stopPropagation()
    if ((this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit()) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    //debugger
    const { dispatch } = this.props
    const attachment_id = data.id || (data.response && data.response.data && data.response.data.attachment_id)
    const file_resource_id = data.file_resource_id || (data.response && data.response.data.file_resource_id)
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
          card_id
        }
      })
    }
  }
  /**附件删除 */
  deleteAttachmentFile(data) {
    if ((this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit()) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const { attachment_id } = data;
    const that = this
    const { drawContent = {}, dispatch } = this.props

    Modal.confirm({
      title: `确认要删除这个附件吗？`,
      zIndex: 1007,
      content: <div style={{ color: 'rgba(0,0,0, .8)', fontSize: 14 }}>
        <span >删除后不可恢复</span>
      </div>,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        return new Promise((resolve) => {
          deleteTaskFile(data).then((value) => {

            if (value.code !== '0') {
              message.warn('删除失败，请重新删除。1')
              resolve()
            } else {
              let atta_arr = drawContent['attachment_data'];
              for (let i = 0; i < atta_arr.length; i++) {
                if (attachment_id == atta_arr[i]['id'] || (atta_arr[i].response && atta_arr[i].response.data && atta_arr[i].response.data.attachment_id == attachment_id)) {
                  atta_arr.splice(i, 1)
                }
              }
              that.setState({
                attachment_fileList: atta_arr
              })
              const drawContentNew = { ...drawContent }
              drawContentNew['attachment_data'] = atta_arr
              dispatch({
                type: 'projectDetailTask/updateDatas',
                payload: {
                  drawContent: drawContentNew
                }
              })
              resolve()
            }
          }).catch((e) => {
            // console.log(e);

            message.warn('删除出了点问题，请重新删除。')
            resolve()
          })
        })

      }
    });
  }


  setPreviewFileModalVisibile() {
    this.setState({
      previewFileModalVisibile: !this.state.previewFileModalVisibile
    })
  }

  getAttachmentActionMenus = (fileInfo, card_id) => {
    return (
      <Menu>
        <Menu.Item>
          <a onClick={this.attachmentItemOpera.bind(this, { type: 'download', data: fileInfo, card_id })}>
            下载到本地
        </a>
        </Menu.Item>
        <Menu.Item>
          <a onClick={this.attachmentItemOpera.bind(this, { type: 'remove', data: fileInfo, card_id })}>
            删除该附件
        </a>
        </Menu.Item>
      </Menu>
    );
  }

  // 属性选择的下拉回调 S
  handleMenuReallySelect = (e) => {
    const { dispatch, card_id, attributesList = [] } = this.props
    const { key } = e
    let new_attributesList = [...attributesList]
    new_attributesList = new_attributesList.filter(item => {
      if (item.id != e.key) {
        return item
      }
    })
    console.log(new_attributesList, 'sssss_new')
    Promise.resolve(
      dispatch({
        type: 'publicTaskDetailModal/setCardAttributes',
        payload: {
          card_id, property_id: key
        }
      })
    ).then(res => {
      if (isApiResponseOk(res)) {
        dispatch({
          type: 'publicTaskDetailModal/updateDatas',
          payload: {
            attributesList: new_attributesList
          }
        })
      }
    })
  }
  // 属性选择的下拉回调 E

  // 获取对应字段的Icon
  getCurrentFieldIcon = (value) => {
    const { code } = value
    let messageValue = (<span></span>)
    switch (code) {
      case 'EXECUTOR':// 表示是负责人
        messageValue = (
          <sapn>&#xe7b2;</sapn>
        )
        break;
      case 'MILESTONE':// 表示是里程碑
        messageValue = (
          <sapn>&#xe6b7;</sapn>
        )
        break;
      case 'REMARK':// 表示是备注
        messageValue = (
          <sapn>&#xe7f6;</sapn>
        )
        break;
      case 'LABEL':// 标签
        messageValue = (
          <sapn>&#xe6b8;</sapn>
        )
        break;
      case 'ATTACHMENT':// 表示是上传附件
        messageValue = (
          <sapn>&#xe6b9;</sapn>
        )
        break;
      case 'SUBTASK':// 表示是子任务
        messageValue = (
          <sapn>&#xe7f5;</sapn>
        )
        break;
      case 'CONTENTLINK':// 表示是关联内容
        messageValue = (
          <sapn>&#xe6ba;</sapn>
        )
        break;
      default:
        break;
    }
    return messageValue
  }

  // 获取添加属性中的不同字段
  getDiffAttributies = () => {
    // const { attributesList = [] } = this.state
    const { attributesList = [] } = this.props
    return (
      <div>
        <div className={mainContentStyles.attrWrapper}>
          <Menu style={{ padding: '8px 0px', boxShadow: '0px 2px 8px 0px rgba(0,0,0,0.15)', maxWidth: '248px' }}
            // onDeselect={this.handleMenuReallyDeselect.bind(this)}
            onSelect={this.handleMenuReallySelect.bind(this)}
          >
            {
              attributesList.map(item => (
                <Menu.Item key={item.id}>
                  <span className={`${globalStyles.authTheme} ${mainContentStyles.attr_icon}`}>{this.getCurrentFieldIcon(item)}</span>
                  <sapn className={mainContentStyles.attr_name}>{item.name}</sapn>
                </Menu.Item>
              ))
            }
          </Menu>
        </div>
      </div>
    )
  }

  filterDiffPropertiesField = (currentItem) => {
    const { currentDrawerContent = {}, projectDetailInfoData } = this.props
    const { card_id, board_id } = currentDrawerContent
    const { code, data } = currentItem
    let messageValue = (<div></div>)
    switch (code) {
      case 'EXECUTOR':
        messageValue = (
          <div>
            <div style={{ position: 'relative' }} className={mainContentStyles.field_content}>
              <div className={mainContentStyles.field_left}>
                <span style={{ fontSize: '16px', color: 'rgba(0,0,0,0.45)' }} className={globalStyles.authTheme}>&#xe7b2;</span>
                <span className={mainContentStyles.user_executor}>负责人</span>
              </div>
              {
                (this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit() ? (
                  (
                    !data.length ? (
                      <div className={`${mainContentStyles.field_right}`}>
                        <div className={`${mainContentStyles.pub_hover}`}>
                          <span>暂无</span>
                        </div>
                      </div>
                    ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap' }} className={`${mainContentStyles.field_right} ${mainContentStyles.pub_hover}`}>
                          {data.map((value) => {
                            const { avatar, name, user_name, user_id } = value
                            return (
                              <div className={`${mainContentStyles.first_pric}`} style={{ display: 'flex', flexWrap: 'wrap', marginLeft: '-12px' }} key={user_id}>
                                <div className={`${mainContentStyles.user_item}`} style={{ display: 'flex', alignItems: 'center', position: 'relative', margin: '2px 10px', textAlign: 'center' }} key={user_id}>
                                  {avatar ? (
                                    <img style={{ width: '24px', height: '24px', borderRadius: 20, margin: '0 2px' }} src={avatar} />
                                  ) : (
                                      <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#f5f5f5', margin: '0 2px' }}>
                                        <Icon type={'user'} style={{ fontSize: 12, color: '#8c8c8c' }} />
                                      </div>
                                    )}
                                  <div style={{ marginRight: 8, fontSize: '14px' }} className={mainContentStyles.value_text}>{name || user_name || '佚名'}</div>
                                  {/* <span onClick={(e) => { this.handleRemoveExecutors(e, user_id) }} className={`${mainContentStyles.userItemDeleBtn}`}></span> */}
                                </div>

                              </div>
                            )
                          })}
                        </div>
                      )
                  )
                ) : (
                    <span style={{ flex: '1' }}>
                      {
                        !data.length ? (
                          <div style={{ flex: '1', position: 'relative' }}>
                            <Dropdown trigger={['click']} overlayClassName={mainContentStyles.overlay_pricipal} getPopupContainer={triggerNode => triggerNode.parentNode}
                              overlay={
                                <MenuSearchPartner
                                  // handleSelectedAllBtn={this.handleSelectedAllBtn}
                                  invitationOrg={currentDrawerContent.org_id}
                                  invitationType='4'
                                  invitationId={card_id}
                                  listData={projectDetailInfoData.data} keyCode={'user_id'} searchName={'name'} currentSelect={data} chirldrenTaskChargeChange={this.chirldrenTaskChargeChange}
                                  board_id={board_id} />
                              }
                            >
                              <div className={`${mainContentStyles.field_right}`}>
                                <div className={`${mainContentStyles.pub_hover}`}>
                                  <span>指派负责人</span>
                                </div>
                              </div>
                            </Dropdown>
                          </div>
                        ) : (
                            <div style={{ flex: '1', position: 'relative' }}>
                              <Dropdown trigger={['click']} overlayClassName={mainContentStyles.overlay_pricipal} getPopupContainer={triggerNode => triggerNode.parentNode}
                                overlay={
                                  <MenuSearchPartner
                                    // handleSelectedAllBtn={this.handleSelectedAllBtn}
                                    invitationOrg={currentDrawerContent.org_id}
                                    invitationType='4'
                                    invitationId={card_id}
                                    listData={projectDetailInfoData.data} keyCode={'user_id'} searchName={'name'} currentSelect={data} chirldrenTaskChargeChange={this.chirldrenTaskChargeChange}
                                    board_id={board_id} />
                                }
                              >
                                <div style={{ display: 'flex', flexWrap: 'wrap' }} className={`${mainContentStyles.field_right} ${mainContentStyles.pub_hover}`}>
                                  {data.map((value) => {
                                    const { avatar, name, user_name, user_id } = value
                                    return (
                                      <div className={`${mainContentStyles.first_pric}`} style={{ display: 'flex', flexWrap: 'wrap', marginLeft: '-12px' }} key={user_id}>
                                        <div className={`${mainContentStyles.user_item}`} style={{ display: 'flex', alignItems: 'center', position: 'relative', margin: '2px 10px', textAlign: 'center' }} key={user_id}>
                                          {avatar ? (
                                            <img style={{ width: '24px', height: '24px', borderRadius: 20, margin: '0 2px' }} src={avatar} />
                                          ) : (
                                              <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#f5f5f5', margin: '0 2px' }}>
                                                <Icon type={'user'} style={{ fontSize: 12, color: '#8c8c8c' }} />
                                              </div>
                                            )}
                                          <div style={{ marginRight: 8, fontSize: '14px' }} className={mainContentStyles.value_text}>{name || user_name || '佚名'}</div>
                                          <span onClick={(e) => { this.handleRemoveExecutors(e, user_id) }} className={`${mainContentStyles.userItemDeleBtn}`}></span>
                                        </div>

                                      </div>
                                    )
                                  })}
                                </div>
                              </Dropdown>
                            </div>
                          )
                      }
                    </span>
                  )
              }


            </div>
          </div>
        )
        break;

      default:
        break;
    }
    return messageValue
  }

  render() {
    const { drawContent = {}, currentDrawerContent = {}, attributesList = [], is_edit_title, projectDetailInfoData = {}, dispatch, handleTaskDetailChange, isInOpenFile, boardTagList = [] } = this.props
    const { new_userInfo_data = [], visible = false } = this.state
    const { data = [] } = projectDetailInfoData
    const {
      org_id,
      board_id,
      board_name,
      card_id,
      card_name,
      type = '0',
      is_realize = '0',
      start_time,
      due_time,
      executors = [],
      description,
      milestone_data,
      label_data = []
    } = drawContent
    const { properties = [] } = currentDrawerContent

    // 状态
    const filedEdit = (
      <Menu onClick={this.handleFiledIsComplete} getPopupContainer={triggerNode => triggerNode.parentNode} selectedKeys={is_realize == '0' ? ['incomplete'] : ['complete']}>
        <Menu.Item key="incomplete">
          <span>未完成</span>
          <div style={{ display: is_realize == '0' ? 'block' : 'none' }}>
            <Icon type="check" />
          </div>
        </Menu.Item>
        <Menu.Item key="complete">
          <span>已完成</span>
          {/* display: selectedKeys.indexOf(user_id) != -1 ? 'block' : 'none' */}
          <div style={{ display: is_realize == '0' ? 'none' : 'block' }}>
            <Icon type="check" />
          </div>
        </Menu.Item>

      </Menu>
    )

    return (
      <div className={mainContentStyles.main_wrap}>
        <div className={mainContentStyles.main_content}>
          {/* 标题 S */}
          <div>
            <div className={mainContentStyles.title_content}>
              <div className={mainContentStyles.title_icon}>
                {
                  type == '0' ? (
                    <div style={{ cursor: 'pointer', }} onClick={this.setIsCheck} className={is_realize == '1' ? mainContentStyles.nomalCheckBoxActive : mainContentStyles.nomalCheckBox}>
                      <Icon type="check" style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }} />
                    </div>
                  ) : (
                      <div style={{ width: 20, height: 20, color: '#595959', cursor: 'pointer' }}>
                        <i style={{ fontSize: '20px' }} className={globalStyles.authTheme}>&#xe84d;</i>
                      </div>
                    )
                }
              </div>
              {
                !is_edit_title ? (
                  <div onClick={this.setTitleEdit} className={`${mainContentStyles.card_name} ${mainContentStyles.pub_hover}`}>
                    <span style={{ wordBreak: 'break-all' }}>{card_name}</span>
                  </div>
                ) : (
                    <NameChangeInput
                      autosize
                      onBlur={this.titleTextAreaChangeBlur}
                      onClick={this.setTitleEdit}
                      setIsEdit={this.setTitleEdit}
                      autoFocus={true}
                      goldName={card_name}
                      maxLength={101}
                      nodeName={'textarea'}
                      style={{ display: 'block', fontSize: 20, color: '#262626', resize: 'none', height: '44px', background: 'rgba(255,255,255,1)', boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.15)', borderRadius: '4px', border: 'none' }}
                    />
                  )
              }
            </div>
          </div>
          {/* 标题 E */}

          {/* 各种字段的不同状态 S */}
          <div>
            {/* 状态区域 */}
            <div>
              <div style={{ position: 'relative' }} className={mainContentStyles.field_content}>
                <div className={mainContentStyles.field_left}>
                  <span className={`${globalStyles.authTheme}`}>&#xe6b6;</span>
                  <span>状态</span>
                </div>
                {
                  type == '0' ? (
                    <>
                      {
                        (this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit() ? (
                          <div className={`${mainContentStyles.field_right}`}>
                            <div className={`${mainContentStyles.pub_hover}`}>
                              <span className={is_realize == '0' ? mainContentStyles.incomplete : mainContentStyles.complete}>{is_realize == '0' ? '未完成' : '已完成'}</span>
                            </div>
                          </div>
                        ) : (
                            <Dropdown trigger={['click']} overlayClassName={mainContentStyles.overlay_item} overlay={filedEdit} getPopupContainer={triggerNode => triggerNode.parentNode}>
                              <div className={`${mainContentStyles.field_right}`}>
                                <div className={`${mainContentStyles.pub_hover}`}>
                                  <span className={is_realize == '0' ? mainContentStyles.incomplete : mainContentStyles.complete}>{is_realize == '0' ? '未完成' : '已完成'}</span>
                                </div>
                              </div>
                            </Dropdown>
                          )
                      }
                    </>
                  ) : (
                      <div className={`${mainContentStyles.field_right}`}>
                        <div className={`${mainContentStyles.pub_hover}`}>
                          {
                            this.getMeetingStatus && this.getMeetingStatus()
                          }
                          {/* <span className={mainContentStyles.incomplete}>{'未完成'}</span> */}
                        </div>
                      </div>
                    )
                }

              </div>
            </div>
            {/* 这个中间放置负责人, 如果存在, 则在两者之间 */}
            <div>
              <div style={{ position: 'relative' }} className={mainContentStyles.field_content}>
                <div className={mainContentStyles.field_left}>
                  <span style={{ fontSize: '16px', color: 'rgba(0,0,0,0.45)' }} className={globalStyles.authTheme}>&#xe7b2;</span>
                  <span className={mainContentStyles.user_executor}>负责人</span>
                </div>
                {
                  (this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit() ? (
                    (
                      !executors.length ? (
                        <div className={`${mainContentStyles.field_right}`}>
                          <div className={`${mainContentStyles.pub_hover}`}>
                            <span>暂无</span>
                          </div>
                        </div>
                      ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap' }} className={`${mainContentStyles.field_right} ${mainContentStyles.pub_hover}`}>
                            {executors.map((value) => {
                              const { avatar, name, user_name, user_id } = value
                              return (
                                <div className={`${mainContentStyles.first_pric}`} style={{ display: 'flex', flexWrap: 'wrap', marginLeft: '-12px' }} key={user_id}>
                                  <div className={`${mainContentStyles.user_item}`} style={{ display: 'flex', alignItems: 'center', position: 'relative', margin: '2px 10px', textAlign: 'center' }} key={user_id}>
                                    {avatar ? (
                                      <img style={{ width: '24px', height: '24px', borderRadius: 20, margin: '0 2px' }} src={avatar} />
                                    ) : (
                                        <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#f5f5f5', margin: '0 2px' }}>
                                          <Icon type={'user'} style={{ fontSize: 12, color: '#8c8c8c' }} />
                                        </div>
                                      )}
                                    <div style={{ marginRight: 8, fontSize: '14px' }} className={mainContentStyles.value_text}>{name || user_name || '佚名'}</div>
                                    {/* <span onClick={(e) => { this.handleRemoveExecutors(e, user_id) }} className={`${mainContentStyles.userItemDeleBtn}`}></span> */}
                                  </div>

                                </div>
                              )
                            })}
                          </div>
                        )
                    )
                  ) : (
                      <span style={{ flex: '1' }}>
                        {
                          !executors.length ? (
                            <div style={{ flex: '1', position: 'relative' }}>
                              <Dropdown trigger={['click']} overlayClassName={mainContentStyles.overlay_pricipal} getPopupContainer={triggerNode => triggerNode.parentNode}
                                overlay={
                                  <MenuSearchPartner
                                    // handleSelectedAllBtn={this.handleSelectedAllBtn}
                                    invitationOrg={drawContent.org_id}
                                    invitationType='4'
                                    invitationId={card_id}
                                    listData={data} keyCode={'user_id'} searchName={'name'} currentSelect={executors} chirldrenTaskChargeChange={this.chirldrenTaskChargeChange}
                                    board_id={board_id} />
                                }
                              >
                                <div className={`${mainContentStyles.field_right}`}>
                                  <div className={`${mainContentStyles.pub_hover}`}>
                                    <span>指派负责人</span>
                                  </div>
                                </div>
                              </Dropdown>
                            </div>
                          ) : (
                              <div style={{ flex: '1', position: 'relative' }}>
                                <Dropdown trigger={['click']} overlayClassName={mainContentStyles.overlay_pricipal} getPopupContainer={triggerNode => triggerNode.parentNode}
                                  overlay={
                                    <MenuSearchPartner
                                      // handleSelectedAllBtn={this.handleSelectedAllBtn}
                                      invitationOrg={drawContent.org_id}
                                      invitationType='4'
                                      invitationId={card_id}
                                      listData={data} keyCode={'user_id'} searchName={'name'} currentSelect={executors} chirldrenTaskChargeChange={this.chirldrenTaskChargeChange}
                                      board_id={board_id} />
                                  }
                                >
                                  <div style={{ display: 'flex', flexWrap: 'wrap' }} className={`${mainContentStyles.field_right} ${mainContentStyles.pub_hover}`}>
                                    {executors.map((value) => {
                                      const { avatar, name, user_name, user_id } = value
                                      return (
                                        <div className={`${mainContentStyles.first_pric}`} style={{ display: 'flex', flexWrap: 'wrap', marginLeft: '-12px' }} key={user_id}>
                                          <div className={`${mainContentStyles.user_item}`} style={{ display: 'flex', alignItems: 'center', position: 'relative', margin: '2px 10px', textAlign: 'center' }} key={user_id}>
                                            {avatar ? (
                                              <img style={{ width: '24px', height: '24px', borderRadius: 20, margin: '0 2px' }} src={avatar} />
                                            ) : (
                                                <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#f5f5f5', margin: '0 2px' }}>
                                                  <Icon type={'user'} style={{ fontSize: 12, color: '#8c8c8c' }} />
                                                </div>
                                              )}
                                            <div style={{ marginRight: 8, fontSize: '14px' }} className={mainContentStyles.value_text}>{name || user_name || '佚名'}</div>
                                            <span onClick={(e) => { this.handleRemoveExecutors(e, user_id) }} className={`${mainContentStyles.userItemDeleBtn}`}></span>
                                          </div>

                                        </div>
                                      )
                                    })}
                                  </div>
                                </Dropdown>
                              </div>
                            )
                        }
                      </span>
                    )
                }


              </div>
            </div>
            {/* 时间区域 */}
            <div>
              <div className={mainContentStyles.field_content}>
                <div className={mainContentStyles.field_left}>
                  <span className={globalStyles.authTheme}>&#xe686;</span>
                  <span>时间</span>
                </div>
                <div className={`${mainContentStyles.field_right}`}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ position: 'relative' }}>
                      {/* 开始时间 */}
                      {
                        (this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit() ? (
                          (
                            <div className={`${mainContentStyles.start_time}`}>
                              <span style={{ position: 'relative', zIndex: 0, minWidth: '80px', lineHeight: '38px', padding: '0 12px', display: 'inline-block', textAlign: 'center' }}>
                                {start_time ? <span className={mainContentStyles.value_text}>{timestampToTime(start_time, true)}</span> : '暂无'}
                              </span>
                            </div>
                          )
                        ) : (
                            <div className={`${mainContentStyles.start_time}`}>
                              <span style={{ position: 'relative', zIndex: 0, minWidth: '80px', lineHeight: '38px', padding: '0 12px', display: 'inline-block', textAlign: 'center' }}>
                                {start_time ? <span className={mainContentStyles.value_text}>{timestampToTime(start_time, true)}</span> : '开始时间'}
                                <DatePicker
                                  disabledDate={this.disabledStartTime.bind(this)}
                                  // onOk={this.startDatePickerChange.bind(this)}
                                  onChange={this.startDatePickerChange.bind(this)}
                                  // getCalendarContainer={triggerNode => triggerNode.parentNode}
                                  placeholder={start_time ? timestampToTimeNormal(start_time, '/', true) : '开始时间'}
                                  format="YYYY/MM/DD HH:mm"
                                  showTime={{ format: 'HH:mm' }}
                                  style={{ opacity: 0, background: '#000000', position: 'absolute', left: 0, width: 'auto' }} />
                              </span>
                              <span onClick={this.handleDelStartTime} className={`${mainContentStyles.userItemDeleBtn} ${start_time && mainContentStyles.timeDeleBtn}`}></span>
                            </div>
                          )
                      }
                      &nbsp;
                      <span style={{ color: '#bfbfbf' }}> ~ </span>
                      &nbsp;
                      {/* 截止时间 */}
                      {
                        (this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit() ? (
                          (
                            <div className={`${mainContentStyles.due_time}`}>
                              <span style={{ position: 'relative', zIndex: 0, minWidth: '80px', lineHeight: '38px', padding: '0 12px', display: 'inline-block', textAlign: 'center' }}>
                                {due_time ? <span className={mainContentStyles.value_text}>{timestampToTime(due_time, true)}</span> : '暂无'}
                              </span>
                            </div>
                          )
                        ) : (
                            <div className={`${mainContentStyles.due_time}`}>
                              <span style={{ position: 'relative', minWidth: '80px', lineHeight: '38px', padding: '0 12px', display: 'inline-block', textAlign: 'center' }}>
                                {due_time ? <span className={mainContentStyles.value_text}>{timestampToTime(due_time, true)}</span> : '截止时间'}
                                <DatePicker
                                  disabledDate={this.disabledDueTime.bind(this)}
                                  // getCalendarContainer={triggerNode => triggerNode.parentNode}
                                  placeholder={due_time ? timestampToTimeNormal(due_time, '/', true) : '截止时间'}
                                  format="YYYY/MM/DD HH:mm"
                                  showTime={{ format: 'HH:mm' }}
                                  // onOk={this.endDatePickerChange.bind(this)}
                                  onChange={this.endDatePickerChange.bind(this)}
                                  style={{ opacity: 0, background: '#000000', position: 'absolute', left: 0, width: 'auto' }} />
                              </span>
                              <span onClick={this.handleDelDueTime} className={`${mainContentStyles.userItemDeleBtn} ${due_time && mainContentStyles.timeDeleBtn}`}></span>
                            </div>
                          )
                      }
                    </div>
                    {/* 通知提醒 */}
                    {
                      (this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit() ? (
                        ''
                      ) : (
                          <span style={{ position: 'relative' }}>
                            <InformRemind commonExecutors={executors} style={{ display: 'inline-block', minWidth: '72px', height: '38px', borderRadius: '4px', textAlign: 'center' }} rela_id={card_id} rela_type={type == '0' ? '1' : '2'} />
                          </span>
                        )
                    }

                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* 各种字段的不同状态 E */}

          {/* 添加标签字段 S */}
          <div>
            <div className={mainContentStyles.field_content}>
              <div className={mainContentStyles.field_left}>
                <span className={`${globalStyles.authTheme}`}>&#xe6b8;</span>
                <span>标签</span>
              </div>
              <div style={{ position: 'relative' }} className={mainContentStyles.field_right}>
                <div className={mainContentStyles.pub_hover}>
                  {
                    (this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit() ? (
                      (
                        label_data && label_data.length ? (
                          <div>
                            {
                              label_data.map(item => {
                                return (
                                  <span className={`${mainContentStyles.labelDelItem}`}>
                                    <span key={`${item.label_id}`} style={{ background: `rgba(${item.label_color}, 1)` }} className={`${mainContentStyles.normal_label}`}>
                                      <span>{item.label_name}</span>
                                      {/* <span onClick={(e) => { this.handleRemoveTaskTag(e, item.label_id) }} className={mainContentStyles.labelDelIcon}></span> */}
                                    </span>
                                  </span>
                                )
                              })
                            }
                          </div>
                        ) : (
                            <div>暂无</div>
                          )
                      )
                    ) : (

                        label_data && label_data.length ? (
                          <div style={{ position: 'relative' }}>
                            <Dropdown
                              visible={visible}
                              getPopupContainer={triggerNode => triggerNode.parentNode}
                              trigger={['click']}
                              onVisibleChange={(visible) => { this.handleVisibleChange(visible) }}
                              overlayClassName={mainContentStyles.labelDataWrapper}
                              overlay={
                                <LabelDataComponent
                                  board_id={board_id}
                                  listData={boardTagList}
                                  searchName={'name'} currentSelect={label_data}
                                  handleAddBoardTag={this.handleAddBoardTag}
                                  handleUpdateBoardTag={this.handleUpdateBoardTag}
                                  handleRemoveBoardTag={this.handleRemoveBoardTag}
                                  handleChgSelectedLabel={this.handleChgSelectedLabel}
                                  handleClose={this.handleClose}
                                />
                              }
                            >
                              <div>
                                {
                                  label_data.map(item => {
                                    return (
                                      <span className={`${mainContentStyles.labelDelItem}`}>
                                        <span key={`${item.label_id}`} style={{ background: `rgba(${item.label_color}, 1)` }} className={`${mainContentStyles.normal_label}`}>
                                          <span>{item.label_name}</span>
                                          <span onClick={(e) => { this.handleRemoveTaskTag(e, item.label_id) }} className={mainContentStyles.labelDelIcon}></span>
                                        </span>
                                      </span>
                                    )
                                  })
                                }
                              </div>
                            </Dropdown>
                          </div>
                        ) : (
                            <div style={{ position: 'relative' }}>
                              <Dropdown
                                visible={visible}
                                getPopupContainer={triggerNode => triggerNode.parentNode}
                                trigger={['click']}
                                onVisibleChange={(visible) => { this.handleVisibleChange(visible) }}
                                overlayClassName={mainContentStyles.labelDataWrapper}
                                overlay={
                                  <LabelDataComponent
                                    board_id={board_id}
                                    listData={boardTagList}
                                    searchName={'name'} currentSelect={label_data}
                                    handleAddBoardTag={this.handleAddBoardTag}
                                    handleUpdateBoardTag={this.handleUpdateBoardTag}
                                    handleRemoveBoardTag={this.handleRemoveBoardTag}
                                    handleChgSelectedLabel={this.handleChgSelectedLabel}
                                    handleClose={this.handleClose}
                                  />
                                }
                              >
                                <div>
                                  <span>添加标签</span>
                                </div>
                              </Dropdown>
                            </div>
                          )

                      )
                  }

                </div>
              </div>
            </div>
          </div>
          {/* 添加标签字段 E */}

          {/* 上传附件字段 S*/}
          <div>
            <div style={{ position: 'relative' }} className={mainContentStyles.field_content}>
              <div className={mainContentStyles.field_left}>
                <span className={`${globalStyles.authTheme}`}>&#xe6b9;</span>
                <span>附件</span>
              </div>
              <div className={`${mainContentStyles.field_right}`}>
                {/* 上传附件组件 */}
                {
                  (this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit() ? (
                    <div className={`${mainContentStyles.pub_hover}`}>
                      <span>暂无</span>
                    </div>
                  ) : (
                      <div className={`${mainContentStyles.pub_hover}`}>
                        {
                          card_id && (
                            <UploadAttachment projectDetailInfoData={projectDetailInfoData} org_id={org_id} board_id={board_id} card_id={card_id}
                              onFileListChange={this.onUploadFileListChange}>
                              <div className={mainContentStyles.upload_file_btn}>
                                <span className={`${globalStyles.authTheme}`} style={{ fontSize: '16px' }}>&#xe7fa;</span> 上传附件
                        </div>
                            </UploadAttachment>
                          )}
                      </div>
                    )
                }
                <div className={mainContentStyles.filelist_wrapper}>
                  {
                    drawContent.attachment_data && drawContent.attachment_data.map((fileInfo) => {
                      return (
                        <div className={`${mainContentStyles.file_item_wrapper}`} key={fileInfo.id}>

                          <Dropdown overlay={this.getAttachmentActionMenus(fileInfo, card_id)}>
                            <div className={mainContentStyles.file_action}>
                              <i className={`${globalStyles.authTheme}`} style={{ fontSize: '16px' }}>&#xe7fd;</i>
                            </div>
                          </Dropdown>
                          <div className={`${mainContentStyles.file_item} ${mainContentStyles.pub_hover}`} onClick={() => this.openFileDetailModal(fileInfo)} >
                            <div className={mainContentStyles.file_title}><span className={`${globalStyles.authTheme}`} style={{ fontSize: '24px', color: '#40A9FF' }}>&#xe659;</span><span>{fileInfo.name}</span></div>
                            <div className={mainContentStyles.file_info}>{this.showMemberName(fileInfo.create_by)} 上传于 {fileInfo.create_time && timestampFormat(fileInfo.create_time, "MM-dd hh:mm")}</div>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            </div>
          </div>
          {/* 上传附件字段 E*/}

          {/* 备注字段 S*/}
          <div>
            <div style={{ position: 'relative' }} className={mainContentStyles.field_content}>
              <div className={mainContentStyles.field_left}>
                <span className={`${globalStyles.authTheme}`}>&#xe7f6;</span>
                <span>备注</span>
              </div>
              <div className={`${mainContentStyles.field_right}`}>
                {
                  (this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit() ? (
                    (
                      !description && description != '<p></p>' ? (
                        <div className={`${mainContentStyles.pub_hover}`}>
                          <span>暂无</span>
                        </div>
                      ) : (
                          <div className={`${mainContentStyles.pub_hover}`} >
                            <div className={mainContentStyles.descriptionContent} dangerouslySetInnerHTML={{ __html: description }}></div>
                          </div>
                        )
                    )
                  ) : (
                      // 富文本组件
                      <>
                        <RichTextEditor saveBrafitEdit={this.saveBrafitEdit} value={description}>
                          <div className={`${mainContentStyles.pub_hover}`} >
                            {
                              description && description != '<p></p>' ?
                                <div className={mainContentStyles.descriptionContent} dangerouslySetInnerHTML={{ __html: description }}></div>
                                :
                                '添加备注'
                            }
                          </div>
                        </RichTextEditor>
                      </>
                    )
                }
              </div>
            </div>
          </div>
          {/* 备注字段 E*/}

          {/* 备注字段 S*/}
          <div>
            <div style={{ position: 'relative' }} className={mainContentStyles.field_content}>
              <div className={mainContentStyles.field_left}>
                <span className={`${globalStyles.authTheme}`}>&#xe6b7;</span>
                <span>里程碑</span>
              </div>
              <div className={`${mainContentStyles.field_right}`}>

                {/*加入里程碑组件*/}
                {/* <MilestoneAdd onChangeMilestone={this.onMilestoneSelectedChange} dataInfo={{ board_id, board_name, due_time, org_id, data }} selectedValue={milestone_data && milestone_data.id}>
                  <div className={`${mainContentStyles.pub_hover}`} >
                    {milestone_data && milestone_data.id
                      ? milestone_data.name
                      :
                      '加入里程碑'
                    }
                  </div>
                </MilestoneAdd> */}
                {
                  (this.checkDiffCategoriesAuthoritiesIsVisible && this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit) && !this.checkDiffCategoriesAuthoritiesIsVisible().visit_control_edit() ? (
                    (
                      !milestone_data && !(milestone_data && milestone_data.id) ? (
                        <div className={`${mainContentStyles.pub_hover}`}>
                          <span>暂无</span>
                        </div>
                      ) : (
                          <div className={`${mainContentStyles.pub_hover} ${mainContentStyles.value_text}`} >
                            {milestone_data.name}
                          </div>
                        )
                    )
                  ) : (
                      // 加入里程碑组件
                      <MilestoneAdd onChangeMilestone={this.onMilestoneSelectedChange} dataInfo={{ board_id, board_name, due_time, org_id, data }} selectedValue={milestone_data && milestone_data.id}>
                        <div className={`${mainContentStyles.pub_hover}`} >
                          {milestone_data && milestone_data.id
                            ? <span className={mainContentStyles.value_text}>{milestone_data.name}</span>
                            :
                            '加入里程碑'
                          }
                        </div>
                      </MilestoneAdd>
                    )
                }
                {/*加入里程碑组件*/}


              </div>
            </div>
          </div>
          {/* 备注字段 E*/}

          {/* 子任务字段 S */}
          <div>
            <div style={{ position: 'relative' }} className={mainContentStyles.field_content}>
              <div className={mainContentStyles.field_left}>
                <span className={`${globalStyles.authTheme}`}>&#xe7f5;</span>
                <span>子任务</span>
              </div>
              <div className={`${mainContentStyles.field_right}`}>
                {/* 添加子任务组件 */}
                <AppendSubTask drawContent={drawContent} dispatch={dispatch} data={data} handleTaskDetailChange={handleTaskDetailChange}>
                  <div className={`${mainContentStyles.pub_hover}`}>
                    <span className={mainContentStyles.add_sub_btn}>
                      <span className={`${globalStyles.authTheme}`} style={{ fontSize: '16px' }}>&#xe8fe;</span> 新建子任务
                    </span>
                  </div>
                </ AppendSubTask>
              </div>
            </div>
          </div>
          {/* 子任务字段 E */}
          {/* 添加字段 S */}
          <div>
            <div className={mainContentStyles.field_content}>
              <div className={mainContentStyles.field_left}>
                <span className={globalStyles.authTheme}>&#xe8fe;</span>
                <span>添加属性</span>
              </div>
              <div className={mainContentStyles.field_right}>
                <div style={{ position: 'relative' }} className={mainContentStyles.pub_hover}>
                  <Dropdown overlayClassName={mainContentStyles.overlay_attribute} trigger={['click']} getPopupContainer={triggerNode => triggerNode.parentNode}
                    overlay={this.getDiffAttributies()}
                  >
                    <div><span>选择属性</span></div>
                  </Dropdown>
                </div>
              </div>
            </div>
          </div>
          {/* 添加字段 E */}
          {/* 不同字段的渲染 S */}
          <div>
            {
              properties && properties.map(item => {
                return this.filterDiffPropertiesField(item)
              })
            }
          </div>
          {/* 不同字段的渲染 E */}
        </div>

        {/*外部附件引入开始 */}
        {/*查看任务附件*/}
        <PreviewFileModal modalVisible={isInOpenFile} />
        {/*外部附件引入结束 */}
      </div>
    )
  }
}

// 只关联public弹窗内的数据
function mapStateToProps({
  publicTaskDetailModal: { drawContent = {}, is_edit_title, card_id, boardTagList = [], attributesList = [], currentDrawerContent = {} },
  projectDetail: { datas: { projectDetailInfoData = {} } },
  projectDetailFile: {
    datas: {
      isInOpenFile
    }
  }
}) {
  return { drawContent, is_edit_title, card_id, boardTagList, attributesList, currentDrawerContent, projectDetailInfoData, isInOpenFile }
}
