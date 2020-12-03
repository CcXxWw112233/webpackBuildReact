import React, { Component } from 'react'
import indexStyles from './index.less'
import { connect } from 'dva'
import AvatarList from '@/components/avatarList'
import globalStyles from '@/globalset/css/globalClassName.less'
import CheckItem from '@/components/CheckItem'
import {
  task_item_height,
  task_item_margin_top,
  date_area_height,
  ganttIsOutlineView,
  ceil_width
} from './constants'
import {
  updateTaskVTwo,
  changeTaskType
} from '../../../../services/technological/task'
import { isApiResponseOk } from '../../../../utils/handleResponseData'
import { message, Dropdown, Popover, Tooltip } from 'antd'
import CardDropDetail from './components/gattFaceCardItem/CardDropDetail'
import {
  filterDueTimeSpan,
  cardIsHasUnRead,
  cardItemIsHasUnRead,
  setDateWithPositionInYearView
} from './ganttBusiness'
import { transformTimestamp, isSamDay } from '../../../../utils/util'

// 参考自http://www.jq22.com/webqd1348

// const dateAreaHeight = date_area_height //日期区域高度，作为修正
const card_width_diff = 8 //宽度误差微调
const card_left_diff = 4 //位置误差微调
@connect(mapStateToProps)
export default class GetRowTaskItem extends Component {
  constructor(props) {
    super(props)
    this.out_ref = React.createRef()
    this.is_down = false
    this.state = {
      local_width: 0,
      local_top: 0,
      local_left: 0,
      drag_type: 'position', // position/left/right 拖动位置/延展左边/延展右边
      is_moved: false, //当前mouseDown后，是否被拖动过
      parent_card: {
        //父级任务详细信息
        ele: null,
        min_position: 0,
        max_position: 0
      }
    }

    this.x = 0
    this.y = 0
    this.l = 0
    this.t = 0
    this.drag_type_map = {
      position: 'pointer',
      left: 'w-resize',
      right: 'e-resize'
    }
  }

  componentDidMount() {
    this.initSetPosition(this.props)
    this.handleEffectParentCard('getParentCard') //大纲模式下获取父级任务实例
  }

  componentWillReceiveProps(nextProps) {
    this.handleEffectParentCard('getParentCard') //大纲模式下获取父级任务实例
  }

  // 设置位置
  initSetPosition = props => {
    const { itemValue = {} } = props
    const { left, top, width } = itemValue

    this.setState({
      local_top: top,
      local_left: left,
      local_width: width, //实时变化
      local_width_flag: width, //作为local_width实时变化在拖动松开后的标志宽度
      local_width_origin: width, //记载原始宽度，不变，除非传递进来的改变
      local_left_origin: left
    })
  }

  // 标签的颜色
  setLableColor = (label_data, is_realize) => {
    let bgColor = ''
    let b = ''
    if (label_data && label_data.length) {
      const color_arr = label_data.map(item => {
        return `rgb(${item.label_color}${is_realize == '1' ? ',0.5' : ''})`
      })
      const color_arr_length = color_arr.length
      const color_percent_arr = color_arr.map((item, index) => {
        return ((index + 1) / color_arr_length) * 100
      })
      bgColor = color_arr.reduce((total, color_item, current_index) => {
        return `${total},  ${color_item} ${color_percent_arr[
          current_index - 1
        ] || 0}%, ${color_item} ${color_percent_arr[current_index]}%`
      }, '')

      b = `linear-gradient(to right${bgColor})`
    } else {
      b = '#ffffff'
    }
    return b
  }

  // 任务弹窗
  setSpecilTaskExample = data => {
    const { task_is_dragging, ganttPanelDashedDrag } = this.props
    const { is_moved } = this.state
    // console.log('这是什么', '松开回调', task_is_dragging, is_moved, ganttPanelDashedDrag)
    if (
      is_moved ||
      ganttPanelDashedDrag //这是表示创建中
    ) {
      this.props.setTaskIsDragging && this.props.setTaskIsDragging(false, 1) //当拖动完成后，释放创建任务的锁，让可以正常创建任务
      return
    }
    const { setSpecilTaskExample } = this.props
    setSpecilTaskExample(data)
    // 恢复最初状态
    setTimeout(() => {
      this.setState({
        is_moved: false
      })
      this.props.setTaskIsDragging && this.props.setTaskIsDragging(false, 2) //当拖动完成后，释放创建任务的锁，让可以正常创建任务
    }, 700)

    // 设置已读
    const { dispatch, im_all_latest_unread_messages } = this.props
    const { id } = data
    if (
      cardItemIsHasUnRead({ relaDataId: id, im_all_latest_unread_messages })
    ) {
      dispatch({
        type: 'imCooperation/imUnReadMessageItemClear',
        payload: {
          relaDataId: id
        }
      })
    }
  }

  onMouseDown = e => {
    e.stopPropagation()
    e.preventDefault && e.preventDefault() //解决拖拽卡顿？(尚未明确)
    const target = this.out_ref.current
    setTimeout(() => {
      this.is_down = true
    }, 50)
    const { drag_type, local_top } = this.state
    if ('position' == drag_type) {
      //在中间
      target.style.cursor = 'move'
    }
    this.x = e.clientX || e.changedTouches[0].clientX
    this.y = e.clientY || e.changedTouches[0].clientY
    //获取左部和顶部的偏移量
    this.l = target.offsetLeft
    this.t = target.offsetTop

    const { getCurrentGroup } = this.props
    getCurrentGroup({ top: local_top }) //设置当前操作的list_id

    window.onmousemove = this.onMouseMove.bind(this)
    window.onmouseup = this.onMouseUp.bind(this)

    document.addEventListener('ontouchmove', this.onTouchMove, false)
    document.addEventListener('ontouchend', this.onTouchEnd, false)
    setTimeout(() => {
      this.props.setTaskIsDragging && this.props.setTaskIsDragging(true, 3) //当拖动时，有可能会捕获到创建任务的动作，阻断
    }, 300)
    // target.onmouseleave = this.onMouseUp.bind(this);
  }

