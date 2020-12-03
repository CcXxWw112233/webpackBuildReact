import React, { Component } from 'react'
import globalStyles from '@/globalset/css/globalClassName.less'
import mainContentStyles from './mainContent.less'
import { connect } from 'dva'

@connect(mapStateToProps)
export default class NonsupportPreviewFileContent extends Component {
  handleDownloadFile = e => {
    e && e.stopPropagation()
    this.fileDownload()
  }

  fileDownload = () => {
    const {
      filePreviewCurrentFileResourceId,
      filePreviewCurrentFileId
    } = this.props
    //如果时pdf
    const { dispatch } = this.props
    if (!filePreviewCurrentFileResourceId) return
    dispatch({
      type: 'publicFileDetailModal/fileDownload',
      payload: {
        ids: filePreviewCurrentFileResourceId,
        fileIds: filePreviewCurrentFileId
      }
    })
  }

  render() {
    return (
      <div className={mainContentStyles.nonSupportWrapper}>
        <div
          style={{
            fontSize: '64px',
            marginBottom: '24px',
            color: 'rgba(0,0,0,0.15)'
          }}
          className={globalStyles.authTheme}
        >
          &#xe785;
        </div>
        <div style={{ fontSize: '16px' }}>
          暂不支持20M以上大小的文件预览，请
          <span
            onClick={this.handleDownloadFile}
            style={{ color: '#1890FF', cursor: 'pointer' }}
          >
            下载到本地
          </span>
          查看
        </div>
      </div>
    )
  }
}

function mapStateToProps({
  publicFileDetailModal: {
    filePreviewCurrentFileResourceId,
    filePreviewCurrentFileId
  }
}) {
  return {
    filePreviewCurrentFileResourceId,
    filePreviewCurrentFileId
  }
}
