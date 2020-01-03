import React, { Component } from 'react'
import withBodyClientDimens from '../HOC/withBodyClientDimens'
import ZoomPicture from '../ZoomPicture'
import globalStyles from '@/globalset/css/globalClassName.less'
import mainContentStyles from './mainContent.less'
import CirclePreviewLoadingComponent from '@/components/CirclePreviewLoadingComponent'
import { connect } from 'dva'
import { fileConvertPdfAlsoUpdateVersion, setCurrentVersionFile } from '@/services/technological/file'
import { isApiResponseOk } from '../../utils/handleResponseData'
import { message, Modal } from 'antd'
import { getSubfixName } from '../../utils/businessFunction'
import {
  MESSAGE_DURATION_TIME,
} from "@/globalset/js/constant";
let timer

@connect()
class MainContent extends Component {

  constructor(props) {
    super(props)
    this.state = {
      // isZoomPictureFullScreenMode: false, //图评全屏模式

      // 进度条的百分比
      percent: 0,

      // 如果说外部没有传入对应的宽高表示用的是publicModal中的弹窗, 那么就监听自己的变化
      currentZoomPictureComponetWidth: 600,
      currentZoomPictureComponetHeight: 600,

      supportFileTypeArray: ['.xlsx', '.xls', '.doc', '.docx', '.ppt', '.pptx', '.png', '.txt', '.gif', '.jpg', '.jpeg', '.tif', '.bmp', '.ico'],
    }
  }

  componentDidMount() {
    const container_fileDetailContentOut = document.getElementById('container_fileDetailContentOut') || document.getElementById('container_FileListRightBarFileDetailModal') || document.getElementById('container_fileDetailOut') || document.querySelector('body');
    let zommPictureComponentHeight = container_fileDetailContentOut ? container_fileDetailContentOut.offsetHeight - 60 - 10 : 600; //60为文件内容组件头部高度 50为容器padding  
    let zommPictureComponentWidth = container_fileDetailContentOut ? container_fileDetailContentOut.offsetWidth - 50 - 5 : 600; //60为文件内容组件评s论等区域宽带   50为容器padding
    this.setState({
      currentZoomPictureComponetWidth: zommPictureComponentWidth,
      currentZoomPictureComponetHeight: zommPictureComponentHeight
    })
  }

  // 当圈子展开关闭的时候以及浏览器视图变化时, 实时获取当前的width
  componentWillReceiveProps(nextProps) {
    const { chatImVisiable: newChatImVisiable } = nextProps
    const { chatImVisiable } = this.props
    // 根据圈子做自适应
    if (newChatImVisiable != chatImVisiable) { // 是展开和关闭需要重新获取宽高
      const container_fileDetailContentOut = document.getElementById('container_fileDetailContentOut') || document.getElementById('container_FileListRightBarFileDetailModal') || document.getElementById('container_fileDetailOut') || document.querySelector('body');
      let zommPictureComponentHeight = container_fileDetailContentOut ? container_fileDetailContentOut.offsetHeight - 60 - 10 : 600; //60为文件内容组件头部高度 50为容器padding  
      let zommPictureComponentWidth = container_fileDetailContentOut ? container_fileDetailContentOut.offsetWidth - 50 - 5 : 600; //60为文件内容组件评s论等区域宽带   50为容器padding
      this.setState({
        currentZoomPictureComponetWidth: zommPictureComponentWidth,
        currentZoomPictureComponetHeight: zommPictureComponentHeight
      })
    } else { // 这里是浏览器视图变化的时候需要重新获取宽高
      const container_fileDetailContentOut = document.getElementById('container_fileDetailContentOut') || document.getElementById('container_FileListRightBarFileDetailModal') || document.getElementById('container_fileDetailOut') || document.querySelector('body');
      let zommPictureComponentHeight = container_fileDetailContentOut ? container_fileDetailContentOut.offsetHeight - 60 - 10 : 600; //60为文件内容组件头部高度 50为容器padding  
      let zommPictureComponentWidth = container_fileDetailContentOut ? container_fileDetailContentOut.offsetWidth - 50 - 5 : 600; //60为文件内容组件评s论等区域宽带   50为容器padding
      this.setState({
        currentZoomPictureComponetWidth: zommPictureComponentWidth,
        currentZoomPictureComponetHeight: zommPictureComponentHeight
      })
    }
  }

