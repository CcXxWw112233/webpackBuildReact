import React, { Component } from 'react'
import {
  PROJECT_TEAM_BOARD_MEMBER,
  PROJECT_TEAM_BOARD_CONTENT_PRIVILEGE,
  PROJECT_TEAM_BOARD_EDIT,
  MESSAGE_DURATION_TIME,
  NOT_HAS_PERMISION_COMFIRN,
  PROJECTS
} from '../../../../../globalset/js/constant'
import VisitControl from '../../../../Technological/components/VisitControl'
import globalStyles from '@/globalset/css/globalClassName.less'
import styles from './index.less'
import {
  setBoardIdStorage,
  checkIsHasPermissionInBoard,
  getOrgIdByBoardId,
  selectBoardToSeeInfo,
  getOrgNameWithOrgIdFilter,
  currentNounPlanFilterName
} from '../../../../../utils/businessFunction'
import { Dropdown, Menu, message } from 'antd'
import { connect } from 'dva'
import {
  toggleContentPrivilege,
  removeContentPrivilege,
  setContentPrivilege,
  addMenbersInProject,
  cancelCollection,
  collectionProject
} from '../../../../../services/technological/project'
import DetailInfo from '@/routes/Technological/components/ProjectDetail/DetailInfo/index'
import ShowAddMenberModal from '@/routes/Technological/components/Project/ShowAddMenberModal'
import { isApiResponseOk } from '../../../../../utils/handleResponseData'
import { arrayNonRepeatfy } from '../../../../../utils/util'
import { inviteMembersInWebJoin } from '../../../../../utils/inviteMembersInWebJoin'

