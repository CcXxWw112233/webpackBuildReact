import React, { Component } from 'react'
import globalStyles from '@/globalset/css/globalClassName.less'
import styles from './index.less'
import { Checkbox, Menu, Dropdown } from 'antd'
import { connect } from 'dva'
import {
  selectBoardToSeeInfo,
  getOrgIdByBoardId,
  setBoardIdStorage,
  getOrgNameWithOrgIdFilter,
  checkIsHasPermissionInBoard,
  currentNounPlanFilterName
} from '../../../../../utils/businessFunction'
import CreateProject from '@/routes/Technological/components/Project/components/CreateProject/index'

import BoardItem from './BoardItem'
import { afterClearGanttData } from '../../../../Technological/components/Gantt/ganttBusiness'
import { isObjectValueEqual, isArrayEqual } from '../../../../../utils/util'
import { PROJECTS } from '../../../../../globalset/js/constant'

@connect(mapStateToProps)
export default class MainBoard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      local_selected_board: {},
      projectList: props.projectList
    }
  }
  componentDidMount() {
    const { dispatch, projectList = [] } = this.props
    this.initGetTodoList()
    dispatch({
      type: 'workbench/getProjectList',
      payload: {}
    })
  }
  componentWillReceiveProps(nextProps) {
    if (!isObjectValueEqual(nextProps.projectList, this.state.projectList)) {
      // 表示不是在我负责的项目下
      if (nextProps.simplemodeCurrentProject.selected_board_term == '2') {
        this.getTheProjectListIsBelongToUserSelf(nextProps)
      } else {
        this.setState({
          projectList: nextProps.projectList
        })
      }
    }
    if (
      nextProps.simplemodeCurrentProject.selected_board_term !=
      this.props.simplemodeCurrentProject.selected_board_term
    ) {
      // 这里是单独判断切换我参与的和我负责的
      this.getTheProjectListIsBelongToUserSelf(nextProps)
    }
  }
  // 初始化获取待办事项
  initGetTodoList = () => {
    const {
      dispatch,
      currentSelectOrganize,
      simplemodeCurrentProject: { board_id }
    } = this.props
    const params = {
      _organization_id:
        currentSelectOrganize.id || localStorage.getItem('OrganizationId')
    }
    if (board_id && board_id != '0') {
      params.board_ids = board_id
    }
    dispatch({
      type: 'simplemode/getBoardsTaskTodoList',
      payload: {
        ...params
      }
    })
    dispatch({
      type: 'simplemode/getBoardsProcessTodoList',
      payload: {
        _organization_id: params._organization_id,
        board_id: params.board_ids
      }
    })
  }
  setAddProjectModalVisible = () => {
    this.setState({
      addProjectModalVisible: !this.state.addProjectModalVisible
    })
  }

  // 设置默认项目计划盒子
  setBoardPlanDefaultBox = () => {
    const { dispatch, workbenchBoxList = [] } = this.props
    const box = workbenchBoxList.find(item => item.code == 'board:plans')
    dispatch({
      //重置当前盒子类型
      type: 'simplemode/updateDatas',
      payload: {
        currentSelectedWorkbenchBox: box
      }
    })

    window.sessionStorage.setItem(
      'session_currentSelectedWorkbenchBox',
      JSON.stringify(box)
    )
  }
  handleSubmitNewProject = data => {
    const { dispatch, projectList = [] } = this.props
    this.setAddProjectModalVisible()
    const calback = (id, name) => {
      dispatch({
        type: 'workbench/getProjectList',
        payload: {}
      })
      afterClearGanttData({ dispatch })
      // if (!projectList.length) {
      selectBoardToSeeInfo({
        board_id: id,
        board_name: name,
        dispatch,
        org_id: data._organization_id,
        group_view_type: '4'
      }) //极简模式项目选择
      // window.sessionStorage.removeItem('session_currentSelectedWorkbenchBox') //重置当前盒子类型
      // dispatch({//重置当前盒子类型
      //     type: 'simplemode/updateDatas',
      //     payload: {
      //         currentSelectedWorkbenchBox: {}
      //     }
      // });
      this.setBoardPlanDefaultBox()
      dispatch({
        type: 'simplemode/routingJump',
        payload: {
          route: '/technological/simplemode/workbench'
        }
      })
      // }
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
  }
  // 缓存上一个选择的项目
  setLocalSelectedBoard = (data = {}) => {
    this.setState({
      local_selected_board: data
    })
  }
  // 获取参与项目还是发起项目
  getTheProjectListIsBelongToUserSelf = props => {
    const { projectList = [], simplemodeCurrentProject = {} } = props
    const { selected_board_term } = simplemodeCurrentProject
    // const { id } = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : {};
    let filterProjectList = [...projectList]
    // 这是过滤我发起的项目
    // filterProjectList = (selected_board_term == '0' || !selected_board_term) ? projectList : selected_board_term == '1' ? filterProjectList.filter(i=>i.user_id==id) : []
    // 过滤我负责的项目
    filterProjectList =
      selected_board_term == '0' || !selected_board_term
        ? projectList
        : selected_board_term == '2'
        ? filterProjectList.filter(i => i.is_principal == '1')
        : []
    this.setState({
      projectList: filterProjectList
    })
  }

  checkBoxChange = e => {
    const checked = e.target.checked
    const { local_selected_board = {} } = this.state
    const { dispatch, simplemodeCurrentProject = {} } = this.props
    const { projectList = [] } = this.state
    const { selected_board_term } = simplemodeCurrentProject
    if (checked) {
      // 表示全选
      // dispatch({
      //     type: 'accountSet/updateUserSet',
      //     payload: {
      //         current_board: '0'
      //     }
      // });
      dispatch({
        type: 'technological/updateDatas',
        payload: {
          currentSelectedProjectOrgIdByBoardId: ''
        }
      })
      selectBoardToSeeInfo({ board_id: '0', selected_board_term, dispatch })
      dispatch({
        type: 'simplemode/getBoardsTaskTodoList',
        payload: {
          _organization_id: localStorage.getItem('OrganizationId')
          // board_ids: '0'
        }
      })
      dispatch({
        type: 'simplemode/getBoardsProcessTodoList',
        payload: {
          _organization_id: localStorage.getItem('OrganizationId')
          // board_ids: '0'
        }
      })
    } else {
      //设置当前选中的项目
      if (local_selected_board.board_id) {
        setBoardIdStorage(local_selected_board.board_id)
        dispatch({
          type: 'simplemode/updateDatas',
          payload: {
            simplemodeCurrentProject: { local_selected_board }
          }
        })
        // dispatch({
        //     type: 'accountSet/updateUserSet',
        //     payload: {
        //         current_board: local_selected_board.board_id
        //     }
        // });
        dispatch({
          type: 'technological/updateDatas',
          payload: {
            currentSelectedProjectOrgIdByBoardId: local_selected_board.board_id
          }
        })
        dispatch({
          type: 'simplemode/getBoardsTaskTodoList',
          payload: {
            _organization_id: local_selected_board.org_id,
            board_ids: local_selected_board.board_id
          }
        })
        dispatch({
          type: 'simplemode/getBoardsProcessTodoList',
          payload: {
            _organization_id: local_selected_board.org_id,
            board_id: local_selected_board.board_id
          }
        })
        selectBoardToSeeInfo({
          board_id: local_selected_board && local_selected_board.board_id,
          board_name: local_selected_board && local_selected_board.board_name,
          dispatch,
          selected_board_term
        })
      } else {
        if (!(projectList && projectList.length)) return
        setBoardIdStorage(projectList[0].board_id)
        dispatch({
          type: 'simplemode/updateDatas',
          payload: {
            simplemodeCurrentProject: { ...projectList[0] }
          }
        })

        // dispatch({
        //     type: 'accountSet/updateUserSet',
        //     payload: {
        //         current_board: projectList[0].board_id
        //     }
        // });

        dispatch({
          type: 'technological/updateDatas',
          payload: {
            currentSelectedProjectOrgIdByBoardId: projectList[0].board_id
          }
        })
        dispatch({
          type: 'simplemode/getBoardsTaskTodoList',
          payload: {
            _organization_id: projectList[0].org_id,
            board_ids: projectList[0].board_id
          }
        })
        dispatch({
          type: 'simplemode/getBoardsProcessTodoList',
          payload: {
            _organization_id: projectList[0].org_id,
            board_id: projectList[0].board_id
          }
        })
        selectBoardToSeeInfo({
          board_id: projectList[0] && projectList[0].board_id,
          board_name: projectList[0] && projectList[0].board_name,
          dispatch,
          selected_board_term
        })
      }
    }
  }
  // 下拉选项
  handleBoardSelectedTerm = e => {
    const { key } = e
    const { dispatch, simplemodeCurrentProject = {} } = this.props
    // dispatch({
    //     type: 'accountSet/updateUserSet',
    //     payload: {
    //         current_board: '0'
    //     }
    // });
    dispatch({
      type: 'technological/updateDatas',
      payload: {
        currentSelectedProjectOrgIdByBoardId: ''
      }
    })
    selectBoardToSeeInfo({ board_id: '0', selected_board_term: key, dispatch })
    dispatch({
      type: 'simplemode/getBoardsTaskTodoList',
      payload: {
        _organization_id: localStorage.getItem('OrganizationId')
        // board_ids: '0'
      }
    })
    dispatch({
      type: 'simplemode/getBoardsProcessTodoList',
      payload: {
        _organization_id: localStorage.getItem('OrganizationId')
        // board_ids: '0'
      }
    })
  }
  // 下拉选项
  renderBoardSelectedTerm = () => {
    const {
      simplemodeCurrentProject: { selected_board_term }
    } = this.props
    return (
      <div>
        <Menu
          defaultSelectedKeys="0"
          selectedKeys={selected_board_term ? selected_board_term : '0'}
          onClick={this.handleBoardSelectedTerm}
        >
          {/* <Menu.Item key="1">我发起的项目</Menu.Item> */}
          <Menu.Item key="0">
            我参与的
            {`${currentNounPlanFilterName(
              PROJECTS,
              this.props.currentNounPlan
            )}`}
          </Menu.Item>
          <Menu.Item key="2">
            我负责的
            {`${currentNounPlanFilterName(
              PROJECTS,
              this.props.currentNounPlan
            )}`}
          </Menu.Item>
        </Menu>
      </div>
    )
  }
  // 渲染主区域
  renderBoardArea = () => {
    const {
      simplemodeCurrentProject = {},
      local_selected_board = {}
    } = this.props
    // console.log('this.props.currentNounPlan', this.props.currentNounPlan)
    const { selected_board_term } = simplemodeCurrentProject
    return (
      <div className={styles.board_area}>
        <div className={styles.board_area_top}>
          <Dropdown
            getPopupContainer={triggerNode => triggerNode.parentNode}
            overlay={this.renderBoardSelectedTerm()}
            trigger={['click']}
          >
            <div className={styles.board_area_top_lf}>
              {selected_board_term == '0' || !selected_board_term
                ? `我参与的${currentNounPlanFilterName(
                    PROJECTS,
                    this.props.currentNounPlan
                  )}`
                : selected_board_term == '2'
                ? `我负责的${currentNounPlanFilterName(
                    PROJECTS,
                    this.props.currentNounPlan
                  )}`
                : ''}{' '}
              <span className={globalStyles.authTheme}>&#xe7ee;</span>
            </div>
          </Dropdown>
          <div className={styles.board_area_top_rt}>
            <Checkbox
              checked={
                (simplemodeCurrentProject.board_id == '0' ||
                  !simplemodeCurrentProject.board_id) &&
                !local_selected_board.board_id
              }
              onChange={this.checkBoxChange}
              style={{ color: '#fff' }}
            >
              全选
            </Checkbox>
          </div>
        </div>
        <div
          className={`${styles.board_area_middle} ${globalStyles.global_vertical_scrollbar}`}
        >
          {this.renderBoardList()}
        </div>
        <div className={styles.board_area_bott}>
          <div
            className={`${styles.create_btn}`}
            onClick={this.setAddProjectModalVisible}
          >
            <i className={`${globalStyles.authTheme}`} style={{ fontSize: 16 }}>
              &#xe846;
            </i>
            <span>
              新建
              {`${currentNounPlanFilterName(
                PROJECTS,
                this.props.currentNounPlan
              )}`}
            </span>
          </div>
        </div>
      </div>
    )
  }
  renderCreate = () => {
    return (
      <div className={styles.create}>
        <div className={`${styles.create_top} ${globalStyles.authTheme}`}>
          &#xe703;
        </div>
        <div className={styles.create_middle}>
          暂无
          {`${currentNounPlanFilterName(PROJECTS, this.props.currentNounPlan)}`}
          ，赶快新建一个吧
        </div>
        <div
          className={styles.create_btn}
          onClick={this.setAddProjectModalVisible}
        >
          <i className={`${globalStyles.authTheme}`} style={{ fontSize: 16 }}>
            &#xe846;
          </i>
          <span>
            {' '}
            {`新建${currentNounPlanFilterName(
              PROJECTS,
              this.props.currentNounPlan
            )}`}
          </span>
        </div>
      </div>
    )
  }

  // 项目列表操作项
  renderBoardList = () => {
    // const { projectList = [], simplemodeCurrentProject = {} } = this.props
    const { projectList = [] } = this.state
    return projectList.map(value => {
      const { board_id } = value
      return (
        <BoardItem
          key={board_id}
          itemValue={value}
          setLocalSelectedBoard={this.setLocalSelectedBoard}
        />
      )
    })
  }

  render() {
    const { addProjectModalVisible } = this.state
    const { projectList = [], projectInitLoaded } = this.props
    return (
      <>
        {projectInitLoaded
          ? projectList.length
            ? this.renderBoardArea()
            : this.renderCreate()
          : ''}
        <CreateProject
          setAddProjectModalVisible={this.setAddProjectModalVisible}
          addProjectModalVisible={addProjectModalVisible} //addProjectModalVisible
          addNewProject={this.handleSubmitNewProject}
        />
      </>
    )
  }
}
//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
  workbench: {
    datas: { projectList, projectInitLoaded }
  },
  simplemode: {
    myWorkbenchBoxList,
    workbenchBoxList,
    simplemodeCurrentProject = {}
  },
  technological: {
    datas: {
      currentUserOrganizes,
      currentSelectedProjectOrgIdByBoardId,
      userOrgPermissions,
      currentSelectOrganize
    }
  },
  organizationManager: {
    datas: { currentNounPlan }
  }
}) {
  return {
    projectList,
    myWorkbenchBoxList,
    workbenchBoxList,
    simplemodeCurrentProject,
    currentUserOrganizes,
    currentSelectedProjectOrgIdByBoardId,
    userOrgPermissions,
    projectInitLoaded,
    currentSelectOrganize,
    currentNounPlan
  }
}
