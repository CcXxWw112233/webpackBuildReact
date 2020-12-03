import React, { Component } from 'react'
import indexStyles from '../index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { Popover, Input, Button, Radio, Select } from 'antd'
import { connect } from 'dva'
import {
  compareACoupleOfObjects,
  isObjectValueEqual
} from '../../../../../utils/util'
import ConfigureNapeGuide from '../../../ConfigureNapeGuide'

let temp_item = {
  field_type: '2', //类型 1=文本 2=选择 3=日期 4=表格 5=附件
  title: '下拉选择', //标题
  prompt_content: '请选择内容', //提示内容
  is_required: '0', //是否必填 1=必须 0=不是必须
  is_multiple_choice: '0', //是否多选 1=是 0=否
  options: [
    {
      label_value: '0',
      label_name: '选项1'
    }
  ]
  // "is_click_currentTextForm": true
}
@connect(mapStateToProps)
export default class ConfigureStepOne_two extends Component {
  constructor(props) {
    super(props)
    let compare_item1 = JSON.parse(JSON.stringify(temp_item || {}))
    let compare_item2 = JSON.parse(JSON.stringify(props.itemValue || {}))
    compare_item1.is_click_currentTextForm
      ? delete compare_item1.is_click_currentTextForm
      : ''
    compare_item2.is_click_currentTextForm
      ? delete compare_item2.is_click_currentTextForm
      : ''
    this.state = {
      popoverVisible: null,
      form_item: isObjectValueEqual(compare_item1, compare_item2)
        ? JSON.parse(JSON.stringify(temp_item || {}))
        : JSON.parse(JSON.stringify(props.itemValue || {})), // 该组件中的所有数据从state中来
      local_item: isObjectValueEqual(compare_item1, compare_item2)
        ? JSON.parse(JSON.stringify(temp_item || {}))
        : JSON.parse(JSON.stringify(props.itemValue || {})) // 这个是用来做比较的
    }
  }

  onVisibleChange = visible => {
    const { is_click_confirm_btn, form_item = {}, local_item = {} } = this.state
    const { itemKey, parentKey, processEditDatas = [], itemValue } = this.props
    let update_item = JSON.parse(JSON.stringify(local_item || {}))
    if (!is_click_confirm_btn) {
      // 判断是否点击了确定按钮,否 那么就保存回原来的状态
      if (visible == false) {
        this.setState({
          form_item: JSON.parse(JSON.stringify(update_item || {}))
        })
        const { forms = [] } = processEditDatas[parentKey]
        forms[itemKey] = JSON.parse(JSON.stringify(update_item || {}))
        this.props.updateConfigureProcess &&
          this.props.updateConfigureProcess({ value: forms }, 'forms')
      }
    }
    this.setState({
      popoverVisible: visible
    })
  }

  handlePopoverClose = e => {
    e && e.stopPropagation()
    this.onVisibleChange(false)
  }

  updateEdit = (data, key) => {
    const { itemKey, parentKey, processEditDatas = [] } = this.props
    const { forms = [] } = JSON.parse(
      JSON.stringify(processEditDatas[parentKey] || {})
    )
    forms[itemKey][key] = data.value
    this.props.updateConfigureProcess &&
      this.props.updateConfigureProcess({ value: forms }, 'forms')
  }
  updateState = (data, key) => {
    const { form_item = {} } = this.state
    let update_item = JSON.parse(JSON.stringify(form_item || {}))
    update_item[key] = data.value
    this.setState({
      form_item: update_item
    })
  }
  propertyNameChange = e => {
    this.updateState({ value: e.target.value }, 'title')
  }
  defaultValueChange = e => {
    this.updateState({ value: e.target.value }, 'prompt_content')
  }
  optionsValueChange = (e, key) => {
    const { itemValue } = this.props
    const { form_item = {} } = this.state
    let { options = [] } = form_item
    let newOptionsData = [...options]
    if (newOptionsData && newOptionsData[key]) {
      newOptionsData[key]['label_name'] = e.target.value
    }
    this.updateState({ value: newOptionsData }, 'options')
  }

  // 添加选项的点击事件
  handleAddOptionsSelect = () => {
    const { itemValue } = this.props
    const { form_item = {} } = this.state
    const { options = [] } = form_item
    let newOptionsData = [...options]
    let obj = {
      label_value: Number(newOptionsData.length).toString(),
      label_name: `选项${Number(newOptionsData.length) + 1}`
    }
    newOptionsData.push(obj)
    this.updateState({ value: newOptionsData }, 'options')
  }
  // 删除选项的点击事件 (这里是根据下标来)
  handleDelOptionsSelect = key => {
    const { itemValue } = this.props
    const { form_item = {} } = this.state
    const { options = [] } = form_item
    let newOptionsData = [...options]
    for (var i = 0; i < newOptionsData.length; i++) {
      if (i == key) {
        newOptionsData.splice(key, 1) // 将使后面的元素依次前移，数组长度减1
        i-- // 如果不减，将漏掉一个元素
        break
      }
    }
    this.updateState({ value: newOptionsData }, 'options')
  }
  isRequiredCheck = e => {
    this.updateState({ value: e.target.value }, 'is_required')
  }
  verificationRuleChange = e => {
    this.updateState({ value: e.target.value }, 'is_multiple_choice')
  }

