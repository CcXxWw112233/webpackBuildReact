import React, { Component } from 'react'
import indexStyles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import {
  Popover,
  Select,
  Input,
  Button,
  message,
  DatePicker,
  Dropdown,
  Icon,
  Tooltip,
  Radio
} from 'antd'
import { connect } from 'dva'
import { getCurrentSelectedProjectMembersList } from '@/services/technological/workbench'
import {
  timestampToTime,
  timeToTimestamp,
  timestampToTimeNormal
} from '@/utils/util'
import MenuSearchPartner from '@/components/MenuSearchMultiple/MenuSearchPartner.js'
import kty from '@/assets/sider_right/kty.png'
import zoom from '@/assets/sider_right/zoom.png'
import zhumu from '@/assets/sider_right/zhumu.png'
import zyy from '@/assets/sider_right/zyy.png'
import tx from '@/assets/sider_right/tx.png'
import { currentNounPlanFilterName } from '@/utils/businessFunction'
import { PROJECTS } from '@/globalset/js/constant'
import { isApiResponseOk } from '@/utils/handleResponseData'
import moment from 'moment'
import { arrayNonRepeatfy } from '../../../../../utils/util'
import { platformNouns } from '../../../../../globalset/clientCustorm'
import { getProjectList } from '../../../../../services/technological/workbench'
const Option = Select.Option

// 定义组件中需要的默认状态值
let remind_time_value = '5' // 设置的提醒时间
let stepIndex = 0

@connect(
  ({
    technological: {
      datas: { videoConferenceProviderList = [] }
    }
  }) => {
    return {
      videoConferenceProviderList
    }
  }
)
class VideoMeetingPopoverContent extends Component {
  constructor(props) {
    super(props)
    this.timer = null
    this.local_timer = null
    this.videoProviderImgTimer = null
    this.state = {
      saveToProject: null, // 用来保存存入的项目
      meetingTitle: '', // 会议名称
      start_time: '', // 已经转换好的日期格式 xxx年xx月xx日
      meeting_start_time: '', // 会议开始时间 时间戳
      due_time: '', // 截止时间
      isOrderTime: false, // 是否是预约时间
      videoMeetingPopoverVisible: false, // 视频会议的显示隐藏
      currentSelectedProjectMembersList: [], //当前选择项目的项目成员
      org_id: '0',
      dueTimeList: [
        { remind_time_type: 'm', txtVal: '5' },
        { remind_time_type: 'm', txtVal: '15' },
        { remind_time_type: 'm', txtVal: '30' },
        { remind_time_type: 'm', txtVal: '45' }
      ], // 持续结束时间
      defaultValue: '30', // 当前选择的持续时间
      providerDefault: null, // 默认选中的提供商
      remindDropdownVisible: false
    }
  }

  // 初始化数据
  initVideoMeetingPopover = () => {
    this.setState({
      saveToProject: null,
      meetingTitle: '',
      start_time: '',
      due_time: '',
      meeting_start_time: '',
      selectedKeys: null,
      othersPeople: [],
      userIds: [],
      user_phone: [],
      isOrderTime: false,
      defaultValue: '30',
      toNoticeList: [],
      remindDropdownVisible: false,
      providerDefault: null,
      isShowNowTime: true // 表示是否跟随时钟变化
    })
    stepIndex = 0
    clearTimeout(this.timer)
    clearTimeout(this.local_timer)
  }

  // 获取项目列表
  getProjectList = () => {
    getProjectList({}).then(res => {
      if (isApiResponseOk(res)) {
        this.setState({
          projectList: res.data
        })
        this.getCurrentProject(res.data)
      }
    })
  }

  // 获取对应项目中的成员列表
  getProjectUsers = ({ projectId }) => {
    if (!projectId) return
    if (projectId == 0) return
    getCurrentSelectedProjectMembersList({ projectId }).then(res => {
      if (isApiResponseOk(res)) {
        const board_users = res.data
        this.setState({
          currentSelectedProjectMembersList: board_users // 当前选择项目成员列表
        })
        this.getCurrentRemindUser()
      } else {
      }
    })
  }

