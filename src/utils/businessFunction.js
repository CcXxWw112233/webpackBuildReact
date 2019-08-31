//业务逻辑公共工具类
import { NORMAL_NOUN_PLAN, CONTENT_DATA_TYPE_FILE } from '../globalset/js/constant'
import { get } from 'https';
import { Base64 } from 'js-base64';

// 权限的过滤和存储在technological下
// 权限分为全组织和确定组织下
// 确定组织下的数据为[{code: 'xxx'}]
// 全组织下的数据格式为
// const ss = [{
//   org_id: 'sss',
//   permissions: [
//     { code: 'xxx'}
//   ]
// }]
// 两者区别是通过确认的组织id过滤出permisions的列表
//》
//检查是否有操作权限(组织)
// 当全组织状态下，如果调用方法不传确认的组织id则默认有权限。如果传递了组织id那就遍历相应的权限code来获取有无权限
// 确认组织下，只需要传递code就可以遍历得到有无权限

//设置 和 获取全局属性里面的数据
global.globalData = {}
export const setGlobalData = (name, value) => {
    global.globalData[name] = value
}
export const getGlobalData = (name) => {
  return global.globalData[name]
}

export const checkIsHasPermission = (code, param_org_id) => {
  const OrganizationId = localStorage.getItem('OrganizationId')
  const organizationMemberPermissions = JSON.parse(localStorage.getItem('userOrgPermissions')) || []
  if(OrganizationId == '0') {
    if(!param_org_id) {
      return true
    } else {
      let currentOrgPermission = []
      for(let val of organizationMemberPermissions) {
        if(param_org_id == val['org_id']) {
          currentOrgPermission = val['permissions']
          break
        }
      }
      let flag = false
      for(let i = 0; i < currentOrgPermission.length; i ++) {
        if (code === currentOrgPermission[i]['code']) {
          flag = true
          break
        }
      }
      return flag
    }
  }
  if(!Array.isArray(organizationMemberPermissions)) {
    return false
  }
  let flag = false
  for(let i = 0; i < organizationMemberPermissions.length; i ++) {
    if (code === organizationMemberPermissions[i]['code']) {
      flag = true
      break
    }
  }
  return flag
}

//在当前项目中检查是否有权限操作
export const checkIsHasPermissionInBoard = (code, params_board_id) => {
  const userBoardPermissions = JSON.parse(localStorage.getItem('userBoardPermissions')) || []
  const board_id = params_board_id || getGlobalData('storageCurrentOperateBoardId')
  if(!Array.isArray(userBoardPermissions)) {
    return false
  }
  if(!board_id || board_id == '0') {
    return true
  }
  let currentBoardPermission = []
  for(let val of userBoardPermissions) {
    if(board_id == val['board_id']) {
      currentBoardPermission = val['permissions']
      break
    }
  }
  let flag = false
  for(let i = 0; i < currentBoardPermission.length; i ++) {
    if (code === currentBoardPermission[i]['code']) {
      flag = true
      break
    }
  }
  return flag
}

//返回当前名词定义对应名称
export const currentNounPlanFilterName = (code) => {
  let currentNounPlan = localStorage.getItem('currentNounPlan') ///|| NORMAL_NOUN_PLAN
  if(currentNounPlan) {
    currentNounPlan = JSON.parse(currentNounPlan)
  } else {
    currentNounPlan = NORMAL_NOUN_PLAN
  }
  let name = ''
  for(let i in currentNounPlan) {
    if(code === i) {
      name = currentNounPlan[i]
      break
    }
  }
  return name
}

// 返回全组织（各个组织下）或某个确认组织下对应的org_name
export const getOrgNameWithOrgIdFilter = (org_id, organizations = []) => {
  const OrganizationId = localStorage.getItem('OrganizationId')
  if(OrganizationId != '0') { //确认组织
    let currentSelectOrganize = localStorage.getItem('currentSelectOrganize') || '{}'
    currentSelectOrganize = JSON.parse(currentSelectOrganize)
    return currentSelectOrganize['name']
  } else { //全组织
    const name = (organizations.find(item => org_id == item.id) || {} ).name
    return name
  }
}

