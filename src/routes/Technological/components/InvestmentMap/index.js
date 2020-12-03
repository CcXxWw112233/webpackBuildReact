import React, { Component } from 'react'
import Cookies from 'js-cookie'
import { MAP_URL } from '@/globalset/js/constant'
import { connect } from 'dva'
import { openImChatBoard } from '@/utils/businessFunction.js'

@connect(({ InvestmentMap = [] }) => ({
  InvestmentMap
}))
export default class Index extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      height: document.querySelector('body').clientHeight
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.setHeight)
    window.addEventListener('message', this.listenMapBoardChange)
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.setHeight)
    window.removeEventListener('message', this.listenMapBoardChange)
  }
  setHeight = () => {
    const height = document.querySelector('body').clientHeight
    this.setState({
      height
    })
  }
  // 监听地图项目变化
  listenMapBoardChange = event => {
    const { dispatch } = this.props
    const message = event.data
    const message_head = 'map_board_change_'
    if (!message || typeof message != 'string') {
      return
    }
    if (message.indexOf(message_head) != -1) {
      const board_id = message.replace(message_head, '')
      openImChatBoard({ board_id, autoOpenIm: true })
    } else if (message == 'map_board_create') {
      //创建项目后要拉取项目权限和全部项目信息
      dispatch({
        type: 'project/afterCreateBoardHandle',
        payload: {}
      })
    } else if (message == 'token_invalid') {
      window.location.hash = `#/login?redirect=${window.location.hash.replace(
        '#',
        ''
      )}`
    } else {
    }
  }
  render() {
    const accessToken = Cookies.get('Authorization')
    const src_url = `${MAP_URL}?token=${accessToken}&orgId=${localStorage.getItem(
      'OrganizationId'
    )}`
    const { height } = this.state
    return (
      <div>
        <iframe
          src={src_url}
          webkitAllowFullScreen
          mozallowfullscreen
          allowFullScreen
          scrolling="no"
          frameborder="0"
          width="100%"
          height={height}
        ></iframe>
      </div>
    )
  }
}
