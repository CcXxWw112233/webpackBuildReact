import React from 'react'
import {min_page_width} from "../../globalset/js/styles";
import CustormModal from '../../components/CustormModal'
import DetailDom from './DetailDom'

export default class DetailModal extends React.Component {
  state = {}

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {}

  onCancel(){
    const { modalVisibleName = 'modalVisible', modalVisibleValue } = this.props
    this.props.onCancel && this.props.onCancel()
  }


  render() {
    const { modalVisible } = this.props

    const modalTop = 20
    return(
      <CustormModal
        visible={modalVisible}
        width={'90%'}
        close={this.props.close}
        closable={false}
        maskClosable={false}
        footer={null}
        destroyOnClose
        bodyStyle={{top: 0}}
        style={{top: modalTop}}
        onCancel={this.onCancel.bind(this)}
        overInner={<DetailDom {...this.props} modalTop={modalTop}/>}
      />
    )
  }
}
