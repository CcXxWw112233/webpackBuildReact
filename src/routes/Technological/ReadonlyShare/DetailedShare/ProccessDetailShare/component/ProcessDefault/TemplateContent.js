import React from 'react'
import indexStyles from '../../index.less'
import { Modal } from 'antd'
import {
  PROJECT_FLOWS_FLOW_TEMPLATE,
  NOT_HAS_PERMISION_COMFIRN,
  MESSAGE_DURATION_TIME
} from '../../../../../../../globalset/js/constant'
import { checkIsHasPermissionInBoard } from '../../../../../../../utils/businessFunction'
import { Collapse } from 'antd'
import TemplateItem from './TemplateItem'
import { message } from 'antd/lib/index'
import {
  processEditDatasConstant,
  processEditDatasRecordsConstant
} from '../../constant'
import { connect } from 'dva'

@connect(mapStateToProps)
export default class TemplateContent extends React.Component {
  state = {}
  templateStartClick({ id }) {
    const { dispatch } = this.props
    dispatch({
      type: 'projectDetailProcess/getTemplateInfo',
      payload: {
        id
      }
    })
  }
  deleteTemplate({ id }) {
    const { dispatch } = this.props
    Modal.confirm({
      title: `确认删除该模板？`,
      zIndex: 2000,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        dispatch({
          type: 'projectDetailProcess/deleteProcessTemplate',
          payload: {
            id
          }
        })
      }
    })
  }
  startEdit() {
    if (!checkIsHasPermissionInBoard(PROJECT_FLOWS_FLOW_TEMPLATE)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const { dispatch } = this.props
    dispatch({
      type: 'projectDetailProcess/updateDatas',
      payload: {
        processInfo: {},
        processPageFlagStep: '2',
        node_type: '1', //节点类型
        processCurrentEditStep: 0, //编辑第几步，默认 0
        processEditDatas: JSON.parse(JSON.stringify(processEditDatasConstant)), //json数组，每添加一步编辑内容往里面put进去一个obj,刚开始默认含有一个里程碑的
        processEditDatasRecords: JSON.parse(
          JSON.stringify(processEditDatasRecordsConstant)
        ), //每一步的每一个类型，记录，数组的全部数据step * type
        currentProcessInstanceId: ''
      }
    })
  }

  render() {
    const { processTemplateList = [], dispatch } = this.props
    const { clientHeight } = this.props
    const maxContentHeight = clientHeight - 108 - 160
    return (
      <div className={indexStyles.content}>
        <div
          className={indexStyles.paginationContent}
          style={{ maxHeight: maxContentHeight }}
        >
          {processTemplateList.map((value, key) => {
            const { id } = value
            return (
              <TemplateItem key={id} itemValue={value} dispatch={dispatch} />
            )
          })}
        </div>
        {checkIsHasPermissionInBoard(PROJECT_FLOWS_FLOW_TEMPLATE) && (
          <div className={indexStyles.add} onClick={this.startEdit.bind(this)}>
            新增模板
          </div>
        )}
      </div>
    )
  }
}
function mapStateToProps({
  projectDetailProcess: {
    datas: { processTemplateList = [] }
  },
  technological: {
    datas: { userBoardPermissions }
  }
}) {
  return { processTemplateList, userBoardPermissions }
}
