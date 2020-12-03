import React, { Component } from 'react'
import ContentFilter from './components/contentFilter'
import { Dropdown, Tooltip, message } from 'antd'
import indexStyles from './index.less'
import { connect } from 'dva'
import globalStyles from '@/globalset/css/globalClassName.less'
import { afterCreateBoardUpdateGantt } from './ganttBusiness'
import CreateProject from '../Project/components/CreateProject/index'
import {
  checkIsHasPermission,
  selectBoardToSeeInfo,
  setBoardIdStorage
} from '../../../../utils/businessFunction'
import { ORG_TEAM_BOARD_CREATE } from '../../../../globalset/js/constant'
import { ganttIsOutlineView } from './constants'

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
        gantt_board_id: group_view_type_new == '3' ? gantt_board_id : '0',
        group_view_type: group_view_type_new,
        list_group: []
      }
    })
    if (gantt_board_id != '0') {
      const { simplemodeCurrentProject } = this.props
      selectBoardToSeeInfo({
        board_id: gantt_board_id,
        board_name: simplemodeCurrentProject.board_name,
        dispatch
      })
    } else {
      selectBoardToSeeInfo({ board_id: '0', dispatch })
    }

    // dispatch({
    //     type: 'gantt/getGanttData',
    //     payload: {}
    // })
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
    const { dispatch } = this.props
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        gantt_board_id: '0',
        group_view_type: '1',
        list_group: []
      }
    })
    selectBoardToSeeInfo({ board_id: '0', dispatch })
    // dispatch({
    //     type: 'gantt/getGanttData',
    //     payload: {

    //     }
    // })
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
      dispatch({
        type: 'workbench/getProjectList',
        payload: {}
      })
      dispatch({
        type: 'gantt/updateDatas',
        payload: {
          group_view_type: '4'
        }
      })
      afterCreateBoardUpdateGantt(dispatch)
      selectBoardToSeeInfo({
        board_id: id,
        board_name: data.board_name,
        dispatch,
        org_id: data._organization_id,
        is_new_board: true
      })
    }
    dispatch({
      type: 'project/addNewProject',
      payload: {
        ...data,
        calback
      }
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
  render() {
    const { dropdownVisible, addProjectModalVisible } = this.state
    const {
      target_scrollLeft,
      target_scrollTop,
      group_view_type = '1',
      gantt_board_id = '0',
      group_view_filter_boards,
      group_view_filter_users
    } = this.props
    const selected = `${indexStyles.button_nomal_background} ${indexStyles.type_select}`
    // console.log("gantt_board_id", gantt_board_id);
    return (
      <div
        className={indexStyles.groupHeadSetBott}
        style={{
          display: !ganttIsOutlineView({ group_view_type }) ? 'block' : 'none'
        }}
      >
        <div className={indexStyles.set_content}>
          <div className={indexStyles.set_content_left}></div>

          <div className={indexStyles.set_content_right}>
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
            {/* 在项目视图，并且在查看全部项目下 */}

            {group_view_type == '1' &&
              gantt_board_id == '0' &&
              this.isHasCreatBoardPermission() && (
                <Tooltip title={'新建项目'}>
                  <div
                    className={`${indexStyles.set_content_right_right} ${globalStyles.authTheme}`}
                    onClick={this.createBoard}
                  >
                    &#xe846;
                  </div>
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
