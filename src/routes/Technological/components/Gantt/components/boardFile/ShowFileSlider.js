import React, { Component } from 'react'
import styles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { connect } from 'dva'
import { fileModuleIsHasUnRead } from '../../ganttBusiness'
import { currentNounPlanFilterName } from '../../../../../../utils/businessFunction'
import { PROJECTS } from '../../../../../../globalset/js/constant'

@connect(mapStateToProps)
export default class ShowFileSlider extends Component {
  renderDirection = () => {
    const { is_show_board_file_area } = this.props
    const contain_1 = (
      <span
        className={`${globalStyles.authTheme}  ${is_show_board_file_area ==
          '1' && styles.spin_show}
            ${is_show_board_file_area == '2' && styles.spin_hide}`}
      >
        &#xe7ed;
      </span>
    )
    const contain_2 = (
      <span
        className={`${globalStyles.authTheme}  ${is_show_board_file_area ==
          '1' && styles.spin_show}
            ${is_show_board_file_area == '2' && styles.spin_hide}`}
      >
        &#xe7ee;
      </span>
    )
    return is_show_board_file_area == '1' ? contain_2 : contain_1
  }
  setShowBoardFile = () => {
    const { is_show_board_file_area, dispatch } = this.props
    let new_value = '1'
    if (is_show_board_file_area == '0') {
      new_value = '1'
    } else if (is_show_board_file_area == '1') {
      new_value = '2'
    } else if (is_show_board_file_area == '2') {
      new_value = '1'
    } else {
    }
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        is_show_board_file_area: new_value
      }
    })
  }
  render() {
    const {
      is_show_board_file_area,
      im_all_latest_unread_messages = [],
      wil_handle_types = [],
      gantt_head_width
    } = this.props
    // console.log('sssss', { is_show_board_file_area })
    return (
      <div
        className={`${styles.show_file_button}
                ${is_show_board_file_area == '1' &&
                  styles.show_file_button_show}
                ${is_show_board_file_area == '2' &&
                  styles.show_file_button_hide}`}
        onClick={this.setShowBoardFile}
        style={{ left: gantt_head_width + 40 }}
      >
        <span
          style={{ display: 'inline-block' }}
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
    datas: { is_show_board_file_area, gantt_head_width }
  },
  imCooperation: { im_all_latest_unread_messages = [], wil_handle_types = [] }
}) {
  return {
    is_show_board_file_area,
    im_all_latest_unread_messages,
    wil_handle_types,
    gantt_head_width
  }
}
