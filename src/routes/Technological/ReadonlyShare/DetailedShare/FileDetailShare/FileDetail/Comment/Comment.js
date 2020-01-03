import React from 'react';
import { Icon, Mention } from 'antd'
import CommentStyles from './Comment.less'
import 'emoji-mart/css/emoji-mart.css'
import CommentListItem from './CommentListItem'
import CommentMention from '../../../../../../../components/CommentMention'
import { connect } from 'dva';

const { toString, toContentState } = Mention;

// const TextArea = Input.TextArea

@connect(mapStateToProps)
export default class Comment extends React.Component {
  state = {
    editText: toContentState(''),
    submitButtonDisabled: true,
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
    const { projectDetailInfoData = {}, filePreviewCurrentFileId, filePreviewCommitPointNumber, currentRect, dispatch } = this.props
    const { board_id } = projectDetailInfoData
    dispatch({
      type: 'projectDetailFile/addFileCommit',
      payload: {
        board_id,
        point_number: filePreviewCommitPointNumber,
        comment: toString(editText),
        file_id: filePreviewCurrentFileId,
        type: '1',
        coordinates: JSON.stringify(currentRect)
      }
    })
    this.setState({
      editText: toContentState(''),
      submitButtonDisabled: true,
    })

  }
  commentToDynamics(data) {
    const { filePreviewCurrentFileId, dispatch } = this.props
    dispatch({
      type: 'projectDetail/postCommentToDynamics',
      payload: {
        id: filePreviewCurrentFileId,
        type: "2",
        content: [data]
      }
    })
  }


  stopUp(e) {
    e.stopPropagation()
  }

  mentionFocus(e) {
    this.props.setMentionFocus(true)
  }
  mentionBlur(e) {
    this.props.setMentionFocus(false)

  }
  outFocus() {
    this.props.setMentionFocus(true)
  }
  outBlur() {
    this.props.setMentionFocus(false)
  }
  render() {

    const { editText } = this.state
    const { projectDetailInfoData = {}, filePreviewCommitPointNumber } = this.props
    const { data = [] } = projectDetailInfoData
    let suggestions = []
    for (let val of data) {
      if (val['full_name']) {
        suggestions.push(val['full_name'])
      }
    }
    const { img } = projectDetailInfoData
    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : {}
    const { avatar } = userInfo

    const { leftSpaceDivWH = 40 } = this.props
    return (
      <div className={CommentStyles.commentOut} id={'ssss'} onBlur={this.outBlur.bind(this)} onFocus={this.outFocus.bind(this)} onClick={this.stopUp.bind(this)} onMouseDown={this.stopUp.bind(this)}>
        <div tabIndex="0" hideFocus="true" id={'ssss'} onBlur={this.outBlur.bind(this)} onFocus={this.outFocus.bind(this)}>
          <CommentListItem {...this.props} point_number={filePreviewCommitPointNumber} />
        </div>

        <div className={CommentStyles.out} tabIndex="0" hideFocus="true" onBlur={this.outBlur.bind(this)} onFocus={this.outFocus.bind(this)} style={{ outline: 0, }} onClick={this.stopUp.bind(this)} onMouseDown={this.stopUp.bind(this)}>
          <div>
            {avatar ? (
              <img src={avatar} className={CommentStyles.avartarImg} style={{ width: leftSpaceDivWH, height: leftSpaceDivWH }} />
            ) : (
                <div style={{ width: 26, height: 26, borderRadius: 26, backgroundColor: '#f5f5f5', textAlign: 'center' }}>
                  <Icon type={'user'} style={{ fontSize: 16, marginTop: 4, color: '#8c8c8c' }} />
                </div>
              )}
          </div>
          {/*<Dragger {...props} >*/}
          <div className={CommentStyles.right}>
            <CommentMention users={data} submitComment={this.submitComment.bind(this)} commentToDynamics={this.commentToDynamics.bind(this)} />
            {/*<div className={CommentStyles.comment}>*/}
            {/*/!*<textarea minrows = {1}  maxrows = {6}  className={CommentStyles.textArea}></textarea>*!/*/}
            {/*<Mention*/}
            {/*onFocus={this.mentionFocus.bind(this)}*/}
            {/*onBlur={this.mentionBlur.bind(this)}*/}
            {/*multiLines={true}*/}
            {/*onChange ={this.MentionEditorChange.bind(this)}*/}
            {/*className={CommentStyles.mention}*/}
            {/*style={{ width: '100%',border:' none', outline: 'none', height: 48}}*/}
            {/*value={editText}*/}
            {/*suggestions={suggestions}*/}
            {/*/>*/}
            {/*<div className={CommentStyles.functionBar}>*/}
            {/*<div  className={CommentStyles.functionBar_left}>*/}
            {/*/!*<Icon type="copyright"  onClick={this.MentionSpacerClick.bind(this)}/>*!/*/}
            {/*<Tooltip title="该功能尚未上线，敬请期待">*/}
            {/*<span style={{fontSize: 16, color: '#8c8c8c'}}>@</span>*/}
            {/*</Tooltip>*/}
            {/*<Tooltip title="该功能尚未上线，敬请期待">*/}
            {/*<span><Icon type="smile-o" style={{marginTop: 10, color: '#8c8c8c'}}/></span>*/}
            {/*</Tooltip>*/}
            {/*<span></span>*/}
            {/*</div>*/}
            {/*<div  className={CommentStyles.functionBar_right}>*/}
            {/*<Button disabled={this.state.submitButtonDisabled} type={'primary'} style={{height:24,width: 58,marginRight: 12}} onClick={this.submitComment.bind(this)}>发布</Button>*/}
            {/*</div>*/}
            {/*</div>*/}
            {/*</div>*/}
          </div>
          {/*</Dragger>*/}
        </div>
      </div>
    )
  }
}

function mapStateToProps({
  projectDetailFile: {
    datas: {
      filePreviewCurrentFileId,
      filePreviewCommitPointNumber,
    }
  },
  projectDetail: {
    datas: {
      projectDetailInfoData = {},
    }
  }
}) {
  return {
    filePreviewCurrentFileId,
    filePreviewCommitPointNumber,
    projectDetailInfoData,
  }
}
