import React, { Component } from 'react';
import {
  Modal,
  Input,
  Button,
} from 'antd';
import styles from './../../Workbench/CardContent/Modal/AddTaskModal.less';
import { connect } from 'dva';
import { getCurrentSelectedProjectMembersList } from '@/services/technological/workbench';
import DropdownSelectWithSearch from './../../Workbench/CardContent/DropdownSelectWithSearch/index';
import DropdownMultipleSelectWithSearch from './../../Workbench/CardContent/DropdownMultipleSelectWithSearch/index';
import { isApiResponseOk } from '../../../../../utils/handleResponseData';

/* eslint-disable */
@connect(({ gantt: { datas: { list_group }} }) => ({ list_group }))
class AddTaskModal extends Component {
  constructor(props) {
    super(props);
    const {
      about_apps_boards,
      current_operate_board_id,
      board_card_group_id,
      about_group_boards,
    } = this.props;
    const findAndCheckCurrentSelectedProject = where => {
      const result = about_apps_boards.find(
        item =>
          item.board_id === where &&
          item.apps 
          //  && item.apps.find(i => i.code === 'Tasks')
      );
      return result ? result : {};
    };
    const getCurrentSelectedProject = (
      current_operate_board_id,
    ) => {
        return findAndCheckCurrentSelectedProject(current_operate_board_id);
    };
    const getCurrentSelectedProjectGroupListItem = (board_card_group_id, about_group_boards, current_operate_board_id) => {
      if (!board_card_group_id || !(about_group_boards && about_group_boards.length)) return {}
      let list_data = (about_group_boards.find(i => i.board_id == current_operate_board_id) || {}).list_data || []
      const list_data_item = list_data.find(i => i.list_id == board_card_group_id) || {}
      return list_data_item
    }

   
    this.state = {
      addTaskTitle: '',
      selectedOrg: {
        org_name: '',
        org_id: '',
      }, //选择的组织
      currentSelectedProject: getCurrentSelectedProject(
        current_operate_board_id,
      ),
      currentSelectedProjectMembersList: [], //所选项目的成员列表
      currentSelectedProjectMember: [], //已选项目的已选成员列表
      currentSelectedProjectGroupListItem: getCurrentSelectedProjectGroupListItem(board_card_group_id, about_group_boards, current_operate_board_id)
    };
  }
  handleAddTaskModalOk = () => {};
  handleAddTaskModalCancel = () => {
    const { setAddTaskModalVisible } = this.props;
    setAddTaskModalVisible(false);
  };
  // 选择分组
  handleSelectedProjectGroupItem = item => {
    this.setState({
      currentSelectedProjectGroupListItem: item
    });
  };
  // 选择项目
  handleSelectedItem = item => {
    console.log('ssssss', {item})
    this.setState(
      {
        currentSelectedProject: item,
        currentSelectedProjectGroupListItem: {}
      },
      () => {
      this.getCurrentSelectedProjectMembersList({ projectId: item.board_id})
      //更新任务分组信息，修复如果是直接新创建的项目，不能马上拿到分组信息的 bug
      }
    );
  };
  // 获取项目成员
  getCurrentSelectedProjectMembersList = (data) => {
    getCurrentSelectedProjectMembersList(data).then(res => {
      if(isApiResponseOk(res)){
        this.setState({
          currentSelectedProjectMembersList: res.data
        })
      }
     })
  }
  getNewTaskParams = () => {
    const {
      addTaskTitle,
      currentSelectedProject,
      currentSelectedProjectMember,
      currentSelectedProjectGroupListItem
    } = this.state;
    const taskObj = {
      add_type: 1, //默认0， 按分组1
      board_id: currentSelectedProject.board_id,
      name: addTaskTitle,
      type: 0,
      users: currentSelectedProjectMember.reduce((acc, curr) => {
        return acc ? acc + ',' + curr.id : curr.id;
      }, ''),
      list_id: currentSelectedProjectGroupListItem.board_id
        ? currentSelectedProjectGroupListItem.board_id
        : ''
    };
    return taskObj;
  };
  handleClickedSubmitBtn = e => {
    e.stopPropagation();
    const paramObj = this.getNewTaskParams();
    const { handleGetNewTaskParams } = this.props
    handleGetNewTaskParams(paramObj)
  };

  handleAddTaskModalTaskTitleChange = e => {
    this.setState({
      addTaskTitle: e.target.value
    });
  };
  handleSelectedItemChange = list => {
    this.setState({
      currentSelectedProjectMember: list
    });
  };

  componentDidMount() {
    const { current_operate_board_id, group_view_type } = this.props
    if(group_view_type == '1') { //在项目视图下创建任务才会去主动拉取用户列表
      this.getCurrentSelectedProjectMembersList({projectId: current_operate_board_id})
    } else { 
      this.setDefaultExcuser()
    }
  }
 
  // 如果是成员视图，则默认设置已选用户
  setDefaultExcuser = () => {
    const { list_group, group_view_type, current_list_group_id } = this.props
    if(group_view_type == '2') {
      const group = list_group.find(item => current_list_group_id == item.lane_id)
      const user = {
        full_name: group['lane_name'],
        name: group['lane_name'],
        id: group['lane_id'],
        avatar: group['lane_icon']
      }
      this.handleSelectedItemChange([user])
    }
  }

  componentWillReceiveProps(nextProps) {
  
  }

