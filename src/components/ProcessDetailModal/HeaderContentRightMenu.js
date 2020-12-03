import React, { Component } from 'react'
import { Tooltip, message, Modal, Dropdown, Menu, Button } from 'antd'
import { connect } from 'dva'
import indexStyles from './index.less'
import VisitControl from '../../routes/Technological/components/VisitControl/index'
import InformRemind from '@/components/InformRemind'
import {
  setContentPrivilege,
  toggleContentPrivilege,
  removeContentPrivilege
} from '../../services/technological/project'
import globalStyles from '@/globalset/css/globalClassName.less'
import {
  currentNounPlanFilterName,
  checkIsHasPermissionInBoard,
  checkIsHasPermissionInVisitControl
} from '@/utils/businessFunction'
import {
  MESSAGE_DURATION_TIME,
  PROJECT_FLOWS_FLOW_ABORT,
  PROJECT_FLOWS_FLOW_DELETE,
  PROJECT_FLOW_FLOW_ACCESS,
  NOT_HAS_PERMISION_COMFIRN
} from '@/globalset/js/constant'
import { FLOWS } from '../../globalset/js/constant'
import {
  genPrincipalListFromAssignees,
  transformNewAssigneesToString,
  transformNewRecipientsToString,
  wipeOffSomeDataWithScoreNodes
} from './components/handleOperateModal'
import { getGlobalData } from '../../utils/businessFunction'
import { arrayNonRepeatfy } from '../../utils/util'
@connect(mapStateToProps)
export default class HeaderContentRightMenu extends Component {
  state = {}

  // 访问控制的操作 S
  /**
   * 访问控制的开关切换
   * @param {Boolean} flag 开关切换
   */
  handleVisitControlChange = flag => {
    const { processInfo = {} } = this.props
    const { id, is_privilege } = processInfo
    const toBool = str => !!Number(str)
    const is_privilege_bool = toBool(is_privilege)
    if (flag === is_privilege_bool) {
      return
    }
    //toggle权限
    const data = {
      content_id: id,
      content_type: 'flow',
      is_open: flag ? 1 : 0
    }
    toggleContentPrivilege(data).then(res => {
      if (res && res.code === '0') {
        setTimeout(() => {
          message.success('设置成功')
        }, 500)
        let temp_arr = res && res.data
        this.visitControlUpdateCurrentModalData(
          {
            is_privilege: flag ? '1' : '0',
            type: 'privilege',
            privileges: temp_arr
          },
          flag
        )
      } else {
        message.warning(res.message)
      }
    })
  }

  commonProcessVisitControlUpdateCurrentModalData = (newProcessInfo, type) => {
    const { dispatch, processInfo = {}, request_flows_params = {} } = this.props
    const { status, board_id, org_id } = processInfo
    let BOARD_ID =
      (request_flows_params && request_flows_params.request_board_id) ||
      board_id
    dispatch({
      type: 'publicProcessDetailModal/updateDatas',
      payload: {
        processInfo: newProcessInfo
      }
    })
    if (type) {
      dispatch({
        type: 'publicProcessDetailModal/getProcessListByType',
        payload: {
          status: status,
          board_id: BOARD_ID,
          _organization_id: request_flows_params._organization_id || org_id
        }
      })
    }
  }

