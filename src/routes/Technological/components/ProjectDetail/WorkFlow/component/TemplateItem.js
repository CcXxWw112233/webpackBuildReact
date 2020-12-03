import React, { Component } from 'react'
import indexStyles from '../index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import {
  PROJECT_FLOWS_FLOW_TEMPLATE,
  PROJECT_FLOW_FLOW_ACCESS,
  PROJECT_FLOWS_FLOW_CREATE
} from '../../../../../../globalset/js/constant'
import { checkIsHasPermissionInBoard } from '../../../../../../utils/businessFunction'
import { connect } from 'dva'

@connect(mapStateToProps)
export default class TemplateItem extends Component {
  // 启动流程的点击事件
  handleStartProcess = item => {
    this.props.handleStartProcess && this.props.handleStartProcess(item)
  }

  // 编辑流程的点击事件
  handleEditTemplete = item => {
    this.props.handleEditTemplete && this.props.handleEditTemplete(item)
  }

  // 删除流程的点击事件
  handleDelteTemplete = item => {
    this.props.handleDelteTemplete && this.props.handleDelteTemplete(item)
  }

  render() {
    const { itemValue } = this.props
    const { id, name, board_id } = itemValue
    return (
      <div className={indexStyles.tempItemWrapper}>
        <span className={indexStyles.tem_item}>
          <span>
            <span
              className={`${globalStyles.authTheme} ${indexStyles.tem_icon}`}
            >
              &#xe68c;
            </span>
            <span className={indexStyles.temp_item_name}>{name}</span>
          </span>
          {/* 三种状态 */}
          <span className={indexStyles.hover_icon_display}>
            {checkIsHasPermissionInBoard(
              PROJECT_FLOWS_FLOW_CREATE,
              board_id
            ) && (
              <span
                onClick={() => {
                  this.handleStartProcess(itemValue)
                }}
                className={`${indexStyles.common_authority_hover}`}
              >
                <span
                  className={`${indexStyles.hover_icon} ${indexStyles.start_process_icon} ${globalStyles.authTheme}`}
                >
                  &#xe796; 启动流程
                </span>
              </span>
            )}
            {checkIsHasPermissionInBoard(
              PROJECT_FLOWS_FLOW_TEMPLATE,
              board_id
            ) && (
              <span
                onClick={() => {
                  this.handleEditTemplete(itemValue)
                }}
                className={`${indexStyles.common_authority_hover}`}
              >
                <span
                  className={`${indexStyles.hover_icon} ${indexStyles.edit_temp_icon} ${globalStyles.authTheme}`}
                >
                  &#xe602; 编辑模板
                </span>
              </span>
            )}
            {checkIsHasPermissionInBoard(
              PROJECT_FLOWS_FLOW_TEMPLATE,
              board_id
            ) && (
              <span
                onClick={() => {
                  this.handleDelteTemplete(itemValue)
                }}
                className={`${indexStyles.common_authority_hover}`}
              >
                <span
                  className={`${indexStyles.hover_icon} ${indexStyles.delete_temp_icon} ${globalStyles.authTheme}`}
                >
                  &#xe7c3; 删除模板
                </span>
              </span>
            )}
          </span>
        </span>
      </div>
    )
  }
}

// 每一个模板选项结构
TemplateItem.defaultProps = {}

function mapStateToProps({
  technological: {
    datas: { userBoardPermissions = [] }
  }
}) {
  return {
    userBoardPermissions
  }
}
