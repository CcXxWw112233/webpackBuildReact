import React, { Component } from 'react';
import { connect, } from 'dva';
import indexStyles from './index.less'
import { isToday } from './getDate'
// 这是一个甘特图面板尾部的日期列表
const getEffectOrReducerByName = name => `gantt/${name}`
@connect(mapStateToProps)
export default class GetRowGanttItem extends Component {

  constructor(props) {
    super(props)
    this.state = {
    }
  }

  getElseHeight = () => {
    let rows = 7
    const { gantt_card_height, dataAreaRealHeight, ceiHeight } = this.props
    const difference_height = gantt_card_height - dataAreaRealHeight
    const mult = Math.ceil(difference_height/ceiHeight)
    if(dataAreaRealHeight < 0) {
      rows = 7
    } else {
      if (mult < 7) {
        rows = 7
      }else {
        rows = mult
      }
    }
    return rows * ceiHeight
  }

  render () {
    const { gold_date_arr = [], } = this.props
    return (
      <div className={indexStyles.ganttAreaOut}>
        <div className={indexStyles.ganttArea} >
          {gold_date_arr.map((value, key) => {
            const { date_inner = [] } = value
            return (
              <div className={indexStyles.ganttAreaItem} key={key}>
                <div className={indexStyles.ganttDetail} style={{height: this.getElseHeight()}}>
                  {date_inner.map((value2, key2) => {
                    const { week_day, timestamp } = value2
                    return (
                      <div className={`${indexStyles.ganttDetailItem}`}
                           key={key2}
                           style={{backgroundColor: (week_day == 0 || week_day == 6) ? 'rgba(0, 0, 0, 0.04)' : (isToday(timestamp)? 'rgb(242, 251, 255)': 'rgba(0,0,0,.02)')}}
                      >
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

}
//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ gantt: { datas: { gold_date_arr = [], ceiHeight, group_rows = [], list_group = [] }} }) {
  return { gold_date_arr, ceiHeight, group_rows, list_group }
}
