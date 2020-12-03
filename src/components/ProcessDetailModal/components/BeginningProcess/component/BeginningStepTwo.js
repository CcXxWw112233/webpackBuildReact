import React, { Component } from 'react'
import indexStyles from '../index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import AvatarList from '../../AvatarList'
import defaultUserAvatar from '@/assets/invite/user_default_avatar@2x.png'
import { Button, Popconfirm, Input, message } from 'antd'
import { connect } from 'dva'
import {
  timestampToTimeNormal,
  compareACoupleOfObjects,
  isObjectValueEqual
} from '../../../../../utils/util'
import {
  checkIsHasPermissionInVisitControl,
  checkIsHasPermissionInBoard
} from '../../../../../utils/businessFunction'
import {
  PROJECT_FLOW_FLOW_ACCESS,
  NOT_HAS_PERMISION_COMFIRN,
  MESSAGE_DURATION_TIME
} from '../../../../../globalset/js/constant'
import {
  genPrincipalListFromAssignees,
  findCurrentApproveNodesPosition,
  findCurrentOverruleNodesPosition,
  findCurrentRatingScoreNodesPosition
} from '../../handleOperateModal'
import DifferenceDeadlineType from '../../DifferenceDeadlineType'
import OpinionContent from '../OpinionContent'

const TextArea = Input.TextArea
@connect(mapStateToProps)
export default class BeginningStepTwo extends Component {
  constructor(props) {
    super(props)
    let curr_position = findCurrentApproveNodesPosition(
      props['processEditDatas']
    ) // 获取当前需要审批的节点位置
    let overrule_position = findCurrentOverruleNodesPosition(
      props['processEditDatas']
    ) // 获取当前被驳回节点的位置
    let rating_position = findCurrentRatingScoreNodesPosition(
      props['processEditDatas']
    )
    this.state = {
      transPrincipalList: props.itemValue.assignees
        ? [...props.itemValue.assignees]
        : [], // 表示当前的执行人
      transCopyPersonnelList: props.itemValue.recipients
        ? [...props.itemValue.recipients]
        : [], // 表示当前选择的抄送人
      is_show_spread_arrow:
        props.itemValue.status == '1' ||
        props.itemKey == curr_position - 1 ||
        props.itemValue.runtime_type == '1' ||
        props.itemKey ==
          (overrule_position != '' ? Number(overrule_position) + 1 : '') ||
        props.itemKey == rating_position - 1
          ? true
          : false,
      historyCommentsList: props.itemValue.his_comments
        ? [...props.itemValue.his_comments]
        : [],
      currentSelectArrow: ''
    }
  }

  componentWillReceiveProps(nextProps) {
    // 需要更新箭头的状态
    if (!isObjectValueEqual(this.props, nextProps)) {
      let curr_position
      if (nextProps)
        curr_position = findCurrentApproveNodesPosition(
          nextProps['processEditDatas']
        )
      let overrule_position = findCurrentOverruleNodesPosition(
        nextProps['processEditDatas']
      ) // 获取当前被驳回节点的位置
      let rating_position = findCurrentRatingScoreNodesPosition(
        nextProps['processEditDatas']
      )
      this.setState({
        is_show_spread_arrow:
          nextProps.itemValue.status == '1' ||
          nextProps.itemKey == curr_position - 1 ||
          nextProps.itemValue.runtime_type == '1' ||
          nextProps.itemKey ==
            (overrule_position != '' ? Number(overrule_position) + 1 : '') ||
          nextProps.itemKey == rating_position - 1
            ? true
            : false,
        transPrincipalList: nextProps.itemValue.assignees
          ? [...nextProps.itemValue.assignees]
          : [], // 表示当前的执行人
        transCopyPersonnelList: nextProps.itemValue.recipients
          ? [...nextProps.itemValue.recipients]
          : [], // 表示当前选择的抄送人
        historyCommentsList: nextProps.itemValue.his_comments
          ? [...nextProps.itemValue.his_comments]
          : [],
        currentSelectArrow: ''
      })
    }
  }

  // 更新对应步骤下的节点内容数据, 即当前操作对象的数据
  updateCorrespondingPrcodessStepWithNodeContent = (data, value) => {
    const { itemValue, processEditDatas = [], itemKey, dispatch } = this.props
    let newProcessEditDatas = [...processEditDatas]
    newProcessEditDatas[itemKey][data] = value
    dispatch({
      type: 'publicProcessDetailModal/updateDatas',
      payload: {
        processEditDatas: newProcessEditDatas
      }
    })
  }

