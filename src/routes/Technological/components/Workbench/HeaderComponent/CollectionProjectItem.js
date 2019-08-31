import React from 'react'
import indexstyles from './index.less'
import { Icon } from 'antd'
import globalStyles from '../../../../../globalset/css/globalClassName.less'
import { timestampToTimeNormal } from '../../../../../utils/util'
import Cookies from 'js-cookie'

let is_starinit = null
export default class CollectionProjectItem extends React.Component {

  render() {
    const cancelStarProjet = (
      <i className={globalStyles.authTheme}
         style={{color: '#FAAD14 ', fontSize: 16}}>&#xe70e;</i>
    )
    const starProject = (
      <i className={globalStyles.authTheme}
         style={{color: '#FAAD14 ', fontSize: 16}}>&#xe6f8;</i>
    )

    return (
      <div>
        <div className={indexstyles.collectionProjectItem}>
          <div className={indexstyles.left}>
            <div className={indexstyles.top}>
              <div>项目A</div>
              <div className={indexstyles.star}>
                {starProject}
              </div>
            </div>
            <div className={indexstyles.bott}>
              <div>剩余任务 33</div>
              <div>已完成 33</div>
              <div>下一节点 15 天</div>
            </div>
          </div>
          <div className={indexstyles.right}>
            <Icon type="right" style={{fontSize: 16}}/>
          </div>
        </div>
        <div className={indexstyles.collectionProjectItem}>
          <div className={indexstyles.left}>
            <div className={indexstyles.top}>
              <div>项目A</div>
              <div className={indexstyles.star}>
                {starProject}
              </div>
            </div>
            <div className={indexstyles.bott}>
              <div>剩余任务 33</div>
              <div>已完成 33</div>
              <div>下一节点 15 天</div>
            </div>
          </div>
          <div className={indexstyles.right}>
            <Icon type="right" style={{fontSize: 16}}/>
          </div>
        </div>
      </div>
    )
  }
}
