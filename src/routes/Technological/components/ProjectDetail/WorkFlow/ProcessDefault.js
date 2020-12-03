import React, { Component } from 'react'
import indexStyles from './index.less'
import TemplateContent from './component/TemplateContent'
import PagingnationContent from './component/PagingnationContent'
import { Tabs } from 'antd'
import { connect } from 'dva'
import ProcessDetailModal from '../../../../../components/ProcessDetailModal'
import { showDeleteTempleteConfirm } from '../../../../../components/ProcessDetailModal/components/handleOperateModal'
import { withRouter } from 'react-router-dom'
import QueryString from 'querystring'

const changeClientHeight = () => {
  const clientHeight = document.documentElement.clientHeight //获取页面可见高度
  return clientHeight
}
const TabPane = Tabs.TabPane
@connect(mapStateToProps)
class ProcessDefault extends Component {
  state = {
    clientHeight: changeClientHeight()
  }
  constructor() {
    super()
    this.resizeTTY.bind(this)
  }

  // 初始化数据
  initData = props => {
    const {
      dispatch,
      projectDetailInfoData: { board_id },
      location
    } = props
    // 兼容从工作台动态点击进入
    if (location.pathname.indexOf('/technological/projectDetail') !== -1) {
      const param = QueryString.parse(location.search.replace('?', ''))
      let board_id = param.board_id
      let appsSelectKey = param.appsSelectKey
      let flow_id = param.flow_id
      if (appsSelectKey == '2' && flow_id) {
        dispatch({
          type: 'publicProcessDetailModal/getProcessInfoByUrl',
          payload: {
            currentProcessInstanceId: flow_id
          }
        })
      }
    }

    dispatch({
      type: 'publicProcessDetailModal/getProcessTemplateList',
      payload: {
        id: board_id,
        board_id: board_id
      }
    })
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeTTY)
    this.initData(this.props)
  }

  componentWillReceiveProps(nextProps) {
    const {
      projectDetailInfoData: { board_id: oldBoardId }
    } = this.props
    const {
      projectDetailInfoData: { board_id }
    } = nextProps
    if (board_id && oldBoardId) {
      if (board_id && oldBoardId && board_id != oldBoardId) {
        this.initData(nextProps)
        return
        this.props.dispatch({
          type: 'publicProcessDetailModal/initData',
          payload: {
            calback: () => {
              setTimeout(() => {
                this.initData(nextProps)
              }, 200)
            }
          }
        })
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeTTY)
  }
  resizeTTY = () => {
    const clientHeight = changeClientHeight() //获取页面可见高度
    this.setState({
      clientHeight
    })
  }

  updateParentProcessTempleteList = () => {
    const {
      dispatch,
      projectDetailInfoData: { board_id }
    } = this.props
    dispatch({
      type: 'publicProcessDetailModal/getProcessTemplateList',
      payload: {
        id: board_id,
        board_id: board_id
      }
    })
  }

  // 新增模板点击事件
  handleAddTemplate = () => {
    this.props.dispatch({
      type: 'publicProcessDetailModal/updateDatas',
      payload: {
        processPageFlagStep: '1',
        process_detail_modal_visible: true,
        processEditDatas: []
      }
    })
  }

  // 编辑模板的点击事件
  handleEditTemplete = item => {
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
  }

  // 启动流程的点击事件
  handleStartProcess = item => {
    const { id } = item
    this.props.dispatch({
      type: 'publicProcessDetailModal/getTemplateInfo',
      payload: {
        id,
        processPageFlagStep: '3',
        process_detail_modal_visible: true
      }
    })
  }

  // 删除流程模板的点击事件
  handleDelteTemplete = item => {
    const {
      projectDetailInfoData: { board_id },
      dispatch
    } = this.props
    const { id } = item
    const processTempleteDelete = async () => {
      await dispatch({
        type: 'publicProcessDetailModal/deleteProcessTemplete',
        payload: {
          id,
          calback: () => {
            dispatch({
              type: 'publicProcessDetailModal/getProcessTemplateList',
              payload: {
                id: board_id,
                board_id: board_id
              }
            })
          }
        }
      })
    }
    showDeleteTempleteConfirm(processTempleteDelete)
  }

  // 流程实例的点击事件
  handleProcessInfo = id => {
    let that = this
    const { dispatch } = that.props
    dispatch({
      type: 'publicProcessDetailModal/getProcessInfo',
      payload: {
        id,
        calback: () => {
          dispatch({
            type: 'publicProcessDetailModal/updateDatas',
            payload: {
              processPageFlagStep: '4',
              process_detail_modal_visible: true
            }
          })
        }
      }
    })
  }

  tabsChange = key => {
    const {
      projectDetailInfoData: { board_id }
    } = this.props
    this.props.dispatch({
      type: 'publicProcessDetailModal/getProcessListByType',
      payload: {
        status: key,
        board_id
      }
    })
    this.props.dispatch({
      type: 'publicProcessDetailModal/updateDatas',
      payload: {
        currentFlowTabsStatus: key
      }
    })
  }

  renderFlowTabs = () => {
    const { clientHeight } = this.state
    const {
      processDoingList = [],
      processStopedList = [],
      processComepletedList = [],
      processNotBeginningList = [],
      currentFlowTabsStatus
    } = this.props
    return (
      <div>
        <Tabs
          defaultActiveKey="1"
          activeKey={currentFlowTabsStatus}
          onChange={this.tabsChange}
          tabBarStyle={{
            width: '100%',
            paddingTop: 0,
            fontSize: 16,
            background: 'rgba(216,216,216,0)',
            border: '1px solid #e8e8e8',
            padding: '0 46px 0 50px'
          }}
        >
          <TabPane
            tab={<div style={{ padding: 0, fontSize: 16 }}>进行中的流程 </div>}
            key="1"
          >
            {
              <PagingnationContent
                handleProcessInfo={this.handleProcessInfo}
                listData={processDoingList}
                status={'1'}
                clientHeight={clientHeight}
              />
            }
          </TabPane>
          <TabPane
            tab={<div style={{ padding: 0, fontSize: 16 }}>已中止的流程 </div>}
            key="2"
          >
            {
              <PagingnationContent
                handleProcessInfo={this.handleProcessInfo}
                listData={processStopedList}
                status={'2'}
                clientHeight={clientHeight}
              />
            }
          </TabPane>
          <TabPane
            tab={<div style={{ padding: 0, fontSize: 16 }}>已完成的流程 </div>}
            key="3"
          >
            {
              <PagingnationContent
                handleProcessInfo={this.handleProcessInfo}
                listData={processComepletedList}
                status={'3'}
                clientHeight={clientHeight}
              />
            }
          </TabPane>
          <TabPane
            tab={<div style={{ padding: 0, fontSize: 16 }}>未开始的流程 </div>}
            key="0"
          >
            {
              <PagingnationContent
                handleProcessInfo={this.handleProcessInfo}
                listData={processNotBeginningList}
                status={'0'}
                clientHeight={clientHeight}
              />
            }
          </TabPane>
        </Tabs>
      </div>
    )
  }

  render() {
    const { process_detail_modal_visible } = this.props
    const { clientHeight } = this.state
    return (
      <>
        <div className={indexStyles.processDefautOut}>
          <div className={indexStyles.processDefautOut_top}>
            <div className={indexStyles.title}>模板:</div>
            <TemplateContent
              handleAddTemplate={this.handleAddTemplate}
              handleEditTemplete={this.handleEditTemplete}
              handleStartProcess={this.handleStartProcess}
              handleDelteTemplete={this.handleDelteTemplete}
            />
          </div>
          {/*右方流程*/}
          <div className={indexStyles.processDefautOut_bottom}>
            {this.renderFlowTabs()}
          </div>
        </div>
        {process_detail_modal_visible && (
          <ProcessDetailModal
            process_detail_modal_visible={process_detail_modal_visible}
            updateParentProcessTempleteList={
              this.updateParentProcessTempleteList
            }
          />
        )}
      </>
    )
  }
}

export default withRouter(ProcessDefault)

function mapStateToProps({
  publicProcessDetailModal: {
    process_detail_modal_visible,
    processDoingList = [],
    processStopedList = [],
    processComepletedList = [],
    processNotBeginningList = [],
    currentFlowTabsStatus
  },
  projectDetail: {
    datas: { projectDetailInfoData = {} }
  }
}) {
  return {
    process_detail_modal_visible,
    processDoingList,
    processStopedList,
    processComepletedList,
    processNotBeginningList,
    projectDetailInfoData,
    currentFlowTabsStatus
  }
}
