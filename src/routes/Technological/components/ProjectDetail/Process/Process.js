import React, { Component } from 'react'
import indexStyles from './index.less'
import ProcessDefault from './ProcessDefault'
import EditProcess from './EditProcess'
import ProcessStartConfirm from './ProcessStartConfirm'
import { connect } from 'dva'
import FileListRightBarFileDetailModal from '@/routes/Technological/components/ProjectDetail/FileModule/FileListRightBarFileDetailModal'
@connect(mapStateToProps)
class ProcessIndex extends Component {
  filterPage = () => {
    const { processPageFlagStep } = this.props
    let containner = <div></div>
    switch (processPageFlagStep) {
      case '1':
        containner = <ProcessDefault />
        break
      case '2':
        containner = <EditProcess />
        break
      case '3':
        containner = <ProcessStartConfirm />
        break
      case '4':
        containner = <ProcessDefault />
        break
      default:
        containner = <ProcessDefault />
        break
    }
    return containner
  }

  setPreviewFileModalVisibile = () => {
    // this.setState({
    //   previewFileModalVisibile: !this.state.previewFileModalVisibile
    // })
    this.props.dispatch({
      type: 'publicFileDetailModal/updateDatas',
      payload: {
        filePreviewCurrentFileId: '',
        fileType: '',
        isInOpenFile: false,
        isInAttachmentFile: false,
        filePreviewCurrentName: ''
      }
    })
  }

  render() {
    const {
      isInOpenFile,
      filePreviewCurrentFileId,
      fileType,
      filePreviewCurrentName
    } = this.props
    return (
      <div className={indexStyles.processOut}>
        {this.filterPage()}
        <div>
          {isInOpenFile && (
            <FileListRightBarFileDetailModal
              filePreviewCurrentFileId={filePreviewCurrentFileId}
              fileType={fileType}
              file_detail_modal_visible={isInOpenFile}
              filePreviewCurrentName={filePreviewCurrentName}
              setPreviewFileModalVisibile={this.setPreviewFileModalVisibile}
            />
          )}
        </div>
      </div>
    )
  }
}

export default ProcessIndex
function mapStateToProps({
  projectDetailProcess: {
    datas: { processPageFlagStep }
  },
  publicFileDetailModal: {
    isInOpenFile,
    filePreviewCurrentFileId,
    fileType,
    filePreviewCurrentName
  }
}) {
  return {
    processPageFlagStep,
    isInOpenFile,
    filePreviewCurrentFileId,
    fileType,
    filePreviewCurrentName
  }
}
