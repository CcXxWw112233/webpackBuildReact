import React from 'react'
import indexStyles from '../../index.less'
import { Avatar, Modal } from 'antd'
import {
  ORGANIZATION, TASKS, FLOWS, DASHBOARD, PROJECTS, FILES, MEMBERS, CATCH_UP,
  PROJECT_FLOWS_FLOW_TEMPLATE, NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME
} from "../../../../../../../globalset/js/constant";
import {checkIsHasPermissionInBoard, currentNounPlanFilterName} from "../../../../../../../utils/businessFunction";
import globalStyles from '../../../../../../../globalset/css/globalClassName.less'
import { Collapse } from 'antd';
import TemplateItem from './TemplateItem'
import {message} from "antd/lib/index";
import {processEditDatasConstant, processEditDatasRecordsConstant} from "../../constant";
const Panel = Collapse.Panel;

export default class TemplateContent extends React.Component {
  state = {

  }
  templateStartClick({id}) {
    this.props.getTemplateInfo && this.props.getTemplateInfo(id)
  }
  deleteTemplate({id}) {
    const that = this
    Modal.confirm({
      title: `确认删除该模板？`,
      zIndex: 2000,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        that.props.deleteProcessTemplate && that.props.deleteProcessTemplate({id})
      }
    });


  }
  startEdit() {
    if(!checkIsHasPermissionInBoard(PROJECT_FLOWS_FLOW_TEMPLATE)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    this.props.updateDatasProcess({
      processInfo: {},
      processPageFlagStep: '2',
      node_type: '1', //节点类型
      processCurrentEditStep: 0, //编辑第几步，默认 0
      processEditDatas: JSON.parse(JSON.stringify(processEditDatasConstant)), //json数组，每添加一步编辑内容往里面put进去一个obj,刚开始默认含有一个里程碑的
      processEditDatasRecords: JSON.parse(JSON.stringify(processEditDatasRecordsConstant)), //每一步的每一个类型，记录，数组的全部数据step * type
      currentProcessInstanceId: ''
    })
  }

  render() {
    const { datas: { processTemplateList = [] }} = this.props.model
    const { clientHeight } = this.props
    const maxContentHeight = clientHeight - 108 - 160
    return (
      <div className={indexStyles.content}>
        <div className={indexStyles.paginationContent} style={{maxHeight: maxContentHeight}}>
          {processTemplateList.map((value, key) => {
            const { id } = value
            return (
             <TemplateItem {...this.props} key={id} itemValue={value} />
            )
          })}
        </div>
        {checkIsHasPermissionInBoard(PROJECT_FLOWS_FLOW_TEMPLATE) && (
          <div className={indexStyles.add} onClick={this.startEdit.bind(this)}>新增模板</div>
        )}
      </div>
    )
  }
}
const customPanelStyle = {
  background: '#f5f5f5',
  borderRadius: 4,
  fontSize: 16,
  border: 0,
  marginLeft: 10,
  overflow: 'hidden',
};
