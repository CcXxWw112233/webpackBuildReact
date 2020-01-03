import { formSubmit, requestVerifyCode, wechatAccountBind, changePicVerifySrc } from '../../services/login'
import { isApiResponseOk } from '../../utils/handleResponseData'
import { message } from 'antd'
import { MESSAGE_DURATION_TIME } from "../../globalset/js/constant";
import { routerRedux } from "dva/router";
import Cookies from 'js-cookie'
import QueryString from 'querystring'
import { getUSerInfo } from "../../services/technological";
import { selectLoginCaptchaKey } from './selects'
import { getModelIsImport } from '../utils';
import { createDefaultOrg } from '../../services/technological/noviceGuide';
let redirectLocation
const clearAboutLocalstorage = () => { //清掉当前相关业务逻辑的用户数据
  const names_arr = [
    'OrganizationId',
    'userInfo',
    'userOrgPermissions',
    'userAllOrgsAllBoards',
    'currentUserOrganizes',
    'userBoardPermissions',
    'currentSelectOrganize',
    'currentNounPlan',
  ]
  for(let val of names_arr) {
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
      history.listen((location) => {
        message.destroy()
        if (location.pathname === '/login') {
          Cookies.set('is401', false, { expires: 30, path: '' })
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
    },
  },
  effects: {
    // 登录成功重定向
    * loginRouteJump({ payload }, { select, call, put }) {
      const res = yield call(getUSerInfo, payload)
      const { has_org } = res.data
      const { is_simple_model } = res.data.user_set
      // console.log(is_simple_model, 'sssssss')
      //如果存在组织， 否则跳到指引页面
      if (isApiResponseOk(res)) {
        clearAboutLocalstorage() //清掉所有localstorage缓存
        if (has_org == '1') {
          // if (is_simple_model == '0') {
          //   if (redirectLocation.indexOf('/technological/simplemode') == -1) {
          //     yield put({
          //       type: 'technological/setShowSimpleModel',
          //       payload: {
          //         is_simple_model: '0',
          //         redirectLocation
          //       }
          //     })
          //   } else {
          //     yield put(routerRedux.push('/technological/workbench'))
          //   }
          // } else if (is_simple_model == '1') {
          //   if (redirectLocation.indexOf('/technological/simplemode') == -1) {
          //     yield put({
          //       type: 'technological/setShowSimpleModel',
          //       payload: {
          //         is_simple_model: '0',
          //         redirectLocation
          //       }
          //     })
          //   } else {
          //     yield put(routerRedux.push('/technological/simplemode/home'))
          //   }
          // } else {

          // }

          if (redirectLocation.indexOf('/technological/simplemode') == -1) {
            const model_is_import = yield select(getModelIsImport('technological'))
            if (model_is_import) { //在该模块注入之后才调用，否则就只是调用简单跳转
              yield put({
                type: 'technological/setShowSimpleModel',
                payload: {
                  is_simple_model: '0',
                  redirectLocation
                }
              })
            } else {
              yield put(routerRedux.push('/technological/simplemode/home'))
            }
          } else {
            if (is_simple_model == '0') {
              yield put(routerRedux.push('/technological/workbench'))
            } else if (is_simple_model == '1') {
              yield put(routerRedux.push('/technological/simplemode/home'))
            } else {

            }
          }

          // if (is_simple_model == '0' && redirectLocation.indexOf('/technological/simplemode') == -1) { // 如果是普通模式,但重定向不为极简模式,那么就重定向到该去的地方
          //   yield put({
          //     type: 'technological/setShowSimpleModel',
          //     payload: {
          //       is_simple_model: '0',
          //       redirectLocation
          //     }
          //   })
          //   // yield put(routerRedux.push(redirectLocation))

          // } else if (is_simple_model == '0' && redirectLocation.indexOf('/technological/simplemode') != -1) { // 如果是高效模式, 但重定向为极简模式, 那么就以模式为主
          //   yield put(routerRedux.push('/technological/workbench'))
          // } else if (is_simple_model == '1' && redirectLocation.indexOf('/technological/workbench') == -1) {
          //   yield put({
          //     type: 'technological/setShowSimpleModel',
          //     payload: {
          //       is_simple_model: '0',
          //       redirectLocation
          //     }
          //   })
          //   // yield put(routerRedux.push(redirectLocation))

          // } else if (is_simple_model == '1' && redirectLocation.indexOf('/technological/workbench') != -1) {
          //   yield put(routerRedux.push('/technological/simplemode/home'))
          // }

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
    * setTokenBeforeLogin({ payload }, { select, call, put }) {
      const { data } = payload
      const tokenArray = data.split('__')
      Cookies.set('Authorization', tokenArray[0], { expires: 30, path: '' })
      Cookies.set('refreshToken', tokenArray[1], { expires: 30, path: '' })
      Cookies.set('is401', false, { expires: 30, path: '' })
    },
    * wechatAccountBind({ payload }, { select, call, put }) {
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
        yield put({
          type: 'loginRouteJump',
          payload: {}
        })
      } else {
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
        yield put({
          type: 'loginRouteJump',
          payload: {}
        })
      } else {
        if (code == '4005' || code == '4006') {
          yield put({
            type: 'updateDatas',
            payload: {
              is_show_pic_verify_code: true,
              pic_verify_src: res.data && `data:image/png;base64,${res.data['base64_img']}`,
              captcha_key: res.data && res.data.captcha_key
            }
          })
        } else if (code == '4007') {
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
      if (isApiResponseOk(res)) {
        message.success(res.message, MESSAGE_DURATION_TIME)
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * changePicVerifySrc({ payload }, { select, call, put }) { //更新图片验证码
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

    * routingJump({ payload }, { call, put }) {
      const { route } = payload
      yield put(routerRedux.push(route));
    }

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
