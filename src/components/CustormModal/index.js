import React from 'react'
import { Modal, Form, Button, Input, message } from 'antd'
import { min_page_width } from "./../../globalset/js/styles";
import indexstyles from './index.less'
import { userInfo } from 'os';
const FormItem = Form.Item
const TextArea = Input.TextArea

//此弹窗应用于各个业务弹窗，和右边圈子适配
class CustormModal extends React.Component {
  state = {
    siderRightWidth: 56, //右边栏宽度
    clientHeight: document.documentElement.clientHeight, //获取页面可见高度
    clientWidth: document.documentElement.clientWidth, //获取页面可见高度
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeTTY.bind(this, 'modal'))
    this.listenSiderRightresize()
  }

  componentWillReceiveProps(nextProps) {

  }

  //监听右边栏宽高变化
  listenSiderRightresize() {
    const that = this
    // Firefox和Chrome早期版本中带有前缀
    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver
    // 选择目标节点

    const target = document.getElementById('siderRight');
    if (!target) {
      return
    }
    // 创建观察者对象
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        that.setState({
          siderRightWidth: RegExp(/videoMeeting__icon/).test(mutation.target.className) ? document.getElementById('siderRight').clientWidth : (document.getElementById('siderRight').clientWidth === 56 ? 300 : 56)
        })
      });
    });
    // 配置观察选项:
    const config = {
      attributes: true, //检测属性变动
      subtree: true,
      // childList: true,//检测子节点变动
      // characterData: true//节点内容或节点文本的变动。
    }
    // 传入目标节点和观察选项
    observer.observe(target, config);
    // /停止观察
    // observer.disconnect();
    //https://blog.csdn.net/zfz5720/article/details/83095535
  }

  resizeTTY(type) {
    const clientHeight = document.documentElement.clientHeight//获取页面可见高度
    const clientWidth = document.documentElement.clientWidth + 16//获取页面可见高度
    this.setState({
      clientHeight,
      clientWidth
    })
  }


  render() {
    const { visible, overInner, width, zIndex = 1006, maskClosable, footer, destroyOnClose, keyboard = true, maskStyle = {}, style = {}, onOk, onCancel, bodyStyle = {}, closable = true, title } = this.props;
    const { clientWidth, clientHeight } = this.state
    const { siderRightWidth } = this.state;
    const { user_set = {} } = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : {};
    const { is_simple_model } = user_set;
    let maskWidth = clientWidth;
    if (is_simple_model !== '1') {
      maskWidth = clientWidth - siderRightWidth - 16 //16是margin的值
    }
   
    // console.log(overInner, 'sss')
    return (
      <Modal
        title={title}
        visible={visible}
        width={width}
        closable={closable}
        zIndex={zIndex}
        maskClosable={maskClosable}
        footer={footer}
        destroyOnClose={destroyOnClose}
        keyboard={keyboard}
        maskStyle={{ height: clientHeight, width: maskWidth, ...maskStyle }}
        style={{ width: maskWidth, ...style }}
        bodyStyle={{ ...bodyStyle }}
        onCancel={onCancel}
        onOk={onOk}
      >
        {overInner}
      </Modal>
    )
  }
}
export default Form.create()(CustormModal)
