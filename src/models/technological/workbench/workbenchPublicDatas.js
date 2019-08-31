import { message } from 'antd'
import { routerRedux } from "dva/router";
import Cookies from "js-cookie";
import modelExtend from 'dva-model-extend'
import technological from '../index'
import {isApiResponseOk} from "../../../utils/handleResponseData";
import {getRelationsSelectionPre} from "../../../services/technological/task";
import {MESSAGE_DURATION_TIME} from "../../../globalset/js/constant";
import {getMilestoneList} from "../../../services/technological/prjectDetail";
import {setBoardIdStorage} from "../../../utils/businessFunction";

//用于存放工作台公共的数据
export default modelExtend(technological, {
  namespace: 'workbenchPublicDatas',
  state: [],
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen((location) => {
        if (location.pathname === '/technological/workbench') {
          dispatch({
            type: 'updateDatas',
            payload: {
              board_id: '',
              relations_Prefix: [],
              milestoneList: [], //里程碑列表
            }
          })
          if(localStorage.getItem('OrganizationId') && localStorage.getItem('OrganizationId') != '0') {
            dispatch({
              type: 'getRelationsSelectionPre',
              payload: {
  
              }
            })
          }
         
        }
      })
    },
  },
  effects: {
    //获取内容关联前半部分
    * getRelationsSelectionPre({ payload }, { select, call, put }) { //
      let res = yield call(getRelationsSelectionPre, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            relations_Prefix: res.data || []
          }
        })
      }else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    //获取项目里程碑列表
    * getMilestoneList({ payload }, { select, call, put }) { //
      const res = yield call(getMilestoneList, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            milestoneList: res.data
          }
        })
      }else{
        message.error(res.message)
      }
    },

    * routingJump({ payload }, { call, put }) {
      const { route } = payload
      yield put(routerRedux.push(route));
    },
  },

  reducers: {
    updateDatas(state, action) {
      const { payload = {} } = action
      const { board_id } = payload
      if(board_id) { //用于做权限控制
        setBoardIdStorage(board_id)
      }
      return {
        ...state,
        datas: { ...state.datas, ...action.payload },
      }
    }
  },
});
