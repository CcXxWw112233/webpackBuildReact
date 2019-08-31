import React from 'react';
import { Card, Icon, Input, Button, Mention, Upload, Tooltip, message } from 'antd'
import indexStyles from './index.less'
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'
import Cookies from 'js-cookie'

const { toString, toContentState, Nav } = Mention;

// const TextArea = Input.TextArea
const Dragger = Upload.Dragger

export default class CommentMention extends React.Component {
  state = {
    editText: toContentState(''),
    submitButtonDisabled: true,
    selectUserIds: [], //已选择的用户id
    selectUsers: [], //已选用户名称或（名称+手机号||email)组合
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
    const { editText } = this.state
    this.props.submitComment && this.props.submitComment(editText)
    this.mentionGetUsersToDo(editText)
    this.setState({
      editText: toContentState(''),
      submitButtonDisabled: true,
    })
  }
  onSelect(value) {
    const { users } = this.props
    let { selectUserIds = [], selectUsers = [] } = this.state
    for(let i = 0; i < users.length; i ++) {
      if(value.indexOf('~') != -1) { //如果存在同名的情况下，value 为name~mobile || name~email
        const nameArr = value.split('~')
        const name = nameArr[0]
        const mobileEmail = nameArr[1]
        if(users[i].name == name && (users[i].mobile == mobileEmail || users[i].email == mobileEmail )) {
          selectUserIds.push(users[i].user_id)
        }
      }else {
        if(users[i].name == value) {
          selectUserIds.push(users[i].user_id)
        }
      }
    }
    selectUsers.push(value.replace('@', ''))

    selectUsers = Array.from(new Set(selectUsers))
    selectUserIds = Array.from(new Set(selectUserIds)) //这里包含了已选的和重新选的 ，已删除的还去掉
    this.setState({
      selectUserIds,
      selectUsers
    })

  }
  mentionGetUsersToDo(editText){
    const str = toString(editText)
    const { users} = this.props
    const reg = /\@.*?\s/gim
    let arr = str.match(reg) // =>  ["@严世威 ", "@王馨潼 ", "@董凯颖~13763053607 "]
    let arr_2 = [] // 目标输出=>  ["严世威", "王馨潼", "董凯颖~13763053607"]
    if(arr) {
      for(let val of arr) {
        if(val) {
          arr_2.push(val.replace(/(^\s*)|(\s*$)/g, "").replace('@', ''))
        }
      }
    }

    //根据名字和手机号||email去匹配id
    let selectUserIds = []
    for(let val of arr_2) {
      for(let i = 0; i < users.length; i ++) {
        if(val.indexOf('~') != -1) { //如果存在同名的情况下，value 为name~mobile || name~email
          const nameArr = val.split('~')
          const name = nameArr[0]
          const mobileEmail = nameArr[1]
          if(users[i].name == name && (users[i].mobile == mobileEmail || users[i].email == mobileEmail )) {
            selectUserIds.push(users[i].user_id)
          }
        }else {
          if(users[i].name == val) {
            selectUserIds.push(users[i].user_id)
          }
        }
      }

    }
    selectUserIds = Array.from(new Set(selectUserIds))
    if (selectUserIds.length) {
      const obj = {
        user_id: selectUserIds.join(','),
        text: str
      }
      // console.log('sd',obj)
      //  这里调用发布 @动态信息接口
      this.props.commentToDynamics && this.props.commentToDynamics(obj)
    }
  }

  mentionFocus(e) {
    this.props.setMentionFocus && this.props.setMentionFocus(true)
  }
  mentionBlur(e) {
    this.props.setMentionFocus && this.props.setMentionFocus(false)

  }

  render() {

    const { editText, selectUserIds, selectUsers } = this.state
    const { users = [] } = this.props
    //将名字添加进数组， 如果有相同的名称则用手机号或者email区分
    let suggestions = []

    if(users.length) {
       suggestions = new Array(users.length)
      for(let i = 0; i <users.length; i++) {
        let value = users[i].name
        for(let j = 0; j < users.length; j ++ ) {
          if(users[i].name == users[j].name && users[i].user_id !== users[j].user_id) {
            value = `${users[i].name}~${users[i].mobile || users[i].email}`
            break
          }
        }
        suggestions[i] = <Nav children={value} value={value} />
      }
    }


    return (
      <div className={indexStyles.comment}>
        {/*<textarea minrows = {1}  maxrows = {6}  className={CommentStyles.textArea}></textarea>*/}
        <Mention
          onFocus={this.mentionFocus.bind(this)}
          onBlur={this.mentionBlur.bind(this)}
          multiLines={true}
          onChange ={this.MentionEditorChange.bind(this)}
          // onSelect = {this.onSelect.bind(this)}
          className={indexStyles.mention}
          style={{ width: '100%', border: ' none', outline: 'none', height: 48}}
          value={editText}
          suggestions={suggestions}
        />
        <div className={indexStyles.functionBar}>
          <div className={indexStyles.functionBar_left}>
            {/*<Icon type="copyright"  onClick={this.MentionSpacerClick.bind(this)}/>*/}
            <Tooltip title="该功能尚未上线，敬请期待">
              <span style={{fontSize: 16, color: '#8c8c8c'}}>@</span>
            </Tooltip>
            <Tooltip title="该功能尚未上线，敬请期待">
              <span><Icon type="smile-o" style={{marginTop: 10, color: '#8c8c8c'}}/></span>
            </Tooltip>
            <span></span>
          </div>
          <div className={indexStyles.functionBar_right}>
            <Button disabled={this.state.submitButtonDisabled} type={'primary'} style={{height: 24, width: 58, marginRight: 12}} onClick={this.submitComment.bind(this)}>发布</Button>
          </div>
        </div>
      </div>

    )
  }
}


