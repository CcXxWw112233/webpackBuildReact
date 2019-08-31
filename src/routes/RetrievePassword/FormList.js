/* eslint-disable react/react-in-jsx-scope */
import { Form, Input, InputNumber, Radio, Switch, DatePicker, Upload, Modal, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox, Button, AutoComplete } from 'antd';
import React from 'react'
import indexStyle from './index.less'
import DragValidation from '../../components/DragValidation'
import { validateTel, validateEmail, validatePassword } from '../../utils/verify'
import {message} from "antd";
import {MESSAGE_DURATION_TIME} from "../../globalset/js/constant";


const FormItem = Form.Item;
const Option = Select.Option;
const AutoCompleteOption = AutoComplete.Option;
const { TextArea } = Input;
const RadioGroup = Radio.Group;
const RangePicker = DatePicker.RangePicker

class FormList extends React.Component {

  state={
    accountType: 'mobile', //默认账号方式手机号 （还有邮箱号）
    completeValidation: false, //表单验证默认不验证
  }

  //监听是否完成验证
  listenCompleteValidation = (e) => {
    this.setState({
      completeValidation: e
    })
  }
  //输入确认方式
  verifyAccountByChange = (e, name) => {
    const value = e.target.value
    if(name === 'account') { //输入框是账户
      let accountType = ''
      if(!isNaN(value)) { //如果用户输入的是手机号,纯数字
        accountType = 'mobile'
      } else {
        accountType = 'email'
      }
      this.setState({
        accountType
      })
    }
  }

  //  提交表单
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if(!validateTel(values['mobile']) && !validateEmail(values['mobile'])) { //输入既不满足手机号又不满足邮箱
          if(this.state.accountType === 'mobile'){
            message.warn('请输入正确格式的手机号。', MESSAGE_DURATION_TIME)
          }else{
            message.warn('请输入正确格式的邮箱。', MESSAGE_DURATION_TIME)
          }
          return false
        }
        if(!this.state.completeValidation) {
          message.warn('请拖动下方滑块至右边完成验证。', MESSAGE_DURATION_TIME)
          return false
        }
        const obj = { ...values, accountType: this.state.accountType}
        this.props.formSubmit ? this.props.formSubmit(obj) : false
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} style={{margin: '0 auto', width: 280}}>
        {/* 绑定的手机号或邮箱 */}
        <FormItem style={{marginTop: 0}}>
          {getFieldDecorator('mobile', {
            rules: [{ required: false, message: '请输入绑定的手机号或邮箱', whitespace: true }],
          })(
            <Input
              style={{height: '40px', fontSize: 16}}
              maxLength={40} placeholder="绑定的手机号或邮箱"
              onChange = {(e) => this.verifyAccountByChange(e, 'account')}
            />
          )}
        </FormItem>

        <DragValidation listenCompleteValidation={this.listenCompleteValidation.bind(this)}/>

        {/* 确认 */}
        <FormItem style={{marginTop: 20}}>
          <Button type="primary" htmlType="submit" style={{width: '100%', height: 40}}>{this.state.accountType === 'mobile' ? '下一步': '发送邮件'}</Button>
        </FormItem>


      </Form>
    );
  }
}

// const WrappedRegistrationForm = Form.create()(RegistrationForm);
export default Form.create()(FormList)