  // 删除对应字段的表项
  handleDelFormDataItem = e => {
    e && e.stopPropagation()
    const { processEditDatas = [], parentKey = 0, itemKey } = this.props
    const { forms = [] } = processEditDatas[parentKey]
    let new_form_data = [...forms]
    new_form_data.splice(itemKey, 1)
    this.props.updateConfigureProcess &&
      this.props.updateConfigureProcess({ value: new_form_data }, 'forms')
  }

  // 每一个表项的点击事件
  handleChangeTextFormColor = e => {
    e && e.stopPropagation()
    const { popoverVisible } = this.state
    const { itemValue, parentKey, processEditDatas = [], itemKey } = this.props
    const { forms = [] } = processEditDatas[parentKey]
    const { is_click_currentTextForm } = itemValue
    let newFormsData = JSON.parse(JSON.stringify(forms || []))
    if (newFormsData && newFormsData.length > 1) {
      newFormsData = newFormsData.map((item, index) => {
        if (item.is_click_currentTextForm && index != itemKey) {
          let new_item
          new_item = { ...item, is_click_currentTextForm: false }
          return new_item
        } else if (item.is_click_currentTextForm && index == itemKey) {
          let new_item
          new_item = {
            ...item,
            is_click_currentTextForm: !popoverVisible ? true : false
          }
          return new_item
        } else if (!item.is_click_currentTextForm && index == itemKey) {
          let new_item
          new_item = {
            ...item,
            is_click_currentTextForm: !popoverVisible ? true : false
          }
          return new_item
        } else if (!item.is_click_currentTextForm && index != itemKey) {
          return item
        }
      })
      this.props.updateConfigureProcess &&
        this.props.updateConfigureProcess({ value: newFormsData }, 'forms')
      // this.updateEdit({ value: !is_click_currentTextForm }, 'is_click_currentTextForm')
    } else {
      this.updateEdit(
        { value: !popoverVisible ? true : false },
        'is_click_currentTextForm'
      )
    }

    this.props.dispatch({
      type: 'publicProcessDetailModal/updateDatas',
      payload: {
        not_show_create_form_guide: '1'
      }
    })
  }

  // 每个配置表项的确定的点击事件
  handleConfirmFormItem = () => {
    const { popoverVisible } = this.state
    const { form_item = {} } = this.state
    this.setState({
      is_click_confirm_btn: true
    })
    if (popoverVisible) {
      this.setState(
        {
          form_item: JSON.parse(JSON.stringify(form_item || {})),
          local_item: JSON.parse(JSON.stringify(form_item || {}))
        },
        () => {
          const { itemKey, parentKey, processEditDatas = [] } = this.props
          const { forms = [] } = processEditDatas[parentKey]
          forms[itemKey] = JSON.parse(JSON.stringify(form_item || {}))
          this.onVisibleChange(false)
          this.setState({
            is_click_confirm_btn: false
          })
          this.props.updateConfigureProcess &&
            this.props.updateConfigureProcess({ value: forms }, 'forms')
        }
      )
    }
  }

  // 查找所有的选项内容不能为空 true 表示存在空值
  whetherIsEmptyValue = () => {
    const { form_item = {} } = this.state
    const { options = [] } = form_item
    let newOptionsData = [...options]
    let flag = false
    newOptionsData = newOptionsData.find(item => {
      if (item.label_name == '') {
        flag = true
      }
    })
    return flag
  }

