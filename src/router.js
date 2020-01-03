// import React from 'react';
// import { Router, Route, Switch } from 'dva/router';
// import IndexPage from './routes/IndexPage/index';
// import Products from './routes/Products/index';
// import Login from './routes/Login/index';
// import Register from './routes/Register/index';
// import RegisterSuccess from './routes/RegisterSuccess'
// import ResetPassword from './routes/ResetPassword'
// import RetrievePassword from './routes/RetrievePassword'
// function RouterConfig({ history }) {
//   return (
//     <Router history={history}>
//       <Switch>
//         <Route path="/" exact component={IndexPage} />
//         <Route path="/products" exact component={Products} />
//         <Route path="/login" exact component={Login} />
//         <Route path="/register" exact component={Register} />
//         <Route path="/registerSuccess" exact component={RegisterSuccess} />
//         <Route path="/resetPassword" exact component={ResetPassword} />
//         <Route path="/retrievePassword" exact component={RetrievePassword} />
//       </Switch>
//     </Router>
//   );
// }
//
// export default RouterConfig;
import React from 'react'
import PropTypes from 'prop-types'
import './components/Message'
import { Switch, Route, Redirect, routerRedux, Router } from 'dva/router'
import dynamic from 'dva/dynamic'
const { ConnectedRouter } = routerRedux

const Routers = function ({ history, app }) {
  history.listen((location) => {
    switch (location.pathname) {
      case '/login':
        document.title = '聆悉-登录'
        break
      case '/login/wechatBind':
        document.title = '聆悉-微信绑定'
        break
      case '/register':
        document.title = '聆悉-注册'
        break
      case '/registerSuccess':
        document.title = '聆悉-注册成功'
        break
      case '/agreement/service':
        document.title = '聆悉-服务协议'
        break
      case '/agreement/privacy':
        document.title = '聆悉-隐私协议'
        break
      case '/resetPassword':
        document.title = '聆悉-重置密码'
        break
      case '/retrievePassword':
        document.title = '聆悉-找回密码'
        break
      case '/organizationManager':
        document.title = '聆悉-组织管理'
        break
      case '/technological/accoutSet':
        document.title = '聆悉-账户设置'
        break
      case '/technological/project':
        document.title = '聆悉-项目'
        break
      case '/technological/projectDetail':
        document.title = '聆悉-项目详情'
        break
      case '/technological/newsDynamic':
        document.title = '聆悉-动态'
        break
      case '/technological/workbench':
        document.title = '聆悉-工作台'
        break
      case '/technological/organizationMember':
        document.title = '聆悉-团队管理'
        break
      case '/teamShow/editTeamShow':
        document.title = '聆悉-编辑团队秀'
        break
      case '/teamShow/teamList':
        document.title = '聆悉-团队秀'
        break
      case '/teamShow/teamInfo':
        document.title = '聆悉-团队秀'
        break
      default:
        document.title = '聆悉'
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
      // models: () => [
      //   // import('./models/technological'),
      //   // import('./models/technological/cooperationPush'),
      //   // import('./models/technological/cooperationPush/imCooperation'),
      //   // import('./models/technological/cooperationPush/simpleModeCooperate'),
      //   // import('./models/technological/uploadNormal'),
      //   // import('./models/technological/globalSearch'),
      //   // import('./models/technological/workbench/gantt'),
      //   // import('./models/technological/public/milestoneDetail'),
      //   // import('./models/technological/public/publicModalComment'),
      //   // import('./models/technological/public/publicTaskDetailModal'),
      //   // import('./models/technological/public/publicFileDetailModal'),
      //   // import('./models/technological/workbench/investmentMap'),
      //   // import('./models/technological/accountSet'),
      //   // import('./models/technological/project'),
      //   // import('./models/technological/projectDetail/index'),
      //   // import('./models/technological/projectDetail/projectDetailTask'),
      //   // import('./models/technological/projectDetail/projectDetailFile'),
      //   // import('./models/technological/projectDetail/projectDetailProcess'),
      //   // import('./models/technological/newsDynamic'),
      //   // import('./models/technological/workbench/index'),
      //   // import('./models/technological/workbench/workbenchTaskDetail'),
      //   // import('./models/technological/workbench/workbenchPublicDatas'),
      //   // import('./models/technological/workbench/workbenchFileDetail'),
      //   // import('./models/technological/workbench/workbenchEditTeamShow'),
      //   // import('./models/technological/workbench/workbenchProccessDetail'),
      //   // import('./models/technological/organizationMember'),
      //   // import('./models/modal'),
      //   // import('./models/teamShow'),
      //   // import('./models/teamShow/editTeamShow'),
      //   // import('./models/teamShow/teamList'),
      //   // import('./models/teamShow/teamInfo'),
      //   // import('./models/technological/xczNews'),
      //   // import('./models/simpleMode'),
      //   // import('./models/simpleMode/simpleWorkbenchbox'),
      //   // import('./models/simpleMode/simpleBoardCommunication'),
      //   // import('./models/simpleMode/projectCommunication'),
      //   // import('./models/organizationManager'),
      //   // import('./models/technological/informRemind'),
      // ],
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
    }, {
      path: '/readonly_share/:id',
      component: () => import('./routes/Technological/ReadonlyShare/AccessInterface/index'),
    }, {
      path: '/share_detailed',
      models: () => [
        import('./models/technological'),
        import('./models/technological/projectDetail/projectDetailTask'),
        import('./models/technological/projectDetail/projectDetailFile'),
        import('./models/technological/projectDetail'),
      ],
      component: () => import('./routes/Technological/ReadonlyShare/DetailedShare/index'),
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