  handleSpreadArrow = e => {
    e && e.stopPropagation()
    this.setState({
      is_show_spread_arrow: !this.state.is_show_spread_arrow
    })
  }

  // 撤回步骤
  handleRebackProcessNodes = () => {
    const {
      itemValue: { id: flow_node_instance_id, assignees, his_comments = [] },
      processInfo: { id: flow_instance_id, board_id },
      dispatch,
      request_flows_params = {}
    } = this.props
    let BOARD_ID =
      (request_flows_params && request_flows_params.request_board_id) ||
      board_id
    dispatch({
      type: 'publicProcessDetailModal/rebackProcessTask',
      payload: {
        flow_node_instance_id,
        flow_instance_id,
        board_id,
        calback: () => {
          dispatch({
            type: 'publicProcessDetailModal/getProcessListByType',
            payload: {
              board_id: BOARD_ID,
              status: '1',
              _organization_id: request_flows_params._organization_id
            }
          })
        }
      }
    })
  }

  // -------- 审批通过气泡弹窗事件 ---------

  // 气泡消失清空内容
  onVisibleChange = visible => {
    if (!visible) {
      this.setState({
        successfulMessage: '',
        rejectMessage: ''
      })
    }
  }
  // 文本输入框的change事件
  handleChangeTextAreaValue = e => {
    e && e.stopPropagation()
    if (e.target.value.trimLR() == '') {
      this.setState({
        successfulMessage: ''
      })
      return
    }
    this.setState({
      successfulMessage: e.target.value
    })
  }

