import React, { Component } from 'react'
import { Menu, Modal, Button } from 'antd'
import globalStyles from '@/globalset/css/globalClassName.less'
import TreeNode from '../TreeNode.js'

export default class AddMultipleIndex extends Component {
  constructor(props) {
    super(props)
    this.state = {
      add_mutiple_visible: false
    }
  }
  handleSelected = ({ key }) => {
    console.log('sssssaaa', key)
    const { setInputAddType, setAddMultipleVisible } = this.props
    if (['1', '2'].includes(key)) {
      setInputAddType(key)
    }
    if (['3', '4'].includes(key)) {
      if (key == '3') {
        setInputAddType('1')
      } else if (key == '4') {
        setInputAddType('2')
      }
      setAddMultipleVisible(true)
    }
  }
  renderMenu = () => {
    const { input_add_type } = this.props
    return (
      <div className={`${globalStyles.global_card}`}>
        <Menu
          onClick={this.handleSelected}
          defaultSelectedKeys={[input_add_type]}
        >
          {input_add_type == '1' && <Menu.Item key={'2'}>新建任务</Menu.Item>}
          {input_add_type == '1' && (
            <Menu.Item key={'3'}>批量创建里程碑</Menu.Item>
          )}
          {input_add_type == '2' && <Menu.Item key={'1'}>新建里程碑</Menu.Item>}
          {input_add_type == '2' && (
            <Menu.Item key={'4'}>批量创建任务</Menu.Item>
          )}
        </Menu>
      </div>
    )
  }

  render() {
    return <>{this.renderMenu()}</>
  }
}
