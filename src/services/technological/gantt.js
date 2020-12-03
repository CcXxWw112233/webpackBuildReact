import request from '../../utils/requestAxios'
import {
  REQUEST_DOMAIN,
  REQUEST_DOMAIN_BOARD,
  REQUEST_DOMAIN_WORK_BENCH,
  REQUEST_DOMAIN_ARTICLE,
  WE_APP_ID,
  REQUEST_DOMAIN_FLOWS,
  REQUEST_DOMAIN_TEAM_SHOW,
  REQUEST_INTERGFACE_VERSIONN
} from '../../globalset/js/constant'
import Cookies from 'js-cookie'
import { getGlobalData } from '../../utils/businessFunction'

//获取工作台甘特图数据
export async function getGanttData(data) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/gantt_chart`,
    method: 'POST',
    data: {
      _organization_id: localStorage.getItem('OrganizationId'),
      ...data
    }
  })
}

//获取节假日
export async function getHoliday(params) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/gantt_chart/calendar`,
    method: 'GET',
    params
  })
}

//获取甘特图里程碑列表
export async function getGttMilestoneList(data) {
  return request(
    {
      url: `${REQUEST_DOMAIN_WORK_BENCH}/gantt_chart/milestone`,
      method: 'POST',
      data: {
        ...data
        // _organization_id: getGlobalData('aboutBoardOrganizationId')
      }
    },
    { isNotLoading: true }
  )
}

//获取内容过滤项目分组树
export async function getContentFiterBoardTree(params) {
  return request({
    url: `${REQUEST_DOMAIN}/organization/board/list`,
    method: 'GET',
    params: {
      _organization_id: localStorage.getItem('OrganizationId'),
      ...params
    }
  })
}
//获取内容过滤成员分组树
export async function getContentFiterUserTree(params) {
  return request({
    url: `${REQUEST_DOMAIN}/organization/user/list`,
    method: 'GET',
    params: {
      _organization_id: localStorage.getItem('OrganizationId'),
      ...params
    }
  })
}

//获取甘特图带根目录文件的项目列表
export async function getGanttBoardsFiles(data) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/gantt_chart/file`,
    method: 'POST',
    data: {
      _organization_id: localStorage.getItem('OrganizationId'),
      ...data
    }
  })
}

// 模板
//获取项目模板列表
export async function getBoardTemplateList(params) {
  return request({
    url: `${REQUEST_DOMAIN}/org/template/list`,
    method: 'GET',
    params
  })
}
//获取项目模板内容列表
export async function getBoardTemplateInfo(params) {
  return request(
    {
      url: `${REQUEST_DOMAIN}/org/template/content`,
      method: 'GET',
      params
    },
    { isNotLoading: true }
  )
}
//拖动模板创建任务
export async function createCardByTemplate(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/template/drag/add`,
    method: 'POST',
    data
  })
}

//引入模板
export async function importBoardTemplate(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/board/template/quote`,
    method: 'POST',
    data
  })
}

//引入模板
export async function saveBoardTemplate(data) {
  return request({
    url: `${REQUEST_DOMAIN}/org/template/generate`,
    method: 'POST',
    data
  })
}

//引入模板
export async function saveGanttOutlineSort(data) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/gantt_chart/outline/sort`,
    method: 'POST',
    data
  })
}

//置顶项目的分组
export async function roofTopBoardCardGroup(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/lists/star/${data.list_id}`,
    method: 'POST',
    data
  })
}

//取消置顶项目的分组
export async function cancleToofTopBoardCardGroup(data) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/card/lists/star/${data.list_id}`,
    method: 'DELETE',
    data
  })
}

//获取甘特图头部的其它信息
export async function getGanttGroupElseInfo(params) {
  return request(
    {
      url: `${REQUEST_DOMAIN_WORK_BENCH}/gantt_chart/progress`,
      method: 'GET',
      params
    },
    { isNotLoading: true }
  )
}

// 获取基线列表
export async function getBaseLineList(params) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/baseline`,
    method: 'GET',
    params
  })
}

// 获取基线详情
export async function getBaseLineInfoData(data) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/baseline/${data.id}`,
    method: 'GET',
    data
  })
}

// 创建一条基线数据
export async function createBaseLine(data) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/baseline`,
    method: 'POST',
    data
  })
}

// 编辑一条基线数据
export async function EditBaseLine(data) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/baseline/${data.id}`,
    method: 'PUT',
    data
  })
}

// 删除一条基线数据
export async function DeleteBaseLine(data) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/baseline/${data.id}`,
    method: 'DELETE',
    data
  })
}

// 保存大纲视图隐藏可见
export async function saveGanttOutlineNonDisplay(data) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/gantt_chart/outline/nondisplay`,
    method: 'PUT',
    data
  })
}

// 获取已经隐藏的视图列表
export async function getGanttOutlineHideTrem(params) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/gantt_chart/outline/nondisplay`,
    method: 'GET',
    params
  })
}

// 获取设置的表头
export async function getGanttTableItem(params) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/gantt_chart/outline/setting`,
    method: 'GET',
    params
  })
}

// 设置表头
export async function setGanttTableItem(data) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/gantt_chart/outline/setting`,
    method: 'PUT',
    data
  })
}

// 获取模板分享码
export async function getBoardTempleteShareCode(data) {
  return request({
    url: `${REQUEST_DOMAIN}/org/template/share`,
    method: 'POST',
    data
  })
}

// 通过分享码生成模板
export async function generateTempleteWithShareCode(data) {
  return request({
    url: `${REQUEST_DOMAIN}/org/template/share/generate`,
    method: 'POST',
    data
  })
}

// 获取导出表格字段列表
export async function getExportExcelFieldList(params) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/board/export/item`,
    method: 'GET',
    params
  })
}

// 导出表格
export async function exportExcelFieldList(data) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/board/export/excel`,
    method: 'POST',
    data
  })
}
