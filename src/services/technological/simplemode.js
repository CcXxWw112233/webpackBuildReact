import request from '../../utils/requestAxios'
import {
  REQUEST_DOMAIN_WORK_BENCH,
  REQUEST_DOMAIN,
  REQUEST_DOMAIN_ARTICLE,
  REQUEST_DOMAIN_BOARD,
  REQUEST_INTERGFACE_VERSIONN
} from '../../globalset/js/constant'

export async function getUserBoxs() {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/simple/user/box`,
    method: 'GET'
  })
}

export async function getAllBoxs() {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/simple/box`,
    method: 'GET'
  })
}

export async function boxSet(data) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/simple/user/box/set`,
    method: 'POST',
    data: { id: data.id }
  })
}

export async function boxCancel(data) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/simple/user/box/cancel`,
    method: 'PUT',
    data: { id: data.id }
  })
}

export async function getWallpaperList(data) {
  return request({
    url: `${REQUEST_DOMAIN}/wallpaper`,
    method: 'GET'
  })
}

export async function getGuideCategoryList(data) {
  return request({
    url: `${REQUEST_DOMAIN_ARTICLE}/api/guide/category`,
    method: 'GET'
  })
}

export async function getGuideArticle(data) {
  return request({
    url: `${REQUEST_DOMAIN_ARTICLE}/api/guide/article?category_id=${data.id}`,
    method: 'GET'
  })
}

//获取项目的流程任务列表
export async function getBoardsTaskTodoList(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/comm/todo_list`,
    method: 'GET',
    params
  })
}

// 获取项目的流程代办列表
export async function getBoardsProcessTodoList(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}${REQUEST_INTERGFACE_VERSIONN}/workflow/todo`,
    method: 'GET',
    params
  })
}