  componentWillUnmount() {
    if (timer) {
      clearTimeout(timer)
    }
  }

  getIframe = (src) => {
    const iframe = '<iframe style="height: 100%;width: 100%;border:0px;" class="multi-download"  src="' + src + '"></iframe>'
    return iframe
  }

  // 获取当前用户的ID
  getCurrentUserId = () => {
    try {
      const { id } = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : {}
      return id
    } catch (e) {
      return ''
    }
  }

  // 点击是否全屏
  handleZoomPictureFullScreen = (flag) => {
    this.setState({
      // isZoomPictureFullScreenMode: flag,
      percent: 0
    })
    this.props.updateStateDatas && this.props.updateStateDatas({ isZoomPictureFullScreenMode: flag })
    clearTimeout(timer)
  }

  // PDF圈评转换事件
  fetchConvertPdfAlsoUpdateVersion = ({ file_name, file_id }) => {
    const { currentPreviewFileData = {}, isZoomPictureFullScreenMode } = this.props
    const { supportFileTypeArray = [] } = this.state
    let FILE_NAME = getSubfixName(file_name)
    if (supportFileTypeArray.indexOf(FILE_NAME) != -1) {
      fileConvertPdfAlsoUpdateVersion({ id: file_id }).then(res => {
        if (isApiResponseOk(res)) {
          this.props.updateStateDatas && this.props.updateStateDatas({selectedKeys: [res.data.id]})
          let isPDF = getSubfixName(res.data.file_name) == '.pdf'
          if (isPDF) {
            setCurrentVersionFile({ id: res.data.id, set_major_version: '1' }).then(result => {
              if (isApiResponseOk(result)) {
                this.props.delayUpdatePdfDatas && this.props.delayUpdatePdfDatas({ id: res.data.id })
                this.props.updateStateDatas && this.props.updateStateDatas({ filePreviewCurrentFileId: res.data.id, currentPreviewFileData: { ...currentPreviewFileData, id: res.data.id }, currentPreviewFileName: res.data.file_name, fileType: getSubfixName(res.data.file_name) })
                this.setState({
                  is_petty_loading: !isZoomPictureFullScreenMode && false,
                  is_large_loading: isZoomPictureFullScreenMode && false,
                  percent: 0
                })
                // 用来保存在父元素中管理起来
                this.props.updateStateDatas && this.props.updateStateDatas({
                  is_petty_loading: !isZoomPictureFullScreenMode && false,
                  is_large_loading: isZoomPictureFullScreenMode && false,
                  selectedKeys: [res.data.id]
                })
                // setTimeout(() => this.props.updateStateDatas && this.props.updateStateDatas({selectedKeys: [res.data.id]}),200)
                // this.props.updateStateDatas && this.props.updateStateDatas({selectedKeys: [res.data.id]})
              }
            })
          } else {
            this.props.getCurrentFilePreviewData && this.props.getCurrentFilePreviewData({ id: res.data.id })
            this.props.updateStateDatas && this.props.updateStateDatas({selectedKeys: [res.data.id]})
          }

        } else {
          message.warn(res.message, MESSAGE_DURATION_TIME)
          if (res.code == 4047) { // 表示转换失败
            message.error(res.message, MESSAGE_DURATION_TIME)
          }
          this.setState({
            is_petty_loading: !isZoomPictureFullScreenMode && false,
            is_large_loading: isZoomPictureFullScreenMode && false,
            percent: 0
          })
          this.props.updateStateDatas && this.props.updateStateDatas({
            is_petty_loading: !isZoomPictureFullScreenMode && false,
            is_large_loading: isZoomPictureFullScreenMode && false,
            selectedKeys: []
          })
        }
      })

    }
  }

  // 加载进度条
  updateProcessPercent = () => {
    const { currentPreviewFileData = {} } = this.props
    const { id, board_id, file_name } = currentPreviewFileData
    let percent = this.state.percent + 10;
    // return
    if (percent > 100) {
      if (timer) clearTimeout(timer)
      this.setState({
        percent: 100
      })
      this.fetchConvertPdfAlsoUpdateVersion({ file_id: id, file_name: file_name })
      return
    }
    this.setState({
      percent
    })
    timer = setTimeout(() => {
      this.updateProcessPercent()
    }, 500)
  }

