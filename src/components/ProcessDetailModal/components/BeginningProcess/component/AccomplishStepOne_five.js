import React, { Component } from 'react'
import indexStyles from '../index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { getSubfixName } from '@/utils/businessFunction'
import { connect } from 'dva'
import { getOrgIdByBoardId } from '../../../../../utils/businessFunction'
import FileListRightBarFileDetailModal from '../../../../../routes/Technological/components/ProjectDetail/FileModule/FileListRightBarFileDetailModal'

@connect(mapStateToProps)
export default class AccomplishStepOne_five extends Component {
  handleFileDownload = (e, { file_resource_id, file_id }) => {
    e && e.stopPropagation()
    const {
      processInfo: { board_id }
    } = this.props
    let org_id = getOrgIdByBoardId(board_id)
    this.props.dispatch({
      type: 'publicProcessDetailModal/fileDownload',
      payload: {
        ids: file_resource_id,
        fileIds: file_id,
        _organization_id: org_id
      }
    })
  }

  onFilePreview = (e, item) => {
    e && e.stopPropagation()
    const file_id =
      item.file_id ||
      (item.response && item.response.data && item.response.data.file_id) ||
      ''
    const file_name =
      item.file_name ||
      (item.response && item.response.data && item.response.data.file_name) ||
      ''
    const file_size =
      item.file_size ||
      (item.response && item.response.data && item.response.data.file_size) ||
      ''
    const file_resource_id =
      item.file_resource_id ||
      (item.response &&
        item.response.data &&
        item.response.data.file_resource_id) ||
      ''
    if (!file_id) return
    this.props.dispatch({
      type: 'publicFileDetailModal/updateDatas',
      payload: {
        isInOpenFile: true,
        filePreviewCurrentFileId: file_id,
        fileType: getSubfixName(file_name),
        filePreviewCurrentName: file_name,
        filePreviewCurrentSize: file_size,
        filePreviewCurrentFileResourceId: file_resource_id,
        isOpenAttachmentFile: true
      }
    })
  }

  setPreviewFileModalVisibile = () => {
    this.props.dispatch({
      type: 'publicFileDetailModal/updateDatas',
      payload: {
        filePreviewCurrentFileId: '',
        fileType: '',
        isInOpenFile: false,
        isOpenAttachmentFile: false,
        filePreviewCurrentSize: '',
        filePreviewCurrentName: '',
        filePreviewCurrentFileResourceId: ''
      }
    })
  }

  getEllipsisFileName = name => {
    // wx6535e025f795dca9.o6zAJs5_pqZsbrr7sJng7qkxKKbM.ZhMftVUvAIJ9b5dcb721199c1b8f4f84b0954a80e589.png
    // let str = 'wx6535e025f795dca9.o6zAJs5_pqZsbrr7sJng7qkxKKbM.ZhMftVUvAIJ9b5dcb721199c1b8f4f84b0954a80e589.png'
    let str = name
    if (!name) return
    let arr = str.split('.')
    arr.splice(-1, 1)
    arr.join('.')
    return arr
  }

  renderFileTypeArrayText = () => {
    const { itemValue } = this.props
    const { limit_file_type = [] } = itemValue
    const fileTypeArray = [...limit_file_type]
    let fileTypeArrayText = [] //文档类型转化中文
    for (let i = 0; i < fileTypeArray.length; i++) {
      if (fileTypeArray[i] === 'document') {
        fileTypeArrayText.push('文档')
      } else if (fileTypeArray[i] === 'image') {
        fileTypeArrayText.push('图像')
      } else if (fileTypeArray[i] === 'audio') {
        fileTypeArrayText.push('音频')
      } else if (fileTypeArray[i] === 'video') {
        fileTypeArrayText.push('视频')
      }
    }
    return fileTypeArrayText.join('、')
  }

  renderFileList = item => {
    return (
      <div
        key={item.uid}
        className={indexStyles.file_item}
        onClick={e => {
          this.onFilePreview(e, item)
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flex: '1' }}>
          <span
            className={`${globalStyles.authTheme} ${indexStyles.file_theme_code}`}
          >
            &#xe64d;
          </span>
          <span className={indexStyles.file_name}>
            <span
              style={{
                maxWidth: '874px',
                display: 'inline-block',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
              }}
            >
              {this.getEllipsisFileName(item.file_name || item.name)}
            </span>
            {getSubfixName(item.file_name || item.name)}
          </span>
        </div>
        <div style={{ flexShrink: 0 }}>
          <span
            onClick={e => {
              this.handleFileDownload(e, {
                file_resource_id: item.file_resource_id,
                file_id: item.file_id
              })
            }}
            className={indexStyles.down_name}
          >
            下载
          </span>
        </div>
      </div>
    )
  }

  render() {
    const {
      itemValue,
      isInOpenFile,
      fileType,
      filePreviewCurrentFileId,
      filePreviewCurrentName
    } = this.props
    const {
      title,
      limit_file_num,
      limit_file_type,
      limit_file_size,
      is_required,
      files: fileList = []
    } = itemValue
    return (
      <div className={indexStyles.text_form}>
        <p>
          <span>
            {title}:&nbsp;&nbsp;
            {is_required == '1' && <span style={{ color: '#F5222D' }}>*</span>}
          </span>
        </p>
        {/* <div className={indexStyles.upload_static}>
          <span style={{ color: '#1890FF', fontSize: '28px', marginTop: '-6px' }} className={`${globalStyles.authTheme}`}>&#xe692;</span>
          <div style={{ flex: 1, marginLeft: '12px' }}>
            <div className={indexStyles.file_drap_tips}>点击或拖拽文件到此开始上传</div>
            <div className={indexStyles.file_layout}>{limit_file_size == 0 ? `不限制大小` : `${limit_file_size}MB以内`}、{limit_file_num == 0 ? `不限制数量` : `最多${limit_file_num}个`}、 {this.renderFileTypeArrayText()}格式</div>
          </div>
        </div> */}
        {fileList &&
          fileList.map(item => {
            return this.renderFileList(item)
          })}

        {isInOpenFile && (
          <FileListRightBarFileDetailModal
            filePreviewCurrentFileId={filePreviewCurrentFileId}
            fileType={fileType}
            filePreviewCurrentName={filePreviewCurrentName}
            file_detail_modal_visible={isInOpenFile}
            setPreviewFileModalVisibile={this.setPreviewFileModalVisibile}
          />
        )}
      </div>
    )
  }
}

function mapStateToProps({
  publicProcessDetailModal: { processInfo = {} },
  publicFileDetailModal: {
    filePreviewCurrentFileId,
    fileType,
    isInOpenFile,
    filePreviewCurrentName
  }
}) {
  return {
    processInfo,
    filePreviewCurrentFileId,
    fileType,
    isInOpenFile,
    filePreviewCurrentName
  }
}
