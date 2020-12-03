import React, { Component } from 'react'
import indexStyles from '../index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import AvatarList from '../../AvatarList'
import AccomplishStepOne_one from './AccomplishStepOne_one'
import AccomplishStepOne_two from './AccomplishStepOne_two'
import AccomplishStepOne_three from './AccomplishStepOne_three'
import AccomplishStepOne_five from './AccomplishStepOne_five'
import defaultUserAvatar from '@/assets/invite/user_default_avatar@2x.png'
import { Button } from 'antd'
import { connect } from 'dva'
import DifferenceDeadlineType from '../../DifferenceDeadlineType'
import { currentNounPlanFilterName } from '../../../../../utils/businessFunction'
import { FLOWS } from '../../../../../globalset/js/constant'
import { isObjectValueEqual } from '../../../../../utils/util'
import {
  findCurrentApproveNodesPosition,
  findCurrentRatingScoreNodesPosition
} from '../../handleOperateModal'
import AccomplishStepOne_six from './AccomplishStepOne_six'

@connect(mapStateToProps)
export default class AccomplishStepOne extends Component {
  constructor(props) {
    super(props)
    let curr_position = findCurrentApproveNodesPosition(
      props['processEditDatas']
    )
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
        props.itemKey == rating_position - 1
          ? true
          : false
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
      let rating_position = findCurrentRatingScoreNodesPosition(
        nextProps['processEditDatas']
      )
      this.setState({
        is_show_spread_arrow:
          nextProps.itemValue.status == '1' ||
          nextProps.itemKey == curr_position - 1 ||
          nextProps.itemKey == rating_position - 1
            ? true
            : false
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

  /**
   * 判断是否有撤回按钮
   * @returns {Boolean} true 表示显示 false表示不能显示
   */
  whetherShowRebackButton = () => {
    const { itemValue } = this.props
    const { assignee_type, assignees } = itemValue
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
    // if (assignee_type == '2') { // 表示只有在指定人员的情况下才会有判断情况
    //   let newAssignees = [...transPrincipalList]
    //   newAssignees.find(item => {
    //     if (item.id == id) {
    //       flag = true
    //     }
    //   })
    // } else if (assignee_type == '1') {
    //   flag = true
    // }
    return flag
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
      itemValue: { id: flow_node_instance_id },
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
          // this.updateCorrespondingPrcodessStepWithNodeContent('status','1')
          // this.updateCorrespondingPrcodessStepWithNodeContent('is_confirm','0')
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

  // 渲染不同状态时步骤的样式
  renderDiffStatusStepStyles = () => {
    const {
      itemValue,
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

  // 理解成是否是有效的头像
  isValidAvatar = (avatarUrl = '') =>
    avatarUrl.includes('http://') || avatarUrl.includes('https://')

  filterForm = (value, key) => {
    const { field_type } = value
    const { itemKey } = this.props
    let container = <div></div>
    switch (field_type) {
      case '1':
        container = (
          // eslint-disable-next-line react/jsx-pascal-case
          <AccomplishStepOne_one
            parentKey={itemKey}
            updateCorrespondingPrcodessStepWithNodeContent={
              this.updateCorrespondingPrcodessStepWithNodeContent
            }
            itemKey={key}
            itemValue={value}
          />
        )
        break
      case '2':
        container = (
          // eslint-disable-next-line react/jsx-pascal-case
          <AccomplishStepOne_two
            parentKey={itemKey}
            updateCorrespondingPrcodessStepWithNodeContent={
              this.updateCorrespondingPrcodessStepWithNodeContent
            }
            itemKey={key}
            itemValue={value}
          />
        )
        break
      case '3':
        container = (
          // eslint-disable-next-line react/jsx-pascal-case
          <AccomplishStepOne_three
            parentKey={itemKey}
            updateCorrespondingPrcodessStepWithNodeContent={
              this.updateCorrespondingPrcodessStepWithNodeContent
            }
            itemKey={key}
            itemValue={value}
          />
        )
        break
      case '5':
        container = (
          // eslint-disable-next-line react/jsx-pascal-case
          <AccomplishStepOne_five
            parentKey={itemKey}
            updateCorrespondingPrcodessStepWithNodeContent={
              this.updateCorrespondingPrcodessStepWithNodeContent
            }
            itemKey={key}
            itemValue={value}
          />
        )
        break
      case '6':
        container = (
          // eslint-disable-next-line react/jsx-pascal-case
          <AccomplishStepOne_six
            parentKey={itemKey}
            updateCorrespondingPrcodessStepWithNodeContent={
              this.updateCorrespondingPrcodessStepWithNodeContent
            }
            itemKey={key}
            itemValue={value}
          />
        )
        break
      default:
        break
    }
    return container
  }

  // 渲染编辑详情的内容
  renderEditDetailContent = () => {
    const {
      itemValue,
      processInfo: { status: parentStatus }
    } = this.props
    const { forms = [], description, deadline_value, status } = itemValue
    return (
      <div>
        {/* 备注 */}
        {description && description != '' && (
          <div className={indexStyles.select_remarks}>
            <span className={globalStyles.authTheme}>&#xe636; 备注 :</span>
            <div>{description}</div>
          </div>
        )}
        {/* 表单内容 */}
        {forms && forms.length ? (
          <div
            style={{
              padding: '16px 0 8px 0',
              marginTop: '16px',
              borderTop: '1px solid #e8e8e8',
              paddingBottom: '0px'
            }}
          >
            {forms.map((item, key) => {
              return this.filterForm(item, key)
            })}
          </div>
        ) : (
          <></>
        )}
        {this.whetherShowRebackButton() &&
          status == '2' &&
          parentStatus == '1' && (
            <div className={indexStyles.reback_btn}>
              <Button onClick={this.handleRebackProcessNodes}>撤回</Button>
            </div>
          )}
      </div>
    )
  }

  render() {
    const { itemKey, processEditDatas = [], itemValue } = this.props
    const { status, name, assignee_type, cc_type } = itemValue
    const {
      transPrincipalList = [],
      transCopyPersonnelList = [],
      is_show_spread_arrow
    } = this.state
    return (
      <div
        id={status == '1' && 'currentDataCollectionItem'}
        key={itemKey}
        style={{ display: 'flex', marginBottom: '48px' }}
      >
        {processEditDatas.length <= itemKey + 1 ? null : (
          <div className={this.renderDiffStatusStepStyles().stylLine}></div>
        )}
        {/* <div className={indexStyles.doingLine}></div> */}
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
            {/* 上 */}
            <div style={{ marginBottom: '16px' }}>
              <div className={`${indexStyles.node_name}`}>
                <div>
                  <span
                    className={`${globalStyles.authTheme} ${indexStyles.stepTypeIcon}`}
                  >
                    &#xe7b1;
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
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* 填写人 */}
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
                      {`${transPrincipalList.length}位填写人`}
                    </span>
                  </>
                )}
                {/* {
                  assignee_type == '2' ? (
                    <div style={{ display: 'inline-block' }} className={indexStyles.content__principalList_icon}>
                      <AvatarList
                        size="small"
                        maxLength={10}
                        excessItemsStyle={{
                          color: '#f56a00',
                          backgroundColor: '#fde3cf'
                        }}
                      >
                        {(transPrincipalList && transPrincipalList.length) && transPrincipalList.map(({ name, avatar }, index) => (
                          <AvatarList.Item
                            key={index}
                            tips={name || '佚名'}
                            src={this.isValidAvatar(avatar) ? avatar : defaultUserAvatar}
                          />
                        ))}
                      </AvatarList>
                      <span className={indexStyles.content__principalList_info}>
                        {`${transPrincipalList.length}位填写人`}
                      </span>
                    </div>
                  ) : (
                      <div style={{ display: 'inline-block' }} className={indexStyles.content__principalList_icon}>
                        <span style={{ display: 'inline-block', width: '24px', height: '24px', background: 'rgba(230,247,255,1)', borderRadius: '20px', textAlign: 'center', marginRight: '5px' }}><span style={{ color: '#1890FF' }} className={globalStyles.authTheme}>&#xe7b2;</span></span>
                        <span>{`${currentNounPlanFilterName(FLOWS)}发起人`}</span>
                      </div>
                    )
                } */}
                {/* 抄送人 */}
                {cc_type == '1' && (
                  <div
                    style={{ marginLeft: '8px', display: 'inline-block' }}
                    className={indexStyles.content__principalList_icon}
                  >
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
                    <span className={indexStyles.content__principalList_info}>
                      {`${transCopyPersonnelList.length}位抄送人`}
                    </span>
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
  publicProcessDetailModal: { processEditDatas = [], processInfo = {} }
}) {
  return { processEditDatas, processInfo }
}
