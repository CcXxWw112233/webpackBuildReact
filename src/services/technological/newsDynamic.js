//项目归档
import {
  REQUEST_DOMAIN_BOARD,
  CONTENT_DATA_TYPE_CARD
} from '../../globalset/js/constant'
import request from '../../utils/requestAxios'

const createHeaderContentDataByCardId = cardId => {
  if (cardId) {
    return {
      BaseInfo: {
        contentDataType: CONTENT_DATA_TYPE_CARD,
        contentDataId: cardId
      }
    }
  } else {
    return {}
  }
}
//获取动态列表
export async function getNewsDynamicList(next_id) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/activites/${next_id || '0'}`,
    method: 'GET'
  })
}
//获取动态列表
export async function getNewsDynamicListActivity(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/activity`,
    method: 'GET',
    params: {
      ...params,
      _organization_id: localStorage.getItem('OrganizationId')
    }
  })
}
// 评论列表
export async function getCardCommentList(id) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/comment/list/${id}`,
    method: 'GET'
  })
}

// 新增评论
export async function addCardNewComment(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/comment`,
    method: 'POST',
    headers: createHeaderContentDataByCardId(data.card_id),
    data
  })
}
