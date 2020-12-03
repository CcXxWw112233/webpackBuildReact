import React, { Component } from 'react'
import ContentFilter from './components/contentFilter'
import { Dropdown, Tooltip, message, Tag } from 'antd'
import indexStyles from './index.less'
import { connect } from 'dva'
import globalStyles from '@/globalset/css/globalClassName.less'
import { afterCreateBoardUpdateGantt } from './ganttBusiness'
import CreateProject from './../Project/components/CreateProject/index'
import {
  checkIsHasPermission,
  selectBoardToSeeInfo,
  setBoardIdStorage,
  currentNounPlanFilterName
} from '../../../../utils/businessFunction'
import {
  ORG_TEAM_BOARD_CREATE,
  PROJECTS
} from '../../../../globalset/js/constant'
import { ganttIsOutlineView } from './constants'
import BaseLine from './components/BaseLine'

@connect(mapStateToProps)
export default class GroupListHeadSet extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dropdownVisible: false,
      addProjectModalVisible: false
    }
  }

  // componentDidMount() {
  //     const { dispatch } = this.props
  //     setInterval(() => {
  //         console.log('sssssss_aaa')
  //         dispatch({
  //             type: 'technological/getUserOrgPermissions',
  //             payload: {

  //             }
  //         })
  //     }, 5000)
  // }

  setGroupViewType = group_view_type_new => {
    const { dispatch, group_view_type } = this.props
    if (group_view_type == group_view_type_new) {
      return
    }
    const { gantt_board_id = '0' } = this.props

    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        // gantt_board_id: group_view_type_new == '3' ? gantt_board_id : '0',
        group_view_type: group_view_type_new,
        list_group: [],
        selected_hide_term: false
      }
    })
    // if (gantt_board_id != '0') {
    //     const { simplemodeCurrentProject } = this.props;
    //     selectBoardToSeeInfo({ board_id: gantt_board_id, board_name: simplemodeCurrentProject.board_name, dispatch, group_view_type: group_view_type_new });
    // } else {
    //     selectBoardToSeeInfo({ board_id: '0', dispatch, group_view_type: group_view_type_new })
    // }

    dispatch({
      type: 'gantt/getGanttData',
      payload: {}
    })
  }
  onVisibleChange = bool => {
    this.setDropdownVisible(bool)
  }
  setDropdownVisible = bool => {
    this.setState({
      dropdownVisible: bool
    })
  }
  //返回
  backClick = () => {
    const { dispatch, group_view_type } = this.props
    if (group_view_type == '5') {
      dispatch({
        type: 'gantt/updateDatas',
        payload: {
          group_view_type: '1',
          list_group: []
        }
      })
      dispatch({
        type: 'gantt/getGanttData',
        payload: {}
      })
    } else {
      dispatch({
        type: 'gantt/updateDatas',
        payload: {
          gantt_board_id: '0',
          group_view_type: '1',
          list_group: []
        }
      })
      selectBoardToSeeInfo({ board_id: '0', dispatch })
    }
  }
  // 添加项目
  setAddProjectModalVisible = data => {
    const { addProjectModalVisible } = this.state
    this.setState({
      addProjectModalVisible: !addProjectModalVisible
    })
  }

  handleSubmitNewProject = data => {
    const { dispatch } = this.props
    const calback = id => {
      if (!!!id) {
        return
      }
      // dispatch({
      //     type: 'gantt/updateDatas',
      //     payload: {
      //         gantt_board_id: id,
      //         list_group: [],
      //     }
      // })
      selectBoardToSeeInfo({
        board_id: id,
        board_name: data.board_name,
        dispatch,
        org_id: data._organization_id,
        is_new_board: true
      })
    }
    Promise.resolve(
      dispatch({
        type: 'project/addNewProject',
        payload: {
          ...data,
          calback
        }
      })
    )
      .then(() => {
        dispatch({
          type: 'workbench/getProjectList',
          payload: {}
        })
      })
      .then(() => {
        dispatch({
          type: 'gantt/updateDatas',
          payload: {
            group_view_type: '4'
          }
        })
        afterCreateBoardUpdateGantt(dispatch)
      })
  }

  createBoard = () => {
    if (!this.isHasCreatBoardPermission()) {
      message.warn('您在该组织没有创建项目权限')
      return false
    }
    this.setAddProjectModalVisible()
  }
  isHasCreatBoardPermission = () => {
    const org_id = localStorage.getItem('OrganizationId')
    let flag = true
    if (org_id != '0') {
      if (!checkIsHasPermission(ORG_TEAM_BOARD_CREATE)) {
        flag = false
      }
    }
    return flag
  }
  deleteSingleUser = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        group_view_type: '2',
        single_select_user: { id: '', name: '' },
        list_group: []
      }
    })
    dispatch({
      type: 'gantt/getGanttData',
      payload: {}
    })
  }
  render() {
    const { dropdownVisible, addProjectModalVisible } = this.state
    const {
      single_select_user,
      target_scrollLeft,
      target_scrollTop,
      group_view_type = '1',
      gantt_board_id = '0',
      group_view_filter_boards,
      group_view_filter_users
    } = this.props
    const selected = `${indexStyles.button_nomal_background} ${indexStyles.type_select}`
    return (
      <div
        className={indexStyles.groupHeadSet}
        // style={{ left: target_scrollLeft, top: target_scrollTop }}
      >
        <div className={indexStyles.set_content}>
          <div className={indexStyles.set_content_left}>
            {gantt_board_id != '0' && group_view_type != '2' && (
              <div
                onClick={this.backClick}
                className={`${indexStyles.group_back_to_board} ${globalStyles.authTheme}`}
              >
                &#xe7ec;
              </div>
            )}
            <div className={indexStyles.set_content_view_type}>
              <Tooltip
                title={gantt_board_id != '0' ? '大纲视图' : '请先进入单个项目'}
              >
                <div
                  onClick={() => {
                    if (gantt_board_id != '0') this.setGroupViewType('4')
                  }}
                  className={`${indexStyles.set_content_left_left} ${
                    globalStyles.authTheme
                  } ${ganttIsOutlineView({ group_view_type }) && selected} ${
                    gantt_board_id == '0' ? indexStyles.disabled : ''
                  }`}
                  style={{ display: gantt_board_id == '0' ? 'none' : 'block' }}
                >
                  &#xe680;
                </div>
              </Tooltip>

              <Tooltip
                title={
                  gantt_board_id == '0'
                    ? `${currentNounPlanFilterName(PROJECTS)}视图`
                    : '分组视图'
                }
              >
                <div
                  style={{
                    borderRadius:
                      gantt_board_id == '0' ? '4px 0 0 4px' : '0 4px 4px 0'
                  }}
                  onClick={() => this.setGroupViewType('1')}
                  className={`${indexStyles.set_content_left_center} ${
                    globalStyles.authTheme
                  }
                                    ${(group_view_type == '1' ||
                                      group_view_type == '5') &&
                                      selected}`}
                >
                  {gantt_board_id == '0' ? (
                    !single_select_user.id ? (
                      <span>&#xe68a;</span>
                    ) : (
                      <span>&#xe694;</span>
                    )
                  ) : (
                    <span>&#xe681;</span>
                  )}
                </div>
              </Tooltip>
              <Tooltip title={'人员视图'}>
                <div
                  onClick={() => this.setGroupViewType('2')}
                  className={`${indexStyles.set_content_left_right} ${
                    globalStyles.authTheme
                  }  ${group_view_type == '2' && selected}`}
                  style={{ display: gantt_board_id == '0' ? 'block' : 'none' }}
                >
                  &#xe693;
                </div>
              </Tooltip>
            </div>
          </div>
          {single_select_user.id && (
            <div>
              <Tag
                title={single_select_user.name}
                closable
                visible={true}
                color="blue"
                onClose={this.deleteSingleUser}
              >
                <span
                  style={{
                    maxWidth: 100,
                    display: 'inline-block',
                    verticalAlign: 'top'
                  }}
                  className={`${globalStyles.global_ellipsis}`}
                >
                  {single_select_user.name}
                </span>
              </Tag>
            </div>
          )}
          <div className={indexStyles.set_content_right}>
            {/* <div className={indexStyles.set_content_dec}>
                            {group_view_type == '1' && (
                                gantt_board_id == '0' ? '项目列表' : '分组列表'
                            )}
                            {group_view_type == '2' && '成员列表'}
                            {group_view_type == '4' && '我的计划'}
                        </div> */}
            {group_view_type === '4' && (
              <BaseLine
                board_id={gantt_board_id}
                group_view_type={group_view_type}
              />
            )}
            {!ganttIsOutlineView({ group_view_type }) && (
              <Tooltip title={'内容过滤'}>
                <Dropdown
                  overlay={
                    <ContentFilter
                      dropdownVisible={dropdownVisible}
                      setDropdownVisible={this.setDropdownVisible}
                    />
                  }
                  trigger={['click']}
                  visible={dropdownVisible}
                  zIndex={500}
                >
                  <div
                    className={`${indexStyles.set_content_right_left} ${
                      globalStyles.authTheme
                    }
                                    ${(group_view_filter_boards.length ||
                                      group_view_filter_users.length) &&
                                      indexStyles.has_filter_content}`}
                    onClick={() => this.setDropdownVisible(true)}
                  >
                    &#xe8bd;
                  </div>
                </Dropdown>
              </Tooltip>
            )}
          </div>
        </div>
        {addProjectModalVisible && (
          <CreateProject
            setAddProjectModalVisible={this.setAddProjectModalVisible}
            addProjectModalVisible={addProjectModalVisible}
            addNewProject={this.handleSubmitNewProject}
          />
        )}
      </div>
    )
  }
}
function mapStateToProps({
  technological: {
    datas: { userOrgPermissions }
  },
  gantt: {
    datas: {
      single_select_user,
      target_scrollLeft = [],
      target_scrollTop = [],
      group_view_type,
      gantt_board_id,
      group_view_filter_boards,
      group_view_filter_users
    }
  },
  simplemode: { simplemodeCurrentProject }
}) {
  return {
    single_select_user,
    userOrgPermissions,
    target_scrollLeft,
    target_scrollTop,
    group_view_type,
    gantt_board_id,
    group_view_filter_boards,
    group_view_filter_users,
    simplemodeCurrentProject
  }
}
