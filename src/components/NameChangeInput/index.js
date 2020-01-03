import React from 'react';
import { Input, message } from 'antd'
const TextArea = Input.TextArea

//该组件用来封装点击input修改名称
export default class NameChangeInput extends React.Component{

  constructor(props) {
    super(props)
  }

  state = {
    localName: '',
  }
  componentWillMount () {
    //设置默认项目名称
    this.initSet(this.props)
  }
  componentWillReceiveProps (nextProps) {
    this.initSet(nextProps)
  }
  //初始化根据props设置state
  initSet(props) {
    const { goldName } = props
    this.setState({
      localName: goldName
    })
  }

  //input
  inputLocalNameChange(e) {
    this.setState({
      localName: e.target.value
    })
  }
  inputonPressEnter(e) {
    const { localName } = this.state
    const { goldName } = this.props
    this.props.setIsEdit && this.props.setIsEdit()
    if(localName == goldName) {
      return false
    }
    this.props.onPressEnter && this.props.onPressEnter(e)
  }
  inputonBlur(e) {
    const { localName } = this.state
    const { goldName } = this.props
    this.props.setIsEdit && this.props.setIsEdit()
    if(localName == goldName) {
      return false
    }
    this.props.onBlur && this.props.onBlur(e)
  }

  //textarea
  textAreaChange(e) {
    let val = e.target.value
    if (val.length > 100) {
      message.error("标题字符数最大限制为100字")
      this.setState({
        isOverFlowText: true, // 是否超出最大字数
      })
    } else {
      this.setState({
        localName: e.target.value,
        isOverFlowText: false
      })
    }
  }
  textAreaBlur(e) {
    const value = e.target.value
    const { goldName } = this.props
    this.props.setIsEdit && this.props.setIsEdit(e)
    if(value == goldName) {
      return false
    }
    if(!value) {
      this.setState({
        localName: goldName
      })
      return false
    }
    if (this.state.isOverFlowText) return
    this.props.onBlur && this.props.onBlur(e)
  }
  textAreaClick(e) {
    this.props.onClick && this.props.onClick(e)
  }

  render() {

    const { localName, isOverFlowText } = this.state
    const { nodeName, className, autoFocus = true, autosize = true, goldName, onBlur, onPressEnter, onChange, style={}, size, onClick, maxLength = 30 } = this.props

    return (
      <div style={{ width: '100%'}}>
        {
          nodeName == 'input'? (
            <Input value={localName}
                   className={className}
                   size={size}
                   autoFocus={autoFocus}
                   onChange={this.inputLocalNameChange.bind(this)}
                   onPressEnter={this.inputonPressEnter.bind(this)}
                   onBlur={this.inputonBlur.bind(this)}
                   style={{...style}}
            />
          ) :(
            <TextArea value={localName}
                      className={className}
                      autosize={autosize}
                      onChange={this.textAreaChange.bind(this)}
                      onBlur={this.textAreaBlur.bind(this)}
                      onClick={this.textAreaClick.bind(this)}
                      autoFocus={autoFocus}
                      size={size}
                      maxLength={maxLength}
                      style={{...style, width: '100%', boxShadow: isOverFlowText ? '0px 0px 8px 0px rgba(245,34,45,0.8)' : style.boxShadow && style.boxShadow}}
            />
          )
        }
      </div>
    );
  }

};

NameChangeInput.propTypes = {
};
