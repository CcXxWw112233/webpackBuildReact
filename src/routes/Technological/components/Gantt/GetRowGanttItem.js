import React, { Component } from 'react'
import { connect } from 'dva'
import indexStyles from './index.less'
import { isToday } from './base_utils'
import globalStyles from '@/globalset/css/globalClassName.less'
import MilestoneDetail from './components/milestoneDetail'
import { Dropdown, Menu, message } from 'antd'
import {
  ganttIsFold,
  hours_view_due_work_oclock,
  hours_view_start_work_oclock,
  hours_view_total
} from './constants'
import {
  caldiffDays,
  isSamDay,
  isSamHour,
  timestampToTimeNormal,
  transformTimestamp
} from '../../../../utils/util'
import { setBoardIdStorage } from '../../../../utils/businessFunction'
import Draggable from 'react-draggable'
import {
  getPageXY,
  getXYDropPosition,
  setDateWidthPositionWeekView,
  setDateWithPositionInYearView
} from './ganttBusiness'
import { isApiResponseOk } from '../../../../utils/handleResponseData'
import { updateMilestone } from '../../../../services/technological/task'

const MenuItem = Menu.Item
const getEffectOrReducerByName = name => `gantt/${name}`
@connect(mapStateToProps)
export default class GetRowGanttItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
      miletone_detail_modal_visible: false, //里程碑详情是否点开
      needs_task_arr: [] //实现以起始时间相同的为同一分组
    }
  }

  initSet(props) {
    const { list_id, list_data } = this.props
    // console.log(list_id, list_data)
    let start_time_arr = []
    let needs_task_arr = []
    const sortCreateTime = (a, b) => {
      return a.create_time - b.create_time
    }
    for (let val of list_data) {
      start_time_arr.push(val['start_time'])
    }
    start_time_arr = new Set(start_time_arr)
    for (let val of start_time_arr) {
      let arr = []
      for (let val2 of list_data) {
        if (val == val2['start_time']) {
          arr.push(val2)
        }
      }
      arr.sort(sortCreateTime)
      needs_task_arr = [].concat(needs_task_arr, arr)
    }
  }

  seeMiletones = () => {}

  isHasMiletoneList = timestamp => {
    const {
      milestoneMap = [],
      list_id,
      gantt_board_id,
      group_view_type,
      itemKey,
      gantt_view_mode
    } = this.props
    let flag = false //当前日期存在一级里程碑
    let has_child_flag = false //当前日期存在二级里程碑
    let current_date_miletones = [] //当前日期的所有里程碑列表
    let current_date_board_miletones = [] //当前日期对应的项目的所有一级里程碑列表
    let current_date_board_child_miletones = [] //当前日期对应的项目的所有er级里程碑列表

    let is_over_duetime = false
    let is_all_realized = '1'
    let is_all_child_realized = '1'
    if (!timestamp || group_view_type != '1') {
      //只有在项目视图才可以看
      return {
        flag,
        current_date_board_miletones
      }
    }
    // console.log('ssssssssss', { gantt_board_id, list_id })
    for (let key in milestoneMap) {
      // 是同一天，并且在全部项目下里程碑所属的board_id和对应的分组id相等
      if (gantt_view_mode == 'month') {
        if (isSamDay(Number(timestamp), Number(key) * 1000)) {
          current_date_miletones = current_date_miletones.concat(
            milestoneMap[key]
          )
        }
      }
      if (gantt_view_mode == 'hours') {
        if (isSamHour(Number(timestamp), Number(key) * 1000)) {
          current_date_miletones = current_date_miletones.concat(
            milestoneMap[key]
          )
        } else {
          if (isSamDay(Number(timestamp), Number(key) * 1000)) {
            //如果是同一天并且时间在工作区间外，将所有放在最后一个小时
            if (
              new Date(timestamp).getHours() ==
                hours_view_due_work_oclock - 1 &&
              (new Date(Number(key) * 1000).getHours() >=
                hours_view_due_work_oclock ||
                new Date(Number(key) * 1000).getHours() <
                  hours_view_start_work_oclock)
            ) {
              current_date_miletones = current_date_miletones.concat(
                milestoneMap[key]
              )
            }
          }
        }
      }
    }

    if (Number(timestamp) < new Date().getTime()) {
      //小于今天算逾期
      is_over_duetime = true
    }

    if (gantt_board_id == '0') {
      for (let val of current_date_miletones) {
        if (val['board_id'] == list_id) {
          flag = true
          current_date_board_miletones.push(val)
        }
      }
    } else {
      if (itemKey == '0') {
        for (let val of current_date_miletones) {
          //未归属分组的里程碑 和归属在第一个分组的里程碑
          if (!val['list_id'] || val['list_id'] == list_id) {
            if (val.parent_id == '0' || !val.parent_id) {
              //代表一级里程碑
              flag = true
              current_date_board_miletones.push(val)
            } else {
              //二级里程碑
              has_child_flag = true
              current_date_board_child_miletones.push(val)
            }
          }
        }
      } else {
        for (let val of current_date_miletones) {
          if (val['list_id'] == list_id) {
            if (val.parent_id == '0' || !val.parent_id) {
              //代表一级里程碑
              flag = true
              current_date_board_miletones.push(val)
            } else {
              //二级里程碑
              has_child_flag = true
              current_date_board_child_miletones.push(val)
            }
          }
        }
      }
      // if (current_date_miletones.length) {
      //   flag = true
      // }
      // current_date_board_miletones = current_date_miletones
    }

    for (let val of current_date_board_miletones) {
      if (val['is_all_realized'] == '0') {
        is_all_realized = '0'
        break
      }
    }
    for (let val of current_date_board_child_miletones) {
      if (val['is_all_realized'] == '0') {
        is_all_child_realized = '0'
        break
      }
    }
    return {
      is_over_duetime,
      flag,
      is_all_realized,
      is_all_child_realized,
      current_date_board_miletones,
      has_child_flag,
      current_date_board_child_miletones
    }
  }
  isHasMiletoneListYear = ({
    year,
    month,
    last_date,
    timestamp,
    timestampEnd
  }) => {
    const {
      milestoneMap = [],
      list_id,
      gantt_board_id,
      group_view_type,
      itemKey
    } = this.props
    let flag = false
    let current_date_miletones = [] //当前日期的所有里程碑列表
    let current_date_board_miletones = [] //当前日期对应的项目的所有里程碑列表
    let current_date_board_child_miletones = [] //当前日期对应的项目的所有er级里程碑列表
    let has_child_flag = false //当前日期存在二级里程碑
    let is_over_duetime = false
    let is_all_realized = '1'
    let is_all_child_realized = '1'
    if (!timestamp || group_view_type != '1' || !timestampEnd) {
      //只有在项目视图才可以看
      return {
        flag,
        current_date_board_miletones
      }
    }
    for (let key in milestoneMap) {
      const cal_timestamp = Number(key) * 1000
      if (cal_timestamp >= timestamp && cal_timestamp <= timestampEnd) {
        //在该月份区间内
        current_date_miletones = current_date_miletones.concat(
          milestoneMap[key]
        )
      }
    }

    if (Number(timestampEnd) < new Date().getTime()) {
      //小于今天算逾期
      is_over_duetime = true
    }

    if (gantt_board_id == '0') {
      for (let val of current_date_miletones) {
        if (val['board_id'] == list_id) {
          flag = true
          current_date_board_miletones.push(val)
        }
      }
    } else {
      if (itemKey == '0') {
        for (let val of current_date_miletones) {
          //未归属分组的里程碑 和归属在第一个分组的里程碑
          if (!val['list_id'] || val['list_id'] == list_id) {
            if (val.parent_id == '0' || !val.parent_id) {
              //代表一级里程碑
              flag = true
              current_date_board_miletones.push(val)
            } else {
              //二级里程碑
              has_child_flag = true
              current_date_board_child_miletones.push(val)
            }
          }
        }
      } else {
        for (let val of current_date_miletones) {
          if (val['list_id'] == list_id) {
            if (val.parent_id == '0' || !val.parent_id) {
              //代表一级里程碑
              flag = true
              current_date_board_miletones.push(val)
            } else {
              //二级里程碑
              has_child_flag = true
              current_date_board_child_miletones.push(val)
            }
          }
        }
      }
      // if (current_date_miletones.length) {
      //   flag = true
      // }
      // current_date_board_miletones = current_date_miletones
    }

    for (let val of current_date_board_miletones) {
      if (val['is_all_realized'] == '0') {
        is_all_realized = '0'
        break
      }
    }
    for (let val of current_date_board_child_miletones) {
      if (val['is_all_realized'] == '0') {
        is_all_child_realized = '0'
        break
      }
    }
    let every_day_miletones = []
    let every_day_child_miletones = []
    const date_arr = []
    for (let i = 1; i < 32; i++) {
      date_arr.push(i)
    }
    every_day_miletones = date_arr.map(key => {
      let milestones = []
      for (let val of current_date_board_miletones) {
        let date = new Date(transformTimestamp(val.deadline)).getDate()
        if (date == key) {
          milestones.push(val)
        }
      }
      return {
        date: key,
        milestones
      }
    })

    every_day_child_miletones = date_arr.map(key => {
      let milestones = []
      for (let val of current_date_board_child_miletones) {
        let date = new Date(transformTimestamp(val.deadline)).getDate()
        if (date == key) {
          milestones.push(val)
        }
      }
      return {
        day: key,
        milestones
      }
    })

    every_day_miletones = every_day_miletones.filter(
      item => item.milestones.length
    )
    every_day_child_miletones = every_day_child_miletones.filter(
      item => item.milestones.length
    )
    return {
      is_over_duetime,
      flag,
      has_child_flag,
      is_all_realized,
      is_all_child_realized,
      every_day_miletones,
      every_day_child_miletones,
      current_date_board_miletones,
      current_date_board_child_miletones
    }
  }

  isHasMilestoneListWeek = ({ timestamp, timestampEnd }) => {
    const {
      milestoneMap = [],
      list_id,
      gantt_board_id,
      group_view_type,
      itemKey
    } = this.props
    let flag = false
    let current_date_miletones = [] //当前日期的所有里程碑列表
    let current_date_board_miletones = [] //当前日期对应的项目的所有里程碑列表
    let current_date_board_child_miletones = [] //当前日期对应的项目的所有er级里程碑列表
    let has_child_flag = false //当前日期存在二级里程碑
    let is_over_duetime = false
    let is_all_realized = '1'
    let is_all_child_realized = '1'
    if (!timestamp || group_view_type != '1' || !timestampEnd) {
      //只有在项目视图才可以看
      return {
        flag,
        current_date_board_miletones
      }
    }
    for (let key in milestoneMap) {
      const cal_timestamp = Number(key) * 1000
      if (cal_timestamp >= timestamp && cal_timestamp <= timestampEnd) {
        //在该月份区间内
        current_date_miletones = current_date_miletones.concat(
          milestoneMap[key]
        )
      }
    }

    if (Number(timestampEnd) < new Date().getTime()) {
      //小于今天算逾期
      is_over_duetime = true
    }

    if (gantt_board_id == '0') {
      for (let val of current_date_miletones) {
        if (val['board_id'] == list_id) {
          flag = true
          current_date_board_miletones.push(val)
        }
      }
    } else {
      if (itemKey == '0') {
        for (let val of current_date_miletones) {
          //未归属分组的里程碑 和归属在第一个分组的里程碑
          if (!val['list_id'] || val['list_id'] == list_id) {
            if (val.parent_id == '0' || !val.parent_id) {
              //代表一级里程碑
              flag = true
              current_date_board_miletones.push(val)
            } else {
              //二级里程碑
              has_child_flag = true
              current_date_board_child_miletones.push(val)
            }
          }
        }
      } else {
        for (let val of current_date_miletones) {
          if (val['list_id'] == list_id) {
            if (val.parent_id == '0' || !val.parent_id) {
              //代表一级里程碑
              flag = true
              current_date_board_miletones.push(val)
            } else {
              //二级里程碑
              has_child_flag = true
              current_date_board_child_miletones.push(val)
            }
          }
        }
      }
      // if (current_date_miletones.length) {
      //   flag = true
      // }
      // current_date_board_miletones = current_date_miletones
    }

    for (let val of current_date_board_miletones) {
      if (val['is_all_realized'] == '0') {
        is_all_realized = '0'
        break
      }
    }
    for (let val of current_date_board_child_miletones) {
      if (val['is_all_realized'] == '0') {
        is_all_child_realized = '0'
        break
      }
    }
    let every_day_miletones = []
    let every_day_child_miletones = []
    const day = [1, 2, 3, 4, 5, 6, 7]
    every_day_miletones = day.map(key => {
      let milestones = []
      for (let val of current_date_board_miletones) {
        let day = new Date(transformTimestamp(val.deadline)).getDay()
        day = day == 0 ? 7 : day
        if (day == key) {
          milestones.push(val)
        }
      }
      return {
        day: key,
        milestones
      }
    })
    every_day_child_miletones = day.map(key => {
      let milestones = []
      for (let val of current_date_board_child_miletones) {
        let day = new Date(transformTimestamp(val.deadline)).getDay()
        day = day == 0 ? 7 : day
        if (day == key) {
          milestones.push(val)
        }
      }
      return {
        day: key,
        milestones
      }
    })
    every_day_miletones = every_day_miletones.filter(
      item => item.milestones.length
    )
    every_day_child_miletones = every_day_child_miletones.filter(
      item => item.milestones.length
    )
    return {
      is_over_duetime,
      flag,
      has_child_flag,
      is_all_realized,
      is_all_child_realized,
      current_date_board_miletones,
      current_date_board_child_miletones,
      every_day_miletones: every_day_miletones,
      every_day_child_miletones
    }
  }

  // 根据下一个里程碑日期，来获取当前里程碑日期的‘name1,name2,name3...’应该有的宽度
  setMiletonesNamesWidth = timestamp => {
    const { milestoneMap = {}, ceilWidth, gantt_board_id } = this.props
    const { list_id } = this.props //gantt_board_id为0的情况下，分组id就是各个项目的id
    let times_arr = Object.keys(milestoneMap) //[timestamp1, timestamp2,...]
    if (gantt_board_id == '0') {
      //以分组划分，过滤掉不属于该项目分组的里程碑所属于的时间
      times_arr = times_arr.filter(
        time =>
          milestoneMap[time].findIndex(item => item.board_id == list_id) != -1
      )
    }
    // console.log('ssssss', times_arr)
    times_arr = times_arr.sort((a, b) => Number(a) - Number(b))
    const index = times_arr.findIndex(item => isSamDay(item, timestamp)) //对应上当前日期所属的下标
    const next_miletones_time = times_arr[index + 1] //当前里程碑日期的对应下一个里程碑日期所在时间
    if (!next_miletones_time) {
      return 'auto'
    }
    return caldiffDays(timestamp, next_miletones_time) * ceilWidth
  }

  // 渲染里程碑的名字列表
  renderMiletonesNames = (list = []) => {
    const names = list.reduce((total, item, index) => {
      const split = index < list.length - 1 ? '，' : ''
      return total + item.name + split
    }, '')
    return names
  }
  // 设置里程碑的名字随着窗口上下滚动保持在窗口顶部
  setMiletonesNamesPostionTop = () => {
    let top = 0
    const {
      target_scrollTop,
      itemKey = 0,
      group_list_area_section_height = [],
      gantt_board_id
    } = this.props
    // console.log('ssssss_top',
    //   target_scrollTop,
    //   group_list_area_section_height[itemKey - 1],
    //   group_list_area_section_height[itemKey],
    //   target_scrollTop > group_list_area_section_height[itemKey - 1] && target_scrollTop < group_list_area_section_height[itemKey]
    // )
    if (gantt_board_id && gantt_board_id != '0') {
      //项目任务分组的情况下
      return target_scrollTop
    }
    if (itemKey == 0) {
      if (target_scrollTop < group_list_area_section_height[itemKey]) {
        top = target_scrollTop
      }
      // console.log('ssssss_top_11', itemKey, target_scrollTop, group_list_area_section_height[itemKey])
    } else {
      if (
        target_scrollTop > group_list_area_section_height[itemKey - 1] &&
        target_scrollTop < group_list_area_section_height[itemKey]
      ) {
        top = target_scrollTop - group_list_area_section_height[itemKey - 1]
      }
      // console.log('ssssss_top_22', itemKey, target_scrollTop, group_list_area_section_height[itemKey])
    }
    return top
  }

  // 里程碑是否过期的颜色设置
  setMiletonesColor = ({ is_over_duetime, has_lcb, is_all_realized }) => {
    if (!has_lcb) {
      return ''
    }
    if (is_over_duetime) {
      if (is_all_realized == '0') {
        //存在未完成任务
        return ''
        // return '#FFA39E'
      } else {
        //全部任务已完成
        return '#9EA6C2'
        return 'rgba(0,0,0,0.15)'
      }
    }
    // if (is_all_realized == '0') { //存在未完成任务
    //   if (is_over_duetime) {
    //     return '#FFA39E'
    //   }
    // } else { //全部任务已完成
    //   return 'rgba(0,0,0,0.15)'
    // }

    return ''
  }

  set_miletone_detail_modal_visible = () => {
    const { miletone_detail_modal_visible } = this.state
    this.setState({
      miletone_detail_modal_visible: !miletone_detail_modal_visible
    })
  }

  // 里程碑详情和列表
  renderLCBList = (current_date_miletones, timestamp) => {
    return (
      <Menu
        onMouseDown={e => e.stopPropagation()}
        onMouseUp={e => e.stopPropagation()}
        onClick={e => this.selectLCB(e, timestamp)}
        style={{ width: 216 }}
        data-targetclassname="specific_example_milestone"
      >
        {current_date_miletones.map((value, key) => {
          const { id, name, board_id } = value
          return (
            <MenuItem
              data-targetclassname="specific_example_milestone"
              className={globalStyles.global_ellipsis}
              style={{ width: 216 }}
              key={`${board_id}__${id}`}
            >
              {name}
            </MenuItem>
          )
        })}
      </Menu>
    )
  }
  // 过滤项目成员
  setCurrentSelectedProjectMembersList = ({ board_id }) => {
    const { about_user_boards = [] } = this.props
    const users = (
      about_user_boards.find(item => item.board_id == board_id) || {}
    ).users
    // console.log('ssssssss', { users, board_id})
    this.setState({
      currentSelectedProjectMembersList: users
    })
  }
  // 选择里程碑
  selectLCB = (e, timestamp) => {
    e.domEvent.stopPropagation()
    const idarr = e.key.split('__')
    const id = idarr[1]
    const board_id = idarr[0]
    // this.setCurrentSelectedProjectMembersList({ board_id })
    // this.set_miletone_detail_modal_visible()
    // this.getMilestoneDetail(id)
    //更新里程碑id,在里程碑的生命周期会监听到id改变，发生请求
    const { dispatch } = this.props
    setBoardIdStorage(board_id)

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
    dispatch({
      type: 'projectDetail/projectDetailInfo',
      payload: {
        id: board_id
      }
    })
  }

  // 甘特图信息变化后，实时触发甘特图渲染在甘特图上变化
  handleMiletonsChangeMountInGantt = () => {
    const { dispatch } = this.props
    return new Promise(resolve => {
      dispatch({
        type: 'gantt/getGttMilestoneList',
        payload: {}
      }).then(res => resolve())
    })
  }
  deleteMiletone = ({ id }) => {
    const { milestoneMap = {}, dispatch } = this.props
    const new_milestoneMap = { ...milestoneMap }
    let flag = false
    for (let key in new_milestoneMap) {
      const item = new_milestoneMap[key]
      const length = item.length
      for (let i = 0; i < length; i++) {
        if (item[i].id == id) {
          flag = true
          new_milestoneMap[key].splice(i, 1)
          break
        }
      }
      if (flag) {
        break
      }
    }
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

  // 里程碑的事件-----------start
  target_event_bubble = {
    onClick: e => e.stopPropagation(),
    onMouseMove: e => e.stopPropagation(),
    onMouseDown: e => e.stopPropagation(),
    onMouseUp: e => e.stopPropagation(),
    onMouseEnter: () => {
      //在鼠标hover到任务条上，非创建任务时，将虚线框隐藏
      const { ganttPanelDashedDrag } = this.props
      if (!ganttPanelDashedDrag) {
        this.props.setDasheRectShow && this.props.setDasheRectShow(false)
      }
    }
  }
  milestoneDragStart = e => {
    this.milestone_drag_ele = e //缓存拖拽的里程碑节点
    this.milestone_initial_left = e.target.style.left
    const { x } = getXYDropPosition(e, {
      gantt_head_width: this.props.gantt_head_width
    })
    this.milestone_drag_point_diff = x - this.milestone_initial_left //做初始标记，由于鼠标拖拽的位置在该元素上不同，记录元素最左边和鼠标落点的差值
    this.drag_ele = e.currentTarget

    // console.log('sssssssss_00', {
    //   x,
    //   milestone_initial_left: this.milestone_initial_left,
    //   milestone_drag_point_diff: this.milestone_drag_point_diff,
    //   target: e.currentTarget.style.left
    // })
  }
  milestoneDraging = e => {
    const { pageX } = getPageXY(e)
    if (!pageX) return
    this.milestone_drag_ele = e
    this.milestone_dragging = true
    this.setState({
      dragg_milestone_err: false
    })
    // console.log('sssssssss_11a', this.milestone_drag_ele)
  }
  milestoneDragStop = async (e, { milestones = [] }) => {
    if (!milestones.length) return
    const {
      gantt_view_mode,
      date_arr_one_level,
      ceilWidth,
      gantt_head_width,
      gantt_board_id,
      list_id
    } = this.props
    setTimeout(() => {
      this.milestone_dragging = false
    }, 200)
    let { x } =
      getXYDropPosition(this.milestone_drag_ele, {
        gantt_head_width
      }) || {}
    // console.log('sssssssssss_22_0', x, this.milestone_drag_point_diff)

    // x = x - this.milestone_drag_point_diff + ceilWidth //校准
    // const { x } = (await this.setCurrentRect(this.milestone_drag_ele)) || {}
    let date = {} //具体日期
    let counter = 0
    if (gantt_view_mode == 'month' || gantt_view_mode == 'hours') {
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
    //回退位置
    const resetNodeTransform = () => {
      const elements_ = document.getElementsByClassName(
        'react-draggable-dragged'
      )
      const elements = [...elements_]
      elements.forEach(node => {
        node.style.transform = 'translate(0px, 0px)'
      })
    }
    const params = {
      id: milestones[0].id,
      deadline: timestampEnd
    }
    if (gantt_board_id == '0') {
      setBoardIdStorage(list_id)
    }
    return new Promise((resolve, reject) => {
      updateMilestone(
        {
          ...params
        },
        { isNotLoading: false }
      )
        .then(async res => {
          if (isApiResponseOk(res)) {
            await this.handleMiletonsChangeMountInGantt()
            message.success('更新成功')
            resolve(res)
          } else {
            message.error(res.message)
            this.setState(
              {
                dragg_milestone_err: true
              },
              () => {
                resetNodeTransform()
              }
            )
            reject()
          }
        })
        .catch(err => {
          message.error('更新失败')
          this.setState(
            {
              dragg_milestone_err: true
            },
            () => {
              resetNodeTransform()
            }
          )
          reject()
        })
    })
  }
  // 里程碑的事件 -------------end

  // 拖拽里程碑包裹
  renderDragWrapper = (milestones = [], dom) => {
    return milestones.length == 1 ? (
      <Draggable
        data-targetclassname="specific_example_milestone"
        axis="x"
        {...(this.state.dragg_milestone_err
          ? { position: { x: 0, y: 0 } }
          : {})} //拖拽错误后回归原位
        {...this.target_event_bubble}
        onStart={this.milestoneDragStart}
        onDrag={this.milestoneDraging}
        onStop={e =>
          this.milestoneDragStop(e, {
            milestones
          })
        }
      >
        {dom}
      </Draggable>
    ) : (
      dom
    )
  }

  // 渲染月视图日期
  renderMonthView = (date_inner = []) => {
    const { rows = 7, itemKey } = this.props
    const {
      ceiHeight,
      gantt_board_id,
      group_view_type,
      show_board_fold,
      group_list_area_section_height,
      list_id,
      gantt_view_mode,
      ceilWidth
    } = this.props
    const item_height = rows * ceiHeight
    return (
      <>
        {date_inner.map((value2, key2) => {
          const { week_day, timestamp, timestampEnd } = value2
          const {
            flag: has_lcb,
            current_date_board_miletones = [],
            is_over_duetime,
            is_all_realized,
            is_all_child_realized,
            has_child_flag,
            current_date_board_child_miletones = []
          } = this.isHasMiletoneList(Number(timestampEnd))
          return (
            <div
              className={`${indexStyles.ganttDetailItem}`}
              data-list_id={list_id}
              data-start_time={timestamp}
              data-end_time={timestampEnd}
              key={`${timestamp}_${
                (current_date_board_miletones[0] || {}).id
              }_${(current_date_board_child_miletones[0] || {}).id}`}
              data-targetclassname="specific_example_milestone"
              style={{
                borderRight:
                  gantt_view_mode == 'relative_time' &&
                  ![5, 6, 0].includes(week_day)
                    ? 'none'
                    : '',
                backgroundColor:
                  week_day == 0 || week_day == 6
                    ? 'rgb(245,245,245)'
                    : 'rgb(250,250,250)'
              }}
            >
              <div
                data-targetclassname="specific_example_milestone"
                style={{ position: 'relative', zIndex: 3 }}
                // {...this.target_event_bubble}
              >
                {/* 12为上下margin的总和 */}
                {group_view_type == '1' && (
                  // (gantt_board_id == '0' ||
                  //   (gantt_board_id != '0' && itemKey == 0)) &&
                  <>
                    <div
                      style={{ position: 'relative', width: 0 }}
                      data-targetclassname="specific_example_milestone"
                    >
                      {this.renderDragWrapper(
                        current_date_board_miletones,
                        <div
                          style={{ position: 'relative', width: 0 }}
                          data-targetclassname="specific_example_milestone"
                        >
                          {has_lcb && (
                            <>
                              {/* 旗帜 */}
                              <Dropdown
                                overlay={this.renderLCBList(
                                  current_date_board_miletones,
                                  timestamp
                                )}
                              >
                                <div
                                  className={`${indexStyles.board_miletiones_flag} ${globalStyles.authTheme}`}
                                  data-targetclassname="specific_example_milestone"
                                  onClick={this.seeMiletones}
                                  // onMouseDown={e => e.stopPropagation()}
                                  style={{
                                    color: this.setMiletonesColor({
                                      is_over_duetime,
                                      has_lcb,
                                      is_all_realized
                                    })
                                  }}
                                >
                                  &#xe6a0;
                                </div>
                              </Dropdown>
                              {/* 渲染里程碑名称铺开 */}
                              <Dropdown
                                overlay={this.renderLCBList(
                                  current_date_board_miletones,
                                  timestamp
                                )}
                              >
                                <div
                                  className={`${indexStyles.board_miletiones_names} ${globalStyles.global_ellipsis}`}
                                  data-targetclassname="specific_example_milestone"
                                  style={{
                                    top: this.setMiletonesNamesPostionTop(),
                                    maxWidth:
                                      this.setMiletonesNamesWidth(
                                        timestampEnd
                                      ) - 30,
                                    color: this.setMiletonesColor({
                                      is_over_duetime,
                                      has_lcb,
                                      is_all_realized
                                    })
                                  }}
                                >
                                  {this.renderMiletonesNames(
                                    current_date_board_miletones
                                  )}
                                </div>
                              </Dropdown>
                              <div
                                data-targetclassname="specific_example_milestone"
                                className={`${indexStyles.board_miletiones_flagpole2}`}
                                onClick={this.seeMiletones}
                                style={{
                                  background: this.setMiletonesColor({
                                    is_over_duetime,
                                    has_lcb,
                                    is_all_realized
                                  })
                                }}
                                onMouseDown={e => e.stopPropagation()}
                                onMouseOver={e => e.stopPropagation()}
                              />
                              <div
                                data-targetclassname="specific_example_milestone"
                                className={`${indexStyles.board_miletiones_flagpole}`}
                                style={{
                                  height:
                                    gantt_board_id != '0'
                                      ? itemKey == '0' &&
                                        current_date_board_miletones[0]
                                          .list_id != list_id
                                        ? group_list_area_section_height[
                                            group_list_area_section_height.length -
                                              1
                                          ] - 11 //在任务分组视图下
                                        : item_height - 12
                                      : ganttIsFold({
                                          gantt_board_id,
                                          group_view_type,
                                          show_board_fold,
                                          gantt_view_mode
                                        })
                                      ? 29
                                      : item_height - 12, //,
                                  //  backgroundColor: is_over_duetime ? '#FFA39E' : '#FFC069' ,
                                  background: this.setMiletonesColor({
                                    is_over_duetime,
                                    has_lcb,
                                    is_all_realized
                                  })
                                }}
                                onClick={this.seeMiletones}
                                onMouseDown={e => e.stopPropagation()}
                                onMouseOver={e => e.stopPropagation()}
                                // onMouseMove
                              />
                            </>
                          )}
                        </div>
                      )}

                      {this.renderDragWrapper(
                        current_date_board_child_miletones,
                        <div
                          style={{ position: 'relative', width: 0 }}
                          data-targetclassname="specific_example_milestone"
                        >
                          {has_child_flag && (
                            <>
                              <Dropdown
                                overlay={this.renderLCBList(
                                  current_date_board_child_miletones,
                                  timestamp
                                )}
                              >
                                <div
                                  data-targetclassname="specific_example_milestone"
                                  className={indexStyles.board_miletiones_flag2}
                                  style={{
                                    top: this.setMiletonesNamesPostionTop(),
                                    left: (ceilWidth - 14) / 2,
                                    backgroundColor: this.setMiletonesColor({
                                      is_over_duetime,
                                      has_lcb: has_child_flag,
                                      is_all_realized: is_all_child_realized
                                    })
                                  }}
                                />
                              </Dropdown>
                              <Dropdown
                                overlay={this.renderLCBList(
                                  current_date_board_child_miletones,
                                  timestamp
                                )}
                              >
                                <div
                                  className={`${indexStyles.board_miletiones_names} ${globalStyles.global_ellipsis}`}
                                  data-targetclassname="specific_example_milestone"
                                  style={{
                                    top: this.setMiletonesNamesPostionTop(),
                                    maxWidth:
                                      this.setMiletonesNamesWidth(
                                        timestampEnd
                                      ) - 30,
                                    color: this.setMiletonesColor({
                                      is_over_duetime,
                                      has_lcb: has_child_flag,
                                      is_all_realized: is_all_child_realized
                                    }),
                                    paddingTop: 2,
                                    left: (ceilWidth - 14) / 2 + 16,
                                    marginTop: -8
                                  }}
                                >
                                  {this.renderMiletonesNames(
                                    current_date_board_child_miletones
                                  )}
                                </div>
                              </Dropdown>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {/* 旗杆 */}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </>
    )
  }
  // 渲染时视图日期
  renderHourView = (date_inner = []) => {
    const { rows = 7, itemKey } = this.props
    const {
      ceiHeight,
      gantt_board_id,
      group_view_type,
      show_board_fold,
      group_list_area_section_height,
      list_id,
      gantt_view_mode,
      ceilWidth
    } = this.props
    const item_height = rows * ceiHeight
    return (
      <>
        {date_inner.map((value2, key2) => {
          const { week_day, timestamp, timestampEnd } = value2
          const {
            flag: has_lcb,
            current_date_board_miletones = [],
            is_over_duetime,
            is_all_realized,
            is_all_child_realized,
            has_child_flag,
            current_date_board_child_miletones = []
          } = this.isHasMiletoneList(Number(timestampEnd))
          return (
            <div
              className={`${indexStyles.ganttDetailItem}`}
              data-list_id={list_id}
              data-start_time={timestamp}
              data-end_time={timestampEnd}
              key={`${timestamp}_${
                (current_date_board_miletones[0] || {}).id
              }_${(current_date_board_child_miletones[0] || {}).id}`}
              data-targetclassname="specific_example_milestone"
              style={{
                borderRight:
                  key2 == hours_view_total - 1
                    ? '1px solid rgba(154, 159, 166, 0.15)'
                    : 'none',
                width: ceilWidth,
                backgroundColor: 'rgb(245,245,245)'
              }}
            >
              <div
                data-targetclassname="specific_example_milestone"
                style={{ position: 'relative', zIndex: 3 }}
                // {...this.target_event_bubble}
              >
                {/* 12为上下margin的总和 */}
                {group_view_type == '1' && (
                  // (gantt_board_id == '0' ||
                  //   (gantt_board_id != '0' && itemKey == 0)) &&
                  <>
                    <div
                      style={{ position: 'relative', width: 0 }}
                      data-targetclassname="specific_example_milestone"
                    >
                      {this.renderDragWrapper(
                        current_date_board_miletones,
                        <div
                          style={{ position: 'relative', width: 0 }}
                          data-targetclassname="specific_example_milestone"
                        >
                          {has_lcb && (
                            <>
                              {/* 旗帜 */}
                              <Dropdown
                                overlay={this.renderLCBList(
                                  current_date_board_miletones,
                                  timestamp
                                )}
                              >
                                <div
                                  className={`${indexStyles.board_miletiones_flag} ${globalStyles.authTheme}`}
                                  data-targetclassname="specific_example_milestone"
                                  onClick={this.seeMiletones}
                                  // onMouseDown={e => e.stopPropagation()}
                                  style={{
                                    color: this.setMiletonesColor({
                                      is_over_duetime,
                                      has_lcb,
                                      is_all_realized
                                    }),
                                    left: ceilWidth - 1
                                  }}
                                >
                                  &#xe6a0;
                                </div>
                              </Dropdown>
                              {/* 渲染里程碑名称铺开 */}
                              <Dropdown
                                overlay={this.renderLCBList(
                                  current_date_board_miletones,
                                  timestamp
                                )}
                              >
                                <div
                                  className={`${indexStyles.board_miletiones_names} ${globalStyles.global_ellipsis}`}
                                  data-targetclassname="specific_example_milestone"
                                  style={{
                                    top: this.setMiletonesNamesPostionTop(),
                                    maxWidth:
                                      this.setMiletonesNamesWidth(
                                        timestampEnd
                                      ) - 30,
                                    color: this.setMiletonesColor({
                                      is_over_duetime,
                                      has_lcb,
                                      is_all_realized
                                    }),
                                    left: 40
                                  }}
                                >
                                  {this.renderMiletonesNames(
                                    current_date_board_miletones
                                  )}
                                </div>
                              </Dropdown>
                              <div
                                data-targetclassname="specific_example_milestone"
                                className={`${indexStyles.board_miletiones_flagpole2}`}
                                onClick={this.seeMiletones}
                                style={{
                                  background: this.setMiletonesColor({
                                    is_over_duetime,
                                    has_lcb,
                                    is_all_realized
                                  }),
                                  left: ceilWidth - 4
                                }}
                                onMouseDown={e => e.stopPropagation()}
                                onMouseOver={e => e.stopPropagation()}
                              />
                              <div
                                data-targetclassname="specific_example_milestone"
                                className={`${indexStyles.board_miletiones_flagpole}`}
                                style={{
                                  height:
                                    gantt_board_id != '0'
                                      ? itemKey == '0' &&
                                        current_date_board_miletones[0]
                                          .list_id != list_id
                                        ? group_list_area_section_height[
                                            group_list_area_section_height.length -
                                              1
                                          ] - 11 //在任务分组视图下
                                        : item_height - 12
                                      : ganttIsFold({
                                          gantt_board_id,
                                          group_view_type,
                                          show_board_fold,
                                          gantt_view_mode
                                        })
                                      ? 29
                                      : item_height - 12, //,
                                  //  backgroundColor: is_over_duetime ? '#FFA39E' : '#FFC069' ,
                                  background: this.setMiletonesColor({
                                    is_over_duetime,
                                    has_lcb,
                                    is_all_realized
                                  }),
                                  left: ceilWidth - 4
                                }}
                                onClick={this.seeMiletones}
                                onMouseDown={e => e.stopPropagation()}
                                onMouseOver={e => e.stopPropagation()}
                                // onMouseMove
                              />
                            </>
                          )}
                        </div>
                      )}

                      {this.renderDragWrapper(
                        current_date_board_child_miletones,
                        <div
                          style={{ position: 'relative', width: 0 }}
                          data-targetclassname="specific_example_milestone"
                        >
                          {has_child_flag && (
                            <>
                              <Dropdown
                                overlay={this.renderLCBList(
                                  current_date_board_child_miletones,
                                  timestamp
                                )}
                              >
                                <div
                                  data-targetclassname="specific_example_milestone"
                                  className={indexStyles.board_miletiones_flag2}
                                  style={{
                                    top: this.setMiletonesNamesPostionTop(),
                                    left: (ceilWidth - 14) / 2,
                                    backgroundColor: this.setMiletonesColor({
                                      is_over_duetime,
                                      has_lcb: has_child_flag,
                                      is_all_realized: is_all_child_realized
                                    })
                                  }}
                                />
                              </Dropdown>
                              <Dropdown
                                overlay={this.renderLCBList(
                                  current_date_board_child_miletones,
                                  timestamp
                                )}
                              >
                                <div
                                  className={`${indexStyles.board_miletiones_names} ${globalStyles.global_ellipsis}`}
                                  data-targetclassname="specific_example_milestone"
                                  style={{
                                    top: this.setMiletonesNamesPostionTop(),
                                    maxWidth:
                                      this.setMiletonesNamesWidth(
                                        timestampEnd
                                      ) - 30,
                                    color: this.setMiletonesColor({
                                      is_over_duetime,
                                      has_lcb: has_child_flag,
                                      is_all_realized: is_all_child_realized
                                    }),
                                    paddingTop: 2,
                                    left: (ceilWidth - 14) / 2 + 16,
                                    marginTop: -8
                                  }}
                                >
                                  {this.renderMiletonesNames(
                                    current_date_board_child_miletones
                                  )}
                                </div>
                              </Dropdown>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {/* 旗杆 */}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </>
    )
  }
  // renderHourView = (date_inner = []) => {
  //   const { rows = 7, itemKey } = this.props
  //   const {
  //     ceiHeight,
  //     gantt_board_id,
  //     group_view_type,
  //     show_board_fold,
  //     group_list_area_section_height,
  //     list_id,
  //     gantt_view_mode,
  //     ceilWidth
  //   } = this.props
  //   const item_height = rows * ceiHeight
  //   return (
  //     <>
  //       {date_inner.map((value2, key2) => {
  //         const { timestamp, timestampEnd } = value2
  //         return (
  //           <div
  //             className={`${indexStyles.ganttDetailItem}`}
  //             data-list_id={list_id}
  //             data-start_time={timestamp}
  //             data-end_time={timestampEnd}
  //             key={timestamp}
  //             style={{
  //               borderRight:
  //                 key2 == hours_view_total - 1
  //                   ? '1px solid rgba(154, 159, 166, 0.15)'
  //                   : 'none',
  //               width: ceilWidth,
  //               backgroundColor: 'rgb(245,245,245)'
  //             }}
  //           ></div>
  //         )
  //       })}
  //     </>
  //   )
  // }
  // 渲染年视图日期
  renderYearView = (date_inner = []) => {
    const {
      gantt_view_mode,
      list_id,
      ceiHeight,
      ceilWidth,
      group_view_type,
      gantt_board_id,
      itemKey,
      show_board_fold,
      group_list_area_section_height,
      rows
    } = this.props
    const item_height = rows * ceiHeight

    return (
      <>
        {date_inner.map((value2, key2) => {
          const {
            month,
            last_date,
            year,
            timestamp,
            timestampEnd,
            description
          } = value2
          const {
            flag: has_lcb,
            current_date_board_miletones = [],
            current_date_board_child_miletones,
            has_child_flag,
            every_day_child_miletones = [],
            is_over_duetime,
            is_all_realized,
            is_all_child_realized,
            every_day_miletones = []
          } = this.isHasMiletoneListYear({
            year,
            month,
            last_date,
            timestamp,
            timestampEnd
          })
          if (current_date_board_miletones.length)
            console.log(
              'current_date_board_miletones',
              current_date_board_miletones,
              every_day_miletones,
              has_lcb,
              timestampToTimeNormal(timestamp)
            )
          return (
            <div
              className={`${indexStyles.ganttDetailItem}`}
              data-list_id={list_id}
              data-start_time={timestamp}
              data-end_time={timestampEnd}
              key={timestamp}
              style={{
                backgroundColor: 'rgb(245,245,245)',
                width: ceilWidth * last_date
              }}
            >
              <div style={{ display: 'flex' }}>
                {group_view_type == '1' && (
                  <>
                    {every_day_miletones.map(item => {
                      const { date, milestones = [] } = item
                      return this.renderDragWrapper(
                        milestones,
                        <div
                          data-targetclassname="specific_example_milestone"
                          style={{ width: 'auto', zIndex: 1 }}
                        >
                          <>
                            {has_lcb && (
                              <>
                                <Dropdown
                                  overlay={this.renderLCBList(
                                    milestones,
                                    timestamp
                                  )}
                                >
                                  <div
                                    style={{ position: 'relative', width: 0 }}
                                  >
                                    {/* 旗帜 */}
                                    <div
                                      className={`${indexStyles.board_miletiones_flag} ${globalStyles.authTheme}`}
                                      data-targetclassname="specific_example_milestone"
                                      onClick={this.seeMiletones}
                                      // onMouseDown={e => e.stopPropagation()}
                                      style={{
                                        left: ceilWidth * date + 3,
                                        color: this.setMiletonesColor({
                                          is_over_duetime,
                                          has_lcb,
                                          is_all_realized
                                        })
                                      }}
                                    >
                                      &#xe6a0;
                                    </div>
                                    {/* 渲染里程碑名称铺开 */}
                                    {/* <Dropdown overlay={this.renderLCBList(milestones, timestamp)}> */}
                                    {/* <div className={`${indexStyles.board_miletiones_names} ${globalStyles.global_ellipsis}`}
                                  data-targetclassname="specific_example_milestone"
                                  style={{
                                    top: this.setMiletonesNamesPostionTop(),
                                    maxWidth: this.setMiletonesNamesWidth(timestampEnd) - 30,
                                    color: this.setMiletonesColor({ is_over_duetime, has_lcb, is_all_realized }),
                                    left: ceilWidth * date,
                                  }}>
                                  {this.renderMiletonesNames(current_date_board_miletones)}
                                </div> */}
                                    {/* </Dropdown> */}
                                  </div>
                                </Dropdown>
                                <div
                                  data-targetclassname="specific_example_milestone"
                                  className={`${indexStyles.board_miletiones_flagpole2}`}
                                  onClick={this.seeMiletones}
                                  style={{
                                    background: this.setMiletonesColor({
                                      is_over_duetime,
                                      has_lcb,
                                      is_all_realized
                                    }),
                                    left: ceilWidth * date
                                  }}
                                  onMouseDown={e => e.stopPropagation()}
                                  onMouseOver={e => e.stopPropagation()}
                                />
                                <div
                                  data-targetclassname="specific_example_milestone"
                                  className={`${indexStyles.board_miletiones_flagpole}`}
                                  style={{
                                    height:
                                      gantt_board_id != '0'
                                        ? itemKey == '0' &&
                                          current_date_board_miletones[0]
                                            .list_id != list_id
                                          ? group_list_area_section_height[
                                              group_list_area_section_height.length -
                                                1
                                            ] - 11
                                          : item_height - 12 //在任务分组视图下
                                        : ganttIsFold({
                                            gantt_board_id,
                                            group_view_type,
                                            show_board_fold,
                                            gantt_view_mode
                                          })
                                        ? 29
                                        : item_height - 12, //,
                                    // height: 29,
                                    //  backgroundColor: is_over_duetime ? '#FFA39E' : '#FFC069' ,
                                    background: this.setMiletonesColor({
                                      is_over_duetime,
                                      has_lcb,
                                      is_all_realized
                                    }),
                                    // top: 6,
                                    left: ceilWidth * date
                                  }}
                                  onClick={this.seeMiletones}
                                  // onMouseDown={e => e.stopPropagation()}
                                  onMouseOver={e => e.stopPropagation()}
                                />
                              </>
                            )}
                          </>
                        </div>
                      )
                    })}

                    {every_day_child_miletones.map(item => {
                      const { day, milestones = [] } = item
                      return this.renderDragWrapper(
                        milestones,
                        <div
                          data-targetclassname="specific_example_milestone"
                          style={{ width: 'auto', zIndex: 1 }}
                        >
                          <>
                            {has_child_flag && (
                              <>
                                <Dropdown
                                  overlay={this.renderLCBList(
                                    milestones,
                                    timestamp
                                  )}
                                >
                                  <div
                                    style={{
                                      position: 'relative',
                                      width: 0,
                                      cursor: 'pointer'
                                    }}
                                    data-targetclassname="specific_example_milestone"
                                  >
                                    <div
                                      data-targetclassname="specific_example_milestone"
                                      className={
                                        indexStyles.board_miletiones_flag2
                                      }
                                      style={{
                                        top: this.setMiletonesNamesPostionTop(),
                                        left: ceilWidth * day - 3 - day,
                                        backgroundColor: this.setMiletonesColor(
                                          {
                                            is_over_duetime,
                                            has_lcb: has_child_flag,
                                            is_all_realized: is_all_child_realized
                                          }
                                        )
                                      }}
                                    />
                                    {/* 渲染里程碑名称铺开 */}
                                    <div
                                      className={`${indexStyles.board_miletiones_names} ${globalStyles.global_ellipsis}`}
                                      data-targetclassname="specific_example_milestone"
                                      style={{
                                        top: this.setMiletonesNamesPostionTop(),
                                        color: this.setMiletonesColor({
                                          is_over_duetime,
                                          has_lcb: has_child_flag,
                                          is_all_realized: is_all_child_realized
                                        }),
                                        left: ceilWidth * day + 13 - day,
                                        marginTop: -6
                                      }}
                                    >
                                      {this.renderMiletonesNames(milestones)}
                                    </div>
                                  </div>
                                </Dropdown>
                              </>
                            )}
                          </>
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </>
    )
  }

  // 渲染周视图
  renderWeekView = (date_inner = []) => {
    const {
      gantt_view_mode,
      list_id,
      ceiHeight,
      ceilWidth,
      group_view_type,
      gantt_board_id,
      itemKey,
      show_board_fold,
      group_list_area_section_height,
      rows
    } = this.props
    const item_height = rows * ceiHeight

    return (
      <>
        {date_inner.map((value2, key2) => {
          const {
            month,
            last_date,
            year,
            timestamp,
            timestampEnd,
            description
          } = value2
          const {
            flag: has_lcb,
            current_date_board_miletones = [],
            current_date_board_child_miletones,
            is_over_duetime,
            is_all_realized,
            every_day_miletones = [],
            every_day_child_miletones = [],
            has_child_flag,
            is_all_child_realized
          } = this.isHasMilestoneListWeek({
            year,
            month,
            last_date,
            timestamp,
            timestampEnd
          })
          if (every_day_child_miletones.length)
            console.log(
              'current_date_board_child_miletones',
              current_date_board_child_miletones,
              every_day_child_miletones,
              has_child_flag,
              timestampToTimeNormal(timestampEnd)
            )
          return (
            <div
              className={`${indexStyles.ganttDetailItem}`}
              data-list_id={list_id}
              data-start_time={timestamp}
              data-end_time={timestampEnd}
              key={timestamp}
              style={{
                backgroundColor: 'rgb(245,245,245)',
                width: ceilWidth * 7
              }}
            >
              <div style={{ display: 'flex' }}>
                {group_view_type == '1' && (
                  <>
                    {every_day_miletones.map(item => {
                      const { day, milestones = [] } = item
                      return this.renderDragWrapper(
                        milestones,
                        <div
                          data-targetclassname="specific_example_milestone"
                          style={{ width: 'auto', zIndex: 1 }}
                        >
                          {has_lcb && (
                            <>
                              <Dropdown
                                overlay={this.renderLCBList(
                                  milestones,
                                  timestamp
                                )}
                              >
                                <div
                                  style={{
                                    position: 'relative',
                                    width: 0,
                                    cursor: 'pointer'
                                  }}
                                  data-targetclassname="specific_example_milestone"
                                >
                                  {/* 旗帜 */}
                                  <div
                                    className={`${indexStyles.board_miletiones_flag} ${globalStyles.authTheme}`}
                                    data-targetclassname="specific_example_milestone"
                                    onClick={this.seeMiletones}
                                    // onMouseDown={e => e.stopPropagation()}
                                    style={{
                                      left: ceilWidth * day - 3 - day,
                                      color: this.setMiletonesColor({
                                        is_over_duetime,
                                        has_lcb,
                                        is_all_realized
                                      })
                                    }}
                                  >
                                    &#xe6a0;
                                  </div>
                                  {/* 渲染里程碑名称铺开 */}
                                  {/* <Dropdown overlay={this.renderLCBList(milestones, timestamp)}> */}
                                  <div
                                    className={`${indexStyles.board_miletiones_names} ${globalStyles.global_ellipsis}`}
                                    data-targetclassname="specific_example_milestone"
                                    style={{
                                      top: this.setMiletonesNamesPostionTop(),
                                      // maxWidth: this.setMiletonesNamesWidth(timestampEnd) - 30,
                                      color: this.setMiletonesColor({
                                        is_over_duetime,
                                        has_lcb,
                                        is_all_realized
                                      }),
                                      left: ceilWidth * day + 13 - day
                                    }}
                                  >
                                    {this.renderMiletonesNames(milestones)}
                                  </div>
                                  {/* </Dropdown> */}
                                </div>
                              </Dropdown>
                              <div
                                data-targetclassname="specific_example_milestone"
                                className={`${indexStyles.board_miletiones_flagpole2}`}
                                onClick={this.seeMiletones}
                                style={{
                                  background: this.setMiletonesColor({
                                    is_over_duetime,
                                    has_lcb,
                                    is_all_realized
                                  }),
                                  left: ceilWidth * day - 6 - day
                                }}
                                onMouseDown={e => e.stopPropagation()}
                                onMouseOver={e => e.stopPropagation()}
                              />
                              <div
                                data-targetclassname="specific_example_milestone"
                                className={`${indexStyles.board_miletiones_flagpole}`}
                                style={{
                                  height:
                                    gantt_board_id != '0'
                                      ? itemKey == '0' &&
                                        current_date_board_miletones[0]
                                          .list_id != list_id
                                        ? group_list_area_section_height[
                                            group_list_area_section_height.length -
                                              1
                                          ] - 11
                                        : item_height - 12 //在任务分组视图下
                                      : ganttIsFold({
                                          gantt_board_id,
                                          group_view_type,
                                          show_board_fold,
                                          gantt_view_mode
                                        })
                                      ? 29
                                      : item_height - 12, //,
                                  //  backgroundColor: is_over_duetime ? '#FFA39E' : '#FFC069' ,
                                  background: this.setMiletonesColor({
                                    is_over_duetime,
                                    has_lcb,
                                    is_all_realized
                                  }),
                                  left: ceilWidth * day - 6 - day
                                  // top: 6
                                }}
                                onClick={this.seeMiletones}
                                onMouseDown={e => e.stopPropagation()}
                                onMouseOver={e => e.stopPropagation()}
                              />
                            </>
                          )}
                        </div>
                      )
                    })}

                    {every_day_child_miletones.map(item => {
                      const { day, milestones = [] } = item
                      return this.renderDragWrapper(
                        milestones,
                        <div
                          data-targetclassname="specific_example_milestone"
                          style={{ width: 'auto', zIndex: 1 }}
                        >
                          {has_child_flag && (
                            <>
                              <Dropdown
                                overlay={this.renderLCBList(
                                  milestones,
                                  timestamp
                                )}
                              >
                                <div
                                  style={{
                                    position: 'relative',
                                    width: 0,
                                    cursor: 'pointer'
                                  }}
                                  data-targetclassname="specific_example_milestone"
                                >
                                  <div
                                    data-targetclassname="specific_example_milestone"
                                    className={
                                      indexStyles.board_miletiones_flag2
                                    }
                                    style={{
                                      top: this.setMiletonesNamesPostionTop(),
                                      left: ceilWidth * day - 3 - day,
                                      backgroundColor: this.setMiletonesColor({
                                        is_over_duetime,
                                        has_lcb: has_child_flag,
                                        is_all_realized: is_all_child_realized
                                      })
                                    }}
                                  />
                                  {/* 渲染里程碑名称铺开 */}
                                  <div
                                    className={`${indexStyles.board_miletiones_names} ${globalStyles.global_ellipsis}`}
                                    data-targetclassname="specific_example_milestone"
                                    style={{
                                      top:
                                        this.setMiletonesNamesPostionTop() - 4,
                                      color: this.setMiletonesColor({
                                        is_over_duetime,
                                        has_lcb: has_child_flag,
                                        is_all_realized: is_all_child_realized
                                      }),
                                      left: ceilWidth * day + 13 - day,
                                      marginTop: -6
                                    }}
                                  >
                                    {this.renderMiletonesNames(milestones)}
                                  </div>
                                </div>
                              </Dropdown>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </>
    )
  }

  render() {
    const { rows = 7, itemKey, gantt_view_mode } = this.props
    const {
      gold_date_arr = [],
      ceiHeight,
      gantt_board_id,
      group_view_type,
      show_board_fold,
      group_list_area_section_height,
      list_id
    } = this.props
    const { currentSelectedProjectMembersList } = this.state
    const item_height = rows * ceiHeight
    return (
      <div className={indexStyles.ganttAreaOut}>
        <div className={indexStyles.ganttArea}>
          {gold_date_arr.map((value, key) => {
            const { date_inner = [], date_top } = value
            return (
              <div className={indexStyles.ganttAreaItem} key={date_top}>
                <div
                  className={indexStyles.ganttDetail}
                  style={{ height: item_height }}
                >
                  {gantt_view_mode == 'year' && this.renderYearView(date_inner)}
                  {['month', 'relative_time'].includes(gantt_view_mode) &&
                    this.renderMonthView(date_inner)}
                  {gantt_view_mode == 'week' && this.renderWeekView(date_inner)}
                  {gantt_view_mode == 'hours' &&
                    this.renderHourView(date_inner)}
                </div>
              </div>
            )
          })}
        </div>
        {/* <MilestoneDetail
          deleteMiletone={this.deleteMiletone}
          handleMiletonesChange={this.handleMiletonsChangeMountInGantt}
          users={currentSelectedProjectMembersList}
          miletone_detail_modal_visible={
            this.state.miletone_detail_modal_visible
          }
          set_miletone_detail_modal_visible={
            this.set_miletone_detail_modal_visible
          }
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
      // target_scrollTop,
      gantt_view_mode,
      gold_date_arr = [],
      group_list_area_section_height,
      ceiHeight,
      gantt_board_id,
      about_user_boards,
      milestoneMap,
      group_view_type,
      show_board_fold,
      ceilWidth,
      date_arr_one_level,
      gantt_head_width
    }
  }
}) {
  return {
    // target_scrollTop,
    gantt_view_mode,
    gold_date_arr,
    ceiHeight,
    gantt_board_id,
    about_user_boards,
    milestoneMap,
    group_view_type,
    show_board_fold,
    group_list_area_section_height,
    ceilWidth,
    date_arr_one_level,
    gantt_head_width
  }
}
