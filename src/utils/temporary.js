// 临时的方法

import {
  currentNounPlanFilterName,
  getOrgIdByBoardId
} from './businessFunction'
import { PROJECTS } from '../globalset/js/constant'

// 针对会协宝软件推广
// 关闭某些功能的条件
// const close_board_ids = ['1280036778618785792', '1269516414180528128', '1280055420479737856']
const noun_name = [
  { target: '项目', to: `${currentNounPlanFilterName(PROJECTS)}` }
]
// export const isForHuiXB = ({ board_id }) => {
//     if (close_board_ids.includes(board_id)) {
//         return true
//     }
//     return false
// }

// 后台返回的功能盒子的方法
export const changeBoxFeatureName = ({ board_id, noun }) => {
  let new_noun = noun
  const obj = noun_name.find(item => noun.indexOf(item.target) != -1) || {}
  const { target, to } = obj
  new_noun = new_noun.replace(target, to)
  return new_noun
}
/**
 * 关闭功能条件
 * @param {String} board_id 当前的项目ID
 * @param {Array} currentUserOrganizes 组织列表
 * @returns {Boolean} true 表示需要关闭 false表示不需要关闭
 */
export const closeFeature = ({ board_id, currentUserOrganizes = [] }) => {
  if (!board_id) return true
  let local_userOrganizes = !!(
    currentUserOrganizes && currentUserOrganizes.length
  )
    ? currentUserOrganizes
    : localStorage.getItem('currentUserOrganizes')
    ? JSON.parse(localStorage.getItem('currentUserOrganizes')) || []
    : []
  const org_id =
    getOrgIdByBoardId(board_id) || localStorage.getItem('OrganizationId')
  const { apply_scenes } = local_userOrganizes.find(i => i.id == org_id) || {}
  if (apply_scenes == '0') {
    return false
  } else if (apply_scenes == '1') {
    return true
  }
}
