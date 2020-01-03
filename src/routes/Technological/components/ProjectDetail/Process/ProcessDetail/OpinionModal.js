import React from 'react'
import { Modal, Form, Button, Input, message } from 'antd'
import DragValidation from '../../../../../../components/DragValidation'
import {validateEmail, validateTel} from "../../../../../../utils/verify";
import {MESSAGE_DURATION_TIME} from "../../../../../../globalset/js/constant";
const FormItem = Form.Item
const TextArea = Input.TextArea
class OpinionModal extends React.Component {

  state = {
    stepContinueDisabled: true,
  }
  // nextStep() {
  //   console.log('hello world')
  // }
  descriptionChange(e) {
    const value = e.target.value
    let flag = true
    if(value) {
      flag = false
    }

    this.setState({
      stepContinueDisabled: flag
    })
  }
  nextStep() {
  }
  onCancel = () => {
    this.setState({
      stepContinueDisabled: true
    })
    this.props.setOpinionModalVisible()
  }
  // 提交表单
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { operateType, itemValue, isFillForm, form_id, form_data } = this.props //isFillForm form_id填写表单的特殊处理
        const { datas: {processInfo = {}} } = this.props.model
        const instance_id = processInfo.id //流程实例id
        const { id } = itemValue
        values['flow_node_instance_id'] = id
        values['instance_id'] = instance_id
        this.onCancel()
        //发送请求
        if(operateType === '1') {
          if(isFillForm) { //填写
            const obj = {
              form_id,
              instance_id,
              flow_instance_id: instance_id,
              node_id: id,
              values: JSON.stringify(form_data),
              message: values['message']
            }
            this.props.fillFormComplete ? this.props.fillFormComplete(obj): false
          }else {
            this.props.completeProcessTask ? this.props.completeProcessTask(values) : false
            this.props.dispatch({
              type: 'workbench/getBackLogProcessList',
              payload: {}
            })
          }
        }else if(operateType === '0') {
          this.props.rebackProcessTask ?this.props.rebackProcessTask(values) : false
        } else if(operateType === '2') {
          this.props.rejectProcessTask ?this.props.rejectProcessTask(values) : false
        }
      }
    });
  }
  render() {
    const { opinionModalVisible, enableOpinion } = this.props; //enableOpinion为是否需要填写意见1是0否
    const { getFieldDecorator } = this.props.form;
    const { stepContinueDisabled } = this.state
    const step_3 = (
      <Form onSubmit={this.handleSubmit} style={{margin: '0 auto', width: 336}}>
        <div style={{fontSize: 20, color: '#595959', marginTop: 28, marginBottom: 28}}>填写意见</div>

        {/* 意见 */}
        <FormItem style={{width: 336}}>
          {getFieldDecorator('message', {
            rules: [{ required: false, message: '', whitespace: true }],
          })(
            <TextArea style={{height: 208, resize: 'none'}}
                      onChange={this.descriptionChange.bind(this)}
                      placeholder={`请输入意见${enableOpinion === '1'? '(必填)': '(选填)'}`} maxLength={1000}/>
          )}
        </FormItem>
        {/* 确认 */}
        <FormItem>
          <Button type="primary" disabled={enableOpinion === '1' ?stepContinueDisabled : false} htmlType={'submit'} onClick={this.nextStep} style={{marginTop: 20, width: 208, height: 40}}>确定</Button>
        </FormItem>
      </Form>
    )

    return(
      <div>
        <Modal
          visible={opinionModalVisible} //
          width={472}
          zIndex={1006}
          footer={null}
          maskClosable={false}
          destroyOnClose
          style={{textAlign: 'center'}}
          onCancel={this.onCancel}
        >
          {step_3}
        </Modal>
      </div>
    )
  }
}
export default Form.create()(OpinionModal)
