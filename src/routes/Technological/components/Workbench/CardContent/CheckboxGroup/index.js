import React, { Component } from 'react'
import { Checkbox, message } from 'antd'
import styles from './index.less'

class CheckboxGroup extends Component {
  onItemCheckStatusChange = (item, checkedValue) => {
    const { onItemChange } = this.props
    if (checkedValue) checkedValue.stopPropagation()
    onItemChange(item, {
      checked: checkedValue.target.checked,
      disabled: checkedValue.target.disabled
    })
  }
  render() {
    const { dataList } = this.props
    return (
      <div className={styles.wrapper}>
        {dataList.map((item = {}, index) => (
          <Checkbox
            className={styles.item}
            key={index}
            defaultChecked={item.checked}
            disabled={item.disabled}
            onChange={checkedValue =>
              this.onItemCheckStatusChange(item, checkedValue)
            }
          >
            {item.label}
          </Checkbox>
        ))}
      </div>
    )
  }
}

CheckboxGroup.defaultProps = {
  dataList: [
    //checkbox 数据列表
    {
      label: '我负责的任务', //item label
      checked: true, //是否选中： true || false
      disabled: true //是否禁用
    },
    {
      label: '我创建的任务',
      checked: false
    },
    {
      label: '我关注的任务',
      checked: false
    },
    {
      label: '已完成的任务',
      checked: false
    }
  ],
  onItemChange: function() {
    message.error('CheckboxGroup component Need callback: onItemChange')
  }
}

export default CheckboxGroup