  // 表示获取当前默认选择的项目
  getCurrentProject = (projectList = []) => {
    // let { projectList = [] } = props
    let new_projectList = [...projectList]
    if (!!(projectList && projectList.length)) {
      //过滤出来当前用户属于自己的 如果没有 取默认第一个项目
      if (new_projectList.find(item => item.is_my_private == '1')) {
        let { board_id, org_id, board_name } =
          new_projectList.find(item => item.is_my_private == '1') || {}
        this.setState({
          org_id,
          saveToProject: board_id
          // notProjectList: false
        })
        this.getProjectUsers({ projectId: board_id })
      } else {
        let { board_id, org_id, board_name } =
          new_projectList.find((item, index) => index == '0') || {}
        this.setState({
          org_id,
          saveToProject: board_id
          // notProjectList: false
        })
        this.getProjectUsers({ projectId: board_id })
        return
      }
    } else {
    }
  }

  componentWillMount() {
    const { dispatch } = this.props
    dispatch({
      type: 'technological/getVideoConferenceProviderList',
      payload: {}
    })
  }

  // 时钟
  showTime = () => {
    let nowDate = timestampToTime(timeToTimestamp(new Date()))
    this.setState({
      start_time: nowDate,
      meeting_start_time: timeToTimestamp(new Date())
    })
    this.timer = setTimeout(() => {
      this.showTime()
    }, 1000)
  }

  // 需要一个一直变化的时间来做比较
  localShowTime = () => {
    let nowDate = new Date().getTime()
    let change_time = new Date(timestampToTimeNormal(nowDate, '/', true))
    let state_time = new Date(
      timestampToTimeNormal(this.state.meeting_start_time, '/', true)
    )
    if (change_time.getDate() == state_time.getDate()) {
      // 表示还是今天
      if (
        change_time.getHours() == state_time.getHours() &&
        change_time.getMinutes() == state_time.getMinutes()
      ) {
        this.handleChangeNowTime()
      }
    }
    this.local_timer = setTimeout(() => {
      this.localShowTime()
    }, 1000)
  }

  handleChangeNowTime = () => {
    const { isShowNowTime } = this.state
    if (isShowNowTime) {
      return false
    }
    this.setState(
      {
        isShowNowTime: true, // 显示当前时间
        isOrderTime: false
      },
      () => {
        this.showTime() // 点击现在之后开启定时器
      }
    )
  }

  // // 获取项目权限
  // getProjectPermission = (permissionType, board_id) => {
  //   return checkIsHasPermissionInBoard(permissionType, board_id)
  // }
  // // 查询当前用户是否有权限
  // filterProjectWhichCurrentUserHasEditPermission = (projectList = []) => {
  //   return projectList.filter(({ board_id }) =>
  //     this.getProjectPermission('project:team:card:create', board_id)
  //   )
  // }

  // 获取当前用户
  getInfoFromLocalStorage = item => {
    try {
      const userInfo = localStorage.getItem(item)
      return JSON.parse(userInfo)
    } catch (e) {
      message.error('从 Cookie 中获取用户信息失败, 当发起视频会议的时候')
    }
  }

  // 获取当前用户的会议名称
  getCurrentUserNameThenSetMeetingTitle = () => {
    let meeting_title = ''
    const currentUser = this.getInfoFromLocalStorage('userInfo')
    const { meetingTitle } = this.state
    if (currentUser) {
      meeting_title = meetingTitle
        ? meetingTitle
        : `${currentUser.name}发起的会议`
    }
    this.setState({
      meetingTitle: meeting_title
    })
  }

  // 选择项目的下拉回调
  handleSaveToProjectSelectChange = value => {
    const { projectList = [] } = this.state
    this.setState({
      saveToProject: value,
      org_id: !value
        ? '0'
        : (projectList.find(item => item.board_id == value) || {}).org_id ||
          '0',
      othersPeople: [],
      user_phone: [],
      selectedKeys: null,
      defaultValue: '30'
    })
    this.getProjectUsers({ projectId: value })
  }

  // 修改创建会话的名称回调
  handleVideoMeetingTopicChange = e => {
    if (e.target.value.trimLR() == '') {
      this.setState({
        meetingTitle: ''
      })
      return false
    }
    this.setState({
      meetingTitle: e.target.value
    })
  }

