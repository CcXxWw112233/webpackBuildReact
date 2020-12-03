import React from 'react'
import DrawDetailInfoStyle from './DrawDetailInfo.less'
import {
  Icon,
  Menu,
  Dropdown,
  Tooltip,
  Modal,
  Checkbox,
  Card,
  Progress,
  Input,
  Button,
  message,
  Radio,
  DatePicker
} from 'antd'
import ShowAddMenberModal from '../../Project/ShowAddMenberModal'
import {
  MESSAGE_DURATION_TIME,
  NOT_HAS_PERMISION_COMFIRN,
  PROJECT_TEAM_BOARD_EDIT,
  PROJECT_TEAM_BOARD_MEMBER,
  PROJECTS
} from '../../../../../globalset/js/constant'
import {
  checkIsHasPermissionInBoard,
  isHasOrgMemberQueryPermission,
  currentNounPlanFilterName
} from '../../../../../utils/businessFunction'
import NoPermissionUserCard from './../../../../../components/NoPermissionUserCard/index'
import UserCard from './../../../../../components/UserCard/index'
import globalsetStyles from '@/globalset/css/globalClassName.less'
import DynamicContain from './component/DynamicContain'
import { connect } from 'dva/index'
import { getGlobalData } from '../../../../../utils/businessFunction'
import { isApiResponseOk } from '../../../../../utils/handleResponseData'
import {
  organizationInviteWebJoin,
  commInviteWebJoin
} from '../../../../../services/technological/index'
import { cursorMoveEnd } from '../../../../../components/ProcessDetailModal/components/handleOperateModal'
import CustomFields from '../../../../../components/CustomFields'
import CustomCategoriesOperate from '../../../../../components/CustomFields/CustomCategoriesOperate'
import moment from 'moment'
import {
  timestampToTimeNormal,
  timeToTimestamp
} from '../../../../../utils/util'

const TextArea = Input.TextArea

// const detaiDescription = '欢迎使用聆悉，为了帮助你更好的上手使用好聆悉，我们为你提前预置了这个项目并放置一些帮助你理解每项功能特性的任务卡片。不会耽误你特别多时间，只需要抽空点开卡片并跟随里面的内容提示进行简单操作，即可上手使用。此处显示的文字为项目的介绍信息，旨在帮助参与项目的成员快速了解项目的基本概况，点击可编辑。如果使用中需要问题，可以随时联系我们进行交流或反馈：https://lingxi.di-an.com'
const detaiDescription = '添加简介'
// let timer;

