import React, { Component } from 'react'
import indexStyles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { connect } from 'dva'
import { Input, Button } from 'antd'

@connect()
export default class CreateTempleteScheme extends Component {

  state = {
    inputValue: ''
  }

  // 点击全部方案
  handleBackAllPlan = () => {
    this.props.updateStateDatas && this.props.updateStateDatas({ whetherShowSchemeDetail: false })
  }

  // 文本框输入变化
  handleChangeVal = (e) => {
    this.setState({
      inputValue: e.target.value
    })
  }

  // 点击新建模板
  handleCreateTemplete = () => {
    const { inputValue } = this.state
    const { _organization_id } = this.props
    this.props.dispatch({
      type: 'organizationManager/createTemplete',
      payload: {
        name: inputValue,
        _organization_id
      }
    })
    this.props.updateStateDatas && this.props.updateStateDatas({ whetherShowSchemeDetail: false })
  }

  render() {
    const { inputValue } = this.state
    return (
      <div>
        <div className={indexStyles.plan_back} onClick={this.handleBackAllPlan}>
          <span className={globalStyles.authTheme}>&#xe7ec; 全部方案</span>
        </div>
        <div>
          <div style={{ width: '100%', marginBottom: '12px', height: '38px' }}><Input value={inputValue} onChange={this.handleChangeVal} autoFocus={true} placeholder="请输入方案名称" style={{ width: '100%', padding: '8px 12px', height: '38px' }} /></div>
          <div style={{ textAlign: 'right' }}><Button disabled={!(inputValue != '')} type="primary" onClick={this.handleCreateTemplete}>确定</Button></div>
        </div>
      </div>
    )
  }
}
