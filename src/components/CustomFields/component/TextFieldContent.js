import React, { Component } from 'react'
import commonStyles from '../common.less'
import globalsetStyles from '@/globalset/css/globalClassName.less'
import {
  Select,
  Dropdown,
  Menu,
  Icon,
  DatePicker,
  Input,
  InputNumber
} from 'antd'
import { categoryIcon } from '../../../routes/organizationManager/CustomFields/handleOperateModal'
import { connect } from 'dva'
import { isApiResponseOk } from '../../../utils/handleResponseData'
import {
  isObjectValueEqual,
  timeToTimestamp,
  timestampFormat
} from '../../../utils/util'
@connect()
export default class TextFieldContent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      itemValue: props.itemValue,
      itemKey: props.itemKey,
      inputVisible: false,
      inputValue:
        props.itemValue && props.itemValue.field_value
          ? props.itemValue.field_value
          : '',
      local_inputValue: ''
    }
  }

  componentWillReceiveProps(nextProps) {
    if (isObjectValueEqual(this.props.itemValue, nextProps.itemValue)) return
    this.setState({
      itemValue: nextProps.itemValue,
      itemKey: nextProps.itemKey,
      inputValue:
        nextProps.itemValue && nextProps.itemValue.field_value
          ? nextProps.itemValue.field_value
          : ''
    })
  }

  onClick = e => {
    const {
      itemValue: { field_value }
    } = this.state
    e && e.stopPropagation()
    this.setState({
      inputVisible: true,
      inputValue: field_value,
      local_inputValue: field_value
    })
  }

  onChange = e => {
    this.setState({
      inputValue: e.target.value
    })
  }

  onBlur = e => {
    let value = e.target.value
    const {
      itemValue: { id },
      local_inputValue,
      inputValue
    } = this.state
    if (value == local_inputValue) {
      this.setState({
        inputVisible: false
      })
      return
    }
    this.props
      .dispatch({
        type: 'organizationManager/setRelationCustomField',
        payload: {
          id: id,
          field_value: value
        }
      })
      .then(res => {
        if (isApiResponseOk(res)) {
          this.props.handleUpdateModelDatas &&
            this.props.handleUpdateModelDatas({
              data: res.data,
              type: 'update'
            })
          this.setState({
            inputVisible: false,
            inputValue: res.data.field_value
          })
        }
      })
  }

  // 删除关联字段
  handleDeleteRelationField = (e, id) => {
    e && e.stopPropagation()
    this.props
      .dispatch({
        type: 'organizationManager/deleteRelationCustomField',
        payload: {
          id: id
        }
      })
      .then(res => {
        if (isApiResponseOk(res)) {
          this.props.handleUpdateModelDatas &&
            this.props.handleUpdateModelDatas({ type: 'delete', data: id })
        }
      })
  }

  render() {
    const { itemValue, itemKey, inputValue } = this.state
    const {
      field_id,
      id,
      field_value,
      field_content: { name, field_type }
    } = itemValue
    const { onlyShowPopoverContent } = this.props
    return (
      <div
        key={id}
        className={`${
          commonStyles.custom_field_item_wrapper
        } ${onlyShowPopoverContent &&
          commonStyles.custom_field_item_wrapper_1}`}
      >
        <div className={commonStyles.custom_field_item}>
          <div className={commonStyles.c_left}>
            <span
              onClick={e => {
                this.handleDeleteRelationField(e, id)
              }}
              className={`${globalsetStyles.authTheme} ${commonStyles.delete_icon}`}
            >
              &#xe7fe;
            </span>
            <div className={commonStyles.field_name}>
              <span
                className={`${globalsetStyles.authTheme} ${commonStyles.field_name_icon}`}
              >
                {categoryIcon(field_type).icon}
              </span>
              <span title={name}>{name}</span>
            </div>
          </div>
          {this.state.inputVisible ? (
            <Input
              maxLength={100}
              value={inputValue}
              className={commonStyles.common_input}
              autoFocus={true}
              style={{ width: '100%', height: '38px' }}
              onChange={this.onChange}
              onBlur={this.onBlur}
            />
          ) : (
            <div
              className={`${commonStyles.field_value} ${commonStyles.pub_hover}`}
            >
              <div
                onClick={this.onClick}
                className={commonStyles.common_select}
              >
                <span style={{ wordBreak: 'break-all' }} title={field_value}>
                  {field_value ? field_value : '未填写'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
}
