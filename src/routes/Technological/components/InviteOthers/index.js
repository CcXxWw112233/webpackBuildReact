import React, { Component } from 'react'
import { Button, Select, Spin, message, Tooltip } from 'antd'
import styles from './index.less'
import { connect } from 'dva'
import { debounce } from './../../../../utils/util'
import { validateTel, validateEmail } from './../../../../utils/verify'
import {
  associateUser,
  getCurrentOrgAccessibleAllMembers,
  getCurrentOrgAllMembers,
  getProjectUserList
} from './../../../../services/technological/workbench'
import defaultUserAvatar from './../../../../assets/invite/user_default_avatar@2x.png'
import { getPinyin } from './../../../../utils/pinyin'
import classNames from 'classnames/bind'
import {
  getAccessibleGroupList,
  getGroupList
} from './../../../../services/technological/organizationMember'
import { isApiResponseOk } from '../../../../utils/handleResponseData'
import noDataImg from './asset/no_data_select.png'
import {
  currentNounPlanFilterName,
  setRequestHeaderBaseInfo
} from '../../../../utils/businessFunction'
import {
  PROJECTS,
  REQUEST_DOMAIN,
  REQUEST_INTERGFACE_VERSIONN
} from '../../../../globalset/js/constant'
import globalStyles from '@/globalset/css/globalClassName.less'
// import Avatars from '@dicebear/avatars'
// import SpriteBoottts from '@dicebear/avatars-bottts-sprites'
import Cookies from 'js-cookie'
import axios from 'axios'
let cx = classNames.bind(styles)

const Option = Select.Option

@connect(
  ({
    technological: {
      datas: { currentSelectOrganize = {} }
    },
    cooperationPush: { new_message = {} }
  }) => ({
    currentSelectOrganize,
    new_message
  })
)
class InviteOthers extends Component {
  constructor(props) {
    super(props)
    this.fetchUsers = debounce(this.fetchUsers, 300)
    this.state = {
      local_organization_id: this.props._organization_id, //传递进来的orgid
      inputValue: [],
      inputRet: [],
      fetching: false, // 是否在搜索查询
      selectedMember: [], //已经选择的成员或平台外人员
      currentOrgAllMembersList: [], //人员列表
      membersListToSelect: [], //人员选择列表
      projectList: [], //我参与的项目列表
      projectUserList: [],
      groupList: [], //组织职员分组
      currentSyncSetsMemberList: {}, //原生的已经被同步的集合的所有成员，此处不能保存成数组，更不能过滤重复的人员，因为如果取消同步的时候，会移除已同步的集合的交集处的人员，引发意外的bug      isInSelectedList: false,
      currentMemberListSet: 'org', //当前显示的集合 org || group-id || project-id
      isInSelectedList: false, //是否仅显示列表的
      step: 'home' //当前的步进 home || group-list || group-id || project-list ||project-id
    }
    this.options = {
      radius: 32,
      width: 32,
      height: 32
    }
    this.avatars = {}
  }

  // 验证手机号或者是邮箱
  isValidMobileOrValidEmail = user => {
    return validateEmail(user) || validateTel(user)
  }

  // 输入框失去焦点的事件
  handleInputBlur = () => {
    this.setState({
      inputValue: [],
      inputRet: []
    })
  }

  // 是否正在搜索
  handleSearchUser = user => {
    // console.log('search....................')
    this.setState(
      {
        inputValue: [],
        inputRet: [],
        fetching: false
      },
      () => {
        this.fetchUsers(user)
        // if (isValidUser) {
        //   this.fetchUsers(user)
        // }
      }
    )
  }

  // ???? 没懂
  genSplitSymbol = () => '$%$'
  genUserValueStr = (icon, name, user, isFromPlatForm, id) => {
    const splitSymbol = this.genSplitSymbol()
    return `${icon}${splitSymbol}${name}${splitSymbol}${user}${splitSymbol}${isFromPlatForm}${
      id ? `${splitSymbol}${id}` : ''
    }`
  }

