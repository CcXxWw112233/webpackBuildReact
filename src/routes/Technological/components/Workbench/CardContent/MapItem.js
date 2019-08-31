import React from 'react'
import indexstyles from '../index.less'
import { Icon } from 'antd'
import globalStyles from '../../../../../globalset/css/globalClassName.less'
import { timestampToTimeNormal } from '../../../../../utils/util'
import Cookies from 'js-cookie'
import mapSrc from '../../../../../assets/library/yinyimap.png'

export default class ProjectCountItem extends React.Component {

  render() {
    const { itemValue = {} } = this.props
    return (
      <div style={{cursor: 'pointer'}} onClick={()=>{window.open('http://47.93.53.149/map/pages/app/tzmap/tzmapPage.html')}}>
        <img src={mapSrc} />
      </div>
    )
  }
}
