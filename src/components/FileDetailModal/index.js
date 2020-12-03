import React, { Component } from 'react'
import PublicDetailModal from '@/components/PublicDetailModal'
import MainContent from './MainContent'
import HeaderContent from './HeaderContent'
import FileDetailContent from './FileDetailContent'
import { connect } from 'dva'

@connect(mapStateToProps)
export default class FileDetailModal extends Component {
  state = {
    clientHeight: document.documentElement.clientHeight,
    clientWidth: document.documentElement.clientWidth
  }
  constructor(props) {
    super(props)
    this.resizeTTY = this.resizeTTY.bind(this)
  }
  componentDidMount() {
    window.addEventListener('resize', this.resizeTTY)
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeTTY)
  }
  resizeTTY = () => {
    const clientHeight = document.documentElement.clientHeight //获取页面可见高度
    const clientWidth = document.documentElement.clientWidth
    this.setState({
      clientHeight,
      clientWidth
    })
  }

  render() {
    const {
      file_detail_modal_visible,
      setPreviewFileModalVisibile,
      filePreviewCurrentFileId,
      fileType,
      filePreviewCurrentName,
      projectDetailInfoData: { board_id }
    } = this.props
    const { clientWidth, clientHeight } = this.state
    return (
      <div id={'container_publicFileDetailModal'}>
        <FileDetailContent
          clientWidth={clientWidth}
          clientHeight={clientHeight}
          file_detail_modal_visible={file_detail_modal_visible}
          setPreviewFileModalVisibile={setPreviewFileModalVisibile}
          filePreviewCurrentFileId={filePreviewCurrentFileId}
          filePreviewCurrentName={filePreviewCurrentName}
          fileType={fileType}
          // board_id={board_id}
          {...this.props}
        />
      </div>
    )
  }
}

function mapStateToProps({
  publicFileDetailModal: {
    filePreviewCurrentFileId,
    fileType,
    isInOpenFile,
    filePreviewCurrentName,
    isOpenAttachmentFile,
    filePreviewCurrentSize,
    filePreviewCurrentFileResourceId
  },
  projectDetail: {
    datas: { projectDetailInfoData = {} }
  }
}) {
  return {
    filePreviewCurrentFileId,
    fileType,
    isInOpenFile,
    filePreviewCurrentName,
    isOpenAttachmentFile,
    filePreviewCurrentSize,
    filePreviewCurrentFileResourceId,
    projectDetailInfoData
  }
}
