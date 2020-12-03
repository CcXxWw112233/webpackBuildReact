import { message } from 'antd'
import { routerRedux } from 'dva/router'
import { CUSTOMIZATION_ORGNIZATIONS } from '../globalset/js/constant'

let redirectLocation
export default {
  namespace: 'initRouteRedirect',
  state: [],
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        message.destroy()
        if (location.pathname === '/') {
          const { user_set = {} } = localStorage.getItem('userInfo')
            ? JSON.parse(localStorage.getItem('userInfo'))
            : {}
          const { is_simple_model, current_org } = user_set
          if (CUSTOMIZATION_ORGNIZATIONS.includes(current_org)) {
            if (!is_simple_model || is_simple_model == '1') {
              dispatch({
                type: 'routingJump',
                payload: {
                  route: '/technological/simplemode/home'
                }
              })
            } else {
              dispatch({
                type: 'routingJump',
                payload: {
                  route: '/technological/workbench'
                }
              })
            }
          } else {
            dispatch({
              type: 'routingJump',
              payload: {
                route: '/technological/simplemode/home'
              }
            })
          }
        }
      })
    }
  },
  effects: {
    *routingJump({ payload }, { call, put }) {
      const { route } = payload
      yield put(routerRedux.push(route))
    }
  },

  reducers: {
    delete(state, { payload: id }) {
      return state.filter(item => item.id !== id)
    }
  }
}
