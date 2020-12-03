import React, { Component } from 'react'
import { connect } from 'dva'
import { Input, message } from 'antd'
import indexStyles from '../index.less'
import {
  validateTel,
  validateEmail,
  validatePassword,
  validateFixedTel,
  validateIdCard,
  validateChineseName,
  validatePostalCode,
  validateWebsite,
  validateQQ,
  validatePositiveInt,
  validateNegative,
  validateTwoDecimal
} from '../../../../../utils/verify'
import { updateUserStorage } from '../../handleOperateModal'
import { isObjectValueEqual } from '../../../../../utils/util'

@connect(mapStateToProps)
export default class BeginningStepOne_one extends Component {
  constructor(props) {
    super(props)
    this.state = {
      verificationIsTrue: true //是否校验成功
    }
  }

  componentWillReceiveProps(nextProps) {
    if (isObjectValueEqual(nextProps, this.props)) return
    const { itemValue = {} } = nextProps
    const { value, verification_rule } = itemValue
    if (!value) return
    this.setState({
      verificationIsTrue: this.validate(verification_rule, value)
    })
  }

  updateEdit = (data, key) => {
    const { itemKey, parentKey, processEditDatas = [] } = this.props
    const { forms = [] } = processEditDatas[parentKey]
    forms[itemKey][key] = data.value
    this.props.updateCorrespondingPrcodessStepWithNodeContent &&
      this.props.updateCorrespondingPrcodessStepWithNodeContent('forms', forms)
    if (data.update_storage) {
      updateUserStorage({ forms: forms })
    }
  }

  defaultValueChange(e, verification_rule) {
    const { itemValue } = this.props
    const { val_min_length, val_max_length } = itemValue
    if (e.target.value.trimLR() == '') {
      this.updateEdit({ value: '' }, 'value')
      return
    }
    // if (verification_rule == '') {
    //   if (e.target.value.length < val_min_length) {
    //     // message.warn(`最少不能少于${val_min_length}字`)
    //     return
    //   }
    //   else if (e.target.value.length > val_min_length && e.target.value.length < val_max_length) {
    //     this.setState({
    //       verificationIsTrue: this.validate(verification_rule, e.target.value)
    //     })
    //     this.updateEdit({ value: e.target.value }, 'value')
    //     return
    //   }
    //   else if (e.target.value.length > val_max_length) {
    //     // message.warn(`最多不能超过${val_max_length}字`)
    //     return
    //   }
    // }
    this.setState({
      verificationIsTrue: this.validate(verification_rule, e.target.value)
    })

    this.updateEdit({ value: e.target.value }, 'value')
  }

  handleOnBlur = (e, verification_rule) => {
    const { itemValue } = this.props
    const { val_min_length, val_max_length } = itemValue
    if (e.target.value.trimLR() == '') {
      this.updateEdit({ value: '', update_storage: true }, 'value')
      return
    }
    // if (verification_rule == '') {
    //   if (e.target.value.length < val_min_length) {
    //     message.warn(`最少不能少于${val_min_length}字`)
    //   } else if (e.target.value.length > val_min_length && e.target.value.length < val_max_length) {
    //     this.setState({
    //       verificationIsTrue: this.validate(verification_rule, e.target.value)
    //     })
    //     this.updateEdit({ value: e.target.value }, 'value')
    //     return
    //   } else if (e.target.value.length > val_max_length) {
    //     message.warn(`最多不能超过${val_max_length}字`)
    //     return
    //   }
    // }
    this.setState({
      verificationIsTrue: this.validate(verification_rule, e.target.value)
    })

    this.updateEdit({ value: e.target.value, update_storage: true }, 'value')
  }

  validate(verification_rule, value) {
    let valiResult
    const { itemValue } = this.props
    const { val_min_length, val_max_length } = itemValue
    switch (verification_rule) {
      case '':
        if (value) {
          if (val_min_length && val_max_length) {
            // 表示限制了最小长度以及最大长度
            if (
              value.length >= val_min_length &&
              value.length <= val_max_length
            ) {
              valiResult = true
            } else {
              valiResult = false
            }
          } else if (val_min_length && !val_max_length) {
            // 表示只限制了最小长度
            if (value.length >= val_min_length) {
              valiResult = true
            } else {
              valiResult = false
            }
          } else if (val_max_length && !val_min_length) {
            // 表示只限制了最大长度
            if (value.length <= val_max_length) {
              valiResult = true
            } else {
              valiResult = false
            }
          } else if (!val_min_length && !val_max_length) {
            // 表示什么都没有限制的时候
            valiResult = true
          }
        } else if (!value) {
          valiResult = false
        }
        break
      case 'mobile':
        valiResult = validateTel(value)
        break
      case 'tel':
        valiResult = validateFixedTel(value)
        break
      case 'ID_card':
        valiResult = validateIdCard(value)
        break
      case 'chinese_name':
        valiResult = validateChineseName(value)
        break
      case 'url':
        valiResult = validateWebsite(value)
        break
      case 'qq':
        valiResult = validateQQ(value)
        break
      case 'postal_code':
        valiResult = validatePostalCode(value)
        break
      case 'positive_integer':
        valiResult = validatePositiveInt(value)
        break
      case 'negative':
        valiResult = validateNegative(value)
        break
      case 'two_decimal_places':
        valiResult = validateTwoDecimal(value)
        break
      default:
        valiResult = true
        break
    }
    return valiResult
  }

