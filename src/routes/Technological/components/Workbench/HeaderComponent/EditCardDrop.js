import React from 'react'
import EditCardDropStyle from './index.less'
import { Icon, Menu, Dropdown, Tooltip, Card, Input, Checkbox } from 'antd'
import CardContentNormal from './CardContentNormal'
import EditCardDropItem from './EditCardDropItem'

export default class EditCardDrop extends React.Component {
  render() {
    const { datas: { boxUsableList = [] }} = this.props.model
    const { visibleEdit } = this.props
    return (
      <div className={EditCardDropStyle.edit_cardd_dropdown}>
        <div className={EditCardDropStyle.edit_cardd_dropdown_left}>
          {boxUsableList.slice(0, Math.ceil(boxUsableList.length / 2)).map((value, key) => {
            return (
              <EditCardDropItem {...this.props} itemValue={value} itemKey={key} key={key} visibleEdit={visibleEdit}/>
            )
          })}
        </div>
        <div className={EditCardDropStyle.edit_cardd_dropdown_right}>
          {boxUsableList.slice(Math.ceil(boxUsableList.length / 2)).map((value, key) => {
            return (
              <EditCardDropItem {...this.props} itemValue={value} itemKey={key} key={key} visibleEdit={visibleEdit}/>
            )
          })}
        </div>
      </div>
    )
  }
}
