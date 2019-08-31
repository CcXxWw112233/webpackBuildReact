//获取当前用户可用盒子列表
import request from "../../utils/requestAxios";
import {REQUEST_DOMAIN_BOARD} from "../../globalset/js/constant";

// 评论@ 通知
export async function postCommentToDynamics(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/comm/at`,
    method: 'POST',
    data
  }, {isNotLoading: true});
}
