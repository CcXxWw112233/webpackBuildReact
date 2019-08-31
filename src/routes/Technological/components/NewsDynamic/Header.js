import React from 'react'
import indexStyle from './index.less'
import { Icon, Menu, Dropdown, Tooltip, Tabs } from 'antd'

const TabPane = Tabs.TabPane

export default class Header extends React.Component {
  state = {
    defaultChooseTab: false
  }

  tabItemClick = (key) => {
    this.setState({
      defaultChooseTab: key
    })
  }

  render() {
    const { defaultChooseTab } = this.state

    const menu = (
      <Menu>
        <Menu.Item key={'1'}>
          全部项目
        </Menu.Item>
        <Menu.Item key={'2'} disabled>
          <Tooltip placement="top" title={'即将上线'}>
            已归档项目
          </Tooltip>
        </Menu.Item>
      </Menu>
    );

    return (
      <div className={indexStyle.out}>
        <div className={indexStyle.left}>
          <div className={defaultChooseTab==='1'?indexStyle.tableChoose:''} onClick={this.tabItemClick.bind(this, '1')}>全部消息</div>
          <div className={defaultChooseTab==='2'?indexStyle.tableChoose:''} >已读消息</div>
          <div className={defaultChooseTab==='3'?indexStyle.tableChoose:''} >稍后处理</div>
          <div className={defaultChooseTab==='3'?indexStyle.tableChoose:''} >@我的</div>

        </div>
        <div className={indexStyle.right}>
          <Dropdown overlay={menu}>
            <div>全部项目 <Icon type="down" style={{fontSize: 14, color: '#595959'}}/></div>
          </Dropdown>
         <Icon type="appstore-o" style={{fontSize: 14, marginTop: 18, marginLeft: 16}}/>
        </div>
      </div>
    )
  }
}
