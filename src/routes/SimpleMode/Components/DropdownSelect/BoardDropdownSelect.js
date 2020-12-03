import React, { Component } from 'react'
import dva, { connect } from 'dva/index'
import globalStyles from '@/globalset/css/globalClassName.less'
import { Icon, message, Tooltip } from 'antd'
import DropdownSelect from '../DropdownSelect'
import CreateProject from '@/routes/Technological/components/Project/components/CreateProject/index'
import {
  getOrgNameWithOrgIdFilter,
  setBoardIdStorage,
  checkIsHasPermission
} from '@/utils/businessFunction'
import {
  afterChangeBoardUpdateGantt,
  afterCreateBoardUpdateGantt
} from '../../../Technological/components/Gantt/ganttBusiness'
import { beforeChangeCommunicationUpdateFileList } from '../WorkbenchPage/BoardCommunication/components/getCommunicationFileListFn'
import { isPaymentOrgUser, getOrgIdByBoardId } from '@/utils/businessFunction'
import {
  selectBoardToSeeInfo,
  currentNounPlanFilterName
} from '../../../../utils/businessFunction'
import { isApiResponseOk } from '../../../../utils/handleResponseData'
import {
  ORG_TEAM_BOARD_CREATE,
  PROJECTS,
  ORGANIZATION
} from '../../../../globalset/js/constant'
class BoardDropdownSelect extends Component {
  constructor(props) {
    super(props)
    this.state = {
      addProjectModalVisible: false
    }
  }

  handelBoardChangeCalback = board_id => {
    const {
      currentSelectedWorkbenchBox: { code },
      dispatch
    } = this.props

    if ('board:chat' == code) {
      beforeChangeCommunicationUpdateFileList({ board_id, dispatch })
    } else if ('board:plans' == code) {
      // afterChangeBoardUpdateGantt({ board_id, dispatch })
    }
  }

  // 选择单一项目时判断对应该组织是否开启投资地图app
  isHasEnabledInvestmentMapsApp = org_id => {
    const { currentUserOrganizes = [] } = this.props
    let isDisabled = true
    let flag = false
    for (let val of currentUserOrganizes) {
      if (val['id'] == org_id) {
        let gold_data =
          val['enabled_app_list'].find(
            item => item.code == 'InvestmentMaps' && item.status == '1'
          ) || {}
        if (
          gold_data &&
          Object.keys(gold_data) &&
          Object.keys(gold_data).length
        ) {
          flag = true
          isDisabled = false
        } else {
          isDisabled = true
        }
      }
      if (flag) {
        break
      }
    }
    return isDisabled
  }

  onSelectBoard = data => {
    // 迷你的下拉选项
    // console.log(data, 'bbbbb');
    if (data.key === 'add') {
      // console.log("onSelectBoard");
      this.setState({
        addProjectModalVisible: true
      })
      return this.handleCreateProject()
    } else {
      const { dispatch, projectList } = this.props
      if (data.key === 0) {
        // 这个表示选择了所有项目
        dispatch({
          type: 'simplemode/updateDatas',
          payload: {
            simplemodeCurrentProject: {}
          }
        })
        dispatch({
          type: 'accountSet/updateUserSet',
          payload: {
            current_board: {}
          }
        })
        dispatch({
          type: 'technological/updateDatas',
          payload: {
            currentSelectedProjectOrgIdByBoardId: ''
          }
        })
        // dispatch({
        //   type: 'gantt/updateDatas',
        //   payload: {
        //     gantt_board_id: 0,
        //   }
        // });
        selectBoardToSeeInfo({ board_id: '0', dispatch })

        dispatch({
          type: 'projectCommunication/updateDatas',
          payload: {
            gantt_board_id: 0
          }
        })
      } else {
        const { currentSelectedWorkbenchBox = {} } = this.props
        const selectBoard = projectList.filter(
          item => item.board_id === data.key
        )
        const selectOrgId = getOrgIdByBoardId(data.key)
        if (!selectBoard && selectBoard.length == 0) {
          message.error('数据异常，请刷新后重试')
          return
        }
        if (
          data.key != '0' &&
          currentSelectedWorkbenchBox &&
          currentSelectedWorkbenchBox.code &&
          currentSelectedWorkbenchBox.code == 'maps' &&
          this.isHasEnabledInvestmentMapsApp(selectOrgId)
        ) {
          message.warn(
            `该${currentNounPlanFilterName(
              PROJECTS,
              this.props.currentNounPlan
            )}${currentNounPlanFilterName(
              ORGANIZATION,
              this.props.currentNounPlan
            )}下没有开启地图APP`
          )
          return
        }
        setBoardIdStorage(data.key)
        //设置当前选中的项目
        dispatch({
          type: 'simplemode/updateDatas',
          payload: {
            simplemodeCurrentProject: { ...selectBoard[0] }
          }
        })

        dispatch({
          type: 'accountSet/updateUserSet',
          payload: {
            current_board: data.key
          }
        })
        dispatch({
          type: 'technological/updateDatas',
          payload: {
            currentSelectedProjectOrgIdByBoardId: selectOrgId
          }
        })
        // dispatch({
        //   type: 'gantt/updateDatas',
        //   payload: {
        //     gantt_board_id: data.key,
        //   }
        // });
        selectBoardToSeeInfo({
          board_id: selectBoard[0] && selectBoard[0].board_id,
          board_name: selectBoard[0] && selectBoard[0].board_name,
          dispatch
        })

        dispatch({
          type: 'projectCommunication/updateDatas',
          payload: {
            currentBoardId: data.key
          }
        })
      }
      this.handelBoardChangeCalback(data.key)
    }
  }

