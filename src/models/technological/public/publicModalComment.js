import { getPublicModalDetailCommentList, submitPublicModalDetailComment, deletePublicModalDetailComment } from '../../../services/technological/public'
import { getCardCommentListAll, addCardNewComment, deleteCardNewComment } from '../../../services/technological/task'
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
    isShowAllDynamic: true, // 是否显示全部动态
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen((location) => {
      })
    },
  },
  effects: {
    // 针对任务的评论动态列表
    * getCardCommentListAll({ payload = {} }, { select, call, put }) {
      let res = yield call(getCardCommentListAll, payload) 
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            comment_list: res.data
          }
        })
      }
    },
    // 针对任务发表评论
    * addCardNewComment({ payload = {} }, { select, call, put }) {
      const { card_id, comment, flag } = payload
      let res = yield call(addCardNewComment, { card_id, comment })
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success('评论已发送')
        }, 500)
        yield put({
          type: 'getCardCommentListAll',
          payload: {
            id: card_id, flag
          }
        })
      } else {
        message.warn(res.message)
      }
    },
    // 针对任务的删除评论
    * deleteCardNewComment({ payload = {} }, { select, call, put }) {
      const { id, flag, common_id } = payload
      let res = yield call(deleteCardNewComment, { id })
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success('撤回成功')
        }, 500)
        yield put({
          type: 'getCardCommentListAll',
          payload: {
            id: common_id, flag
          }
        })
      } else {
        message.warn(res.message)
      }
    },
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
        setTimeout(() => {
          message.success('评论已发送')
        }, 500)
        yield put({
          type: 'getPublicModalDetailCommentList',
          payload: {
            id, flag
          }
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * deletePublicModalDetailComment({ payload = {} }, { select, call, put }) {
      const { id, flag, milestone_id, common_id } = payload
      let res = yield call(deletePublicModalDetailComment, { id })
      if(isApiResponseOk(res)) {
        setTimeout(() => {
          message.success('撤回成功')
        }, 500)
        yield put({
          type: 'getPublicModalDetailCommentList',
          payload: {
            id: common_id, flag
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
