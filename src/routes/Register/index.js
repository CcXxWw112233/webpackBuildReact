import React from 'react'
import { connect } from 'dva'
import QueueAnim from 'rc-queue-anim'
import FormListBind from './FormListBind'
import FormList from './FormList'
import globalClassNmae from '../../globalset/css/globalClassName.less'
import TopContent from '../../components/TopContent'
import BottomContent from '../../components/BottomContent'
import Copyright from '../../components/Copyright'
import { platformNouns } from '../../globalset/clientCustorm'
const getEffectOrReducerByName = name => `register/${name}`
const juge = localStorage.getItem('wechat')
  ? localStorage.getItem('wechat')
  : ''
const bindKey = localStorage.getItem('wechatBindKey')
  ? localStorage.getItem('wechatBindKey')
  : ''
const Register = options => {
  const { dispatch } = options
  //传给表单
  const formListProps = {
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
    checkAccountRestered(data) {
      // console.log(data)
      dispatch({
        type: getEffectOrReducerByName('checkAccountRestered'),
        payload: {
          ...data
        }
      })
    },
    wechatSignupBindLogin(data) {
      dispatch({
        type: getEffectOrReducerByName('wechatSignupBindLogin'),
        payload: {
          ...data,
          key: bindKey
        }
      })
    }
  }
  //传给底部
  const BottomContentProps = {
    routingJump(path) {
      dispatch({
        type: getEffectOrReducerByName('routingJump'),
        payload: {
          route: path
        }
      })
    }
  }
  const bindAccount = () => {
    localStorage.setItem('bindType', 'wechat')
    // NODE_ENV != 'development'?window.location.href=('http://localhost/#/login'):window.location.host.indexOf('lingxi') !== -1?window.location.href='https://lingxi.di-an.com/#/login':window.location.href='http://www.new-di.com/#/login'
    dispatch({
      type: 'register/routingJump',
      payload: {
        route: '/login'
      }
    })
  }
  if (juge == 'wechatRegister') {
    return (
      <div className={globalClassNmae.page_style_2}>
        <QueueAnim type="top">
          <div key={'reigster'}>
            <div
              style={{
                maxWidth: 472,
                margin: '0 auto',
                width: '100%',
                background: '#FFFFFF',
                border: '1px solid rgba(217,217,217,1)',
                borderRadius: '4px'
              }}
            >
              <TopContent text={'欢迎加入'} productName={`${platformNouns}`} />
              <FormListBind {...formListProps} />
              {/* <BottomContent {...BottomContentProps} type={'register'}/> */}
              <div
                style={{
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
                }}
              >
                <span style={{ cursor: 'pointer' }} onClick={bindAccount}>
                  已有账户,直接绑定
                </span>
              </div>
            </div>
            <Copyright />
          </div>
        </QueueAnim>
      </div>
    )
  } else {
    return (
      <div className={globalClassNmae.page_style_2}>
        <QueueAnim type="top">
          <div key={'reigster'}>
            <div
              style={{
                maxWidth: 472,
                margin: '0 auto',
                width: '100%',
                background: '#FFFFFF',
                border: '1px solid rgba(217,217,217,1)',
                borderRadius: '4px'
              }}
            >
              <TopContent text={'欢迎加入'} productName={`${platformNouns}`} />
              <FormList {...formListProps} />
              <BottomContent {...BottomContentProps} type={'register'} />
            </div>
            <Copyright />
          </div>
        </QueueAnim>
      </div>
    )
  }
}

// export default Products;
export default connect(({ login }) => ({
  login
}))(Register)
