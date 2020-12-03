import React, { Component } from 'react'
import { Modal, Input, Button } from 'antd'
import styles from './../../Workbench/CardContent/Modal/AddTaskModal.less'
import { connect } from 'dva'
import { getCurrentSelectedProjectMembersList } from '@/services/technological/workbench'
import DropdownSelectWithSearch from './../../Workbench/CardContent/DropdownSelectWithSearch/index'
import DropdownMultipleSelectWithSearch from './../../Workbench/CardContent/DropdownMultipleSelectWithSearch/index'
import { isApiResponseOk } from '../../../../../utils/handleResponseData'
import { getMilestoneList } from '../../../../../services/technological/prjectDetail'
import globalStyles from '@/globalset/css/globalClassName.less'
import { currentNounPlanFilterName } from '../../../../../utils/businessFunction'
import { TASKS, PROJECTS } from '../../../../../globalset/js/constant'

/* eslint-disable */
@connect(({ gantt: { datas: { list_group } } }) => ({ list_group }))
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
      currentSelectedProjectMember: [], //已选项目的已选职员列表
      currentSelectedProjectGroupListItem: getCurrentSelectedProjectGroupListItem(board_card_group_id, about_group_boards, current_operate_board_id),
      selected_milestone: {}, //当前选中里程碑
      milestones: [], //里程碑列表
    };
  }
  handleAddTaskModalOk = () => { };
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
  // 选择里程碑
  handleSelectedMilestone = item => {
    this.setState({
      selected_milestone: item
    });
  };
  // 选择项目
  handleSelectedItem = item => {

    this.setState(
      {
        currentSelectedProject: item,
        currentSelectedProjectGroupListItem: {},
        milestones: [],
        selected_milestone: {}
      },
      () => {
        this.getCurrentSelectedProjectMembersList({ projectId: item.board_id })
        this.getMilestoneList(item.board_id)
        //更新任务分组信息，修复如果是直接新创建的项目，不能马上拿到分组信息的 bug
      }
    );
  };
  getMilestoneList = (id) => {
    getMilestoneList({ id }).then(res => {
      if (isApiResponseOk(res)) {
        const arr = res.data.map(item => {
          return {
            ...item,
            board_id: item.id,
            board_name: item.name
          }
        })
        this.setState({
          milestones: arr
        })
      }
    })
  }
  // 获取项目成员
  getCurrentSelectedProjectMembersList = (data) => {
    getCurrentSelectedProjectMembersList(data).then(res => {
      if (isApiResponseOk(res)) {
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
      currentSelectedProjectGroupListItem,
      selected_milestone = {}
    } = this.state;
    const taskObj = {
      add_type: 1, //默认0， 按分组1
      board_id: currentSelectedProject.board_id,
      name: addTaskTitle,
      type: 0,
      users: currentSelectedProjectMember.filter(item => item.id && item.id != '0').reduce((acc, curr) => {
        return acc ? acc + ',' + curr.id : curr.id;
      }, ''),
      list_id: currentSelectedProjectGroupListItem.board_id
        ? currentSelectedProjectGroupListItem.board_id
        : '',
      milestone_id: selected_milestone.id
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
    if (group_view_type == '1' || group_view_type == '5') { //在项目视图下创建任务才会去主动拉取用户列表
      this.getCurrentSelectedProjectMembersList({ projectId: current_operate_board_id })
      this.getMilestoneList(current_operate_board_id)
      if (group_view_type == '5') {
        this.setDefaultExcuser()
      }
    } else {
      this.setDefaultExcuser()
    }
  }

  // 如果是成员视图，则默认设置已选用户,同时设置已选项目为‘个人事务’
  setDefaultExcuser = () => {
    const { list_group, group_view_type, current_list_group_id, about_apps_boards = [] } = this.props
    if (group_view_type == '2' || group_view_type == '5') {
      const group = list_group.find(item => current_list_group_id == item.lane_id)
      const user = {
        full_name: group['lane_name'],
        name: group['lane_name'],
        id: group['lane_id'],
        user_id: group['lane_id'],
        avatar: group['lane_icon']
      }
      this.handleSelectedItemChange([user])

      // 设置已选项目为‘个人事务’,给当前用户创建任务
      const current_user_id = (localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : {}).id
      const default_board = about_apps_boards.find(item => item.is_my_private == '1') || {}
      if (default_board.board_id && current_list_group_id == current_user_id) {
        this.setState({
          currentSelectedProject: default_board
        }, () => {
          this.getCurrentSelectedProjectMembersList({ projectId: default_board.board_id })
        })
      }

    }
  }

  componentWillReceiveProps(nextProps) {

  }

  inviteOthersToBoardCalbackRequest = () => {
    const { dispatch, current_operate_board_id } = this.props
    dispatch({
      type: 'gantt/getAboutUsersBoards',
      payload: {

      }
    })
    // dispatch({
    //   type: 'gantt/getAboutAppsBoards',
    //   payload: {

    //   }
    // })
    // dispatch({
    //   type: 'gantt/getAboutGroupBoards',
    //   payload: {

    //   }
    // })
    this.getCurrentSelectedProjectMembersList({ projectId: current_operate_board_id })
  }

  render() {
    const {
      addTaskTitle,
      currentSelectedProject,
      currentSelectedProjectMember,
      currentSelectedProjectGroupListItem,
      selectedOrg = {},
      currentSelectedProjectMembersList,
      selected_milestone = {},
      milestones = [],
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
    if (group_view_type == '2' || group_view_type == '5') { //如果是用户视图，则需要过滤掉没有该操作 用户id的项目
      filteredNoThatTypeProject = about_user_boards.filter(item => {
        return (
          item.users && item.users.find(i => i.id == current_list_group_id)
        )
      })
    }

    // console.log('ssssasdad', { currentSelectedProjectGroupList, milestones })

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
              {((group_view_type == '1' || group_view_type == '5') && !!current_operate_board_id) ? (
                <div className={styles.groupList__wrapper} style={{ paddingTop: 2, marginRight: 16 }}>
                  <span className={globalStyles.authTheme} style={{ fontSize: '16px' }}>&#xe60a;</span>
                  {currentSelectedProject.board_name}
                </div>
              ) : (
                  <DropdownSelectWithSearch
                    list={filteredNoThatTypeProject}
                    _organization_id={selectedOrg.org_id}
                    initSearchTitle={`选择${currentNounPlanFilterName(PROJECTS)}`}
                    selectedItem={currentSelectedProject}
                    board_id={currentSelectedProject.board_id}
                    handleSelectedItem={this.handleSelectedItem}
                    isShouldDisableDropdown={false}
                    iconNode={<span>&#xe60a;</span>}
                  />
                )}
              {/*在项目视图下，必须选择了具体的项目,在任务分组下创建任务*/}
              {((group_view_type == '1' || group_view_type == '5') && !!current_operate_board_id && !!board_card_group_id) ? (
                <div className={styles.groupList__wrapper} style={{ paddingTop: 2, marginRight: 16 }}>
                  <span className={globalStyles.authTheme} style={{ fontSize: '16px' }}>&#xe604;</span>
                  {currentSelectedProjectGroupListItem.list_name}
                </div>
              ) : (
                  <div className={styles.groupList__wrapper}>
                    <DropdownSelectWithSearch
                      list={currentSelectedProjectGroupList}
                      initSearchTitle={`${currentNounPlanFilterName(TASKS)}分组`}
                      selectedItem={currentSelectedProjectGroupListItem}
                      handleSelectedItem={this.handleSelectedProjectGroupItem}
                      isShowIcon={true}
                      isSearch={false}
                      isCanCreateNew={false}
                      isProjectGroupMode={true}
                      isShouldDisableDropdown={currentSelectedProjectGroupListItem && currentSelectedProjectGroupListItem.id}
                      iconNode={<span>&#xe604;</span>}
                    />
                  </div>
                )}

              {/*里程碑选项*/}
              <div className={styles.groupList__wrapper}>
                <DropdownSelectWithSearch
                  list={milestones}
                  initSearchTitle="里程碑"
                  selectedItem={selected_milestone}
                  handleSelectedItem={this.handleSelectedMilestone}
                  isShowIcon={true}
                  isSearch={false}
                  isCanCreateNew={false}
                  isProjectGroupMode={true}
                  isShouldDisableDropdown={currentSelectedProjectGroupListItem && currentSelectedProjectGroupListItem.id}
                  iconNode={<span>&#xe713;</span>}
                />
              </div>
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
                itemTitle={'执行人'}
                list={currentSelectedProjectMembersList}
                handleSelectedItemChange={this.handleSelectedItemChange}
                currentSelectedProjectMember={currentSelectedProjectMember}
                use_default_member={group_view_type == '2' || group_view_type == '5'}
                use_default_member_ids={[current_list_group_id]}
                dispatch={this.props.dispatch}
                board_id={currentSelectedProject.board_id}
                inviteOthersToBoardCalbackRequest={this.inviteOthersToBoardCalbackRequest}
              />
            </div>
            <div className={styles.confirmBtn}>
              <Button
                type="primary"
                disabled={
                  !isShouldNotDisableSubmitBtn()
                  // || !isHasSelectedProjectMember()
                }
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
  handleGetNewTaskParams: function () { //返回当前新建 modal 用户提交的所有参数

  },
  projectMemberListWhenUseInGantt: [], //当在甘特图使用的时候，需要将当前选中的项目成员列表传入
};

export default AddTaskModal;
