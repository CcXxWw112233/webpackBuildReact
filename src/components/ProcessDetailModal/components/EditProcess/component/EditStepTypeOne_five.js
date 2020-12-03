import React, { Component } from 'react'
import indexStyles from '../index.less'
import globalStyles from '@/globalset/css/globalClassName.less'

export default class EditStepTypeOne_five extends Component {
  renderFileTypeArrayText = () => {
    const { itemValue } = this.props
    const { limit_file_type = [] } = itemValue
    const fileTypeArray = [...limit_file_type]
    let fileTypeArrayText = [] //文档类型转化中文
    if (!fileTypeArray || !fileTypeArray.length) {
      let text = '不限制'
      return text
    }
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

  render() {
    const { itemValue } = this.props
    const {
      title,
      limit_file_num,
      limit_file_type,
      limit_file_size,
      is_required
    } = itemValue
    return (
      <div className={indexStyles.text_form}>
        <p>
          {title}:&nbsp;&nbsp;
          {is_required == '1' && <span style={{ color: '#F5222D' }}>*</span>}
        </p>
        <div className={indexStyles.upload_static}>
          <span
            style={{ color: '#1890FF', fontSize: '28px', marginTop: '-6px' }}
            className={`${globalStyles.authTheme}`}
          >
            &#xe692;
          </span>
          <div style={{ flex: 1, marginLeft: '12px' }}>
            <div className={indexStyles.file_drap_tips}>
              点击或拖拽文件到此开始上传
            </div>
            <div className={indexStyles.file_layout}>
              {limit_file_size == 0 ? `不限制大小` : `${limit_file_size}MB以内`}
              、{limit_file_num == 0 ? `不限制数量` : `最多${limit_file_num}个`}
              、 {`${this.renderFileTypeArrayText()}格式`}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
