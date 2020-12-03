import React from 'react'
import { connect } from 'dva'
import QueueAnim from 'rc-queue-anim'
import globalClassNmae from '../../globalset/css/globalClassName.less'
import { Route, Router, Switch, Link } from 'dva/router'
import dynamic from 'dva/dynamic'
import dva from 'dva/index'
import { LocaleProvider, Icon, Layout, Menu } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import 'moment/locale/zh-cn'
import App from './Component/index'
const { Header, Sider, Content } = Layout

const getEffectOrReducerByName = name => `technological/${name}`
@connect(mapStateToProps)
export default class AppIndex extends React.Component {
  state = {
    collapsed: false
  }
  render() {
    const { collapsed } = this.state
    return (
      <LocaleProvider locale={zh_CN}>
        <div>
          <App />
        </div>
      </LocaleProvider>
    )
  }
}

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ modal, technological, loading }) {
  return { modal, model: technological, loading }
}
// export default connect(mapStateToProps)(Technological)
