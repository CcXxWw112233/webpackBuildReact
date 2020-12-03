import React, { Component } from 'react'
import globalStyles from '@/globalset/css/globalClassName.less'
import headerStyles from './HeaderContent.less'
import { FILES } from '../../globalset/js/constant'
import { currentNounPlanFilterName } from '@/utils/businessFunction.js'

export default class NonsupportPreviewFileHeader extends Component {
  render() {
    return (
      <div className={headerStyles.headerWrapper}>
        {/* 这里是头部左边 S */}
        <div className={headerStyles.header_left}>
          {/* 这里是头部图标样式 */}
          <div className={headerStyles.header_icon}>
            <span>
              <i
                className={`${globalStyles.authTheme} ${headerStyles.title_icon}`}
              >
                &#xe691;
              </i>
            </span>
            <span style={{ fontSize: '14px' }}>
              {currentNounPlanFilterName(FILES)}
            </span>
          </div>
          {/* 这里是面包屑路径 */}
          <div>{this.props.filePreviewCurrentName || ''}</div>
        </div>
        {/* 这里是头部左边 E */}
      </div>
    )
  }
}
