import React from 'react'
import { Modal, Form, Button, Input, message } from 'antd'
import {min_page_width} from "../../../../../../globalset/js/styles";
import CustormModal from '../../../../../../components/CustormModal'
import FileDetail from './ProccessDetail/index'
const FormItem = Form.Item
const TextArea = Input.TextArea


class FileDetailModal extends React.Component {
  state = {}

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {}

  onCancel(){
    this.props.updateDatas({
      isInOpenFile: false
    })
  }

  render() {
    const { modalVisible } = this.props;

    const modalTop = 20

    return(
      <CustormModal
        visible={modalVisible}
        width={'90%'}
        close={this.props.close}
        closable={false}
        maskClosable={false}
        footer={null}
        destroyOnClose
        bodyStyle={{top: 0}}
        style={{top: modalTop}}
        onCancel={this.onCancel.bind(this)}
        overInner={<FileDetail {...this.props} status = {this.props.status} modalTop={modalTop}/>}
      />
    )
  }
}
export default Form.create()(FileDetailModal)
