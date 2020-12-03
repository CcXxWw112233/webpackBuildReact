import React, { Component } from 'react'
import indexStyles from '../index.less'
import FlowsInstanceItem from './FlowsInstanceItem'
import { getProcessListByType } from '../../../../../../services/technological/workFlow'
import nodataImg from '../../../../../../assets/projectDetail/process/empty-box.png'
import { connect } from 'dva'
import globalStyles from '@/globalset/css/globalClassName.less'
@connect(mapStateToProps)
export default class PagingnationContent extends Component {
  state = {
    page_number: 1,
    page_size: 20,
    loadMoreDisplay: 'none',
    scrollBlock: true //滚动加载锁，true可以加载，false不执行滚动操作
  }

  componentDidMount() {
    this.getProcessListByType(this.props)
  }

  componentWillReceiveProps(nextProps) {
    const {
      projectDetailInfoData: { board_id: oldBoardId }
    } = this.props
    const {
      projectDetailInfoData: { board_id }
    } = nextProps
    if (board_id && oldBoardId) {
      if (board_id != oldBoardId) {
        this.getProcessListByType(nextProps)
      }
    }
  }

  //分页逻辑
  async getProcessListByType(props) {
    const {
      projectDetailInfoData: { board_id },
      processDoingList = [],
      processStopedList = [],
      processComepletedList = [],
      processNotBeginningList = []
    } = props
    const { page_number, page_size } = this.state
    const { listData = [], currentFlowTabsStatus, dispatch } = props
    const obj = {
      // page_number,
      // page_size,
      status: currentFlowTabsStatus || '1',
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
      switch (currentFlowTabsStatus) {
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
        case '0':
          listName = 'processNotBeginningList'
          selectList = processNotBeginningList
          break
        default:
          listName = 'processDoingList'
          selectList = processDoingList
          break
      }

      dispatch({
        type: 'publicProcessDetailModal/updateDatas',
        payload: {
          [listName]: page_number == 1 ? data : [].concat(listData, data)
        }
      })
      this.setState(
        {
          scrollBlock: !(data.length < page_size)
        },
        () => {
          this.setState({
            loadMoreDisplay: listData.length ? 'block' : 'none',
            loadMoreText: data.length < page_size ? '暂无更多数据' : '加载更多'
          })
        }
      )
    }
  }

  contentBodyScroll = e => {
    return
    // if (
    //   e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight <
    //   20
    // ) {
    //   console.log('进来了', 'sssssssssssssssssss_我的天')
    //   const { scrollBlock } = this.state
    //   if (!scrollBlock) {
    //     return false
    //   }
    //   this.setState(
    //     {
    //       page_number: ++this.state.page_number,
    //       scrollBlock: false
    //     },
    //     () => {
    //       this.getProcessListByType()
    //     }
    //   )
    // }
  }

  render() {
    const {
      clientHeight,
      listData = [],
      status,
      processDoingList = [],
      processStopedList = [],
      processComepletedList = [],
      processNotBeginningList = []
    } = this.props
    const maxContentHeight = clientHeight - 108 - 150
    return (
      <div
        className={`${indexStyles.pagingnationContent} ${globalStyles.global_vertical_scrollbar}`}
        onScroll={this.contentBodyScroll}
        style={{ maxHeight: maxContentHeight, overflowY: 'auto' }}
      >
        {listData.map((value, key) => {
          return (
            <FlowsInstanceItem
              itemValue={value}
              itemKey={key}
              status={status}
              listDataObj={{
                processDoingList,
                processStopedList,
                processComepletedList,
                processNotBeginningList
              }}
              handleProcessInfo={this.props.handleProcessInfo}
            />
          )
        })}
        {!listData.length || !listData ? (
          <div
            className={indexStyles.nodata}
            style={{ height: maxContentHeight - 30 }}
          >
            <div className={indexStyles.nodata_inner}>
              <img src={nodataImg} />
              <div>还没有流程，赶快新建一个吧</div>
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
    )
  }
}

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
