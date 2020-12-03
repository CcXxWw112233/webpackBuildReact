import React, { Component } from 'react'
import Templates from './Templates'
import FlowInstances from './FlowInstances'
import styles from './index.less'
import { connect } from 'dva'
import ProcessDetailModal from '../../../../../components/ProcessDetailModal'

@connect(mapStateToProps)
export default class index extends Component {
  constructor(props) {
    super(props)
  }
  componentDidMount() {}
  request_flows_params = () => {
    const { board_id } = this.props.simplemodeCurrentProject
    return {
      request_board_id: board_id || '0',
      _organization_id: localStorage.getItem('OrganizationId') || '0'
    }
  }
  updateParentProcessTempleteList = () => {
    const { dispatch } = this.props
    const { board_id } = this.props.simplemodeCurrentProject
    dispatch({
      type: 'publicProcessDetailModal/getProcessTemplateList',
      payload: {
        board_id: board_id || '0',
        _organization_id: localStorage.getItem('OrganizationId') || '0'
      }
    })
  }
  render() {
    const {
      process_detail_modal_visible,
      workbenchBoxContent_height
    } = this.props
    return (
      <div
        className={styles.main_out}
        style={
          workbenchBoxContent_height > 0
            ? { height: workbenchBoxContent_height + 'px' }
            : {}
        }
      >
        <div className={styles.main}>
          <div className={styles.main_top}></div>
          <div className={styles.main_contain}>
            <div className={styles.contain_left}>
              <Templates
                request_flows_params={this.request_flows_params()}
                updateParentProcessTempleteList={
                  this.updateParentProcessTempleteList
                }
              />
            </div>
            <div className={styles.contain_right}>
              <FlowInstances
                workbenchBoxContent_height={workbenchBoxContent_height}
              />
            </div>
          </div>
        </div>
        {process_detail_modal_visible && (
          <ProcessDetailModal
            updateParentProcessTempleteList={
              this.updateParentProcessTempleteList
            }
            request_flows_params={this.request_flows_params()}
            process_detail_modal_visible={process_detail_modal_visible}
          />
        )}
      </div>
    )
  }
}

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
  simplemode: { simplemodeCurrentProject = {} },
  publicProcessDetailModal: { process_detail_modal_visible }
}) {
  return {
    simplemodeCurrentProject,
    process_detail_modal_visible
  }
}
