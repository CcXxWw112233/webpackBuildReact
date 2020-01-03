import request from '../../utils/requestAxios'
import { REQUEST_DOMAIN, REQUEST_DOMAIN_BOARD, REQUEST_INTERGFACE_VERSIONN } from '../../globalset/js/constant'
import Cookies from 'js-cookie'
import { getGlobalData } from "@/utils/businessFunction";

//邀请新用户参与
export async function inviteNewUserInProject({ data }) {
  //data 用户，手机号或者邮箱，多个逗号隔开
  return request({
    url: `${REQUEST_DOMAIN}/user/invite`,
    method: 'POST',
    data: {
      data
    }
  })
}


//获取用户信息
export async function getUSerInfo(params) {
  return request({
    url: `${REQUEST_DOMAIN}${REQUEST_INTERGFACE_VERSIONN}/user`,
    method: 'GET',
  });
}


//退出登录
export async function logout(data) {
  return request({
    url: `${REQUEST_DOMAIN}/user/logout`,
    method: 'GET',
    params: {
      accessToken: Cookies.get('Authorization'),
      refreshToken: Cookies.get('refreshToken')
    },
  });
}

//获取全局搜索类型列表
export async function getGlobalSearchTypeList(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/comm/search/type/list`,
    method: 'GET',
    params
  });
}

//获取全局搜索类型列表
export async function getGlobalSearchResultList(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/comm/global_query`,
    method: 'POST',
    data: {
      ...data,
      _organization_id: localStorage.getItem('OrganizationId')
    }
  }, { isNotLoading: true });
}
//根据关键字获取条件列表
export async function getGlobalSearchConditions(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/query_condition/list`,
    method: 'GET',
    params: {
      ...params,
      _organization_id: localStorage.getItem('OrganizationId')
    }
  }, { isNotLoading: true });
}

//查询固定条件
export async function getFixedConditions(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/query_condition/group`,
    method: 'GET',
    params
  }, { isNotLoading: true });
}

//获取和存储全组织的全部项目ID
export async function getUserAllOrgsAllBoards(params) {
  return request({
    url: `${REQUEST_DOMAIN}/organization/list/id`,
    method: 'GET',
    params
  });
}

//获取全组织的全部项目列表
export async function getUserAllOrgsBoardList(params) {
  return request({
    url: `${REQUEST_DOMAIN}/organization/board/list`,
    method: 'GET',
    params
  });
}

//生成扫码加入小程序二维码
export async function scanQrCodeJoin(data) {
  return request({
    url: `${REQUEST_DOMAIN}/mini/QRCode`,
    method: 'POST',
    data
  });
}

//web端各种入口邀请人员加入组织===1
export async function organizationInviteWebJoin(data) {
  const { _organization_id } = data
  return request({
    url: `${REQUEST_DOMAIN}/organization/invite/web/join`,
    method: 'POST',
    data: {
      ...data,
      _organization_id: _organization_id == '0' ? getGlobalData('aboutBoardOrganizationId') : _organization_id
    }
  });
}
//web端各种入口邀请人员加入组织===2
export async function commInviteWebJoin(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/comm/invite/web/join`,
    method: 'POST',
    data
  });
}



