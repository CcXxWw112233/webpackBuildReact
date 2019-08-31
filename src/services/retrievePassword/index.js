import request from '../../utils/requestAxios'
import { REQUEST_DOMAIN } from '../../globalset/js/constant'

//发送邮件
export async function formSubmit(data) {
  return request({
    url: `${REQUEST_DOMAIN}/user/email/validate`,
    method: 'PUT',
    data,
  });
}

