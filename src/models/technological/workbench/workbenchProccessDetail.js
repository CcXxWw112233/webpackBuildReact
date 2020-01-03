import { message } from 'antd'
import { routerRedux } from "dva/router";
import Cookies from "js-cookie";
import modelExtend from 'dva-model-extend'
import workbench from './index'
import {
  completeProcessTask,
  createProcess,
  fillFormComplete,
  getProcessInfo,
  getProcessList,
  getProcessTemplateList,
  getProessDynamics,
  getTemplateInfo,
  rebackProcessTask,
  rejectProcessTask,
  resetAsignees,
  saveProcessTemplate,
  addWorkFlowComment,
  getWorkFlowComment,
  workflowDelete,
  workflowEnd,
  deleteWorkFlowComment
} from "../../../services/technological/process";
import {MESSAGE_DURATION_TIME} from "../../../globalset/js/constant";
import {
  selectCurrentProcessInstanceId,
  selectProcessTotalId,
  selectCurr_node_sort,
  selectNode_amount,
  selectBackLogProcessList,
  selectProcessCommentList,
  selectCurrentProcessCompletedStepWorkbench,
  selectProcessInfoWorkbench
} from "../select";
import {isApiResponseOk} from "../../../utils/handleResponseData";
import {
  processEditDatasConstant,
  processEditDatasRecordsConstant
} from "../../../routes/Technological/components/ProjectDetail/Process/constant";
import QueryString from 'querystring'

