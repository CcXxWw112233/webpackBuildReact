import { formSubmit } from '../../services/retrievePassword'
import { isApiResponseOk } from '../../utils/handleResponseData'
import { message } from 'antd'
import { MESSAGE_DURATION_TIME } from "../../globalset/js/constant";
import { routerRedux } from "dva/router";
import queryString from 'query-string';

export default {
  namespace: 'retrievePassword',
  state: [],
  subscriptions: {
    setup({ dispatch, history }) {
      message.destroy()
      history.listen((location) => {
        if (location.pathname === '/retrievePassword') {
        }
      })
    },
  },
  effects: {
    * formSubmit({ payload }, { select, call, put }) { //提交表单
      const { accountType = '', mobile = '', email = '' } = payload
      //当传递过来的账号类型是手机号则跳转，是邮箱则发送邮件
      if(accountType === 'mobile') {
        yield put(routerRedux.push({
          pathname: '/resetPassword',
          search: queryString.stringify({ mobile})
        }))
      }else {
        let res = yield call(formSubmit, { email: email || mobile })
        if(isApiResponseOk(res)) {
          message.success(res.message, MESSAGE_DURATION_TIME)
        }else{
          message.warn(res.message, MESSAGE_DURATION_TIME)
        }
      }

    },
    * routingJump({ payload }, { call, put }) {
      const { route } = payload
      yield put(routerRedux.push(route));
    }
  },

  reducers: {
    'delete'(state, { payload: id }) {
      return state.filter(item => item.id !== id);
    },
  },
};
