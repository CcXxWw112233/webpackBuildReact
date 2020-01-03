import React, { Component } from 'react';
import Cookies from 'js-cookie'
import { MAP_URL } from "@/globalset/js/constant";
import { connect } from 'dva'
import { openImChatBoard } from '@/utils/businessFunction.js'

@connect(({ InvestmentMap = [] }) => ({
  InvestmentMap,
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
  listenMapBoardChange = (event) => {
    const message = event.data
    const message_head = 'map_board_change_'
    if (!message || typeof message != 'string') {
      return
    }
    if (message.indexOf(message_head) != -1) {
      const board_id = message.replace(message_head, '')
      openImChatBoard({ board_id, autoOpenIm: true })
    }
  }
  render() {
    const accessToken = Cookies.get('Authorization')
    const src_url = `${MAP_URL}?token=${accessToken}&orgId=${localStorage.getItem('OrganizationId')}`
    const { height } = this.state
    return (
      <div>
        <iframe src={src_url} scrolling='no' frameborder="0" width='100%' height={height}></iframe>
      </div>
    );
  }
}
