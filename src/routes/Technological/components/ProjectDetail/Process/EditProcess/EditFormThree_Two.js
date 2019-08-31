import React from 'react'
import indexStyles from './index.less'
import { Input, Checkbox, Select, Button, DatePicker, message } from 'antd'
import moment from 'moment';
import EditFormThreeTwoModal from './EditFormThree_Two_Modal'
import {MESSAGE_DURATION_TIME} from "../../../../../../globalset/js/constant";

const Option = Select.Option;

export default class EditFormThree_One extends React.Component {

  state = {
    modalVisible: false
  }
  setShowModalVisibile() {
    this.setState({
      modalVisible: !this.state.modalVisible
    })
  }
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
  isRequiredCheck (e) {
    if(e.target.checked) {
      const { datas: { processEditDatas = [], processCurrentEditStep = 0, } } = this.props.model
      const { form_data=[] } = processEditDatas[processCurrentEditStep]
      const { itemKey } = this.props
      const { options_data = [], } = form_data[itemKey]
      if(!options_data.length) {
        message.warn('您尚未编辑选项！', MESSAGE_DURATION_TIME)
        return false
      }
    }
    this.updateEdit({value: e.target.checked? '1':'0'}, 'is_required')
  }
  verificationRuleChange(value) {
    this.updateEdit({value: value}, 'verification_rule')
  }
  defaultValueChange(value) {
    let newValue = value
    if (typeof value === 'object'){
      newValue = value.join(',')
    }
    this.updateEdit({value: newValue}, 'default_value')
  }
  optionsDataChange(value) {
    this.updateEdit({value: value}, 'options_data')
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
    const { property_name, default_value, verification_rule, options_data = [], is_required, } = form_data[itemKey]

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
               <p>选项</p>
               <Button style={{width: 122, height: 24}} onClick={this.setShowModalVisibile.bind(this)}>编辑选项</Button>
             </div>
             <div className={indexStyles.EditFormThreeOneOutItem}>
               <p>默认值</p>
               {/*mode=*/}
               {/*filter(d=>d)去掉假值*/}
               <Select value={verification_rule === 'multiple'? default_value.split(',').filter(d=>d):default_value} style={{ width: 88}} size={'small'} mode={verification_rule === 'multiple' ? 'multiple' : ''} maxTagCount={0} onChange={this.defaultValueChange.bind(this)} >
                 {options_data.map((value, key) => {
                   return ( <Option value={value} key={key}>{value}</Option>)
                 } )}
               </Select>
             </div>
             <div className={indexStyles.EditFormThreeOneOutItem}>
               <p>预设规则</p>
               <Select value={verification_rule} style={{ width: 86}} size={'small'} onChange={this.verificationRuleChange.bind(this)}>
                 <Option value="redio">单选</Option>
                 <Option value="multiple">多选</Option>
                 <Option value="province">省市区</Option>
               </Select>
             </div>
             <div className={indexStyles.EditFormThreeOneOutItem} style={{textAlign: 'center'}}>
               <p>必填</p>
               <Checkbox onChange={this.isRequiredCheck.bind(this)} checked={is_required === '1'} />
             </div>
           </div>
         </div>
         <EditFormThreeTwoModal
           optionsDataChange={this.optionsDataChange.bind(this)}
           options_data={options_data}
           modalVisible={this.state.modalVisible}
           setShowModalVisibile={this.setShowModalVisibile.bind(this)}
           {...this.props}/>
      </div>
    )
  }

}