  // 设置会议开始时间
  startDatePickerChange = timeString => {
    const start_timeStamp = timeToTimestamp(timeString)
    const nowDate = timeToTimestamp(new Date())
    let nextOrPrevDate = new Date(
      timestampToTimeNormal(start_timeStamp)
    ).getDate()
    let currentDate = new Date().getDate()
    if (this.timer) {
      clearTimeout(this.timer)
    }
    // 如果是点击的今天，那么提醒什么的都要隐藏
    // 如果点击的是今天之前或者之后，那么就要显示
    if (currentDate == nextOrPrevDate) {
      // 表示如果日期相等
      // 这里还需要判断选择的时钟和分钟是否是现在
      if (
        new Date(
          timestampToTimeNormal(start_timeStamp, '/', true)
        ).getHours() == new Date(nowDate).getHours() &&
        new Date(
          timestampToTimeNormal(start_timeStamp, '/', true)
        ).getMinutes() == new Date(nowDate).getMinutes()
      ) {
        this.setState({
          isOrderTime: false
        })
      } else {
        if (this.timer) {
          clearTimeout(this.timer)
        }
        this.setState({
          start_time: timestampToTime(start_timeStamp),
          meeting_start_time: start_timeStamp,
          isOrderTime: true,
          isShowNowTime: false
        })
      }
    } else if (nextOrPrevDate < currentDate) {
      // // 表示是今天之前
      // this.setState({
      //   start_time: timestampToTime(start_timeStamp),
      //   meeting_start_time: start_timeStamp,
      //   isOrderTime: true
      // })
    } else {
      // 表示大于今天
      if (this.timer) {
        clearTimeout(this.timer)
      }
      this.setState({
        start_time: timestampToTime(start_timeStamp),
        meeting_start_time: start_timeStamp,
        isOrderTime: true,
        isShowNowTime: false
      })
    }

    this.disabledDateTime()
  }

  // 设置会议的结束时间
  endDatePickerChange = (e, type) => {
    e && e.domEvent && e.domEvent.stopPropagation()
    const { key } = e
    if (type == 'm') {
      this.setState({
        due_time: key * 60000
      })
      // currentDelayDueTime = key * 60000
    } else {
      this.setState({
        due_time: key * 3600000
      })
      // currentDelayDueTime = key * 3600000
    }
    this.setState({
      defaultValue: key
    })
  }

  // 获取当前用户并且设置为第一个通知对象
  getCurrentRemindUser = () => {
    const currentUser = this.getInfoFromLocalStorage('userInfo')
    const {
      currentSelectedProjectMembersList = [],
      toNoticeList = []
    } = this.state
    let new_currentSelectedProjectMembersList = [
      ...currentSelectedProjectMembersList
    ]
    const gold_item =
      new_currentSelectedProjectMembersList.find(
        item => item.id == currentUser.id
      ) || {}
    if (Object.keys(gold_item).length) {
      toNoticeList.push(gold_item)
    }
    let nonRepeatArr = arrayNonRepeatfy(toNoticeList, 'user_id')
    this.setState({
      toNoticeList: nonRepeatArr,
      userIds: [gold_item.user_id]
    })
  }

  // 通知提醒下拉选择
  chirldrenTaskChargeChange = dataInfo => {
    const { selectedKeys = [], type, key } = dataInfo
    const { currentSelectedProjectMembersList = [] } = this.state
    const membersData = currentSelectedProjectMembersList
    let newNoticeUserList = []
    for (let i = 0; i < selectedKeys.length; i++) {
      for (let j = 0; j < membersData.length; j++) {
        if (selectedKeys[i] === membersData[j]['user_id']) {
          newNoticeUserList.push(membersData[j])
        }
      }
    }
    this.setState({
      toNoticeList: newNoticeUserList,
      userIds: selectedKeys.filter(i => i && i.length != '11') || [] // 这里需要过滤掉手机号
    })
  }

  // 移除执行人的回调 S
  handleRemoveExecutors = (e, shouldDeleteItem) => {
    e && e.stopPropagation()
    const {
      toNoticeList = [],
      othersPeople = [],
      user_phone = [],
      userIds = []
    } = this.state
    let new_toNoticeList = [...toNoticeList]
    let new_othersPeople = [...othersPeople]
    new_toNoticeList.map((item, index) => {
      if (item.user_id == shouldDeleteItem) {
        new_toNoticeList.splice(index, 1)
      }
    })
    let new_userIds = userIds.filter(i => i && i != shouldDeleteItem) || []
    // 表示邀请手机号进来的成员 事件处理
    if (new_othersPeople && new_othersPeople.length) {
      new_othersPeople.map((item, index) => {
        if (item.user_id == shouldDeleteItem) {
          new_othersPeople.splice(index, 1)
        }
      })
      let new_user_phone =
        user_phone.filter(i => i && i != shouldDeleteItem) || []
      this.setState({
        othersPeople: new_othersPeople,
        user_phone: new_user_phone
      })
    }
    this.setState({
      toNoticeList: new_toNoticeList,
      userIds: new_userIds
    })
  }

