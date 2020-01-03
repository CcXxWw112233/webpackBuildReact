import { isApiResponseOk } from '../../utils/handleResponseData'
import { message, notification } from 'antd'
import {
  MEMBERS, MESSAGE_DURATION_TIME, ORG_TEAM_BOARD_QUERY, ORG_UPMS_ORGANIZATION_MEMBER_QUERY,
  ORGANIZATION
} from "../../globalset/js/constant";
import { routerRedux } from "dva/router";
import Cookies from "js-cookie";
import {
  setGroupLeader, getMembersInOneGroup, getMemberInfo, setMemberRole, getCurrentOrgRole, inviteMemberToGroup,
  getGroupTreeList, discontinueMember, approvalMember, setMemberWitchGroup, removeMembersWithGroup, CreateGroup,
  getGroupList, updateGroup, deleteGroup, getGroupPartialInfo, inviteJoinOrganization, joinOrganization, removeUserVisitor
} from "../../services/technological/organizationMember";
import modelExtend from 'dva-model-extend'
import technological from './index'
import {getAppsList} from "../../services/technological/project";
import { selectGroupList } from './select'
import {checkIsHasPermission, currentNounPlanFilterName} from "../../utils/businessFunction";
export default modelExtend(technological, {
  namespace: 'organizationMember',
  state: [],
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen((location) => {
        message.destroy()
        if (location.pathname === '/technological/organizationMember') {
          dispatch({
            type: 'updateDatas',
            payload: {
              groupList: [], //全部分组
              TreeGroupModalVisiblie: false, //树状分组是否可见
              groupTreeList: [], //树状分组数据
              currentBeOperateMemberId: '', //当前被操作的成员id
              roleList: [], //当前组织角色列表
              menuSearchSingleSpinning: false, //获取分组负责人转转转
            }
          })
          if(checkIsHasPermission(ORG_UPMS_ORGANIZATION_MEMBER_QUERY) && localStorage.getItem('OrganizationId') != '0'){
            //获取分组列表
            dispatch({
              type: 'getGroupList',
              payload: {
              }
            })
            // 获取分组树状列表
            dispatch({
              type: 'getGroupTreeList',
              payload: {}
            })
            //查询当前角色
            dispatch({
              type: 'getCurrentOrgRole',
              payload: {
                type: '1'
              }
            })
          } else{
            dispatch({
              type: 'noLookPermissionsHandle',
            })
          }
        }
      })
    },
  },
  effects: {
    * noLookPermissionsHandle({ payload }, { select, call, put }) {
      const openNotification = () => {
        notification.open({
          message: '提示',
          description:
            '您所在当前组织没有查看组织团队职员权限。',
          onClick: () => {
            // console.log('Notification Clicked!');
          },
        });
      };
      openNotification()
      const delay = (ms) => new Promise(resolve => {
        setTimeout(resolve, ms)
      })
      yield call(delay, 2000)
      yield put(routerRedux.push('/technological/workbench'))
    },

    * getGroupList({ payload }, { select, call, put }) {
      const params  = {...payload}
      if(typeof params == 'object') {
        delete params.calback
      }
      let res = yield call(getGroupList, {_organization_id: localStorage.getItem('OrganizationId'), ...params, })
      if(isApiResponseOk(res)) {
        const groupList = res.data.data
        //将角色信息数据包裹
        if(res.data.data && res.data.data.length) {
          for(let i = 0; i < groupList.length; i++) {
            for(let j = 0; j < groupList[i]['members'].length; j++) {
              groupList[i]['members'][j]['role_detailInfo'] = {}
            }
            groupList[i]['leader_members'] = []
          }
        }
        yield put({
          type: 'updateDatas',
          payload: {
            groupList: groupList,
            member_count: res.data.member_count
          }
        })
        const { calback } = payload
        if(typeof calback === 'function') {
          calback()
        }
      }else {
        message.warn(res.message, MESSAGE_DURATION_TIME)

      }
    },
    * getGroupTreeList({ payload }, { select, call, put }) {
      let res = yield call(getGroupTreeList, {})
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            groupTreeList: res.data
          }
        })
      }else {
        message.warn(res.message, MESSAGE_DURATION_TIME)

      }
    },
    * CreateGroup({ payload }, { select, call, put }) {
      let res = yield call(CreateGroup, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'getGroupList',
          payload: {
            calback: function () {
              message.success('创建分组成功', MESSAGE_DURATION_TIME)
            }
          }
        })
        yield put({
          type: 'getGroupTreeList',
          payload: {}
        })
      }else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * updateGroup({ payload }, { select, call, put }) {
      let res = yield call(updateGroup, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getGroupList',
          payload: {
            calback: function () {
              message.success('更新分组信息成功', MESSAGE_DURATION_TIME)
            }
          }
        })
        yield put({
          type: 'getGroupTreeList',
          payload: {}
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * deleteGroup({ payload }, { select, call, put }) {
      let res = yield call(deleteGroup, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'getGroupList',
          payload: {
            calback: function () {
              message.success('删除分组成功', MESSAGE_DURATION_TIME)
            }
          }
        })
        yield put({
          type: 'getGroupTreeList',
          payload: {}
        })
      }else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * joinOrganization({ payload }, { select, call, put }) {
      let res = yield call(joinOrganization, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'getGroupList',
          payload: {
            calback: function () {
              message.success(`已将${currentNounPlanFilterName(MEMBERS)}加入组织`, MESSAGE_DURATION_TIME)
            }
          }
        })
      }else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * removeUserVisitor({ payload }, { select, call, put }) {
      let res = yield call(removeUserVisitor, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'getGroupList',
          payload: {
            calback: function () {
              message.success(`已将${currentNounPlanFilterName(MEMBERS)}移除`, MESSAGE_DURATION_TIME)
            }
          }
        })
      }else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    * removeMembersWithGroup({ payload }, { select, call, put }) {
      let res = yield call(removeMembersWithGroup, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'getGroupList',
          payload: {
            calback: function () {
              message.success(`已将${currentNounPlanFilterName(MEMBERS)}移出该分组`, MESSAGE_DURATION_TIME)
            }
          }
        })
      }else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * setMemberWitchGroup({ payload }, { select, call, put }) {
      let res = yield call(setMemberWitchGroup, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'getGroupList',
          payload: {
            calback: function () {
              message.success(`设置${currentNounPlanFilterName(MEMBERS)}分组成功`, MESSAGE_DURATION_TIME)
            }
          }
        })
      }else {
        message.warn(`设置${currentNounPlanFilterName(MEMBERS)}分组失败`, MESSAGE_DURATION_TIME)
      }

    },
    * getGroupPartialInfo({ payload }, { select, call, put }) {
      let res = yield call(getGroupPartialInfo, payload)
      if(isApiResponseOk(res)) {}
    },
    * inviteMemberToGroup ({ payload }, { select, call, put }) {
      let res = yield call(inviteMemberToGroup, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'getGroupList',
          payload: {
            calback: function () {
              message.success(`邀请${currentNounPlanFilterName(MEMBERS)}加入分组成功`, MESSAGE_DURATION_TIME)
            }
          }
        })
      }else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * approvalMember({ payload }, { select, call, put }) {
      const { status } = payload
      let res = yield call(approvalMember, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'getGroupList',
          payload: {
            calback: function () {
              message.success(status === '0'?`已拒绝${currentNounPlanFilterName(MEMBERS)}加入`:'已通过审批', MESSAGE_DURATION_TIME)
            }
          }
        })
      }else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * discontinueMember({ payload }, { select, call, put }) {
      let res = yield call(discontinueMember, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'getGroupList',
          payload: {
            calback: function () {
              message.success(`已停用该${currentNounPlanFilterName(MEMBERS)}`, MESSAGE_DURATION_TIME)
            }
          }
        })
      }else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * getCurrentOrgRole({ payload }, { select, call, put }) {
      let res = yield call(getCurrentOrgRole, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            roleList: res.data
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * setMemberRole({ payload }, { select, call, put }) {
      let res = yield call(setMemberRole, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getGroupList',
          payload: {
            calback: function () {
              message.success('设置成功', MESSAGE_DURATION_TIME)
            }
          }
        })
        yield put({
          type: 'getGroupTreeList',
          payload: {}
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * getMemberInfo({ payload }, { select, call, put }) {
      const {member_id, parentKey, itemKey, calback} = payload
      let res = yield call(getMemberInfo, {member_id})
      const groupList = yield select(selectGroupList)
      if (isApiResponseOk(res)) {
        groupList[parentKey]['members'][itemKey]['role_detailInfo'] = res.data
        yield put({
          type: 'updateDatas',
          payload: {
            groupList,
          }
        })
        if(typeof calback === 'function') {
          calback()
        }
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * getMembersInOneGroup({ payload }, { select, call, put }) {
      const {group_id, parentKey} = payload
      yield put({
        type: 'updateDatas',
        payload: {
          menuSearchSingleSpinning: true,
        }
      })
      let res = yield call(getMembersInOneGroup, {group_id})
      yield put({
        type: 'updateDatas',
        payload: {
          menuSearchSingleSpinning: false,
        }
      })

      const groupList = yield select(selectGroupList)
      if (isApiResponseOk(res)) {
        groupList[parentKey]['leader_members'] = res.data
        yield put({
          type: 'updateDatas',
          payload: {
            groupList,
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * setGroupLeader({ payload }, { select, call, put }) {
      const {group_id, member_id, parentKey, avatar, name} = payload
      let res = yield call(setGroupLeader, {group_id, member_id})
      const groupList = yield select(selectGroupList)
      if (isApiResponseOk(res)) {
        groupList[parentKey]['leader_id'] = member_id
        groupList[parentKey]['leader_avatar'] = avatar
        groupList[parentKey]['leader_name'] = name
        yield put({
          type: 'updateDatas',
          payload: {
            groupList,
          }
        })
        message.success('分组负责人设置成功', MESSAGE_DURATION_TIME)

      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * inviteJoinOrganization({ payload }, { select, call, put }) {
      let res = yield call(inviteJoinOrganization, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'getGroupList',
          payload: {
            calback: function () {
              message.success(`已成功添加${currentNounPlanFilterName(ORGANIZATION)}${currentNounPlanFilterName(MEMBERS)}`, MESSAGE_DURATION_TIME)
            }
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
    }
  },
});
