import React from 'react';
import { connect } from 'dva';
import QueueAnim from 'rc-queue-anim'
import { Row, Col, Tooltip, Card } from 'antd'
import { NODE_ENV } from '../../globalset/js/constant'
import src from '../../assets/wechatCode.html'
import FormList from './FormList'
import FormListBind from './FormListBind'
import globalClassName from '../../globalset/css/globalClassName.less'
import TopContent from '../../components/TopContent'
import BottomContent from '../../components/BottomContent'
import Copyright from '../../components/Copyright'
import indexStyles from './index.less'
import sha256 from 'js-sha256'


const juge = localStorage.getItem('bindType') ? localStorage.getItem('bindType') : ''
const getEffectOrReducerByName = name => `login/${name}`
class Login extends React.Component {

  state = {
    loginType: 'password', //登录方式,验证码登录
    bindType: 'verifycode',
    bindKey: ''
  }
  componentDidMount() {
    if (juge === 'wechat') {
      this.setState({
        loginType: 'wechatBind'
      })
    }
    window.onmessage = e => {
      if (e.data.isBindWecaht === '0') {
        this.setState({
          loginType: 'wechatBind'
        })
      } else {
        if (!e.data || !e.data.token) {
          return
        }
        let token = e.data.token
        this.props.dispatch({
          type: getEffectOrReducerByName('wechatLogin'),
          payload: {
            token
          }
        })
      }
      if (e.data.key) {
        localStorage.setItem('wechatBindKey', e.data.key)
        this.setState({
          bindKey: e.data.key
        })
      }

    }

  }


