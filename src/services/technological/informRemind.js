// 通知提醒的请求接口
import request from '@/utils/requestAxios'
import { REQUEST_DOMAIN_ABOUT_PROJECT } from '@/globalset/js/constant'

/**
 * 获取通知提醒的成员列表
 */
export async function getUserInfoRemind(params) {
  return request({
    url: `${REQUEST_DOMAIN_ABOUT_PROJECT}/comm/remind/user/list`,
    method: 'GET',
    params
  })
}

/**
 * 获取事件列表
 * @param {String} rela_type 获取事件列表的类型 1: 任务 2: 日程 3: 节点 4: 文件
 */
export async function getTriggerList(rela_type) {
  return request({
    url: `${REQUEST_DOMAIN_ABOUT_PROJECT}/remind/trigger/list/${rela_type}`,
    method: 'GET'
  })
}

/**
 * 获取事件的消息列表(是否存在历史记录)
 * @param {String} id 获取的是哪一个类型下的消息的ID
 */
export async function getTriggerHistory(id) {
  return request({
    url: `${REQUEST_DOMAIN_ABOUT_PROJECT}/remind/list/${id}`,
    method: 'GET'
  })
}

/**
 * 设置提醒的接口
 * @param {Object} data 需要设置的那一条提醒信息
 */
export async function setRemindInformation(data) {
  return request({
    url: `${REQUEST_DOMAIN_ABOUT_PROJECT}/remind`,
    method: 'POST',
    data
  })
}

/**
 * 更新提醒的接口
 * @param {Object} data 获取需要更新的那一条提醒信息
 */
export async function updateRemindInformation(data) {
  return request({
    url: `${REQUEST_DOMAIN_ABOUT_PROJECT}/remind`,
    method: 'PUT',
    data
  })
}

/**
 * 删除提醒的接口
 * @param {String} id 删除某一条信息对应的id
 */
export async function delRemindInformation(id) {
  return request({
    url: `${REQUEST_DOMAIN_ABOUT_PROJECT}/remind/${id}`,
    method: 'DELETE'
  })
}
