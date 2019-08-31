import React, { Component } from 'react'
import { Button, Select, Spin, message, Tooltip } from 'antd'
import styles from './index.less'
import { connect } from 'dva'
import { debounce } from './../../../../utils/util'
import { validateTel, validateEmail } from './../../../../utils/verify'
import { associateUser } from './../../../../services/technological/workbench'
import defaultUserAvatar from './../../../../assets/invite/user_default_avatar@2x.png'
import defaultOrgAvatar from './../../../../assets/invite/org_default_avatar@2x.png'
import { getPinyin } from './../../../../utils/pinyin'
import classNames from 'classnames/bind'

let cx = classNames.bind(styles)

const Option = Select.Option

@connect(({ technological, organizationMember, workbench }) => ({
  currentOrg: technological.datas.currentSelectOrganize,
  currentOrgAllMembersList: technological.datas.currentOrgAllMembersList,
  projectListWithUsers: workbench.datas.projectUserList,
  groupList:
    organizationMember.datas && organizationMember.datas.groupList
      ? organizationMember.datas.groupList
      : []
}))
class InviteOthers extends Component {
  constructor(props) {
    super(props)
    const { currentOrgAllMembersList } = props
    this.fetchUsers = debounce(this.fetchUsers, 300)
    this.state = {
      local_organization_id: this.props._organization_id, //传递进来的orgid
      inputValue: [],
      inputRet: [],
      fetching: false,
      selectedMember: [], //已经选择的成员或平台外人员
      membersListToSelect: Array.isArray(currentOrgAllMembersList)
        ? currentOrgAllMembersList
        : [], //人员选择列表
      projectList: [], //我参与的项目列表
      currentSyncSetsMemberList: {}, //原生的已经被同步的集合的所有成员，此处不能保存成数组，更不能过滤重复的人员，因为如果取消同步的时候，会移除已同步的集合的交集处的人员，引发意外的bug      isInSelectedList: false,
      currentMemberListSet: 'org', //当前显示的集合 org || group-id || project-id
      isInSelectedList: false, //是否仅显示列表的
      step: 'home' //当前的步进 home || group-list || group-id || project-list ||project-id
    }
  }
  isValidMobileOrValidEmail = user => {
    return validateEmail(user) || validateTel(user)
  }
  handleInputBlur = () => {
    this.setState({
      inputValue: [],
      inputRet: [],
    })
  }
  handleSearchUser = user => {
    console.log('search....................')
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
  genSplitSymbol = () => '$%$'
  genUserValueStr = (icon, name, user, isFromPlatForm, id) => {
    const splitSymbol = this.genSplitSymbol()
    return `${icon}${splitSymbol}${name}${splitSymbol}${user}${splitSymbol}${isFromPlatForm}${
      id ? `${splitSymbol}${id}` : ''
    }`
  }
  genUserToDefinedMember = user => {
    if (!user || !(user.id || user.user_id)) return
    const {
      avatar = 'default',
      full_name = 'default',
      mobile,
      email,
      id,
      user_id
    } = user
    const mobileOrEmail = mobile ? mobile : email
    return this.parseUserValueStr(
      this.genUserValueStr(
        avatar,
        full_name,
        mobileOrEmail,
        true,
        id ? id : user_id
      )
    )
  }
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
  fetchUsers = user => {
    if (!user) return
    this.setState(
      {
        inputRet: [],
        fetching: true
      },
      () => {
        //发起请求
        associateUser(user)
          .then(res => {
            console.log('res = 发起', res)
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
                    name,
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
                if(!isValidUser) {
                  this.setState({
                    fetching: false,
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
              message.error('获取联想用户失败')
            }
          })
          .catch(err => {
            this.setState({
              fetching: false
            })
            message.error('获取联想用户失败')
          })
      }
    )
  }
  handleInputSelected = value => {
    const { selectedMember } = this.state
    const selectedUser = this.parseUserValueStr(value.key)
    const isHasSameMemberInSelectedMember = () =>
      selectedMember.find(item => item.user === selectedUser.user)
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
    this.setState({
      selectedMember: [...selectedMember, selectedUser],
      inputValue: [],
      inputRet: [],
      fetching: false
    }, () => {
      this.handleReturnResultWhenNotShowSubmitBtn()
    })
  }
  handleReturnResultWhenNotShowSubmitBtn = () => {
    const {handleInviteMemberReturnResult, isShowSubmitBtn} = this.props
      if(isShowSubmitBtn) return
      const {selectedMember} = this.state
      handleInviteMemberReturnResult(selectedMember)
  }
  handleInputDeselected = value => {
    const selectedUser = this.parseUserValueStr(value.key)
    const { selectedMember } = this.state
    this.setState({
      selectedMember: selectedMember.filter(
        item => item.user !== selectedUser.user
      )
    }, () => {
      this.handleReturnResultWhenNotShowSubmitBtn()
    })
  }
  handleInputChange = value => {
    //这个函数根本就不会执行？？？
    // this.setState({
    //   inputValue: value,
    //   inputRet: [],
    //   fetching: false
    // })
  }
  genOptionLabel = item => {
    const { avatar, user, name } = item
    //默认
    if (avatar === 'default') {
      return (
        <p className={styles.input__select_wrapper}>
          {/* <span className={styles.input__select_default_avatar} /> */}
          <span className={styles.input__select_user}>{user}</span>
        </p>
      )
    }
    return (
      <p className={styles.input__select_wrapper}>
        <span className={styles.input__select_avatar_img}>
          <img src={this.isAvatarValid(avatar) ? avatar : defaultUserAvatar} style={{borderRadius: '50%'}} width="24" height="24" alt="" />
        </span>
        <span className={styles.input__select_user}>{user}</span>
        <span className={styles.input__select_name}>({name ? name : '匿名用户'})</span>
      </p>
    )
  }
  delFromSelectedMember = item => {
    this.setState(state => {
      const { selectedMember } = state
      return {
        selectedMember: selectedMember.filter(i => i.user !== item.user)
      }
    }, () => {
      this.handleReturnResultWhenNotShowSubmitBtn()
    })
  }
  addMemberToSelectedMember = item => {
    const { selectedMember } = this.state
    const isMemberHasInSelectedMember = () =>
      selectedMember.find(each => each.user === item.user)
    if (isMemberHasInSelectedMember()) return

    this.setState({
      selectedMember: [item, ...selectedMember]
    }, () => {
      this.handleReturnResultWhenNotShowSubmitBtn()
    })
  }
  handleClickedResultListIcon = (item, e) => {
    if (e) e.stopPropagation()
    this.delFromSelectedMember(item)
  }
  handleToggleMemberInSelectedMember = (item, e) => {
    if (e) e.stopPropagation()
    const { selectedMember } = this.state

    const member = this.genUserToDefinedMember(item)

    const isMemberHasInSelectedMember = () =>
      selectedMember.find(each => each.user === member.user)
    if (isMemberHasInSelectedMember()) {
      return this.delFromSelectedMember(member)
    }
    return this.addMemberToSelectedMember(member)
  }
  isAvatarValid = avatar => {
    return avatar && typeof avatar === 'string' && avatar.startsWith('http')
  }
  checkMemberInSelectedMember = item => {
    const { selectedMember } = this.state
    const mobileOrEmail = item.mobile ? item.mobile : item.email
    return selectedMember.find(
      each => each.type === 'platform' && each.user === mobileOrEmail
    )
  }
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
  handleClickedInviteFromGroup = () => {
    this.setState({
      isInSelectedList: true,
      step: 'group-list'
    })
  }
  handleClickedInviteFromProject = () => {
    const { dispatch } = this.props
    const initProjectList = () => {
      const { projectListWithUsers } = this.props
      if (!projectListWithUsers.length) {
        message.destroy()
        message.info('当前没有创建任何项目')
        return
      }
      this.setState({
        isInSelectedList: true,
        step: 'project-list',
        projectList: projectListWithUsers.map(({ board_id, board_name }) => ({
          board_id,
          board_name
        }))
      })
    }
    const fetchProjectList = async () => {
      await dispatch({
        type: 'workbench/getProjectUserList',
        payload: {}
      })
      return initProjectList()
    }
    fetchProjectList()
  }
  handleClickedInviteFromProjectList = (id, e) => {
    if (e) e.stopPropagation()
    const getProjectMembers = () => {
      const { projectListWithUsers } = this.props
      const findProject = projectListWithUsers.find(
        item => item.board_id === id
      )
      const isProjectWithUsers = findProject
        ? findProject.users && Array.isArray(findProject.users)
        : false
      return isProjectWithUsers ? findProject.users : []
    }
    this.setPageStep(false, `project-${id}`, getProjectMembers())
  }
  setPageStep = (isInSelectedList, step, membersListToSelect = []) => {
    this.setState({
      isInSelectedList,
      step,
      membersListToSelect
    })
  }
  handleClickedInviteFromGroupList = (id, e) => {
    if (e) e.stopPropagation()
    const getGroupMembers = () => {
      const { groupList } = this.props
      const findGroup = groupList.find(item => item.id === id)
      const isGroupWithMembers = findGroup
        ? findGroup.members && Array.isArray(findGroup.members)
        : false
      return isGroupWithMembers ? findGroup.members : []
    }
    const nameToFullname = getGroupMembers().map(item =>
      Object.assign({}, item, { full_name: item.name })
    )
    this.setPageStep(false, `group-${id}`, nameToFullname)
  }
  handleBack = () => {
    const { currentOrgAllMembersList, groupList } = this.props
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
  isSelectedAll = () => {
    const { membersListToSelect } = this.state
    return membersListToSelect.every(item =>
      this.checkMemberInSelectedMember(item)
    )
  }
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
      this.setState(state => {
        const { selectedMember } = state
        return {
          selectedMember: [...selectedMember, ...findItemNotInSelectedList]
        }
      }, () => {
      this.handleReturnResultWhenNotShowSubmitBtn()
      })
    }
  }
  getGroupList = (payload = {}) => {
    const { dispatch } = this.props
    const { _organization_id } = payload
    if(!_organization_id || _organization_id == '0') {
      return
    }
    dispatch({
      type: 'organizationMember/getGroupList',
      payload: {
        ...payload
      }
    })
    dispatch({
      type: 'technological/fetchCurrentOrgAllMembers',
      payload: {
        ...payload
      }
    })
  }
  isValidImgSrc = (srcStr = '') => {
    const srcRegExp = /^http[s]?:.+\.(png|jpg|jpeg|gif)$/
    return srcRegExp.test(srcStr)
  }
  handleSubmitSeletedMember = () => {
    const { handleInviteMemberReturnResult } = this.props
    const { selectedMember } = this.state
    handleInviteMemberReturnResult(selectedMember)
  }
  componentDidMount() {
    const { _organization_id, shouldNotGetGroupInDidMount } = this.props
    if(!shouldNotGetGroupInDidMount) {
      this.getGroupList({ 
        _organization_id
      })
    }
  }
  componentWillReceiveProps(nextProps) {
    const { _organization_id, currentOrgAllMembersList } = nextProps
    const { local_organization_id } = this.state
    if(local_organization_id != _organization_id) {
      this.setState({
        local_organization_id: _organization_id
      })
      this.getGroupList({_organization_id})
    }
    this.setState({
      membersListToSelect: currentOrgAllMembersList
    })
  }
  renderWhenNoData = () => {
    return null
  }
  renderSelectList = () => {
    const { step, projectList, isInSelectedList } = this.state
    const { groupList } = this.props
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
            从项目邀请
          </span>
          <span className={styles.invite__select_list_item_icon} />
        </div>
      </>
    )
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
      currentOrg,
      currentOrgAllMembersList,
      isShowTitle,
      isShowSubmitBtn,
      children,
      isDisableSubmitWhenNoSelectItem
    } = this.props
    const {
      fetching,
      inputRet,
      inputValue,
      selectedMember,
      membersListToSelect,
      isInSelectedList,
      step
    } = this.state

    const isGetData = () => currentOrg && currentOrgAllMembersList
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
            maxTagCount={1}
            placeholder="请输入被邀请人的手机号或邮箱"
            notFoundContent={fetching ? <Spin size="small" /> : null}
            filterOption={false}
            onSearch={this.handleSearchUser}
            onChange={this.handleInputChange}
            onSelect={this.handleInputSelected}
            onDeselect={this.handleInputDeselected}
            style={{ width: '100%'}}
            dropdownStyle={{zIndex: '9999'}}
            blur={this.handleInputBlur}
          >
            {inputRet.map(item => (
              <Option key={item.value}>{this.genOptionLabel(item)}</Option>
            ))}
          </Select>
        </div>
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
          <div className={inviteSelectWrapper} >
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
                {sortedMembersListToSelect.map(item => (
                  <div
                    key={item.id}
                    className={styles.invite__select_member_item}
                    onClick={e =>
                      this.handleToggleMemberInSelectedMember(item, e)
                    }
                  >
                    <span className={styles.invite__select_member_item_info}>
                      <img
                        className={styles.invite__select_member_item_avatar}
                        width="20"
                        height="20"
                        src={
                          this.isAvatarValid(item.avatar)
                            ? item.avatar
                            : defaultUserAvatar
                        }
                        alt=""
                      />
                      <span className={styles.invite__select_member_item_title}>
                        {item.full_name || item.name}
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
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={styles.invite__result_wrapper}>
          <div className={styles.invite__result_list}>
            {selectedMember.map(item => (
              <div key={item.user} className={styles.invite__result_list_item}>
                <Tooltip overlayStyle={{zIndex: '9999'}} title={item.type === 'other' ? item.user : item.name}>
                  <div className={styles.invite__result_list_item_img_wrapper}>
                    <img
                      src={
                        item.type === 'other'
                          ? defaultUserAvatar
                          : this.isAvatarValid(item.icon)
                          ? item.icon
                          : defaultUserAvatar
                      }
                      alt=""
                      width="24"
                      height="24"
                      className={styles.invite__result_list_item_img}
                    />
                    <span
                      className={styles.invite__result_list_icon}
                      onClick={e => this.handleClickedResultListIcon(item, e)}
                    />
                  </div>
                </Tooltip>
              </div>
            ))}
          </div>
        </div>
        {isShowSubmitBtn && (
          <div className={styles.invite__submit_wrapper}>
            <Button disabled={isDisableSubmitWhenNoSelectItem && !isHasSelectedItem} onClick={this.handleSubmitSeletedMember} type="primary">
              {submitText}
            </Button>
          </div>
        )}
        {children && children}
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
  shouldNotGetGroupInDidMount: false, //false默认，true的时候在componentDidMount 里面做getGroupList请求
}

export default InviteOthers
