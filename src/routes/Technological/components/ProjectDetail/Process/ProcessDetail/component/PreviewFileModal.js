import React from 'react'
import { Modal, Form, Button, Input, message, Spin } from 'antd'
import indexStyles from './index.less'
import { color_4 } from '../../../../../../../globalset/js/styles'

class PreviewFileModal extends React.Component {

  state = {
    clientHeight: document.documentElement.clientHeight
  }
  componentDidMount() {
    window.addEventListener('resize', this.resizeTTY.bind(this, 'ing'))
  }
  componentWillUnmount() {
    // window.removeEventListener('resize', this.resizeTTY.bind(this,'ed'))
  }
  resizeTTY(type) {
    const clientHeight = document.documentElement.clientHeight;//获取页面可见高度
    this.setState({
      clientHeight
    })
  }
  onCancel = () => {
    this.props.setPreviewFileModalVisibile()
    this.props.setPreview({
      filePreviewIsUsable: true,
      filePreviewUrl: '',
    })
  }
  downLoad(current_file_resource_id) {
    this.props.fileDownload({ids: current_file_resource_id})
  }
  render() {
    const { modalVisible, } = this.props;
    const { clientHeight } = this.state
    const {filePreviewIsUsable, filePreviewUrl, current_file_resource_id } = this.props
    const getIframe = (src) => {
      const iframe = '<iframe style="height: 100%;width: 100%;border:0px;" class="multi-download"  src="'+src+'"></iframe>'
      return iframe
    }

    return(
      <div>
        <Modal
          visible={modalVisible} //modalVisible
          width={'90%'}
          zIndex={1006}
          footer={null}
          destroyOnClose
          maskClosable={false}
          style={{textAlign: 'center', }}
          onCancel={this.onCancel}
        >
          {!filePreviewIsUsable?(
            <div>当前文件无法预览，<span className={indexStyles.hoverUnderline} onClick={this.downLoad.bind(this, current_file_resource_id)} style={{color: color_4}}>点击此处下载后查看</span></div>
          ) : (
            !!filePreviewUrl ? (
              <div className={indexStyles.previewOut} style={{height: `${clientHeight * 0.9 - 120}px`}} dangerouslySetInnerHTML={{__html: getIframe(filePreviewUrl)}} />
            ) : ('')
          )}

        </Modal>

      </div>
    )
  }
}
export default Form.create()(PreviewFileModal)
