import React, { Component } from 'react';
import { connect, } from 'dva';
import indexStyles from './index.less'
import { Avatar, Dropdown, Menu, Input, message } from 'antd'
import { getOrgNameWithOrgIdFilter, checkIsHasPermissionInBoard } from '../../../../utils/businessFunction';
import globalStyles from '@/globalset/css/globalClassName.less'
import AvatarList from '@/components/avatarList'
import CheckItem from '@/components/CheckItem'
import { updateTaskGroup, deleteTaskGroup, } from '../../../../services/technological/task';
import { updateProject, addMenbersInProject } from '../../../../services/technological/project';
import { isApiResponseOk } from '../../../../utils/handleResponseData';
import ShowAddMenberModal from '@/routes/Technological/components/Project/ShowAddMenberModal'
import { PROJECT_TEAM_BOARD_MEMBER, PROJECT_TEAM_BOARD_EDIT, PROJECT_TEAM_CARD_GROUP, NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME } from '../../../../globalset/js/constant';

@connect(mapStateToProps)
export default class GroupListHeadItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isShowBottDetail: '0', //0 初始化(关闭) 1展开 2 关闭
      show_edit_input: false,
      edit_input_value: '',
      local_list_name: '',
      show_add_menber_visible: false,
    }
  }
  noTimeAreaScroll(e) {
    e.stopPropagation()
  }
  componentDidMount() {
    const { itemValue = {} } = this.props
    const { list_name } = itemValue
    this.setState({
      edit_input_value: list_name,
      local_list_name: list_name
    })
  }
  setIsShowBottDetail = () => {
    const { isShowBottDetail } = this.state
    let new_isShowBottDetail = '1'
    if (isShowBottDetail == '0') {
      new_isShowBottDetail = '1'
    } else if (isShowBottDetail == '1') {
      new_isShowBottDetail = '2'
    } else if (isShowBottDetail == '2') {
      new_isShowBottDetail = '1'
    } else {

    }
    this.setState({
      isShowBottDetail: new_isShowBottDetail
    })
  }
  setLableColor = (label_data) => {
    let bgColor = ''
    let b = ''
    if (label_data && label_data.length) {
      const color_arr = label_data.map(item => {
        return `rgb(${item.label_color})`
      })
      const color_arr_length = color_arr.length
      const color_percent_arr = color_arr.map((item, index) => {
        return (index + 1) / color_arr_length * 100
      })
      bgColor = color_arr.reduce((total, color_item, current_index) => {
        return `${total},  ${color_item} ${color_percent_arr[current_index - 1] || 0}%, ${color_item} ${color_percent_arr[current_index]}%`
      }, '')

      b = `linear-gradient(to right${bgColor})`
    } else {
      b = '#ffffff'
    }
    return b
  }

  // 未分组任务点击事件
  noTimeCardClick = ({ id, board_id }) => {
    const { dispatch, setTaskDetailModalVisibile, list_id } = this.props
    setTaskDetailModalVisibile && setTaskDetailModalVisibile('no_schedule')
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        current_list_group_id: list_id
      }
    })
    dispatch({
      type: 'workbenchTaskDetail/getCardDetail',
      payload: {
        id,
        board_id,
        calback: function (data) {
          dispatch({
            type: 'workbenchPublicDatas/getRelationsSelectionPre',
            payload: {
              _organization_id: data.org_id
            }
          })
        }
      }
    })
    dispatch({
      type: 'workbenchTaskDetail/getCardCommentListAll',
      payload: {
        id: id
      }
    })
    dispatch({
      type: 'workbenchPublicDatas/updateDatas',
      payload: {
        board_id
      }
    })
  }

  renderTaskItem = () => {
    const { itemValue = {} } = this.props
    const { list_no_time_data = [] } = itemValue
    return (
      <div
        className={indexStyles.no_time_card_area_out}
        // style={{ height: (group_rows[itemKey] || 2) * ceiHeight - 50 }}
        onScroll={this.noTimeAreaScroll.bind(this)}>
        <div className={indexStyles.no_time_card_area}>
          {
            list_no_time_data.map((value, key) => {
              const { name, id, is_realize, executors = [], label_data = [], board_id } = value || {}
              return (
                <div
                  onClick={() => this.noTimeCardClick({ id, board_id })}
                  style={{ background: this.setLableColor(label_data) }}
                  className={indexStyles.no_time_card_area_card_item}
                  key={id}>
                  <div className={indexStyles.no_time_card_area_card_item_inner}>
                    <div className={`${indexStyles.card_item_status}`}>
                      <CheckItem is_realize={is_realize} />
                    </div>
                    <div className={`${indexStyles.card_item_name} ${globalStyles.global_ellipsis}`}>{name}</div>
                    <div>
                      <AvatarList users={executors} size={'small'} />
                    </div>
                  </div>

                </div>
              )
            })
          }
        </div>
      </div>
    )
  }
  //分组名点击
  listNameClick = () => {
    const { itemValue, gantt_board_id, dispatch, group_view_type } = this.props
    // console.log('sssss', {itemValue, gantt_board_id, group_view_type})

    if (group_view_type != '1' || gantt_board_id != '0') { //必须要在项目视图才能看
      return
    }
    const { list_id } = itemValue
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        gantt_board_id: list_id
      }
    })
    // dispatch({
    //   type: 'gantt/getGttMilestoneList',
    //   payload: {

    //   }
    // })
    dispatch({
      type: 'gantt/getGanttData',
      payload: {

      }
    })
  }
  //添加项目组成员操作
  setShowAddMenberModalVisibile = () => {
    this.setState({
      show_add_menber_visible: !this.state.show_add_menber_visible
    })
  }

  addMenbersInProject = (values) => {
    const { dispatch } = this.props
    addMenbersInProject({ ...values }).then(res => {
      if (isApiResponseOk(res)) {
        message.success('已成功添加项目成员')
        setTimeout(() => {
          dispatch({
            type: 'gantt/getAboutUsersBoards',
            payload: {

            }
          })
        }, 1000)

      } else {
        message.error(res.message)
      }
    })
  }

  // 操作项点击
  handleMenuSelect = ({ key }) => {
    const { itemValue = {}, gantt_board_id } = this.props
    const { list_id } = itemValue
    const params_board_id = gantt_board_id == '0' ? list_id : gantt_board_id
    switch (key) {
      case 'invitation':
        if (!checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MEMBER, params_board_id)) {
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        this.setShowAddMenberModalVisibile()
        break
      case 'rename':
        const rename_permission_code = gantt_board_id == '0' ? PROJECT_TEAM_BOARD_EDIT : PROJECT_TEAM_CARD_GROUP
        if (!checkIsHasPermissionInBoard(rename_permission_code, params_board_id)) {
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        this.setState({
          show_edit_input: true
        })
        break
      case 'delete_group':
        if (!checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_GROUP, params_board_id)) {
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        this.requestDeleteGroup()
        break
      default:
        break
    }
  }
  setShowEditInput = (bool) => {
    this.setState({
      show_edit_input: bool,
    })
  }
  setLocalListName = (value) => {
    if (value) {
      this.setState({
        local_list_name: value
      })
    }
  }
  // 更改名称
  inputOnBlur = (e) => {
    this.setShowEditInput(false)
  }
  inputOnchange = (e) => {
    const { value } = e.target
    this.setState({
      edit_input_value: value
    })
  }
  inputOnPressEnter = (e) => {
    this.setShowEditInput(false)
    const { gantt_board_id, list_id } = this.props
    const { edit_input_value, local_list_name } = this.state
    if (local_list_name == edit_input_value || !!!edit_input_value) { //检测到输入变化
      return
    }
    if (gantt_board_id == '0') {
      this.requestUpdateBoard({ board_id: list_id, name: edit_input_value })
    } else {
      this.requestUpdateGroup({ id: list_id, name: edit_input_value, board_id: gantt_board_id })
    }

  }
  // 请求更新项目名称
  requestUpdateBoard = (data = {}) => {
    updateProject({ ...data }).then(res => {
      if (isApiResponseOk(res)) {
        this.setLocalListName(this.state.edit_input_value)
        message.success('已成功更新项目名称')
      } else {
        message.error(res.message)
      }
    })
  }
  // 请求更新分组名称
  requestUpdateGroup = (data = {}) => {
    const { dispatch } = this.props
    updateTaskGroup({
      ...data,
    }).then(res => {
      if (isApiResponseOk(res)) {
        dispatch({
          type: 'gantt/getAboutGroupBoards',
          payload: {}
        })
        this.setLocalListName(this.state.edit_input_value)
        message.success('已成功更新分组名称')
      } else {
        message.error(res.message)
      }
    })
  }
  // 请求删除分组名称
  requestDeleteGroup = () => {
    const { gantt_board_id, list_id, list_group = [], dispatch } = this.props

    deleteTaskGroup({ board_id: gantt_board_id, id: list_id }).then(res => {
      if (isApiResponseOk(res)) {
        // 过滤掉该项
        let new_list_group = list_group.filter(item => item.list_id != list_id)
        dispatch({
          type: 'gantt/getAboutGroupBoards',
          payload: {}
        })
        dispatch({
          type: 'gantt/handleListGroup',
          payload: {
            data: new_list_group
          }
        })
        message.success('删除分组成功')
      } else {
        message.error(res.message)
      }
    })
  }

  // 操作项
  renderMenuOperateListName = () => {
    const { itemValue = {}, gantt_board_id } = this.props
    const { list_id } = itemValue
    const params_board_id = gantt_board_id == '0' ? list_id : gantt_board_id
    const rename_permission_code = gantt_board_id == '0' ? PROJECT_TEAM_BOARD_EDIT : PROJECT_TEAM_CARD_GROUP
    return (
      <Menu onClick={this.handleMenuSelect}>
        {
          // checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MEMBER, params_board_id)
          gantt_board_id == '0' && (
            <Menu.Item key={'invitation'}>
              邀请成员加入
            </Menu.Item>
          )}
        {
          // checkIsHasPermissionInBoard(rename_permission_code, params_board_id) &&
          <Menu.Item key={'rename'}>重命名</Menu.Item>
        }
        {
          // checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_GROUP, params_board_id) &&
          gantt_board_id != '0' &&
          <Menu.Item key={'delete_group'}>删除分组</Menu.Item>
        }
      </Menu>
    )
  }

  render() {

    const { currentUserOrganizes = [], gantt_board_id = [], ceiHeight, is_show_org_name, is_all_org, rows = 5, group_view_type, get_gantt_data_loading } = this.props
    const { itemValue = {}, itemKey } = this.props
    const { list_name, org_id, list_no_time_data = [], list_id, lane_icon } = itemValue
    const { isShowBottDetail, show_edit_input, local_list_name, edit_input_value, show_add_menber_visible } = this.state

    // console.log('sssss',{itemKey, group_rows, row: group_rows[itemKey], list_id })

    return (
      <div>
        <div className={indexStyles.listHeadItem} style={{ height: rows * ceiHeight }}>
          <div className={`${indexStyles.list_head_top}`}>
            {
              group_view_type == '2' && !get_gantt_data_loading && (
                <Avatar src={lane_icon} icon="user" style={{ marginTop: '-4px', marginRight: 8 }}></Avatar>
              )
            }
            {
              show_edit_input ? (
                <Input
                  style={{ marginBottom: 6 }}
                  autoFocus
                  value={edit_input_value}
                  onChange={this.inputOnchange}
                  onPressEnter={this.inputOnPressEnter}
                  onBlur={this.inputOnBlur}
                />
              ) : (
                  <span className={indexStyles.list_name} onClick={this.listNameClick}>{local_list_name}</span>
                )
            }
            <span className={indexStyles.org_name}>
              {
                is_show_org_name && is_all_org && group_view_type == '1' && !get_gantt_data_loading && gantt_board_id == '0' && (
                  <span className={indexStyles.org_name}>
                    #{getOrgNameWithOrgIdFilter(org_id, currentUserOrganizes)}
                  </span>
                )
              }
            </span>
            {
              // 只有在项目视图下，且如果在分组id == 0（未分组的情况下不能显示）
              group_view_type == '1' && list_id != '0' && (
                <Dropdown overlay={group_view_type == '1' ? this.renderMenuOperateListName() : <span></span>}>
                  <span className={`${globalStyles.authTheme} ${indexStyles.operator}`}>&#xe7fd;</span>
                </Dropdown>
              )
            }
          </div>
          {/* {this.renderNoTimeCard()} */}
          <div className={`${indexStyles.list_head_body}`}>
            <div className={`${indexStyles.list_head_body_inner} ${isShowBottDetail == '0' && indexStyles.list_head_body_inner_init} ${isShowBottDetail == '2' && indexStyles.animate_hide} ${isShowBottDetail == '1' && indexStyles.animate_show}`} >
              {this.renderTaskItem()}
            </div>
          </div>
          <div className={indexStyles.list_head_footer} onClick={this.setIsShowBottDetail}>
            <div className={`${globalStyles.authTheme} ${indexStyles.list_head_footer_tip} ${isShowBottDetail == '2' && indexStyles.spin_hide} ${isShowBottDetail == '1' && indexStyles.spin_show}`}>&#xe61f;</div>
            <div>{list_no_time_data.length}个未排期事项</div>
          </div>
        </div>
        {
          show_add_menber_visible && (
            <ShowAddMenberModal
              show_wechat_invite={true}
              _organization_id={org_id}
              board_id={list_id}
              addMenbersInProject={this.addMenbersInProject}
              modalVisible={show_add_menber_visible}
              setShowAddMenberModalVisibile={this.setShowAddMenberModalVisibile}
            />
          )}
      </div>
    )
  }

}
//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
  gantt: { datas: { group_rows = [], ceiHeight, gantt_board_id, group_view_type, get_gantt_data_loading, list_group } },
  technological: { datas: { currentUserOrganizes = [], is_show_org_name, is_all_org, } },
}) {
  return { list_group, ceiHeight, group_rows, currentUserOrganizes, is_show_org_name, is_all_org, gantt_board_id, group_view_type, get_gantt_data_loading }
}
