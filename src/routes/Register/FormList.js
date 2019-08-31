/* eslint-disable react/react-in-jsx-scope */
import { Form, Input, InputNumber, Radio, Switch, DatePicker, Upload, Modal, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox, Button, AutoComplete } from 'antd';
import React from 'react'
import indexStyle from './index.less'
import { NODE_ENV } from '../../globalset/js/constant'
import VerificationCode from '../../components/VerificationCode'
import { validateTel, validateEmail, validatePassword } from '../../utils/verify'
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

  state={
    checkBoxChecked: true, //默认选中
    //表单项失去焦点时是否通过验证标志
    phoneBlurCheck: true,
    emailBlurCheck: true,
    passwordBlurCheck: true,
    submitButtonDisabled: true,
    name: '',
    email: '',
    mobile: '',
    verifycode: '',
    password: '',
  }

  setFormFieldsState(type, e){
    this.setState({
      [type]: e.target.value
    })
  }

  //  重置表单
  formReset = () => {
    this.setState({
      isReset: true,
    })
    this.props.form.resetFields()
  }
  //  提交表单
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      // console.log(values)
      if (!err) {
        if((!this.state.emailBlurCheck && !this.state.phoneBlurCheck) || !this.state.passwordBlurCheck ){
          return false
        }
        if(!values['name']) {
          message.warn('请输入姓名。', MESSAGE_DURATION_TIME)
          return false
        }
        if(!values['email'] ) {
          message.warn('请输入邮箱地址', MESSAGE_DURATION_TIME)
          return false
        }
        if(values['email'] && !validateEmail(values['email'])) {
          message.warn('请输入正确格式的邮箱地址，推荐使用企业邮箱注册。', MESSAGE_DURATION_TIME)
          return false
        }
        if(!values['mobile'] ) {
          message.warn('请输入手机号', MESSAGE_DURATION_TIME)
          return false
        }
        if(values['mobile']){
          if(!validateTel(values['mobile'])) {
            message.warn('请输入正确格式的手机号，目前仅支持中国大陆区域的手机号码。', MESSAGE_DURATION_TIME)
            return false
          }
        }
        if(!values['verifycode']) {
          message.warn('请输入短信验证码。', MESSAGE_DURATION_TIME)
          return false
        }
        if(!values['password']) {
          message.warn('请输入密码', MESSAGE_DURATION_TIME)
          return false
        }
        if(!validatePassword(values['password'])) {
          message.warn('密码至少为包含字母与数字的6位数字符串。', MESSAGE_DURATION_TIME)
          return false
        }
        if(values['password'] ) {
          values['password'] = sha256(values['password'])
        }
        this.props.formSubmit ? this.props.formSubmit(values) : false
      }
    });
  }
  //验证账户,失去焦点
  verifyByBlur = (name) => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(name === 'mobile') { //输入框是账户
        if(!validateTel(values[name])) {
          message.warn('请输入正确格式的手机号，目前仅支持中国大陆区域的手机号码。', MESSAGE_DURATION_TIME)
          this.setState({
            phoneBlurCheck: false
          })
        }else{
          this.setState({
            phoneBlurCheck: true
          })
          this.props.checkAccountRestered({[name]: values[name], accountType: name})
        }
      }else if(name === 'password') {
        if(!validatePassword(values[name])) { //
          message.warn('密码至少为包含字母与数字的6位数字符串', MESSAGE_DURATION_TIME)
          this.setState({
            passwordBlurCheck: false
          })
        }else{
          this.setState({
            passwordBlurCheck: true
          })
        }
      }else if(name === 'email') {
        if(!validateEmail(values[name])) {
          message.warn('请输入正确格式的邮箱地址，推荐使用企业邮箱注册。', MESSAGE_DURATION_TIME)
          this.setState({
            emailBlurCheck: false
          })
        }else{
          this.setState({
            emailBlurCheck: true
          })
          this.props.checkAccountRestered({[name]: values[name], accountType: name})
        }
      } else {
      }
    });
  }
  //选中服务选项
  checkBoxOnChange = () => {
    this.setState({
      checkBoxChecked: !this.state.checkBoxChecked
    })
  }
  //获取验证码
  getVerifyCode = (calback) => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!validateTel(values['mobile'])) {
        message.warn('请输入正确的手机号', MESSAGE_DURATION_TIME)
        return false
      }
      const obj = {
        mobile: values['mobile'],
        type: '1'
      }
      this.props.getVerificationcode ? this.props.getVerificationcode(obj, calback) : false
      // calback && typeof calback === 'function' ? calback() : ''
    })
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const { name, email, mobile, verifycode, password, checkBoxChecked, submitButtonDisabled } = this.state
    let submitButtonDisabledLocal = submitButtonDisabled
    if(name && validateEmail(email) && validateTel(mobile) && verifycode && validatePassword(password) && checkBoxChecked) {
      submitButtonDisabledLocal = false
    }
    // console.log(NODE_ENV)
    // debugger
    const hrefService = NODE_ENV == 'development'?'http://localhost/#/agreement/service':window.location.host.indexOf('prerelease') !== -1?'http://prerelease.lingxi.new-di.com/#/agreement/service':'https://lingxi.di-an.com/#/agreement/service',
    hrefPrivacy = NODE_ENV == 'development'?'http://localhost/#/agreement/privacy':window.location.host.indexOf('prerelease') !== -1?'http://prerelease.lingxi.new-di.com/#/agreement/privacy':'https://lingxi.di-an.com/#/agreement/privacy'
    return (
      <Form onSubmit={this.handleSubmit} style={{margin: '0 auto', width: 272}}>
        {/* 姓名 */}
        <FormItem>
          {getFieldDecorator('name', {
            rules: [{ required: false, message: '请输入姓名', whitespace: true }],
          })(
            <Input
              onChange={this.setFormFieldsState.bind(this, 'name')}
              style={{height: '40px', fontSize: 16}}
              maxLength={40} placeholder="姓名" />
          )}
        </FormItem>
        {/* 邮箱 */}
        <FormItem style={{marginTop: 0}}>
          {getFieldDecorator('email', {
            rules: [{ required: false, message: '请输入邮箱', whitespace: true }],
          })(
            <Input
              onChange={this.setFormFieldsState.bind(this, 'email')}
              style={{height: '40px', fontSize: 16}}
              maxLength={40} placeholder="邮箱"
              onBlur = {this.verifyByBlur.bind(null, 'email')}
            />
          )}
        </FormItem>
        {/* 电话 */}
        <FormItem style={{marginTop: 0}}>
          {getFieldDecorator('mobile', {
            rules: [{ required: false, message: '请输入手机号', whitespace: true }],
          })(
            <Input
              onChange={this.setFormFieldsState.bind(this, 'mobile')}
              style={{height: '40px', fontSize: 16}}
              maxLength={40} placeholder="手机号"
              onBlur = {this.verifyByBlur.bind(null, 'mobile')}
            />
          )}
        </FormItem>
        {/*验证码*/}
        <FormItem>
          <Row gutter={8}>
            <Col span={14}>
              {getFieldDecorator('verifycode', {
                rules: [{ required: false, message: '请输入验证码' }],
              })(
                <Input placeholder="验证码" style={{height: '40px', fontSize: 16, }} onChange={this.setFormFieldsState.bind(this, 'verifycode')}/>
              )}
            </Col>
            <Col span={10}>
              <VerificationCode getVerifyCode={this.getVerifyCode.bind(this)} style={{height: '40px', fontSize: 16, color: 'rgba(0,0,0,.65)', width: '100%'}} text={'获取验证码'}/>
              {/*<Button style={{height: '40px',fontSize: 16,color: 'rgba(0,0,0,.65)', width: '100%'}}>获取验证码</Button>*/}
            </Col>
          </Row>
        </FormItem>
        {/* 密码 */}
        <FormItem style={{marginTop: 0}}>
          {getFieldDecorator('password', {
            rules: [{ required: false, message: '请输入密码', whitespace: true }],
          })(
            <Input
              onChange={this.setFormFieldsState.bind(this, 'password')}
              style={{height: '40px', fontSize: 16}}
              maxLength={40} placeholder="密码(数字与字母组合，至少6位)"
              type={'password'}
              onBlur = {this.verifyByBlur.bind(null, 'password')}
            />
          )}
        </FormItem>
        {/* agrement */}
        <div style={{marginTop: -4}}>
          <Checkbox
            checked={this.state.checkBoxChecked}
            onChange={this.checkBoxOnChange}
          />
           <span style={{color: '#000', fontSize: 14}}>同意 灵犀《<a href={hrefService} target='view_window' style={{color: '#1890FF', cursor: 'pointer'}}> 服务协议</a> <a href={hrefPrivacy} target='view_window' style={{color: '#1890FF', cursor: 'pointer'}}> 隐私协议</a>》</span>
        </div>
        {/* 确认 */}
        <FormItem style={{marginTop: 24}}>
          <Button type="primary" disabled={submitButtonDisabledLocal} htmlType="submit" style={{width: '100%', height: 40, fontSize: 16}}>注册</Button>
        </FormItem>
      </Form>
    );
  }
}

// const WrappedRegistrationForm = Form.create()(RegistrationForm);
export default Form.create()(FormList)

