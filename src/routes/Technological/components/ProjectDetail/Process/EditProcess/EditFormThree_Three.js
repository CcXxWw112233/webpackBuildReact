import React from 'react'
import indexStyles from './index.less'
import { Input, Checkbox, Select, Button, DatePicker } from 'antd'
import {timeToTimestamp} from "../../../../../../utils/util";
import moment from 'moment/moment';

const Option = Select.Option;
const { MonthPicker, RangePicker } = DatePicker

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
  isRequiredCheck (e) {
    this.updateEdit({value: e.target.checked? '1':'0'}, 'is_required')
  }

  verificationRuleChange(key, value) {
    const { datas: { processEditDatas = [], processCurrentEditStep = 0, } } = this.props.model
    const { form_data=[] } = processEditDatas[processCurrentEditStep]
    const { itemKey } = this.props
    const { verification_rule } = form_data[itemKey]
    const ruleArray = verification_rule.replace('_', ',').split(',')
    ruleArray[key] = value
    const newVerificationRule = ruleArray.join(',').replace(',', '_')
    this.updateEdit({value: newVerificationRule}, 'verification_rule')
  }

  datePickerChange(date, dateString) {
    this.updateEdit({value: timeToTimestamp(dateString).toString()}, 'default_value')
  }
  rangePickerChange(date, dateString) {
    this.updateEdit({value: `${timeToTimestamp(dateString[0])},${timeToTimestamp(dateString[1])}`}, 'default_value')
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

    //模式
    const ruleArray = verification_rule.replace('_', ',').split(',')
    const mode_0 = ruleArray[0]
    const mode_1 = ruleArray[1]
    //时间
    const timeArray = default_value && default_value.split(',') || []
    const startTime = timeArray[0]
    const endTime = timeArray[1]

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
               <p>模式</p>
               <Select value={mode_0} style={{ width: 74}} size={'small'} onChange={this.verificationRuleChange.bind(this, 0)}>
                 <Option value="SINGLE">单个</Option>
                 <Option value="MULTI">多个</Option>
               </Select>
             </div>
             <div className={indexStyles.EditFormThreeOneOutItem}>
               <p>精确度</p>
               <Select value={mode_1} style={{ width: 110}} size={'small'} onChange={this.verificationRuleChange.bind(this, 1)}>
                 <Option value="DATE_TIME">日期 + 时分</Option>
                 <Option value="DATE">日期</Option>
               </Select>
             </div>
             <div className={indexStyles.EditFormThreeOneOutItem}>
               <p>预设值</p>
               {mode_0==='SINGLE'? (
                 <DatePicker
                   style={{width: 110, height: 24}}
                   size={'small'}
                   showTime={mode_1 === 'DATE_TIME'}
                   allowClear={false}
                   format={mode_1 === 'DATE_TIME' ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD"}
                   placeholder=""
                   value={startTime ? moment(new Date(Number(startTime))) : undefined} // [moment(new Date(signUpStartTime)), moment(new Date(signUpEndTime))]
                   onChange={this.datePickerChange.bind(this)}
                 />
               ) : (
<RangePicker
                 size={'small'}
                 style={{width: 110, height: 24}}
                 showTime={mode_1 === 'DATE_TIME'?{ format: 'HH:mm' } :false}
                 format={mode_1 === 'DATE_TIME' ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD"}
                 placeholder={[]}
                 value={ (startTime && endTime) ? [moment(new Date(Number(startTime))), moment(new Date(Number(endTime)))] : undefined}
                 onChange={this.rangePickerChange.bind(this)}
               />
)}

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
