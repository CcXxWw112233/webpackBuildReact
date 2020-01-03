import { getGlobalSearchConditions, getFixedConditions, getGlobalSearchTypeList, getGlobalSearchResultList } from '../../../services/technological'
import { selectSearchTypeList, selectDefaultSearchTypeNormal, selectSelectedConditions, selectDefaultSearchType, selectAllTypeResultList, selectPageNumber, selectPageSize, selectSigleTypeResultList, selectSearchInputValue } from './select'
import { isApiResponseOk } from '../../../utils/handleResponseData'
import { message } from 'antd'
import {MEMBERS, MESSAGE_DURATION_TIME, ORGANIZATION} from "../../../globalset/js/constant";
import { selectProjectDetailBoardId } from '../select'
import { routerRedux } from "dva/router";

export default {
  namespace: 'globalSearch',
  state: {
    datas: {
      globalSearchModalVisible: false,
      searchTypeList: [], //查询类型列表
      defaultSearchType: '', //默认类型
      defaultSearchTypeNormal: '', //默认类型一进去缓存下来，不再高边
      allTypeResultList: [], //全部类型列表
      sigleTypeResultList: [], //单个类型列表
      searchInputValue: '', //输入框的值
      page_number: 1,
      page_size: 10,
      scrollBlock: true, //滚动锁
      loadMoreDisplay: 'block',
      loadMoreTextType: '1', //加载的文案 1暂无更多数据 2加载中 3加载更多
      spinning: false, //结果区域loading状态
      spinning_conditions: false, //条件区域loading状态
      match_conditions: [
        // {id: '1', value: 11, parent_name: 111, name: 1111},
        // {id: 2, value: 22, parent_name: 222, name: 2222},
        // {id: 3, value: 33, parent_name: 333, name: 3333},
      ], //输入匹配条件列表
      selected_conditions: [], //已选的条件列表
      fixed_conditions: [], // 固定搭配的条件列表
    }
  },
  subscriptions: {
    // setup({ dispatch, history }) {
    //   history.listen((location) => {
    //     function onkeyDown(event) {
    //       const e = event || window.event || arguments.callee.caller.arguments[0];
    //       const target = e.target
    //       let hash = window.location.hash
    //       if (hash.indexOf('?') !== -1) {
    //         hash = hash.split('?')[0]
    //       }
    //       const fiterTargetArray = ['input', 'textarea']
    //       // if (e && e.keyCode == 83 && fiterTargetArray.indexOf(target.nodeName.toLowerCase()) == -1 && target.getAttribute('role') != 'textbox' && hash.indexOf('/technological') != -1) {
    //       //   dispatch({
    //       //     type: 'updateDatas',
    //       //     payload: {
    //       //       globalSearchModalVisible: true
    //       //     }
    //       //   })
    //       // }
    //     }
    //     if (location.pathname.indexOf('/technological') !== -1) {
    //       window.addEventListener("keydown", onkeyDown, false);
    //     }else {

    //     }
    //   })
    // },
  },
  effects: {

    //获取类型列表 全部 项目 任务 流程 文档
    * getGlobalSearchTypeList({ payload = {} }, { call, put, select }) {
      const res = yield call(getGlobalSearchTypeList, payload)
      if(isApiResponseOk(res)) {
        const de = res.data && typeof res.data[0] == 'object' ? res.data[0]['search_type']: ''
        yield put({
          type: 'updateDatas',
          payload: {
            searchTypeList: res.data,
            defaultSearchType: de,
            defaultSearchTypeNormal: de,
          }
        })
        // debugger
      } else {
        message.error(res.message, MESSAGE_DURATION_TIME)
      }
    },

    //获取结果
    * getGlobalSearchResultList({ payload }, { call, put, select }) {
      const defaultSearchType = yield select(selectDefaultSearchType) || 1
      const searchInputValue = yield select(selectSearchInputValue)
      const page_number = yield select(selectPageNumber)
      const page_size = yield select(selectPageSize)
      const selected_conditions = yield select(selectSelectedConditions)
      const query_conditions = selected_conditions.map(val => {
        return {
          id: val['id'],
          value: val['value']
        }
      })

      const obj = {
        search_term: searchInputValue,
        search_type: defaultSearchType,
        query_conditions: JSON.stringify(query_conditions),
        page_size: defaultSearchType == '1' ? 5 : page_size,
        page_number,
        ...payload,
      }
      yield put({
        type: 'updateDatas',
        payload: {
          loadMoreTextType: '2',
          spinning: true
        }
      })
      const res = yield call(getGlobalSearchResultList, obj)
      yield put({
        type: 'updateDatas',
        payload: {
          spinning: false
        }
      })
      if(isApiResponseOk(res)) {
        const data = res.data.results
        if(defaultSearchType == '1') {
          let arr = []
          for(let i in data) {
            const obj = {
              listType: i,
              lists: data[i]['records'],
            }
            arr.push(obj)
          }
          yield put({
            type: 'updateDatas',
            payload: {
              allTypeResultList: arr
            }
          })
        } else {
          const sigleTypeResultList = yield select(selectSigleTypeResultList)
          const page_number = yield select(selectPageNumber)
          let arr = []
          let list = []

          if(page_number == 1) {
            for(let i in data) {
              const obj = {
                listType: i,
                lists: data[i]['records'],
              }
              arr.push(obj)
              list = data[i]
            }
          } else {
            arr = [...sigleTypeResultList]
            for(let i in data) {
              const arr_list = [].concat(arr[0]['lists'], data[i]['records'])
              arr[0]['lists'] = arr_list
              list = data[i]['records']
            }
          }

          yield put({
            type: 'updateDatas',
            payload: {
              sigleTypeResultList: arr,
              scrollBlock: !(list.length < page_size),
              loadMoreTextType: (list.length < page_size)?'1': '3',
            }
          })
        }
      } else {
        message.error(res.message, MESSAGE_DURATION_TIME)
      }
    },

    //获取搜索条件列表
    * getMatchConditions({ payload = {} }, { call, put, select }) {
      const searchInputValue = yield select(selectSearchInputValue)
      if(!!!searchInputValue) {
        return false
      }
      yield put({
        type: 'updateDatas',
        payload: {
          spinning_conditions: true
        }
      })
      const res = yield call(getGlobalSearchConditions, { keyword: searchInputValue })
      yield put({
        type: 'updateDatas',
        payload: {
          spinning_conditions: false
        }
      })
      if(isApiResponseOk(res)) {
        const data = res.data
        let new_match_conditions = []
        new_match_conditions = data.map(item => {
          const parent_id = item.id
          const parent_name = item.name
          const conditions = item['conditions'].map(child_item => {
            const { name, value } = child_item
            return {
              full_name: `${parent_name}： ${name}`,
              name,
              value,
              id: parent_id,
            }
          })
          const new_item = Object.assign(item, {conditions})
          return item
        })
        yield put({
          type: 'updateDatas',
          payload: {
            match_conditions: new_match_conditions
          }
        })
        // debugger
      } else {
        message.error(res.message, MESSAGE_DURATION_TIME)
      }
    },

    //获取固定搭配的条件列表
    * getFixedConditions({ payload = {} }, { call, put, select }) {
      const res = yield call(getFixedConditions, {})
      if(isApiResponseOk(res)) {
        const data = res.data
        let new_fixed_conditions = []
        new_fixed_conditions = data.map(item => {
          const query_conditions = item['query_conditions'].map(child_item => {
            const parent_id = child_item.id
            const parent_name = child_item.name
            const conditions = child_item.conditions
            const new_conditions_ = conditions.map(child_item_child => {
              const { name, value } = child_item_child
              return {
                full_name: `${parent_name}： ${name}`,
                name,
                value,
                id: parent_id,
              }
            })
            child_item.conditions = new_conditions_
            return child_item
          })
          const new_item = Object.assign(item, {query_conditions})
          return new_item
        })
        yield put({
          type: 'updateDatas',
          payload: {
            fixed_conditions: new_fixed_conditions
          }
        })
        // debugger
      } else {
        message.error(res.message, MESSAGE_DURATION_TIME)
      }
    },

    * routingJump({ payload }, { call, put }) {
      const { route } = payload
      yield put(routerRedux.push(route));
    },

  // 初始化model数据
    * initDatas({ payload }, { select, call, put }) {
      const defaultSearchTypeNormal = yield select(selectDefaultSearchTypeNormal)
      yield put({
        type: 'updateDatas',
        payload: {
          defaultSearchType: defaultSearchTypeNormal,
          globalSearchModalVisible: false,
          allTypeResultList: [], //全部类型列表
          sigleTypeResultList: [], //单个类型列表
          searchInputValue: '', //输入框的值
          page_number: 1,
          page_size: 10,
          scrollBlock: true, //滚动锁
          loadMoreDisplay: 'block',
          loadMoreTextType: '1', //加载的文案 1暂无更多数据 2加载中 3加载更多
          spinning: false, //结果区域loading状态
          spinning_conditions: false, //条件区域loading状态
          match_conditions: [], //输入匹配条件列表
          selected_conditions: [], //已选的条件列表
        }
      })
    }
  },

  reducers: {
    updateDatas(state, action) {
      return {
        ...state,
        datas: { ...state.datas, ...action.payload },
      }
    }
  },
};
