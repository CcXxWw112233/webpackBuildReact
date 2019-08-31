import request from '../../utils/requestAxios'
import {REQUEST_DOMAIN, REQUEST_DOMAIN_BOARD, REQUEST_INTERGFACE_VERSIONN} from '../../globalset/js/constant'
import Cookies from 'js-cookie'

//创建分组
export async function CreateGroup(data) {
  return request({
    url: `${REQUEST_DOMAIN}/group`,
    method: 'POST',
    data: {
      ...data,
      _organization_id: localStorage.getItem('OrganizationId'),
    }
  });
}

//获取分组树状列表
export async function getGroupTreeList(params) {
  return request({
    url: `${REQUEST_DOMAIN}/group/tree`,
    method: 'GET',
    params: {
      ...params,
      _organization_id: localStorage.getItem('OrganizationId'),
    }      
  });
}

//移出分组成员
export async function removeMembersWithGroup(data) {
  return request({
    url: `${REQUEST_DOMAIN}/group/remove`,
    method: 'DELETE',
    data: {
      ...data,
      _organization_id: localStorage.getItem('OrganizationId'),
    }
  });
}

//将访客加入组织
export async function joinOrganization(data) {
  return request({
    url: `${REQUEST_DOMAIN}/organization/visitor/invite`,
    method: 'PUT',
    data: {
      ...data,
      _organization_id: localStorage.getItem('OrganizationId'),
    }
  });
}
//将访客移除
export async function removeUserVisitor(data) {
  return request({
    url: `${REQUEST_DOMAIN}/member/visitor/remove/${data.id}`,
    method: 'DELETE',
    data
  });
}

//给成员设置分组
export async function setMemberWitchGroup(data) {
  return request({
    url: `${REQUEST_DOMAIN}/group/member/set`,
    method: 'PUT',
    data: {
      ...data,
      _organization_id: localStorage.getItem('OrganizationId'),
    }
  });
}
//分组列表
export async function getGroupList(params) {
  return request({
    url: `${REQUEST_DOMAIN}/group`,
    method: 'GET',
    params: {
      ...params,
      // _organization_id: localStorage.getItem('OrganizationId'),
    }      
  });
}
//更新分组
export async function updateGroup(data) {
  return request({
    url: `${REQUEST_DOMAIN}/group`,
    method: 'PUT',
    data
  });
}
//删除分组
export async function deleteGroup(data) {
  return request({
    url: `${REQUEST_DOMAIN}/group/${data.id}`,
    method: 'DELETE',
    data
  });
}

//获取局部分组数据
export async function getGroupPartialInfo(data) {
  return request({
    url: `${REQUEST_DOMAIN}/group/partial`,
    method: 'PUT',
    data
  });
}

//审批 拒绝或通过
export async function approvalMember(data) {
  return request({
    url: `${REQUEST_DOMAIN}/member/approval`,
    method: 'PUT',
    data: {
      ...data,
      _organization_id: localStorage.getItem('OrganizationId'),
    }      
  });
}

//停用
export async function discontinueMember(data) {
  return request({
    url: `${REQUEST_DOMAIN}/member/discontinue`,
    method: 'PUT',
    data: {
      ...data,
      _organization_id: localStorage.getItem('OrganizationId'),
    }
  });
}

//邀请加入当前分组
export async function inviteMemberToGroup(data) {
  return request({
    url: `${REQUEST_DOMAIN}/group/invite`,
    method: 'PUT',
    data: {
      ...data,
      _organization_id: localStorage.getItem('OrganizationId'),
    }
  });
}

//查询当前用户所拥有或所属组织
export async function getCurrentUserOrganizes(params) {
  return request({
    url: `${REQUEST_DOMAIN}/organization`,
    method: 'GET',
    params
  }, { isNotLoading: true} );
}

