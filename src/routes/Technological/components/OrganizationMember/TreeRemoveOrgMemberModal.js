import React, { Component } from 'react'
import { Modal, Icon, Table, Select, message } from 'antd'
import { connect } from 'dva'
import indexStyles from './index.less'
import globalClassName from '@/globalset/css/globalClassName.less'
import {
  getTransferSelectedList,
  getTransferSelectedDetailList,
  removeMemberWithSettingTransferUser,
  discontinueMember
} from '../../../../services/technological/organizationMember'
import { isApiResponseOk } from '../../../../utils/handleResponseData'
import { currentNounPlanFilterName } from '../../../../utils/businessFunction'
import {
  PROJECTS,
  TASKS,
  FLOWS,
  MESSAGE_DURATION_TIME
} from '../../../../globalset/js/constant'
import { removeEmptyArrayEle, arrayNonRepeatfy } from '../../../../utils/util'

const Option = Select.Option

@connect(mapStateToProps)
export default class TreeRemoveOrgMemberModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hand_over_visible: false, // 是否交接
      transferSelectedList: [], // 获取初始列表
      currentOperateBoardId: '', //获取详情之后对应项目的成员列表
      currentBoardName: '' // 当前选择交接的项目
    }
  }

  initState = () => {
    this.setState({
      hand_over_visible: false, // 是否交接
      transferSelectedList: [], // 获取初始列表
      currentOperateBoardId: '', //获取详情之后对应项目的成员列表
      currentBoardName: '' // 当前选择交接的项目
    })
  }

  // 更新是否需要默认状态的交接人
  updateDefaultTransferUsers = (data = []) => {
    let arr = [...data]
    arr = arr.map(item => {
      if (item.transfer_user_id) {
        if (item.content_transfer && item.content_transfer.length) {
          let new_item = { ...item }
          let brr = [...item.content_transfer]
          brr = brr.map(i => {
            if (i.transfer_user_id) {
              return i
            } else {
              let new_i = { ...i }
              new_i = { ...i, transfer_user_id: item.transfer_user_id }
              return new_i
            }
          })
          new_item = { ...item, content_transfer: brr }
          return new_item
        } else {
          return item
        }
      } else {
        return item
      }
    })
    return arr
  }

  // 外部选择更新内部
  updateSelectedDetailContentDatasWithOutside = (data = []) => {
    let arr = [...data]
    arr = arr.map(item => {
      if (item.transfer_user_id) {
        if (item.content_transfer && item.content_transfer.length) {
          let new_item = { ...item }
          let brr = [...item.content_transfer]
          brr = brr.map(i => {
            let new_i = { ...i }
            new_i = { ...i, transfer_user_id: item.transfer_user_id }
            return new_i
          })
          new_item = { ...item, content_transfer: brr, is_multiple: false }
          return new_item
        } else {
          return item
        }
      } else {
        return item
      }
    })
    return arr
  }

  /**
   * 判断详情交接中是否选择了同一个人
   * 1. 如果是同一个人, 那么需要更新父任务中的交接人
   * 2. 如果不是同一个人, 那么更细父任务中的交接人为 ‘多人交接’
   * 3. 如果没有选择全, 那么父如果没有选择人 那么保持不变
   * @param {*} value
   * @param {*} item
   * @returns {Boolean} true 表示是同一个人, false 表示不是
   */
  whetherIsTheSameTransferUsers = () => {
    let flag = true
    const { transferSelectedList = [] } = this.state
    let new_transferSelectedList = [...transferSelectedList]
    new_transferSelectedList = new_transferSelectedList.map(item => {
      let new_item = { ...item }
      if (item.content_transfer && item.content_transfer.length) {
        // 表示存在详细交接列表
        let brr = [...item.content_transfer]
        if (brr.every(i => i.transfer_user_id)) {
          //  是否每一个都存在交接人
          let compare_transfer_user_id = brr[0].transfer_user_id
          if (brr.every(i => i.transfer_user_id == compare_transfer_user_id)) {
            flag = true
            new_item = {
              ...item,
              is_multiple: false,
              transfer_user_id: compare_transfer_user_id
            }
            return new_item
          } else {
            flag = false
            new_item = { ...item, is_multiple: true, transfer_user_id: '' }
            return new_item
          }
        } else {
          // 表示有漏选的情况, 那么就为 true
          flag = true
          new_item = { ...item, is_multiple: false }
          return new_item
        }
      } else {
        // 表示不存在详情列表, 那么也显示true单个人
        flag = true
        new_item = { ...item, is_multiple: false }
        return new_item
      }
    })
    this.setState({
      transferSelectedList: new_transferSelectedList
    })
  }

  // 详细交接点击change事件
  handleOnSelectValue = (value, item) => {
    const { content_id } = item
    const { transferSelectedList = [], hand_over_visible } = this.state
    let arr = this.updateTreeSelectedTransferUser(
      content_id,
      value,
      transferSelectedList
    )
    if (!hand_over_visible) {
      arr = this.updateSelectedDetailContentDatasWithOutside(arr)
    }
    // arr = this.updateDefaultTransferUsers(arr)
    this.setState({
      transferSelectedList: arr
    })
  }

  // 如果移除的成员在成员列表中需要过滤
  filterRemoveMember = (removeId, users = []) => {
    let arr = []
    arr = [...users]
    arr = arr.filter(item => item.user_id != removeId)
    return arr
  }

  /**
   * 更新树状结构 设置交接人
   * @param {String} target_id 将交接人设置在哪一个目标下
   * @param {String} transfer_id 设置的交接人
   * @param {Array} data 需要操作的数据源
   */
  updateTreeSelectedTransferUser = (target_id, transfer_id, data) => {
    let arr = []
    arr = data.map(item => {
      if (item.content_id == target_id) {
        let new_item = { ...item }
        new_item = { ...item, transfer_user_id: transfer_id }
        return new_item
      } else if (item.content_transfer && item.content_transfer.length) {
        let temp = this.updateTreeSelectedTransferUser(
          target_id,
          transfer_id,
          item.content_transfer
        )
        let new_item = { ...item }
        new_item = {
          ...item,
          content_transfer: temp
        }
        return new_item
      } else {
        return item
      }
    })
    return arr
  }

  // 获取表格的参数
  getTableProps = () => {
    const {
      transferSelectedList = [],
      hand_over_visible,
      currentOperateBoardId
    } = this.state
    const { groupList = [], removeMemberUserId } = this.props
    let temMemberList = arrayNonRepeatfy(
      this.getOrgMemberWithRemoveVisitors(groupList)
    )
    let filterTemMemberList = this.filterRemoveMember(
      removeMemberUserId,
      temMemberList
    )
    const data = hand_over_visible
      ? (
          transferSelectedList.find(
            i => i.content_id == currentOperateBoardId
          ) || {}
        ).content_transfer || []
      : transferSelectedList.map(item => {
          let new_item = { ...item }
          new_item = {
            ...item,
            key: item.content_id,
            users:
              item.content_type == '1'
                ? this.filterRemoveMember(removeMemberUserId, item.users)
                : filterTemMemberList
          }
          return new_item
        })
    const columns = [
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        ellipsis: true,
        width: 106,
        render: (text, item) => {
          const { content_type } = item
          const filed_name = !hand_over_visible
            ? content_type == '1'
              ? `${currentNounPlanFilterName(PROJECTS)}`
              : '模板'
            : content_type == '1'
            ? item.name
            : content_type == '2'
            ? `${currentNounPlanFilterName(TASKS)}`
            : `${currentNounPlanFilterName(FLOWS)}`
          return filed_name
        }
      },
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        width: 200,
        render: (text, item) => {
          return text
        }
      },
      {
        title: '交接人',
        dataIndex: 'opetator',
        key: 'opetator',
        ellipsis: true,
        render: (text, item) => {
          const {
            content_type,
            users = [],
            content_id,
            transfer_user_id,
            is_multiple
          } = item
          return (
            <div>
              <span style={{ marginRight: '28px' }}>
                <Select
                  placeholder={'请选择'}
                  value={is_multiple ? '多人交接' : transfer_user_id}
                  onChange={e => {
                    this.handleOnSelectValue(e, item)
                  }}
                >
                  {users.map(value => {
                    return <Option key={value.user_id}>{value.name}</Option>
                  })}
                </Select>
              </span>
              {content_type == '1' && !hand_over_visible && (
                <span
                  onClick={e => {
                    this.handleTakeOverVisible(e, content_id)
                  }}
                  className={indexStyles.detail_tips}
                >
                  详细交接 &gt;
                </span>
              )}
            </div>
          )
        }
      }
    ]
    return {
      columns,
      data
    }
  }

  // 获取模板组织成员---因项目会返回成员列表, 而模板需要自己从组织成员中获取, 去除访客
  getOrgMemberWithRemoveVisitors = (groupList = []) => {
    let curr = groupList.filter(n => n.is_default != '2')
    let temMemberList = []
    curr.map(item => {
      for (const key in item) {
        if (key == 'members' && item[key].length) {
          let new_members = [...item[key]]
          new_members = new_members.map(n => {
            let d = {}
            d = {
              avatar: n.avatar || '',
              email: n.email || '',
              full_name: n.name || '',
              id: n.user_id,
              mobile: n.mobile || '',
              name: n.name || '',
              user_id: n.user_id
            }
            return d
          })
          temMemberList.push(...new_members)
        }
      }
    })
    return temMemberList
  }

  // 获取移除成员初始列表
  // getTransferSelectedList = (removeId) => {
  //   getTransferSelectedList({ user_id: removeId }).then(res => {
  //     if (isApiResponseOk(res)) {
  //       this.setState({
  //         transferSelectedList: res.data
  //       })
  //     }
  //   })
  // }

  // 获取移除成员交接详情列表
  getTransferSelectedDetailList = ({ boardId }) => {
    const { removeMemberUserId } = this.props
    getTransferSelectedDetailList({
      user_id: removeMemberUserId,
      board_id: boardId
    }).then(res => {
      if (isApiResponseOk(res)) {
        let data = res.data
        const { transferSelectedList = [] } = this.state
        let { users: currentBoardUsers = [], name, content_transfer = [] } =
          transferSelectedList.find(i => i.content_id == boardId) || {}
        let new_transferSelectedList = [...transferSelectedList]
        if (!(content_transfer && content_transfer.length)) {
          // 不存在的才需要请求接口
          data = data.map(item => {
            let new_item = { ...item }
            new_item = {
              ...item,
              users: this.filterRemoveMember(
                removeMemberUserId,
                currentBoardUsers
              )
            }
            return new_item
          })
          new_transferSelectedList = new_transferSelectedList.map(item => {
            if (item.content_id == boardId) {
              let new_item = { ...item }
              new_item = {
                ...item,
                content_transfer: [...data]
              }
              return new_item
            } else {
              return item
            }
          })
        }
        // new_transferSelectedList = this.updateDefaultTransferUsers(new_transferSelectedList)
        new_transferSelectedList = this.updateSelectedDetailContentDatasWithOutside(
          new_transferSelectedList
        )
        this.setState({
          transferSelectedList: new_transferSelectedList,
          hand_over_visible: true,
          currentOperateBoardId: boardId,
          currentBoardName: name
        })
      }
    })
  }

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {
    const {
      TreeRemoveOrgMemberModalVisible,
      removeMemberUserId,
      groupList = [],
      transferSelectedList = []
    } = nextProps
    const {
      TreeRemoveOrgMemberModalVisible: old_TreeRemoveOrgMemberModalVisiblie
    } = this.props
    if (
      TreeRemoveOrgMemberModalVisible &&
      old_TreeRemoveOrgMemberModalVisiblie != TreeRemoveOrgMemberModalVisible
    ) {
      // this.getTransferSelectedList(removeMemberUserId)
      this.setState({
        transferSelectedList: transferSelectedList
      })
    }
  }

  componentWillUnmount() {
    this.initState()
    this.props.dispatch({
      type: 'organizationMember/updateDatas',
      payload: {
        TreeRemoveOrgMemberModalVisible: false
      }
    })
  }

  onCancel = () => {
    this.props.dispatch({
      type: 'organizationMember/updateDatas',
      payload: {
        TreeRemoveOrgMemberModalVisible: false
      }
    })
    this.initState()
  }

  onOk = () => {
    const { removeMemberUserId, currentBeOperateMemberId } = this.props
    const { transferSelectedList = [] } = this.state
    removeMemberWithSettingTransferUser({
      handover_user_id: removeMemberUserId,
      transfer: transferSelectedList
    }).then(res => {
      if (isApiResponseOk(res)) {
        discontinueMember({
          member_id: currentBeOperateMemberId
        }).then(res => {
          if (isApiResponseOk(res)) {
            setTimeout(() => {
              message.success('移除成功', MESSAGE_DURATION_TIME)
            }, 200)
            this.props.dispatch({
              type: 'organizationMember/updateDatas',
              payload: {
                TreeRemoveOrgMemberModalVisible: false
              }
            })
            this.initState()
            this.props.dispatch({
              type: 'organizationMember/getGroupList',
              payload: {}
            })
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    })
  }

  // 是否显示详细交接
  handleTakeOverVisible = (e, id) => {
    e && e.stopPropagation()
    this.getTransferSelectedDetailList({ boardId: id })
  }

  // 点击返回
  handleBack = e => {
    e && e.stopPropagation()
    this.setState({
      hand_over_visible: false
    })
    this.whetherIsTheSameTransferUsers()
  }

  // 默认table内容
  renderDefaultTableContent = () => {
    const { columns = [], data = [] } = this.getTableProps()
    const { hand_over_visible, currentBoardName } = this.state
    return (
      <div>
        {hand_over_visible && (
          <div
            style={{
              lineHeight: '20px',
              marginBottom: '10px',
              letterSpacing: '1px'
            }}
          >
            <span
              onClick={this.handleBack}
              style={{ cursor: 'pointer', color: '#4090F7' }}
            >
              &lt; 返回{' '}
            </span>
            <span style={{ color: 'rgba(0,0,0,.45)' }}>
              {' '}
              | {currentBoardName}
            </span>
          </div>
        )}
        <div
          className={globalClassName.global_vertical_scrollbar}
          style={{ overflowY: 'auto', maxHeight: '390px' }}
        >
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            className={indexStyles.transfer_table_content}
          />
        </div>
      </div>
    )
  }

  // 渲染内容
  renderContent = () => {
    return (
      <div className={indexStyles.removeMemberContent}>
        <div className={indexStyles.rev_top}>
          <div style={{ color: 'rgba(0,0,0,0.85)' }}>⚠️ 注意事项：</div>
          <div>
            1、成员被移除后，其在本组织所参与的项目以及项目内的事务将自动退出。
          </div>
          <div>
            2、仅被该成员所能查看的资料、该成员负责但并未完成的任务、该成员参与但并未完成的流程需手动指定交接人。
          </div>
        </div>
        <div className={indexStyles.rev_bottom}>
          {this.renderDefaultTableContent()}
        </div>
      </div>
    )
  }

  render() {
    const {
      TreeRemoveOrgMemberModalVisible,
      currentBeOperateMemberId,
      removeUserConfirm
    } = this.props
    const { transferSelectedList = [] } = this.state
    // 查询每一个列表中都有交接人(只需要确认外部的, 因为如果有内部列表, 那么就会默认赋值给外部的交接人)
    const disabled =
      transferSelectedList &&
      transferSelectedList.length &&
      transferSelectedList.every(n => {
        if (n.content_transfer && n.content_transfer.length) {
          let d = [...n.content_transfer]
          if (d.every(s => s.transfer_user_id)) {
            return true
          } else {
            return false
          }
        } else {
          if (n.transfer_user_id) {
            return true
          } else {
            return false
          }
        }
      })
    return (
      <div>
        <Modal
          title={`移除成员确认`}
          visible={TreeRemoveOrgMemberModalVisible} //moveToDirectoryVisiblie
          width={640}
          // zIndex={1020}
          destroyOnClose={true}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          onCancel={this.onCancel}
          okButtonProps={{ disabled: !disabled }}
          onOk={this.onOk}
          getContainer={() =>
            document.getElementById('organizationMemberContainer') ||
            document.body
          }
        >
          {this.renderContent()}
        </Modal>
      </div>
    )
  }
}

function mapStateToProps({
  technological: {
    datas: { userOrgPermissions }
  },
  organizationMember: {
    datas: {
      TreeRemoveOrgMemberModalVisible,
      removeMemberUserId,
      currentBeOperateMemberId,
      transferSelectedList = []
    }
  }
}) {
  return {
    userOrgPermissions,
    TreeRemoveOrgMemberModalVisible,
    removeMemberUserId,
    currentBeOperateMemberId,
    transferSelectedList
  }
}