@connect(mapStateToProps)
export default class BoardItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
      renderVistorContorlVisible: false,
      board_info_visible: false,
      show_add_menber_visible: false,
      menu_oprate_visible: false
    }
    this.visitControlOtherPersonOperatorMenuItem = [
      {
        key: '可访问',
        value: 'read'
      },
      {
        key: '移出',
        value: 'remove',
        style: {
          color: '#f73b45'
        }
      }
    ]
  }

  onSelectBoard = (board_id, org_id) => {
    const {
      projectList,
      dispatch,
      simplemodeCurrentProject: { selected_board_term }
    } = this.props
    const selectBoard = projectList.filter(item => item.board_id === board_id)
    const selectOrgId = org_id || getOrgIdByBoardId(board_id)
    if (!selectBoard && selectBoard.length == 0) {
      message.error('数据异常，请刷新后重试')
      return
    }
    this.props.setLocalSelectedBoard(selectBoard[0])
    //设置当前选中的项目
    setBoardIdStorage(board_id)
    dispatch({
      type: 'simplemode/updateDatas',
      payload: {
        simplemodeCurrentProject: { ...selectBoard[0] }
      }
    })
    dispatch({
      type: 'projectDetail/projectDetailInfo',
      payload: {
        id: selectBoard[0].board_id
      }
    })
    dispatch({
      type: 'accountSet/updateUserSet',
      payload: {
        current_board: board_id
      }
    })

    dispatch({
      type: 'technological/updateDatas',
      payload: {
        currentSelectedProjectOrgIdByBoardId: selectOrgId
      }
    })
    dispatch({
      type: 'simplemode/getBoardsTaskTodoList',
      payload: {
        _organization_id: org_id,
        board_ids: board_id
      }
    })
    dispatch({
      type: 'simplemode/getBoardsProcessTodoList',
      payload: {
        _organization_id: org_id,
        board_id: board_id
      }
    })
    selectBoardToSeeInfo({
      board_id: selectBoard[0] && selectBoard[0].board_id,
      org_id,
      board_name: selectBoard[0] && selectBoard[0].board_name,
      dispatch,
      selected_board_term
    })
  }

  // 操作项
  dropdwonVisibleChange = bool => {
    this.setState({
      renderVistorContorlVisible: bool,
      menu_oprate_visible: bool
    })
  }
  // --------------访问控制statrt

  // 访问控制-----------start----------------------------------------

  // 这是设置访问控制之后需要更新的数据
  visitControlUpdateInGanttData = (obj = {}) => {
    const { type, is_privilege, privileges = [], removeId } = obj
    const {
      dispatch,
      itemValue: { board_id },
      projectList = []
    } = this.props
    // console.log('sssss', privileges)
    let projectList_new = [...projectList]
    const index = projectList_new.findIndex(item => item.board_id == board_id)

    if (type == 'privilege') {
      projectList_new[index].is_privilege = is_privilege
    } else if (type == 'add') {
      projectList_new[index].privileges = [].concat(
        projectList_new[index].privileges,
        privileges[0]
      )
    } else if (type == 'remove') {
      projectList_new[index].privileges = projectList_new[
        index
      ].privileges.filter(item => item.id != removeId)
    } else {
    }
    dispatch({
      type: 'workbench/updateDatas',
      payload: {
        projectList: projectList_new
      }
    })
  }

  // 访问控制的开关切换
  // handleVisitControlChange = flag => {
  //   const { itemValue = {} } = this.props
  //   const { is_privilege, board_id } = itemValue
  //   const toBool = str => !!Number(str)
  //   const is_privilege_bool = toBool(is_privilege)
  //   if (flag === is_privilege_bool) {
  //     return
  //   }
  //   //toggole 权限
  //   const data = {
  //     content_id: board_id,
  //     content_type: 'board',
  //     is_open: flag ? 1 : 0,
  //     board_id
  //   }
  //   toggleContentPrivilege(data).then(res => {
  //     if (res && res.code === '0') {
  //       //更新数据
  //       let temp_arr = res && res.data
  //       this.visitControlUpdateInGanttData({
  //         is_privilege: flag ? '1' : '0',
  //         type: 'privilege',
  //         privileges: temp_arr
  //       })
  //     } else {
  //       message.warning(res.message)
  //     }
  //   })
  // }

  // 移除访问控制列表
  handleVisitControlRemoveContentPrivilege = id => {
    const { itemValue = {} } = this.props
    const { board_id } = itemValue
    let temp_id = []
    temp_id.push(id)
    removeContentPrivilege({
      id: id,
      board_id: board_id
    }).then(res => {
      const isResOk = res => res && res.code === '0'
      if (isResOk(res)) {
        message.success('移出用户成功')
        this.visitControlUpdateInGanttData({ removeId: id, type: 'remove' })
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
      // this.handleSetContentPrivilege(id, type, '更新用户控制类型失败')
    }
  }
  /**
   * 添加成员的回调
   * @param {Array} users_arr 添加成员的数组
   */
  handleVisitControlAddNewMember = (users_arr = []) => {
    if (!users_arr.length) return

    this.handleSetContentPrivilege(users_arr, 'read')
  }

  // 访问控制添加成员
  handleSetContentPrivilege = (
    users_arr,
    type,
    errorText = '访问控制添加人员失败，请稍后再试'
  ) => {
    const { itemValue = {} } = this.props
    const { privileges = [], board_id } = itemValue
    const { user_set = {} } = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : {}
    const { user_id } = user_set
    const content_type = 'board'
    const privilege_code = type
    const content_id = board_id
    let temp_ids = [] // 用来保存用户的id

    let new_ids = [] // 用来保存权限列表中用户id
    let new_privileges = [...privileges]
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
      message.warn('该职员已存在, 请不要重复添加', MESSAGE_DURATION_TIME)
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
      board_id: board_id,
      content_id,
      content_type,
      privilege_code,
      user_ids: temp_ids
    }).then(res => {
      if (res && res.code === '0') {
        setTimeout(() => {
          message.success('添加用户成功')
        }, 500)
        let temp_arr = []
        temp_arr.push(res.data)
        this.visitControlUpdateInGanttData({
          privileges: temp_arr,
          type: 'add'
        })
      } else {
        message.error(errorText)
      }
    })
  }

  // 获取项目详情中的成员列表
  getProjectDetailInfoData = () => {
    const { projectDetailInfoData = {}, itemValue } = this.props
    const { data: projectParticipant = [] } = projectDetailInfoData
    const { privileges_extend = [] } = itemValue
    let temp_projectParticipant = [].concat(
      projectParticipant && [...projectParticipant],
      privileges_extend && [...privileges_extend]
    )
    const removeEmptyArrayEle = arr => {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] == undefined) {
          arr.splice(i, 1)
          i = i - 1 // i - 1 ,因为空元素在数组下标 2 位置，删除空之后，后面的元素要向前补位，
          // 这样才能真正去掉空元素,觉得这句可以删掉的连续为空试试，然后思考其中逻辑
        }
      }
      return arr
    }
    let new_projectParticipant = arrayNonRepeatfy(
      removeEmptyArrayEle(temp_projectParticipant),
      'user_id'
    )
    return new_projectParticipant
  }

  renderVistorContorl = () => {
    const { itemValue = {} } = this.props
    const { board_id, is_privilege = '0', privileges = [], org_id } = itemValue
    return (
      <VisitControl
        invitationType={'2'}
        invitationId={board_id}
        board_id={board_id}
        popoverPlacement={'rightBottom'}
        type={'board_list'}
        isPropVisitControl={is_privilege === '0' ? false : true}
        principalList={this.getProjectDetailInfoData()}
        // principalInfo='位任务列表负责人'
        otherPrivilege={privileges}
        otherPersonOperatorMenuItem={
          this.visitControlOtherPersonOperatorMenuItem
        }
        removeMemberPromptText="移出后用户将不能访问此任务列表"
        // handleVisitControlChange={this.handleVisitControlChange}
        handleClickedOtherPersonListOperatorItem={
          this.handleClickedOtherPersonListOperatorItem
        }
        handleAddNewMember={this.handleVisitControlAddNewMember}
        handleVisitControlPopoverVisible={this.handleVisitControlPopoverVisible}
      >
        <span>访问控制</span>
      </VisitControl>
    )
  }

  // 访问控制 ----------------end-----------------------------
  // --------------访问控制end

  // 包裹访问控制的div鼠标mosedown事件
  handleVisitorControlMouseDown = board_id => {
    const { dispatch } = this.props
    this.setState({
      VisitControlPopoverVisible: true
    })
    const { VisitControlPopoverVisible } = this.state
    if (VisitControlPopoverVisible) return false
    dispatch({
      type: 'projectDetail/projectDetailInfo',
      payload: {
        id: board_id
      }
    }).then(res => {
      if (isApiResponseOk(res)) {
        this.setState({
          VisitControlPopoverVisible: true
        })
      }
    })
  }
  // 查看项目信息
  setBoardInfoVisible = () => {
    const { board_info_visible } = this.state
    const {
      dispatch,
      itemValue: { org_id, board_id }
    } = this.props
    if (!board_info_visible) {
      dispatch({
        type: 'technological/getCorrespondingOrganizationMmembers',
        payload: {
          _organization_id: org_id
        }
      })
      dispatch({
        type: 'projectDetail/projectDetailInfo',
        payload: {
          id: board_id
        }
      })
      dispatch({
        type: 'projectDetail/getProjectRoles',
        payload: {
          type: '2',
          _organization_id: org_id
        }
      })
    }
    this.setState({
      board_info_visible: !board_info_visible
    })
  }
  //添加项目组成员操作
  setShowAddMenberModalVisibile = () => {
    this.setState({
      show_add_menber_visible: !this.state.show_add_menber_visible
    })
  }
  addMenbersInProject = values => {
    const { dispatch } = this.props
    const {
      itemValue: { org_id, board_id }
    } = this.props
    inviteMembersInWebJoin({
      dispatch,
      invitationType: '1',
      board_id,
      org_id,
      values,
      calback: () => {
        setTimeout(() => {
          dispatch({
            type: 'gantt/getAboutUsersBoards',
            payload: {}
          })
        }, 1000)
      }
    })
    return
    addMenbersInProject({ ...values }).then(res => {
      if (isApiResponseOk(res)) {
        message.success('已成功添加项目成员')
        setTimeout(() => {
          dispatch({
            type: 'gantt/getAboutUsersBoards',
            payload: {}
          })
        }, 1000)
      } else {
        message.error(res.message)
      }
    })
  }
  // 置顶
  roofTop = e => {
    e.stopPropagation()
    const {
      dispatch,
      itemValue: { board_id, org_id, is_star }
    } = this.props
    const { projectList = [] } = this.props
    const _arr_new = JSON.parse(JSON.stringify(projectList))
    const _index = _arr_new.findIndex(item => item.board_id == board_id)
    if (is_star == '1') {
      //取消置顶
      cancelCollection({ org_id, board_id }).then(res => {
        if (isApiResponseOk(res)) {
          _arr_new[_index].is_star = '0'
          // dispatch({
          //     type: 'workbench/updateDatas',
          //     payload: {
          //         projectList: _arr_new
          //     }
          // })
          dispatch({
            type: 'workbench/sortProjectList',
            payload: {
              data: _arr_new
            }
          })
        } else {
          message.error(res.message)
        }
      })
    } else {
      collectionProject({ org_id, board_id }).then(res => {
        if (isApiResponseOk(res)) {
          _arr_new[_index].is_star = '1'
          _arr_new.unshift(_arr_new[_index]) //将该项往第一插入
          _arr_new.splice(_index + 1, 1) //删除掉该项
          dispatch({
            type: 'workbench/updateDatas',
            payload: {
              projectList: _arr_new
            }
          })
        } else {
          message.error(res.message)
        }
      })
    }
  }
  // 操作项点击
  handleMenuSelect = e => {
    e.domEvent.stopPropagation()
    const { key } = e
    const { itemValue = {}, dispatch } = this.props
    const { board_id, org_id } = itemValue
    // 点击的时候需要更新baseInfo
    setBoardIdStorage(board_id, org_id)
    switch (key) {
      case 'rooftop':
        this.roofTop()
        break
      case 'invitation':
        if (!checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MEMBER, board_id)) {
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        this.setShowAddMenberModalVisibile()
        break

      case 'visitorControl':
        // this.set
        break
      case 'board_info':
        this.setBoardInfoVisible()
        break
      default:
        break
    }
  }
  renderMenuOperateListName = ({ board_id, is_star }) => {
    const { renderVistorContorlVisible } = this.state
    return (
      <Menu onClick={this.handleMenuSelect}>
        {/* {
                    <Menu.Item key={'rooftop'}>
                        {is_star == '1' ? '取消置顶' : '置顶'}
                    </Menu.Item>
                } */}
        {checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MEMBER, board_id) && (
          <Menu.Item key={'invitation'}>邀请成员加入</Menu.Item>
        )}
        {/* 渲染分组|项目对应的访问控制 */}
        {checkIsHasPermissionInBoard(
          PROJECT_TEAM_BOARD_CONTENT_PRIVILEGE,
          board_id
        ) && (
          // renderVistorContorlVisible &&
          <Menu.Item key={'visitorControl'}>
            <div
              // style={{ height: 60, width: 100, backgroundColor: 'red' }}
              onClick={this.handleVisitorWrapper}
              onMouseDown={() => {
                this.handleVisitorControlMouseDown(board_id)
              }}
            >
              {this.renderVistorContorl()}
            </div>
          </Menu.Item>
        )}

        {
          <Menu.Item key={'board_info'}>{`${currentNounPlanFilterName(
            PROJECTS,
            this.props.currentNounPlan
          )}信息`}</Menu.Item>
        }
      </Menu>
    )
  }
  render() {
    const {
      itemValue: { board_id, board_name, org_id, is_star },
      simplemodeCurrentProject,
      currentUserOrganizes = [],
      currentSelectOrganize = {}
    } = this.props
    const {
      board_info_visible,
      show_add_menber_visible,
      menu_oprate_visible
    } = this.state
    const isAllOrg =
      !currentSelectOrganize.id || currentSelectOrganize.id == '0'
    return (
      <>
        <div
          onClick={() => this.onSelectBoard(board_id, org_id)}
          className={`${
            !isAllOrg
              ? styles.board_area_middle_item
              : styles.board_area_middle_item2
          } ${simplemodeCurrentProject.board_id == board_id &&
            styles.board_area_middle_item_choose}`}
          key={board_id}
        >
          <div className={`${styles.board_area_middle_item_lf}`}></div>
          <div
            id={`board_area_middle_item_middle_${board_id}`}
            className={`${styles.board_area_middle_item_middle} ${globalStyles.global_ellipsis}`}
          >
            <p
              title={board_name}
              className={`${styles.board_area_middle_item_board_name}`}
            >
              {board_name}
            </p>
            {isAllOrg && (
              <p
                title={getOrgNameWithOrgIdFilter(org_id, currentUserOrganizes)}
              >
                {getOrgNameWithOrgIdFilter(org_id, currentUserOrganizes)}
              </p>
            )}
          </div>

          <div className={`${styles.board_area_middle_item_rt}`}>
            <div
              className={`${globalStyles.authTheme} ${styles.board_area_middle_item_rt_roofTop}`}
              onClick={this.roofTop}
              title={is_star == '1' ? '取消置顶' : '置顶'}
            >
              {is_star == '1' ? <span>&#xe86e;</span> : <span>&#xe7e3;</span>}
            </div>
            <Dropdown
              getPopupContainer={() =>
                document.getElementById(
                  `board_area_middle_item_middle_${board_id}`
                )
              }
              onVisibleChange={this.dropdwonVisibleChange}
              overlay={
                menu_oprate_visible ? (
                  this.renderMenuOperateListName({ board_id, is_star })
                ) : (
                  <span></span>
                )
              }
              trigger={['click']}
            >
              <div
                className={`${styles.board_area_middle_item_rt_operate} ${globalStyles.authTheme}`}
                onClick={e => e.stopPropagation()}
              >
                &#xe66f;
              </div>
            </Dropdown>
          </div>
        </div>
        <DetailInfo
          setProjectDetailInfoModalVisible={this.setBoardInfoVisible}
          modalVisible={board_info_visible}
          invitationType="1"
          invitationId={board_id}
        />
        {show_add_menber_visible && (
          <ShowAddMenberModal
            invitationType="1"
            invitationId={board_id}
            invitationOrg={org_id || getOrgIdByBoardId(board_id)}
            show_wechat_invite={true}
            _organization_id={org_id || getOrgIdByBoardId(board_id)}
            board_id={board_id}
            addMenbersInProject={this.addMenbersInProject}
            modalVisible={show_add_menber_visible}
            setShowAddMenberModalVisibile={this.setShowAddMenberModalVisibile}
          />
        )}
      </>
    )
  }
}
//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
  workbench: {
    datas: { projectList }
  },
  simplemode: { simplemodeCurrentProject },
  technological: {
    datas: { currentUserOrganizes, currentSelectOrganize = {} }
  },
  projectDetail: {
    datas: { projectDetailInfoData = {} }
  },
  organizationManager: {
    datas: { currentNounPlan }
  }
}) {
  return {
    projectList,
    simplemodeCurrentProject,
    projectDetailInfoData,
    currentUserOrganizes,
    currentSelectOrganize,
    currentNounPlan
  }
}
