import React, { Component } from 'react'
import { Input } from 'antd'
import globalStyles from '@/globalset/css/globalClassName.less'
import commonStyles from '../common.less'

export default class InputExport extends Component {
  state = {
    currentOperateIndex: null
  }

  /**
   * 删除操作
   * @param {Object} e 事件对象
   * @param {Number} index 当前操作的对应数组下标
   */
  handleDeleteInput = (e, index) => {
    e && e.stopPropagation()
    this.props.handleDeleteInput && this.props.handleDeleteInput(index)
  }

  onChange = (e, index) => {
    let value = e.target.value
    this.props.handleChangeInputValue &&
      this.props.handleChangeInputValue({ value, index })
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
    const { inputList } = this.props
    if (index == inputList.length - 1) {
      this.props.handleAddOneTips && this.props.handleAddOneTips()
    }
    this.setState({
      currentOperateIndex: index
    })
  }

  render() {
    const {
      itemKey,
      itemValue,
      inputList = [],
      maxLength,
      disabled
    } = this.props
    const { value } = itemValue
    const { currentOperateIndex } = this.state
    return (
      <div style={{ position: 'relative' }}>
        <Input
          maxLength={maxLength || 100}
          value={value}
          style={{
            marginBottom: itemKey == inputList.length - 1 ? '0px' : '12px',
            paddingRight: '24px'
          }}
          key={itemKey}
          onFocus={e => {
            this.onFocus(e, itemKey)
          }}
          onChange={e => {
            this.onChange(e, itemKey)
          }}
          disabled={!disabled}
        />
        {currentOperateIndex == itemKey && inputList.length > 1 ? (
          <span
            onClick={e => {
              this.handleDeleteInput(e, itemKey)
            }}
            className={`${commonStyles.input_delete_icon} ${globalStyles.authTheme}`}
          >
            &#xe7fe;
          </span>
        ) : (
          ''
        )}
      </div>
    )
  }
}

InputExport.defaultProps = {
  inputList: [] // input选项列表
}
