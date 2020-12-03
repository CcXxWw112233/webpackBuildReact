//业务逻辑公共工具类
import {
  NORMAL_NOUN_PLAN,
  CONTENT_DATA_TYPE_FILE
} from '../globalset/js/constant'
import { get } from 'https'
import { Base64 } from 'js-base64'
import moment from 'moment'
import { validOnlyNumber } from './verify'
import { lx_utils } from 'lingxi-im'
import { arrayNonRepeatfy } from './util'

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
  window.sessionStorage.setItem(name, value)
  // global.globalData[name] = value
}
export const getGlobalData = name => {
  return window.sessionStorage.getItem(name)
  // return global.globalData[name]
}

export const checkIsHasPermission = (code, param_org_id) => {
  const OrganizationId = localStorage.getItem('OrganizationId')
  const organizationMemberPermissions =
    JSON.parse(localStorage.getItem('userOrgPermissions')) || []
  if (OrganizationId == '0') {
    //全组织下需要取出传入组织对应的权限
    if (!param_org_id) {
      return true
    } else {
      const currentOrgPermissions =
        organizationMemberPermissions[param_org_id] || []
      if (!Array.isArray(currentOrgPermissions)) {
        return false
      }
      return currentOrgPermissions.includes(code)
    }
  } else {
    if (!Array.isArray(organizationMemberPermissions)) {
      return false
    }
    return organizationMemberPermissions.includes(code)
  }
}

/**
 * 这是检测某个用户的访问控制权限
 * 思路: 先在该用户所在的权限列表中查询找到对应的用户, 如果存在, 那么该用户的权限就是
 * code 类型 { edit > comment > read > permissionsValue } 中的一种,
 * 如果不存在, 那么就去查看该用户在项目中对应的权限列表
 *
 * 想要达到的效果是,在哪里调用就返回对应的true/false
 * 比如想判断它是否是编辑, 那么传入对应的code,
 *
 * 缺点: 就是限制了code类型, 而且必须要在你知道的情况下
 * @param {String} code 对应用户的字段类型
 * @param {Array} privileges 该用户所在的权限列表
 * @param {Array} principalList 该用户所在的执行人列表
 * @param {Boolean} permissionsValue 所有用户在项目中的权限
 * @param {Boolean} is_valid_group 表示是否验证分组 为true时不需要执行人列表
 * @return {Boolean} 该方法返回一个布尔类型的值, 为true 表示可以行使该权限
 */
export const checkIsHasPermissionInVisitControl = (
  code,
  privileges,
  is_privilege,
  principalList,
  permissionsValue,
  is_valid_group
) => {
  // 1. 从localstorage中获取当前操作的用户信息
  // 2. 在privileges列表中查找该用户, 如果找到了, 根据返回的code类型来判断该用户的操作权限
  // 3. 找不到, 那么就取permissionsValue中对应的权限
  // if (is_privilege == '0') return true
  const { user_set = {} } = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : {}
  const { user_id } = user_set
  let flag
  if (!Array.isArray(privileges)) {
    // 纯属为了高端, 没啥用
    return false
  }
  if (!Array.isArray(principalList)) {
    // 纯属为了高端, 没啥用
    return false
  }
  let new_privileges = [...privileges]
  let new_principalList = [...principalList]

  // 这是需要从privileges列表中找到当前操作的用户
  let currentUserArr = []
  new_privileges.find(item => {
    if (!(item && item.user_info)) return false
    let { id } = item && item.user_info
    if (!id) return false
    if (user_id == id) {
      currentUserArr.push(item)
      return currentUserArr
    }
  })

  // 这是需要获取当前自己是否在执行人列表中
  let currentPricipalListWhetherOrNotSelf = []
  new_principalList.find(item => {
    if (user_id == item.user_id) {
      currentPricipalListWhetherOrNotSelf.push(item)
      return currentPricipalListWhetherOrNotSelf
    }
  })

  if (is_valid_group) {
    if (!(currentUserArr && currentUserArr.length)) {
      // 如果说也不在权限列表中, 那么就返回项目中的权限列表
      return (flag = permissionsValue)
    } else {
      currentUserArr = currentUserArr.map(item => {
        if (!(item && item.user_info)) return false
        let { id } = item && item.user_info
        if (!id) return false
        if (user_id == id) {
          // 判断改成员能不能在自己的权限列表中查询到
          if (item.content_privilege_code == code) {
            // 如果说该职员的权限状态与code匹配, 返回true, 表示有权利
            flag = true
          } else {
            // 返回false,表示没有权利
            flag = false
          }
        }
        return flag
      })
    }
  } else {
    /**
     * 如果该用户不在权限列表中, 那么就判断在不在执行人列表中
     */
    if (!(currentUserArr && currentUserArr.length)) {
      // 如果说也不在执行人列表中, 那么就返回项目中的权限列表
      if (
        !(
          currentPricipalListWhetherOrNotSelf &&
          currentPricipalListWhetherOrNotSelf.length
        )
      ) {
        return (flag = permissionsValue)
      } else {
        // 否则返回true, 代表有权限
        return (flag = true)
      }
    }

    // 这是需要用当前用户去遍历, 只能有一个, 并且只要一种结果, 进入一个条件之后不会进入其他条件
    currentUserArr = currentUserArr.map(item => {
      if (!(item && item.user_info)) return false
      let { id } = item && item.user_info
      if (!id) return false
      if (user_id == id) {
        // 判断改成员能不能在自己的权限列表中查询到
        if (item.content_privilege_code == code) {
          // 如果说该职员的权限状态与code匹配, 返回true, 表示有权利
          flag = true
        } else {
          // 返回false,表示没有权利
          flag = false
        }
      } else {
        // 找不到该成员, 那么就在对应的该项目中查找对应的权限列表
        flag = permissionsValue // 返回对应项目权限列表中的状态
      }
      return flag
    })
  }

  return flag
}

