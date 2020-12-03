import { message } from 'antd'
import {
  commInviteWebJoin,
  organizationInviteWebJoin
} from '../services/technological'
import { getOrgIdByBoardId, setRequestHeaderBaseInfo } from './businessFunction'
import { isApiResponseOk } from './handleResponseData'

// import Avatars from '@dicebear/avatars'
// import SpriteBoottts from '@dicebear/avatars-bottts-sprites'
// import SpriteMale from '@dicebear/avatars-male-sprites'
import {
  REQUEST_DOMAIN,
  REQUEST_INTERGFACE_VERSIONN
} from '../globalset/js/constant'
import Cookies from 'js-cookie'
import axios from 'axios'
const options = {
  radius: 32,
  width: 32,
  height: 32
}
// const avatars = new Avatars(SpriteMale, options)
const avatars = { create: () => {} }

/**
 * 邀请成员 进组织和项目
 * @param {String} invitationType 邀请类型
 * @param {String} board_id 项目ID
 * @param {String} org_id 组织ID
 * @param {Object} values 数据 { board_id:'', users: [{user_id},{mobile:'',avatar:''},{email:'',avatar:''}], memebers:[{id:'',type:'other',name:''...},{id:'',type:'platform'...}] }
 * @param {function} calback 回调函数
 */
export function inviteMembersInWebJoin({
  invitationType,
  board_id,
  org_id,
  values,
  selectedMember,
  calback
}) {
  const org_id_ = org_id ? org_id : getOrgIdByBoardId(board_id)
  const user_ids = values.users.split(',')
  organizationInviteWebJoin({
    _organization_id: org_id_,
    type: invitationType,
    users: user_ids
  }).then(res => {
    if (isApiResponseOk(res)) {
      commInviteWebJoin({
        id: board_id,
        role_id: res.data.role_id,
        type: invitationType,
        users: res.data.users
      }).then(res => {
        if (isApiResponseOk(res)) {
          message.success('邀请成功')
          console.log(calback)
          if (calback && typeof calback == 'function') calback(selectedMember)
        } else {
          message.warn(res.message)
        }
      })
    } else {
      message.warn(res.message)
    }
  })
}

export const axiosForSend = (url, data) => {
  const Authorization = Cookies.get('Authorization')
  return new Promise((resolve, reject) => {
    axios
      .post(url, data, {
        headers: {
          Authorization,
          ...setRequestHeaderBaseInfo({ data, headers: {}, params: {} })
        }
      })
      .then(res => {
        resolve(res.data)
      })
      .catch(err => {
        reject(err)
      })
  })
}

// base64转文件
export const dataURLtoFile = (dataurl, filename) => {
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

// 注册用户并生成头像
export const getEnrollUsers = user => {
  let svg = avatars.create(user)
  let file = dataURLtoFile(
    'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg))),
    user + '.svg'
  )
  let data = new FormData()
  data.append('file', file)
  return new Promise((resolve, reject) => {
    axiosForSend(
      `${REQUEST_DOMAIN}${REQUEST_INTERGFACE_VERSIONN}/user/invite?invitee_account=${user}`,
      data
    )
      .then(res => {
        // console.log(res)
        if (isApiResponseOk(res)) {
          resolve(res.data.id)
        } else {
          reject({})
        }
      })
      .catch(err => {
        message.warn('上传头像失败，请稍后重试')
      })
  })
}

export const getIcons = async (users = []) => {
  // let users = this.getRequestParams()
  for (let i = 0; i < users.length; i++) {
    if (!users[i].id) {
      const user_id = await getEnrollUsers(users[i].user)
      users[i].id = user_id
    }
  }
  return users
}
