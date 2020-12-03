import React, { Component } from 'react'
import indexStyles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { Select } from 'antd'
import { currentNounPlanFilterName } from '../../utils/businessFunction'
import { TASKS, FLOWS } from '../../globalset/js/constant'
import { timestampToTimeNormal, isObjectValueEqual } from '../../utils/util'
const { Option } = Select

export default class RelyOnRelationship extends Component {
  render() {
    return (
      <div className={indexStyles.relyOnContainer}>
        <div className={indexStyles.re_top}>
          <div className={indexStyles.re_left}>
            <span className={globalStyles.authTheme}>&#xe6ed;</span>
            <span>
              依赖关系: 存在<span style={{ color: '#1890ff' }}>{2}</span>
              条依赖关系
            </span>
          </div>
        </div>
      </div>
    )
  }
}