//设置获取分组中访问控制人的列表
export const getProjectParticipant = (
  lane_data = {},
  privileges_extend = []
) => {
  const { card_no_times, cards } = lane_data
  // 1. 这是将在每一个card_data中的存在的executors取出来,保存在一个数组中
  const card_data = [].concat(card_no_times, cards)
  const projectParticipant = card_data.reduce(
    (acc, curr) =>
      // console.log(acc, '------', curr, 'sssssss')
      [
        ...acc,
        ...(curr && curr.executors && curr.executors.length
          ? curr.executors.filter(i => !acc.find(e => e.user_id === i.user_id))
          : [])
      ],
    []
  )
  // 2. 如果存在extend列表中的成员也要拼接进来, 然后去重
  const extendParticipant = privileges_extend && [...privileges_extend]
  let temp_projectParticipant = [].concat(
    ...projectParticipant,
    extendParticipant
  ) // 用来保存新的负责人列表
  let new_projectParticipant = arrayNonRepeatfy(temp_projectParticipant)
  return new_projectParticipant
}

/**
 * 检测根据分组访问控制来判断对应任务和里程碑的权限
 * 任务|里程碑中的权限控制根据分组来, 如果分组是开放的 则返回项目中的权限
 * @param {String} list_id 当前操作的分组ID
 * @param {Array} list_group 对应的分组列表
 * @param {String} is_privilege 分组对应的开启权限 0 表示开启访问 1 表示禁止外部人员访问 2 表示仅列表成员访问与操作, 外部人员不可操作
 * @param {Array} privileges 分组中的权限列表 (需要包括继承的)
 * @param {Boolean} permissionsValue 用户在项目中的权限
 * @returns {Boolean} true 表示有权限
 */
export const checkIsHasPermissionInVisitControlWithGroup = ({
  code,
  list_id,
  list_group = [],
  permissionsValue
}) => {
  const gold_item = list_group.find(item => item.list_id == list_id) || {}
  const {
    is_privilege = '0',
    privileges = [],
    privileges_extend = [],
    lane_data = {}
  } = gold_item
  // const principalList = getProjectParticipant(lane_data, privileges_extend)
  let flag = false
  // 表示如果分组是开放的, 则以项目中的权限为主
  if (is_privilege == '0') return (flag = permissionsValue)
  // 1、找到当前操作的用户
  const { user_set = {} } = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : {}
  const { user_id } = user_set
  // 2、判断用户是否在权限列表中
  let new_privileges = [...privileges]
  // let new_principalList = [...principalList]

  // 先判断分组中继承的人员中是否存在当前操作人
  let currentPricipalListWhetherOrNotSelf = []
  // new_principalList.find(item => {
  //   if (user_id == item.user_id) {
  //     currentPricipalListWhetherOrNotSelf.push(item)
  //   }
  // })

  if (
    !!(
      currentPricipalListWhetherOrNotSelf &&
      currentPricipalListWhetherOrNotSelf.length
    )
  ) {
    // 表示存在
    return (flag = permissionsValue)
  } else {
    // 表示不再继承列表中, 那么判断是否存在权限列表中
    // 这是需要从privileges列表中找到当前操作的用户
    let currentUserArr = []
    new_privileges.find(item => {
      if (!(item && item.user_info)) return false
      let { id } = item && item.user_info
      if (!id) return false
      if (user_id == id) {
        currentUserArr.push(item)
        return currentUserArr
      }
    })

    if (!(currentUserArr && currentUserArr.length)) {
      // 表示在权限列表中没有找到该操作人
      if (is_privilege == '1') {
        // 表示该操作人看不见该分组 那么肯定没有权限
        return (flag = false)
      } else if (is_privilege == '2') {
        // 表示该分组仅列表中的成员可以操作, 那么也没有权限
        return (flag = false)
      }
    }
    // 表示已经存在在权限列表中了 那么判断当前操作人是否具有可编辑权限
    flag = currentUserArr.find(
      item => item.content_privilege_code == code || 'edit'
    )
  }
  return flag
}

