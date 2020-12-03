import React, { Component } from 'react'
import { Input } from 'antd'
import glabalStyles from '@/globalset/css/globalClassName.less'
import styles from '../index.less'
import { validateTel, validateEmail } from '@/utils/verify.js'

export default class InputExport extends Component {
  state = {
    timer: null,
    phone_val_verify: '', // 手机号的验证
    email_val_verify: '', // 邮箱的验证
    is_show_ok_tips: 'none', // 是否显示小图标 默认为none不显示
    is_show_error_tips: 'none' // 是否显示小图标 默认为none不显示
  }

  /**
   * 输入框onChange事件
   * 输入手机号或者邮箱进行校验,来控制提示图标的显示隐藏
   * 想要在父组件中能够获取到子组件的onChange事件
   * 来判断输入的变化
   * 应该是直接修改父组件中的inputList的value
   * 当只要有变化的时候, 就显示发送邀请,
   * 当验证失败的时候, 禁用状态
   * @param {Object} e 事件对象
   */
  chgVal(e, index) {
    //console.log(e.target.value, 'ssssss')
    let val = e.target.value
    let phone_val_verify = validateTel(val)
    let email_val_verify = validateEmail(val)
    // 当输入了7个字符之后才开始校验
    if (val.length >= 7) {
      this.setState({
        phone_val_verify: phone_val_verify,
        email_val_verify: email_val_verify
      })
      if (phone_val_verify || email_val_verify) {
        // 如果验证成功,
        this.setState({
          is_show_ok_tips: 'block',
          is_show_error_tips: 'none'
        })
      } else {
        // 验证失败
        this.setState({
          is_show_error_tips: 'block',
          is_show_ok_tips: 'none'
        })
      }
    } else {
      this.setState({
        is_show_error_tips: 'none',
        is_show_ok_tips: 'none'
      })
    }

    // 调用该方法修改父组件中inputList中的对应输入框的value值
    this.props.updateParentState(val, index, phone_val_verify, email_val_verify)
  }

  /**
   * 想要实现, 当获取焦点的时候, 判断当前的输入框是否是最后一个,
   * 如果是,就追加一条
   * 如果不是, 就保留
   * 想要定义一个方法,然后可以修改父组件中的数据
   * @param {Object} e 事件对象
   * @param {Number} index 当前输入框的下标
   */
  onFocus(e, index) {
    // console.log(index, 'sss')
    const { inputList } = this.props
    if (index == inputList.length - 1) {
      this.props.handleAddOneTips()
    }
  }

  render() {
    // console.log(this.props, 'sssss')
    const { index, all_input_val } = this.props
    const {
      is_show_ok_tips,
      is_show_error_tips,
      phone_val_verify,
      email_val_verify
    } = this.state
    // console.log(all_phone_verify, 'sssss_phone')
    // console.log(all_email_verify, 'sssss_email')

    return (
      <div
        style={{
          borderBottom: 1,
          borderBottomStyle: 'solid',
          borderColor: 'rgba(0,0,0,0.25)',
          marginBottom: 32
        }}
      >
        <div style={{ position: 'relative' }}>
          <Input
            key={index}
            onFocus={e => {
              this.onFocus(e, index)
            }}
            onChange={e => {
              this.chgVal(e, index)
            }}
            placeholder="(选填)"
          />
          {phone_val_verify || email_val_verify ? (
            <span
              style={{ display: is_show_ok_tips }}
              className={`${styles.proof} ${styles.check}`}
            >
              <i className={`${glabalStyles.authTheme}`}>&#xe783;</i>
              <b style={{ display: 'inline-block', marginLeft: 5 }}>格式正确</b>
            </span>
          ) : (
            <span
              style={{ display: is_show_error_tips }}
              className={`${styles.proof} ${styles.error}`}
            >
              <i className={`${glabalStyles.authTheme}`}>&#xe77e;</i>
              <b style={{ display: 'inline-block', marginLeft: 5 }}>格式错误</b>
            </span>
          )}
        </div>
      </div>
    )
  }
}
