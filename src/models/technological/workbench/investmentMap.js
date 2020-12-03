import { message } from 'antd'
import modelExtend from 'dva-model-extend'
import technological from '../index'
import { isApiResponseOk } from '../../../utils/handleResponseData'
import { getRelationsSelectionPre } from '../../../services/technological/task'
import { MESSAGE_DURATION_TIME } from '../../../globalset/js/constant'
import { getMapsQueryUser } from '../../../services/technological/investmentMap'

//用于存放工作台公共的数据
export default modelExtend(technological, {
  namespace: 'investmentMap',
  state: {},
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (location.pathname === '/technological/simplemode/workbench') {
          const initData = () => {
            Promise.all([
              dispatch({
                type: 'updateDatas',
                payload: {
                  mapOrganizationList: [] //有权限查看地图的组织
                }
              })
            ])
          }
          initData()
        } else {
        }
      })
    }
  },
  effects: {
    *getMapsQueryUser({ payload }, { select, call, put }) {
      let res = yield call(getMapsQueryUser, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            mapOrganizationList: res.data
          }
        })
      } else {
      }
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
