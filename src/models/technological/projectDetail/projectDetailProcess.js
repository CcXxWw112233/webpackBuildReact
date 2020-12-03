import { message } from 'antd'
import { routerRedux } from 'dva/router'
import Cookies from 'js-cookie'
import modelExtend from 'dva-model-extend'
import projectDetail from './index'
import { projectDetailInfo } from '../../../services/technological/prjectDetail'
import {
  completeProcessTask,
  createProcess,
  fillFormComplete,
  getProcessInfo,
  getProcessTemplateList,
  getProessDynamics,
  getTemplateInfo,
  rebackProcessTask,
  rejectProcessTask,
  resetAsignees,
  saveProcessTemplate,
  getProcessListByType,
  deleteProcessTemplate,
  addWorkFlowComment,
  getWorkFlowComment,
  workflowDelete,
  workflowEnd,
  deleteWorkFlowComment,
  setDueTimeInFlowsNode,
  setDueTimeInFlowsInstance
} from '../../../services/technological/process'
import { MESSAGE_DURATION_TIME } from '../../../globalset/js/constant'
import {
  selectCurrentProcessInstanceId,
  selectProcessDoingList,
  selectProcessStopedList,
  selectProcessComepletedList,
  selectProcessTotalId,
  selectCurr_node_sort,
  selectNode_amount,
  selectProjectProcessCommentList,
  selectProcessInfo,
  selectCurrentProcessCompletedStep,
  selectProjectDetailProcessCommentList,
  selectProkectDetailProcessId
} from '../select'
import { isApiResponseOk } from '../../../utils/handleResponseData'
import {
  processEditDatasConstant,
  processEditDatasRecordsConstant
} from '../../../routes/Technological/components/ProjectDetail/Process/constant'
import QueryString from 'querystring'

let board_id = null
let appsSelectKey = null
let flow_id = null

