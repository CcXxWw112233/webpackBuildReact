import React from 'react'
import { Button, Input, Upload, message, Icon } from 'antd'
import {
  REQUEST_DOMAIN,
  UPLOAD_FILE_SIZE
} from '../../../../../../globalset/js/constant'
import Cookies from 'js-cookie'
const TextArea = Input.TextArea

export default class Detail extends React.Component {
  state = {
    name: '编辑标题',
    description: '编辑信息',
    isInputEdit: false,
    isTextEdit: false
  }
  styles() {
    const {
      datas: { teamShowCertainOneShow = true }
    } = this.props.model
    const detailInfoOut = {
      width: '100%',
      position: 'relative'
    }
    const detaiInfo_middle = {
      marginTop: 16,
      fontSize: 24,
      height: 40,
      lineHeight: '40px'
    }
    const detailInfo_bott = {
      marginTop: 20,
      fontSize: 14,
      textAlign: 'left'
    }
    const operate = {
      height: 40,
      width: 'auto'
    }
    const operate_left = {}
    const operate_right = {}
    return {
      detailInfoOut,
      detaiInfo_middle,
      detailInfo_bott
    }
  }
  inputChange(e) {
    this.setState({
      name: e.target.value
    })
  }
  textAreaChange(e) {
    this.setState({
      description: e.target.value.replace(/\n/gim, '<br/>')
    })
  }
  setEdit({ name, value }, e) {
    this.setState({
      [name]: value
    })
  }
  render() {
    const that = this
    const { name, description, isInputEdit, isTextEdit } = this.state
    const {
      detailInfoOut,
      detailInfo,
      detailInfo_top,
      detaiInfo_middle,
      detailInfo_bott,
      operate,
      operate_left,
      operate_right
    } = this.styles()

    return (
      <div style={{ ...detailInfoOut }}>
        {isInputEdit ? (
          <Input
            onBlur={this.setEdit.bind(this, {
              name: 'isInputEdit',
              value: false
            })}
            autoFocus
            style={{ ...detaiInfo_middle, textAlign: 'center' }}
            value={name}
            onChange={this.inputChange.bind(this)}
            maxLength={28}
          />
        ) : (
          <div
            onClick={this.setEdit.bind(this, {
              name: 'isInputEdit',
              value: true
            })}
            style={{ ...detaiInfo_middle }}
          >
            {name}
          </div>
        )}
        {isTextEdit ? (
          <TextArea
            autoFocus
            onBlur={this.setEdit.bind(this, {
              name: 'isTextEdit',
              value: false
            })}
            style={{ ...detailInfo_bott }}
            value={description}
            onChange={this.textAreaChange.bind(this)}
            autosize
          />
        ) : (
          <div
            onClick={this.setEdit.bind(this, {
              name: 'isTextEdit',
              value: true
            })}
            style={{ ...detailInfo_bott }}
            dangerouslySetInnerHTML={{ __html: description }}
          ></div>
        )}
        <div style={{ ...operate }}>
          <div style={{ ...operate_left }}>
            <Icon type="down" theme="outlined" />
          </div>
          <div style={{ ...operate_right }}>
            <Icon type="delete" theme="outlined" />
          </div>
        </div>
      </div>
    )
  }
}
