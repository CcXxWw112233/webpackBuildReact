import React, { Component } from 'react'
import { connect } from 'dva'
import styles from './dragCard.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { getCardChildCards } from '../../../../../../services/technological/task'
import { transformTimestamp } from '../../../../../../utils/util'
import ChildCardItem from './ChildCardItem'
import { task_item_height } from '../../constants'
import { Spin } from 'antd'
import { turn } from 'core-js/fn/array'
@connect(mapStateToProps)
export default class GroupChildCards extends Component {
  constructor(props) {
    super(props)
    this.state = {
      cards: [],
      spining: false,
      init_get: true
    }
  }

  componentDidMount() {
    this.getCards()
    this.setState({
      init_get: false
    })
  }
  componentWillReceiveProps(nextProps) {
    const { visible: old_visible } = this.props
    const { visible } = nextProps
    if (visible && visible != old_visible) {
      this.getCards()
    }
  }
  getCards = () => {
    const {
      parent_value: { id }
    } = this.props
    const { init_get } = this.state
    if (init_get) {
      this.setState({
        spining: true
      })
    }
    getCardChildCards({ card_id: id })
      .then(res => {
        const cards = this.hanldleCardsPostion(res.data.cards)
        this.setState({
          cards
        })
        this.setState({
          spining: false
        })
      })
      .catch(err => {
        this.setState({
          spining: false
        })
      })
  }

  hanldleCardsPostion = cards => {
    const {
      parent_value: { start_time: parent_start_time },
      ceiHeight,
      ceilWidth
    } = this.props
    const list = [...cards].map((item, key) => {
      let is_has_start_time = true
      let is_has_end_time = true
      if (!item.start_time) is_has_start_time = false
      if (!item.due_time) is_has_end_time = false
      const start_time =
        transformTimestamp(item.start_time) || transformTimestamp(item.due_time)
      const end_time =
        transformTimestamp(item.due_time) || transformTimestamp(item.start_time)
      const due_time = end_time
      const top = ceiHeight * key
      const time_span =
        !due_time || !start_time
          ? 1
          : Math.floor((due_time - start_time) / (24 * 3600 * 1000)) + 1 //正常区间内
      const width = time_span * ceilWidth
      const height = task_item_height
      const left =
        Math.floor(
          (start_time - transformTimestamp(parent_start_time)) /
            (24 * 60 * 60 * 1000)
        ) * ceilWidth //相对父任务最左边的天数
      const new_item = {
        ...item,
        top,
        due_time,
        start_time,
        end_time,
        is_has_end_time,
        is_has_start_time,
        time_span,
        width,
        height,
        left
      }
      return new_item
    })
    return list
  }
  renderEmpty = () => {
    return (
      <div className={styles.empty_out}>
        <div className={`${styles.empty} ${globalStyles.authTheme}`}>
          &#xe703;{' '}
        </div>
        <div>暂无数据</div>
      </div>
    )
  }
  renderCards = () => {
    const {
      parent_value: { time_span },
      ceilWidth
    } = this.props
    const { cards = [] } = this.state
    return (
      <React.Fragment>
        {cards.map(value => {
          const { end_time, left, top, start_time, id } = value
          return (
            <ChildCardItem
              key={`${id}_${start_time}_${end_time}_${left}_${top}`}
              itemValue={value}
            />
          )
        })}
      </React.Fragment>
    )
  }
  render() {
    const {
      parent_value: { time_span },
      ceilWidth,
      ceiHeight
    } = this.props
    const { cards = [], spining } = this.state
    const cards_length = cards.length
    return (
      <Spin spinning={spining}>
        <div
          style={{
            width: time_span * ceilWidth,
            display: cards_length ? 'block' : 'none',
            height: Math.min(cards_length, 4) * ceiHeight
          }}
          // ${globalStyles.global_card}
          className={`${styles.group_childs_wrapper} ${globalStyles.global_vertical_scrollbar}`}
        >
          {cards_length ? this.renderCards() : this.renderEmpty()}
        </div>
      </Spin>
    )
  }
}
function mapStateToProps({
  gantt: {
    datas: { ceilWidth, ceiHeight }
  }
}) {
  return {
    ceilWidth,
    ceiHeight
  }
}