  // 除pdf外的其他文件进入圈评
  handleEnterCirclePointComment = () => {
    const { isZoomPictureFullScreenMode } = this.props
    this.updateProcessPercent()
    this.setState({
      is_petty_loading: !isZoomPictureFullScreenMode,
      is_large_loading: isZoomPictureFullScreenMode,
      percent: 0
    })
    this.props.updateStateDatas && this.props.updateStateDatas({
      is_petty_loading: !isZoomPictureFullScreenMode,
      is_large_loading: isZoomPictureFullScreenMode,
      selectedKeys: []
    })
  }

  // 渲染非全屏模式圈评图片
  renderPunctuateDom() {
    const { clientHeight, filePreviewUrl, filePreviewCurrentFileId, isZoomPictureFullScreenMode, componentWidth, componentHeight } = this.props
    const { currentZoomPictureComponetWidth, currentZoomPictureComponetHeight, is_petty_loading, percent, } = this.state

    return (
      <>
        {
          is_petty_loading ? (
            <CirclePreviewLoadingComponent
              height={currentZoomPictureComponetHeight}
              percent={percent}
              is_loading={is_petty_loading}
              style={{ left: '0', right: '0', top: '50%', bottom: '0', margin: '0 180px', position: 'absolute', transform: 'translateY(-25%)', display: 'block', opacity: 1 }} />
          ) : (
              <div style={{
                // minWidth: currentZoomPictureComponetWidth + 'px', minHeight: currentZoomPictureComponetHeight + 'px', 
                overflow: 'auto', textAlign: 'center', position: 'relative'
              }}>
                {filePreviewUrl && (
                  <ZoomPicture
                    imgInfo={{ url: filePreviewUrl }}
                    componentInfo={{ width: currentZoomPictureComponetWidth + 'px', height: currentZoomPictureComponetHeight + 'px' }}
                    userId={this.getCurrentUserId()}
                    isFullScreenMode={isZoomPictureFullScreenMode}
                    handleFullScreen={this.handleZoomPictureFullScreen}
                    filePreviewCurrentFileId={filePreviewCurrentFileId}
                    handleEnterCirclePointComment={this.handleEnterCirclePointComment}
                    isShow_textArea={true}
                  />
                )}
              </div>
            )
        }
      </>
    )
  }

  // 渲染非全屏模式其他文件格式图片
  renderIframeDom() {
    const { clientHeight, filePreviewUrl, fileType, componentHeight } = this.props
    const { is_petty_loading, percent, supportFileTypeArray = [], currentZoomPictureComponetHeight } = this.state

    return (
      <>
        {
          is_petty_loading ? (
            <CirclePreviewLoadingComponent
              height={currentZoomPictureComponetHeight}
              percent={percent}
              is_loading={is_petty_loading}
              style={{ left: '0', right: '0', top: '50%', bottom: '0', margin: '0 180px', position: 'absolute', transform: 'translateY(-25%)', display: 'block', opacity: 1 }} />
          ) : (
              <>
                <div style={{ height: currentZoomPictureComponetHeight }} className={mainContentStyles.fileDetailContentLeft}
                  dangerouslySetInnerHTML={{ __html: this.getIframe(filePreviewUrl) }}>
                </div>
                {
                  fileType != '.pdf' && (supportFileTypeArray.indexOf(fileType) != -1) && (
                    <div className={mainContentStyles.otherFilesOperator}>
                      <span onClick={this.handleEnterCirclePointComment} className={mainContentStyles.operator_bar}><span className={`${globalStyles.authTheme} ${mainContentStyles.circle_icon}`}>&#xe664;</span>圈点评论</span>
                    </div>
                  )
                }
              </>
            )
        }
      </>
    )
  }

