import React, { Component, PureComponent } from 'react'
import { connect } from 'dva'
import styles from './index.less'
import {
  task_item_margin_top,
  date_area_height,
  ceil_height,
  task_item_height,
  ganttIsFold,
  ganttIsOutlineView,
  gantt_panel_left_diff
} from '../../constants'
import globalStyles from '@/globalset/css/globalClassName.less'
import OutlineTree from '../OutlineTree'
import {
  updateTaskVTwo,
  updateMilestone
} from '../../../../../../services/technological/task'
import { workflowUpdateTime } from '../../../../../../services/technological/workFlow'
import { isApiResponseOk } from '../../../../../../utils/handleResponseData'
import { message, Tooltip } from 'antd'
import MilestoneDetail from '../milestoneDetail'
import {
  checkIsHasPermission,
  checkIsHasPermissionInBoard
} from '../../../../../../utils/businessFunction'
import {
  NOT_HAS_PERMISION_COMFIRN,
  PROJECT_TEAM_CARD_EDIT,
  PROJECT_TEAM_CARD_CREATE
} from '../../../../../../globalset/js/constant'
import {
  isSamDay,
  getDigit,
  timestampToTime
} from '../../../../../../utils/util'
import {
  setDateWithPositionInYearView,
  setDateWidthPositionWeekView,
  getXYDropPosition,
  getPageXY
} from '../../ganttBusiness'
import Draggable from 'react-draggable'
// import { debounce } from 'lodash'

const dateAreaHeight = date_area_height //日期区域高度，作为修正
const getEffectOrReducerByName = name => `gantt/${name}`

