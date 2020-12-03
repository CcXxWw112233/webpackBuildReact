import request from '@/utils/requestAxios'
import {
  REQUEST_DOMAIN_WORK_BENCH,
  REQUEST_DOMAIN_FILE,
  REQUEST_DOMAIN_BOARD,
  REQUEST_INTERGFACE_VERSIONN
} from '@/globalset/js/constant'
// import Cookies from 'js-cookie'
// import { getGlobalData } from '../../utils/businessFunction';

// 项目交流 - 获取文件列表目录树数据
// export async function getCommunicationTreeListData(params) {
//   return request({
//     url: `${REQUEST_DOMAIN_WORK_BENCH}/gantt_chart/file`,
//     method: 'POST',
//     data: {
//       _organization_id: localStorage.getItem('OrganizationId'),
//       ...params,
//     }
//   })
// }

// 获取项目列表
// _organization_id 组织id--  0 全组织
// contain_type  0或不传 只查询项目信息， 1 返回分组列表 2 返回项目用户信息列表 3 返回app信息列表
export async function getProjectList(params) {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}${REQUEST_INTERGFACE_VERSIONN}/board/list`,
    method: 'GET',
    params: {
      // contain_type: '0',
      _organization_id:
        params._organization_id || localStorage.getItem('OrganizationId'),
      ...params
    }
  })
}

//文件夹树形列表
export async function getFolderList(params) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/folder`,
    method: 'GET',
    params
  })
}

// 查询文件列表-（只有文件）
export async function getOnlyThumbnailFileList(params) {
  return request({
    url: `${REQUEST_DOMAIN_FILE}/file/page`,
    method: 'GET',
    params: {
      _organization_id:
        params._organization_id || localStorage.getItem('OrganizationId'),
      ...params
    }
  })
}
