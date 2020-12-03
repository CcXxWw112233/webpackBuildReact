import React from 'react'
import indexStyles from './index.less'
import globalStyles from '../../globalset/css/globalClassName.less'
import { connect } from 'dva/index'
import { MESSAGE_DURATION_TIME } from '../../globalset/js/constant'
const getEffectOrReducerByName = name => `resetPassword/${name}`

//该组件用来做message全局提示时，提示文字中有路由跳转，用法models\resetPassword\index.js 54行
let dispatch
let interval = null
let initTime = MESSAGE_DURATION_TIME
export default class MessageRoute extends React.Component {
  state = {
    initTimeText: MESSAGE_DURATION_TIME
  }
  constructor(props) {
    super(props)
    dispatch = this.props.dispatch
    const { isNeedTimeDown = false } = this.props
    isNeedTimeDown ? this.timeDown() : ''
  }
  redirect() {
    clearInterval(interval)
    initTime = MESSAGE_DURATION_TIME
    dispatch({
      type: getEffectOrReducerByName('routingJump'),
      payload: {
        route: '/retrievePassword'
      }
    })
  }
  timeDown() {
    const that = this
    interval = setInterval(function() {
      initTime--
      that.setState({
        initTimeText: initTime
      })
      if (initTime === 0) {
        initTime = MESSAGE_DURATION_TIME
        clearInterval(interval)
      }
      // console.log(initTime)
    }, 1000)
  }
  render() {
    const { dispatch, discriptionText, jumpText } = this.props
    return (
      <span style={{ color: '#000' }}>
        {discriptionText}
        {this.state.initTimeText}。
        <span
          style={{ cursor: 'pointer' }}
          className={globalStyles.link_mouse}
          onClick={this.redirect}
        >
          {jumpText}
        </span>
      </span>
    )
  }
}

//readme:     const { isNeedTimeDown , dispatch, discriptionText, jumpText } = this.props要从父组件传递进来
