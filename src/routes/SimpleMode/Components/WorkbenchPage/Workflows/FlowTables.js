import React, { Component } from 'react'
import { Table } from 'antd'
import { timestampToTimeNormal } from '../../../../../utils/util'
import {
  getOrgNameWithOrgIdFilter,
  setBoardIdStorage
} from '../../../../../utils/businessFunction'
import { connect } from 'dva'
import globalStyles from '@/globalset/css/globalClassName.less'
import AvatarList from '@/components/avatarList/executorAvatarList'
import { renderRestrictionsTime } from '../../../../../components/ProcessDetailModal/components/handleOperateModal'

@connect(mapStateToProps)
export default class FlowTables extends Component {
  constructor(props) {
    super(props)

    this.state = {}
  }
  componentDidMount() {
    this.setTabledata(this.props)
  }
  componentWillReceiveProps(nextProps) {
    this.setTabledata(nextProps)
  }
  setTabledata = props => {
    //设置列和数据源
    const { list_source = [], list_type } = props
    const dataSource = list_source.map(item => {
      const {
        id,
        total_node_name,
        total_node_num,
        completed_node_num,
        plan_start_time,
        last_complete_time,
        update_time,
        create_time,
        creator = {},
        curr_executors = []
      } = item
      const new_item = { ...item, key: id }
      let key_time
      let key_state
      if ('1' == list_type) {
        key_time = last_complete_time
        key_state = `${total_node_name}（${completed_node_num}/${total_node_num}）`
        if (!total_node_name || !completed_node_num || !total_node_num) {
          key_state = ''
        }
      } else if ('2' == list_type) {
        key_time = update_time
        key_state = '已中止'
      } else if ('3' == list_type) {
        key_time = update_time //代替尚未定义
        key_state = '已完成'
      } else if ('0' == list_type) {
        key_time = plan_start_time ? plan_start_time : ''
        key_state = plan_start_time ? '未开始' : ''
      } else {
      }
      // new_item.originator = '吴彦祖'
      new_item.time = key_time
      new_item.state = key_state
      new_item.originator = creator.name
      return new_item
    })
    const columns = [
      {
        title: '流程名称',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        width: 164,
        render: (text, item) => {
          return this.renderKeyName(item)
        }
      },
      {
        title: this.renderTitle(list_type).state_title,
        dataIndex: 'state',
        key: 'state',
        ellipsis: true,
        width: 164,
        render: item => {
          return this.renderKeyState(item)
        }
      },
      {
        title: this.renderTitle(list_type).time_title,
        dataIndex: 'time',
        key: 'time',
        ellipsis: true,
        width: 164,
        render: (item, value) => {
          return this.renderKeyTime(item, value)
        }
      },
      {
        title: list_type == '1' ? '步骤执行人' : '发起人',
        dataIndex: 'originator',
        key: 'originator',
        ellipsis: true,
        width: 164,
        render: (item, value) => {
          return this.renderKeyOriginator(item, value)
        }
      }
    ]
    this.setState({
      columns,
      dataSource
    })
  }
  renderTitle = list_type => {
    let time_title = '步骤完成期限'
    let state_title = '流程状态'
    switch (list_type) {
      case '1':
        time_title = '步骤完成期限'
        state_title = '当前步骤'
        break
      case '2':
        time_title = '流程中止时间'
        break
      case '3':
        time_title = '流程完成时间'
        break
      case '0':
        time_title = '流程开始时间'
        break
      default:
        break
    }
    return {
      time_title,
      state_title
    }
  }
  renderKeyName = item => {
    let name_dec = item
    const { name, board_name, org_id } = item
    const {
      currentUserOrganizes = [],
      simplemodeCurrentProject = {}
    } = this.props
    const { board_id } = simplemodeCurrentProject
    const select_org_id = localStorage.getItem('OrganizationId')
    const org_dec =
      select_org_id == '0' || !select_org_id
        ? `(${getOrgNameWithOrgIdFilter(org_id, currentUserOrganizes)})`
        : ''
    const board_dec = board_id == '0' || !board_id ? `#${board_name}` : ''
    return (
      <div>
        <p style={{ marginBottom: 0 }}>
          <span
            className={`${globalStyles.authTheme}`}
            style={{ fontSize: 16, color: '#40A9FF', marginRight: 4 }}
          >
            &#xe682;
          </span>
          <span>{name}</span>
        </p>
        {(board_id == '0' || !board_id) && (
          <p
            style={{
              color: 'rgba(0,0,0,0.45)',
              marginBottom: 4,
              marginLeft: 20
            }}
          >
            {board_dec}
            {org_dec}
          </p>
        )}
      </div>
    )
  }
  renderKeyState = item => {
    const { list_type } = this.props
    let state_dec = ''
    switch (list_type) {
      case '1':
        state_dec = <span style={{ color: '#1890FF' }}>{item}</span>
        break
      case '2':
        state_dec = <span style={{ color: 'rgba(0,0,0,0.45)' }}>{item}</span>
        break
      case '3':
        state_dec = <span style={{ color: '#1890FF' }}>{item}</span>
        break
      case '0':
        state_dec = (
          <span style={{ color: item ? '#1890FF' : 'rgba(0,0,0,0.45)' }}>
            {item ? item : '未启动'}
          </span>
        )
        break
      default:
        break
    }
    return state_dec
  }
  renderKeyTime = (item, value) => {
    const { list_type } = this.props
    let time_dec = ''
    switch (list_type) {
      case '1':
        time_dec = (
          <span
            style={{
              color:
                this.setDoingTimeDec(value).indexOf('已逾期') == -1
                  ? '#1890FF'
                  : '#F5222D'
            }}
          >
            {this.setDoingTimeDec(value)}
          </span>
        )
        break
      case '2':
        time_dec = (
          <span style={{ color: 'rgba(0,0,0,0.45)' }}>
            {timestampToTimeNormal(item, '/', true)}
          </span>
        )
        break
      case '3':
        time_dec = (
          <span style={{ color: 'rgba(0,0,0,0.45)' }}>
            {timestampToTimeNormal(item, '/', true)}
          </span>
        )
        break
      case '0':
        time_dec = (
          <span style={{ color: item ? '#1890FF' : 'rgba(0,0,0,0.45)' }}>
            {item ? timestampToTimeNormal(item, '/', true) : '- : -'}
          </span>
        )
        break
      default:
        break
    }
    return time_dec
  }
  renderKeyOriginator = (item, value) => {
    const { curr_executors = [], creator = {} } = value
    const { list_type } = this.props
    let executor_dec = <div></div>
    switch (list_type) {
      case '1':
        executor_dec = (
          <div>
            <AvatarList users={curr_executors} size={'small'} />
          </div>
        )
        break
      case '2':
      case '3':
      case '0':
        executor_dec = <div>{(creator && creator.name) || ''}</div>
        break
      default:
        break
    }
    return executor_dec
  }
  // 设置进行中的期限描述
  setDoingTimeDec = value => {
    const { deadline_type } = value
    if (deadline_type == '1') {
      return '未限制'
    } else if (deadline_type == '2') {
      return renderRestrictionsTime(value)
    } else {
      return ''
    }
  }

