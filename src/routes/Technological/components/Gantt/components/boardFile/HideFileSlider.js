import React, { Component } from 'react'
import styles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { connect } from 'dva'
import { fileModuleIsHasUnRead } from '../../ganttBusiness'
import { currentNounPlanFilterName } from '../../../../../../utils/businessFunction'
import { PROJECTS } from '../../../../../../globalset/js/constant'

@connect(mapStateToProps)
export default class ShowFileSlider extends Component {
  setShowBoardFileHide = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        is_show_board_file_area: '2'
      }
    })
  }
  render() {
    const {
      is_show_board_file_area,
      im_all_latest_unread_messages = [],
      wil_handle_types = []
    } = this.props

    return (
      <div
        className={`${styles.hide_file_button}`}
        onClick={this.setShowBoardFileHide}
      >
        <span
          style={{ display: 'inline-block', marginRight: 4 }}
          className={`${globalStyles.authTheme}  ${is_show_board_file_area ==
            '1' && styles.spin_show}
            ${is_show_board_file_area == '2' && styles.spin_hide}`}
        >
          &#xe7ed;
        </span>
        {`${currentNounPlanFilterName(PROJECTS)}文件`}
        {/* 未读消息数 */}
        {fileModuleIsHasUnRead({
          im_all_latest_unread_messages,
          wil_handle_types
        }) > 0 && (
          <div className={styles.has_no_read}>
            {fileModuleIsHasUnRead({
              im_all_latest_unread_messages,
              wil_handle_types
            }) > 99
              ? '99+'
              : fileModuleIsHasUnRead({
                  im_all_latest_unread_messages,
                  wil_handle_types
                })}
          </div>
        )}
      </div>
    )
  }
}

function mapStateToProps({
  gantt: {
    datas: { is_show_board_file_area }
  },
  imCooperation: { im_all_latest_unread_messages = [], wil_handle_types = [] }
}) {
  return {
    is_show_board_file_area,
    im_all_latest_unread_messages,
    wil_handle_types
  }
}
