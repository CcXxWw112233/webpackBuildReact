import request from '../../utils/requestAxios'
import {
  REQUEST_DOMAIN,
  REQUEST_INTERGFACE_VERSIONN
} from '../../globalset/js/constant'

//获取用户信息
export async function getUserInfo(params) {
  return request({
    url: `${REQUEST_DOMAIN}${REQUEST_INTERGFACE_VERSIONN}/user`,
    method: 'GET'
  })
}

//更向用户信息
export async function updateUserInfo(data) {
  return request({
    url: `${REQUEST_DOMAIN}/user`,
    method: 'PUT',
    data
  })
}

//更改密码
export async function changePassWord(data) {
  return request({
    url: `${REQUEST_DOMAIN}/user/password`,
    method: 'PUT',
    data
  })
}

//验证手机号是否被注册
export async function checkMobileIsRegisted(params) {
  return request({
    url: `${REQUEST_DOMAIN}/user/mobile/check`,
    method: 'GET',
    params
  })
}
//更换手机
export async function changeMobile(data) {
  return request({
    url: `${REQUEST_DOMAIN}/user/change/mobile`,
    method: 'PUT',
    data
  })
}

//验证邮箱是否被注册
export async function checkEmailIsRegisted(params) {
  return request({
    url: `${REQUEST_DOMAIN}/user/email/check`,
    method: 'GET',
    params
  })
}
//申请更换邮箱发送邮件确认
export async function changeEmail(data) {
  return request({
    url: `${REQUEST_DOMAIN}/user/change/email/validate`,
    method: 'PUT',
    data
  })
}

//解绑微信
export async function unBindWechat(data) {
  return request({
    url: `${REQUEST_DOMAIN}/user/wechat/un_bind`,
    method: 'PUT'
  })
}

export async function updateUserSet(data) {
  return request({
    url: `${REQUEST_DOMAIN}/user/set`,
    method: 'PUT',
    data
  })
}