@connect(mapStateToProps)
export default class GetRowStrip extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      currentRect: {}, //任务位置
      is_item_has_time: false, //处于该条上的任务有没有开始或者时间
      set_miletone_detail_modal_visible: false, //里程碑是否可见
      currentRectDashed: { x: 0, width: 0 }, //当前操作的矩形属性
      drag_holiday_count: 0,
      dasheRectShow: false,
      create_start_time: '',
      create_end_time: ''
    }
    this.setIsCardHasTime()

    // this.x1 = 0 //用于做拖拽生成一条任务
    // this.isDragging = false //判断是否在拖拽虚线框
    // this.isMouseDown = false //是否鼠标按下
    // this.task_is_dragging = false //任务实例是否在拖拽中

    this.milestone_ref = React.createRef() //里程碑实例
    this.milestone_dragging = false //里程碑拖拽中
  }
  componentDidMount() {
    this.setCurrentSelectedProjectMembersList()
  }
  componentWillReceiveProps(nextProps) {
    this.setIsCardHasTime()
    this.setCurrentSelectedProjectMembersList()
    // this.clearDragInfo(nextProps)
  }
  // 当前滑动的这一条任务是否存在时间？存在时间代表可以在面板上创建
  setIsCardHasTime = () => {
    const { itemValue = {} } = this.props
    const { start_time, due_time, tree_type } = itemValue
    this.setState({
      is_item_has_time: !!((tree_type == '1' ? false : start_time) || due_time)
    })
  }

  renderStyles = () => {
    const {
      itemValue = {},
      date_arr_one_level = [],
      ceilWidth,
      date_total
    } = this.props
    const { height, top, left, start_time, due_time, tree_type } = itemValue
    const { isInViewArea } = this.filterIsInViewArea()
    return {
      height,
      top: top + task_item_margin_top,
      width: date_total * ceilWidth,
      zIndex:
        (start_time || due_time) && isInViewArea && tree_type != '1' ? '0' : '1' //存在时间的就不显性出现了，避免和svg层级冲突,（里程碑正常）
    }
  }
  // 长条鼠标事件---start
  stripMouseOver = e => {
    const { itemValue = {}, dispatch } = this.props
    const { tree_type, id, add_id } = itemValue
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        outline_hover_obj: tree_type == '0' ? { add_id } : { id } //创建那一栏不需要效果
      }
    })
  }
  stripMouseEnter = e => {
    const { itemValue = {}, dispatch } = this.props
    const { tree_type, id, add_id } = itemValue
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        outline_hover_obj: tree_type == '0' ? { add_id } : { id } //创建那一栏不需要效果
      }
    })
  }
  stripMouseLeave = e => {
    const row_srip = e.target?.dataset?.row_srip
    if (!row_srip) {
      const { dispatch } = this.props
      dispatch({
        type: 'gantt/updateDatas',
        payload: {
          outline_hover_obj: {}
        }
      })
    }
    // this.addCardSetOutlineTree({ start_time: 0, due_time: 0, editing: false })
  }
  stripMouseMove = e => {
    if (this.state.is_item_has_time) {
      //存在时间的任务不需要再设置时间了
      return
    }
    return this.setCurrentRect(e)
  }
  setCurrentRect = e => {
    const { ceiHeight, ceilWidth, gantt_head_width } = this.props

    const target_0 = document.getElementById('gantt_card_out')
    const target_1 = document.getElementById('gantt_card_out_middle')
    // 取得鼠标位置
    let px =
      e.pageX -
      target_0.offsetLeft +
      target_1.scrollLeft -
      gantt_head_width -
      gantt_panel_left_diff
    let py =
      e.pageY - target_0.offsetTop + target_1.scrollTop - date_area_height

    const molX = px % ceilWidth
    const molY = py % ceiHeight //2为折叠的总行
    px = px - molX
    py = py - molY

    const property = {
      x: px,
      y: py
    }
    this.setState({
      currentRect: property
    })
    return Promise.resolve(property)
  }
  // 长条鼠标事件---end
  //是否当前滑动在这一条上
  onHoverState = () => {
    const { itemValue = {}, outline_hover_obj } = this.props
    const { id, add_id, tree_type } = itemValue
    if (tree_type == '0') {
      return outline_hover_obj.add_id == add_id
    }
    return outline_hover_obj.id == id
  }
  // 计算当前鼠标滑动位置的时间
  calHoverDate = () => {
    const { currentRect } = this.state
    const {
      gantt_view_mode,
      itemValue: { time_span }
    } = this.props
    const { x, y, width, height } = currentRect
    const { date_arr_one_level, ceilWidth } = this.props
    let counter = 0
    let date = {}
    if (['month', 'hours', 'relative_time'].includes(gantt_view_mode)) {
      for (let val of date_arr_one_level) {
        counter += 1
        if (counter * ceilWidth > x) {
          date = val
          break
        }
      }
    } else if (gantt_view_mode == 'year') {
      date = setDateWithPositionInYearView({
        _position: x + ceilWidth,
        date_arr_one_level,
        ceilWidth,
        width: width || ceilWidth,
        x
      })
    } else if (gantt_view_mode == 'week') {
      date = setDateWidthPositionWeekView({
        position: x,
        date_arr_one_level,
        ceilWidth
      })
    } else {
    }
    // debugger
    return date
  }
  // 渲染任务滑块 --start
  renderCardRect = () => {
    const { itemValue = {}, ceilWidth, gantt_view_mode } = this.props
    const { id, name, time_span } = itemValue
    const { is_item_has_time, currentRect = {} } = this.state
    const timestamp =
      gantt_view_mode == 'year' ? this.calHoverDate().timestamp : ''
    const correct_value = gantt_view_mode == 'year' ? 0 : 6 //校准值
    const correct_value2 = gantt_view_mode == 'year' ? 6 : 0 //校准值

    return (
      <div
        onClick={this.cardSetClick}
        className={styles.will_set_item}
        style={{
          display: !is_item_has_time && this.onHoverState() ? 'flex' : 'none',
          marginLeft: currentRect.x - correct_value2,
          height: task_item_height
        }}
      >
        <Tooltip
          visible={gantt_view_mode == 'year'}
          title={timestampToTime(timestamp)}
        >
          <>
            {gantt_view_mode == 'year' && (
              <div style={{ width: 10, height: '100%', marginLeft: -6 }}></div>
            )}
            <div
              style={{
                width: time_span
                  ? time_span * ceilWidth - correct_value
                  : ceilWidth - correct_value
              }}
              className={styles.card_rect}
            ></div>
            <div className={styles.point}></div>
            <div className={styles.name}>{name}</div>
          </>
        </Tooltip>
      </div>
    )
  }
  cardSetClick = () => {
    const {
      itemValue = {},
      gantt_board_id,
      dispatch,
      gantt_view_mode
    } = this.props
    if (!checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_EDIT, gantt_board_id)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN)
      return
    }
    const date = this.calHoverDate()
    const { timestamp, timestampEnd } = date
    let { id, time_span = 1, parent_card_id } = itemValue
    if (isNaN(time_span) || time_span == 0) time_span = 1
    const due_time =
      gantt_view_mode == 'hours'
        ? timestampEnd
        : timestamp + time_span * 24 * 60 * 60 * 1000 - 1000
    updateTaskVTwo(
      {
        card_id: id,
        due_time,
        start_time: timestamp,
        board_id: gantt_board_id
      },
      { isNotLoading: false }
    )
      .then(res => {
        if (isApiResponseOk(res)) {
          if (
            Object.prototype.toString.call(res.data.scope_content) ==
            '[object Array]'
          ) {
            dispatch({
              type: 'gantt/updateOutLineTree',
              payload: {
                datas: [
                  // { id, start_time: timestamp, due_time },
                  ...res.data.scope_content
                ]
              }
            })
          }
          // this.changeOutLineTreeNodeProto(id, { start_time: timestamp, due_time })
          // if (parent_card_id) { //如果该任务是子任务，更新完成后更新父任务
          //     setTimeout(() => {
          //         // this.changeOutLineTreeNodeProto(parent_card_id, { start_time: res.data.start_time, due_time: res.data.due_time })
          //         if (Object.prototype.toString.call(res.data) == '[object Array]') {
          //             dispatch({
          //                 type: 'gantt/updateOutLineTree',
          //                 payload: {
          //                     datas: res.data
          //                 }
          //             });
          //         }
          //     }, 200)
          // }
        } else {
          message.error(res.message)
        }
      })
      .catch(err => {
        message.error('更新失败')
      })
  }
  // 渲染任务滑块 --end

  // 渲染流程 ----------start
  renderWorkFlow = () => {
    const { itemValue = {}, ceilWidth, gantt_view_mode } = this.props
    const { id, name, time_span } = itemValue
    const { is_item_has_time, currentRect = {} } = this.state
    const timestamp =
      gantt_view_mode == 'year' ? this.calHoverDate().timestamp : ''
    const correct_value = gantt_view_mode == 'year' ? 0 : 6 //校准值
    const correct_value2 = gantt_view_mode == 'year' ? 6 : 0 //校准值

    return (
      <div
        onClick={this.workFlowSetClick}
        className={styles.will_set_item}
        style={{
          display: !is_item_has_time && this.onHoverState() ? 'flex' : 'none',
          marginLeft: currentRect.x - correct_value2,
          paddingLeft: (ceilWidth - 24) / 2
        }}
      >
        <Tooltip
          visible={gantt_view_mode == 'year'}
          title={timestampToTime(timestamp)}
        >
          <>
            {gantt_view_mode == 'year' && (
              <div style={{ width: 10, height: '100%', marginLeft: -6 }}></div>
            )}
            <div className={`${styles.flow} ${globalStyles.authTheme}`}>
              &#xe68c;
            </div>
            <div className={styles.name}>{name}</div>
            <div className={styles.status}>（未开始）</div>
          </>
        </Tooltip>
      </div>
    )
  }
  workFlowSetClick = () => {
    const date = this.calHoverDate()
    const { timestamp } = date
    const { itemValue = {}, gantt_board_id, dispatch } = this.props
    let { id } = itemValue
    workflowUpdateTime(
      { plan_start_time: timestamp, id },
      { isNotLoading: false }
    )
      .then(res => {
        if (isApiResponseOk(res)) {
          const status = isSamDay(new Date().getTime(), timestamp) ? '1' : '0' //如果是今天则设置为未开始
          if (
            Object.prototype.toString.call(res.data.scope_content) ==
            '[object Array]'
          ) {
            dispatch({
              type: 'gantt/updateOutLineTree',
              payload: {
                datas: [
                  { id, start_time: timestamp, status },
                  ...res.data.scope_content
                ]
              }
            })
          }
          // this.changeOutLineTreeNodeProto(id, { start_time: timestamp, status })
        } else {
          message.error(res.message)
        }
      })
      .catch(err => {
        message.error('更新失败')
      })
  }
  // 渲染流程-----------end

  // 点击任务将该任务设置时间
  changeOutLineTreeNodeProto = (id, data = {}, type) => {
    if ('milestone' == type) {
      data.executors = data.principals || []
    }
    let { dispatch, outline_tree } = this.props
    let nodeValue = OutlineTree.getTreeNodeValue(outline_tree, id)
    const mapSetProto = data => {
      Object.keys(data).map(item => {
        nodeValue[item] = data[item]
      })
    }
    if (nodeValue) {
      mapSetProto(data)

      dispatch({
        type: 'gantt/handleOutLineTreeData',
        payload: {
          data: outline_tree
        }
      })
    } else {
      console.error('OutlineTree.getTreeNodeValue:未查询到节点')
    }
  }

  // 里程碑的拖拽 -----------start
  milestoneDragStart = e => {
    this.milestone_drag_ele = e //缓存拖拽的里程碑节点
    this.milestone_initial_left = this.milestone_ref.current.dataset.left
    const { x } = getXYDropPosition(e, {
      gantt_head_width: this.props.gantt_head_width
    })
    this.milestone_drag_point_diff = x - this.milestone_initial_left //做初始标记，由于鼠标拖拽的位置在该元素上不同，记录元素最左边和鼠标落点的差值
    console.log('sssssssss_00', x, this.milestone_drag_point_diff)
  }
  milestoneDraging = e => {
    const { pageX } = getPageXY(e)
    if (!pageX) return
    this.milestone_drag_ele = e
    setTimeout(() => {
      // console.log('ssssssssaaaa_draging', this.milestone_dragging)
      this.milestone_dragging = true
    }, 100)
    // debounce(setDraging, 300)
    // console.log('sssssssss_11', this.milestone_initial_left)
    this.setState({
      dragg_milestone_complete: false
    })
  }
  milestoneDragStop = async () => {
    const {
      gantt_view_mode,
      date_arr_one_level,
      ceilWidth,
      gantt_head_width,
      itemValue
    } = this.props
    // console.log('ssssssssaaaa_drop', this.milestone_dragging)
    setTimeout(() => {
      this.milestone_dragging = false
    }, 300)
    if (!this.milestone_dragging) return
    let { x } =
      getXYDropPosition(this.milestone_drag_ele, {
        gantt_head_width
      }) || {}
    x = x - this.milestone_drag_point_diff + ceilWidth //校准
    // const { x } = (await this.setCurrentRect(this.milestone_drag_ele)) || {}
    let date = {} //具体日期
    let counter = 0
    if (['month', 'hours', 'relative_time'].includes(gantt_view_mode)) {
      for (let val of date_arr_one_level) {
        counter += 1
        if (counter * ceilWidth > x) {
          date = val
          break
        }
      }
    } else if (gantt_view_mode == 'year') {
      date = setDateWithPositionInYearView({
        _position: x + ceilWidth,
        date_arr_one_level,
        ceilWidth,
        width: ceilWidth,
        x
      })
    } else if (gantt_view_mode == 'week') {
      date = setDateWidthPositionWeekView({
        position: x,
        date_arr_one_level,
        ceilWidth
      })
    } else {
    }
    // console.log('sssssssssss_22', x, date)
    // debugger
    const { timestamp, timestampEnd } = date
    if (!timestampEnd) return

    this.milestoneSetClick({ timestamp, timestampEnd })
      .then(res => {
        console.log('ssssssssssss_sucess', res)
        this.setState({
          dragg_milestone_complete: true
        })
      })
      .catch(err => {
        console.log('ssssssssssss_err', err)

        this.changeOutLineTreeNodeProto(itemValue.id, {
          due_time: itemValue.due_time - 1
        })
        setTimeout(() => {
          this.setState({
            dragg_milestone_complete: true
          })
        }, 300)
      })
  }
  // 里程碑的拖拽 -----------end
  //渲染里程碑设置---start
  renderMilestoneSet = () => {
    const {
      itemValue: { due_time, min_leaf_left, left, parent_id, percent_card_non },
      ceilWidth,
      gantt_view_mode
    } = this.props
    return !!due_time ? (
      <>
        <div
          className={`${styles.leaf_min_time} ${!parent_id &&
            styles.leaf_min_time_color}`}
          style={{
            left: min_leaf_left,
            width:
              left -
              min_leaf_left +
              (!parent_id
                ? ceilWidth
                : ['month', 'hours'].includes(gantt_view_mode)
                ? ceilWidth / 2
                : 0)
          }}
        >
          <div className={styles.left_triangle}></div>
          <div className={styles.right_triangle}></div>
        </div>
        {!!parseInt(percent_card_non) && (
          <div
            className={`${styles.leaf_min_time} ${
              styles.leaf_percent_time
            } ${!!parent_id && styles.leaf_percent_child_time}`}
            style={{
              left: min_leaf_left,
              width:
                (left -
                  min_leaf_left +
                  (!parent_id
                    ? ceilWidth
                    : ['month', 'hours'].includes(gantt_view_mode)
                    ? ceilWidth / 2
                    : 0)) *
                (percent_card_non / 100)
            }}
          >
            <div className={styles.left_triangle}></div>
            <div
              className={
                Number(percent_card_non) >= 100 && styles.right_triangle
              }
            ></div>
          </div>
        )}
        <Draggable
          {...(this.state.dragg_milestone_complete
            ? { position: { x: 0, y: 0 } }
            : {})} //拖拽错误后回归原位
          axis="x"
          onStart={this.milestoneDragStart}
          onDrag={this.milestoneDraging}
          onStop={this.milestoneDragStop}
        >
          {this.renderMilestone()}
        </Draggable>
      </>
    ) : (
      this.renderMilestone()
    )
  }
  renderMilestone = () => {
    const {
      itemValue = {},
      group_list_area,
      list_group_key,
      ceilWidth,
      gantt_view_mode
    } = this.props
    const { id, name, due_time, left, expand_length, parent_id } = itemValue
    const { is_item_has_time, currentRect = {} } = this.state
    let display = 'none'
    let marginLeft = currentRect.x
    let paddingLeft = 0
    if (due_time) {
      display = 'flex'
      marginLeft = left
      paddingLeft = ceilWidth - 2
    } else {
      if (this.onHoverState()) {
        display = 'flex'
        marginLeft = currentRect.x
        paddingLeft = ceilWidth / 2 - 2
      }
    }
    if (marginLeft == '0') {
      display = 'none'
    }
    if (!!parent_id) {
      //代表子里程碑
      paddingLeft = ceilWidth / 2 - 6
    }
    // console.log('marginLeft', marginLeft)
    const timestamp =
      gantt_view_mode == 'year' ? this.calHoverDate().timestampEnd : ''
    return (
      <div
        onMouseUpCapture={() => this.miletonesClick(due_time)}
        onTouchEndCapture={() => this.miletonesClick(due_time)}
        className={styles.will_set_item_milestone}
        ref={this.milestone_ref}
        data-left={marginLeft}
        style={{
          display,
          left: marginLeft,
          paddingLeft
        }}
      >
        <Tooltip
          visible={!due_time && gantt_view_mode == 'year'}
          title={timestampToTime(timestamp)}
        >
          <>
            {gantt_view_mode == 'year' && !due_time && (
              <div style={{ width: 10, height: '100%', marginLeft: -6 }}></div>
            )}
            {!!parent_id ? (
              <div className={styles.board_miletiones_flag2}></div>
            ) : (
              <>
                <div
                  style={{
                    height: (expand_length - 0.5) * ceil_height
                  }}
                  className={styles.board_miletiones_flagpole}
                ></div>
                <div
                  className={`${styles.board_miletiones_flag} ${globalStyles.authTheme}`}
                >
                  &#xe6a0;
                </div>
              </>
            )}

            <div
              className={styles.board_miletiones_names}
              style={{
                paddingTop: !!parent_id ? 2 : 0,
                color: !!parent_id ? 'FFBA67' : ''
              }}
            >
              {name}
            </div>
          </>
        </Tooltip>
      </div>
    )
  }
  miletonesClick = due_time => {
    // console.log('ssssssssaaaa_click', this.milestone_dragging)
    if (this.milestone_dragging) return //拖拽过程中不能点击
    if (due_time) {
      this.milestoneDetail()
    } else {
      this.milestoneSetClick()
    }
  }
  milestoneSetClick = param_date => {
    const date = param_date || this.calHoverDate()
    const { timestamp, timestampEnd } = date
    const { itemValue = {} } = this.props
    let { id } = itemValue
    return new Promise((resolve, reject) => {
      updateMilestone({ id, deadline: timestampEnd }, { isNotLoading: false })
        .then(res => {
          if (isApiResponseOk(res)) {
            this.changeOutLineTreeNodeProto(id, {
              start_time: timestamp,
              due_time: timestampEnd
            })
            message.success('更新成功')
            resolve(res)
          } else {
            message.error(res.message)
            reject()
          }
        })
        .catch(err => {
          message.error('更新失败')
          reject()
        })
    })
  }
  milestoneDetail = () => {
    this.set_miletone_detail_modal_visible()
    const { itemValue = {} } = this.props
    const { id } = itemValue
    //更新里程碑id,在里程碑的生命周期会监听到id改变，发生请求
    const { dispatch } = this.props
    dispatch({
      type: 'milestoneDetail/updateDatas',
      payload: {
        milestone_id: id
      }
    })
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        miletone_detail_modal_visible: true
      }
    })
  }
  deleteMiletone = ({ id }) => {
    const { milestoneMap = {}, dispatch } = this.props
    const new_milestoneMap = { ...milestoneMap }
    this.props.deleteOutLineTreeNode(id)

    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        milestoneMap: new_milestoneMap
      }
    })
  }
  // 里程碑删除子任务回调
  deleteRelationContent = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'gantt/getGttMilestoneList',
      payload: {}
    })
  }
  // 甘特图信息变化后，实时触发甘特图渲染在甘特图上变化
  handleMiletonsChangeMountInGantt = (id, data, data2) => {
    let data_ = { ...data }
    if (data_.deadline) data_.due_time = data_.deadline
    this.changeOutLineTreeNodeProto(id, data_, 'milestone')
    // debugger
    // const { dispatch } = this.props
    // dispatch({
    //     type: 'gantt/getGttMilestoneList',
    //     payload: {

    //     }
    // })
  }
  set_miletone_detail_modal_visible = () => {
    const { miletone_detail_modal_visible } = this.state
    this.setState({
      miletone_detail_modal_visible: !miletone_detail_modal_visible
    })
    // if (miletone_detail_modal_visible) { //关闭的时候更新
    //     let { milestone_detail = {}, itemValue: { id } } = this.props
    //     milestone_detail.due_time = milestone_detail.deadline
    //     setTimeout(() => {
    //         this.changeOutLineTreeNodeProto(id, milestone_detail, 'milestone')
    //     }, 300)
    // }
  }
  // 过滤项目成员
  setCurrentSelectedProjectMembersList = () => {
    const { gantt_board_id, about_user_boards = [] } = this.props
    const users =
      (about_user_boards.find(item => item.board_id == gantt_board_id) || {})
        .users || []
    this.setState({
      currentSelectedProjectMembersList: users
    })
  }
  //渲染里程碑设置---end

  targetEventProps = () => {
    const {
      itemValue: { id, add_id, editing }
    } = this.props
    if (!!id) {
      //真正上的里程碑或者任务 或者创建里程碑的虚拟节点
      return {
        // onMouseOver: this.stripMouseOver,
        onMouseEnter: this.stripMouseEnter,
        onMouseLeave: this.stripMouseLeave,
        onMouseMove: this.stripMouseMove
      }
    } else {
      if (add_id == 'add_milestone') {
        return {
          // onMouseOver: this.stripMouseOver,
          onMouseEnter: this.stripMouseEnter,
          onMouseLeave: this.stripMouseLeave
        }
      }
      return {
        onMouseDown: e => {
          e.stopPropagation()
          if (editing) {
            return
          }
          // this.dashedMousedown(e)
        },
        onMouseMove: e => {
          e.stopPropagation()
          if (editing) {
            return
          }
          // this.dashedMouseMove(e)
        },
        onMouseLeave: e => {
          e.stopPropagation()
          if (editing) {
            return
          }
          // this.dashedMouseLeave(e)
          this.stripMouseLeave(e)
        },
        // onMouseOver: e => {
        //   if (editing) {
        //     return
        //   }
        //   this.stripMouseOver(e)
        // },
        onMouseEnter: e => {
          if (editing) {
            return
          }
          this.stripMouseEnter(e)
        }
      }
    }
  }

  // 设置出现将具有时间的里程碑或任务定位到视觉区域内------start
  // 定位
  navigateToVisualArea = () => {
    const {
      date_arr_one_level = [],
      ceilWidth,
      itemValue = {},
      gantt_view_mode
    } = this.props
    const { start_time, due_time, tree_type } = itemValue
    const gold_time = tree_type == '1' ? due_time : start_time
    const date = new Date(gold_time).getDate()
    let toDayIndex = -1
    if (gantt_view_mode == 'month') {
      toDayIndex = date_arr_one_level.findIndex(item =>
        isSamDay(item.timestamp, gold_time)
      ) //当天所在位置index
    } else if (gantt_view_mode == 'year') {
      toDayIndex = date_arr_one_level.findIndex(
        item => gold_time >= item.timestamp && gold_time <= item.timestampEnd
      ) //当天所在月位置index
    } else {
    }
    const target = document.getElementById('gantt_card_out_middle')

    if (toDayIndex != -1) {
      //如果今天在当前日期面板内
      let nomal_position = toDayIndex * ceilWidth - 248 + 16 //248为左边面板宽度,16为左边header的宽度和withCeil * n的 %值
      if (gantt_view_mode == 'year') {
        const date_position = date_arr_one_level
          .slice(0, toDayIndex)
          .map(item => item.last_date)
          .reduce((total, num) => total + num) //索引月份总天数
        nomal_position = date_position * ceilWidth - 248 + 16 //当天所在位置index
      }
      const max_position =
        target.scrollWidth - target.clientWidth - 2 * ceilWidth //最大值,保持在这个值的范围内，滚动条才能不滚动到触发更新的区域
      const position =
        max_position > nomal_position ? nomal_position : max_position

      this.setScrollPosition({
        position
      })
    } else {
      this.props.setGoldDateArr &&
        this.props.setGoldDateArr({ timestamp: gold_time })
      setTimeout(() => {
        this.props.setScrollPosition &&
          this.props.setScrollPosition({
            delay: 300,
            position: ceilWidth * (60 - 4 + date - 1) - 16
          })
      }, 300)
    }
  }
  //设置滚动条位置
  setScrollPosition = ({ delay = 300, position = 200 }) => {
    const target = document.getElementById('gantt_card_out_middle')
    setTimeout(function() {
      if (target.scrollTo) {
        target.scrollTo(position, target.scrollTop)
      } else {
        target.scrollLeft = position
      }
    }, delay)
  }
  // 任务或里程碑  位置是否在可见区域
  filterIsInViewArea = () => {
    const target = document.getElementById('gantt_card_out_middle')
    if (!target) {
      return {
        isInViewArea: false
      }
    }
    const { itemValue = {} } = this.props
    const {
      start_time,
      due_time,
      tree_type,
      left,
      width: item_width
    } = itemValue
    if (!start_time && !due_time) {
      // return false
      return {
        isInViewArea: false
      }
    }

    const { date_arr_one_level, gantt_view_mode } = this.props
    const width = target.clientWidth
    const scrollLeft = target.scrollLeft
    const gold_time = tree_type == '1' ? due_time : start_time
    let index = -1
    if (gantt_view_mode == 'month') {
      index = date_arr_one_level.findIndex(item =>
        isSamDay(item.timestamp, gold_time)
      ) //当天所在位置index
    } else if (gantt_view_mode == 'year') {
      index = date_arr_one_level.findIndex(
        item => gold_time >= item.timestamp && gold_time <= item.timestampEnd
      ) //当天所在月位置index
    } else {
    }
    let isInViewArea = false //是否在可视区域
    let direction = '' //在右还是在左
    let date_arr_one_level_length = date_arr_one_level.length
    // console.log('sssssssssssara', scrollLeft, left, width, left - width, index)
    if (scrollLeft < left + item_width && scrollLeft > left - width) {
      //在可视区域。
      isInViewArea = true
    } else {
      //在不可视区域
      isInViewArea = false
      if (index != -1) {
        //当前日期列表包含目标时间
        if (scrollLeft > left) {
          //在视图区域左侧
          direction = 'left'
        } else {
          //在视图区域右侧
          direction = 'right'
        }
      } else {
        //目标时间不包含在列表内
        // console.log('leftleftleft', left)
        // if (left) { //在区间左侧
        //     direction = 'left'
        // } else { //在区间右侧
        //     direction = 'right'
        // }
        if (
          (tree_type == '1' &&
            getDigit(due_time) >
              getDigit(
                date_arr_one_level[date_arr_one_level_length - 1]['timestamp']
              )) ||
          (tree_type == '2' && //任务或里程碑在可视区域右区间外
            getDigit(start_time) >
              getDigit(
                date_arr_one_level[date_arr_one_level_length - 1]['timestamp']
              ))
        ) {
          //任务或里程碑在可视区域左区间外
          direction = 'right'
        } else {
          direction = 'left'
        }
      }
    }
    const result = {
      isInViewArea,
      direction,
      add_width: width
    }
    // console.log('ssssssssssresult', result)
    return result
  }
  // 设置出现将具有时间的里程碑或任务定位到视觉区域内------end

  renderSet = tree_type => {
    let container = <></>
    switch (tree_type) {
      case '1':
        container = this.renderMilestoneSet()
        break
      case '2':
        container = this.renderCardRect()
        break
      case '3':
        container = this.renderWorkFlow()
        break
      default:
        break
    }
    return container
  }
  render() {
    const {
      itemValue = {},
      ceilWidth,
      projectDetailInfoData,
      target_scrollLeft
    } = this.props
    const { tree_type } = itemValue

    const {
      is_item_has_time,
      currentRectDashed = {},
      dasheRectShow,
      drag_holiday_count
    } = this.state
    // 定位
    // const { isInViewArea, direction, add_width } = this.filterIsInViewArea()

    return (
      <div>
        <div
          className={`${styles.row_srip} ${this.onHoverState() &&
            styles.row_srip_on_hover}`}
          data-row_srip={true}
          ref={'row_strip'}
          {...this.targetEventProps()}
          // onMouseMove={this.stripMouseMove}
          // onMouseOver={this.stripMouseOver}
          // onMouseLeave={this.stripMouseLeave}
          style={{ ...this.renderStyles() }}
        >
          {/* { //日期在视图外往左或者往右
                        is_item_has_time && !isInViewArea ? (
                            <div
                                onClick={this.navigateToVisualArea}
                                className={styles.navi_position}
                                style={{
                                    transform: `translateX(${direction == 'right' ? target_scrollLeft + add_width - 40 : target_scrollLeft + 16}px)`
                                }}
                            >
                                {
                                    direction == 'left' ? (
                                        <i className={`${globalStyles.authTheme}`}> &#xe7ef;</i>
                                    ) : (
                                            <i className={`${globalStyles.authTheme}`}> &#xe7f0;</i>
                                        )
                                }
                            </div>
                        ) : ''
                    } */}
          {//用于拖拽生成任务（已废弃）
          dasheRectShow && false && !this.task_is_dragging && (
            <div
              className={styles.dasheRect}
              style={{
                left: currentRectDashed.x + 1,
                width: currentRectDashed.width,
                height: task_item_height, //currentRectDashed.height,
                boxSizing: 'border-box',
                color: 'rgba(0,0,0,0.45)',
                textAlign: 'right',
                lineHeight: `${task_item_height}px`,
                paddingRight: 8
              }}
            >
              {Math.ceil(currentRectDashed.width / ceilWidth) != 1 &&
                Math.ceil(currentRectDashed.width / ceilWidth) -
                  drag_holiday_count}
              {Math.ceil(currentRectDashed.width / ceilWidth) != 1 &&
                (drag_holiday_count > 0 ? `+${drag_holiday_count}` : '')}
            </div>
          )}
          {this.renderSet(tree_type)}
        </div>
        {/* <MilestoneDetail
          handleMiletonesChange={this.handleMiletonsChangeMountInGantt}
          users={projectDetailInfoData.data || []}
          miletone_detail_modal_visible={
            this.state.miletone_detail_modal_visible
          }
          set_miletone_detail_modal_visible={
            this.set_miletone_detail_modal_visible
          }
          deleteMiletone={this.deleteMiletone}
          deleteRelationContent={this.deleteRelationContent}
        /> */}
      </div>
    )
  }
}

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
  gantt: {
    datas: {
      date_arr_one_level = [],
      outline_hover_obj,
      outline_tree = [],
      ceiHeight,
      ceilWidth,
      group_list_area,
      gantt_board_id,
      milestoneMap,
      about_user_boards,
      gold_date_arr = [],
      group_rows = [],
      holiday_list = [],
      group_view_type,
      group_list_area_section_height,
      show_board_fold,
      outline_tree_round,
      target_scrollLeft,
      date_total,
      gantt_view_mode,
      gantt_head_width
    }
  },
  milestoneDetail: { milestone_detail = {} },
  projectDetail: {
    datas: { projectDetailInfoData = {} }
  }
}) {
  return {
    date_arr_one_level,
    outline_hover_obj,
    ceiHeight,
    ceilWidth,
    outline_tree,
    group_list_area,
    gantt_board_id,
    milestoneMap,
    about_user_boards,
    milestone_detail,
    gold_date_arr,
    group_rows,
    holiday_list,
    group_view_type,
    group_list_area_section_height,
    show_board_fold,
    outline_tree_round,
    projectDetailInfoData,
    target_scrollLeft,
    date_total,
    gantt_view_mode,
    gantt_head_width
  }
}

