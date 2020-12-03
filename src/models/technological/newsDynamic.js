import {
  getNewsDynamicList,
  addCardNewComment,
  getNewsDynamicListActivity
} from '../../services/technological/newsDynamic'
import { isApiResponseOk } from '../../utils/handleResponseData'
import { message, notification } from 'antd'
import { MESSAGE_DURATION_TIME } from '../../globalset/js/constant'
import { routerRedux } from 'dva/router'
import { newsDynamicHandleTime, timestampToTime } from '../../utils/util'
import { selectNewsDynamicList, selectNewsDynamicListOriginal } from './select'
import Cookies from 'js-cookie'

export default {
  namespace: 'newsDynamic',
  state: [{}],
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        // message.destroy()
        //监听新消息setMessageItemEvent 公用函数

        if (
          location.pathname === '/technological/newsDynamic' ||
          location.pathname === '/technological/workbench'
        ) {
          dispatch({
            type: 'updateDatas',
            payload: {
              isFirstEntry: false, //是否第一次进来
              newsDynamicList: [], //存放消息记录的数组
              newsDynamicListOriginal: [],
              newsList: [], //动态消息列表
              isHasMore: true, //是否还可以查询更多
              isHasNewDynamic: false //是否有新消息
            }
          })
          dispatch({
            type: 'getNewsDynamicListActivity',
            payload: {
              next_id: '0'
            }
          })
        } else {
        }
      })
    }
  },
  effects: {
    *getNewsDynamicList({ payload }, { select, call, put }) {
      //获取评论列表
      const { next_id } = payload
      let res = yield call(getNewsDynamicList, next_id)
      if (next_id === '0') {
        //重新查询的情况,将存储的newsDynamicListOriginal设置为空，重新push
        yield put({
          type: 'updateDatas',
          payload: {
            newsDynamicListOriginal: []
          }
        })
      }
      let newsDynamicList = [] //yield select(selectNewsDynamicList)
      let newsDynamicListOriginal = yield select(selectNewsDynamicListOriginal)
      if (isApiResponseOk(res)) {
        //将所得到的数据进行日期分类
        newsDynamicListOriginal.push(...res.data.list)
        const data = newsDynamicListOriginal //res.data.list
        let dateArray = []
        let newDataArray = []
        for (let i = 0; i < data.length; i++) {
          dateArray.push(timestampToTime(data[i].map['create_time']))
        }
        dateArray = Array.from(new Set(dateArray))
        for (let i = 0; i < dateArray.length; i++) {
          const obj = {
            date: dateArray[i],
            dataList: []
          }
          for (let j = 0; j < data.length; j++) {
            if (dateArray[i] === timestampToTime(data[j].map['create_time'])) {
              obj['dataList'].push(data[j])
            }
          }
          newDataArray.push(obj)
        }
        newsDynamicList.push(...newDataArray)
        //-------------2018.10.18修改合并相邻相近任务
        let newsDynamicListTransform = JSON.parse(
          JSON.stringify(newsDynamicList)
        ) //[...newsDynamicList]
        //将相邻且activity_type_id相同而且type等于固定类型的归为一条
        const removeEmptyArrayEle = arr => {
          for (var i = 0; i < arr.length; i++) {
            if (arr[i] == undefined) {
              arr.splice(i, 1)
              i = i - 1 // i - 1 ,因为空元素在数组下标 2 位置，删除空之后，后面的元素要向前补位，
              // 这样才能真正去掉空元素,觉得这句可以删掉的连续为空试试，然后思考其中逻辑
            }
          }
          return arr
        }
        for (let i = 0; i < newsDynamicListTransform.length; i++) {
          const dataList = newsDynamicListTransform[i]['dataList']
          newsDynamicListTransform[i]['newDataList'] = []
          let isNearKeyTypeTwo = [] //与key相近的值是否有 activity_type_id相同而且type等于固定类型的归为一条,任务
          let isNearKeyTypeThree = [] //与key相近的值是否有 activity_type_id相同而且type等于固定类型的归为一条,评论
          dataList.map((value, key) => {
            if (isNearKeyTypeTwo.indexOf(key) !== -1) {
              return false
            }
            if (value.map['type'] === '2') {
              //处理任务
              let TypeArrayList = []
              for (let j = key; j < dataList.length - 1; j++) {
                if (
                  (dataList[j].map['type'] === '2' &&
                    value.map['activity_type_id'] ===
                      dataList[j].map['activity_type_id'] &&
                    dataList[j].map['activity_type_id'] ===
                      dataList[j + 1].map['activity_type_id']) ||
                  (dataList[j].map['type'] === '2' &&
                    j > 0 &&
                    value.map['activity_type_id'] ===
                      dataList[j].map['activity_type_id'] &&
                    dataList[j].map['activity_type_id'] ===
                      dataList[j - 1].map['activity_type_id'])
                ) {
                  isNearKeyTypeTwo.push(j)
                  TypeArrayList.push(dataList[j])
                } else {
                  break
                }
              }
              newsDynamicListTransform[i]['newDataList'][key] = {
                type: '2',
                TypeArrayList
              }
            } else if (value.map['type'] === '3') {
              //处理评论
              let TypeArrayList = []
              for (let j = key; j < dataList.length - 1; j++) {
                if (
                  (dataList[j].map['type'] === '3' &&
                    value.map['activity_type_id'] ===
                      dataList[j].map['activity_type_id'] &&
                    dataList[j].map['activity_type_id'] ===
                      dataList[j + 1].map['activity_type_id']) ||
                  (dataList[j].map['type'] === '3' &&
                    value.map['activity_type_id'] ===
                      dataList[j].map['activity_type_id'] &&
                    j > 0 &&
                    dataList[j].map['activity_type_id'] ===
                      dataList[j - 1].map['activity_type_id'])
                ) {
                  isNearKeyTypeTwo.push(j)
                  TypeArrayList.push(dataList[j])
                } else {
                  break
                }
              }
              newsDynamicListTransform[i]['newDataList'][key] = {
                type: '3',
                TypeArrayList
              }
            } else {
              newsDynamicListTransform[i]['newDataList'][key] = {
                type: value.map['type'],
                TypeArrayList: [dataList[key]]
              }
            }
          })
          //已经合并的任务存在了，但是未合并的单条任务没有存进来，需要手动添加
          for (
            let k = 0;
            k < newsDynamicListTransform[i]['newDataList'].length;
            k++
          ) {
            const newDataList = newsDynamicListTransform[i]['newDataList'][k]
            if (
              newDataList &&
              newDataList['type'] === '2' &&
              !newDataList['TypeArrayList'].length
            ) {
              newDataList['TypeArrayList'] = [
                newsDynamicListTransform[i]['dataList'][k]
              ]
            } else if (
              newDataList &&
              newDataList['type'] === '3' &&
              !newDataList['TypeArrayList'].length
            ) {
              newDataList['TypeArrayList'] = [
                newsDynamicListTransform[i]['dataList'][k]
              ]
            }
          }
          newsDynamicListTransform[i]['newDataList'] = removeEmptyArrayEle(
            newsDynamicListTransform[i]['newDataList']
          ) //去除空数组
        }
        //-------------2018.10.18修改合并相邻相近任务结束
        yield put({
          type: 'updateDatas',
          payload: {
            newsDynamicList: newsDynamicListTransform, //: newsDynamicList,
            newsDynamicListOriginal,
            next_id: res.data.next_id,
            isHasMore: res.data.list.length ? true : false
          }
        })
      } else {
      }
    },

    *getNewsDynamicListActivity({ payload }, { select, call, put }) {
      //获取评论列表
      const { next_id } = payload
      let res = yield call(getNewsDynamicListActivity, { next_id })
      // console.log(res, 'sssss')
      if (next_id === '0') {
        //重新查询的情况,将存储的newsDynamicListOriginal设置为空，重新push
        yield put({
          type: 'updateDatas',
          payload: {
            newsDynamicListOriginal: []
          }
        })
      }
      let newsDynamicList = [] //yield select(selectNewsDynamicList)
      let newsDynamicListOriginal = yield select(selectNewsDynamicListOriginal)
      if (isApiResponseOk(res)) {
        //将所得到的数据进行日期分类
        newsDynamicListOriginal = [].concat(
          newsDynamicListOriginal,
          res.data.activity || []
        )
        // console.log('res_0', JSON.stringify(res.data[0]))
        const data = [...newsDynamicListOriginal] //res.data.list
        let dateArray = []
        let newDataArray = []
        for (let i = 0; i < data.length; i++) {
          dateArray.push(timestampToTime(data[i]['created']))
        }
        dateArray = Array.from(new Set(dateArray))
        // console.log(dateArray, 'sssssss')
        for (let i = 0; i < dateArray.length; i++) {
          const obj = {
            date: dateArray[i],
            dataList: []
          }
          for (let j = 0; j < data.length; j++) {
            if (dateArray[i] === timestampToTime(data[j]['created'])) {
              obj['dataList'].push(data[j])
            }
          }
          newDataArray.push(obj)
        }
        // console.log(obj, 'ssssss')
        newsDynamicList.push(...newDataArray)
        // console.log('eeee', 2, newsDynamicList)
        //-------------2018.10.18修改合并相邻相近任务
        let newsDynamicListTransform = JSON.parse(
          JSON.stringify(newsDynamicList)
        ) //[...newsDynamicList]
        // console.log(newsDynamicListTransform, 'ssssssss')
        //将相邻且activity_type_id相同而且type等于固定类型的归为一条
        const removeEmptyArrayEle = arr => {
          for (var i = 0; i < arr.length; i++) {
            if (arr[i] == undefined) {
              arr.splice(i, 1)
              i = i - 1 // i - 1 ,因为空元素在数组下标 2 位置，删除空之后，后面的元素要向前补位，
              // 这样才能真正去掉空元素,觉得这句可以删掉的连续为空试试，然后思考其中逻辑
            }
          }
          return arr
        }
        // debugger
        for (let i = 0; i < newsDynamicListTransform.length; i++) {
          const dataList = newsDynamicListTransform[i]['dataList']
          newsDynamicListTransform[i]['newDataList'] = []
          let isNearKeyTypeTwo = [] //与key相近的值是否有 activity_type_id相同而且type等于固定类型的归为一条,任务
          let isNearKeyTypeThree = [] //与key相近的值是否有 activity_type_id相同而且type等于固定类型的归为一条,评论
          dataList.map((value, key) => {
            if (isNearKeyTypeTwo.indexOf(key) !== -1) {
              return false
            }
            if (value['rela_type'] === '11') {
              //处理任务
              let TypeArrayList = []
              for (let j = key; j < dataList.length - 1; j++) {
                if (
                  (dataList[j]['rela_type'] === '11' &&
                    value['rela_id'] === dataList[j]['rela_id'] &&
                    dataList[j]['rela_id'] === dataList[j + 1]['rela_id']) ||
                  (dataList[j]['rela_type'] === '11' &&
                    j > 0 &&
                    value['rela_id'] === dataList[j]['rela_id'] &&
                    dataList[j]['rela_id'] === dataList[j - 1]['rela_id'])
                ) {
                  isNearKeyTypeTwo.push(j)
                  TypeArrayList.push(dataList[j])
                } else {
                  break
                }
              }
              newsDynamicListTransform[i]['newDataList'][key] = {
                rela_type: '11',
                TypeArrayList
              }
            } else if (value['rela_type'] === '14') {
              //处理评论
              let TypeArrayList = []
              for (let j = key; j < dataList.length - 1; j++) {
                if (
                  (dataList[j]['rela_type'] === '14' &&
                    value['rela_id'] === dataList[j]['rela_id'] &&
                    dataList[j]['rela_id'] === dataList[j + 1]['rela_id']) ||
                  (dataList[j]['rela_type'] === '14' &&
                    value['rela_id'] === dataList[j]['rela_id'] &&
                    j > 0 &&
                    dataList[j]['rela_id'] === dataList[j - 1]['rela_id'])
                ) {
                  isNearKeyTypeTwo.push(j)
                  TypeArrayList.push(dataList[j])
                } else {
                  break
                }
              }
              newsDynamicListTransform[i]['newDataList'][key] = {
                rela_type: '14',
                TypeArrayList
              }
            } else {
              newsDynamicListTransform[i]['newDataList'][key] = {
                rela_type: value['rela_type'],
                TypeArrayList: [dataList[key]]
              }
            }
          })
          //已经合并的任务存在了，但是未合并的单条任务没有存进来，需要手动添加
          for (
            let k = 0;
            k < newsDynamicListTransform[i]['newDataList'].length;
            k++
          ) {
            const newDataList = newsDynamicListTransform[i]['newDataList'][k]
            if (
              newDataList &&
              newDataList['rela_type'] === '11' &&
              !newDataList['TypeArrayList'].length
            ) {
              newDataList['TypeArrayList'] = [
                newsDynamicListTransform[i]['dataList'][k]
              ]
            } else if (
              newDataList &&
              newDataList['rela_type'] === '14' &&
              !newDataList['TypeArrayList'].length
            ) {
              newDataList['TypeArrayList'] = [
                newsDynamicListTransform[i]['dataList'][k]
              ]
            }
          }
          newsDynamicListTransform[i]['newDataList'] = removeEmptyArrayEle(
            newsDynamicListTransform[i]['newDataList']
          ) //去除空数组
        }
        // debugger
        //-------------2018.10.18修改合并相邻相近任务结束
        // console.log(2, newsDynamicListTransform)
        yield put({
          type: 'updateDatas',
          payload: {
            newsDynamicList: newsDynamicListTransform, //: newsDynamicList,
            newsDynamicListOriginal,
            next_id: res.data.next_id,
            isHasMore:
              res.data.activity && res.data.activity.length ? true : false
          }
        })
      } else {
      }
    },

    *handleWs({ payload }, { select, call, put }) {
      //获取评论列表
      const { newsItem } = payload
      let newsDynamicList = [] //yield select(selectNewsDynamicList)
      let newsDynamicListOriginal = yield select(
        selectNewsDynamicListOriginal
      ) || []
      //将所得到的数据进行日期分类
      const data = [...newsDynamicListOriginal]
      data.unshift(newsItem)
      let dateArray = []
      let newDataArray = []
      for (let i = 0; i < data.length; i++) {
        dateArray.push(timestampToTime(data[i]['created']))
      }
      dateArray = Array.from(new Set(dateArray))
      for (let i = 0; i < dateArray.length; i++) {
        const obj = {
          date: dateArray[i],
          dataList: []
        }
        for (let j = 0; j < data.length; j++) {
          if (dateArray[i] === timestampToTime(data[j]['created'])) {
            obj['dataList'].push(data[j])
          }
        }
        newDataArray.push(obj)
      }
      newsDynamicList.push(...newDataArray)
      // console.log('eeee', 2, newsDynamicList)
      //-------------2018.10.18修改合并相邻相近任务
      let newsDynamicListTransform = JSON.parse(JSON.stringify(newsDynamicList)) //[...newsDynamicList]
      //将相邻且activity_type_id相同而且type等于固定类型的归为一条
      const removeEmptyArrayEle = arr => {
        for (var i = 0; i < arr.length; i++) {
          if (arr[i] == undefined) {
            arr.splice(i, 1)
            i = i - 1 // i - 1 ,因为空元素在数组下标 2 位置，删除空之后，后面的元素要向前补位，
            // 这样才能真正去掉空元素,觉得这句可以删掉的连续为空试试，然后思考其中逻辑
          }
        }
        return arr
      }
      // debugger
      for (let i = 0; i < newsDynamicListTransform.length; i++) {
        const dataList = newsDynamicListTransform[i]['dataList']
        newsDynamicListTransform[i]['newDataList'] = []
        let isNearKeyTypeTwo = [] //与key相近的值是否有 activity_type_id相同而且type等于固定类型的归为一条,任务
        let isNearKeyTypeThree = [] //与key相近的值是否有 activity_type_id相同而且type等于固定类型的归为一条,评论
        dataList.map((value, key) => {
          if (isNearKeyTypeTwo.indexOf(key) !== -1) {
            return false
          }
          if (value['rela_type'] === '11') {
            //处理任务
            let TypeArrayList = []
            for (let j = key; j < dataList.length - 1; j++) {
              if (
                (dataList[j]['rela_type'] === '11' &&
                  value['rela_id'] === dataList[j]['rela_id'] &&
                  dataList[j]['rela_id'] === dataList[j + 1]['rela_id']) ||
                (dataList[j]['rela_type'] === '11' &&
                  j > 0 &&
                  value['rela_id'] === dataList[j]['rela_id'] &&
                  dataList[j]['rela_id'] === dataList[j - 1]['rela_id'])
              ) {
                isNearKeyTypeTwo.push(j)
                TypeArrayList.push(dataList[j])
              } else {
                break
              }
            }
            newsDynamicListTransform[i]['newDataList'][key] = {
              rela_type: '11',
              TypeArrayList
            }
          } else if (value['rela_type'] === '14') {
            //处理评论
            let TypeArrayList = []
            for (let j = key; j < dataList.length - 1; j++) {
              if (
                (dataList[j]['rela_type'] === '14' &&
                  value['rela_id'] === dataList[j]['rela_id'] &&
                  dataList[j]['rela_id'] === dataList[j + 1]['rela_id']) ||
                (dataList[j]['rela_type'] === '14' &&
                  value['rela_id'] === dataList[j]['rela_id'] &&
                  j > 0 &&
                  dataList[j]['rela_id'] === dataList[j - 1]['rela_id'])
              ) {
                isNearKeyTypeTwo.push(j)
                TypeArrayList.push(dataList[j])
              } else {
                break
              }
            }
            newsDynamicListTransform[i]['newDataList'][key] = {
              rela_type: '14',
              TypeArrayList
            }
          } else {
            newsDynamicListTransform[i]['newDataList'][key] = {
              rela_type: value['rela_type'],
              TypeArrayList: [dataList[key]]
            }
          }
        })
        //已经合并的任务存在了，但是未合并的单条任务没有存进来，需要手动添加
        for (
          let k = 0;
          k < newsDynamicListTransform[i]['newDataList'].length;
          k++
        ) {
          const newDataList = newsDynamicListTransform[i]['newDataList'][k]
          if (
            newDataList &&
            newDataList['rela_type'] === '11' &&
            !newDataList['TypeArrayList'].length
          ) {
            newDataList['TypeArrayList'] = [
              newsDynamicListTransform[i]['dataList'][k]
            ]
          } else if (
            newDataList &&
            newDataList['rela_type'] === '14' &&
            !newDataList['TypeArrayList'].length
          ) {
            newDataList['TypeArrayList'] = [
              newsDynamicListTransform[i]['dataList'][k]
            ]
          }
        }
        newsDynamicListTransform[i]['newDataList'] = removeEmptyArrayEle(
          newsDynamicListTransform[i]['newDataList']
        ) //去除空数组
      }
      // debugger
      //-------------2018.10.18修改合并相邻相近任务结束
      // console.log(2, newsDynamicListTransform)
      yield put({
        type: 'updateDatas',
        payload: {
          newsDynamicList: newsDynamicListTransform, //: newsDynamicList,
          newsDynamicListOriginal: data
        }
      })
    },

    *addCardNewComment({ payload }, { select, call, put }) {
      //
      const {
        card_id,
        comment,
        parentKey,
        childrenKey,
        valueItem,
        board_id
      } = payload
      let res = yield call(addCardNewComment, { card_id, comment, board_id })
      if (isApiResponseOk(res)) {
        // 将评论的内容添加到前面
        const newsDynamicList = yield select(selectNewsDynamicList)
        let newItem = JSON.parse(
          JSON.stringify(
            newsDynamicList[parentKey]['newDataList'][childrenKey][
              'TypeArrayList'
            ][0]
          )
        )
        const {
          user_name,
          user_id,
          full_name,
          name,
          mobile,
          email,
          avatar
        } = JSON.parse(localStorage.getItem('userInfo'))
        const obj = {
          name,
          mobile,
          email,
          avatar,
          id: user_id
        }
        newItem.creator = obj
        newItem.content.card_comment = {
          id: res.data.id,
          text: comment
        }
        newsDynamicList[parentKey]['newDataList'][childrenKey][
          'TypeArrayList'
        ].unshift(newItem)
        // console.log(res)
        yield put({
          type: 'updateDatas',
          payLoad: {
            newsDynamicList
          }
        })
      } else {
        message.error(res.message)
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
