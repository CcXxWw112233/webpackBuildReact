import { initConfirm } from '../../services/registerSuccess'
import { isApiResponseOk } from '../../utils/handleResponseData'
import { message } from 'antd'
import { MESSAGE_DURATION_TIME } from '../../globalset/js/constant'
import { routerRedux } from 'dva/router'
import queryString from 'query-string'

export default {
  namespace: 'registerSuccess',
  state: [],
  subscriptions: {
    setup({ dispatch, history }) {
      message.destroy()
      history.listen(location => {
        if (location.pathname === '/registerSuccess') {
          dispatch({
            type: 'updateDatas',
            payload: queryString.parse(location.search)
          })
          const param = queryString.parse(location.search)
          if (param.type !== 'register') {
            //如果不是从注册页面进来，而是从邮件验证进来
            dispatch({
              type: 'initConfirm',
              payload: {
                token: param.token
              }
            })
          }
        }
      })
    }
  },
  effects: {
    *initConfirm({ payload }, { select, call, put }) {
      //提交表单
      let res = yield call(initConfirm, payload)
      let verifyResult //验证结果，成功或者失败
      if (isApiResponseOk(res)) {
        // message.success(res.message, MESSAGE_DURATION_TIME)
        verifyResult = true
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
        verifyResult = false
      }
      yield put({
        type: 'updateDatas',
        payload: {
          loadFlag: true, // 验证结束标志
          verifyResult
        }
      })
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