// // 空条拖拽事件--------------------------------------------------------------------------start
// setTaskIsDragging = bool => {
//   //设置任务是否在拖拽中的状态
//   this.task_is_dragging = bool
//   const target = this.refs.row_strip
//   if (!target) return
//   if (!target.style) return
//   if (bool) {
//     target.style.cursor = 'move'
//   } else {
//     target.style.cursor = 'crosshair'
//   }
// }
// setIsDragging = isDragging => {
//   const { dispatch } = this.props
//   this.isDragging = isDragging
// }

// // 在任务实例上点击到特定的位置，阻断，是能够不出现创建任务弹窗
// stopPropagationEle = e => {
//   if (this.task_is_dragging) {
//     //在做单条任务拖动的时候，不能创建
//     return true
//   }
//   if (
//     e.target.dataset &&
//     e.target.className &&
//     typeof e.target.className == 'string' && //容错
//     (e.target.dataset.targetclassname == 'specific_example' ||
//       e.target.className.indexOf('authTheme') != -1 ||
//       e.target.className.indexOf('ant-avatar') != -1)
//   ) {
//     //不能滑动到某一个任务实例上
//     return true
//   }
//   return false
// }
// //鼠标拖拽移动
// dashedMousedown = e => {
//   if (
//     this.stopPropagationEle(e) || //不能滑动到某一个任务实例上
//     this.isDragging ||
//     this.isMouseDown //在拖拽中，还有防止重复点击
//   ) {
//     return false
//   }
//   const { currentRectDashed = {} } = this.state
//   this.x1 = currentRectDashed.x
//   this.setIsDragging(false)
//   this.isMouseDown = true
//   this.handleCreateTask({ start_end: '1' })
//   const target = this.refs.row_strip //event.target || event.srcElement;
//   target.onmousemove = this.dashedDragMousemove.bind(this)
//   target.onmouseup = this.dashedDragMouseup.bind(this)
// }
// dashedDragMousemove = e => {
//   if (this.stopPropagationEle(e)) {
//     //不能滑动到某一个任务实例上
//     return false
//   }
//   this.setIsDragging(true)

