import { formSubmit, requestVerifyCode, initConfirm } from '../../services/resetPassword'
import { isApiResponseOk } from '../../utils/handleResponseData'
// import  '../../components/Message'
import { message } from 'antd'
import { MESSAGE_DURATION_TIME } from "../../globalset/js/constant";
import { routerRedux, Route } from "dva/router";
import queryString from 'query-string';
import globalStyles from '../../globalset/css/globalClassName.less'
import MessageRoute from '../../components/MessageRoute'

let dispatchGlobalThisModel
export default {
  namespace: 'resetPassword',
  state: [],
  subscriptions: {
    setup({ dispatch, history }) {
      dispatchGlobalThisModel = dispatch
      history.listen((location) => {
        message.destroy()
        if (location.pathname === '/resetPassword') {
          dispatch({
            type: 'updateDatas',
            payload: queryString.parse(location.search)
          })
          const param = queryString.parse(location.search)
          if(param.token) { //如果是从邮件验证进来
            dispatch({
              type: 'initConfirm',
              payload: {
                token: param.token
              }
            })
          }
        }
      })
    },
  },
  effects: {
    * initConfirm({ payload }, { select, call, put }) { //token验证
      let res = yield call(initConfirm, payload)
      if(isApiResponseOk(res)) {
        // message.success(res.message, MESSAGE_DURATION_TIME)
        yield put({
          type: 'updateDatas',
          payload: {
            email: res.data.email,
          },
        })
      }else{
        const props = {
          dispatch: dispatchGlobalThisModel,
          discriptionText: '邮件信息已过期，即将跳转到找回密码页面',
          jumpText: '立即跳转',
          isNeedTimeDown: true
        }
        message.warn(<MessageRoute {...props}/>, MESSAGE_DURATION_TIME, function () {
          dispatchGlobalThisModel({
            type: 'routingJump',
            payload: {
              route: '/retrievePassword'
            }
          })
        })
      }
    },
    * formSubmit({ payload }, { select, call, put }) { //提交表单
      const { accountType = '', mobile = '', email = '' } = payload
      // console.log(payload)
      let res = yield call(formSubmit, payload)
      if(isApiResponseOk(res)) {
        message.success(res.message, MESSAGE_DURATION_TIME)
        const delay = (ms) => new Promise(resolve => {
          setTimeout(resolve, ms)
        })
        yield call(delay, 2000)
        yield put ({
          type: 'routingJump',
          payload: {
            route: '/login',
          }
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * routingJump({ payload }, { call, put }) {
      const { route } = payload
      yield put(routerRedux.push(route));
    },
    * getVerificationcode({ payload }, { select, call, put }) { //获取验证码
      const { data, calback } = payload
      calback && typeof calback === 'function' ? calback() : ''
      let res = yield call(requestVerifyCode, data)
      if(isApiResponseOk(res)) {
        message.success(res.message, MESSAGE_DURATION_TIME)
        yield put({
          type: 'updateDatas',
          payload: {
            showGetVerifyCode: true,
          },
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

  },

  reducers: {
    updateDatas(state, action) {
      return {
        ...state,
        datas: { ...state.datas, ...action.payload },
      }
    }
  },
};
