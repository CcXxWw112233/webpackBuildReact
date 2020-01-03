import React from 'react'
import { connect } from 'dva'
import { min_page_width } from "../../globalset/js/styles";
import CustormModal from '../../components/CustormModal'
import DetailDom from './DetailDom'

@connect(mapStateToProps)
export default class DetailModal extends React.Component {
  state = {
    clientHeight: document.documentElement.clientHeight,
    clientWidth: document.documentElement.clientWidth,
  }
  constructor(props) {
    super(props);
    this.resizeTTY = this.resizeTTY.bind(this)
  }
  componentDidMount() {
    window.addEventListener('resize', this.resizeTTY)
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeTTY);
  }

  onCancel() {
    const { modalVisibleName = 'modalVisible', modalVisibleValue } = this.props
    this.props.onCancel && this.props.onCancel()
  }

  resizeTTY = () => {
    const clientHeight = document.documentElement.clientHeight;//获取页面可见高度
    const clientWidth = document.documentElement.clientWidth
    this.setState({
      clientHeight,
      clientWidth
    })
  }

  render() {
    const { modalVisible, width, style, siderRightCollapsed, page_load_type } = this.props;
    const { clientWidth, clientHeight } = this.state;

    //const modalTop = 20
    //console.log("page_load_type", page_load_type);
    let offset = 0
    if (page_load_type == '1') {
      offset = 0;
    } else {
      if (siderRightCollapsed) {
        offset = 400;
      } else {
        offset = 65
      }
    }
    //console.log("offset", offset);
    let enableDisplayWidth = (clientWidth - offset ) * 0.9;
    let modalWidth = 1200;
    if (enableDisplayWidth > 1200) {
      modalWidth = 1200;
    } else {
      modalWidth = enableDisplayWidth;
    }

    let showActiveStyles = false; // 是否显示动态弹窗样式
    if (modalWidth >= 656 + 367) { // fileDetailContentLeft最大宽度为656, 如果说还大于加上评论的宽度, 那么就是正常的
      showActiveStyles = false
    } else {
      showActiveStyles = true // 否则显示动态样式
    }

    return (
      <CustormModal
        visible={modalVisible}
        width={modalWidth}
        close={this.props.close}
        closable={false}
        maskClosable={false}
        footer={null}
        destroyOnClose
        siderRightCollapsed={siderRightCollapsed}
        page_load_type={page_load_type}
        bodyStyle={{ padding: '0px' }}
        style={{ ...style }}
        onCancel={this.onCancel.bind(this)}
        whetherShowBodyScreenWidth={true}
        overInner={<DetailDom {...this.props} showActiveStyles={showActiveStyles} />}
      />
    )
  }
}


function mapStateToProps({
  technological: { datas: {
    siderRightCollapsed, page_load_type }
  },

}) {
  return { siderRightCollapsed, page_load_type }
}
