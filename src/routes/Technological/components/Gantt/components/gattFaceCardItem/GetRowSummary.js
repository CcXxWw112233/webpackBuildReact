import React, { Component } from 'react'
import indexStyles from '../../index.less'
import styles from './index.less'
import { connect } from 'dva'
import CardDropDetail from './CardDropDetail.js'
import SummaryCards from './SummaryCards/index'

import { Popover, Dropdown } from 'antd'
import globalStyles from '@/globalset/css/globalClassName.less'
import {
  task_item_height_fold,
  task_item_height,
  ceil_height_fold
} from '../../constants'
import { selectBoardToSeeInfo } from '../../../../../../utils/businessFunction'
import { transformTimestamp } from '../../../../../../utils/util'

@connect(mapStateToProps)
export default class GetRowSummary extends Component {
  setBgSpecific = () => {
    let time_bg_color = ''
    let percent_class = ''
    let is_due = false
    const {
      itemValue: { lane_status, lane_overdue_count, lane_todo_count },
      list_data = []
    } = this.props
    if (lane_todo_count == 0 || !lane_todo_count) {
      //全部完成
      time_bg_color = '#E9ECF2'
      percent_class = styles.board_fold_complete
    } else {
      if (lane_overdue_count == 0) {
        //正在进行的项目（任务按期完成）
        time_bg_color = '#91D5FF'
        percent_class = styles.board_fold_ding
      } else {
        //正在进行的项目(存在逾期任务)
        time_bg_color = '#FFCCC7'
        percent_class = styles.board_fold_due
        is_due = true
      }
    }
    // const percent = `${((lane_schedule_count - lane_overdue_count) / lane_schedule_count) * 100}%`
    // if (lane_status == '1') { //完成
    //     time_bg_color = '#E9ECF2'
    //     percent_class = styles.board_fold_complete
    // } else if (lane_status == '2') { //正在进行的项目（任务按期完成）
    //     time_bg_color = '#91D5FF'
    //     percent_class = styles.board_fold_ding
    // } else if (lane_status == '3') { //正在进行的项目(存在逾期任务)
    //     time_bg_color = '#FFCCC7'
    //     percent_class = styles.board_fold_due
    //     is_due = true
    // } else {

    // }

    return {
      time_bg_color,
      percent_class,
      is_due
    }
  }
  // setBgSpecific = () => {
  //     let time_bg_color = ''
  //     let percent_class = ''
  //     let is_due = false
  //     const { itemValue: { end_time }, list_data = [] } = this.props
  //     const now = new Date().getTime()
  //     const total = list_data.length
  //     const realize_count = list_data.filter(item => item.is_realize == '1').length
  //     const due_not_realize_count = list_data.filter(item => item.is_realize == '0' && item.end_time < end_time).length //逾期未完成个数

  //     if (realize_count == total) { //完成
  //         time_bg_color = '#BFBFBF'
  //         percent_class = styles.board_fold_complete
  //     } else {
  //         if (due_not_realize_count > 0) { //项目汇总时间在当前之前, 逾期
  //             time_bg_color = '#FFCCC7'
  //             percent_class = styles.board_fold_due
  //             is_due = true
  //         } else {
  //             time_bg_color = '#91D5FF'
  //             percent_class = styles.board_fold_ding
  //         }
  //     }

  //     return {
  //         percent: `${(realize_count / total) * 100}%`,
  //         time_bg_color,
  //         percent_class,
  //         is_due
  //     }
  // }

