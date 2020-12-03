import React from 'react'
import indexStyles from './index.less'
import CommentSubmit from './Comment/CommentSubmit'
import CommentLists from './Comment/CommentLists'
import globalStyles from '../../globalset/css/globalClassName.less'
import { connect } from 'dva'
import { Dropdown, Menu, Icon } from 'antd'
@connect(mapStateToProps)
export default class DetailContent extends React.Component {
  state = {
    // isShowAllDynamic: false, //是否查看全部
  }

  constructor() {
    super()
    this.relative_content_ref = React.createRef()
  }

  componentWillMount() {}

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {
    const rects = []
  }
  setIsShowAll = e => {
    if (e.key == 'allDynamics') {
      this.props.dispatch({
        type: 'publicModalComment/updateDatas',
        payload: {
          isShowAllDynamic: true
        }
      })
      // this.setState({
      //   isShowAllDynamic: true
      // })
    } else if (e.key == 'comment') {
      // this.setState({
      //   isShowAllDynamic: false
      // })
      this.props.dispatch({
        type: 'publicModalComment/updateDatas',
        payload: {
          isShowAllDynamic: false
        }
      })
    }
  }
  render() {
    const {
      clientWidth,
      clientHeight,
      offsetTopDeviation,
      isExpandFrame,
      board_id,
      currentProcessInstanceId,
      siderRightCollapsed,
      isShowAllDynamic
    } = this.props
    // const { isShowAllDynamic } = this.state
    const {
      mainContent = <div></div>, //主区域
      viceAreaTopShow = false, //副区域的关联内容能否显示
      viceAreaTopContent = <div></div>, //副区域顶部内容块
      commentSubmitContent = '', //评论提交区域区块
      commentListsContent = '', //评论列表区块
      dynamicsContent = '', //动态列表区块
      commentUseParams = {}, //评论所需要参数
      showActiveStyles = false,
      isNotShowFileDetailContentRightVisible,
      isNotShowFileDetailContentLeftScrollBar
    } = this.props

    const whetherShowAllDynamic = (
      <Menu
        onClick={this.setIsShowAll}
        selectedKeys={isShowAllDynamic ? ['allDynamics'] : ['comment']}
      >
        <Menu.Item key="allDynamics">
          <span>所有动态</span>
          <div style={{ display: isShowAllDynamic ? 'block' : 'none' }}>
            <Icon type="check" />
          </div>
        </Menu.Item>
        <Menu.Item key="comment">
          <span>仅评论</span>
          <div style={{ display: isShowAllDynamic ? 'none' : 'block' }}>
            <Icon type="check" />
          </div>
        </Menu.Item>
      </Menu>
    )
    let styleSelect = indexStyles.fileDetailContentOut

    return (
      <div
        id={'container_fileDetailContentOut'}
        className={`${styleSelect} ${showActiveStyles &&
          !isNotShowFileDetailContentRightVisible &&
          indexStyles.active_fileDetailContentOut}`}
        ref={'fileDetailContentOut'}
        style={{ height: clientHeight - offsetTopDeviation - 54 }}
      >
        <div
          className={`${
            indexStyles.fileDetailContentLeft
          } ${!isNotShowFileDetailContentLeftScrollBar &&
            globalStyles.global_vertical_scrollbar} ${showActiveStyles &&
            indexStyles.active_fileDetailContentLeft}`}
          style={{
            overflowY: !isNotShowFileDetailContentLeftScrollBar
              ? 'auto'
              : 'hidden'
          }}
        >
          {/*主要内容放置区*/}
          {mainContent}
        </div>
        {!isNotShowFileDetailContentRightVisible && (
          <div
            className={`${
              indexStyles.fileDetailContentRight
            } ${showActiveStyles && indexStyles.active_fileDetailContentRight}`}
          >
            <div
              // style={{ position: 'relative' }}
              className={`${indexStyles.fileDetailContentRight_middle}`}
              style={{
                height:
                  !showActiveStyles &&
                  clientHeight - offsetTopDeviation - 54 - 70
              }}
            >
              {/* <div
                style={{lineHeight: '54px'}}
                className={indexStyles.lookAll}
                onClick={this.setIsShowAll.bind(this)}>
                {!isShowAllDynamic? '所有动态': '部分动态'}
                {isShowAllDynamic?(
                  <i style={{lineHeight: '54px'}} className={`${globalStyles.authTheme} ${indexStyles.lookAll_logo}`}>&#xe7ee;</i>
                ):(
                  <i style={{lineHeight: '54px'}} className={`${globalStyles.authTheme}  ${indexStyles.lookAll_logo}`}>&#xe7ed;</i>
                )}
  
              </div> */}
              <div>
                <Dropdown
                  overlayClassName={indexStyles.showAllDynamics}
                  overlay={whetherShowAllDynamic}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                >
                  <div className={indexStyles.lookAll}>
                    <span>{isShowAllDynamic ? '所有动态' : '仅评论'}</span>
                    <i
                      style={{ lineHeight: '54px' }}
                      className={`${globalStyles.authTheme} ${indexStyles.lookAll_logo}`}
                    >
                      &#xe7ee;
                    </i>
                  </div>
                </Dropdown>
              </div>

              <div
                className={`${globalStyles.global_vertical_scrollbar} ${
                  indexStyles.fileDetailContentRight_dynamicList
                } ${showActiveStyles &&
                  indexStyles.active_fileDetailContentRight_dynamicList}`}
                style={{
                  height:
                    !showActiveStyles &&
                    clientHeight - offsetTopDeviation - 54 - 70 - 50
                }}
              >
                {/*动态放置区*/}
                <div style={{ fontSize: '12px', color: '#595959' }}>
                  <div>{dynamicsContent}</div>
                </div>
                {/*评论放置区*/}
                <div style={{ overflow: 'hidden' }} key={isShowAllDynamic}>
                  {commentListsContent || (
                    <CommentLists
                      commentUseParams={commentUseParams}
                      isShowAllDynamic={isShowAllDynamic}
                    />
                  )}
                </div>
              </div>
            </div>
            <div
              className={`${
                indexStyles.fileDetailContentRight_bott
              } ${showActiveStyles &&
                indexStyles.active_fileDetailContentRight_bott}`}
            >
              {commentSubmitContent || (
                <CommentSubmit commentUseParams={commentUseParams} />
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
}

function mapStateToProps({
  technological: {
    datas: { siderRightCollapsed }
  },
  publicModalComment: { isShowAllDynamic }
}) {
  return { siderRightCollapsed, isShowAllDynamic }
}
