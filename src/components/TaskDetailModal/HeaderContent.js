import React, { Component } from 'react'
import globalStyles from '@/globalset/css/globalClassName.less'
import headerStyles from './HeaderContent.less'
import {
  currentNounPlanFilterName,
  getOrgNameWithOrgIdFilter,
  checkIsHasPermissionInVisitControl
} from '@/utils/businessFunction.js'
import { TASKS } from '../../globalset/js/constant'
import HeaderContentRightMenu from './HeaderContentRightMenu'
import { connect } from 'dva'

class HeaderContent extends Component {
  render() {
    const {
      drawContent = {},
      currentUserOrganizes = [],
      is_all_org,
      is_show_org_name,
      updateParentTaskList,
      handleTaskDetailChange,
      setTaskDetailModalVisible,
      handleDeleteCard
    } = this.props
    const { card_id, org_id, board_id, board_name, list_name } = drawContent

    return (
      <div className={headerStyles.detail_head}>
        {/* 这里是头部左边 */}
        <div className={headerStyles.detail_head_left}>
          {/* 这里是头部图标样式 */}
          <div className={headerStyles.header_icon}>
            <span>
              <i
                className={`${globalStyles.authTheme} ${headerStyles.title_icon}`}
              >
                &#xe66a;
              </i>
            </span>
            <span style={{ fontSize: '14px' }}>
              {currentNounPlanFilterName(TASKS)}
            </span>
          </div>

          {/* 这里是小导航 */}
          <span className={headerStyles.bread_nav}>
            <span className={headerStyles.bread_board_name}>{board_name}</span>
            {is_show_org_name && is_all_org && (
              <span className={headerStyles.bread_org_name}>
                #{getOrgNameWithOrgIdFilter(org_id, currentUserOrganizes)}
              </span>
            )}
            <span className={`${globalStyles.authTheme} ${headerStyles.arrow}`}>
              {list_name ? <span>&#xe61f;</span> : ''}
            </span>
            <span className={headerStyles.bread_list_name}>
              {list_name || ''}
            </span>
          </span>
        </div>
        {/* 这里是头部右边 */}
        <div className={headerStyles.detail_head_right}>
          <HeaderContentRightMenu
            handleTaskDetailChange={handleTaskDetailChange}
            updateParentTaskList={updateParentTaskList}
            handleDeleteCard={handleDeleteCard}
            setTaskDetailModalVisible={setTaskDetailModalVisible}
          />
        </div>
      </div>
    )
  }
}

HeaderContent.defaultProps = {
  board_id: '', // 项目id
  board_name: '', // 项目名
  card_id: '' // 任务id
}

//  只关联public中弹窗内的数据
function mapStateToProps({
  publicTaskDetailModal: { drawContent = {} },
  technological: {
    datas: { currentUserOrganizes = [], is_all_org, is_show_org_name }
  }
}) {
  return { drawContent, currentUserOrganizes, is_show_org_name, is_all_org }
}
export default connect(mapStateToProps)(HeaderContent)
