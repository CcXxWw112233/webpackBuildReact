import React, { Component } from 'react'
import { connect } from 'dva/index'
import Header from './Header'
import CreateTask from './TaskItemComponent/CreateTask'
import FileModule from './FileModule'
import ProcessIndex from './Process'
import indexStyles from './index.less'
import {
  checkIsHasPermissionInBoard,
  setBoardIdStorage
} from '../../../../utils/businessFunction'
import { Route, Switch } from 'dva/router'
import dynamic from 'dva/dynamic'
import dva from 'dva/index'
import {
  PROJECT_FILES_FILE_INTERVIEW,
  PROJECT_FLOW_FLOW_ACCESS,
  PROJECT_TEAM_CARD_INTERVIEW
} from '../../../../globalset/js/constant'

class ProjectDetail extends Component {
  constructor(props) {
    super(props)
  }

  initialData = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'projectDetail/updateDatas',
      payload: {
        projectRoles: [], //项目角色
        board_id: '',
        //全局任务key
        appsSelectKey: '', //应用key
        appsSelectKeyIsAreadyClickArray: [], //点击过的appsSelectKey push进数组，用来记录无需重新查询数据
        appsList: [], //全部app列表
        //项目详情和任务
        projectInfoDisplay: false, //项目详情是否出现 projectInfoDisplay 和 isInitEntry 要同时为一个值
        isInitEntry: false, //是否初次进来项目详情
        relations_Prefix: [], //内容关联前部分
        projectDetailInfoData: {},
        milestoneList: []
      }
    })
  }

  historyListenSet = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'projectDetail/historyListenSet',
      payload: {}
    })
  }

  componentWillMount() {
    this.historyListenSet()
    // console.log('sss', 111)
  }

  componentWillUnmount() {
    // console.log('sss', 3333)
    this.initialData()
    const { dispatch } = this.props
    dispatch({
      //清空项目默认页面可见数据--（一进来就看到的）
      type: 'projectDetail/removeAllProjectData',
      payload: {}
    })
  }

  componentDidMount() {
    // console.log('sss', 222)
  }

  filterAppsModule = () => {
    const { appsSelectKey } = this.props
    let appFace = <div></div>
    switch (appsSelectKey) {
      case '2':
        appFace = checkIsHasPermissionInBoard(PROJECT_FLOW_FLOW_ACCESS) && (
          <ProcessIndex />
        )
        break
      case '3':
        appFace = checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_INTERVIEW) && (
          <CreateTask />
        )
        break
      case '4':
        appFace = checkIsHasPermissionInBoard(PROJECT_FILES_FILE_INTERVIEW) && (
          <FileModule />
        )
        break
      default:
        break
    }
    return appFace
  }

  render() {
    const app = dva()
    const routes = [
      {
        path: '/technological/projectDetail/:id/card/:id?',
        component: () => CreateTask
      },
      {
        path: '/technological/projectDetail/:id/flow/:id?',
        component: () => ProcessIndex
      },
      {
        path: '/technological/projectDetail/:id/file/:id?',
        component: () => FileModule
      }
    ]
    return (
      <div
        style={{
          height: 'auto',
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          margin: '0 auto'
        }}
      >
        <div className={indexStyles.headerMaskDown}></div>
        <Header />
        <div style={{ padding: '0 20px' }}>
          {/* {this.filterAppsModule()} */}
          <Switch>
            {routes.map(({ path, ...dynamics }, key) => {
              return (
                <Route
                  key={key}
                  path={path}
                  component={dynamic({
                    app,
                    ...dynamics
                  })}
                />
              )
            })}
          </Switch>
        </div>
      </div>
    )
  }
}

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
  technological: {
    datas: { userBoardPermissions }
  }
}) {
  return {
    userBoardPermissions
  }
}
export default connect(mapStateToProps)(ProjectDetail)
