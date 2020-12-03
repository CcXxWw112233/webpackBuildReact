import React, { Component } from 'react'
import styles from './index.less'
import { connect } from 'dva'
import {
  ceil_height_fold,
  ceil_height,
  ceil_width,
  ceil_width_year,
  ceil_width_week,
  ceil_width_hours,
  ganttIsOutlineView
} from '../../constants'
import { isSamDay } from '../../../../../../utils/util'

@connect(mapStateToProps)
export default class FaceRightButton extends Component {
  //设置滚动条位置
  setScrollPosition = ({ delay = 300, position = 200 }) => {
    const target = document.getElementById('gantt_card_out_middle')
    setTimeout(function() {
      // if (target.scrollTo) {
      //     target.scrollTo(position, 0)
      // } else {
      //     target.scrollLeft = position
      // }
      target.scrollLeft = position
    }, delay)
  }

  checkToday = () => {
    const {
      dispatch,
      date_arr_one_level = [],
      ceilWidth,
      gantt_view_mode
    } = this.props
    const now = new Date().getTime()
    const date = new Date().getDate()
    let toDayIndex = -1
    if (gantt_view_mode == 'month' || gantt_view_mode == 'hours') {
      toDayIndex = date_arr_one_level.findIndex(item =>
        isSamDay(item.timestamp, now)
      ) //当天所在位置index
    } else if (gantt_view_mode == 'year') {
      toDayIndex = date_arr_one_level.findIndex(
        item => now > item.timestamp && now < item.timestampEnd
      ) //当天所在月位置index
    } else if (gantt_view_mode == 'week') {
      toDayIndex = date_arr_one_level.findIndex(
        item => now > item.timestamp && now < item.timestampEnd
      ) //当天所在哪个周
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
      } else if (gantt_view_mode == 'week') {
        nomal_position = (toDayIndex - 1) * 7 * ceilWidth //当天所在位置index
      }
      const max_position =
        target.scrollWidth - target.clientWidth - 2 * ceilWidth //最大值,保持在这个值的范围内，滚动条才能不滚动到触发更新的区域
      const position =
        max_position > nomal_position ? nomal_position : max_position
      this.setScrollPosition({
        position
      })
    } else {
      this.props.setGoldDateArr && this.props.setGoldDateArr({ timestamp: now })
      if (gantt_view_mode == 'week') {
        this.props.setScrollPosition &&
          this.props.setScrollPosition({
            delay: 300,
            position: (date_arr_one_level.length / 2 - 2) * 7 * ceilWidth
          })
      } else {
        this.props.setScrollPosition &&
          this.props.setScrollPosition({
            delay: 300,
            position: ceilWidth * (60 - 4 + date - 1) - 16
          })
      }
    }
  }
  // 今天视图是否在可见区域
  filterIsInViewArea = () => {
    const target = document.getElementById('gantt_card_out_middle')
    if (!target) {
      return
    }
    const { date_arr_one_level, ceilWidth = 44, gantt_view_mode } = this.props
    const scrollLeft = target.scrollLeft

    const width = target.clientWidth
    const now = new Date().getTime()
    let index = date_arr_one_level.findIndex(item =>
      isSamDay(item.timestamp, now)
    ) //当天所在位置index
    if (gantt_view_mode == 'year') {
      index = date_arr_one_level.findIndex(
        item => now > item.timestamp && now < item.timestampEnd
      ) //当天所在月位置index
    }
    const now_position = index * ceilWidth //当天所在位置position

    let isInViewArea = false
    //在可视区域,  5 * ceilWidth 为左边tab的宽度，4.5为拖动到左区间到第五格的一半。  0.5 * ceilWidth为拖到右区间，只要遮住半个格子，就符合。
    if (
      scrollLeft < now_position - 4.5 * ceilWidth &&
      scrollLeft - 0.5 * ceilWidth > now_position - width
    ) {
      isInViewArea = true
    }
    // console.log('sssss', { width, now_position, isInViewArea, scrollLeft })
    return isInViewArea
  }

  // 设置项目汇总视图
  setShowBoardFold = () => {
    const { show_board_fold, dispatch, list_group = [] } = this.props
    let new_list_group = [...list_group]
    new_list_group = new_list_group.map(item => {
      delete item.list_data
      delete item.list_no_time_data
      return item
    })
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        show_board_fold: !show_board_fold,
        ceiHeight: show_board_fold ? ceil_height_fold : ceil_height
      }
    })
    dispatch({
      type: 'gantt/handleListGroup',
      payload: {
        data: new_list_group
      }
    })
    dispatch({
      type: 'gantt/getGanttData',
      payload: {
        not_set_loading: true
      }
    })
  }
  // 视图切换 年/月
  changeGanttViewMode = type => {
    const { dispatch, gantt_view_mode, group_view_type } = this.props
    if (!type || gantt_view_mode == type) return
    const _now = new Date().getTime()

    let ceilWidth = ceil_width
    if (type == 'year') {
      ceilWidth = ceil_width_year
    } else if (type == 'month') {
      ceilWidth = ceil_width
    } else if (type == 'hours') {
      ceilWidth = ceil_width_hours
    } else if (type == 'week') {
      ceilWidth = ceil_width_week
    } else {
    }
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        ceilWidth,
        gantt_view_mode: type,
        get_gantt_data_loading_other: true
      }
    })
    if (ganttIsOutlineView({ group_view_type })) {
      dispatch({
        type: 'gantt/updateDatas',
        payload: {
          outline_tree: [],
          outline_tree_round: []
        }
      })
      dispatch({
        type: 'gantt/getGanttData',
        payload: {}
      })
    }
    setTimeout(() => {
      this.props.setGoldDateArr({ timestamp: _now })
    }, 200)

    setTimeout(() => {
      this.checkToday()
    }, 600)
    // setTimeout(() => {
    //     this.checkToday()
    // }, 1000)
    setTimeout(() => {
      dispatch({
        type: 'gantt/updateDatas',
        payload: {
          get_gantt_data_loading_other: false
        }
      })
    }, 2000)
  }
  render() {
    const {
      gantt_board_id,
      group_view_type,
      show_board_fold,
      gantt_view_mode
    } = this.props
    return (
      <div className={styles.sections}>
        {/* {
                    gantt_board_id == '0' && group_view_type == '1' && (
                        <div className={styles.card_button} onClick={this.setShowBoardFold} >
                            {show_board_fold ? '计划明细' : '进度汇总'}
                        </div>
                    )
                } */}
        {/* {
                    !this.filterIsInViewArea() && (
                        <div className={styles.card_button} onClick={this.checkToday}>
                            今天
                        </div>
                    )
                } */}

        {/* <div
          style={{ color: gantt_view_mode == 'hours' ? '#1890FF' : '' }}
          className={styles.card_button}
          onClick={() => this.changeGanttViewMode('hours')}
        >
          时
        </div>
        <div
          style={{ color: gantt_view_mode == 'month' ? '#1890FF' : '' }}
          className={styles.card_button}
          onClick={() => this.changeGanttViewMode('month')}
        >
          日
        </div>
        <div
          style={{ color: gantt_view_mode == 'week' ? '#1890FF' : '' }}
          className={styles.card_button}
          onClick={() => this.changeGanttViewMode('week')}
        >
          周
        </div>
        <div
          style={{ color: gantt_view_mode == 'year' ? '#1890FF' : '' }}
          className={styles.card_button}
          onClick={() => this.changeGanttViewMode('year')}
        >
          月
        </div> */}
        {gantt_view_mode != 'relative_time' && (
          <>
            <div className={styles.card_button} onClick={this.checkToday}>
              今天
            </div>
            <div className={`${styles.time_mode_wrapper} `}>
              <div
                className={`${styles.time_mode_selector} ${gantt_view_mode ==
                  'hours' && styles.time_mode_selected}`}
                onClick={() => this.changeGanttViewMode('hours')}
              >
                时
              </div>
              <div
                className={`${styles.time_mode_selector} ${gantt_view_mode ==
                  'month' && styles.time_mode_selected}`}
                onClick={() => this.changeGanttViewMode('month')}
              >
                日
              </div>
              <div
                className={`${styles.time_mode_selector} ${gantt_view_mode ==
                  'week' && styles.time_mode_selected}`}
                onClick={() => this.changeGanttViewMode('week')}
              >
                周
              </div>
              <div
                className={`${styles.time_mode_selector} ${gantt_view_mode ==
                  'year' && styles.time_mode_selected}`}
                onClick={() => this.changeGanttViewMode('year')}
              >
                月
              </div>
            </div>
          </>
        )}
      </div>
    )
  }
}
//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
  gantt: {
    datas: {
      date_arr_one_level = [],
      ceilWidth,
      target_scrollLeft,
      show_board_fold,
      gantt_board_id,
      group_view_type,
      list_group = [],
      gantt_view_mode
    }
  }
}) {
  return {
    date_arr_one_level,
    ceilWidth,
    target_scrollLeft,
    show_board_fold,
    gantt_board_id,
    group_view_type,
    list_group,
    gantt_view_mode
  }
}
