import React, { Component } from 'react'
import PropTypes from 'prop-types'
import globalStyles from '@/globalset/css/globalClassName.less'
import styles from './index.less'
import MainBoard from './MainBoard'
import FeatureBox from './FeatureBox'
import BoardFeatures from './BoardFeatures'
// import defaultWallpaperSrc from '@/assets/simplemode/acd42051256454f9b070300b8121eae2.png'
import { isColor } from '../../../../../utils/util'
import { connect } from 'dva'
const defaultWallpaperSrc = ''
@connect(mapStateToProps)
export default class index extends Component {
  constructor(props) {
    super(props)
    this.state = {
      bgStyle: {}
    }
  }
  static propTypes = {
    prop: PropTypes
  }
  componentDidMount() {
    this.lazyLoadBgImg(this.props)
  }
  componentWillReceiveProps(nextProps) {
    this.lazyLoadBgImg(nextProps)
  }
  lazyLoadBgImg = (nextProps = {}) => {
    const { currentUserWallpaperContent, userInfo = {} } = nextProps
    if (
      currentUserWallpaperContent == this.props.currentUserWallpaperContent &&
      !!currentUserWallpaperContent
    )
      return
    const _self = this
    const { show } = this.state
    const wallpaper = userInfo.id
      ? userInfo.wallpaper || defaultWallpaperSrc
      : ''
    const wallpaperContent = currentUserWallpaperContent
      ? currentUserWallpaperContent
      : wallpaper
    let bgStyle = {}
    if (isColor(wallpaperContent)) {
      bgStyle = { backgroundColor: wallpaperContent }
      this.setState({ bgStyle })
    } else {
      const temp = new Image()
      temp.src = wallpaperContent
      temp.onload = () => {
        _self.setState({
          bgStyle: { backgroundImage: `url(${wallpaperContent})` }
        })
      }
    }
  }
  setBgImg = () => {
    const { currentUserWallpaperContent, userInfo = {} } = this.props

    const { wallpaper = defaultWallpaperSrc } = userInfo
    const wallpaperContent = currentUserWallpaperContent
      ? currentUserWallpaperContent
      : wallpaper
    let bgStyle = {}
    if (isColor(wallpaperContent)) {
      bgStyle = { backgroundColor: wallpaperContent }
    } else {
      bgStyle = { backgroundImage: `url(${wallpaperContent})` }
    }
    // debugger
    return bgStyle
  }
  render() {
    return (
      <div className={`${styles.main_wapper}`}>
        <div className={styles.main_lf_wapper}>
          <MainBoard></MainBoard>
        </div>

        <div className={styles.main_rt_Wapper}>
          <FeatureBox setHomeVisible={this.props.setHomeVisible} />
          <BoardFeatures />
        </div>
        <div
          className={`${styles.main_wapper_after}`}
          style={{
            ...this.state.bgStyle
            //  ...this.setBgImg()
          }}
        ></div>
      </div>
    )
  }
}
//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
  simplemode: {
    simpleHeaderVisiable,
    setWapperCenter,
    currentUserWallpaperContent
  },
  technological: {
    datas: { userInfo = {} }
  }
}) {
  return {
    simpleHeaderVisiable,
    setWapperCenter,
    currentUserWallpaperContent,
    userInfo
  }
}