  handleCreateProject = () => {
    this.setAddProjectModalVisible()
  }

  setAddProjectModalVisible = data => {
    if (data) {
      return
    }
    const { addProjectModalVisible } = this.state
    this.setState({
      addProjectModalVisible: !addProjectModalVisible
    })
  }

  handleSubmitNewProject = data => {
    const { dispatch } = this.props
    this.setAddProjectModalVisible()
    const calback = (id, name) => {
      dispatch({
        type: 'workbench/getProjectList',
        payload: {}
      })
      selectBoardToSeeInfo({
        board_id: id,
        board_name: name,
        is_new_board: true,
        dispatch,
        org_id: data._organization_id,
        group_view_type: '4'
      }) //极简模式项目选择
      const sessionStorage_item = window.sessionStorage.getItem(
        'session_currentSelectedWorkbenchBox'
      )
      const session_currentSelectedWorkbenchBox = JSON.parse(
        sessionStorage_item || '{}'
      )
      const { code } = session_currentSelectedWorkbenchBox
      if (code == 'board:plans') {
        //项目计划
        afterCreateBoardUpdateGantt(dispatch)
      }
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

  // 判断是否有新建项目的权限
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

  componentDidMount() {
    const { dispatch } = this.props
  }

  getMenuItemList(projectList) {
    const {
      currentUserOrganizes,
      currentSelectedWorkbenchBox = {}
    } = this.props
    let menuItemList = [
      {
        id: '0',
        name: `我参与的${currentNounPlanFilterName(
          PROJECTS,
          this.props.currentNounPlan
        )}`
      }
    ]
    projectList.map((board, index) => {
      const { board_id: id, board_name: name, org_id } = board
      //根据当前模块是付费非付费模块 去设置项目列表中的项目是否可以选择
      if (
        currentSelectedWorkbenchBox.code !== 'board:plans' &&
        !isPaymentOrgUser(org_id)
      ) {
        menuItemList.push({
          id,
          name,
          parentName: getOrgNameWithOrgIdFilter(org_id, currentUserOrganizes),
          disabled: true
        })
      } else {
        menuItemList.push({
          id,
          name,
          parentName: getOrgNameWithOrgIdFilter(org_id, currentUserOrganizes)
        })
      }
    })

    return menuItemList
  }

  render() {
    const {
      projectList,
      simplemodeCurrentProject,
      iconVisible = true
    } = this.props
    const { addProjectModalVisible = false } = this.state
    const menuItemList = this.getMenuItemList(projectList)
    const fuctionMenuItemList = this.isHasCreatBoardPermission()
      ? [
          {
            name: `新建${currentNounPlanFilterName(
              PROJECTS,
              this.props.currentNounPlan
            )}`,
            icon: 'plus-circle',
            selectHandleFun: this.createNewBoard,
            id: 'add'
          }
        ]
      : []
    let selectedKeys = ['0']
    if (simplemodeCurrentProject && simplemodeCurrentProject.board_id) {
      selectedKeys = [simplemodeCurrentProject.board_id]
    }

    return (
      <div>
        <DropdownSelect
          selectedKeys={selectedKeys}
          iconVisible={iconVisible}
          simplemodeCurrentProject={simplemodeCurrentProject}
          itemList={menuItemList}
          fuctionMenuItemList={fuctionMenuItemList}
          menuItemClick={this.onSelectBoard}
        ></DropdownSelect>
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

export default connect(
  ({
    workbench: {
      datas: { projectList, projectTabCurrentSelectedProject }
    },
    simplemode: {
      myWorkbenchBoxList,
      workbenchBoxList,
      simplemodeCurrentProject,
      currentSelectedWorkbenchBox
    },
    technological: {
      datas: { currentUserOrganizes, userOrgPermissions }
    },
    organizationManager: {
      datas: { currentNounPlan }
    },
    project
  }) => ({
    project,
    projectList,
    projectTabCurrentSelectedProject,
    myWorkbenchBoxList,
    workbenchBoxList,
    currentUserOrganizes,
    simplemodeCurrentProject,
    currentSelectedWorkbenchBox,
    userOrgPermissions,
    currentNounPlan
  })
)(BoardDropdownSelect)
