import {
  getBoardMembers,
  setMemberRoleInProject,
  projectDetailInfo,
  updateProject,
  removeMenbers
} from '../../../services/technological/prjectDetail'
import { isApiResponseOk } from '../../../utils/handleResponseData'
import { message } from 'antd'
import {
  MESSAGE_DURATION_TIME,
  TASKS,
  PROJECTS,
  MEMBERS
} from '../../../globalset/js/constant'
import { routerRedux } from 'dva/router'
import {
  getFileCommitPoints,
  getPreviewFileCommits,
  addFileCommit,
  deleteCommit,
  getFileList,
  filePreview,
  fileCopy,
  fileDownload,
  fileRemove,
  fileMove,
  fileUpload,
  fileVersionist,
  recycleBinList,
  deleteFile,
  restoreFile,
  getFolderList,
  addNewFolder,
  updateFolder
} from '../../../services/technological/file'
import {
  getCardDetail,
  removeTaskExecutor,
  deleteTaskFile,
  deleteTaskGroup,
  updateTaskGroup,
  getProjectGoupList,
  addTaskGroup,
  addCardNewComment,
  getCardCommentList,
  getTaskGroupList,
  addTask,
  updateTask,
  deleteTask,
  archivedTask,
  changeTaskType,
  addChirldTask,
  addTaskExecutor,
  completeTask,
  addTaskTag,
  removeTaskTag,
  removeProjectMenbers,
  getBoardTagList,
  updateBoardTag,
  toTopBoardTag,
  deleteBoardTag,
  deleteCardNewComment,
  getCardCommentListAll,
  boardAppRelaMiletones,
  boardAppCancelRelaMiletones
} from '../../../services/technological/task'
import Cookies from 'js-cookie'
import { currentNounPlanFilterName } from '../../../utils/businessFunction'
import { workbench_selectDrawContent, workbench_selectBoardId } from './selects'
//状态说明：
//ProjectInfoDisplay ： 是否显示项目信息，第一次进来默认，以后点击显示隐藏

