import {REQUEST_DOMAIN, REQUEST_DOMAIN_BOARD} from "@/globalset/js/constant";
import request from "@/utils/requestAxios";

// 新用户默认创建组织和用户的接口
export async function createDefaultOrg(data) {
  return request({
    url: `${REQUEST_DOMAIN}/organization/default`,
    method: "POST",
    data
  })
}

// 生成项目相关小程序二维码
export async function generateBoardCode(params) {
  return request({
    url: `${REQUEST_DOMAIN}/mini/QRCode/board/${params.boardId}`,
    method: "GET",
    params
  })
}

//邀请成员加入组织
export async function inviteMemberJoinOrg(data) {
  return request({
    url: `${REQUEST_DOMAIN}/organization/invite`,
    method: "PUT",
    data: {
      ...data,
      _organization_id: data._organization_id || localStorage.getItem('OrganizationId'),
    }
  })
}

// 邀请成员加入项目 (只加入项目, 需配合其他接口一起使用)
export async function inviteMemberJoinBoard(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/board/join`,
    method: "POST",
    data
  })
}