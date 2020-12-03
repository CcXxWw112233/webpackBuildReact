import request from '../../utils/requestAxios'
import { REQUEST_WHITEBOARD } from '../../globalset/js/constant'

// 获取列表
export const fetchList = async data => {
  const method = 'GET'
  const resp = await request({
    url: `${REQUEST_WHITEBOARD}/whiteboard/postil/record`,
    method,
    data,
    params: data
  })
  return resp
}
// 获取房间列表
export const fetchRooms = params => {
  return request({
    url: `${REQUEST_WHITEBOARD}/whiteboard/room/list`,
    method: 'get',
    params
  })
}

// 新建房间
export const addWhiteBoardRoom = data => {
  return request({
    url: `${REQUEST_WHITEBOARD}/whiteboard/room`,
    method: 'POST',
    data
  })
}

export const addFeature = async data => {
  const resp = await request(
    {
      url: `${REQUEST_WHITEBOARD}/whiteboard/postil/record`,
      method: 'POST',
      data
    },
    { isNotLoading: true }
  )
  return resp
}

export const RemoveFeature = async data => {
  const resp = await request(
    {
      url: `${REQUEST_WHITEBOARD}/whiteboard/postil/record/single`,
      method: 'DELETE',
      params: data
    },
    { isNotLoading: true }
  )
  return resp
}

export const EditFeature = async data => {
  const resp = await request(
    {
      url: `${REQUEST_WHITEBOARD}/whiteboard/postil/record`,
      method: 'PUT',
      data: data
    },
    { isNotLoading: true }
  )
  return resp
}

/**
 * 邀请用户
 * @param {} params 用户id和房间id
 */
export const InvitationUser = params => {
  return request({
    url: `${REQUEST_WHITEBOARD}/whiteboard/room/user`,
    method: 'POST',
    params,
    data: params
  })
}

/**
 * 剔除用户
 * @param {*} data 房间号和用户id
 */
export const KickOutUser = data => {
  return request({
    url: `${REQUEST_WHITEBOARD}/whiteboard/room/user`,
    method: 'DELETE',
    data
  })
}
