import { getAppsList, getProjectList, addNewProject, updateProject, deleteProject, archivedProject, cancelCollection, projectDetail, addMenbersInProject, quitProject, collectionProject, getProjectGroupTree, createProjectGroupTreeNode, updateProjectGroupTreeNodeName, deleteProjectGroupTreeNode, getCurrentProjectGroupProjectList, getProjectGroupSearchTree, moveProjectToProjectGroup} from '../../services/technological/project'
import { isApiResponseOk } from '../../utils/handleResponseData'
import { message } from 'antd'
import { MESSAGE_DURATION_TIME } from "../../globalset/js/constant";
import { routerRedux } from "dva/router";

export default {
  namespace: 'project',
  state: {
    datas: {
      projectGroupTree: {}, //项目分组
      projectGroupSearchTree: [], //项目分组搜索树
    }
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen((location) => {
        // message.destroy()
        if (location.pathname === '/technological/project') {
          dispatch({
            type: 'updateDatas',
            payload: {
              collapseActiveKeyArray: ['1', '2', '3'], //折叠面板打开的key
            }
          })
          // dispatch({
          //   type: 'getProjectList',
          //   payload: {
          //     type: '1'
          //   }
          // })
          // dispatch({
          //   type: 'getAppsList',
          //   payload: {
          //     type: '2'
          //   }
          // })
          dispatch({
            type: 'setCurrentSelectedProjectMenuItem',
            payload: {
              selected: 'participate',
              type: 'keyword'
            }
          })
          dispatch({
            type: 'fetchProjectGroupTree'
          })
          dispatch({
            type: 'fetchCurrentProjectGroupProjectList',
            payload: {
              keyword: 'participate'
            }
          })
        }else{
          // console.log(2)
        }
      })
    },
  },
  effects: {
    * fetchProjectListAndUpdateProjectGroupTree(_, {select, put, all}) {
      const currentSelectedProjectMenuItem = yield select(state => state['project'].datas.currentSelectedProjectMenuItem)
        const currentSelectedProjectMenuItemType = yield select(state => state['project'].datas.currentSelectedProjectMenuItemType)
        const getFetchCurrentProjectGroupProjectListParam = () => {
          if(currentSelectedProjectMenuItemType === 'keyword') {
            return {
              keyword: currentSelectedProjectMenuItem
            }
          } else if(currentSelectedProjectMenuItemType === 'org_id') {
            return {
              org_id: currentSelectedProjectMenuItem
            }
          } else {
            return {
              group_id: currentSelectedProjectMenuItem
            }
          }
        }
      const reqPromiseArr = yield all([put({
        type: 'fetchProjectGroupTree'
        }),
        put({
          type: 'fetchCurrentProjectGroupProjectList',
          payload: getFetchCurrentProjectGroupProjectListParam()
        })
      ])
      const isAllok = reqPromiseArr.every(each => each.then(res => isApiResponseOk(res) ? true : false))
      if(isAllok) {
        return 'success'
      }
      return 'error'
    },
    * moveProjectToProjectGroup({payload}, {call, put}) {
      let res = yield call(moveProjectToProjectGroup, payload)
      if(isApiResponseOk(res)) {
        return yield put({
          type: 'fetchProjectListAndUpdateProjectGroupTree'
        })
      }
      return 'error'
    },
    * fetchCurrentProjectGroupProjectList({payload}, {call, put}) {
      let res = yield call(getCurrentProjectGroupProjectList, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            currentProjectGroupProjectList: res.data
          }
        })
      }
    },
    * fetchProjectGroupSearchTree({payload}, {call, put}) {
      let res = yield call(getProjectGroupSearchTree, {...payload})
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            projectGroupSearchTree: res.data
          }
        })
        return 'success'
      }
      return 'error'
    },
    * fetchProjectGroupTree(_, {call, put}) {
      let res = yield call(getProjectGroupTree)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            projectGroupTree: res.data
          }
        })
      }
    },
    * createProjectGroupTreeNode({payload}, {call, put}) {
      let res = yield call(createProjectGroupTreeNode, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'fetchProjectGroupTree'
        })
        return 'success'
      }
      return res.message
    },
    * editProjectGroupTreeNodeName({payload}, {call, put}) {
      let res = yield call(updateProjectGroupTreeNodeName, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'fetchProjectGroupTree'
        })
        return 'success'
      }
      return res.message
    },
    * deleteProjectGroupTreeNode({payload}, {call, put}) {
      const {id} = payload
      let res = yield call(deleteProjectGroupTreeNode, {...payload})
      if(isApiResponseOk(res)) {
        yield put({
          type: 'fetchProjectGroupTree'
        })
        return 'success'
      }
      return 'error'
    },
    * getAppsList({ payload }, { select, call, put }) {
      let res = yield call(getAppsList, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            appsList: res.data
          }
        })
      }else{

      }
    },

    * getProjectList({ payload }, { select, call, put }) {
      return
      const { type = '1', calback } = payload
      let res = yield call(getProjectList, {type})
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            projectList: res.data
          }
        })
        const projectObj = res.data
        const currentSelectedProjectMenuItem = yield select(state => state['project'].datas.currentSelectedProjectMenuItem)
        yield put({
          type: 'setCurrentSelectedProjectItem',
          payload: {
            projectItem: projectObj[currentSelectedProjectMenuItem]
          }
        })
        if(typeof calback === 'function') {
          calback()
        }
      }else{

      }
    },
    * addNewProject({ payload }, { select, call, put }) {
      let res = yield call(addNewProject, payload)
      if(isApiResponseOk(res)) {
        // yield put({
        //   type: 'getProjectList',
        //   payload: {
        //     type: '1',
        //     calback: function () {
        //       message.success('添加项目成功', MESSAGE_DURATION_TIME)
        //     },
        //   }
        // })
        message.success('添加项目成功', MESSAGE_DURATION_TIME)
        // yield put({ //获取全部组织的全部项目
        //   type: 'technological/getUserAllOrgsAllBoards',
        // })
        yield put({
          type: 'technological/getUserAllOrgsAllBoards',
          payload: {}
        });
        yield put({
          type: 'technological/getUserOrgPermissions',
          payload: {}
        });
        yield put({
          type: 'technological/getUserBoardPermissions',
          payload: {}
        });
        return yield put({
          type: 'fetchProjectListAndUpdateProjectGroupTree'
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    * collectionProject({ payload }, { select, call, put }) {
      const {org_id, board_id } = payload
      let res = yield call(collectionProject, {org_id, board_id })
      if(isApiResponseOk(res)) {
        // yield put({
        //   type: 'getProjectList',
        //   payload: {
        //     calback: function () {
        //       message.success('收藏成功', MESSAGE_DURATION_TIME)
        //     },
        //     type: '1'
        //   }
        // })
        return yield put({
          type: 'fetchProjectListAndUpdateProjectGroupTree'
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    * cancelCollection({ payload }, { select, call, put }) {
      const { org_id, board_id } = payload
      let res = yield call(cancelCollection, {org_id, board_id })
      if(isApiResponseOk(res)) {
        // yield put({
        //   type: 'getProjectList',
        //   payload: {
        //     calback: function () {
        //       message.success('取消收藏成功', MESSAGE_DURATION_TIME)
        //     },
        //     type: '1'
        //   }
        // })
        return yield put({
          type: 'fetchProjectListAndUpdateProjectGroupTree'
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    * quitProject({ payload }, { select, call, put }) {
      let res = yield call(quitProject, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'fetchCurrentProjectGroupProjectList',
          payload: {
            calback: function () {
              message.success('已退出项目', MESSAGE_DURATION_TIME)
            },
            type: '1'
          }
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    * archivedProject({ payload }, { select, call, put }) {
      let res = yield call(archivedProject, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'getProjectList',
          payload: {
            calback: function () {
              message.success('已归档项目', MESSAGE_DURATION_TIME)
            },
            type: '1'
          }
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    * addMenbersInProject({ payload }, { select, call, put }) {
      let res = yield call(addMenbersInProject, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'getProjectList',
          payload: {
            calback: function () {
              message.success('成功添加项目成员', MESSAGE_DURATION_TIME)
            },
            type: '1'
          }
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    * deleteProject({ payload }, { select, call, put }) {
      const { id } = payload
      let res = yield call(deleteProject, id)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'fetchCurrentProjectGroupProjectList',
          payload: {
            calback: function () {
              message.success('已删除项目', MESSAGE_DURATION_TIME)
            },
            type: '1'
          }
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
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
    },
    setCurrentSelectedProjectMenuItem(state, {payload}) {
      const {selected, type} = payload
      return {
        ...state,
        datas: {...state.datas, currentSelectedProjectMenuItem: selected, currentSelectedProjectMenuItemType: type}
      }
    },
    setCurrentSelectedProjectItem(state, {payload}) {
      const {projectItem} = payload
      return {
        ...state,
        datas: {...state.datas, currentSelectedProjectItem: projectItem}
      }
    }
  },
};
