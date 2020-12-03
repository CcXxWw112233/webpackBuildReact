import React, { Component } from 'react'
import CommonOptions from './CommonOptions'

export default class renderDetail extends Component {
  /**
   * 改变箭头的状态
   * @param {String} id 传递过来的对应当前选项的id
   * */

  handleArrow = id => {
    // 需要调用父组件的方法修改父组件中的数据
    this.props.chgParentSelectState(id)
  }

  /**
   * 项目的选项改变事件
   * 这是子组件要调用父组件的方法
   * @param {Object} e 选中的事件对象选项
   */
  chgEveryOptions = e => {
    const { new_detail_default_options = [], radio_checked_val } = this.props
    // console.log(new_detail_default_options, 'ssss')
    let val = e.target.value
    if (
      new_detail_default_options &&
      new_detail_default_options.indexOf(val) != -1
    ) {
      // 表示存在
      const arr = this.removeByValue(new_detail_default_options, val)
      // 这里调用父组件的方法
      this.props.updateParentList(arr, radio_checked_val)
    } else {
      new_detail_default_options && new_detail_default_options.push(val)
      // 这里调用父组件的方法
      this.props.updateParentList(new_detail_default_options, radio_checked_val)
    }
    // 在这里调用父组件的方法控制还原显示的方法
    this.props.chgDetailDisplayBlock(new_detail_default_options)
  }

  //删除数组中指定元素
  removeByValue = (arr = [], val) => {
    let temp = arr
    for (var i = 0; i < temp.length; i++) {
      if (temp[i] == val) {
        temp.splice(i, 1)
        break
      }
    }
    return arr
  }

  render() {
    const { new_notice_list, new_detail_default_options } = this.props
    // console.log(new_detail_default_options, 'sssss_detailed')
    return (
      <div>
        {new_notice_list &&
          new_notice_list.map((item, index) => {
            return (
              <CommonOptions
                key={item.id}
                index={index}
                itemVal={item}
                default_options={new_detail_default_options}
                chgEveryOptions={this.chgEveryOptions}
                handleArrow={this.handleArrow}
              />
            )
          })}
      </div>
    )
  }
}
