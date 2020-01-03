import request from '../../utils/requestAxios'
import { REQUEST_DOMAIN } from '../../globalset/js/constant'

//重置密码
export async function formSubmit(data) {
  const { accountType = ''} = data
  return request({
    url: `${REQUEST_DOMAIN}/user/reset/password/${accountType}`,
    method: 'PUT',
    data,
  }, { clooseLoading: true });
}

//获取验证码
export async function requestVerifyCode(data) {
  return request({
    url: `${REQUEST_DOMAIN}/sms/code/send`,
    method: 'POST',
    data,
  });
}
//验证token
export async function initConfirm(params) {
  return request({
    url: `${REQUEST_DOMAIN}/user/email/confirm`,
    method: 'GET',
    params
  });
}
