import {
  saveNounList,
  getNounList,
  getPayingStatus,
  getOrderList,
  getPermissions,
  savePermission,
  getRolePermissions,
  saveRolePermission,
  createRole,
  updateRole,
  deleteRole,
  copyRole,
  updateOrganization,
  setDefaultRole,
  getCurrentNounPlan,
  getFnManagementList,
  setFnManagementStatus,
  investmentMapAddAdministrators,
  investmentMapDeleteAdministrators,
  investmentMapQueryAdministrators,
  getTemplateList,
  createTemplete,
  updateTemplete,
  deleteTemplete,
  getTemplateListContainer,
  createTempleteContainer,
  deleteTempleteContainer,
  updateTempleteContainer,
  sortTempleteContainer,
  getCustomFieldList,
  createCustomFieldGroup,
  updateCustomFieldGroup,
  deleteCustomFieldGroup,
  createCustomField,
  updateCustomField,
  deleteCustomField,
  discountCustomField,
  createRelationCustomField,
  setRelationCustomField,
  deleteRelationCustomField
} from '../../services/organization'
import { isApiResponseOk } from '../../utils/handleResponseData'
import { message } from 'antd'
import {
  MESSAGE_DURATION_TIME,
  NOT_HAS_PERMISION_COMFIRN,
  ORG_UPMS_ORGANIZATION_ROLE_EDIT
} from '../../globalset/js/constant'
import { routerRedux } from 'dva/router'
import Cookies from 'js-cookie'
import { getAppsList } from '../../services/technological/project'
import modelExtend from 'dva-model-extend'
import technological from './index'
import { selectTabSelectKey } from './select'
import { checkIsHasPermission } from '../../utils/businessFunction'
import { getUSerInfo } from '../../services/technological'

