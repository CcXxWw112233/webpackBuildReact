import React, { Component } from 'react'
import RadioFieldContent from './component/RadioFieldContent'
import commonStyles from './common.less'
import CheckboxFieldContent from './component/CheckboxFieldContent'
import DateFieldContent from './component/DateFieldContent'
import NumberFieldContent from './component/NumberFieldContent'
import TextFieldContent from './component/TextFieldContent'
import FileFieldContent from './component/FileFieldContent'
import MemberFieldContent from './component/MemberFieldContent'

export default class CustomCategoriesOperate extends Component {
  renderContent = (item, key) => {
    const { onlyShowPopoverContent } = this.props
    const {
      field_content: { field_type }
    } = item
    let mainContent = <div></div>
    // mainContent = (<RextFieldContent />)
    // mainContent = (<CheckboxFieldContent />)
    // mainContent = (<DateFieldContent />)
    // mainContent = (<NumberFieldContent />)
    // mainContent = (<TextFieldContent />)
    switch (field_type) {
      case '1':
        mainContent = (
          <RadioFieldContent
            onlyShowPopoverContent={onlyShowPopoverContent}
            itemValue={item}
            itemKey={key}
            handleUpdateModelDatas={this.props.handleUpdateModelDatas}
          />
        )
        break
      case '2':
        mainContent = (
          <CheckboxFieldContent
            onlyShowPopoverContent={onlyShowPopoverContent}
            itemValue={item}
            itemKey={key}
            handleUpdateModelDatas={this.props.handleUpdateModelDatas}
          />
        )
        break
      case '3':
        mainContent = (
          <DateFieldContent
            onlyShowPopoverContent={onlyShowPopoverContent}
            itemValue={item}
            itemKey={key}
            handleUpdateModelDatas={this.props.handleUpdateModelDatas}
          />
        )
        break
      case '4':
        mainContent = (
          <NumberFieldContent
            onlyShowPopoverContent={onlyShowPopoverContent}
            itemValue={item}
            itemKey={key}
            handleUpdateModelDatas={this.props.handleUpdateModelDatas}
          />
        )
        break
      case '5':
        mainContent = (
          <TextFieldContent
            onlyShowPopoverContent={onlyShowPopoverContent}
            itemValue={item}
            itemKey={key}
            handleUpdateModelDatas={this.props.handleUpdateModelDatas}
          />
        )
        break
      case '6':
        mainContent = (
          <FileFieldContent
            onlyShowPopoverContent={onlyShowPopoverContent}
            itemValue={item}
            itemKey={key}
            handleUpdateModelDatas={this.props.handleUpdateModelDatas}
          />
        )
        break
      case '8':
        mainContent = (
          <MemberFieldContent
            onlyShowPopoverContent={onlyShowPopoverContent}
            itemValue={item}
            itemKey={key}
            handleUpdateModelDatas={this.props.handleUpdateModelDatas}
          />
        )
        break
      default:
        break
    }
    return mainContent
  }

  render() {
    const { fields = [] } = this.props
    return (
      <div className={commonStyles.custom_operate_wrapper}>
        {!!(fields && fields.length) &&
          fields.map((item, key) => {
            return this.renderContent(item, key)
          })}
      </div>
    )
  }
}

CustomCategoriesOperate.defaultProps = {
  fields: [], // 字段列表
  handleUpdateModelDatas: function() {} // 修改更新model中的数据
}
