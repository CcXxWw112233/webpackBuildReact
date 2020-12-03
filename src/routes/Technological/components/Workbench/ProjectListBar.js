import React, { Component } from 'react'
import { connect } from 'dva'
import { Dropdown, Menu, message } from 'antd'
import styles from './index.less'
import ProjectListBarCell from './ProjectListBarCell'
import classNames from 'classnames/bind'
// import AddModalFormWithExplicitProps from './../Project/AddModalFormWithExplicitProps';
import CreateProject from './../Project/components/CreateProject/index'

import {
  checkIsHasPermission,
  setBoardIdStorage
} from './../../../../utils/businessFunction'
import { ORG_TEAM_BOARD_CREATE } from './../../../../globalset/js/constant'
import globalStyles from './../../../../globalset/css/globalClassName.less'
import { afterCreateBoardUpdateGantt } from '../Gantt/ganttBusiness'

let cx = classNames.bind(styles)

class ProjectListBar extends Component {
  constructor(props) {
    super(props)
    this.listRef = React.createRef()
    this.state = {
      dropDownMenuItemList: [],
      addProjectModalVisible: false,
      is_show_new_project: false // 是否显示新建项目
    }
  }
  handleClickProjectItem = id => {
    const { dispatch } = this.props
    const { dropDownMenuItemList } = this.state
    //如果是在下拉菜单中的元素，需要将元素置于数组的首位
    const isInDropDownMenuItemList = dropDownMenuItemList.find(
      item => item.board_id === id
    )
    Promise.resolve(
      dispatch({
        type: 'workbench/handleCurrentSelectedProjectChange',
        payload: {
          board_id: id,
          shouldResortPosition: isInDropDownMenuItemList ? true : false
        }
      })
    ).then(() => {
      this.handleWinResize()
    })
  }
  handleCreateNewProject = e => {
    if (e) e.stopPropagation()
    return this.handleCreateProject()
  }
  onClick = ({ key }) => {
    const { projectTabCurrentSelectedProject } = this.props
    //如果重复点击 projectItem
    if (key === projectTabCurrentSelectedProject) {
      return
    }

    //如果是点击新建项目
    if (key === 'create_project') {
      return this.handleCreateProject()
    }
    this.handleClickProjectItem(key)
  }
  handleCreateProject = () => {
    this.setAddProjectModalVisible()
  }
  getUerInfoFromLocalStorage = () => {
    try {
      return JSON.parse(localStorage.getItem('userInfo'))
    } catch (err) {
      return {}
    }
  }
  hideModal = () => {
    this.setState({
      addNewProjectModalVisible: false
    })
  }
  showModal = () => {
    const { dispatch } = this.props
    this.setState(
      {
        addNewProjectModalVisible: true
      },
      () => {
        dispatch({
          type: 'project/getAppsList',
          payload: {
            type: '2'
          }
        })
      }
    )
  }
  setAddProjectModalVisible = () => {
    const { addProjectModalVisible } = this.state
    this.setState({
      addProjectModalVisible: !addProjectModalVisible
    })
  }

