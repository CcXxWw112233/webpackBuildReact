import { getPublicModalDetailCommentList, submitPublicModalDetailComment, deletePublicModalDetailComment } from '../../../services/technological/public'
import { isApiResponseOk } from '../../../utils/handleResponseData'
import { message } from 'antd'
import { MESSAGE_DURATION_TIME } from "../../../globalset/js/constant";
import { routerRedux } from "dva/router";
import queryString from 'query-string';
import modelExtend from 'dva-model-extend'
import technological from '../index'

export default modelExtend(technological, {
  namespace: 'publicModalComment',
  state: {
    comment_list: [],
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen((location) => {
      })
    },
  },
  effects: {
    * getPublicModalDetailCommentList({ payload = {} }, { select, call, put }) {
      let res = yield call(getPublicModalDetailCommentList, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            comment_list: res.data
          }
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * submitPublicModalDetailComment({ payload = {} }, { select, call, put }) {
      const { comment, id, origin_type, flag } = payload
      let res = yield call(submitPublicModalDetailComment, { comment, id, origin_type })
      if(isApiResponseOk(res)) {
        yield put({
          type: 'getPublicModalDetailCommentList',
          payload: {
            id, flag
          }
        })
        message.success('评论已发送')
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * deletePublicModalDetailComment({ payload = {} }, { select, call, put }) {
      const { id, flag, milestone_id } = payload
      let res = yield call(deletePublicModalDetailComment, { id })
      if(isApiResponseOk(res)) {
        yield put({
          type: 'getPublicModalDetailCommentList',
          payload: {
            id: milestone_id, flag
          }
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
  },

  reducers: {
    updateDatas(state, action) {
      return {
        ...state, ...action.payload
      }
    }
  },
})