// appsSelectKey 项目详情里面应用的app标志
export default {
  namespace: 'workbenchTaskDetail',
  state: [{}],
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (location.pathname === '/technological/workbench') {
          const initialData = () => {
            dispatch({
              type: 'updateDatas',
              payload: {
                projectDetailInfoData: {}, //项目详情全部数据
                board_id: '',
                card_id: '',
                drawContent: {}, //任务右方抽屉内容
                drawerVisible: false, //查看任务的抽屉是否可见
                cardCommentList: [], //任务评论列表
                taskGroupList: [], //任务列表
                boardTagList: [] //项目标签列表
              }
            })
          }
          initialData()
        }
      })
    }
  },
  effects: {
    //获取当前点击任务的项目详细信息
    *getCardDetail({ payload }, { select, call, put }) {
      //查看项目详情信息
      const { id, board_id, calback } = payload
      yield put({
        type: 'updateDatas',
        payload: {
          card_id: id,
          cardCommentList: []
        }
      })
      let res = yield call(getCardDetail, { id })
      if (isApiResponseOk(res)) {
        // yield put({
        //   type: 'getCardCommentList',
        //   payload: {
        //     id
        //   }
        // })
        yield put({
          type: 'updateDatas',
          payload: {
            drawContent: res.data
          }
        })
        yield put({
          type: 'getBoardMembers',
          payload: {
            id: board_id
          }
        })
        yield put({
          type: 'getBoardTagList',
          payload: {
            board_id: board_id
          }
        })
        if (calback && typeof calback == 'function') {
          calback(res.data)
        }
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    *getBoardMembers({ payload }, { select, call, put }) {
      //查看项目详情信息
      let res = yield call(getBoardMembers, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            projectDetailInfoData: { data: res.data }
          }
        })
      } else {
      }
    },

    //获取项目信息
    *projectDetailInfo({ payload }, { select, call, put }) {
      //查看项目详情信息
      const { id, calback } = payload
      let res = yield call(projectDetailInfo, id)
      // console.log('workbenchTaskDetail:', res)
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

    //任务---start

    *getTaskGroupList({ payload }, { select, call, put }) {
      //
      const { type, board_id, arrange_type, calback, operateType } = payload
      let res = yield call(getTaskGroupList, { arrange_type, board_id })
      if (typeof calback === 'function') {
        calback()
      }
      if (operateType === '1') {
        //代表分类查询选择
        yield put({
          type: 'updateDatas',
          payload: {
            taskGroupList: []
          }
        })
      }
      // message.destroy()
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            taskGroupList: res.data
          }
        })
      } else {
      }
    },

    *updateTask({ payload }, { select, call, put }) {
      //
      const { updateObj } = payload

      const drawContent = yield select(workbench_selectDrawContent)
      const { description } = updateObj
      let res = yield call(updateTask, updateObj)
      if (isApiResponseOk(res)) {
        if (description) {
          drawContent['description'] = description
        }
        yield put({
          type: 'updateDatas',
          payload: {
            drawContent
          }
        })
        if (res.data && res.data.remind_code != '0') {
          //通知提醒专用
          message.warn(`更新成功，${res.data.error_msg}`, MESSAGE_DURATION_TIME)
        } else {
          message.success('更新成功', MESSAGE_DURATION_TIME)
        }
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    *deleteTask({ payload }, { select, call, put }) {
      //
      const { id } = payload
      let res = yield call(deleteTask, id)
      if (isApiResponseOk(res)) {
        message.success('删除成功', MESSAGE_DURATION_TIME)
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    *updateChirldTask({ payload }, { select, call, put }) {
      //
      const { updateObj } = payload
      const drawContent = yield select(workbench_selectDrawContent)
      const { description } = updateObj
      let res = yield call(updateTask, updateObj)
      if (isApiResponseOk(res)) {
        if (description) {
          drawContent['description'] = description
        }
        yield put({
          type: 'updateDatas',
          payload: {
            drawContent
          }
        })
        message.success('更新成功', MESSAGE_DURATION_TIME)
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    *deleteChirldTask({ payload }, { select, call, put }) {
      //
      const { card_id, chirldDataIndex } = payload
      let res = yield call(deleteTask, card_id)
      if (isApiResponseOk(res)) {
        message.success('删除成功', MESSAGE_DURATION_TIME)
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    *archivedTask({ payload }, { select, call, put }) {
      //
      let res = yield call(archivedTask, payload)
      if (isApiResponseOk(res)) {
        message.success(`已归档`, MESSAGE_DURATION_TIME)
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    *changeTaskType({ payload }, { select, call, put }) {
      // 此方法注释掉的地方是先前做了任务跳转sss
      const { requestObj, indexObj } = payload
      const board_id = yield select(workbench_selectBoardId)
      let res = yield call(changeTaskType, requestObj)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getTaskGroupList',
          payload: {
            type: '2',
            board_id: board_id,
            arrange_type: '1',
            calback: function() {
              message.success('移动成功', MESSAGE_DURATION_TIME)
            }
          }
        })
        yield put({
          type: 'updateDatas',
          payload: {
            drawerVisible: false
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    *addChirldTask({ payload }, { select, call, put }) {
      //
      const { length } = payload
      const newPayload = { ...payload }
      newPayload.executors ? delete newPayload.executors : '' //去掉不需要的数据
      let res = yield call(addChirldTask, newPayload)
      const drawContent = yield select(workbench_selectDrawContent) //  获取到全局设置filter,分页设置
      if (isApiResponseOk(res)) {
        drawContent.child_data[0] = payload
        drawContent.child_data[0]['card_id'] = res.data.id
        // yield put({
        //   type: 'updateDatas',
        //   payload:{
        //     drawContent,
        //   }
        // })
        message.success(`添加成功`, MESSAGE_DURATION_TIME)
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    *addTaskExecutor({ payload }, { select, call, put }) {
      //
      let res = yield call(addTaskExecutor, payload)
      if (isApiResponseOk(res)) {
        message.success(`已成功设置执行人`, MESSAGE_DURATION_TIME)
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    *removeTaskExecutor({ payload }, { select, call, put }) {
      //
      let res = yield call(removeTaskExecutor, payload)
      if (isApiResponseOk(res)) {
        message.success(`已成功删除执行人`, MESSAGE_DURATION_TIME)
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    *completeTask({ payload }, { select, call, put }) {
      const { is_realize } = payload
      const board_id = yield select(workbench_selectBoardId)

      let res = yield call(completeTask, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'workbench/getResponsibleTaskList'
        })
        yield put({
          type: 'projectDetailInfo',
          payload: {
            id: board_id,
            calback: function() {
              if (res.data && res.data.remind_code != '0') {
                //通知提醒专用
                const remind_message_str = `，${res.data.error_msg}`
                message.warn(
                  is_realize === '1'
                    ? `已完成该${currentNounPlanFilterName(
                        TASKS
                      )}${remind_message_str}`
                    : `已将该${currentNounPlanFilterName(
                        TASKS
                      )}设置未完成${remind_message_str}`,
                  MESSAGE_DURATION_TIME
                )
              } else {
                message.success(
                  is_realize === '1'
                    ? `已完成该${currentNounPlanFilterName(TASKS)}`
                    : `已将该${currentNounPlanFilterName(TASKS)}设置未完成`,
                  MESSAGE_DURATION_TIME
                )
              }
              // message.success(is_realize === '1'? `已完成该${currentNounPlanFilterName(TASKS)}`: `已将该${currentNounPlanFilterName(TASKS)}设置未完成`, MESSAGE_DURATION_TIME)
            }
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    *removeTaskTag({ payload }, { select, call, put }) {
      //
      let res = yield call(removeTaskTag, payload)
      if (isApiResponseOk(res)) {
        message.success('已删除标签', MESSAGE_DURATION_TIME)
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    *removeProjectMenbers({ payload }, { select, call, put }) {
      //
      let res = yield call(removeProjectMenbers, payload)
      if (isApiResponseOk(res)) {
        message.success(
          `已从${currentNounPlanFilterName(
            PROJECTS
          )}移出该${currentNounPlanFilterName(MEMBERS)}`,
          MESSAGE_DURATION_TIME
        )
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    *getProjectGoupList({ payload }, { select, call, put }) {
      //
      let res = yield call(getProjectGoupList, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            projectGoupList: res.data
          }
        })
      } else {
      }
    },

    *deleteTaskFile({ payload }, { select, call, put }) {
      //
      let res = yield call(deleteTaskFile, payload)
      if (isApiResponseOk(res)) {
      } else {
      }
    },

    *addTaskTag({ payload }, { select, call, put }) {
      //
      const { length } = payload
      const board_id = yield select(workbench_selectBoardId)

      let res = yield call(addTaskTag, payload)

      const drawContent = yield select(workbench_selectDrawContent) //  获取到全局设置filter,分页设置
      if (isApiResponseOk(res)) {
        drawContent.label_data[length - 1].label_id = res.data.label_id
        yield put({
          type: 'updateDatas',
          payload: {
            drawContent
          }
        })
        yield put({
          type: 'getBoardTagList',
          payload: {
            board_id,
            calback: function() {
              message.success('添加任务标签成功', MESSAGE_DURATION_TIME)
            }
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    *getBoardTagList({ payload }, { select, call, put }) {
      //
      const { board_id, calback } = payload
      let res = yield call(getBoardTagList, { board_id })
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            boardTagList: res.data
          }
        })
        if (calback && typeof calback === 'function') {
          calback()
        }
      } else {
      }
    },

    *updateBoardTag({ payload }, { select, call, put }) {
      //
      const board_id = yield select(workbench_selectBoardId)
      let res = yield call(updateBoardTag, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getBoardTagList',
          payload: {
            board_id,
            calback: function() {
              message.success('更新标签成功', MESSAGE_DURATION_TIME)
            }
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    *toTopBoardTag({ payload }, { select, call, put }) {
      //
      const board_id = yield select(workbench_selectBoardId)
      let res = yield call(toTopBoardTag, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getBoardTagList',
          payload: {
            board_id,
            calback: function() {
              message.success('已成功置顶该项目标签', MESSAGE_DURATION_TIME)
            }
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    *deleteBoardTag({ payload }, { select, call, put }) {
      //
      const board_id = yield select(workbench_selectBoardId)
      let res = yield call(deleteBoardTag, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getBoardTagList',
          payload: {
            board_id,
            calback: function() {
              message.success('已成功删除该项目标签', MESSAGE_DURATION_TIME)
            }
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    //任务---end

    //评论---start
    *getCardCommentList({ payload }, { select, call, put }) {
      //
      const { id } = payload
      yield put({
        type: 'updateDatas',
        payload: {
          cardCommentList: []
        }
      })
      let res = yield call(getCardCommentList, id)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            cardCommentList: res.data
          }
        })
      } else {
      }
    },

    *addCardNewComment({ payload }, { select, call, put }) {
      //
      let res = yield call(addCardNewComment, payload)
      if (isApiResponseOk(res)) {
        const { card_id } = payload
        let res = yield call(getCardCommentList, card_id)
        if (isApiResponseOk(res)) {
          yield put({
            type: 'updateDatas',
            payload: {
              cardCommentList: res.data
            }
          })
        } else {
        }
      } else {
      }
    },

    *deleteCardNewComment({ payload }, { select, call, put }) {
      //
      const res = yield call(deleteCardNewComment, payload)
      if (isApiResponseOk(res)) {
        const { card_id } = payload
        const res = yield call(getCardCommentList, card_id)
        if (isApiResponseOk(res)) {
          yield put({
            type: 'updateDatas',
            payload: {
              cardCommentList: res.data
            }
          })
        } else {
        }
      } else {
        message.warn(res.message)
      }
    },

    //评论--end
    *getCardCommentListAll({ payload }, { select, call, put }) {
      yield put({
        type: 'updateDatas',
        payload: {
          cardCommentAll: []
        }
      })
      let res = yield call(getCardCommentListAll, payload)
      yield put({
        type: 'updateDatas',
        payload: {
          cardCommentAll: res.data
        }
      })
    },

    *routingJump({ payload }, { call, put }) {
      const { route } = payload
      yield put(routerRedux.push(route))
    },

    //关联里程碑
    *taskRelaMiletones({ payload }, { select, call, put }) {
      const { rela_id } = payload //此时的rela_id 为任务id
      const res = yield call(boardAppRelaMiletones, payload)
      if (isApiResponseOk(res)) {
        const res2 = yield call(getCardDetail, { id: rela_id })
        if (isApiResponseOk(res2)) {
          yield put({
            type: 'updateDatas',
            payload: {
              drawContent: res2.data
            }
          })
        }
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    *taskCancelRelaMiletones({ payload }, { select, call, put }) {
      const { rela_id } = payload //此时的rela_id 为任务id
      const res = yield call(boardAppCancelRelaMiletones, payload)
      if (isApiResponseOk(res)) {
        const res2 = yield call(getCardDetail, { id: rela_id })
        if (isApiResponseOk(res2)) {
          yield put({
            type: 'updateDatas',
            payload: {
              drawContent: res2.data
            }
          })
        }
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
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
}
