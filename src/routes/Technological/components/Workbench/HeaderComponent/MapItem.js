import React from 'react'
import indexstyles from './index.less'
import { Icon } from 'antd'
import globalStyles from '../../../../../globalset/css/globalClassName.less'
import { timestampToTimeNormal } from '../../../../../utils/util'
import Cookies from 'js-cookie'
import mapSrc from '../../../../../assets/library/yinyimap.png'

export default class ProjectCountItem extends React.Component {

  render() {
    return (
      <div style={{cursor: 'pointer'}} >
        <img src={mapSrc} />
      </div>
    )
  }
}
