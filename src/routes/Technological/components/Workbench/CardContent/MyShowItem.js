import React from 'react'
import indexstyles from '../index.less'
import { Icon } from 'antd'
import globalStyles from '../../../../../globalset/css/globalClassName.less'
import { timestampToTimeNormal } from '../../../../../utils/util'
import Cookies from 'js-cookie'

export default class MyShowItem extends React.Component {
  render() {
    const { itemValue = {}, itemKey } = this.props
    return (
      <div className={indexstyles.myshowItem}>
        <div className={indexstyles.contain1}>
          <div className={indexstyles.contain1_item}>
            <div>今日浏览量</div>
            <div>57</div>
          </div>
          <div className={indexstyles.contain1_item}>
            <div>总浏览量</div>
            <div>57</div>
          </div>
          <div className={indexstyles.contain1_item}>
            <div>平均停留时间</div>
            <div>57</div>
          </div>
        </div>
        <div className={indexstyles.contain2}>
          <div className={indexstyles.contain2_item}>
            关于我们
          </div>
          <div className={indexstyles.contain2_item}>
            业务领域
          </div>
        </div>
      </div>
    )
  }
}
