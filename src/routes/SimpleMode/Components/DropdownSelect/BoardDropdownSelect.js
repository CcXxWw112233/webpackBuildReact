import React, { Component } from "react";
import dva, { connect } from "dva/index"
import globalStyles from '@/globalset/css/globalClassName.less'
import { Icon, message, Tooltip } from 'antd';
import DropdownSelect from '../DropdownSelect'
import CreateProject from '@/routes/Technological/components/Project/components/CreateProject/index';
import { getOrgNameWithOrgIdFilter, setBoardIdStorage } from "@/utils/businessFunction"
class BoardDropdownSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addProjectModalVisible: false
    };
  }


  onSelectBoard = (data) => {
    console.log(data, 'bbbbb');
    if (data.key === 'add') {
      //console.log("onSelectBoard");
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

      }


    }

  }

  handleCreateProject = () => {
    this.setAddProjectModalVisible()
  };


  setAddProjectModalVisible = (data) => {
    if(data) {
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
      .then(() => {
        dispatch({
          type: 'workbench/getProjectList',
          payload: {}
        });
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
    const { currentUserOrganizes } = this.props;
    let menuItemList = [{ id: '0', name: '我参与的项目' }];
    projectList.map((board, index) => {
      const { board_id: id, board_name: name, org_id } = board
      menuItemList.push({ id, name, parentName: getOrgNameWithOrgIdFilter(org_id, currentUserOrganizes) });
    });

    return menuItemList;
  }





  render() {
    const {projectList, simplemodeCurrentProject, iconVisible = true } = this.props;
    const { addProjectModalVisible = false } = this.state;
    console.log(iconVisible, "ppppppp");
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
      simplemodeCurrentProject
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
      simplemodeCurrentProject
    }))(BoardDropdownSelect)