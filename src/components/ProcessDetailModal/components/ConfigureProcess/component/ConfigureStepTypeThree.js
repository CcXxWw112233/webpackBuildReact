/* eslint-disable react/jsx-pascal-case */
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import {
  Dropdown,
  Icon,
  Radio,
  Tooltip,
  Popover,
  Switch,
  Select,
  InputNumber,
  Button,
  Input,
  Menu
} from 'antd'
import indexStyles from '../index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import MenuSearchPartner from '@/components/MenuSearchMultiple/MenuSearchPartner.js'
import MoreOptionsComponent from '../../MoreOptionsComponent'
import { connect } from 'dva'
import { principalList, tableList } from '../../../constant'
import ConfigureStepTypeThree_one from './ConfigureStepTypeThree_one'
import { currentNounPlanFilterName } from '../../../../../utils/businessFunction'
import { FLOWS } from '../../../../../globalset/js/constant'
const Option = Select.Option
@connect(mapStateToProps)
export default class ConfigureStepTypeThree extends Component {
  constructor(props) {
    super(props)
    this.state = {
      // principalList
      designatedPersonnelList: props.itemValue.assignees
        ? props.itemValue.assignees.split(',')
        : [], // 指定人员的列表
      local_score_node_set:
        props.itemValue && props.itemValue.score_node_set
          ? props.itemValue.score_node_set
          : {},
      local_result_score_value:
        props.itemValue && props.itemValue.score_node_set
          ? props.itemValue.score_node_set.result_value
          : '60'
    }
  }

  updateConfigureProcess = (data, key) => {
    //更新单个数组单个属性
    const { value } = data
    const { processEditDatas = [], itemKey, itemValue, dispatch } = this.props
    const new_processEditDatas = [...processEditDatas]
    new_processEditDatas[itemKey][key] = value
    dispatch({
      type: 'publicProcessDetailModal/updateDatas',
      payload: {
        processEditDatas: new_processEditDatas
      }
    })
    if (data.code && data.type && data.type == 'delete') {
      new_processEditDatas[itemKey].options_data
        ? delete new_processEditDatas[itemKey].options_data
        : ''
      if (data.code == 'COMPLETION_DEADLINE') {
        // 表示删除完成期限
        new_processEditDatas[itemKey].deadline_time_type == ''
          ? delete new_processEditDatas[itemKey].deadline_time_type
          : ''
        new_processEditDatas[itemKey].deadline_value == ''
          ? delete new_processEditDatas[itemKey].deadline_value
          : ''
      } else if (data.code == 'DUPLICATED') {
        new_processEditDatas[itemKey].recipients == ''
          ? delete new_processEditDatas[itemKey].recipients
          : ''
      }
      dispatch({
        type: 'publicProcessDetailModal/updateDatas',
        payload: {
          processEditDatas: new_processEditDatas
        }
      })
    }
  }

  updateScoreNodeSet = (data, key) => {
    const { value } = data
    const { local_score_node_set = {} } = this.state
    let temp_set = JSON.parse(JSON.stringify(local_score_node_set || {}))
    temp_set[key] = value
    this.setState({
      local_score_node_set: temp_set
    })
    this.updateConfigureProcess({ value: temp_set }, 'score_node_set')
    if (data.type == 'delete' && key == 'auto_pass') {
      temp_set.auto_pass ? delete temp_set.auto_pass : ''
      this.setState({
        local_score_node_set: temp_set
      })
      this.updateConfigureProcess({ value: temp_set }, 'score_node_set')
    }
  }

  // 锁定评分人
  handleScoreLocked = checked => {
    this.updateScoreNodeSet({ value: checked ? '1' : '0' }, 'score_locked')
  }

  // 评分是否可见
  handleScoreDisplay = checked => {
    this.updateScoreNodeSet({ value: checked ? '0' : '1' }, 'score_display')
  }

