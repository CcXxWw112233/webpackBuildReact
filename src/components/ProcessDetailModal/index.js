import React, { Component } from 'react'
import PublicDetailModal from '@/components/PublicDetailModal'
import MainContent from './MainContent'
import HeaderContent from './HeaderContent'
import { connect } from 'dva'
import { lx_utils } from 'lingxi-im'

@connect(mapStateToProps)
export default class ProcessDetailModal extends Component {
  onCancel = () => {
    this.props.dispatch({
      type: 'publicProcessDetailModal/updateDatas',
      payload: {
        process_detail_modal_visible: false,
        currentFlowInstanceName: '', // 当前流程实例的名称
        currentFlowInstanceDescription: '', // 当前的实例描述内容
        isEditCurrentFlowInstanceName: true, // 是否正在编辑当前实例的名称
        isEditCurrentFlowInstanceDescription: false, // 是否正在编辑当前实例的描述
        processPageFlagStep: '1', // "1", "2", "3", "4" 分别对应 新建， 编辑， 启动
        processEditDatas: [],
        node_type: '1', // 当前的节点类型
        processCurrentEditStep: 0, // 当前的编辑步骤 第几步
        processCurrentCompleteStep: 0, // 当前处于的操作步骤
        templateInfo: {}, // 模板信息
        processInfo: {}, // 流程实例信息
        currentProcessInstanceId: '', // 当前查看的流程实例名称
        currentTempleteIdentifyId: '', // 当前查看的模板ID
        not_show_create_node_guide: '1', // 添加节点步骤的引导
        not_show_create_form_guide: '1', // 配置表项的引导
        not_show_create_rating_guide: '0', // 配置评分节点的引导
        currentOrgAllMembers: [] // 组织成员
      }
    })
    this.props.setProcessDetailModalVisibile &&
      this.props.setProcessDetailModalVisibile()
    // 圈子关闭联动
    lx_utils && lx_utils.setCommentData(this.props.processInfo.id || null)
  }

  commonDrawerContentOutClick = () => {
    const {
      currentFlowInstanceName,
      currentFlowInstanceDescription,
      isEditCurrentFlowInstanceName,
      isEditCurrentFlowInstanceDescription
    } = this.props
    if (isEditCurrentFlowInstanceName) {
      // 如果操作的是实例名称
      if (currentFlowInstanceName != '') {
        // 表示输入了名称, 那么就可以隐藏输入框
        this.props.dispatch({
          type: 'publicProcessDetailModal/updateDatas',
          payload: {
            isEditCurrentFlowInstanceName: false
          }
        })
      } else {
        this.props.dispatch({
          type: 'publicProcessDetailModal/updateDatas',
          payload: {
            isEditCurrentFlowInstanceName: true
          }
        })
      }
    }
    if (isEditCurrentFlowInstanceDescription) {
      // 如果操作的是编辑描述
      this.props.dispatch({
        type: 'publicProcessDetailModal/updateDatas',
        payload: {
          isEditCurrentFlowInstanceDescription: false
        }
      })
    }
  }

  render() {
    const {
      process_detail_modal_visible,
      whetherUpdateWorkbenchPorcessListData,
      updateParentProcessTempleteList,
      request_flows_params = {},
      getContainer
    } = this.props
    return (
      <div>
        <PublicDetailModal
          getContainer={getContainer}
          modalVisible={process_detail_modal_visible}
          onCancel={this.onCancel}
          isNotShowFileDetailContentRightVisible={true}
          mainContent={
            <MainContent
              request_flows_params={request_flows_params}
              onCancel={this.onCancel}
              updateParentProcessTempleteList={updateParentProcessTempleteList}
            />
          }
          headerContent={
            <HeaderContent
              request_flows_params={request_flows_params}
              onCancel={this.onCancel}
              whetherUpdateWorkbenchPorcessListData={
                whetherUpdateWorkbenchPorcessListData
              }
            />
          }
          commonDrawerContentOutClick={this.commonDrawerContentOutClick}
          isNotShowFileDetailContentLeftScrollBar={true}
        />
      </div>
    )
  }
}

ProcessDetailModal.defaultProps = {
  getContainer: '', // 对应的选择器对象, 即需要的挂载点
  process_detail_modal_visible: false, // 设置流程弹窗是否显示, 默认为false 不显示
  whetherUpdateWorkbenchPorcessListData: function() {}, // 修改访问控制后需要更新工作台中的代办列表 的回调
  updateParentProcessTempleteList: function() {}, // 内部数据修改后用来更新外部数据的回调
  request_flows_params: {}, // 接收的外部参数
  setProcessDetailModalVisibile: function() {} // 关闭弹窗的回调
}

//  只关联public中弹窗内的数据
function mapStateToProps({
  publicProcessDetailModal: {
    processInfo = {},
    currentFlowInstanceName,
    currentFlowInstanceDescription,
    isEditCurrentFlowInstanceName,
    isEditCurrentFlowInstanceDescription
  }
}) {
  return {
    processInfo,
    currentFlowInstanceName,
    currentFlowInstanceDescription,
    isEditCurrentFlowInstanceName,
    isEditCurrentFlowInstanceDescription
  }
}