@connect(mapStateToProps)
export default class DrawDetailInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isSoundsEvrybody: false, //confirm是否通知项目所有人
      isSoundsEvrybody_2: false, //edit是否通知项目所有人
      editDetaiDescription: false, //是否处于编辑状态
      detaiDescriptionValue: detaiDescription,
      defaultDescriptionVal: detaiDescription, // 默认的描述数据 用来保存和对比的
      ShowAddMenberModalVisibile: false,
      dynamic_header_sticky: false, // 项目动态是否固定, 默认为false, 不固定
      textArea_val: '', // 用来判断是否有用户输入
      is_show_dot: true, // 是否显示点点点, 默认为true 显示
      is_dynamic_scroll: false, // 判断项目动态列表是否在滚动, 默认为false
      temp_top: ''
    }
    this.onScroll = this.onScroll.bind(this)
    this.timer = null
  }

  // 子组件调用父组件的方法
  getDispatchDynamicList = board_id => {
    // console.log('进来了', 'sssss')
    const { dispatch } = this.props
    dispatch({
      type: 'projectDetail/getProjectDynamicsList',
      payload: {
        next_id: '0',
        board_id
      }
    })
  }

  // 监听滚动事件
  onScroll(e, board_id) {
    window.addEventListener('scroll', this.dynamicScroll(e, board_id))
  }

  // 动态的滚动事件
  dynamicScroll = (e, board_id) => {
    const { p_next_id } = this.props
    const { is_dynamic_scroll, temp_top } = this.state
    const { dispatch } = this.props
    let infoTop = e && e.target.scrollTop // 滚动的距离
    let manImageListTop = this.refs.manImageList.offsetTop // 获取成员列表的距离
    // 导航栏固定事件
    if (infoTop > manImageListTop) {
      this.setState({
        dynamic_header_sticky: true
      })
    } else {
      this.setState({
        dynamic_header_sticky: false
      })
    }

    // 距离底部20的时候触发加载
    if (
      e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight <
      20
    ) {
      // console.log('ssssss', 'tobottom')
      if (this.timer) {
        clearTimeout(this.timer)
      }
      this.timer = setTimeout(() => {
        this.setState({
          is_dynamic_scroll: false,
          temp_top: infoTop
        })
      }, 500)
      this.setState({
        is_dynamic_scroll: true
      })

      // 如果说next_id不存在, 那么久不能滚动加载, 显示没有更多了
      if (!p_next_id) {
        this.setState({
          is_dynamic_scroll: false
        })
      }
      if (is_dynamic_scroll && p_next_id) {
        dispatch({
          type: 'projectDetail/getProjectDynamicsList',
          payload: {
            board_id,
            next_id: p_next_id
          }
        })
        this.setState({
          is_dynamic_scroll: false
        })
      }
    }

    // }
  }

  // 销毁滚动事件
  componentWillUnmount() {
    window.removeEventListener('scroll', this.dynamicScroll)
  }

  // 检测当前成员是否是自己, 如果是, 那么不能移除自己
  checkCurrentOperatorMemberWhetherSelf = shouldDelItem => {
    const { id } = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : {}
    // console.log(id, shouldDelItem, 'ssssss')
    let flag
    if (shouldDelItem == id) {
      flag = true
      return flag
    } else {
      flag = false
      return flag
    }
  }

  // 项目成员角色点击事件
  handleSetRoleMenuClick(props, e) {
    if (!checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MEMBER)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const { key, domEvent } = e
    domEvent && domEvent.stopPropagation()
    const { projectDetailInfoData = {} } = this.props
    const { board_id } = projectDetailInfoData //data是参与人列表
    const { user_id } = props
    if (/^role_\w+/.test(key)) {
      const { dispatch } = this.props
      dispatch({
        type: 'projectDetail/setMemberRoleInProject',
        payload: {
          board_id,
          user_id,
          role_id: key.replace('role_', '')
        }
      })
      return false
    }
    switch (key) {
      case 'removeMember':
        // console.log(this.checkCurrentOperatorMemberWhetherSelf(user_id), 'ssssss')
        if (this.checkCurrentOperatorMemberWhetherSelf(user_id)) {
          message.warn('请不要移除自己', MESSAGE_DURATION_TIME)
          return false
        }
        this.confirm({ board_id, user_id })
        break
      default:
        break
    }
  }
  //出现confirm-------------start
  setIsSoundsEvrybody(e) {
    this.setState({
      isSoundsEvrybody: e.target.checked
    })
  }
  confirm(data) {
    const that = this
    Modal.confirm({
      title: '确认将他移出项目吗？',
      zIndex: 2000,
      content: (
        <div style={{ color: 'rgba(0,0,0, .8)', fontSize: 14 }}>
          <span>退出后将无法获取该项目的相关动态</span>
          {/*<div style={{marginTop:20,}}>*/}
          {/*<Checkbox style={{color:'rgba(0,0,0, .8)',fontSize: 14, }} onChange={this.setIsSoundsEvrybody.bind(this)}>通知项目所有参与人</Checkbox>*/}
          {/*</div>*/}
        </div>
      ),
      okText: '确认',
      cancelText: '取消',
      onOk() {
        const { dispatch } = that.props
        dispatch({
          type: 'projectDetail/removeMenbers',
          payload: {
            ...data
          }
        })
      }
    })
  }
  //出现confirm-------------end

  //点击区域描述可编辑区域-----------start
  setEditDetaiDescriptionShow() {
    if (!checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_EDIT)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const {
      projectDetailInfoData: { description }
    } = this.props
    this.setState({
      editDetaiDescription: true,
      detaiDescriptionValue: '',
      // textArea_val: description.replace(/\r\n/g, "↵")
      textArea_val: description.replace(/\r\n/g, '<br />')
    })
    setTimeout(() => {
      let obj = document.getElementById('board_detail_info')
      cursorMoveEnd(obj)
    }, 200)
  }
  setEditIsSoundsEvrybody(e) {
    this.setState({
      isSoundsEvrybody_2: e.target.checked
    })
  }
  // 简介文本的输入框事件
  textAreaChange(e) {
    this.setState({
      detaiDescriptionValue: e.target.value || detaiDescription,
      textArea_val: e.target.value
    })
    // const { projectDetailInfoData: { description }, projectDetailInfoData } = this.props
    // if (description == '') return
    // projectDetailInfoData['description'] = e.target.value
  }
  // editSave(board_id, e) {
  //   const { projectDetailInfoData = {} } = this.props

  //   const obj = {
  //     isSoundsEvrybody_2: this.state.isSoundsEvrybody_2,
  //     description: projectDetailInfoData['description'],
  //     board_id
  //   }
  //   const { dispatch } = this.props
  //   dispatch({
  //     type: 'projectDetail/updateProject',
  //     payload: {
  //       ...obj
  //     }
  //   })
  //   this.setState({
  //     editDetaiDescription: false
  //   })
  // }
  //点击区域描述可编辑区域-----------end

  //点击添加职员操作
  setShowAddMenberModalVisibile() {
    if (!checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MEMBER)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    this.setState({
      ShowAddMenberModalVisibile: !this.state.ShowAddMenberModalVisibile
    })
  }

  // 修改文本框的事件
  setTextAreaDescription(board_id) {
    const {
      projectDetailInfoData: { description },
      dispatch,
      projectDetailInfoData = {}
    } = this.props
    const { textArea_val } = this.state
    const obj = {
      isSoundsEvrybody_2: this.state.isSoundsEvrybody_2,
      description: textArea_val.replace(/\r/g, '<br />'),
      board_id
    }
    dispatch({
      type: 'projectDetail/updateProject',
      payload: {
        ...obj
      }
    })
    dispatch({
      type: 'projectDetail/updateDatas',
      payload: {
        projectDetailInfoData: {
          ...projectDetailInfoData,
          description: textArea_val
        }
      }
    })
    this.setState({
      editDetaiDescription: false,
      textArea_val: ''
    })
  }

  // 获取文本域的键盘事件
  handleKeyDown(e, board_id) {
    let code = e.keyCode
    const { detaiDescriptionValue, defaultDescriptionVal } = this.state
    const {
      projectDetailInfoData: { description }
    } = this.props
    // if (code == '13') {
    //   if(detaiDescriptionValue == defaultDescriptionVal) {
    //     if (description == '') {
    //       this.setTextAreaDescription(board_id)
    //       return
    //     }
    //     this.setState({
    //       editDetaiDescription: false,
    //       textArea_val: ''
    //     })
    //     return
    //   }
    // this.setTextAreaDescription(board_id)
    // }
  }

  // 获取文本框失去焦点的事件
  handleOnBlur(e, board_id) {
    const {
      detaiDescriptionValue,
      defaultDescriptionVal,
      textArea_val
    } = this.state
    const {
      projectDetailInfoData: { description },
      projectDetailInfoData = {}
    } = this.props
    if (textArea_val.trim() != description) {
      this.setTextAreaDescription(board_id)
    } else {
      this.setState({
        editDetaiDescription: false,
        textArea_val: ''
      })
    }
  }

  // 是否显示全部成员
  handdleTriggerModal() {
    this.setState({
      is_show_dot: false
    })
    this.props.handleTriggetModalTitle()
  }

  // 邀请人进项目
  addMenbersInProject = data => {
    const {
      invitationType,
      invitationId,
      rela_Condition,
      dispatch,
      projectDetailInfoData = {}
    } = this.props
    const { org_id } = projectDetailInfoData
    const temp_ids = data.users.split(',')
    const invitation_org = localStorage.getItem('OrganizationId')
    organizationInviteWebJoin({
      _organization_id: org_id,
      type: invitationType,
      users: temp_ids
    }).then(res => {
      if (res && res.code === '0') {
        commInviteWebJoin({
          id: invitationId,
          role_id: res.data.role_id,
          type: invitationType,
          users: res.data.users,
          rela_condition: rela_Condition
        }).then(res => {
          if (isApiResponseOk(res)) {
            setTimeout(() => {
              message.success('邀请成功', MESSAGE_DURATION_TIME)
            }, 500)
            const { projectDetailInfoData = {} } = this.props
            const { board_id } = projectDetailInfoData
            if (invitationType === '1') {
              dispatch({
                type: 'projectDetail/projectDetailInfo',
                payload: {
                  id: board_id
                }
              })
              dispatch({
                type: 'workbenchTaskDetail/projectDetailInfo',
                payload: {
                  id: board_id
                }
              })
            }
          }
        })
      }
    })
  }

  // 添加字段
  handleAddCustomField = (checkedKeys = [], calback) => {
    const { projectDetailInfoData = {} } = this.props
    let { board_id } = projectDetailInfoData
    this.props
      .dispatch({
        type: 'organizationManager/createRelationCustomField',
        payload: {
          fields: checkedKeys,
          relation_id: board_id,
          source_type: '1'
        }
      })
      .then(res => {
        if (isApiResponseOk(res)) {
          this.props.dispatch({
            type: 'projectDetail/projectDetailInfo',
            payload: {
              id: board_id
            }
          })
          if (calback && typeof calback == 'function') calback()
        } else {
          if (calback && typeof calback == 'function') calback()
        }
      })
  }

  // 修改弹窗数据
  handleUpdateModelDatas = ({ data, type }) => {
    const {
      projectDetailInfoData,
      projectDetailInfoData: { fields = [] }
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
    let new_projectDetailInfoData = { ...projectDetailInfoData }
    new_projectDetailInfoData['fields'] = new_fields
    this.props.dispatch({
      type: 'projectDetail/updateDatas',
      payload: {
        projectDetailInfoData: new_projectDetailInfoData
      }
    })
  }

  updateDateDatas = ({ name, value, isSetDatas, relative_time }) => {
    const {
      projectDetailInfoData = {},
      projectDetailInfoData: { board_id, board_set = {} }
    } = this.props
    const { relative_time: relative_time_ } = board_set
    const { dispatch } = this.props
    let new_projectDetailInfoData = { ...projectDetailInfoData }
    if (isSetDatas) {
      if (relative_time) {
        new_projectDetailInfoData['board_set'] = {
          ...board_set,
          [name]: value,
          relative_time: relative_time_ ? relative_time_ : relative_time
        }
      } else {
        new_projectDetailInfoData['board_set'] = {
          ...board_set,
          [name]: value
        }
      }
    } else {
      new_projectDetailInfoData[name] = value
    }
    let obj = {
      board_id,
      [name]: value,
      isNotRequestProjectDetailData: true
    }
    relative_time
      ? (obj.relative_time = relative_time)
      : name == 'relative_time'
      ? (obj.relative_time = value)
      : delete obj.relative_time
    dispatch({
      type: isSetDatas
        ? 'projectDetail/setProject'
        : 'projectDetail/updateProject',
      payload: {
        ...obj
      }
    }).then(res => {
      if (isApiResponseOk(res)) {
        // this.setState({
        //   projectDetailInfoData: new_projectDetailInfoData
        // })
        dispatch({
          type: 'projectDetail/updateDatas',
          payload: {
            projectDetailInfoData: new_projectDetailInfoData
          }
        })
      }
    })
  }

  // 表示设置一个基准时间
  setRelativeTime = () => {
    const now_time = new Date()
    return now_time.getTime()
  }

  // 更新日期模式
  handleDateMode = e => {
    let value = e.target.value
    const relative_time_ = this.setRelativeTime()
    this.updateDateDatas({
      name: 'date_mode',
      value,
      isSetDatas: true
      // relative_time: value == '1' ? relative_time_ : null
    })
  }

  handleRelativeChange = timeString => {
    const relative_timeStamp = timeToTimestamp(timeString)
    this.updateDateDatas({
      name: 'relative_time',
      value: relative_timeStamp,
      isSetDatas: true
    })
  }

  // 更新日期格式
  handleDateFormat = e => {
    let value = e.target.value
    this.updateDateDatas({ name: 'date_format', value, isSetDatas: true })
  }

  // 禁用截止时间
  disabledDueTime = due_time => {
    const { projectDetailInfoData = {} } = this.props
    const { start_time } = projectDetailInfoData
    if (!start_time || !due_time) {
      return false
    }
    const newStartTime =
      start_time.toString().length > 10
        ? Number(start_time).valueOf() / 1000
        : Number(start_time).valueOf()
    return Number(due_time.valueOf()) / 1000 < newStartTime
  }

  // 禁用开始时间
  disabledStartTime = start_time => {
    const {
      projectDetailInfoData: { board_set = {} }
    } = this.props
    const { due_time } = board_set
    if (!start_time || !due_time) {
      return false
    }
    const newDueTime =
      due_time.toString().length > 10
        ? Number(due_time).valueOf() / 1000
        : Number(due_time).valueOf()
    return Number(start_time.valueOf()) / 1000 >= newDueTime //Number(due_time).valueOf();
  }

  startDatePickerChange = timeString => {
    const start_timeStamp = timeToTimestamp(timeString)
    this.updateDateDatas({
      name: 'start_time',
      value: start_timeStamp,
      isSetDatas: true
    })
  }

  endDatePickerChange = timeString => {
    const due_timeStamp = timeToTimestamp(timeString)
    this.updateDateDatas({
      name: 'due_time',
      value: due_timeStamp,
      isSetDatas: true
    })
  }

  timePrecision = time => {
    time =
      time.toString().length === 10
        ? time.toString().length === 13
          ? Number(time)
          : Number(time) * 1000
        : Number(time)
    return time
  }

  // 是否显示当前年份 true 表示是今年
  whetherShowCurrentYear = timestamp => {
    const timestampNew =
      String(timestamp).length === 10
        ? Number(timestamp) * 1000
        : Number(timestamp)
    let date = new Date(timestampNew)
    return date.getFullYear() == new Date().getFullYear()
  }

  render() {
    const {
      editDetaiDescription,
      detaiDescriptionValue,
      defaultDescriptionVal,
      dynamic_header_sticky,
      is_show_dot,
      is_show_more
    } = this.state
    const {
      projectInfoDisplay,
      isInitEntry,
      projectDetailInfoData = {},
      projectRoles = [],
      p_next_id,
      projectDynamicsList = [],
      invitationId,
      invitationOrg,
      invitationType
    } = this.props

    let {
      board_id,
      board_name,
      data = [],
      description,
      residue_quantity,
      realize_quantity,
      org_id,
      fields = [],
      board_set = {}
    } = projectDetailInfoData //data是参与人列表
    const {
      date_mode,
      date_format,
      start_time,
      due_time,
      relative_time
    } = board_set
    data = data || []
    const avatarList = data.concat([1]) //[1,2,3,4,5,6,7,8,9]//长度再加一
    // 是否存在动态列表
    // let is_show_dynamic = this.refs.dynamic_contain && this.refs.dynamic_contain.props.model.datas.projectDynamicsList.length != 0 ? true : false
    let is_show_dynamic =
      this.refs.dynamic_contain &&
      this.refs.dynamic_contain.props.projectDynamicsList.length != 0
        ? true
        : false
    // let is_show_dynamic = projectDynamicsList.length != 0 ? true : false
    const manImageDropdown = props => {
      const {
        role_id,
        role_name = '...',
        name,
        email = '...',
        avatar,
        mobile = '...',
        user_id,
        organization = '...',
        we_chat = '...'
      } = props
      const { id } = localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo'))
        : {}
      // if (!isHasOrgMemberQueryPermission()) {
      //   return <NoPermissionUserCard avatar={avatar} full_name={role_name} />
      // }
      if (!checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MEMBER, board_id)) {
        return <NoPermissionUserCard avatar={avatar} full_name={role_name} />
      }
      // return (<UserCard avatar={avatar} email={email} name={name} mobile={mobile} role_name={''} />)
      return (
        <div className={DrawDetailInfoStyle.manImageDropdown}>
          <div
            style={{ position: 'relative' }}
            className={DrawDetailInfoStyle.manImageDropdown_top}
          >
            <div className={DrawDetailInfoStyle.left}>
              {avatar ? (
                <img src={avatar} />
              ) : (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 32,
                    backgroundColor: '#f2f2f2',
                    textAlign: 'center'
                  }}
                >
                  <Icon
                    type={'user'}
                    style={{ fontSize: 20, color: '#8c8c8c', marginTop: 9 }}
                  />
                </div>
              )}
            </div>
            <div className={DrawDetailInfoStyle.right}>
              <div className={DrawDetailInfoStyle.name}>{name || '佚名'}</div>
              <Tooltip title="该功能即将上线">
                <div className={DrawDetailInfoStyle.percent}>
                  <div style={{ width: '0' }}></div>
                  <div style={{ width: '0' }}></div>
                  <div style={{ width: '100%' }}></div>
                </div>
              </Tooltip>
            </div>
            {role_id === '3' && user_id == id ? (
              ''
            ) : (
              <Dropdown
                trigger={['click']}
                getPopupContainer={triggerNode => triggerNode.parentNode}
                overlay={manOperateMenu(props)}
                overlayClassName={DrawDetailInfoStyle.overlay_manOperateMenu}
              >
                <div
                  onClick={e => e.stopPropagation()}
                  className={DrawDetailInfoStyle.manImageDropdown_top_operate}
                >
                  <Icon type="ellipsis" theme="outlined" />
                </div>
              </Dropdown>
            )}
          </div>
          <div className={DrawDetailInfoStyle.manImageDropdown_middle}>
            <div className={DrawDetailInfoStyle.detailItem}>
              <div>职位：</div>
              <div>{role_name}</div>
            </div>
            {/*<div className={DrawDetailInfoStyle.detailItem}>*/}
            {/*<div>组织：</div>*/}
            {/*<div>{organization}</div>*/}
            {/*</div>*/}
            <div className={DrawDetailInfoStyle.detailItem}>
              <div>邮箱：</div>
              <div>{email}</div>
            </div>
            <div className={DrawDetailInfoStyle.detailItem}>
              <div>手机：</div>
              <div>{mobile}</div>
            </div>
            {/* <div className={DrawDetailInfoStyle.detailItem}>
              <div>微信：</div>
              <div>{we_chat}</div>
            </div> */}
          </div>
          {/*<div className={DrawDetailInfoStyle.manImageDropdown_bott}>*/}
          {/*<img src="" />*/}
          {/*</div>*/}
        </div>
      )
    }
    const manOperateMenu = props => {
      const { is_visitor } = props
      return (
        <Menu
          getPopupContainer={triggerNode => triggerNode.parentNode}
          style={{ width: '92px' }}
          onClick={this.handleSetRoleMenuClick.bind(this, props)}
        >
          {checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MEMBER) ? (
            <Menu.SubMenu
              trigger={['click']}
              title={<span onClick={e => e.stopPropagation()}>设置角色</span>}
              key={'setRole'}
            >
              {projectRoles.map((value, key) => {
                return (
                  <Menu.Item
                    key={`role_${value.id}`}
                    onClick={({ domEvent }) =>
                      domEvent && domEvent.stopPropagation()
                    }
                    style={{ textAlign: 'center', padding: 0, margin: 5 }}
                  >
                    <div
                      className={DrawDetailInfoStyle.elseProjectMemu}
                      style={{ textAlign: 'center' }}
                    >
                      {value.name}
                    </div>
                  </Menu.Item>
                )
              })}
            </Menu.SubMenu>
          ) : (
            ''
          )}

          {checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MEMBER) && (
            <Menu.Item
              key={'removeMember'}
              style={{ textAlign: 'center', padding: 0, margin: 0 }}
            >
              <div className={DrawDetailInfoStyle.elseProjectDangerMenu}>
                移除成员
              </div>
            </Menu.Item>
          )}
        </Menu>
      )
    }
    const EditArea = (
      <div>
        <TextArea
          id={'board_detail_info'}
          autoFocus
          maxLength={500}
          onBlur={e => {
            this.handleOnBlur(e, board_id)
          }}
          value={this.state.textArea_val} //.replace(/<br \/>/g, '↵')}
          placeholder={
            this.state.textArea_val != ''
              ? this.state.textArea_val
              : defaultDescriptionVal
          }
          autosize={true}
          // onKeyDown={(e) => { this.handleKeyDown(e, board_id) }}
          className={DrawDetailInfoStyle.editTextArea}
          onChange={this.textAreaChange.bind(this)}
        />
        {/* <div style={{ textAlign: 'right'}}> */}
        {/*<div>*/}
        {/*<Checkbox style={{color: 'rgba(0,0,0, .8)', fontSize: 14, marginTop: 10 }} onChange={this.setEditIsSoundsEvrybody.bind(this)}>通知项目所有参与人</Checkbox>*/}
        {/*</div>*/}
        {/* <Button type={'primary'} style={{fontSize: 14, marginTop: 10 }} onClick={this.editSave.bind(this, board_id)}>保存</Button> */}
        {/* </div> */}
      </div>
    )
    let value = (description || defaultDescriptionVal).replace(
      /\r\n/g,
      '<br />'
    )
    return (
      <div ref="detail_wrapper" style={{ marginLeft: '-20px' }}>
        <div
          id={'detailInfoOut'}
          style={{ paddingLeft: '24px' }}
          className={`${DrawDetailInfoStyle.detailInfoOut} ${globalsetStyles.global_vertical_scrollbar}`}
          onScrollCapture={e => {
            this.onScroll(e, board_id)
          }}
        >
          <div className={DrawDetailInfoStyle.brief}>
            <span
              className={`${globalsetStyles.authTheme} ${DrawDetailInfoStyle.icon} ${DrawDetailInfoStyle.brief_icon}`}
            >
              &#xe7f6;
            </span>
            <span>{`${currentNounPlanFilterName(PROJECTS)}简介`}</span>
          </div>
          {!editDetaiDescription ? (
            <div
              // dangerouslySetInnerHTML={{
              //   __html: value
              // }}
              className={`${
                DrawDetailInfoStyle.Bottom
              } ${defaultDescriptionVal != description &&
                description != '' &&
                DrawDetailInfoStyle.editColor}`}
              onClick={this.setEditDetaiDescriptionShow.bind(this)}
            >
              {/* {description != '' ? description : defaultDescriptionVal} */}
              {value}
            </div>
          ) : (
            EditArea
          )}
          <div className={DrawDetailInfoStyle.member}>
            <span
              style={{ fontSize: 18 }}
              className={`${globalsetStyles.authTheme} ${DrawDetailInfoStyle.icon}`}
            >
              &#xe7af;
            </span>
            <span>{`${currentNounPlanFilterName(PROJECTS)}成员`}</span>
          </div>
          <div style={{ display: 'flex' }}>
            <div
              ref="manImageList"
              className={DrawDetailInfoStyle.manImageList}
            >
              {checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MEMBER) && (
                <Tooltip title="邀请新成员" placement="top">
                  <div
                    className={DrawDetailInfoStyle.addManImageItem}
                    onClick={this.setShowAddMenberModalVisibile.bind(this)}
                  >
                    <Icon
                      type="plus"
                      style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        marginTop: 8,
                        color: '#40A9FF'
                      }}
                    />
                  </div>
                </Tooltip>
              )}
              {avatarList.map((value, key) => {
                if (key < avatarList.length - 1) {
                  const { avatar, user_id } = value
                  return (
                    <div className={DrawDetailInfoStyle.manImageItem} key={key}>
                      <Dropdown overlay={manImageDropdown(value)}>
                        {avatar ? (
                          <img src={avatar} />
                        ) : (
                          <div
                            onClick={e => e.stopPropagation()}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 40,
                              backgroundColor: '#f2f2f2',
                              textAlign: 'center'
                            }}
                          >
                            <Icon
                              type={'user'}
                              style={{
                                fontSize: 20,
                                color: '#8c8c8c',
                                marginTop: 9
                              }}
                            />
                          </div>
                        )}
                      </Dropdown>
                    </div>
                  )
                }
              })}
            </div>

            {avatarList && avatarList.length > 9 && is_show_dot && (
              <Tooltip title="全部成员" placement="top">
                <div
                  style={{
                    marginTop:
                      !checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MEMBER) &&
                      '15px'
                  }}
                  onClick={() => {
                    this.handdleTriggerModal()
                  }}
                  className={DrawDetailInfoStyle.show_member}
                ></div>
              </Tooltip>
            )}
          </div>
          {/* 时间精度切换 */}
          <div className={DrawDetailInfoStyle.set_time_accuracy}>
            <div className={DrawDetailInfoStyle.set_time_item}>
              <div className={DrawDetailInfoStyle.set_time_label}>
                日期模式：
              </div>
              <div className={DrawDetailInfoStyle.set_time_content}>
                <Radio.Group
                  value={date_mode}
                  style={{ display: 'flex', width: '100%' }}
                  onChange={this.handleDateMode}
                >
                  <span style={{ width: '28%' }}>
                    <Radio value="0">具体时间</Radio>
                  </span>
                  <span>
                    <Radio value="1">相对时间</Radio>
                  </span>
                </Radio.Group>
              </div>
            </div>
            {date_mode == '1' ? (
              ''
            ) : (
              <div className={DrawDetailInfoStyle.set_time_item}>
                <div className={DrawDetailInfoStyle.set_time_label}>
                  日期精度：
                </div>
                <div className={DrawDetailInfoStyle.set_time_content}>
                  <Radio.Group
                    onChange={this.handleDateFormat}
                    value={date_format}
                    style={{ display: 'flex', width: '100%' }}
                  >
                    <span style={{ width: '28%' }}>
                      <Radio value="0">小时/分钟</Radio>
                    </span>
                    <span>
                      <Radio value="1">天</Radio>
                    </span>
                  </Radio.Group>
                </div>
              </div>
            )}
            {date_mode == '1' ? (
              <div className={DrawDetailInfoStyle.set_time_item}>
                <div className={DrawDetailInfoStyle.set_time_label}>
                  基准时间：
                </div>
                <div className={DrawDetailInfoStyle.set_time_content}>
                  <span
                    style={{
                      display: 'flex',
                      width: '177px',
                      paddingLeft: '12px',
                      border: '1px solid #d9d9d9',
                      height: '32px',
                      lineHeight: '32px',
                      borderRadius: '4px'
                    }}
                  >
                    <div>
                      {this.whetherShowCurrentYear(relative_time)
                        ? `${new Date().getFullYear()}-`
                        : ''}
                      {timestampToTimeNormal(relative_time, '-', false)}
                    </div>
                  </span>
                </div>
              </div>
            ) : (
              <div className={DrawDetailInfoStyle.set_time_item}>
                <div className={DrawDetailInfoStyle.set_time_label}>
                  {currentNounPlanFilterName(PROJECTS)}周期：
                </div>
                <div className={DrawDetailInfoStyle.set_time_content}>
                  <div className={DrawDetailInfoStyle.set_start_time}>
                    <span>开始时间</span>
                    <span
                      style={{
                        display: 'flex',
                        width: '177px',
                        paddingLeft: '12px',
                        border: '1px solid #d9d9d9',
                        height: '32px',
                        lineHeight: '32px',
                        borderRadius: '4px'
                      }}
                    >
                      {date_format == '0' ? (
                        <div>
                          {this.whetherShowCurrentYear(start_time)
                            ? `${new Date().getFullYear()}-`
                            : ''}
                          {timestampToTimeNormal(start_time, '-', true)}
                        </div>
                      ) : (
                        <div>
                          {this.whetherShowCurrentYear(start_time)
                            ? `${new Date().getFullYear()}-`
                            : ''}
                          {timestampToTimeNormal(start_time, '-', false)}
                        </div>
                      )}
                      {/* {date_format == '0' ? (
                        <DatePicker
                          disabledDate={this.disabledStartTime}
                          showTime={{
                            defaultValue: moment('00:00', 'HH:mm'),
                            format: 'HH:mm'
                          }}
                          format="YYYY-MM-DD HH:mm"
                          onChange={this.startDatePickerChange}
                          value={
                            start_time && start_time != '0'
                              ? moment(new Date(this.timePrecision(start_time)))
                              : undefined
                          }
                        />
                      ) : (
                        <DatePicker
                          format="YYYY-MM-DD"
                          disabledDate={this.disabledStartTime}
                          onChange={this.startDatePickerChange}
                          value={
                            start_time && start_time != '0'
                              ? moment(new Date(this.timePrecision(start_time)))
                              : undefined
                          }
                        />
                      )} */}
                    </span>
                  </div>
                </div>
                <div className={DrawDetailInfoStyle.set_time_content}>
                  <div className={DrawDetailInfoStyle.set_start_time}>
                    <span>结束时间</span>
                    <span
                      style={{
                        display: 'flex',
                        width: '177px',
                        paddingLeft: '12px',
                        border: '1px solid #d9d9d9',
                        height: '32px',
                        lineHeight: '32px',
                        borderRadius: '4px'
                      }}
                    >
                      {date_format == '0' ? (
                        <div>
                          {this.whetherShowCurrentYear(due_time)
                            ? `${new Date().getFullYear()}-`
                            : ''}
                          {timestampToTimeNormal(due_time, '-', true)}
                        </div>
                      ) : (
                        <div>
                          {this.whetherShowCurrentYear(due_time)
                            ? `${new Date().getFullYear()}-`
                            : ''}
                          {timestampToTimeNormal(due_time, '-', false)}
                        </div>
                      )}
                      {/* {date_format == '0' ? (
                        <DatePicker
                          showTime={{
                            defaultValue: moment('23:59', 'HH:mm'),
                            format: 'HH:mm'
                          }}
                          format="YYYY-MM-DD HH:mm"
                          disabledDate={this.disabledDueTime}
                          onChange={this.endDatePickerChange}
                          value={
                            due_time && due_time != '0'
                              ? moment(new Date(this.timePrecision(due_time)))
                              : undefined
                          }
                        />
                      ) : (
                        <DatePicker
                          format="YYYY-MM-DD"
                          disabledDate={this.disabledDueTime}
                          onChange={this.endDatePickerChange}
                          value={
                            due_time && due_time != '0'
                              ? moment(new Date(this.timePrecision(due_time)))
                              : undefined
                          }
                        />
                      )} */}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div style={{ marginTop: '32px' }}>
            <CustomCategoriesOperate
              fields={fields}
              handleUpdateModelDatas={this.handleUpdateModelDatas}
            />
          </div>
          <CustomFields
            relations_fields={fields}
            org_id={org_id}
            handleAddCustomField={this.handleAddCustomField}
            placement="bottomLeft"
            getPopupContainer={document.getElementById('detailInfoOut')}
          >
            <div className={DrawDetailInfoStyle.add_custom_fields}>
              <span className={globalsetStyles.authTheme}>&#xe8fe;</span>
              <span>添加字段</span>
            </div>
          </CustomFields>
          {/* <div className={DrawDetailInfoStyle.dynamic}>
              <div className={ DrawDetailInfoStyle.dy_title }>
                <div
                  style={{width: '100%', display: 'flex', alignItems: 'center', display: dynamic_header_sticky ? 'none' : 'block'}}
                  ref="dynamic_header"
                  className={DrawDetailInfoStyle.dynamic_header}>
                  <span className={`${globalsetStyles.authTheme} ${DrawDetailInfoStyle.icon}`}>&#xe60e;</span>
                  <span>项目动态</span>
                  <Tooltip title="过滤动态" placement="top">
                    <div className={DrawDetailInfoStyle.filter}>
                      <span className={`${globalsetStyles.authTheme} ${DrawDetailInfoStyle.icon}`}>&#xe7c7;</span>
                    </div>
                  </Tooltip>
                </div>
              </div>
              <div className={DrawDetailInfoStyle.dynamic_contain}>
                <DynamicContain ref="dynamic_contain" {...this.props} board_id={board_id} getDispatchDynamicList={this.getDispatchDynamicList} />
              </div>
              {
                is_show_dynamic ? (
                  <div style={{ textAlign: 'center', color:'rgba(0,0,0,0.45)', marginBottom: '15', display: !p_next_id ? 'block' : 'none'}}>没有更多动态啦~</div>
                ) :(
                  null
                )
              }

            </div> */}
          <ShowAddMenberModal
            addMenbersInProject={this.addMenbersInProject}
            show_wechat_invite={true}
            invitationId={board_id}
            invitationType={invitationType}
            invitationOrg={org_id}
            {...this.props}
            board_id={board_id}
            modalVisible={this.state.ShowAddMenberModalVisibile}
            setShowAddMenberModalVisibile={this.setShowAddMenberModalVisibile.bind(
              this
            )}
          />
        </div>
        {/* <div style={{display: dynamic_header_sticky ? 'block' : 'none'}} className={DrawDetailInfoStyle.shadow}>
          <div
            style={{width: '100%', display: 'flex', alignItems: 'center'}}
            ref="dynamic_header"
            className={DrawDetailInfoStyle.dynamic_header}>
            <span className={`${globalsetStyles.authTheme} ${DrawDetailInfoStyle.icon}`}>&#xe60e;</span>
            <span>项目动态</span>
            <Tooltip title="过滤动态" placement="top">
              <div className={DrawDetailInfoStyle.filter}>
                <span className={`${globalsetStyles.authTheme} ${DrawDetailInfoStyle.icon}`}>&#xe7c7;</span>
              </div>
            </Tooltip>
          </div>
        </div> */}
      </div>
    )
  }
}

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
  projectDetail: {
    datas: {
      projectInfoDisplay,
      isInitEntry,
      projectDetailInfoData = {},
      projectRoles = []
    }
  },
  technological: {
    datas: { userBoardPermissions }
  }
}) {
  return {
    projectInfoDisplay,
    isInitEntry,
    projectDetailInfoData,
    projectRoles,
    userBoardPermissions
  }
}
