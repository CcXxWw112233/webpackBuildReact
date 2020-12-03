import dva, { connect } from 'dva/index'
import globalStyles from '@/globalset/css/globalClassName.less'
import indexStyles from './index.less'
import { Icon } from 'antd'
import React, { Component } from 'react'
import { isColor } from '@/utils/util'

class WallpaperSelect extends Component {
  constructor(props) {
    super(props)
    this.state = {
      wallpaperSelectModalVisiable: false
    }
  }
  componentDidMount() {
    //window.addEventListener('keydown', this.handleLeftOrRightKeypress,false)
  }

  componentWillUnmount() {
    //window.removeEventListener('keydown', this.handleLeftOrRightKeypress,false)
  }

  handleLeftOrRightKeypress = e => {
    console.log('handleLeftOrRightKeypress')
    if (e.which == 37) {
      this.selectPreviousWallpaper()
    } else if (e.which == 39) {
      this.selectNextWallpaper()
    }
  }

  openWallpaper = () => {
    this.setState({
      wallpaperSelectModalVisiable: true
    })
    this.props.setHomeVisible({
      simpleHeaderVisiable: true,
      myWorkbenchBoxsVisiable: true,
      wallpaperSelectVisiable: true,
      workbenchBoxSelectVisiable: false,
      createProjectVisiable: false
    })
  }

  closeWallpaper = () => {
    this.setState({
      wallpaperSelectModalVisiable: false
    })
    this.props.setHomeVisible({
      simpleHeaderVisiable: true,
      myWorkbenchBoxsVisiable: true,
      wallpaperSelectVisiable: true,
      workbenchBoxSelectVisiable: false,
      createProjectVisiable: false
    })
  }

  selectMyWallpaper = (wallpaperId, wallpaperContent, wallpaperType) => {
    const { dispatch } = this.props
    //console.log(wallpaperContent);
    this.setState({
      usersetWallpaperId: wallpaperId
    })
    dispatch({
      type: 'accountSet/updateUserSet',
      payload: {
        preference_wallpaper_id: wallpaperId
      }
    })
    dispatch({
      type: 'simplemode/updateDatas',
      payload: {
        currentUserWallpaperContent: wallpaperContent
      }
    })
  }

  selectPreviousWallpaper = () => {
    //获取当前壁纸index
    const {
      allWallpaperList = [],
      currentUserWallpaperContent,
      userInfo = {}
    } = this.props
    const { wallpaper = '' } = userInfo
    const wallpaperContent = currentUserWallpaperContent
      ? currentUserWallpaperContent
      : wallpaper
    if (allWallpaperList.length === 0) {
      return
    }
    let currentIndex = allWallpaperList.findIndex(
      value => value.content === wallpaperContent
    )
    if (currentIndex === 0) {
      currentIndex = allWallpaperList.length - 1
    } else {
      currentIndex = currentIndex - 1
    }
    const currentWallpaper = allWallpaperList[currentIndex]
    if (currentWallpaper) {
      this.selectMyWallpaper(currentWallpaper.id, currentWallpaper.content)
    }

    // console.log("上一张")
  }

  selectNextWallpaper = () => {
    //获取当前壁纸index
    const {
      allWallpaperList = [],
      currentUserWallpaperContent,
      userInfo = {}
    } = this.props
    const { wallpaper = '' } = userInfo
    const wallpaperContent = currentUserWallpaperContent
      ? currentUserWallpaperContent
      : wallpaper
    if (allWallpaperList.length === 0) {
      return
    }
    let currentIndex = allWallpaperList.findIndex(
      value => value.content === wallpaperContent
    )
    if (currentIndex === allWallpaperList.length - 1) {
      currentIndex = -0
    } else {
      currentIndex = currentIndex + 1
    }
    const currentWallpaper = allWallpaperList[currentIndex]
    if (currentWallpaper) {
      this.selectMyWallpaper(currentWallpaper.id, currentWallpaper.content)
    }

    // console.log("下一张")
  }
  render() {
    const { wallpaperSelectModalVisiable } = this.state
    const {
      allWallpaperList = [],
      currentUserWallpaperContent,
      userInfo = {}
    } = this.props
    const { wallpaper = '' } = userInfo
    const wallpaperContent = currentUserWallpaperContent
      ? currentUserWallpaperContent
      : wallpaper

    return (
      <div>
        {!wallpaperSelectModalVisiable && (
          <div className={indexStyles.wallpaperSelectWapper}>
            <div className={indexStyles.wallpaperSelector}>
              <i
                title={'上一页壁纸'}
                onClick={this.selectPreviousWallpaper}
                className={`${globalStyles.authTheme}`}
                style={{
                  fontSize: '20px',
                  color: 'rgba(255, 255, 255, 1)',
                  cursor: 'pointer'
                }}
              >
                &#xe7ec;
              </i>
              <i
                className={`${globalStyles.authTheme}`}
                style={{
                  fontSize: '28px',
                  color: 'rgba(255, 255, 255, 1)',
                  marginLeft: '26px',
                  marginRight: '26px',
                  cursor: 'pointer'
                }}
                onClick={this.openWallpaper}
              >
                &#xe631;
              </i>
              <i
                title={'下一页壁纸'}
                onClick={this.selectNextWallpaper}
                className={`${globalStyles.authTheme}`}
                style={{
                  fontSize: '20px',
                  color: 'rgba(255, 255, 255, 1)',
                  cursor: 'pointer'
                }}
              >
                &#xe7eb;
              </i>
            </div>
          </div>
        )}

        {wallpaperSelectModalVisiable && (
          <div className={indexStyles.wallpaperSelectModal}>
            <div className={indexStyles.wallpaperBoxsTitle}>选择壁纸</div>
            <div className={indexStyles.wallpaperBoxs}>
              {allWallpaperList.map((wallpaperItem, index) => {
                let bgStyle = {}
                if (isColor(wallpaperItem.content)) {
                  bgStyle = { backgroundColor: wallpaperItem.content }
                } else {
                  bgStyle = {
                    backgroundImage: `url(${wallpaperItem.content.replace(
                      '/wallpapers/',
                      '/wallpapers/thumbs/'
                    )})`
                  }
                }
                return (
                  <div
                    id={wallpaperItem.id}
                    key={wallpaperItem.id}
                    className={`${indexStyles.wallpaperItem}`}
                    style={bgStyle}
                    onClick={e =>
                      this.selectMyWallpaper(
                        wallpaperItem.id,
                        wallpaperItem.content
                      )
                    }
                  >
                    <div
                      className={`${indexStyles.wallpaperItemCover} ${
                        wallpaperContent === wallpaperItem.content
                          ? indexStyles.selected
                          : ''
                      }`}
                    >
                      {wallpaperContent === wallpaperItem.content && (
                        <div className={indexStyles.wallpaperItemSelected_icon}>
                          <Icon
                            type="check-circle"
                            theme="filled"
                            style={{ fontSize: '16px' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className={indexStyles.close} onClick={this.closeWallpaper}>
              <Icon type="close" style={{ fontSize: '20px' }} />
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default connect(
  ({
    simplemode: {
      wallpaperSelectModalVisiable,
      allWallpaperList,
      currentUserWallpaperContent
    },
    technological: {
      datas: { userInfo }
    }
  }) => ({
    wallpaperSelectModalVisiable,
    allWallpaperList,
    currentUserWallpaperContent,
    userInfo
  })
)(WallpaperSelect)
