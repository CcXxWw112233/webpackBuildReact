import React from 'react';
import { Card, Icon, Input, Button, Mention, Upload, Tooltip, message } from 'antd'
import CommentStyles from './Comment2.less'
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'
const { toString, toContentState } = Mention;

// const TextArea = Input.TextArea
const Dragger = Upload.Dragger

export default class Comment extends React.Component {
  state = {
    editText: toContentState(''),
    text: '',
    submitButtonDisabled: true
  }
  componentDidMount() {
    // this.props.getWorkFlowComment({
    //   flow_instance_id: this.props.model.datas.totalId.flow
    // })
    // console.log('ssss', 11111)
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
  submitComment() {
    const { commentUseParams = {} } = this.props
    const { commentSubmitPost } = commentUseParams
    const { text } = this.state
    commentSubmitPost && commentSubmitPost({text})
  }
  stopUp(e) {
    e.stopPropagation()
  }
  texAreaChange(e) {
    this.setState({
      text: e.target.value
    })
  }
  async handlerMultiEnter(e) {
    let code = e.keyCode;
    let ctrl = e.ctrlKey;
    let shift = e.shiftKey;
    let alt = e.altKey;
    if(code == '10' && ctrl && !shift && !alt) {
      //ctrl + enter
      // return;
    }
    if(code == '13' && !ctrl && shift && !alt) {
      //shift + enter
      // return;
    }
    if(code == '13' && !ctrl && !shift && !alt) {
      const { text } = this.state
      if(!text) {
        return
      }
      //只按了enter
      //执行发言
      this.submitComment()
      this.setState({
        text: ''
      })
    }
  }

  render() {
    const { editText } = this.state
    const { projectDetailInfoData = {} } = this.props
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
    return (
      <div className={CommentStyles.out} tabIndex="0" hideFocus={true} style={{outline: 0, }} onClick={this.stopUp.bind(this)} onMouseDown={this.stopUp.bind(this)}>
        <div>
          {avatar?(
            <img src={avatar} className={CommentStyles.avartarImg} style={{width: leftSpaceDivWH, height: leftSpaceDivWH}} />
          ): (
            <div style={{width: 26, height: 26, borderRadius: 26, backgroundColor: '#f5f5f5', textAlign: 'center'}}>
              <Icon type={'user'} style={{fontSize: 16, marginTop: 4, color: '#8c8c8c'}}/>
            </div>
          )}
        </div>
        {/*<Dragger {...props} >*/}
        <div className={CommentStyles.right}>
          <div className={CommentStyles.comment}>
            <textarea value={this.state.text} onChange={this.texAreaChange.bind(this)} minRows = {1} onKeyDown={this.handlerMultiEnter.bind(this)} maxRows = {1} className={CommentStyles.textArea}></textarea>
          </div>
        </div>
        {/*</Dragger>*/}
      </div>

    )
  }
}