  // 手机号
  arrayNonRepeatPhone = arr => {
    let temp_arr = []
    for (let i = 0; i < arr.length; i++) {
      if (!temp_arr.includes(arr[i])) {
        //includes 检测数组是否有某个值
        temp_arr.push(arr[i])
      }
    }
    return temp_arr
  }

  // 自定义图标的点击事件
  chgUserDefinedIcon = ({ obj }) => {
    const { othersPeople = [], user_phone = [] } = this.state
    let new_othersPeople = [...othersPeople]
    new_othersPeople.push(obj)
    user_phone.push(obj.mobile)
    this.setState({
      othersPeople: arrayNonRepeatfy(new_othersPeople, 'user_id'),
      user_phone: this.arrayNonRepeatPhone(user_phone),
      remindDropdownVisible: false
    })
  }

  // 提醒的下拉回调
  handleVisibleChange = visible => {
    this.setState({
      remindDropdownVisible: visible
    })
  }

  // 打开会议窗口链接
  openWinNiNewTabWithATag = url => {
    const aTag = document.createElement('a')
    aTag.href = url
    aTag.target = '_blank'
    document.querySelector('body').appendChild(aTag)
    aTag.click()
    aTag.parentNode.removeChild(aTag)
  }

  // 邀请人加入的回调
  inviteMemberJoin = ({ card_id, userIds = [], start_url }) => {
    const { isOrderTime } = this.state
    if (!card_id) {
      setTimeout(() => {
        message.success(!isOrderTime ? '发起会议成功' : '预约会议成功')
      }, 500)
      this.setState(
        {
          videoMeetingPopoverVisible: false
        },
        async () => {
          await this.initVideoMeetingPopover()
        }
      )
      start_url && this.openWinNiNewTabWithATag(start_url)
      return false
    }
    this.setRemindInfo({ card_id, userIds, user_phone: [], start_url })
  }

  // 发起会议成功之后调用通知提醒
  setRemindInfo = ({ card_id, userIds = [], user_phone = [], start_url }) => {
    const { dispatch } = this.props
    const { isOrderTime } = this.state
    const temp_user = [].concat(userIds, user_phone)
    const data = {
      rela_id: card_id,
      remind_time_value,
      rela_type: '2',
      remind_time_type: !isOrderTime ? 'datetime' : 'm',
      remind_trigger: !isOrderTime ? 'userdefined' : 'schedule:start:before',
      users: temp_user
    }

    if (!(temp_user && temp_user.length)) {
      setTimeout(() => {
        message.success('发起会议成功')
      }, 500)
      this.setState(
        {
          videoMeetingPopoverVisible: false
        },
        () => {
          this.initVideoMeetingPopover()
        }
      )
      this.openWinNiNewTabWithATag(start_url)
      dispatch({
        type: 'workbench/getMeetingList',
        payload: {}
      })
    } else {
      Promise.resolve(
        dispatch({
          type: 'informRemind/setRemindInformation',
          payload: {
            ...data,
            calback: () => {
              setTimeout(() => {
                message.success('发起会议成功')
              }, 500)
            }
          }
        })
      ).then(res => {
        if (isApiResponseOk(res)) {
          this.setState(
            {
              videoMeetingPopoverVisible: false
            },
            () => {
              this.initVideoMeetingPopover()
            }
          )
          this.openWinNiNewTabWithATag(start_url)
          dispatch({
            type: 'workbench/getMeetingList',
            payload: {}
          })
        }
      })
    }
  }