  // 把assignees中的执行人,在项目中的所有成员过滤出来
  filterAssignees = () => {
    const {
      projectDetailInfoData: { data = [] },
      currentOrgAllMembers = []
    } = this.props
    const { designatedPersonnelList = [] } = this.state
    let new_data = [...currentOrgAllMembers]
    let newDesignatedPersonnelList =
      designatedPersonnelList &&
      designatedPersonnelList.map(item => {
        return new_data.find(item2 => item2.user_id == item) || {}
      })
    newDesignatedPersonnelList = newDesignatedPersonnelList.filter(
      item => item.user_id
    )
    return newDesignatedPersonnelList
  }

  //修改通知人的回调 S
  chirldrenTaskChargeChange = data => {
    const { projectDetailInfoData = {}, currentOrgAllMembers = [] } = this.props
    const { selectedKeys = [], type, key } = data
    if (type == 'add') {
      // 表示添加的操作
      let assignee_value = []
      // 多个任务执行人
      const membersData = [...currentOrgAllMembers] //所有的人
      for (let i = 0; i < selectedKeys.length; i++) {
        for (let j = 0; j < membersData.length; j++) {
          if (selectedKeys[i] === membersData[j]['user_id']) {
            assignee_value.push(membersData[j].user_id)
          }
        }
      }
      this.setState({
        designatedPersonnelList: assignee_value
      })
      this.updateConfigureProcess(
        { value: assignee_value.join(',') },
        'assignees'
      )
    }

    if (type == 'remove') {
      // 表示移除的操作
      const { itemValue } = this.props
      const { assignees } = itemValue
      const { designatedPersonnelList = [] } = this.state
      let newDesignatedPersonnelList = [...designatedPersonnelList]
      let newAssigneesArray =
        assignees && assignees.length ? assignees.split(',') : []
      if (selectedKeys.length == '0') {
        // 表示取消全选
        newAssigneesArray = []
      } else {
        newDesignatedPersonnelList.map((item, index) => {
          if (item == key) {
            newDesignatedPersonnelList.splice(index, 1)
            newAssigneesArray.splice(index, 1)
          }
        })
      }
      let newAssigneesStr = newAssigneesArray.join(',')
      this.setState({
        designatedPersonnelList: newAssigneesArray
      })
      this.updateConfigureProcess({ value: newAssigneesStr }, 'assignees')
    }
  }
  // 添加执行人的回调 E

  // 移除执行人的回调 S
  handleRemoveExecutors = (e, shouldDeleteItem) => {
    e && e.stopPropagation()
    const { itemValue } = this.props
    const { assignees } = itemValue
    const { designatedPersonnelList = [] } = this.state
    let newDesignatedPersonnelList = [...designatedPersonnelList]
    let newAssigneesArray =
      assignees && assignees.length ? assignees.split(',') : []
    newDesignatedPersonnelList.map((item, index) => {
      if (item == shouldDeleteItem) {
        newDesignatedPersonnelList.splice(index, 1)
        newAssigneesArray.splice(index, 1)
      }
    })
    let newAssigneesStr = newAssigneesArray.join(',')
    this.setState({
      designatedPersonnelList: newAssigneesArray
    })
    this.updateConfigureProcess({ value: newAssigneesStr }, 'assignees')
  }

  // 计算方式
  handleComputingModeChange = value => {
    switch (value) {
      case '1':
        this.updateScoreNodeSet({ value: '1' }, 'count_type')
        break
      case 'average':
        // 默认选择第一个
        this.updateScoreNodeSet({ value: '2' }, 'count_type')
        break
      case '2':
        this.updateScoreNodeSet({ value: '2' }, 'count_type')
        break
      case '3':
        this.updateScoreNodeSet({ value: '3' }, 'count_type')
        break
      default:
        break
    }
  }

  // 结果分数选项
  handleResultScoreOptionChange = value => {
    switch (value) {
      case '1': // 表示大于
        this.updateScoreNodeSet({ value: '1' }, 'result_condition_type')
        break
      case '2': // 表示小于
        this.updateScoreNodeSet({ value: '2' }, 'result_condition_type')
        break
      case '3': // 表示等于
        this.updateScoreNodeSet({ value: '3' }, 'result_condition_type')
        break
      case '4': // 表示大于或等于
        this.updateScoreNodeSet({ value: '4' }, 'result_condition_type')
        break
      case '5': // 表示小于或等于
        this.updateScoreNodeSet({ value: '5' }, 'result_condition_type')
        break
      default:
        break
    }
  }

