import React, { Component } from 'react'
import indexStyles from './index.less'
import HeaderContentRightMenu from './HeaderContentRightMenu'
import {
  currentNounPlanFilterName,
  getOrgNameWithOrgIdFilter
} from '@/utils/businessFunction.js'
import { FLOWS } from '../../globalset/js/constant'
import { connect } from 'dva'
import globalStyles from '@/globalset/css/globalClassName.less'

@connect(mapStateToProps)
export default class HeaderContent extends Component {
  render() {
    const {
      projectDetailInfoData: { org_id, board_id, board_name }
    } = this.props
    const {
      is_show_org_name,
      is_all_org,
      currentUserOrganizes = [],
      processPageFlagStep,
      currentFlowInstanceName
    } = this.props
    return (
      <div className={indexStyles.detail_head}>
        {/* 这里是头部左边 */}
        <div className={indexStyles.detail_head_left}>
          {/* 这里是头部图标样式 */}
          <div className={indexStyles.header_icon}>
            <span>
              <i
                className={`${globalStyles.authTheme} ${indexStyles.title_icon}`}
              >
                &#xe68c;
              </i>
            </span>
            <span style={{ fontSize: '14px' }}>
              {currentNounPlanFilterName(FLOWS)}
            </span>
          </div>

          {/* 这里是小导航 */}
          <span className={indexStyles.bread_nav}>
            {processPageFlagStep == '4' && (
              <>
                <span className={indexStyles.bread_board_name}>
                  {board_name}
                </span>
                {is_show_org_name && is_all_org && (
                  <span className={indexStyles.bread_org_name}>
                    #{getOrgNameWithOrgIdFilter(org_id, currentUserOrganizes)}
                  </span>
                )}
                <span className={indexStyles.arrow_right}></span>
              </>
            )}
            <span className={indexStyles.current_name}>
              {processPageFlagStep == '1'
                ? '新建模板'
                : `${currentFlowInstanceName}`}
            </span>
          </span>
        </div>
        {/* 这里是头部右边 */}
        <div className={indexStyles.detail_head_right}>
          <HeaderContentRightMenu
            request_flows_params={this.props.request_flows_params}
            onCancel={this.props.onCancel}
            whetherUpdateWorkbenchPorcessListData={
              this.props.whetherUpdateWorkbenchPorcessListData
            }
          />
        </div>
      </div>
    )
  }
}

function mapStateToProps({
  publicProcessDetailModal: { processPageFlagStep, currentFlowInstanceName },
  projectDetail: {
    datas: { projectDetailInfoData = {} }
  },
  technological: {
    datas: { currentUserOrganizes = [], is_all_org, is_show_org_name }
  }
}) {
  return {
    processPageFlagStep,
    currentFlowInstanceName,
    projectDetailInfoData,
    currentUserOrganizes,
    is_show_org_name,
    is_all_org
  }
}
