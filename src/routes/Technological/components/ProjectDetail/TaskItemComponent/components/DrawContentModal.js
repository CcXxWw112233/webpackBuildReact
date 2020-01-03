import React from 'react'
import { Modal, Form, Button, Input, message } from 'antd'
import DrawContent from '../DrawerContent'
import { min_page_width } from "../../../../../../globalset/js/styles";
import CustormModal from '../../../../../../components/CustormModal'
const FormItem = Form.Item
const TextArea = Input.TextArea


class DrawContentModal extends React.Component {
  state = {}

  componentDidMount() { }

  componentWillReceiveProps(nextProps) { }

  onCancel() {
    this.props.dispatch({
      type: 'projectDetailTask/updateDatas',
      payload: {
        drawContent: {}
      }
    })
    this.props.setDrawerVisibleClose()
  }

  render() {
    const { visible, setDrawerVisibleClose } = this.props;
    return (
      <CustormModal
        visible={visible}
        width={'80%'}
        zIndex={1006}
        maskClosable={false}
        footer={null}
        destroyOnClose
        onCancel={this.onCancel.bind(this)}
        overInner={<DrawContent setDrawerVisibleClose={setDrawerVisibleClose} />}
      />
    )
  }
}
export default Form.create()(DrawContentModal)
