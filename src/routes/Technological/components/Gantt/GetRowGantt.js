import React, { Component, Fragment } from 'react'
import { connect } from 'dva'
import indexStyles from './index.less'
import GetRowGanttItem from './GetRowGanttItem'
import GetRowGanttItemElse from './GetRowGanttItemElse'
import globalStyles from '@/globalset/css/globalClassName.less'
import CheckItem from '@/components/CheckItem'
import AvatarList from '@/components/avatarList'
import { Tooltip, Dropdown, message } from 'antd'
import {
  date_area_height,
  task_item_height,
  task_item_margin_top,
  ganttIsFold,
  ceil_height_fold,
  task_item_height_fold,
  group_rows_fold,
  ganttIsOutlineView,
  ceil_width,
  ceil_height,
  gantt_panel_left_diff
} from './constants'
import CardDropDetail from './components/gattFaceCardItem/CardDropDetail'
import QueueAnim from 'rc-queue-anim'
import GetRowTaskItem from './components/CardItem/index'
import WorkFlow from './components/CardItem/WorkFlow'

import {
  filterDueTimeSpan,
  setDateWithPositionInYearView,
  setDateWidthPositionWeekView
} from './ganttBusiness'
import { checkIsHasPermissionInBoard } from '../../../../utils/businessFunction'
import {
  NOT_HAS_PERMISION_COMFIRN,
  PROJECT_TEAM_CARD_CREATE
} from '../../../../globalset/js/constant'
import GetRowSummary from './components/gattFaceCardItem/GetRowSummary.js'
import GetRowGanttVirtual from './GetRowGanttVirtual'
import GetRowStrip from './components/GetRowStrip'
import {
  isSamDay,
  timestampToTimeNormal,
  timestampToTime
} from '../../../../utils/util'
import SvgArea from './components/SvgArea'
import GroupCanvas from './components/GroupCanvas'

