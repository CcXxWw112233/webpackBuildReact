import { formSubmit, requestVerifyCode, wechatAccountBind, changePicVerifySrc } from '../../services/login'
import { isApiResponseOk } from '../../utils/handleResponseData'
import { message } from 'antd'
import { MESSAGE_DURATION_TIME } from "../../globalset/js/constant";
import { routerRedux } from "dva/router";
import Cookies from 'js-cookie'
import QueryString from 'querystring'
import {getUSerInfo} from "../../services/technological";
import { selectLoginCaptchaKey } from './selects'
let redirectLocation
export default {
  namespace: 'login',
  state: {
    datas: {
      is_show_pic_verify_code: false, //是否显示图片验证码
      pic_verify_src: '',
      captcha_key: ''
    }
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen((location) => {
        message.destroy()
        if (location.pathname === '/login') {
          Cookies.set('is401', false, {expires: 30, path: ''})
          redirectLocation = location.search.replace('?redirect=', '')
          dispatch({
            type: 'updateDatas',
            payload: {
              is_show_pic_verify_code: false, //是否显示图片验证码
              pic_verify_src: '',
              captcha_key: ''
            }
          })
        } else {
          localStorage.removeItem('bindType')
        }
        if(location.pathname.indexOf('/login') !== -1) {
          dispatch({
            type: 'updateDatas',
            payload: {
              is_show_pic_verify_code: false, //是否显示图片验证码
              pic_verify_src: ''
            }
          })
        }
      })
    },
  },
  effects: {
    // 登录成功重定向
    * loginRouteJump ({ payload }, {select, call, put}) {
      const res = yield call(getUSerInfo, payload)
      const { has_org } = res.data
      const { is_simple_model } = res.data.user_set
      //如果存在组织， 否则跳到指引页面
      if(isApiResponseOk(res)) {
        if(has_org == '1'){
          if (is_simple_model == '1' && !redirectLocation) {
            yield put(routerRedux.push('/technological/simplemode/home'))
          } else {  
            yield put(routerRedux.push(redirectLocation))
          }
          // yield put(routerRedux.push(redirectLocation))
          
        } else {
          yield put(routerRedux.push('/noviceGuide'))
        }
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    // 登录成功设置token
    * setTokenBeforeLogin ({ payload }, {select, call, put}) {
      const { data } = payload
      const tokenArray = data.split('__')
      Cookies.set('Authorization', tokenArray[0], {expires: 30, path: ''})
      Cookies.set('refreshToken', tokenArray[1], {expires: 30, path: ''})
      Cookies.set('is401', false, {expires: 30, path: ''})
    },
    * wechatAccountBind({payload}, {select, call, put}) {
      let res = yield call(wechatAccountBind, payload)
      if(isApiResponseOk(res)) {
        // const tokenArray = res.data.split('__')
        // Cookies.set('Authorization', tokenArray[0], {expires: 30, path: ''})
        // Cookies.set('refreshToken', tokenArray[1], {expires: 30, path: ''})
        // Cookies.set('is401', false, {expires: 30, path: ''})
        yield put({
          type: 'setTokenBeforeLogin',
          payload: {
            data: res.data
          }
        })
        //做登录成功重定向
        yield put({
          type: 'loginRouteJump',
          payload: {}
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * wechatLogin({ payload }, { select, call, put }) { //微信扫码登陆
        // const tokenArray = payload.token.split('__')
        // Cookies.set('Authorization', tokenArray[0], {expires: 30, path: ''})
        // Cookies.set('refreshToken', tokenArray[1], {expires: 30, path: ''})
        // Cookies.set('is401', false, {expires: 30, path: ''})
        const { token } = payload
        yield put({
          type: 'setTokenBeforeLogin',
          payload: {
            data: token
          }
        })
        //做登录成功重定向
        yield put({
          type: 'loginRouteJump',
          payload: {}
        })

    },
    * formSubmit({ payload }, { select, call, put }) { //提交表单
      const captcha_key = yield select(selectLoginCaptchaKey)
      let res = yield call(formSubmit, {...payload, captcha_key})
      const code = res.code
      if(isApiResponseOk(res)) {
        yield put({
          type: 'setTokenBeforeLogin',
          payload: {
            data: res.data
          }
        })
        //做登录成功重定向
        yield put({
          type: 'loginRouteJump',
          payload: {}
        })
      }else{
        if(code == '4005' || code == '4006' ) {
          yield put({
            type: 'updateDatas',
            payload: {
              is_show_pic_verify_code: true,
              pic_verify_src: res.data && `data:image/png;base64,${res.data['base64_img']}`,
              captcha_key: res.data && res.data.captcha_key
            }
          })
        }else if(code == '4007') {
          yield put({
            type: 'updateDatas',
            payload: {
              is_show_pic_verify_code: true,
            }
          })
        }
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * getVerificationcode({ payload }, { select, call, put }) { //获取验证码
      const { data, calback } = payload
      let res = yield call(requestVerifyCode, data)
      calback && typeof calback === 'function' ? calback() : ''
      if(isApiResponseOk(res)) {
        message.success(res.message, MESSAGE_DURATION_TIME)
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * changePicVerifySrc({ payload }, { select, call, put }) { //更新图片验证码
      const captcha_key = yield select(selectLoginCaptchaKey)
      const res = yield call(changePicVerifySrc, {captcha_key})
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            pic_verify_src: `data:image/png;base64,${res.data['base64_img']}`,
            captcha_key: res.data.captcha_key
          }
        })

      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    * routingJump({ payload }, { call, put }) {
      const { route } = payload
      yield put(routerRedux.push(route));
    }

  },

  reducers: {
    updateDatas(state, action) {
      return {
        ...state,
        datas: {...state.datas, ...action.payload},
      }
    }
  },
};
