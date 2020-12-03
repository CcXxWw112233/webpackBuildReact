/* eslint-disable react/jsx-pascal-case */
import React, { Component } from 'react'
import indexStyles from '../index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import AvatarList from '../../AvatarList'
import defaultUserAvatar from '@/assets/invite/user_default_avatar@2x.png'
import {
  Button,
  Tooltip,
  Icon,
  Popconfirm,
  Input,
  message,
  Popover
} from 'antd'
import { connect } from 'dva'
import {
  renderTimeType,
  computing_mode,
  result_score_option,
  result_score_fall_through_with_others,
  genPrincipalListFromAssignees,
  findCurrentApproveNodesPosition,
  findCurrentRatingScoreNodesPosition,
  findCurrentOverruleNodesPosition
} from '../../handleOperateModal'
import {
  checkIsHasPermissionInVisitControl,
  checkIsHasPermissionInBoard
} from '../../../../../utils/businessFunction'
import {
  PROJECT_FLOW_FLOW_ACCESS,
  NOT_HAS_PERMISION_COMFIRN,
  MESSAGE_DURATION_TIME
} from '../../../../../globalset/js/constant'
import BeginningStepThree_one from './BeginningStepThree_one'
import {
  isObjectValueEqual,
  timestampToTimeNormal
} from '../../../../../utils/util'
import DifferenceDeadlineType from '../../DifferenceDeadlineType'
const TextArea = Input.TextArea
@connect(mapStateToProps)
export default class BeginningStepThree extends Component {
  constructor(props) {
    super(props)
    let approve_position = findCurrentApproveNodesPosition(
      props['processEditDatas']
    )
    let rating_position = findCurrentRatingScoreNodesPosition(
      props['processEditDatas']
    )
    let overrule_position = findCurrentOverruleNodesPosition(
      props['processEditDatas']
    ) // 获取当前被驳回节点的位置
    this.state = {
      transPrincipalList: props.itemValue.assignees
        ? [...props.itemValue.assignees]
        : [], // 表示当前的执行人
      transCopyPersonnelList: props.itemValue.recipients
        ? [...props.itemValue.recipients]
        : [], // 表示当前选择的抄送人
      is_show_spread_arrow:
        props.itemValue.status == '1' ||
        props.itemKey == approve_position - 1 ||
        props.itemValue.runtime_type == '1' ||
        props.itemKey == rating_position - 1 ||
        props.itemKey ==
          (overrule_position != '' ? Number(overrule_position) + 1 : '')
          ? true
          : false, // 是否展开箭头 详情 true表示展开
      historyCommentsList: props.itemValue.his_comments
        ? [...props.itemValue.his_comments]
        : [],
      currentSelectJudgeArrow: '',
      currentSelectHisArrow: ''
    }
  }

