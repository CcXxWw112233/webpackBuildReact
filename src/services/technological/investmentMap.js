import request from '../../utils/requestAxios'
import {REQUEST_DOMAIN, REQUEST_DOMAIN_BOARD, REQUEST_INTERGFACE_VERSIONN} from '../../globalset/js/constant'

export async function getMapsQueryUser({params}) {
  return request({
    url: `${REQUEST_DOMAIN}/organization/map`,
    method: 'GET',
    params: {
      params
    }
  })
}
