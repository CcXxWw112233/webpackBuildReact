import React from 'react'
import { Button } from 'antd'

export default class VerificationCode extends React.Component {
  state = {
    initTimeText: '获取验证码',
    buttonDisabled: false, //初始设置按钮是可以点击的
    interval: null,
    initTimeValue: 60,
    initTime: 60
  }

  buttonClick = () => {
    this.buttonClickAction()
  }
  buttonClickAction = () => {
    const that = this
    if (this.state.buttonDisabled) {
      return false
    }
    that.setState(
      {
        buttonDisabled: true
      },
      function() {
        this.props.getVerifyCode({
          calback: function() {
            const { initTimeValue } = that.state
            that.setState({
              interval: setInterval(function() {
                const { initTime } = that.state
                that.setState({
                  initTime: initTime - 1,
                  initTimeText: initTime - 1,
                  buttonDisabled: true
                })
                if (initTime === 0) {
                  that.setState({
                    initTime: initTimeValue,
                    initTimeText: '重新获取',
                    buttonDisabled: false
                  })
                  if (that.state.interval != null) {
                    clearInterval(that.state.interval)
                  }
                }
              }, 1000)
            })
          }
        })
      }
    )
  }
  render() {
    const { text, style, getVerifyCode, value_pass_check } = this.props
    const { buttonDisabled } = this.state
    return (
      <Button
        style={{
          ...style,
          color: !buttonDisabled ? 'rgba(0,0,0,.65)' : 'rgba(0,0,0,.25)'
        }}
        disabled={buttonDisabled || !value_pass_check}
        onClick={this.buttonClickAction.bind(this)}
      >
        {this.state.initTimeText}
      </Button>
    )
  }
}
VerificationCode.defaultProps = {
  getVerifyCode: function() {},
  value_pass_check: true //校验是否可以点击
}
VerificationCode.propTypes = {}
