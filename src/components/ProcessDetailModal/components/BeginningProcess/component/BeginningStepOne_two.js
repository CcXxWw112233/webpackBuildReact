import React, { Component } from 'react'
import { Select } from 'antd'
import indexStyles from '../index.less'
import { connect } from 'dva'
import { updateUserStorage } from '../../handleOperateModal'

const { Option } = Select
@connect(mapStateToProps)
export default class BeginningStepOne_two extends Component {
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

  defaultValueChange(value) {
    let newValue = value
    if (typeof value === 'object') {
      newValue = value.join(',')
    }
    this.updateEdit({ value: newValue, update_storage: true }, 'value')
  }

  // 判断是多选还是单选所渲染的不同value内容
  renderWhetherMultipleValue = () => {
    const { itemValue } = this.props
    const { value, options = [], is_multiple_choice } = itemValue
    let containerText = ''
    switch (is_multiple_choice) {
      case '1': // 表示是多选
        let temp_value = value ? value.split(',') : []
        let newOptionsData = [...options]
        let arr = []
        newOptionsData.map(item => {
          if (temp_value.indexOf(item.id) != -1) {
            arr.push(item.id)
          }
        })
        containerText = arr.join(',')
        break
      case '0': // 表示不是多选
        let temp_value2 =
          (
            (options &&
              options.filter(item => item.id == value) &&
              options.filter(item => item.id == value).length &&
              options.filter(item => item.id == value)[0]) ||
            []
          ).id || ''
        containerText = temp_value2
        break

      default:
        break
    }
    return containerText
  }

  render() {
    const { itemValue } = this.props
    const {
      title,
      prompt_content,
      is_required,
      options = [],
      value,
      is_multiple_choice
    } = itemValue
    return (
      <div className={indexStyles.text_form}>
        <p>
          <span>
            {title}:&nbsp;&nbsp;
            {is_required == '1' && <span style={{ color: '#F5222D' }}>*</span>}
          </span>
        </p>
        <div className={indexStyles.text_fillOut}>
          <Select
            mode={is_multiple_choice === '1' ? 'multiple' : ''}
            value={
              is_multiple_choice === '1' && value
                ? value.split(',').filter(d => d) || ''
                : value
            }
            optionLabelProp="label"
            // value={this.renderWhetherMultipleValue()}
            style={{ width: '100%' }}
            placeholder={prompt_content}
            onChange={this.defaultValueChange.bind(this)}
          >
            {options.map(item => {
              return (
                <Option label={item.label_name} value={item.id}>
                  {item.label_name}
                </Option>
              )
            })}
          </Select>
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