  // 结果分数导向
  handleResultScoreFallThrough = value => {
    switch (value) {
      case '1': // 表示大于
        this.updateScoreNodeSet({ value: '1' }, 'result_case_pass')
        break
      case '2': // 表示小于
        this.updateScoreNodeSet({ value: '2' }, 'result_case_pass')
        break
      case '3': // 表示等于
        this.updateScoreNodeSet({ value: '3' }, 'result_case_pass')
        break
      default:
        break
    }
  }

  // 其余情况
  handleRemainingCircumstances = value => {
    switch (value) {
      case '1': // 表示大于
        this.updateScoreNodeSet({ value: '1' }, 'result_case_other')
        break
      case '2': // 表示小于
        this.updateScoreNodeSet({ value: '2' }, 'result_case_other')
        break
      case '3': // 表示等于
        this.updateScoreNodeSet({ value: '3' }, 'result_case_other')
        break
      default:
        break
    }
  }

  // 结果分数值   /^([1-9]\d{0,}(\.\d{1,2})?|1000)$/
  // /^([1-9]\d{0,}(\.\d{1,2})?)$/
  //  /^([0-9]\d*(\.\d{1,2})?)$/
  handleResultScoreValue = value => {
    this.setState({
      local_result_score_value: String(value)
    })
    this.updateScoreNodeSet({ value: String(value) }, 'result_value')
  }

  handleResultScoreBlur = e => {
    e && e.stopPropagation()
    return
  }