  // 流程实例的点击事件
  handleProcessInfo = id => {
    const { dispatch } = this.props
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
  tableRowClick = record => {
    const { id, board_id, org_id } = record
    const { dispatch, simplemodeCurrentProject = {} } = this.props
    setBoardIdStorage(board_id, org_id)
    if (
      !simplemodeCurrentProject.board_id ||
      simplemodeCurrentProject.board_id == '0'
    ) {
      dispatch({
        type: 'projectDetail/projectDetailInfo',
        payload: {
          id: board_id
        }
      }).then(res => {
        this.handleProcessInfo(id)
      })
    } else {
      this.handleProcessInfo(id)
    }
  }
  render() {
    const { dataSource, columns } = this.state
    const { workbenchBoxContent_height = 700 } = this.props
    const scroll_height = workbenchBoxContent_height - 200
    return (
      <div>
        <Table
          onRow={record => {
            return {
              onClick: e => this.tableRowClick(record) // 点击行
            }
          }}
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          scroll={{ y: scroll_height }}
        />
      </div>
    )
  }
}

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
  simplemode: { simplemodeCurrentProject = {} },
  technological: {
    datas: { currentUserOrganizes = [] }
  }
}) {
  return {
    simplemodeCurrentProject,
    currentUserOrganizes
  }
}
