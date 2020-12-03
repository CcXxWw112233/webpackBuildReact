import {
  getTeamShowList,
  addTeamShow,
  getTeamShowTypeList,
  getTeamShowDetail,
  deleteTeamShow,
  getCurrentOrgTeamShowList
} from '../../services/teamShow'
import { isApiResponseOk } from '../../utils/handleResponseData'
import { message } from 'antd'
import { MESSAGE_DURATION_TIME } from '../../globalset/js/constant'
import { routerRedux } from 'dva/router'
import Cookies from 'js-cookie'
import QueryString from 'querystring'

let naviHeadTabIndex //导航栏naviTab选项
let locallocation //保存location在组织切换
export default {
  namespace: 'teamShow',
  state: [],
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        message.destroy()
        //头部table key
        locallocation = location
        if (location.pathname.indexOf('/teamShow') !== -1) {
          dispatch({
            type: 'updateDatas',
            payload: {
              teamShowTypeList: [],
              teamShowTypeId: ''
            }
          })
          // dispatch({
          //   type: 'getTeamShowTypeList',
          //   payload: {
          //
          //   }
          // })
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
        yield put({
          type: 'updateDatas',
          payload: {
            teamShowTypeList: res.data
          }
        })
      } else {
      }
    },
    *getTeamShowDetail({ payload }, { select, call, put }) {
      let res = yield call(getTeamShowDetail, payload)
      if (isApiResponseOk(res)) {
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
}
