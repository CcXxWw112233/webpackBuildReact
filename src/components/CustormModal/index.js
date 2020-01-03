import React from 'react'
import { Modal, Form, Button, Input, message } from 'antd'
import { min_page_width } from "./../../globalset/js/styles";
import indexStyles from './index.less'
import { connect } from 'dva'
const FormItem = Form.Item
const TextArea = Input.TextArea
let selfAdaptationWidth


//此弹窗应用于各个业务弹窗，和右边圈子适配
@connect(mapStateToProps)
class CustormModal extends React.Component {
  state = {
    siderRightWidth: 56, //右边栏宽度
    clientHeight: document.documentElement.clientHeight, //获取页面可见高度
    clientWidth: document.documentElement.clientWidth, //获取页面可见高度
    layoutClientWidth: document.getElementById('technologicalLayoutWrapper') && document.getElementById('technologicalLayoutWrapper').clientWidth,
  }
  constructor(props) {
    super(props);
    this.resizeTTY = this.resizeTTY.bind(this)
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeTTY);
  }
  resizeTTY = () => {
    const clientHeight = document.documentElement.clientHeight;//获取页面可见高度
    const clientWidth = document.documentElement.clientWidth
    this.setState({
      clientHeight,
      clientWidth
    })
  }

  componentDidMount() {
    const { clientWidth } = this.state
    const { chatImVisiable, siderRightCollapsed } = this.props
    if (chatImVisiable || siderRightCollapsed) {
      const technologicalLayoutWrapper = document.getElementById('technologicalLayoutWrapper')
      // let layoutClientWidth = technologicalLayoutWrapper ? technologicalLayoutWrapper.offsetWidth - 400 : clientWidth - 450
      let layoutClientWidth = clientWidth - 400
      this.setState({
        layoutClientWidth
      })
    } else {
      const technologicalLayoutWrapper = document.getElementById('technologicalLayoutWrapper')
      let layoutClientWidth = technologicalLayoutWrapper ? technologicalLayoutWrapper.offsetWidth : clientWidth
      this.setState({
        layoutClientWidth
      })
    }
    window.addEventListener('resize', this.resizeTTY)
  }

  componentWillReceiveProps(nextProps) {
    const { clientWidth } = this.state
    const { chatImVisiable, siderRightCollapsed } = nextProps
    if (chatImVisiable || siderRightCollapsed) {
      const technologicalLayoutWrapper = document.getElementById('technologicalLayoutWrapper')
      // let layoutClientWidth = technologicalLayoutWrapper ? technologicalLayoutWrapper.offsetWidth - 400 : clientWidth - 450
      let layoutClientWidth = clientWidth - 400
      this.setState({
        layoutClientWidth
      })
    } else {
      const technologicalLayoutWrapper = document.getElementById('technologicalLayoutWrapper')
      let layoutClientWidth = technologicalLayoutWrapper ? technologicalLayoutWrapper.offsetWidth : clientWidth - 450
      this.setState({
        layoutClientWidth
      })
    }

  }

  // componentDidMount() {
  //   window.addEventListener('resize', this.resizeTTY.bind(this, 'modal'))
  //   this.listenSiderRightresize()
  // }

  // componentWillReceiveProps(nextProps) {

  // }

  // //监听右边栏宽高变化
  // listenSiderRightresize() {
  //   const that = this
  //   // Firefox和Chrome早期版本中带有前缀
  //   const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver
  //   // 选择目标节点

  //   const target = document.getElementById('siderRight');
  //   if (!target) {
  //     return
  //   }
  //   // 创建观察者对象
  //   const observer = new MutationObserver(function (mutations) {
  //     mutations.forEach(function (mutation) {
  //       that.setState({
  //         siderRightWidth: RegExp(/videoMeeting__icon/).test(mutation.target.className) ? document.getElementById('siderRight').clientWidth : (document.getElementById('siderRight').clientWidth === 56 ? 300 : 56)
  //       })
  //     });
  //   });
  //   // 配置观察选项:
  //   const config = {
  //     attributes: true, //检测属性变动
  //     subtree: true,
  //     // childList: true,//检测子节点变动
  //     // characterData: true//节点内容或节点文本的变动。
  //   }
  //   // 传入目标节点和观察选项
  //   observer.observe(target, config);
  //   // /停止观察
  //   // observer.disconnect();
  //   //https://blog.csdn.net/zfz5720/article/details/83095535
  // }

  // resizeTTY(type) {
  //   const { siderRightWidth } = this.state
  //   const clientHeight = document.documentElement.clientHeight//获取页面可见高度
  //   const clientWidth = document.documentElement.clientWidth + 16 - siderRightWidth//获取页面可见高度
  //   const layoutClientWidth = document.getElementById('technologicalLayoutWrapper') && document.getElementById('technologicalLayoutWrapper').clientWidth + 16
  //   const workbenchClientWidth = document.getElementById('container_workbenchBoxContent') && document.getElementById('container_workbenchBoxContent').clientWidth + 16
  //   this.setState({
  //     clientHeight,
  //     clientWidth,
  //     layoutClientWidth,
  //     workbenchClientWidth
  //   })
  // }


  render() {
    const { whetherShowBodyScreenWidth, siderRightCollapsed = false, visible, overInner, width, zIndex = 1006, maskClosable, footer, destroyOnClose, keyboard = true, maskStyle = {}, style = {}, onOk, onCancel, bodyStyle = {}, closable = true, title, page_load_type, chatImVisiable } = this.props;
    const { clientWidth, clientHeight, layoutClientWidth } = this.state
    // const { user_set = {} } = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : {};
    // const { is_simple_model } = user_set;
    selfAdaptationWidth = layoutClientWidth
    let active_width = whetherShowBodyScreenWidth ? clientWidth - 450 > 1200 ? width : (clientWidth - 450 < 818 ? 818 : clientWidth - 450) : width
    return (
      <Modal
        title={title}
        visible={visible}
        width={active_width}
        closable={closable}
        zIndex={zIndex}
        maskClosable={maskClosable}
        footer={footer}
        destroyOnClose={destroyOnClose}
        keyboard={keyboard}
        getContainer={() => document.getElementById('technologicalLayoutWrapper') || document.querySelector('body')}
        maskStyle={{
          height: clientHeight,
          ...maskStyle,
          width: selfAdaptationWidth
        }}
        style={{ ...style }}
        bodyStyle={{ ...bodyStyle }}
        onCancel={onCancel}
        onOk={onOk}
        wrapClassName={`${page_load_type == '2' ? (siderRightCollapsed ? indexStyles.wrapActiveModal : indexStyles.wrapNormalModal) : indexStyles.wrapModal} ${chatImVisiable || siderRightCollapsed ? indexStyles.container_wrapperActiveModal : indexStyles.container_wrapperNormalModal}`}
      >
        {overInner}
      </Modal>
    )
  }
}

function mapStateToProps({
  simplemode: {
    chatImVisiable = false
  },
  technological: {
    datas: {
      siderRightCollapsed = false
    }
  }
}) {
  return {
    chatImVisiable, siderRightCollapsed
  }
}
export default Form.create()(CustormModal)
