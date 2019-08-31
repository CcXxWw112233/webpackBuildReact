import React from 'react'
import { Modal, Form, Button, Input, message } from 'antd'
import DrawContent from './TaskItemComponent/DrawerContent'
import {min_page_width} from "../../../../../../globalset/js/styles";
import CustormModal from '../../../../../../components/CustormModal'
const FormItem = Form.Item
const TextArea = Input.TextArea

class TaskDetailModal extends React.Component {
  state = {}

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {}

  onCancel() {
    this.props.updateTaskDatas({
      drawContent: {}
    })
    this.props.setTaskDetailModalVisibile()
  }

  render() {
    const { modalVisible } = this.props;

    return(
      <CustormModal
        visible={modalVisible}
        width={'80%'}
        zIndex={1006}
        maskClosable={false}
        footer={null}
        destroyOnClose={true}
        onCancel={this.onCancel.bind(this)}
        overInner={<DrawContent {...this.props} />}
      />
    )
  }
}
export default Form.create()(TaskDetailModal)
