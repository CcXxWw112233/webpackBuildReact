import React from 'react'
import { Modal, Form, Button, Input, message } from 'antd'
import DragValidation from '../../../../../../components/DragValidation'
import { validateEmail, validateTel } from '../../../../../../utils/verify'
import { MESSAGE_DURATION_TIME } from '../../../../../../globalset/js/constant'
const FormItem = Form.Item
const TextArea = Input.TextArea

class EditFormThreeTwoModal extends React.Component {
  state = {
    selections: ''
  }

  selectionsChange(e) {
    this.setState({
      selections: e.target.value
    })
  }
  onCancel = () => {
    this.props.setShowModalVisibile()
  }
  // 提交表单
  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values['board_id'] = this.props.board_id
        if (this.state.selections) {
          let selections = this.state.selections.replace(/\n/gim, ',') //替代换行符
          let selectionsArr = selections.split(',') //转成数组
          let selectionsNewArr = []
          for (let val of selectionsArr) {
            if (val) {
              selectionsNewArr.push(val)
            }
          }
          values['selections'] = selectionsNewArr
        }
        this.props.setShowModalVisibile()
        // 此处设置状态管理数据
        this.props.optionsDataChange(values['selections'])
      }
    })
  }
  render() {
    const { modalVisible, options_data } = this.props
    const { getFieldDecorator } = this.props.form

    const editSelectionsText = options_data.join(',')
    const newEditSelectionsText = editSelectionsText.replace(/\,/gim, `\n`)

    const step_3 = (
      <Form
        onSubmit={this.handleSubmit}
        style={{ margin: '0 auto', width: 336 }}
      >
        <div
          style={{
            fontSize: 20,
            color: '#595959',
            marginTop: 28,
            marginBottom: 28
          }}
        >
          编辑选项
        </div>

        {/* 他人信息 */}
        <FormItem style={{ width: 336 }}>
          {getFieldDecorator('othersInfo', {
            initialValue: newEditSelectionsText || ''
          })(
            <TextArea
              style={{ height: 208, resize: 'none' }}
              onChange={this.selectionsChange.bind(this)}
              placeholder="请输入选项，选项条数根据换行确定。（选填）"
            />
          )}
        </FormItem>
        {/* 确认 */}
        <FormItem>
          <Button
            type="primary"
            htmlType={'submit'}
            onClick={this.nextStep}
            style={{ marginTop: 20, width: 208, height: 40 }}
          >
            确认
          </Button>
        </FormItem>
      </Form>
    )

    return (
      <div>
        <Modal
          visible={modalVisible} //modalVisible
          width={472}
          zIndex={1006}
          footer={null}
          style={{ textAlign: 'center' }}
          onCancel={this.onCancel}
        >
          {step_3}
        </Modal>
      </div>
    )
  }
}
export default Form.create()(EditFormThreeTwoModal)
