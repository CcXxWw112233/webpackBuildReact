import React from 'react'
import indexStyles from './index.less'
import { Input, Checkbox, Select, InputNumber } from 'antd'
import { validateTel, validateEmail, validatePassword, validateFixedTel, validateIdCard, validateChineseName, validatePostalCode, validateWebsite, validateQQ, validatePositiveInt, validateNegative, validateTwoDecimal, } from '../../../../../../utils/verify'

const Option = Select.Option;

export default class EditFormThree_One extends React.Component {
  updateEdit(data, key) {
    const { itemKey } = this.props
    const { datas: { processEditDatas = [], processCurrentEditStep = 0, } } = this.props.model
    const { form_data=[] } = processEditDatas[processCurrentEditStep]
    form_data[itemKey][key] = data.value
    this.props.updateEdit({value: form_data }, 'form_data')
  }
  propertyNameChange(e) {
    this.updateEdit({value: e.target.value}, 'property_name')
  }
  defaultValueChange(e) {
    this.updateEdit({value: e.target.value}, 'default_value')
  }
  valLengthChange(value) {
    this.updateEdit({value: value.toString()}, 'val_length')
  }
  isRequiredCheck (e) {
    this.updateEdit({value: e.target.checked? '1':'0'}, 'is_required')
  }
  verificationRuleChange(value) {
    this.updateEdit({value: value}, 'verification_rule')
  }
  deleteItemForm() {
    const { datas: { processEditDatas = [], processCurrentEditStep = 0, } } = this.props.model
    const { form_data=[] } = processEditDatas[processCurrentEditStep]
    const { itemKey } = this.props
    form_data.splice(itemKey, 1)
    this.props.updateDatasProcess({
      processEditDatas
    })
  }
  render() {
    const { datas: { processEditDatas = [], processCurrentEditStep = 0, } } = this.props.model
    const { form_data=[] } = processEditDatas[processCurrentEditStep]
    const { itemKey } = this.props
    const { property_name, default_value, verification_rule, val_length, is_required, } = form_data[itemKey]

    return (
      <div className={indexStyles.EditFormThreeOneOut}>
         <div className={indexStyles.EditFormThreeOneOut_delete} onClick={this.deleteItemForm.bind(this)}>
           <div></div>
         </div>
         <div className={indexStyles.EditFormThreeOneOut_form}>
           <div className={indexStyles.EditFormThreeOneOut_form_left}></div>
           <div className={indexStyles.EditFormThreeOneOut_form_right}>
             <div className={indexStyles.EditFormThreeOneOutItem}>
               <p>标题</p>
               <Input value={property_name} style={{width: 68, height: 24}} onChange={this.propertyNameChange.bind(this)}/>
             </div>
             <div className={indexStyles.EditFormThreeOneOutItem}>
               <p>默认填写</p>
               <Input value={default_value} style={{width: 144, height: 24}} onChange={this.defaultValueChange.bind(this)} />
             </div>
             <div className={indexStyles.EditFormThreeOneOutItem}>
               <p>校验规则</p>
               <Select value={verification_rule} style={{ width: 106}} size={'small'} onChange={this.verificationRuleChange.bind(this)}>
                 <Option value="">不校验格式</Option>
                 <Option value="mobile">手机号码</Option>
                 <Option value="tel">座机</Option>
                 <Option value="ID_card">身份证号码</Option>
                 <Option value="chinese_name">中文名（2-6）个汉字</Option>
                 <Option value="url">网址</Option>
                 <Option value="qq">QQ号</Option>
                 <Option value="postal_code">邮政编码</Option>
                 <Option value="positive_integer">正整数</Option>
                 <Option value="negative">负数</Option>
                 <Option value="two_decimal_places">精确到两位小数</Option>
               </Select>
             </div>
             <div className={indexStyles.EditFormThreeOneOutItem}>
               <p>长度</p>
               <InputNumber min={1} value={Number(val_length)} onChange={this.valLengthChange.bind(this)} size={'small'} style={{width: 46}} />
               {/*<Input style={{width: 36, height: 24}}/>*/}
             </div>
             <div className={indexStyles.EditFormThreeOneOutItem} style={{textAlign: 'center'}}>
               <p>必填</p>
               <Checkbox onChange={this.isRequiredCheck.bind(this)} checked={is_required === '1'} />
             </div>
           </div>
         </div>
      </div>
    )
  }

}
