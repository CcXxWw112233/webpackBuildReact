import React from 'react'
import { Modal, Form, Button, Input, message } from 'antd'
import DrawDetailInfo from './DrawDetailInfo'
import {min_page_width} from "../../../../../globalset/js/styles";
import CustormModal from '../../../../../components/CustormModal'
const FormItem = Form.Item
const TextArea = Input.TextArea


class DetailInfoModal extends React.Component {
  state = {}

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {}

  onCancel(){
    this.props.updateDatas({
      projectInfoDisplay: false
    })
  }

  render() {
    const { modalVisible } = this.props;

    return(
      <CustormModal
        visible={modalVisible}
        width={472}
        zIndex={1006}
        maskClosable={false}
        footer={null}
        destroyOnClose
        onCancel={this.onCancel.bind(this)}
        overInner={<DrawDetailInfo {...this.props} />}
      />
    )
  }
}
export default Form.create()(DetailInfoModal)
