import React, { Component } from 'react'
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
import { connect } from 'dva'
import defaultUserAvatar from '@/assets/invite/user_default_avatar@2x.png'
import {
  timestampToTimeNormal,
  compareACoupleOfObjects,
  isObjectValueEqual
} from '../../../../../utils/util'
import OpinionContent from '../OpinionContent'

@connect(mapStateToProps)
export default class BeginningStepThree_one extends Component {
  constructor(props) {
    super(props)
    this.state = {
      score_items:
        props.itemValue && props.itemValue.score_items
          ? JSON.parse(JSON.stringify(props.itemValue.score_items || []))
          : [],
      clientWidth: document.getElementById(`ratingItems_${props.itemKey}`)
        ? document.getElementById(`ratingItems_${props.itemKey}`).clientWidth
        : 420
    }
    this.resizeTTY = this.resizeTTY.bind(this)
  }

  // 理解成是否是有效的头像
  isValidAvatar = (avatarUrl = '') =>
    avatarUrl.includes('http://') || avatarUrl.includes('https://')

  componentDidMount() {
    window.addEventListener('resize', this.resizeTTY)
  }
  componentWillReceiveProps(nextProps) {
    if (!isObjectValueEqual(this.props, nextProps)) {
      // eslint-disable-next-line react/no-direct-mutation-state
      this.state = {
        score_items:
          nextProps.itemValue && nextProps.itemValue.score_items
            ? JSON.parse(JSON.stringify(nextProps.itemValue.score_items || []))
            : [],
        clientWidth: document.getElementById(`ratingItems_${nextProps.itemKey}`)
          ? document.getElementById(`ratingItems_${nextProps.itemKey}`)
              .clientWidth
          : 420
      }
    }
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeTTY)
  }
  resizeTTY = () => {
    const { itemKey } = this.props
    const clientWidth = document.getElementById(`ratingItems_${itemKey}`)
      ? document.getElementById(`ratingItems_${itemKey}`).clientWidth - 200
      : 420
    this.setState({
      clientWidth
    })
  }

  updateState = (data, index) => {
    const { value, key, isNotUpdateModelDatas } = data
    const { score_items = [] } = this.state
    let new_data = [...score_items]
    new_data[index][key] = value
    this.setState({
      score_items: new_data
    })
    if (!isNotUpdateModelDatas) {
      this.props.updateCorrespondingPrcodessStepWithNodeContent &&
        this.props.updateCorrespondingPrcodessStepWithNodeContent(
          'score_items',
          new_data
        )
    }
  }

  // 分数点击事件
  handleChangeRatingGrade = (e, i) => {
    e && e.stopPropagation()
    const { showApproveButton } = this.props
    if (!showApproveButton) return
    const { score_items = [] } = this.state
    let new_data = [...score_items]
    new_data = new_data.map((item, index) => {
      let new_item = { ...item }
      if (i == index) {
        new_item = { ...item, is_click_rating_grade: true }
      } else {
        new_item = { ...item, is_click_rating_grade: false }
      }
      return new_item
    })
    this.setState({
      score_items: new_data
    })
    this.props.updateCorrespondingPrcodessStepWithNodeContent &&
      this.props.updateCorrespondingPrcodessStepWithNodeContent(
        'score_items',
        new_data
      )
    // this.updateState({ value: true, key: 'is_click_rating_grade' }, i)
  }

  // 保留n位小数
  roundFun = (value, n) => {
    return Math.round(value * Math.pow(10, n)) / Math.pow(10, n)
  }

  handleChangeRatingGradeValue = (e, max_score, i) => {
    e && e.stopPropagation()
    let value = e.target.value
    // const reg = /^([1-9]\d{0,2}(\.\d{1,2})?|1000)$/
    // if (reg.test(value) && value != '' && String(value).trimLR() != '') {
    //   this.updateState({ value: value, key: 'value' }, i)
    //   this.updateState({ value: false, key: 'is_click_rating_grade' }, i)
    // } else {
    //   this.updateState({ value: '', key: 'value' }, i)
    // }
    if (
      value == '' ||
      value.trimLR() == '' ||
      Number(value) > Number(max_score) ||
      isNaN(value)
    ) {
      this.updateState({ value: '', key: 'value' }, i)
      return
    }
    if (value.indexOf('.') != -1 && value.indexOf('.') != 0) {
      // 表示存在小数点
      let str = value.split('.')
      if (str && str.length > 2) {
        // 表示禁止输入多个小数点
        value = value.substring(0, value.indexOf('.') + 3)
      } else if (isNaN(str[0])) {
        // 如果数字的前半段就是非数字 那么就取整
        value = parseInt(value)
      } else if (str[1] && str[1].length && isNaN(str[1])) {
        // 表示后半段中如果存在非数字那么取整
        value = parseInt(value)
      } else if (str[1] && str[1].length && str[1].length > 2) {
        // 表示如果小数点后半段位数大于2那么保留两位小数
        value = String(value).substring(0, String(value).indexOf('.') + 3)
      }
    } else {
      if (isNaN(value)) {
        this.updateState({ value: '', key: 'value' }, i)
        return
      }
    }
    this.updateState({ value: value, key: 'value' }, i)
  }

  handleChangeRatingGradeBlur = (e, i) => {
    e && e.stopPropagation()
    this.updateState({ value: false, key: 'is_click_rating_grade' }, i)
    return
    let value = e.target.value
    const reg = /^([1-9]\d{0,2}(\.\d{1,2})?|1000)$/
    if (reg.test(value) && value != '' && String(value).trimLR() != '') {
      this.updateState({ value: value, key: 'value' }, i)
      this.updateState({ value: false, key: 'is_click_rating_grade' }, i)
    } else {
      this.updateState({ value: '', key: 'value' }, i)
    }
  }

  whetherShowDiffWidth = () => {
    const { score_items = [] } = this.state
    let flag = false
    for (let i = 0; i < score_items.length; i++) {
      if (i % 4 == 0 || i % 2 == 0) {
        flag = true
        break
      }
    }
    return flag
  }

  // 判断分数
  getCurrentUserScoreList = () => {
    const { transPrincipalList = [] } = this.props
    const { id } = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : {}
    let newAssignees = [...transPrincipalList]
    let current_socre = newAssignees.find(item => {
      if (item.id == id) {
        return item
      }
    })
    if (
      !current_socre ||
      (current_socre &&
        current_socre.score_items &&
        current_socre.score_items.length == '0')
    )
      return []
    return current_socre.score_items || []
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

  renderRatingPersonSuggestion = item => {
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
      <div>
        {
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
              <div style={{ position: 'relative' }}>
                <span>{name}</span>
                {score_display == '0' && status == '1' ? (
                  <span className={indexStyles.approv_rating}>已评分</span>
                ) : (
                  <>
                    <span style={{ color: '#1890FF', margin: '0 8px' }}>
                      {last_total.value}
                    </span>
                    {!(score_items && score_items.length) ? (
                      <span
                        style={{
                          width: '78px',
                          background: 'rgb(255, 169, 64)',
                          color: '#fff',
                          display: 'inline-block',
                          textAlign: 'center',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        超时自动评分
                      </span>
                    ) : (
                      <Popover
                        getPopupContainer={triggerNode =>
                          triggerNode.parentNode
                        }
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
                    )}
                  </>
                )}
                {score_display == '0' && status == '1' ? (
                  <div style={{ color: 'rgba(0,0,0,0.25)' }}>
                    (待所有评分人完成评分后显示评分值和评分意见)
                  </div>
                ) : (
                  <div
                    style={{
                      color:
                        comment == '无意见。'
                          ? 'rgba(0,0,0,0.25)'
                          : 'rgba(0,0,0,0.65)'
                    }}
                  >
                    {comment}
                  </div>
                )}
              </div>
            </div>
            <div className={indexStyles.app_right}>
              {timestampToTimeNormal(time, '/', true) || ''}
            </div>
          </div>
        }
      </div>
    )
  }

  // 渲染未评分状态
  renderNonRatingPerson = item => {
    const { avatar, name, time } = item
    return (
      <div>
        {
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
              <div style={{ position: 'relative' }}>
                <span>{name}</span>
                <span className={indexStyles.default_status}>未评分</span>
                <div style={{ color: 'rgba(0,0,0,0.25)' }}>{'(暂未评分)'}</div>
              </div>
            </div>
            <div className={indexStyles.app_right}>
              {timestampToTimeNormal(time, '/', true) || ''}
            </div>
          </div>
        }
      </div>
    )
  }

  render() {
    const {
      itemValue,
      processEditDatas = [],
      itemKey,
      projectDetailInfoData: { data = [], board_id, org_id },
      transPrincipalList = [],
      showApproveButton
    } = this.props
    const { score_node_set = {}, enable_weight, status } = itemValue
    const { score_display } = score_node_set
    const { score_items = [], clientWidth } = this.state
    let flag = this.whetherShowDiffWidth()
    let current_score_list = this.getCurrentUserScoreList()
    let last_total =
      (current_score_list &&
        current_score_list.find(item => item.is_total == '1')) ||
      {}
    let autoWidth = clientWidth ? clientWidth / 4 - 45 : 130
    let length = (score_items.filter(item => item.is_total == '0') || []).length
    return (
      <div>
        {/* 评分项 */}
        <div
          style={{
            borderTop: '1px solid rgba(0,0,0,0.09)',
            marginTop: '16px',
            padding: '16px 14px'
          }}
        >
          <div
            id={`ratingItems_${itemKey}`}
            className={indexStyles.ratingItems}
            style={{
              paddingBottom:
                (last_total && Object.keys(last_total).length != '0') ||
                (score_display == '0' && status == '1')
                  ? '50px'
                  : '16px'
            }}
          >
            {score_items &&
              score_items.map((item, index) => {
                const {
                  title,
                  description,
                  max_score,
                  weight_ratio,
                  is_click_rating_grade,
                  value
                } = item
                return (
                  <>
                    {item.is_total == '0' && (
                      <div
                        key={item}
                        className={`${indexStyles.rating_itemsValue} ${
                          flag && length > 1
                            ? indexStyles.rating_active_width
                            : indexStyles.rating_normal_width
                        }`}
                        style={{
                          width:
                            flag && length > 1
                              ? clientWidth
                                ? clientWidth / 4
                                : '23%'
                              : '100%',
                          minWidth: '220px'
                        }}
                      >
                        <p>
                          <span
                            style={{
                              position: 'relative',
                              marginRight: '9px',
                              cursor: 'pointer',
                              display: 'flex',
                              flex: 1
                            }}
                          >
                            <Tooltip
                              title={title}
                              placement="top"
                              getPopupContainer={triggerNode =>
                                triggerNode.parentNode
                              }
                            >
                              <span style={{ display: 'flex' }}>
                                <span
                                  style={{
                                    marginRight: '9px',
                                    display: 'inline-block',
                                    maxWidth:
                                      clientWidth &&
                                      !(flag && score_items.length > 1)
                                        ? clientWidth + 'px'
                                        : autoWidth,
                                    minWidth: '50px',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    verticalAlign: 'middle'
                                  }}
                                >
                                  {title}
                                </span>
                                <span>:</span>
                              </span>
                            </Tooltip>
                            {enable_weight == '1' && (
                              <Tooltip
                                overlayStyle={{ minWidth: '116px' }}
                                title={`权重占比: ${weight_ratio}%`}
                                placement="top"
                                getPopupContainer={triggerNode =>
                                  triggerNode.parentNode
                                }
                              >
                                <span className={indexStyles.rating_weight}>
                                  &nbsp;&nbsp;{`*${weight_ratio}%`}
                                </span>
                              </Tooltip>
                            )}
                          </span>
                          {description && description != '' ? (
                            <Popover
                              autoAdjustOverflow={false}
                              title={
                                <div
                                  style={{
                                    margin: '0 4px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '130px',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {title}
                                </div>
                              }
                              content={
                                <div
                                  className={
                                    globalStyles.global_vertical_scrollbar
                                  }
                                  style={{
                                    wordBreak: 'break-all',
                                    whiteSpace: 'pre-wrap',
                                    width: '210px',
                                    maxHeight: '205px',
                                    overflowY: 'auto'
                                  }}
                                >
                                  {description}
                                </div>
                              }
                              placement="top"
                              getPopupContainer={() =>
                                document.getElementById(
                                  `ratingItems_${itemKey}`
                                )
                              }
                            >
                              <span
                                style={{ color: '#1890FF', cursor: 'pointer' }}
                                className={globalStyles.authTheme}
                              >
                                &#xe845;
                              </span>
                            </Popover>
                          ) : (
                            ''
                          )}
                        </p>
                        {is_click_rating_grade ? (
                          <div>
                            <Input
                              autoFocus={true}
                              value={value}
                              onBlur={e => {
                                this.handleChangeRatingGradeBlur(e, index)
                              }}
                              onChange={e => {
                                this.handleChangeRatingGradeValue(
                                  e,
                                  max_score,
                                  index
                                )
                              }}
                              className={indexStyles.rating_input}
                            />
                          </div>
                        ) : value && value != '' ? (
                          <div
                            onClick={e => {
                              this.handleChangeRatingGrade(e, index)
                            }}
                            className={indexStyles.rating_grade}
                          >
                            <span className={indexStyles.rating_input}>
                              {value}
                            </span>
                          </div>
                        ) : (
                          <div
                            onClick={e => {
                              this.handleChangeRatingGrade(e, index)
                            }}
                            className={indexStyles.rating_grade}
                          >
                            <span>
                              最高
                              <span className={indexStyles.rating_grade_value}>
                                {max_score}
                              </span>
                              分
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )
              })}
            {last_total && Object.keys(last_total).length != '0' && (
              <div
                style={{
                  color: 'rgba(0,0,0,0.45)',
                  fontWeight: 500,
                  position: 'absolute',
                  bottom: '16px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span style={{ color: 'rgba(0,0,0,0.65)' }}>
                    我的最终评分:&nbsp;&nbsp;
                  </span>
                  <span style={{ fontSize: '20px', color: '#1890FF' }}>
                    {last_total.value}
                  </span>
                </div>
              </div>
            )}
            {score_display == '0' && status == '1' && (
              <div
                style={{
                  color: 'rgba(0,0,0,0.45)',
                  fontWeight: 500,
                  position: 'absolute',
                  bottom: '16px',
                  left:
                    last_total && Object.keys(last_total).length != '0'
                      ? '158px'
                      : '0px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <span>
                    &nbsp;&nbsp;（暂时仅自己可见，待所有人评分人评分完成后公开）
                  </span>
                </div>
              </div>
            )}
          </div>
          {/* 渲染评语 */}
          {showApproveButton && (
            <div>
              <OpinionContent
                value={this.props.value}
                placeholder="填写评分意见（选填）"
                opinionTextAreaChange={this.props.opinionTextAreaChange}
              />
            </div>
          )}
          {/* 评分人意见以及分数详情 */}
          <div>
            {transPrincipalList &&
              transPrincipalList.length &&
              transPrincipalList.map(item => {
                if (item.score_items && item.score_items.length != '0') {
                  return <>{this.renderRatingPersonSuggestion(item)}</>
                } else {
                  if (item.processed != '2') {
                    return <>{this.renderNonRatingPerson(item)}</>
                  } else {
                    return <>{this.renderRatingPersonSuggestion(item)}</>
                  }
                  return <></>
                }
              })}
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps({
  publicProcessDetailModal: { processEditDatas = [] },
  projectDetail: {
    datas: { projectDetailInfoData = {} }
  }
}) {
  return { processEditDatas, projectDetailInfoData }
}