  // 访问控制的更新model中的数据
  visitControlUpdateCurrentModalData = obj => {
    const { processInfo = {} } = this.props
    const { privileges = [] } = processInfo

    // 访问控制开关
    if (obj && obj.type && obj.type == 'privilege') {
      let new_privileges = [...privileges]
      const { privileges: temp_privileges = [] } = obj
      // if (!(temp_privileges && temp_privileges.length)) return
      if (
        new_privileges.find(
          i => i.id == (temp_privileges[0] && temp_privileges[0].id)
        )
      ) {
        // 如果能找到表示替换 否则添加
        new_privileges = new_privileges.map(item => {
          if (item.id == (temp_privileges[0] && temp_privileges[0].id)) {
            // 表示在列表中找到该成员
            let new_item = { ...item }
            new_item = { ...item, ...temp_privileges[0] }
            return new_item
          } else {
            return item
          }
        })
      } else {
        if (temp_privileges && temp_privileges.length) {
          new_privileges.push(...temp_privileges)
        }
      }
      // for (let item in obj) {
      //   if (item == 'privileges') {
      //     obj[item].map(val => {
      //       let temp_arr = arrayNonRepeatfy([].concat(...privileges, val))
      //       if (temp_arr && !temp_arr.length) return false
      //       return new_privileges = [...temp_arr]
      //     })
      //   }
      // }
      let newProcessInfo = {
        ...processInfo,
        privileges: new_privileges,
        is_privilege: obj.is_privilege
      }
      // this.props.updateDatasProcess({
      //   processInfo: newProcessInfo
      // });
      // 这是需要获取一下流程列表 区分工作台和项目列表
      this.commonProcessVisitControlUpdateCurrentModalData(
        newProcessInfo,
        obj.type
      )
      this.props.whetherUpdateWorkbenchPorcessListData &&
        this.props.whetherUpdateWorkbenchPorcessListData({
          is_privilege: obj.is_privilege
        })
    }

    // 访问控制添加
    if (obj && obj.type && obj.type == 'add') {
      let new_privileges = []
      for (let item in obj) {
        if (item == 'privileges') {
          // eslint-disable-next-line no-loop-func
          obj[item].map(val => {
            let temp_arr = arrayNonRepeatfy([].concat(...privileges, val))
            return (new_privileges = [...temp_arr])
          })
        }
      }
      let newProcessInfo = { ...processInfo, privileges: new_privileges }
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
      let newProcessInfo = { ...processInfo, privileges: new_privileges }
      this.commonProcessVisitControlUpdateCurrentModalData(newProcessInfo)
    }

    // 这是更新type类型
    if (obj && obj.type && obj.type == 'change') {
      let { id, content_privilege_code, user_info } = obj.temp_arr
      let new_privileges = [...privileges]
      new_privileges = new_privileges.map(item => {
        let new_item = item
        if (item.id == id) {
          new_item = { ...item, content_privilege_code: obj.code }
        } else {
          new_item = { ...item }
        }
        return new_item
      })
      let newProcessInfo = { ...processInfo, privileges: new_privileges }
      this.commonProcessVisitControlUpdateCurrentModalData(newProcessInfo)
    }
  }

  /**
   * 添加成员的回调
   * @param {Array} users_arr 添加成员的数组
   */
  handleVisitControlAddNewMember = (users_arr = []) => {
    if (!users_arr.length) return
    const { user_set = {} } = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : {}
    const { user_id } = user_set
    const { processInfo = {} } = this.props
    const { id, privileges = [] } = processInfo
    const content_id = id
    const content_type = 'flow'
    let temp_ids = [] // 用来保存添加用户的id
    let new_ids = [] // 用来保存权限列表中用户id
    let new_privileges = [...privileges]
    // 这是所有添加成员的id列表
    users_arr &&
      users_arr.map(item => {
        temp_ids.push(item.id)
      })

    let flag
    // 权限列表中的id
    new_privileges =
      new_privileges &&
      new_privileges.map(item => {
        let { id } = item && item.user_info && item.user_info
        if (user_id == id) {
          // 从权限列表中找到自己
          if (temp_ids.indexOf(id) != -1) {
            // 判断自己是否在添加的列表中
            flag = true
          }
        }
        new_ids.push(id)
      })

    // 这里是需要做一个只添加了自己的一条提示
    if (flag && temp_ids.length == '1') {
      // 表示只选择了自己, 而不是全选
      message.warn('该成员已存在, 请不要重复添加', MESSAGE_DURATION_TIME)
      return false
    } else {
      // 否则表示进行了全选, 那么就过滤
      temp_ids =
        temp_ids &&
        temp_ids.filter(item => {
          if (new_ids.indexOf(item) == -1) {
            return item
          }
        })
    }
    setContentPrivilege({
      content_id,
      content_type,
      privilege_code: 'read',
      user_ids: temp_ids
    }).then(res => {
      if (res && res.code === '0') {
        setTimeout(() => {
          message.success('添加用户成功')
        }, 500)
        let temp_arr = []
        temp_arr.push(res.data)
        this.visitControlUpdateCurrentModalData({
          privileges: temp_arr,
          type: 'add'
        })
      } else {
        message.warning(res.message)
      }
    })
  }

