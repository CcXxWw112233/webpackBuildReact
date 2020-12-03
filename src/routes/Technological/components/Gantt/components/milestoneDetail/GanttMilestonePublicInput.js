import React, { Component } from 'react'
import PropTypes from 'prop-types'
import MilestoneDetail from './index'
import { connect } from 'dva'
import { ganttIsOutlineView } from '../../constants'

@connect(mapStateToProps)
export default class GanttMilestonePublicInput extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  // 甘特图信息变化后，实时触发甘特图渲染在甘特图上变化
  handleMiletonsChangeMountInGantt = (...arg) => {
    const { dispatch, group_view_type } = this.props
    if (ganttIsOutlineView({ group_view_type })) {
      this.handleMiletonsChangeOutlineView(...arg)
    } else {
      dispatch({
        type: 'gantt/getGttMilestoneList',
        payload: {}
      })
    }
  }
  deleteMiletone = ({ id }) => {
    const { milestoneMap = {}, dispatch } = this.props
    const new_milestoneMap = { ...milestoneMap }
    let flag = false
    for (let key in new_milestoneMap) {
      const item = new_milestoneMap[key]
      const length = item.length
      for (let i = 0; i < length; i++) {
        if (item[i].id == id) {
          flag = true
          new_milestoneMap[key].splice(i, 1)
          break
        }
      }
      if (flag) {
        break
      }
    }
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        milestoneMap: new_milestoneMap
      }
    })
  }
  // 里程碑删除子任务回调
  deleteRelationContent = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'gantt/getGttMilestoneList',
      payload: {}
    })
  }
  set_miletone_detail_modal_visible = () => {
    const { miletone_detail_modal_visible, dispatch } = this.props
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        miletone_detail_modal_visible: !miletone_detail_modal_visible
      }
    })
  }

  // 甘特图信息变化后，实时触发甘特图渲染在甘特图上变化
  handleMiletonsChangeOutlineView = (id, data, data2) => {
    let data_ = { ...data }
    if (data_.deadline) data_.due_time = data_.deadline
    const { dispatch } = this.props
    dispatch({
      type: 'gantt/updateOutLineTree',
      payload: {
        datas: [{ id, ...data_ }]
      }
    })
  }

  render() {
    const { miletone_detail_modal_visible } = this.props
    return (
      <MilestoneDetail
        handleMiletonesChange={this.handleMiletonsChangeMountInGantt}
        miletone_detail_modal_visible={miletone_detail_modal_visible}
        set_miletone_detail_modal_visible={
          this.set_miletone_detail_modal_visible
        }
        deleteMiletone={this.deleteMiletone}
        deleteRelationContent={this.deleteRelationContent}
      />
    )
  }
}

function mapStateToProps({
  gantt: {
    datas: {
      gantt_board_id,
      about_user_boards,
      miletone_detail_modal_visible,
      group_view_type
    }
  }
}) {
  return {
    gantt_board_id,
    about_user_boards,
    miletone_detail_modal_visible,
    group_view_type
  }
}