  onMouseMove = e => {
    e.stopPropagation()
    this.handleMouseMove(e) //设置flag依赖
    if (this.is_down == false) {
      return
    }
    this.setState({
      is_moved: true
    })
    const { drag_type } = this.state
    if ('position' == drag_type) {
      this.changePosition(e)
    } else if ('left' == drag_type) {
      // this.extentionLeft(e)
    } else if ('right' == drag_type) {
      this.extentionRight(e)
    }
  }

  onTouchStart = e => {
    this.setState(
      {
        drag_type: 'position'
      },
      () => {}
    )
    this.onMouseDown(e)
    // this.touchCanScroll('hidden')
  }

  onTouchMove = e => {
    e.preventDefault && e.preventDefault()
    e.stopPropagation && e.stopPropagation()
    // console.log('ssssapreventDefault', e.preventDefault)
    this.onMouseMove(e)
  }

  onTouchEnd = e => {
    this.onMouseUp(e)
    // this.touchCanScroll('scroll')
  }

  onMouseEnter = () => {
    //在鼠标hover到任务条上，非创建任务时，将虚线框隐藏
    const { ganttPanelDashedDrag } = this.props
    if (!ganttPanelDashedDrag) {
      this.props.setDasheRectShow && this.props.setDasheRectShow(false)
    }
  }
  // 触屏是否可以滚动
  touchCanScroll = style_attr => {
    const ele = document.getElementById('gantt_card_out_middle')
    if (ele) {
      ele.style.overflow = style_attr
    }
  }
  // 拖动到边界时，设置滚动条的位置
  // dragToBoundaryExpand = ({ delay = 300, position = 200 }) => {
  //     const that = this
  //     const target = document.getElementById('gantt_card_out_middle')
  //     setTimeout(function () {
  //         if (target.scrollTo) {
  //             target.scrollTo(position, 0)
  //         } else {
  //             target.scrollLeft = position
  //         }
  //     }, delay)
  // }

  // 延展左边
  extentionLeft = e => {
    const nx = e.clientX || e.changedTouches[0].clientX
    //计算移动后的左偏移量和顶部的偏移量
    const nl = nx - (this.x - this.l)
    const nw = this.x - nx //宽度
    this.setState({
      local_left: nl,
      local_width: nw < 44 ? 44 : nw
    })
  }

  // 延展右边
  extentionRight = e => {
    const nx = e.clientX || e.changedTouches[0].clientX
    const { local_width_flag } = this.state
    const { ceilWidth } = this.props
    //计算移动后的左偏移量和顶部的偏移量
    const nw = nx - this.x + local_width_flag //宽度
    // console.log('sssss', {
    //     nx,
    //     x: this.x,
    //     pageX: e.pageX
    // })
    const local_width = Math.max(nw, ceilWidth) //nw < ceilWidth ? ceilWidth : nw
    this.setState(
      {
        local_width
      },
      () => {
        this.handleEffectParentCard('handleParentCard')
      }
    )
  }

  // 整条拖动
  changePosition = e => {
    // const target_0 = document.getElementById('gantt_card_out')
    // const target_1 = document.getElementById('gantt_card_out_middle')
    // const target = this.out_ref.current//event.target || event.srcElement;
    // // 取得鼠标位置
    // const x = e.pageX - target_0.offsetLeft + target_1.scrollLeft - gantt_head_width - gantt_panel_left_diff
    // const y = e.pageY - target.offsetTop + target_1.scrollTop - dateAreaHeight

    //获取x和y
    const nx = e.clientX || e.changedTouches[0].clientX
    const ny = e.clientY || e.changedTouches[0].clientY
    //计算移动后的左偏移量和顶部的偏移量
    const nl = nx - (this.x - this.l)
    const nt = ny - (this.y - this.t)
    this.setState(
      {
        // local_top: nt,
        local_left: nl
      },
      () => {
        this.handleEffectParentCard('handleParentCard')
      }
    )

    // 在分组和特定高度下才能设置高度
    const {
      gantt_board_id,
      group_list_area_section_height = [],
      ceiHeight,
      group_view_type
    } = this.props
    const item_height = (ceiHeight + task_item_margin_top) / 2
    if (
      gantt_board_id != '0' &&
      group_view_type == '1' &&
      nt <
        group_list_area_section_height[
          group_list_area_section_height.length - 1
        ] -
          item_height &&
      !ganttIsOutlineView({ group_view_type })
    ) {
      //只有在分组的情况下才能拖上下
      this.setState({
        local_top: nt
      })
    }
  }

