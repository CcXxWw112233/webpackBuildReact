import React from 'react';
import { Card, Icon, Input, Button, Mention, Upload, Tooltip, message } from 'antd'
import CommentStyles from './Comment.less'
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'
import CommentListItem from './CommentListItem'
import Cookies from 'js-cookie'
import {
  MESSAGE_DURATION_TIME, NOT_HAS_PERMISION_COMFIRN, PROJECT_TEAM_CARD_COMMENT_PUBLISH,
  PROJECT_FILES_FILE_EDIT
} from "../../../../../globalset/js/constant";
import {checkIsHasPermissionInBoard} from "../../../../../utils/businessFunction";
import CommentMention from '../../../../../components/CommentMention'

const { toString, toContentState } = Mention;

// const TextArea = Input.TextArea
const Dragger = Upload.Dragger

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
    if(!checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_COMMENT_PUBLISH)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const { datas: { drawContent = {} } } = this.props.model
    const { card_id } = drawContent
    this.props.addCardNewComment({
      card_id,
      comment: toString(editText)
    })
    this.setState({
      editText: toContentState(''),
      submitButtonDisabled: true
    })
  }

  commentToDynamics(data) {
    const { datas: { drawContent = {} } } = this.props.model
    const { card_id } = drawContent
    this.props.postCommentToDynamics({
      id: card_id,
      type: "1",
      content: [data]
    })
  }

  render() {

    const { editText } = this.state
    const { datas: { drawContent = {}, cardCommentList = [], projectDetailInfoData = {} } } = this.props.model
    const { data = [] } = projectDetailInfoData
    let suggestions = []
    for(let val of data) {
      if(val['full_name']) {
        suggestions.push(val['full_name'])
      }
    }
    const { img } = projectDetailInfoData
    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : {}
    const { avatar } = userInfo

    const { leftSpaceDivWH = 40 } = this.props
    const props = {
      name: 'file',
      multiple: true,
      action: '//jsonplaceholder.typicode.com/posts/',
      onChange(info) {
        const status = info.file.status;
        if (status !== 'uploading') {
          // console.log(info.file, info.fileList);
        }
        if (status === 'done') {
        } else if (status === 'error') {
        }
      },
    };
    return (
      <div>
        <div className={CommentStyles.out}>
          <div style={{width: leftSpaceDivWH, height: leftSpaceDivWH}}>
          </div>
          <div className={CommentStyles.right}>
            <CommentListItem {...this.props}/>
          </div>
        </div>
        {checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_COMMENT_PUBLISH) && (
          <div className={CommentStyles.out}>
            <div>
              {avatar?(
                <img src={avatar} className={CommentStyles.avartarImg} style={{width: leftSpaceDivWH, height: leftSpaceDivWH}} />
              ): (
                <div style={{width: 26, height: 26, borderRadius: 26, backgroundColor: '#f5f5f5', textAlign: 'center'}}>
                  <Icon type={'user'} style={{fontSize: 16, marginTop: 4, color: '#8c8c8c'}}/>
                </div>
              )}
          </div>
            <div className={CommentStyles.right}>
              <CommentMention users={data} submitComment={this.submitComment.bind(this)} commentToDynamics={this.commentToDynamics.bind(this)}/>
            </div>
        </div>
        )}
      </div>
    )
  }
}


