import React, { Component } from "react";
import { connect } from "dva/index"
import { Route, Switch, } from 'dva/router'
import indexStyles from './index.less'
import SimpleHeader from './Components/SimpleHeader/index'
import WorkbenchPage from './Components/WorkbenchPage'
import Home from './Components/Home'
import { isColor } from '@/utils/util'
import defaultWallpaperSrc from '@/assets/simplemode/acd42051256454f9b070300b8121eae2.png'

const getEffectOrReducerByName = name => `technological/${name}`

class SimpleMode extends Component {

  constructor(props) {
    super(props);
    this.state = {}
  }

  // 初始化极简模式数据
  initGetSimpleModeData = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'simplemode/getMyBoxs',
      payload: {}
    });
    dispatch({
      type: 'simplemode/getAllBoxs',
      payload: {}
    });
  }

  componentDidMount() {
    this.initGetSimpleModeData()
    window.addEventListener('scroll', this.handleScroll, false) //监听滚动
    window.addEventListener('resize', this.handleResize, false) //监听窗口大小改变
  }

  componentWillUnmount() { //一定要最后移除监听器，以防多个组件之间导致this的指向紊乱
    window.removeEventListener('scroll', this.handleScroll, false)
    window.removeEventListener('resize', this.handleResize, false)
  }

  handleScroll = e => {
    // console.log(
    //   '浏览器滚动事件',
    //   e.srcElement.scrollingElement.scrollTop,
    //   e.srcElement.scrollingElement.scrollHeight
    // )
    //e.srcElement.scrollingElement.scrollTop为距离滚动条顶部高度
    // e.srcElement.scrollingElement.scrollHeight为整个文档高度
  }

  handleResize = e => {
    const { dispatch, chatImVisiable } = this.props;
    // console.log('浏览器窗口大小改变事件', e.target.innerWidth);
    const width = document.body.scrollWidth;
    let rightWidth = 0;
    if (chatImVisiable) {
      rightWidth = 400;
    }
    let workbenchBoxContentWapperModalStyle = { width: (width - rightWidth) + 'px' }
    dispatch({
      type: 'simplemode/updateDatas',
      payload: {
        workbenchBoxContentWapperModalStyle: workbenchBoxContentWapperModalStyle
      }
    });
  }

  handleHiddenNav = () => {
    const { dispatch, leftMainNavVisible } = this.props;
    dispatch({
      type: 'simplemode/updateDatas',
      payload: {
        leftMainNavVisible: false
      }
    });
  }

  renderRoutes = () => {
    return (
      <Switch>
        <Route path="/technological/simplemode/home" component={Home} />
        <Route path="/technological/simplemode/workbench" component={WorkbenchPage} />
      </Switch>
    )
  }
  render() {
    const {
      simpleHeaderVisiable,
      setWapperCenter,
      currentUserWallpaperContent,
      userInfo = {},
    } = this.props;

    const { wallpaper = defaultWallpaperSrc } = userInfo;
    const wallpaperContent = currentUserWallpaperContent ? currentUserWallpaperContent : wallpaper;
    let bgStyle = {}
    if (isColor(wallpaperContent)) {
      bgStyle = { backgroundColor: wallpaperContent };
    } else {
      bgStyle = { backgroundImage: `url(${wallpaperContent})` };
    }
    return (
      <div className={`${indexStyles.wapper} ${indexStyles.wapperBg} ${setWapperCenter ? indexStyles.wapper_center : ''}`} onClick={this.handleHiddenNav} style={bgStyle}>
        {simpleHeaderVisiable && <SimpleHeader />}
        {this.renderRoutes()}
      </div>

    )
  }
};

export default connect(({ simplemode: {
  simpleHeaderVisiable,
  setWapperCenter,
  chatImVisiable,
  leftMainNavVisible,
  currentUserWallpaperContent,
}, technological: {
  datas: { userInfo }
} }) => ({
  simpleHeaderVisiable,
  setWapperCenter,
  chatImVisiable,
  leftMainNavVisible,
  currentUserWallpaperContent,
  userInfo
}))(SimpleMode)
