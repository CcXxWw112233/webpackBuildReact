import { getProjectRoles, setMemberRoleInProject, projectDetailInfo, updateProject, removeMenbers, createMilestone, getMilestoneList } from '../../../services/technological/prjectDetail'
import { isApiResponseOk } from '../../../utils/handleResponseData'
import { message, notification } from 'antd'
import { MESSAGE_DURATION_TIME, TASKS, PROJECTS, MEMBERS } from "../../../globalset/js/constant";
import { routerRedux } from "dva/router";
import {
  addMenbersInProject, archivedProject, cancelCollection, deleteProject, collectionProject,
  quitProject, getAppsList, addProjectApp, editProjectApp, getProjectDynamicsList
} from "../../../services/technological/project";
import {
  getRelationsSelectionPre
} from "../../../services/technological/task";
import { selectProjectDetailInfoData, selectAppsSelectKey, selectProjectDynamicsList } from '../select'
import Cookies from "js-cookie";
import { currentNounPlanFilterName, setBoardIdStorage, getGlobalData } from "../../../utils/businessFunction";
import { postCommentToDynamics } from "../../../services/technological/library";
import QueryString from 'querystring'

//状态说明：
//ProjectInfoDisplay ： 是否显示项目信息，第一次进来默认，以后点击显示隐藏