  componentWillReceiveProps(nextProps) {
    // 需要更新箭头的状态
    if (!isObjectValueEqual(this.props, nextProps)) {
      let approve_position
      if (nextProps)
        approve_position = findCurrentApproveNodesPosition(
          nextProps['processEditDatas']
        )
      let rating_position = findCurrentRatingScoreNodesPosition(
        nextProps['processEditDatas']
      )
      let overrule_position = findCurrentOverruleNodesPosition(
        nextProps['processEditDatas']
      ) // 获取当前被驳回节点的位置
      this.setState({
        is_show_spread_arrow:
          nextProps.itemValue.status == '1' ||
          nextProps.itemKey == approve_position - 1 ||
          nextProps.itemValue.runtime_type == '1' ||
          nextProps.itemKey == rating_position - 1 ||
          nextProps.itemKey ==
            (overrule_position != '' ? Number(overrule_position) + 1 : '')
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
        currentSelectJudgeArrow:
          nextProps.itemValue.status == '1' ? '' : nextProps.itemKey,
        currentSelectHisArrow: ''
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

  // 编辑点击事件
  handleEnterConfigureProcess = e => {
    e && e.stopPropagation()
    // this.updateCorrespondingPrcodessStepWithNodeContent('is_edit', '0')
  }

  handleSpreadArrow = e => {
    e && e.stopPropagation()
    this.setState({
      is_show_spread_arrow: !this.state.is_show_spread_arrow
    })
  }

  // 理解成是否是有效的头像
  isValidAvatar = (avatarUrl = '') =>
    avatarUrl.includes('http://') || avatarUrl.includes('https://')

  // 判断是否可以完成 true 表示可以完成
  whetherIsComplete = () => {
    const { processEditDatas = [], itemKey } = this.props
    let flag
    let temp_item
    const reg = /^([0-9]\d{0,2}(\.\d{1,2})?|1000)$/
    let new_data = processEditDatas[itemKey]['score_items'] || []
    flag = new_data.every(item => reg.test(item.value))
    return flag
  }

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

  // 获取当前节点中所有评分项的value
  getCurrentAllNodesScoreValues = () => {
    const { itemValue, itemKey, processEditDatas = [] } = this.props
    const { score_items = [] } = processEditDatas[itemKey]
    let newFormsData = [...score_items]
    let score_values = []
    newFormsData.map(item => {
      let obj = {
        field_id: item.id || '',
        field_value: item.value || ''
      }
      score_values.push(obj)
    })
    return score_values
  }

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

  handleCancelSuccessProcess = e => {
    e && e.stopPropagation()
    this.setState({
      successfulMessage: ''
    })
  }

  // 通过的点击事件
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
      request_flows_params = {},
      itemKey
    } = this.props
    const { id: flow_node_instance_id } = itemValue
    let score_values = this.getCurrentAllNodesScoreValues()
    const { successfulMessage } = this.state
    let BOARD_ID =
      (request_flows_params && request_flows_params.request_board_id) ||
      board_id
    this.props.dispatch({
      type: 'publicProcessDetailModal/fillFormComplete',
      payload: {
        flow_instance_id,
        flow_node_instance_id,
        content_values: score_values,
        message: successfulMessage ? successfulMessage : '无意见。',
        calback: () => {
          this.setState({
            successfulMessage: '',
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

  // 展开收起
  handleShowMoreJudge = (e, key) => {
    e && e.stopPropagation()
    this.setState({
      currentSelectJudgeArrow: key
    })
  }

  handleShowMoreHisSuggestion = (e, key) => {
    this.setState({
      currentSelectHisArrow: key
    })
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

  renderPopConfirmContent = () => {
    const { itemValue } = this.props
    // const { successfulMessage } = itemValue
    const { successfulMessage } = this.state
    return (
      <div className={indexStyles.popcontent}>
        <TextArea
          maxLength={200}
          onChange={this.handleChangeTextAreaValue}
          value={successfulMessage || ''}
          placeholder="填写评分意见（选填）"
          className={indexStyles.c_area}
        />
      </div>
    )
  }

  renderRatingDetailDefaultContent = (score_items = []) => {
    return (
      <div
        style={{ width: '260px', height: '206px', overflowY: 'auto' }}
        className={globalStyles.global_vertical_scrollbar}
      >
        <table border={1} style={{ borderColor: '#E9E9E9' }} width="100%">
          <tr
            style={{
              height: '32px',
              border: '1px solid #E9E9E9',
              textAlign: 'center',
              background: '#FAFAFA',
              color: 'rgba(0,0,0,0.45)'
            }}
          >
            <th style={{ width: '196px' }}>标题</th>
            <th style={{ width: '58px' }}>分值</th>
          </tr>
          {score_items &&
            score_items.length &&
            score_items.map(item => {
              return (
                <>
                  {item.is_total == '0' ? (
                    <tr
                      style={{
                        height: '32px',
                        border: '1px solid #E9E9E9',
                        textAlign: 'center',
                        fontSize: '14px',
                        color: 'rgba(0,0,0,0.65)'
                      }}
                    >
                      <td
                        style={{
                          maxWidth: '78px',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {item.title || ''}
                      </td>
                      <td style={{ color: '#1890FF' }}>{item.value || ''}</td>
                    </tr>
                  ) : (
                    <tr
                      style={{
                        height: '32px',
                        border: '1px solid #E9E9E9',
                        textAlign: 'center',
                        fontSize: '14px',
                        color: 'rgba(0,0,0,0.65)'
                      }}
                    >
                      <td
                        style={{
                          maxWidth: '156px',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          color: '#1890FF'
                        }}
                      >
                        {item.title || ''}
                      </td>
                      <td style={{ color: '#1890FF' }}>{item.value || ''}</td>
                    </tr>
                  )}
                </>
              )
            })}
        </table>
      </div>
    )
  }

  renderRatingDetailWeightContent = (score_items = []) => {
    return (
      <div
        style={{ width: '260px', height: '206px', overflowY: 'auto' }}
        className={globalStyles.global_vertical_scrollbar}
      >
        <table border={1} style={{ borderColor: '#E9E9E9' }} width="100%">
          <tr
            style={{
              height: '32px',
              border: '1px solid #E9E9E9',
              textAlign: 'center',
              background: '#FAFAFA',
              color: 'rgba(0,0,0,0.45)'
            }}
          >
            <th style={{ width: '98px' }}>标题</th>
            <th style={{ width: '70px' }}>权重占比%</th>
            <th style={{ width: '58px' }}>分值</th>
          </tr>
          {score_items &&
            score_items.length &&
            score_items.map(item => {
              return (
                <>
                  {item.is_total == '0' ? (
                    <tr
                      style={{
                        height: '32px',
                        border: '1px solid #E9E9E9',
                        textAlign: 'center',
                        fontSize: '14px',
                        color: 'rgba(0,0,0,0.65)'
                      }}
                    >
                      <td
                        style={{
                          maxWidth: '78px',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {item.title || ''}
                      </td>
                      <td>{`${item.weight_ratio}%` || ''}</td>
                      <td style={{ color: '#1890FF' }}>{item.value || ''}</td>
                    </tr>
                  ) : (
                    <tr
                      style={{
                        height: '32px',
                        border: '1px solid #E9E9E9',
                        textAlign: 'center',
                        fontSize: '14px',
                        color: 'rgba(0,0,0,0.65)'
                      }}
                    >
                      <td
                        style={{
                          maxWidth: '78px',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          color: '#1890FF'
                        }}
                      >
                        {item.title || ''}
                      </td>
                      <td>{`${item.weight_ratio}%` || ''}</td>
                      <td style={{ color: '#1890FF' }}>{item.value || ''}</td>
                    </tr>
                  )}
                </>
              )
            })}
        </table>
      </div>
    )
  }

  renderHistorySuggestion = item => {
    const {
      itemValue: {
        enable_weight,
        score_node_set: { score_display },
        status
      }
    } = this.props
    const {
      comment,
      pass,
      processed,
      avatar,
      name,
      time,
      score_items = []
    } = item
    let last_total =
      (score_items && score_items.find(item => item.is_total == '1')) || {}
    return (
      <div className={indexStyles.appListWrapper}>
        <div className={indexStyles.app_left}>
          <div
            className={indexStyles.approve_user}
            style={{ position: 'relative', marginRight: '16px' }}
          >
            {/* <div className={indexStyles.defaut_avatar}></div> */}
            {avatar ? (
              <img
                style={{ width: '32px', height: '32px', borderRadius: '32px' }}
                src={this.isValidAvatar(avatar) ? avatar : defaultUserAvatar}
              />
            ) : (
              <img
                style={{ width: '32px', height: '32px', borderRadius: '32px' }}
                src={defaultUserAvatar}
              />
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <span>{name}</span>
            <span style={{ color: '#1890FF', margin: '0 8px' }}>
              {last_total.value}
            </span>
            <Popover
              getPopupContainer={triggerNode => triggerNode.parentNode}
              placement="rightTop"
              content={
                enable_weight == '1'
                  ? this.renderRatingDetailWeightContent(score_items)
                  : this.renderRatingDetailDefaultContent(score_items)
              }
              title={<div>评分详情</div>}
            >
              <span
                style={{
                  color: '#1890FF',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
                className={globalStyles.authTheme}
              >
                &#xe7b4;
              </span>
            </Popover>
            <div
              style={{
                color:
                  comment == '无意见。'
                    ? 'rgba(0,0,0,0.25)'
                    : 'rgba(0,0,0,0.65)',
                whiteSpace: 'pre-wrap'
              }}
            >
              {comment}
            </div>
          </div>
        </div>
        <div className={indexStyles.app_right}>
          {timestampToTimeNormal(time, '/', true) || ''}
        </div>
      </div>
    )
  }

  renderEditDetailContent = () => {
    const {
      isPassNodesIng,
      successfulMessage,
      transPrincipalList = [],
      historyCommentsList = []
    } = this.state
    const {
      itemValue,
      itemKey,
      processInfo: { status: parentStatus }
    } = this.props
    const {
      score_node_set: {
        count_type,
        result_condition_type,
        result_case_pass,
        result_case_other,
        result_value
      },
      status,
      score_result_value,
      description
    } = itemValue
    let showApproveButton =
      parentStatus == '1' &&
      status == '1' &&
      this.whetherShowCompleteButton() &&
      this.getCurrentPersonApproveStatus() == '1'
    let whetherIsComplete = this.whetherIsComplete() ? false : true
    return (
      <div>
        {/* 备注 */}
        {description && description != '' && (
          <div className={indexStyles.select_remarks}>
            <span className={globalStyles.authTheme}>&#xe636; 备注 :</span>
            <div>{description}</div>
          </div>
        )}
        {/* 渲染评分项 */}
        <div style={{ position: 'relative' }}>
          <BeginningStepThree_one
            value={this.state.successfulMessage}
            opinionTextAreaChange={this.handleChangeTextAreaValue}
            transPrincipalList={transPrincipalList}
            showApproveButton={showApproveButton}
            updateCorrespondingPrcodessStepWithNodeContent={
              this.updateCorrespondingPrcodessStepWithNodeContent
            }
            itemValue={itemValue}
            itemKey={itemKey}
          />
          {/* {
            !showApproveButton && (
              <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, margin: 'auto', zIndex: 2}}></div>
            )
          } */}
        </div>
        {/* 评分结果判定 */}
        <div>
          <div
            style={{
              minHeight:
                score_result_value && score_result_value != ''
                  ? this.state.currentSelectJudgeArrow == itemKey
                    ? '258px'
                    : '54px'
                  : this.state.currentSelectJudgeArrow == itemKey
                  ? '210px'
                  : '54px',
              padding: '16px 14px',
              borderTop: '1px solid rgba(0,0,0,0.09)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ color: 'rgba(0,0,0,0.45)' }}>
              <span
                style={{ fontSize: '16px' }}
                className={globalStyles.authTheme}
              >
                &#xe7bf;
              </span>
              <span style={{ marginLeft: '4px' }}>
                评分结果判定：
                {this.state.currentSelectJudgeArrow == itemKey ? (
                  <span
                    onClick={e => {
                      this.handleShowMoreJudge(e, '')
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
                      this.handleShowMoreJudge(e, itemKey)
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
              </span>
            </div>
            <>
              {this.state.currentSelectJudgeArrow == itemKey && (
                <>
                  {String(score_result_value) &&
                    score_result_value != '' &&
                    score_result_value != '0' &&
                    score_result_value && (
                      <div>
                        <span className={indexStyles.rating_label_name}>
                          结果分数:
                        </span>
                        <span style={{ fontSize: '20px', color: '#1890FF' }}>
                          {score_result_value}
                        </span>
                      </div>
                    )}
                  <div>
                    <span className={indexStyles.rating_label_name}>
                      计算方式
                    </span>
                    {count_type == '2' || count_type == '3' ? (
                      <>
                        <span
                          className={indexStyles.select_item}
                          style={{ minWidth: '94px' }}
                        >
                          总分值平均
                        </span>
                        <span
                          className={indexStyles.select_item}
                          style={{ minWidth: '136px' }}
                        >
                          {computing_mode(count_type)}
                        </span>
                      </>
                    ) : (
                      <span
                        className={indexStyles.select_item}
                        style={{ minWidth: '94px' }}
                      >
                        {computing_mode(count_type)}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className={indexStyles.rating_label_name}>
                      结果分数
                    </span>
                    <span
                      className={indexStyles.select_item}
                      style={{ minWidth: '94px' }}
                    >
                      {result_score_option(result_condition_type)}
                    </span>
                    <span
                      className={indexStyles.select_item}
                      style={{ minWidth: '40px' }}
                    >
                      {result_value}
                    </span>
                    <span
                      className={indexStyles.select_item}
                      style={{ minWidth: '136px' }}
                    >
                      {result_score_fall_through_with_others(result_case_pass)}
                    </span>
                  </div>
                  <div>
                    <span className={indexStyles.rating_label_name}>
                      其余情况
                    </span>
                    <span
                      className={indexStyles.select_item}
                      style={{ minWidth: '136px' }}
                    >
                      {result_score_fall_through_with_others(result_case_other)}
                    </span>
                  </div>
                </>
              )}
            </>
          </div>
        </div>
        {/* 历史评分 */}
        {historyCommentsList && historyCommentsList.length != 0 && (
          <div
            style={{
              minHeight: '54px',
              borderTop: '1px solid rgba(0,0,0,0.09)',
              padding: '16px 14px'
            }}
          >
            <div>
              <span
                style={{
                  color: 'rgba(0,0,0,0.65)',
                  fontSize: '16px',
                  marginRight: '4px',
                  fontWeight: 500
                }}
                className={globalStyles.authTheme}
              >
                &#xe90e;
              </span>
              <span style={{ color: 'rgba(0,0,0,0.45)' }}>历史评分&nbsp;:</span>
              {this.state.currentSelectHisArrow == itemKey ? (
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
                  收起 <span className={globalStyles.authTheme}>&#xe7ed;</span>
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
                  展开 <span className={globalStyles.authTheme}>&#xe7ee;</span>
                </span>
              )}
            </div>
            {this.state.currentSelectHisArrow == itemKey &&
              historyCommentsList.map(item => {
                return <div>{this.renderHistorySuggestion(item)}</div>
              })}
          </div>
        )}
        {/* 编辑按钮 */}
        {showApproveButton && (
          <div
            className={indexStyles.button_wrapper}
            style={{
              paddingTop: '24px',
              borderTop: '1px solid #e8e8e8',
              textAlign: 'center'
            }}
          >
            <Button
              disabled={whetherIsComplete}
              onClick={this.handlePassProcess}
              type="primary"
            >
              完成
            </Button>
            {/* <Popconfirm
                onVisibleChange={this.onVisibleChange}
                className={indexStyles.confirm_wrapper} icon={<></>}
                getPopupContainer={triggerNode => triggerNode.parentNode}
                placement="top" title={this.renderPopConfirmContent()}
                okText="通过"
                okButtonProps={{ disabled: whetherIsComplete }}
                onCancel={this.handleCancelSuccessProcess}
                onConfirm={this.handlePassProcess}
              >
                <Button disabled={whetherIsComplete} onClick={this.handleEnterConfigureProcess} type="primary">完成</Button>
              </Popconfirm> */}
          </div>
        )}
        {/* 已完成按钮 */}
        {parentStatus == '1' &&
          status == '1' &&
          this.getCurrentPersonApproveStatus() == '2' && (
            <div
              style={{
                paddingTop: '24px',
                borderTop: '1px solid #e8e8e8',
                textAlign: 'center'
              }}
            >
              <Button disabled={true}>已完成</Button>
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

  render() {
    const { itemKey, itemValue, processEditDatas = [] } = this.props
    const {
      is_show_spread_arrow,
      transPrincipalList = [],
      transCopyPersonnelList = []
    } = this.state
    const {
      name,
      cc_type,
      deadline_type,
      deadline_value,
      deadline_time_type,
      status,
      runtime_type
    } = itemValue
    return (
      <div
        id={status == '1' && 'currentStaticRatingScoreContainer'}
        key={itemKey}
        style={{ display: 'flex', marginBottom: '48px', position: 'relative' }}
      >
        {processEditDatas.length <= itemKey + 1 ? null : (
          <div className={this.renderDiffStatusStepStyles().stylLine}></div>
        )}
        <div className={this.renderDiffStatusStepStyles().stylCircle}>
          {' '}
          {itemKey + 1}
        </div>
        {/* <div className={indexStyles.line}></div>
        <div className={indexStyles.circle}> {itemKey + 1}</div> */}
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
                    &#xe7b6;
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
              <div>
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
                          transPrincipalList.map(({ name, avatar }, index) => (
                            <AvatarList.Item
                              key={index}
                              tips={name || '佚名'}
                              src={
                                this.isValidAvatar(avatar)
                                  ? avatar
                                  : defaultUserAvatar
                              }
                            />
                          ))}
                      </AvatarList>
                      <span className={indexStyles.content__principalList_info}>
                        {`${transPrincipalList.length}位评分人`}
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
    )
  }
}

function mapStateToProps({
  publicProcessDetailModal: { processEditDatas = [], processInfo = {} },
  projectDetail: {
    datas: { projectDetailInfoData = {} }
  },
  technological: {
    datas: { userBoardPermissions = [] }
  }
}) {
  return {
    processEditDatas,
    processInfo,
    projectDetailInfoData,
    userBoardPermissions
  }
}