  render() {
    const {
      addTaskTitle,
      currentSelectedProject,
      currentSelectedProjectMember,
      currentSelectedProjectGroupListItem,
      selectedOrg = {},
      currentSelectedProjectMembersList,
    } = this.state;
    const {
      about_apps_boards,
      about_group_boards,
      about_user_boards,
      group_view_type,
      current_operate_board_id,
      board_card_group_id,
      current_list_group_id
    } = this.props;

    const isHasTaskTitle = () => addTaskTitle && String(addTaskTitle).trim();
    const isHasSelectedProject = () =>
      currentSelectedProject && currentSelectedProject.board_id;
    const isHasSelectedProjectMember = () =>
      currentSelectedProjectMember && currentSelectedProjectMember.length;
    let isShouldNotDisableSubmitBtn = () =>
      isHasTaskTitle() && isHasSelectedProject();

    const board_id = currentSelectedProject.board_id;
    const findAndTransProjectGroupList = (about_group_boards = [], board_id) => {
      const isFinded = about_group_boards.find(
        item => item.board_id === board_id
      );
      if (!isFinded) return [];
      //映射数据，只是为了复用 DropdownSelectWithSearch 组件
      return isFinded.list_data.map(item => ({
        board_id: item['list_id'],
        board_name: item['list_name']
      }));
    };
    const currentSelectedProjectGroupList = findAndTransProjectGroupList(
      about_group_boards,
      board_id
    );
   
    //有的项目没有开启目前的内容类型，将其过滤出去
    let filteredNoThatTypeProject = about_apps_boards.filter(item => {
      return (
        item.apps //&& item.apps.find(i => i.code === 'Tasks')
      );
    });   
    if(group_view_type == '2') { //如果是用户视图，则需要过滤掉没有该操作 用户id的项目
      filteredNoThatTypeProject = about_user_boards.filter(item => {
        return(
          item.users && item.users.find(i => i.id == current_list_group_id)
        )
      })
    }

    // console.log('ssss', {filteredNoThatTypeProject})

    return (
      <Modal
        visible={true} 
        title={
          <div style={{ textAlign: 'center' }}>{'添加内容'}</div>
        }
        onOk={this.handleAddTaskModalOk}
        onCancel={this.handleAddTaskModalCancel}
        footer={null}
        destroyOnClose={true}
      >
        <div className={styles.addTaskModalContent}>
          <div className={styles.addTaskModalSelectProject}>
            <div className={styles.addTaskModalSelectProject_and_groupList}>
              {/*在项目视图下，必须选择了具体的项目*/}
              {(group_view_type == '1' && !!current_operate_board_id)? (
                  <div className={styles.groupList__wrapper}>
                    {currentSelectedProject.board_name}
                  </div>
                ): (
                  <DropdownSelectWithSearch
                    list={filteredNoThatTypeProject}
                    _organization_id={selectedOrg.org_id}
                    initSearchTitle="选择项目"
                    selectedItem={currentSelectedProject}
                    handleSelectedItem={this.handleSelectedItem}
                    isShouldDisableDropdown={false}
                  />
              )}
              {/*在项目视图下，必须选择了具体的项目,在任务分组下创建任务*/}
              {(group_view_type == '1'  && !!current_operate_board_id && !!board_card_group_id) ?(
                <div className={styles.groupList__wrapper}>
                  {currentSelectedProjectGroupListItem.list_name}
                </div>
              ): (
                <div className={styles.groupList__wrapper}>
                 <DropdownSelectWithSearch
                    list={currentSelectedProjectGroupList}
                    initSearchTitle="任务分组"
                    selectedItem={currentSelectedProjectGroupListItem}
                    handleSelectedItem={this.handleSelectedProjectGroupItem}
                    isShowIcon={false}
                    isSearch={false}
                    isCanCreateNew={false}
                    isProjectGroupMode={true}
                    isShouldDisableDropdown={currentSelectedProjectGroupListItem && currentSelectedProjectGroupListItem.id}
                  />
                </div>
               )}
            </div>
           
          </div>
          <div className={styles.addTaskModalTaskTitle}>
            <Input
                  value={addTaskTitle}
                  onChange={this.handleAddTaskModalTaskTitleChange}
                />
          </div>
          <div className={styles.addTaskModalFooter}>
              <div className={styles.addTaskModalOperator}>
                <DropdownMultipleSelectWithSearch
                  itemTitle={'执行人' }
                  list = {currentSelectedProjectMembersList}
                  handleSelectedItemChange={this.handleSelectedItemChange}
                  currentSelectedProjectMember={currentSelectedProjectMember}
                />
              </div>
              <div className={styles.confirmBtn}>
                <Button
                  type="primary"
                  disabled={!isShouldNotDisableSubmitBtn() || !isHasSelectedProjectMember()}
                  onClick={this.handleClickedSubmitBtn}
                >
                  完成
                </Button>
              </div>
            </div>
        </div>
      </Modal>
    );
  }
}

AddTaskModal.defaultProps = {
  current_operate_board_id: '', //如果是在甘特图中使用，那么传项目 id
  board_card_group_id: '', //项目的任务分组id
  about_group_boards: [], //当前选择项目任务分组列表
  handleGetNewTaskParams: function() { //返回当前新建 modal 用户提交的所有参数

  },
  projectMemberListWhenUseInGantt: [], //当在甘特图使用的时候，需要将当前选中的项目成员列表传入
};

export default AddTaskModal;