import request from '../../utils/requestAxios'
import { REQUEST_PDF } from '../../globalset/js/constant'

// 保存画的数据
export const SaveDataForPage = async data => {
  return await request(
    {
      method: 'POST',
      url: `${REQUEST_PDF}/postil/record`,
      data
    },
    { isNotLoading: true }
  )
}

// 获取文件某一页的数据
export const getDataForPage = async params => {
  return await request(
    {
      method: 'GET',
      url: `${REQUEST_PDF}/postil/record`,
      params
    },
    { isNotLoading: true }
  )
}

// 修改画的数据
export const putDataForPage = async data => {
  return await request(
    {
      method: 'PUT',
      url: `${REQUEST_PDF}/postil/record`,
      data
    },
    { isNotLoading: true }
  )
}

// 删除画的数据
export const removeDataForPage = async params => {
  return await request(
    {
      method: 'DELETE',
      url: `${REQUEST_PDF}/postil/record/single`,
      params
    },
    { isNotLoading: true }
  )
}

// 获取文件的版本
export const fetchVersion = async params => {
  return await request({
    method: 'GET',
    url: `${REQUEST_PDF}/postil/version`,
    params
  })
}

// 获取文件版本列表
export const fetchVersions = async params => {
  return await request({
    method: 'GET',
    url: `${REQUEST_PDF}/postil/version/list`,
    params
  })
}

// 保存文件版本
export const saveVersion = async data => {
  return await request({
    method: 'POST',
    url: `${REQUEST_PDF}/postil/version`,
    data
  })
}

// 删除批注版本
export const removeVersion = async params => {
  return await request({
    method: 'DELETE',
    url: `${REQUEST_PDF}/postil/version`,
    params
  })
}

// 修改批注信息
export const editVersion = async data => {
  return await request({
    method: 'PUT',
    url: `${REQUEST_PDF}/postil/version`,
    data
  })
}

// 获取历史记录
export const fetchHistory = async params => {
  return await request({
    method: 'GET',
    url: `${REQUEST_PDF}/postil/opera/record/list`,
    params
  })
}
