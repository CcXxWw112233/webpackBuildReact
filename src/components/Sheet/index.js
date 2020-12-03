import React from 'react'
import styles from './index.less'
import { Modal, Button } from 'antd'
import Sheet from './components/Sheet'
export default class EditSheet extends React.Component {
  constructor() {
    super(...arguments)
    this.state = {
      visible: false
    }
    this.el = null
  }
  openSheet = () => {
    let { visible } = this.state
    this.setState(
      {
        visible: !visible
      },
      () => {
        this.el && this.el.reload(this.props.data || [])
      }
    )
  }
  close = () => {
    this.setPropsData()
    this.setState({
      visible: false
    })
  }
  setPropsData = () => {
    let { onMessage = () => {} } = this.props
    onMessage(this.el.getFormatData())
  }
  render() {
    const { visible } = this.state
    return (
      <div style={{ display: 'inline-block' }}>
        <Button type="link" onClick={this.openSheet}>
          表格编辑
        </Button>
        {visible && <Sheet ref={el => (this.el = el)} onClose={this.close} />}
      </div>
    )
  }
}