//在当前项目中检查是否有权限操作
export const checkIsHasPermissionInBoard = (code, params_board_id) => {
  const userBoardPermissions =
    JSON.parse(localStorage.getItem('userBoardPermissions')) || []
  const board_id =
    params_board_id || getGlobalData('storageCurrentOperateBoardId')

  if (!board_id || board_id == '0') {
    return true
  }
  const currentBoardPermission = userBoardPermissions[board_id] || []
  if (!Array.isArray(currentBoardPermission)) {
    return false
  }
  const bool = currentBoardPermission.includes(code)
  return bool
}

//返回当前名词定义对应名称
export const currentNounPlanFilterName = (code, currentNounPlan_parm) => {
  let currentNounPlan
  if (
    localStorage.getItem('OrganizationId') == '0' ||
    !localStorage.getItem('OrganizationId')
  ) {
    //全组织下采用默认
    currentNounPlan = NORMAL_NOUN_PLAN
  } else {
    if (!currentNounPlan_parm) {
      currentNounPlan = localStorage.getItem('currentNounPlan')
      if (currentNounPlan) {
        currentNounPlan = JSON.parse(currentNounPlan)
      } else {
        currentNounPlan = NORMAL_NOUN_PLAN
      }
    } else {
      if (
        typeof currentNounPlan_parm == 'object' &&
        currentNounPlan_parm.hasOwnProperty('Projects')
      ) {
        currentNounPlan = currentNounPlan_parm
      } else {
        currentNounPlan = NORMAL_NOUN_PLAN
      }
    }
  }

  let name = ''
  for (let i in currentNounPlan) {
    if (code === i) {
      name = currentNounPlan[i]
      break
    }
  }
  return name
}

// 返回全组织（各个组织下）或某个确认组织下对应的org_name
export const getOrgNameWithOrgIdFilter = (org_id, organizations = []) => {
  const OrganizationId = localStorage.getItem('OrganizationId')
  if (OrganizationId != '0') {
    //确认组织
    let currentSelectOrganize =
      localStorage.getItem('currentSelectOrganize') || '{}'
    currentSelectOrganize = JSON.parse(currentSelectOrganize)
    return currentSelectOrganize['name']
  } else {
    //全组织
    const name = (organizations.find(item => org_id == item.id) || {}).name
    return name
  }
}

//打开pdf文件名
export const openPDF = params => {
  const { protocol, hostname } = window.location
  window.open(
    `${protocol}//${hostname}/#/iframeOut?operateType=openPDF&id=${params['id']}`
  )
}
//获取后缀名
export const getSubfixName = file_name => {
  return file_name
    ? file_name.substr(file_name.lastIndexOf('.')).toLowerCase()
    : ''
}

