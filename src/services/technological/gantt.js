import request from '../../utils/requestAxios'
import {REQUEST_DOMAIN, REQUEST_DOMAIN_BOARD, REQUEST_DOMAIN_WORK_BENCH, REQUEST_DOMAIN_ARTICLE, WE_APP_ID, REQUEST_DOMAIN_FLOWS, REQUEST_DOMAIN_TEAM_SHOW} from '../../globalset/js/constant'
import Cookies from 'js-cookie'
import { getGlobalData } from '../../utils/businessFunction';

//获取工作台甘特图数据
export async function getGanttData(data) {
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/gantt_chart`,
    method: 'POST',
    data: {
      _organization_id: localStorage.getItem('OrganizationId'),
      ...data,
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
  return request({
    url: `${REQUEST_DOMAIN_WORK_BENCH}/gantt_chart/milestone`,
    method: 'POST',
    data: {
      ...data,
      // _organization_id: getGlobalData('aboutBoardOrganizationId')
    }
  }, { isNotLoading: true});
}

//获取内容过滤项目分组树
export async function getContentFiterBoardTree(params) {
  return request({
    url: `${REQUEST_DOMAIN}/organization/board/list`,
    method: 'GET',
    params: {
      _organization_id: localStorage.getItem('OrganizationId'),
      ...params,
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
      ...params,
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
      ...data,
    }
  })
}
