/* eslint-disable react/react-in-jsx-scope */
import { Form, Input, Icon, Button, message } from 'antd'
import React from 'react'
import indexStyle from './index.less'
import globalStyles from '../../globalset/css/globalClassName.less'
import VerificationCodeTwo from '../../components/VerificationCodeTwo'
import {
  validateTel,
  validateEmail,
  validatePassword
} from '../../utils/verify'
import { MESSAGE_DURATION_TIME } from '../../globalset/js/constant'
import sha256 from 'js-sha256'

const FormItem = Form.Item

class FormList extends React.Component {
  state = {
    isMobile: false //验证输入过程是手机号的时候,是否正确手机号，用来判断是否获取验证码按钮 样式
  }

  //  重置表单
  formReset = () => {
    this.setState({
      isReset: true
    })
    this.props.form.resetFields()
  }

  //  提交表单
  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { loginType, model = {} } = this.props
        const {
          datas: { is_show_pic_verify_code }
        } = model
        if (
          !validateTel(values['account']) &&
          !validateEmail(values['account'])
        ) {
          //输入既不满足手机号又不满足邮箱
          message.warn('请输入正确的手机号或邮箱。', MESSAGE_DURATION_TIME)
          return false
        }
        if (loginType === 'password') {
          if (!validatePassword(values['password'])) {
            message.warn(
              '密码至少为包含字母与数字的6位数字符串。',
              MESSAGE_DURATION_TIME
            )
            return false
          }
        } else {
          if (!values['verifycode']) {
            message.warn('请输入短信验证码。', MESSAGE_DURATION_TIME)
            return false
          }
        }
        if (is_show_pic_verify_code && loginType === 'password') {
          //需要输入图片验证码
          if (!values['verifycode']) {
            message.warn('请输入图片验证码。', MESSAGE_DURATION_TIME)
            return false
          }
        }
        if (values['password']) {
          values['password'] = sha256(values['password'])
        }
        this.props.formSubmit ? this.props.formSubmit(values) : false
      }
    })
  }

  //验证账户,失去焦点
  verifyByBlur = name => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (name === 'account') {
        //输入框是账户
        if (!validateTel(values[name]) && !validateEmail(values[name])) {
          //输入既不满足手机号又不满足邮箱
          message.warn('请输入正确的手机号或邮箱。', MESSAGE_DURATION_TIME)
        }
        if (validateTel(values[name])) {
          //如果用户输入的是手机号
        } else {
        }
      } else if (name === 'password') {
      } else if (name === 'verifycode') {
      } else {
      }
    })
  }
  //验证账户，输入过程
  verifyAccountByChange = (e, name) => {
    const value = e.target.value
    let loginType = this.state.loginType
    if (name === 'account') {
      //输入框是账户
      let isMobile = !!validateTel(value)
      this.setState({
        isMobile
      })
    }
  }

  //获取验证码
  getVerifyCode = ({ calback }) => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!values['account']) {
        return false
      }
      if (!validateTel(values['account'])) {
        message.warn('请输入正确的手机号', MESSAGE_DURATION_TIME)
        return false
      }
      this.setState({
        loginType: 'verifycode',
        verifyCodeButtonClicked: true
      })
      const obj = {
        mobile: values['account'],
        type: '2'
      }
      this.props.getVerificationcode
        ? this.props.getVerificationcode(obj, calback)
        : false
    })
  }
  routingJump(path) {
    this.props.routingJump(path)
  }

  //图片验证码
  changePicVerifySrc = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'login/changePicVerifySrc',
      payload: {}
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { isMobile } = this.state
    const { loginType, model = {} } = this.props
    const {
      datas: { pic_verify_src, is_show_pic_verify_code }
    } = model
    // console.log('ssss',{
    //   pic_verify_src, is_show_pic_verify_code
    // })
    return (
      <Form
        onSubmit={this.handleSubmit}
        style={{ margin: '0 auto', width: 272 }}
      >
        {/* 输入账户 */}
        <FormItem>
          {getFieldDecorator('account', {
            rules: [
              { required: false, message: '请输入账号', whitespace: true }
            ]
          })(
            <Input
              style={{ height: '40px', fontSize: 16 }}
              prefix={
                <Icon type="user" style={{ color: '#8C8C8C', fontSize: 16 }} />
              }
              maxLength={40}
              // placeholder="手机号/邮箱"
              placeholder={
                loginType === 'password' ? '手机号/邮箱' : '输入手机号'
              }
              onBlur={this.verifyByBlur.bind(null, 'account')}
              onChange={e => this.verifyAccountByChange(e, 'account')}
            />
          )}
        </FormItem>

        {/* 验证码 */}
        <div style={{ position: 'relative', marginTop: 0 }}>
          <FormItem>
            {getFieldDecorator(loginType, {
              rules: [
                { required: false, message: '请输入验证码', whitespace: true }
              ]
            })(
              <Input
                style={{ height: '40px', fontSize: 16, color: '#8C8C8C' }}
                prefix={
                  <Icon
                    type="lock"
                    style={{ color: '#8C8C8C', fontSize: 16 }}
                  />
                }
                maxLength={32}
                placeholder={loginType === 'password' ? '密码' : '验证码'}
                type={loginType === 'password' ? 'password' : 'text'}
              />
            )}
          </FormItem>
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              color: '#bfbfbf',
              height: '40px',
              lineHeight: '40px',
              padding: '0 10px 0 10px',
              cursor: 'pointer',
              display: 'flex'
            }}
          >
            <div
              style={{
                height: 20,
                marginTop: 10,
                width: 1,
                backgroundColor: '#bfbfbf'
              }}
            ></div>
            {loginType === 'password' ? (
              <div
                className={globalStyles.link_mouse}
                onClick={this.routingJump.bind(this, '/retrievePassword')}
                style={{
                  height: '36px',
                  marginTop: 2,
                  backgroundColor: '#ffffff',
                  fontSize: 16,
                  width: 100,
                  lineHeight: '36px',
                  textAlign: 'center'
                }}
              >
                忘记密码
              </div>
            ) : (
              <VerificationCodeTwo
                getVerifyCode={this.getVerifyCode.bind(this)}
                className={isMobile ? globalStyles.link_mouse : ''}
                style={{
                  height: '36px',
                  marginTop: 2,
                  backgroundColor: '#ffffff',
                  fontSize: 16,
                  width: 100,
                  lineHeight: '36px',
                  textAlign: 'center'
                }}
                text={'获取验证码'}
              />
            )}
          </div>
        </div>

        {is_show_pic_verify_code && loginType === 'password' && (
          <div style={{ display: 'flex' }}>
            <FormItem>
              {getFieldDecorator('verifycode', {
                rules: [
                  { required: false, message: '验证码', whitespace: true }
                ]
              })(
                <Input
                  style={{
                    height: '40px',
                    width: 100,
                    fontSize: 16,
                    color: '#8C8C8C'
                  }}
                  maxLength={8}
                  placeholder={'验证码'}
                />
              )}
            </FormItem>
            <img
              style={{
                width: 100,
                height: 40,
                margin: '0 10px',
                border: '1px solid rgba(0,0,0,0.15)',
                borderRadius: 4
              }}
              src={pic_verify_src}
            ></img>
            <div
              style={{
                color: '#1890FF',
                cursor: 'pointer',
                height: '40px',
                lineHeight: '40px',
                textAlign: 'center'
              }}
              onClick={this.changePicVerifySrc}
            >
              换一张
            </div>
          </div>
        )}

        {/* 确认 */}
        <FormItem>
          <Button
            type="primary"
            htmlType="submit"
            style={{ width: '100%', height: 40, fontSize: 16 }}
          >
            登录
          </Button>
        </FormItem>
      </Form>
    )
  }
}

// const WrappedRegistrationForm = Form.create()(RegistrationForm);
export default Form.create()(FormList)
