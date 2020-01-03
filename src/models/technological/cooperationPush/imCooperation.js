import { isApiResponseOk } from '../../../utils/handleResponseData'
import { message } from 'antd'
import { MESSAGE_DURATION_TIME } from "../../../globalset/js/constant";
import { routerRedux } from "dva/router";
import queryString from 'query-string';
import { getModelSelectDatasState, getModelSelectState } from '../../utils'
import { getGanttBoardsFiles } from '../../../services/technological/gantt'
// import { Im } from 'lingxi-im'
const { Im } = global.constants

// 该model是圈子推送已读未读的内容
export default {
    namespace: 'imCooperation',
    state: {
        im_all_latest_unread_messages: [], //最新未读消息列表
        // im_latest_unread_message: {}, //最新未读
        im_all_latest_readed_messages: [], //最新已读列表
        im_alarm_no_reads_total: 0, //圈子未读消息（显示在极简模式右边消息按钮）
        wil_handle_types: [
            'board.card.create',
            'board.card.update.file.add',
            'board.file.upload',
            'board.file.version.upload',
        ]
    },
    subscriptions: {
        setup({ dispatch, history }) {
            history.listen((location) => {
            })
        },
    },
    effects: {
        * getImUnReadAllMessages({ payload }, { select, call, put }) { //获取和设置全部未读消息
            const { messages = [] } = payload
            console.log('ssss_初始化首次传递', messages)
            const wil_handle_types = yield select(getModelSelectState('imCooperation', 'wil_handle_types'))
            const im_all_latest_unread_messages = messages.filter(item => {
                if (item && wil_handle_types.indexOf(item.action) != -1) {
                    return item
                }
            })
            console.log('ssss_初始化首次传递过滤类型', im_all_latest_unread_messages)
            yield put({
                type: 'updateDatas',
                payload: {
                    im_all_latest_unread_messages
                }
            })
        },
        * imUnReadMessageItemClear({ payload }, { call, put, select }) { //未读消息清除,场景（当用户点开某一条具有红点的消息后，会清除该条消息）
            const { relaDataId } = payload
            let im_all_latest_unread_messages = yield select(getModelSelectState('imCooperation', 'im_all_latest_unread_messages'))
            im_all_latest_unread_messages = im_all_latest_unread_messages.filter(item => !!item)
            const idServer = (im_all_latest_unread_messages.find((item) => item.relaDataId == relaDataId || item.cardId == relaDataId) || {}).idServer
            const target = (im_all_latest_unread_messages.find((item) => item.relaDataId == relaDataId || item.cardId == relaDataId) || {}).target
            im_all_latest_unread_messages = im_all_latest_unread_messages.filter(item => item.relaDataId != relaDataId && item.cardId != relaDataId)
            yield put({
                type: 'updateDatas',
                payload: {
                    im_all_latest_unread_messages
                }
            })
            // debugger
            // 告知im消息已读
            if (!!!idServer) {
                return
            }
            yield put({
                type: 'imMessageToRead',
                payload: {
                    idServer,
                    target
                }
            })
        },
        * listenImLatestAreadyReadMessages({ payload }, { select, call, put }) { //在触发的已读推送,已读后更新未读列表
            const { messages = [] } = payload
            console.log('ssss_已读列表_model', messages)
            let im_all_latest_unread_messages = yield select(getModelSelectState('imCooperation', 'im_all_latest_unread_messages'))
            const arr = im_all_latest_unread_messages.filter(item => {
                if (messages.findIndex((item2) => item2 == item.idServer) != -1) { //传递进来的已读列表不包含该条未读消息
                    return item
                }
            })
            const reads = arr.map(item => ({ idServer: item.idServer, target: item.target }))
            yield put({
                type: 'imMessageToRead',  //sad
                payload: {
                    reads
                }
            })
            im_all_latest_unread_messages = im_all_latest_unread_messages.filter(item => {
                if (messages.findIndex((item2) => item2 == item.idServer) == -1) { //传递进来的已读列表不包含该条未读消息
                    return item
                }
            })
            yield put({
                type: 'updateDatas',
                payload: {
                    im_all_latest_unread_messages
                }
            })
        },
        * listenImUnReadLatestMessage({ payload }, { select, call, put }) { //获取最新的一条未读消息推送
            const { message_item = {} } = payload
            console.log('ssss_最新未读_model', message_item)
            const wil_handle_types = yield select(getModelSelectState('imCooperation', 'wil_handle_types'))
            const { action } = message_item
            if (wil_handle_types.indexOf(action) == -1) {
                return
            }
            let im_all_latest_unread_messages = yield select(getModelSelectState('imCooperation', 'im_all_latest_unread_messages'))
            let arr = [...im_all_latest_unread_messages]
            arr.push(message_item)
            yield put({
                type: 'getImUnReadAllMessages',
                payload: {
                    messages: arr
                }
            })
            // yield put({
            //     type: 'handelGanttCardCreate',
            //     payload: {
            //         message_item
            //     }
            // })
        },
        * imMessageToRead({ payload }, { call, put }) { //im的某一条消息设置已读
            const { idServer, target, reads = [] } = payload
            // debugger
            if (Im) {
                const params = idServer ? { idServer, target } : reads
                console.log('sssss_read_params', params)
                Im.fireEvent('readMsg', params)
            }
        },
        // 处理甘特图
        * handelGanttCardCreate({ payload }, { call, put }) { //im的某一条消息设置已读
            const { message_item = {} } = payload
            const { content_data, action } = message_item
            const contentJson = JSON.parse(content_data) || {}
            const { data = {} } = contentJson
            const { d = "{}" } = data
            const gold_data = JSON.parse(d) || {}
            console.log('sssss_gold_data', gold_data)
            if (action == 'board.card.create') {

            }
            // debugger
        },
    },

    reducers: {
        updateDatas(state, action) {
            return {
                ...state, ...action.payload
            }
        }
    },
}

