import React from 'react'
import { Modal, Form, Button, Input, message, Select, Icon, Spin } from 'antd'
import {min_page_width} from "./../../../globalset/js/styles";
import indexstyles from './index.less'
import globalStyles from './../../../globalset/css/globalClassName.less'
import {checkIsHasPermissionInBoard, setStorage} from "../../../utils/businessFunction";
import TypeResult from './TypeResult'
import PaginResult from './PaginResult'

const FormItem = Form.Item
const TextArea = Input.TextArea
const InputGroup = Input.Group;
const Option = Select.Option;

//此弹窗应用于各个业务弹窗，和右边圈子适配
export default class SearchResult extends React.Component {
  state = {

  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {

  }

  render() {
    const { defaultSearchType = '1', spinning, page_number } = this.props
    return(
      <Spin tip="数据加载中" spinning={spinning && page_number == 1}>
        <div style={{minHeight: 40}}>
          {defaultSearchType == '1' ? (
            <TypeResult />
          ) : (
            <PaginResult />
          )}
        </div>
      </Spin>
    )
  }
}
