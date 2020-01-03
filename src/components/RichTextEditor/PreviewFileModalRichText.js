import React from 'react'
import { Modal, Form, Button, Input, message } from 'antd'
import CustormModal from '@/components/CustormModal'

class PreviewFileModalRichText extends React.Component {

  state = {
  }
  onCancel = () => {
    this.props.setPreivewProp({
      isUsable: true,
      previewFileType: '',
      previewFileSrc: '',
    })
    this.props.setPreviewFileModalVisibile()
  }
  render() {
    const { modalVisible, previewFileSrc, previewFileType, isUsable } = this.props;
    const containner = () => {
      let contain
      switch (previewFileType) {
        case 'img':
          contain = (
            <img src={previewFileSrc} style={{ width: 600, height: 'auto' }} />
          )
          break
        case 'video':
          contain = (
            <video controls src={previewFileSrc} style={{ width: 'auto', maxHeight: '600px' }}></video>
          )
          break
        case 'attachment':
          if (isUsable) {
            contain = (
              <iframe style={{ height: 600, width: 600 }} src={previewFileSrc}></iframe>
            )
          } else {
            contain = (
              <div>
                <iframe style={{ height: 0, width: 0 }} src={previewFileSrc}></iframe>
                当前文件无法预览
              </div>
            )
          }

        default:
          break
      }
      return contain
    }

    const modalTop = 20

    return (
      <div>
        <CustormModal
          visible={modalVisible} //modalVisible
          width={'80%'}
          zIndex={1006}
          footer={null}
          destroyOnClose
          style={{}}
          maskClosable={false}
          onCancel={this.onCancel}
          overInner={containner()}
        >
          {/*{containner()}*/}
        </CustormModal>
      </div>
    )
  }
}
export default Form.create()(PreviewFileModalRichText)
