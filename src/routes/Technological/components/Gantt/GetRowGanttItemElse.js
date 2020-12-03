import React, { Component } from 'react'
import { connect } from 'dva'
import indexStyles from './index.less'
import { isToday } from './base_utils'
import { ganttIsOutlineView, hours_view_total } from './constants'
// 这是一个甘特图面板尾部的日期列表
const getEffectOrReducerByName = name => `gantt/${name}`
@connect(mapStateToProps)
export default class GetRowGanttItem extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  getElseHeight = () => {
    let rows = 7
    const {
      gantt_card_height,
      dataAreaRealHeight,
      ceiHeight,
      group_view_type,
      outline_tree_round = []
    } = this.props
    const difference_height = gantt_card_height - dataAreaRealHeight
    const mult = Math.ceil(difference_height / ceiHeight)
    if (dataAreaRealHeight < 0) {
      rows = 7
    } else {
      if (mult < 7) {
        rows = 7
      } else {
        rows = mult
      }
    }
    if (ganttIsOutlineView({ group_view_type })) {
      const outline_tree_round_length = outline_tree_round.length
      if (outline_tree_round_length > rows) {
        return (outline_tree_round_length + 8) * ceiHeight
      } else {
        return (rows + 5) * ceiHeight
      }
    }
    return (rows + 5) * ceiHeight
  }

  filterHeight = () => {
    const { list_group, group_view_type, gantt_board_id } = this.props
    if (
      ganttIsOutlineView({ group_view_type }) ||
      (group_view_type == '1' && gantt_board_id == '0') ||
      group_view_type == '2' ||
      group_view_type == '5' ||
      (group_view_type == '1' && gantt_board_id != '0' && !list_group.length)
    ) {
      return this.getElseHeight()
    } else {
      return 30
    }
  }
  setBorderTop = () => {
    const { group_view_type, gantt_board_id } = this.props
    if (group_view_type == '1' && gantt_board_id != '0') {
      return {
        borderTop: 'none'
      }
    } else {
      return {}
    }
  }

  renderMonthView = (date_inner = []) => {
    const { gantt_view_mode } = this.props
    return (
      <>
        {date_inner.map((value2, key2) => {
          const { week_day, timestamp } = value2
          return (
            <div
              className={`${indexStyles.ganttDetailItem}`}
              key={key2}
              style={{
                borderRight:
                  gantt_view_mode == 'relative_time' &&
                  ![5, 6, 0].includes(week_day)
                    ? 'none'
                    : '',
                backgroundColor:
                  week_day == 0 || week_day == 6
                    ? 'rgb(245,245,245)'
                    : 'rgb(250,250,250)',
                // backgroundColor: isToday(timestamp) ? 'rgb(242, 251, 255)' : ((week_day == 0 || week_day == 6) ? 'rgba(0, 0, 0, 0.04)' : 'rgba(0,0,0,.02)'),
                ...this.setBorderTop()
              }}
            ></div>
          )
        })}
      </>
    )
  }
  renderYearView = (date_inner = []) => {
    const { ceilWidth } = this.props
    return (
      <>
        {date_inner.map((value2, key2) => {
          const {
            month,
            last_date,
            week_day,
            timestamp,
            timestampEnd,
            description
          } = value2
          return (
            <div
              className={`${indexStyles.ganttDetailItem}`}
              key={key2}
              style={{
                width: last_date * ceilWidth,
                backgroundColor: 'rgb(245,245,245)',
                ...this.setBorderTop()
              }}
            ></div>
          )
        })}
      </>
    )
  }
  renderWeekView = (date_inner = []) => {
    const { ceilWidth } = this.props
    return (
      <>
        {date_inner.map((value2, key2) => {
          const {
            month,
            last_date,
            week_day,
            timestamp,
            timestampEnd,
            description
          } = value2
          return (
            <div
              className={`${indexStyles.ganttDetailItem}`}
              key={key2}
              style={{
                width: 7 * ceilWidth,
                backgroundColor: 'rgb(245,245,245)',
                ...this.setBorderTop()
              }}
            ></div>
          )
        })}
      </>
    )
  }

  // 渲染时视图日期
  renderHourView = (date_inner = []) => {
    const { rows = 7 } = this.props
    const { ceiHeight, list_id, ceilWidth } = this.props
    return (
      <>
        {date_inner.map((value2, key2) => {
          const { timestamp, timestampEnd } = value2
          return (
            <div
              className={`${indexStyles.ganttDetailItem}`}
              data-list_id={list_id}
              data-start_time={timestamp}
              data-end_time={timestampEnd}
              key={timestamp}
              style={{
                width: ceilWidth,
                borderRight:
                  key2 == hours_view_total - 1
                    ? '1px solid rgba(154, 159, 166, 0.15)'
                    : 'none',
                // borderLeft:
                //   key2 == 0 ? '1px solid rgba(154, 159, 166, 0.15)' : 'none',
                backgroundColor: 'rgb(245,245,245)',
                ...this.setBorderTop()
              }}
            ></div>
          )
        })}
      </>
    )
  }
  render() {
    const {
      gold_date_arr = [],
      gantt_view_mode,
      date_total,
      ceilWidth,
      ceiHeight
    } = this.props
    return (
      <div className={indexStyles.ganttAreaOut}>
        <div
          className={indexStyles.ganttArea}
          style={{
            height: this.filterHeight(),
            backgroundColor: 'black',
            width: ceilWidth * date_total
          }}
        >
          {/* {gold_date_arr.map((value, key) => {
            const { date_inner = [] } = value
            return (
              <div className={indexStyles.ganttAreaItem} key={key}>
                <div
                  className={indexStyles.ganttDetail}
                  style={{ height: this.filterHeight() }}
                >
                  {gantt_view_mode == 'year' && this.renderYearView(date_inner)}
                  {gantt_view_mode == 'week' && this.renderWeekView(date_inner)}
                  {['month', 'relative_time'].includes(gantt_view_mode) &&
                    this.renderMonthView(date_inner)}
                  {gantt_view_mode == 'hours' &&
                    this.renderHourView(date_inner)}
                </div>
              </div>
            )
          })} */}
        </div>
      </div>
    )
  }
}
//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
  gantt: {
    datas: {
      gantt_view_mode,
      ceilWidth,
      gold_date_arr = [],
      gantt_board_id,
      group_view_type,
      outline_tree_round,
      ceiHeight,
      group_rows = [],
      list_group = [],
      date_total
    }
  }
}) {
  return {
    gantt_view_mode,
    ceilWidth,
    gold_date_arr,
    ceiHeight,
    group_rows,
    list_group,
    group_view_type,
    outline_tree_round,
    gantt_board_id,
    date_total
  }
}