  gotoBoard = e => {
    e.stopPropagation()
    const {
      list_id,
      dispatch,
      itemValue: { lane_name },
      gantt_board_id
    } = this.props
    if (gantt_board_id != '0') return
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        gantt_board_id: list_id,
        list_group: []
      }
    })
    selectBoardToSeeInfo({
      board_id: list_id,
      board_name: lane_name,
      dispatch,
      group_view_type: '1'
    })
    // dispatch({
    //     type: 'gantt/getGanttData',
    //     payload: {

    //     }
    // })
  }

  hanldListGroupMap = () => {
    const { list_data = [], ceilWidth } = this.props
    let left_arr = list_data.map(
      item => item.left + (item.time_span - 1) * ceilWidth
    ) //取到截止日期应该处的位置
    left_arr = Array.from(new Set(left_arr))
    const now = new Date().getTime()
    let left_map = left_arr.map(item => {
      let list = []
      for (let val of list_data) {
        if (
          val.left + (val.time_span - 1) * ceilWidth ==
          item //位置对应上
          // && val.is_realize != '1' //未完成
          // && val.end_time < now //过期
          // && val.is_has_end_time //存在实际的截止时间
        ) {
          list.push(val)
        }
      }
      return {
        left: item,
        list
      }
    })
    left_map = left_map.filter(item => item.list.length > 0)
    return left_map
  }
  // 某个点存在逾期的任务
  pointHasDueCard = ({ list = [] }) => {
    let has_due = false
    for (let val of list) {
      const new_due_time = transformTimestamp(val.due_time)
      if (
        !!new_due_time &&
        new Date().getTime() > new_due_time &&
        val.is_realize != '1'
      ) {
        //超时未完成才算逾期
        has_due = true
      }
    }
    return has_due
  }

  // 渲染已过期的
  renderDueList = () => {
    const { list_data = [], ceilWidth, list_id } = this.props
    const {
      itemValue: { top }
    } = this.props

    const left_map = this.hanldListGroupMap()
    // if (!this.setBgSpecific().is_due) {
    //     return <React.Fragment></React.Fragment>
    // }

    return left_map.map((item, key) => {
      const { list = [], left } = item
      // const realize_arr = list.filter(item => item.is_realize != '1')
      return (
        <Popover
          getPopupContainer={triggerNode => triggerNode.parentNode}
          trigger={['click']}
          placement="bottom"
          content={
            <SummaryCards
              list_id={list_id}
              dispatch={this.props.dispatch}
              list={list}
            />
          }
          key={key}
        >
          <div
            key={left}
            style={{
              width: 6,
              height: 6,
              borderRadius: 6,
              backgroundColor: this.pointHasDueCard({ list })
                ? '#FF7365'
                : '#ffffff',
              color: '#FF7875',
              position: 'absolute',
              cursor: 'pointer',
              left: left + ceilWidth / 2,
              top: top + (ceil_height_fold - 6) / 2,
              zIndex: 1
            }}
          ></div>
        </Popover>
      )
    })
  }

  render() {
    const { itemValue = {}, ceilWidth } = this.props
    const {
      left,
      top,
      width,
      time_span,
      lane_schedule_count,
      lane_todo_count
    } = itemValue
    const { percent_class, time_bg_color } = this.setBgSpecific()
    const percent =
      Number(lane_schedule_count - lane_todo_count) /
      Number(lane_schedule_count)
    const percent_else = 1 - percent
    if (!lane_schedule_count) {
      return <></>
    }
    return (
      <div
        style={{ display: 'flex' }}
        data-targetclassname="specific_example"
        onMouseMove={e => e.stopPropagation()}
      >
        <div
          data-targetclassname="specific_example"
          onMouseMove={e => e.stopPropagation()}
          style={{
            width: 10,
            position: 'absolute',
            zIndex: 1,
            height: 40,
            left: left - 10,
            top: top
          }}
        ></div>
        <div
          onMouseMove={e => e.stopPropagation()}
          // onClick={this.gotoBoard}
          className={`${indexStyles.specific_example} ${styles.summary_item}`}
          data-targetclassname="specific_example"
          style={{
            left: left,
            top: top,
            width: (width || 6) + 6,
            height: task_item_height_fold
            // // background: this.setBgSpecific().time_bg_color,
            // padding: 0,
            // zIndex: 0,
          }}
        >
          {/* 进度填充 */}
          <div
            data-targetclassname="specific_example"
            className={`${percent_class} ${
              percent == 1
                ? styles.summary_item_left_full
                : styles.summary_item_left
            }`}
            style={{
              width: `${percent * 100}%`,
              height: task_item_height_fold,
              border: `1px solid ${time_bg_color}`,
              display: percent == 0 ? 'none' : 'block'
            }}
          ></div>
          <div
            data-targetclassname="specific_example"
            className={`${styles.summary_item_right} ${percent == 0 &&
              styles.summary_item_right_full}`}
            style={{
              width: `${percent_else * 100}%`,
              height: task_item_height_fold,
              display: percent == 1 ? 'none' : 'block'
            }}
          ></div>
        </div>
        <div
          data-targetclassname="specific_example"
          onMouseMove={e => e.stopPropagation()}
          style={{
            width: 16,
            height: 40,
            position: 'absolute',
            zIndex: 1,
            left: left + time_span * ceilWidth - 6,
            top: top
          }}
        ></div>
        {this.renderDueList()}
      </div>
    )
  }
}

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
  gantt: {
    datas: { group_list_area_section_height, ceilWidth, gantt_board_id }
  }
}) {
  return {
    group_list_area_section_height,
    ceilWidth,
    gantt_board_id
  }
}