  /**
   * 访问控制移除成员
   * @param {String} id 移除成员对应的id
   */
  handleVisitControlRemoveContentPrivilege = id => {
    removeContentPrivilege({ id: id }).then(res => {
      const isResOk = res => res && res.code === '0'
      if (isResOk(res)) {
        setTimeout(() => {
          message.success('移除用户成功')
        }, 500)
        this.visitControlUpdateCurrentModalData({
          removeId: id,
          type: 'remove'
        })
      } else {
        message.warning(res.message)
      }
    })
  }
  /**
   * 访问控制设置更新成员
   * @param {String} id 设置成员对应的id
   * @param {String} type 设置成员对应的字段
   */
  handleVisitControlChangeContentPrivilege = (id, type) => {
    const {
      processInfo: { id: content_id, privileges }
    } = this.props
    let temp_id = []
    temp_id.push(id)
    const obj = {
      content_id: content_id,
      content_type: 'flow',
      privilege_code: type,
      user_ids: temp_id
    }
    setContentPrivilege(obj).then(res => {
      const isResOk = res => res && res.code === '0'
      if (isResOk(res)) {
        setTimeout(() => {
          message.success('设置成功')
        }, 500)
        let temp_arr = []
        temp_arr = res && res.data[0]
        this.visitControlUpdateCurrentModalData({
          temp_arr: temp_arr,
          type: 'change',
          code: type
        })
      } else {
        message.warning(res.message)
      }
    })
  }
  /**
   * 其他成员的下拉回调
   * @param {String} id 这是用户的user_id
   * @param {String} type 这是对应的用户字段
   * @param {String} removeId 这是对应移除用户的id
   */
  handleClickedOtherPersonListOperatorItem = (id, type, removeId) => {
    if (type === 'remove') {
      this.handleVisitControlRemoveContentPrivilege(removeId)
    } else {
      this.handleVisitControlChangeContentPrivilege(id, type)
    }
  }

  // 访问控制操作 E

  /**
   * 判断是否有权限
   * @returns {Boolean} true 表示有权限 false 表示没有权限
   */
  whetherIsHasPermission = permissionValue => {
    const { processInfo = {} } = this.props
    const { privileges = [], is_privilege, board_id, nodes = [] } = processInfo
    const principalList = genPrincipalListFromAssignees(nodes)
    let flag = false
    if (
      checkIsHasPermissionInVisitControl(
        'edit',
        privileges,
        is_privilege,
        principalList,
        checkIsHasPermissionInBoard(permissionValue, board_id)
      )
    ) {
      flag = true
    }
    return flag
  }

  // 中止流程的点击事件
  handleDiscontinueProcess = () => {
    let that = this
    const {
      processInfo: { id, board_id, org_id },
      request_flows_params = {},
      currentFlowTabsStatus
    } = this.props
    let BOARD_ID =
      (request_flows_params && request_flows_params.request_board_id) ||
      board_id
    if (!this.whetherIsHasPermission(PROJECT_FLOWS_FLOW_ABORT)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return
    }
    this.props.dispatch({
      type: 'publicProcessDetailModal/workflowEnd',
      payload: {
        id,
        board_id: getGlobalData('storageCurrentOperateBoardId') || board_id,
        calback: () => {
          setTimeout(() => {
            message.success(`中止${currentNounPlanFilterName(FLOWS)}成功`)
          }, 200)
          that.props.dispatch({
            type: 'publicProcessDetailModal/getProcessListByType',
            payload: {
              board_id: BOARD_ID,
              status: currentFlowTabsStatus || '1',
              _organization_id: request_flows_params._organization_id || org_id
            }
          })
          that.props.whetherUpdateWorkbenchPorcessListData &&
            that.props.whetherUpdateWorkbenchPorcessListData({
              type: 'workflowEnd'
            })
          that.props.onCancel && that.props.onCancel()
        }
      }
    })
  }

  // 删除流程的点击事件
  handleDeletProcess = () => {
    const {
      processInfo: { id, board_id, org_id },
      currentFlowTabsStatus,
      request_flows_params = {}
    } = this.props
    if (!this.whetherIsHasPermission(PROJECT_FLOWS_FLOW_DELETE)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return
    }
    if (!id) return false
    this.confirm({
      id,
      board_id,
      org_id,
      currentFlowTabsStatus,
      request_flows_params
    })
  }

