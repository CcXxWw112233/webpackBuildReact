import { isApiResponseOk } from '../../../utils/handleResponseData'
import { message } from 'antd'
import { currentNounPlanFilterName } from '../../../utils/businessFunction'
import {
  MESSAGE_DURATION_TIME,
  FILES,
  FLOWS
} from '../../../globalset/js/constant'
import { getSubfixName } from '../../../utils/businessFunction'
import QueryString from 'querystring'
import {
  processEditDatasConstant,
  processEditDatasRecordsConstant,
  processDoingListMatch,
  processInfoMatch
} from '../../../components/ProcessDetailModal/constant'
import {
  getProcessTemplateList,
  saveProcessTemplate,
  getTemplateInfo,
  saveEditProcessTemplete,
  deleteProcessTemplete,
  createProcess,
  getProcessInfo,
  getProcessListByType,
  fillFormComplete,
  rejectProcessTask,
  workflowEnd,
  workflowDelete,
  restartProcess,
  processFileUpload,
  deleteProcessFile,
  fileDownload,
  configurePorcessGuide,
  rebackProcessTask,
  nonAwayTempleteStartPropcess,
  updateFlowInstanceNameOrDescription,
  getCurrentOrgAllMembers
} from '../../../services/technological/workFlow'
// import { getCurrentOrgAllMembers } from '../../../services/technological/workbench'
import { public_selectCurrentFlowTabsStatus } from './select'

let dispatchEvent = null
let board_id = null
let appsSelectKey = null
let flow_id = null

