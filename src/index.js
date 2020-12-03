import '@babel/polyfill'
import 'raf/polyfill'
// import 'react-dom'
import dva from 'dva'
// 防止样式冲突lingxiIm的样式要比全局配置样式先引入，降低优先级
import 'lingxi-im/dist/main.min.css'
import './index.css'
import './global_constants' //项目全局属性
import './object_expand.js'
import { diffClientInitToken } from './globalset/clientCustorm'
import Cookies from 'js-cookie'

// import FastClick from 'fastclick'
//兼容ie10及以下
Object.setPrototypeOf = require('setprototypeof')
// var browser=navigator.appName
// var b_version=navigator.appVersion
// var version=b_version.split(";");
// var trim_Version=version[1]
// if(browser=="Microsoft Internet Explorer")
// {
//   alert(trim_Version);
// }
// 1. Initialize
let initialState = {}
const app = dva({
  // history: createHistory(), //参考自https://www.jianshu.com/p/2e9e45e9a880
  onError(e, dispatch) {
    console.log('ssssss_app_error', e.message)
    const pattern = /Loading chunk (\d)+ failed/g
    const isChunkLoadFailed = e.message.match(pattern)
    if (isChunkLoadFailed) {
      alert('当前服务器文件有更新，正在获取中...')
      window.location.reload()
    }
  },
  onReducer: r => (state, action) => {
    const newState = r(state, action)
    // 'app/logout' 为 models 目录文件中 effect 中的方法名
    if (action.type == 'technological/reducerLogout') {
      //退出登录后清除所有和用户相关的数据
      return r(initialState, action)
    }
    return newState
  }
})

// FastClick.attach(document.body)
// 2. Plugins
// app.use({});

// 3. Model
app.model(
  require('./models/technological/workbench/workbenchTaskDetail').default
)
app.model(
  require('./models/technological/workbench/workbenchPublicDatas').default
)
app.model(
  require('./models/technological/workbench/workbenchFileDetail').default
)
app.model(
  require('./models/technological/workbench/workbenchEditTeamShow').default
)
app.model(
  require('./models/technological/workbench/workbenchProccessDetail').default
)
app.model(require('./models/technological/cooperationPush').default)
app.model(
  require('./models/technological/cooperationPush/imCooperation').default
)
app.model(
  require('./models/technological/cooperationPush/simpleModeCooperate').default
)
app.model(require('./models/technological/uploadNormal').default)
app.model(require('./models/technological/globalSearch').default)
app.model(require('./models/technological/workbench/gantt/gantt').default)
app.model(require('./models/technological/public/milestoneDetail').default)
app.model(require('./models/technological/public/publicModalComment').default)
app.model(
  require('./models/technological/public/publicTaskDetailModal').default
)
app.model(
  require('./models/technological/public/publicFileDetailModal').default
)
app.model(
  require('./models/technological/public/publicProcessDetailModal').default
)
app.model(require('./models/technological/workbench/investmentMap').default)
app.model(require('./models/technological/accountSet').default)
app.model(require('./models/technological/project').default)
app.model(require('./models/technological/projectDetail/index').default)
app.model(
  require('./models/technological/projectDetail/projectDetailTask').default
)
app.model(
  require('./models/technological/projectDetail/projectDetailFile').default
)
app.model(
  require('./models/technological/projectDetail/projectDetailProcess').default
)
app.model(require('./models/technological/newsDynamic').default)
app.model(require('./models/technological/workbench/index').default)
app.model(require('./models/technological/organizationMember').default)
app.model(require('./models/modal').default)
app.model(require('./models/teamShow').default)
app.model(require('./models/teamShow/editTeamShow').default)
app.model(require('./models/teamShow/teamList').default)
app.model(require('./models/teamShow/teamInfo').default)
app.model(require('./models/technological/xczNews').default)
app.model(require('./models/simpleMode').default)
app.model(require('./models/simpleMode/simpleWorkbenchbox').default)
app.model(require('./models/simpleMode/simpleBoardCommunication').default)
app.model(require('./models/simpleMode/projectCommunication').default)
app.model(require('./models/organizationManager').default)
app.model(require('./models/technological/informRemind').default)
app.model(require('./models/technological').default)

app.model(require('./models/emailRedirect').default)
app.model(require('./models/noviceGuide').default)
app.model(require('./models/initRouteRedirect').default)
app.model(require('./models/agreement').default)
app.model(require('./models/login').default)
app.model(require('./models/register').default)
app.model(require('./models/registerSuccess').default)
app.model(require('./models/resetPassword').default)
app.model(require('./models/retrievePassword').default)

// 4. Router
app.router(require('./router').default)

// 5. Start
app.start('#root')

// 初始化进入调用安卓初始化
diffClientInitToken(Cookies.get('Authorization'))

// window.addEventListener("storage", function (e) {
//   const { key, newValue, oldValue } = e
//   if ('OrganizationId' == key) { //作为切换组织时，需要重新加载数据
//     if (newValue != oldValue) {
//       Modal.confirm({
//         title: '您当前所属的组织已经发生变化，继续操作将有可能无法正常使用后台服务，确认重新加载数据？',
//         onOk() {
//           window.location.reload()
//         }
//       })

//     }
//   }
// });
