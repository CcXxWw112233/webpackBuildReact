import React from 'react';
import { Icon, Mention, message } from 'antd'
import CommentStyles from './Comment.less'
import 'emoji-mart/css/emoji-mart.css'
import CommentListItem from './CommentListItem'
import {
  MESSAGE_DURATION_TIME, NOT_HAS_PERMISION_COMFIRN, PROJECT_TEAM_CARD_COMMENT_PUBLISH,
} from "../../../../../globalset/js/constant";
import { checkIsHasPermissionInBoard, checkIsHasPermissionInVisitControl } from "../../../../../utils/businessFunction";
import CommentMention from '../../../../../components/CommentMention'
import { connect } from 'dva';

const { toString, toContentState } = Mention;

@connect(mapStateToProps)
export default class Comment extends React.Component {
  state = {
    editText: toContentState(''),
    submitButtonDisabled: true
  }
  MentionSpacerClick() {
  }
  MentionEditorChange(editorState) {
    this.setState({
      editText: editorState
    }, function () {
      this.setState({
        submitButtonDisabled: !!!toString(this.state.editText)
      })
    })
  }
  submitComment(editText) {
    // if (!checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_COMMENT_PUBLISH)) {
    //   message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
    //   return false
    // }
    const { drawContent = {} } = this.props
    const { card_id, board_id, privileges = [], is_privilege, executors = [] } = drawContent
    if (!(checkIsHasPermissionInVisitControl('comment', privileges, is_privilege, executors, checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_COMMENT_PUBLISH, board_id)) || checkIsHasPermissionInVisitControl('edit', privileges, is_privilege, executors, checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_COMMENT_PUBLISH, board_id)))) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const { dispatch } = this.props
    dispatch({
      type: 'projectDetailTask/addCardNewComment',
      payload: {
        card_id,
        comment: toString(editText)
      }
    })

    this.setState({
      editText: toContentState(''),
      submitButtonDisabled: true
    })
  }

  commentToDynamics(data) {
    const { drawContent = {} } = this.props
    const { card_id } = drawContent
    const { dispatch } = this.props
    dispatch({
      type: 'projectDetail/postCommentToDynamics',
      payload: {
        id: card_id,
        type: "1",
        content: [data]
      }
    })
  }

  render() {
    const { projectDetailInfoData = {}, drawContent = {} } = this.props
    const { privileges = [], board_id, is_privilege, executors = [] } = drawContent
    const { data = [] } = projectDetailInfoData
    let suggestions = []
    for (let val of data) {
      if (val['full_name']) {
        suggestions.push(val['full_name'])
      }
    }
    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : {}
    const { avatar } = userInfo
    const { leftSpaceDivWH = 40 } = this.props

    return (
      <div>
        <div className={CommentStyles.out}>
          <div style={{ width: leftSpaceDivWH, height: leftSpaceDivWH }}>
          </div>
          <div className={CommentStyles.right}>
            <CommentListItem />
          </div>
        </div>

        {/* {(checkIsHasPermissionInVisitControl('comment', privileges, is_privilege, executors, checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_COMMENT_PUBLISH, board_id)) || checkIsHasPermissionInVisitControl('edit', privileges, is_privilege, executors, checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_COMMENT_PUBLISH, board_id))) && (
          <div className={CommentStyles.out}>
            <div>
              {avatar ? (
                <img src={avatar} className={CommentStyles.avartarImg} style={{ width: leftSpaceDivWH, height: leftSpaceDivWH }} />
              ) : (
                  <div style={{ width: 26, height: 26, borderRadius: 26, backgroundColor: '#f5f5f5', textAlign: 'center' }}>
                    <Icon type={'user'} style={{ fontSize: 16, marginTop: 4, color: '#8c8c8c' }} />
                  </div>
                )}
            </div>
            <div className={CommentStyles.right}>
              <CommentMention users={data} submitComment={this.submitComment.bind(this)} commentToDynamics={this.commentToDynamics.bind(this)} />
            </div>
          </div>
        )} */}

      </div>
    )
  }
}

function mapStateToProps({
  projectDetailTask: {
    datas: {
      drawContent = {},
      cardCommentList = []
    }
  },
  projectDetail: {
    datas: {
      projectDetailInfoData = {},
    }
  },
}) {
  return {
    drawContent,
    cardCommentList,
    projectDetailInfoData,
  }
}