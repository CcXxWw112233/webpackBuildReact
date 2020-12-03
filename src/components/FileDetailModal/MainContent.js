import React, { Component } from 'react'
import withBodyClientDimens from '../HOC/withBodyClientDimens'
import ZoomPicture from '../ZoomPicture'
import globalStyles from '@/globalset/css/globalClassName.less'
import mainContentStyles from './mainContent.less'
import CirclePreviewLoadingComponent from '@/components/CirclePreviewLoadingComponent'
import { connect } from 'dva'
import {
  fileConvertPdfAlsoUpdateVersion,
  setCurrentVersionFile
} from '@/services/technological/file'
import { isApiResponseOk } from '../../utils/handleResponseData'
import { message, Modal, Tooltip } from 'antd'
import {
  checkIsHasPermissionInBoard,
  getSubfixName,
  checkIsHasPermissionInVisitControl
} from '@/utils/businessFunction'
import {
  MESSAGE_DURATION_TIME,
  NOT_HAS_PERMISION_COMFIRN,
  PROJECT_FILES_FILE_UPDATE
} from '@/globalset/js/constant'
import NotSupportImg from '@/assets/projectDetail/fileDetail/not_support.png'
import { platformNouns } from '../../globalset/clientCustorm'
import PdfComment from '../pdfComment'
import DEvent from '../../utils/event'
// let this.timer

@connect(mapStateToProps)
class MainContent extends Component {
  constructor(props) {
    super(props)
    this.timer = null
    this.state = {
      // isZoomPictureFullScreenMode: false, //图评全屏模式

      // 进度条的百分比
      percent: 0,

      // 如果说外部没有传入对应的宽高表示用的是publicModal中的弹窗, 那么就监听自己的变化
      currentZoomPictureComponetWidth: 600,
      currentZoomPictureComponetHeight: 600,

      supportFileTypeArray: [
        '.xlsx',
        '.xls',
        '.doc',
        '.docx',
        '.ppt',
        '.pptx',
        '.txt',
        '.tif',
        '.bmp',
        '.ico'
      ],
      isInPdfComment: false, // 是否进入了圈评
      pdfCommentData: {} // pdf圈评需要的数据
    }
    this.dontTransferType = ['.pdf', '.png', '.gif', '.jpeg', '.jpg']
  }

  componentDidMount() {
    const container_fileDetailContentOut =
      document.getElementById('container_fileDetailContentOut') ||
      document.getElementById('container_FileListRightBarFileDetailModal') ||
      document.getElementById('container_fileDetailOut') ||
      document.querySelector('body')
    let zommPictureComponentHeight = container_fileDetailContentOut
      ? container_fileDetailContentOut.offsetHeight - 60 - 10
      : 600 //60为文件内容组件头部高度 50为容器padding
    let zommPictureComponentWidth = container_fileDetailContentOut
      ? container_fileDetailContentOut.offsetWidth - 50 - 5
      : 600 //60为文件内容组件评s论等区域宽带   50为容器padding
    this.setState({
      currentZoomPictureComponetWidth: zommPictureComponentWidth,
      currentZoomPictureComponetHeight: zommPictureComponentHeight
    })
    this.fetchToPdf()
    DEvent.on('pdfCommentUpdate', id => {
      this.setState({
        isInPdfComment: false
      })
      setTimeout(() => {
        this.fetchToPdf(id)
      }, 500)
    })
  }
  fetchToPdf = id => {
    const {
      fileType,
      getCurrentFilePreviewData,
      filePreviewCurrentFileId
    } = this.props
    getCurrentFilePreviewData({ id: id || filePreviewCurrentFileId }).then(
      _ => {
        if (this.dontTransferType.includes(fileType)) {
          let type = 'img'
          if (fileType === '.pdf') {
            type = 'pdf'
          }
          this.handleToShowPdf(type).catch(err => console.log(err))
        }
      }
    )
  }

