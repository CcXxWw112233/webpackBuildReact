import request from '../../utils/requestAxios'
import { REQUEST_DOMAIN_TEAM_SHOW } from '../../globalset/js/constant'
import Cookies from 'js-cookie'

//获取团队秀列表
export async function getTeamShowList(params) {
  return
  return request({
    url: `${REQUEST_DOMAIN_TEAM_SHOW}/list`,
    method: 'GET',
    params
  })
}

//添加团队秀
export async function addTeamShow(data) {
  return request({
    url: `${REQUEST_DOMAIN_TEAM_SHOW}/show`,
    method: 'POST',
    data
  })
}

//团队秀类型
export async function getTeamShowTypeList(params) {
  return request({
    url: `${REQUEST_DOMAIN_TEAM_SHOW}/show_type`,
    method: 'GET',
    params
  })
}
//团队秀详情
export async function getTeamShowDetail(params) {
  return request({
    url: `${REQUEST_DOMAIN_TEAM_SHOW}/show/${params.id}`,
    method: 'GET',
    params
  })
}

//删除团队秀
export async function deleteTeamShow(data) {
  return request({
    url: `${REQUEST_DOMAIN_TEAM_SHOW}/show/${data['show_id']}`,
    method: 'DELETE',
    data
  })
}

//获取当前前组织下所有的展示列表
export async function getCurrentOrgTeamShowList(params) {
  return request({
    url: `${REQUEST_DOMAIN_TEAM_SHOW}/show/current_list`,
    method: 'GET',
    params
  })
}
