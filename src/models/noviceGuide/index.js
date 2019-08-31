import { isApiResponseOk } from '../../utils/handleResponseData'
import { message } from 'antd'
import {MESSAGE_DURATION_TIME, ORGANIZATION} from "../../globalset/js/constant";
import { routerRedux } from "dva/router";
import Cookies from 'js-cookie'
import QueryString from 'querystring'
import {
  applyJoinOrganization, changeCurrentOrg,
  createOrganization
} from "../../services/technological/organizationMember";
import {getUSerInfo} from "../../services/technological";
import {currentNounPlanFilterName} from "../../utils/businessFunction";

export default {
  namespace: 'noviceGuide',
  state: [],
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen((location) => {
        message.destroy()
        if (location.pathname === '/noviceGuide') {
        }
      })
    },
  },
  effects: {
    * getUSerInfo({ payload }, { select, call, put }) { //提交表单
      let res = yield call(getUSerInfo, payload)
      if(isApiResponseOk(res)) {
        localStorage.setItem('userInfo', JSON.stringify(res.data))
        yield put({
          type: 'routingJump',
          payload: {
            route: '/technological/project'
          }
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    * changeCurrentOrg({ payload }, { select, call, put }) { //切换组织
      let res = yield call(changeCurrentOrg, payload)
      if(isApiResponseOk(res)) {
        const tokenArray = res.data.split('__')
        Cookies.set('Authorization', tokenArray[0], {expires: 30, path: ''})
        Cookies.set('refreshToken', tokenArray[1], {expires: 30, path: ''})
        yield put({
          type: 'getUSerInfo',
          payload: {
          }
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    * applyJoinOrganization({ payload }, { select, call, put }) {
      let res = yield call(applyJoinOrganization, payload)
      if(isApiResponseOk(res)) {
        message.success(`已申请加入`, MESSAGE_DURATION_TIME)
        const delay = (ms) => new Promise(resolve => {
          setTimeout(resolve, ms)
        })
        yield call(delay, 2000)
        yield put({
          type: 'routingJump',
          payload: {
            route: '/technological/project'
          }
        })
      }else{
        message.warn(`${res.message},请稍后访问...`, MESSAGE_DURATION_TIME)
        const delay = (ms) => new Promise(resolve => {
          setTimeout(resolve, ms)
        })
        yield call(delay, 2000)
        window.location.href = 'http://www.di-an.com/'
      }
    },
    * createOrganization({ payload }, { select, call, put }) {
      let res = yield call(createOrganization, payload)
      if(isApiResponseOk(res)) {
        //查询一遍
        message.success(`创建组织成功`, MESSAGE_DURATION_TIME)
        const delay = (ms) => new Promise(resolve => {
          setTimeout(resolve, ms)
        })
        yield call(delay, 2000)
        yield put({
          type: 'changeCurrentOrg',
          payload: {
            org_id: res.data.id
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
