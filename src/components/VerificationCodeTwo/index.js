import React from 'react';
import { Button } from 'antd'
// let interval = null
// const initTimeValue = 60
// let initTime = initTimeValue

//参见登录界面验证码
export default class VerificationCodeTwo extends React.Component{

  constructor(props) {
    super(props)
  }
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
    if(this.state.buttonDisabled) {
      return false
    }

    that.setState({
      buttonDisabled: true,
    }, function () {
      this.props.getVerifyCode({
        calback: function () {
          const {initTimeValue } = that.state
          that.setState({
            interval: setInterval(function () {
              const { initTime } = that.state
              that.setState({
                initTime: initTime-1,
                initTimeText: initTime-1,
                buttonDisabled: true
              })
              if(initTime === 0) {
                that.setState({
                  initTime: initTimeValue,
                  initTimeText: '重新获取',
                  buttonDisabled: false,
                })
                if(that.state.interval!= null) {
                  clearInterval(that.state.interval)
                }
              }
            }, 1000)
          })
        }
      })
    })

    // this.props.getVerifyCode({
    //   calback:function () {
    //     console.log('22121')
    //     const {initTime, initTimeValue } = that.state
    //     that.setState({
    //       buttonDisabled: true,
    //     },function () {
    //       that.setState({
    //         interval: setInterval(function () {
    //           const { initTime } = that.state
    //           that.setState({
    //             initTime: initTime-1,
    //             initTimeText: initTime-1,
    //             buttonDisabled: true
    //           })
    //           if(initTime === 0) {
    //             that.setState({
    //               interval: null,
    //               initTime: initTimeValue,
    //               initTimeText: '重新获取',
    //               buttonDisabled: false,
    //             })
    //           }
    //         }, 1000)
    //       })
    //     })
    //
    //     // interval = setInterval(function () {
    //     //   initTime --
    //     //   that.setState({
    //     //     initTimeText: initTime,
    //     //     buttonDisabled: true
    //     //   })
    //     //   if(initTime === 0) {
    //     //     initTime = initTimeValue
    //     //     clearInterval(interval)
    //     //     that.setState({
    //     //       initTimeText: '重新获取',
    //     //       buttonDisabled: false,
    //     //     })
    //     //   }
    //     // }, 1000)
    //   }
    // })

  }
  render() {
    const { text, style, getVerifyCode } = this.props
    const buttonDisabled = this.state.buttonDisabled
    return (
      //,color: !buttonDisabled ? '#bfbfbf' : 'rgba(0,0,0,.25)'
      <div className={this.props.className} style={{...style, color: `${buttonDisabled?'#bfbfbf':''}`}} onClick={this.buttonClickAction.bind(this)}>{this.state.initTimeText}</div>
    //
    );
  }

};

VerificationCodeTwo.propTypes = {
};