//   const { ceilWidth, gantt_head_width } = this.props
//   const target_0 = document.getElementById('gantt_card_out')
//   const target_1 = document.getElementById('gantt_card_out_middle')
//   // 取得鼠标位置
//   const x =
//     e.pageX -
//     target_0.offsetLeft +
//     target_1.scrollLeft -
//     gantt_head_width -
//     gantt_panel_left_diff
//   //设置宽度
//   const offset_left = Math.abs(x - this.x1)
//   // 更新拖拽的最新矩形
//   let px = this.x1 //x < this.x1 ? x : this.x1 //向左向右延申
//   let width = offset_left < ceilWidth || x < this.x1 ? ceilWidth : offset_left //小于单位长度或者鼠标相对点击的起始点向左拖动都使用最小单位
//   width = Math.ceil(width / ceilWidth) * ceilWidth - 6 //向上取整 4为微调
//   const property = {
//     x: px,
//     width
//   }
//   this.setState(
//     {
//       currentRectDashed: property
//     },
//     () => {
//       this.handleCreateTask({
//         start_end: '2',
//         top: property.y,
//         not_create: true
//       })
//       this.setDragDashedRectHolidayNo()
//     }
//   )
// }
// dashedDragMouseup = e => {
//   if (this.stopPropagationEle(e)) {
//     //不能滑动到某一个任务实例上
//     return false
//   }
//   this.stopDragging()
//   this.handleCreateTask({ start_end: '2' })
// }
// stopDragging = () => {
//   const target = this.refs.row_strip
//   target.onmousemove = null
//   target.onmuseup = null
//   const that = this
//   setTimeout(function() {
//     that.isMouseDown = false
//     that.setIsDragging(false)
//   }, 1000)
// }
// //鼠标移动
// dashedMouseMove = e => {
//   const { ceilWidth, gantt_head_width } = this.props
//   if (this.isMouseDown) {
//     //按下的情况不处理
//     return false
//   }
//   const { dasheRectShow } = this.state
//   if (!dasheRectShow) {
//     this.setState({
//       dasheRectShow: true
//     })
//   }

