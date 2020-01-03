import { getUSerInfo, logout, getUserAllOrgsAllBoards } from '../../services/technological'
import {
  changeCurrentOrg,
  getSearchOrganizationList,
  createOrganization,
  updateOrganization,
  applyJoinOrganization,
  inviteJoinOrganization,
  getCurrentUserOrganizes,
  getUserOrgPermissions,
  getUserBoardPermissions,
  getSetShowOrgName,
  setShowSimpleModel,
} from '../../services/technological/organizationMember'
import { getMenuList } from '../../services/technological/getMenuList'
import { getProjectList, getCurrentOrgAllMembers, createMeeting } from './../../services/technological/workbench'
import { getCurrentNounPlan } from '../../services/organization'
import { isApiResponseOk } from '../../utils/handleResponseData'
import { message } from 'antd'
import { MEMBERS, MESSAGE_DURATION_TIME, ORGANIZATION } from "../../globalset/js/constant";
import { routerRedux } from "dva/router";
import Cookies from "js-cookie";
import QueryString from 'querystring'
import { currentNounPlanFilterName, setOrganizationIdStorage } from "../../utils/businessFunction";

// 该model用于存放公用的 组织/权限/偏好设置/侧边栏的数据 (权限目前存放于localstorage, 未来会迁移到model中做统一)
let naviHeadTabIndex //导航栏naviTab选项
let locallocation //保存location在组织切换
export default {
  namespace: 'technological',
  state: {
    model_is_import: true, //模块是否注入标志
    datas: {
      currentUserOrganizes: [], //用户组织列表
      is_show_org_name: true, // 是否显示组织名称
      is_all_org: true, //是否全部组织
      menuList: [], // 侧边栏功能导航列表
      page_load_type: 0,
      currentUserWallpaperContent: null,
      currentSelectOrganize: {}, //用户当前组织
      userInfo: {}, //用户信息
    }
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen((location) => {
        // 头部table key
        locallocation = location
        if (location.pathname.indexOf('/technological') !== -1) {
          let page_load_type = 0;
          if (location.pathname.indexOf('/simplemode') != -1) {
            page_load_type = 1;
          } else {
            page_load_type = 2;
          }
          dispatch({
            type: 'updateDatas',
            payload: {
              page_load_type,
            }
          })
        }

        //切换组织时需要重新加载
        const param = QueryString.parse(location.search.replace('?', '')) || {}
        const { redirectHash } = param
        if (location.pathname === '/technological' && redirectHash) {
          dispatch({
            type: 'routingReplace',
            payload: {
              route: redirectHash
            }
          })
        }
      })
    },
  },
  effects: {

    // 初始化请求数据
    * initGetTechnologicalDatas({ payload }, { select, call, put }) {
      // 如果获取不到组织id就默认存储0
      if (!localStorage.getItem('OrganizationId')) {
        setOrganizationIdStorage('0')
      }
      yield put({
        type: 'updateDatas',
        payload: {
          OrganizationId: localStorage.getItem('OrganizationId') || '0'
        }
      })
      //查询所在组织列表
      yield put({
        type: 'getCurrentUserOrganizes',
        payload: {}
      })
      yield put({
        type: 'getMenuList',
        payload: {}
      })
      yield put({
        type: 'getUserAllOrgsAllBoards',
        payload: {}
      })
      // yield put({
      //   type: 'getUSerInfo',
      //   payload: {}
      // })

      //仅仅为了阻塞
      const Aa = yield put({
        type: 'getUSerInfo',
        payload: {}
      })
      const getUSerInfoSync = () => new Promise(resolve => {
        resolve(Aa.then())
      })
      yield call(getUSerInfoSync);

      yield put({ //  获取当前成员在组织中的权限列表
        type: 'getUserOrgPermissions',
        payload: {}
      })
      yield put({ //  获取当前职员所以项目的权限列表
        type: 'getUserBoardPermissions',
        payload: {}
      })
      //获取当前的用户当前组织的项目列表,
      yield put({
        type: 'getCurrentOrgProjectList',
        payload: {}
      })
      //获取用户当前组织的组织成员(如果非全组织，而是具有确认组织的情况下调用)
      if (localStorage.getItem('OrganizationId') != '0') {
        yield put({
          type: 'fetchCurrentOrgAllMembers',
        })
      }
      //当前名词定义的方案
      yield put({
        type: 'getCurrentNounPlan',
        payload: {}
      })
    },

    // 简单获取用户信息，设置用户的值
    * simplGetUserInfo({ payload }, { select, call, put }) {
      const res = yield call(getUSerInfo)
      if (isApiResponseOk(res)) {
        const current_org = res.data.current_org || {}
        // 如果用户已选了某个确认的组织，而与当前前端缓存中组织不一致，则默认执行改变组织操作，并刷新
        yield put({
          type: 'updateDatas',
          payload: {
            userInfo: res.data, //当前用户信息
            currentSelectOrganize: current_org
          }
        })
        //当前选中的组织
        localStorage.setItem('currentSelectOrganize', JSON.stringify(current_org))
        localStorage.setItem('userInfo', JSON.stringify(res.data))
        return res
      } else {
        return {}
      }
    },

    // 获取用户信息,相应的跳转操作
    * getUSerInfo({ payload }, { select, call, put }) {
      const simplGetUserInfo = yield put({
        type: 'simplGetUserInfo',
      })
      const simplGetUserInfoSync = () => new Promise(resolve => {
        resolve(simplGetUserInfo.then())
      })
      // 内容过滤处理end
      const res = yield call(simplGetUserInfoSync) || {}
      if (isApiResponseOk(res)) {
        const user_set = res.data.user_set || {}//当前选中的组织
        const current_org_id = user_set.current_org
        // 如果用户已选了某个确认的组织，而与当前前端缓存中组织不一致，则默认执行改变组织操作，并刷新
        if (current_org_id && current_org_id != localStorage.getItem('OrganizationId')) {
          yield put({
            type: 'changeCurrentOrg',
            payload: {
              org_id: current_org_id
            }
          })
          return
        }
        const is_simple_model = user_set.is_simple_model
        if (is_simple_model == '0' && locallocation.pathname.indexOf('/technological/simplemode') != -1) {
          // 如果用户设置的是高效模式, 但是路由中存在极简模式, 则以模式为准
          yield put(routerRedux.push('/technological/workbench'));
        } else if (is_simple_model == '1' && locallocation.pathname.indexOf('/technological/simplemode') == -1) {
          // 如果是用户设置的是极简模式, 但是路由中存在高效模式, 则以模式为准
          yield put(routerRedux.push('/technological/simplemode/home'))
        }
        //组织切换重新加载
        const { operateType, routingJumpPath = '/technological?redirectHash', isNeedRedirectHash = true } = payload
        if (operateType === 'changeOrg') {
          const redirectHash = locallocation.pathname//'/technological/workbench'
          if (document.getElementById('iframImCircle')) {
            document.getElementById('iframImCircle').src = `/im/index.html?timestamp=${new Date().getTime()}`;
          }
          if (isNeedRedirectHash) {
            yield put(routerRedux.push(`${routingJumpPath}=${redirectHash}`));
          } else {
            yield put(routerRedux.push(routingJumpPath));
          }
        }
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
      return {}
    },

    // 获取和存储全组织的全部项目
    * getUserAllOrgsAllBoards({ payload }, { select, call, put }) {
      let res = yield call(getUserAllOrgsAllBoards, payload)
      if (isApiResponseOk(res)) {
        localStorage.setItem('userAllOrgsAllBoards', JSON.stringify(res.data))
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    //组织 ----------- start
    * getCurrentUserOrganizes({ payload }, { select, call, put }) { //当前用户所属组织列表
      let res = yield call(getCurrentUserOrganizes, {})
      // console.log(res, 'get current use organization list.+++++++++++++++++++++++++++++++++++')
      if (isApiResponseOk(res)) {
        localStorage.setItem('currentUserOrganizes', JSON.stringify(res.data))
        yield put({
          type: 'updateDatas',
          payload: {
            currentUserOrganizes: res.data, ////当前用户所属组织列表
            // currentSelectOrganize: res.data.length? res.data[0] : {}  //当前选中的组织
          }
        })

        //创建后做切换组织操作
        const { operateType } = payload
        if (operateType === 'create') {
          yield put({
            type: 'changeCurrentOrg',
            payload: {
              org_id: res.data[res.data.length - 1].id
            }
          })
        }

        if (res.data.length) { //当前选中的组织id OrgId要塞在sessionStorage
          Cookies.set('org_id', res.data[0].id, { expires: 30, path: '' })
        }
        const { calback } = payload
        if (typeof calback === 'function') {
          calback()
        }
      } else {
      }
    },
    * changeCurrentOrg({ payload }, { select, call, put }) { //切换组织
      const { org_id, operateType, routingJumpPath, isNeedRedirectHash } = payload
      // console.log("sssss", org_id)
      let res = yield call(changeCurrentOrg, { org_id })
      if (isApiResponseOk(res)) {
        setOrganizationIdStorage(org_id)
        yield put({
          type: 'getUSerInfo',
          payload: {
            operateType: operateType ? operateType : 'changeOrg',
            routingJumpPath: routingJumpPath,
            isNeedRedirectHash: isNeedRedirectHash
          }
        })
        yield put({
          type: 'initGetTechnologicalDatas',
          payload: {

          }
        })
      } else {
        message.warn(`${currentNounPlanFilterName(ORGANIZATION)}切换出了点问题`, MESSAGE_DURATION_TIME)
      }
    },
    * getSearchOrganizationList({ payload }, { select, call, put }) {
      yield put({
        type: 'updateDatas',
        payload: {
          spinning: true
        }
      })
      let res = yield call(getSearchOrganizationList, payload)
      yield put({
        type: 'updateDatas',
        payload: {
          spinning: false
        }
      })
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            searchOrganizationList: res.data
          }
        })
      } else {
      }
    },
    * createOrganization({ payload }, { select, call, put }) {
      let res = yield call(createOrganization, payload)
      if (isApiResponseOk(res)) {
        //查询一遍
        yield put({
          type: 'getCurrentUserOrganizes',
          payload: {
            operateType: 'create',
            calback: function () {
              message.success(`创建${currentNounPlanFilterName(ORGANIZATION)}成功`, MESSAGE_DURATION_TIME)
            }
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
      return res || {}
    },
    * updateOrganization({ payload }, { select, call, put }) {
      let res = yield call(updateOrganization, payload)
      if (isApiResponseOk(res)) {
      } else {
      }
    },
    * applyJoinOrganization({ payload }, { select, call, put }) {
      let res = yield call(applyJoinOrganization, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getCurrentUserOrganizes',
          payload: {
            calback: function () {
              message.success(`申请加入${currentNounPlanFilterName(ORGANIZATION)}成功`, MESSAGE_DURATION_TIME)
            }
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * inviteJoinOrganization({ payload }, { select, call, put }) {
      let res = yield call(inviteJoinOrganization, payload)
      if (isApiResponseOk(res)) {
        message.success(`已成功添加${currentNounPlanFilterName(ORGANIZATION)}${currentNounPlanFilterName(MEMBERS)}`, MESSAGE_DURATION_TIME)
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    // 获取设置显示组织名称
    * getSetShowOrgName({ payload }, { select, call, put }) {
      let res = yield call(getSetShowOrgName, payload)
      if (!isApiResponseOk(res)) {
        message.error(res.message)
        return
      }
    },
    // 获取显示是否是极简模式
    * setShowSimpleModel({ payload }, { select, call, put }) {
      const { is_simple_model, redirectLocation = '/technological/workbench', calback } = payload
      let res = yield call(setShowSimpleModel, is_simple_model)
      if (!isApiResponseOk(res)) {
        message.error(res.message)
        return
      }

      // 切换模式后查询用户信息一致性
      yield put({
        type: 'simplGetUserInfo',
        payload: {}
      })

      if (is_simple_model == 1) {
        //极简模式只能是全企业

        localStorage.setItem('currentSelectOrganize', JSON.stringify({}))
        localStorage.setItem('OrganizationId', 0)
        yield put({
          type: 'technological/changeCurrentOrg',
          payload: {
            org_id: '0',
            operateType: 'other'
          }
        })
        yield put({
          type: 'technological/updateDatas',
          payload: {
            currentSelectOrganize: {},
            is_all_org: true,
            is_show_org_name: true,
          }
        })

        yield put({
          type: 'routingJump',
          payload: {
            route: '/technological/simplemode/home',
          }
        })
      } else {
        yield put({
          type: 'routingJump',
          payload: {
            route: redirectLocation,
          }
        })
      }
      if (calback && typeof calback === 'function') {
        calback()
      }
    },

    //组织 -----------end

    //权限---start获取用户的全部组织和全部项目权限
    * getUserOrgPermissions({ payload }, { select, call, put }) {
      const res = yield call(getUserOrgPermissions, payload)
      localStorage.setItem('userOrgPermissions', JSON.stringify({}))
      const delay = (ms) => new Promise(resolve => {
        setTimeout(resolve, ms)
      })
      yield call(delay, 300)
      // debugger
      if (isApiResponseOk(res)) {
        const OrganizationId = localStorage.getItem('OrganizationId')
        // 全组织的情况下，直接存【组织=》权限】列表
        if (OrganizationId == '0') {
          localStorage.setItem('userOrgPermissions', JSON.stringify(res.data))
          return
        }
        // 非全组织的情况下需要过滤出对应的当前选择的组织，获取对应的权限
        const userInfo = localStorage.getItem('userInfo') || '{}'
        const { current_org = {} } = JSON.parse(userInfo)
        const current_org_id = current_org['id']
        //返回的全部数据遍历和当前的org_id一致，则赋值权限
        for (let val of res.data) {
          if (val['org_id'] == current_org_id) {
            localStorage.setItem('userOrgPermissions', JSON.stringify(val['permissions'] || []))
            break
          }
        }
      } else {
        localStorage.setItem('userOrgPermissions', JSON.stringify([]))
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * getUserBoardPermissions({ payload }, { select, call, put }) {
      let res = yield call(getUserBoardPermissions, payload)
      if (isApiResponseOk(res)) {
        localStorage.setItem('userBoardPermissions', JSON.stringify(res.data || []))
      } else {
        localStorage.setItem('userBoardPermissions', JSON.stringify([]))
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    //权限---end

    //名词定义------start
    * getCurrentNounPlan({ payload }, { select, call, put }) {
      let res = yield call(getCurrentNounPlan, payload)
      if (isApiResponseOk(res)) {
        localStorage.setItem('currentNounPlan', JSON.stringify(res.data || []))
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    //名词定义------end


    * logout({ payload }, { select, call, put }) { //提交表单
      if (!Cookies.get('Authorization') || !Cookies.get('refreshToken')) {
        Cookies.remove('Authorization')
        Cookies.remove('refreshToken')
        window.location.hash = `#/login?redirect=${window.location.hash.replace('#', '')}`
        return
      }
      let res = yield call(logout, payload)
      if (isApiResponseOk(res)) {
        Cookies.remove('sdktoken')
        Cookies.remove('uid')
        Cookies.remove('Authorization')
        Cookies.remove('userInfo', { path: '' })
        window.location.hash = `#/login?redirect=${window.location.hash.replace('#', '')}`
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    // 侧边栏功能导航列表
    * getMenuList({ payload }, { call, put }) {
      let res = yield call(getMenuList, payload)
      // console.log('this is model', res)
      yield put({
        type: 'updateDatas',
        payload: {
          menuList: res.data
        }
      })
    },
    // 左侧导航栏
    * upDateNaviHeadTabIndex({ payload }, { select, call, put }) {
      yield put({
        type: 'updateDatas',
        payload: {
          naviHeadTabIndex
        }
      })
    },

    // 视频会议集成---start
    * initiateVideoMeeting({ payload }, { call }) {
      const res = yield call(createMeeting, payload)
      return res || {}
    },
    * getCurrentOrgProjectList({ payload }, { select, call, put }) {

      let res = yield call(getProjectList, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            currentOrgProjectList: res.data
          }
        })
      } else {

      }
      return res || {}
    },
    * fetchCurrentOrgAllMembers({ payload }, { call, put }) {
      let res = yield call(getCurrentOrgAllMembers, { ...payload })
      // console.log(res, 'fetchCurrentOrgAllMembers+++++++++++')
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            currentOrgAllMembersList: res.data.users
          }
        })
      }
    },
    ///视频会议集成end

    * routingJump({ payload }, { call, put }) {
      const { route } = payload
      yield put(routerRedux.push(route));
    },
    * routingReplace({ payload }, { call, put }) {
      const { route } = payload
      yield put(routerRedux.replace(route));
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
