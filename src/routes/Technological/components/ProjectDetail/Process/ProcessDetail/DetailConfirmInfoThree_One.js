import React from 'react'
import { Input } from 'antd'
import indexStyles from './index.less'
import { validateTel, validateEmail, validatePassword, validateFixedTel, validateIdCard, validateChineseName, validatePostalCode, validateWebsite, validateQQ, validatePositiveInt, validateNegative, validateTwoDecimal, } from '../../../../../../utils/verify'

export default class DetailConfirmInfoThreeOne extends React.Component {
  state={
    verificationIsTrue: true, //是否校验成功
  }
  updateEdit(data, key) {
    const { itemKey, parentItemKey } = this.props
    const { datas: { processEditDatas = [], } } = this.props.model
    const { form_data=[] } = processEditDatas[parentItemKey]
    form_data[itemKey][key] = data.value
    this.props.updateDatasProcess({
      processEditDatas
    })
  }
  validate(verification_rule, value) {
    let valiResult
    switch (verification_rule) {
      case '':
        valiResult = true
        break;
      case 'mobile':
        valiResult = validateTel(value)
        break;
      case 'tel':
        valiResult =validateFixedTel(value)
        break;
      case 'ID_card':
        valiResult = validateIdCard(value)
        break;
      case 'chinese_name':
        valiResult = validateChineseName(value)
        break;
      case 'url':
        valiResult = validateWebsite(value)
        break;
      case 'qq':
        valiResult =validateQQ(value)
        break;
      case 'postal_code':
        valiResult = validatePostalCode(value)
        break;
      case 'positive_integer':
        valiResult = validatePositiveInt(value)
        break;
      case 'negative':
        valiResult = validateNegative(value)
        break;
      case 'two_decimal_places':
        valiResult = validateTwoDecimal(value)
        break;
      default:
        valiResult = true
        break
    }
    return valiResult
  }
  defaultValueChange(verification_rule, e) {
    this.setState({
      verificationIsTrue: this.validate(verification_rule, e.target.value)
    })

    this.updateEdit({value: e.target.value}, 'default_value')
  }
  render() {
    const { verificationIsTrue } = this.state
    const { datas: { processEditDatas = [] } } = this.props.model
    const { itemKey, parentItemKey, FormCanEdit } = this.props
    const { form_data=[] } = processEditDatas[parentItemKey]
    const { property_name, default_value, verification_rule, val_length, is_required, } = form_data[itemKey]

    const filterVerificationName = (verification_rule) => {
      let name = '不限格式'
      switch (verification_rule) {
        case '':
          name = '不限格式'
          break;
        case 'mobile':
          name = '手机号码'
          break;
        case 'tel':
          name = '座机'
          break;
        case 'ID_card':
          name = '身份证'
          break;
        case 'chinese_name':
          name = '中文名'
          break;
        case 'url':
          name = '网址'
          break;
        case 'qq':
          name = 'qq号码'
          break;
        case 'postal_code':
          name = '邮政编码'
          break;
        case 'positive_integer':
          name = '正整数'
          break;
        case 'negative':
          name = '负数'
          break;
        case 'two_decimal_places':
          name = '精确到两位小数'
          break;
        default:
          name = '不限格式'
          break
      }
      return name
    }

    return (
      <div className={indexStyles.EditFormThreeOneOut}>
        <div className={indexStyles.EditFormThreeOneOut_form}>
          <div className={indexStyles.EditFormThreeOneOut_form_left}></div>
          <div className={indexStyles.EditFormThreeOneOut_form_right}>
            <div className={indexStyles.EditFormThreeOneOutItem} style={{ width: '100%'}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div style={{display: 'flex', alignItems: 'center'}}><div style={{maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{property_name}</div> [{filterVerificationName(verification_rule)}]  ({is_required === '1' ? '必填': '选填'})</div>
                <div style={{color: '#F5222D', display: verificationIsTrue? 'none': 'block'}}>格式错误，请重新填写！</div>
              </div>
              <Input value={default_value} disabled={FormCanEdit} style={{ height: 24, width: '100%', marginTop: 4, border: verificationIsTrue? '': '1px solid #F5222D' }} onChange={this.defaultValueChange.bind(this, verification_rule)}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