  renderContent = () => {
    const { itemValue } = this.props
    const { form_item = {} } = this.state
    const {
      title,
      prompt_content,
      is_multiple_choice,
      is_required,
      options = []
    } = form_item
    let compare_item1 = JSON.parse(JSON.stringify(form_item || {}))
    let compare_item2 = JSON.parse(JSON.stringify(itemValue || {}))
    compare_item1.is_click_currentTextForm
      ? delete compare_item1.is_click_currentTextForm
      : ''
    compare_item2.is_click_currentTextForm
      ? delete compare_item2.is_click_currentTextForm
      : ''
    let disabledFlag = isObjectValueEqual(compare_item1, compare_item2)
    return (
      <div
        onClick={e => e && e.stopPropagation()}
        className={indexStyles.popover_content}
      >
        <div
          className={`${indexStyles.pop_elem} ${globalStyles.global_vertical_scrollbar}`}
        >
          <div>
            <p>标题:</p>
            <Input
              value={title}
              maxLength={50}
              onChange={this.propertyNameChange}
            />
          </div>
          <div>
            <p>请选择标题:</p>
            <Input
              value={prompt_content}
              maxLength={50}
              onChange={this.defaultValueChange}
            />
          </div>
          <div>
            <p>
              添加选项:{' '}
              <span
                onClick={this.handleAddOptionsSelect}
                style={{
                  color: '#1890FF',
                  marginLeft: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
                className={`${globalStyles.authTheme}`}
              >
                &#xe846;
              </span>
            </p>
            {options.map((item, index) => {
              return (
                <div key={item} style={{ position: 'relative' }}>
                  <Input
                    maxLength={50}
                    style={{ marginBottom: '4px', transition: 'all .5s' }}
                    key={item.label_value}
                    value={item.label_name}
                    onChange={e => {
                      this.optionsValueChange(e, index)
                    }}
                  />
                  {index != '0' && (
                    <span
                      onClick={() => {
                        this.handleDelOptionsSelect(index)
                      }}
                      style={{
                        marginLeft: '4px',
                        position: 'absolute',
                        top: '6px'
                      }}
                      className={`${globalStyles.authTheme} ${indexStyles.del_optionsIcon}`}
                    >
                      &#xe7fe;
                    </span>
                  )}
                </div>
              )
            })}
          </div>
          <div className={indexStyles.layout_style}>
            <p style={{ marginRight: '16px' }}>是否为必填项:</p>
            <Radio.Group value={is_required} onChange={this.isRequiredCheck}>
              <Radio value="1">是</Radio>
              <Radio value="0">否</Radio>
            </Radio.Group>
          </div>
          <div className={indexStyles.layout_style}>
            <p style={{ marginRight: '16px' }}>是否支持多选:</p>
            <Radio.Group
              value={is_multiple_choice}
              onChange={this.verificationRuleChange}
            >
              <Radio value="1">是</Radio>
              <Radio value="0">否</Radio>
            </Radio.Group>
          </div>
        </div>
        <div className={indexStyles.pop_btn}>
          <Button
            onClick={this.handleConfirmFormItem}
            disabled={
              title &&
              title != '' &&
              title.trimLR() != '' &&
              !disabledFlag &&
              !this.whetherIsEmptyValue()
                ? false
                : true
            }
            style={{ width: '100%' }}
            type="primary"
          >
            确定
          </Button>
        </div>
      </div>
    )
  }

  render() {
    const { itemKey, itemValue, parentKey, processEditDatas = [] } = this.props
    const { form_item = {} } = this.state
    const { forms = [] } = processEditDatas[parentKey]
    const { title, prompt_content, is_required } = form_item
    const { is_click_currentTextForm } = itemValue
    return (
      <div onClick={this.handleChangeTextFormColor}>
        <Popover
          title={
            <div
              onClick={e => e && e.stopPropagation()}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <div className={indexStyles.popover_title}>配置表项</div>
              <div
                onClick={this.handlePopoverClose}
                className={`${globalStyles.authTheme} ${indexStyles.popover_close_icon}`}
              >
                &#xe7fe;
              </div>
            </div>
          }
          trigger="click"
          visible={this.state.popoverVisible}
          content={this.renderContent()}
          getPopupContainer={triggerNode => triggerNode.parentNode}
          placement={'bottomRight'}
          zIndex={1010}
          className={indexStyles.popoverWrapper}
          autoAdjustOverflow={false}
          onVisibleChange={this.onVisibleChange}
        >
          <div
            className={`${indexStyles.text_form}`}
            style={{
              background: is_click_currentTextForm
                ? 'rgba(230,247,255,1)'
                : 'rgba(0,0,0,0.02)'
            }}
          >
            <p>
              {title}:&nbsp;&nbsp;
              {is_required == '1' && (
                <span style={{ color: '#F5222D' }}>*</span>
              )}
            </p>
            <Select
              className={indexStyles.option_select}
              style={{ width: '100%' }}
              placeholder={prompt_content}
              disabled={true}
            />
            {is_click_currentTextForm && (
              <>
                <span
                  onClick={this.handleDelFormDataItem}
                  className={`${indexStyles.delet_iconCircle}`}
                >
                  <span
                    className={`${globalStyles.authTheme} ${indexStyles.deletet_icon}`}
                  >
                    &#xe720;
                  </span>
                </span>
                {/* <div onClick={(e) => e && e.stopPropagation()} className={indexStyles.popoverContainer} style={{ position: 'absolute', right: 0, top: 0 }}>

                    <div onClick={this.handelPopoverVisible} className={`${globalStyles.authTheme} ${indexStyles.setting_icon}`}>
                      <span>&#xe78e;</span>
                    </div>


                  </div> */}
              </>
            )}
            {/* {itemKey == ((forms && forms.length) && forms.length - 1) && <ConfigureNapeGuide />} */}
            {itemKey == 0 && <ConfigureNapeGuide />}
          </div>
        </Popover>
      </div>
    )
  }
}

function mapStateToProps({
  publicProcessDetailModal: { processEditDatas = [] }
}) {
  return { processEditDatas }
}
