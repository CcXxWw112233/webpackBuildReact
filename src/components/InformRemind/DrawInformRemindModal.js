import React, { Component } from 'react'
import { Modal, Form } from 'antd'

class DrawInformRemindModal extends Component {
  render() {
    const {
      visible,
      title,
      width,
      zIndex,
      overInner,
      mask,
      onCancel,
      footer,
      wrapClassName
    } = this.props
    return (
      <Modal
        title={
          <div
            style={{
              textAlign: 'center',
              fontSize: 16,
              fontWeight: 500,
              color: '#000'
            }}
          >
            {title}
          </div>
        }
        visible={visible}
        width={width}
        zIndex={zIndex}
        mask={mask}
        onCancel={onCancel}
        footer={footer}
        destroyOnClose
        wrapClassName={wrapClassName}
      >
        {overInner}
      </Modal>
    )
  }
}

export default DrawInformRemindModal
