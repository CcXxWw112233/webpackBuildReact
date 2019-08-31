import React from 'react'
import indexstyles from '../../index.less'
import { Icon } from 'antd'
import globalStyles from '../../../../../../globalset/css/globalClassName.less'
import { timestampToTimeNormal } from '../../../../../../utils/util'
import Cookies from 'js-cookie'
import mapSrc from './schoolWork.png'

export default class SchoolWork extends React.Component {

  render() {
    const { itemValue = {} } = this.props
    return (
      <div style={{cursor: 'pointer'}} >
        <img src={mapSrc} />
      </div>
    )
  }
}
