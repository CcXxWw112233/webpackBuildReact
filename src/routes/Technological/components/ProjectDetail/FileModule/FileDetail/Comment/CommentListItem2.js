import React from 'react'
import { Icon, Upload, Avatar } from 'antd'
import CommentStyles from './Comment2.less'
import {
  timestampToTimeNormal,
  judgeTimeDiffer,
  judgeTimeDiffer_ten
} from '../../../../../../../utils/util'
import { connect } from 'dva'

@connect(mapStateToProps)
export default class CommentListItem extends React.Component {
  state = {
    closeNormal: true,
    isShowAll: false
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

  deleteComment(id) {
    const { filePreviewCurrentFileId, dispatch } = this.props
    this.props.deleteCommitSet()
    dispatch({
      type: 'projectDetailFile/deleteCommit',
      payload: {
        id,
        file_id: filePreviewCurrentFileId
      }
    })
  }

  commitClicShowEdit(data) {
    this.props.commitClicShowEdit(data)
  }
  showAll() {
    this.setState({
      isShowAll: !this.state.isShowAll
    })
  }
  render() {
    const { filePreviewCommits = [], cardCommentAll = [] } = this.props

    const { closeNormal } = this.state
    const listItem = value => {
      const { full_name, avatar, text, create_time, flag, type } = value
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
              <div className={CommentStyles.full_name}>
                {full_name}
                {type == '1' ? (
                  <span style={{ marginLeft: 6 }}>评论了</span>
                ) : (
                  ''
                )}
                {type == '1' ? (
                  <span
                    className={CommentStyles.full_name_quan}
                    onClick={this.commitClicShowEdit.bind(this, value)}
                  >
                    圈点{flag}
                  </span>
                ) : (
                  ''
                )}
              </div>
              <div className={CommentStyles.text}>{text}</div>
            </div>
            <div className={CommentStyles.bott}>
              <div className={CommentStyles.create_time}>
                {timestampToTimeNormal(create_time, '', true)}
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
      const { action, create_time } = data
      let container = ''
      let messageContainer = <div></div>
      switch (action) {
        case 'board.file.upload':
          messageContainer = (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>{`${data.creator.name} ${data.text}`}</div>
              <div style={{ color: '#BFBFBF', fontSize: '12px' }}>
                {judgeTimeDiffer(create_time)}
              </div>
            </div>
          )
          break
        case 'board.file.version.upload':
          messageContainer = (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>{`${data.creator.name} ${data.text}`}</div>
              <div style={{ color: '#BFBFBF', fontSize: '12px' }}>
                {judgeTimeDiffer(create_time)}
              </div>
            </div>
          )
          break
        case 'board.file.remove.recycle':
          messageContainer = (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>{`${data.creator.name} ${data.text}`}</div>
              <div style={{ color: '#BFBFBF', fontSize: '12px' }}>
                {judgeTimeDiffer(create_time)}
              </div>
            </div>
          )
          break
        case 'board.folder.remove.recycle':
          messageContainer = (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>{`${data.creator.name} ${data.text}`}</div>
              <div style={{ color: '#BFBFBF', fontSize: '12px' }}>
                {judgeTimeDiffer(create_time)}
              </div>
            </div>
          )
          break
        case 'board.file.move.to.folder':
          messageContainer = (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>{`${data.creator.name} ${data.text}`}</div>
              <div style={{ color: '#BFBFBF', fontSize: '12px' }}>
                {judgeTimeDiffer(create_time)}
              </div>
            </div>
          )
          break
        case 'board.file.copy.to.folder':
          messageContainer = (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>{`${data.creator.name} ${data.text}`}</div>
              <div style={{ color: '#BFBFBF', fontSize: '12px' }}>
                {judgeTimeDiffer(create_time)}
              </div>
            </div>
          )
          break
        case 'board.folder.add':
          messageContainer = (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>{`${data.creator.name} ${data.text}`}</div>
              <div style={{ color: '#BFBFBF', fontSize: '12px' }}>
                {judgeTimeDiffer(create_time)}
              </div>
            </div>
          )
          break
        default:
          break
      }
      return messageContainer
    }
    return (
      <div className={CommentStyles.commentListItemBox}>
        <div>
          {cardCommentAll.map((item, key) => {
            return filterIssues(item)
          })}
        </div>
        <span
          style={{ cursor: 'pointer', color: '#499BE6' }}
          onClick={this.showAll.bind(this)}
        >
          {!this.state.isShowAll ? '查看全部' : '收起部分'}
        </span>
        {filePreviewCommits.length > 20 ? (
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
          {filePreviewCommits.map((value, key) => {
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

function mapStateToProps({
  projectDetailFile: {
    datas: {
      filePreviewCurrentFileId,
      filePreviewCommits = [],
      cardCommentAll = []
    }
  }
}) {
  return {
    filePreviewCurrentFileId,
    filePreviewCommits,
    cardCommentAll
  }
}