//设置localstorage缓存
export const setStorage = (key, value) => {
  localStorage.setItem(key, value)
}
//设置组织id localstorage缓存
export const setOrganizationIdStorage = value => {
  localStorage.setItem('OrganizationId', value)
}
//设置board_id localstorage缓存, 同时存储board_id对应的org_id
export const setBoardIdStorage = (value, param_org_id) => {
  setGlobalData('storageCurrentOperateBoardId', value)
  // 从缓存中拿到相应的board_id对应上org_id，存储当前项目的org_id => aboutBoardOrganizationId,
  // 如果当前组织确定（非全部组织），则返回当前组织
  if (param_org_id) {
    setGlobalData('aboutBoardOrganizationId', param_org_id)
    return
  }
  const OrganizationId = localStorage.getItem('OrganizationId', value)
  if (OrganizationId && OrganizationId != '0') {
    setGlobalData('aboutBoardOrganizationId', OrganizationId)
    return
  }

  let userAllOrgsAllBoards =
    localStorage.getItem('userAllOrgsAllBoards') || '[]'
  if (userAllOrgsAllBoards) {
    userAllOrgsAllBoards = JSON.parse(userAllOrgsAllBoards)
  }
  let org_id = ''
  for (let val of userAllOrgsAllBoards) {
    for (let val_2 of val['board_ids']) {
      if (value == val_2) {
        org_id = val['org_id']
        break
      }
    }
    if (org_id) {
      break
    }
  }
  setGlobalData('aboutBoardOrganizationId', org_id || '0')
}
// 通过board_id查询得到board_id所属的org_id
export const getOrgIdByBoardId = boardId => {
  if (!boardId) {
    return ''
  }
  let userAllOrgsAllBoards =
    localStorage.getItem('userAllOrgsAllBoards') || '[]'
  if (userAllOrgsAllBoards) {
    userAllOrgsAllBoards = JSON.parse(userAllOrgsAllBoards)
  }
  let org_id = ''
  for (let val of userAllOrgsAllBoards) {
    for (let val_2 of val['board_ids']) {
      if (boardId == val_2) {
        org_id = val['org_id']
        break
      }
    }
    if (org_id) {
      break
    }
  }
  return org_id
}

//是否有组织成员查看权限

export const isHasOrgMemberQueryPermission = () =>
  checkIsHasPermission('org:upms:organization:member:query')

export const isHasOrgTeamBoardEditPermission = () =>
  checkIsHasPermission('org:team:board:edit')

// 返回通用接口设置header里的baseinfo(访问控制后台需要)
export const setRequestHeaderBaseInfo = ({ data, params, headers }) => {
  let header_base_info_orgid =
    (headers['BaseInfo'] || {}).orgId ||
    localStorage.getItem('OrganizationId') ||
    '0'
  let header_base_info_board_id =
    (headers['BaseInfo'] || {}).boardId ||
    getGlobalData('storageCurrentOperateBoardId') ||
    '0'

  if (data['_organization_id'] || params['_organization_id']) {
    header_base_info_orgid =
      data['_organization_id'] || params['_organization_id']
  }

  if (
    data['boardId'] ||
    params['boardId'] ||
    data['board_id'] ||
    params['board_id']
  ) {
    header_base_info_board_id =
      data['boardId'] ||
      params['boardId'] ||
      data['board_id'] ||
      params['board_id']
  }
  header_base_info_board_id = validOnlyNumber(header_base_info_board_id)
    ? header_base_info_board_id
    : '0'

  const header_base_info = Object.assign(
    {
      orgId: header_base_info_orgid,
      boardId: header_base_info_board_id,
      aboutBoardOrganizationId: getGlobalData('aboutBoardOrganizationId') || '0'
    },
    headers['BaseInfo'] || {}
  )
  const header_base_info_str = JSON.stringify(header_base_info)
  const header_base_info_str_base64 = Base64.encode(header_base_info_str)
  const new_herders = {
    BaseInfo: header_base_info_str_base64
  }

  return new_herders
}

