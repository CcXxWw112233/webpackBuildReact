import React, { Component } from 'react'
import { Modal, Button, Input, Icon } from 'antd'
import { currentNounPlanFilterName } from '../../../../../../utils/businessFunction'
import { PROJECTS } from '../../../../../../globalset/js/constant'

export default class SafeConfirmModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      confirmContent: '确认引用',
      confirmContentInputValue: ''
    }
  }
  handleOk = () => {
    this.props.onOk()
    this.props.onChangeVisible()
    this.clearInput()
  }

  handleCancel = () => {
    this.props.onChangeVisible()
    this.clearInput()
  }
  onChange = e => {
    this.setState({
      confirmContentInputValue: e.target.value
    })
  }
  componentWillMount() {
    this.clearInput()
  }

  onCancel = () => {
    this.clearInput()
    this.props.onChangeVisible()
  }
  clearInput = () => {
    this.setState({
      confirmContentInputValue: ''
    })
  }
  render() {
    const { confirmContent, confirmContentInputValue } = this.state
    const { visible, selectedTpl = {} } = this.props
    return (
      <Modal
        title={null}
        visible={visible}
        onCancel={this.onCancel}
        footer={null}
        destroyOnClose={true}
        width={437}
      >
        <div style={{ margin: '12px 8px' }}>
          <span
            style={{ fontSize: '22px', color: '#FAAD14', marginRight: '16px' }}
          >
            <Icon type="question-circle" theme="filled" />
          </span>
          <span
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: ':rgba(0,0,0,0.85)'
            }}
          >
            确认要引用【{selectedTpl.name}】
            {currentNounPlanFilterName(PROJECTS)}模版吗？
          </span>
        </div>
        <div
          style={{ margin: '12px 0px 12px 46px', color: 'rgba(0,0,0,0.65)' }}
        >
          引用{currentNounPlanFilterName(PROJECTS)}
          模版会覆盖删除项目现有的数据。
          {/* 如需引用请在下方输入“<span style={{ color: '#1890FF' }}>{confirmContent}</span>”。 */}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '12px 0px 12px 46px'
          }}
        >
          <div style={{ flex: 'auto', width: '124px' }}>
            {/* <Input style={{ width: '124px' }} placeholder="请输入" value={confirmContentInputValue} onChange={this.onChange} /> */}
          </div>
          <div style={{ width: '150px', float: 'right', marginTop: 'right' }}>
            <Button onClick={this.handleCancel}>取消</Button>
            <Button
              type={'primary'}
              // type={confirmContent == confirmContentInputValue ? 'primary' : 'danger'}
              // disabled={confirmContent == confirmContentInputValue ? false : true}
              style={{ marginLeft: '8px' }}
              onClick={this.handleOk}
            >
              确定
            </Button>
          </div>
        </div>
      </Modal>
    )
  }
}
