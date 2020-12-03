import React from 'react'
import {
  Card,
  Icon,
  Input,
  Button,
  Mention,
  Upload,
  Tooltip,
  Avatar
} from 'antd'
import CommentStyles from './Comment.less'
import {
  timestampToTimeNormal,
  judgeTimeDiffer_ten
} from '../../../../../../../utils/util'

const Dragger = Upload.Dragger

export default class CommentListItem extends React.Component {
  state = {
    closeNormal: true,
    isShowAll: false
  }
  showAll() {
    this.setState({
      isShowAll: !this.state.isShowAll
    })
  }
  boxOnMouseOver() {
    this.setState({
      closeNormal: false
    })
  }
  hideBeyond() {
    this.setState({
      closeNormal: true
    })
  }

  deleteComment(id, e) {
    e.stopPropagation()
    const {
      datas: { filePreviewCurrentFileId }
    } = this.props.model
    this.props.deleteCommit({
      id,
      file_id: filePreviewCurrentFileId,
      type: '1',
      point_number: this.props.point_number
    })
  }

  outFocus() {
    this.props.setMentionFocus(true)
  }
  outBlur() {
    this.props.setMentionFocus(false)
  }

  render() {
    const {
      datas: { filePreviewPointNumCommits = [] }
    } = this.props.model

    const { closeNormal } = this.state
    const listItem = value => {
      const { full_name, avatar, text, create_time } = value
      const pId = value.user_id
      const { id } = localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo'))
        : ''
      return (
        <div className={CommentStyles.commentListItem}>
          <div className={CommentStyles.left}>
            <Avatar
              src={avatar}
              icon="user"
              style={{ color: '#8c8c8c' }}
            ></Avatar>
          </div>
          <div className={CommentStyles.right}>
            <div>
              <div className={CommentStyles.full_name}>{full_name}</div>
              <div className={CommentStyles.text}>{text}</div>
            </div>
            <div className={CommentStyles.bott}>
              <div className={CommentStyles.create_time}>
                {create_time
                  ? timestampToTimeNormal(create_time, '', true)
                  : ''}
              </div>
              {pId === id && !judgeTimeDiffer_ten(create_time) ? (
                <div
                  className={CommentStyles.delete}
                  onClick={this.deleteComment.bind(this, value.id)}
                >
                  删除
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
      )
    }
    const filterIssues = data => {
      const { action } = data
      let container = ''
      let messageContainer = <div></div>
      switch (action) {
        case 'board.file.upload':
          messageContainer = <div>{`${data.creator.name} ${data.text}`}</div>
          break
        case 'board.file.version.upload':
          messageContainer = <div>{`${data.creator.name} ${data.text}`}</div>
          break
        case 'board.file.remove.recycle':
          messageContainer = <div>{`${data.creator.name} ${data.text}`}</div>
          break
        case 'board.folder.remove.recycle':
          messageContainer = <div>{`${data.creator.name} ${data.text}`}</div>
          break
        case 'board.file.move.to.folder':
          messageContainer = <div>{`${data.creator.name} ${data.text}`}</div>
          break
        case 'board.file.copy.to.folder':
          messageContainer = <div>{`${data.creator.name} ${data.text}`}</div>
          break
        case 'board.folder.add':
          messageContainer = <div>{`${data.creator.name} ${data.text}`}</div>
          break
        default:
          break
      }
      return messageContainer
    }
    return (
      <div
        className={CommentStyles.commentListItemBox}
        tabIndex="0"
        hideFocus="true"
        style={{ outline: 0, maxHeight: 126, overflowY: 'scroll' }}
        onBlur={this.outBlur.bind(this)}
        onFocus={this.outFocus.bind(this)}
      >
        <div>
          {this.props.model.datas.cardCommentAll.map((item, key) => {
            return <div key={key}>{filterIssues(item)}</div>
          })}
        </div>
        {/* <span style={{cursor: 'pointer', color: '#499BE6' }} onClick={this.showAll.bind(this)}>{!this.state.isShowAll?'查看全部':'收起部分'}</span> */}
        {filePreviewPointNumCommits.length > 20 ? (
          <div className={CommentStyles.commentListItemControl}>
            {closeNormal ? (
              <div>
                <Icon type="eye" />
              </div>
            ) : (
              <div>
                <Icon type="arrow-up" onClick={this.hideBeyond.bind(this)} />
              </div>
            )}
          </div>
        ) : (
          ''
        )}
        <div onMouseOver={this.boxOnMouseOver.bind(this)}>
          {filePreviewPointNumCommits.map((value, key) => {
            if (closeNormal && key > 19) {
              return false
            }
            return <div key={key}>{listItem(value)}</div>
          })}
        </div>
      </div>
    )
  }
}
