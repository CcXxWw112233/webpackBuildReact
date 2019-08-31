import React from 'react'
import { Modal, Form, Button, Input, message, Spin } from 'antd'
import indexStyles from './index.less'

class PreviewArticleModal extends React.Component {

  state = {
  }
  onCancel = () => {
    this.props.updateDatas({
      previewAticle: {}
    })
    this.props.setPreviewArticleModalVisibile()
  }
  render() {
    const { modalVisible, } = this.props;
    const {datas: { previewAticle ={}, spinning } } = this.props.model
    const { content='文章加载中', title } = previewAticle
    return(
      <div>
        <Modal
          visible={modalVisible} //modalVisible
          width={800}
          zIndex={1006}
          footer={null}
          destroyOnClose
          maskClosable={false}
          style={{textAlign: 'center', }}
          onCancel={this.onCancel}
        >
          <Spin tip="正在获取文章..." spinning={spinning}>
          <div className={indexStyles.previewOut}>
            <div className={indexStyles.title}>
              {title}
            </div>
            <div className={indexStyles.content} dangerouslySetInnerHTML={{__html: content}}/>
          </div>
          </Spin>
        </Modal>

      </div>
    )
  }
}
export default Form.create()(PreviewArticleModal)
