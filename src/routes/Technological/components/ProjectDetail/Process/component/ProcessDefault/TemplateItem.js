import React from 'react'
import indexStyles from '../../index.less'
import { Avatar, Modal, Tooltip, message } from 'antd'
import {
  ORGANIZATION, TASKS, FLOWS, DASHBOARD, PROJECTS, FILES, MEMBERS, CATCH_UP, PROJECT_FLOWS_FLOW_CREATE,
  PROJECT_FLOW_FLOW_ACCESS, PROJECT_FLOWS_FLOW_TEMPLATE, NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME
} from "../../../../../../../globalset/js/constant";
import {checkIsHasPermissionInBoard, currentNounPlanFilterName} from "../../../../../../../utils/businessFunction";
import globalStyles from '../../../../../../../globalset/css/globalClassName.less'
import { Collapse } from 'antd';
const Panel = Collapse.Panel;

export default class TemplateItem extends React.Component {
  state = {
    showBott: false,
    hasMore: false,
  }
  componentDidMount() {
    this.initGet(1)
  }
  componentWillReceiveProps(nextProps) {
    this.initGet(2)
  }
  initGet(type) {
    const ref = this.refs.tempItemBott
    if(ref) {
      const height = ref.clientHeight
      if(height >= 36) { //36为三行文字的高度
        this.setState({
          hasMore: true
        })
      }
    }
  }
  templateStartClick({id}) {
    this.props.getTemplateInfo && this.props.getTemplateInfo(id)
  }
  deleteTemplate({id}) {
    if(!checkIsHasPermissionInBoard(PROJECT_FLOWS_FLOW_TEMPLATE)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
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
    if(!checkIsHasPermissionInBoard(PROJECT_FLOWS_FLOW_CREATE)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    this.props.updateDatasProcess({
      processPageFlagStep: '2'
    })
  }
  setShowBott() {
    this.setState({
      showBott: !this.state.showBott
    })
  }
  render() {
    const { showBott, hasMore } = this.state
    const { itemValue } = this.props
    const { name, id, flow_template_node_list = [] } = itemValue

    return (
      <div className={indexStyles.tem_item} style={{paddingBottom: hasMore ? 0 : 12}}>
        <div className={indexStyles.tem_item_top}>
          <div className={`${indexStyles.tem_item_l} ${globalStyles.authTheme}`}>&#xe605;</div>
          <div className={indexStyles.tem_item_m}>
            <div className={indexStyles.title}>{name}</div>
          </div>
          {checkIsHasPermissionInBoard(PROJECT_FLOWS_FLOW_TEMPLATE) && (
            <Tooltip title="删除模板">
              <div className={`${indexStyles.tem_item_r} ${globalStyles.authTheme} ${indexStyles.itemOperate}`} onClick={this.deleteTemplate.bind(this, { id })}>&#xe623;</div>
            </Tooltip>
          )}
          {checkIsHasPermissionInBoard(PROJECT_FLOWS_FLOW_CREATE) && (
            <Tooltip title="启动流程">
              <div className={`${indexStyles.tem_item_r} ${globalStyles.authTheme}  ${indexStyles.itemOperate}`} onClick={this.templateStartClick.bind(this, { id })}>&#xe61f;</div>
            </Tooltip>
          )}

        </div>
        <div className={indexStyles.tem_item_bott} ref={'tempItemBott'}>
          <div className={`${indexStyles.tem_item_flow} ${globalStyles.authTheme} ${hasMore && !showBott ?indexStyles.tem_item_flow_hasMore: ''}`}>
            {flow_template_node_list.map((value, key) => {
              const { name, id } = value
              return (
                <div className={indexStyles.tem_item_flow_item} key={id}>
                  {name} {key < flow_template_node_list.length - 1 && (<i style={{fontStyle: 'normal'}}>&#8594;&nbsp;</i>)}
                </div>
              )
            })}

          </div>
        </div>
        {hasMore && (
          <div
            className={`${indexStyles.tem_item_bott_down} ${globalStyles.authTheme} ${showBott? indexStyles.tem_item_bott_down_up : indexStyles.tem_item_bott_down_down}`}
            onClick={this.setShowBott.bind(this)}>&#xe7f0;</div>
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
