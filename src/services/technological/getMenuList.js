import request from '../../utils/requestAxios'
import { REQUEST_DOMAIN } from '../../globalset/js/constant'
import Cookies from 'js-cookie'
import { func } from 'prop-types';

//getMenu
export async function getMenuList(params) {
  return request({
    url: `${REQUEST_DOMAIN}/organization_app/menu/query`,
    method: 'GET',
    params: {
      ...params,
      _organization_id: localStorage.getItem('OrganizationId'),
    }      
  })
}