  // 渲染不支持的文件格式
  renderNotSupport(type) {
    let content = (<div></div>)
    switch (type) {
      case '.obj':
        content = (
          <div style={{ textAlign: 'center' }}>
            <i className={globalStyles.authTheme} style={{ fontSize: '80px', color: '#5CA8F8' }}>&#xe62f;</i>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe62f;</i>
              <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe61e;</i>
              <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6cf;</i>
            </div>
            <i style={{ color: 'gray', fontSize: '12px' }}>把文件转换为pdf格式即可在聆悉上圈点协作</i>
          </div>
        )
        break;
      case '.3dm':
        content = (
          <div style={{ textAlign: 'center' }}>
            <i className={globalStyles.authTheme} style={{ fontSize: '80px', color: '#5CA8F8' }}>&#xe626;</i>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe626;</i>
              <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe61e;</i>
              <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6cf;</i>
            </div>
            <i style={{ color: 'gray', fontSize: '12px' }}>把文件转换为pdf格式即可在聆悉上圈点协作</i>
          </div>
        )
        break;
      case '.iges':
        content = (
          <div style={{ textAlign: 'center' }}>
            <i className={globalStyles.authTheme} style={{ fontSize: '80px', color: '#5CA8F8' }}>&#xe62b;</i>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe62b;</i>
              <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe61e;</i>
              <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6cf;</i>
            </div>
            <i style={{ color: 'gray', fontSize: '12px' }}>把文件转换为pdf格式即可在聆悉上圈点协作</i>
          </div>
        )
        break;
      case '.ma':
        content = (
          <div style={{ textAlign: 'center' }}>
            <i className={globalStyles.authTheme} style={{ fontSize: '80px', color: '#5CA8F8' }}>&#xe630;</i>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe630;</i>
              <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe61e;</i>
              <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6cf;</i>
            </div>
            <i style={{ color: 'gray', fontSize: '12px' }}>把文件转换为pdf格式即可在聆悉上圈点协作</i>
          </div>
        )
        break;
      case '.mb':
        content = (
          <div style={{ textAlign: 'center' }}>
            <i className={globalStyles.authTheme} style={{ fontSize: '80px', color: '#5CA8F8' }}>&#xe628;</i>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe628;</i>
              <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe61e;</i>
              <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6cf;</i>
            </div>
            <i style={{ color: 'gray', fontSize: '12px' }}>把文件转换为pdf格式即可在聆悉上圈点协作</i>
          </div>
        )
        break;
      case '.skp':
        content = (
          <div style={{ textAlign: 'center' }}>
            <i className={globalStyles.authTheme} style={{ fontSize: '80px', color: '#5CA8F8' }}>&#xe62e;</i>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe62e;</i>
              <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe61e;</i>
              <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6cf;</i>
            </div>
            <i style={{ color: 'gray', fontSize: '12px' }}>把文件转换为pdf格式即可在聆悉上圈点协作</i>
          </div>
        )
        break;
      case '.dwg':
        content = (
          <div style={{ textAlign: 'center' }}>
            <i className={globalStyles.authTheme} style={{ fontSize: '80px', color: '#5CA8F8' }}>&#xe62a;</i>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe62a;</i>
              <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe61e;</i>
              <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6cf;</i>
            </div>
            <i style={{ color: 'gray', fontSize: '12px' }}>把文件转换为pdf格式即可在聆悉上圈点协作</i>
          </div>
        )
        break;
      case '.psd':
        content = (
          <div style={{ textAlign: 'center' }}>
            <i className={globalStyles.authTheme} style={{ fontSize: '80px', color: '#5CA8F8' }}>&#xe627;</i>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe627;</i>
              <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe61e;</i>
              <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6cf;</i>
            </div>
            <i style={{ color: 'gray', fontSize: '12px' }}>把文件转换为pdf格式即可在聆悉上圈点协作</i>
          </div>
        )
        break;
      default:
        break;
    }
    return content
  }

  // 全屏的取消事件
  cancelZoomFrame = () => {
    this.props.updateStateDatas && this.props.updateStateDatas({ isZoomPictureFullScreenMode: !this.props.isZoomPictureFullScreenMode });
  }

