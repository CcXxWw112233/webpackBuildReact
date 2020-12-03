import React from 'react'
import { Modal, Form, Input, Select } from 'antd'
// import { min_page_width } from './../../../globalset/js/styles'
import indexstyles from './index.less'
// import globalStyles from './../../../globalset/css/globalClassName.less'
import SearchResult from './SearchResult'
// import { INPUT_CHANGE_SEARCH_TIME } from '../../../globalset/js/constant'
import { connect } from 'dva/index'
import SearchArea from './SearchArea'
const FormItem = Form.Item
const TextArea = Input.TextArea
const InputGroup = Input.Group
const Option = Select.Option

//此弹窗应用于各个业务弹窗，和右边圈子适配
const getEffectOrReducerByName = name => `globalSearch/${name}`
@connect(mapStateToProps)
export default class GlobalSearch extends React.Component {
  state = {}

  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type: getEffectOrReducerByName('getGlobalSearchTypeList'),
      payload: {}
    })
  }

  componentWillReceiveProps(nextProps) {}

  onCancel() {
    const { dispatch } = this.props
    dispatch({
      type: getEffectOrReducerByName('updateDatas'),
      payload: {
        globalSearchModalVisible: false
      }
    })
    dispatch({
      type: getEffectOrReducerByName('initDatas'),
      payload: {}
    })
  }

  render() {
    const {
      defaultSearchType,
      globalSearchModalVisible,
      spinning,
      page_number
    } = this.props

    return (
      <Modal
        visible={globalSearchModalVisible}
        zIndex={1010}
        footer={false}
        destroyOnClose={false}
        onCancel={this.onCancel.bind(this)}
      >
        <div className={indexstyles.modal_out}>
          <SearchArea />
          <SearchResult
            defaultSearchType={defaultSearchType}
            spinning={spinning}
            page_number={page_number}
          />
        </div>
      </Modal>
    )
  }
}

function mapStateToProps({
  globalSearch: {
    datas: {
      defaultSearchType,
      globalSearchModalVisible,
      spinning,
      page_number
    }
  }
}) {
  return {
    defaultSearchType,
    globalSearchModalVisible,
    spinning,
    page_number
  }
}