let board_id = null
let appsSelectKey = null
// appsSelectKey 项目详情里面应用的app标志
export default {
  namespace: 'projectDetail',
  state: {
    datas: {
      milestoneList: [],
      projectDynamicsList: [], // 项目动态消息列表
      p_next_id: '', // 项目动态的id
    }
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen((location) => {
        if (location.pathname.indexOf('/technological/projectDetail') !== -1) {
          dispatch({
            type: 'historyListenSet',
            payload: {
              location
            }
          })
        } else {
          Cookies.remove('appsSelectKeyIsAreadyClickArray', { path: '' })
          localStorage.setItem('defferBoardDetailRoute', location.pathname) //项目详情头部返回路径
          dispatch({//清空项目默认页面可见数据--（一进来就看到的）
            type: 'removeAllProjectData',
            payload: {}
          })
          dispatch({
            type: 'initialData',
            payload: {}
          })
        }
        //刷新页面时去除掉appsSelectKeyIsAreadyClickArray
        window.onbeforeunload = function () {
          Cookies.remove('appsSelectKeyIsAreadyClickArray', { path: '' })
        }
      })
    },
  },
  effects: {

    * initialData({ payload }, { select, call, put }) {
      yield put({
        type: 'updateDatas',
        payload: {
          projectRoles: [], //项目角色
          board_id: '',
          //全局任务key
          appsSelectKey: '', //应用key
          appsSelectKeyIsAreadyClickArray: [], //点击过的appsSelectKey push进数组，用来记录无需重新查询数据
          appsList: [], //全部app列表
          //项目详情和任务
          projectInfoDisplay: false, //项目详情是否出现 projectInfoDisplay 和 isInitEntry 要同时为一个值
          isInitEntry: false, //是否初次进来项目详情
          relations_Prefix: [], //内容关联前部分
          projectDetailInfoData: {},
          milestoneList: [],
          projectDynamicsList: [], // 项目动态消息列表
          p_next_id: '', // 项目动态的id,
        }
      })
    },

    // 页面初始化
    * historyListenSet({ payload }, { select, call, put }) {
      const { location } = payload
      const param = QueryString.parse(location.search.replace('?', ''))
      board_id = param.board_id
      appsSelectKey = param.appsSelectKey
      if (!board_id) {
        window.history.go(-1)
        // console.log('ssss', 112)
        return
      }
      setBoardIdStorage(board_id)
      yield put({
        type: 'updateDatas',
        payload: {
          board_id,
          appsSelectKey
        }
      })
      const appsSelectKeyIsAreadyClickArray =
        Cookies.get('appsSelectKeyIsAreadyClickArray') &&
        JSON.parse(Cookies.get('appsSelectKeyIsAreadyClickArray')) || []
      if (!appsSelectKeyIsAreadyClickArray.length) { //如果还没有点过app,即从其他页面进来
        yield put({ //查询项目角色列表
          type: 'getProjectRoles',
          payload: {
            type: '2',
          }
        })
        yield put({
          type: 'initProjectDetail',
          payload: {
            id: board_id
          }
        })
        yield put({
          type: 'getRelationsSelectionPre',
          payload: {

          }
        })
      } else {
        yield put({
          type: 'noSelected',
          payload: {

          }
        })
      }
    },


    //清空项目默认页面可见数据--（一进来就看到的）
    * removeAllProjectData({ payload }, { select, call, put }) {
      yield put({
        type: 'projectDetailFile/updateDatas',
        payload: {
          fileList: [], //文档列表
          filedata_1: [], //文档列表--文件夹breadcrumbList
          filedata_2: [], //文档列表--文件
        }
      })
      yield put({
        type: 'projectDetailTask/updateDatas',
        payload: {
          taskGroupList: [], //任务列表
        }
      })
      yield put({
        type: 'projectDetailProcess/updateDatas',
        payload: {
          processDoingList: [], //正在进行流程的列表
          processTemplateList: [], //流程模板列表
        }
      })
    },

    //初始化进来 , 先根据项目详情获取默认 appsSelectKey，再根据这个appsSelectKey，查询操作相应的应用 ‘任务、流程、文档、招标、日历’等
    * initProjectDetail({ payload }, { select, call, put }) {
      const { id, entry } = payload //input 调用该方法入口
      let result = yield call(projectDetailInfo, id)
      // const appsSelectKey = yield select(selectAppsSelectKey)
      if (isApiResponseOk(result)) {
        setBoardIdStorage(board_id)
        yield put({
          type: 'updateDatas',
          payload: {
            projectDetailInfoData: result.data,
            appsSelectKey: appsSelectKey || 1, //appsSelectKey || (result.data.app_data[0]? result.data.app_data[0].key : 1), //设置默认
            appsSelectKeyIsAreadyClickArray: [appsSelectKey || 1], //[result.data.app_data[0]? result.data.app_data[0].key : 1], //设置默认
          }
        })
        yield put({
          type: 'getAppsList',
          payload: {
            type: '2',
            _organization_id: result.data.org_id
          }
        })
        if (!appsSelectKey) {
          // yield put({
          //   type: 'routingJump',
          //   payload: {
          //     route: `/technological/projectDetail?board_id=${board_id}&appsSelectKey=${result.data.app_data[0].key}`
          //   }
          // })
          yield put(
            routerRedux.replace(`/technological/projectDetail?board_id=${board_id}&appsSelectKey=${result.data.app_data[0].key}`)
          )
        } else {
          if (entry == 'editProjectApp') { //编辑app
            yield put({
              type: 'handleEditApp',
              payload: {
                data: result.data
              }
            })
          }
          yield put({
            type: 'appsSelectKeyIsAreadyClickArray',
            payload: {
              appsSelectKey
            }
          })

        }
        yield put({
          type: 'getMilestoneList',
          payload: {
            id
          }
        })
        //缓存下来当前项目的权限
        // localStorage.setItem('currentBoardPermission', JSON.stringify(result.data.permissions || []))
      } else {
        //权限缓存空数组
        const openNotification = () => {
          notification.warning({
            message: '提示',
            description: result.message,
            onClick: () => {
              // console.log('Notification Clicked!');
            },
          });
        };
        openNotification()
        const delay = (ms) => new Promise((resolve => {
          setTimeout(resolve, ms)
        }))
        yield call(delay, MESSAGE_DURATION_TIME * 1000)
        yield put({
          type: 'routingJump',
          payload: {
            route: '/technological/project'
          }
        })
        // localStorage.setItem('currentBoardPermission', JSON.stringify([]))
      }
    },

    // 获取项目动态列表
    * getProjectDynamicsList({ payload }, { select, call, put }) { // 获取项目动态列表
      const { next_id } = payload
      // console.log('进来了', 'sssss')
      return
      let res = yield call(getProjectDynamicsList, {...payload})
      if (next_id === '0') { //重新查询的情况,将存储的newsDynamicListOriginal设置为空，重新push
        yield put({
          type: 'updateDatas',
          payload: {
            projectDynamicsList: [],
          }
        })
      }
      // console.log(res, 'sss')
      let new_projectDynamicsList = []
      let projectDynamicsList = yield select(selectProjectDynamicsList)
      // console.log(projectDynamicsList, 'sssss')
      // debugger
      if (isApiResponseOk(res)) {
        // console.log('进来了', 'ssss')
         // 去除空数组
        const removeEmptyArrayEle = (arr) => {
          for(var i = 0; i < arr.length; i++) {
            if(arr[i] == undefined) {
              arr.splice(i, 1);
              i = i - 1; // i - 1 ,因为空元素在数组下标 2 位置，删除空之后，后面的元素要向前补位，
              // 这样才能真正去掉空元素,觉得这句可以删掉的连续为空试试，然后思考其中逻辑
            }
          }
          return arr;
        };
        projectDynamicsList = [].concat(projectDynamicsList, res.data.activity || [])
        new_projectDynamicsList = [...removeEmptyArrayEle(projectDynamicsList)]
        // console.log(new_projectDynamicsList, 'sssss')
        yield put({
          type: 'updateDatas',
          payload: {
            projectDynamicsList: new_projectDynamicsList,
            p_next_id: res.data.next_id,
          }
        })
        // const delay = (ms) => new Promise(resolve => {
        //   setTimeout(resolve, ms)
        // })
        // yield call(delay, 500)

        // yield put({
        //   type: 'updateDatas',
        //   payload: {
        //     is_dynamic_scroll: res.data.next_id ? true : false
        //   }
        // })

      } else {
        message.error(res.message)
      }
    },

    //点击app选项，将点击过的key push进数组，根据已经点击过的数组判断不在重新拉取数据
    * appsSelect({ payload }, { select, call, put }) {
      const { appsSelectKey } = payload
      yield put({
        type: 'appsSelectKeyIsAreadyClickArray',
        payload: {
          appsSelectKey
        }
      })
      yield put(routerRedux.replace(
        `/technological/projectDetail?board_id=${board_id}&appsSelectKey=${appsSelectKey}`
      ))
      // yield put({
      //   type: 'routingJump',
      //   payload: {
      //     route: `/technological/projectDetail?board_id=${board_id}&appsSelectKey=${appsSelectKey}`
      //   }
      // })

    },

    //适应初始化进来已经存在appSelectedArray在cookies,导致没有获取到项目详情信息，先判断项目信息已经获取与否，没有就执行initProjectDetail
    * noSelected({ payload }, { select, call, put }) {
      const projectDetailInfoData = yield select(selectProjectDetailInfoData)
      if (!projectDetailInfoData || JSON.stringify(projectDetailInfoData) == '{}') {
        yield put({
          type: 'getProjectRoles',
          payload: {
            type: '2',
          }
        })
        yield put({
          type: 'initProjectDetail',
          payload: {
            id: board_id
          }
        })
        // yield put({
        //   type: 'getAppsList',
        //   payload: {
        //     type: '2'
        //   }
        // })
      }
    },

    //获取内容关联前半部分
    * getRelationsSelectionPre({ payload }, { select, call, put }) { //
      let res = yield call(getRelationsSelectionPre, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            relations_Prefix: res.data || []
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    * appsSelectKeyIsAreadyClickArray({ payload }, { select, call, put }) {
      const { appsSelectKey } = payload

      //存储appsSelectKeyIsAreadyClickArray
      let appsSelectKeyIsAreadyClickArray = Cookies.get('appsSelectKeyIsAreadyClickArray') && JSON.parse(Cookies.get('appsSelectKeyIsAreadyClickArray')) || []
      appsSelectKeyIsAreadyClickArray.push(appsSelectKey)
      const newAppsSelectKeyIsAreadyClickArray = Array.from(new Set(appsSelectKeyIsAreadyClickArray))
      Cookies.set('appsSelectKeyIsAreadyClickArray', JSON.stringify(newAppsSelectKeyIsAreadyClickArray), { expires: 30, path: '' })

    },

    * getAppsList({ payload }, { select, call, put }) {
      let res = yield call(getAppsList, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            appsList: res.data
          }
        })
      } else {

      }
    },

    //项目增删改查--start
    * projectDetailInfo({ payload }, { select, call, put }) { //查看项目详情信息
      const { id, calback } = payload
      let res = yield call(projectDetailInfo, id)
      const appsSelectKey = yield select(selectAppsSelectKey)
      if (isApiResponseOk(res)) {
        if (typeof calback === 'function') {
          calback(res.data)
        }
        yield put({
          type: 'updateDatas',
          payload: {
            projectDetailInfoData: res.data,
            appsSelectKey: appsSelectKey || (res.data.app_data[0] ? res.data.app_data[0].key : 1)
          }
        })
      } else {
      }
      return res || {}
    },

    * getProjectRoles({ payload }, { select, call, put }) {
      const res = yield call(getProjectRoles, { ...payload, _organization_id: payload._organization_id || getGlobalData('aboutBoardOrganizationId') })
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            projectRoles: res.data
          }
        })
      } else {

      }
    },

    * setMemberRoleInProject({ payload }, { select, call, put }) {
      // const { board_id } = payload
      const BOARD_ID = (payload && payload.board_id) && payload.board_id
      const res = yield call(setMemberRoleInProject, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'projectDetailInfo',
          payload: {
            id: BOARD_ID || board_id,
            calback: function () {
              message.success('设置角色成功', MESSAGE_DURATION_TIME)
            }
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    * removeMenbers({ payload }, { select, call, put }) { //
      // const { board_id } = payload
      const BOARD_ID = (payload && payload.board_id) && payload.board_id
      let res = yield call(removeMenbers, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'projectDetailInfo',
          payload: {
            id: BOARD_ID || board_id,
            calback: function () {
              message.success(`已从${currentNounPlanFilterName(PROJECTS)}移除该${currentNounPlanFilterName(MEMBERS)}`, MESSAGE_DURATION_TIME)
            }
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    * updateProject({ payload }, { select, call, put }) { //
      // const { board_id } = payload
      const BOARD_ID = (payload && payload.board_id) && payload.board_id
      let res = yield call(updateProject, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'projectDetailInfo',
          payload: {
            id: BOARD_ID || board_id,
            calback: function () {
              message.success('更新成功', MESSAGE_DURATION_TIME)
            }
          }
        })
      } else {
        //失败之后重新拉回原来数据
        const projectDetailInfoData = yield select(selectProjectDetailInfoData)
        yield put({
          type: 'updateDatas',
          payload: {
            projectDetailInfoData
          }
        })
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    * collectionProject({ payload }, { select, call, put }) {
      const { org_id, board_id } = payload
      let res = yield call(collectionProject, { org_id, board_id })
      if (isApiResponseOk(res)) {
        message.success('收藏成功', MESSAGE_DURATION_TIME)
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    * cancelCollection({ payload }, { select, call, put }) {
      const { org_id, board_id } = payload
      let res = yield call(cancelCollection, { org_id, board_id })
      if (isApiResponseOk(res)) {
        message.success('已取消收藏', MESSAGE_DURATION_TIME)
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    * quitProject({ payload }, { select, call, put }) {
      const { board_id, isJump } = payload
      let res = yield call(quitProject, {board_id})
      if (isApiResponseOk(res)) {
        message.success(`已退出${currentNounPlanFilterName(PROJECTS)}`, MESSAGE_DURATION_TIME)
        if (isJump) {
          yield put({
            type: 'routingJump',
            payload: {
              route: '/technological/project'
            }
          })
          // yield put({// 退出项目后需要更新一下权限
          //   type: 'technological/getUserBoardPermissions',
          //   payload: {

          //   }
          // })
        }
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    * archivedProject({ payload }, { select, call, put }) {
      let res = yield call(archivedProject, payload)
      if (isApiResponseOk(res)) {
        message.success(`已归档${currentNounPlanFilterName(PROJECTS)}`, MESSAGE_DURATION_TIME)
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    * addMenbersInProject({ payload }, { select, call, put }) {
      // const { board_id } = payload
      const BOARD_ID = (payload && payload.board_id) && payload.board_id
      let res = yield call(addMenbersInProject, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'projectDetailInfo',
          payload: {
            id: BOARD_ID || board_id,
            calback: function () {
              message.success(`${currentNounPlanFilterName(PROJECTS)}添加${currentNounPlanFilterName(MEMBERS)}成功`, MESSAGE_DURATION_TIME)
            }
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    * deleteProject({ payload }, { select, call, put }) {
      const { id, isJump } = payload
      let res = yield call(deleteProject, id)
      if (isApiResponseOk(res)) {
        if (isJump) {
          yield put({
            type: 'routingJump',
            payload: {
              route: '/technological/project'
            }
          })
          // yield put({
          //   type: 'technological/getUserBoardPermissions',
          //   payload: {

          //   }
          // })
        }
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    * addProjectApp({ payload }, { select, call, put }) {
      let res = yield call(addProjectApp, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'initProjectDetail',
          payload: {
            id: board_id
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * editProjectApp({ payload }, { select, call, put }) {
      let res = yield call(editProjectApp, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'initProjectDetail',
          payload: {
            id: board_id,
            entry: 'editProjectApp',
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * handleEditApp({ payload }, { select, call, put }) {
      const { data = {} } = payload
      const { app_data = [] } = data
      let flag = false
      for (let val of app_data) {
        if (val['key'] == appsSelectKey) {
          flag = true
          break
        }
      }
      if (!flag) {
        yield put({
          type: 'routingJump',
          payload: {
            route: `/technological/projectDetail?board_id=${board_id}&appsSelectKey=${app_data[0].key}`
          }
        })
      }

    },
    //项目增删改查--end

    * routingJump({ payload }, { call, put }) {
      const { route } = payload
      yield put(routerRedux.push(route));
    },

    //评论 @用户 触发动态
    * postCommentToDynamics({ payload }, { select, call, put }) { //
      const res = yield call(postCommentToDynamics, payload)
      if (isApiResponseOk(res)) {
      } else {
      }
    },

    * createMilestone({ payload }, { select, call, put }) { //
      const res = yield call(createMilestone, payload)
      if (isApiResponseOk(res)) {
        const { board_id } = payload
        yield put({
          type: 'getMilestoneList',
          payload: {
            id: board_id
          }
        })
        message.success(res.message)
      } else {
        message.error(res.message)
      }
    },
    * getMilestoneList({ payload }, { select, call, put }) { //
      const res = yield call(getMilestoneList, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            milestoneList: res.data
          }
        })
      } else {
        message.error(res.message)
      }
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
};
