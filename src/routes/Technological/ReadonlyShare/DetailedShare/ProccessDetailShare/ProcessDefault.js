import React from 'react'
import indexStyles from './index.less'
import { Tabs } from 'antd'
import PagingnationContent from './component/ProcessDefault/PagingnationContent'
import TemplateContent from './component/ProcessDefault/TemplateContent'
import { connect } from 'dva'
const TabPane = Tabs.TabPane

const changeClientHeight = () => {
  const clientHeight = document.documentElement.clientHeight;//获取页面可见高度
  return clientHeight
}

@connect(mapStateToProps)
export default class ProcessDefault extends React.Component {
  state = {
    clientHeight: changeClientHeight()
  }
  constructor() {
    super()
    this.resizeTTY.bind(this)
  }
  componentDidMount() {
    window.addEventListener('resize', this.resizeTTY)
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeTTY)
  }
  resizeTTY = () => {
    const clientHeight = changeClientHeight();//获取页面可见高度
    this.setState({
      clientHeight
    })
  }
  handleMenuReallyClick = (e) => {
    const { key } = e
    if (!key) {
      return false
    }
    const { processTemplateList = [], dispatch } = this.props
    const { template_id } = processTemplateList[Number(key)]
    //此处为启动流程界面查询逻辑(查询模板信息)
    dispatch({
      type: 'projectDetailProcess/getTemplateInfo',
      payload: {
        id: template_id
      }
    })
  }
  startEdit() {
    const { dispatch } = this.props
    dispatch({
      type: 'projectDetailProcess/updateDatas',
      payload: {
        processPageFlagStep: '2'
      }
    })
  }

  tabsChange() {

  }

  render() {
    const { clientHeight } = this.state
    const { board_id, processDoingList = [], processStopedList = [], processComepletedList = [] } = this.props
    const flowTabs = () => {
      return (
        <Tabs defaultActiveKey="1" onChange={this.tabsChange.bind(this)} tabBarStyle={{ marginLeft: 26, width: '100%', maxWidth: 1100, paddingTop: 0, fontSize: 16 }}>
          <TabPane tab={<div style={{ padding: 0, fontSize: 16 }}>进行中 </div>} key="1">{<PagingnationContent listData={processDoingList} status={'1'} clientHeight={clientHeight} />}</TabPane>
          <TabPane tab={<div style={{ padding: 0, fontSize: 16 }}>已终止 </div>} key="2">{<PagingnationContent listData={processStopedList} status={'2'} clientHeight={clientHeight} />}</TabPane>
          <TabPane tab={<div style={{ padding: 0, fontSize: 16 }}>已完成 </div>} key="3">{<PagingnationContent listData={processComepletedList} status={'3'} clientHeight={clientHeight} />}</TabPane>
        </Tabs>
      )
    }

    return (
      <div className={indexStyles.processDefautOut}>
        <div className={indexStyles.processDefautOut_left}>
          <div className={indexStyles.title}>模板</div>
          <TemplateContent clientHeight={clientHeight} />
        </div>
        {/*右方流程*/}
        <div className={indexStyles.processDefautOut_right}>
          {flowTabs()}
        </div>
      </div>
    )
  }
}

function mapStateToProps({
  projectDetailProcess: {
    datas: {
      processTemplateList = [],
      processDoingList = [],
      processStopedList = [],
      processComepletedList = [],
      processPageFlagStep
    }
  },
  projectDetailProcess: {
    datas: {
      board_id
    }
  }
}) {
  return {
    processPageFlagStep,
    processTemplateList,
    processDoingList,
    processStopedList,
    processComepletedList,
    board_id
  }
}