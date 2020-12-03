import React, { Component } from 'react'
import styles from './index.less'
import { Radio, Button } from 'antd'
import FlowTables from './FlowTables'
import { connect } from 'dva'
import { isPaymentOrgUser } from '../../../../../utils/businessFunction'
@connect(mapStateToProps)
export default class FlowInstances extends Component {
  constructor(props) {
    super(props)
    this.state = {
      list_type: '1', //1,2,3,0  进行/中止/完成/未开始
      list_source: []
    }
  }
  componentDidMount() {
    this.getFlowsList(this.state.list_type, this.props.simplemodeCurrentProject)
  }
  componentWillReceiveProps(nextProps) {
    this.setSourceList(nextProps)
    const { board_id } = this.props.simplemodeCurrentProject
    const { board_id: next_board_id } = nextProps.simplemodeCurrentProject
    if (board_id != next_board_id) {
      //切换项目时做请求
      this.getFlowsList(
        this.state.list_type,
        nextProps.simplemodeCurrentProject
      )
    }
  }
  // 获取流程列表
  getFlowsList = (status, simplemodeCurrentProject = {}) => {
    const { dispatch, currentSelectOrganize } = this.props
    const { board_id } = simplemodeCurrentProject
    const { id } = currentSelectOrganize
    dispatch({
      type: 'publicProcessDetailModal/getProcessListByType',
      payload: {
        status,
        board_id: board_id || '0',
        _organization_id: id || '0'
      }
    })
  }
  handleSizeChange = e => {
    const { value } = e.target
    this.setState({ list_type: value }, () => {
      this.getFlowsList(value, this.props.simplemodeCurrentProject)
    })
  }
  setSourceList = props => {
    const { list_type } = this.state
    const {
      processDoingList = [],
      processStopedList = [],
      processComepletedList = [],
      processNotBeginningList = []
    } = props
    let arr = []
    if ('1' == list_type) {
      arr = processDoingList
    } else if ('2' == list_type) {
      arr = processStopedList
    } else if ('3' == list_type) {
      arr = processComepletedList
    } else if ('0' == list_type) {
      arr = processNotBeginningList
    } else {
    }
    this.setState({
      list_source: arr.filter(item => isPaymentOrgUser(item.org_id))
    })
  }
  render() {
    const { list_type, list_source = [] } = this.state
    return (
      <>
        <div className={styles.flows_top}>
          <div className={styles.flows_top_title}>流程列表</div>
          <div className={styles.flows_top_operate}>
            <Radio.Group value={list_type} onChange={this.handleSizeChange}>
              <Radio.Button value="1">进行中</Radio.Button>
              <Radio.Button value="2">已中止</Radio.Button>
              <Radio.Button value="3">已完成</Radio.Button>
              <Radio.Button value="0">未开始</Radio.Button>
            </Radio.Group>
          </div>
        </div>
        <div className={styles.flows_bott}>
          <FlowTables
            list_type={list_type}
            list_source={list_source}
            workbenchBoxContent_height={this.props.workbenchBoxContent_height}
          />
        </div>
      </>
    )
  }
}

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
  publicProcessDetailModal: {
    processDoingList = [], // 进行中的流程
    processStopedList = [], // 已中止的流程
    processComepletedList = [], // 已完成的流程
    processNotBeginningList = [] // 未开始的流程
  },
  simplemode: { simplemodeCurrentProject = {} },
  technological: {
    datas: { currentSelectOrganize = {} }
  }
}) {
  return {
    processDoingList,
    processStopedList,
    processComepletedList,
    processNotBeginningList,
    simplemodeCurrentProject,
    currentSelectOrganize
  }
}