  // 审批通过的点击事件
  handlePassProcess = e => {
    e && e.stopPropagation()
    if (!this.whetherIsHasPermission()) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return
    }
    this.setState({
      isPassNodesIng: true // 表示正在通过审批中
    })
    if (this.state.isPassNodesIng) {
      // message.warn('正在审批通过中...')
      return
    }
    // this.updateCorrespondingPrcodessStepWithNodeContent('is_edit', '0')
    const {
      processInfo: { id: flow_instance_id, board_id },
      itemValue,
      request_flows_params = {}
    } = this.props
    const { id: flow_node_instance_id } = itemValue
    const { successfulMessage, rejectMessage } = this.state
    let BOARD_ID =
      (request_flows_params && request_flows_params.request_board_id) ||
      board_id
    this.props.dispatch({
      type: 'publicProcessDetailModal/fillFormComplete',
      payload: {
        flow_instance_id,
        flow_node_instance_id,
        message: rejectMessage ? rejectMessage : '通过。',
        calback: () => {
          this.setState({
            successfulMessage: '',
            rejectMessage: '',
            isPassNodesIng: false
          })
          this.props.dispatch({
            type: 'publicProcessDetailModal/getProcessListByType',
            payload: {
              board_id: BOARD_ID,
              status: '1',
              _organization_id: request_flows_params._organization_id
            }
          })
        }
      }
    })
  }

  // 审批意见取消的点击事件
  handleCancelSuccessProcess = e => {
    e && e.stopPropagation()
    this.setState({
      successfulMessage: ''
    })
  }

  // -------------- 审批通过气泡弹窗事件 -------------

  // ------------- 审批驳回气泡弹框事件 --------
  handleRejectTextAreaValue = e => {
    e && e.stopPropagation()
    if (e.target.value.trimLR() == '') {
      this.setState({
        rejectMessage: ''
      })
      return
    }
    this.setState({
      rejectMessage: e.target.value
    })
  }

  handleCancelRejectProcess = e => {
    e && e.stopPropagation()
    // this.updateCorrespondingPrcodessStepWithNodeContent('rejectMessage', '')
    e && e.stopPropagation()
    this.setState({
      rejectMessage: ''
    })
  }

  handleRejectProcess = e => {
    e && e.stopPropagation()
    if (!this.whetherIsHasPermission()) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return
    }
    this.setState({
      isRejectNodesIng: true // 表示正在驳回节点中
    })
    if (this.state.isRejectNodesIng) {
      // message.warn('正在驳回节点中...')
      return
    }
    // this.updateCorrespondingPrcodessStepWithNodeContent('is_edit', '0')
    const {
      processInfo: { id: flow_instance_id, board_id },
      itemValue,
      request_flows_params = {}
    } = this.props
    const { id: flow_node_instance_id } = itemValue
    const { rejectMessage } = this.state
    let BOARD_ID =
      (request_flows_params && request_flows_params.request_board_id) ||
      board_id
    if (!rejectMessage) return
    this.props.dispatch({
      type: 'publicProcessDetailModal/rejectProcessTask',
      payload: {
        flow_instance_id,
        flow_node_instance_id,
        message: rejectMessage,
        calback: () => {
          this.setState({
            rejectMessage: '',
            isRejectNodesIng: false
          })
          this.props.dispatch({
            type: 'publicProcessDetailModal/getProcessListByType',
            payload: {
              board_id: BOARD_ID,
              status: '1',
              _organization_id: request_flows_params._organization_id
            }
          })
        }
      }
    })
  }

  // ------------- 审批驳回气泡弹框事件 --------

  // 展开收起
  handleShowMoreHisSuggestion = (e, key) => {
    e && e.stopPropagation()
    this.setState({
      currentSelectArrow: key
    })
  }

  // 理解成是否是有效的头像
  isValidAvatar = (avatarUrl = '') =>
    avatarUrl.includes('http://') || avatarUrl.includes('https://')

  /**
   * 获取当前审批人的状态
   */
  getCurrentPersonApproveStatus = () => {
    const { transPrincipalList = [] } = this.state
    const { id } = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : {}
    let newAssignees = [...transPrincipalList]
    let gold_processed =
      (newAssignees.filter(item => item.id == id)[0] || []).processed || ''
    return gold_processed
  }

  /**
   * 判断是否有权限
   * @returns {Boolean} true 表示有权限 false 表示没有权限
   */
  whetherIsHasPermission = () => {
    const { processInfo = {} } = this.props
    const { privileges = [], is_privilege, board_id, nodes = [] } = processInfo
    const principalList = genPrincipalListFromAssignees(nodes)
    let flag = false
    if (
      checkIsHasPermissionInVisitControl(
        'edit',
        privileges,
        is_privilege,
        principalList,
        checkIsHasPermissionInBoard(PROJECT_FLOW_FLOW_ACCESS, board_id)
      )
    ) {
      flag = true
    }
    return flag
  }

  // 判断是否有完成按钮
  whetherShowCompleteButton = () => {
    const { itemValue } = this.props
    const { assignees } = itemValue
    const { transPrincipalList = [] } = this.state
    const { id } = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : {}
    let flag = false
    let newAssignees = [...transPrincipalList]
    newAssignees.find(item => {
      if (item.id == id) {
        flag = true
      }
    })
    return flag
  }

  // 判断是否有撤回按钮
  whetherIsHasRebackNodesBtn = () => {
    // const { itemValue } = this.props
    // const { assignees = [] } = itemValue
    const { transPrincipalList = [] } = this.state
    const { id } = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : {}
    let flag = false
    let newAssignees = [...transPrincipalList]
    newAssignees.find(item => {
      if (item.id == id && item.processed == '2') {
        // 找到当前的 并且已经审批完成的时候
        flag = true
      }
    })
    return flag
  }

  // 渲染不同状态时步骤的样式
  renderDiffStatusStepStyles = () => {
    const {
      itemValue = {},
      processInfo: { status: parentStatus }
    } = this.props
    const { status } = itemValue
    let stylLine, stylCircle
    if (parentStatus == '2') {
      // 表示已中止
      if (status == '1') {
        // 进行中
        stylLine = indexStyles.hasnotCompetedLine
        stylCircle = indexStyles.hasnotCompetedCircle
      } else {
        stylLine = indexStyles.stopLine
        stylCircle = indexStyles.stopCircle
      }
    } else if (parentStatus == '0') {
      // 表示未开始
      stylLine = indexStyles.stopLine
      stylCircle = indexStyles.stopCircle
    } else {
      if (status == '0') {
        // 未开始
        stylLine = indexStyles.hasnotCompetedLine
        stylCircle = indexStyles.hasnotCompetedCircle
      } else if (status == '1') {
        // 进行中
        stylLine = indexStyles.doingLine
        stylCircle = indexStyles.doingCircle
      } else if (status == '2') {
        // 已完成
        stylLine = indexStyles.line
        stylCircle = indexStyles.circle
      } else {
        stylLine = indexStyles.doingLine
        stylCircle = indexStyles.doingCircle
      }
    }

    return { stylCircle, stylLine }
  }

  // 渲染通过 | 驳回 的成员以及内容
  renderApprovePersonnelSuggestion = item => {
    const { comment, pass, processed, avatar, name, time } = item
    return (
      <div>
        {/* 明星说暂时方案用comment判断 */}
        {comment && comment != '' ? (
          <div className={indexStyles.appListWrapper}>
            <div className={indexStyles.app_left}>
              <div
                className={indexStyles.approve_user}
                style={{ position: 'relative', marginRight: '16px' }}
              >
                {/* <div className={indexStyles.defaut_avatar}></div> */}
                {avatar ? (
                  <img
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '32px'
                    }}
                    src={
                      this.isValidAvatar(avatar) ? avatar : defaultUserAvatar
                    }
                  />
                ) : (
                  <img
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '32px'
                    }}
                    src={defaultUserAvatar}
                  />
                )}
                {pass == '1' ? (
                  <span
                    className={`${globalStyles.authTheme} ${indexStyles.approve_userIcon}`}
                  >
                    &#xe849;
                  </span>
                ) : pass == '0' ? (
                  <span
                    className={`${globalStyles.authTheme} ${indexStyles.approve_reject_userIcon}`}
                  >
                    &#xe844;
                  </span>
                ) : (
                  <></>
                )}
              </div>
              <div>
                <span>{name}</span>
                {pass == '1' ? (
                  <span className={indexStyles.approv_pass}>通过</span>
                ) : pass == '0' ? (
                  <span className={indexStyles.approve_reject}>驳回</span>
                ) : (
                  <></>
                )}
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {comment ? comment : '未填写意见'}
                </div>
              </div>
            </div>
            <div className={indexStyles.app_right}>
              {timestampToTimeNormal(time, '/', true) || ''}
            </div>
          </div>
        ) : (
          <>
            {processed != '2' && (
              <div className={indexStyles.appListWrapper}>
                <div className={indexStyles.app_left}>
                  <div
                    className={indexStyles.approve_user}
                    style={{ position: 'relative', marginRight: '16px' }}
                  >
                    {/* <div className={indexStyles.defaut_avatar}></div> */}
                    {avatar ? (
                      <img
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '32px'
                        }}
                        src={
                          this.isValidAvatar(avatar)
                            ? avatar
                            : defaultUserAvatar
                        }
                      />
                    ) : (
                      <img
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '32px'
                        }}
                        src={defaultUserAvatar}
                      />
                    )}
                  </div>
                  <div>
                    <span>{name}</span>
                    <span className={indexStyles.default_status}>未审批</span>
                    <div style={{ color: 'rgba(0,0,0,0.25)' }}>
                      {'(暂未审批)'}
                    </div>
                  </div>
                </div>
                <div className={indexStyles.app_right}>
                  {timestampToTimeNormal(time, '/', true) || ''}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // 渲染汇签内容
  renderRemittancePersonnelSuggestion = item => {
    const { comment, pass, processed, avatar, name, time } = item
    return (
      <div>
        {/* 明星说暂时方案用comment判断 */}
        {comment && comment != '' ? (
          <div className={indexStyles.appListWrapper}>
            <div className={indexStyles.app_left}>
              <div
                className={indexStyles.approve_user}
                style={{ position: 'relative', marginRight: '16px' }}
              >
                {/* <div className={indexStyles.defaut_avatar}></div> */}
                {avatar ? (
                  <img
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '32px'
                    }}
                    src={
                      this.isValidAvatar(avatar) ? avatar : defaultUserAvatar
                    }
                  />
                ) : (
                  <img
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '32px'
                    }}
                    src={defaultUserAvatar}
                  />
                )}
              </div>
              <div>
                <span>{name}</span>
                <span className={indexStyles.approv_rating}>已审批</span>
                <div style={{ color: 'rgba(0,0,0,0.25)' }}>
                  {'(待所有审批人完成审批后显示审批意见)'}
                </div>
              </div>
            </div>
            <div className={indexStyles.app_right}>
              {timestampToTimeNormal(time, '/', true) || ''}
            </div>
          </div>
        ) : (
          <>
            {processed != '2' && (
              <div className={indexStyles.appListWrapper}>
                <div className={indexStyles.app_left}>
                  <div
                    className={indexStyles.approve_user}
                    style={{ position: 'relative', marginRight: '16px' }}
                  >
                    {/* <div className={indexStyles.defaut_avatar}></div> */}
                    {avatar ? (
                      <img
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '32px'
                        }}
                        src={
                          this.isValidAvatar(avatar)
                            ? avatar
                            : defaultUserAvatar
                        }
                      />
                    ) : (
                      <img
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '32px'
                        }}
                        src={defaultUserAvatar}
                      />
                    )}
                  </div>
                  <div>
                    <span>{name}</span>
                    <span className={indexStyles.default_status}>未审批</span>
                    <div style={{ color: 'rgba(0,0,0,0.25)' }}>
                      {'(暂未审批)'}
                    </div>
                  </div>
                </div>
                <div className={indexStyles.app_right}>
                  {timestampToTimeNormal(time, '/', true) || ''}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // 渲染通过 | 驳回 的成员以及内容
  renderHistorySuggestion = item => {
    const { comment, pass, avatar, name, time } = item
    return (
      <div>
        <div className={indexStyles.appListWrapper}>
          <div className={indexStyles.app_left}>
            <div
              className={indexStyles.approve_user}
              style={{ position: 'relative', marginRight: '16px' }}
            >
              {avatar ? (
                <img
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '32px'
                  }}
                  src={this.isValidAvatar(avatar) ? avatar : defaultUserAvatar}
                />
              ) : (
                <img
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '32px'
                  }}
                  src={defaultUserAvatar}
                />
              )}
              {pass == '1' ? (
                <span
                  className={`${globalStyles.authTheme} ${indexStyles.approve_userIcon}`}
                >
                  &#xe849;
                </span>
              ) : pass == '0' ? (
                <span
                  className={`${globalStyles.authTheme} ${indexStyles.approve_reject_userIcon}`}
                >
                  &#xe844;
                </span>
              ) : (
                <></>
              )}
            </div>
            <div>
              <span>{name}</span>
              {pass == '1' ? (
                <span className={indexStyles.approv_pass}>通过</span>
              ) : pass == '0' ? (
                <span className={indexStyles.approve_reject}>驳回</span>
              ) : (
                <></>
              )}
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {comment ? comment : '未填写意见'}
              </div>
            </div>
          </div>
          <div className={indexStyles.app_right}>
            {timestampToTimeNormal(time, '/', true) || ''}
          </div>
        </div>
      </div>
    )
  }

  // 渲染驳回的内容
  renderPopRjectContent = () => {
    const { itemValue } = this.props
    const { rejectMessage } = this.state
    return (
      <div className={indexStyles.popcontent}>
        <TextArea
          maxLength={100}
          onChange={this.handleRejectTextAreaValue}
          value={rejectMessage || ''}
          placeholder="驳回请填写驳回理由（必填）"
          className={indexStyles.c_area}
        />
      </div>
    )
  }

  // 渲染通过的内容
  renderPopConfirmContent = () => {
    const { itemValue } = this.props
    // const { successfulMessage } = itemValue
    const { successfulMessage } = this.state
    return (
      <div className={indexStyles.popcontent}>
        <TextArea
          maxLength={100}
          onChange={this.handleChangeTextAreaValue}
          value={successfulMessage || ''}
          placeholder="填写审批意见（选填）"
          className={indexStyles.c_area}
        />
      </div>
    )
  }

  renderEditDetailContent = () => {
    const {
      itemValue,
      processInfo: { status: parentStatus },
      itemKey
    } = this.props
    const {
      rejectMessage,
      transPrincipalList = [],
      isRejectNodesIng,
      isPassNodesIng,
      historyCommentsList = []
    } = this.state
    const { approve_type, status, assignees, description } = itemValue
    // 保存父级的状态是进行中 ==> 在保证当前节点是进行中 ==> 在保证是当前执行人 ==> 在保证当前执行人状态为1
    let showApproveButton =
      parentStatus == '1' &&
      status == '1' &&
      this.whetherShowCompleteButton() &&
      this.getCurrentPersonApproveStatus() == '1'
    let whetherIsComplete = isRejectNodesIng || isPassNodesIng ? false : true
    let type_name = ''
    const diffType = () => {
      switch (approve_type) {
        case '1':
          type_name = '串签'
          break
        case '2':
          type_name = '并签'
          break
        case '3':
          type_name = '汇签'
          break
        default:
          break
      }
      return type_name
    }
    return (
      <div>
        {/* 备注 */}
        {description && description != '' && (
          <div className={indexStyles.select_remarks}>
            <span className={globalStyles.authTheme}>&#xe636; 备注 :</span>
            <div>{description}</div>
          </div>
        )}
        {showApproveButton && (
          <div
            style={{
              minHeight: '64px',
              padding: '20px 14px 5px',
              color: 'rgba(0,0,0,0.45)',
              borderTop: '1px solid #e8e8e8',
              marginTop: '15px'
            }}
          >
            <OpinionContent
              value={this.state.successfulMessage}
              placeholder="填写审批意见 "
              opinionTextAreaChange={this.handleChangeTextAreaValue}
              opinionTextAreaBlur={this.handleRejectTextAreaValue}
              handleCancelRejectProcess={this.handleCancelRejectProcess}
            />
          </div>
        )}
        {/* 审批类型 */}
        <div
          style={{
            minHeight: '64px',
            padding: '20px 14px',
            color: 'rgba(0,0,0,0.45)',
            borderTop: '1px solid #e8e8e8',
            marginTop: '15px'
          }}
        >
          <span className={globalStyles.authTheme}>
            &#xe616; 审批方式 : &nbsp;&nbsp;&nbsp;{diffType()}
          </span>
          <div style={{ marginTop: '12px' }}>
            {approve_type == '3'
              ? transPrincipalList &&
                transPrincipalList.length &&
                transPrincipalList.map(item => {
                  return this.renderRemittancePersonnelSuggestion(item)
                })
              : transPrincipalList &&
                transPrincipalList.length &&
                transPrincipalList.map(item => {
                  return this.renderApprovePersonnelSuggestion(item)
                })}
            {historyCommentsList && historyCommentsList.length != 0 && (
              <div>
                <span>
                  <span
                    style={{ fontSize: '16px' }}
                    className={globalStyles.authTheme}
                  >
                    &#xe90e;
                  </span>{' '}
                  历史审批:
                </span>
                {this.state.currentSelectArrow == itemKey ? (
                  <span
                    onClick={e => {
                      this.handleShowMoreHisSuggestion(e, '')
                    }}
                    style={{
                      marginLeft: '16px',
                      color: '#1890FF',
                      cursor: 'pointer'
                    }}
                  >
                    收起{' '}
                    <span className={globalStyles.authTheme}>&#xe7ed;</span>
                  </span>
                ) : (
                  <span
                    onClick={e => {
                      this.handleShowMoreHisSuggestion(e, itemKey)
                    }}
                    style={{
                      marginLeft: '16px',
                      color: '#1890FF',
                      cursor: 'pointer'
                    }}
                  >
                    展开{' '}
                    <span className={globalStyles.authTheme}>&#xe7ee;</span>
                  </span>
                )}
              </div>
            )}
            {this.state.currentSelectArrow == itemKey &&
              historyCommentsList &&
              historyCommentsList.length != 0 &&
              historyCommentsList.map(item => {
                return this.renderHistorySuggestion(item)
              })}
          </div>
        </div>
        {/* 编辑按钮 */}
        {showApproveButton && (
          <div
            className={indexStyles.button_wrapper}
            style={{
              paddingTop: '24px',
              borderTop: '1px solid #e8e8e8',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            <Button
              onClick={this.handleRejectProcess}
              disabled={
                rejectMessage
                  ? isRejectNodesIng || isPassNodesIng
                    ? true
                    : false
                  : true
              }
              style={{
                color: rejectMessage ? '#fff' : 'rgba(0,0,0,.25)',
                background: rejectMessage ? '#FF7875' : '#f5f5f5',
                marginRight: '8px',
                borderColor: rejectMessage ? '' : '#d9d9d99'
              }}
            >
              驳回
            </Button>
            <Button
              onClick={this.handlePassProcess}
              disabled={whetherIsComplete ? false : true}
              type="primary"
            >
              通过
            </Button>
            {/* <Popconfirm
                className={indexStyles.confirm_wrapper} icon={<></>}
                getPopupContainer={triggerNode => triggerNode.parentNode}
                placement="top" title={this.renderPopRjectContent()}
                okText="驳回"
                okButtonProps={{ disabled: rejectMessage ? (isRejectNodesIng || isPassNodesIng ? true : false) : true }}
                onCancel={this.handleCancelRejectProcess}
                onConfirm={this.handleRejectProcess}
                onVisibleChange={this.onVisibleChange}
              >
                <Button style={{ color: '#fff', background: '#FF7875', marginRight: '8px', border: 'none' }}>驳回</Button>
              </Popconfirm>
              <Popconfirm
                onVisibleChange={this.onVisibleChange}
                className={indexStyles.confirm_wrapper} icon={<></>}
                getPopupContainer={triggerNode => triggerNode.parentNode}
                // okButtonProps={{ disabled: isRejectNodesIng || isPassNodesIng ? true : false }}
                placement="top" title={this.renderPopConfirmContent()}
                okButtonProps={{ disabled: whetherIsComplete ? false : true }}
                okText="通过"
                onCancel={this.handleCancelSuccessProcess}
                onConfirm={this.handlePassProcess}
              >
                <Button type="primary">通过</Button>
              </Popconfirm> */}
          </div>
        )}
        {/* 撤回按钮 */}
        {this.whetherIsHasRebackNodesBtn() &&
          status == '2' &&
          parentStatus == '1' && (
            <div
              style={{
                paddingTop: '24px',
                borderTop: '1px solid #e8e8e8',
                textAlign: 'center'
              }}
            >
              <Button
                onClick={this.handleRebackProcessNodes}
                style={{
                  border: '1px solid rgba(24,144,255,1)',
                  color: '#1890FF'
                }}
              >
                撤回
              </Button>
            </div>
          )}
      </div>
    )
  }

  /**
   * 渲染悬浮状态的审批节点
   * 根据 container_configureProcessOut 容器作为父元素来定位的
   */
  renderAbsoluteContent = () => {
    const { itemKey, processEditDatas = [], itemValue } = this.props
    const { name, status } = itemValue
    const { transPrincipalList = [], is_show_spread_arrow } = this.state
    return (
      <div
        id="currentAbsoluteApproveContainer"
        key={itemKey}
        style={{
          display: 'flex',
          marginBottom: '46px',
          marginRight: '32px',
          left: '32px',
          right: 0,
          position: 'absolute',
          top: '478px',
          zIndex: 1
        }}
      >
        {processEditDatas.length <= itemKey + 1 ? null : (
          <div className={this.renderDiffStatusStepStyles().stylLine}></div>
        )}
        <div className={this.renderDiffStatusStepStyles().stylCircle}>
          {' '}
          {itemKey + 1}
        </div>
        <div
          className={`${
            status == '1'
              ? indexStyles.popover_card
              : indexStyles.default_popover_card
          }`}
        >
          <div className={`${globalStyles.global_vertical_scrollbar}`}>
            {/* 步骤名称 */}
            <div style={{ marginBottom: '16px' }}>
              <div className={`${indexStyles.node_name}`}>
                <div>
                  <span
                    className={`${globalStyles.authTheme} ${indexStyles.stepTypeIcon}`}
                  >
                    &#xe616;
                  </span>
                  <span>{name}</span>
                </div>
                <div>
                  <span
                    onClick={this.handleSpreadArrow}
                    className={`${indexStyles.spreadIcon}`}
                  >
                    {!is_show_spread_arrow ? (
                      <span
                        className={`${globalStyles.authTheme} ${indexStyles.spread_arrow}`}
                      >
                        &#xe7ee;
                      </span>
                    ) : (
                      <span
                        className={`${globalStyles.authTheme} ${indexStyles.spread_arrow}`}
                      >
                        &#xe7ed;
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
            {/* 下 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div className={indexStyles.content__principalList_icon}>
                <AvatarList
                  size="small"
                  maxLength={10}
                  excessItemsStyle={{
                    color: '#f56a00',
                    backgroundColor: '#fde3cf'
                  }}
                >
                  {transPrincipalList &&
                    transPrincipalList.length &&
                    transPrincipalList.map(({ name, avatar }, index) => (
                      <AvatarList.Item
                        key={index}
                        tips={name}
                        src={
                          this.isValidAvatar(avatar)
                            ? avatar
                            : defaultUserAvatar
                        }
                      />
                    ))}
                </AvatarList>
                <span className={indexStyles.content__principalList_info}>
                  {`${transPrincipalList.length}位审批人`}
                </span>
              </div>
              <div>
                <span
                  style={{
                    fontWeight: 500,
                    color: 'rgba(0,0,0,0.65)',
                    fontSize: '14px'
                  }}
                  className={`${globalStyles.authTheme}`}
                >
                  &#xe686;
                </span>
                <span className={`${indexStyles.deadline_time}`}>
                  &nbsp;完成期限 : 步骤开始后1天内
                </span>
              </div>
            </div>
            {/* {is_show_spread_arrow && this.renderEditDetailContent()} */}
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { itemKey, processEditDatas = [], itemValue } = this.props
    const { status, name, cc_type, runtime_type } = itemValue
    const {
      transPrincipalList = [],
      transCopyPersonnelList = [],
      is_show_spread_arrow
    } = this.state
    return (
      <>
        <div
          id={status == '1' && 'currentStaticApproveContainer'}
          key={itemKey}
          style={{
            display: 'flex',
            marginBottom: '48px',
            position: 'relative'
          }}
        >
          {processEditDatas.length <= itemKey + 1 ? null : (
            <div className={this.renderDiffStatusStepStyles().stylLine}></div>
          )}
          <div className={this.renderDiffStatusStepStyles().stylCircle}>
            {' '}
            {itemKey + 1}
          </div>
          <div
            className={`${
              status == '1'
                ? indexStyles.popover_card
                : indexStyles.default_popover_card
            }`}
          >
            <div className={`${globalStyles.global_vertical_scrollbar}`}>
              {/* 步骤名称 */}
              <div style={{ marginBottom: '16px' }}>
                <div className={`${indexStyles.node_name}`}>
                  <div>
                    <span
                      className={`${globalStyles.authTheme} ${indexStyles.stepTypeIcon}`}
                    >
                      &#xe616;
                    </span>
                    <span>{name}</span>
                    {runtime_type == '1' && (
                      <span
                        style={{
                          color: '#FF5D60',
                          fontSize: '16px',
                          marginLeft: '8px',
                          letterSpacing: '2px'
                        }}
                      >
                        {'(被驳回)'}
                      </span>
                    )}
                  </div>
                  <div>
                    <span
                      onClick={this.handleSpreadArrow}
                      className={`${indexStyles.spreadIcon}`}
                    >
                      {!is_show_spread_arrow ? (
                        <span
                          className={`${globalStyles.authTheme} ${indexStyles.spread_arrow}`}
                        >
                          &#xe7ee;
                        </span>
                      ) : (
                        <span
                          className={`${globalStyles.authTheme} ${indexStyles.spread_arrow}`}
                        >
                          &#xe7ed;
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
              {/* 下 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {/* 填写人 */}
                  <div
                    style={{ display: 'inline-block' }}
                    className={indexStyles.content__principalList_icon}
                  >
                    {!(transPrincipalList && transPrincipalList.length) ? (
                      ''
                    ) : (
                      <>
                        <AvatarList
                          size="small"
                          maxLength={10}
                          excessItemsStyle={{
                            color: '#f56a00',
                            backgroundColor: '#fde3cf'
                          }}
                        >
                          {transPrincipalList &&
                            transPrincipalList.length &&
                            transPrincipalList.map(
                              ({ name, avatar }, index) => (
                                <AvatarList.Item
                                  key={index}
                                  tips={name || '佚名'}
                                  src={
                                    this.isValidAvatar(avatar)
                                      ? avatar
                                      : defaultUserAvatar
                                  }
                                />
                              )
                            )}
                        </AvatarList>
                        <span
                          className={indexStyles.content__principalList_info}
                        >
                          {`${transPrincipalList.length}位审批人`}
                        </span>
                      </>
                    )}
                  </div>
                  {/* 抄送人 */}
                  {cc_type == '1' && (
                    <div
                      style={{ marginLeft: '8px', display: 'inline-block' }}
                      className={indexStyles.content__principalList_icon}
                    >
                      {!(
                        transCopyPersonnelList && transCopyPersonnelList.length
                      ) ? (
                        ''
                      ) : (
                        <>
                          <AvatarList
                            size="small"
                            maxLength={10}
                            excessItemsStyle={{
                              color: '#f56a00',
                              backgroundColor: '#fde3cf'
                            }}
                          >
                            {transCopyPersonnelList &&
                              transCopyPersonnelList.length &&
                              transCopyPersonnelList.map(
                                ({ name, avatar }, index) => (
                                  <AvatarList.Item
                                    key={index}
                                    tips={name || '佚名'}
                                    src={
                                      this.isValidAvatar(avatar)
                                        ? avatar
                                        : defaultUserAvatar
                                    }
                                  />
                                )
                              )}
                          </AvatarList>
                          <span
                            className={indexStyles.content__principalList_info}
                          >
                            {`${transCopyPersonnelList.length}位抄送人`}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ marginRight: '14px' }}>
                  <DifferenceDeadlineType
                    type="nodesStepItem"
                    itemValue={itemValue}
                  />
                </div>
              </div>
              {is_show_spread_arrow && this.renderEditDetailContent()}
            </div>
          </div>
        </div>
        <div>{/* {status == '1' && this.renderAbsoluteContent()} */}</div>
      </>
    )
  }
}

function mapStateToProps({
  publicProcessDetailModal: { processEditDatas = [], processInfo = {} },
  technological: {
    datas: { userBoardPermissions = [] }
  }
}) {
  return { processEditDatas, processInfo, userBoardPermissions }
}