  // 渲染全屏模式的图片
  renderFullScreenModePunctuateDom() {
    const { filePreviewUrl, filePreviewCurrentFileId, bodyClientHeight, bodyClientWidth, isZoomPictureFullScreenMode } = this.props
    const { is_large_loading, percent, } = this.state

    return (
      <Modal zIndex={1010} style={{ top: 0, left: 0, height: bodyClientHeight - 200 + 'px' }} footer={null} title={null} width={bodyClientWidth} visible={isZoomPictureFullScreenMode} onCancel={this.cancelZoomFrame}>
        {
          is_large_loading ? (
            <div style={{ height: bodyClientHeight, marginTop: '20px', background: 'rgba(0,0,0,0.15)' }}>
              <CirclePreviewLoadingComponent
                percent={percent}
                is_loading={is_large_loading}
                style={{ left: '0', right: '0', top: '50%', bottom: '0', margin: '0 180px', position: 'absolute', transform: 'translateY(-25%)', display: 'block', opacity: 1 }} />
            </div>

          ) : (
              <div>
                {filePreviewUrl && (
                  <ZoomPicture
                    imgInfo={{ url: filePreviewUrl }}
                    componentInfo={{ width: bodyClientWidth - 100, height: bodyClientHeight - 60 }}
                    userId={this.getCurrentUserId()}
                    isFullScreenMode={isZoomPictureFullScreenMode}
                    handleFullScreen={this.handleZoomPictureFullScreen}
                    filePreviewCurrentFileId={filePreviewCurrentFileId}
                    handleEnterCirclePointComment={this.handleEnterCirclePointComment}
                    isShow_textArea={true}
                  />
                )}
              </div>
            )
        }
      </Modal>
    )
  }

  // 渲染全屏时其他格式文件
  renderFullScreenModeIframeDom() {
    const { filePreviewUrl, bodyClientHeight, bodyClientWidth, isZoomPictureFullScreenMode, fileType } = this.props
    const { is_large_loading, percent, supportFileTypeArray = [] } = this.state
    return (
      <Modal wrapClassName={mainContentStyles.overlay_iframBigDom} zIndex={1010} style={{ top: 0, left: 0, minWidth: bodyClientWidth + 'px', minHeight: bodyClientHeight + 'px' }} width={bodyClientWidth} height={bodyClientHeight} footer={null} title={null} visible={isZoomPictureFullScreenMode} onCancel={this.cancelZoomFrame}>
        {/* <div
        style={{ height: bodyClientHeight, marginTop: '20px' }}
        dangerouslySetInnerHTML={{ __html: getIframe(filePreviewUrl) }}></div>
        <> */}
        {
          is_large_loading ? (
            <div style={{ height: bodyClientHeight, marginTop: '20px', background: 'rgba(0,0,0,0.15)' }}>
              <CirclePreviewLoadingComponent
                percent={percent}
                is_loading={is_large_loading}
                style={{ left: '0', right: '0', top: '50%', bottom: '0', margin: '0 180px', position: 'absolute', transform: 'translateY(-25%)', display: 'block', opacity: 1 }} />
            </div>

          ) : (
              <>
                <div
                  style={{ height: bodyClientHeight, marginTop: '20px' }}
                  dangerouslySetInnerHTML={{ __html: this.getIframe(filePreviewUrl) }}></div>
                {
                  fileType != '.pdf' && (supportFileTypeArray.indexOf(fileType) != -1) && (
                    <div className={mainContentStyles.otherFilesOperator} style={{ bottom: '100px' }}>
                      <span onClick={this.handleEnterCirclePointComment} className={mainContentStyles.operator_bar}><span className={`${globalStyles.authTheme} ${mainContentStyles.circle_icon}`}>&#xe664;</span>圈点评论</span>
                    </div>
                  )
                }
              </>
            )
        }
      </Modal >
    )
  }

  render() {
    const { clientHeight } = this.props
    const { filePreviewIsUsable, filePreviewIsRealImage, fileType, isZoomPictureFullScreenMode, componentHeight, componentWidth } = this.props
    return (

      <div className={mainContentStyles.fileDetailContentOut} ref={'fileDetailContentOut'} style={{ height: clientHeight ? clientHeight - 100 - 60 : componentHeight }}>
        <div>
          {filePreviewIsUsable ? (
            filePreviewIsRealImage ? (
              this.renderPunctuateDom()
            ) : (
                this.renderIframeDom()
              )
          ) : (
              <div className={mainContentStyles.fileDetailContentLeft} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 16, color: '#595959' }}>
                <div>
                  {this.renderNotSupport(fileType)}
                </div>
              </div>
            )}
        </div>
        {isZoomPictureFullScreenMode && (
          <div>
            {filePreviewIsUsable ? (
              filePreviewIsRealImage ? (
                this.renderFullScreenModePunctuateDom()
              ) : (
                  this.renderFullScreenModeIframeDom()
                )
            ) : (
                <div className={mainContentStyles.fileDetailContentLeft} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 16, color: '#595959' }}>
                  <div>
                    {this.renderNotSupport(fileType)}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>

    )
  }
}

export default withBodyClientDimens(MainContent)

