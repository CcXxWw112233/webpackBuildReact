import React, { Component } from 'react'
import PublicDetailModal from '@/components/PublicDetailModal'
import MainContent from './MainContent'
import HeaderContent from './HeaderContent'
import { connect } from 'dva'
import { lx_utils } from 'lingxi-im'

@connect(mapStateToProps)
export default class TaskDetailModal extends Component {
  onCancel = () => {
    this.props.dispatch({
      type: 'publicTaskDetailModal/updateDatas',
      payload: {
        drawerVisible: false,
        drawContent: {},
        card_id: '',
        boardTagList: []
      }
    })
    this.props.setTaskDetailModalVisible &&
      this.props.setTaskDetailModalVisible()
    // 圈子关闭联动
    lx_utils && lx_utils.setCommentData(this.props.card_id || null)
  }

  render() {
    const {
      task_detail_modal_visible,
      handleTaskDetailChange,
      updateParentTaskList,
      setTaskDetailModalVisible,
      handleDeleteCard,
      handleChildTaskChange
    } = this.props

    return (
      <div>
        <PublicDetailModal
          modalVisible={task_detail_modal_visible}
          onCancel={this.onCancel}
          isNotShowFileDetailContentRightVisible={true}
          mainContent={
            <MainContent
              handleTaskDetailChange={handleTaskDetailChange}
              handleChildTaskChange={handleChildTaskChange}
            />
          }
          headerContent={
            <HeaderContent
              handleDeleteCard={handleDeleteCard}
              setTaskDetailModalVisible={setTaskDetailModalVisible}
              handleTaskDetailChange={handleTaskDetailChange}
              updateParentTaskList={updateParentTaskList}
            />
          }
        />
      </div>
    )
  }
}

TaskDetailModal.defaultProps = {
  task_detail_modal_visible: false, // 设置任务详情弹窗是否显示, 默认为 false 不显示
  setTaskDetailModalVisible: function() {}, // 设置任务详情弹窗是否显示
  handleTaskDetailChange: function() {}, // 外部修改内部弹窗数据的回调
  updateParentTaskList: function() {}, // 内部数据修改后用来更新外部数据的回调
  handleDeleteCard: function() {}, // 删除某条任务
  handleChildTaskChange: function() {} // 子任务更新或删除回调最终会返回  action?update/add/delete, parent_card_id, card_id, data(要更新的keykode)
}

//  只关联public中弹窗内的数据
function mapStateToProps({ publicTaskDetailModal: { card_id } }) {
  return { card_id }
}
