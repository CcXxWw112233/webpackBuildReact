import {
  boardAppCancelRelaMiletones,
  getMilestoneDetail,
  updateMilestone,
  addMilestoneExcutos,
  removeMilestoneExcutos
} from '../../../services/technological/task'
import { isApiResponseOk } from '../../../utils/handleResponseData'
import { message } from 'antd'
import { MESSAGE_DURATION_TIME } from '../../../globalset/js/constant'
import { routerRedux } from 'dva/router'
import queryString from 'query-string'
import modelExtend from 'dva-model-extend'
import technological from '../index'

export default modelExtend(technological, {
  namespace: 'milestoneDetail',
  state: {
    milestone_id: '',
    milestone_detail: {}
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {})
    }
  },
  effects: {
    *getMilestoneDetail({ payload = {} }, { select, call, put }) {
      let res = yield call(getMilestoneDetail, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            milestone_detail: res.data
          }
        })
        return res.data || {}
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    *updateMilestone({ payload = {} }, { select, call, put }) {
      let res = yield call(updateMilestone, payload)
      if (isApiResponseOk(res)) {
        const { id } = payload
        yield put({
          type: 'getMilestoneDetail',
          payload: {
            id
          }
        })
        return res
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
      return ''
    },
    *taskCancelRelaMiletones({ payload }, { select, call, put }) {
      const { id } = payload //此时的rela_id 为任务id
      const res = yield call(boardAppCancelRelaMiletones, payload)
      if (isApiResponseOk(res)) {
        const res2 = yield call(getMilestoneDetail, { id })
        if (isApiResponseOk(res2)) {
          yield put({
            type: 'updateDatas',
            payload: {
              milestone_detail: res2.data
            }
          })
        }
      } else {
        message.warn(res.message)
      }
      return res || {}
    },
    *addMilestoneExcutos({ payload }, { select, call, put }) {
      const { id } = payload //此时的rela_id 为任务id
      const res = yield call(addMilestoneExcutos, payload)
      if (isApiResponseOk(res)) {
        const res2 = yield call(getMilestoneDetail, { id })
        if (isApiResponseOk(res2)) {
          yield put({
            type: 'updateDatas',
            payload: {
              milestone_detail: res2.data
            }
          })
          message.success('设置成功')
        }
      } else {
        message.warn(res.message)
      }
      return res || {}
    },
    *removeMilestoneExcutos({ payload }, { select, call, put }) {
      const { id } = payload //此时的rela_id 为任务id
      const res = yield call(removeMilestoneExcutos, payload)
      if (isApiResponseOk(res)) {
        const res2 = yield call(getMilestoneDetail, { id })
        if (isApiResponseOk(res2)) {
          yield put({
            type: 'updateDatas',
            payload: {
              milestone_detail: res2.data
            }
          })
          message.success('设置成功')
        }
      } else {
        message.warn(res.message)
      }
      return res || {}
    }
  },

  reducers: {
    updateDatas(state, action) {
      return {
        ...state,
        ...action.payload
      }
    }
  }
})