let board_id = null
let appsSelectKey = null
let flow_id = null
export default modelExtend(workbench, {
  namespace: 'workbenchDetailProcess',
  state: [],
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen((location) => {

        const param = QueryString.parse(location.search.replace('?', ''))
        board_id = param.board_id
        appsSelectKey = param.appsSelectKey
        flow_id = param.flow_id

        if (location.pathname.indexOf('technological/workbench') !== -1) {
          dispatch({
            type: 'updateDatas',
            payload: {
              //流程
              processPageFlagStep: '1', //"1""2""3""4"分别对应欢迎，编辑，确认，详情界面,默认1
              node_type: '1', //节点类型， 默认1
              processCurrentEditStep: 0, //编辑第几步，默认 0
              processEditDatas: JSON.parse(JSON.stringify(processEditDatasConstant)), //json数组，每添加一步编辑内容往里面put进去一个obj,刚开始默认含有一个里程碑的
              processEditDatasRecords: JSON.parse(JSON.stringify(processEditDatasRecordsConstant)), //每一步的每一个类型，记录，数组的全部数据step * type
              processTemplateList: [], //流程模板列表
              templateInfo: {}, //所选择的流程模板的信息数据
              processInfo: {}, //所选中的流程的信息
              processList: [], //流程列表
              processDynamics: [], //流程动态列表,
              currentProcessInstanceId: '', //当前查看的流程实例id
              workFlowComments: [], //当前流程评论
              processCurrentCompleteStep: 0 //当前处于的操作步数
            }
          })

          // dispatch({
          //   type: 'getProcessTemplateList',
          //   payload: {
          //     board_id: board_id
          //   }
          // })

          // dispatch({
          //   type: 'getProcessList',
          //   payload: {
          //     board_id: board_id,
          //     type: '1'
          //   }
          // })

          if(flow_id) {
            dispatch({
              type: 'getProcessInfoByUrl',
              payload: {
                currentProcessInstanceId: flow_id
              }
            })
          }

        }
      })
    },
  },
  effects: {
    //流程
    * getProcessTemplateList({ payload }, { select, call, put }) {
      const { board_id, calback } = payload
      let res = yield call(getProcessTemplateList, {board_id})
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            processTemplateList: res.data || []
          }
        })
        if(typeof calback === 'function') {
          calback()
        }
      }else{

      }
    },
    //保存流程模板
    * saveProcessTemplate({ payload }, { select, call, put }) {
      let res = yield call(saveProcessTemplate, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'getProcessTemplateList',
          payload: {
            board_id: board_id,
            calback: function () {
              message.success('保存模板成功', MESSAGE_DURATION_TIME)
            }
          }
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    // 直接启动时保存模板但不保留，查询该模板，将数据保留用于启动流程
    * directStartSaveTemplate({ payload }, { select, call, put }) {
      let res = yield call(saveProcessTemplate, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'getTemplateInfo',
          payload: res.data.flow_template_id
        })
      }else{

      }
    },
    * getTemplateInfo({ payload }, { select, call, put }) {
      let res = yield call(getTemplateInfo, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            templateInfo: res.data,
            processEditDatas: res.data.nodes,
            processPageFlagStep: '3'
          }
        })
      }else{

      }
    },
    * getProcessList({ payload }, { select, call, put }) {
      let res = yield call(getProcessList, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            processList: res.data
          }
        })
      }else{

      }
    },
    * createProcess({ payload }, { select, call, put }) {
      const res = yield call(createProcess, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'getProcessList',
          payload: {
            board_id: board_id,
            type: '1'
          }
        })
        yield put({
          type: 'getProcessInfo',
          payload: {
            id: res.data.id
          }
        })
      }else{
        message.warn(res.message)
      }
    },

    * changeFlowIdToUrl({ payload }, { select, call, put }) {
      const { currentProcessInstanceId } = payload
      yield put({
        type: 'routingJump',
        payload: {
          route: `/technological/projectDetail?board_id=${board_id}&appsSelectKey=${appsSelectKey}&flow_id=${currentProcessInstanceId}`
        }
      })
    },

    * getProcessInfoByUrl({ payload }, { select, call, put }) {
      const { currentProcessInstanceId } = payload
      yield put({
        type: 'updateDatas',
        payload: {
          currentProcessInstanceId
        }
      })
      let res = yield call(getProcessInfo, currentProcessInstanceId)
      if(isApiResponseOk(res)) {
        //设置当前节点排行,数据返回只返回当前节点id,要根据id来确认当前走到哪一步
        const curr_node_id = res.data.curr_node_id
        let curr_node_sort
        for (let i=0; i<res.data.nodes.length; i++ ) {
          if(curr_node_id === res.data.nodes[i].id) {
            curr_node_sort = res.data.nodes[i].sort
            break
          }
        }
        curr_node_sort = curr_node_sort || res.data.nodes.length + 1 //如果已全部完成了会是一个undefind,所以给定一个值
        yield put({
          type: 'updateDatas',
          payload: {
            processInfo: {...res.data, curr_node_sort},
            processEditDatas: res.data.nodes || [],
            processPageFlagStep: '4'
          }
        })
        //查询流程动态
        const res2 = yield call(getProessDynamics, {currentProcessInstanceId})
        if(isApiResponseOk(res2)) {
          yield put({
            type: 'updateDatas',
            payload: {
              processDynamics: res2.data
            }
          })
        }else{

        }
      }else{

      }
    },
    * getProcessInfo({ payload }, { select, call, put }) {
      yield put({
        type: 'updateDatas',
        payload
      })
      const { id, calback } = payload
      let res = yield call(getProcessInfo, id)
      if(isApiResponseOk(res)) {
        //设置当前节点排行,数据返回只返回当前节点id,要根据id来确认当前走到哪一步
        const curr_node_id = res.data.curr_node_id
        let curr_node_sort
        for (let i=0; i<res.data.nodes.length; i++ ) {
          if(curr_node_id === res.data.nodes[i].id) {
            curr_node_sort = res.data.nodes[i].sort
            break
          }
        }
        curr_node_sort = curr_node_sort || res.data.nodes.length + 1 //如果已全部完成了会是一个undefind,所以给定一个值
        yield put({
          type: 'updateDatas',
          payload: {
            processInfo: { ...res.data, curr_node_sort },
            processEditDatas: res.data.nodes || [],
            processPageFlagStep: '4'
          }
        })

        //查询流程动态
        const res2 = yield call(getProessDynamics, {currentProcessInstanceId: id})
        if(isApiResponseOk(res2)) {
          yield put({
            type: 'updateDatas',
            payload: {
              processDynamics: res2.data
            }
          })
        }else{

        }
        if(typeof calback === 'function') {
          calback()
        }
      }else{

      }
    },
    * listenWsProcessDynamics({ payload }, { select, call, put }) {
      //查询流程动态
      const { newsData } = payload
      const id = newsData.rela_id
      const newsUserId = newsData.userId
      const currentUserId = JSON.parse(localStorage.getItem('userInfo')).id
      const currentProcessInstanceId = yield select(selectCurrentProcessInstanceId)
      // console.log('进入查询状态之前', id, currentProcessInstanceId, newsUserId, currentUserId)

      // 当且仅当发送消息的用户不是当前用户， 当前查看的流程id和推送的id一样
      if(id === currentProcessInstanceId && newsUserId !== currentUserId) {
        // console.log('进入查询状态')
        const res = yield call(getProessDynamics, {flow_instance_id: id})
        if(isApiResponseOk(res)) {
          yield put({
            type: 'updateDatas',
            payload: {
              processDynamics: res.data
            }
          })
        }
        // console.log('进入查询状态之后')
      }
    },
    * getCurrentCompleteStep({payload}, { select, call, put}) {
      let processInfo = yield select(selectProcessInfoWorkbench)
      // console.log('我是所有列表', processInfo)
      if(processInfo) {
        yield put({
          type: 'updateDatas',
          payload: {
            processCurrentCompleteStep: processInfo.completed_amount
          }
        })
      }
    },
    * completeProcessTask({ payload }, { select, call, put }) {
      const { instance_id, flow_node_instance_id } = payload
      let res = yield call(completeProcessTask, payload)
      let res2 = yield call(getProcessInfo, instance_id)
      const curr_node_id = res2.data.completed_amount
      const amount_node_id = res2.data.node_amount
      // console.log('completeProcessTask has running:', res)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'getProcessInfo',
          payload: {
            id: instance_id,
            calback: function () {
              message.success('已完成节点', MESSAGE_DURATION_TIME)
            }
          }
        })
        let r = yield call(getWorkFlowComment, {flow_instance_id: instance_id})
        yield put({
          type: 'updateDatas',
          payload: {
            workFlowComments: r.data
          }
        })
        let backLogProcessList = yield select(selectBackLogProcessList)
        let currentStep = yield select(selectCurrentProcessCompletedStepWorkbench)
        yield put({
          type: 'updateDatas',
          payload: {
            processCurrentCompleteStep: parseInt(currentStep)+1
          }
        })
        if(curr_node_id === amount_node_id) {
          let r = backLogProcessList.reduce((r, c) => {
            return [
              ...r,
              ...(c.flow_instance_id === instance_id?[]:[c])
            ]
          }, [])
          yield put({
            type: 'updateDatas',
            payload: {
              backLogProcessList: r
            }
          })
        }
      }else{
        message.warn(res.message)
      }
    },
    * fillFormComplete({ payload }, { select, call, put }) {
      // console.log('logloglog!')
      let res = yield call(fillFormComplete, payload)
      const { instance_id } = payload
      if(isApiResponseOk(res)) {
        yield put({
          type: 'getProcessInfo',
          payload: {
            id: instance_id,
            calback: function () {
              message.success('已完成节点', MESSAGE_DURATION_TIME)
            }
          }
        })
        let r = yield call(getWorkFlowComment, {flow_instance_id: instance_id})
        yield put({
          type: 'updateDatas',
          payload: {
            workFlowComments: r.data
          }
        })
        let currentStep = yield select(selectCurrentProcessCompletedStepWorkbench)
        yield put({
          type: 'updateDatas',
          payload: {
            processCurrentCompleteStep: parseInt(currentStep)+1
          }
        })
      }else{
        message.warn(res.message)
      }
    },
    * rebackProcessTask({ payload }, { select, call, put }) {
      let res = yield call(rebackProcessTask, payload)
      const { instance_id } = payload
      if(isApiResponseOk(res)) {
        yield put({
          type: 'getProcessInfo',
          payload: {
            id: instance_id,
            calback: function () {
              message.success('撤回成功', MESSAGE_DURATION_TIME)
            }
          }
        })
        let r = yield call(getWorkFlowComment, {flow_instance_id: instance_id})
        yield put({
          type: 'updateDatas',
          payload: {
            workFlowComments: r.data
          }
        })
        let currentStep = yield select(selectCurrentProcessCompletedStepWorkbench)
        yield put({
          type: 'updateDatas',
          payload: {
            processCurrentCompleteStep: parseInt(currentStep)-1
          }
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * rejectProcessTask({ payload }, { select, call, put }) {
      let res = yield call(rejectProcessTask, payload)
      const { instance_id } = payload
      if(isApiResponseOk(res)) {
        yield put({
          type: 'getProcessInfo',
          payload: {
            id: instance_id,
            calback: function () {
              message.success('已拒绝', MESSAGE_DURATION_TIME)
            }
          }
        })

        let r = yield call(getWorkFlowComment, {flow_instance_id: instance_id})
        yield put({
          type: 'updateDatas',
          payload: {
            workFlowComments: r.data
          }
        })
        
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * resetAsignees({ payload }, { select, call, put }) {
      let res = yield call(resetAsignees, payload)
      const { instance_id } = payload
      if(isApiResponseOk(res)) {
        yield put({
          type: 'getProcessInfo',
          payload: {
            id: instance_id,
            calback: function () {
              message.success('推进人设置成功', MESSAGE_DURATION_TIME)
            }
          }
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)

      }
    },

    * addWorkFlowComment({payload}, {select, call, put}) {
      let res1 = yield select(selectProcessCommentList)
      let res2 = yield call(addWorkFlowComment, payload)
      if (!isApiResponseOk(res2)) {
        message.warn(res2.message)
        return false
      }
      yield put({
        type: 'updateDatas',
        payload: {
          workFlowComments: [
            ...res1,
            res2.data
          ]
        }
      })
      
    },
    * deleteWorkFlowComment({payload}, {select, call, put}) {
      const { id } = payload
      let res = yield call(deleteWorkFlowComment, payload)
      let commentList = yield select(selectProcessCommentList)
      let r = commentList.reduce((r, c) => {
        return [
          ...r,
          ...(c.id === id?[]:[c])
        ]
      }, [])
      yield put({
        type: 'updateDatas',
        payload: {
          workFlowComments: r
        }
      })
    },
    * getWorkFlowComment({payload}, {select, call, put}) {
      let res = yield call(getWorkFlowComment, payload)
      // console.log('this is workbench_getWorkFlowComment', res)
      yield put({
        type: 'updateDatas',
        payload: {
          workFlowComments: res.data
        }
      })
    },

    * workflowDelete({payload}, {select, call, put}) {
      let res = yield call(workflowDelete, payload)
      // console.log('this is workflowDelete:', res)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            isProcessEnd: ''
          }
        })
      } else {
        message.warning(res.message)
      }
      
    },

    * workflowEnd({payload}, {select, call, put}) {
      let res = yield call(workflowEnd, payload)
      // console.log('this is workflowEnd:', res)
      yield put({
        type: 'updateDatas',
        payload: {
          isProcessEnd: true
        }
      })
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