import BaseLineItem from './components/CardItem/BaseLineItem'
const clientWidth = document.documentElement.clientWidth //获取页面可见高度
const dateAreaHeight = date_area_height //日期区域高度，作为修正
const getEffectOrReducerByName = name => `gantt/${name}`
@connect(mapStateToProps)
export default class GetRowGantt extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentRect: { x: 0, y: 0, width: 0, height: task_item_height }, //当前操作的矩形属性
      dasheRectShow: false, //虚线框是否显示
      isDasheRect: false, //生成任务后在原始虚线框位置处生成一条数据
      start_time: '',
      due_time: '',
      specific_example_arr: [], //任务实例列表
      drag_holiday_count: 0, // //拖拽生成虚线框的节假日总天数
      task_is_dragging: false, //任务实例是否在拖拽中
      isMouseDown: false,
      drag_creating: false, //拖拽生成任务中
      card_rely_draging: false //任务卡片相关拖拽中
    }
    this.x1 = 0 //用于做拖拽生成一条任务
    this.y1 = 0
    this.dashedMousedown = this.dashedMousedown.bind(this) //用来做拖拽虚线框
    this.dashedMouseMove = this.dashedMouseMove.bind(this)
    this.dashedMouseLeave = this.dashedMouseLeave.bind(this)
  }
  setDasheRectShow = bool => {
    this.setState({
      dasheRectShow: bool
    })
  }
  setCardRelyDraging = bool => {
    //任务相关拖拽中
    this.setState({
      card_rely_draging: bool
    })
    const target = this.refs.gantt_operate_area_panel
    if (!target) return
    if (!target.style) return
    if (bool) {
      target.style.cursor = 'pointer'
    } else {
      target.style.cursor = 'crosshair'
    }
  }
  setTaskIsDragging = (bool, flag) => {
    //设置任务是否在拖拽中的状态
    this.setState({
      task_is_dragging: bool
    })
    this.stopDragging()
    const target = this.refs.gantt_operate_area_panel
    if (!target) return
    if (!target.style) return
    if (bool) {
      target.style.cursor = 'pointer' //this.state.card_rely_draging ? 'pointer' : 'move';
    } else {
      target.style.cursor = 'crosshair'
    }
  }
  setDragCreating = drag_creating => {
    this.setState({
      drag_creating
    })
  }

  componentDidMount() {
    this.setGanttCardOutOffsetLeft()
  }

  // 设置甘特图卡片距离页面文档左边距
  setGanttCardOutOffsetLeft = () => {
    const { is_need_calculate_left_dx } = this.props
    if (!is_need_calculate_left_dx) {
      //如果不需要计算做边距，从引用甘特图组件的地方设置
      // this.setState({
      //   gantt_panel_left_diff: 0
      // })
      return
    }
    const getPoint = (obj, e) => {
      //获取某元素以浏览器左上角为原点的坐标
      let left_to_body = obj.offsetLeft //对应父容器的上边距
      //判断是否有父容器，如果存在则累加其边距
      while ((obj = obj.offsetParent)) {
        //等效 obj = obj.offsetParent;while (obj != undefined)
        left_to_body += obj.offsetLeft //叠加父容器的左边距
      }
      return left_to_body
    }
    const element = document.getElementById('gantt_card_out')
    const card_offset_left = getPoint(element)
    // this.setState({
    //   gantt_panel_left_diff: card_offset_left
    // })
  }

  componentWillReceiveProps(nextProps) {}

  // 在任务实例上点击到特定的位置，阻断，是能够不出现创建任务弹窗
  stopPropagationEle = e => {
    if (this.state.task_is_dragging) {
      //在做单条任务拖动的时候，不能创建
      return true
    }
    if (
      e.target.dataset &&
      e.target.className &&
      typeof e.target.className == 'string' && //容错
      (e.target.dataset.targetclassname == 'specific_example' ||
        e.target.className.indexOf('authTheme') != -1 ||
        e.target.className.indexOf('ant-avatar') != -1)
    ) {
      //不能滑动到某一个任务实例上
      return true
    }
    return false
  }

  //鼠标拖拽移动
  dashedMousedown = e => {
    const {
      gantt_board_id,
      group_view_type,
      show_board_fold,
      gantt_view_mode
    } = this.props
    if (ganttIsOutlineView({ group_view_type })) {
      return
    }
    if (
      this.stopPropagationEle(e) //不能滑动到某一个任务实例上
    ) {
      return false
    }
    // e.preventDefault() //解决拖拽卡顿？(尚未明确)
    if (this.state.drag_creating || this.state.isMouseDown) {
      //在拖拽中，还有防止重复点击
      return
    }
    if (
      ganttIsFold({
        gantt_board_id,
        group_view_type,
        show_board_fold,
        gantt_view_mode
      })
    ) {
      return
    }
    const { currentRect = {} } = this.state
    this.x1 = currentRect.x
    this.y1 = currentRect.y
    this.setDragCreating(false)
    this.setState({ isMouseDown: true })
    this.handleCreateTask({ start_end: '1', top: currentRect.y })
    const target = this.refs.gantt_operate_area_panel //event.target || event.srcElement;
    target.onmousemove = this.dashedDragMousemove.bind(this)
    target.onmouseup = this.dashedDragMouseup.bind(this)
  }
  dashedDragMousemove = e => {
    if (this.stopPropagationEle(e)) {
      //不能滑动到某一个任务实例上
      return false
    }
    this.setDragCreating(true)

    const { gantt_view_mode, ceilWidth, gantt_head_width } = this.props

    const target_0 = document.getElementById('gantt_card_out')
    const target_1 = document.getElementById('gantt_card_out_middle')
    const target = this.refs.gantt_operate_area_panel //event.target || event.srcElement;
    // const { gantt_panel_left_diff } = this.state
    // 取得鼠标位置
    const x =
      e.pageX -
      target_0.offsetLeft +
      target_1.scrollLeft -
      gantt_head_width -
      gantt_panel_left_diff
    const y = e.pageY - target.offsetTop + target_1.scrollTop - dateAreaHeight
    //设置宽度
    const offset_left = Math.abs(x - this.x1)
    // 更新拖拽的最新矩形
    let px = this.x1 //x < this.x1 ? x : this.x1 //向左向右延申
    let py = this.y1
    let width = offset_left < ceilWidth || x < this.x1 ? ceilWidth : offset_left //小于单位长度或者鼠标相对点击的起始点向左拖动都使用最小单位
    width =
      Math.ceil(width / ceilWidth) * ceilWidth -
      (gantt_view_mode == 'year' ? 6 : 4) //向上取整 4为微调
    const property = {
      x: px,
      y: py,
      width,
      height: task_item_height
    }

    this.setState(
      {
        currentRect: property
      },
      () => {
        if (gantt_view_mode == 'year') {
          this.handleCreateTask({
            start_end: '2',
            top: property.y,
            not_create: true
          })
        }
        this.setDragDashedRectHolidayNo()
      }
    )
  }
  dashedDragMouseup = e => {
    if (this.stopPropagationEle(e)) {
      //不能滑动到某一个任务实例上
      return false
    }
    const { currentRect = {} } = this.state
    this.stopDragging()
    this.handleCreateTask({ start_end: '2', top: currentRect.y })
  }
  stopDragging = () => {
    const target = this.refs.gantt_operate_area_panel
    target.onmousemove = null
    target.onmouseup = null
    const that = this
    setTimeout(function() {
      that.setState({ isMouseDown: false })
      that.setDragCreating(false)
    }, 1000)
  }

  //鼠标移动
  dashedMouseMove = e => {
    const {
      dataAreaRealHeight,
      gantt_board_id,
      group_view_type,
      show_board_fold,
      gantt_view_mode,
      gantt_head_width
    } = this.props
    const { drag_creating } = this.state
    if (e.target.offsetTop >= dataAreaRealHeight) return //在全部分组外的其他区域（在创建项目那一栏）
    if (
      e.target.dataset.targetclassname == 'specific_example' //不能滑动到某一个任务实例上
    ) {
      // this.setState({
      //   dasheRectShow: false
      // })
      return false
    }
    if (
      !drag_creating &&
      group_view_type == '1' &&
      e.target.dataset.targetclassname == 'specific_example_milestone' //非拖拽的过程中,滑倒里程碑旗子上没问题)
    ) {
      this.setState({
        dasheRectShow: false
      })
      return false
    } else {
      if (
        //滑动到任务上
        !this.state.dasheRectShow &&
        e.target.dataset.targetclassname != 'specific_example'
      ) {
        //非拖拽的过程中,滑倒里程碑旗子上没问题)
        this.setState({
          dasheRectShow: true
        })
      }
    }
    if (
      ganttIsFold({
        gantt_board_id,
        group_view_type,
        show_board_fold,
        gantt_view_mode
      })
    ) {
      return
    }
    if (ganttIsOutlineView({ group_view_type })) {
      return
    }
    const { ceiHeight, ceilWidth } = this.props
    if (this.state.isMouseDown) {
      //按下的情况不处理
      return false
    }
    const { dasheRectShow } = this.state
    if (!dasheRectShow) {
      this.setState({
        dasheRectShow: true
      })
    }

    const target_0 = document.getElementById('gantt_card_out')
    const target_1 = document.getElementById('gantt_card_out_middle')
    // 取得鼠标位置
    let px =
      e.pageX -
      target_0.offsetLeft +
      target_1.scrollLeft -
      gantt_head_width -
      gantt_panel_left_diff
    let py = e.pageY - target_0.offsetTop + target_1.scrollTop - dateAreaHeight

    const molX = px % ceilWidth
    const molY =
      py %
      (ganttIsFold({
        gantt_board_id,
        group_view_type,
        show_board_fold,
        gantt_view_mode
      })
        ? ceiHeight * group_rows_fold
        : ceiHeight) //2为折叠的总行
    const mulX = Math.floor(px / ceilWidth)
    const mulY = Math.floor(py / ceiHeight)
    const delX = Number((molX / ceilWidth).toFixed(1))
    const delY = Number((molY / ceiHeight).toFixed(1))

    px = px - molX
    py = py - molY

    const property = {
      x: px,
      y: py,
      width: ceilWidth - (gantt_view_mode == 'year' ? 0 : 4),
      height: task_item_height
    }

    this.setState(
      {
        currentRect: property,
        drag_holiday_count: 0
      },
      () => {
        if (gantt_view_mode == 'year') {
          this.handleCreateTask({
            start_end: '1',
            top: property.y,
            not_create: true
          })
          this.handleCreateTask({
            start_end: '2',
            top: property.y,
            not_create: true
          })
        }
      }
    )
  }
  dashedMouseLeave = e => {
    if (!this.state.isMouseDown) {
      this.setState({
        dasheRectShow: false
      })
    }
  }
  // 在该区间内不能操作
  areaCanNotOperate = e => {
    const {
      group_list_area_section_height = [],
      list_group = [],
      gantt_board_id,
      group_view_type,
      show_board_fold,
      gantt_view_mode
    } = this.props
    if (
      !ganttIsFold({
        gantt_board_id,
        group_view_type,
        show_board_fold,
        gantt_view_mode
      })
    ) {
      //非折叠情况下不考虑
      return false
    }
    const target_0 = document.getElementById('gantt_card_out')
    const target_1 = document.getElementById('gantt_card_out_middle')
    // 取得鼠标位置
    const py =
      e.pageY - target_0.offsetTop + target_1.scrollTop - dateAreaHeight
    //取得现在鼠标所在分组
    const height_length = group_list_area_section_height.length
    let index = 0
    for (let i = 0; i < height_length; i++) {
      if (py < group_list_area_section_height[i]) {
        index = i
        break
      }
    }
    const current_hover_group_has_data = list_group[index].list_data.length > 0
    return current_hover_group_has_data
  }

  //记录起始时间，做创建任务工作
  handleCreateTask = ({ start_end, top, not_create }) => {
    const { dataAreaRealHeight, gantt_view_mode } = this.props
    // if (top >= dataAreaRealHeight) return //在全部分组外的其他区域（在创建项目那一栏）

    const { dispatch } = this.props
    const {
      gold_date_arr = [],
      ceilWidth,
      date_arr_one_level = []
    } = this.props
    const { currentRect = {} } = this.state
    const { x, y, width, height } = currentRect
    let counter = 0
    let date = {} //月视图操作的日期数据

    if (['month', 'hours', 'relative_time'].includes(gantt_view_mode)) {
      //月视图下定位到相符的日期
      for (let val of date_arr_one_level) {
        counter += 1
        if (counter * ceilWidth >= x + width) {
          date = val
          break
        }
      }
    } else if (gantt_view_mode == 'year') {
      //年视图下定位到相符的月，然后在该月份下定位日期
      const max_width = Math.max(width, ceilWidth) //width不能小于最小单元
      const _position = start_end == '1' ? x + width : x + max_width //所取点的位置
      date = setDateWithPositionInYearView({
        _position,
        ceilWidth,
        date_arr_one_level,
        width: max_width,
        x
        // x: start_end == '1' ? x : x - max_width //截止日期总是往后一天，故减1做魔法兼容
        // x: start_end == '1' ? x + ceilWidth : x,
      })
      // for (let val of date_arr_one_level) {
      //   month_data.month_date_length_total += val['last_date']  //每个月累加天数
      //   month_data.month_count += 1 //月份数累加
      //   if (month_data.month_date_length_total * ceilWidth > x + width) {
      //     month_data.month = val //获得当前月份
      //     break
      //   }

      // }
      // // console.log('asdasdasd00', month_data.month.last_date, month_data.month_date_length_total, x / ceilWidth)
      // //当前月份天数长度 - (所属月份和之前月份的总天数长度 - 当前点的位置（x(x是经过单元格乘以单元格长度转换而来)）) = 该月份日期
      // const position_ = start_end == '1' ? x : x + width //所取点的位置
      // month_data.date_no = month_data.month.last_date - (month_data.month_date_length_total - position_ / ceilWidth)
      // let _year = month_data.month.year
      // let _month = month_data.month.month
      // //由于计算紧凑，会出现2010/02/0 或者2010/02/-1等日期号不正常情况，这种情况将日期设置为上一个月的最后一天
      // if (month_data.date_no <= 0) {
      //   if (_month == 1) {
      //     _month = 12
      //     _year = _year - 1
      //   } else {
      //     _month = _month - 1
      //   }
      //   month_data.date_no = base_utils.getDaysNumInMonth(_month, _year)
      // }
      // let date_string = `${_year}/${_month}/${month_data.date_no}`
      // date = {
      //   timestamp: new Date(`${date_string} 00:00:00`).getTime(),
      //   timestampEnd: new Date(`${date_string} 23:59:59`).getTime()
      // }
      // console.log('asdasdasd', date_string)
    } else if (gantt_view_mode == 'week') {
      date = setDateWidthPositionWeekView({
        position: start_end == '1' ? x : x + width - 2,
        date_arr_one_level,
        ceilWidth
      })
    }

    const { timestamp, timestampEnd } = date
    const update_name =
      start_end == '1' ? 'create_start_time' : 'create_end_time'
    // console.log('ssssssssssss', [update_name], timestamp, timestampEnd)
    dispatch({
      type: getEffectOrReducerByName('updateDatas'),
      payload: {
        [update_name]: start_end == '1' ? timestamp : timestampEnd
      }
    })
    if (not_create) {
      //不创建和查看
      return
    }
    if (start_end == '2') {
      //拖拽或点击操作完成，进行生成单条任务逻辑
      this.setSpecilTaskExample({ top }) //出现任务创建或查看任务
    }
  }

  //获取当前所在的分组, 根据创建或者查看任务时的高度
  getCurrentGroup = ({ top }) => {
    if (top == undefined || top == null) {
      return
    }
    const {
      group_view_type,
      group_list_area_section_height = [],
      dispatch,
      list_group
    } = this.props
    if (ganttIsOutlineView({ group_view_type })) {
      return Promise.resolve({ current_list_group_id: 0 })
    }

    // const getSum = (total, num) => {
    //   return total + num;
    // }
    // const { dispatch } = this.props
    // const { group_list_area = [], list_group = [] } = this.props
    // for (let i = 0; i < group_list_area.length; i++) {
    //   if (i == 0) {
    //     if (top < group_list_area[0]) {
    //       conter_key = 0
    //       break
    //     }
    //   } else {
    //     const arr = group_list_area.slice(0, i + 1)
    //     const sum = arr.reduce(getSum);
    //     if (top < sum) {
    //       conter_key = i
    //       break
    //     }
    //   }
    // }
    let conter_key = 0 //所属分组下标
    let belong_group_row = 0 //所在分组的某一行

    for (let i = 0, len = group_list_area_section_height.length; i < len; i++) {
      if (top < group_list_area_section_height[i]) {
        conter_key = i
        break
      }
    }
    if (conter_key == 0) {
      belong_group_row = top / ceil_height + 1
    } else {
      belong_group_row =
        (top - group_list_area_section_height[conter_key - 1]) / ceil_height + 1
    }
    // console.log('ssssssssss_top', conter_key, belong_group_row)
    const current_list_group_id = list_group[conter_key]['list_id']
    dispatch({
      type: getEffectOrReducerByName('updateDatas'),
      payload: {
        current_list_group_id,
        belong_group_row
      }
    })

    return Promise.resolve({ current_list_group_id, belong_group_row })
  }

  //点击某个实例,或者创建任务
  setSpecilTaskExample = ({ id, board_id, top }, e) => {
    const { dispatch, gantt_board_id } = this.props
    if (e) {
      e.stopPropagation()
    }
    this.getCurrentGroup({ top }).then(res => {
      if (id) {
        //如果有id 则是修改任务，否则是创建任务
        this.props.setTaskDetailModalVisibile &&
          this.props.setTaskDetailModalVisibile()
        dispatch({
          type: 'publicTaskDetailModal/updateDatas',
          payload: {
            // drawerVisible: true,
            card_id: id
          }
        })
        dispatch({
          type: 'gantt/updateDatas',
          payload: {
            selected_card_visible: true
          }
        })
        // dispatch({
        //   type: 'workbenchTaskDetail/getCardDetail',
        //   payload: {
        //     id,
        //     board_id,
        //     calback: function (data) {
        //       dispatch({
        //         type: 'workbenchPublicDatas/getRelationsSelectionPre',
        //         payload: {
        //           _organization_id: data.org_id
        //         }
        //       })
        //     }
        //   }
        // })
        // dispatch({
        //   type: 'workbenchTaskDetail/getCardCommentListAll',
        //   payload: {
        //     id: id
        //   }
        // })
        dispatch({
          type: 'workbenchPublicDatas/updateDatas',
          payload: {
            board_id
          }
        })
      } else {
        const { current_list_group_id } = res
        const { group_view_type } = this.props
        if (group_view_type == '2') {
          //人员视图
          if (gantt_board_id != 0) {
            if (
              !checkIsHasPermissionInBoard(
                PROJECT_TEAM_CARD_CREATE,
                gantt_board_id
              )
            ) {
              message.warn(NOT_HAS_PERMISION_COMFIRN)
              return
            }
          }
        } else {
          //项目视图
          if (gantt_board_id == 0) {
            if (
              !checkIsHasPermissionInBoard(
                PROJECT_TEAM_CARD_CREATE,
                current_list_group_id
              )
            ) {
              message.warn(NOT_HAS_PERMISION_COMFIRN)
              return
            }
          } else {
            if (
              !checkIsHasPermissionInBoard(
                PROJECT_TEAM_CARD_CREATE,
                gantt_board_id
              )
            ) {
              message.warn(NOT_HAS_PERMISION_COMFIRN)
              return
            }
          }
        }
        this.props.addTaskModalVisibleChange &&
          this.props.addTaskModalVisibleChange(true)
      }
    })
  }

  // 设置拖拽生成任务虚线框内，节假日或者公休日的时间天数
  setDragDashedRectHolidayNo = () => {
    let count = 0

    const { create_start_time, create_end_time, holiday_list = [] } = this.props
    if (!create_start_time || !create_end_time) {
      // return count
      this.setState({
        drag_holiday_count: count
      })
    }
    const create_start_time_ = create_start_time / 1000
    const create_end_time_ = create_end_time / 1000

    const holidy_date_arr = holiday_list.filter(item => {
      if (
        create_start_time_ <= Number(item.timestamp) &&
        create_end_time_ >= Number(item.timestamp) &&
        (item.is_week || item.festival_status == '1') && //周末或者节假日
        item.festival_status != '2' //不是补班（周末补班不算）
      ) {
        return item
      }
    })

    this.setState({
      drag_holiday_count: holidy_date_arr.length
    })
  }

  // 渲染普通任务列表
  renderNormalTaskList = ({ list_id, list_data }) => {
    return list_data.map((value2, key) => {
      // const { id, left, width, start_time, end_time } = value2
      const {
        row,
        end_time,
        left,
        top,
        time_span,
        width,
        height,
        name,
        id,
        board_id,
        is_realize,
        executors = [],
        label_data = [],
        is_has_start_time,
        is_has_end_time,
        start_time,
        due_time,
        is_outine_group_head
      } = value2
      const { is_overdue, due_description } = filterDueTimeSpan({
        start_time,
        due_time,
        is_has_end_time,
        is_has_start_time
      })
      return (
        !is_outine_group_head && ( //大纲视图会将分组头部塞进任务，做统一处理,但并不是真正的任务
          <GetRowTaskItem
            key={`${id}_${start_time}_${end_time}_${left}_${top}_${time_span}_${row}`}
            itemValue={value2}
            setSpecilTaskExample={this.setSpecilTaskExample}
            ganttPanelDashedDrag={this.state.drag_creating}
            getCurrentGroup={this.getCurrentGroup}
            list_id={list_id}
            task_is_dragging={this.state.task_is_dragging}
            setGoldDateArr={this.props.setGoldDateArr}
            setScrollPosition={this.props.setScrollPosition}
            setDragCreating={this.setDragCreating}
            setTaskIsDragging={this.setTaskIsDragging}
            setDasheRectShow={this.setDasheRectShow}
            setCardRelyDraging={this.setCardRelyDraging}
            card_rely_draging={this.state.card_rely_draging}
          />
        )
      )
    })
  }

  renderFoldTaskSummary = ({
    list_id,
    list_data,
    board_fold_data = {},
    group_index
  }) => {
    return (
      <GetRowSummary
        list_data={list_data}
        itemValue={board_fold_data}
        list_id={list_id}
        key={list_id}
        group_index={group_index}
      />
    )
  }

  // 渲染横条
  renderStripSc = ({ list_data, list_id, list_group_key }) => {
    return list_data.map((value2, key) => {
      // const { id, left, width, start_time, end_time } = value2
      const {
        end_time,
        left,
        top,
        width,
        height,
        name,
        id,
        board_id,
        is_realize,
        executors = [],
        label_data = [],
        is_has_start_time,
        is_has_end_time,
        start_time,
        due_time
      } = value2
      const { is_overdue, due_description } = filterDueTimeSpan({
        start_time,
        due_time,
        is_has_end_time,
        is_has_start_time
      })
      return (
        <React.Fragment key={`${id}_${top}_${due_time}_${start_time}`}>
          <GetRowStrip
            itemValue={value2}
            list_id={list_id}
            list_group_key={list_group_key}
          ></GetRowStrip>
        </React.Fragment>
      )
    })
  }

  // 鼠标属性注册
  targetMouseEvent = () => {
    const { group_view_type } = this.props
    if (ganttIsOutlineView({ group_view_type })) {
      return {}
    } else {
      return {
        onMouseDown: this.dashedMousedown,
        onMouseMove: this.dashedMouseMove,
        onMouseLeave: this.dashedMouseLeave
      }
    }
  }

  // 渲染虚线框
  renderDashedRect = () => {
    const {
      currentRect = {},
      dasheRectShow,
      drag_holiday_count,
      drag_creating,
      card_rely_draging,
      task_is_dragging
    } = this.state
    const { create_start_time, create_end_time, gantt_view_mode } = this.props
    const {
      ceilWidth,
      ceiHeight,
      gantt_board_id,
      group_view_type,
      show_board_fold
    } = this.props
    const title =
      isSamDay(create_start_time, create_end_time) ||
      !create_start_time ||
      !create_end_time
        ? timestampToTime(create_end_time, true)
        : timestampToTime(create_start_time, true) +
          '-' +
          timestampToTime(create_end_time, true)
    // console.log('sss_show', dasheRectShow, !card_rely_draging, !task_is_dragging, drag_creating)
    const contain = dasheRectShow &&
      !card_rely_draging &&
      !task_is_dragging &&
      !ganttIsOutlineView({ group_view_type }) && (
        <div
          title={'点击或向右拖拽创建任务'}
          className={indexStyles.dasheRect}
          style={{
            left: currentRect.x + 1,
            top: currentRect.y,
            minWidth: gantt_view_mode == 'year' ? 6 : 0,
            width: currentRect.width,
            height: ganttIsFold({
              gantt_board_id,
              group_view_type,
              show_board_fold,
              gantt_view_mode
            })
              ? task_item_height_fold
              : task_item_height, //currentRect.height,
            boxSizing: 'border-box',
            marginTop: !ganttIsFold({
              gantt_board_id,
              group_view_type,
              show_board_fold,
              gantt_view_mode
            })
              ? task_item_margin_top
              : (ceil_height_fold * group_rows_fold - task_item_height_fold) /
                2, //task_item_margin_top,//
            color: 'rgba(0,0,0,0.45)',
            textAlign: 'right',
            lineHeight: ganttIsFold({
              gantt_board_id,
              group_view_type,
              show_board_fold,
              gantt_view_mode
            })
              ? `${task_item_height_fold}px`
              : `${ceiHeight - task_item_margin_top}px`,
            paddingRight: Math.ceil(currentRect.width / ceilWidth) > 1 ? 8 : 0,
            zIndex: this.state.drag_creating ? 2 : 0
          }}
        >
          {Math.ceil(currentRect.width / ceilWidth) > 1
            ? Math.ceil(currentRect.width / ceilWidth)
            : ''}
          {gantt_view_mode == 'year' && (
            <Tooltip
              visible
              title={title}
              getPopupContainer={() =>
                document.getElementById('gantt_card_out_middle')
              }
            >
              <div
                style={{
                  left: 0,
                  top: 0,
                  zIndex: 3,
                  position: 'absolute',
                  width: currentRect.width,
                  height: ganttIsFold({
                    gantt_board_id,
                    group_view_type,
                    show_board_fold,
                    gantt_view_mode
                  })
                    ? task_item_height_fold
                    : task_item_height //currentRect.height,
                }}
              ></div>
            </Tooltip>
          )}

          {/* {Math.ceil(currentRect.width / ceilWidth) != 1 && Math.ceil(currentRect.width / ceilWidth) - drag_holiday_count}
            {Math.ceil(currentRect.width / ceilWidth) != 1 && (drag_holiday_count > 0 ? `+${drag_holiday_count}` : '')} */}
        </div>
      )
    return contain
  }
  render() {
    const { currentRect = {}, dasheRectShow, drag_holiday_count } = this.state
    const {
      gold_date_arr = [],
      list_group = [],
      ceilWidth,
      group_rows = [],
      ceiHeight,
      gantt_board_id,
      group_view_type,
      show_board_fold,
      outline_tree_round,
      gantt_view_mode,
      active_baseline_data,
      date_arr_one_level,
      gantt_card_height
    } = this.props
    return (
      <>
        <div
          className={indexStyles.gantt_operate_top}
          // onMouseDown={this.dashedMousedown.bind(this)} //用来做拖拽虚线框
          // onMouseMove={this.dashedMouseMove.bind(this)}
          // onMouseLeave={this.dashedMouseLeave.bind(this)}
          {...this.targetMouseEvent()}
          id={'gantt_operate_area_panel'}
          ref={'gantt_operate_area_panel'}
        >
          <GroupCanvas gantt_card_height={gantt_card_height}></GroupCanvas>
          <SvgArea gantt_card_height={gantt_card_height}></SvgArea>
          {this.renderDashedRect()}
          {/* 非大纲视图下渲染任务和或者进度 */}
          {!ganttIsOutlineView({ group_view_type }) &&
            list_group.map((value, key) => {
              const { list_data = [], list_id, board_fold_data } = value
              if (
                ganttIsFold({
                  gantt_board_id,
                  group_view_type,
                  show_board_fold,
                  gantt_view_mode
                })
              ) {
                return this.renderFoldTaskSummary({
                  list_id,
                  list_data,
                  board_fold_data,
                  group_index: key
                })
              } else {
                return this.renderNormalTaskList({ list_id, list_data })
              }
            })}
          {/* 渲染大纲视图下的任务 */}
          {ganttIsOutlineView({ group_view_type }) &&
            outline_tree_round.map((value, key) => {
              const {
                row,
                end_time,
                left,
                top,
                id,
                start_time,
                tree_type,
                parent_expand,
                is_expand,
                parent_card_id
              } = value
              const juge_expand =
                tree_type == '0' || tree_type == '3'
                  ? parent_expand
                  : parent_expand && is_expand
              if (
                !parent_expand ||
                // !left ||
                (gantt_view_mode == 'year' && !!parent_card_id)
              ) {
                return <></>
              }
              if (!left) {
                if (!isSamDay(date_arr_one_level[0].timestamp, start_time)) {
                  return <></>
                }
              }
              if (tree_type == '2') {
                return (
                  <Fragment>
                    {active_baseline_data[id] && (
                      <BaseLineItem
                        data={active_baseline_data[id]}
                        top={top}
                        gantt_view_mode={gantt_view_mode}
                        type={tree_type}
                        ganttData={value}
                      />
                    )}
                    <GetRowTaskItem
                      key={`${id}_${start_time}_${end_time}_${left}_${top}_${row}`}
                      itemValue={value}
                      setSpecilTaskExample={this.setSpecilTaskExample}
                      ganttPanelDashedDrag={this.state.drag_creating}
                      getCurrentGroup={this.getCurrentGroup}
                      // list_id={list_id}
                      changeOutLineTreeNodeProto={
                        this.props.changeOutLineTreeNodeProto
                      }
                      task_is_dragging={this.state.task_is_dragging}
                      setGoldDateArr={this.props.setGoldDateArr}
                      setScrollPosition={this.props.setScrollPosition}
                      setDragCreating={this.setDragCreating}
                      setTaskIsDragging={this.setTaskIsDragging}
                      setDasheRectShow={this.setDasheRectShow}
                      setCardRelyDraging={this.setCardRelyDraging}
                      card_rely_draging={this.state.card_rely_draging}
                    />
                  </Fragment>
                )
              } else if (tree_type == '3') {
                return (
                  <Fragment>
                    {active_baseline_data[id] && (
                      <BaseLineItem
                        data={active_baseline_data[id]}
                        top={top}
                        gantt_view_mode={gantt_view_mode}
                        type={tree_type}
                        ganttData={value}
                      />
                    )}
                    <WorkFlow
                      key={`${id}_${start_time}_${end_time}_${left}_${top}`}
                      itemValue={value}
                      setSpecilTaskExample={this.setSpecilTaskExample}
                      ganttPanelDashedDrag={this.state.drag_creating}
                      getCurrentGroup={this.getCurrentGroup}
                      // list_id={list_id}
                      changeOutLineTreeNodeProto={
                        this.props.changeOutLineTreeNodeProto
                      }
                      task_is_dragging={this.state.task_is_dragging}
                      setGoldDateArr={this.props.setGoldDateArr}
                      setScrollPosition={this.props.setScrollPosition}
                      setDragCreating={this.setDragCreating}
                      setTaskIsDragging={this.setTaskIsDragging}
                      setDasheRectShow={this.setDasheRectShow}
                      setCardRelyDraging={this.setCardRelyDraging}
                      card_rely_draging={this.state.card_rely_draging}
                    />
                  </Fragment>
                )
              } else {
                return <></>
              }
            })}
          {/* 渲染大纲视图下的横条 */}
          {ganttIsOutlineView({ group_view_type }) &&
            outline_tree_round.map((value, key) => {
              // const { list_data = [], list_id, board_fold_data } = value
              // return (
              //   this.renderStripSc({ list_data, list_id, list_group_key: key })
              // )
              const {
                id,
                top,
                parent_expand,
                is_expand,
                tree_type,
                due_time
              } = value
              const juge_expand =
                tree_type == '0' || tree_type == '3'
                  ? parent_expand
                  : parent_expand && is_expand
              return (
                parent_expand && (
                  <React.Fragment key={`${id}_${top}_${due_time}`}>
                    {active_baseline_data[id] && (
                      <BaseLineItem
                        data={active_baseline_data[id]}
                        top={top}
                        type={tree_type}
                        gantt_view_mode={gantt_view_mode}
                        ganttData={value}
                      />
                    )}
                    <GetRowStrip
                      itemValue={value}
                      deleteOutLineTreeNode={this.props.deleteOutLineTreeNode}
                      addTaskModalVisibleChange={
                        this.props.addTaskModalVisibleChange
                      }
                      setGoldDateArr={this.props.setGoldDateArr}
                      setScrollPosition={this.props.setScrollPosition}
                    ></GetRowStrip>
                  </React.Fragment>
                )
              )
            })}
          {!ganttIsOutlineView({ group_view_type }) && (
            <GetRowGanttVirtual
              ganttPanelDashedDrag={this.state.drag_creating}
              setDragCreating={this.setDragCreating}
            />
          )}
          {/* <GetRowGanttItemElse gantt_card_height={this.props.gantt_card_height} dataAreaRealHeight={this.props.dataAreaRealHeight} /> */}
        </div>
      </>
    )
  }
}
//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
  gantt: {
    datas: {
      gold_date_arr = [],
      list_group = [],
      ceilWidth,
      group_rows = [],
      ceiHeight,
      group_list_area = [],
      date_arr_one_level = [],
      create_start_time,
      create_end_time,
      holiday_list = [],
      gantt_board_id,
      group_view_type,
      group_list_area_section_height,
      show_board_fold,
      outline_tree_round,
      gantt_view_mode,
      gantt_head_width,
      active_baseline_data
    }
  },
  technological: {
    datas: { userBoardPermissions }
  }
}) {
  return {
    gold_date_arr,
    list_group,
    ceilWidth,
    group_rows,
    ceiHeight,
    group_list_area,
    date_arr_one_level,
    create_start_time,
    create_end_time,
    holiday_list,
    gantt_board_id,
    group_view_type,
    group_list_area_section_height,
    show_board_fold,
    userBoardPermissions,
    outline_tree_round,
    gantt_view_mode,
    gantt_head_width,
    active_baseline_data
  }
}