export default {
  namespace: 'publicProcessDetailModal',
  state: {
    currentFlowInstanceName: '', // 当前流程实例的名称
    currentFlowInstanceDescription: '', // 当前的实例描述内容
    isEditCurrentFlowInstanceName: true, // 是否正在编辑当前实例的名称
    isEditCurrentFlowInstanceDescription: false, // 是否正在编辑当前实例的描述
    processPageFlagStep: '1', // "1", "2", "3", "4" 分别对应 新建， 编辑， 启动
    process_detail_modal_visible: false,
    processDoingList: [], // 进行中的流程
    processStopedList: [], // 已中止的流程
    processComepletedList: [], // 已完成的流程
    processNotBeginningList: [], // 未开始的流程
    processEditDatas: [],
    processCurrentEditStep: 0, // 当前的编辑步骤 第几步
    processCurrentCompleteStep: 0, // 当前处于的操作步骤
    templateInfo: {}, // 模板信息
    processInfo: {}, // 流程实例信息
    currentProcessInstanceId: '', // 当前查看的流程实例名称
    currentTempleteIdentifyId: '', // 当前查看的模板编号凭证ID
    currentFlowTabsStatus: '1',
    not_show_create_node_guide: '1',
    not_show_create_form_guide: '1',
    not_show_create_rating_guide: '1'
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        dispatchEvent = dispatch
        if (location.pathname.indexOf('/technological/projectDetail') !== -1) {
        }
      })
    }
  },
  effects: {
    // 初始化数据
    *initData({ payload }, { call, put }) {
      const { board_id, flow_id, calback } = payload
      yield put({
        type: 'updateDatas',
        payload: {
          //流程
          currentFlowInstanceName: '', // 当前流程实例的名称
          currentFlowInstanceDescription: '', // 当前的实例描述内容
          isEditCurrentFlowInstanceName: true, // 是否正在编辑当前实例的名称
          isEditCurrentFlowInstanceDescription: false, // 是否正在编辑当前实例的描述
          processPageFlagStep: '1', // "1", "2", "3", "4" 分别对应 新建， 编辑， 启动
          process_detail_modal_visible: false,
          templateInfo: {}, //所选择的流程模板的信息数据
          processInfo: {}, //所选中的流程的信息
          currentProcessInstanceId: '', // 当前查看的流程实例名称
          currentTempleteIdentifyId: '', // 当前查看的模板编号凭证ID
          currentFlowTabsStatus: '1',
          processDoingList: [], // 进行中的流程
          processStopedList: [], // 已中止的流程
          processComepletedList: [], // 已完成的流程
          processNotBeginningList: [], // 未开始的流程
          processEditDatas: [],
          not_show_create_node_guide: '1',
          not_show_create_form_guide: '1',
          not_show_create_rating_guide: '1'
        }
      })
      if (calback && typeof calback == 'function') calback()
    },

    // 获取流程模板列表
    *getProcessTemplateList({ payload }, { call, put }) {
      const { id, board_id, calback, _organization_id } = payload
      let res = yield call(getProcessTemplateList, {
        id,
        board_id,
        _organization_id
      })
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

    // 获取模板信息内容
    *getTemplateInfo({ payload }, { call, put }) {
      const {
        id,
        processPageFlagStep,
        currentTempleteIdentifyId,
        process_detail_modal_visible,
        calback
      } = payload
      let res = yield call(getTemplateInfo, { id })
      if (isApiResponseOk(res)) {
        let newProcessEditDatas = JSON.parse(
          JSON.stringify([...res.data.nodes] || [])
        )
        newProcessEditDatas = newProcessEditDatas.map(item => {
          let new_item = { ...item, is_edit: '1' }
          return new_item
        })
        yield put({
          type: 'updateDatas',
          payload: {
            templateInfo: res.data,
            processPageFlagStep,
            process_detail_modal_visible: process_detail_modal_visible,
            processEditDatas: newProcessEditDatas,
            currentFlowInstanceName: res.data.name,
            isEditCurrentFlowInstanceName: false,
            currentFlowInstanceDescription: res.data.description,
            currentTempleteIdentifyId: currentTempleteIdentifyId
          }
        })
        if (calback && typeof calback == 'function') calback(res.data)
      }
      return res || {}
    },

    // 新建流程模板中的保存模板(即保存新的流程模板)
    *saveProcessTemplate({ payload }, { call, select, put }) {
      const { calback } = payload
      let newPayload = { ...payload }
      newPayload.calback ? delete newPayload.calback : ''
      let res = yield call(saveProcessTemplate, newPayload)
      if (isApiResponseOk(res)) {
        // yield put({
        //   type: 'getProcessTemplateList',
        //   payload: {
        //     id: payload.board_id,
        //     board_id: payload.board_id
        //   }
        // })
        if (calback && typeof calback == 'function') calback(res.data)
      } else {
        message.warn(res.message)
      }
      return res || {}
    },

    // 点击编辑流程时对已经保存模板接口
    *saveEditProcessTemplete({ payload }, { call, put }) {
      const { calback } = payload
      let newPayload = { ...payload }
      newPayload.calback ? delete newPayload.calback : ''
      let res = yield call(saveEditProcessTemplete, newPayload)
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success(`保存模板成功`, MESSAGE_DURATION_TIME)
        }, 200)
        // yield put({
        //   type: 'getProcessTemplateList',
        //   payload: {
        //     id: payload.board_id,
        //     board_id: payload.board_id
        //   }
        // })
        if (calback && typeof calback == 'function') calback()
      } else {
        message.warn(res.message)
      }
      return res || {}
    },

    // 删除流程模板
    *deleteProcessTemplete({ payload }, { call, put }) {
      const { id, calback } = payload
      let res = yield call(deleteProcessTemplete, { id })
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success('删除模板成功')
        }, 200)
        // yield put({
        //   type: 'getProcessTemplateList',
        //   payload: {
        //     id: board_id,
        //     board_id
        //   }
        // })
        if (calback && typeof calback == 'function') calback()
      } else {
        message.warn(res.message)
      }
    },

    // 开始流程
    *createProcess({ payload }, { call, put }) {
      const { calback } = payload
      let newPayload = { ...payload }
      newPayload.calback ? delete newPayload.calback : ''
      let res = yield call(createProcess, newPayload)
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success(
            `启动${currentNounPlanFilterName(FLOWS)}成功`,
            MESSAGE_DURATION_TIME
          )
        }, 200)
        if (calback && typeof calback == 'function') calback()
      } else {
        message.warn(res.message)
      }
      return res || {}
    },

    // 从URL进来获取流程详情信息
    *getProcessInfoByUrl({ payload }, { call, put }) {
      const { currentProcessInstanceId } = payload
      yield put({
        type: 'updateDatas',
        payload: {
          processPageFlagStep: '4'
        }
      })
      yield put({
        type: 'getProcessInfo',
        payload: {
          id: currentProcessInstanceId,
          calback: () => {
            dispatchEvent({
              type: 'updateDatas',
              payload: {
                process_detail_modal_visible: true,
                currentProcessInstanceId: currentProcessInstanceId
              }
            })
          }
        }
      })
    },

    // 获取流程实例信息
    *getProcessInfo({ payload }, { call, put }) {
      const { id, calback } = payload
      let res = yield call(getProcessInfo, { id })
      if (isApiResponseOk(res)) {
        let newProcessEditDatas = JSON.parse(
          JSON.stringify([...res.data.nodes] || [])
        )
        newProcessEditDatas = newProcessEditDatas.map(item => {
          if (item.status == '2') {
            // 表示找到已完成的节点
            let new_item = { ...item, is_confirm: '1' }
            return new_item
          } else {
            let new_item = item
            return new_item
          }
        })
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
            currentFlowInstanceName: res.data.name,
            isEditCurrentFlowInstanceName: false,
            currentFlowInstanceDescription: res.data.description,
            processEditDatas: newProcessEditDatas,
            processInfo: { ...res.data, curr_node_sort: curr_node_sort },
            currentFlowTabsStatus: res.data.status
          }
        })
        if (calback && typeof calback == 'function') calback()
      } else {
        // 兼容弹窗调用失败 需关闭
        message.warn(res.message, MESSAGE_DURATION_TIME)
        yield put({
          type: 'initData',
          payload: {}
        })
      }
      return res || {}
    },

    // 获取流程列表，类型进行中 已终止 已完成
    *getProcessListByType({ payload }, { call, put }) {
      const { status, board_id, _organization_id } = payload
      const res = yield call(getProcessListByType, {
        status,
        board_id,
        _organization_id
      })
      let listName
      switch (status) {
        case '1':
          listName = 'processDoingList'
          break
        case '2':
          listName = 'processStopedList'
          break
        case '3':
          listName = 'processComepletedList'
          break
        case '0':
          listName = 'processNotBeginningList'
          break
        default:
          listName = 'processDoingList'
          break
      }
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            [listName]: res.data
          }
        })
      } else {
      }
      return res || {}
    },

    // 流程节点步骤的完成
    *fillFormComplete({ payload }, { call, put }) {
      const { flow_instance_id, calback } = payload
      let newPayload = { ...payload }
      newPayload.calback ? delete newPayload.calback : ''
      let res = yield call(fillFormComplete, newPayload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getProcessInfo',
          payload: {
            id: flow_instance_id,
            calback: () => {
              message.success('已完成节点', MESSAGE_DURATION_TIME)
            }
          }
        })
        if (calback && typeof calback == 'function') calback()
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    // 驳回节点
    *rejectProcessTask({ payload }, { call, put }) {
      const { flow_instance_id, calback } = payload
      let newPayload = { ...payload }
      newPayload.calback ? delete newPayload.calback : ''
      let res = yield call(rejectProcessTask, newPayload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getProcessInfo',
          payload: {
            id: flow_instance_id,
            calback: () => {
              message.success('已驳回节点', MESSAGE_DURATION_TIME)
            }
          }
        })
        if (calback && typeof calback == 'function') calback()
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    // 中止流程
    *workflowEnd({ payload }, { call, select, put }) {
      const { id, board_id, calback } = payload
      let status = yield select(public_selectCurrentFlowTabsStatus) || '1'
      let res = yield call(workflowEnd, { id })
      if (isApiResponseOk(res)) {
        // yield put({
        //   type: 'getProcessListByType',
        //   payload: {
        //     status,
        //     board_id
        //   }
        // })
        if (calback && typeof calback == 'function') calback()
      } else {
        message.warn(res.message)
      }
    },
    // 删除流程
    *workflowDelete({ payload }, { call, select, put }) {
      const { id, board_id, calback } = payload
      let status = yield select(public_selectCurrentFlowTabsStatus) || '1'
      let res = yield call(workflowDelete, { id })
      if (isApiResponseOk(res)) {
        // yield put({
        //   type: 'getProcessListByType',
        //   payload: {
        //     status,
        //     board_id
        //   }
        // })
        if (calback && typeof calback == 'function') calback()
      } else {
        message.warn(res.message)
      }
    },

    // 重启流程
    *restartProcess({ payload }, { call, select, put }) {
      const { id, board_id, calback } = payload
      let status = yield select(public_selectCurrentFlowTabsStatus) || '1'
      let res = yield call(restartProcess, { id })
      if (isApiResponseOk(res)) {
        // yield put({
        //   type: 'getProcessListByType',
        //   payload: {
        //     status,
        //     board_id
        //   }
        // })
        if (calback && typeof calback == 'function') calback()
      } else {
        message.warn(res.message)
      }
    },

    // 删除流程文件
    *deleteProcessFile({ payload }, { call, put }) {
      const { id, calback } = payload
      let res = yield call(deleteProcessFile, { id })
      if (isApiResponseOk(res)) {
        if (calback && typeof calback == 'function') calback()
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    // 文件下载
    *fileDownload({ payload }, { call, put }) {
      function openWin(url) {
        var element1 = document.createElement('a')
        element1.href = url
        element1.download = url // 需要加上download属性
        element1.id = 'openWin'
        document.querySelector('body').appendChild(element1)
        document.getElementById('openWin').click() //点击事件
        document
          .getElementById('openWin')
          .parentNode.removeChild(document.getElementById('openWin'))
      }

      let res = yield call(fileDownload, payload)
      if (isApiResponseOk(res)) {
        const data = res.data
        if (data && data.length) {
          // 循环延时控制
          for (let i = 0; i < data.length; i++) {
            setTimeout(() => openWin(data[i]), i * 500)
          }
        }
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    // 引导接口
    *configurePorcessGuide({ payload }, { call, put }) {
      let res = yield call(configurePorcessGuide, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            not_show_create_node_guide: res.data.flow_template_node,
            not_show_create_form_guide: res.data.flow_template_form,
            not_show_create_rating_guide: res.data.flow_template_score
          }
        })
      } else {
      }
    },

    // 撤回任务
    *rebackProcessTask({ payload }, { call, put }) {
      const {
        flow_instance_id,
        flow_node_instance_id,
        board_id,
        calback
      } = payload
      let res = yield call(rebackProcessTask, {
        flow_instance_id,
        flow_node_instance_id
      })
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success('撤回步骤成功', MESSAGE_DURATION_TIME)
        }, 200)
        yield put({
          type: 'getProcessInfo',
          payload: {
            id: flow_instance_id
          }
        })
        // yield put({
        //   type: 'getProcessListByType',
        //   payload: {
        //     status: '1',
        //     board_id
        //   }
        // })
        if (calback && typeof calback == 'function') calback()
      } else {
        message.warn(res.message)
      }
    },

    // 不经过模板时启动
    *nonAwayTempleteStartPropcess({ payload }, { call, put }) {
      const { calback } = payload
      let newPayload = { ...payload }
      newPayload.calback ? delete newPayload.calback : ''
      let res = yield call(nonAwayTempleteStartPropcess, newPayload)
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success(
            `启动${currentNounPlanFilterName(FLOWS)}成功`,
            MESSAGE_DURATION_TIME
          )
        }, 200)
        if (calback && typeof calback == 'function') calback()
      } else {
        message.warn(res.message)
      }
      return res || {}
    },
    // 进行中修改名称和描述
    *updateFlowInstanceNameOrDescription({ payload }, { call, put }) {
      const { calback } = payload
      let newPayload = { ...payload }
      newPayload.calback ? delete newPayload.calback : ''
      let res = yield call(updateFlowInstanceNameOrDescription, newPayload)
      if (isApiResponseOk(res)) {
        if (calback && typeof calback == 'function') calback()
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
      return res || {}
    },
    // 获取组织成员
    *getCurrentOrgAllMembers({ payload }, { call, put }) {
      let res = yield call(getCurrentOrgAllMembers, { ...payload })
      if (isApiResponseOk(res)) {
        let membersData = [...res.data.users]
        membersData = membersData.map(item => {
          let new_item = { ...item, user_id: item.id }
          return new_item
        })
        yield put({
          type: 'updateDatas',
          payload: {
            currentOrgAllMembers: membersData
          }
        })
      }
    }
  },
  reducers: {
    updateDatas(state, action) {
      return {
        ...state,
        ...action.payload
      }
    }
  }
}
