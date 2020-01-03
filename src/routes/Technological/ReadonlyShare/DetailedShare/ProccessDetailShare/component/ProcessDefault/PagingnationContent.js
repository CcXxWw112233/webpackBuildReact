import React from 'react'
import indexStyles from '../../index.less'
import { Avatar, message } from 'antd'
import {
  PROJECT_FLOW_FLOW_ACCESS,
  NOT_HAS_PERMISION_COMFIRN,
  MESSAGE_DURATION_TIME
} from "../../../../../../../globalset/js/constant";
import {
  checkIsHasPermissionInBoard,
} from "../../../../../../../utils/businessFunction";
import { Collapse } from 'antd';
import { getProcessListByType } from "../../../../../../../services/technological/process";
import nodataImg from '../../../../../../../assets/projectDetail/process/Empty@2x.png'
import FlowsInstanceItem from './FlowsInstanceItem'
import { connect } from 'dva';
import ProcessDetailModalContainer from './ProcessDetailModalContainer'
const Panel = Collapse.Panel;

@connect(mapStateToProps)
export default class PagingnationContent extends React.Component {
  state = {
    previewProccessModalVisibile: this.props.processDetailModalVisible,
    page_number: 1,
    page_size: 20,
    loadMoreDisplay: 'none',
    scrollBlock: true, //滚动加载锁，true可以加载，false不执行滚动操作
  }

