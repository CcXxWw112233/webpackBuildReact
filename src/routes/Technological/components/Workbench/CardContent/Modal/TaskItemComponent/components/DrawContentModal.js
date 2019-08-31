import React from 'react'
import { Modal, Form, Button, Input, message } from 'antd'
import DrawContent from '../DrawerContent'
import {min_page_width} from "../../../../../../globalset/js/styles";
import CustormModal from '../../../../../../components/CustormModal'
const FormItem = Form.Item
const TextArea = Input.TextArea


class DrawContentModal extends React.Component {
  state = {}

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {}

  onCancel() {
    this.props.setDrawerVisibleClose()
  }

  render() {
    const { visible } = this.props;

    return(
      <CustormModal
        visible={visible}
        width={472}
        zIndex={1006}
        maskClosable={false}
        footer={null}
        destroyOnClose
        onCancel={this.onCancel.bind(this)}
        overInner={<DrawContent {...this.props} />}
      />
    )
  }
}
export default Form.create()(DrawContentModal)