//   const target_0 = document.getElementById('gantt_card_out')
//   const target_1 = document.getElementById('gantt_card_out_middle')
//   // 取得鼠标位置
//   let px =
//     e.pageX -
//     target_0.offsetLeft +
//     target_1.scrollLeft -
//     gantt_head_width -
//     gantt_panel_left_diff

//   const molX = px % ceilWidth
//   px = px - molX

//   const { currentRectDashed } = this.state
//   if (currentRectDashed.x == px) {
//     return
//   }

//   const property = {
//     x: px,
//     width: 40
//   }

//   this.setState({
//     currentRectDashed: property,
//     drag_holiday_count: 0
//   })
// }
// dashedMouseLeave = e => {
//   if (!this.isMouseDown) {
//     this.setState({
//       dasheRectShow: false
//     })
//   }
// }
// //记录起始时间，做创建任务工作
// handleCreateTask = ({ start_end, top, not_create }) => {
//   const { dispatch } = this.props
//   const { ceilWidth, date_arr_one_level = [] } = this.props
//   const { currentRectDashed = {} } = this.state
//   const { x, width } = currentRectDashed
//   let counter = 0
//   let date = {}
//   for (let val of date_arr_one_level) {
//     counter += 1
//     if (counter * ceilWidth > x + width) {
//       date = val
//       break
//     }
//   }
//   const { timestamp, timestampEnd } = date
//   const update_name =
//     start_end == '1' ? 'create_start_time' : 'create_end_time'
//   this.setState(
//     {
//       [update_name]: start_end == '1' ? timestamp : timestampEnd
//     },
//     () => {
//       if (not_create) {
//         //不创建和查看
//         return
//       }
//       if (start_end == '2') {
//         //拖拽或点击操作完成，进行生成单条任务逻辑
//         this.setSpecilTaskExample() //出现任务创建或查看任务
//       }
//     }
//   )
// }
// //点击某个实例,或者创建任务
// setSpecilTaskExample = e => {
//   const {
//     dispatch,
//     gantt_board_id,
//     itemValue: { parent_card_id, parent_milestone_id }
//   } = this.props
//   if (e) {
//     e.stopPropagation()
//   }
//   if (
//     !checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_CREATE, gantt_board_id)
//   ) {
//     message.warn(NOT_HAS_PERMISION_COMFIRN)
//     return
//   }
//   // 用弹出窗口创建任务
//   // let params = {}
//   // if (parent_card_id) {
//   //     params.parent_id = parent_card_id
//   // } else if (parent_milestone_id) {
//   //     params.milestone_id = parent_milestone_id
//   // }
//   // dispatch({
//   //     type: 'gantt/updateDatas',
//   //     payload: {
//   //         panel_outline_create_card_params: params, //创建任务的参数
//   //     }
//   // })
//   // this.props.addTaskModalVisibleChange && this.props.addTaskModalVisibleChange(true)