  // 发起会议
  handleVideoMeetingSubmit = () => {
    const { dispatch, videoConferenceProviderList = [] } = this.props
    const {
      saveToProject,
      org_id,
      meetingTitle,
      meeting_start_time,
      userIds = [],
      user_phone = [],
      isShowNowTime = true,
      isOrderTime,
      providerDefault,
      due_time
    } = this.state
    let gold_provider_id =
      (videoConferenceProviderList &&
        (
          videoConferenceProviderList.filter(
            item => item.is_default == '1'
          )[0] || []
        ).id) ||
      ''
    // 默认30分钟 + 开始时间
    const default_due_time = 30 * 60 * 1000 + meeting_start_time
    const data = {
      _organization_id: org_id,
      board_id: saveToProject,
      flag: 2,
      rela_id: saveToProject,
      topic: meetingTitle,
      start_time: meeting_start_time,
      end_time: due_time ? due_time + meeting_start_time : default_due_time,
      user_for: (user_phone && user_phone.join(',')) || '',
      user_ids: (userIds && userIds.join(',')) || '',
      provider_id: providerDefault ? providerDefault : gold_provider_id
    }

    Promise.resolve(
      dispatch({
        type: !isOrderTime
          ? 'technological/initiateVideoMeeting'
          : 'technological/appointmentVideoMeeting',
        payload: data
      })
    ).then(res => {
      if (res.code === '0') {
        clearTimeout(this.timer)
        clearTimeout(this.local_timer)
        const { start_url, card_id } = res.data
        if (!isOrderTime)
          remind_time_value = parseInt(meeting_start_time / 1000)
        this.inviteMemberJoin({ card_id, userIds, user_phone, start_url })
      } else if (res.code === '1') {
        message.error(res.message)
        this.setState(
          {
            videoMeetingPopoverVisible: false
          },
          () => {
            this.initVideoMeetingPopover()
          }
        )
      } else {
        message.error(isShowNowTime ? '发起会议失败' : '预约会议失败')
        this.setState(
          {
            videoMeetingPopoverVisible: false
          },
          () => {
            this.initVideoMeetingPopover()
          }
        )
      }
    })
  }

  // popoverContent chg 事件
  handleVideoMeetingPopoverVisibleChange = flag => {
    this.setState(
      {
        videoMeetingPopoverVisible: flag
      },
      () => {
        if (flag === false) {
          this.initVideoMeetingPopover()
          setTimeout(() => {
            this.getCurrentRemindUser()
          }, 50)
          clearTimeout(this.timer)
          clearTimeout(this.local_timer)
        } else {
          // 为true的时候调用设置当前通知对象
          this.showTime()
          // 因为需要一个一直变化的时间来做比较
          this.localShowTime()
          // 获取项目--> 默认项目
          this.getProjectList()
          // 获取默认会议名称
          this.getCurrentUserNameThenSetMeetingTitle()
          // this.getCurrentProject(this.props)
          this.setState({
            isShowNowTime: true
          })
        }
      }
    )
  }

  // 禁用日期时间
  disabledDate = current => {
    return current && current < moment().add(-1, 'day')
  }

  range = (start, end) => {
    const result = []
    for (let i = start; i < end; i++) {
      result.push(i)
    }
    return result
  }

  disabledDateTime = () => {
    const { meeting_start_time } = this.state
    let old_hours = new Date().getHours()
    let old_minutes = new Date().getMinutes()
    let old_date = new Date().getDate()
    let new_hours = new Date(
      timestampToTimeNormal(meeting_start_time, '/', true)
    ).getHours()
    let new_date = new Date(
      timestampToTimeNormal(meeting_start_time, '/', true)
    ).getDate()
    let flag =
      new_date == old_date
        ? new_hours > old_hours
          ? () => ''
          : () => this.range(0, old_minutes)
        : () => ''
    return {
      disabledHours:
        new_date == old_date
          ? () => this.range(0, 24).splice(0, old_hours)
          : () => '',
      disabledMinutes: flag
    }
  }

  // 获取图片logo
  getImgLogo = item => {
    const { id, icon, isDefault } = item
    let img = <></>
    switch (id) {
      case '1':
        img = <img src={zoom} width={61} height={14} />
        break
      case '2':
        img = <img src={kty} width={62} height={18} />
        break
      case '3':
        img = <img src={zhumu} width={59} height={25} />
        break
      case '4':
        img = <img src={zyy} width={37} height={31} />
        break
      case '5':
        img = <img src={tx} width={72} height={26} />
        break
      default:
        break
    }
    return img
  }

  // 视频提供商点击事件
  onVideoProviderChange = e => {
    this.setState({
      providerDefault: e.target.value
    })
  }

  // 视频提供商点击事件
  handleSelectVideoProvider = (e, id) => {
    e && e.stopPropagation()
    this.setState({
      providerDefault: id
    })
  }

