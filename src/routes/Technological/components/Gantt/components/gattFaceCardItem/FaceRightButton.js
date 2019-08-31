import React, { Component } from 'react'
import styles from './index.less'
import { connect, } from 'dva';
import { isSamDay } from '../../getDate';

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
       
        if (toDayIndex != -1) { //如果今天在当前日期面板内 //248为左边面板宽度,16为左边header的宽度和withCeil * n的 %值
            this.setScrollPosition({
                position: toDayIndex * ceilWidth - 248 + 16
            })
        } else {
            this.props.setGoldDateArr && this.props.setGoldDateArr({timestamp: now})
            this.props.setScrollPosition && this.props.setScrollPosition({ delay: 300, position: ceilWidth * (30 - 4 + date - 1) - 16 })
        }

    }
    render() {
        return (
            <div className={styles.card_button} onClick={this.checkToday}>
                今天
            </div>
        )
    }
}
//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ gantt: { datas: {
    date_arr_one_level = [],
    ceilWidth
} } }) {
    return {
        date_arr_one_level,
        ceilWidth
    }
}
