//添加里程碑负责人
import request from '../../utils/requestAxios'
import { REQUEST_DOMAIN_BOARD } from '../../globalset/js/constant'

//获取公共弹窗的评论列表
export async function getPublicModalDetailCommentList(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/comment`,
    method: 'GET',
    params
  })
}
//新增公共弹窗的评论
export async function submitPublicModalDetailComment(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/comment`,
    method: 'POST',
    data
  })
}
//删除公共弹窗的评论
export async function deletePublicModalDetailComment(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/comment/${data.id}`,
    method: 'DELETE',
    data
  })
}
