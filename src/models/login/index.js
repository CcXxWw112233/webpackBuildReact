import {
  formSubmit,
  requestVerifyCode,
  wechatAccountBind,
  changePicVerifySrc
} from '../../services/login'
import { isApiResponseOk } from '../../utils/handleResponseData'
import { message } from 'antd'
import {
  MESSAGE_DURATION_TIME,
  CUSTOMIZATION_ORGNIZATIONS
} from '../../globalset/js/constant'
import { routerRedux } from 'dva/router'
import Cookies from 'js-cookie'
import QueryString from 'querystring'
import { getUSerInfo } from '../../services/technological'
import { selectLoginCaptchaKey } from './selects'
import { getModelIsImport } from '../utils'
import { createDefaultOrg } from '../../services/technological/noviceGuide'
import {
  diffClientInitToken,
  diffClientRedirect
} from '../../globalset/clientCustorm'
import queryString from 'query-string'

let redirectLocation
let redirect_by_env_provider = null //由端能力提供的跳转方法（webview）
const clearAboutLocalstorage = () => {
  //清掉当前相关业务逻辑的用户数据
  const names_arr = [
    'OrganizationId',
    'userInfo',
    'userOrgPermissions',
    'userAllOrgsAllBoards',
    'currentUserOrganizes',
    'userBoardPermissions',
    'currentSelectOrganize',
    'currentNounPlan'
  ]
  for (let val of names_arr) {
    localStorage.removeItem(val)
  }
}
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
      history.listen(location => {
        message.destroy()
        if (location.pathname === '/login') {
          Cookies.set('is401', false, { expires: 30, path: '' })
          // redirectLocation = location.search.replace('?redirect=', '')
          const urlParam = queryString.parse(location.search)
          redirectLocation = urlParam.redirectLocation
          redirect_by_env_provider = urlParam.redirect_by_env_provider

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
        if (location.pathname.indexOf('/login') !== -1) {
          dispatch({
            type: 'updateDatas',
            payload: {
              is_show_pic_verify_code: false, //是否显示图片验证码
              pic_verify_src: ''
            }
          })
        }
      })
    }
  },
  effects: {
    // 登录成功重定向
    *loginRouteJump({ payload }, { select, call, put }) {
      clearAboutLocalstorage() //清掉所有localstorage缓存
      const simplGetUserInfo = yield put({
        type: 'technological/simplGetUserInfo'
      })
      const simplGetUserInfoSync = () =>
        new Promise(resolve => {
          resolve(simplGetUserInfo.then())
        })
      // 内容过滤处理end
      const res = yield call(simplGetUserInfoSync) || {}
      //如果存在组织， 否则跳到指引页面
      if (isApiResponseOk(res)) {
        const { has_org } = res.data
        const { is_simple_model, current_org } = res.data.user_set
        if (has_org == '1') {
          const delay = ms =>
            new Promise(resolve => {
              setTimeout(resolve, ms)
            })
          yield call(delay, 500)
          // 正常逻辑------start
          // if (redirectLocation) {
          //   yield put(routerRedux.push(redirectLocation))
          // } else {
          //   if (is_simple_model == '0') {
          //     yield put(routerRedux.push('/technological/workbench'))
          //   } else if (is_simple_model == '1') {
          //     yield put(routerRedux.push('/technological/simplemode/home'))
          //   } else {

          //   }
          // }
          // 正常逻辑------end

          // 针对性定制化组织-------start
          if (redirectLocation) {
            yield put(routerRedux.push(redirectLocation))
          } else {
            if (CUSTOMIZATION_ORGNIZATIONS.includes(current_org)) {
              //如果是需要开放的组织
              if (is_simple_model == '0') {
                yield put(routerRedux.push('/technological/workbench'))
              } else if (is_simple_model == '1') {
                yield put(routerRedux.push('/technological/simplemode/home'))
              } else {
              }
            } else {
              yield put(routerRedux.push('/technological/simplemode/home'))
            }
          }
          // 针对性定制化组织-------start
        } else {
          // yield put(routerRedux.push('/noviceGuide'))
          const res2 = yield call(createDefaultOrg)
          if (isApiResponseOk(res2)) {
            yield put(routerRedux.push('/technological/simplemode/home')) //首次登录跳转极简模式
          } else {
            message.error(res2.message, MESSAGE_DURATION_TIME)
          }
        }
      } else {
        message.error(res.message, MESSAGE_DURATION_TIME)
      }
    },
    // 登录成功设置token
    *setTokenBeforeLogin({ payload }, { select, call, put }) {
      const { data } = payload
      const tokenArray = data.split('__')
      Cookies.set('Authorization', tokenArray[0], { expires: 30, path: '' })
      Cookies.set('refreshToken', tokenArray[1], { expires: 30, path: '' })
      Cookies.set('is401', false, { expires: 30, path: '' })

      diffClientInitToken(Cookies.get('Authorization'))

      if (redirect_by_env_provider) {
        //由端能力自己提供跳转，当这个参数存在的时候，不允许前端主动跳转，操作由第三方提供的能力
        diffClientRedirect(tokenArray[0])
        return
      }
      //普通登录跳转
      yield put({
        type: 'loginRouteJump',
        payload: {}
      })
    },
    *wechatAccountBind({ payload }, { select, call, put }) {
      let res = yield call(wechatAccountBind, payload)
      if (isApiResponseOk(res)) {
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
        // yield put({
        //   type: 'loginRouteJump',
        //   payload: {}
        // })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    *wechatLogin({ payload }, { select, call, put }) {
      //微信扫码登陆
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
      // yield put({
      //   type: 'loginRouteJump',
      //   payload: {}
      // })
    },
    *formSubmit({ payload }, { select, call, put }) {
      //提交表单
      const captcha_key = yield select(selectLoginCaptchaKey)
      let res = yield call(formSubmit, { ...payload, captcha_key })
      const code = res.code
      if (isApiResponseOk(res)) {
        yield put({
          type: 'setTokenBeforeLogin',
          payload: {
            data: res.data
          }
        })
        //做登录成功重定向
        // yield put({
        //   type: 'loginRouteJump',
        //   payload: {}
        // })
      } else {
        if (code == '4005' || code == '4006') {
          yield put({
            type: 'updateDatas',
            payload: {
              is_show_pic_verify_code: true,
              pic_verify_src:
                res.data && `data:image/png;base64,${res.data['base64_img']}`,
              captcha_key: res.data && res.data.captcha_key
            }
          })
        } else if (code == '4007') {
          yield put({
            type: 'updateDatas',
            payload: {
              is_show_pic_verify_code: true
            }
          })
        }
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    *getVerificationcode({ payload }, { select, call, put }) {
      //获取验证码
      const { data, calback } = payload
      let res = yield call(requestVerifyCode, data)
      calback && typeof calback === 'function' ? calback() : ''
      if (isApiResponseOk(res)) {
        message.success(res.message, MESSAGE_DURATION_TIME)
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    *changePicVerifySrc({ payload }, { select, call, put }) {
      //更新图片验证码
      const captcha_key = yield select(selectLoginCaptchaKey)
      const res = yield call(changePicVerifySrc, { captcha_key })
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            pic_verify_src: `data:image/png;base64,${res.data['base64_img']}`,
            captcha_key: res.data.captcha_key
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    *routingJump({ payload }, { call, put }) {
      const { route } = payload
      yield put(routerRedux.push(route))
    }
  },

  reducers: {
    updateDatas(state, action) {
      return {
        ...state,
        datas: { ...state.datas, ...action.payload }
      }
    }
  }
}