  handleSubmitNewProject = data => {
    const { dispatch } = this.props
    const calback = () => {
      dispatch({
        type: 'workbench/getProjectList',
        payload: {}
      })
      const { workbench_show_gantt_card } = this.props
      workbench_show_gantt_card == '1' && afterCreateBoardUpdateGantt(dispatch) //新建项目后，如果是在甘特图页面，则查询下甘特图数据
    }
    dispatch({
      type: 'project/addNewProject',
      payload: {
        ...data,
        calback
      }
    })
  }
  isVisitor = param => {
    //是否访客 1不是 0是
    const condMap = new Map([
      ['0', true],
      ['1', false]
    ])
    if (typeof condMap.get(param) === 'undefined') return false
    return condMap.get(param)
  }
  handleClickedCell = id => {
    const { projectTabCurrentSelectedProject } = this.props
    //如果重复点击
    if (id === projectTabCurrentSelectedProject) {
      return
    }
    //设置board_id缓存
    setBoardIdStorage(id)

    this.handleClickProjectItem(id)
    //处理工作台数据
    this.handleGanttData(id)
    //获取里程碑列表
    this.getMilestoneList(id)
  }
  //获取项目里程碑列表
  getMilestoneList = id => {
    const { dispatch } = this.props
    dispatch({
      type: 'workbenchPublicDatas/getMilestoneList',
      payload: {
        id
      }
    })
  }
  handleGanttData(id) {
    return
    const { dispatch, workbench_show_gantt_card } = this.props
    const { projectTabCurrentSelectedProject } = this.props
    if (workbench_show_gantt_card != '1') {
      return
    }
    dispatch({
      type: 'gantt/getGanttData',
      payload: {
        tab_board_id: id
      }
    })
    dispatch({
      type: 'gantt/getGttMilestoneList',
      payload: {
        tab_board_id: id
      }
    })
    if (id !== '0') {
      dispatch({
        type: 'workbench/fetchCurrentSelectedProjectMembersList',
        payload: {
          projectId: id
        }
      })
    }
  }
  renderProjectListBarCreateNewProject = () => {
    return (
      <span
        onClick={e => this.handleCreateNewProject(e)}
        className={styles.createProject_cell}
      >
        <i className={`${globalStyles.authTheme}`}>&#xe782;</i>
        <span style={{ marginLeft: '3px' }}>新建项目</span>
      </span>
    )
  }
  componentDidMount() {
    // this.handleWinResize();
    setTimeout(() => {
      this.handleWinResize()
      // this.setState({
      //   is_show_new_project: !this.state.is_show_new_project
      // })
    }, 500)
    window.addEventListener('resize', this.handleWinResize, false)
    // this.listenProjectListBarItemWrapper()
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWinResize, false)
  }
  componentWillReceiveProps(nextProps) {
    const { projectList, siderRightCollapsed } = this.props
    const { siderRightCollapsed: newSiderRightCollapsed } = nextProps
    const { is_show_new_project } = this.state
    // console.log(nextProps, 'ssssss')
    // console.log(projectList, 'sss')
    // this.listenProjectListBarItemWrapper()
    const that = this
    if (projectList.length != nextProps.projectList.length) {
      setTimeout(() => {
        // console.log('ssssss', 1111111111111)
        that.handleWinResize()
        // this.setState({
        //   is_show_new_project: !is_show_new_project
        // })
      }, 500)
    }
    // 需要监听右侧IM圈子的变化
    if (siderRightCollapsed != newSiderRightCollapsed) {
      setTimeout(() => {
        // console.log('ssssss', 1111111111111)
        that.handleWinResize()
        // this.setState({
        //   is_show_new_project: !is_show_new_project
        // })
      }, 500)
    }
  }

  // 观察者模式
  listenProjectListBarItemWrapper() {
    const that = this
    // Firefox和Chrome早期版本中带有前缀
    const MutationObserver =
      window.MutationObserver ||
      window.WebKitMutationObserver ||
      window.MozMutationObserver
    // 选择目标节点
    const target = this.listRef && this.listRef.current
    if (!target) {
      return
    }
    // 创建观察者对象
    const observer = new MutationObserver(function(mutations) {
      target.childNodes.forEach(childNode => {
        console.log(childNode.offsetTop, 'ssssssss')
      })
      // mutations.forEach(function (mutation) {

      // });
    })
    // 配置观察选项:
    const config = {
      attributes: true, //检测属性变动
      subtree: true,
      childList: true, //检测子节点变动
      characterData: true //节点内容或节点文本的变动。
    }
    // 传入目标节点和观察选项
    observer.observe(target, config)
    // /停止观察
    // observer.disconnect();
  }

  handleWinResize = () => {
    const { projectList } = this.props
    const listRefChildren =
      this.listRef && this.listRef.current && this.listRef.current.children
    let childNodeOffsetTopList
    if (listRefChildren) {
      // 因为获取DOM元素有延迟
      // 本意想用观察者模式进行监听DOM元素的变化
      setTimeout(() => {
        childNodeOffsetTopList = [...listRefChildren].map(childNode => {
          return childNode.offsetTop
        })
      }, 50)
      // 必须要获取完毕之后在进行, 使用观察者模式也不行, 所以采用延时操作
      setTimeout(() => {
        if (childNodeOffsetTopList && childNodeOffsetTopList.length) {
          // 这个是表示它有项目的情况
          const shouldPushInDropDownMenuItem = childNodeOffsetTopList.reduce(
            (acc, curr, ind) => {
              // console.log('sssss',{acc, curr, ind})
              if (curr !== 0) {
                return [...acc, projectList[ind]]
              }
              return acc
            },
            []
          )
          this.setState(
            {
              dropDownMenuItemList: shouldPushInDropDownMenuItem,
              is_show_new_project:
                shouldPushInDropDownMenuItem &&
                shouldPushInDropDownMenuItem.length != 0
                  ? false
                  : true
            },
            () => {
              // console.info('ssssss',this.state.dropDownMenuItemList)
            }
          )
        } else {
          // 表示没有一个项目的时候
          this.setState({
            is_show_new_project: true
          })
        }
      }, 200)
    }
  }

  dropDownMenu = (dropDownMenuItemList = []) => {
    return (
      <div className={styles.dropDownMenuWrapper}>
        <Menu onClick={this.onClick} style={{ minWidth: '120px' }}>
          {dropDownMenuItemList &&
            dropDownMenuItemList.length &&
            dropDownMenuItemList.map(item => (
              <Menu.Item key={item.board_id}>
                <span style={{ userSelect: 'none' }}>{item.board_name}</span>
              </Menu.Item>
            ))}
          {/* {!isVisitor && checkIsHasPermission(ORG_TEAM_BOARD_CREATE) && <Menu.Item key='create_project'><span style={{userSelect: 'none'}}><i className={`${globalStyles.authTheme}`}>&#xe782;</i>新建项目</span></Menu.Item>} */}
          {checkIsHasPermission(ORG_TEAM_BOARD_CREATE) && (
            <Menu.Item key="create_project">
              <span style={{ userSelect: 'none' }}>
                <i className={`${globalStyles.authTheme}`}>&#xe782;</i>新建项目
              </span>
            </Menu.Item>
          )}
        </Menu>
      </div>
    )
  }

  render() {
    const {
      project,
      projectList,
      projectTabCurrentSelectedProject,
      workbench_show_gantt_card
    } = this.props
    const { datas = {} } = project
    const { appsList = [] } = datas
    const {
      dropDownMenuItemList,
      addNewProjectModalVisible,
      addProjectModalVisible,
      is_show_new_project
    } = this.state
    let projectListBarAllClass = cx({
      [styles.projectListBarAll]: true,
      [styles.projectListBarCellActive]:
        projectTabCurrentSelectedProject === '0' ? true : false
    })
    const {
      current_org: { identity_type } = {}
    } = this.getUerInfoFromLocalStorage()
      ? this.getUerInfoFromLocalStorage()
      : {}
    const isVisitor = this.isVisitor(identity_type)

    return (
      <div className={styles.projectListBarWrapper}>
        {projectList && projectList.length !== 0 && (
          <p
            className={projectListBarAllClass}
            onClick={() => this.handleClickedCell('0')}
          >
            所有参与的项目
          </p>
        )}
        <ul className={styles.projectListBarItemWrapper} ref={this.listRef}>
          {projectList &&
            workbench_show_gantt_card == '0' &&
            projectList.map(({ board_id, board_name, apps, org_id }) => (
              <ProjectListBarCell
                board_id={board_id}
                board_name={board_name}
                key={board_id}
                apps={apps}
                org_id={org_id}
                handleClickedCell={this.handleClickedCell}
                shouldActive={projectTabCurrentSelectedProject}
              />
            ))}
        </ul>
        {workbench_show_gantt_card == '0' &&
          (dropDownMenuItemList.length != 0 ? (
            <Dropdown
              getPopupContainer={triggerNode => triggerNode.parentNode}
              placement="bottomCenter"
              overlay={this.dropDownMenu(dropDownMenuItemList)}
              style={{ zIndex: '9999' }}
            >
              <div className={styles.projectListBarExpand}>
                <p className={styles.projectListBarExpandImg} />
              </div>
            </Dropdown>
          ) : (
            is_show_new_project &&
            !isVisitor &&
            checkIsHasPermission(ORG_TEAM_BOARD_CREATE) &&
            this.renderProjectListBarCreateNewProject()
          ))}
        {/*{addNewProjectModalVisible && (*/}
        {/*<AddModalFormWithExplicitProps*/}
        {/*addNewProjectModalVisible={addNewProjectModalVisible}*/}
        {/*key="1"*/}
        {/*hideModal={this.hideModal}*/}
        {/*showModal={this.showModal}*/}
        {/*project={project}*/}
        {/*handleSubmitNewProject={this.handleSubmitNewProject}*/}
        {/*/>*/}
        {/*)}*/}
        {addProjectModalVisible && workbench_show_gantt_card == '0' && (
          <CreateProject
            setAddProjectModalVisible={this.setAddProjectModalVisible}
            addProjectModalVisible={addProjectModalVisible}
            appsList={appsList}
            addNewProject={this.handleSubmitNewProject}
          />
        )}
      </div>
    )
  }
}

export default connect(
  ({
    workbench: {
      datas: {
        projectList,
        projectTabCurrentSelectedProject,
        workbench_show_gantt_card
      }
    },
    gantt,
    project,
    technological: {
      datas: { siderRightCollapsed = false, userOrgPermissions }
    }
  }) => ({
    project,
    projectList,
    projectTabCurrentSelectedProject,
    gantt,
    workbench_show_gantt_card,
    siderRightCollapsed,
    userOrgPermissions
  })
)(ProjectListBar)