  // 当圈子展开关闭的时候以及浏览器视图变化时, 实时获取当前的width
  componentWillReceiveProps(nextProps) {
    const { chatImVisiable: newChatImVisiable } = nextProps
    const { chatImVisiable } = this.props
    // 根据圈子做自适应
    if (newChatImVisiable != chatImVisiable) {
      // 是展开和关闭需要重新获取宽高
      const container_fileDetailContentOut =
        document.getElementById('container_fileDetailContentOut') ||
        document.getElementById('container_FileListRightBarFileDetailModal') ||
        document.getElementById('container_fileDetailOut') ||
        document.querySelector('body')
      let zommPictureComponentHeight = container_fileDetailContentOut
        ? container_fileDetailContentOut.offsetHeight - 60 - 10
        : 600 //60为文件内容组件头部高度 50为容器padding
      let zommPictureComponentWidth = container_fileDetailContentOut
        ? container_fileDetailContentOut.offsetWidth - 50 - 5
        : 600 //60为文件内容组件评s论等区域宽带   50为容器padding
      this.setState({
        currentZoomPictureComponetWidth: zommPictureComponentWidth,
        currentZoomPictureComponetHeight: zommPictureComponentHeight
      })
    } else {
      // 这里是浏览器视图变化的时候需要重新获取宽高
      const container_fileDetailContentOut =
        document.getElementById('container_fileDetailContentOut') ||
        document.getElementById('container_FileListRightBarFileDetailModal') ||
        document.getElementById('container_fileDetailOut') ||
        document.querySelector('body')
      let zommPictureComponentHeight = container_fileDetailContentOut
        ? container_fileDetailContentOut.offsetHeight - 60 - 10
        : 600 //60为文件内容组件头部高度 50为容器padding
      let zommPictureComponentWidth = container_fileDetailContentOut
        ? container_fileDetailContentOut.offsetWidth - 50 - 5
        : 600 //60为文件内容组件评s论等区域宽带   50为容器padding
      this.setState({
        currentZoomPictureComponetWidth: zommPictureComponentWidth,
        currentZoomPictureComponetHeight: zommPictureComponentHeight
      })
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }

  handleDynamicComment = e => {
    e && e.stopPropagation()
    const {
      currentPreviewFileData: { file_name, version_id, board_id, id }
    } = this.props
    this.props.linkImWithFile &&
      this.props.linkImWithFile({
        name: file_name,
        currentPreviewFileVersionId: version_id,
        board_id,
        type: 'file',
        id
      })
  }

  getIframe = src => {
    const iframe =
      '<iframe name="123" style="height: 100%;width: 100%;border:0px;" class="multi-download"  src="' +
      src +
      '" allow="payment" allowpaymentrequest></iframe>'
    return iframe
  }

  // 获取当前用户的ID
  getCurrentUserId = () => {
    try {
      const { id } = localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo'))
        : {}
      return id
    } catch (e) {
      return ''
    }
  }

  // 点击是否全屏
  handleZoomPictureFullScreen = flag => {
    this.setState({
      // isZoomPictureFullScreenMode: flag,
      percent: 0
    })
    this.props.updateStateDatas &&
      this.props.updateStateDatas({ isZoomPictureFullScreenMode: flag })
    clearTimeout(this.timer)
  }

  // 转换pdf功能
  // transfromFile2PDF = ({file_name, file_id, folder_id})=> {
  //   const { supportFileTypeArray = [] } = this.state
  //   let FILE_NAME = getSubfixName(file_name)
  //   if (supportFileTypeArray.indexOf(FILE_NAME) != -1) {
  //     fileConvertPdfAlsoUpdateVersion({ id: file_id }).then(res => {
  //       if(isApiResponseOk(res)){
  //         console.log(res);
  //       }
  //     })
  //   }
  // }

  // PDF圈评转换事件
  fetchConvertPdfAlsoUpdateVersion = ({ file_name, file_id, folder_id }) => {
    return new Promise((resolve, reject) => {
      const {
        currentPreviewFileData = {},
        isZoomPictureFullScreenMode,
        isPdfLoaded
      } = this.props
      const { supportFileTypeArray = [] } = this.state
      let FILE_NAME = getSubfixName(file_name)
      if (supportFileTypeArray.indexOf(FILE_NAME) != -1) {
        fileConvertPdfAlsoUpdateVersion({ id: file_id })
          .then(async res => {
            if (isApiResponseOk(res)) {
              this.props.updateStateDatas &&
                this.props.updateStateDatas({ selectedKeys: [res.data.id] })
              // let isPDF = getSubfixName(res.data.file_name) == '.pdf'
              // if (isPDF) {
              if (this.props.getCurrentFilePreviewData) {
                let fileResp = await this.props
                  .getCurrentFilePreviewData({
                    id: res.data.id
                  })
                  .catch(er => er)
              }
              setCurrentVersionFile({
                id: res.data.id,
                set_major_version: '1'
              })
                .then(result => {
                  if (isApiResponseOk(result)) {
                    // this.props.delayUpdatePdfDatas &&
                    //   this.props.delayUpdatePdfDatas({
                    //     id: res.data.id,
                    //     calback: () => {
                    //       this.setState({
                    //         percent: 0,
                    //         is_petty_loading: !isZoomPictureFullScreenMode && false,
                    //         is_large_loading: isZoomPictureFullScreenMode && false
                    //       })
                    //     }
                    //   })
                    this.props.updateStateDatas &&
                      this.props.updateStateDatas({
                        filePreviewCurrentFileId: res.data.id,
                        currentPreviewFileData: {
                          ...currentPreviewFileData,
                          id: res.data.id
                        },
                        filePreviewCurrentName: res.data.file_name,
                        fileType: getSubfixName(res.data.file_name)
                      })
                    this.setState({
                      is_petty_loading: !isZoomPictureFullScreenMode
                        ? isPdfLoaded
                          ? true
                          : false
                        : false,
                      is_large_loading: isZoomPictureFullScreenMode
                        ? isPdfLoaded
                          ? true
                          : false
                        : false
                      // percent: 0
                    })
                    // 用来保存在父元素中管理起来
                    // this.props.updateStateDatas &&
                    //   this.props.updateStateDatas({
                    //     // is_petty_loading: !isZoomPictureFullScreenMode && !isPdfLoaded ? false : true,
                    //     // is_large_loading: isZoomPictureFullScreenMode && isPdfLoaded ? true :false,
                    //     selectedKeys: [res.data.id]
                    //   })
                    // this.props.whetherUpdateFolderListData &&
                    //   this.props.whetherUpdateFolderListData({ folder_id })
                    // setTimeout(() => this.props.updateStateDatas && this.props.updateStateDatas({selectedKeys: [res.data.id]}),200)
                    // this.props.updateStateDatas && this.props.updateStateDatas({selectedKeys: [res.data.id]})
                    resolve(res.data)
                  } else reject(res)
                })
                .catch(er => reject())
              // }
              // this.props.updateStateDatas &&
              //   this.props.updateStateDatas({ selectedKeys: [res.data.id] })
            } else {
              message.warn(res.message, MESSAGE_DURATION_TIME)
              reject(res)
              if (res.code == 4047) {
                // 表示转换失败
                message.error(res.message, MESSAGE_DURATION_TIME)
                this.setState({
                  is_petty_loading: !isZoomPictureFullScreenMode && false,
                  is_large_loading: isZoomPictureFullScreenMode && false,
                  percent: 0
                })
                this.props.updateStateDatas &&
                  this.props.updateStateDatas({
                    is_petty_loading: !isZoomPictureFullScreenMode && false,
                    is_large_loading: isZoomPictureFullScreenMode && false,
                    selectedKeys: []
                  })
              }
              this.setState({
                is_petty_loading: !isZoomPictureFullScreenMode && false,
                is_large_loading: isZoomPictureFullScreenMode && false,
                percent: 0
              })
              this.props.updateStateDatas &&
                this.props.updateStateDatas({
                  is_petty_loading: !isZoomPictureFullScreenMode && false,
                  is_large_loading: isZoomPictureFullScreenMode && false,
                  selectedKeys: []
                })
            }
          })
          .catch(() => reject())
      } else if (this.dontTransferType.indexOf(FILE_NAME) !== -1) {
        resolve({})
      } else {
        reject()
      }
    })
  }

  // 加载进度条
  updateProcessPercent = () => {
    const { currentPreviewFileData = {}, isPdfLoaded } = this.props
    const { id, board_id, file_name, folder_id } = currentPreviewFileData
    let percent = this.state.percent + 10
    // return

    if (percent >= 100) {
      if (isPdfLoaded) {
        // if (this.timer) clearTimeout(this.timer)
        this.setState({
          percent: 100
        })
      } else {
        if (this.timer) clearTimeout(this.timer)
        this.setState({
          percent: 100
        })
        this.props.updateStateDatas &&
          this.props.updateStateDatas({
            isPdfLoaded: false
          })
      }
      return
    }
    this.setState({
      percent
    })
    this.timer = setTimeout(() => {
      this.updateProcessPercent()
    }, 200)
  }

  // 进入pdf圈评
  handleToShowPdf = async (type = 'pdf') => {
    // 转换成功之后的回调
    let canEnter = await this.handleEnterCirclePointComment().catch(err => err)
    const {
      currentPreviewFileData = {},
      filePreviewUrl,
      fileFileUrl
    } = this.props
    const {
      board_id,
      privileges = [],
      is_privilege,
      id,
      file_name,
      folder_id
    } = currentPreviewFileData

    let FILE_NAME = getSubfixName(file_name)
    let arr = ['.pdf', '.pptx', '.xls', '.xlsx', '.doc', '.docx', '.ppt']
    if (FILE_NAME === '.txt') {
      canEnter = false
      message.warn('暂不支持的圈评格式')
    }
    if (!!canEnter) {
      let obj = {
        url: arr.indexOf(FILE_NAME) !== -1 ? fileFileUrl : filePreviewUrl,
        file_id: id,
        file_name,
        fileType: type,
        board_id,
        folder_id
      }
      this.setState({
        pdfCommentData: obj,
        isInPdfComment: true
      })
    }
  }

  // 退出pdf圈评
  exitPdfComment = () => {
    this.setState({
      pdfCommentData: {},
      isInPdfComment: false
    })
  }

  // 除pdf外的其他文件进入圈评
  handleEnterCirclePointComment = async () => {
    const { isZoomPictureFullScreenMode } = this.props
    const { currentPreviewFileData = {} } = this.props
    const {
      board_id,
      privileges = [],
      is_privilege,
      id,
      file_name,
      folder_id
    } = currentPreviewFileData
    if (
      !checkIsHasPermissionInVisitControl(
        'edit',
        privileges,
        is_privilege,
        [],
        checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPDATE, board_id)
      )
    ) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      // this.props.updateStateDatas({
      //   isPdfLoaded: false
      // })
      return false
    }
    // await this.props.updateStateDatas({
    //   isPdfLoaded: true
    // })
    // await this.updateProcessPercent()
    // 文件转换
    let res = await this.fetchConvertPdfAlsoUpdateVersion({
      file_id: id,
      file_name: file_name,
      folder_id: folder_id
    }).catch(err => console.log(err))
    if (res) {
      return true
    }
    return false
    // this.setState({
    //   is_petty_loading: !isZoomPictureFullScreenMode,
    //   is_large_loading: isZoomPictureFullScreenMode,
    //   percent: 0
    // })
    // this.props.updateStateDatas && this.props.updateStateDatas({
    //   is_petty_loading: !isZoomPictureFullScreenMode,
    //   is_large_loading: isZoomPictureFullScreenMode,
    //   selectedKeys: []
    // })
  }

  // 渲染非全屏模式圈评图片
  renderPunctuateDom() {
    const {
      clientHeight,
      filePreviewUrl,
      filePreviewCurrentFileId,
      isZoomPictureFullScreenMode,
      componentWidth,
      componentHeight,
      isPdfLoaded
    } = this.props
    const {
      currentZoomPictureComponetWidth,
      currentZoomPictureComponetHeight,
      is_petty_loading,
      percent
    } = this.state
    return (
      <>
        {is_petty_loading && isPdfLoaded ? (
          <CirclePreviewLoadingComponent
            height={currentZoomPictureComponetHeight}
            percent={percent}
            is_loading={is_petty_loading}
            style={{
              left: '0',
              right: '0',
              top: '50%',
              bottom: '0',
              margin: '0 180px',
              position: 'absolute',
              transform: 'translateY(-25%)',
              display: 'block',
              opacity: 1
            }}
          />
        ) : (
          <div
            style={{
              // minWidth: currentZoomPictureComponetWidth + 'px', minHeight: currentZoomPictureComponetHeight + 'px',
              overflow: 'auto',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            <div
              style={{ height: currentZoomPictureComponetHeight }}
              className={mainContentStyles.fileDetailContentLeft}
            >
              {filePreviewUrl && this.state.isInPdfComment && (
                <PdfComment
                  {...this.state.pdfCommentData}
                  onClose={this.exitPdfComment}
                />
              )}
            </div>

            {/* <ZoomPicture
                imgInfo={{ url: filePreviewUrl }}
                componentInfo={{
                  width: currentZoomPictureComponetWidth + 'px',
                  height: currentZoomPictureComponetHeight + 'px'
                }}
                userId={this.getCurrentUserId()}
                isFullScreenMode={isZoomPictureFullScreenMode}
                handleFullScreen={this.handleZoomPictureFullScreen}
                filePreviewCurrentFileId={filePreviewCurrentFileId}
                handleEnterCirclePointComment={this.handleToShowPdf.bind(
                  this,
                  'img'
                )}
                isShow_textArea={true}
                isOpenAttachmentFile={this.props.isOpenAttachmentFile}
              /> */}
            {!this.props.isOpenAttachmentFile && (
              <div
                onClick={this.handleDynamicComment}
                id="dynamic_comment"
                className={mainContentStyles.dynamic_comment}
              >
                <Tooltip
                  overlayStyle={{ minWidth: '72px' }}
                  placement="top"
                  title="动态消息"
                  getPopupContainer={() =>
                    document.getElementById('dynamic_comment')
                  }
                >
                  <span className={globalStyles.authTheme}>&#xe8e8;</span>
                </Tooltip>
              </div>
            )}
          </div>
        )}
      </>
    )
  }

  // 渲染非全屏模式其他文件格式图片
  renderIframeDom() {
    const {
      clientHeight,
      filePreviewUrl,
      fileType,
      componentHeight,
      isPdfLoaded
    } = this.props
    const {
      is_petty_loading,
      percent,
      supportFileTypeArray = [],
      currentZoomPictureComponetHeight
    } = this.state

    return (
      <>
        {is_petty_loading && isPdfLoaded ? (
          <CirclePreviewLoadingComponent
            height={currentZoomPictureComponetHeight}
            percent={percent}
            is_loading={is_petty_loading}
            style={{
              left: '0',
              right: '0',
              top: '50%',
              bottom: '0',
              margin: '0 180px',
              position: 'absolute',
              transform: 'translateY(-25%)',
              display: 'block',
              opacity: 1
            }}
          />
        ) : (
          <>
            {this.dontTransferType.indexOf(fileType) !== -1 ? (
              <div
                style={{ height: currentZoomPictureComponetHeight }}
                className={mainContentStyles.fileDetailContentLeft}
              >
                {this.state.isInPdfComment && (
                  <PdfComment
                    {...this.state.pdfCommentData}
                    onClose={this.exitPdfComment}
                  />
                )}
              </div>
            ) : (
              <div
                style={{ height: currentZoomPictureComponetHeight }}
                className={mainContentStyles.fileDetailContentLeft}
                dangerouslySetInnerHTML={{
                  __html: this.getIframe(filePreviewUrl)
                }}
              />
            )}

            {/* {
              !this.props.isOpenAttachmentFile && fileType != '.pdf' && (supportFileTypeArray.indexOf(fileType) != -1) && (
                <div className={mainContentStyles.otherFilesOperator}>
                  <span onClick={this.handleEnterCirclePointComment} className={mainContentStyles.operator_bar}><span className={`${globalStyles.authTheme} ${mainContentStyles.circle_icon}`}>&#xe664;</span>圈点评论</span>
                </div>
              )
            } */}
            {!this.props.isOpenAttachmentFile && (
              <div className={mainContentStyles.otherFilesOperator}>
                <span
                  onClick={() => this.handleToShowPdf('pdf')}
                  className={mainContentStyles.operator_bar}
                >
                  <span
                    className={`${globalStyles.authTheme} ${mainContentStyles.circle_icon}`}
                  >
                    &#xe664;
                  </span>
                  圈点评论
                </span>
              </div>
            )}
            {!this.props.isOpenAttachmentFile && (
              <div
                onClick={this.handleDynamicComment}
                id="dynamic_comment"
                className={mainContentStyles.dynamic_comment}
              >
                <Tooltip
                  overlayStyle={{ minWidth: '72px' }}
                  placement="top"
                  title="动态消息"
                  getPopupContainer={() =>
                    document.getElementById('dynamic_comment')
                  }
                >
                  <span className={globalStyles.authTheme}>&#xe8e8;</span>
                </Tooltip>
              </div>
            )}
          </>
        )}
      </>
    )
  }

  // 渲染不支持的文件格式
  renderNotSupport(type) {
    let content = <div />
    switch (type) {
      case '.obj':
        content = (
          <div style={{ textAlign: 'center' }}>
            <i
              className={globalStyles.authTheme}
              style={{ fontSize: '80px', color: '#5CA8F8' }}
            >
              &#xe65b;
            </i>
            <div style={{ fontSize: '14px', color: 'rgba(89,89,89,1)' }}>
              暂不支持该格式预览
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                margin: '20px auto'
              }}
            >
              <img src={NotSupportImg} style={{ margin: 'auto' }} />
              {/* <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe651;</i> */}
            </div>
            <i
              style={{
                color: '#D4D4D4',
                fontSize: '12px',
                fontStyle: 'normal'
              }}
            >
              把文件转换为pdf格式即可在{platformNouns}上圈点协作
            </i>
          </div>
        )
        break
      case '.3dm':
        content = (
          <div style={{ textAlign: 'center' }}>
            <i
              className={globalStyles.authTheme}
              style={{ fontSize: '80px', color: '#5CA8F8' }}
            >
              &#xe6e0;
            </i>
            <div style={{ fontSize: '14px', color: 'rgba(89,89,89,1)' }}>
              暂不支持该格式预览
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                margin: '20px auto'
              }}
            >
              <img src={NotSupportImg} style={{ margin: 'auto' }} />
              {/* <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe651;</i> */}
            </div>
            <i
              style={{
                color: '#D4D4D4',
                fontSize: '12px',
                fontStyle: 'normal'
              }}
            >
              把文件转换为pdf格式即可在{platformNouns}上圈点协作
            </i>
          </div>
        )
        break
      case '.iges':
        content = (
          <div style={{ textAlign: 'center' }}>
            <i
              className={globalStyles.authTheme}
              style={{ fontSize: '80px', color: '#5CA8F8' }}
            >
              &#xe658;
            </i>
            <div style={{ fontSize: '14px', color: 'rgba(89,89,89,1)' }}>
              暂不支持该格式预览
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                margin: '20px auto'
              }}
            >
              <img src={NotSupportImg} style={{ margin: 'auto' }} />
              {/* <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe651;</i> */}
            </div>
            <i
              style={{
                color: '#D4D4D4',
                fontSize: '12px',
                fontStyle: 'normal'
              }}
            >
              把文件转换为pdf格式即可在{platformNouns}上圈点协作
            </i>
          </div>
        )
        break
      case '.ma':
        content = (
          <div style={{ textAlign: 'center' }}>
            <i
              className={globalStyles.authTheme}
              style={{ fontSize: '80px', color: '#5CA8F8' }}
            >
              &#xe65f;
            </i>
            <div style={{ fontSize: '14px', color: 'rgba(89,89,89,1)' }}>
              暂不支持该格式预览
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                margin: '20px auto'
              }}
            >
              <img src={NotSupportImg} style={{ margin: 'auto' }} />
              {/* <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe651;</i> */}
            </div>
            <i
              style={{
                color: '#D4D4D4',
                fontSize: '12px',
                fontStyle: 'normal'
              }}
            >
              把文件转换为pdf格式即可在{platformNouns}上圈点协作
            </i>
          </div>
        )
        break
      case '.mb':
        content = (
          <div style={{ textAlign: 'center' }}>
            <i
              className={globalStyles.authTheme}
              style={{ fontSize: '80px', color: '#5CA8F8' }}
            >
              &#xe64f;
            </i>
            <div style={{ fontSize: '14px', color: 'rgba(89,89,89,1)' }}>
              暂不支持该格式预览
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                margin: '20px auto'
              }}
            >
              <img src={NotSupportImg} style={{ margin: 'auto' }} />
              {/* <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe651;</i> */}
            </div>
            <i
              style={{
                color: '#D4D4D4',
                fontSize: '12px',
                fontStyle: 'normal'
              }}
            >
              把文件转换为pdf格式即可在{platformNouns}上圈点协作
            </i>
          </div>
        )
        break
      case '.skp':
        content = (
          <div style={{ textAlign: 'center' }}>
            <i
              className={globalStyles.authTheme}
              style={{ fontSize: '80px', color: '#5CA8F8' }}
            >
              &#xe6e8;
            </i>
            <div style={{ fontSize: '14px', color: 'rgba(89,89,89,1)' }}>
              暂不支持该格式预览
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                margin: '20px auto'
              }}
            >
              <img src={NotSupportImg} style={{ margin: 'auto' }} />
              {/* <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe651;</i> */}
            </div>
            <i
              style={{
                color: '#D4D4D4',
                fontSize: '12px',
                fontStyle: 'normal'
              }}
            >
              把文件转换为pdf格式即可在{platformNouns}上圈点协作
            </i>
          </div>
        )
        break
      case '.dwg':
        content = (
          <div style={{ textAlign: 'center' }}>
            <i
              className={globalStyles.authTheme}
              style={{ fontSize: '80px', color: '#5CA8F8' }}
            >
              &#xe64c;
            </i>
            <div style={{ fontSize: '14px', color: 'rgba(89,89,89,1)' }}>
              暂不支持该格式预览
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                margin: '20px auto'
              }}
            >
              <img src={NotSupportImg} style={{ margin: 'auto' }} />
              {/* <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe651;</i> */}
            </div>
            <i
              style={{
                color: '#D4D4D4',
                fontSize: '12px',
                fontStyle: 'normal'
              }}
            >
              把文件转换为pdf格式即可在{platformNouns}上圈点协作
            </i>
          </div>
        )
        break
      case '.psd':
        content = (
          <div style={{ textAlign: 'center' }}>
            <i
              className={globalStyles.authTheme}
              style={{ fontSize: '80px', color: '#5CA8F8' }}
            >
              &#xe65d;
            </i>
            <div style={{ fontSize: '14px', color: 'rgba(89,89,89,1)' }}>
              暂不支持该格式预览
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                margin: '20px auto'
              }}
            >
              <img src={NotSupportImg} style={{ margin: 'auto' }} />
              {/* <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe651;</i> */}
            </div>
            <i
              style={{
                color: '#D4D4D4',
                fontSize: '12px',
                fontStyle: 'normal'
              }}
            >
              把文件转换为pdf格式即可在{platformNouns}上圈点协作
            </i>
          </div>
        )
        break
      case '.rar':
        content = (
          <div style={{ textAlign: 'center' }}>
            <i
              className={globalStyles.authTheme}
              style={{ fontSize: '80px', color: '#5CA8F8' }}
            >
              &#xe6e4;
            </i>
            <div style={{ fontSize: '14px', color: 'rgba(89,89,89,1)' }}>
              暂不支持该格式预览
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                margin: '20px auto'
              }}
            >
              <img src={NotSupportImg} style={{ margin: 'auto' }} />
              {/* <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe651;</i> */}
            </div>
            <i
              style={{
                color: '#D4D4D4',
                fontSize: '12px',
                fontStyle: 'normal'
              }}
            >
              把文件转换为pdf格式即可在{platformNouns}上圈点协作
            </i>
          </div>
        )
        break
      case '.zip':
        content = (
          <div style={{ textAlign: 'center' }}>
            <i
              className={globalStyles.authTheme}
              style={{ fontSize: '80px', color: '#5CA8F8' }}
            >
              &#xe6e5;
            </i>
            <div style={{ fontSize: '14px', color: 'rgba(89,89,89,1)' }}>
              暂不支持该格式预览
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                margin: '20px auto'
              }}
            >
              <img src={NotSupportImg} style={{ margin: 'auto' }} />
              {/* <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe651;</i> */}
            </div>
            <i
              style={{
                color: '#D4D4D4',
                fontSize: '12px',
                fontStyle: 'normal'
              }}
            >
              把文件转换为pdf格式即可在{platformNouns}上圈点协作
            </i>
          </div>
        )
        break
      case '.7z':
        content = (
          <div style={{ textAlign: 'center' }}>
            <i
              className={globalStyles.authTheme}
              style={{ fontSize: '80px', color: '#5CA8F8' }}
            >
              &#xe6e6;
            </i>
            <div style={{ fontSize: '14px', color: 'rgba(89,89,89,1)' }}>
              暂不支持该格式预览
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                margin: '20px auto'
              }}
            >
              <img src={NotSupportImg} style={{ margin: 'auto' }} />
              {/* <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe651;</i> */}
            </div>
            <i
              style={{
                color: '#D4D4D4',
                fontSize: '12px',
                fontStyle: 'normal'
              }}
            >
              把文件转换为pdf格式即可在{platformNouns}上圈点协作
            </i>
          </div>
        )
        break
      case '.gz':
        content = (
          <div style={{ textAlign: 'center' }}>
            <i
              className={globalStyles.authTheme}
              style={{ fontSize: '80px', color: '#5CA8F8' }}
            >
              &#xe6e7;
            </i>
            <div style={{ fontSize: '14px', color: 'rgba(89,89,89,1)' }}>
              暂不支持该格式预览
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                margin: '20px auto'
              }}
            >
              <img src={NotSupportImg} style={{ margin: 'auto' }} />
              {/* <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe651;</i> */}
            </div>
            <i
              style={{
                color: '#D4D4D4',
                fontSize: '12px',
                fontStyle: 'normal'
              }}
            >
              把文件转换为pdf格式即可在{platformNouns}上圈点协作
            </i>
          </div>
        )
        break
      case '.key':
        content = (
          <div style={{ textAlign: 'center' }}>
            <i
              className={globalStyles.authTheme}
              style={{ fontSize: '80px', color: '#5CA8F8' }}
            >
              &#xe64e;
            </i>
            <div style={{ fontSize: '14px', color: 'rgba(89,89,89,1)' }}>
              暂不支持该格式预览
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                margin: '20px auto'
              }}
            >
              <img src={NotSupportImg} style={{ margin: 'auto' }} />
              {/* <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe6e4;</i>
                <i className={globalStyles.authTheme} style={{ fontSize: '58px' }}>&#xe651;</i> */}
            </div>
            <i
              style={{
                color: '#D4D4D4',
                fontSize: '12px',
                fontStyle: 'normal'
              }}
            >
              把文件转换为pdf格式即可在{platformNouns}上圈点协作
            </i>
          </div>
        )
        break
      default:
        break
    }
    return content
  }

  // 全屏的取消事件
  cancelZoomFrame = () => {
    const { is_petty_loading, is_large_loading } = this.props
    if (is_petty_loading || is_large_loading) {
      message.warn('正在进入圈评,请勿退出', MESSAGE_DURATION_TIME)
      return false
    }
    this.props.updateStateDatas &&
      this.props.updateStateDatas({
        isZoomPictureFullScreenMode: !this.props.isZoomPictureFullScreenMode
      })
  }

  // 渲染全屏模式的图片
  renderFullScreenModePunctuateDom() {
    const {
      filePreviewUrl,
      filePreviewCurrentFileId,
      bodyClientHeight,
      bodyClientWidth,
      isZoomPictureFullScreenMode,
      isPdfLoaded
    } = this.props
    const { is_large_loading, percent } = this.state

    return (
      <Modal
        zIndex={1010}
        style={{ top: 0, left: 0, height: bodyClientHeight - 200 + 'px' }}
        footer={null}
        title={null}
        width={bodyClientWidth}
        visible={isZoomPictureFullScreenMode}
        onCancel={this.cancelZoomFrame}
      >
        {is_large_loading && isPdfLoaded ? (
          <div
            style={{
              height: bodyClientHeight,
              marginTop: '20px',
              background: 'rgba(0,0,0,0.15)'
            }}
          >
            <CirclePreviewLoadingComponent
              percent={percent}
              is_loading={is_large_loading}
              style={{
                left: '0',
                right: '0',
                top: '50%',
                bottom: '0',
                margin: '0 180px',
                position: 'absolute',
                transform: 'translateY(-25%)',
                display: 'block',
                opacity: 1
              }}
            />
          </div>
        ) : (
          <div>
            {filePreviewUrl && (
              <ZoomPicture
                imgInfo={{ url: filePreviewUrl }}
                componentInfo={{
                  width: bodyClientWidth - 100,
                  height: bodyClientHeight - 60
                }}
                userId={this.getCurrentUserId()}
                isFullScreenMode={isZoomPictureFullScreenMode}
                handleFullScreen={this.handleZoomPictureFullScreen}
                filePreviewCurrentFileId={filePreviewCurrentFileId}
                handleEnterCirclePointComment={this.handleToShowPdf.bind(
                  this,
                  'img'
                )}
                isShow_textArea={true}
                isOpenAttachmentFile={this.props.isOpenAttachmentFile}
              />
            )}
          </div>
        )}
      </Modal>
    )
  }

  // 渲染全屏时其他格式文件
  renderFullScreenModeIframeDom() {
    const {
      filePreviewUrl,
      bodyClientHeight,
      bodyClientWidth,
      isZoomPictureFullScreenMode,
      fileType,
      isPdfLoaded
    } = this.props
    const { is_large_loading, percent, supportFileTypeArray = [] } = this.state
    return (
      <Modal
        wrapClassName={mainContentStyles.overlay_iframBigDom}
        zIndex={1010}
        style={{
          top: 0,
          left: 0,
          minWidth: bodyClientWidth + 'px',
          minHeight: bodyClientHeight + 'px'
        }}
        width={bodyClientWidth}
        height={bodyClientHeight}
        footer={null}
        title={null}
        visible={isZoomPictureFullScreenMode}
        onCancel={this.cancelZoomFrame}
      >
        {/* <div
        style={{ height: bodyClientHeight, marginTop: '20px' }}
        dangerouslySetInnerHTML={{ __html: getIframe(filePreviewUrl) }}></div>
        <> */}
        {is_large_loading && isPdfLoaded ? (
          <div
            style={{
              height: bodyClientHeight,
              marginTop: '20px',
              background: 'rgba(0,0,0,0.15)'
            }}
          >
            <CirclePreviewLoadingComponent
              percent={percent}
              is_loading={is_large_loading}
              style={{
                left: '0',
                right: '0',
                top: '50%',
                bottom: '0',
                margin: '0 180px',
                position: 'absolute',
                transform: 'translateY(-25%)',
                display: 'block',
                opacity: 1
              }}
            />
          </div>
        ) : (
          <>
            <div
              style={{ height: bodyClientHeight, marginTop: '20px' }}
              dangerouslySetInnerHTML={{
                __html: this.getIframe(filePreviewUrl)
              }}
            />
            {/* {
                  !this.props.isOpenAttachmentFile && fileType != '.pdf' && (supportFileTypeArray.indexOf(fileType) != -1) && (
                    <div className={mainContentStyles.otherFilesOperator} style={{ bottom: '100px' }}>
                      <span onClick={this.handleEnterCirclePointComment} className={mainContentStyles.operator_bar}><span className={`${globalStyles.authTheme} ${mainContentStyles.circle_icon}`}>&#xe664;</span>圈点评论</span>
                    </div>
                  )
                } */}
          </>
        )}
      </Modal>
    )
  }

  render() {
    const { clientHeight } = this.props
    const {
      filePreviewIsUsable,
      filePreviewIsRealImage,
      fileType,
      isZoomPictureFullScreenMode,
      componentHeight,
      componentWidth
    } = this.props
    return (
      <div
        className={mainContentStyles.fileDetailContentOut}
        ref={'fileDetailContentOut'}
        style={{
          height: clientHeight ? clientHeight - 100 - 60 : componentHeight
        }}
      >
        <div>
          {filePreviewIsUsable ? (
            filePreviewIsRealImage ? (
              this.renderPunctuateDom()
            ) : (
              this.renderIframeDom()
            )
          ) : (
            <div
              className={mainContentStyles.fileDetailContentLeft}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: 16,
                color: '#595959'
              }}
            >
              <div>{this.renderNotSupport(fileType)}</div>
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
              <div
                className={mainContentStyles.fileDetailContentLeft}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: 16,
                  color: '#595959'
                }}
              >
                <div>{this.renderNotSupport(fileType)}</div>
              </div>
            )}
          </div>
        )}
        {/* {this.state.isInPdfComment && (
          <PdfComment
            {...this.state.pdfCommentData}
            onClose={this.exitPdfComment}
          />
        )} */}
      </div>
    )
  }
}

export default withBodyClientDimens(MainContent)

function mapStateToProps({
  technological: {
    datas: { userBoardPermissions }
  },
  simplemode: { chatImVisiable = false },
  publicFileDetailModal: { isOpenAttachmentFile }
}) {
  return {
    userBoardPermissions,
    chatImVisiable,
    isOpenAttachmentFile
  }
}
