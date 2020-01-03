import React, { Component } from 'react'
import styles from './index.less'
import { connect, } from 'dva';
import { isSamDay } from '../../getDate';
import { ceil_height_fold, ceil_height } from '../../constants';

@connect(mapStateToProps)
export default class FaceRightButton extends Component {

    //设置滚动条位置
    setScrollPosition = ({ delay = 300, position = 200 }) => {
        const target = document.getElementById('gantt_card_out_middle')
        setTimeout(function () {
            if (target.scrollTo) {
                target.scrollTo(position, 0)
            } else {
                target.scrollLeft = position
            }
        }, delay)
    }

    checkToday = () => {
        const { dispatch, date_arr_one_level = [], ceilWidth } = this.props
        const now = new Date().getTime()
        const date = new Date().getDate()
        const toDayIndex = date_arr_one_level.findIndex(item => isSamDay(item.timestamp, now))
        const target = document.getElementById('gantt_card_out_middle')

        if (toDayIndex != -1) { //如果今天在当前日期面板内 
            const nomal_position = toDayIndex * ceilWidth - 248 + 16 //248为左边面板宽度,16为左边header的宽度和withCeil * n的 %值
            const max_position = target.scrollWidth - target.clientWidth - 2 * ceilWidth//最大值,保持在这个值的范围内，滚动条才能不滚动到触发更新的区域
            const position = max_position > nomal_position ? nomal_position : max_position

            this.setScrollPosition({
                position
            })
        } else {
            this.props.setGoldDateArr && this.props.setGoldDateArr({ timestamp: now })
            this.props.setScrollPosition && this.props.setScrollPosition({ delay: 300, position: ceilWidth * (30 - 4 + date - 1) - 16 })
        }

    }
    // 今天视图是否在可见区域
    filterIsInViewArea = () => {
        const target = document.getElementById('gantt_card_out_middle')
        if (!target) {
            return
        }
        const { date_arr_one_level, ceilWidth = 44 } = this.props
        const scrollLeft = target.scrollLeft

        const width = target.clientWidth
        const now = new Date().getTime()
        const index = date_arr_one_level.findIndex(item => isSamDay(item.timestamp, now)) //当天所在位置index
        const now_position = index * ceilWidth //当天所在位置position

        let isInViewArea = false
        //在可视区域,  5 * ceilWidth 为左边tab的宽度，4.5为拖动到左区间到第五格的一半。  0.5 * ceilWidth为拖到右区间，只要遮住半个格子，就符合。
        if (scrollLeft < now_position - 4.5 * ceilWidth && scrollLeft - 0.5 * ceilWidth > now_position - width) {
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
                ceiHeight: show_board_fold ? ceil_height_fold : ceil_height,
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
    render() {
        const { gantt_board_id, group_view_type, show_board_fold } = this.props
        return (
            <div>
                {
                    !this.filterIsInViewArea() && (
                        <div className={styles.card_button} onClick={this.checkToday}>
                            今天
                         </div>
                    )
                }
                {
                    gantt_board_id == '0' && group_view_type == '1' && (
                        <div className={styles.card_button} style={{ right: !this.filterIsInViewArea() ? 106 : 30 }} onClick={this.setShowBoardFold} >
                            {show_board_fold ? '计划明细' : '进度汇总'}
                        </div>
                    )
                }
            </div>
        )
    }
}
//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ gantt: { datas: {
    date_arr_one_level = [],
    ceilWidth,
    target_scrollLeft,
    show_board_fold,
    gantt_board_id,
    group_view_type,
    list_group = [],
} } }) {
    return {
        date_arr_one_level,
        ceilWidth,
        target_scrollLeft,
        show_board_fold,
        gantt_board_id,
        group_view_type,
        list_group
    }
}
