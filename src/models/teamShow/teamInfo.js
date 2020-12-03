import { isApiResponseOk } from '../../utils/handleResponseData'
import { message } from 'antd'
import { MESSAGE_DURATION_TIME } from '../../globalset/js/constant'
import { routerRedux } from 'dva/router'
import Cookies from 'js-cookie'
import { getAppsList } from '../../services/technological/project'
import modelExtend from 'dva-model-extend'
import technological from './index'
import {
  getTeamShowList,
  addTeamShow,
  getTeamShowTypeList,
  getTeamShowDetail,
  deleteTeamShow,
  getCurrentOrgTeamShowList
} from '../../services/teamShow'
import queryString from 'query-string'

let naviHeadTabIndex //导航栏naviTab选项
export default modelExtend(technological, {
  namespace: 'teamInfo',
  state: [],
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        message.destroy()
        if (location.pathname === '/technological/teamShow/teamInfo') {
          dispatch({
            type: 'updateDatas',
            payload: {
              detaiInfo: {}
            }
          })
          dispatch({
            type: 'getTeamShowDetail',
            payload: queryString.parse(location.search)
          })
        }
      })
    }
  },
  effects: {
    *getTeamShowList({ payload }, { select, call, put }) {
      let res = yield call(getTeamShowList, payload)
      if (isApiResponseOk(res)) {
      } else {
      }
    },
    *addTeamShow({ payload }, { select, call, put }) {
      let res = yield call(addTeamShow, payload)
      if (isApiResponseOk(res)) {
      } else {
      }
    },
    *getTeamShowTypeList({ payload }, { select, call, put }) {
      let res = yield call(getTeamShowTypeList, payload)
      if (isApiResponseOk(res)) {
      } else {
      }
    },
    *getTeamShowDetail({ payload }, { select, call, put }) {
      let res = yield call(getTeamShowDetail, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            detaiInfo: res.data
          }
        })
      } else {
      }
    },
    *deleteTeamShow({ payload }, { select, call, put }) {
      let res = yield call(deleteTeamShow, payload)
      if (isApiResponseOk(res)) {
      } else {
      }
    },
    *getCurrentOrgTeamShowList({ payload }, { select, call, put }) {
      let res = yield call(getCurrentOrgTeamShowList, payload)
      if (isApiResponseOk(res)) {
      } else {
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
})
