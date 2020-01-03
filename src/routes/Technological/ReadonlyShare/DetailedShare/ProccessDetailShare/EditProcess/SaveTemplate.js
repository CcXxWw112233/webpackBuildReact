import React from 'react'
import { Modal, Form, Button, Input } from 'antd'
import { connect } from 'dva';

const FormItem = Form.Item
const TextArea = Input.TextArea

@connect(mapStateToProps)
class SaveTemplate extends React.Component {

  state = {
    stepContinueDisabled: true,
  }
  descriptionChange(e) {
    this.setState({
      users: e.target.value
    })
  }
  nameChange(e) {
    const value = e.target.value
    let flag = true
    if (value) {
      flag = false
    }
    this.setState({
      stepContinueDisabled: flag
    })
  }
  onCancel = () => {
    this.setState({
      stepContinueDisabled: true
    })
    this.props.setSaveTemplateModalVisible()
  }
  // 提交表单
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { board_id, dispatch } = this.props
        values['board_id'] = board_id
        values['is_retain'] = '1'
        values['node_data'] = this.props.requestFilterProcessEditDatas()//processEditDatas
        values['template_no'] = ''
        values['type'] = '1'
        // console.log(values)
        this.setState({
          stepContinueDisabled: true
        })
        this.props.setSaveTemplateModalVisible()
        //发送请求
        dispatch({
          type: 'projectDetailProcess/saveProcessTemplate',
          payload: {
            ...values
          }
        })
      }
    });
  }
  render() {
    const { saveTemplateModalVisible } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { stepContinueDisabled } = this.state

    const step_3 = (
      <Form onSubmit={this.handleSubmit} style={{ margin: '0 auto', width: 336 }}>
        <div style={{ fontSize: 20, color: '#595959', marginTop: 28, marginBottom: 28 }}>保存为模板</div>
        <FormItem style={{ width: 336 }}>
          {getFieldDecorator('name', {
            rules: [{ required: false, message: '', whitespace: true }],
          })(
            <Input placeholder={'输入模板名称'} style={{ height: 40 }} onChange={this.nameChange.bind(this)} maxLength={50} />
          )}
        </FormItem>

        {/* 描述 */}
        <FormItem style={{ width: 336 }}>
          {getFieldDecorator('description', {
            rules: [{ required: false, message: '', whitespace: true }],
          })(
            <TextArea style={{ height: 208, resize: 'none' }}
              onChange={this.descriptionChange.bind(this)}
              placeholder="模板描述（选填）" maxLength={300} />
          )}
        </FormItem>
        {/* 确认 */}
        <FormItem>
          <Button type="primary" disabled={stepContinueDisabled} htmlType={'submit'} onClick={this.nextStep} style={{ marginTop: 20, width: 208, height: 40 }}>保存</Button>
        </FormItem>
      </Form>
    )

    return (
      <div>
        <Modal
          visible={saveTemplateModalVisible} //saveTemplateModalVisible
          width={472}
          zIndex={1006}
          footer={null}
          maskClosable={false}
          destroyOnClose
          style={{ textAlign: 'center' }}
          onCancel={this.onCancel}
        >
          {step_3}
        </Modal>
      </div>
    )
  }
}
export default Form.create()(SaveTemplate)
function mapStateToProps({
  projectDetailProcess: {
    datas: {
      processEditDatasRecords = [],
      processEditDatas = [],
      processCurrentEditStep,
    }
  },
  projectDetail: {
    datas: {
      projectDetailInfoData: {
        board_id
      }
    }
  }
}) {
  return {
    processEditDatasRecords,
    processEditDatas,
    processCurrentEditStep,
    board_id
  }
}