  // 点击左右箭头
  handleVideoArrow = type => {
    const { videoConferenceProviderList = [] } = this.props
    let currentElem = document.getElementById('video_provider')
    if (!currentElem) return
    // currentElem.innerHTML = currentElem.innerHTML + currentElem.innerHTML;//将轮播内容复制一份

    if (type == 'right') {
      if (stepIndex + 4 == videoConferenceProviderList.length) {
        return
      }
      stepIndex++
      currentElem.style.left = -stepIndex * 93 + 'px'
    } else if (type == 'left') {
      if (stepIndex == 0) {
        return
      }
      stepIndex--
      currentElem.style.left = stepIndex * 93 + 'px'
    }
  }

  // 渲染视频会议名称
  renderVideoProviderTitle = id => {
    let title = ''
    switch (id) {
      case '1': // 表示zoom
        title = 'zoom会议'
        break
      case '2': // 表示zoom
        title = '科天云会议'
        break
      case '3': // 表示zoom
        title = '瞩目会议'
        break
      case '4': // 表示zoom
        title = '章鱼云会议'
        break
      case '5': // 表示zoom
        title = '腾讯会议'
        break
      default:
        break
    }
    return title
  }

  renderPopover = () => {
    const {
      projectList = [],
      saveToProject,
      videoMeetingPopoverVisible,
      dueTimeList = [],
      start_time,
      meeting_start_time,
      currentSelectedProjectMembersList = [],
      toNoticeList = [],
      othersPeople = [],
      meetingTitle = '',
      defaultValue,
      isOrderTime,
      remindDropdownVisible
    } = this.state
    let { board_id, videoConferenceProviderList = [] } = this.props
    //过滤出来当前用户有编辑权限的项目
    let newToNoticeList = [].concat(...toNoticeList, othersPeople)
    const videoMeetingPopoverContent_ = (
      <div>
        {videoMeetingPopoverVisible && (
          <div
            className={`${indexStyles.videoMeeting__wrapper} ${globalStyles.global_vertical_scrollbar}`}
          >
            <div className={indexStyles.videoMeeting__topic}>
              <div className={indexStyles.videoMeeting__topic_content}>
                {/* 项目选择 S */}
                <span
                  style={{ position: 'relative' }}
                  className={indexStyles.videoMeeting__topic_content_save}
                >
                  <Select
                    value={saveToProject}
                    optionLabelProp="label"
                    onChange={this.handleSaveToProjectSelectChange}
                    style={{ width: '100%' }}
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                  >
                    {!!(projectList && projectList.length) &&
                      projectList.map(project => (
                        <Option
                          label={project.board_name}
                          value={project.board_id}
                          key={project.board_id}
                        >
                          {project.board_name}
                        </Option>
                      ))}
                  </Select>
                </span>
                {/* 项目选择 E */}

                {/* 会议名称 S */}
                <span className={indexStyles.videoMeeting__topic_content_title}>
                  <Input
                    value={meetingTitle}
                    onChange={this.handleVideoMeetingTopicChange}
                  />
                </span>
                {/* 会议名称 E */}

                {/* 时间选择 S */}
                <span
                  id={'videoMeeting__topic_content_time'}
                  style={{ zIndex: 1 }}
                  className={indexStyles.videoMeeting__topic_content_time}
                >
                  <span
                    className={
                      indexStyles.videoMeeting__topic_content_datePicker
                    }
                    style={{
                      position: 'relative',
                      zIndex: 0,
                      maxWidth: '150px',
                      lineHeight: '38px',
                      display: 'inline-block',
                      textAlign: 'center'
                    }}
                  >
                    <span>
                      <Input value={start_time} />
                    </span>
                    <DatePicker
                      allowClear={false}
                      onChange={this.startDatePickerChange.bind(this)}
                      getCalendarContainer={() =>
                        document.getElementById(
                          'videoMeeting__topic_content_time'
                        )
                      }
                      disabledDate={this.disabledDate}
                      disabledTime={this.disabledDateTime}
                      value={
                        start_time
                          ? moment(new Date(Number(meeting_start_time)))
                          : undefined
                      }
                      format="YYYY/MM/DD HH:mm"
                      showTime={{ format: 'HH:mm' }}
                      style={{
                        opacity: 0,
                        background: '#000000',
                        position: 'absolute',
                        left: 0,
                        width: 'auto'
                      }}
                    />
                  </span>
                  <span style={{ position: 'relative' }}>
                    <Select
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      dropdownClassName={`${indexStyles.select_overlay} ${globalStyles.global_vertical_scrollbar}`}
                      style={{ width: '138px' }}
                      value={[defaultValue]}
                    >
                      {dueTimeList &&
                        dueTimeList.map(item => (
                          <Option
                            onClick={e => {
                              this.endDatePickerChange(e, item.remind_time_type)
                            }}
                            value={item.txtVal}
                          >{`持续 ${item.txtVal} ${
                            item.remind_time_type == 'm' ? '分钟' : '小时'
                          }`}</Option>
                        ))}
                    </Select>
                  </span>
                </span>
                {/* 时间选择 E */}
              </div>
            </div>
            {/* 设置通知提醒 S */}
            <div className={indexStyles.videoMeeting__remind}>
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}
              >
                <span style={{ color: 'rgba(0,0,0,0.45)' }}>
                  {!isOrderTime ? '邀请' : '提醒'}谁参与?
                </span>
              </div>
              <div className={indexStyles.noticeUsersWrapper}>
                <div style={{ flex: '1', position: 'relative' }}>
                  <Dropdown
                    key={videoMeetingPopoverVisible && !remindDropdownVisible}
                    className={indexStyles.dropdownWrapper}
                    trigger={['click']}
                    visible={remindDropdownVisible}
                    onVisibleChange={this.handleVisibleChange}
                    overlayClassName={indexStyles.overlay_pricipal}
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    overlayStyle={{ maxWidth: '200px' }}
                    overlay={
                      <MenuSearchPartner
                        isInvitation={true}
                        Inputlaceholder="输入手机号"
                        show_select_all={true}
                        select_all_type={'0'}
                        listData={currentSelectedProjectMembersList}
                        keyCode={'user_id'}
                        searchName={'name'}
                        currentSelect={newToNoticeList}
                        board_id={board_id}
                        user_defined_icon={<span>&#xe846;</span>}
                        chgUserDefinedIcon={this.chgUserDefinedIcon}
                        chirldrenTaskChargeChange={
                          this.chirldrenTaskChargeChange
                        }
                      />
                    }
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                      <div className={indexStyles.addNoticePerson}>
                        <Icon
                          type="plus-circle"
                          style={{
                            fontSize: '32px',
                            color: '#40A9FF',
                            margin: '0 12px 0px'
                          }}
                        />
                      </div>
                      {!!(newToNoticeList && newToNoticeList.length) &&
                        newToNoticeList.map(value => {
                          if (!Object.keys(value).length) return <></>
                          const { avatar, name, user_name, user_id } = value
                          return (
                            <div
                              style={{ display: 'flex', flexWrap: 'wrap' }}
                              key={user_id}
                            >
                              <div
                                className={`${indexStyles.user_item}`}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  position: 'relative',
                                  textAlign: 'center'
                                }}
                                key={user_id}
                              >
                                {avatar ? (
                                  <Tooltip
                                    placement="top"
                                    title={name || user_name || '佚名'}
                                  >
                                    <img
                                      className={indexStyles.img_hover}
                                      style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: 20,
                                        margin: '0 2px'
                                      }}
                                      src={avatar}
                                    />
                                  </Tooltip>
                                ) : (
                                  <Tooltip
                                    placement="top"
                                    title={name || user_name || '佚名'}
                                  >
                                    <div
                                      className={indexStyles.default_user_hover}
                                      style={{
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 20,
                                        backgroundColor: '#f5f5f5',
                                        margin: '0 2px'
                                      }}
                                    >
                                      <Icon
                                        type={'user'}
                                        style={{
                                          fontSize: 12,
                                          color: '#8c8c8c'
                                        }}
                                      />
                                    </div>
                                  </Tooltip>
                                )}
                                <span
                                  onClick={e => {
                                    this.handleRemoveExecutors(e, user_id)
                                  }}
                                  className={`${indexStyles.userItemDeleBtn}`}
                                ></span>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </Dropdown>
                </div>
              </div>
            </div>
            {/* 设置通知提醒 E */}

            <div
              id={'videoProviderWrapper'}
              style={{
                width: '320px',
                position: 'relative',
                marginRight: '-16px',
                margin: 'auto',
                paddingLeft: '8px'
              }}
            >
              {videoConferenceProviderList &&
                videoConferenceProviderList.length > 4 &&
                stepIndex > 0 && (
                  <div
                    onClick={() => {
                      this.handleVideoArrow('left')
                    }}
                    className={`${indexStyles.video_arrow} ${indexStyles.video_arrow_left}`}
                  >
                    <span className={globalStyles.authTheme}>&#xe687;</span>
                  </div>
                )}
              <span>{platformNouns}推荐使用以下方式开展远程会议: </span>
              <div
                style={{
                  position: 'relative',
                  width: '282px',
                  overflow: 'hidden',
                  left: '10px'
                }}
              >
                <div
                  id={'video_provider'}
                  style={{ display: 'flex', position: 'relative' }}
                >
                  {videoConferenceProviderList &&
                    videoConferenceProviderList.map(item => {
                      return (
                        <Radio.Group
                          style={{ marginBottom: '12px' }}
                          onChange={this.onVideoProviderChange}
                          value={
                            this.state.providerDefault
                              ? this.state.providerDefault
                              : item.is_default == '1'
                              ? item.id
                              : ''
                          }
                        >
                          <div
                            key={`${item.id}-${item.icon}`}
                            style={{ textAlign: 'center', marginTop: '12px' }}
                          >
                            <Tooltip
                              overlayStyle={{ minWidth: '86px' }}
                              autoAdjustOverflow={false}
                              getPopupContainer={() =>
                                document.getElementById(`videoProviderWrapper`)
                              }
                              title={this.renderVideoProviderTitle(item.id)}
                              placement="top"
                            >
                              <div
                                onClick={e => {
                                  this.handleSelectVideoProvider(e, item.id)
                                }}
                                className={indexStyles.video_provider}
                              >
                                {this.getImgLogo(item)}
                              </div>
                            </Tooltip>
                            <div>
                              <Radio value={item.id} />
                            </div>
                          </div>
                        </Radio.Group>
                      )
                    })}
                </div>
              </div>
              {videoConferenceProviderList &&
                videoConferenceProviderList.length > 4 &&
                stepIndex + 4 < videoConferenceProviderList.length && (
                  <div
                    onClick={() => {
                      this.handleVideoArrow('right')
                    }}
                    className={`${indexStyles.video_arrow} ${indexStyles.video_arrow_right}`}
                  >
                    <span className={globalStyles.authTheme}>&#xe689;</span>
                  </div>
                )}
            </div>
            <div className={indexStyles.videoMeeting__submitBtn}>
              <Button
                disabled={
                  !saveToProject ||
                  meetingTitle == '' ||
                  !(newToNoticeList && newToNoticeList.length)
                }
                type="primary"
                onClick={this.handleVideoMeetingSubmit}
              >
                {!isOrderTime ? '发起会议' : '预约会议'}
              </Button>
            </div>
          </div>
        )}
      </div>
    )
    return videoMeetingPopoverContent_
  }

