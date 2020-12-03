import React, { Component } from 'react'
import indexStyles from '../index.less'
import TemplateItem from './TemplateItem'
import globalStyles from '@/globalset/css/globalClassName.less'
import { connect } from 'dva'
import { PROJECT_FLOWS_FLOW_TEMPLATE } from '../../../../../../globalset/js/constant'
import { checkIsHasPermissionInBoard } from '../../../../../../utils/businessFunction'
import nodataImg from '../../../../../../assets/projectDetail/process/empty-box.png'
@connect(mapStateToProps)
export default class TemplateContent extends Component {
  // 模板组件

  // 新增模板点击事件
  handleAddTemplate = () => {
    this.props.handleAddTemplate && this.props.handleAddTemplate()
  }

  // 编辑模板的点击事件
  handleEditTemplete = item => {
    this.props.handleEditTemplete && this.props.handleEditTemplete(item)
  }

  // 启动流程的点击事件
  handleStartProcess = item => {
    this.props.handleStartProcess && this.props.handleStartProcess(item)
  }

  // 删除流程的点击事件
  handleDelteTemplete = item => {
    this.props.handleDelteTemplete && this.props.handleDelteTemplete(item)
  }

  render() {
    const {
      processTemplateList = [],
      projectDetailInfoData: { board_id }
    } = this.props
    return (
      <div className={`${indexStyles.templateContent}`}>
        {checkIsHasPermissionInBoard(PROJECT_FLOWS_FLOW_TEMPLATE, board_id) && (
          <div className={indexStyles.addTemplate}>
            <span
              className={indexStyles.add_icon}
              onClick={this.handleAddTemplate}
            >
              <span
                style={{ fontSize: '30px' }}
                className={globalStyles.authTheme}
              >
                &#xe8fe;
              </span>
              <span className={indexStyles.add_name}>新建模板</span>
            </span>
          </div>
        )}
        <div
          className={`${indexStyles.templateItemContent} ${globalStyles.global_vertical_scrollbar}`}
        >
          {processTemplateList &&
            processTemplateList.map((item, key) => {
              return (
                <TemplateItem
                  itemValue={item}
                  itemKey={key}
                  handleEditTemplete={this.handleEditTemplete}
                  handleStartProcess={this.handleStartProcess}
                  handleDelteTemplete={this.handleDelteTemplete}
                />
              )
            })}
        </div>
        {!processTemplateList.length ? (
          <div className={indexStyles.nodata}>
            <div className={indexStyles.nodata_inner}>
              <img src={nodataImg} />
              <div>暂无模板数据</div>
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
    )
  }
}

// 模板组件
TemplateContent.defaultProps = {}

function mapStateToProps({
  publicProcessDetailModal: { processTemplateList = [] },
  projectDetail: {
    datas: { projectDetailInfoData = {} }
  },
  technological: {
    datas: { userBoardPermissions = [] }
  }
}) {
  return {
    processTemplateList,
    projectDetailInfoData,
    userBoardPermissions
  }
}