export default modelExtend(projectDetail, {
  namespace: 'projectDetailProcess',
  state: {
    datas: {
      processPageFlagStep: '1', //"1""2""3""4"分别对应欢迎，编辑，确认，详情界面,默认1
      node_type: '1', //节点类型， 默认1
      processCurrentEditStep: 0, //编辑第几步，默认 0
      processEditDatas: JSON.parse(JSON.stringify(processEditDatasConstant)), //json数组，每添加一步编辑内容往里面put进去一个obj,刚开始默认含有一个里程碑的
      processEditDatasRecords: JSON.parse(
        JSON.stringify(processEditDatasRecordsConstant)
      ), //每一步的每一个类型，记录，数组的全部数据step * type
      templateInfo: {}, //所选择的流程模板的信息数据
      processInfo: {}, //所选中的流程的信息
      processList: [], //流程列表
      processDynamics: [], //流程动态列表,
      currentProcessInstanceId: '', //当前查看的流程实例id
      processDoingList: [], //正在进行流程的列表
      processStopedList: [], //已终止的流程列表
      processComepletedList: [], //已完成的流程列表
      processTemplateList: [], //流程模板列表
      processCurrentCompleteStep: 0 //当前处于的操作步数
    }
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (location.pathname.indexOf('/technological/projectDetail') !== -1) {
          const param = QueryString.parse(location.search.replace('?', ''))
          board_id = param.board_id
          appsSelectKey = param.appsSelectKey
          flow_id = param.flow_id
          if (appsSelectKey == '2') {
            dispatch({
              type: 'updateDatas',
              payload: {
                //流程
                processPageFlagStep: '1', //"1""2""3""4"分别对应欢迎，编辑，确认，详情界面,默认1
                node_type: '1', //节点类型， 默认1
                processCurrentEditStep: 0, //编辑第几步，默认 0
                processEditDatas: JSON.parse(
                  JSON.stringify(processEditDatasConstant)
                ), //json数组，每添加一步编辑内容往里面put进去一个obj,刚开始默认含有一个里程碑的
                processEditDatasRecords: JSON.parse(
                  JSON.stringify(processEditDatasRecordsConstant)
                ), //每一步的每一个类型，记录，数组的全部数据step * type
                templateInfo: {}, //所选择的流程模板的信息数据
                processInfo: {}, //所选中的流程的信息
                workFlowComments: [],
                processCurrentCompleteStep: 0
              }
            })
            if (board_id) {
              dispatch({
                type: 'getProcessTemplateList',
                payload: {
                  id: board_id
                }
              })
            }
            // dispatch({
            //   type: 'getProcessInfoByUrl',
            //   payload: {
            //     currentProcessInstanceId: flow_id
            //   }
            // })
            if (flow_id) {
              dispatch({
                type: 'getProcessInfoByUrl',
                payload: {
                  currentProcessInstanceId: flow_id
                }
              })

              dispatch({
                type: 'projectDetailInfo',
                payload: {
                  id: board_id
                }
              })

              dispatch({
                type: 'getWorkFlowComment',
                payload: {
                  flow_instance_id: flow_id
                }
              })

              dispatch({
                type: 'updateDatas',
                payload: {
                  processDetailModalVisible: true,
                  totalId: {
                    flow: flow_id,
                    board: board_id
                  }
                }
              })
              // 需要情况该弹窗的数据 因为圈子联动导致的问题
              dispatch({
                type: 'publicTaskDetailModal/updateDatas',
                payload: {
                  drawContent: {},
                  drawerVisible: false
                }
              })

              // 需要情况该弹窗的数据 因为圈子联动导致的问题
              dispatch({
                type: 'publicFileDetailModal/updateDatas',
                payload: {
                  filePreviewCurrentFileId: '',
                  fileType: '',
                  isInOpenFile: false,
                  isInAttachmentFile: false,
                  currentPreviewFileName: ''
                }
              })
            } else {
              dispatch({
                type: 'updateDatas',
                payload: {
                  processDetailModalVisible: false
                }
              })
            }
          }
        }
      })
    }
  },
  effects: {
    //流程
    *getProcessTemplateList({ payload }, { select, call, put }) {
      const { id, calback } = payload
      let res = yield call(getProcessTemplateList, { id })
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            processTemplateList: res.data || []
          }
        })
        if (typeof calback === 'function') {
          calback()
        }
      } else {
      }
    },
    //保存流程模板
    *saveProcessTemplate({ payload }, { select, call, put }) {
      let res = yield call(saveProcessTemplate, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getProcessTemplateList',
          payload: {
            id: board_id,
            calback: function() {
              message.success('保存模板成功', MESSAGE_DURATION_TIME)
            }
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    *deleteProcessTemplate({ payload }, { select, call, put }) {
      let res = yield call(deleteProcessTemplate, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getProcessTemplateList',
          payload: {
            id: board_id,
            calback: function() {
              message.success('已成功删除模板', MESSAGE_DURATION_TIME)
            }
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    // 直接启动时保存模板但不保留，查询该模板，将数据保留用于启动流程
    *directStartSaveTemplate({ payload }, { select, call, put }) {
      let res = yield call(saveProcessTemplate, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getTemplateInfo',
          payload: {
            id: res.data.flow_template_id
          }
        })
      } else {
      }
    },
    *getTemplateInfo({ payload }, { select, call, put }) {
      const { id } = payload
      let res = yield call(getTemplateInfo, id)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            templateInfo: res.data,
            processEditDatas: res.data.nodes,
            processPageFlagStep: '3'
          }
        })
      } else {
      }
    },

    *createProcess({ payload }, { select, call, put }) {
      const res = yield call(createProcess, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getProcessInfo',
          payload: {
            id: res.data.id
          }
        })
      } else {
        message.warn(res.message)
      }
    },

    *changeFlowIdToUrl({ payload }, { select, call, put }) {
      const { currentProcessInstanceId } = payload
      yield put({
        type: 'routingJump',
        payload: {
          route: `/technological/projectDetail?board_id=${board_id}&appsSelectKey=${appsSelectKey}&flow_id=${currentProcessInstanceId}`
        }
      })
    },

    *getProcessInfoByUrl({ payload }, { select, call, put }) {
      return
      const { currentProcessInstanceId } = payload
      yield put({
        type: 'updateDatas',
        payload: {
          currentProcessInstanceId
        }
      })
      let res = yield call(getProcessInfo, currentProcessInstanceId)
      if (isApiResponseOk(res)) {
        //设置当前节点排行,数据返回只返回当前节点id,要根据id来确认当前走到哪一步
        const curr_node_id = res.data.curr_node_id
        let curr_node_sort
        for (let i = 0; i < res.data.nodes.length; i++) {
          if (curr_node_id === res.data.nodes[i].id) {
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
        const res2 = yield call(getProessDynamics, { currentProcessInstanceId })
        if (isApiResponseOk(res2)) {
          yield put({
            type: 'updateDatas',
            payload: {
              processDynamics: res2.data
            }
          })
        } else {
        }
      } else {
      }
    },
    *getProcessInfo({ payload }, { select, call, put }) {
      yield put({
        type: 'updateDatas',
        payload
      })
      const { id, calback } = payload
      let res = yield call(getProcessInfo, id)
      if (isApiResponseOk(res)) {
        //设置当前节点排行,数据返回只返回当前节点id,要根据id来确认当前走到哪一步
        const curr_node_id = res.data.curr_node_id
        let curr_node_sort
        for (let i = 0; i < res.data.nodes.length; i++) {
          if (curr_node_id === res.data.nodes[i].id) {
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
        const res2 = yield call(getProessDynamics, {
          currentProcessInstanceId: id
        })
        if (isApiResponseOk(res2)) {
          yield put({
            type: 'updateDatas',
            payload: {
              processDynamics: res2.data
            }
          })
        } else {
        }
        if (typeof calback === 'function') {
          calback()
        }
      } else {
      }
    },
    *listenWsProcessDynamics({ payload }, { select, call, put }) {
      //查询流程动态
      const { newsData } = payload
      const id = newsData.rela_id
      const newsUserId = newsData.userId
      const currentUserId = JSON.parse(localStorage.getItem('userInfo')).id
      const currentProcessInstanceId = yield select(
        selectCurrentProcessInstanceId
      )
      // console.log('进入查询状态之前', id, currentProcessInstanceId, newsUserId, currentUserId)

      // 当且仅当发送消息的用户不是当前用户， 当前查看的流程id和推送的id一样
      if (id === currentProcessInstanceId && newsUserId !== currentUserId) {
        // console.log('进入查询状态')
        const res = yield call(getProessDynamics, { flow_instance_id: id })
        if (isApiResponseOk(res)) {
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
    //获取项目信息
    *projectDetailInfo({ payload }, { select, call, put }) {
      //查看项目详情信息
      const { id, calback } = payload
      let res = yield call(projectDetailInfo, id)
      // console.log('projectDetailProcess:', res)
      if (typeof calback === 'function') {
        calback()
      }
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            projectDetailInfoData: res.data
          }
        })
      } else {
      }
    },
    *getCurrentCompleteStep({ payload }, { select, call, put }) {
      let processInfo = yield select(selectProcessInfo)
      // console.log('我是所有列表', processInfo)
      if (processInfo) {
        yield put({
          type: 'updateDatas',
          payload: {
            processCurrentCompleteStep: processInfo.completed_amount
          }
        })
      }
    },

    *completeProcessTask({ payload }, { select, call, put }) {
      const { instance_id } = payload
      let res = yield call(completeProcessTask, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getProcessInfo',
          payload: {
            id: instance_id,
            calback: function() {
              message.success('已完成节点', MESSAGE_DURATION_TIME)
            }
          }
        })
        let currentStep = yield select(selectCurrentProcessCompletedStep)
        yield put({
          type: 'updateDatas',
          payload: {
            processCurrentCompleteStep: parseInt(currentStep) + 1
          }
        })
        // let id = select(selectProkectDetailProcessId)
        let r = yield call(getWorkFlowComment, {
          flow_instance_id: instance_id
        })
        yield put({
          type: 'updateDatas',
          payload: {
            workFlowComments: r.data
          }
        })

        let node_amount = yield select(selectNode_amount)
        let curr_node_sort = yield select(selectCurr_node_sort)
        if (node_amount === curr_node_sort) {
          let processDoingList = yield select(selectProcessDoingList),
            processComepletedList = yield select(selectProcessComepletedList),
            // totalId = yield select(selectProcessTotalId),
            processDoingLists = [],
            processComepletedLists = []
          processDoingList.forEach(c => {
            if (c.id === instance_id) {
              processComepletedLists.push(c)
            } else {
              processDoingLists.push(c)
            }
          })
          yield put({
            type: 'updateDatas',
            payload: {
              processDoingList: processDoingLists,
              processComepletedList: processComepletedList
            }
          })
        }
      } else {
        message.warn(res.message)
      }
    },
    *fillFormComplete({ payload }, { select, call, put }) {
      let res = yield call(fillFormComplete, payload)
      const { instance_id } = payload
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getProcessInfo',
          payload: {
            id: instance_id,
            calback: function() {
              message.success('已完成节点', MESSAGE_DURATION_TIME)
            }
          }
        })

        let r = yield call(getWorkFlowComment, {
          flow_instance_id: instance_id
        })
        yield put({
          type: 'updateDatas',
          payload: {
            workFlowComments: r.data
          }
        })

        let currentStep = yield select(selectCurrentProcessCompletedStep)
        yield put({
          type: 'updateDatas',
          payload: {
            processCurrentCompleteStep: parseInt(currentStep) + 1
          }
        })
      } else {
        message.warn(res.message)
      }
    },
    *rebackProcessTask({ payload }, { select, call, put }) {
      let res = yield call(rebackProcessTask, payload)
      const { instance_id } = payload
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getProcessInfo',
          payload: {
            id: instance_id,
            calback: function() {
              message.success('撤回成功', MESSAGE_DURATION_TIME)
            }
          }
        })

        let r = yield call(getWorkFlowComment, {
          flow_instance_id: instance_id
        })
        yield put({
          type: 'updateDatas',
          payload: {
            workFlowComments: r.data
          }
        })

        let currentStep = yield select(selectCurrentProcessCompletedStep)
        yield put({
          type: 'updateDatas',
          payload: {
            processCurrentCompleteStep: parseInt(currentStep) - 1
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    *rejectProcessTask({ payload }, { select, call, put }) {
      let res = yield call(rejectProcessTask, payload)
      const { instance_id } = payload
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getProcessInfo',
          payload: {
            id: instance_id,
            calback: function() {
              message.success('已拒绝', MESSAGE_DURATION_TIME)
            }
          }
        })

        let r = yield call(getWorkFlowComment, {
          flow_instance_id: instance_id
        })
        yield put({
          type: 'updateDatas',
          payload: {
            workFlowComments: r.data
          }
        })

        // let currentStep = yield select(selectCurrentProcessCompletedStep)
        // yield put({
        //   type: 'updateDatas',
        //   payload: {
        //     processCurrentCompleteStep: parseInt(currentStep)-1
        //   }
        // })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    *resetAsignees({ payload }, { select, call, put }) {
      let res = yield call(resetAsignees, payload)
      const { instance_id } = payload
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getProcessInfo',
          payload: {
            id: instance_id,
            calback: function() {
              message.success('推进人设置成功', MESSAGE_DURATION_TIME)
            }
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    //获取流程列表，类型进行中 已终止 已完成
    *getProcessListByType({ payload }, { select, call, put }) {
      const { status = '1', board_id } = payload
      const res = yield call(getProcessListByType, { status, board_id })
      let listName
      let selectList = []
      switch (status) {
        case '1':
          listName = 'processDoingList'
          selectList = yield select(selectProcessDoingList)
          break
        case '2':
          listName = 'processStopedList'
          selectList = yield select(selectProcessStopedList)
          break
        case '3':
          listName = 'processComepletedList'
          selectList = yield select(selectProcessComepletedList)
          break
        default:
          listName = 'processDoingList'
          selectList = yield select(selectProcessDoingList)
          break
      }
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            // [listName]: [].concat(selectList, res.data),
            [listName]: res.data
          }
        })
      } else {
      }
    },
    *addWorkFlowComment({ payload }, { select, call, put }) {
      let res1 = yield select(selectProjectProcessCommentList)
      let res2 = yield call(addWorkFlowComment, payload)
      // console.log('this is addWorkFlowComment', res1, res2)
      if (!isApiResponseOk(res2)) {
        message.warn(res2.message)
        return false
      }
      yield put({
        type: 'updateDatas',
        payload: {
          workFlowComments: [...res1, res2.data]
        }
      })
    },

    *getWorkFlowComment({ payload }, { select, call, put }) {
      let res = yield call(getWorkFlowComment, payload)
      // console.log('this is project_getWorkFlowComment', res)
      yield put({
        type: 'updateDatas',
        payload: {
          workFlowComments: res.data
        }
      })
    },
    *deleteWorkFlowComment({ payload }, { select, call, put }) {
      const { id } = payload
      let res = yield call(deleteWorkFlowComment, payload)
      let commentList = yield select(selectProjectDetailProcessCommentList)
      let r = commentList.reduce((r, c) => {
        return [...r, ...(c.id === id ? [] : [c])]
      }, [])
      yield put({
        type: 'updateDatas',
        payload: {
          workFlowComments: r
        }
      })
    },
    *workflowDelete({ payload }, { select, call, put }) {
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

    *workflowEnd({ payload }, { select, call, put }) {
      let res = yield call(workflowEnd, payload)
      // console.log('this is workflowEnd:', res)
      yield put({
        type: 'updateDatas',
        payload: {
          isProcessEnd: true
        }
      })
    },

    *setDueTimeInFlowsNode({ payload }, { select, call, put }) {
      const res = yield call(setDueTimeInFlowsNode, payload)
      // console.log('this is workflowEnd:', res)
      if (isApiResponseOk(res)) {
        message.success('设置截止日期成功')
      } else {
        message.success(res.message)
      }
    },
    *setDueTimeInFlowsInstance({ payload }, { select, call, put }) {
      const res = yield call(setDueTimeInFlowsInstance, payload)
      // console.log('this is workflowEnd:', res)
      if (isApiResponseOk(res)) {
        if (res.data && res.data.remind_code != '0') {
          //通知提醒专用
          message.warn(
            `设置截止日期成功，${res.data.error_msg}`,
            MESSAGE_DURATION_TIME
          )
        } else {
          message.success('设置截止日期成功', MESSAGE_DURATION_TIME)
        }
      } else {
        message.success(res.message)
      }
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
})