  // 针对于在某一条任务上滑动时，判别鼠标再不同位置的处理，(ui箭头, 事件处理等)
  handleMouseMove = event => {
    const { ganttPanelDashedDrag } = this.props
    if (this.is_down || ganttPanelDashedDrag) {
      //准备拖动时不再处理, 拖拽生成一条任务时也不再处理
      return
    }
    const { currentTarget } = event
    const clientX = event.clientX || event.changedTouches[0].clientX
    const { clientWidth } = currentTarget
    const oDiv = currentTarget
    const target_1 = document.getElementById('gantt_card_out_middle')
    const offsetLeft = this.getX(oDiv)
    const rela_left = clientX - offsetLeft - 2 + target_1.scrollLeft //鼠标在该任务内的相对位置
    if (clientWidth - rela_left <= 6) {
      //滑动到右边
      this.setTargetDragTypeCursor('right')
    }
    // else if (rela_left <= 6) { //滑动到左边
    //     this.setTargetDragTypeCursor('left')
    // }
    else {
      //中间
      this.setTargetDragTypeCursor('position')
    }
  }

  // 设置鼠标形状和拖拽类型
  setTargetDragTypeCursor = cursorTypeKey => {
    this.setState({
      drag_type: cursorTypeKey
    })
    const cursorType = this.drag_type_map[cursorTypeKey]
    const target = this.out_ref.current
    if (target) {
      target.style.cursor = cursorType
    }
  }
  getX = obj => {
    var parObj = obj
    var left = obj.offsetLeft
    while ((parObj = parObj.offsetParent)) {
      left += parObj.offsetLeft
    }
    return left
  }

  getY = obj => {
    var parObj = obj
    var top = obj.offsetTop
    while ((parObj = parObj.offsetParent)) {
      top += parObj.offsetTop
    }
    return top
  }

  // 拖拽完成后松开鼠标
  onMouseUp = e => {
    e.stopPropagation()
    this.x = 0
    this.y = 0
    this.l = 0
    this.t = 0
    if (this.is_down) {
      this.overDragCompleteHandle() //松开拖拽完成，继续操作
    }
    this.is_down = false
    this.setTargetDragTypeCursor('pointer')
    this.setState({
      local_width_flag: this.state.local_width
    })
    window.onmousemove = null
    window.onmouseup = null

    document.removeEventListener('ontouchmove', this.onTouchMove, false)
    document.removeEventListener('ontouchend', this.onTouchEnd, false)
    setTimeout(() => {
      this.setState({
        is_moved: false
      })
      this.props.setTaskIsDragging && this.props.setTaskIsDragging(false, 4) //当拖动完成后，释放创建任务的锁，让可以正常创建任务
    }, 300)
  }

