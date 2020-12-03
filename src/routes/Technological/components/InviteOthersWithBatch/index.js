import React, { Component } from 'react'
import styles from './index.less'
import { Select, Spin, message, Tooltip, Button, Input } from 'antd'
import { validateTel, validateEmail } from './../../../../utils/verify'
import { debounce } from './../../../../utils/util'
import { associateUser } from './../../../../services/technological/workbench'
import defaultUserAvatar from './../../../../assets/invite/user_default_avatar@2x.png'
import globalStyles from '@/globalset/css/globalClassName.less'
import WechatInviteToboard from '../Project/components/WechatInviteToboard'

const Option = Select.Option
const { TextArea } = Input

class InviteOtherWithBatch extends Component {
  constructor(props) {
    super(props)
    this.fetchUsers = debounce(this.fetchUsers, 300)
    this.state = {
      inputValue: [],
      textAreaValue: '',
      inputRet: [],
      fetching: false,
      selectedMember: [], //已经选择的成员
      multipleMode: false, //是否批量模式
      wechat_invite_visible: false
    }
  }
  isValidMobileOrValidEmail = user => {
    return validateEmail(user) || validateTel(user)
  }
  isAvatarValid = avatar => {
    return avatar && typeof avatar === 'string' && avatar.startsWith('http')
  }
  genSplitSymbol = () => '$%$'
  genUserValueStr = (icon, name, user, isFromPlatForm, id) => {
    const splitSymbol = this.genSplitSymbol()
    return `${icon}${splitSymbol}${name}${splitSymbol}${user}${splitSymbol}${isFromPlatForm}${
      id ? `${splitSymbol}${id}` : ''
    }`
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
        const params = {
          associate_param: user,
          _organization_id: localStorage.getItem('OrganizationId'),
          type: validateTel(user) || validateEmail(user) ? '2' : '1'
        }
        //发起请求
        associateUser(params)
          .then(res => {
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
                // const { avatar, name, id } = res.data;
                // const value = this.genUserValueStr(
                //   avatar,
                //   name,
                //   user,
                //   true,
                //   id
                // );
                // this.setState({
                //   inputRet: [{ value, avatar, user, name: name }],
                //   fetching: false
                // });
                this.setState({
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
  delFromSelectedMember = item => {
    this.setState(
      state => {
        const { selectedMember } = state
        return {
          selectedMember: selectedMember.filter(i => i.id !== item.id)
        }
      },
      () => {
        this.handleReturnResultWhenNotShowSubmitBtn()
      }
    )
  }
  handleClickedResultListIcon = (item, e) => {
    if (e) e.stopPropagation()
    this.delFromSelectedMember(item)
  }
  handleInputSelected = value => {
    const { selectedMember } = this.state
    const selectedUser = this.parseUserValueStr(value.key)
    const isHasSameMemberInSelectedMember = () =>
      selectedMember.find(item => item.id === selectedUser.id)
    // console.log('ssss', {selectedMember, selectedUser })
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
  handleUsersToUsersStr = (users = []) => {
    const { returnStrSplitSymbol } = this.props
    return users.reduce((acc, curr) => {
      const isCurrentUserFromPlatform = () =>
        curr.type === 'platform' && curr.id
      if (isCurrentUserFromPlatform()) {
        if (acc) {
          return acc + returnStrSplitSymbol + curr.id
        }
        return curr.id
      } else {
        if (acc) {
          return acc + returnStrSplitSymbol + curr.user
        }
        return curr.user
      }
    }, '')
  }
  handleSubmitSeletedMember = () => {
    const { handleInviteMemberReturnResult, directReturnStr } = this.props
    const { selectedMember, multipleMode } = this.state
    //如果是单选模式
    if (!multipleMode) {
      //如果需要直接返回字符串
      if (directReturnStr) {
        const memeberListToStr = this.handleUsersToUsersStr(selectedMember)
        return handleInviteMemberReturnResult(memeberListToStr)
      }
      handleInviteMemberReturnResult(selectedMember)
    } else {
      const transedMultipleStr = this.handleTransMentionSelectedOtherMembersMobileString()
      handleInviteMemberReturnResult(transedMultipleStr)
    }
  }
  handleReturnResultWhenNotShowSubmitBtn = () => {
    const {
      handleInviteMemberReturnResult,
      isShowSubmitBtn,
      directReturnStr
    } = this.props
    //如果有提交按钮, 则点击提交按钮的时候统一处理数据
    if (isShowSubmitBtn) return
    const { selectedMember, multipleMode } = this.state
    //如果是单选模式
    if (!multipleMode) {
      if (directReturnStr) {
        const memeberListToStr = this.handleUsersToUsersStr(selectedMember)
        return handleInviteMemberReturnResult(memeberListToStr)
      }
      handleInviteMemberReturnResult(selectedMember)
    } else {
      const memeberStr = this.handleTransMentionSelectedOtherMembersMobileString()
      handleInviteMemberReturnResult(memeberStr)
    }
  }
  handleInputChange = value => {
    //这个函数根本就不会执行？？？
    // this.setState({
    //   inputValue: value,
    //   inputRet: [],
    //   fetching: false
    // })
  }
  handleSearchUser = user => {
    const isValidUser = this.isValidMobileOrValidEmail(user)
    this.setState(
      {
        inputValue: [],
        inputRet: [],
        fetching: false
      },
      () => {
        this.fetchUsers(user)
        // if (isValidUser) {
        //   this.fetchUsers(user);
        // }
      }
    )
  }
  handleTextAreaValueChange = e => {
    const { value } = e.target
    this.setState(
      {
        textAreaValue: value
      },
      () => {
        this.handleReturnResultWhenNotShowSubmitBtn()
      }
    )
  }
  handleTransMentionSelectedOtherMembersMobileString = () => {
    const { textAreaValue } = this.state
    const errorText = 'format error'
    //空白符(包括回车，换行)，替换为 ;
    const trimSpace = str => {
      return str.replace(/\s+/g, ';')
    }

    const trimLineBack = str => {
      return str.replace(/[\r\n]/g, ';')
    }
    const trimOnlySpace = str => {
      return str.replace(/ /g, '')
    }
    const trimSpaceAndLineBackArr = trimSpace(trimOnlySpace(textAreaValue))
      .replace(/；/g, ';')
      .replace(/,/g, ';')
      .replace(/，/g, ';')
      .replace(/\|/g, ';')
      .split(';')
      .map(item => item.trim())
      .filter(item => item)
    const isEachMobileValid = arr =>
      arr.every(item => validateTel(item) || validateEmail(item))
    if (!isEachMobileValid(trimSpaceAndLineBackArr)) {
      return errorText
    } else {
      return trimSpaceAndLineBackArr.reduce((acc, curr) => {
        return acc ? acc + ',' + curr : curr
      }, '')
    }
  }
  handleToggleBatchInviteBtn = e => {
    if (e) e.preventDefault()
    this.setState(state => {
      const { multipleMode } = state
      return {
        multipleMode: !multipleMode
      }
    })
  }
  genOptionLabel = item => {
    const { avatar, user, name } = item
    //默认
    if (avatar === 'default') {
      return (
        <p className={styles.input__select_wrapper}>
          <span className={styles.input__select_user}>{user}</span>
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
  getAName = (item = {}) => {
    const { name, mobile, email } = item
    const defaultName = 'unknown'
    //返回发现的第一个真值
    const gotName = [name, mobile, email].find(Boolean)
    return gotName ? gotName : defaultName
  }
  setWechatInviteVisible = () => {
    const { wechat_invite_visible } = this.state
    this.setState({
      wechat_invite_visible: !wechat_invite_visible
    })
  }
  render() {
    const {
      inputValue,
      fetching,
      inputRet,
      selectedMember,
      multipleMode,
      textAreaValue,
      wechat_invite_visible
    } = this.state
    const {
      isShowSubmitBtn,
      isDisableSubmitWhenNoSelectItem,
      submitText,
      isShowBatchInvite,
      children,
      show_wechat_invite,
      type,
      invitationType,
      invitationId,
      invitationOrg
    } = this.props
    const transedTextAreaValue = this.handleTransMentionSelectedOtherMembersMobileString()
    const isValidTextAreaValueMobileOrEmail =
      transedTextAreaValue && transedTextAreaValue !== 'format error'
    const isHasSelectedItem = !!selectedMember.length
    const shouldDisableSubmitBtn = () => {
      //如果在单选模式
      if (
        isDisableSubmitWhenNoSelectItem &&
        !isHasSelectedItem &&
        !multipleMode
      ) {
        return true
      }
      if (
        isDisableSubmitWhenNoSelectItem &&
        !isValidTextAreaValueMobileOrEmail &&
        multipleMode
      ) {
        return true
      }
      return false
    }
    return (
      <div className={styles.wrapper}>
        {!multipleMode && (
          <div className={styles.invite__single_wrapper}>
            <div className={styles.invite__result_wrapper}>
              <div className={styles.invite__result_list}>
                {selectedMember.map(item => (
                  <div
                    key={item.user}
                    className={styles.invite__result_list_item}
                  >
                    <Tooltip
                      title={
                        item.type === 'other' ? item.user : this.getAName(item)
                      }
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
                          width="36"
                          height="36"
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
                ))}
                {selectedMember.length < 16 &&
                  Array.from(
                    { length: 16 - selectedMember.length },
                    (val, ind) => ind
                  ).map(item => (
                    <div key={item} className={styles.invite__result_list_item}>
                      <div
                        className={styles.invite__result_list_item_placeholder}
                      />
                    </div>
                  ))}
              </div>
            </div>
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
                style={{ width: '100%' }}
                getPopupContainer={triggerNode => triggerNode.parentNode}
              >
                {inputRet.map(item => (
                  <Option key={item.value}>{this.genOptionLabel(item)}</Option>
                ))}
              </Select>
            </div>
          </div>
        )}
        {multipleMode && (
          <div className={styles.invite__multiple_wrapper}>
            <TextArea
              className={styles.invite__multiple_textarea}
              placeholder="请输入被邀请人的手机号或邮箱（换行输入邀请多人）"
              value={textAreaValue}
              onChange={this.handleTextAreaValueChange}
            />
          </div>
        )}
        {isShowSubmitBtn && (
          <div className={styles.invite__submit_wrapper}>
            <Button
              disabled={shouldDisableSubmitBtn()}
              onClick={this.handleSubmitSeletedMember}
              type="primary"
              style={{
                padding: '8px 40px',
                height: '40px'
              }}
            >
              <span className={styles.invite__submit_text}>{submitText}</span>
            </Button>
          </div>
        )}
        {isShowBatchInvite && (
          <div className={styles.invite__batch_wrapper}>
            {multipleMode ? (
              <a
                className={styles.invite__batch_btn}
                onClick={e => this.handleToggleBatchInviteBtn(e)}
              >
                返回
              </a>
            ) : (
              <a
                className={styles.invite__batch_btn}
                onClick={e => this.handleToggleBatchInviteBtn(e)}
              >
                批量邀请
              </a>
            )}
          </div>
        )}
        {children}

        {show_wechat_invite && (
          <div
            style={{
              marginTop: 16,
              marginBottom: 16,
              color: '#1890FF',
              cursor: 'pointer'
            }}
            onClick={this.setWechatInviteVisible}
          >
            <i
              className={globalStyles.authTheme}
              style={{ color: '#46A318', marginRight: 4 }}
            >
              &#xe634;
            </i>
            微信扫码邀请参与人
          </div>
        )}

        {show_wechat_invite && (
          <WechatInviteToboard
            invitationId={invitationId}
            invitationOrg={invitationOrg}
            invitationType={invitationType}
            modalVisible={wechat_invite_visible}
            setModalVisibile={this.setWechatInviteVisible}
          />
        )}
      </div>
    )
  }
}

InviteOtherWithBatch.defaultProps = {
  submitText: '邀请加入', //提交按钮文字
  isDisableSubmitWhenNoSelectItem: false, //如果没有选择 item 就禁用提交
  isShowSubmitBtn: true, //是否显示提交按钮
  isShowBatchInvite: true, //是否显示批量邀请按钮
  directReturnStr: false, //单选模式直接返回以逗号隔开的字符串
  returnStrSplitSymbol: ',', //单选模式返回的字符串的分隔符
  show_wechat_invite: false, //显示微信邀请
  handleInviteMemberReturnResult: function() {
    message.info('邀请他人组件， 需要被提供一个回调函数')
  }
}

export default InviteOtherWithBatch
