import React from 'react';
import { Button } from 'antd'
let interval = null
let initTime = 60

export default class VerificationCode extends React.Component{

  constructor(props) {
    super(props)
  }
  state = {
    initTimeText: '获取验证码',
    buttonDisabled: false, //初始设置按钮是可以点击的
  }

  buttonClick = () => {
    this.buttonClickAction()
  }
  buttonClickAction = () => {
    const that = this
    this.setState({
      initTimeText: --initTime,
      buttonDisabled: true
    })
    interval = setInterval(function () {
      initTime --
      that.setState({
        initTimeText: initTime,
        buttonDisabled: true
      })
      if(initTime === 0) {
        initTime = 60
        clearInterval(interval)
        that.setState({
          initTimeText: '重新获取',
          buttonDisabled: false,
        })
      }
    }, 1000)
  }
  render() {
    const { text, style, getVerifyCode } = this.props
    const buttonDisabled = this.state.buttonDisabled
    return (
      <Button style={{...style, color: !buttonDisabled ? 'rgba(0,0,0,.65)' : 'rgba(0,0,0,.25)', }} disabled={this.state.buttonDisabled} onClick={getVerifyCode.bind(null, this.buttonClick)}>{this.state.initTimeText}</Button>
    );
  }

};

VerificationCode.propTypes = {
};
