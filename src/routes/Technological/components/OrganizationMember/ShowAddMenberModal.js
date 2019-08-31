import React from 'react'
import { Modal, Form, Button, Input, message } from 'antd'
import DragValidation from '../../../../components/DragValidation'
import AddModalFormStyles from './AddModalForm.less'
import {validateEmail, validateTel} from "../../../../utils/verify";
import {MESSAGE_DURATION_TIME} from "../../../../globalset/js/constant";
import CustormModal from '../../../../components/CustormModal'
import InviteOtherWithBatch from './../InviteOthersWithBatch/index'


const FormItem = Form.Item
const TextArea = Input.TextArea
class ShowAddMenberModal extends React.Component {

  state = {
    stepThreeContinueDisabled: true,
    completeValidation: false, //完成滑块验证
    users: '',
  }
  //监听是否完成验证
  listenCompleteValidation = (e) => {
    this.setState({
      completeValidation: e,
      stepThreeContinueDisabled: !e
    })
  }
  usersChange(e) {
    this.setState({
      users: e.target.value
    })
  }
  handleInviteTextAreaPressEnter = (e) => {
    if(e) e.stopPropagation()
  }
  onCancel = () => {
    this.props.setShowAddMenberModalVisibile()
  }
  // 提交表单
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if(this.state.users) {
          // let users = this.state.users.replace(/\n/gim, ',') //替代换行符
          // let usersArr = users.split(',') //转成数组
          // let usersNewArr = []
          // for(let val of usersArr) {
          //   if(val) {
          //     usersNewArr.push(val)
          //   }
          // }
          // users = usersNewArr.join(',')
          // for(let val of usersNewArr ) {
          //   if(!validateTel(val) && !validateEmail(val)) {
          //     message.warn('请正确输入被邀请人的手机号或者邮箱。', MESSAGE_DURATION_TIME)
          //     return false
          //   }
          // }
          // values['users'] = users
          this.props.addMembers?this.props.addMembers(values): false
        }
        this.props.setShowAddMenberModalVisibile()
       //  此处为邀请加入组织
      }
    });
  }
  handleSubmitNew = () => {
    const {users} = this.state
    this.props.addMembers?this.props.addMembers({users}): false
    this.props.setShowAddMenberModalVisibile()
  }
  handleInviteMemberReturnResult = str => {
    this.setState({
      users: str
    }, () => {
      this.handleSubmitNew()
    })
  }
  render() {
    const { modalVisible } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { stepThreeContinueDisabled } = this.state
    const step_3 = (
      <InviteOtherWithBatch isDisableSubmitWhenNoSelectItem={true} directReturnStr={true} handleInviteMemberReturnResult={this.handleInviteMemberReturnResult} />
    )
    const title = (<div style={{textAlign: 'center'}}>邀请他人</div>)
    // const step_3 = (
    //   <Form onSubmit={this.handleSubmit} style={{margin: '0 auto', width: 336}}>
    //     <div style={{fontSize: 20, color: '#595959', marginTop: 28, marginBottom: 28}}>邀请他人</div>

    //     {/* 他人信息 */}
    //     <FormItem style={{width: 336}}>
    //       {getFieldDecorator('othersInfo', {
    //         rules: [{ required: false, message: '请输入姓名', whitespace: true }],
    //       })(
    //         <TextArea style={{height: 208, resize: 'none'}}
    //                   onChange={this.usersChange.bind(this)}
    //                   onPressEnter={this.handleInviteTextAreaPressEnter}
    //                   placeholder="请输入被邀请人的手机号或邮箱，批量发送请使用换行间隔。（选填）"/>
    //       )}
    //     </FormItem>
    //     <div style={{marginTop: -10}}>
    //       <DragValidation listenCompleteValidation={this.listenCompleteValidation.bind(this)}/>
    //     </div>
    //     {/* 确认 */}
    //     <FormItem
    //     >
    //       <Button type="primary" disabled={stepThreeContinueDisabled} htmlType={'submit'} onClick={this.nextStep} style={{marginTop: 20, width: 208, height: 40}}>发送邀请</Button>
    //     </FormItem>
    //   </Form>
    // )

    return(
      <div>
        <CustormModal
          visible={modalVisible} //modalVisible
          width={472}
          zIndex={1006}
          footer={null}
          destroyOnClose
          maskClosable={false}
          style={{textAlign: 'center'}}
          onCancel={this.onCancel}
          overInner={step_3}
          title={title}
        >
        </CustormModal>
      </div>
    )
  }
}
export default Form.create()(ShowAddMenberModal)
