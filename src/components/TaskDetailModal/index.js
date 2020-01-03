import React, { Component } from 'react'
import PublicDetailModal from '@/components/PublicDetailModal'
import MainContent from './MainContent'
import HeaderContent from './HeaderContent'
import { connect } from 'dva'
import {
  checkIsHasPermissionInBoard, checkIsHasPermissionInVisitControl,
} from "@/utils/businessFunction";
import {
  MESSAGE_DURATION_TIME, NOT_HAS_PERMISION_COMFIRN,
  PROJECT_TEAM_CARD_COMPLETE, PROJECT_TEAM_CARD_COMMENT_PUBLISH
} from "@/globalset/js/constant";
import { message } from 'antd'

@connect(mapStateToProps)
export default class TaskDetailModal extends Component {

  onCancel = () => {
    // this.props.dispatch({
    //   type: 'publicModalComment/updateDatas',
    //   payload: {
    //     comment_list: [],
    //     isShowAllDynamic: true, // 是否显示全部动态
    //   }
    // })
    this.props.dispatch({
      type: 'publicTaskDetailModal/updateDatas',
      payload: {
        drawerVisible: false,
        drawContent: {},
        card_id: '',
        is_edit_title: false, // 是否编辑标题 默认为 false 不显示
        boardTagList: []
      }
    })
    this.props.setTaskDetailModalVisible && this.props.setTaskDetailModalVisible()
    // 圈子关闭联动
    global.constants.lx_utils && global.constants.lx_utils.setCommentData( this.props.card_id || null) 
  }

   // 检测不同类型的权限控制类型的是否显示
   checkDiffCategoriesAuthoritiesIsVisible = (code) => {
    const { drawContent = {} } = this.props
    const { is_realize = '0', card_id, privileges = [], board_id, is_privilege, executors = [] } = drawContent
    let flag
    return {
      'visit_control_edit': function () {// 是否是有编辑权限
        return checkIsHasPermissionInVisitControl('edit', privileges, is_privilege, executors, checkIsHasPermissionInBoard(code, board_id))
      },
      'visit_control_comment': function() {
        return checkIsHasPermissionInVisitControl('comment', privileges, is_privilege, executors, checkIsHasPermissionInBoard(code, board_id))
      },
    }
  }

  // //评论
  // commentSubmitPost = (data) => {
  //   if (!(this.checkDiffCategoriesAuthoritiesIsVisible(PROJECT_TEAM_CARD_COMMENT_PUBLISH).visit_control_comment() || this.checkDiffCategoriesAuthoritiesIsVisible(PROJECT_TEAM_CARD_COMMENT_PUBLISH).visit_control_edit())) {
  //     message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
  //     return false
  //   }
  //   let { text } = data
  //   const { dispatch, card_id, isShowAllDynamic } = this.props
  //   if(text) {
  //     text = text.replace(/\r|\n/gim, '')
  //   }
  //   if(!text) {
  //     return
  //   }
  //   dispatch({
  //     type: 'publicModalComment/addCardNewComment',
  //     payload: {
  //       origin_type: '1',
  //       comment: text,
  //       card_id,
  //       flag: isShowAllDynamic ? '0' : '1'
  //     }
  //   })
  // }

  // deleteComment = (data) => {
  //   const { id } = data
  //   const { dispatch, isShowAllDynamic, card_id } = this.props
  //   dispatch({
  //     type: 'publicModalComment/deleteCardNewComment',
  //     payload: {
  //       id,
  //       common_id: card_id,
  //       flag: isShowAllDynamic ? '0' : '1',
  //       origin_type: '1'
  //     }
  //   })
  // }

  // 外部容器的点击事件
  commonDrawerContentOutClick = () => {
    this.props.dispatch({
      type: 'publicTaskDetailModal/updateDatas',
      payload: {
        is_edit_title: false
      }
    })
  }

  render() {
    const { task_detail_modal_visible, users, handleTaskDetailChange, updateParentTaskList, setTaskDetailModalVisible, handleDeleteCard, card_id } = this.props
    // const siderRightWidth = document.getElementById('siderRight').clientWidth
    // const commentUseParams = { //公共评论模块所需要的参数
    //   commentSubmitPost: this.commentSubmitPost,
    //   deleteComment: this.deleteComment,
    //   content_detail_use_id: card_id,
    //   origin_type: '1', //	string评论来源类型 1=任务 2=流程 3=文件 4=里程碑
    //   // flag: '1', //0或不传：评论和动态，1只显示评论，2只动态
    // }
    
    return (
      <div>
        <PublicDetailModal
          // width={1200}
          // dynamicsContent={<CommentDynamicsList />}
          //style={{padding: '20px 84px 0'}}
          modalVisible={task_detail_modal_visible}
          onCancel={this.onCancel}
          // commentUseParams={commentUseParams}
          isNotShowFileDetailContentRightVisible={true}
          mainContent={<MainContent users={users} handleTaskDetailChange={handleTaskDetailChange} />}
          headerContent={
          <HeaderContent users={users}
            handleDeleteCard={handleDeleteCard}
            setTaskDetailModalVisible={setTaskDetailModalVisible} handleTaskDetailChange={handleTaskDetailChange} updateParentTaskList={updateParentTaskList} 
          />}
          commonDrawerContentOutClick={this.commonDrawerContentOutClick}
        />
      </div>
    )
  }
}

TaskDetailModal.defaultProps = {
  task_detail_modal_visible: false, // 设置任务详情弹窗是否显示, 默认为 false 不显示
  setTaskDetailModalVisible: function() { }, // 设置任务详情弹窗是否显示
  users: [], // 用户列表
  handleTaskDetailChange: function() { }, // 外部修改内部弹窗数据的回调
  updateParentTaskList: function() { }, // 内部数据修改后用来更新外部数据的回调
  handleDeleteCard: function() { }, // 删除某条任务
}

//  只关联public中弹窗内的数据
function mapStateToProps({ publicTaskDetailModal: { drawContent = {}, card_id }, publicModalComment: { isShowAllDynamic } } ) {
  return { drawContent, card_id, isShowAllDynamic }
}
