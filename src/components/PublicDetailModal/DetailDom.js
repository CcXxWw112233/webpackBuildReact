import React from 'react'
import indexStyles from './index.less'
import { Table, Button, Menu, Dropdown, Icon, Input } from 'antd';
import Header from './Header'
import DetailContent from "./DetailContent";

const bodyHeight = document.querySelector('body').clientHeight
export default class DetailDom extends React.Component {
  state = {
    clientHeight: document.documentElement.clientHeight,
    clientWidth: document.documentElement.clientWidth,

  }
  constructor(props) {
    super(props);
    this.resizeTTY = this.resizeTTY.bind(this)
  }
  componentDidMount() {
    window.addEventListener('resize', this.resizeTTY)
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeTTY);
  }
  resizeTTY = () => {
    const clientHeight = document.documentElement.clientHeight;//获取页面可见高度
    const clientWidth = document.documentElement.clientWidth
    this.setState({
      clientHeight,
      clientWidth
    })
  }

  // 定义一个外部容器的点击事件
  commonDrawerContentOutClick = () => {
    this.props.commonDrawerContentOutClick && this.props.commonDrawerContentOutClick()
  }

  render() {
    const { clientHeight, clientWidth } = this.state
    const { modalTop } = this.props
    const offsetTopDeviation = 100 //用来计算偏移量偏差
    return (
      <div onClick={this.commonDrawerContentOutClick} className={indexStyles.fileDetailOut} style={{height: clientHeight - offsetTopDeviation, top: 0}}>
        <Header {...this.props} setModalVisibile/>
        <DetailContent {...this.props} clientHeight={clientHeight} clientWidth={clientWidth} offsetTopDeviation = {offsetTopDeviation} modalTop={modalTop} />
      </div>
    )
  }
}
