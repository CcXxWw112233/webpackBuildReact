import React, { Component, lazy, Suspense } from 'react'
import { connect } from 'dva/index'

// import WallpaperSelect from '../WallpaperSelect/index'
// import WorkbenchBoxSelect from '../WorkbenchBoxSelect/index'
import HomeMain from './HomeMain'

// const HomeMain = lazy(() => import('./HomeMain'))
const WallpaperSelect = lazy(() => import('../WallpaperSelect/index'))
const WorkbenchBoxSelect = lazy(() => import('../WorkbenchBoxSelect/index'))
class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      simpleHeaderVisiable: true,
      myWorkbenchBoxsVisiable: true,
      wallpaperSelectVisiable: true,
      workbenchBoxSelectVisiable: false,
      createNewBoardVisiable: false
    }
  }

  componentDidMount() {
    const { dispatch } = this.props
    // dispatch({
    //   type: 'simplemode/getMyBoxs',
    //   payload: {}
    // });
    // dispatch({
    //   type: 'simplemode/getAllBoxs',
    //   payload: {}
    // });
    dispatch({
      type: 'simplemode/updateDatas',
      payload: {
        chatImVisiable: false,
        leftMainNavIconVisible: true
      }
    })
    window.addEventListener('keydown', this.handleEscKeypress.bind(this))
  }

  componentWillUnmount() {
    const { dispatch } = this.props
    // dispatch({
    //   type: 'workbench/updateDatas',
    //   payload: {
    //     projectList: []
    //   }
    // })
    dispatch({
      type: 'simplemode/updateDatas',
      payload: {
        board_card_todo_list: [],
        board_flow_todo_list: []
      }
    })
    window.removeEventListener('keydown', this.handleEscKeypress.bind(this))
  }

  handleEscKeypress = e => {
    // console.log('esc',e.which);

    if (e.which == 27) {
      const { workbenchBoxSelectVisiable } = this.state
      if (workbenchBoxSelectVisiable) {
        this.setHomeVisible({
          simpleHeaderVisiable: true,
          myWorkbenchBoxsVisiable: true,
          wallpaperSelectVisiable: true,
          workbenchBoxSelectVisiable: false,
          createProjectVisiable: false
        })
      }
    }
  }

  setHomeVisible = data => {
    this.setState(data)
  }

  showDrawer = () => {
    this.setState({
      visible: true
    })
  }

  onClose = () => {
    this.setState({
      visible: false
    })
  }

  render() {
    const {
      myWorkbenchBoxsVisiable,
      wallpaperSelectVisiable,
      workbenchBoxSelectVisiable
    } = this.state

    return (
      <div>
        {myWorkbenchBoxsVisiable && (
          <HomeMain {...this.state} setHomeVisible={this.setHomeVisible} />
        )}
        <Suspense fallback={<div></div>}>
          <div></div>
          {/* {myWorkbenchBoxsVisiable && <MyWorkbenchBoxs {...this.state} setHomeVisible={this.setHomeVisible} />} */}

          {wallpaperSelectVisiable && (
            <WallpaperSelect
              {...this.state}
              setHomeVisible={this.setHomeVisible}
            />
          )}

          {workbenchBoxSelectVisiable && (
            <WorkbenchBoxSelect
              {...this.state}
              setHomeVisible={this.setHomeVisible}
            />
          )}
        </Suspense>
      </div>
    )
  }
}

export default connect(({ simplemode: { leftMainNavIconVisible } }) => ({
  leftMainNavIconVisible
}))(Home)
