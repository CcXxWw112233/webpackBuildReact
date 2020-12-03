import React, { Component, lazy, Suspense } from 'react'
import { connect } from 'dva'
import indexStyles from './index.less'
import { isPaymentOrgUser } from '@/utils/businessFunction'
import { Spin } from 'antd'
// import MiniBoxNavigations from '../MiniBoxNavigations/index'
// import BoardCommunication from './BoardCommunication/index'
// import BoardArchives from './BoardArchives/index'
// import BoardPlan from './BoardPlan/index'
// import InvestmentMaps from './InvestmentMaps/index'
// import XczNews from './XczNews/index'
// import Zhichengshe from './Zhichengshe/index'
// import Workglows from './Workflows'
// import StatisticalReport from './StatisticalReport'
const BoardPlan = lazy(() => import('./BoardPlan/index'))
const MiniBoxNavigations = lazy(() => import('../MiniBoxNavigations/index'))
const BoardCommunication = lazy(() => import('./BoardCommunication/index'))
const BoardArchives = lazy(() => import('./BoardArchives/index'))
const InvestmentMaps = lazy(() => import('./InvestmentMaps/index'))
const XczNews = lazy(() => import('./XczNews/index'))
const Zhichengshe = lazy(() => import('./Zhichengshe/index'))
const Workglows = lazy(() => import('./Workflows'))
const StatisticalReport = lazy(() => import('./StatisticalReport'))
const WhiteBoardRooms = lazy(() => import('./WhiteBoard'))
const MeetingManage = lazy(() => import('./MeetingManage'))

class WorkbenchPage extends Component {
  constructor(props) {
    // console.log("WorkbenchPage组件初始化");
    super(props)
    this.state = {}
  }
  componentWillMount() {
    const { dispatch, currentSelectedWorkbenchBox = {} } = this.props
    if (!currentSelectedWorkbenchBox.id) {
      // dispatch({
      //     type: 'simplemode/routingJump',
      //     payload: {
      //         route: '/technological/simplemode/home'
      //     }
      // });
    }

    dispatch({
      type: 'simplemode/updateDatas',
      payload: {
        leftMainNavIconVisible: false
      }
    })
  }
  componentWillUnmount() {
    const { dispatch } = this.props
    dispatch({
      type: 'simplemode/updateDatas',
      payload: {
        allOrgBoardTreeList: []
      }
    })
    window.removeEventListener(
      'resize',
      this.setWorkbenchBoxContentHeight,
      true
    )
  }
  componentDidMount() {
    const { currentSelectedWorkbenchBox = {} } = this.props
    this.setWorkbenchVisible(currentSelectedWorkbenchBox)
    this.setWorkbenchBoxContentHeight()
    window.addEventListener('resize', this.setWorkbenchBoxContentHeight, true)
  }
  componentWillReceiveProps(nextProps) {
    const { currentSelectedWorkbenchBox } = this.props
    const {
      currentSelectedWorkbenchBox: newCurrentSelectedWorkbenchBox = {}
    } = nextProps
    if (
      !currentSelectedWorkbenchBox ||
      currentSelectedWorkbenchBox.id != newCurrentSelectedWorkbenchBox.id
    ) {
      this.setWorkbenchVisible(newCurrentSelectedWorkbenchBox)
    }
  }
  // 保存区域高度
  setWorkbenchBoxContentHeight = () => {
    const target = document.getElementById('container_workbenchBoxContent')
    const default_height = document.querySelector('body').clientHeight - 80
    const target_height = target.clientHeight || default_height
    const height = Math.min(target_height, default_height)
    // console.log('ssssssssaa', { target_height, default_height })
    this.setState({
      workbenchBoxContent_height: height
    })
  }
  initSimpleWorkbenchboxCommData(dispatch) {
    dispatch({
      type: 'simpleWorkbenchbox/initSimpleWorkbenchboxCommData',
      payload: {}
    })
  }

  setWorkbenchVisible(currentSelectedWorkbenchBox) {
    const { dispatch, chatImVisiable } = this.props
    if (currentSelectedWorkbenchBox.id && currentSelectedWorkbenchBox.code) {
      if (currentSelectedWorkbenchBox.code != 'board:chat') {
        const width = document.body.scrollWidth
        let workbenchBoxContentWapperModalStyle = chatImVisiable
          ? { width: width - 400 + 'px' }
          : { width: '100%' }
        dispatch({
          type: 'simplemode/updateDatas',
          payload: {
            workbenchBoxContentWapperModalStyle: workbenchBoxContentWapperModalStyle
          }
        })
      }
      this.setState({
        currentSelectedWorkbenchBox
      })
    }
  }

