import React from 'react'
import { connect } from 'dva'
import QueueAnim from 'rc-queue-anim'
import globalClassNmae from '../../../globalset/css/globalClassName.less'
import { Route, Router, Switch, Link } from 'dva/router'
import dynamic from 'dva/dynamic'
import dva from 'dva/index'
import indexStyles from './index.less'
import { LocaleProvider, Icon, Layout, Menu } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import 'moment/locale/zh-cn'
const { Header, Sider, Content } = Layout

export default class Technological extends React.Component {
  state = {
    collapsed: true
  }
  render() {
    const { collapsed } = this.state
    return (
      <div>
        <Layout>
          <Layout>
            {/*右边数据*/}
            <Content>Content</Content>
            {/*左边圈子*/}
            <Sider
              className={indexStyles.siderRight}
              collapsible
              collapsedWidth={56}
              collapsed={collapsed}
              width={300}
              theme={'light'}
              trigger={null}
            ></Sider>
          </Layout>
        </Layout>
      </div>
    )
  }
}