  confirm({
    id,
    board_id,
    org_id,
    currentFlowTabsStatus,
    request_flows_params = {}
  }) {
    const that = this
    let BOARD_ID =
      (request_flows_params && request_flows_params.request_board_id) ||
      board_id
    const { dispatch } = that.props
    const modal = Modal.confirm()
    modal.update({
      title: `确认删除该${currentNounPlanFilterName(FLOWS)}吗？`,
      okText: '确认',
      cancelText: '取消',
      getContainer: () =>
        document.getElementById('container_fileDetailContentOut'),
      zIndex: 1010,
      onOk() {
        dispatch({
          type: 'publicProcessDetailModal/workflowDelete',
          payload: {
            id,
            board_id: getGlobalData('storageCurrentOperateBoardId') || board_id,
            calback: () => {
              setTimeout(() => {
                message.success(`删除${currentNounPlanFilterName(FLOWS)}成功`)
              }, 200)
              that.props.dispatch({
                type: 'publicProcessDetailModal/getProcessListByType',
                payload: {
                  board_id: BOARD_ID,
                  status: currentFlowTabsStatus || '1',
                  _organization_id:
                    request_flows_params._organization_id || org_id
                }
              })
              that.props.whetherUpdateWorkbenchPorcessListData &&
                that.props.whetherUpdateWorkbenchPorcessListData({
                  type: 'deleteProcess'
                })
              that.props.onCancel && that.props.onCancel()
              let { id: storage_id } = localStorage.getItem(
                'userProcessWithNodesStatusStorage'
              )
                ? JSON.parse(
                    localStorage.getItem('userProcessWithNodesStatusStorage')
                  )
                : {}
              if (id == storage_id) {
                localStorage.removeItem('userProcessWithNodesStatusStorage')
              }
            }
          }
        })
      },
      onCancel: () => {
        modal.destroy()
      }
    })
  }

  // 重启流程的点击事件
  handleReStartProcess = () => {
    let that = this
    const {
      processInfo: { id, board_id, org_id },
      currentFlowTabsStatus,
      request_flows_params = {}
    } = this.props
    let BOARD_ID =
      (request_flows_params && request_flows_params.request_board_id) ||
      board_id
    if (!this.whetherIsHasPermission(PROJECT_FLOWS_FLOW_ABORT)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return
    }
    this.props.dispatch({
      type: 'publicProcessDetailModal/restartProcess',
      payload: {
        id,
        board_id: getGlobalData('storageCurrentOperateBoardId') || board_id,
        calback: () => {
          setTimeout(() => {
            message.success(`重启${currentNounPlanFilterName(FLOWS)}成功`)
          }, 200)
          that.props.dispatch({
            type: 'publicProcessDetailModal/getProcessListByType',
            payload: {
              board_id: BOARD_ID,
              status: currentFlowTabsStatus || '1',
              _organization_id: request_flows_params._organization_id || org_id
            }
          })
          this.props.onCancel && this.props.onCancel()
        }
      }
    })
  }

  // 转为模板
  handleCovertTemplete = () => {
    const {
      dispatch,
      templateInfo = {},
      processInfo: { nodes = [], id, is_covert_template, enable_change }
    } = this.props
    let newNodes = [...nodes]
    newNodes = newNodes.map(item => {
      if (item.node_type == '3') {
        let new_item = { ...item }
        new_item = {
          ...item,
          status: '',
          is_edit: '1',
          assignees: transformNewAssigneesToString(item).join(','),
          recipients: transformNewRecipientsToString(item).join(','),
          score_items: wipeOffSomeDataWithScoreNodes(item || {})
        }
        return new_item
      } else {
        let new_item = { ...item }
        new_item = {
          ...item,
          status: '',
          is_edit: '1',
          assignees: transformNewAssigneesToString(item).join(','),
          recipients: transformNewRecipientsToString(item).join(',')
        }
        return new_item
      }
    })

    // return
    dispatch({
      type: 'publicProcessDetailModal/updateDatas',
      payload: {
        processEditDatas: JSON.parse(JSON.stringify([...newNodes] || [])),
        templateInfo: {
          ...templateInfo,
          id,
          nodes: JSON.parse(JSON.stringify([...newNodes] || [])),
          is_covert_template,
          enable_change
        },
        processPageFlagStep: '2'
      }
    })
  }

  handleSelectMenuItem = e => {
    const { key } = e
    switch (key) {
      case 'discontinue': // 表示匹配中止
        this.handleDiscontinueProcess()
        break
      case 'delete': // 表示匹配删除
        this.handleDeletProcess()
        break
      case 'restart': // 表示匹配重启
        this.handleReStartProcess()
        break
      default:
        break
    }
  }

