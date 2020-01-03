import { getTeamShowList, addTeamShow, getTeamShowTypeList, getTeamShowDetail, deleteTeamShow, getCurrentOrgTeamShowList } from '../../../services/teamShow'
import { isApiResponseOk } from '../../../utils/handleResponseData'
import { message } from 'antd'
import {MESSAGE_DURATION_TIME, PAGINATION_PAGE_SIZE} from "../../../globalset/js/constant";
import { routerRedux } from "dva/router";
import Cookies from "js-cookie";
import {getAppsList} from "../../../services/technological/project";
import modelExtend from 'dva-model-extend'
import technological from '../index'

let naviHeadTabIndex //导航栏naviTab选项
export default modelExtend(technological, {
  namespace: 'workbenchEditTeamShow',
  state: [],
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen((location) => {
        if (location.pathname === '/technological/workbench') {
          dispatch({
            type: 'updateDatas',
            payload: {
              //  团队展示发布
              teamShowCertainOneShow: true, //编辑的时候展示，提交时设为false
              editTeamShowPreview: false, //编辑预览状态
              editTeamShowSave: false, //编辑保存状态
              teamShowTypeList: [], //团队秀类型
              currentOrgTeamShowList: [], //当前组织团队秀类型
              operateType: '1', //1新增， 2 修改
              //页面操作数据
              name: '',
              cover_img: '',
              summary: '',
              content: '',
              previewHtml: '',
              //当前查询得到
              currentTeamShowName: '',
              currentTeamShowId: '',
              currentTeamShowShowId: '',
              currentTeamShowTypeId: '',
            }
          })
          dispatch({
            type: 'getTeamShowTypeList',
            payload: {}
          })
          dispatch({
            type: 'getCurrentOrgTeamShowList',
            payload: {}
          })
        }
      })
    },
  },
  effects: {
    * getTeamShowList({ payload }, { select, call, put }) {
      let res = yield call(getTeamShowList, payload)
      if(isApiResponseOk(res)) {

      }else{

      }
    },
    * addTeamShow({ payload }, { select, call, put }) {
      let res = yield call(addTeamShow, payload)
      if(isApiResponseOk(res)) {
        message.success('保存成功', MESSAGE_DURATION_TIME)
        // const delay = (ms) => new Promise(resolve => {
        //   setTimeout(resolve, ms)
        // })
        // yield call(delay, 1000)
        // yield put({
        //   type: 'routingJump',
        //   payload: {
        //     route: '/technological/teamShow/teamList'
        //   }
        // })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * getTeamShowTypeList({ payload }, { select, call, put }) {
      let res = yield call(getTeamShowTypeList, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            teamShowTypeList: res.data,
          }
        })
      }else{

      }
    },
    * getTeamShowDetail({ payload }, { select, call, put }) {
      let res = yield call(getTeamShowDetail, payload)
      if(isApiResponseOk(res)) {
        const {
          name= '',
          cover_img= '',
          summary= '',
          content= '',
        } = res.data
        yield put({
          type: 'updateDatas',
          payload: {
            name,
            cover_img,
            summary,
            content,
            currentTeamShowName: name,
            currentTeamShowId: res.data.id,
            currentTeamShowShowId: res.data['showid'],
            currentTeamShowTypeId: res.data['show_type_id']
          }
        })
      }else{

      }
    },
    * deleteTeamShow({ payload }, { select, call, put }) {
      let res = yield call(deleteTeamShow, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            operateType: '1', //1新增， 2 修改
            //页面操作数据
            name: '',
            cover_img: '',
            summary: '',
            content: '',
            previewHtml: '',
            //当前查询得到
            currentTeamShowName: '',
            currentTeamShowId: '',
            currentTeamShowShowId: '',
            currentTeamShowTypeId: ''
          }
        })
        yield put({
          type: 'getCurrentOrgTeamShowList',
          payload: {
            calBack: function () {
              message.success('删除成功', MESSAGE_DURATION_TIME)
            }
          }
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * getCurrentOrgTeamShowList({ payload }, { select, call, put }) {
      const { calBack } = payload
      let res = yield call(getTeamShowList, {current: '1', size: PAGINATION_PAGE_SIZE, })
      if(isApiResponseOk(res)) {
        if(res.data.records && res.data.records.length) {
          yield put({
            type: 'getTeamShowDetail',
            payload: {
              id: res.data.records[0]['id']
            }
          })
        }
        yield put({
          type: 'updateDatas',
          payload: {
            currentOrgTeamShowList: res.data
          }
        })
        if(typeof calBack === 'function') {
          calBack()
        }
      }else{

      }
    },
    * routingJump({ payload }, { call, put }) {
      const { route } = payload
      yield put(routerRedux.push(route));
    },
  },

  reducers: {
    updateDatas(state, action) {
      return {
        ...state,
        datas: { ...state.datas, ...action.payload },
      }
    }
  },
});