  componentDidMount() {
    this.getProcessListByType()
  }
  componentWillUnmount() {

  }
  //分页逻辑
  async getProcessListByType() {
    const { board_id, processDoingList = [], processStopedList = [], processComepletedList = [] } = this.props
    const { page_number, page_size, } = this.state
    const { listData = [], status, dispatch } = this.props
    const obj = {
      // page_number,
      // page_size,
      status,
      board_id
    }
    this.setState({
      loadMoreText: '加载中...'
    })
    const res = await getProcessListByType(obj)
    // console.log('this is getProcessListByType s result:', res)
    if (res.code === '0') {
      const data = res.data
      let listName
      let selectList = []
      switch (status) {
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

      dispatch({
        type: 'projectDetailProcess/updateDatas',
        payload: {
          [listName]: page_number == 1 ? data : [].concat(listData, data)
        }
      })
      this.setState({
        scrollBlock: !(data.length < page_size),
      }, () => {
        this.setState({
          loadMoreDisplay: listData.length ? 'block' : 'none',
          loadMoreText: (data.length < page_size) ? '暂无更多数据' : '加载更多',
        })
      })
    }
  }

  contentBodyScroll(e) {
    if (e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight < 20) {
      const { scrollBlock } = this.state
      if (!scrollBlock) {
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
    const { dispatch } = this.props
    dispatch({
      type: 'projectDetailProcess/updateDatas',
      payload: {
        processDetailModalVisible: false
      }
    })
  }
  //getProcessListByType
  async processItemClick(obj) {
    // if (!checkIsHasPermissionInBoard(PROJECT_FLOW_FLOW_ACCESS)) {
    //   message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
    //   return false
    // }
    const { dispatch } = this.props
    await dispatch({
      type: 'projectDetailProcess/getWorkFlowComment',
      payload: {
        flow_instance_id: obj.flow
      }
    })
    await dispatch({
      type: 'projectDetailProcess/getProcessInfo',
      payload: {
        id: obj.flow
      }
    })
    await dispatch({
      type: 'projectDetailProcess/getWorkFlowComment',
      payload: {
        flow_instance_id: obj.flow
      }
    })

    dispatch({
      type: 'projectDetailProcess/updateDatas',
      payload: {
        currentProcessInstanceId: obj.flow,
        totalId: obj
      }
    })

    dispatch({
      type: 'workbenchTaskDetail/projectDetailInfo',
      payload: {
        id: obj.board
      }
    })

    await this.setState({
      previewProccessModalVisibile: !this.state.previewProccessModalVisibile
    });
  }

  // 数组去重
  arrayNonRepeatfy = arr => {
    let temp_arr = []
    let temp_id = []
    for (let i = 0; i < arr.length; i++) {
      if (!temp_id.includes(arr[i]['id'])) {//includes 检测数组是否有某个值
        temp_arr.push(arr[i]);
        temp_id.push(arr[i]['id'])
      }
    }
    return temp_arr
  }

  commonProcessVisitControlUpdateCurrentModalData = (newProcessInfo, type) => {
    const { dispatch, board_id, processInfo = {} } = this.props
    const { status } = processInfo
    dispatch({
      type: 'projectDetailProcess/updateDatas',
      payload: {
        processInfo: newProcessInfo
      }
    })
    if (type) {
      dispatch({
        type: 'projectDetailProcess/getProcessListByType',
        payload: {
          status: status,
          board_id: board_id
        }
      })
    }     
  }

  // 访问控制中流程操作
  visitControlUpdateCurrentModalData = obj => {
    const { processInfo = {} } = this.props
    const { privileges = [] } = processInfo

    // 访问控制开关
    if (obj && obj.type && obj.type == 'privilege') {
      let new_privileges = [...privileges]
      for (let item in obj) {
        if (item == 'privileges') {
          obj[item].map(val => {
            let temp_arr = this.arrayNonRepeatfy([].concat(...privileges, val))
            if (temp_arr && !temp_arr.length) return false
            return new_privileges = [...temp_arr]
          })
        }
      }
      let newProcessInfo = {...processInfo, privileges: new_privileges, is_privilege: obj.is_privilege}
      // this.props.updateDatasProcess({
      //   processInfo: newProcessInfo
      // });
      // 这是需要获取一下流程列表 区分工作台和项目列表
      this.commonProcessVisitControlUpdateCurrentModalData(newProcessInfo, obj.type)
      
    };

    // 访问控制添加
    if (obj && obj.type && obj.type == 'add') {
      let new_privileges = []
      for (let item in obj) {
        if (item == 'privileges') {
          obj[item].map(val => {
            let temp_arr = this.arrayNonRepeatfy([].concat(...privileges, val))
            return new_privileges = [...temp_arr]
          })
        }
      }
      let newProcessInfo = {...processInfo, privileges: new_privileges}
      this.commonProcessVisitControlUpdateCurrentModalData(newProcessInfo)
    }

    // 访问控制移除
    if (obj && obj.type && obj.type == 'remove') {
      let new_privileges = [...privileges]
      new_privileges.map((item, index) => {
        if (item.id == obj.removeId) {
          new_privileges.splice(index, 1)
        }
      })
      let newProcessInfo = {...processInfo, privileges: new_privileges, is_privilege: obj.is_privilege}
      this.commonProcessVisitControlUpdateCurrentModalData(newProcessInfo)
    }

    // 这是更新type类型
    if (obj && obj.type && obj.type == 'change') {
      let { id, content_privilege_code, user_info } = obj.temp_arr
      let new_privileges = [...privileges]
      new_privileges = new_privileges.map((item) => {
        let new_item = item
        if (item.id == id) {
          new_item = {...item, content_privilege_code: obj.code}
        } else {
          new_item = {...item}
        }
        return new_item
      })
      let newProcessInfo = {...processInfo, privileges: new_privileges}
      this.commonProcessVisitControlUpdateCurrentModalData(newProcessInfo)
    }

  }


  render() {
    const { processDoingList = [], processStopedList = [], processComepletedList = [], dispatch, projectDetailInfoData = {} } = this.props
    const { clientHeight, listData = [], status } = this.props
    const { data = [] } = projectDetailInfoData
    const maxContentHeight = clientHeight - 108 - 150
    const allStep = []
    for (let i = 0; i < 20; i++) {
      allStep.push(i)
    }

    return (
      <div
        className={indexStyles.paginationContent}
        style={{ maxHeight: maxContentHeight }}
        onScroll={this.contentBodyScroll.bind(this)}>
        <Collapse
          bordered={false}
          style={{ backgroundColor: '#f5f5f5', marginTop: 4 }}>
          {listData.map((value, key) => {
            const { id } = value
            return (
              <Panel key={id}
                style={customPanelStyle}
                header={
                  <FlowsInstanceItem
                    itemValue={value}
                    status={status}
                    dispatch={dispatch}
                    listDataObj={{
                      processDoingList,
                      processStopedList,
                      processComepletedList
                    }}
                    processItemClick={this.processItemClick.bind(this)} />} />
            )
          })}
        </Collapse>
        {/*{listData.map((value, key) => {*/}
        {/*return (*/}
        {/*<FlowsInstanceItem itemValue={value} processItemClick={this.processItemClick.bind(this)}/>*/}
        {/*)*/}
        {/*})}*/}
        {!listData.length || !listData ? (
          <div className={indexStyles.nodata} style={{ height: maxContentHeight - 30 }} >
            <div className={indexStyles.nodata_inner}>
              <img src={nodataImg} />
              <div>暂无数据</div>
            </div>
          </div>
        ) : ('')}
        {/* <div className={indexStyles.Loading} style={{display: loadMoreDisplay }}>{loadMoreText}</div> */}
        <ProcessDetailModalContainer
          status={status}
          getProcessListByType={this.getProcessListByType.bind(this)}
          close={this.close.bind(this)}
          modalVisible={this.state.previewProccessModalVisibile}
          visitControlUpdateCurrentModalData={this.visitControlUpdateCurrentModalData}
          principalList={data}
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
function mapStateToProps({
  projectDetailProcess: {
    datas: {
      processTemplateList = [],
      processDoingList = [],
      processStopedList = [],
      processComepletedList = [],
      processDetailModalVisible,
      processInfo = {}
    }
  },
  projectDetail: {
    datas: {
      board_id,
      projectDetailInfoData = {}
    }
  },

}) {
  return {
    processDetailModalVisible,
    processTemplateList,
    processDoingList,
    processStopedList,
    processComepletedList,
    board_id,
    processInfo,
    projectDetailInfoData
  }
}