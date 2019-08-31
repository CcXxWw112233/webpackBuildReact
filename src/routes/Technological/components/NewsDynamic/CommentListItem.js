import React from 'react';
import { Card, Icon, Input, Button, Mention, Upload, Tooltip } from 'antd'
import CommentStyles from './Comment.less'

const Dragger = Upload.Dragger

export default class CommentListItem extends React.Component {
  state = {
    closeNormal: true, //伸缩内容
  }

  boxOnMouseOver() {
    this.setState({
      closeNormal: false
    })
  }
  hideBeyond(){
    this.setState({
      closeNormal: true
    })
  }


  render() {

    const { datas: { projectDetailInfoData = {}, cardCommentList = [] } } = this.props.model

    const { closeNormal } = this.state
    const listItem = (value) => (
      <div className={CommentStyles.commentListItem}>
        <div><span>{value.text}</span></div>
        <div>{value.createTime?value.createTime.substring(0, 16): ''}</div>
      </div>
    )
    return (
      <div className={CommentStyles.commentListItemBox}>
        {cardCommentList.length > 20 ?(
          <div className={CommentStyles.commentListItemControl}>
            {closeNormal?(
              <div>
                <Icon type="eye" />
              </div>
            ):(
              <div>
                <Icon type="arrow-up" onClick={this.hideBeyond.bind(this)}/>
              </div>
            )}
          </div>
        ) : ('')}
        <div onMouseOver={this.boxOnMouseOver.bind(this)}>
          {cardCommentList.map((value, key) => {
            if(closeNormal && key > 19) {
              return false
            }
            return (
              <div key={key}>
                {listItem(value)}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}


