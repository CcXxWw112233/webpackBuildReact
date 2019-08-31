import React from 'react'
import { Modal, Form, Button, Input, message } from 'antd'
const FormItem = Form.Item
const TextArea = Input.TextArea
export default class PreviewModal extends React.Component {
  onCancel = () => {
    this.props.updateDatas({
      editTeamShowPreview: false,
      editTeamShowSave: false
    })
  }
  render() {
    const {datas: { editTeamShowPreview, content }} = this.props.model

    //预览的内容等于详情和富文本编辑
    let previewHtmlString = ''
    let contentHTML = ''
    let detailIfoString = ''
    if(document.getElementById('editTeamShowDetailInfo')) {
      detailIfoString = document.getElementById('editTeamShowDetailInfo').innerHTML
    }
    if(typeof content === 'object') {
      contentHTML = '<div style="max-width: 1200px;margin: 0 auto; overflow: hidden">' +content.toHTML()+'</div>'

    }else {
      contentHTML = '<div style="max-width: 1200px;margin: 0 auto; overflow: hidden">' +content+'</div>'
    }
    previewHtmlString = detailIfoString + contentHTML
    const step = (
       <div dangerouslySetInnerHTML={{__html: previewHtmlString}}></div>
    )

    return(
      <div>
        <Modal
          visible={editTeamShowPreview}
          width={'100%'}
          height = {'100%'}
          zIndex={1006}
          maskClosable={false}
          footer={null}
          destroyOnClose
          style={{textAlign: 'center'}}
          onCancel={this.onCancel}
        >
          {step}
        </Modal>
      </div>
    )
  }
}
