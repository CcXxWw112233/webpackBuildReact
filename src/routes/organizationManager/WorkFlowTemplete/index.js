import React, { Component } from 'react'
import indexStyles from '../index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import FlowTabs from './FlowTabs'
import { connect } from 'dva'
import ProcessDetailModal from '../../../components/ProcessDetailModal'
import { Modal, message } from 'antd'
import { showDeleteTempleteConfirm } from '../../../components/ProcessDetailModal/components/handleOperateModal'
import { checkIsHasPermission } from '../../../utils/businessFunction'
import {
  ORG_TEAM_FLOW_TEMPLETE,
  NOT_HAS_PERMISION_COMFIRN,
  MESSAGE_DURATION_TIME
} from '../../../globalset/js/constant'
import { getTempleteQuoteCount } from '../../../services/organization'
import { isApiResponseOk } from '../../../utils/handleResponseData'

@connect(mapStateToProps)
export default class WorkFlowTemplete extends Component {
  constructor(props) {
    super(props)
    this.state = {
      whetherShowProcessDetailModalVisible: false
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'publicProcessDetailModal/getProcessTemplateList',
      payload: {
        _organization_id: localStorage.getItem('OrganizationId')
      }
    })
  }

  updateParentProcessTempleteList = () => {
    this.props.dispatch({
      type: 'publicProcessDetailModal/getProcessTemplateList',
      payload: {
        _organization_id: localStorage.getItem('OrganizationId')
      }
    })
  }

  // 关闭流程弹窗处理回调
  setProcessDetailModalVisibile = () => {
    this.setState({
      whetherShowProcessDetailModalVisible: false
    })
  }

  // 新建模板
  handleAddTemplete = e => {
    e && e.stopPropagation()
    // 判断是否有组织管理模板
    if (!checkIsHasPermission(ORG_TEAM_FLOW_TEMPLETE)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return
    }
    this.props.dispatch({
      type: 'publicProcessDetailModal/updateDatas',
      payload: {
        process_detail_modal_visible: true
      }
    })
    this.setState({
      whetherShowProcessDetailModalVisible: true
    })
  }

  // 编辑模板
  handleEditTemplete = (e, item) => {
    const { id, template_no } = item
    this.props.dispatch({
      type: 'publicProcessDetailModal/getTemplateInfo',
      payload: {
        id,
        processPageFlagStep: '2',
        currentTempleteIdentifyId: template_no,
        process_detail_modal_visible: true
      }
    })
    this.setState({
      whetherShowProcessDetailModalVisible: true
    })
  }

  getTempleteQuoteCount = id => {
    const { dispatch } = this.props
    getTempleteQuoteCount({ rela_id: id }).then(res => {
      if (isApiResponseOk(res)) {
        let count = res.data && res.data.length
        let title = '确认要删除模版吗？'
        let content = `删除该流程模板同时将取消其在${count}个自有模板中的引用，是否继续？`
        const processTempleteDelete = async () => {
          await dispatch({
            type: 'publicProcessDetailModal/deleteProcessTemplete',
            payload: {
              id,
              calback: () => {
                dispatch({
                  type: 'publicProcessDetailModal/getProcessTemplateList',
                  payload: {
                    _organization_id: localStorage.getItem('OrganizationId')
                  }
                })
              }
            }
          })
        }
        if (count) {
          showDeleteTempleteConfirm({ processTempleteDelete, title, content })
        } else {
          showDeleteTempleteConfirm({ processTempleteDelete })
        }
      }
    })
  }

  // 删除流程模板的点击事件
  handleDelteTemplete = (e, item) => {
    const { dispatch } = this.props
    const { id } = item
    this.getTempleteQuoteCount(id)
    return
    const processTempleteDelete = async () => {
      await dispatch({
        type: 'publicProcessDetailModal/deleteProcessTemplete',
        payload: {
          id,
          calback: () => {
            dispatch({
              type: 'publicProcessDetailModal/getProcessTemplateList',
              payload: {
                _organization_id: localStorage.getItem('OrganizationId')
              }
            })
          }
        }
      })
    }
    showDeleteTempleteConfirm(processTempleteDelete)
  }

  render() {
    const {
      process_detail_modal_visible,
      isEditCurrentFlowInstanceName
    } = this.props
    const { whetherShowProcessDetailModalVisible } = this.state
    return (
      <div
        id={'workFlowTempleteContent'}
        className={`${indexStyles.workFlowTempleteContent} ${globalStyles.global_vertical_scrollbar}`}
      >
        <div className={indexStyles.wflow_top}>
          <div className={indexStyles.wflow_name}>工作流模板</div>
          <div
            className={indexStyles.wflow_add_tem}
            onClick={this.handleAddTemplete}
          >
            <span>新建模板</span>
            <span className={globalStyles.authTheme}>&#xe846;</span>
          </div>
        </div>
        <div className={indexStyles.wflow_bottom}>
          <FlowTabs
            handleEditTemplete={this.handleEditTemplete}
            handleDelteTemplete={this.handleDelteTemplete}
          />
        </div>
        <div
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
        >
          {process_detail_modal_visible &&
            whetherShowProcessDetailModalVisible && (
              <ProcessDetailModal
                process_detail_modal_visible={process_detail_modal_visible}
                setProcessDetailModalVisibile={
                  this.setProcessDetailModalVisibile
                }
                updateParentProcessTempleteList={
                  this.updateParentProcessTempleteList
                }
                getContainer={document.getElementById('organizationOut')}
              />
            )}
        </div>
      </div>
    )
  }
}

function mapStateToProps({
  publicProcessDetailModal: {
    process_detail_modal_visible,
    processTemplateList = []
  },
  technological: {
    datas: { userOrgPermissions = [] }
  }
}) {
  return {
    process_detail_modal_visible,
    processTemplateList,
    userOrgPermissions
  }
}
