//重命名组件
import React from 'react'
import { Modal, Form, Button, Input, message } from 'antd'
const FormItem = Form.Item
const TextArea = Input.TextArea

class RenameModal extends React.Component {
  state = {
    stepContinueDisabled: true,
  }
  nameChange(e) {
    const value = e.target.value
    let flag = true
    if(value) {
      flag = false
    }
    this.setState({
      stepContinueDisabled: flag
    })
  }
  onCancel = () => {
    this.props.setRenameModalVisable()
  }
  // 提交表单
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.setRenameModalVisable()
        //baocun
        const { reName_Add_type } = this.props; //reName_Add_type操作类型1重命名 2添加
        if(reName_Add_type === '1') {
          this.props.reNamePanelItem ? this.props.reNamePanelItem(values) : false
        }else if(reName_Add_type === '2') {
          this.props.addPanelItem ? this.props.addPanelItem(values) : false
        }else if(reName_Add_type === '3') {
          this.props.copy ? this.props.copy(values) : false
        }
      }
    });
  }
  render() {
    const { renameModalVisable, reName_Add_type } = this.props; //reName_Add_type操作类型1重命名 2添加
    const { getFieldDecorator } = this.props.form;
    const { stepContinueDisabled } = this.state
    // console.log(this.props)
    const formContain = (
      <Form onSubmit={this.handleSubmit} style={{margin: '0 auto', width: 336}}>
        <div style={{fontSize: 20, color: '#595959', marginTop: 28, marginBottom: 28}}>{reName_Add_type==='1'? '重命名': (reName_Add_type==='2'?'添加': '复制')}</div>
        <FormItem style={{width: 336}}>
          {getFieldDecorator('name', {
            rules: [{ required: false, message: '', whitespace: true }],
          })(
            <Input placeholder={'输入名称'} style={{height: 40}} onChange={this.nameChange.bind(this)} maxLength={50}/>
          )}
        </FormItem>

        {/* 确认 */}
        <FormItem>
          <Button type="primary" disabled={stepContinueDisabled} htmlType={'submit'} onClick={this.nextStep} style={{marginTop: 20, width: 208, height: 40}}>保存</Button>
        </FormItem>
      </Form>
    )

    return(
      <div>
        <Modal
          visible={renameModalVisable} //renameModalVisable
          width={472}
          zIndex={1006}
          footer={null}
          maskClosable={false}
          destroyOnClose
          style={{textAlign: 'center'}}
          onCancel={this.onCancel}
          getContainer={() => document.getElementById('org_managementContainer') || document.body}
        >
          {formContain}
        </Modal>
      </div>
    )
  }
}
export default Form.create()(RenameModal)