  render() {
    const {
      workbenchBoxContentWapperModalStyle,
      currentSelectedWorkbenchBox,
      simplemodeCurrentProject
    } = this.props
    const { code: select_box_code } = currentSelectedWorkbenchBox
    let isPaymentUser = false
    // console.log("simplemodeCurrentProject", simplemodeCurrentProject);
    if (simplemodeCurrentProject && simplemodeCurrentProject.board_id) {
      isPaymentUser = isPaymentOrgUser(simplemodeCurrentProject.org_id)
    } else {
      isPaymentUser = isPaymentOrgUser()
    }
    const { workbenchBoxContent_height } = this.state
    const special_backgroud = ['mine:flows', 'board:files']
    // console.log('currentSelectedWorkbenchBox', workbenchBoxContent_height)
    return (
      <div className={indexStyles.workbenchBoxContentModalContainer}>
        <Suspense fallback={<div></div>}>
          <MiniBoxNavigations
            currentSelectedWorkbenchBox={currentSelectedWorkbenchBox}
          />
        </Suspense>
        <Suspense
          fallback={
            <div
              className={indexStyles.workbenchBoxContentWapper}
              style={{
                background: special_backgroud.includes(select_box_code)
                  ? 'rgba(245, 245, 245, 1)'
                  : '',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Spin size={'large'}></Spin>
            </div>
          }
        >
          <div
            id="container_workbenchBoxContent"
            className={indexStyles.workbenchBoxContentModalWapper}
            style={
              workbenchBoxContentWapperModalStyle
                ? workbenchBoxContentWapperModalStyle
                : {}
            }
          >
            <div
              className={indexStyles.workbenchBoxContentWapper}
              style={{
                background: special_backgroud.includes(select_box_code)
                  ? 'rgba(245, 245, 245, 1)'
                  : ''
              }}
            >
              {'board:plans' == select_box_code && (
                <BoardPlan
                  workbenchBoxContent_height={workbenchBoxContent_height}
                />
              )}

              {isPaymentUser && 'board:chat' == select_box_code && (
                <BoardCommunication />
              )}

              {isPaymentUser && 'board:files' == select_box_code && (
                <BoardArchives
                  workbenchBoxContent_height={workbenchBoxContent_height}
                />
              )}

              {isPaymentUser && 'maps' == select_box_code && <InvestmentMaps />}

              {isPaymentUser && 'cases' == select_box_code && (
                <XczNews {...this.props} />
              )}
              {isPaymentUser && 'regulations' == select_box_code && (
                <Zhichengshe {...this.props} />
              )}
              {isPaymentUser && 'mine:flows' == select_box_code && (
                <Workglows
                  workbenchBoxContent_height={workbenchBoxContent_height}
                />
              )}
              {isPaymentUser && 'report' == select_box_code && (
                <StatisticalReport
                  workbenchBoxContent_height={workbenchBoxContent_height}
                />
              )}
              {isPaymentOrgUser && 'whiteboard' === select_box_code && (
                <WhiteBoardRooms org_id={this.props.OrganizationId} />
              )}
              {isPaymentOrgUser && 'meetingmanage' === select_box_code && (
                <MeetingManage org_id={this.props.OrganizationId} />
              )}
            </div>
          </div>
        </Suspense>
      </div>
    )
  }
}

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
  simplemode: {
    workbenchBoxContentWapperModalStyle,
    myWorkbenchBoxList,
    currentSelectedWorkbenchBox,
    chatImVisiable,
    leftMainNavIconVisible,
    simplemodeCurrentProject
  },
  technological: {
    datas: { OrganizationId }
  }
}) {
  return {
    workbenchBoxContentWapperModalStyle,
    myWorkbenchBoxList,
    currentSelectedWorkbenchBox,
    chatImVisiable,
    leftMainNavIconVisible,
    simplemodeCurrentProject,
    OrganizationId
  }
}
export default connect(mapStateToProps)(WorkbenchPage)