//打开pdf文件名
export const openPDF = (params) => {
  const { protocol, hostname } = window.location
  window.open(`${protocol}//${hostname}/#/iframeOut?operateType=openPDF&id=${params['id']}`)
}
//获取后缀名
export const getSubfixName = (file_name) => {
  return file_name ? file_name.substr(file_name.lastIndexOf(".")).toLowerCase() : ''
}

//设置localstorage缓存
export const setStorage = (key, value) => {
  localStorage.setItem(key, value)
}
//设置组织id localstorage缓存
export const setOrganizationIdStorage = (value) => {
  localStorage.setItem('OrganizationId', value)
}
//设置board_id localstorage缓存, 同时存储board_id对应的org_id
export const setBoardIdStorage = (value) => {
  setGlobalData('storageCurrentOperateBoardId', value)
  // 从缓存中拿到相应的board_id对应上org_id，存储当前项目的org_id => aboutBoardOrganizationId,
  // 如果当前组织确定（非全部组织），则返回当前组织
  const OrganizationId = localStorage.getItem('OrganizationId', value)
  if(OrganizationId && OrganizationId != '0') {
    setGlobalData('aboutBoardOrganizationId', OrganizationId)
    return
  }

  let userAllOrgsAllBoards = localStorage.getItem('userAllOrgsAllBoards') || '[]'
  if(userAllOrgsAllBoards) {
    userAllOrgsAllBoards = JSON.parse(userAllOrgsAllBoards)
  }
  let org_id = ''
  for(let val of userAllOrgsAllBoards) {
    for(let val_2 of val['board_ids']) {
      if(value == val_2) {
        org_id = val['org_id']
        break
      }
    }
    if(org_id) {
      break
    }
  }
  setGlobalData('aboutBoardOrganizationId', org_id || '0')
}

//是否有组织成员查看权限

export const isHasOrgMemberQueryPermission = () => checkIsHasPermission('org:upms:organization:member:query')

export const isHasOrgTeamBoardEditPermission = () => checkIsHasPermission('org:team:board:edit')


// 返回通用接口设置header里的baseinfo(访问控制后台需要)
export const setRequestHeaderBaseInfo = ({ data, params, headers}) => {

  let header_base_info_orgid = localStorage.getItem('OrganizationId') || '0'
  let header_base_info_board_id = getGlobalData('storageCurrentOperateBoardId') || '0'

  if(data['_organization_id'] || params['_organization_id']) {
    header_base_info_orgid = data['_organization_id'] || params['_organization_id']
  }

  if(data['boardId'] || params['boardId'] || data['board_id'] || params['board_id']) {
    header_base_info_board_id = data['boardId'] || params['boardId'] || data['board_id'] || params['board_id']
  }

  const header_base_info = Object.assign({
      orgId: header_base_info_orgid,
      boardId: header_base_info_board_id,
      aboutBoardOrganizationId: getGlobalData('aboutBoardOrganizationId') || '0',
  }, headers['BaseInfo'] || {})
  const header_base_info_str = JSON.stringify(header_base_info)
  const header_base_info_str_base64 = Base64.encode(header_base_info_str)
  const new_herders = {
    BaseInfo: header_base_info_str_base64
  }

  return new_herders
}

// 返回设置上传接口设置header里的baseinfo(访问控制后台需要)
export const setUploadHeaderBaseInfo = ({ orgId, boardId, aboutBoardOrganizationId, contentDataId, contentDataType}) => {

  let header_base_info_orgid = orgId || localStorage.getItem('OrganizationId') || '0'
  let header_base_info_board_id = boardId || getGlobalData('storageCurrentOperateBoardId') || '0'
  let header_base_info_about_board_org_id = aboutBoardOrganizationId || getGlobalData('aboutBoardOrganizationId') || '0'
  const header_base_info = {
    orgId: header_base_info_orgid,
    boardId: header_base_info_board_id,
    aboutBoardOrganizationId: header_base_info_about_board_org_id,
    contentDataType: contentDataType || CONTENT_DATA_TYPE_FILE,
    contentDataId
  }
  const header_base_info_str = JSON.stringify(header_base_info)
  const header_base_info_str_base64 = Base64.encode(header_base_info_str)
  const new_herders = {
    BaseInfo: header_base_info_str_base64
  }
  
  return new_herders
}