  // 拖拽完成后的事件处理-----start--------
  overDragCompleteHandle = () => {
    const { drag_type, local_top } = this.state
    if ('right' == drag_type) {
      this.overDragCompleteHandleRight()
    } else if ('position' == drag_type) {
      this.overDragCompleteHandlePositon()
    } else {
    }
  }
  overDragCompleteHandleRight = () => {
    //右侧增减时间
    const {
      itemValue: { id, end_time, start_time, board_id, is_has_start_time },
      group_view_type,
      gantt_view_mode,
      gantt_board_id
    } = this.props
    const { local_left, local_width, local_width_origin } = this.state
    const { date_arr_one_level, ceilWidth } = this.props
    const updateData = {}
    const end_time_position = local_left + local_width
    let start_date = {}
    let end_date = {}
    if (gantt_view_mode == 'month') {
      const end_time_index = Math.floor((end_time_position - 6) / ceilWidth)
      const start_time_index = Math.floor(local_left / ceilWidth)
      start_date = date_arr_one_level[start_time_index] || {}
      end_date = date_arr_one_level[end_time_index]
    } else if (gantt_view_mode == 'year') {
      start_date = setDateWithPositionInYearView({
        _position: local_left,
        date_arr_one_level,
        ceilWidth,
        width: local_width,
        x: local_left,
        flag: 1
      })
      end_date = setDateWithPositionInYearView({
        _position: end_time_position,
        date_arr_one_level,
        ceilWidth,
        width: local_width,
        x: local_left,
        flag: 2
      })
    } else {
    }
    const start_time_timestamp = parseInt(start_date.timestamp)
    const end_time_timestamp = parseInt(end_date.timestampEnd)
    updateData.start_time = start_time //!is_has_start_time ? '' : parseInt(start_time_timestamp)
    updateData.due_time = parseInt(end_time_timestamp)
    // console.log('date_string', updateData)

    if (isSamDay(end_time, end_time_timestamp)) {
      //向右拖动时，如果是在同一天，则不去更新
      const time_span_ =
        Math.floor((end_time - start_time) / (24 * 3600 * 1000)) + 1
      const time_width = time_span_ * ceilWidth
      this.setState(
        {
          local_width: time_width,
          local_width_flag: time_width
        },
        () => {
          this.excuteHandleEffectHandleParentCard([
            // 'handleParentCard',
            // 'updateParentCard'
            { action: 'updateParentCard', payload: { ...updateData } }
          ])
        }
      )
      return
    }
    updateTaskVTwo(
      {
        card_id: id,
        due_time: end_time_timestamp,
        board_id: board_id || gantt_board_id
      },
      { isNotLoading: false }
    )
      .then(res => {
        if (isApiResponseOk(res)) {
          if (ganttIsOutlineView({ group_view_type })) {
            this.props.changeOutLineTreeNodeProto(id, updateData)
            setTimeout(() => {
              this.excuteHandleEffectHandleParentCard([
                // 'getParentCard',
                // 'handleParentCard',
                {
                  action: 'updateParentCard',
                  payload: {
                    start_time: res.data.start_time,
                    due_time: res.data.due_time,
                    success: '1'
                  }
                }
              ])
            }, 200)
          } else {
            this.handleHasScheduleCard({
              card_id: id,
              updateData
            })
          }
        } else {
          this.setState(
            {
              local_width: local_width_origin,
              local_width_flag: local_width_origin
            },
            () => {
              this.excuteHandleEffectHandleParentCard([
                // 'handleParentCard',
                // 'updateParentCard'
                { action: 'updateParentCard', payload: { ...updateData } }
              ])
            }
          )
          message.error(res.message)
        }
      })
      .catch(err => {
        message.error('更新失败')
      })
  }
  overDragCompleteHandlePositon = () => {
    const {
      gantt_board_id,
      current_list_group_id,
      group_view_type
    } = this.props

    if (
      gantt_board_id == '0' ||
      current_list_group_id == this.getDragAroundListId() ||
      ganttIsOutlineView({ group_view_type })
    ) {
      // 不在分组里面 ，获取分组拖拽时只在当前分组拖拽
      this.overDragCompleteHandlePositonAbout()
    } else {
      this.overDragCompleteHandlePositonAround()
    }
  }
  // 获取分组拖拽后分组id,
  getDragAroundListId = () => {
    const { group_view_type } = this.props
    if (ganttIsOutlineView({ group_view_type })) {
      return 0
    }
    const { local_top } = this.state
    const {
      group_list_area_section_height = [],
      ceiHeight,
      list_group = []
    } = this.props
    const item_height = (ceiHeight + task_item_margin_top) / 2
    const gold_area_position = local_top + item_height
    const length = group_list_area_section_height.length
    let list_group_index = 0
    for (let i = 0; i < length; i++) {
      if (gold_area_position < group_list_area_section_height[i]) {
        list_group_index = i
        break
      }
    }
    // console.log('ssss', local_top, gold_area_position)
    return list_group[list_group_index].list_id
  }
  // 不在项目分组内，左右移动
  overDragCompleteHandlePositonAbout = () => {
    const {
      itemValue: { id, top, start_time, board_id, left },
      group_view_type,
      gantt_view_mode,
      gantt_board_id
    } = this.props
    const { local_left, local_width, local_width_origin } = this.state
    const { date_arr_one_level, ceilWidth } = this.props
    const updateData = {}
    const date_span = local_width / ceilWidth
    const start_time_index = Math.floor(local_left / ceilWidth)
    let start_date = {}
    if (gantt_view_mode == 'month') {
      start_date = date_arr_one_level[start_time_index] || {}
    } else if (gantt_view_mode == 'year') {
      start_date = setDateWithPositionInYearView({
        _position: local_left,
        date_arr_one_level,
        ceilWidth,
        width: local_width,
        x: local_left
      })
    } else {
    }
    const start_time_timestamp = parseInt(start_date.timestamp)
    // console.log('ssssssssssaaaa', 0, start_date.timestamp)
    if (!start_time_timestamp) return
    //截至时间为起始时间 加上间隔天数的毫秒数, - 60 * 1000为一分钟的毫秒数，意为截至日期的23:59
    const end_time_timestamp = parseInt(
      start_time_timestamp + 24 * 60 * 60 * 1000 * date_span - 60 * 1000
    )

    updateData.start_time = parseInt(start_time_timestamp)
    updateData.due_time = parseInt(end_time_timestamp)
    // console.log('ssssssssssaaaa', 1)
    if (isSamDay(start_time, start_time_timestamp)) {
      //向右拖动时，如果是在同一天，则不去更新
      this.setState(
        {
          local_left: left,
          local_top: top
        },
        () => {
          this.excuteHandleEffectHandleParentCard([
            // 'handleParentCard',
            // 'updateParentCard'
            { action: 'updateParentCard', payload: { ...updateData } }
          ])
        }
      )
      return
    }
    // console.log('ssssssssssaaaa', 2)
    updateTaskVTwo(
      {
        card_id: id,
        due_time: end_time_timestamp,
        start_time: start_time_timestamp,
        board_id: board_id || gantt_board_id
      },
      { isNotLoading: false }
    )
      .then(res => {
        if (isApiResponseOk(res)) {
          if (ganttIsOutlineView({ group_view_type })) {
            this.props.changeOutLineTreeNodeProto(id, updateData)
            setTimeout(() => {
              this.excuteHandleEffectHandleParentCard([
                // 'getParentCard',
                // 'handleParentCard',
                {
                  action: 'updateParentCard',
                  payload: {
                    start_time: res.data.start_time,
                    due_time: res.data.due_time,
                    success: '1'
                  }
                }
              ])
            }, 200)
          } else {
            this.handleHasScheduleCard({
              card_id: id,
              updateData
            })
          }
        } else {
          this.setState(
            {
              local_left: left
            },
            () => {
              this.excuteHandleEffectHandleParentCard([
                // 'handleParentCard',
                // 'updateParentCard'
                { action: 'updateParentCard', payload: { ...updateData } }
              ])
            }
          )
          message.error(res.message)
        }
      })
      .catch(err => {
        message.error('更新失败')
      })
  }
  // 在项目分组内，上下左右移动
  overDragCompleteHandlePositonAround = (data = {}) => {
    const {
      itemValue: { id, end_time, start_time, board_id, left, top },
      gantt_board_id,
      gantt_view_mode
    } = this.props
    const { local_left, local_width, local_width_origin } = this.state
    const { date_arr_one_level, ceilWidth } = this.props
    const updateData = {}
    const date_span = local_width / ceilWidth
    // const start_date = date_arr_one_level[start_time_index] || {}

    let start_date = {}
    if (gantt_view_mode == 'month') {
      const start_time_index = Math.floor(local_left / ceilWidth)
      start_date = date_arr_one_level[start_time_index] || {}
    } else if (gantt_view_mode == 'year') {
      start_date = setDateWithPositionInYearView({
        _position: local_left,
        date_arr_one_level,
        ceilWidth,
        width: local_width,
        x: local_left
      })
    } else {
    }
    const start_time_timestamp = start_date.timestamp
    if (!start_time_timestamp) return
    //截至时间为起始时间 加上间隔天数的毫秒数, - 60 * 1000为一分钟的毫秒数，意为截至日期的23:59
    const end_time_timestamp =
      start_time_timestamp + 24 * 60 * 60 * 1000 * date_span - 60 * 1000
    updateData.start_time = start_time_timestamp
    updateData.due_time = end_time_timestamp

    const params_list_id = this.getDragAroundListId()
    const params = {
      card_id: id,
      due_time: end_time_timestamp,
      start_time: start_time_timestamp,
      board_id,
      list_id: params_list_id
    }
    if (params_list_id == '0') {
      delete params.list_id
    }
    changeTaskType({ ...params }, { isNotLoading: false })
      .then(res => {
        if (isApiResponseOk(res)) {
          this.changeCardBelongGroup({
            card_id: id,
            new_list_id: params_list_id,
            updateData
          })
        } else {
          this.setState({
            local_left: left,
            local_top: top
          })
          message.error(res.message)
        }
      })
      .catch(err => {
        this.setState({
          local_left: left,
          local_top: top
        })
        message.error('更新失败')
        // console.log('ssss', err)
      })
  }
  // 拖拽完成后的事件处理------end---------