  // 渲染指定人员
  renderDesignatedPersonnel = () => {
    const {
      projectDetailInfoData: { data = [], board_id, org_id },
      currentOrgAllMembers = []
    } = this.props
    // const { designatedPersonnelList = [] } = this.state
    let designatedPersonnelList = this.filterAssignees()
    return (
      <div style={{ flex: 1, padding: '8px 0' }}>
        {!designatedPersonnelList.length ? (
          <div style={{ position: 'relative' }}>
            <Dropdown
              trigger={['click']}
              overlayClassName={indexStyles.overlay_pricipal}
              getPopupContainer={triggerNode => triggerNode.parentNode}
              overlayStyle={{ maxWidth: '200px' }}
              overlay={
                <MenuSearchPartner
                  isInvitation={true}
                  // show_select_all={true}
                  // select_all_type={'0'}
                  listData={currentOrgAllMembers}
                  keyCode={'user_id'}
                  searchName={'name'}
                  currentSelect={designatedPersonnelList}
                  // board_id={board_id}
                  // invitationType='1'
                  // invitationId={board_id}
                  // invitationOrg={org_id}
                  chirldrenTaskChargeChange={this.chirldrenTaskChargeChange}
                />
              }
            >
              {/* 添加通知人按钮 */}

              <div className={indexStyles.addNoticePerson}>
                <span
                  className={`${globalStyles.authTheme} ${indexStyles.plus_icon}`}
                >
                  &#xe8fe;
                </span>
              </div>
            </Dropdown>
          </div>
        ) : (
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              lineHeight: '22px'
            }}
          >
            {designatedPersonnelList.map((value, index) => {
              const { avatar, name, user_name, user_id } = value
              return (
                <div
                  style={{ display: 'flex', alignItems: 'center' }}
                  key={user_id}
                >
                  <div
                    className={`${indexStyles.user_item}`}
                    style={{
                      position: 'relative',
                      textAlign: 'center',
                      marginBottom: '8px'
                    }}
                    key={user_id}
                  >
                    {avatar ? (
                      <Tooltip
                        overlayStyle={{ minWidth: '62px' }}
                        getPopupContainer={triggerNode =>
                          triggerNode.parentNode
                        }
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
                        overlayStyle={{ minWidth: '62px' }}
                        getPopupContainer={triggerNode =>
                          triggerNode.parentNode
                        }
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
                            style={{ fontSize: 14, color: '#8c8c8c' }}
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
            <Dropdown
              trigger={['click']}
              overlayClassName={indexStyles.overlay_pricipal}
              getPopupContainer={triggerNode => triggerNode.parentNode}
              overlayStyle={{ maxWidth: '200px' }}
              overlay={
                <MenuSearchPartner
                  isInvitation={true}
                  // show_select_all={true}
                  // select_all_type={'0'}
                  listData={currentOrgAllMembers}
                  keyCode={'user_id'}
                  searchName={'name'}
                  currentSelect={designatedPersonnelList}
                  // board_id={board_id}
                  // invitationType='1'
                  // invitationId={board_id}
                  // invitationOrg={org_id}
                  chirldrenTaskChargeChange={this.chirldrenTaskChargeChange}
                />
              }
            >
              {/* 添加通知人按钮 */}

              <div
                className={indexStyles.addNoticePerson}
                style={{ marginTop: '-6px' }}
              >
                <span
                  className={`${globalStyles.authTheme} ${indexStyles.plus_icon}`}
                >
                  &#xe8fe;
                </span>
              </div>
            </Dropdown>
          </div>
        )}
      </div>
    )
  }

  render() {
    const {
      itemValue,
      processEditDatas = [],
      currentOrgAllMembers = [],
      itemKey,
      projectDetailInfoData: { data = [], board_id, org_id }
    } = this.props
    const { local_score_node_set = {}, local_result_score_value } = this.state
    const {
      count_type,
      result_condition_type,
      result_value,
      result_case_pass,
      result_case_other,
      score_locked,
      score_display
    } = local_score_node_set
    return (
      <div>
        {/* 评分项 */}
        <div>
          <ConfigureStepTypeThree_one
            updateConfigureProcess={this.updateConfigureProcess}
            itemValue={itemValue}
            itemKey={itemKey}
          />
        </div>
        {/* 评分人 */}
        <div>
          <div
            style={{
              paddingTop: '18px',
              minHeight: '98px',
              borderBottom: '1px solid rgba(0,0,0,0.09)'
            }}
          >
            <div>
              <span style={{ color: 'rgba(0,0,0,0.45)' }}>
                <span
                  className={`${globalStyles.authTheme}`}
                  style={{ fontSize: '16px' }}
                >
                  &#xe7b2;
                </span>{' '}
                评分人&nbsp;:
              </span>
              <span
                style={{
                  display: 'inline-block',
                  marginRight: '36px',
                  marginLeft: '18px',
                  position: 'relative'
                }}
              >
                <Switch
                  onChange={this.handleScoreLocked}
                  checked={score_locked == '1'}
                  size="small"
                />
                <span
                  style={{
                    margin: '0 8px',
                    color: 'rgba(0,0,0,0.65)',
                    verticalAlign: 'middle'
                  }}
                >
                  锁定评分人
                </span>
                <Tooltip
                  overlayStyle={{ minWidth: '270px' }}
                  title="锁定评分人后启动流程时不可修改评分人"
                  placement="top"
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                >
                  <span
                    style={{
                      color: '#D9D9D9',
                      fontSize: '16px',
                      verticalAlign: 'middle',
                      cursor: 'pointer'
                    }}
                    className={globalStyles.authTheme}
                  >
                    &#xe845;
                  </span>
                </Tooltip>
              </span>
              <span style={{ display: 'inline-block', position: 'relative' }}>
                <Switch
                  onChange={this.handleScoreDisplay}
                  checked={score_display == '0'}
                  size="small"
                />
                <span
                  style={{
                    margin: '0 8px',
                    color: 'rgba(0,0,0,0.65)',
                    verticalAlign: 'middle'
                  }}
                >
                  评分时相互不可见
                </span>
                <Tooltip
                  overlayStyle={{ minWidth: '400px' }}
                  title="2人以上的评分过程中，各评分人的评分值互相不可见，待所有评分人完成评分后，显示各评分人的评分值"
                  placement="top"
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                >
                  <span
                    style={{
                      color: '#D9D9D9',
                      fontSize: '16px',
                      verticalAlign: 'middle',
                      cursor: 'pointer'
                    }}
                    className={globalStyles.authTheme}
                  >
                    &#xe845;
                  </span>
                </Tooltip>
              </span>
            </div>
            <div>{this.renderDesignatedPersonnel()}</div>
          </div>
        </div>
        {/* 评分结果判定 */}
        <div className={indexStyles.result_judge}>
          <div
            style={{
              minHeight: '210px',
              padding: '16px 0px',
              borderBottom: '1px solid rgba(0,0,0,0.09)',
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
              <span style={{ marginLeft: '4px' }}>评分结果判定：</span>
            </div>
            <div>
              <span className={indexStyles.rating_label_name}>计算方式</span>
              <span style={{ position: 'relative', marginRight: '8px' }}>
                <Select
                  defaultValue={'1'}
                  onChange={this.handleComputingModeChange}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  style={{ width: '114px', height: '40px' }}
                >
                  <Option value="1">各分项相加</Option>
                  <Option value="average">总分值平均</Option>
                </Select>
              </span>
              {(count_type == '2' || count_type == '3') && (
                <span style={{ position: 'relative' }}>
                  <Select
                    value={count_type}
                    onChange={this.handleComputingModeChange}
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    style={{ width: '168px', height: '40px' }}
                  >
                    <Option value="2">总分值/评分项数</Option>
                    <Option value="3">总分值/评分人数</Option>
                  </Select>
                </span>
              )}
            </div>
            <div>
              <span className={indexStyles.rating_label_name}>结果分数</span>
              <span>
                <Select
                  value={result_condition_type}
                  onChange={this.handleResultScoreOptionChange}
                  style={{ width: '114px', height: '40px' }}
                >
                  <Option value="1">大于</Option>
                  <Option value="2">小于</Option>
                  <Option value="3">等于</Option>
                  <Option value="4">大于或等于</Option>
                  <Option value="5">小于或等于</Option>
                </Select>
                <InputNumber
                  min={0}
                  value={local_result_score_value}
                  onBlur={this.handleResultScoreBlur}
                  onChange={this.handleResultScoreValue}
                  style={{
                    width: '114px',
                    height: '40px',
                    margin: '0px 8px',
                    lineHeight: '40px'
                  }}
                />
                <Select
                  value={result_case_pass}
                  onChange={this.handleResultScoreFallThrough}
                  style={{ width: '168px', height: '40px' }}
                >
                  <Option value="1">{`${currentNounPlanFilterName(
                    FLOWS
                  )}流转到上一步`}</Option>
                  <Option value="2">{`${currentNounPlanFilterName(
                    FLOWS
                  )}流转到下一步`}</Option>
                  <Option value="3">{`${currentNounPlanFilterName(
                    FLOWS
                  )}中止`}</Option>
                </Select>
              </span>
            </div>
            <div>
              <span className={indexStyles.rating_label_name}>其余情况</span>
              <Select
                value={result_case_other}
                onChange={this.handleRemainingCircumstances}
                style={{ width: '168px', height: '40px' }}
              >
                <Option value="1">{`${currentNounPlanFilterName(
                  FLOWS
                )}流转到上一步`}</Option>
                <Option value="2">{`${currentNounPlanFilterName(
                  FLOWS
                )}流转到下一步`}</Option>
                <Option value="3">{`${currentNounPlanFilterName(
                  FLOWS
                )}中止`}</Option>
              </Select>
            </div>
          </div>
        </div>
        {/* 更多选项 */}
        <div>
          <MoreOptionsComponent
            itemKey={itemKey}
            itemValue={itemValue}
            updateConfigureProcess={this.updateConfigureProcess}
            updateScoreNodeSet={this.updateScoreNodeSet}
            data={currentOrgAllMembers}
            board_id={board_id}
            org_id={org_id}
          />
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
