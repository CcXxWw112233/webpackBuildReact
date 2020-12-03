import React from 'react'
import { Modal, Form, Button, Input, message, Select, Icon } from 'antd'
import { min_page_width } from './../../../globalset/js/styles'
import { getGlobalSearchResultList } from '../../../services/technological'
import indexstyles from './index.less'
import globalStyles from './../../../globalset/css/globalClassName.less'

import { connect } from 'dva/index'
import MeetingItem from './MeetingItem'
import TaskItem from './TaskItem'
import BoardItem from './BoardItem'
import FlowItem from './FlowItem'
import FileItem from './FileItem'

const FormItem = Form.Item
const TextArea = Input.TextArea
const InputGroup = Input.Group
const Option = Select.Option

//此弹窗应用于各个业务弹窗，和右边圈子适配
const getEffectOrReducerByName = name => `globalSearch/${name}`
@connect(mapStateToProps)
export default class PaginResult extends React.Component {
  state = {
    loadMoreDisplay: 'none',
    scrollBlock: true //滚动加载锁，true可以加载，false不执行滚动操作
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type: getEffectOrReducerByName('getGlobalSearchResultList'),
      payload: {}
    })
  }

  componentWillReceiveProps(nextProps) {}

  //分页逻辑
  async getGlobalSearchResultList() {
    const {
      page_number,
      page_size,
      searchInputValue,
      defaultSearchType,
      dispatch
    } = this.props
    const { listData = [], status } = this.props

    const obj = {
      page_number,
      page_size,
      search_type: defaultSearchType,
      search_term: searchInputValue
    }
    dispatch({
      type: getEffectOrReducerByName('getGlobalSearchResultList'),
      payload: {
        ...obj
      }
    })
  }

  contentBodyScroll(e) {
    if (
      e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight <
      2
    ) {
      const { page_number = 1, scrollBlock, dispatch } = this.props
      let page_no = page_number
      if (!scrollBlock) {
        return false
      }
      dispatch({
        type: getEffectOrReducerByName('updateDatas'),
        payload: {
          page_number: ++page_no,
          scrollBlock: false
        }
      })
      setTimeout(() => {
        this.getGlobalSearchResultList()
      }, 300)
    }
  }

  render() {
    const {
      sigleTypeResultList = [],
      loadMoreTextType,
      loadMoreDisplay,
      page_number
    } = this.props
    const { dispatch } = this.props
    const sigleItem = sigleTypeResultList[0] || {}
    const { listType, lists = [] } = sigleItem
    const filterTitle = (listType, value) => {
      let title = ''
      let ele = <div></div>
      switch (listType) {
        case 'boards':
          title = '项目'
          ele = <BoardItem itemValue={value} dispatch={dispatch} />
          break
        case 'cards':
          title = '任务'
          ele = <TaskItem itemValue={value} dispatch={dispatch} />
          break
        case 'files':
          title = '文档'
          ele = <FileItem itemValue={value} dispatch={dispatch} />
          break
        case 'flows':
          title = '流程'
          ele = <FlowItem itemValue={value} dispatch={dispatch} />
          break
        case 'schedules':
          title = '日程'
          ele = <MeetingItem itemValue={value} dispatch={dispatch} />
          break
        default:
          break
      }
      return { title, ele }
    }

    const fiterLoadMoreTextType = loadMoreTextType => {
      let text = ''
      switch (loadMoreTextType) {
        case '1':
          text = '暂无更多数据'
          break
        case '2':
          text = '加载中...'
          break
        case '3':
          text = '加载更多...'
          break
        default:
          break
      }
      return text
    }

    return (
      <div
        className={`${indexstyles.typeResult} ${indexstyles.paginResult}`}
        onScroll={this.contentBodyScroll.bind(this)}
      >
        <div className={`${indexstyles.paginResultInner}`}>
          {lists.map((value, key) => {
            return <div key={key}>{filterTitle(listType, value).ele}</div>
          })}
        </div>

        {/*如果是在第一页，必须完成请求结束没有更多数据*/}
        {((page_number == 1 && loadMoreTextType == '1') ||
          page_number != 1) && (
          <div className={indexstyles.lookMore}>
            {fiterLoadMoreTextType(loadMoreTextType)}
          </div>
        )}
        {/*<div className={indexstyles.lookMore} style={{display: loadMoreDisplay }}>{fiterLoadMoreTextType(loadMoreTextType)}</div>*/}
      </div>
    )
  }
}
function mapStateToProps({
  globalSearch: {
    datas: {
      searchTypeList = [],
      defaultSearchType,
      searchInputValue,
      page_number,
      page_size,
      sigleTypeResultList,
      loadMoreDisplay,
      scrollBlock,
      loadMoreTextType
    }
  }
}) {
  return {
    searchTypeList,
    defaultSearchType,
    searchInputValue,
    page_number,
    page_size,
    sigleTypeResultList,
    scrollBlock,
    loadMoreTextType,
    loadMoreDisplay
  }
}