// 返回设置上传接口设置header里的baseinfo(访问控制后台需要)
export const setUploadHeaderBaseInfo = ({
  orgId,
  boardId,
  aboutBoardOrganizationId,
  contentDataId,
  contentDataType
}) => {
  let header_base_info_orgid =
    orgId || localStorage.getItem('OrganizationId') || '0'
  let header_base_info_board_id =
    boardId || getGlobalData('storageCurrentOperateBoardId') || '0'
  let header_base_info_about_board_org_id =
    aboutBoardOrganizationId || getGlobalData('aboutBoardOrganizationId') || '0'
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

export const isPaymentOrgUser = _org_id => {
  let OrganizationId
  if (_org_id) {
    OrganizationId = _org_id
  } else {
    OrganizationId = localStorage.getItem('OrganizationId')
  }
  const currentUserOrganizes =
    JSON.parse(localStorage.getItem('currentUserOrganizes')) || []
  // console.log("OrganizationId", OrganizationId);
  // console.log("currentUserOrganizes", currentUserOrganizes);

  if (OrganizationId == '0') {
    //全组织
    for (let org of currentUserOrganizes) {
      if (org.payment_status == 1) {
        return true
      }
    }
  } else {
    //单组织
    let curentOrgs = currentUserOrganizes.filter(
      item => item.id == OrganizationId
    )
    // console.log("curentOrgs", curentOrgs);
    if (curentOrgs && curentOrgs.length > 0) {
      let curentOrg = curentOrgs[0] || {}
      if (
        curentOrg.payment_status == 1 &&
        moment(
          parseInt(
            curentOrg.payment_end_date.length == 10
              ? curentOrg.payment_end_date + '000'
              : curentOrg.payment_end_date
          )
        ).isAfter(new Date())
      ) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }
}

// (极简模式下)，点击或选择某个项目时，做项目联动，圈子联动和相关规划统一处理
export const selectBoardToSeeInfo = ({
  board_id,
  selected_board_term,
  board_name,
  dispatch,
  autoOpenIm = true,
  org_id,
  is_new_board,
  group_view_type = '1'
}) => {
  setBoardIdStorage(board_id, org_id)
  dispatch({
    //设置极简模式的已选项目
    type: 'simplemode/updateDatas',
    payload: {
      simplemodeCurrentProject:
        board_id == '0'
          ? selected_board_term == '1'
            ? { selected_board_term: '1' }
            : selected_board_term == '2'
            ? { selected_board_term: '2' }
            : ''
          : {
              board_id,
              board_name,
              org_id: org_id || getOrgIdByBoardId(board_id),
              selected_board_term:
                selected_board_term == '1'
                  ? selected_board_term
                  : selected_board_term == '2'
                  ? selected_board_term
                  : '0'
            }
    }
  })

  if (board_id && board_id != '0') {
    //请求项目详情
    dispatch({
      type: 'projectDetail/projectDetailInfo',
      payload: {
        id: board_id
      }
    })
  }

  let new_group_view_type = group_view_type
  if (board_id == '0' || !board_id) {
    new_group_view_type = '1'
  }

  dispatch({
    //更新甘特图
    type: 'gantt/updateDatas',
    payload: {
      gantt_board_id: board_id || '0',
      is_new_board,
      list_group: [],
      outline_tree: [],
      group_view_type: new_group_view_type,
      target_scrollTop: 0
    }
  })
  dispatch({
    //更新用户信息中已选项目（接口）
    type: 'accountSet/updateUserSet',
    payload: {
      current_board: board_id || '0'
    }
  })
  dispatch({
    //更新用户信息中已选项目
    type: 'technological/setUserInfoAbout',
    payload: {
      current_board_id: board_id,
      current_board_name: board_name
    }
  })
  const target = document.getElementById('gantt_card_out_middle')
  if (target) {
    target.scrollTop = 0
  }

  // console.log('sssss', window.location)
  const hash = window.location.hash
  if (hash.indexOf('/technological/simplemode/workbench') != -1) {
    const sessionStorage_item = window.sessionStorage.getItem(
      'session_currentSelectedWorkbenchBox'
    )
    const session_currentSelectedWorkbenchBox = JSON.parse(
      sessionStorage_item || '{}'
    )
    const { code } = session_currentSelectedWorkbenchBox
    if (code == 'board:plans') {
      //项目计划
      dispatch({
        type: 'gantt/getGanttData',
        payload: {
          gantt_board_id: board_id || '0'
        }
      })
    } else if (code == 'board:chat') {
      //项目交流
      dispatch({
        type: 'gantt/updateDatas',
        payload: {
          gantt_board_id: board_id || '0'
        }
      })
    } else if (code == 'board:files') {
      //项目文档
    } else {
    }
  } else if (hash.indexOf('/technological/workbench') != -1) {
    dispatch({
      type: 'gantt/getGanttData',
      payload: {
        gantt_board_id: board_id || '0'
      }
    })
  } else {
  }

  openImChatBoard({ board_id, autoOpenIm })
}
export const openImChatBoard = ({ board_id, autoOpenIm }) => {
  lx_utils.openChat({ boardId: board_id == '0' ? '' : board_id, autoOpenIm })
}

// 清除圈子登录信息
export const clearnImAuth = () => {
  if (window.NIM) {
    if (window.NIM.disconnect && typeof window.NIM.disconnect == 'function') {
      window.NIM.disconnect()
    }
  }
}
