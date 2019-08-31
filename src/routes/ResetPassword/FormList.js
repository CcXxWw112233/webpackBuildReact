/* eslint-disable react/react-in-jsx-scope */
import { Form, Input, InputNumber, Radio, Switch, DatePicker, Upload, Modal, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox, Button, AutoComplete } from 'antd';
import React from 'react'
import indexStyle from './index.less'
import { validateTel, validateEmail, validatePassword } from '../../utils/verify'
import VerificationCode from '../../components/VerificationCode'
import {message} from "antd";
import {MESSAGE_DURATION_TIME} from "../../globalset/js/constant";
import sha256 from 'js-sha256'


const FormItem = Form.Item;
const Option = Select.Option;
const AutoCompleteOption = AutoComplete.Option;
const { TextArea } = Input;
const RadioGroup = Radio.Group;
const RangePicker = DatePicker.RangePicker

class FormList extends React.Component {

  state={}
  componentWillReceiveProps(nextProps){
    const { showGetVerifyCode } = nextProps.datas
    if(showGetVerifyCode) {
      setTimeout(function () {
        nextProps.setPropsValue({showGetVerifyCode: false}) //用来隐藏验证码提示
      }, 5000)
    }
  }
  //获取验证码
  getVerifyCode = (calback) => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      const { mobile = ''} = this.props.datas
      const obj = {
        mobile,
        type: '3'
      }
      this.props.getVerificationcode ? this.props.getVerificationcode(obj, calback) : false
    })
  }

  //  提交表单
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      const { mobile = '', email = '', token = '' } = this.props.datas
      if(!validatePassword(values['password'])) {
        message.warn('密码至少为包含字母与数字的6位数字符串。', MESSAGE_DURATION_TIME)
        return false
      }
      if(values['password'] !== values['confirmPassword']) {
        message.warn('两次输入密码不一致。', MESSAGE_DURATION_TIME)
        return false
      }
      if(mobile && !values['code']){
        message.warn('请输入验证码。', MESSAGE_DURATION_TIME)
        return false
      }
      if(values['password'] ) {
        values['password'] = sha256(values['password'])
      }
      if (!err) {
        const obj ={
          ...values,
          accountType: !!mobile ? 'mobile' : 'email',
          mobile,
          email,
          token,
        }
        this.props.formSubmit ? this.props.formSubmit(obj) : false
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { datas = {} } = this.props
    const { mobile = '', showGetVerifyCode = false } = datas

    return (
      <Form onSubmit={this.handleSubmit} style={{margin: '0 auto', width: 280}}>
        {/* 密码 */}
        <FormItem>
          {getFieldDecorator('password', {
            rules: [{ required: false, message: '请输入新密码', whitespace: true }],
          })(
            <Input
              type={'password'}
              style={{height: '40px', fontSize: 16}}
              maxLength={40} placeholder="输入新密码" />
          )}
        </FormItem>
        {/* 确认密码 */}
        <FormItem style={{marginTop: 0}}>
          {getFieldDecorator('confirmPassword', {
            rules: [{ required: false, message: '请确认密码', whitespace: true }],
          })(
            <Input
              type={'password'}
              style={{height: '40px', fontSize: 16}}
              maxLength={40} placeholder="确认密码" />
          )}
        </FormItem>
        {/*验证码*/}
        <FormItem style={{marginTop: 0, display: !!mobile ? 'block': 'none'}}>
          <Row gutter={8}>
            <Col span={14}>
              {getFieldDecorator('code', {
                rules: [{ required: false, message: '请输入验证码' }],
              })(
                <Input placeholder="手机验证码" style={{height: '40px', fontSize: 16, }}/>
              )}
            </Col>
            <Col span={10}>
              <VerificationCode getVerifyCode={this.getVerifyCode.bind(this)} style={{height: '40px', fontSize: 16, color: 'rgba(0,0,0,.65)', width: '100%'}} text={'获取验证码'}/>
            </Col>
          </Row>
        </FormItem>
        {showGetVerifyCode ? (
          <div style={{fontSize: 14, color: '#595959', marginTop: 0, marginBottom: 20}}>验证码已发送至你的手机，请注意查收短信。</div>
        ) : ''}
        {/* 确认 */}
        <FormItem>
          <Button type="primary" htmlType="submit" style={{width: '100%', height: 40}}>确认修改</Button>
        </FormItem>


      </Form>
    );
  }
}

// const WrappedRegistrationForm = Form.create()(RegistrationForm);
export default Form.create()(FormList)