  // 给一个成员默认的结构
  genUserToDefinedMember = user => {
    // console.log('sssss', { user })
    if (!user || !(user.id || user.user_id)) return
    const {
      avatar = 'default',
      full_name = 'default',
      name,
      mobile,
      email,
      id,
      user_id
    } = user
    const mobileOrEmail = mobile ? mobile : email
    return this.parseUserValueStr(
      this.genUserValueStr(avatar, name, mobileOrEmail, true, id ? id : user_id)
    )
  }

  // 分析用户
  parseUserValueStr = userValueStr => {
    if (!userValueStr) return
    const [icon, name, user, isFromPlatForm, id] = userValueStr.split(
      this.genSplitSymbol()
    )
    return {
      type: isFromPlatForm === 'true' ? 'platform' : 'other',
      icon,
      name,
      user,
      id: id ? id : ''
    }
  }

  // base64转文件
  dataURLtoFile = (dataurl, filename) => {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  // 进行搜索, 发送请求
  fetchUsers = user => {
    const trimStr = str => {
      return str.replace(/(^\s+)|(\s+$)/g, '')
    }
    const { _organization_id } = this.props
    let new_user = trimStr(user)
    const params = {
      associate_param: new_user,
      _organization_id,
      type: validateTel(new_user) || validateEmail(new_user) ? '2' : '1'
    }
    if (!new_user || new_user == '' || new_user == ' ') return
    this.setState(
      {
        inputRet: [],
        fetching: true
      },
      () => {
        //发起请求
        associateUser(params)
          .then(res => {
            // console.log('res = 发起', res)
            if (res.code && res.code === '0') {
              //如果查到了用户
              if (res.data && res.data.length) {
                const users = res.data.map(i => {
                  const { avatar, name, id, mobile, email } = i
                  const value = this.genUserValueStr(
                    avatar,
                    name,
                    user,
                    true,
                    id
                  )
                  return {
                    value,
                    avatar,
                    user: mobile ? mobile : email ? email : '',
                    name
                  }
                })

                // const { avatar, nickname, id } = res.data
                // const value = this.genUserValueStr(
                //   avatar,
                //   nickname,
                //   user,
                //   true,
                //   id
                // )
                this.setState({
                  // inputRet: [
                  //   { value, avatar, user, name: nickname }
                  // ],
                  inputRet: users,
                  fetching: false
                })
              } else {
                const isValidUser = this.isValidMobileOrValidEmail(user)
                if (!isValidUser) {
                  this.setState({
                    fetching: false
                  })
                  return
                }

                const value = this.genUserValueStr(
                  'default',
                  'default',
                  user,
                  false
                )
                const item = {
                  value,
                  avatar: 'default',
                  user,
                  name: null
                }
                this.setState({
                  inputRet: [item],
                  fetching: false
                })
              }
            } else {
              this.setState({
                fetching: false
              })
              // message.error('获取联想用户失败')
            }
          })
          .catch(err => {
            this.setState({
              fetching: false
            })
            // message.error('获取联想用户失败')
          })
      }
    )
  }

  // 搜索框的chg事件
  handleInputSelected = value => {
    const { selectedMember } = this.state
    const selectedUser = this.parseUserValueStr(value.key)
    const isHasSameMemberInSelectedMember = () =>
      selectedMember.find(item =>
        item.id
          ? item.id === selectedUser.id
          : item.user
          ? item.user === selectedUser.user
          : false
      )
    //如果该用户已经在被选择的列表中了
    if (isHasSameMemberInSelectedMember()) {
      message.destroy()
      message.info('已选择该用户')
      this.setState({
        inputValue: [],
        inputRet: [],
        fetching: false
      })
      return
    }
    this.setState(
      {
        selectedMember: [...selectedMember, selectedUser],
        inputValue: [],
        inputRet: [],
        fetching: false
      },
      () => {
        this.handleReturnResultWhenNotShowSubmitBtn()
      }
    )
  }

  // 当没有提交的时候返回的结果
  handleReturnResultWhenNotShowSubmitBtn = () => {
    const { handleInviteMemberReturnResult, isShowSubmitBtn } = this.props
    if (isShowSubmitBtn) return
    const { selectedMember = [] } = this.state
    handleInviteMemberReturnResult(selectedMember)
  }

  // 取消选中时的回调
  handleInputDeselected = value => {
    const selectedUser = this.parseUserValueStr(value.key)
    const { selectedMember } = this.state
    this.setState(
      {
        selectedMember: selectedMember.filter(
          item => item.user !== selectedUser.user
        )
      },
      () => {
        this.handleReturnResultWhenNotShowSubmitBtn()
      }
    )
  }
  handleInputChange = value => {
    //这个函数根本就不会执行？？？
    // this.setState({
    //   inputValue: value,
    //   inputRet: [],
    //   fetching: false
    // })
  }

  // 给用户设置的默认身份等...
  genOptionLabel = item => {
    const { avatar, user, name } = item
    // let svg = this.avatars.create(user)
    //默认
    if (avatar === 'default') {
      return (
        <p className={styles.input__select_wrapper}>
          <span className={styles.input__select_avatar_img}>
            <img
              src={defaultUserAvatar}
              style={{ borderRadius: '50%' }}
              width="24"
              height="24"
              alt=""
            />
          </span>
          <span className={styles.input__select_user}>{user}</span>
          <span className={styles.input__select_name}>
            ({name ? name : '匿名用户'})
          </span>
        </p>
      )
    }
    return (
      <p className={styles.input__select_wrapper}>
        <span className={styles.input__select_avatar_img}>
          <img
            src={this.isAvatarValid(avatar) ? avatar : defaultUserAvatar}
            style={{ borderRadius: '50%' }}
            width="24"
            height="24"
            alt=""
          />
        </span>
        <span className={styles.input__select_user}>{user}</span>
        <span className={styles.input__select_name}>
          ({name ? name : '匿名用户'})
        </span>
      </p>
    )
  }

  // 删除选中的用户的回调
  delFromSelectedMember = item => {
    this.setState(
      state => {
        const { selectedMember } = state
        return {
          selectedMember: selectedMember.filter(
            i => i.id !== (item.id || item.user_id)
          )
        }
      },
      () => {
        this.handleReturnResultWhenNotShowSubmitBtn()
      }
    )
  }

  // 添加用户的回调
  addMemberToSelectedMember = item => {
    const { selectedMember } = this.state
    const isMemberHasInSelectedMember = () =>
      selectedMember.find(each => each.id === (item.id || item.user_id))
    if (isMemberHasInSelectedMember()) return
    this.setState(
      {
        selectedMember: [item, ...selectedMember]
      },
      () => {
        this.handleReturnResultWhenNotShowSubmitBtn()
      }
    )
  }

  // 点击头像上的小x将用户移除列表的事件
  handleClickedResultListIcon = (item, e) => {
    if (e) e.stopPropagation()
    this.delFromSelectedMember(item)
  }

  // ？？？？
  handleToggleMemberInSelectedMember = (item, e) => {
    if (e) e.stopPropagation()
    const { selectedMember } = this.state
    const member = this.genUserToDefinedMember(item)
    const isMemberHasInSelectedMember = () =>
      selectedMember.find(each => each.id === (member.id || member.user_id))
    if (isMemberHasInSelectedMember()) {
      return this.delFromSelectedMember(member)
    }
    return this.addMemberToSelectedMember(member)
  }

  // 是否是有效的头像
  isAvatarValid = avatar => {
    return avatar && typeof avatar === 'string' && avatar.startsWith('http')
  }

  // 这是验证每一个用户的什么？？？？ 难道是 名称？？？？？？？
  checkMemberInSelectedMember = item => {
    const { selectedMember } = this.state
    const mobileOrEmail = item.mobile ? item.mobile : item.email
    return selectedMember.find(
      each => each.type === 'platform' && each.id == (item.id || item.user_id)
    )
  }

  // 这是对用户列表进行排序, 为什么要排序？？？
  sortMemberListByCapital = (arr = []) => {
    if (!arr.length) return []
    return arr.sort((a, b) => {
      const getName = ele =>
        ele.full_name
          ? ele.full_name
          : ele.nickname
          ? ele.nickname
          : ele.mobile
          ? ele.mobile
          : ele.email
          ? ele.email
          : ele.name
          ? ele.name
          : 'garbage data'
      const aNameCapital = getPinyin(getName(a), '').toUpperCase()[0]
      const bNameCapital = getPinyin(getName(b), '').toUpperCase()[0]
      return aNameCapital.localeCompare(bNameCapital)
    })
  }

  // 获取分组, 分组的点击事件
  handleClickedInviteFromGroup = () => {
    this.setState({
      isInSelectedList: true,
      step: 'group-list'
    })
  }

  // 从项目中邀请, 首先获取项目列表
  handleClickedInviteFromProject = () => {
    const { dispatch } = this.props
    const initProjectList = () => {
      const { projectUserList } = this.state
      if (!projectUserList.length) {
        message.destroy()
        message.info('当前没有创建任何项目')
        return
      }
      this.setState({
        isInSelectedList: true,
        step: 'project-list',
        projectList: projectUserList.map(({ board_id, board_name }) => ({
          board_id,
          board_name
        }))
      })
    }
    // 获取项目列表 ？？
    const fetchProjectList = async () => {
      // await dispatch({
      //   type: 'workbench/getProjectUserList',
      //   payload: {}
      // })
      // await this.getProjectUserList()
      return initProjectList()
    }
    fetchProjectList()
  }

  /**
   * 从具体的项目列表中选择一个项目
   * @param {String} id 当前选择的项目ID
   * @param {Object} e 事件对象
   */
  handleClickedInviteFromProjectList = (id, e) => {
    if (e) e.stopPropagation()
    // 获取当前点击项目的成员
    const getProjectMembers = () => {
      const { projectUserList } = this.state
      const findProject = projectUserList.find(item => item.board_id === id)
      const isProjectWithUsers = findProject
        ? findProject.users && Array.isArray(findProject.users)
        : false
      return isProjectWithUsers ? findProject.users : []
    }
    this.setPageStep(false, `project-${id}`, getProjectMembers())
  }

  // 设置步骤
  setPageStep = (isInSelectedList, step, membersListToSelect = []) => {
    this.setState({
      isInSelectedList,
      step,
      membersListToSelect
    })
  }

  /**
   * 从分组列表中选择具体分组
   * @param {String} id 表示当前点击的分组ID
   * @param {Object} e 事件对象
   */
  handleClickedInviteFromGroupList = (id, e) => {
    if (e) e.stopPropagation()
    // 获取当前点击该分组的成员
    const getGroupMembers = () => {
      const { groupList = [] } = this.state
      const findGroup = groupList.find(item => item.id === id)
      const isGroupWithMembers = findGroup
        ? findGroup.members && Array.isArray(findGroup.members)
        : false
      return isGroupWithMembers ? findGroup.members : []
    }
    // 并为获取的成员添加full_name
    const nameToFullname = getGroupMembers().map(item =>
      Object.assign({}, item, { full_name: item.name })
    )
    // 然后更新当前进行的步骤
    this.setPageStep(false, `group-${id}`, nameToFullname)
  }

  // 点击返回的操作
  handleBack = () => {
    const { currentOrgAllMembersList } = this.state
    const { step } = this.state
    const [type, id] = step.split('-')
    //step: 当前的步进 home || group-list || group-id || project-list ||project-id
    const conditionMap = new Map([
      [
        `group-${id}`,
        () =>
          this.setState({
            isInSelectedList: true,
            step: 'group-list',
            membersListToSelect: []
          })
      ],
      [
        'group-list',
        () =>
          this.setState({
            isInSelectedList: false,
            step: 'home',
            membersListToSelect: Array.isArray(currentOrgAllMembersList)
              ? currentOrgAllMembersList
              : [] //人员选择列表
          })
      ],
      [
        `project-${id}`,
        () =>
          this.setState({
            isInSelectedList: true,
            step: 'project-list',
            membersListToSelect: []
          })
      ],
      [
        'project-list',
        () =>
          this.setState({
            isInSelectedList: false,
            step: 'home',
            membersListToSelect: Array.isArray(currentOrgAllMembersList)
              ? currentOrgAllMembersList
              : [] //人员选择列表
          })
      ]
    ])
    const callback = conditionMap.get(step)
    if (callback) callback()
  }

  // 是否全选
  isSelectedAll = () => {
    const { membersListToSelect } = this.state
    return membersListToSelect.every(item =>
      this.checkMemberInSelectedMember(item)
    )
  }

  // 全选的切换事件
  handleToggleSelectCurrentListAll = () => {
    const { membersListToSelect, selectedMember } = this.state
    //如果是全选状态，那么就全不选, 否则就全选
    // const isSelectedAll = () => membersListToSelect.every(item => this.checkMemberInSelectedMember(item))
    if (this.isSelectedAll()) {
      membersListToSelect.map(item =>
        this.handleToggleMemberInSelectedMember(item)
      )
    } else {
      const findItemNotInSelectedList = membersListToSelect
        .filter(item => {
          const member = this.genUserToDefinedMember(item)
          const isMemberHasInSelectedMember = () =>
            selectedMember.find(each => each.user === member.user)
          return !isMemberHasInSelectedMember()
        })
        .map(item => this.genUserToDefinedMember(item))
      this.setState(
        state => {
          const { selectedMember } = state
          return {
            selectedMember: [...selectedMember, ...findItemNotInSelectedList]
          }
        },
        () => {
          this.handleReturnResultWhenNotShowSubmitBtn()
        }
      )
    }
  }

  // 获取分组列表
  getGroupList = (payload = {}) => {
    const { dispatch } = this.props
    const { _organization_id } = payload
    if (!_organization_id || _organization_id == '0') {
      return
    }
    getAccessibleGroupList({ ...payload }).then(res => {
      if (isApiResponseOk(res)) {
        this.setState({
          groupList: res.data
        })
      } else {
        message.warn(res.message)
      }
    })
    getCurrentOrgAccessibleAllMembers({ ...payload }).then(res => {
      if (isApiResponseOk(res)) {
        const users = res.data.users || []
        this.setState({
          currentOrgAllMembersList: users,
          membersListToSelect: users
        })
      } else {
        message.warn(res.message)
      }
    })
    getProjectUserList().then(res => {
      if (isApiResponseOk(res)) {
        this.setState({
          projectUserList: res.data
        })
      } else {
        message.warn(res.message)
      }
    })
  }

  // 验证是否是有效的图片
  isValidImgSrc = (srcStr = '') => {
    const srcRegExp = /^http[s]?:.+\.(png|jpg|jpeg|gif)$/
    return srcRegExp.test(srcStr)
  }

  // axiosForSend = (url, data) => {
  //   const Authorization = Cookies.get('Authorization')
  //   return new Promise((resolve, reject) => {
  //     axios
  //       .post(url, data, {
  //         headers: {
  //           Authorization,
  //           ...setRequestHeaderBaseInfo({ data, headers: {}, params: {} })
  //         }
  //       })
  //       .then(res => {
  //         resolve(res.data)
  //       })
  //       .catch(err => {
  //         reject(err)
  //       })
  //   })
  // }

  // 注册用户并生成头像
  // getEnrollUsers = user => {
  //   let svg = this.avatars.create(user)
  //   let file = this.dataURLtoFile(
  //     'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg))),
  //     user + '.svg'
  //   )
  //   let data = new FormData()
  //   data.append('file', file)
  //   return new Promise((resolve, reject) => {
  //     this.axiosForSend(
  //       `${REQUEST_DOMAIN}${REQUEST_INTERGFACE_VERSIONN}/user/invite?invitee_account=${user}`,
  //       data
  //     )
  //       .then(res => {
  //         // console.log(res)
  //         if (isApiResponseOk(res)) {
  //           resolve(res.data.id)
  //         } else {
  //           reject({})
  //         }
  //       })
  //       .catch(err => {
  //         message.warn('上传头像失败，请稍后重试')
  //       })
  //   })
  // }

  // getIcons = async (users = []) => {
  //   // let users = this.getRequestParams()
  //   for (let i = 0; i < users.length; i++) {
  //     if (!users[i].id) {
  //       // const avatar_icon = await this.getUsersAvatar(
  //       //   users[i].mobile ? users[i].mobile : users[i].email
  //       // )
  //       const user_id = await this.getEnrollUsers(users[i].user)
  //       users[i].id = user_id
  //     }
  //   }
  //   return users
  // }

  // 提交选择的用户回调
  handleSubmitSeletedMember = () => {
    const { handleInviteMemberReturnResult } = this.props
    const { selectedMember } = this.state
    // this.getIcons(selectedMember).then(users => {
    //   handleInviteMemberReturnResult(users)
    // })
    handleInviteMemberReturnResult(selectedMember)
  }

  componentDidMount() {
    const { _organization_id, shouldNotGetGroupInDidMount } = this.props
    if (!shouldNotGetGroupInDidMount) {
      this.getGroupList({
        _organization_id
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    const { _organization_id } = nextProps
    const { local_organization_id } = this.state
    if (local_organization_id != _organization_id) {
      this.setState({
        local_organization_id: _organization_id
      })
      this.getGroupList({ _organization_id })
    }
    if (nextProps.new_message != this.props.new_message) {
      //消息推送查询
      this.getGroupList({ _organization_id })
    }
  }

  // 控制微信扫码显示隐藏
  setWechatInviteVisible = () => {
    this.props.setWechatInviteVisible && this.props.setWechatInviteVisible()
  }

  // 渲染没有数据的时候
  renderWhenNoData = () => {
    return null
  }

  // 渲染列表的结构
  renderSelectList = () => {
    const { step, projectList, isInSelectedList } = this.state
    const { groupList = [] } = this.state
    const selectHome = () => (
      <>
        <div
          key="group"
          className={styles.invite__select_list_item}
          onClick={this.handleClickedInviteFromGroup}
        >
          <span className={styles.invite__select_list_item_text}>
            从分组邀请
          </span>
          <span className={styles.invite__select_list_item_icon} />
        </div>
        <div
          key="project"
          className={styles.invite__select_list_item}
          onClick={this.handleClickedInviteFromProject}
        >
          <span className={styles.invite__select_list_item_text}>
            从{currentNounPlanFilterName(PROJECTS)}邀请
          </span>
          <span className={styles.invite__select_list_item_icon} />
        </div>
      </>
    )

    // 选择的是分组
    const selectGroupList = () => (
      <>
        {groupList.map((item, index) => (
          <div
            key={item.id ? item.id : index}
            className={styles.invite__select_list_item}
            onClick={e => this.handleClickedInviteFromGroupList(item.id, e)}
          >
            <span className={styles.invite__select_list_item_text}>
              {item.name}
            </span>
            <span className={styles.invite__select_list_item_icon} />
          </div>
        ))}
      </>
    )

    // 选择的是项目
    const selectProjectList = () => (
      <>
        {projectList.map(item => (
          <div
            key={item.board_id}
            className={styles.invite__select_list_item}
            onClick={e =>
              this.handleClickedInviteFromProjectList(item.board_id, e)
            }
          >
            <span className={styles.invite__select_list_item_text}>
              {item.board_name}
            </span>
            <span className={styles.invite__select_list_item_icon} />
          </div>
        ))}
      </>
    )

    // 定义一个条件来区分现在选择的是哪一个步骤
    const condition = {
      home: selectHome,
      'group-list': selectGroupList,
      'project-list': selectProjectList
    }

    let selectListWrapper = cx({
      invite__select_list_wrapper: true,
      invite__select_list_wrapper_with_out_border_bottom: isInSelectedList
    })

    const mapCallback = condition[step]
    const wrapper = (
      <div className={selectListWrapper}>
        {mapCallback ? mapCallback() : null}
      </div>
    )
    return wrapper
  }
  render() {
    const {
      title,
      submitText,
      currentSelectOrganize,
      isShowTitle,
      isShowSubmitBtn,
      children,
      isDisableSubmitWhenNoSelectItem,
      show_wechat_invite
    } = this.props
    const {
      fetching,
      inputRet,
      inputValue,
      selectedMember = [],
      membersListToSelect = [],
      isInSelectedList,
      currentOrgAllMembersList,
      step
    } = this.state
    let seize_a_seat_arr_length = 11 - selectedMember.length // 11为最多的占位符
    let seize_a_seat_arr = []
    for (let i = 0; i < seize_a_seat_arr_length; i++) {
      seize_a_seat_arr.push(i)
    }

    const isGetData = () => currentSelectOrganize && currentOrgAllMembersList
    if (!isGetData()) {
      return this.renderWhenNoData()
    }
    const sortedMembersListToSelect = this.sortMemberListByCapital(
      membersListToSelect
    )

    const isHasSelectedItem = !!selectedMember.length

    let inviteSelectWrapper = cx({
      invite__select_content_wrapper: true,
      invite__select_wrapper_change_height: step !== 'home'
    })

    return (
      <div className={styles.wrapper}>
        {isShowTitle && <h3 className={styles.title}>{title}</h3>}
        <div className={styles.invite__input}>
          <Select
            mode="multiple"
            value={inputValue}
            labelInValue
            size={'large'}
            disabled={this.props.selectDisabled}
            maxTagCount={1}
            placeholder="请输入被邀请人的手机号或邮箱"
            notFoundContent={fetching ? <Spin size="small" /> : null}
            filterOption={false}
            onSearch={this.handleSearchUser}
            onChange={this.handleInputChange}
            onSelect={this.handleInputSelected}
            onDeselect={this.handleInputDeselected}
            style={{ width: '100%' }}
            dropdownStyle={{ zIndex: '9999' }}
            blur={this.handleInputBlur}
          >
            {inputRet.map(item => {
              return (
                <Option key={item.value}>{this.genOptionLabel(item)}</Option>
              )
            })}
          </Select>
          <span className={`${globalStyles.authTheme} ${styles.search_icon}`}>
            &#xe611;
          </span>
        </div>
        {!!(selectedMember && selectedMember.length) && (
          <div className={styles.invite__result_wrapper}>
            <div className={styles.invite__result_list}>
              {selectedMember.map(item => {
                // let svg = this.avatars.create(item.user)
                return (
                  <div
                    key={item.user}
                    className={styles.invite__result_list_item}
                  >
                    <Tooltip
                      overlayStyle={{ zIndex: '9999' }}
                      title={item.type === 'other' ? item.user : item.name}
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                    >
                      <div
                        className={styles.invite__result_list_item_img_wrapper}
                      >
                        <img
                          src={
                            item.type === 'other'
                              ? defaultUserAvatar
                              : this.isAvatarValid(item.icon)
                              ? item.icon
                              : defaultUserAvatar
                          }
                          alt=""
                          width="32"
                          height="32"
                          className={styles.invite__result_list_item_img}
                        />
                        <span
                          className={styles.invite__result_list_icon}
                          onClick={e =>
                            this.handleClickedResultListIcon(item, e)
                          }
                        />
                      </div>
                    </Tooltip>
                  </div>
                )
              })}
              {/* 占位符 */}
              {/* {seize_a_seat_arr.length < 11 &&
                seize_a_seat_arr.map((item, key) => {
                  return (
                    <div key={key} className={styles.invite__result_list_item}>
                      <div
                        className={styles.invite__result_list_item_img_wrapper}
                        style={{
                          backgroundColor: 'rgba(0,0,0,.04)',
                          borderRadius: 20
                        }}
                      ></div>
                    </div>
                  )
                })} */}
            </div>
          </div>
        )}
        {this.props.selectDisabled ? (
          <div className={styles.invite__select_wrapper}>
            <img
              src={noDataImg}
              style={{
                height: 114,
                width: 112,
                margin: '0 auto',
                marginTop: 43
              }}
            />
          </div>
        ) : (
          <div className={styles.invite__select_wrapper}>
            {step !== 'home' && (
              <div
                className={styles.invite__select_back_wrapper}
                onClick={this.handleBack}
              >
                <span className={styles.invite__select_back_icon} />
                <span className={styles.invite__select_back_text}>
                  返回上一级
                </span>
              </div>
            )}
            <div className={inviteSelectWrapper}>
              {this.renderSelectList()}
              {!isInSelectedList && (
                <div className={styles.invite__select_member_wrapper}>
                  <div
                    className={styles.invite__select_member_All}
                    onClick={this.handleToggleSelectCurrentListAll}
                  >
                    <span className={styles.invite__select_member_All_text}>
                      全选
                    </span>
                    {this.isSelectedAll() ? (
                      <span
                        className={
                          styles.invite__select_member_item_operator_selected
                        }
                      />
                    ) : (
                      <span
                        className={
                          styles.invite__select_member_item_operator_unselected
                        }
                      />
                    )}
                  </div>
                  {sortedMembersListToSelect.map(item => {
                    return (
                      <div
                        key={item.id}
                        className={styles.invite__select_member_item}
                        onClick={e =>
                          this.handleToggleMemberInSelectedMember(item, e)
                        }
                      >
                        <span
                          className={styles.invite__select_member_item_info}
                        >
                          <img
                            className={styles.invite__select_member_item_avatar}
                            width="24"
                            height="24"
                            src={
                              this.isAvatarValid(item.avatar)
                                ? item.avatar
                                : defaultUserAvatar
                            }
                            alt=""
                          />
                          <span
                            className={styles.invite__select_member_item_title}
                          >
                            {item.name || item.full_name}
                          </span>
                        </span>
                        <span
                          className={styles.invite__select_member_item_operator}
                        >
                          {this.checkMemberInSelectedMember(item) ? (
                            <span
                              className={
                                styles.invite__select_member_item_operator_selected
                              }
                            />
                          ) : (
                            <span
                              className={
                                styles.invite__select_member_item_operator_unselected
                              }
                            />
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {isShowSubmitBtn && (
          <div className={styles.invite__submit_wrapper}>
            {show_wechat_invite && (
              <Button onClick={this.setWechatInviteVisible}>
                <i
                  className={globalStyles.authTheme}
                  style={{ color: '#46A318', marginRight: 4, fontSize: '24px' }}
                >
                  &#xe634;
                </i>
                <span style={{ position: 'relative', top: '-4px' }}>
                  扫码邀请
                </span>
              </Button>
            )}
            <Button
              disabled={isDisableSubmitWhenNoSelectItem && !isHasSelectedItem}
              onClick={this.handleSubmitSeletedMember}
              type="primary"
            >
              {submitText}
            </Button>
          </div>
        )}
      </div>
    )
  }
}

InviteOthers.defaultProps = {
  isShowTitle: true,
  title: '步骤三: 邀请他人一起参与项目', //标题
  submitText: '完成创建', //提交按钮文字
  isDisableSubmitWhenNoSelectItem: false, //如果没有选择 item 就禁用提交
  isShowSubmitBtn: true, //是否显示提交按钮
  handleInviteMemberReturnResult: function() {
    message.info('邀请他人组件， 需要被提供一个回调函数')
  },
  _organization_id: '', //getGlobalData('aboutBoardOrganizationId'), //传递进来的组织，默认取当前操作项目的对应的组织id
  shouldNotGetGroupInDidMount: false //false默认，true的时候在componentDidMount 里面做getGroupList请求
}

export default InviteOthers