// 切换组织
export async function changeCurrentOrg(data) {
  return request({
    url: `${REQUEST_DOMAIN}${REQUEST_INTERGFACE_VERSIONN}/user/changecurrentorg/${data.org_id}`,
    method: 'PUT',
    data
  });
}

//查询当前组织角色
export async function getCurrentOrgRole(params) {
  return request({
    url: `${REQUEST_DOMAIN}/role/query`,
    method: 'GET',
    params: {
      ...params,
      _organization_id: localStorage.getItem('OrganizationId'),
    }      
  });
}
//给成员设置角色
export async function setMemberRole(data) {
  return request({
    url: `${REQUEST_DOMAIN}/role/set`,
    method: 'PUT',
    data
  });
}


//模糊查询组织列表
export async function getSearchOrganizationList(params) {
  return request({
    url: `${REQUEST_DOMAIN}/organization/search`,
    method: 'GET',
    params
  }, { isNotLoading: true} );
}

//创建组织
export async function createOrganization(data) {
  return request({
    url: `${REQUEST_DOMAIN}/organization`,
    method: 'POST',
    data
  });
}

//更新组织
export async function updateOrganization(data) {
  return request({
    url: `${REQUEST_DOMAIN}/organization`,
    method: 'PUT',
    data: {
      ...data,
      _organization_id: localStorage.getItem('OrganizationId'),
    }
  });
}

//申请加入组织
export async function applyJoinOrganization(data) {
  return request({
    url: `${REQUEST_DOMAIN}/organization/apply`,
    method: 'POST',
    data
  });
}

//邀请成员加入组织
export async function inviteJoinOrganization(data) {
  return request({
    url: `${REQUEST_DOMAIN}/organization/invite`,
    method: 'PUT',
    data: {
      ...data,
      _organization_id: localStorage.getItem('OrganizationId'),
    }
  });
}

//上传组织logo
export async function uploadOrganizationLogo(data) {
  return request({
    url: `${REQUEST_DOMAIN}/organization/logo_upload`,
    method: 'POST',
    data
  });
}

//获取组织成员信息
export async function getMemberInfo(params) {
  return request({
    url: `${REQUEST_DOMAIN}/member`,
    method: 'GET',
    params: {
      ...params,
      _organization_id: localStorage.getItem('OrganizationId'),
    }      
  });
}

//获取某个分组的成员 => 用于设置分组负责人
export async function getMembersInOneGroup(params) {
  return request({
    url: `${REQUEST_DOMAIN}/group/members`,
    method: 'GET',
    params: {
      _organization_id: localStorage.getItem('OrganizationId'),
      ...params
    }
  }, {isNotLoading: true});
}
//获取某个分组的成员 => 用于设置分组负责人
export async function setGroupLeader(data) {
  return request({
    url: `${REQUEST_DOMAIN}/group/leader/set`,
    method: 'PUT',
    data
  });
}

//组织成员获取权限列表 =>获取自己在组织中的权限--已废弃
export async function getOrganizationMemberPermissions(params) {
  return request({
    url: `${REQUEST_DOMAIN}/permissions/member`,
    method: 'GET',
    params
  });
}

//获取用户所有组织所有权限
export async function getUserOrgPermissions(params) {
  return request({
    url: `${REQUEST_DOMAIN}/permissions/org`,
    method: 'GET',
    params
  }, {isNotLoading: true});
}
//获取用户所有项目所有权限
export async function getUserBoardPermissions(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/permissions/board`,
    method: 'GET',
    params
  }, {isNotLoading: true});
}

// 用户设置是否显示组织名称
export async function getSetShowOrgName(data) {
  return request({
    url: `${REQUEST_DOMAIN}/user/set`,
    method: 'PUT',
    data
  });
}

// 用户设置是否显示极简模式
export async function getSetShowSimple(data) {
  return request({
    url: `${REQUEST_DOMAIN}/user/set`,
    method: 'PUT',
    data: {
      is_simple_model: data
    }
  })
}
