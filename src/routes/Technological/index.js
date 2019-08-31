import React from 'react';
import { connect, } from 'dva';
import QueueAnim from 'rc-queue-anim'
import globalClassNmae from '../../globalset/css/globalClassName.less'
import { Route, Router, Switch, Link } from 'dva/router'
import dynamic from "dva/dynamic";
import dva from "dva/index";
import { LocaleProvider, Icon, Layout, Menu, } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';
import SiderLeft from './Sider/SiderLeft'
import SiderRight from './Sider/SiderRight'
import GlobalSearch from './GlobalSearch'

const { Header, Sider, Content } = Layout;

@connect(mapStateToProps)
export default class Technological extends React.Component {

  componentWillReceiveProps(nextProps) {
    
  }

  render() {

    

    const { page_load_type } = this.props;
    const app = dva();
    const routes = [
      {
        path: '/technological/accoutSet',
        component: () => import('./components/AccountSet'),
      }, {
        path: '/technological/project',
        component: () => import('./components/Project'),
      }, {
        path: '/technological/projectDetail/:id?',
        component: () => import('./components/ProjectDetail'),
      }, {
        path: '/technological/newsDynamic',
        component: () => import('./components/NewsDynamic'),
      }, {
        path: '/technological/workbench',
        component: () => import('./components/Workbench'),
      }, {
        path: '/technological/organizationMember',
        component: () => import('./components/OrganizationMember'),
      }, {
        path: '/technological/teamShow',
        component: () => import('../TeamShow/index'),
      }, {
        path: '/technological/gantt',
        component: () => import('./components/Gantt/index'),
      }, {
        path: '/technological/xczNews',
        component: () => import('./components/XczNews')
      }, {
        path: '/technological/simplemode',
        component: () => import('../SimpleMode/index'),
      }, {
        path: '/technological/investmentMap',
        component: () => import('./components/InvestmentMap'),
      },
    
    ]

    const defaultLayout = (
      <Layout >
        <Sider collapsedWidth={64} theme={'light'} collapsed={true} />
        <SiderLeft />
        <Layout style={{ backgroundColor: 'rgba(245,245,245,1)' }}>
          <Content style={{
            margin: '0 16px',
          }}
          >
            <div className={globalClassNmae.page_style_3} id={'technologicalOut'} >
              {
                routes.map(({ path, ...dynamics }, key) => {
                  return (
                    <Route key={key}
                      //exact
                      path={path}
                      component={dynamic({
                        app,
                        ...dynamics,
                      })}
                    />
                  )
                })
              }
            </div>
          </Content>
        </Layout>
        <SiderRight />
        <GlobalSearch />
      </Layout>

    )

    const simpleLayout = (
      <Layout >
        <Layout style={{ backgroundColor: 'rgba(245,245,245,1)' }}>        
          <Content style={{ height: '100vh' }} >
            <div className={globalClassNmae.page_style_3} id={'technologicalOut'} >
              {
                routes.map(({ path, ...dynamics }, key) => {
                  return (
                    <Route key={key}
                      //exact
                      path={path}
                      component={dynamic({
                        app,
                        ...dynamics,
                      })}
                    />
                  )
                })
              }
            </div>
          </Content>
        </Layout>
      </Layout>

    )

    let layout = <div></div>
    switch (page_load_type) {
      case 0:
        layout = '<div>page_load_type:0</div>'
        break;
      case 1:
        layout = simpleLayout
        break;
      case 2:
        layout = defaultLayout
        break;
      default:
        break;
    }

    return (
      <LocaleProvider locale={zh_CN}>
        {/*minWidth:1440, */}
        {layout}
      </LocaleProvider>
    );
  }

};

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ technological: {
  datas: {
    page_load_type
  }
}
}) {
  return { page_load_type }
}

