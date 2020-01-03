import React, { Component } from "react";
import dva, { connect } from "dva/index"
import globalStyles from '@/globalset/css/globalClassName.less'
import { Icon, message, Tooltip } from 'antd';
import DropdownSelect from '../DropdownSelect'
import CreateProject from '@/routes/Technological/components/Project/components/CreateProject/index';
import { getOrgNameWithOrgIdFilter, setBoardIdStorage } from "@/utils/businessFunction"
import { afterChangeBoardUpdateGantt } from "../../../Technological/components/Gantt/ganttBusiness";
import { beforeChangeCommunicationUpdateFileList } from "../WorkbenchPage/BoardCommunication/components/getCommunicationFileListFn";
import { isPaymentOrgUser } from "@/utils/businessFunction"
import { selectBoardToSeeInfo } from "../../../../utils/businessFunction";
import { isApiResponseOk } from "../../../../utils/handleResponseData";
class BoardDropdownSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addProjectModalVisible: false
    };
  }

  handelBoardChangeCalback = (board_id) => {

    const { currentSelectedWorkbenchBox: { code }, dispatch } = this.props

    if ('board:chat' == code) {
      beforeChangeCommunicationUpdateFileList({ board_id, dispatch });
    } else if ('board:plans' == code) {
      // afterChangeBoardUpdateGantt({ board_id, dispatch })
    }
  }

  onSelectBoard = (data) => {
    // console.log(data, 'bbbbb');
    if (data.key === 'add') {
      console.log("onSelectBoard");
      this.setState({
        addProjectModalVisible: true
      });
      return this.handleCreateProject();
    } else {
      const { dispatch, projectList } = this.props;
      if (data.key === 0) {
        dispatch({
          type: 'simplemode/updateDatas',
          payload: {
            simplemodeCurrentProject: {}
          }
        });
        dispatch({
          type: 'accountSet/updateUserSet',
          payload: {
            current_board: {}
          }
        });
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
            gantt_board_id: 0,
          }
        });
      } else {
        const selectBoard = projectList.filter(item => item.board_id === data.key);
        if (!selectBoard && selectBoard.length == 0) {
          message.error('数据异常，请刷新后重试');
          return;
        }
        setBoardIdStorage(data.key)
        //设置当前选中的项目
        dispatch({
          type: 'simplemode/updateDatas',
          payload: {
            simplemodeCurrentProject: { ...selectBoard[0] }
          }
        });

        dispatch({
          type: 'accountSet/updateUserSet',
          payload: {
            current_board: data.key
          }
        });
        // dispatch({
        //   type: 'gantt/updateDatas',
        //   payload: {
        //     gantt_board_id: data.key,
        //   }
        // });
        selectBoardToSeeInfo({ board_id: selectBoard[0] && selectBoard[0].board_id, board_name: selectBoard[0] && selectBoard[0].board_name, dispatch })

        dispatch({
          type: 'projectCommunication/updateDatas',
          payload: {
            currentBoardId: data.key,
          }
        });

      }
      this.handelBoardChangeCalback(data.key)
    }

  }

  handleCreateProject = () => {
    this.setAddProjectModalVisible()
  };


  setAddProjectModalVisible = (data) => {
    if (data) {
      return
    }
    const { addProjectModalVisible } = this.state
    this.setState({
      addProjectModalVisible: !addProjectModalVisible
    })
  }

  handleSubmitNewProject = data => {
    const { dispatch } = this.props;
    Promise.resolve(
      dispatch({
        type: 'project/addNewProject',
        payload: data
      })
    )
      .then((res) => {
        if (isApiResponseOk(res)) {
          dispatch({
            type: 'workbench/getProjectList',
            payload: {}
          });
        }
      })
      .then(() => {
        this.setAddProjectModalVisible();
      });
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'workbench/getProjectList',
      payload: {}
    })
  }

  getMenuItemList(projectList) {
    const { currentUserOrganizes, currentSelectedWorkbenchBox = {} } = this.props;
    let menuItemList = [{ id: '0', name: '我参与的项目' }];
    projectList.map((board, index) => {
      const { board_id: id, board_name: name, org_id } = board;
      //根据当前模块是付费非付费模块 去设置项目列表中的项目是否可以选择
      if (currentSelectedWorkbenchBox.code !== 'board:plans' && !isPaymentOrgUser(org_id)) {
        menuItemList.push({ id, name, parentName: getOrgNameWithOrgIdFilter(org_id, currentUserOrganizes), disabled: true });
      } else {
        menuItemList.push({ id, name, parentName: getOrgNameWithOrgIdFilter(org_id, currentUserOrganizes) });
      }

    });

    return menuItemList;
  }





  render() {
    const { projectList, simplemodeCurrentProject, iconVisible = true } = this.props;
    const { addProjectModalVisible = false } = this.state;
    const menuItemList = this.getMenuItemList(projectList);
    const fuctionMenuItemList = [{ 'name': '新建项目', 'icon': 'plus-circle', 'selectHandleFun': this.createNewBoard, 'id': 'add' }];
    let selectedKeys = ['0'];
    if (simplemodeCurrentProject && simplemodeCurrentProject.board_id) {
      selectedKeys = [simplemodeCurrentProject.board_id]
    }

    return (
      <div>
        <DropdownSelect selectedKeys={selectedKeys} iconVisible={iconVisible} simplemodeCurrentProject={simplemodeCurrentProject} itemList={menuItemList} fuctionMenuItemList={fuctionMenuItemList} menuItemClick={this.onSelectBoard}></DropdownSelect>
        {addProjectModalVisible && (
          <CreateProject
            setAddProjectModalVisible={this.setAddProjectModalVisible}
            addProjectModalVisible={addProjectModalVisible}
            addNewProject={this.handleSubmitNewProject}
          />
        )}
      </div>

    );
  }
}

export default connect(
  ({
    workbench: {
      datas: { projectList, projectTabCurrentSelectedProject } }
    ,
    simplemode: {
      myWorkbenchBoxList,
      workbenchBoxList,
      simplemodeCurrentProject,
      currentSelectedWorkbenchBox
    },
    technological: {
      datas: { currentUserOrganizes }
    }
    , project }) => ({
      project,
      projectList,
      projectTabCurrentSelectedProject,
      myWorkbenchBoxList,
      workbenchBoxList,
      currentUserOrganizes,
      simplemodeCurrentProject,
      currentSelectedWorkbenchBox
    }))(BoardDropdownSelect)