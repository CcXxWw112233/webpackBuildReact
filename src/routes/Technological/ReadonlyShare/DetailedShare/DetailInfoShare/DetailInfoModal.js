import React from 'react'
import { Modal, Form, Button, Input, message } from 'antd'
import DrawDetailInfo from './DrawDetailInfo'
import CustormModal from '../../../../../components/CustormModal'

class DetailInfoModal extends React.Component {
  state = {}

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {}

  onCancel() {
    const { dispatch } = this.props
    dispatch({
      type: 'projectDetail/updateDatas',
      payload: {
        projectInfoDisplay: false
      }
    })
  }

  render() {
    const { modalVisible, invitationType, invitationId } = this.props

    return (
      <CustormModal
        visible={modalVisible}
        width={472}
        zIndex={1006}
        maskClosable={false}
        footer={null}
        destroyOnClose
        onCancel={this.onCancel.bind(this)}
        overInner={
          <DrawDetailInfo
            invitationType={invitationType}
            invitationId={invitationId}
          />
        }
      />
    )
  }
}
export default Form.create()(DetailInfoModal)
