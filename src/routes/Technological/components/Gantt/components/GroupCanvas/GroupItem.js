import { connect } from 'dva'
import React, { Component } from 'react'
import indexStyles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'

@connect(mapStateToProps)
export default class GroupItem extends Component {
  renderMonthView = () => {
    return (
      <div className={indexStyles.milestone_wrapper}>
        {/* 旗帜 */}
        <div
          className={`${indexStyles.board_miletiones_flag} ${globalStyles.authTheme}`}
          data-targetclassname="specific_example_milestone"
          onClick={this.seeMiletones}
        >
          &#xe6a0;
        </div>
        {/* 渲染里程碑名称铺开 */}

        <div
          className={`${indexStyles.board_miletiones_names} ${globalStyles.global_ellipsis}`}
          data-targetclassname="specific_example_milestone"
          style={{
            top: this.setMiletonesNamesPostionTop()
          }}
        >
          names
        </div>
        <div
          data-targetclassname="specific_example_milestone"
          className={`${indexStyles.board_miletiones_flagpole2}`}
          onClick={this.seeMiletones}
          style={{}}
          onMouseDown={e => e.stopPropagation()}
          onMouseOver={e => e.stopPropagation()}
        />
        <div
          data-targetclassname="specific_example_milestone"
          className={`${indexStyles.board_miletiones_flagpole}`}
          style={{}}
          onClick={this.seeMiletones}
          onMouseDown={e => e.stopPropagation()}
          onMouseOver={e => e.stopPropagation()}
        />
      </div>
    )
  }
  seeMiletones = () => {}
  render() {
    const { rows, ceiHeight, ceilWidth, date_total } = this.props
    return (
      <div
        style={{
          height: rows * ceiHeight,
          width: date_total * ceilWidth
        }}
      ></div>
    )
  }
}
function mapStateToProps({
  gantt: {
    datas: {
      gantt_view_mode,
      gold_date_arr = [],
      group_list_area_section_height,
      ceiHeight,
      gantt_board_id,
      about_user_boards,
      milestoneMap,
      group_view_type,
      show_board_fold,
      ceilWidth,
      date_arr_one_level,
      gantt_head_width,
      date_total
    }
  }
}) {
  return {
    gantt_view_mode,
    gold_date_arr,
    ceiHeight,
    gantt_board_id,
    about_user_boards,
    milestoneMap,
    group_view_type,
    show_board_fold,
    group_list_area_section_height,
    ceilWidth,
    date_arr_one_level,
    gantt_head_width,
    date_total
  }
}
