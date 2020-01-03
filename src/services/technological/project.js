import request from "../../utils/requestAxios";
import { REQUEST_DOMAIN_BOARD, REQUEST_DOMAIN } from "../../globalset/js/constant";
import { getGlobalData } from "../../utils/businessFunction";

//开启关闭特权
export async function toggleContentPrivilege(data) {
  const { content_id, content_type, is_open, board_id } = data
  const headers = !!board_id?{
    BaseInfo: {
      boardId: board_id
    }} : {}
  //content_id 内容ID（如 board_id,card_id 等）
  //content_type 内容类型（如 board , list, card, file, folder,flow等）
  //is_open  1: 开启 || 0：关闭
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/content_privilege/open`,
    method: 'POST',
    headers,
    data: {
      content_id,
      content_type,
      is_open,
    }
  })
}

//设置内容访问特权
export async function setContentPrivilege(data) {
  const { content_id, content_type, privilege_code, user_ids, board_id } = data
  //content_id 内容ID（如 board_id,card_id 等）
  //content_type 内容类型（如 board , list, card, file, folder,flow等）
  //privilege_code 内容类型（如 read comment edit等）
  //user_ids 用户id, 多个用逗号隔开
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/content_privilege/set`,
    method: 'POST',
    data: {
      content_id,
      content_type,
      privilege_code,
      user_ids,
      board_id
    }
  })
}

//移除内容访问特权
export async function removeContentPrivilege(data) {
  const { id, board_id } = data
  const headers = !!board_id?{
    BaseInfo: {
      boardId: board_id
    }} : {}
  //contend_id 内容ID（如 board_id,card_id 等）
  //content_type 内容类型（如 board , list, card, file, folder,flow等）
  //user_id 用户id
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/content_privilege/remove`,
    method: 'DELETE',
    headers,
    data: {
      id
    }
  })
}

//移动项目到指定分组
export async function moveProjectToProjectGroup(data) {
  const { board_id, group_id } = data
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/board/group/move/${board_id}`,
    method: 'PUT',
    data: {
      group_id
    }
  })
}

//获取当前组织搜索树
export async function getProjectGroupSearchTree(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/board/group/tree`,
    method: 'GET',
    params: {
      _organization_id: getGlobalData('aboutBoardOrganizationId'),
      ...params
    }
  })
}

//获取当前分组项目列表
export async function getCurrentProjectGroupProjectList(params) {
  const { group_id = '', keyword = '', org_id = '' } = params
  //group_id  分组id
  //keyword   (participate|star|archived)
  //org_id  组织 id
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/board/list/by_param`,
    method: 'GET',
    params: {
      group_id,
      keyword,
      org_id,
      _organization_id: org_id || localStorage.getItem('OrganizationId')
    }
  })
}

//获取项目分组树
export async function getProjectGroupTree(params = {}) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/board/group`,
    method: 'GET',
    params: {
      _organization_id: localStorage.getItem('OrganizationId')
    }
  })
}

//新增项目分组树节点
export async function createProjectGroupTreeNode(data) {
  const { group_name, parent_id } = data
  //group_name 分组名称
  //parent_id  父节点分组id

  return request({
    url: `${REQUEST_DOMAIN_BOARD}/board/group`,
    method: 'POST',
    data: {
      ...data
      // group_name,
      // parent_id
    }
  })
}

//更新项目分组名称
export async function updateProjectGroupTreeNodeName(data) {
  const { group_name, id } = data
  //group_name 项目分组名称
  //id 节点id
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/board/group/${id}`,
    method: 'PUT',
    data: {
      ...data
    }
  })
}

//删除项目分组树节点
export async function deleteProjectGroupTreeNode(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/board/group/${data.id}`,
    method: 'DELETE',
    data
  })
}

//获取项目列表
export async function getProjectList(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/board`,
    method: 'GET',
    params
  });
}
//获取app标
export async function getAppsList(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/app`,
    method: 'GET',
    params
  });
}

//新增项目
export async function addNewProject(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/board`,
    method: 'POST',
    data
  });
}

//更新项目
export async function updateProject(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/board`,
    method: 'PUT',
    data
  });
}

//删除项目
export async function deleteProject(id) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/board/${id}`,
    method: 'DELETE',
  });
}

//项目归档
export async function archivedProject(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/board/archived`,
    method: 'PUT',
    data
  });
}

//取消收藏
export async function cancelCollection({ org_id, board_id }) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/board/cancel/${board_id}`,
    method: 'DELETE',
    headers: {
      BaseInfo: { orgId: org_id }
    },
    data: {
      id: board_id
    }
  });
}

//项目详情
export async function projectDetail(id) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/board/detail/${id}`,
    method: 'POST',
    data: {
      id
    }
  });
}

//添加项目组成员
export async function addMenbersInProject(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/board/members/add`,
    method: 'POST',
    data
  });
}

// 退出项目
export async function quitProject(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/board/quit`,
    method: 'DELETE',
    data,
  });
}

// 收藏项目
export async function collectionProject({ org_id, board_id }) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/board/star/${board_id}`,
    method: 'POST',
    headers: { BaseInfo: { orgId: org_id } },
    data: {
      id: board_id
    }
  }, 
  // { isNotLoading: true }
  );
}

// 添加项目app
export async function addProjectApp(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/board/app/add`,
    method: 'POST',
    data
  });
}
// 编辑项目app
export async function editProjectApp(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/board/app/edit`,
    method: 'PUT',
    data
  });
}

// 项目详情中生成扫码加入项目小程序二维码
export async function joinBoardQRCode(params) {
  return request({
    url: `${REQUEST_DOMAIN}/mini/QRCode/join/board/${params.id}`,
    method: 'GET',
    params
  }, { isNotLoading: true });
}

// 查询项目动态列表 (项目详情中)
export async function getProjectDynamicsList(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/activity/board`,
    method: 'POST',
    data
  })
}



