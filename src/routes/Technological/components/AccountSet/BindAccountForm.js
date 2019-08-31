/* eslint-disable import/first,react/react-in-jsx-scope */
import React from 'react'
import { Form, Popconfirm, Input, InputNumber, Radio, Switch, DatePicker, Upload, Modal, Tooltip, Icon, Alert, Select, Row, Col, Checkbox, Button, AutoComplete, message } from 'antd';
import moment from 'moment';
import indexStyle from './index.less'
import VerificationCodeTwo from '../../../../components/VerificationCodeTwo'
import globalStyles from '../../../../globalset/css/globalClassName.less'
import {validateTel, validateEmail} from "../../../../utils/verify";
import {MESSAGE_DURATION_TIME} from "../../../../globalset/js/constant";

const FormItem = Form.Item;
const Option = Select.Option;
const AutoCompleteOption = AutoComplete.Option;
const { TextArea } = Input;
const RadioGroup = Radio.Group;
const RangePicker = DatePicker.RangePicker

class BindAccountForm extends React.Component {
  state = {
    uploading: false, //是否正在上传
    avatarUrl: '',
    isMobile: false,
    isHasCode: false,
    isEmail: false,
    isWechat: false
  }
  // 提交表单
  formButtonSubmit(type) {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if(type === 'email') {
          this.props.checkEmailIsRegisted({
            email: values['email']
          })
        }else if(type === 'mobile') {
          this.props.checkMobileIsRegisted({
            mobile: values['mobile'],
            code: values['code']
          })
        } else if(type === 'wechat') {
          this.props.dispatch({
            type: 'accountSet/unBindWechat'
          })
        }
      }
    });
  }
  //获取验证码
  getVerifyCode = ({calback}) => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!validateTel(values['mobile'])) {
        message.warn('请输入正确的手机号', MESSAGE_DURATION_TIME)
        return false
      }
      const obj = {
        mobile: values['mobile'],
        type: '3'
      }
      this.props.getVerificationcode ? this.props.getVerificationcode(obj, calback) : false
    })
  }
  mobileChange(e) {
    const value = e.target.value
    const isMobile = validateTel(value)
    this.setState({
      isMobile
    })
  }
  codeChange(e){
    const value = e.target.value
    this.setState({
      isHasCode: !!value
    })
  }
  emailChange(e) {
    const value = e.target.value
    const isEmail = validateEmail(value)
    this.setState({
      isEmail
    })
  }
  wechatChange(e) {
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const { model = {} } = this.props
    const { datas = {} } = model
    const { userInfo = {} } = datas
    const {
      wechat,
      is_bind
    } = userInfo
    // 表单样式设置
    const formItemLayout = {
      labelCol: {
        xs: { span: 7 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 10 },
        sm: { span: 10 },
      },
    };
    const { email, mobile } = {}
    const { isMobile, isHasCode, isEmail, isWechat } = this.state
    return (
      <div>
        {/*修改邮箱*/}
        <Form layout="inline" onSubmit={this.handleSubmit} style={{padding: '20px 0', width: 600, display: 'flex'}}>
          {/* 邮箱 */}
          <FormItem
            {...formItemLayout}
            label={(
              <span style={{fontSize: 16}}>
                邮箱
              </span>
            )}
          >
            {getFieldDecorator('email', {
              initialValue: email || undefined,
              rules: [{ required: false, message: '请输入邮箱', whitespace: true }],
            })(
              <Input placeholder="" className={indexStyle.personInfoInput}b onChange={this.emailChange.bind(this)}/>
            )}
          </FormItem>
          {/* 确认 */}
          <FormItem
          >
            <Button type="primary" onClick={this.formButtonSubmit.bind(this, 'email')} style={{height: 40, marginLeft: 48}} disabled={!isEmail}>发送邮件验证</Button>
          </FormItem>
        </Form>
        <Alert
          message="更换邮箱绑定操作提示"
          description="输入新的邮箱地址，点击【发送邮件验证】按钮，在邮箱中点击修改完成确认按钮或链接即可完成修改。"
          type="info"
          showIcon
          closable
          style={{marginLeft: 106}}
        />
        {/*修改手机*/}
        <Form layout="inline" onSubmit={this.handleSubmit} style={{padding: '20px 0', width: 600, display: 'flex'}}>
          {/* 手机 */}
          <FormItem
            {...formItemLayout}
            style={{marginLeft: 12}}
            label={(
              <span style={{fontSize: 16}}>
                手机
              </span>
            )}
          >
            {getFieldDecorator('mobile', {
              initialValue: mobile || undefined,
              rules: [{ required: false, message: '', whitespace: false }],
            })(
              <div className={indexStyle.personInfoInput}>
                <Input placeholder="" style={{width: 160, height: 40}} onChange={this.mobileChange.bind(this)}/>
              </div>
            )}
          </FormItem>

          {/* 验证码 */}
          <div style={{position: 'relative', marginTop: 0, marginLeft: -32, width: 240}}>
            <FormItem >
              {getFieldDecorator('code', {
                rules: [{ required: false, message: '请输入验证码', whitespace: true }],
              })(
                <Input
                  style={{height: '40px', fontSize: 16, color: '#8C8C8C', width: 240}}
                  maxLength={10} onChange={this.codeChange.bind(this)}
                />
              )}
            </FormItem>
              <div style={{position: 'absolute', top: 0, right: 0, color: '#bfbfbf', height: '40px', lineHeight: '40px', padding: '0 16px 0 16px', cursor: 'pointer', display: 'flex'}}>
                <div style={{height: 20, marginTop: 10, width: 1, backgroundColor: '#bfbfbf', }}></div>
                {/*<div>获取验证码</div>*/}
                <VerificationCodeTwo getVerifyCode={this.getVerifyCode.bind(this)} className={isMobile ? globalStyles.link_mouse : ''} style={{height: '40px', fontSize: 16, width: 100, textAlign: 'center'}} text={'获取验证码'}/>
              </div>
          </div>
          {/* 确认 */}
          <FormItem>
            <Button type="primary" htmlType="submit" onClick={this.formButtonSubmit.bind(this, 'mobile')} style={{height: 40, marginLeft: 12, }} disabled={!isMobile || !isHasCode}>修改</Button>
          </FormItem>
        </Form>
        {/* 微信 */}
        <Form layout="inline" onSubmit={this.handleSubmit} style={{padding: '20px 0', width: 600, display: 'flex'}}>
          <FormItem
            {...formItemLayout}
            label={(
              <span style={{fontSize: 16}}>
                微信
              </span>
            )}
          >
            {getFieldDecorator('wechat', {
              initialValue: wechat,
              rules: [{ required: false, message: '请输入微信', whitespace: true }],
            })(
              <Input value={is_bind =='1'?wechat: ''} disabled='true' placeholder="" className={indexStyle.personInfoInput} onChange={this.wechatChange.bind(this)}/>
            )}
          </FormItem>
          {/* 确认 */}
          <FormItem
          >
            {
              is_bind === '1'? (
<Popconfirm onConfirm={this.formButtonSubmit.bind(this, 'wechat')} title="Are you sure？" icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}>
                  <Button type="primary" style={{height: 40, marginLeft: 48}} disabled={isWechat}>解除绑定</Button>
                </Popconfirm>
):<div></div>
                // <Button type="primary" onClick={() => location.href='http://localhost/#/login'} style={{height: 40, marginLeft: 48}} disabled={isWechat}>绑定</Button> 
            }
          </FormItem>
        </Form>
      </div>
    );
  }
}

// const WrappedRegistrationForm = Form.create()(RegistrationForm);
export default Form.create()(BindAccountForm)


