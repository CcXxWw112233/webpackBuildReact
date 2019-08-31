import React from 'react'
import EditCardDropStyle from './index.less'
import { Icon, Menu, Dropdown, Tooltip, Card, Input, Checkbox } from 'antd'
import CardContentNormal from './CardContentNormal'
import EditCardDropItem from './EditCardDropItem'

export default class EditCardDrop extends React.Component {
  render() {
    const { itemValue, itemKey } = this.props
    const { box_data, already_has_boxs } = itemValue
    return (
      <div className={EditCardDropStyle.edit_cardd_dropdown}>
        <div className={EditCardDropStyle.edit_cardd_dropdown_left}>
          {box_data.slice(0, Math.ceil(box_data.length / 2)).map((value, key) => {
            return (
              <EditCardDropItem {...this.props} already_has_boxs={already_has_boxs} itemValue={value} key={key} parentKey={itemKey} />
            )
          })}
        </div>
        <div className={EditCardDropStyle.edit_cardd_dropdown_right}>
          {box_data.slice(Math.ceil(box_data.length / 2)).map((value, key) => {
            return (
              <EditCardDropItem {...this.props} already_has_boxs={already_has_boxs} itemValue={value} key={key} parentKey={itemKey}/>
            )
          })}
        </div>
      </div>
    )
  }
}
