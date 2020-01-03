import React from 'react'
import { Icon, Modal, message } from 'antd'
import indexStyles from './index.less'
import { connect } from 'dva'

export default class Header extends React.Component {
  state = {
  }

  cancelModal = () => {
    this.props.onCancel && this.props.onCancel()
  }

  render() {
    const { headerContent = <div></div> } = this.props
    return (
      <div className={indexStyles.header_out}>
        <div className={indexStyles.header_out_left}>
          {headerContent}
        </div>
        <div className={indexStyles.header_out_right}>
          <Icon type="close" onClick={this.cancelModal} />
        </div>
      </div>
    )
  }
}

