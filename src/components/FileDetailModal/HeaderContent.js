import React, { Component } from 'react'
import globalStyles from '@/globalset/css/globalClassName.less'
import headerStyles from './HeaderContent.less'
import { FILES } from '../../globalset/js/constant'
import { currentNounPlanFilterName, getOrgNameWithOrgIdFilter, checkIsHasPermissionInVisitControl, getSubfixName } from '@/utils/businessFunction.js'
import FileDetailBreadCrumbFileNav from './component/FileDetailBreadCrumbFileNav'
import HeaderContentRightMenu from './HeaderContentRightMenu'
import { fileInfoByUrl, getFilePDFInfo } from '@/services/technological/file'
import { isApiResponseOk } from '../../utils/handleResponseData'

export default class HeaderContent extends Component {

  constructor(props) {
    super(props)
    this.state = {
      filePreviewCurrentFileId: props.filePreviewCurrentFileId, // 保存一份当前的文件ID
    }
  }


  render() {
    return (
      <div className={headerStyles.headerWrapper}>
        {/* 这里是头部左边 S */}
        <div className={headerStyles.header_left}>
          {/* 这里是头部图标样式 */}
          <div className={headerStyles.header_icon}>
            <span>
              <i className={`${globalStyles.authTheme} ${headerStyles.title_icon}`}>&#xe691;</i>
            </span>
            <span style={{fontSize: '14px'}}>
              {currentNounPlanFilterName(FILES)}
            </span>
          </div>
          {/* 这里是面包屑路径 */}
          <div>
            <FileDetailBreadCrumbFileNav 
              {...this.props}/></div>
        </div>
        {/* 这里是头部左边 E */}
        {/* 这里是头部右边 S */}
        <div className={headerStyles.header_right}>
          <HeaderContentRightMenu 
            {...this.props}
          />
        </div>
        {/* 这里是头部右边 E */}
      </div>
    )
  }
}
