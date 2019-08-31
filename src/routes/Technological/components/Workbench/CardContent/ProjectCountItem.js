import React from 'react'
import indexstyles from '../index.less'
import { Icon } from 'antd'
import globalStyles from '../../../../../globalset/css/globalClassName.less'
import { timestampToTimeNormal } from '../../../../../utils/util'
import Cookies from 'js-cookie'
import zxtu from '../../../../../assets/library/zxtu.png'

export default class ProjectCountItem extends React.Component {

  render() {
    const { itemValue = {} } = this.props
    return (
      <div>
        <div className={indexstyles.projectCountItem}>
          <div className={indexstyles.left}>
            <div>35,729.00 万元</div>
            <div>项目收益</div>
          </div>
          <div className={indexstyles.right}>
            <img src={zxtu}/>
          </div>
        </div>
        <div className={indexstyles.projectCountItem}>
          <div className={indexstyles.left}>
            <div>35,7.00 万元</div>
            <div>月度收益</div>
          </div>
          <div className={indexstyles.right}>
            <img src={zxtu}/>
          </div>
        </div>
      </div>
    )
  }
}