  renderMoreMenu = status => {
    return (
      <Menu onClick={this.handleSelectMenuItem}>
        {status == '1' && (
          <Menu.Item key="discontinue">
            中止{currentNounPlanFilterName(FLOWS)}
          </Menu.Item>
        )}
        {/* {
          status == '2' && (
            <Menu.Item key="restart">重启{currentNounPlanFilterName(FLOWS)}</Menu.Item>
          )
        } */}
        {(status == '2' || status == '3' || status == '0') && (
          <Menu.Item style={{ color: '#FF4D4F' }} key="delete">
            删除{currentNounPlanFilterName(FLOWS)}
          </Menu.Item>
        )}
      </Menu>
    )
  }

  render() {
    const {
      projectDetailInfoData: { data = [] },
      processInfo = {},
      processPageFlagStep
    } = this.props
    const {
      is_privilege,
      privileges = [],
      assignees,
      id,
      nodes = [],
      status,
      is_covert_template,
      board_id
    } = processInfo
    const principalList = genPrincipalListFromAssignees(nodes)
    return (
      <div>
        {processPageFlagStep == '4' ? (
          <div className={indexStyles.detail_action_list}>
            {/* 转为模板 */}
            {/* {
                is_covert_template == '1' && (
                  <Button onClick={this.handleCovertTemplete} className={indexStyles.covert_templete}>
                    <span style={{marginRight: '4px'}} className={globalStyles.authTheme}>&#xe714;</span>
                    转为{`${currentNounPlanFilterName(FLOWS)}`}模板
                  </Button>
                )
              } */}
            {status == '2' && (
              <Button
                onClick={this.handleReStartProcess}
                className={indexStyles.covert_templete}
                style={{ marginLeft: '20px' }}
              >
                <span
                  style={{ marginRight: '4px' }}
                  className={globalStyles.authTheme}
                >
                  &#xe788;
                </span>
                重启{currentNounPlanFilterName(FLOWS)}
              </Button>
            )}

            {/* 访问控制 */}
            <span className={`${indexStyles.action} ${indexStyles.visit_wrap}`}>
              {board_id && (
                <VisitControl
                  board_id={board_id}
                  isPropVisitControl={is_privilege === '0' ? false : true}
                  handleVisitControlChange={this.handleVisitControlChange}
                  principalList={data}
                  otherPrivilege={privileges}
                  handleClickedOtherPersonListOperatorItem={
                    this.handleClickedOtherPersonListOperatorItem
                  }
                  handleAddNewMember={this.handleVisitControlAddNewMember}
                />
              )}
            </span>
            {/* 通知提醒 */}
            {checkIsHasPermissionInVisitControl(
              'edit',
              privileges,
              is_privilege,
              [],
              checkIsHasPermissionInBoard(PROJECT_FLOW_FLOW_ACCESS, board_id)
            ) && (
              <div
                className={indexStyles.margin_right10}
                style={{ marginTop: '4px' }}
              >
                <InformRemind
                  processPrincipalList={principalList}
                  rela_id={id}
                  rela_type={'3'}
                  user_remind_info={data}
                />
              </div>
            )}
            {/* 更多选项 */}
            <span
              className={`${indexStyles.action}`}
              style={{ position: 'relative' }}
            >
              <Dropdown
                trigger={'click'}
                overlay={this.renderMoreMenu(status)}
                getPopupContainer={triggerNode => triggerNode.parentNode}
              >
                <span className={indexStyles.more_icon}>
                  <span
                    className={`${globalStyles.authTheme} ${indexStyles.more}`}
                  >
                    &#xe7fd;
                  </span>
                </span>
              </Dropdown>
            </span>
          </div>
        ) : (
          <></>
        )}
      </div>
    )
  }
}

//  只关联public中弹窗内的数据
function mapStateToProps({
  publicProcessDetailModal: {
    processInfo = {},
    processPageFlagStep,
    templateInfo = {},
    currentFlowTabsStatus
  },
  projectDetail: {
    datas: { projectDetailInfoData = {} }
  },
  technological: {
    datas: { userBoardPermissions = [] }
  }
}) {
  return {
    processInfo,
    processPageFlagStep,
    templateInfo,
    currentFlowTabsStatus,
    projectDetailInfoData,
    userBoardPermissions
  }
}
