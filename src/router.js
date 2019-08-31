import React from 'react'
import PropTypes from 'prop-types'
import './components/Message'
import { Switch, Route, Redirect, routerRedux, Router } from 'dva/router'
import dynamic from 'dva/dynamic'

const Routers = function ({ history, app }) {
  history.listen((location) => {
    switch (location.pathname) {
      case '/login':
        document.title = '灵犀-登录'
        break
      case '/login/wechatBind':
        document.title = '灵犀-微信绑定'
        break
      case '/register':
        document.title = '灵犀-注册'
        break
      case '/registerSuccess':
        document.title = '灵犀-注册成功'
        break
      case '/agreement/service':
        document.title = '灵犀-服务协议'
        break
      case '/agreement/privacy':
        document.title = '灵犀-隐私协议'
        break
      case '/resetPassword':
        document.title = '灵犀-重置密码'
        break
      case '/retrievePassword':
        document.title = '灵犀-找回密码'
        break
      case '/organizationManager':
        document.title = '灵犀-组织管理'
        break
      case '/technological/accoutSet':
        document.title = '灵犀-账户设置'
        break
      case '/technological/project':
        document.title = '灵犀-项目'
        break
      case '/technological/projectDetail':
        document.title = '灵犀-项目详情'
        break
      case '/technological/newsDynamic':
        document.title = '灵犀-动态'
        break
      case '/technological/workbench':
        document.title = '灵犀-工作台'
        break
      case '/technological/organizationMember':
        document.title = '灵犀-团队管理'
        break
      case '/teamShow/editTeamShow':
        document.title = '灵犀-编辑团队秀'
        break
      case '/teamShow/teamList':
        document.title = '灵犀-团队秀'
        break
      case '/teamShow/teamInfo':
        document.title = '灵犀-团队秀'
        break
      default:
        document.title = '灵犀'
        break
    }
  })
  // const error = dynamic({
  //   app,
  //   component: () => import('./routes/error'),
  // })
  const routes = [
    {
      path: '/',
      models: () => [import('./models/initRouteRedirect')],
      component: () => import('./routes/InitRouteRedirect/index'),
    }, {
      path: '/agreement/service',
      models: () => [import('./models/agreement')],
      component: () => import('./routes/Agreement/service')
    }, {
      path: '/agreement/privacy',
      models: () => [import('./models/agreement')],
      component: () => import('./routes/Agreement/privacy')
    }, {
      path: '/login',
      models: () => [import('./models/login')],
      component: () => import('./routes/Login/'),
    }, {
      path: '/register',
      models: () => [import('./models/register')],
      component: () => import('./routes/Register/'),
    }, {
      path: '/registerSuccess',
      models: () => [import('./models/registerSuccess')],
      component: () => import('./routes/RegisterSuccess/'),
    }, {
      path: '/resetPassword',
      models: () => [import('./models/resetPassword')],
      component: () => import('./routes/ResetPassword/'),
    }, {
      path: '/retrievePassword',
      models: () => [import('./models/retrievePassword')],
      component: () => import('./routes/RetrievePassword/'),
    }, {
      path: '/technological',
      models: () => [import('./models/technological'),
      import('./models/technological/cooperationPush'),
      import('./models/technological/globalSearch'),
      import('./models/technological/workbench/gantt'),
      import('./models/technological/public/milestoneDetail'),
      import('./models/technological/public/publicModalComment'),
      import('./models/technological/workbench/investmentMap'),

      import('./models/technological/accountSet'),
      import('./models/technological/project'),
      import('./models/technological/projectDetail/index'),
      import('./models/technological/projectDetail/projectDetailTask'),
      import('./models/technological/projectDetail/projectDetailFile'),
      import('./models/technological/projectDetail/projectDetailProcess'),
      import('./models/technological/projectDetail/projectDetailProcess'),

      import('./models/technological/newsDynamic'),
      import('./models/technological/workbench/index'),
      import('./models/technological/workbench/workbenchTaskDetail'),
      import('./models/technological/workbench/workbenchPublicDatas'),
      import('./models/technological/workbench/workbenchFileDetail'),
      import('./models/technological/workbench/workbenchEditTeamShow'),
      import('./models/technological/workbench/workbenchProccessDetail'),

      import('./models/technological/organizationMember'),
      import('./models/modal'),
      import('./models/teamShow'),
      import('./models/teamShow/editTeamShow'),
      import('./models/teamShow/teamList'),
      import('./models/teamShow/teamInfo'),

      import('./models/technological/xczNews'),
      import('./models/simpleMode'),
      import('./models/simpleMode/simpleWorkbenchbox'),
      import('./models/simpleMode/simpleBoardCommunication'),
      import('./models/organizationManager'),
      
      import('./models/technological/informRemind'),


      ],
      component: () => import('./routes/Technological/'),
    }, {
      path: '/emailRedirect',
      models: () => [import('./models/emailRedirect')],
      component: () => import('./routes/EmailRedirect/'),
    }, {
      path: '/organizationManager',
      models: () => [import('./models/organizationManager')],
      component: () => import('./routes/organizationManager/'),
    }, {
      path: '/teamShow',
      models: () => [
        import('./models/teamShow'),
        import('./models/teamShow/editTeamShow'),
        import('./models/teamShow/teamList'),
        import('./models/teamShow/teamInfo'),
        import('./models/modal')
      ],
      component: () => import('./routes/TeamShow/'),
    }, {
      path: '/noviceGuide',
      models: () => [import('./models/noviceGuide')],
      component: () => import('./routes/NoviceGuide'),
    }, {
      path: '/test',
      models: () => [import('./models/organizationManager')],
      component: () => import('./routes/Test/'),
    }, {
      path: '/index',
      component: () => import('./routes/Index'),
    }, {
      path: '/iframeOut',
      component: () => import('./routes/IframeOut'),
    },
  ]
  //去掉exact
  return (
    <Router history={history}>
      <Switch>
        {
          routes.map(({ path, ...dynamics }, key) => {
            return (
              <Route key={key}
                exact={(path.indexOf('/technological') !== -1 || path.indexOf('/teamShow') !== -1) ? false : true}
                path={path}
                component={dynamic({
                  app,
                  ...dynamics,
                })}
              />
            )
          })
        }
      </Switch>
    </Router>
  )
}

Routers.propTypes = {
  history: PropTypes.object,
  app: PropTypes.object,
}

export default Routers