  filterVerificationName = verification_rule => {
    let name = '不限格式'
    switch (verification_rule) {
      case '':
        debugger
        name = ''
        break
      case 'mobile':
        name = '手机号码'
        break
      case 'tel':
        name = '座机'
        break
      case 'ID_card':
        name = '身份证'
        break
      case 'chinese_name':
        name = '中文名'
        break
      case 'url':
        name = '网址'
        break
      case 'qq':
        name = 'qq号码'
        break
      case 'postal_code':
        name = '邮政编码'
        break
      case 'positive_integer':
        name = '正整数'
        break
      case 'negative':
        name = '负数'
        break
      case 'two_decimal_places':
        name = '精确到两位小数'
        break
      default:
        name = ''
        break
    }
    return name
  }

  filterVerificationTips = verification_rule => {
    let tips = '不限格式'
    const { itemValue } = this.props
    const { val_min_length, val_max_length, value } = itemValue
    switch (verification_rule) {
      case '':
        tips = ''
        if (value) {
          if (val_min_length && val_max_length) {
            // 表示限制了最小长度以及最大长度
            if (value.length < val_min_length) {
              // valiResult = true
              tips = `字符长度不能小于${val_min_length}`
            } else if (value.length > val_max_length) {
              tips = `字符长度不能大于${val_max_length}`
            }
          } else if (val_min_length && !val_max_length) {
            // 表示只限制了最小长度
            if (value.length > val_min_length) {
              // valiResult = true
              tips = `字符长度不能大于${val_min_length}`
            }
          } else if (val_max_length && !val_min_length) {
            // 表示只限制了最大长度
            if (value.length > val_max_length) {
              // valiResult = true
              tips = `字符长度不能大于${val_max_length}`
            }
          } else if (!val_min_length && !val_max_length) {
            // 表示什么都没有限制的时候
            // valiResult = true
          }
        } else if (!value) {
          // valiResult = false
        }
        break
      case 'mobile':
        tips = '请输入正确的手机号码'
        break
      case 'tel':
        tips = '请输入正确的座机号码'
        break
      case 'ID_card':
        tips = '请输入正确的身份证号码'
        break
      case 'chinese_name':
        tips = '请输入2-6位的中文名'
        break
      case 'url':
        tips = '请输入正确的网址'
        break
      case 'qq':
        tips = '请输入正确的qq号码'
        break
      case 'postal_code':
        tips = '请输入正确的邮政编码'
        break
      case 'positive_integer':
        tips = '请输入正整数'
        break
      case 'negative':
        tips = '请输入负数'
        break
      case 'two_decimal_places':
        tips = '精确到两位小数'
        break
      default:
        tips = ''
        break
    }
    return tips
  }

  render() {
    const { verificationIsTrue } = this.state
    const { itemValue, FormCanEdit } = this.props
    const {
      title,
      prompt_content,
      is_required,
      value,
      val_min_length,
      val_max_length,
      verification_rule
    } = itemValue
    return (
      <div className={indexStyles.text_form}>
        {/* {
          !FormCanEdit && (
            <div style={{position: 'absolute',top: '0',bottom: '0',left: '0',right: '0',margin: 'auto',zIndex:1}}></div>
          )
        } */}
        <p>
          <span>
            {title}
            {verification_rule == '' ? (
              ''
            ) : (
              <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: '12px' }}>
                &nbsp;[{this.filterVerificationName(verification_rule)}]
              </span>
            )}
            :&nbsp;&nbsp;
            {is_required == '1' && <span style={{ color: '#F5222D' }}>*</span>}
          </span>
          {
            <span
              style={{
                color: '#F5222D',
                display: verificationIsTrue || value == '' ? 'none' : 'block'
              }}
            >
              {this.filterVerificationTips(verification_rule)}
            </span>
          }
        </p>

        <div className={indexStyles.text_fillOut}>
          <div className={indexStyles.prompt_content}>
            <Input
              maxLength={200}
              style={{
                minHeight: '32px',
                border:
                  verificationIsTrue || value == '' ? '' : '1px solid #F5222D',
                overflow: 'hidden',
                resize: 'none'
              }}
              placeholder={prompt_content}
              value={value}
              onChange={e => {
                this.defaultValueChange(e, verification_rule)
              }}
              onBlur={e => {
                this.handleOnBlur(e, verification_rule)
              }}
            />
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps({
  publicProcessDetailModal: { processEditDatas = [] }
}) {
  return { processEditDatas }
}