  setLoginType() {
    const { loginType } = this.state
    this.setState({
      loginType: loginType === 'password' ? 'verifycode' : 'password'
    })
  }
  wechatLogin() {
    this.setState({
      loginType: 'wechat'
    })
  }
  reloadCode() {
    // console.log(window.location)
    //
  }
  passwordLogin() {
    this.setState({
      loginType: 'password'
    })
  }
  changeBindWay() {
    this.setState({
      bindType: this.state.bindType === 'password' ? 'verifycode' : 'password'
    })
  }
  bindRegister() {
    // NODE_ENV == 'development'?window.location.href='http://localhost/#/register':window.location.host.indexOf('lingxi') !== -1?window.location.href='https://lingxi.di-an.com/#/register':window.location.href='http://www.new-di.com/#/register'
    this.props.dispatch({
      type: 'login/routingJump',
      payload: {
        route: `/register`
      }
    })
    localStorage.setItem('wechat', 'wechatRegister')
  }
  render() {
    const { dispatch, login = {} } = this.props
    const { loginType, bindKey } = this.state
    const model = login
    //传给表单
    const formListProps = {
      dispatch,
      model,
      formSubmit(data) {
        dispatch({
          type: getEffectOrReducerByName('formSubmit'),
          payload: data
        })
      },
      getVerificationcode(data, calback) {
        dispatch({
          type: getEffectOrReducerByName('getVerificationcode'),
          payload: {
            data,
            calback
          }
        })
      },
      wechatAccountBind(data) {
        dispatch({
          type: getEffectOrReducerByName('wechatAccountBind'),
          payload: { ...data, key: bindKey }
        })
      }
    }
    //传给底部
    const BottomContentProps = {
      routingJump(path) {
        dispatch({
          type: getEffectOrReducerByName('routingJump'),
          payload: {
            route: path,
          },
        })
      }
    }
    const routingJump = (path) => {
      dispatch({
        type: getEffectOrReducerByName('routingJump'),
        payload: {
          route: path,
        },
      })
    }

    if (this.state.loginType === 'wechat') {
      return (
        <div className={globalClassName['page_style_1']}>
          <QueueAnim type="top">
            <div key={'login'}>
              <div style={{
                maxWidth: 472, margin: '0 auto', width: '100%', background: '#FFFFFF',
                border: '1px solid rgba(217,217,217,1)',
                borderRadius: '4px'
              }}>
                <TopContent text={'欢迎来到'} productName={'聆悉'} />
                <div>
                  <iframe id='wechatCode' style={{ marginLeft: '120px' }} frameBorder="0" src={src} width='211px' height='212px'></iframe>
                  <div style={{
                    margin: '8px auto 16px',
                    width: '212px',
                    height: '20px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontFamily: 'PingFangSC-Regular',
                    fontWeight: 400,
                    color: '#D9D9D9'
                  }}>使用微信二维码登陆</div>
                  <div style={{
                    margin: '0 auto',
                    width: '271px',
                    height: '52px',
                    borderTop: '1px solid #E8E8E8',
                    textAlign: 'center',
                    lineHeight: '56px',
                    fontSize: '14px',
                    fontFamily: 'PingFangSC-Regular',
                    fontWeight: 400,
                    marginBottom: '30px',
                    color: '#1890FF'
                  }}><span style={{ cursor: 'pointer' }} onClick={this.passwordLogin.bind(this)}>密码登陆</span></div>
                </div>
              </div>
              <Copyright />
            </div>
          </QueueAnim>
        </div>
      )
    } else if (this.state.loginType === 'password') {
      return (
        <div className={globalClassName['page_style_1']}>
          <QueueAnim type="top">
            <div key={'login'}>
              <div style={{
                maxWidth: 472, margin: '0 auto', width: '100%', background: '#FFFFFF',
                border: '1px solid rgba(217,217,217,1)',
                borderRadius: '4px'
              }}>
                <TopContent text={'欢迎来到'} productName={'聆悉'} />
                <FormList {...formListProps} setLoginType={this.setLoginType.bind(this)} loginType={loginType} routingJump={routingJump} />
                <div className={indexStyles.bottomWhole}>
                  <div className={indexStyles.bottomWholeLeft} style={{ marginTop: -8 }}>
                    {/* <Tooltip placement="top" title={'即将上线'}>
                      <i className={globalClassName.authTheme}
                        style={{ fontStyle: 'normal', fontSize: 24, color: '#bfbfbf', cursor: 'pointer', }}>&#xe6be;</i>
                    </Tooltip> */}
                    <i onClick={this.wechatLogin.bind(this)} className={globalClassName.authTheme} style={{
                      fontStyle: 'normal',
                      fontSize: 24,
                      color: '#78b63b',
                      cursor: 'pointer',
                      marginLeft: 6,
                      marginTop: -6
                    }}>&#xe634;</i>
                    {/* <Tooltip placement="top" title={'即将上线'}>
                      <i className={globalClassName.authTheme} style={{
                        fontStyle: 'normal',
                        fontSize: 24,
                        color: '#bfbfbf',
                        cursor: 'pointer',
                        marginLeft: 6,
                        marginTop: -6
                      }}>&#xe6c1;</i>
                    </Tooltip> */}
                  </div>
                  <div className={indexStyles.bottomWholeRight}>
                    <p><span onClick={this.setLoginType.bind(this)}>{loginType === 'password' ? '验证码登录' : '密码登陆'}</span><span>|</span><span
                      onClick={routingJump.bind(null, '/register')}>注册账户</span></p>
                  </div>
                </div>
                {/*<BottomContent {...BottomContentProps} type={'login'}/>*/}
              </div>
              <Copyright />
            </div>
          </QueueAnim>
        </div>
      )
    } else if (this.state.loginType === 'wechatBind') {
      return (
        <div className={globalClassName['page_style_1']}>
          <QueueAnim type="top">
            <div key={'login'}>
              <div style={{
                maxWidth: 472, margin: '0 auto', width: '100%', background: '#FFFFFF',
                border: '1px solid rgba(217,217,217,1)',
                borderRadius: '4px'
              }}>
                <TopContent text={'欢迎来到'} productName={'聆悉'} />
                <FormListBind bindType={this.state.bindType} {...formListProps} setLoginType={this.setLoginType.bind(this)} loginType={loginType} routingJump={routingJump} />
                <div style={{
                  margin: '8px auto 100px',
                  width: '266px',
                  height: '20px',
                  fontSize: '14px',
                  fontFamily: 'PingFangSC-Regular',
                  fontWeight: 400,
                  color: '#1890FF'
                }}>
                  <div>
                    <span style={{ cursor: 'pointer', float: 'left' }} onClick={this.changeBindWay.bind(this)}>{this.state.bindType === 'verifycode' ? '账户密码绑定' : '验证码绑定'}</span>
                    <span style={{ cursor: 'pointer', float: 'right' }} onClick={this.bindRegister.bind(this)}>注册账户并绑定微信</span>
                  </div>

                </div>
              </div>
              <Copyright />
            </div>
          </QueueAnim>
        </div>
      )
    } else {
      return (
        <div className={globalClassName['page_style_1']}>
          <QueueAnim type="top">
            <div key={'login'}>
              <div style={{
                maxWidth: 472, margin: '0 auto', width: '100%', background: '#FFFFFF',
                border: '1px solid rgba(217,217,217,1)',
                borderRadius: '4px'
              }}>
                <TopContent text={'欢迎来到'} productName={'聆悉'} />
                <FormList {...formListProps} setLoginType={this.setLoginType.bind(this)} loginType={loginType} routingJump={routingJump} />
                <div className={indexStyles.bottomWhole}>
                  <div className={indexStyles.bottomWholeLeft} style={{ marginTop: -8 }}>
                    {/* <Tooltip placement="top" title={'即将上线'}>
                      <i className={globalClassName.authTheme}
                        style={{ fontStyle: 'normal', fontSize: 24, color: '#bfbfbf', cursor: 'pointer', }}>&#xe6be;</i>
                    </Tooltip> */}
                    <i onClick={this.wechatLogin.bind(this)} className={globalClassName.authTheme} style={{
                      fontStyle: 'normal',
                      fontSize: 24,
                      // color: '#bfbfbf',
                      color: '#78b63b',
                      cursor: 'pointer',
                      marginLeft: 6,
                      marginTop: -6
                    }}>&#xe6c2;</i>
                    {/* <Tooltip placement="top" title={'即将上线'}>
                      <i className={globalClassName.authTheme} style={{
                        fontStyle: 'normal',
                        fontSize: 24,
                        color: '#bfbfbf',
                        cursor: 'pointer',
                        marginLeft: 6,
                        marginTop: -6
                      }}>&#xe6c1;</i>
                    </Tooltip> */}
                  </div>
                  <div className={indexStyles.bottomWholeRight}>
                    <p><span onClick={this.setLoginType.bind(this)}>{loginType === 'password' ? '验证码登录' : '密码登陆'}</span><span>|</span><span
                      onClick={routingJump.bind(null, '/register')}>注册账户</span></p>
                  </div>
                </div>
                {/*<BottomContent {...BottomContentProps} type={'login'}/>*/}
              </div>
              <Copyright />
            </div>
          </QueueAnim>
        </div>
      )
    }
  }
};

// export default Products;
export default connect(({ login }) => ({
  login,
}))(Login);

