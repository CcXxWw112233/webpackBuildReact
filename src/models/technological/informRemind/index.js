// 通知提醒的数据
import { getTriggerList, getTriggerHistory, setRemindInformation, updateRemindInformation, delRemindInformation } from '@/services/technological/informRemind'
import { isApiResponseOk } from '@/utils/handleResponseData'
import { message } from 'antd';
import { getModelSelectState } from '@/models/utils'
import { getSelectState } from './select'


export default {
    namespace: 'informRemind',
    state: {
      diff_remind_time: [
        { remind_time_value: 1 },
        { remind_time_value: 2 },
        { remind_time_value: 3 },
        { remind_time_value: 4 },
        { remind_time_value: 5 },
        { remind_time_value: 6 },
        { remind_time_value: 7 },
        { remind_time_value: 8 },
        { remind_time_value: 9 },
        { remind_time_value: 10 },
        { remind_time_value: 11 },
        { remind_time_value: 12 },
        { remind_time_value: 13 },
        { remind_time_value: 14 },
        { remind_time_value: 15 },
        { remind_time_value: 16 },
        { remind_time_value: 17 },
        { remind_time_value: 18 },
        { remind_time_value: 19 },
        { remind_time_value: 20 },
        { remind_time_value: 21 },
        { remind_time_value: 22 },
        { remind_time_value: 23 },
        { remind_time_value: 24 },
        { remind_time_value: 25 },
        { remind_time_value: 26 },
        { remind_time_value: 27 },
        { remind_time_value: 28 },
        { remind_time_value: 29 },
        { remind_time_value: 30 },
        { remind_time_value: 31 },
        { remind_time_value: 32 },
        { remind_time_value: 33 },
        { remind_time_value: 34 },
        { remind_time_value: 35 },
        { remind_time_value: 36 },
        { remind_time_value: 37 },
        { remind_time_value: 38 },
        { remind_time_value: 39 },
        { remind_time_value: 40 },
        { remind_time_value: 41 },
        { remind_time_value: 42 },
        { remind_time_value: 43 },
        { remind_time_value: 44 },
        { remind_time_value: 45 },
        { remind_time_value: 46 },
        { remind_time_value: 47 },
        { remind_time_value: 48 },
        { remind_time_value: 49 },
        { remind_time_value: 50 },
        { remind_time_value: 51 },
        { remind_time_value: 52 },
        { remind_time_value: 53 },
        { remind_time_value: 54 },
        { remind_time_value: 55 },
        { remind_time_value: 56 },
        { remind_time_value: 57 },
        { remind_time_value: 58 },
        { remind_time_value: 59 },
        { remind_time_value: 60 },
      ], // 1-60不同的时间段
      diff_text_term: [
        { remind_time_type: 'm', txtVal: '分钟' },
        { remind_time_type: 'h', txtVal: '小时' },
        { remind_time_type: 'd', txtVal: '天数' },
      ], // 匹配不同的字段类型
      historyList: [], // 保存设置的历史记录提醒
      setInfoRemindList: [
        {
          rela_id: '',
          rela_type: '',
          remind_trigger: '',
          remind_time_type: 'm',
          remind_time_value: '1',
          message_consumers: [],
          
        }
      ], // 设置提醒的信息列表
      triggerList: [], // 每个对应的选项的类型列表
      is_add_remind: false, // 是否点击了添加操作 默认为false 没有点击
      remind_trigger: '', // 提醒触发器类型
      remind_time_type: 'm', // 提醒时间类型 m=分钟 h=小时 d=天 datetime=时间日期
      remind_time_value: '1', // 提醒时间值 如果是自定义时间传时间戳11位
      remind_edit_type: 1, // 可编辑的类型
      message_consumers: [],
    },

    subscriptions: {
      setup({ dispatch, history }) {
        history.listen((location) => {
         dispatch({
           type: 'updateDatas', 
           payload: {
            triggerList: [],
            historyList: [],
            setInfoRemindList: [
              {
                rela_id: '',
                rela_type: '',
                remind_trigger: '',
                remind_time_type: 'm',
                remind_time_value: '1',
                message_consumers: [], 
              }
            ], // 设置提醒的信息列表
           }
         })
        })
    
      }
    },

    effects: {

      // 获取事件类型列表的方法
      * getTriggerList({ payload = {} }, { select, call, put }) {
        const { rela_type } = payload
        const res = yield call(getTriggerList, rela_type)
        if(!isApiResponseOk(res)) {
          message.error(res.message)
          return
        }
        yield put({
          type: 'updateDatas',
          payload: {
            triggerList: res.data,
            remind_trigger: res.data[0].type_code,
            remind_edit_type: res.data[0].remind_edit_type
          }
        })
      },

      // 获取是否存在历史记录的方法
      * getTriggerHistory({ payload = {} }, { select, call, put }) {
        const { rela_id } = payload
        const res = yield call(getTriggerHistory, rela_id)
        if(!isApiResponseOk(res)) {
          message.error(res.message)
          return
        }
        yield put({
          type: 'updateDatas',
          payload: {
            historyList: res.data, // 将结果赋值给一个列表
          }
        })
      },

      // 更新消息提醒的方法
      * updateRemindInformation({ payload = {} }, { select, call, put }) { 
        const { rela_id } = payload
        // console.log(payload, 'ssss')
        const updateInfoRemind = {...payload.result}
        // console.log(updateInfoRemind, 'ss')
        const { id, remind_trigger, remind_time_type, remind_time_value, message_consumers} = updateInfoRemind
        // console.log(message_consumers, 'pppp')
        let temp_user = [] // 存放用户的id
        for(var i in message_consumers) {
          temp_user.push(message_consumers[i].user_id)
        }
        const data = {
          id,
          remind_trigger,
          remind_time_type,
          remind_time_value,
          users: temp_user
        }
        const res = yield call(updateRemindInformation, data)
        if(!isApiResponseOk(res)) {
          message.error(res.message)
          return
        }
        const delay = (ms) => new Promise(resolve => {
          setTimeout(resolve, ms)
        })
        yield call(delay, 500)
        yield put({
          type: 'getTriggerHistory',
          payload: {
            rela_id
          }
        })
      },

      // 设置提醒的方法
      * setRemindInformation({ payload = {} }, { select, call, put }) {
        const [{ rela_id, rela_type, remind_time_type, remind_time_value, remind_trigger, message_consumers }] = yield select(getModelSelectState('informRemind', 'setInfoRemindList'))
        let tempId = []
        for(var i in message_consumers) {
          if (message_consumers[i].user_id) {
            tempId.push(message_consumers[i].user_id)
          }
        }
        const data = {
          rela_id,
          rela_type,
          remind_time_type,
          remind_time_value,
          remind_trigger,
          users: tempId
        }
        const res = yield call(setRemindInformation, data)
        if(!isApiResponseOk(res)) {
          message.error(res.message)
          return
        }
        yield put({
          type: 'getTriggerHistory',
          payload: {
            rela_id
          }
        })
      },

      // 删除提醒的方法
      * delRemindInformation({ payload = {} }, { select, call, put }) {
        const { id, rela_id } = payload
        const res = yield call(delRemindInformation, id)
        if(!isApiResponseOk(res)) {
          message.error(res.message)
          return
        }
        yield put({
          type: 'getTriggerHistory',
          payload: {
            rela_id
          }
        })
      }


    },
    
    reducers: {
      updateDatas(state, action) {
      // console.log(state, action)
        return {
          ...state, ...action.payload
          // datas: { ...state.datas, ...action.payload },
        }
      }
    },
  }
  