import React, { Component } from 'react';
import { connect, } from 'dva';
import indexStyles from './index.less'
import GetRowGanttItem from './GetRowGanttItem'
import GetRowGanttItemElse from './GetRowGanttItemElse'
import globalStyles from '@/globalset/css/globalClassName.less'
import CheckItem from '@/components/CheckItem'
import AvatarList from '@/components/avatarList'
import { Tooltip, Dropdown, message } from 'antd'
import { date_area_height, task_item_height, task_item_margin_top, ganttIsFold, ceil_height_fold, task_item_height_fold, group_rows_fold } from './constants'
import CardDropDetail from './components/gattFaceCardItem/CardDropDetail'
import QueueAnim from 'rc-queue-anim'
import GetRowTaskItem from './GetRowTaskItem'
import { filterDueTimeSpan } from './ganttBusiness'
import { checkIsHasPermissionInBoard } from '../../../../utils/businessFunction';
import { NOT_HAS_PERMISION_COMFIRN, PROJECT_TEAM_CARD_CREATE } from '../../../../globalset/js/constant';
import GetRowSummary from './components/gattFaceCardItem/GetRowSummary.js'
import GetRowGanttVirtual from './GetRowGanttVirtual'
const clientWidth = document.documentElement.clientWidth;//获取页面可见高度
const coperatedX = 0 //80 //鼠标移动和拖拽的修正位置
const coperatedLeftDiv = 20 //滚动条左边还有一个div的宽度，作为修正
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
    }
    this.x1 = 0 //用于做拖拽生成一条任务
    this.y1 = 0
    this.isDragging = false //判断是否在拖拽虚线框
    this.isMouseDown = false //是否鼠标按下
    this.SelectedRect = { x: 0, y: 0 }

    this.task_is_dragging = false //任务实例是否在拖拽中
  }
  setTaskIsDragging = (bool) => { //设置任务是否在拖拽中的状态
    this.task_is_dragging = bool
    const target = this.refs.gantt_operate_area_panel
    if (!target) return
    if (!target.style) return
    if (bool) {
      target.style.cursor = 'move';
    } else {
      target.style.cursor = 'crosshair';
    }
  }
  setIsDragging = (isDragging) => {
    const { dispatch } = this.props
    this.isDragging = isDragging
    dispatch({
      type: getEffectOrReducerByName('updateDatas'),
      payload: {
        isDragging
      }
    })
  }

  componentDidMount() {
    this.setGanttCardOutOffsetLeft()
  }

  // 设置甘特图卡片距离页面文档左边距
  setGanttCardOutOffsetLeft = () => {
    const { is_need_calculate_left_dx } = this.props
    if (!is_need_calculate_left_dx) { //如果不需要计算做边距，从引用甘特图组件的地方设置
      this.setState({
        coperatedX: 0
      })
      return
    }
    const getPoint = (obj, e) => { //获取某元素以浏览器左上角为原点的坐标
      let left_to_body = obj.offsetLeft; //对应父容器的上边距
      //判断是否有父容器，如果存在则累加其边距
      while (obj = obj.offsetParent) {//等效 obj = obj.offsetParent;while (obj != undefined)
        left_to_body += obj.offsetLeft; //叠加父容器的左边距
      }
      return left_to_body
    }
    const element = document.getElementById('gantt_card_out')
    const card_offset_left = getPoint(element)
    this.setState({
      coperatedX: card_offset_left
    })
  }

  componentWillReceiveProps(nextProps) {

  }

  // 在任务实例上点击到特定的位置，阻断，是能够不出现创建任务弹窗
  stopPropagationEle = (e) => {
    if (this.task_is_dragging) {//在做单条任务拖动的时候，不能创建
      return true
    }
    if (
      e.target.dataset && e.target.className && typeof e.target.className == 'string' &&//容错
      (
        e.target.dataset.targetclassname == 'specific_example' ||
        e.target.className.indexOf('authTheme') != -1 ||
        e.target.className.indexOf('ant-avatar') != -1
      )
    ) { //不能滑动到某一个任务实例上
      return true
    }
    return false
  }

  //鼠标拖拽移动
  dashedMousedown(e) {
    const { gantt_board_id, group_view_type, show_board_fold } = this.props
    if (
      this.stopPropagationEle(e) //不能滑动到某一个任务实例上
    ) {
      return false
    }
    // e.preventDefault() //解决拖拽卡顿？(尚未明确)
    if (this.isDragging || this.isMouseDown) { //在拖拽中，还有防止重复点击
      return
    }
    if (ganttIsFold({ gantt_board_id, group_view_type, show_board_fold })) {
      return
    }
    const { currentRect = {} } = this.state
    this.x1 = currentRect.x
    this.y1 = currentRect.y
    this.setIsDragging(false)
    this.isMouseDown = true
    this.handleCreateTask({ start_end: '1', top: currentRect.y })
    const target = this.refs.gantt_operate_area_panel//event.target || event.srcElement;
    target.onmousemove = this.dashedDragMousemove.bind(this);
    target.onmouseup = this.dashedDragMouseup.bind(this);
  }
  dashedDragMousemove(e) {
    if (
      this.stopPropagationEle(e)
    ) { //不能滑动到某一个任务实例上
      return false
    }
    this.setIsDragging(true)

    const { ceiHeight, ceilWidth } = this.props

    const target_0 = document.getElementById('gantt_card_out')
    const target_1 = document.getElementById('gantt_card_out_middle')
    const target = this.refs.gantt_operate_area_panel//event.target || event.srcElement;
    const { coperatedX } = this.state
    // 取得鼠标位置
    const x = e.pageX - target_0.offsetLeft + target_1.scrollLeft - coperatedLeftDiv - coperatedX
    const y = e.pageY - target.offsetTop + target_1.scrollTop - dateAreaHeight
    //设置宽度
    const offset_left = Math.abs(x - this.x1);
    // 更新拖拽的最新矩形
    let px = this.x1//x < this.x1 ? x : this.x1 //向左向右延申
    let py = this.y1
    let width = (offset_left < ceilWidth) || (x < this.x1) ? ceilWidth : offset_left //小于单位长度或者鼠标相对点击的起始点向左拖动都使用最小单位
    width = Math.ceil(width / ceilWidth) * ceilWidth - 6 //向上取整 4为微调
    const property = {
      x: px,
      y: py,
      width,
      height: task_item_height,
    }

    this.setState({
      currentRect: property
    }, () => {
      this.handleCreateTask({ start_end: '2', top: property.y, not_create: true })
      this.setDragDashedRectHolidayNo()
    })
  }
  dashedDragMouseup(e) {
    if (
      this.stopPropagationEle(e)
    ) { //不能滑动到某一个任务实例上
      return false
    }
    const { currentRect = {} } = this.state
    this.stopDragging()
    this.handleCreateTask({ start_end: '2', top: currentRect.y })
  }
  stopDragging() {
    const target = this.refs.gantt_operate_area_panel
    target.onmousemove = null;
    target.onmuseup = null;
    const that = this
    setTimeout(function () {
      that.isMouseDown = false
      that.setIsDragging(false)
    }, 1000)
  }

  //鼠标移动
  dashedMouseMove(e) {
    const { dataAreaRealHeight, gantt_board_id, group_view_type, show_board_fold } = this.props
    if (e.target.offsetTop >= dataAreaRealHeight) return //在全部分组外的其他区域（在创建项目那一栏）
    if (
      (e.target.dataset.targetclassname == 'specific_example') //不能滑动到某一个任务实例上
    ) {
      this.setState({
        dasheRectShow: false
      })
      return false
    }
    if (ganttIsFold({ gantt_board_id, group_view_type, show_board_fold })) {
      return
    }

    const { ceiHeight, ceilWidth } = this.props
    if (this.isMouseDown) { //按下的情况不处理
      return false
    }
    const { dasheRectShow, coperatedX } = this.state
    if (!dasheRectShow) {
      this.setState({
        dasheRectShow: true
      })
    }

    const target_0 = document.getElementById('gantt_card_out')
    const target_1 = document.getElementById('gantt_card_out_middle')
    // 取得鼠标位置
    let px = e.pageX - target_0.offsetLeft + target_1.scrollLeft - coperatedLeftDiv - coperatedX
    let py = e.pageY - target_0.offsetTop + target_1.scrollTop - dateAreaHeight

    const molX = px % ceilWidth
    const molY = py % (ganttIsFold({ gantt_board_id, group_view_type, show_board_fold }) ? ceiHeight * group_rows_fold : ceiHeight) //2为折叠的总行
    const mulX = Math.floor(px / ceilWidth)
    const mulY = Math.floor(py / ceiHeight)
    const delX = Number((molX / ceilWidth).toFixed(1))
    const delY = Number((molY / ceiHeight).toFixed(1))

    px = px - molX
    py = py - molY

    const property = {
      x: px,
      y: py,
      width: 40,
      height: task_item_height,
    }

    this.setState({
      currentRect: property,
      drag_holiday_count: 0,
    })
  }
  dashedMouseLeave(e) {
    if (!this.isMouseDown) {
      this.setState({
        dasheRectShow: false
      })
    }
  }
  // 在该区间内不能操作
  areaCanNotOperate = (e) => {
    const { group_list_area_section_height = [], list_group = [], gantt_board_id, group_view_type, show_board_fold } = this.props
    if (!ganttIsFold({ gantt_board_id, group_view_type, show_board_fold })) { //非折叠情况下不考虑
      return false
    }
    const target_0 = document.getElementById('gantt_card_out')
    const target_1 = document.getElementById('gantt_card_out_middle')
    // 取得鼠标位置
    const py = e.pageY - target_0.offsetTop + target_1.scrollTop - dateAreaHeight
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
  handleCreateTask({ start_end, top, not_create }) {
    const { dataAreaRealHeight } = this.props
    if (top >= dataAreaRealHeight) return //在全部分组外的其他区域（在创建项目那一栏）

    const { dispatch } = this.props
    const { gold_date_arr = [], ceilWidth, date_arr_one_level = [] } = this.props
    const { currentRect = {} } = this.state
    const { x, y, width, height } = currentRect
    let counter = 0
    let date = {}
    for (let val of date_arr_one_level) {
      counter += 1
      if (counter * ceilWidth > x + width) {
        date = val
        break
      }
    }
    const { timestamp, timestampEnd } = date
    const update_name = start_end == '1' ? 'create_start_time' : 'create_end_time'
    dispatch({
      type: getEffectOrReducerByName('updateDatas'),
      payload: {
        [update_name]: start_end == '1' ? timestamp : timestampEnd
      }
    })
    if (not_create) { //不创建和查看
      return
    }
    if (start_end == '2') { //拖拽或点击操作完成，进行生成单条任务逻辑
      this.setSpecilTaskExample({ top }) //出现任务创建或查看任务
    }
  }

  //获取当前所在的分组, 根据创建或者查看任务时的高度
  getCurrentGroup = ({ top }) => {
    if (top == undefined || top == null) {
      return
    }
    const getSum = (total, num) => {
      return total + num;
    }
    const { dispatch } = this.props
    const { group_list_area = [], list_group = [] } = this.props
    let conter_key = 0
    for (let i = 0; i < group_list_area.length; i++) {
      if (i == 0) {
        if (top < group_list_area[0]) {
          conter_key = 0
          break
        }
      } else {
        const arr = group_list_area.slice(0, i + 1)
        const sum = arr.reduce(getSum);
        if (top < sum) {
          conter_key = i
          break
        }
      }
    }
    const current_list_group_id = list_group[conter_key]['list_id']
    dispatch({
      type: getEffectOrReducerByName('updateDatas'),
      payload: {
        current_list_group_id
      }
    })

    return Promise.resolve({ current_list_group_id })
  }

  //点击某个实例,或者创建任务
  setSpecilTaskExample = ({ id, board_id, top }, e) => {
    const { dispatch, gantt_board_id } = this.props
    if (e) {
      e.stopPropagation()
    }
    this.getCurrentGroup({ top }).then(res => {
      if (id) { //如果有id 则是修改任务，否则是创建任务
        this.props.setTaskDetailModalVisibile && this.props.setTaskDetailModalVisibile()
        dispatch({
          type: 'publicTaskDetailModal/updateDatas',
          payload: {
            drawerVisible: true,
            card_id: id,
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
        if (group_view_type == '1') {
          if (gantt_board_id == 0) {
            if (!checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_CREATE, current_list_group_id)) {
              message.warn(NOT_HAS_PERMISION_COMFIRN)
              return
            }
          } else {
            if (!checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_CREATE, gantt_board_id)) {
              message.warn(NOT_HAS_PERMISION_COMFIRN)
              return
            }
          }
        }
        this.props.addTaskModalVisibleChange && this.props.addTaskModalVisibleChange(true)
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
        create_start_time_ <= Number(item.timestamp)
        && create_end_time_ >= Number(item.timestamp)
        && (item.is_week || item.festival_status == '1') //周末或者节假日
        && (item.festival_status != '2') //不是补班（周末补班不算）
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
    return (
      list_data.map((value2, key) => {
        // const { id, left, width, start_time, end_time } = value2
        const { end_time, left, top, width, height, name, id, board_id, is_realize, executors = [], label_data = [], is_has_start_time, is_has_end_time, start_time, due_time } = value2
        const { is_overdue, due_description } = filterDueTimeSpan({ start_time, due_time, is_has_end_time, is_has_start_time })
        return (
          <GetRowTaskItem
            key={`${id}_${start_time}_${end_time}_${left}_${top}`}
            itemValue={value2}
            setSpecilTaskExample={this.setSpecilTaskExample}
            ganttPanelDashedDrag={this.isDragging}
            getCurrentGroup={this.getCurrentGroup}
            list_id={list_id}
            task_is_dragging={this.task_is_dragging}
            setGoldDateArr={this.props.setGoldDateArr}
            setScrollPosition={this.props.setScrollPosition}
            setIsDragging={this.setIsDragging}
            setTaskIsDragging={this.setTaskIsDragging}
          />
        )
      })
    )
  }

  renderFoldTaskSummary = ({ list_id, list_data, board_fold_data = {}, group_index }) => {
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
      show_board_fold
    } = this.props

    return (
      <div className={indexStyles.gantt_operate_top}
        onMouseDown={this.dashedMousedown.bind(this)} //用来做拖拽虚线框
        onMouseMove={this.dashedMouseMove.bind(this)}
        onMouseLeave={this.dashedMouseLeave.bind(this)}
        id={'gantt_operate_area_panel'}
        ref={'gantt_operate_area_panel'}>
        {
          dasheRectShow
          && !this.task_is_dragging
          && (
            <div className={indexStyles.dasheRect} style={{
              left: currentRect.x + 1, top: currentRect.y,
              width: currentRect.width, height: ganttIsFold({ gantt_board_id, group_view_type, show_board_fold }) ? task_item_height_fold : task_item_height,//currentRect.height,
              boxSizing: 'border-box',
              marginTop: !ganttIsFold({ gantt_board_id, group_view_type, show_board_fold }) ? task_item_margin_top : (ceil_height_fold * group_rows_fold - task_item_height_fold) / 2, //task_item_margin_top,//
              color: 'rgba(0,0,0,0.45)',
              textAlign: 'right',
              lineHeight: ganttIsFold({ gantt_board_id, group_view_type, show_board_fold }) ? `${task_item_height_fold}px` : `${ceiHeight - task_item_margin_top}px`,
              paddingRight: 8,
              zIndex: this.isDragging ? 2 : 1
            }} >
              {Math.ceil(currentRect.width / ceilWidth) != 1 && Math.ceil(currentRect.width / ceilWidth) - drag_holiday_count}
              {Math.ceil(currentRect.width / ceilWidth) != 1 && (drag_holiday_count > 0 ? `+${drag_holiday_count}` : '')}
            </div>
          )}
        {list_group.map((value, key) => {
          const { list_data = [], list_id, board_fold_data } = value
          if (ganttIsFold({ gantt_board_id, group_view_type, show_board_fold })) {
            return (this.renderFoldTaskSummary({ list_id, list_data, board_fold_data, group_index: key }))
          } else {
            return (
              this.renderNormalTaskList({ list_id, list_data })
            )
          }
        })}

        {/* {list_group.map((value, key) => {
          const { lane_data, list_id, list_data = [] } = value
          const { milestones = {} } = lane_data
          return (
            <GetRowGanttItem key={list_id} itemKey={key} list_id={list_id} list_data={list_data} rows={group_rows[key]} milestones={milestones} />
          )
        })} */}
        <GetRowGanttVirtual />
        <GetRowGanttItemElse gantt_card_height={this.props.gantt_card_height} dataAreaRealHeight={this.props.dataAreaRealHeight} />
      </div>
    )
  }

}
//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ gantt: {
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
  }
} }) {
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
  }
}

