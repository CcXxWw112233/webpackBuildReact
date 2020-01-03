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
import QueryString from 'querystring'
import { initWsFun } from '../../components/WsNewsDynamic'
import Cookies from 'js-cookie'
import { isPaymentOrgUser } from "@/utils/businessFunction"
import { routerRedux } from "dva/router";
import UploadNotification from '@/components/UploadNotification'

const { Sider, Content } = Layout;
let net = null
@connect(mapStateToProps)
export default class Technological extends React.Component {

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.historyListenSet()
    this.connectWsToModel()
  }
  componentWillUnmount() {
    // console.log('netnet-ummount', net)
    if (net && typeof net == 'object') {
      net.send('close')
      net = null
    }
  }
  connectWsToModel = () => {
    const { dispatch } = this.props
    if (net && typeof net == 'object') {
      net.send('close')
      net = null
    }
    // console.log('netnet-create_before', net)
    setTimeout(function () {
      const calback = function (event) {
        dispatch({
          type: 'cooperationPush/connectWsToModel',
          payload: {
            event
          }
        })
      }
      net = initWsFun(calback)
      // console.log('netnet-create', net)
    }, 1000)
  }

  componentWillReceiveProps(nextProps) {
    const { currentUserOrganizes, dispatch } = nextProps;
    const { page_load_type: old_page_load_type } = this.props;
    if (old_page_load_type != nextProps.page_load_type) {

    }


  }
  // shouldComponentUpdate(newProps, newState) {
  //   const { currentUserOrganizes, dispatch } = newProps;
  //   const { page_load_type: old_page_load_type } = this.props;
  //   //只有page_load_type变化了才渲染
  //   if (old_page_load_type == newProps.page_load_type) {
  //     return false;
  //   } else {
  //     if (currentUserOrganizes && currentUserOrganizes.length > 0) {
  //       let isPayment = isPaymentOrgUser();
  //       if (!isPayment && newProps.page_load_type == 2) {

  //         dispatch({
  //           type: 'technological/setShowSimpleModel',
  //           payload: {
  //             is_simple_model: 1
  //           }
  //         })
  //         return false;
  //       }
  //     }
  //     return true;
  //   }
  // }

  getRouterParams = () => {
    // 解析参数
    const hash = window.location.hash
    let path_name_arr
    let path_name = '' //路由
    let params_str = ''
    let params = {} //路由携带的参数
    if (hash.indexOf('?') != -1) {
      path_name_arr = hash.match(/#([\S\/]*)\?/) //==>technological/projectDetail
      params_str = hash.replace(/^#\/[\w\/]+\?/, '')
      params = QueryString.parse(params_str) // 
    } else {
      path_name_arr = hash.match(/#([\S\/]*)/) //==>technological/projectDetail
    }
    path_name = path_name_arr[1]

    return {
      path_name,
      params
    }

  }

  // 获取technological层面的数据
  historyListenSet = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'technological/initGetTechnologicalDatas',
      payload: {}
    })
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
      <Layout id='technologicalLayoutWrapper' >
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
      <Layout id='technologicalLayoutWrapper' >
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
        layout = '<div></div>'
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
        <>
          {layout}
          <UploadNotification />
        </>
      </LocaleProvider>
    );
  }

};

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ technological: {
  datas: {
    page_load_type,
    // currentUserOrganizes = [],
  }
}
}) {
  return {
    page_load_type,
    // currentUserOrganizes,

  }
}