export default {
  namespace: 'organizationManager',
  state: {
    datas: {
      currentNounPlan: {}
    }
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        message.destroy()
        if (location.pathname === '/organizationManager') {
          const currentSelectOrganize = localStorage.getItem(
            'currentSelectOrganize'
          )
            ? JSON.parse(localStorage.getItem('currentSelectOrganize'))
            : {} //JSON.parse(localStorage.getItem('currentSelectOrganize'))
          const {
            name,
            member_join_model,
            member_join_content,
            logo,
            logo_id,
            id
          } = currentSelectOrganize
          dispatch({
            type: 'updateDatas',
            payload: {
              currentOrganizationInfo: {
                //组织信息
                name,
                member_join_model,
                member_join_content,
                logo,
                logo_id,
                id,
                management_Array: [] //地图管理人员数组
              },
              content_tree_data: [], //可访问内容
              function_tree_data: [],
              orgnization_role_data: [], //组织角色数据
              project_role_data: [], //项目角色数据
              tabSelectKey: '1',
              // permission_data: [], //权限数据
              //名词定义
              current_scheme_local: '', //已选方案名称
              current_scheme: '', //当前方案名称
              current_scheme_id: '',
              scheme_data: [],
              field_data: [],
              editable: '0', //当前是否在自定义编辑状态 1是 0 否
              fnmanagement_list: [], //功能管理状态
              myWorkbenchBoxList: []

              // projectSchemeBreadCrumbList: [{id: '0', name: '全部方案'}]
            }
          })

          if (true) {
            //如果有权限才去查 //checkIsHasPermission(ORG_UPMS_ORGANIZATION_ROLE_EDIT)
            dispatch({
              type: 'getRolePermissions',
              payload: {
                type: '1'
              }
            })
            dispatch({
              type: 'getRolePermissions',
              payload: {
                type: '2'
              }
            })
            dispatch({
              type: 'getNounList',
              payload: {}
            })
            const OrganizationId = localStorage.getItem('OrganizationId')
            if (OrganizationId !== '0') {
              dispatch({
                type: 'getPayingStatus',
                payload: { orgId: OrganizationId }
              })
            }
          }
        } else {
        }
      })
    }
  },
  effects: {
    *updateOrganization({ payload }, { select, call, put }) {
      let res = yield call(updateOrganization, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getUSerInfo',
          payload: {
            calBack: function() {
              message.success('更新组织信息成功', MESSAGE_DURATION_TIME)
            }
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    *getUSerInfo({ payload }, { select, call, put }) {
      //提交表单
      let res = yield call(getUSerInfo, {})
      const { calBack } = payload
      if (typeof calBack === 'function') {
        calBack()
      }
      if (isApiResponseOk(res)) {
        //当前选中的组织
        if (res.data.current_org) {
          localStorage.setItem(
            'currentSelectOrganize',
            JSON.stringify(res.data.current_org)
          )
        }
        //存储
        localStorage.setItem('userInfo', JSON.stringify(res.data))
      } else {
      }
    },

    *getRolePermissions({ payload }, { select, call, put }) {
      const { type } = payload
      let res = yield call(getPermissions, { type })
      if (isApiResponseOk(res)) {
        const {
          content_tree_data = [],
          function_tree_data = [],
          role_data = [],
          box_data = []
        } = res.data
        for (let i = 0; i < role_data.length; i++) {
          const {
            already_has_content_permission = [],
            already_has_function_permission = []
          } = role_data[i]
          //权限树
          role_data[i]['function_tree_data'] = JSON.parse(
            JSON.stringify(function_tree_data)
          )
          const authDataChild = role_data[i]['function_tree_data']
          for (let j = 0; j < authDataChild.length; j++) {
            //取出相同的
            let selects = []
            for (let k = 0; k < authDataChild[j].child_data.length; k++) {
              for (let z = 0; z < already_has_function_permission.length; z++) {
                if (
                  already_has_function_permission[z] ===
                  authDataChild[j].child_data[k].id
                ) {
                  selects.push(already_has_function_permission[z])
                }
              }
            }
            role_data[i]['function_tree_data'][j]['selects'] = selects
            if (selects.length === authDataChild[j].child_data.length) {
              role_data[i]['function_tree_data'][j]['checkedAll'] = true
              role_data[i]['function_tree_data'][j]['indeterminate'] = false
            } else {
              role_data[i]['function_tree_data'][j]['checkedAll'] = false
              if (selects.length) {
                role_data[i]['function_tree_data'][j]['indeterminate'] = true
              } else {
                role_data[i]['function_tree_data'][j]['indeterminate'] = false
              }
            }
          }

          //盒子
          role_data[i]['box_data'] = box_data

          //内容树
          // role_data[i]['content_tree_data'] = JSON.parse(JSON.stringify(content_tree_data))
          // let already_has_content_permission_trans = []
          // for(let i = 0; i < already_has_content_permission.length; i++) {
          //   for(let j = 0; j < already_has_content_permission[i]['pitch_on_data'].length; j ++) {
          //     already_has_content_permission_trans.push(`${already_has_content_permission[i]['board_id']}__${ already_has_content_permission[i]['pitch_on_data'][j]}`)
          //   }
          // }
          // role_data[i]['already_has_content_permission_trans'] = already_has_content_permission_trans
        }
        if (type === '1') {
          //组织角色数据
          yield put({
            type: 'updateDatas',
            payload: {
              orgnization_role_data: role_data
            }
          })
        } else if (type === '2') {
          //项目角色数据
          yield put({
            type: 'updateDatas',
            payload: {
              project_role_data: role_data
            }
          })
        }

        const { calback } = payload
        if (typeof calback === 'function') {
          calback()
        }
      } else {
      }
    },
    *saveRolePermission({ payload }, { select, call, put }) {
      const tabSelectKey = yield select(selectTabSelectKey)
      const type = tabSelectKey === '2' ? '1' : '2'
      let res = yield call(savePermission, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getRolePermissions',
          payload: {
            type,
            calback: function() {
              message.success('保存成功', MESSAGE_DURATION_TIME)
            }
          }
        })
      } else {
        message.warn('保存失败', MESSAGE_DURATION_TIME)
      }
    },
    *createRole({ payload }, { select, call, put }) {
      let res = yield call(createRole, payload)
      const tabSelectKey = yield select(selectTabSelectKey)
      const type = tabSelectKey === '2' ? '1' : '2'
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getRolePermissions',
          payload: {
            type,
            calback: function() {
              message.success('添加角色成功', MESSAGE_DURATION_TIME)
            }
          }
        })
      } else {
        message.warn('添加角色失败', MESSAGE_DURATION_TIME)
      }
    },
    *updateRole({ payload }, { select, call, put }) {
      let res = yield call(updateRole, payload)
      const tabSelectKey = yield select(selectTabSelectKey)
      const type = tabSelectKey === '2' ? '1' : '2'
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getRolePermissions',
          payload: {
            type,
            calback: function() {
              message.success('更新角色成功', MESSAGE_DURATION_TIME)
            }
          }
        })
      } else {
        message.warn('更新角色失败', MESSAGE_DURATION_TIME)
      }
    },
    *deleteRole({ payload }, { select, call, put }) {
      let res = yield call(deleteRole, payload)
      const tabSelectKey = yield select(selectTabSelectKey)
      const type = tabSelectKey === '2' ? '1' : '2'
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getRolePermissions',
          payload: {
            type,
            calback: function() {
              message.success('删除角色成功', MESSAGE_DURATION_TIME)
            }
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    *copyRole({ payload }, { select, call, put }) {
      let res = yield call(copyRole, payload)
      const tabSelectKey = yield select(selectTabSelectKey)
      const type = tabSelectKey === '2' ? '1' : '2'
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getRolePermissions',
          payload: {
            type,
            calback: function() {
              message.success('复制角色成功', MESSAGE_DURATION_TIME)
            }
          }
        })
      } else {
        message.warn('复制角色失败', MESSAGE_DURATION_TIME)
      }
    },
    *setDefaultRole({ payload }, { select, call, put }) {
      let res = yield call(setDefaultRole, payload)
      const tabSelectKey = yield select(selectTabSelectKey)
      const type = tabSelectKey === '2' ? '1' : '2'
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getRolePermissions',
          payload: {
            type,
            calback: function() {
              message.success('设置默认角色成功', MESSAGE_DURATION_TIME)
            }
          }
        })
      } else {
        message.warn('设置默认角色失败', MESSAGE_DURATION_TIME)
      }
    },
    *getNounList({ payload }, { select, call, put }) {
      const res = yield call(getNounList, {})

      if (isApiResponseOk(res)) {
        const data = res.data || {}
        const scheme_data = data['scheme_data']
        const field_data = data['field_data']
        scheme_data.unshift(field_data)
        let editable = '0'

        for (let i = 0; i < scheme_data.length; i++) {
          //自定义没有列表时设
          if (
            !scheme_data[i]['field_value'] ||
            !scheme_data[i]['field_value'].length
          ) {
            scheme_data[i]['field_value'] = []
            for (let j = 0; j < scheme_data[0]['field_value'].length; j++) {
              const obj = {
                field_value: ''
              }
              scheme_data[i]['field_value'].push(obj)
            }
          }

          //默认是否自定义编辑状态
          if (data['current_scheme_id'] === scheme_data[i]['id']) {
            editable = scheme_data[i]['editable']
          }
        }

        yield put({
          type: 'updateDatas',
          payload: {
            ...res.data,
            current_scheme_local: res.data['current_scheme'],
            editable
          }
        })
      } else {
      }
    },

    *getPayingStatus({ payload }, { select, call, put }) {
      const res = yield call(getPayingStatus, payload)
      if (isApiResponseOk(res)) {
        const data = res.data || {}
        yield put({
          type: 'updateDatas',
          payload: {
            paymentInfo: data
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    *getOrderList({ payload }, { select, call, put }) {
      const res = yield call(getOrderList, payload)
      if (isApiResponseOk(res)) {
        const data = res.data || {}
        yield put({
          type: 'updateDatas',
          payload: {
            payOrderList: data
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    *saveNounList({ payload }, { select, call, put }) {
      const { current_scheme_local } = payload
      const res = yield call(saveNounList, payload)
      if (isApiResponseOk(res)) {
        message.success('已保存', MESSAGE_DURATION_TIME)
        yield put({
          type: 'updateDatas',
          payload: {
            current_scheme: current_scheme_local
          }
        })
        yield put({
          type: 'getCurrentNounPlan',
          payload: {}
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    *getCurrentNounPlan({ payload }, { select, call, put }) {
      let res = yield call(getCurrentNounPlan, payload)
      if (isApiResponseOk(res)) {
        // message.success('已保存', MESSAGE_DURATION_TIME)
        const result = JSON.stringify(res.data || [])
        yield put({
          type: 'updateDatas',
          payload: {
            currentNounPlan: res.data
          }
        })
        localStorage.setItem('currentNounPlan', result)
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    //权限(废弃)
    *getPermissions({ payload }, { select, call, put }) {
      const { type } = payload
      let res = yield call(getPermissions, { type })
      if (isApiResponseOk(res)) {
        const { role_data, function_data } = res.data
        const newData = JSON.parse(JSON.stringify(function_data))
        for (let i = 0; i < newData.length; i++) {
          for (let j = 0; j < newData[i].child_data.length; j++) {
            newData[i].child_data[j]['role_data'] = role_data
            if (
              newData[i].child_data[j]['role_data'].length <=
              newData[i].child_data[j]['already_has_role'].length
            ) {
              newData[i].child_data[j]['indeterminate'] = false
              newData[i].child_data[j]['checkedAll'] = true
            } else {
              newData[i].child_data[j]['checkedAll'] = false
              if (newData[i].child_data[j]['already_has_role'].length) {
                newData[i].child_data[j]['indeterminate'] = true
              } else {
                newData[i].child_data[j]['indeterminate'] = false
              }
            }
          }
        }
        yield put({
          type: 'updateDatas',
          payload: {
            permission_data: newData
          }
        })

        const { calback } = payload
        if (typeof calback === 'function') {
          calback()
        }
      } else {
      }
    },
    *savePermission({ payload }, { select, call, put }) {
      let res = yield call(savePermission, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'getPermissions',
          payload: {
            calback: function() {
              message.success('保存成功', MESSAGE_DURATION_TIME)
            }
          }
        })
      } else {
        message.warn('保存失败', MESSAGE_DURATION_TIME)
      }
    },

    *routingJump({ payload }, { call, put }) {
      const { route } = payload
      yield put(routerRedux.push(route))
    },

    *getFnManagementList({ payload }, { call, put }) {
      const res = yield call(getFnManagementList, payload)

      yield put({
        type: 'updateDatas',
        payload: {
          fnmanagement_list: res.data
        }
      })

      yield put({
        type: 'technological/getCurrentUserOrganizes',
        payload: {}
      })
    },

    *setFnManagement({ payload }, { call, put }) {
      const { id, status } = payload
      let res = yield call(setFnManagementStatus, { id, status })
      const { calback } = payload
      if (isApiResponseOk(res)) {
        if (typeof calback == 'function') {
          calback()
        }
        message.success('修改成功', MESSAGE_DURATION_TIME)
      } else {
        message.warn('修改失败', MESSAGE_DURATION_TIME)
      }
    },

    *investmentMapQueryAdministrators({ payload }, { call, put }) {
      const res = yield call(investmentMapQueryAdministrators, payload)
      yield put({
        type: 'updateDatas',
        payload: {
          management_Array: res.data
        }
      })
    },

    *investmentMapAddAdministrators({ payload }, { call, put }) {
      const res = yield call(investmentMapAddAdministrators, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'investmentMapQueryAdministrators',
          payload: {
            _organization_id: payload._organization_id
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    *investmentMapDeleteAdministrators({ payload }, { call, put }) {
      const res = yield call(investmentMapDeleteAdministrators, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'investmentMapQueryAdministrators',
          payload: {
            _organization_id: payload._organization_id
          }
        })
        message.info('移除成功', MESSAGE_DURATION_TIME)
      } else {
        message.warn('移除失败', MESSAGE_DURATION_TIME)
      }
    },

    // 获取模板列表
    *getTemplateList({ payload }, { call, put }) {
      const res = yield call(getTemplateList, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            projectTemplateList: res.data
          }
        })
      }
    },

    // 获取模板列表内容
    *getTemplateListContainer({ payload }, { call, put }) {
      let { template_id } = payload
      const res = yield call(getTemplateListContainer, { template_id })
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            currentTempleteListContainer: res.data
          }
        })
      }
    },

    // 创建模板
    *createTemplete({ payload }, { call, put }) {
      const { _organization_id } = payload
      const res = yield call(createTemplete, payload)
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success('创建模板成功', MESSAGE_DURATION_TIME)
        }, 200)
        yield put({
          type: 'getTemplateList',
          payload: {
            _organization_id
          }
        })
      } else {
        message.warn(res.message)
      }
    },
    // 更新模板
    *updateTemplete({ payload }, { call, put }) {
      const { _organization_id, id, name } = payload
      const res = yield call(updateTemplete, { id, name })
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success('重命名成功', MESSAGE_DURATION_TIME)
        }, 200)
        yield put({
          type: 'getTemplateList',
          payload: {
            _organization_id,
            type: '2'
          }
        })
      } else {
        message.warn(res.message)
      }
    },

    // 删除模板
    *deleteTemplete({ payload }, { call, put }) {
      const { _organization_id, id } = payload
      const res = yield call(deleteTemplete, { id })
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success('删除模板成功', MESSAGE_DURATION_TIME)
        }, 200)
        yield put({
          type: 'getTemplateList',
          payload: {
            _organization_id,
            type: '2'
          }
        })
      } else {
        message.warn(res.message)
      }
    },

    // 创建模板内容
    *createTempleteContainer({ payload }, { call, put }) {
      let res = yield call(createTempleteContainer, payload)
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success('创建成功', MESSAGE_DURATION_TIME)
        }, 200)
        yield put({
          type: 'getTemplateListContainer',
          payload: {
            template_id: payload.template_id
          }
        })
      } else {
        message.warn(res.message)
      }
      return res || {}
    },

    // 更新模板内容
    *updateTempleteContainer({ payload }, { call, put }) {
      let { id, name, template_id } = payload
      let res = yield call(updateTempleteContainer, { id, name })
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success('更新成功', MESSAGE_DURATION_TIME)
        }, 200)
        yield put({
          type: 'getTemplateListContainer',
          payload: {
            template_id: template_id
          }
        })
      }
      return res || {}
    },

    // 删除模板内容
    *deleteTempleteContainer({ payload }, { call, put }) {
      let { id, template_id } = payload
      let res = yield call(deleteTempleteContainer, { id })
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success('删除成功', MESSAGE_DURATION_TIME)
        }, 200)
        yield put({
          type: 'getTemplateListContainer',
          payload: {
            template_id: template_id
          }
        })
      } else {
        message.warn(res.message)
      }
      return res || {}
    },

    // 排序
    *sortTempleteContainer({ payload }, { call, put }) {
      let { template_id } = payload
      let res = yield call(sortTempleteContainer, { ...payload })
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success('更新成功', MESSAGE_DURATION_TIME)
        }, 200)
        yield put({
          type: 'getTemplateListContainer',
          payload: {
            template_id: template_id
          }
        })
      } else {
        message.warn(res.message)
      }
    },

    // 获取自定义字段分组列表
    *getCustomFieldList({ payload }, { call, put }) {
      let res = yield call(getCustomFieldList)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            customFieldsList: res.data
          }
        })
      }
    },

    // 创建自定义字段分组
    *createCustomFieldGroup({ payload }, { call, put }) {
      let res = yield call(createCustomFieldGroup, { ...payload })
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success('创建成功', MESSAGE_DURATION_TIME)
        }, 200)
        yield put({
          type: 'getCustomFieldList',
          payload: {}
        })
      } else {
        message.warn(res.message)
      }
    },

    // 更新自定义字段分组
    *updateCustomFieldGroup({ payload }, { call, put }) {
      let res = yield call(updateCustomFieldGroup, { ...payload })
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success('更新成功', MESSAGE_DURATION_TIME)
        }, 200)
        yield put({
          type: 'getCustomFieldList',
          payload: {}
        })
      } else {
        message.warn(res.message)
      }
      return res || {}
    },

    // 删除自定义字段分组
    *deleteCustomFieldGroup({ payload }, { call, put }) {
      let res = yield call(deleteCustomFieldGroup, { ...payload })
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success('删除成功', MESSAGE_DURATION_TIME)
        }, 200)
        yield put({
          type: 'getCustomFieldList',
          payload: {}
        })
      } else {
        message.warn(res.message)
      }
      return res || {}
    },

    // 创建自定义字段
    *createCustomField({ payload }, { call, put }) {
      let res = yield call(createCustomField, { ...payload })
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success('创建成功', MESSAGE_DURATION_TIME)
        }, 200)
        yield put({
          type: 'getCustomFieldList',
          payload: {}
        })
      } else {
        message.warn(res.message)
      }
      return res || {}
    },

    // 更新自定义字段
    *updateCustomField({ payload }, { call, put }) {
      let res = yield call(updateCustomField, { ...payload })
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success('更新成功', MESSAGE_DURATION_TIME)
        }, 200)
        yield put({
          type: 'getCustomFieldList',
          payload: {}
        })
      } else {
        message.warn(res.message)
      }
      return res || {}
    },

    // 删除自定义字段
    *deleteCustomField({ payload }, { call, put }) {
      let res = yield call(deleteCustomField, { ...payload })
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success('删除成功', MESSAGE_DURATION_TIME)
        }, 200)
        yield put({
          type: 'getCustomFieldList',
          payload: {}
        })
      } else {
        message.warn(res.message)
      }
      return res || {}
    },

    // 停用自定义字段
    *discountCustomField({ payload }, { call, put }) {
      let res = yield call(discountCustomField, { ...payload })
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success('停用成功', MESSAGE_DURATION_TIME)
        }, 200)
        yield put({
          type: 'getCustomFieldList',
          payload: {}
        })
      } else {
        message.warn(res.message)
      }
      return res || {}
    },

    // 创建关联字段
    *createRelationCustomField({ payload }, { call, put }) {
      let res = yield call(createRelationCustomField, { ...payload })
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success('添加成功', MESSAGE_DURATION_TIME)
        }, 200)
      } else {
        message.warn(res.message)
      }
      return res || {}
    },

    // 设置关联字段值
    *setRelationCustomField({ payload }, { call, put }) {
      let res = yield call(setRelationCustomField, { ...payload })
      if (isApiResponseOk(res)) {
        // setTimeout(() => {
        //   message.success('添加成功', MESSAGE_DURATION_TIME)
        // }, 200)
      } else {
        message.warn(res.message)
      }
      return res || {}
    },

    // 删除关联字段
    *deleteRelationCustomField({ payload }, { call, put }) {
      let res = yield call(deleteRelationCustomField, { ...payload })
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success('删除成功', MESSAGE_DURATION_TIME)
        }, 200)
      } else {
        message.warn(res.message)
      }
      return res || {}
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
