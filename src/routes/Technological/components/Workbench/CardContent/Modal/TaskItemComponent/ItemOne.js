import React from 'react'
import CreateTaskStyle from './CreateTask.less'
import DrawerContentStyles from './DrawerContent.less'
import { Icon, Checkbox, Collapse, Menu } from 'antd'
import QueueAnim from 'rc-queue-anim'
const Panel = Collapse.Panel

export default class ItemOne extends React.Component {
  state = {
    isCheck: false
  }
  itemOneClick(e) {
    e.stopPropagation();

    this.setState({
      isCheck: !this.state.isCheck
    })
  }
  seeDetailInfo() {
    this.props.setDrawerVisibleOpen()
  }
  render() {
    const { isCheck } = this.state
    return (
      <div key={'1'} className={CreateTaskStyle.item_1} onClick={this.seeDetailInfo.bind(this)}>
        <div className={isCheck? CreateTaskStyle.nomalCheckBoxActive: CreateTaskStyle.nomalCheckBox} onClick={this.itemOneClick.bind(this)}>
          <Icon type="check" style={{color: '#FFFFFF', fontSize: 12, fontWeight: 'bold'}}/>
        </div>
        <div>安康市大家可能速度看是多么安康市大家可能速度看是多么安</div>
        <div className={CreateTaskStyle.item_1_img}>
          <img src="" />
        </div>
        <div className={CreateTaskStyle.item_1_eclipsis}>
          <Icon type="ellipsis" style={{fontSize: 16}}/>
        </div>
      </div>
    )
  }
}

