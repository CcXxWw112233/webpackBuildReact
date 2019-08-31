import React from 'react'
import indexStyles from '../../index.less'
import { Avatar, message } from 'antd'
import {
  PROJECT_FLOW_FLOW_ACCESS, TASKS, FLOWS, DASHBOARD, PROJECTS, FILES, MEMBERS, CATCH_UP,
  NOT_HAS_PERMISION_COMFIRN, ORG_TEAM_BOARD_QUERY, MESSAGE_DURATION_TIME
} from "../../../../../../../globalset/js/constant";
import {
  currentNounPlanFilterName, checkIsHasPermissionInBoard,
  checkIsHasPermission, setStorage
} from "../../../../../../../utils/businessFunction";
import globalStyles from '../../../../../../../globalset/css/globalClassName.less'
import { Collapse } from 'antd';
import {getProcessListByType} from "../../../../../../../services/technological/process";
import nodataImg from '../../../../../../../assets/projectDetail/process/Empty@2x.png'
import ProccessDetailModal from '../../../../Workbench/CardContent/Modal/ProccessDetailModal'
import FlowsInstanceItem from './FlowsInstanceItem'

const Panel = Collapse.Panel;

export default class PagingnationContent extends React.Component {
  state = {
    previewProccessModalVisibile: this.props.model.datas.processDetailModalVisible,
    page_number: 1,
    page_size: 20,
    loadMoreDisplay: 'none',
    scrollBlock: true, //滚动加载锁，true可以加载，false不执行滚动操作
  }

  componentDidMount() {
    this.getProcessListByType()
  }
  componentWillUnmount() {
    // const { status } = this.props
    // let listName
    // switch (status ) {
    //   case '1':
    //     listName = 'processDoingList'
    //     break
    //   case '2':
    //     listName = 'processStopedList'
    //     break
    //   case '3':
    //     listName = 'processComepletedList'
    //     break
    //   default:
    //     listName = 'processDoingList'
    //     break
    // }
    // this.props.updateDatasProcess({
    //   [listName]: [],
    // })
  }
    //分页逻辑
  async getProcessListByType() {
    const { datas: { board_id, processDoingList = [], processStopedList = [], processComepletedList = [] } } = this.props.model
    const { page_number, page_size, } = this.state
    const { listData = [], status, } = this.props
    const obj = {
      page_number,
      page_size,
      status,
      board_id
    }
    this.setState({
      loadMoreText: '加载中...'
    })
    const res = await getProcessListByType(obj)
    // console.log('this is getProcessListByType s result:', res)
    if(res.code === '0') {
      const data = res.data
      let listName
      let selectList = []
      switch (status ) {
        case '1':
          listName = 'processDoingList'
          selectList = processDoingList
          break
        case '2':
          listName = 'processStopedList'
          selectList = processStopedList
          break
        case '3':
          listName = 'processComepletedList'
          selectList = processComepletedList
          break
        default:
          listName = 'processDoingList'
          selectList = processDoingList
          break
      }
      this.props.updateDatasProcess({
        [listName]: page_number == 1?data: [].concat(listData, data)
      })
      this.setState({
        scrollBlock: !(data.length < page_size),
      }, () => {
        this.setState({
          loadMoreDisplay: listData.length ? 'block' : 'none',
          loadMoreText: (data.length < page_size)?'暂无更多数据': '加载更多',
        })
      })
    }
  }

  contentBodyScroll(e) {
    if(e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight < 20) {
      const { scrollBlock } = this.state
      if(!scrollBlock) {
        return false
      }
      this.setState({
        page_number: ++this.state.page_number,
        scrollBlock: false
      }, () => {
        this.getProcessListByType()
      })
    }
  }
  close() {
    this.setState({
      previewProccessModalVisibile: false
    })
    this.props.updateDatas({
      processDetailModalVisible: false
    })
  }
  //getProcessListByType
  async processItemClick(obj) {
    if (!checkIsHasPermissionInBoard(PROJECT_FLOW_FLOW_ACCESS)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }

    await this.props.getWorkFlowComment({flow_instance_id: obj.flow})

    await this.props.dispatch({
      type: 'projectDetailProcess/getProcessInfo',
      payload: {
        id: obj.flow
      }
    })

    this.props.updateDatasProcess && this.props.updateDatasProcess({
      currentProcessInstanceId: obj.flow
    })

    await this.props.updateDatas({
      totalId: obj
    })

    await this.props.getProjectDetailInfo({id: obj.board})


    await this.setState({
      previewProccessModalVisibile: !this.state.previewProccessModalVisibile
    });
  }
  render() {
    const { datas: { processDoingList = [], processStopedList = [], processComepletedList = [] } } = this.props.model
    const { clientHeight, listData = [], status } = this.props
    const { loadMoreDisplay, loadMoreText } = this.state
    const maxContentHeight = clientHeight - 108 - 150
    const allStep = []
    for(let i = 0; i < 20; i ++) {
      allStep.push(i)
    }

    return (
      <div
        className={indexStyles.paginationContent}
        style={{maxHeight: maxContentHeight}}
        onScroll={this.contentBodyScroll.bind(this)}>
        <Collapse
            bordered={false}
            style={{backgroundColor: '#f5f5f5', marginTop: 4}}>
            {listData.map((value, key) => {
              const { id } = value
              return (
                <Panel key={id}
                       style={customPanelStyle}
                       header={
                  <FlowsInstanceItem
                   itemValue={value}
                   status={status}
                   dispatch={this.props.dispatch}
                   listDataObj={{
                     processDoingList,
                     processStopedList,
                     processComepletedList
                   }}
                   processItemClick={this.processItemClick.bind(this)}/>}/>
              )
            })}
          </Collapse>
        {/*{listData.map((value, key) => {*/}
          {/*return (*/}
            {/*<FlowsInstanceItem itemValue={value} processItemClick={this.processItemClick.bind(this)}/>*/}
          {/*)*/}
        {/*})}*/}
        {!listData.length || !listData?(
          <div className={indexStyles.nodata} style={{height: maxContentHeight - 30}} >
            <div className={indexStyles.nodata_inner}>
              <img src={nodataImg} />
              <div>暂无数据</div>
            </div>
          </div>
        ): ('')}
        <div className={indexStyles.Loading} style={{display: loadMoreDisplay }}>{loadMoreText}</div>
        <ProccessDetailModal
          {...this.props}
          status = {this.props.status}
          getProcessListByType = {this.getProcessListByType.bind(this)}
          close = {this.close.bind(this)}
          modalVisible={this.state.previewProccessModalVisibile}
        />
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
