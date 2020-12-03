import { message, notification } from 'antd'
import axios from 'axios'
import Cookies from 'js-cookie'
import _ from 'lodash'
import { reRefreshToken } from './oauth'
import { setRequestHeaderBaseInfo } from './businessFunction'
function messageLoading() {
  return message.loading('加载中...', 0)
}
const openNotification = message => {
  notification.error({
    message: '提示',
    description: message
  })
}
axios.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

export default function request(options = {}, elseSet = {}) {
  const { isNotLoading } = elseSet
  const {
    url = '',
    headers = {},
    method = 'post',
    params = {},
    data = {}
  } = options

  let loading = !isNotLoading ? messageLoading(url) : ''
  let header = Object.assign({}, headers)
  const Authorization = Cookies.get('Authorization')
  const refreshToken = Cookies.get('refreshToken')

  header['Authorization'] = Authorization //refreshToken
  header['refreshToken'] = refreshToken

  const header_base_info = setRequestHeaderBaseInfo({ data, params, headers })

  /***
   * 用于打开分享的任务,文件,流程等详情的接口加上请求头
   */
  let headers_share = {}
  if (window.location.hash.indexOf('/share_detailed') != -1) {
    headers_share = {
      ShareLinkInfo: localStorage.getItem('shareLinkInfo')
    }
  }

  return new Promise((resolve, reject) => {
    axios({
      ...{
        url,
        // headers: { ...header, ...headers, ...header_base_info, },
        headers: {
          ...header,
          ...headers,
          ...header_base_info,
          ...headers_share
        },
        method,
        params: {
          ...params
          // ...new_param
        },
        data: {
          ...data
          // ...new_param
        },
        timeout: 60000
      }
    })
      .then(res => {
        setTimeout(loading, 0)

        resolve(res.data)
      })
      .catch((error, e) => {
        setTimeout(loading, 0)

        if (_.has(error, 'response.status')) {
          switch (error.response.status) {
            case '200':
              break
            case 401:
              reRefreshToken({
                refreshToken: Cookies.get('refreshToken'),
                accessToken: Cookies.get('Authorization')
              })
              break
            default:
              const { data = {} } = error.response || {}
              const { message } = data
              openNotification(message)
              resolve(data)
              break
          }
        } else {
          if (error.response) {
            openNotification('系统繁忙，请稍后重试！')
          } else {
            message.error('网络连接失败，请检查网络设置。')
          }
          resolve({
            message: '系统繁忙，请稍后重试！'
          })
        }
      })
  })
}

/**
 * 不使用antd的upload上传
 * @param {url} url 上传的地址
 * @param {formate} data 参数
 */
export const uploadFileForAxios = (url, data) => {
  const Authorization = Cookies.get('Authorization')
  let a = axios.post(url, data, {
    headers: {
      Authorization,
      ...setRequestHeaderBaseInfo({ data, headers: {}, params: {} })
    }
  })
  return a
}
