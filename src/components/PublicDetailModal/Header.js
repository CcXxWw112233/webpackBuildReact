import React from 'react'
import { Icon, Modal, message } from 'antd'
import indexStyles from './index.less'
import { connect } from 'dva'

export default class Header extends React.Component {
  state = {}

  cancleModal = () => {
    this.props.onCancel && this.props.onCancel()
  }

  render() {
    const { headerContent = <div></div> } = this.props
    return (
      <div className={indexStyles.header_out}>
        <div className={indexStyles.header_out_left}>{headerContent}</div>
        {/* <InformRemind className={indexStyles.remind_icon} rela_id={id} rela_type='5' user_remind_info={data} /> */}
        <div className={indexStyles.header_out_right}>
          <Icon type="close" onClick={this.cancleModal} />
        </div>
      </div>
    )
  }
}
