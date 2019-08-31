
import React from 'react'
import indexStyles from './index.less'
import { Table, Button, Menu, Dropdown, Icon, Input } from 'antd';
import Header from './Header'
import FileDetailContent from "./FileDetailContent";

const bodyHeight = document.querySelector('body').clientHeight
export default class FileDetail extends React.Component {
  state = {
    clientHeight: document.documentElement.clientHeight,
    clientWidth: document.documentElement.clientWidth,
  }
  constructor() {
    super();
    this.resizeTTY.bind(this)
  }
  componentDidMount() {
    window.addEventListener('resize', this.resizeTTY.bind(this, 'ing'))
  }

  resizeTTY(type) {
    const clientHeight = document.documentElement.clientHeight;//获取页面可见高度
    const clientWidth = document.documentElement.clientWidth
    this.setState({
      clientHeight,
      clientWidth
    })
  }

  render() {
    const { clientHeight, clientWidth } = this.state
    const { modalTop } = this.props
    const offsetTopDeviation = 100 //用来计算偏移量偏差
    return (
      <div id={'container_fileDetailOut'} className={indexStyles.fileDetailOut} style={{height: clientHeight - offsetTopDeviation, top: 0}}>
        {/*<Header {...this.props}/>*/}
        <FileDetailContent {...this.props} clientHeight={clientHeight} clientWidth={clientWidth} offsetTopDeviation = {offsetTopDeviation} modalTop={modalTop} />
      </div>
    )
  }
}
