/* eslint-disable react/jsx-pascal-case */
import React, { Component } from 'react'
import indexStyles from '../index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import AvatarList from '../../AvatarList'
import EditStepTypeOne_one from './EditStepTypeOne_one'
import EditStepTypeOne_two from './EditStepTypeOne_two'
import EditStepTypeOne_three from './EditStepTypeOne_three'
import EditStepTypeOne_five from './EditStepTypeOne_five'
import EditStepTypeOne_six from './EditStepTypeOne_six'
import defaultUserAvatar from '@/assets/invite/user_default_avatar@2x.png'
import { Button, Tooltip } from 'antd'
import { connect } from 'dva'
import { renderTimeType } from '../../handleOperateModal'
import { currentNounPlanFilterName } from '../../../../../utils/businessFunction'
import { FLOWS } from '../../../../../globalset/js/constant'
import { isObjectValueEqual } from '../../../../../utils/util'

@connect(mapStateToProps)
export default class EditStepTypeOne extends Component {
  constructor(props) {
    super(props)
    this.state = {
      transPrincipalList: props.itemValue.assignees
        ? props.itemValue.assignees.split(',')
        : [], // 表示当前的执行人
      transCopyPersonnelList: props.itemValue.recipients
        ? props.itemValue.recipients.split(',')
        : [], // 表示当前选择的抄送人
      is_show_spread_arrow: false
    }
  }