  // 改变任务分组
  changeCardBelongGroup = ({ new_list_id, card_id, updateData = {} }) => {
    // 该任务在新旧两个分组之间交替
    const {
      list_group = [],
      list_id,
      dispatch,
      current_list_group_id
    } = this.props
    const list_group_new = [...list_group]
    const group_index = list_group_new.findIndex(
      item => item.lane_id == list_id
    ) //老分组的分组位置
    const group_index_cards_index = list_group_new[
      group_index
    ].lane_data.cards.findIndex(item => item.id == card_id) //老分组的该分组的该任务的位置
    let group_index_cards_item =
      list_group_new[group_index].lane_data.cards[group_index_cards_index] //当前这条
    group_index_cards_item = { ...group_index_cards_item, ...updateData } //更新这条

    const group_index_gold_index = list_group_new.findIndex(
      item => item.lane_id == new_list_id
    ) //新分组的分组位置
    list_group_new[group_index_gold_index].lane_data.cards.push(
      group_index_cards_item
    ) //添加进新分组
    list_group_new[group_index].lane_data.cards.splice(
      group_index_cards_index,
      1
    ) //从老分组移除

    dispatch({
      type: 'gantt/handleListGroup',
      payload: {
        data: list_group_new,
        not_set_scroll_top: true
      }
    })
  }
  // 修改有排期的任务
  handleHasScheduleCard = ({ card_id, updateData = {} }) => {
    const { list_group = [], list_id, dispatch } = this.props
    const list_group_new = [...list_group]
    const group_index = list_group_new.findIndex(
      item => item.lane_id == list_id
    )
    const group_index_cards_index = list_group_new[
      group_index
    ].lane_data.cards.findIndex(item => item.id == card_id)
    list_group_new[group_index].lane_data.cards[group_index_cards_index] = {
      ...list_group_new[group_index].lane_data.cards[group_index_cards_index],
      ...updateData
    }

    if (
      list_group_new[group_index].lane_data.cards[group_index_cards_index]
        .type == '1'
    ) {
      //如果是会议，会议的完成状态由截至时间控制
      let is_realize = '0'
      if (
        transformTimestamp(
          list_group_new[group_index].lane_data.cards[group_index_cards_index]
            .due_time
        ) > new Date().getTime()
      ) {
        is_realize = '0'
      } else {
        is_realize = '1'
      }
      list_group_new[group_index].lane_data.cards[
        group_index_cards_index
      ].is_realize = is_realize
    }

    dispatch({
      type: 'gantt/handleListGroup',
      payload: {
        data: list_group_new,
        not_set_scroll_top: true
      }
    })
  }

