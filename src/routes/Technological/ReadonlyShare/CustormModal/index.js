import React from 'react'
import { Modal, Form, Button, Input, message } from 'antd'
import indexStyles from './index.less'

// @connect(mapStateToProps)
class CustormModal extends React.Component {
  state = {
    siderRightWidth: 56, //右边栏宽度
    clientHeight: document.documentElement.clientHeight, //获取页面可见高度
    clientWidth: document.documentElement.clientWidth, //获取页面可见高度
  }


  render() {
    const { siderRightCollapsed = false, visible, overInner, width, zIndex = 1006, maskClosable, footer, destroyOnClose, keyboard = true, maskStyle = {}, style = {}, onOk, onCancel, bodyStyle = {}, closable = true, title, page_load_type } = this.props;
    // const { user_set = {} } = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : {};
    // const { is_simple_model } = user_set;

    return (
      <Modal
        title={title}
        visible={visible}
        width={width && width}
        closable={closable}
        zIndex={zIndex}
        maskClosable={maskClosable}
        footer={footer}
        destroyOnClose={destroyOnClose}
        keyboard={keyboard}
        getContainer={() => document.querySelector('body')}
        maskStyle={{
          ...maskStyle,
        }}
        style={{ ...style }}
        bodyStyle={{ ...bodyStyle }}
        onCancel={onCancel}
        onOk={onOk}
      >
        {overInner}
      </Modal>
    )
  }
}
export default CustormModal
