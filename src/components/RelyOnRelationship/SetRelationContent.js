import React, { Component } from 'react'
import { connect } from 'dva'
import indexStyles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { currentNounPlanFilterName } from '../../utils/businessFunction'
import { TASKS, FLOWS } from '../../globalset/js/constant'
import { Select, Popconfirm } from 'antd'
import { getCardRelysWithObject } from '../../services/technological/task'
import { isApiResponseOk } from '../../utils/handleResponseData'
import { filterCurrentUpdateDatasField } from '../TaskDetailModal/handleOperateModal'
import { isObjectValueEqual } from '../../utils/util'
import { rebackCreateNotify } from '../NotificationTodos'

// const OPTIONS = ['Apples', 'Nails', 'Bananas', 'Helicopters'];
@connect(
  ({
    publicTaskDetailModal: { drawContent = {} },
    gantt: {
      datas: { group_view_type, gantt_board_id }
    }
  }) => ({
    drawContent,
    group_view_type,
    gantt_board_id
  })
)
export default class SetRelationContent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedItems: [], // 当前选中的option选项
      OPTIONS: [], // 对应的选项内容
      currentItem: props.currentItem ? props.currentItem : {}
    }
  }

  initState = () => {
    this.setState({
      selectedItems: [], // 当前选中的option选项
      OPTIONS: [], // 对应的选项内容
      currentItem: {}
    })
  }

  // 获取可依赖的对象
  getCardRelysWithObject = props => {
    const { card_id, board_id } = props
    if (!card_id || !board_id) return
    getCardRelysWithObject({ card_id, board_id }).then(res => {
      if (isApiResponseOk(res)) {
        this.setState(
          {
            OPTIONS: res.data
          },
          () => {
            this.filteredOptions()
          }
        )
      }
    })
  }

  componentDidMount() {
    this.getCardRelysWithObject(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (
      isObjectValueEqual(
        this.props.currentItem.data,
        nextProps.currentItem.data
      )
    )
      return
    this.setState({
      currentItem: nextProps.currentItem ? nextProps.currentItem : {}
    })
    this.getCardRelysWithObject(nextProps)
  }

  componentWillUnmount() {
    // this.initState()
  }

  onSearch = value => {
    this.filteredOptions(value)
  }

  onBlur = value => {
    this.filteredOptions('')
  }

  handleChange = (selectedItems, relation) => {
    const {
      dispatch,
      group_view_type,
      gantt_board_id,
      drawContent: { board_id }
    } = this.props
    // const { key } = e
    const gold_name = selectedItems[0]
      ? selectedItems[0].split('_')[1]
      : '' || ''
    const gold_id = selectedItems[0] ? selectedItems[0].split('_')[0] : '' || ''
    if (!gold_id || !gold_name) return
    const { card_id } = this.props
    this.props
      .dispatch({
        type: 'gantt/addCardRely',
        payload: {
          from_id: card_id,
          to_id: gold_id,
          relation: relation
        }
      })
      .then(res => {
        if (isApiResponseOk(res)) {
          this.props.dispatch({
            type: 'publicTaskDetailModal/getCardWithAttributesDetail',
            payload: {
              id: card_id
            }
          })
          rebackCreateNotify.call(this, {
            res,
            id: card_id,
            board_id:
              gantt_board_id && gantt_board_id != '0'
                ? gantt_board_id
                : board_id,
            group_view_type,
            dispatch,
            parent_card_id: '',
            operate_in_card_detail_panel: true
          })
          this.setState(
            {
              selectedItems: [gold_id]
            },
            () => {
              this.filteredOptions()
            }
          )
        } else {
          this.setState({
            selectedItems: []
          })
        }
      })
  }

  // 删除字段
  handleDelCurrentField = shouldDeleteId => {
    this.props.handleDelCurrentField &&
      this.props.handleDelCurrentField(shouldDeleteId)
  }

  // 删除依赖
  onConfirm = ({ e, shouldDeleteId, relation }) => {
    e && e.stopPropagation()
    const { card_id, drawContent = {} } = this.props
    const {
      currentItem: {
        data = {},
        data: { next = [] }
      }
    } = this.state
    let new_next = next.filter(item => item.id != shouldDeleteId)
    // return
    let new_drawContent = { ...drawContent }
    new_drawContent['properties'] = filterCurrentUpdateDatasField({
      properties: new_drawContent['properties'],
      code: 'DEPENDENCY',
      value: {
        ...data,
        next: new_next
      }
    })
    this.props
      .dispatch({
        type: 'gantt/deleteCardRely',
        payload: {
          move_id: card_id,
          line_id: shouldDeleteId,
          relation: relation
        }
      })
      .then(res => {
        if (isApiResponseOk(res)) {
          this.setState({
            selectedItems: []
          })
          this.props.dispatch({
            type: 'publicTaskDetailModal/updateDatas',
            payload: {
              drawContent: new_drawContent
            }
          })
        }
      })
  }

  // 渲染不同类型时标识以及ICON
  renderRelationItemIcon = type => {
    let icon = ''
    let dec = ''
    switch (type) {
      case '3': // 表示任务
        icon = <>&#xe66a;</>
        dec = `${currentNounPlanFilterName(TASKS)}`
        break
      case '2': // 表示流程
        icon = <>&#xe629;</>
        dec = `${currentNounPlanFilterName(FLOWS)}`
        break
      default:
        break
    }
    return { icon, dec }
  }

  // 过滤列表
  filteredOptions = inputValue => {
    const { selectedItems = [], OPTIONS = [], currentItem = {} } = this.state
    const {
      id,
      data: { next = [] }
    } = currentItem
    let filteredOptions = []
    filteredOptions = OPTIONS.filter(o => !selectedItems.includes(o.id))
    if (inputValue) {
      filteredOptions = OPTIONS.filter(o => o.name.indexOf(inputValue) != -1)
    }
    filteredOptions = filteredOptions.filter(o => !next.find(i => i.id == o.id))
    this.setState(
      {
        filteredOptions
      },
      () => {
        this.setState({
          selectedItems: []
        })
      }
    )
    // return filteredOptions
  }

  render() {
    const { onlyShowPopoverContent } = this.props
    const {
      selectedItems = [],
      OPTIONS = [],
      currentItem = {},
      filteredOptions = []
    } = this.state
    const {
      id,
      data: { next = [] }
    } = currentItem
    // let filteredOptions = this.filteredOptions(inputValue)
    return (
      <div
        className={`${
          indexStyles.setRelationContainer
        } ${onlyShowPopoverContent && indexStyles.setRelationContainer1}`}
      >
        <div className={indexStyles.setRelationItem}>
          <div className={indexStyles.setRela_left}>
            <span
              onClick={() => {
                this.handleDelCurrentField(id)
              }}
              className={`${globalStyles.authTheme} ${indexStyles.setRela_delIcon}`}
            >
              &#xe7fe;
            </span>
            <div className={indexStyles.setRela_hover}>
              <span className={globalStyles.authTheme}>&#xe6ed;</span>
              <span>依赖关系</span>
            </div>
          </div>
          <div className={indexStyles.setRela_right}>
            <div className={indexStyles.setRela_r_top}>
              <div className={indexStyles.setRela_rt_left}>
                <span>当前{currentNounPlanFilterName(TASKS)}</span>
                <span className={indexStyles.setRela_rt_marks}>
                  完成后才能开始
                </span>
              </div>
              <div className={indexStyles.setRela_rt_right}>
                <Select
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  mode="multiple"
                  onSearch={this.onSearch}
                  value={selectedItems}
                  onBlur={this.onBlur}
                  onChange={e => {
                    this.handleChange(e, 'end_start')
                  }}
                  placeholder={`添加${currentNounPlanFilterName(TASKS)}依赖`}
                  className={indexStyles.setRela_select}
                >
                  {filteredOptions.map(item => (
                    <Select.Option
                      key={`${item.id}`}
                      value={`${item.id}_${item.name}`}
                    >
                      <div className={indexStyles.setRela_select_option}>
                        <div>
                          <span
                            className={`${
                              item.type == '3'
                                ? indexStyles.setRela_task_icon
                                : item.type == '2'
                                ? indexStyles.setRela_flow_icon
                                : ''
                            } ${globalStyles.authTheme}`}
                          >
                            <span>
                              {this.renderRelationItemIcon(item.type).icon}
                            </span>
                            {this.renderRelationItemIcon(item.type).dec}
                          </span>
                          <span title={item.name}>{item.name}</span>
                        </div>
                        {item.milestone_name && (
                          <span title={item.milestone_name}>
                            #&nbsp;{item.milestone_name}
                          </span>
                        )}
                      </div>
                    </Select.Option>
                  ))}
                </Select>
                {/* 显示添加设置的依赖项 */}
                <div>
                  {!!(next && next.length) &&
                    next.map(item => {
                      if (item.relation == 'end_start') {
                        return (
                          <div
                            key={item.id}
                            className={indexStyles.setRela_rt_item}
                          >
                            <div
                              className={indexStyles.setRela_rt_item_content}
                            >
                              <div className={indexStyles.setRela_rt_item_left}>
                                <span
                                  className={`${
                                    item.type == '3'
                                      ? indexStyles.setRela_task_icon
                                      : item.type == '2'
                                      ? indexStyles.setRela_flow_icon
                                      : ''
                                  } ${globalStyles.authTheme}`}
                                >
                                  <span style={{ marginRight: '4px' }}>
                                    {
                                      this.renderRelationItemIcon(item.type)
                                        .icon
                                    }
                                  </span>
                                  {this.renderRelationItemIcon(item.type).dec}
                                </span>
                                <span title={item.name}>{item.name}</span>
                              </div>
                              {item.milestone_name && (
                                <div
                                  className={indexStyles.setRela_rt_item_right}
                                >
                                  <span title={item.milestone_name}>
                                    #&nbsp;{item.milestone_name}
                                  </span>
                                </div>
                              )}
                              <Popconfirm
                                onConfirm={e => {
                                  this.onConfirm({
                                    e,
                                    shouldDeleteId: item.id,
                                    relation: 'end_start'
                                  })
                                }}
                                getPopupContainer={triggerNode =>
                                  triggerNode.parentNode
                                }
                                title={'删除此依赖？'}
                                placement="topLeft"
                              >
                                <span
                                  className={`${globalStyles.authTheme} ${indexStyles.setRela_delIcon}`}
                                >
                                  &#xe7fe;
                                </span>
                              </Popconfirm>
                            </div>
                          </div>
                        )
                      }
                    })}
                </div>
              </div>
            </div>
            <div className={indexStyles.setRela_r_bottom}>
              <div className={indexStyles.setRela_rb_left}>
                <span>当前{currentNounPlanFilterName(TASKS)}</span>
                <span className={indexStyles.setRela_rt_marks}>
                  完成后才能完成
                </span>
              </div>
              <div className={indexStyles.setRela_rb_right}>
                <Select
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  mode="multiple"
                  onSearch={this.onSearch}
                  value={selectedItems}
                  onBlur={this.onBlur}
                  onChange={e => {
                    this.handleChange(e, 'end_end')
                  }}
                  placeholder={`添加${currentNounPlanFilterName(TASKS)}依赖`}
                  className={indexStyles.setRela_select}
                >
                  {filteredOptions.map(item => (
                    <Select.Option
                      key={item.id}
                      value={`${item.id}_${item.name}`}
                    >
                      <div className={indexStyles.setRela_select_option}>
                        <div>
                          <span
                            className={`${
                              item.type == '3'
                                ? indexStyles.setRela_task_icon
                                : item.type == '2'
                                ? indexStyles.setRela_flow_icon
                                : ''
                            } ${globalStyles.authTheme}`}
                          >
                            <span>
                              {this.renderRelationItemIcon(item.type).icon}
                            </span>
                            {this.renderRelationItemIcon(item.type).dec}
                          </span>
                          <span title={item.name}>{item.name}</span>
                        </div>
                        {item.milestone_name && (
                          <span title={item.milestone_name}>
                            #&nbsp;{item.milestone_name}
                          </span>
                        )}
                      </div>
                    </Select.Option>
                  ))}
                </Select>
                {/* 显示添加设置的依赖项 */}
                <div>
                  {!!(next && next.length) &&
                    next.map(item => {
                      if (item.relation == 'end_end') {
                        return (
                          <div
                            key={item.id}
                            className={indexStyles.setRela_rb_item}
                          >
                            <div
                              className={indexStyles.setRela_rt_item_content}
                            >
                              <div className={indexStyles.setRela_rt_item_left}>
                                <span
                                  className={`${
                                    item.type == '3'
                                      ? indexStyles.setRela_task_icon
                                      : item.type == '2'
                                      ? indexStyles.setRela_flow_icon
                                      : ''
                                  } ${globalStyles.authTheme}`}
                                >
                                  <span style={{ marginRight: '4px' }}>
                                    {
                                      this.renderRelationItemIcon(item.type)
                                        .icon
                                    }
                                  </span>
                                  {this.renderRelationItemIcon(item.type).dec}
                                </span>
                                <span title={item.name}>{item.name}</span>
                              </div>
                              {item.milestone_name && (
                                <div
                                  className={indexStyles.setRela_rt_item_right}
                                >
                                  <span title={item.milestone_name}>
                                    #&nbsp;{item.milestone_name}
                                  </span>
                                </div>
                              )}
                              <Popconfirm
                                onCancel={this.onCancel}
                                onConfirm={e => {
                                  this.onConfirm({
                                    e,
                                    shouldDeleteId: item.id,
                                    relation: 'end_end'
                                  })
                                }}
                                getPopupContainer={triggerNode =>
                                  triggerNode.parentNode
                                }
                                title={'删除此依赖？'}
                                placement="topLeft"
                              >
                                <span
                                  className={`${globalStyles.authTheme} ${indexStyles.setRela_delIcon}`}
                                >
                                  &#xe7fe;
                                </span>
                              </Popconfirm>
                            </div>
                          </div>
                        )
                      }
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

SetRelationContent.defaultProps = {
  card_id: '', // 对应的任务ID
  board_id: '', // 当前任务对应的项目ID
  onlyShowPopoverContent: false, // 统一用来判断是显示哪一种样式
  currentItem: {}, // 当前字段的数据内容
  handleDelCurrentField: function() {} // 删除字段回调
}