  // 大纲视图下，如果该条任务是子任务，拖动择会影响父任务位置和长度
  handleEffectParentCard = (func_name, data) => {
    const {
      group_view_type,
      itemValue: { parent_card_id },
      gantt_view_mode
    } = this.props
    if (!ganttIsOutlineView({ group_view_type })) return
    if (!parent_card_id) return
    const is_year_view = gantt_view_mode == 'year'
    const _self = this
    const obj = {
      getParentCard: () => {
        //获取父任务的详细信息
        const parent_card_ele = document.getElementById(parent_card_id)
        return new Promise((resolve, reject) => {
          return obj.getSameLevelNode().then(res => {
            // const { min_position, max_position, second_min_position, second_max_position, max_time, min_time, time_span, left } = res
            resolve(res)
            _self.setState(
              {
                parent_card: {
                  ele: parent_card_ele,
                  ...res
                  // min_position,
                  // max_position,
                  // second_min_position,
                  // second_max_position,
                  // max_time,
                  // min_time,
                  // time_span,
                  // left
                }
              },
              () => {
                return resolve(res)
              }
            )
          })
        })
      },
      getSameLevelNode: () => {
        //获取默认最小和最大点
        return new Promise((resolve, reject) => {
          const { outline_tree_round = [] } = _self.props
          const { time_span, left } = outline_tree_round.find(
            item => item.id == parent_card_id
          )
          const same_leve_node = outline_tree_round.filter(
            item => item.parent_card_id == parent_card_id
          )
          const left_arr = same_leve_node
            .map(item => item.left)
            .filter(item => item)
            .sort()
          const width_arr = same_leve_node
            .map(item => item.left + item.width)
            .filter(item => item)
            .sort()
          const due_time_arr = same_leve_node
            .map(item => item.due_time)
            .filter(item => item)
          const start_time_arr = same_leve_node
            .map(item => item.start_time)
            .filter(item => item)

          const min_position = Math.min.apply(null, left_arr) //最左边的位置
          const max_position = Math.max.apply(null, width_arr)
          const left_arr_length = left_arr.length
          const width_arr_length = width_arr.length
          const second_min_position = left_arr[1]
          const second_max_position = width_arr[width_arr_length - 2]
          const max_time = Math.max.apply(null, due_time_arr)
          const min_time = Math.min.apply(null, start_time_arr)
          const o = {
            min_position,
            max_position,
            second_min_position,
            second_max_position,
            max_time,
            min_time,
            time_span,
            left
          }
          resolve(o)
        })
      },
      handleParentCard: () => {
        //移动过程中改变父任务位置和长度
        return new Promise((resolve, reject) => {
          const {
            parent_card: {
              ele,
              min_position,
              max_position,
              second_min_position,
              second_max_position
            },
            local_width,
            local_left,
            local_width_origin,
            local_left_origin
          } = _self.state
          const local_right = local_left + local_width
          const local_right_origin = local_left_origin + local_width_origin
          if (ele) {
            let min_left
            let max_right
            // 设置最左
            if (local_left_origin <= min_position) {
              min_left = Math.min(local_left, second_min_position || local_left) // 所拖动是最左边的任务条， left取当前任务条的最左位置和所有的第二靠左比
            } else {
              min_left = Math.min(local_left, min_position || local_left) // 所拖动不是最左边的任务条， left取当前任务条的最左位置和所有的第一靠左比较
            }
            // 设置最右位置
            if (local_right_origin >= max_position) {
              max_right = Math.max(
                local_right,
                second_max_position || local_right
              ) // 所拖动是最右边的任务条， right取当前任务条的最左位置 和 所有的第二靠右比
            } else {
              max_right = Math.max(local_right, max_position || local_right) // 所拖动不是最右边的任务条， right取当前任务条的最右位置 和 所有的第一靠右比较
            }
            ele.style.left = `${min_left +
              (is_year_view ? 0 : card_left_diff)}px`
            ele.style.width = `${max_right -
              min_left -
              (is_year_view ? 0 : card_width_diff)}px`
            return resolve()
            // _self.setState({
            //     parent_card_max_right: max_right,
            //     parent_card_min_left: min_left
            // }, () => {
            //     return resolve()
            // })
          } else {
            reject()
          }
        })
      },
      updateParentCard: data => {
        //方法废弃。由子任务更新后后台返回区间，父任务更新由返回的时间确认
        // console.log('更新的data', data)
        if (data.success == '1') {
          console.log('要更新的父级0', data)
          this.props.changeOutLineTreeNodeProto(parent_card_id, {
            due_time: data.due_time,
            start_time: data.start_time
          })
          return
        }
        const {
          parent_card: { max_time, min_time, ele, time_span, left }
        } = this.state
        const { ceilWidth } = this.props
        const due_time = Math.max(
          transformTimestamp(data.due_time),
          transformTimestamp(max_time)
        )
        const start_time = Math.min(
          transformTimestamp(data.start_time),
          transformTimestamp(min_time)
        )
        ele.style.width = `${time_span * ceilWidth -
          (is_year_view ? 0 : card_width_diff)}px`
        ele.style.left = `${left + (is_year_view ? 0 : card_left_diff)}px`

        console.log('要更新的父级1', { start_time, due_time })
        this.props.changeOutLineTreeNodeProto(parent_card_id, {
          start_time,
          due_time
        })
        // debugger
        // const { date_arr_one_level, ceilWidth, itemValue: { board_id }, gantt_view_mode } = _self.props
        // const { parent_card_min_left, parent_card_max_right, drag_type } = _self.state

        // const width = parseInt((parent_card_max_right - parent_card_min_left) / ceilWidth) * ceilWidth - ((drag_type != 'position') ? 0 : card_width_diff) //实际要计算的宽度
        // let start_time = ''
        // let due_time = ''
        // if (is_year_view) {
        //     start_time = (setDateWithPositionInYearView({ _position: parent_card_min_left, date_arr_one_level, ceilWidth, width, x: parent_card_min_left, flag: 1 }) || {}).timestamp
        //     due_time = (setDateWithPositionInYearView({ _position: parent_card_min_left + width, date_arr_one_level, ceilWidth, width, x: parent_card_min_left, flag: 2 }) || {}).timestampEnd
        // } else {
        //     start_time = (date_arr_one_level[parseInt(parent_card_min_left / ceilWidth)] || {}).timestamp
        //     due_time = (date_arr_one_level[parseInt((parent_card_min_left + width) / ceilWidth)] || {}).timestampEnd
        // }
        // // setTimeout(() => {
        // this.props.changeOutLineTreeNodeProto(parent_card_id, { due_time, start_time })
        // // }, 300)
      }
    }
    return obj[func_name].call(this, data)
  }

