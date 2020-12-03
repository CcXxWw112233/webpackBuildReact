// 统计报表相关接口
import request from '../../utils/requestAxios'
import {
  REQUEST_DOMAIN_WORK_BENCH,
  REQUEST_DOMAIN,
  REQUEST_DOMAIN_ARTICLE,
  REQUEST_DOMAIN_BOARD,
  REQUEST_INTERGFACE_VERSIONN
} from '../../globalset/js/constant'

// 工时统计
export function getReportCardWorktime() {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/report/card/worktime`,
    method: 'GET'
  })
}

// 任务数统计
export function getReportCardNumber() {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/report/card/number`,
    method: 'GET'
  })
}

// 项目状态
export function getReportBoardStatus() {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/report/board/status`,
    method: 'GET'
  })
}

// 新增项目数
export function getReportBoardGrowth() {
  return request({
    url: `${REQUEST_DOMAIN_BOARD}/report/board/growth`,
    method: 'GET'
  })
}
