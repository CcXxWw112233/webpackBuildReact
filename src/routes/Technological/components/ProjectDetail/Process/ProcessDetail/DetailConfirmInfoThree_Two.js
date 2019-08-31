import React from 'react'
import { Input, Select, Cascader } from 'antd'
import indexStyles from './index.less'
import { areaData } from "../../../../../../utils/areaData";
import {validateFixedTel, validateTel} from "../../../../../../utils/verify";

const Option = Select.Option;

export default class DetailConfirmInfoThreeTwo extends React.Component {
  areaChange = (value) => {
    this.updateEdit({value: value[value.length - 1]}, 'default_value')

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

  defaultValueChange(value) {
    let newValue = value
    if (typeof value === 'object'){
      newValue = value.join(',')
    }
    this.updateEdit({value: newValue}, 'default_value')
  }

  render() {
    const { datas: { processEditDatas = [] } } = this.props.model
    const { itemKey, parentItemKey, FormCanEdit } = this.props
    const { form_data=[] } = processEditDatas[parentItemKey]
    const { property_name, default_value, verification_rule, val_length, is_required, options_data = [], } = form_data[itemKey]

    const multipleSelectChildren = [];
    for (let i = 10; i < 36; i++) {
      multipleSelectChildren.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
    }
    const fiterSelect = (verification_rule) => {
      let container = ''
      if('province' === verification_rule) {
        container = (
          <div>
            <Cascader disabled={FormCanEdit} options={areaData} onChange={this.areaChange.bind(this)} size={'small'} placeholder="请选择省市区" style={{ width: '100%'}}/>
          </div>
        )
      }else {
        container = (
          //filter(d=>d)去掉假值
          <Select disabled={FormCanEdit} value={verification_rule === 'multiple'? default_value.split(',').filter(d=>d):default_value} style={{ width: '100%'}} size={'small'} mode={verification_rule === 'multiple' ? 'multiple' : ''} onChange={this.defaultValueChange.bind(this)} >
            {options_data.map((value, key) => {
              return ( <Option value={value} key={key}>{value}</Option>)
            } )}
          </Select>
        )
      }
      return container
    }

    return (
      <div className={indexStyles.EditFormThreeOneOut}>
        <div className={indexStyles.EditFormThreeOneOut_form}>
          <div className={indexStyles.EditFormThreeOneOut_form_left}></div>
          <div className={indexStyles.EditFormThreeOneOut_form_right}>
            <div className={indexStyles.EditFormThreeOneOutItem} style={{ width: '100%'}}>
              <p>{property_name}({is_required === '1' ? '必填': '选填'})</p>
              {fiterSelect(verification_rule)}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
