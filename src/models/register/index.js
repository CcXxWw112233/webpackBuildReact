import {
  formSubmit,
  requestVerifyCode,
  checkAccountRestered,
  wechatSignupBindLogin
} from '../../services/register'
import { isApiResponseOk } from '../../utils/handleResponseData'
import { message } from 'antd'
import Cookies from 'js-cookie'
import { MESSAGE_DURATION_TIME } from '../../globalset/js/constant'
import { routerRedux } from 'dva/router'
import queryString from 'query-string'
import { createDefaultOrg } from '../../services/technological/noviceGuide'

export default {
  namespace: 'register',
  state: [],
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        message.destroy()
        if (location.pathname === '/register') {
        } else {
          localStorage.removeItem('wechat')
        }
      })
    }
  },
  effects: {
    *formSubmit({ payload }, { select, call, put }) {
      //提交表单
      const { mobile, email } = payload
      console.log(payload)
      let res = yield call(formSubmit, payload)

      if (isApiResponseOk(res)) {
        message.success(res.message, MESSAGE_DURATION_TIME)
        yield put(
          routerRedux.push({
            pathname: '/registerSuccess',
            search: queryString.stringify({ mobile, email, type: 'register' })
          })
        )
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    *getVerificationcode({ payload }, { select, call, put }) {
      //获取验证码
      const { data, calback } = payload
      calback && typeof calback === 'function' ? calback() : ''
      let res = yield call(requestVerifyCode, data)
      if (isApiResponseOk(res)) {
        message.success(res.message, MESSAGE_DURATION_TIME)
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    *routingJump({ payload }, { call, put }) {
      const { route } = payload
      yield put(routerRedux.push(route))
    },
    *checkAccountRestered({ payload }, { select, call, put }) {
      const { mobile, email, accountType } = payload
      let res = yield call(checkAccountRestered, payload)
      if (isApiResponseOk(res)) {
        if (res.data) {
          message.warn(
            accountType === 'mobile' ? '该手机号已被注册' : '该邮箱已被注册',
            MESSAGE_DURATION_TIME
          )
        }
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    *wechatSignupBindLogin({ payload }, { select, call, put }) {
      let res = yield call(wechatSignupBindLogin, payload)
      // debugger
      if (isApiResponseOk(res)) {
        const tokenArray = res.data.split('__')
        Cookies.set('Authorization', tokenArray[0], { expires: 30, path: '' })
        Cookies.set('refreshToken', tokenArray[1], { expires: 30, path: '' })
        Cookies.set('is401', false, { expires: 30, path: '' })
        // debugger
        const res2 = yield call(createDefaultOrg)
        if (isApiResponseOk(res2)) {
          yield put(routerRedux.push('/technological/simplemode/home')) //首次登录跳转极简模式
        } else {
          message.error(res2.message, MESSAGE_DURATION_TIME)
        }
        // yield put(routerRedux.push('/noviceGuide'))
      } else {
        message.error(res.message)
      }
    }
  },

  reducers: {
    delete(state, { payload: id }) {
      return state.filter(item => item.id !== id)
    }
  }
}