  componentWillReceiveProps(nextProps) {
    // 需要更新箭头的状态
    if (!isObjectValueEqual(this.props, nextProps)) {
      this.setState({
        transPrincipalList: nextProps.itemValue.assignees
          ? nextProps.itemValue.assignees.split(',')
          : [], // 表示当前的执行人
        transCopyPersonnelList: nextProps.itemValue.recipients
          ? nextProps.itemValue.recipients.split(',')
          : [] // 表示当前选择的抄送人
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

  // 编辑点击事件
  handleEnterConfigureProcess = e => {
    e && e.stopPropagation()
    this.updateCorrespondingPrcodessStepWithNodeContent('is_edit', '0')
    // this.props.dispatch({
    //   type: 'publicProcessDetailModal/updateDatas',
    //   payload: {
    //     processPageFlagStep: '1'
    //   }
    // })
  }

  // 理解成是否是有效的头像
  isValidAvatar = (avatarUrl = '') =>
    avatarUrl.includes('http://') || avatarUrl.includes('https://')

  // 把assignees中的执行人,在项目中的所有成员过滤出来
  filterAssignees = () => {
    const {
      projectDetailInfoData: { data = [] },
      currentOrgAllMembers = []
    } = this.props
    const { transPrincipalList = [] } = this.state
    let new_data = [...currentOrgAllMembers]
    let newTransPrincipalList =
      transPrincipalList &&
      transPrincipalList.map(item => {
        return new_data.find(item2 => item2.user_id == item) || {}
      })
    newTransPrincipalList = newTransPrincipalList.filter(item => item.user_id)
    return newTransPrincipalList
  }

  // 把recipients中的抄送人在项目中的所有成员过滤出来
  filterRecipients = () => {
    const {
      projectDetailInfoData: { data = [] },
      currentOrgAllMembers = []
    } = this.props
    const { transCopyPersonnelList = [] } = this.state
    let newData = [...currentOrgAllMembers]
    let newTransCopyPersonnelList =
      transCopyPersonnelList &&
      transCopyPersonnelList.map(item => {
        return newData.find(item2 => item2.user_id == item) || {}
      })
    newTransCopyPersonnelList = newTransCopyPersonnelList.filter(
      item => item.user_id
    )
    return newTransCopyPersonnelList
  }

  filterForm = (value, key) => {
    const { field_type } = value
    let container = <div></div>
    switch (field_type) {
      case '1':
        container = <EditStepTypeOne_one itemKey={key} itemValue={value} />
        break
      case '2':
        container = <EditStepTypeOne_two itemKey={key} itemValue={value} />
        break
      case '3':
        container = <EditStepTypeOne_three itemKey={key} itemValue={value} />
        break
      case '5':
        container = <EditStepTypeOne_five itemKey={key} itemValue={value} />
        break
      case '6':
        container = <EditStepTypeOne_six itemKey={key} itemValue={value} />
        break
      default:
        break
    }
    return container
  }

  // 渲染编辑详情的内容
  renderEditDetailContent = () => {
    const { itemValue, processEditDatas = [] } = this.props
    const { forms = [], description, deadline_value } = itemValue
    let newData = processEditDatas.find(item => item.is_edit == '0')
    let flag = false
    if (newData && Object.keys(newData).length) {
      flag = true
    }
    return (
      <div>
        {/* 表单内容 */}
        {forms && forms.length ? (
          <div
            style={{
              padding: '16px 0 8px 0',
              marginTop: '16px',
              borderTop: '1px solid #e8e8e8'
            }}
          >
            {forms.map((item, key) => {
              return this.filterForm(item, key)
            })}
          </div>
        ) : (
          <></>
        )}
        {/* 备注 */}
        {description && description != '' && (
          <div className={indexStyles.select_remarks}>
            <span
              style={{ color: 'rgba(0,0,0,0.45)' }}
              className={globalStyles.authTheme}
            >
              &#xe636; 备注 :
            </span>
            <div>{description}</div>
          </div>
        )}
        {/* 编辑按钮 */}
        {
          <div
            style={{
              marginTop: '16px',
              paddingTop: '24px',
              borderTop: '1px solid #e8e8e8',
              textAlign: 'center'
            }}
          >
            <Button
              disabled={flag}
              type="primary"
              onClick={this.handleEnterConfigureProcess}
            >
              编辑
            </Button>
          </div>
        }
      </div>
    )
  }

  render() {
    const { itemKey, processEditDatas = [], itemValue } = this.props
    const { is_show_spread_arrow } = this.state
    const {
      id,
      name,
      description,
      deadline_type,
      deadline_value,
      deadline_time_type,
      cc_type,
      assignee_type,
      cc_locking
    } = itemValue
    let transPrincipalList = this.filterAssignees()
    let transCopyPersonnelList = this.filterRecipients()
    return (
      <div key={itemKey} style={{ display: 'flex', marginBottom: '48px' }}>
        <div className={indexStyles.line}></div>
        <div className={indexStyles.circle}> {itemKey + 1}</div>
        <div className={`${indexStyles.default_popover_card}`}>
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
                {assignee_type == '2' ? (
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
                          {`${transPrincipalList.length}位填写人`}
                        </span>
                      </>
                    )}
                  </div>
                ) : (
                  <div
                    style={{ display: 'inline-block' }}
                    className={indexStyles.content__principalList_icon}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        width: '24px',
                        height: '24px',
                        background: 'rgba(230,247,255,1)',
                        borderRadius: '20px',
                        textAlign: 'center',
                        marginRight: '5px'
                      }}
                    >
                      <span
                        style={{ color: '#1890FF' }}
                        className={globalStyles.authTheme}
                      >
                        &#xe7b2;
                      </span>
                    </span>
                    <span>{`${currentNounPlanFilterName(FLOWS)}发起人`}</span>
                  </div>
                )}
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
                    {cc_locking == '1' && (
                      <Tooltip
                        title="已锁定抄送人"
                        placement="top"
                        getPopupContainer={triggerNode =>
                          triggerNode.parentNode
                        }
                      >
                        <span
                          style={{
                            cursor: 'pointer',
                            color: 'rgba(0,0,0,0.25)',
                            marginLeft: '4px'
                          }}
                          className={globalStyles.authTheme}
                        >
                          &#xe86a;
                        </span>
                      </Tooltip>
                    )}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex' }}>
                <span
                  style={{
                    fontWeight: 500,
                    color: 'rgba(0,0,0,0.65)',
                    fontSize: '16px',
                    marginRight: '5px',
                    flexShrink: 0
                  }}
                  className={`${globalStyles.authTheme}`}
                >
                  &#xe686;
                </span>
                <span
                  style={{ marginRight: '5px', flexShrink: 0 }}
                  className={`${indexStyles.deadline_time}`}
                >
                  完成期限 :{' '}
                </span>
                {deadline_type == '1' ? (
                  <span style={{ color: 'rgba(0,0,0,0.45)' }}>未限制</span>
                ) : (
                  <span style={{ color: 'rgba(0,0,0,0.45)' }}>
                    步骤开始后
                    {`${deadline_value}${renderTimeType(deadline_time_type)}`}内
                  </span>
                )}
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
  publicProcessDetailModal: {
    processEditDatas = [],
    currentOrgAllMembers = []
  },
  projectDetail: {
    datas: { projectDetailInfoData = {} }
  }
}) {
  return { processEditDatas, currentOrgAllMembers, projectDetailInfoData }
}