  excuteHandleEffectHandleParentCard = async (actions = []) => {
    for (let val of actions) {
      if (typeof val == 'object') {
        await this.handleEffectParentCard(val.action, val.payload)
      } else {
        await this.handleEffectParentCard(val)
      }
    }
  }

  // 获取大纲视图父任务的截止和开始位置的三角形边框颜色
  setTriangleTreeColor = (label_data = [], index) => {
    let label_color = '#ffffff'
    const length = label_data.length
    if (index == 'start') {
      label_color = label_data[0]
        ? `rgb(${label_data[0].label_color})`
        : '#ffffff'
    } else if (index == 'end') {
      label_color = label_data[length - 1]
        ? `rgb(${label_data[length - 1].label_color})`
        : '#ffffff'
    } else {
    }
    // const a = ['11', '22', { a: 1, b: { a: 1 } }]
    // for (let val of a) {
    //     console.log('更新的。。。', val)
    // }
    return label_color
  }

  // 是否可以拖动
  couldChangeCard = () => {
    const {
      itemValue: { child_card_status = {} },
      group_view_type
    } = this.props
    const { has_child, max_due_time, min_start_time } = child_card_status
    // 大纲视图下的任务，存在子任务并且子任务有时间
    if (
      ganttIsOutlineView({ group_view_type }) &&
      has_child == '1' &&
      (!!max_due_time || min_start_time)
    ) {
      return false
    }
    return true
  }
  handleObj = () => {
    const { itemValue = {} } = this.props
    const { top, id, board_id, parent_card_id } = itemValue
    return {
      // 拖拽
      onMouseDown: e => {
        if (!this.couldChangeCard()) return
        this.onMouseDown(e)
      },
      onMouseMove: e => {
        if (!this.couldChangeCard()) return
        this.onMouseMove(e)
      },
      onMouseUp: () => {
        this.setSpecilTaskExample({ id: parent_card_id || id, top, board_id })
      }, //查看子任务是查看父任务

      onTouchStart: e => {
        if (!this.couldChangeCard()) return
        this.onTouchStart(e)
      },
      onTouchMove: e => {
        if (!this.couldChangeCard()) return
        this.onTouchMove(e)
      },
      onTouchEnd: e => {
        this.onTouchEnd(e)
      }, //查看子任务是查看父任务
      onMouseEnter: () => {
        this.onMouseEnter()
      }
    }
  }
  render() {
    const {
      itemValue = {},
      im_all_latest_unread_messages,
      gantt_view_mode,
      group_view_type
    } = this.props
    const {
      left,
      top,
      width,
      height,
      name,
      id,
      board_id,
      is_realize,
      type,
      executors = [],
      label_data = [],
      is_has_start_time,
      is_has_end_time,
      start_time,
      due_time,
      is_privilege,
      parent_card_id,
      time_span
    } = itemValue
    const { local_left, local_top, local_width } = this.state
    const { is_overdue, due_description } = filterDueTimeSpan({
      start_time,
      due_time,
      is_has_end_time,
      is_has_start_time
    })
    return (
      // <Popover
      //     getPopupContainer={() => document.getElementById('gantt_card_out_middle')}
      //     placement="bottom" content={<CardDropDetail list={[{ ...itemValue }]} />} key={id}>
      <div
        className={`${indexStyles.specific_example} ${!is_has_start_time &&
          indexStyles.specific_example_no_start_time} ${!is_has_end_time &&
          indexStyles.specific_example_no_due_time}`}
        data-targetclassname="specific_example"
        id={id} //大纲视图需要获取该id作为父级id来实现子任务拖拽影响父任务位置
        // draggable
        ref={this.out_ref}
        // style={{
        //     touchAction: 'none',
        //     zIndex: this.is_down ? 2 : 1,
        //     left: local_left, top: local_top,
        //     width: (local_width || 6) - 2, height: (height || task_item_height),
        //     marginTop: task_item_margin_top,
        //     background: this.setLableColor(label_data, is_realize), // 'linear-gradient(to right,rgba(250,84,28, 1) 25%,rgba(90,90,90, 1) 25%,rgba(160,217,17, 1) 25%,rgba(250,140,22, 1) 25%)',//'linear-gradient(to right, #f00 20%, #00f 20%, #00f 40%, #0f0 40%, #0f0 100%)',
        // }}
        style={{
          touchAction: 'none',
          zIndex: this.is_down ? 2 : 1,
          left: local_left + (gantt_view_mode == 'year' ? 0 : card_left_diff),
          top: local_top,
          width:
            (local_width || 6) -
            (gantt_view_mode == 'year' ? 0 : card_width_diff),
          height: height || task_item_height,
          marginTop: task_item_margin_top,
          background: this.setLableColor(label_data, is_realize) // 'linear-gradient(to right,rgba(250,84,28, 1) 25%,rgba(90,90,90, 1) 25%,rgba(160,217,17, 1) 25%,rgba(250,140,22, 1) 25%)',//'linear-gradient(to right, #f00 20%, #00f 20%, #00f 40%, #0f0 40%, #0f0 100%)',
        }}
        {...this.handleObj()}
        // // 拖拽
        // onMouseDown={(e) => {
        //     // console.log('这是什么', '鼠标按下')
        //     this.onMouseDown(e)
        // }}
        // onMouseMove={(e) => {
        //     // console.log('这是什么', '鼠标移动')
        //     this.onMouseMove(e)
        // }}
        // onMouseUp={() => {
        //     // console.log('这是什么', '鼠标松开')
        //     this.setSpecilTaskExample({ id: parent_card_id || id, top, board_id })
        // }} //查看子任务是查看父任务

        // onTouchStart={(e) => {
        //     // console.log('这是什么', '手指按下')
        //     this.onTouchStart(e)
        // }}
        // onTouchMove={(e) => {
        //     // console.log('这是什么', '手指移动')
        //     this.onTouchMove(e)
        // }}
        // onTouchEnd={(e) => {
        //     // console.log('这是什么', '手指松开')
        //     this.onTouchEnd(e)
        // }} //查看子任务是查看父任务
        // onMouseEnter={() => {
        //     this.onMouseEnter()
        // }}
        // 不拖拽
        // onMouseMove={(e) => e.stopPropagation()}
        // onClick={() => this.setSpecilTaskExample({ id, top, board_id })}
      >
        <div
          data-targetclassname="specific_example"
          className={`${
            indexStyles.specific_example_content
          } ${!is_has_start_time &&
            indexStyles.specific_example_no_start_time} ${!is_has_end_time &&
            indexStyles.specific_example_no_due_time}`}
          // onMouseDown={(e) => e.stopPropagation()}
          onMouseMove={e => e.preventDefault()}
          style={{
            opacity: 1,
            padding: gantt_view_mode == 'year' && time_span < 4 ? '0' : '0 8px'
          }}
        >
          <div
            data-targetclassname="specific_example"
            className={`${indexStyles.card_item_status}`}
            //  onMouseDown={(e) => e.stopPropagation()}
            onMouseMove={e => e.preventDefault()}
          >
            <CheckItem
              is_realize={is_realize}
              card_type={type}
              styles={{ color: is_realize == '1' ? 'rgba(0,0,0,.25)' : '' }}
            />
          </div>
          <div
            data-targetclassname="specific_example"
            className={`${indexStyles.card_item_name} ${globalStyles.global_ellipsis}`}
            // onMouseDown={(e) => e.stopPropagation()}
            onMouseMove={e => e.preventDefault()}
            style={{
              display: 'flex',
              color: is_realize == '1' ? 'rgba(0,0,0,.25)' : ''
            }}
          >
            {name}
            {is_privilege == '1' && (
              <Tooltip title="已开启访问控制" placement="top">
                <span
                  className={`${globalStyles.authTheme}`}
                  style={{ color: 'rgba(0,0,0,0.50)', marginLeft: '5px' }}
                  data-targetclassname="specific_example"
                >
                  &#xe7ca;
                </span>
              </Tooltip>
            )}
            <span
              className={indexStyles.due_time_description}
              data-targetclassname="specific_example"
            >
              {is_overdue && is_realize != '1' && due_description}
            </span>
          </div>
          <div
            data-targetclassname="specific_example"
            // onMouseDown={(e) => e.stopPropagation()}
            onMouseMove={e => e.preventDefault()}
            style={{
              opacity: is_realize == '1' ? 0.5 : 1
            }}
          >
            <AvatarList
              users={executors}
              size={'small'}
              targetclassname={'specific_example'}
            />
          </div>
        </div>
        {/* 存在未读 */}
        {cardItemIsHasUnRead({
          relaDataId: id,
          im_all_latest_unread_messages
        }) && (
          <div
            className={indexStyles.has_unread_news}
            data-targetclassname="specific_example"
            style={{}}
          ></div>
        )}
        {!this.is_down && (
          <Popover
            getPopupContainer={() =>
              document.getElementById('gantt_card_out_middle')
            }
            placement="bottom"
            content={<CardDropDetail list={[{ ...itemValue }]} />}
            key={id}
          >
            <div
              style={{ position: 'absolute', width: '100%', height: '100%' }}
            ></div>
          </Popover>
        )}
        {ganttIsOutlineView({ group_view_type }) &&
        !parent_card_id && //大纲视图有子任务时间的父任务
          // !this.couldChangeCard() &&
          (gantt_view_mode == 'year' ? time_span > 4 : true) && (
            <>
              <div
                className={indexStyles.left_triangle}
                style={{
                  borderColor: `${this.setTriangleTreeColor(
                    label_data,
                    'start'
                  )} transparent transparent transparent`
                }}
              ></div>
              <div className={indexStyles.left_triangle_mask}></div>
              <div
                className={indexStyles.right_triangle}
                style={{
                  borderColor: `${this.setTriangleTreeColor(
                    label_data,
                    'end'
                  )} transparent transparent transparent`
                }}
              ></div>
              <div className={indexStyles.right_triangle_mask}></div>
            </>
          )}
        {
          //hover出现的耳朵效果
          <></>
        }
      </div>
      // </Popover>
    )
  }
}
function mapStateToProps({
  gantt: {
    datas: {
      list_group = [],
      date_arr_one_level = [],
      ceilWidth,
      ceiHeight,
      gantt_board_id,
      group_list_area,
      current_list_group_id,
      group_list_area_section_height = [],
      group_view_type,
      gantt_view_mode,
      outline_tree_round = []
    }
  },
  imCooperation: { im_all_latest_unread_messages = [] }
}) {
  return {
    list_group,
    date_arr_one_level,
    ceilWidth,
    ceiHeight,
    gantt_board_id,
    group_list_area,
    current_list_group_id,
    group_list_area_section_height,
    im_all_latest_unread_messages,
    group_view_type,
    gantt_view_mode,
    outline_tree_round
  }
}