  renderPopoverHeader = () => {
    const {
      videoMeetingPopoverVisible,
      saveToProject,
      projectList = []
    } = this.state
    const saveProjectName =
      (projectList.find(item => item.board_id == saveToProject) || {})
        .board_name || ''
    const videoMeetingPopoverContent_ = (
      <div>
        {videoMeetingPopoverVisible && (
          <div className={indexStyles.videoMeeting__header}>
            <div className={indexStyles.videoMeeting__title}>
              <span
                style={{
                  maxWidth: '200px',
                  marginRight: '5px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'inline-block'
                }}
              >
                {saveProjectName &&
                  `${saveProjectName}${currentNounPlanFilterName(PROJECTS)}`}
              </span>
              在线会议
            </div>
          </div>
        )}
      </div>
    )
    return videoMeetingPopoverContent_
  }

  render() {
    const { videoMeetingPopoverVisible } = this.state
    return (
      <Popover
        visible={videoMeetingPopoverVisible}
        placement="bottomRight"
        title={this.renderPopoverHeader()}
        content={this.renderPopover()}
        onVisibleChange={this.handleVideoMeetingPopoverVisibleChange}
        trigger="click"
        getPopupContainer={() =>
          document.getElementById('technologicalLayoutWrapper')
        }
      >
        <div
          title="视频会议"
          className={`${indexStyles.videoMeeting__icon} ${globalStyles.authTheme}`}
        >
          &#xe865;
        </div>
      </Popover>
    )
  }
}

export default VideoMeetingPopoverContent