//   // 大纲树左边创建任务
//   let { create_start_time, create_end_time } = this.state
//   this.addCardSetOutlineTree({
//     start_time: create_start_time,
//     due_time: create_end_time,
//     editing: true
//   })
// }

// // 拖拽任务将该任务设置映射到左边创建
// addCardSetOutlineTree = (params = {}) => {
//   let {
//     dispatch,
//     outline_tree,
//     itemValue: { add_id }
//   } = this.props
//   const data = {
//     ...params
//     // editing: true
//   }
//   let nodeValue = OutlineTree.getTreeNodeValueByName(
//     outline_tree,
//     'add_id',
//     add_id
//   )
//   const mapSetProto = data => {
//     Object.keys(data).map(item => {
//       nodeValue[item] = data[item]
//     })
//   }
//   if (nodeValue) {
//     mapSetProto(data)
//     dispatch({
//       type: 'gantt/handleOutLineTreeData',
//       payload: {
//         data: outline_tree
//       }
//     })
//   } else {
//     console.error('OutlineTree.getTreeNodeValue:未查询到节点')
//   }
// }

// // 设置拖拽生成任务虚线框内，节假日或者公休日的时间天数
// setDragDashedRectHolidayNo = () => {
//   let count = 0
//   const { create_start_time, create_end_time } = this.state
//   const { holiday_list = [] } = this.props
//   if (!create_start_time || !create_end_time) {
//     // return count
//     this.setState({
//       drag_holiday_count: count
//     })
//   }
//   const create_start_time_ = create_start_time / 1000
//   const create_end_time_ = create_end_time / 1000

//   const holidy_date_arr = holiday_list.filter(item => {
//     if (
//       create_start_time_ <= Number(item.timestamp) &&
//       create_end_time_ >= Number(item.timestamp) &&
//       (item.is_week || item.festival_status == '1') && //周末或者节假日
//       item.festival_status != '2' //不是补班（周末补班不算）
//     ) {
//       return item
//     }
//   })

//   this.setState({
//     drag_holiday_count: holidy_date_arr.length
//   })
// }

// clearDragInfo = nextProps => {
//   //清除掉拖拽生成任务的信息
//   const {
//     itemValue: { add_id, editing }
//   } = this.props
//   const {
//     itemValue: { editing: next_editing }
//   } = nextProps
//   if (add_id) {
//     if (editing && !next_editing) {
//       //由编辑状态转变为不是编辑状态时才重置
//       this.setState({
//         currentRectDashed: { x: 0, width: 0 }, //当前操作的矩形属性
//         drag_holiday_count: 0,
//         dasheRectShow: false,
//         create_start_time: '',
//         create_end_time: ''
//       })
//       // this.addCardSetOutlineTree({ start_time: '', due_time: '' })
//       // debugger
//     }
//   }
// }

// // /空条拖拽事件-----end
