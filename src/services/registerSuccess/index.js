import request from '../../utils/requestAxios'
import { REQUEST_DOMAIN } from '../../globalset/js/constant'

//验证token
export async function initConfirm(params) {
  return request({
    url: `${REQUEST_DOMAIN}/user/email/confirm`,
    method: 'GET',
    params
  });
}

