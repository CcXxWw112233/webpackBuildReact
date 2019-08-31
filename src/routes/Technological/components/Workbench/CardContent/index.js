/*eslint-disable*/
import {
  Card,
  Icon,
  Dropdown,
  Input,
  Menu,
  Tooltip,
  Modal,
  Button,
  message
} from 'antd';
import indexstyles from '../index.less';
import TaskItem from './TaskItem';
import ProcessItem from './ProcessItem';
import FileItem from './FileItem';
import MeetingItem from './MeetingItem';
import ProjectCountItem from './ProjectCountItem';
import MapItem from './MapItem';
import React from 'react';
import MenuSearchMultiple from '../CardContent/MenuSearchMultiple';
import SchedulingItem from './School/SchedulingItem';
import Journey from './School/Journey';
import Todo from './School/Todo';
import SchoolWork from './School/SchoolWork';
import MyShowItem from './MyShowItem';
import TeachingEffect from './School/TeachingEffect';
import PreviewFileModal from '../PreviewFileModal.js';
import CollectionProjectItem from './CollectionProjectItem';
import MyCircleItem from './MyCircleItem';
import TaskDetailModal from './Modal/TaskDetailModal';
import FileDetailModal from './Modal/FileDetailModal';
import ProccessDetailModal from './Modal/ProccessDetailModal';
import AddTaskModal from './Modal/AddTaskModal';
import AddProgressModal from './Modal/AddProgressModal';
import { connect } from 'dva';
import { checkIsHasPermissionInBoard } from '../../../../../utils/businessFunction';
import {getProjectGoupList} from './../../../../../services/technological/task'
import {
  MESSAGE_DURATION_TIME,
  NOT_HAS_PERMISION_COMFIRN,
  PROJECT_FILES_FILE_DELETE,
  PROJECT_TEAM_CARD_CREATE,
  PROJECT_FILES_FILE_UPLOAD,
  PROJECT_FLOWS_FLOW_CREATE
} from '../../../../../globalset/js/constant';
import CheckboxGroup from './CheckboxGroup/index'
import FileFolder from './FileFolder/index'

const TextArea = Input.TextArea;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

@connect(({ workbench }) => ({
  workbench
}))
class CardContent extends React.Component {
  state = {
    dropDonwVisible: false, //下拉菜单是否可见
    previewFileModalVisibile: false,
    previewProccessVisibile: false,
    //修改项目名称所需state
    localTitle: '',
    isInEditTitle: false,
    addTaskModalVisible: false,
    addMeetingModalVisible: false,
    uploadFileModalVisible: false,
    addProcessModalVisible: false,
    newTask: {},
    projectGroupLists:[]
  };
  //这里
  componentWillMount() {
    const { CardContentType, boxId } = this.props;
    switch (CardContentType) {
      case 'RESPONSIBLE_TASK':
        let that = this;
        // Promise.resolve(that.props.setProjectTabCurrentSelectedProject('0')).then(() => this.props.getResponsibleTaskList({ id: boxId }))
        // this.props.getResponsibleTaskList({ id: boxId });
        break;
      case 'EXAMINE_PROGRESS': //待处理的流程
        // this.props.getBackLogProcessList({ id: boxId });
        break;
      case 'joinedFlows': //参与的流程
        // this.props.getJoinedProcessList({ id: boxId });
        break;
      case 'MY_DOCUMENT':
        // this.props.getUploadedFileList({ id: boxId });
        break;
      case 'MEETIMG_ARRANGEMENT':
        // this.props.getMeetingList({ id: boxId });
        break;
      case 'PROJECT_STATISTICS':
        break;
      case 'YINYI_MAP':
        break;
      case 'MY_CIRCLE':
        this.props.getProjectUserList();
        this.props.getOrgMembers();
        break;
      case 'PROJECT_TRCKING':
        this.props.getProjectStarList();
        break;
      //老师
      case 'MY_SCHEDULING': //我的排课 --会议
        this.props.getSchedulingList({ id: boxId });
        break;
      case 'JOURNEY': //行程安排 --会议
        this.props.getJourneyList({ id: boxId });
        break;
      case 'TO_DO': //代办事项 --任务
        this.props.getTodoList({ id: boxId });
        break;
      case 'SCHOOLWORK_CORRECTION': //作业批改
        break;
      case 'TEACHING_EFFECT': //教学计划
        break;
      default:
        break;
    }
    this.initSet(this.props);
  }
  getNewTaskInfo = obj => {
    this.setState({
      newTask: obj
    });
  };
  componentWillReceiveProps(nextProps) {
    this.initSet(nextProps);
  }
  //初始化根据props设置state
  initSet(props) {
    const { title } = props;
    this.setState({
      localTitle: title
    });
  }
  //项目操作----------------start
  //设置项目名称---start
  setIsInEditTitle() {
    this.setState({
      isInEditTitle: !this.state.isInEditTitle
    });
  }
  localTitleChange(e) {
    this.setState({
      localTitle: e.target.value
    });
  }
  editTitleComplete(e) {
    this.setIsInEditTitle();
    const { localTitle } = this.state
    const { boxId, title } = this.props;
    if(localTitle == title) {
      return false
    }
    if(!localTitle) {
      this.setState({
        localTitle: title
      })
      return false
    }
    this.props.updateBox({
      box_id: boxId,
      name: localTitle
    });
  }

  selectMultiple(data) {
    this.setState({
      dropDonwVisible: false
    });

    const { boxId, itemKey } = this.props;

    this.props.getItemBoxFilter({
      id: boxId,
      board_ids: data.join(','),
      selected_board_data: data,
      itemKey
    });
  }
  onVisibleChange(e) {
    this.setState({
      dropDonwVisible: e
    });
  }
  handleMenuClick(e, e_truly) {
    if (e_truly) e_truly.stopPropagation();
    const key = e.key;
    switch (key) {
      case 'rename':
        this.setIsInEditTitle();
        break;
      case 'remove':
        const { itemValue } = this.props;
        const { box_type_id } = itemValue;
        this.props.deleteBox({ box_type_id: box_type_id });
        break;
      default:
        break;
    }
  }

  setPreviewFileModalVisibile() {
    this.setState({
      previewFileModalVisibile: !this.state.previewFileModalVisibile
    });
  }
  close() {
    this.setState({
      previewProccessModalVisibile: false
    });
  }
  handleShouldUpdateProjectGroupList = () => {
    this.getProjectGoupLists()
  }
  async getProjectGoupLists() {
    const res = await getProjectGoupList()
    const isResOk = res => res && res.code === '0'
    if(!isResOk(res)) {
      message.error('获取项目分组信息失败')
      return
    }
    return await this.setState({
      projectGroupLists: res.data
    })
  }
  async setPreviewProccessModalVisibile(id) {
    let flowID = this.props.model.datas.totalId.flow;
    let board_id = this.props.model.datas.totalId.board;
    await this.props.getProcessInfo({ id: flowID });
    await this.props.dispatch({
      type: 'workbenchTaskDetail/projectDetailInfo',
      payload: { id: board_id }
    });
    await this.props.dispatch({
      type: 'workbenchDetailProcess/getWorkFlowComment',
      payload: { flow_instance_id: flowID }
    });
    await this.props.dispatch({
      type: 'workbenchDetailProcess/getCurrentCompleteStep',
      payload: {}
    });
    await this.setState({
      previewProccessModalVisibile: !this.state.previewProccessModalVisibile
    });
  }
  setTaskDetailModalVisibile() {
    this.setState({
      TaskDetailModalVisibile: !this.state.TaskDetailModalVisibile
    });
  }
  handleAddTask = type => {
    this.handleAddATask(type);
  };
  handleAddATask = type => {
    const modalObj = {
      RESPONSIBLE_TASK: 'addTaskModalVisible',
      MEETIMG_ARRANGEMENT: 'addMeetingModalVisible',
      MY_DOCUMENT: 'uploadFileModalVisible',
      EXAMINE_PROGRESS: 'addProcessModalVisible'
    };
    const visibleType = Object.keys(modalObj).find(item => item == type);
    if (!visibleType) {
      return;
    }
    //权限控制
    let authCode = '';
    switch (visibleType) {
      case 'RESPONSIBLE_TASK':
        authCode = PROJECT_TEAM_CARD_CREATE;
        break;
      case 'MEETIMG_ARRANGEMENT':
        authCode = PROJECT_TEAM_CARD_CREATE;
        break;
      case 'MY_DOCUMENT':
        authCode = PROJECT_FILES_FILE_UPLOAD;
        break;
      case 'EXAMINE_PROGRESS':
        authCode = PROJECT_FLOWS_FLOW_CREATE;
        break;
      default:
        break;
    }
    if (!checkIsHasPermissionInBoard(authCode)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME);
      return false;
    }

    const {
      dispatch,
      model: {
        datas: { projectList, projectTabCurrentSelectedProject }
      }
    } = this.props;
    //如果当前的项目选择不是 "所有参与的项目", 并且用户的项目列表，有当前选择的项目，那么就去拉取当前项目的所有用户
    const isProjectListExistCurrentSelectedProject = projectList.find(
      item => item.board_id === projectTabCurrentSelectedProject
    );

    const visibleValue = modalObj[visibleType];

    if (
      isProjectListExistCurrentSelectedProject &&
      projectTabCurrentSelectedProject !== '0' &&
      visibleType === 'EXAMINE_PROGRESS'
    ) {
      Promise.resolve(
        dispatch({
          type: 'workbench/fetchCurrentSelectedProjectTemplateList',
          payload: {
            board_id: projectTabCurrentSelectedProject
          }
        })
      ).then(() =>
        this.setState({
          [visibleValue]: true
        })
      );
    } else if (
      isProjectListExistCurrentSelectedProject &&
      projectTabCurrentSelectedProject !== '0' &&
      visibleType === 'MY_DOCUMENT'
    ) {
      Promise.resolve(
        dispatch({
          type: 'workbench/fetchCurrentSelectedProjectMembersList',
          payload: {
            projectId: projectTabCurrentSelectedProject
          }
        })
      )
        .then(() =>
          dispatch({
            type: 'workbench/fetchCurrentSelectedProjectFileFolderList',
            payload: {
              board_id: projectTabCurrentSelectedProject
            }
          })
        )
        .then(() =>
          this.setState({
            [visibleValue]: true
          })
        );
    } else if (
      isProjectListExistCurrentSelectedProject &&
      projectTabCurrentSelectedProject !== '0'
    ) {
      Promise.resolve(
        dispatch({
          type: 'workbench/fetchCurrentSelectedProjectMembersList',
          payload: {
            projectId: projectTabCurrentSelectedProject
          }
        })
      )
      .then(() => this.getProjectGoupLists())
      .then(() =>
        this.setState({
          [visibleValue]: true
        })
      );
    } else {
      Promise.resolve(this.getProjectGoupLists()).then(() => {
        this.setState({
          [visibleValue]: true
        });
      })

    }
  };
  addTaskModalVisibleChange = flag => {
    this.setState({
      addTaskModalVisible: flag
    });
  };
  addMeetingModalVisibleChange = flag => {
    this.setState({
      addMeetingModalVisible: flag
    });
  };
  uploadFileModalVisibleChange = flag => {
    this.setState({
      uploadFileModalVisible: flag
    });
  };
  addProcessModalVisibleChange = flag => {
    this.setState({
      addProcessModalVisible: flag
    });
  };
  handleSelectFileFolderChange = folder_id => {};
  noContentTooltip = (prompt = '添加任务', type = 'RESPONSIBLE_TASK') => {
    let authCode = '';
    switch (type) {
      case 'RESPONSIBLE_TASK':
        authCode = PROJECT_TEAM_CARD_CREATE;
        break;
      case 'MEETIMG_ARRANGEMENT':
        authCode = PROJECT_TEAM_CARD_CREATE;
        break;
      case 'MY_DOCUMENT':
        authCode = PROJECT_FILES_FILE_UPLOAD;
        break;
      case 'EXAMINE_PROGRESS':
        authCode = PROJECT_FLOWS_FLOW_CREATE;
        break;
      default:
        break;
    }
    if (!checkIsHasPermissionInBoard(authCode)) {
      return '';
    }
    return (
      <>
        <div className={indexstyles.operatorBar}>
          {/* <Tooltip title={prompt}> */}
          <p onClick={() => this.handleAddTask(type)}>
            <span />
          </p>
          {/* </Tooltip> */}
        </div>
      </>
    );
  };
  noContent = (prompt = '添加任务', type = 'RESPONSIBLE_TASK') => {
    return (
      <>
        <div className={indexstyles.noContentWrapper}>
          <p className={indexstyles.noContentImg} />
          <p className={indexstyles.noContentHint}>暂无数据</p>
        </div>
        {type !== 'EXAMINE_PROGRESS' && this.noContentTooltip(prompt, type)}
      </>
    );
  };
  getCurrentBoxScreenListAllSelectedItemIdStr = (arr = [], currentItem) => {
    return arr.reduce((acc, curr) => {
      if(curr.id === currentItem.id) {
        return currentItem.checked ? acc ? `${acc},${curr.id}` :  `${curr.id}` : acc
      }
      return curr && curr.selected === '1' ? acc ? `${acc},${curr.id}` : `${curr.id}` : acc
    } ,'')
  }
  handleSelectedCardFilterContentItem = (item, status) => {
    const {itemValue: {id:box_id, screen_list, code}, dispatch} = this.props

    const getSelectedCardFilterContentItemStatus = Object.assign({}, item, status)

    const ids = this.getCurrentBoxScreenListAllSelectedItemIdStr(screen_list, getSelectedCardFilterContentItemStatus)
    const data = {
      id: box_id,
      code,
      ids
    }
    dispatch({
      type: 'workbench/handleSetBoxFilterCon',
      payload:data
    })
  }
  strNumToBool = str => str === '0' ? false: str === '1' ? true : false
  tranScreenList = (arr = []) => {
    return arr.map(({name, id, editable, selected}) => ({
      label: name,
      checked: this.strNumToBool(selected),
      disabled: !this.strNumToBool(editable),
      id,
    }))
  }
  contentSelectMenu = () => {
    const {itemValue: {screen_list = []} = {}} = this.props

    return (
      <div>
        <CheckboxGroup
          dataList={this.tranScreenList(screen_list)}
          onItemChange={this.handleSelectedCardFilterContentItem}
        />
      </div>
    );
  }
  render() {

    const { datas = {} } = this.props.model;
    const {
      projectStarList = [],
      // responsibleTaskList = [],
      uploadedFileList:{file_list = [], folder_list = []} = {},
      joinedProcessList = [],
      backLogProcessList = [],
      meetingLsit = [],
      projectList = [],
      schedulingList = [],
      journeyList = [],
      todoList = [],
      projectTabCurrentSelectedProject
    } = datas;
    // const {workbench: {datas: {responsibleTaskList}}} = this.props
    const {
      title,
      CardContentType,
      itemValue = {},
      workbench: {
        datas: {
          responsibleTaskList = []
        }
      }
    } = this.props;
    const { selected_board_data = [] } = itemValue; //已选board id

    const {
      localTitle,
      isInEditTitle,
      addTaskModalVisible,
      addMeetingModalVisible,
      uploadFileModalVisible,
      addProcessModalVisible,
      projectGroupLists
    } = this.state;


    const filterItem = CardContentType => {
      let contanner = <div />;
      switch (CardContentType) {
        //设计师
        //我负责的任务
        case 'RESPONSIBLE_TASK':
          contanner = responsibleTaskList.length ? (
            <div>
              <div>
                {responsibleTaskList.map((value, key) => (
                  <TaskItem
                    {...this.props}
                    key={key}
                    itemValue={value}
                    itemKey={key}
                    setTaskDetailModalVisibile={this.setTaskDetailModalVisibile.bind(
                      this
                    )}
                    isUsedInWorkbench={true}
                  />
                ))}
              </div>
              {this.noContentTooltip('添加任务', 'RESPONSIBLE_TASK')}
            </div>
          ) : (
            // <div style={{marginTop: 12}}>暂无数据</div>
            <>{this.noContent('添加任务', 'RESPONSIBLE_TASK')}</>
          );
          break;
        //审核
        case 'EXAMINE_PROGRESS': //待处理的流程
          contanner = backLogProcessList.length ? (
            <div>
              <div>
                {backLogProcessList.map((value, key) =>{
                  const { flow_instance_id } = value
                  return (
                    <ProcessItem
                      {...this.props}
                      key={`${flow_instance_id}_${key}`}
                      click={this.setPreviewProccessModalVisibile.bind(this)}
                      itemValue={value}
                    />
                 )}
                )}
              </div>
              {/* {this.noContentTooltip("发起流程", "EXAMINE_PROGRESS")} */}
            </div>
          ) : (
            <>
              {/* <div style={{marginTop: 12}}>暂无数据</div> */}
              {this.noContent('发起流程', 'EXAMINE_PROGRESS')}
            </>
          );
          break;
        //我参与的会议
        case 'MEETIMG_ARRANGEMENT':
          contanner = meetingLsit.length ? (
            <div>
              <div>
                {meetingLsit.map((value2, key2) => {
                  return (
                    <MeetingItem
                      {...this.props}
                      key={key2}
                      itemKey={key2}
                      itemValue={value2}
                      setTaskDetailModalVisibile={this.setTaskDetailModalVisibile.bind(
                        this
                      )}
                    />
                  );
                })}
              </div>
              {this.noContentTooltip('添加日程', 'MEETIMG_ARRANGEMENT')}
            </div>
          ) : (
            <>{this.noContent('添加日程', 'MEETIMG_ARRANGEMENT')}</>
            // <div style={{marginTop: 12}}>暂无数据</div>
          );
          break;
        //我的文档
        case 'MY_DOCUMENT':

          contanner = file_list.length || folder_list.length ? (
            <div>
              {/* <div>
                {file_list.map((value, key) => (
                  <FileItem
                    {...this.props}
                    key={key}
                    itemValue={value}
                    setPreviewFileModalVisibile={this.setPreviewFileModalVisibile.bind(
                      this
                    )}
                  />
                ))}
              </div> */}
              <FileFolder {...this.props} file_list={file_list} folder_list={folder_list} shouldFileItemSetPreviewFileModalVisibile={this.setPreviewFileModalVisibile.bind(this)} />
              {this.noContentTooltip('上传文档', 'MY_DOCUMENT')}
            </div>
          ) : (
            // <div style={{marginTop: 12}}>暂无数据</div>
            <>{this.noContent('上传文档', 'MY_DOCUMENT')}</>
          );
          break;
        case 'joinedFlows': //参与的流程
          contanner = joinedProcessList.length ? (
            joinedProcessList.map((value, key) => (
              <ProcessItem {...this.props} key={key} itemValue={value} />
            ))
          ) : (
            <div style={{ marginTop: 12 }}>暂无数据</div>
          );
          break;
        case 'PROJECT_STATISTICS':
          contanner = <ProjectCountItem />;
          break;
        case 'YINYI_MAP':
          contanner = <MapItem />;
          break;
        case 'PROJECT_TRCKING':
          contanner = projectStarList.length ? (
            projectStarList.map((value2, key2) => {
              return (
                <CollectionProjectItem
                  {...this.props}
                  key={key2}
                  itemKey={key2}
                  itemValue={value2}
                />
              );
            })
          ) : (
            <div style={{ marginTop: 12 }}>暂无数据</div>
          );
          break;
        case 'MY_SHOW':
          contanner = <MyShowItem {...this.props} />;
          break;
        case 'MY_CIRCLE':
          contanner = <MyCircleItem {...this.props} />;
          break;
        //老师
        case 'MY_SCHEDULING':
          contanner = schedulingList.length ? (
            schedulingList.map((value, key) => {
              return (
                <SchedulingItem
                  {...this.props}
                  key={key}
                  itemValue={value}
                  itemKey={key}
                  setTaskDetailModalVisibile={this.setTaskDetailModalVisibile.bind(
                    this
                  )}
                />
              );
            })
          ) : (
            <div style={{ marginTop: 12 }}>暂无数据</div>
          );
          break;
        case 'JOURNEY':
          contanner = journeyList.length ? (
            journeyList.map((value, key) => {
              return (
                <Journey
                  {...this.props}
                  key={key}
                  itemValue={value}
                  itemKey={key}
                  setTaskDetailModalVisibile={this.setTaskDetailModalVisibile.bind(
                    this
                  )}
                />
              );
            })
          ) : (
            <div style={{ marginTop: 12 }}>暂无数据</div>
          );
          break;
        case 'TO_DO':
          contanner = todoList.length ? (
            todoList.map((value, key) => {
              return (
                <Todo
                  {...this.props}
                  key={key}
                  itemValue={value}
                  itemKey={key}
                  setTaskDetailModalVisibile={this.setTaskDetailModalVisibile.bind(
                    this
                  )}
                />
              );
            })
          ) : (
            <div style={{ marginTop: 12 }}>暂无数据</div>
          );
          break;
        case 'SCHOOLWORK_CORRECTION':
          contanner = <SchoolWork />;
          break;
        case 'TEACHING_EFFECT':
          contanner = <TeachingEffect />;
          break;

        default:
          break;
      }
      return contanner;
    };

    const menu = () => {
      return (
        <Menu
          onClick={this.handleMenuClick.bind(this)}
          // selectedKeys={[this.state.current]}
          // mode="horizontal"
        >
          <Menu.Item key="rename">重命名</Menu.Item>
          {'YINYI_MAP' === CardContentType ||
          'TEAM_SHOW' === CardContentType ? (
            ''
          ) : (
            <SubMenu title={'选择项目'}>
              <MenuSearchMultiple
                keyCode={'board_id'}
                onCheck={this.selectMultiple.bind(this)}
                selectedKeys={selected_board_data}
                menuSearchSingleSpinning={false}
                Inputlaceholder={'搜索项目'}
                searchName={'board_name'}
                listData={projectList}
              />
            </SubMenu>
          )}

          <Menu.Item key="remove">移除</Menu.Item>
        </Menu>
      );
    };

    return (
      <div className={indexstyles.cardDetail}>
        <div className={indexstyles.contentTitle}>
          {/*<div>{title}</div>*/}

          {!isInEditTitle ? (
            <div
              className={indexstyles.titleDetail}
              onClick={this.handleMenuClick.bind(this, { key: 'rename' })}
            >
              {localTitle}
            </div>
          ) : (
            <Input
              value={localTitle}
              // className={indexStyle.projectName}
              style={{ resize: 'none', color: '#595959', fontSize: 16 }}
              maxLength={30}
              autoFocus
              onChange={this.localTitleChange.bind(this)}
              onPressEnter={this.editTitleComplete.bind(this)}
              onBlur={this.editTitleComplete.bind(this)}
              onClick={() => {}}
            />
          )}
          {/*<MenuSearchMultiple keyCode={'board_id'} onCheck={this.selectMultiple.bind(this)} selectedKeys={selected_board_data} menuSearchSingleSpinning={false} Inputlaceholder={'搜索项目'} searchName={'board_name'} listData={projectList} />*/}
          <Dropdown
            placement="bottomCenter"
             trigger={['click']}
             visible={this.state.dropDonwVisible}
             onVisibleChange={this.onVisibleChange.bind(this)}
             overlay={this.contentSelectMenu()}>
            <div className={indexstyles.operate}><Icon type="ellipsis" style={{color: '#8c8c8c', fontSize: 20}} /></div>
          </Dropdown>
        </div>
        <div className={indexstyles.contentBody}>
          {filterItem(CardContentType)}
          {/*<MyShowItem />*/}
          {/*<CollectionProjectItem />*/}
          {/*<MyCircleItem />*/}
        </div>
        <FileDetailModal
          {...this.props}
          modalVisible={this.state.previewFileModalVisibile}
          setPreviewFileModalVisibile={this.setPreviewFileModalVisibile.bind(
            this
          )}
        />
        {/* 我的流程 */}
        <ProccessDetailModal
          {...this.props}
          close={this.close.bind(this)}
          modalVisible={this.state.previewProccessModalVisibile}
          setPreviewProccessModalVisibile={this.setPreviewProccessModalVisibile.bind(
            this
          )}
        />
        <TaskDetailModal
          {...this.props}
          modalVisible={this.state.TaskDetailModalVisibile}
          setTaskDetailModalVisibile={this.setTaskDetailModalVisibile.bind(
            this
          )}
          setPreviewFileModalVisibile={this.setPreviewFileModalVisibile.bind(
            this
          )}
        />
        {/* addTaskModalVisible */}
        {addTaskModalVisible && (
          <AddTaskModal
            {...this.props}
            setTaskDetailModalVisibile={this.setTaskDetailModalVisibile.bind(
              this
            )}
            modalTitle="添加任务"
            taskType="RESPONSIBLE_TASK"
            getNewTaskInfo={this.getNewTaskInfo}
            projectTabCurrentSelectedProject={projectTabCurrentSelectedProject}
            projectList={projectList}
            addTaskModalVisible={addTaskModalVisible}
            addTaskModalVisibleChange={this.addTaskModalVisibleChange}
            projectGroupLists={projectGroupLists}
            handleShouldUpdateProjectGroupList={this.handleShouldUpdateProjectGroupList}
          />
        )}
        {addMeetingModalVisible && (
            <AddTaskModal
            {...this.props}
            setTaskDetailModalVisibile={this.setTaskDetailModalVisibile.bind(
              this
            )}
            modalTitle="添加日程"
            taskType="MEETIMG_ARRANGEMENT"
            projectTabCurrentSelectedProject={projectTabCurrentSelectedProject}
            projectList={projectList}
            addTaskModalVisible={addMeetingModalVisible}
            addTaskModalVisibleChange={this.addMeetingModalVisibleChange}
            projectGroupLists={projectGroupLists}
            handleShouldUpdateProjectGroupList={this.handleShouldUpdateProjectGroupList}
          />
        )}
        {uploadFileModalVisible && (
          <AddTaskModal
            {...this.props}
            setPreviewFileModalVisibile={this.setPreviewFileModalVisibile.bind(
              this
            )}
            modalTitle="上传文档"
            taskType="MY_DOCUMENT"
            projectTabCurrentSelectedProject={projectTabCurrentSelectedProject}
            projectList={projectList}
            addTaskModalVisible={uploadFileModalVisible}
            addTaskModalVisibleChange={this.uploadFileModalVisibleChange}
          />
        )}
        {addProcessModalVisible && (
          <AddProgressModal
            modalTitle="发起流程"
            taskType="EXAMINE_PROGRESS"
            projectTabCurrentSelectedProject={projectTabCurrentSelectedProject}
            projectList={projectList}
            addProcessModalVisible={addProcessModalVisible}
            addProcessModalVisibleChange={this.addProcessModalVisibleChange}
          />
        )}
        {/*{('MY_DOCUMENT' === CardContentType || 'RESPONSIBLE_TASK' === CardContentType || 'TO_DO' === CardContentType )? (*/}
        {/*<FileDetailModal  {...this.props}  modalVisible={this.state.previewFileModalVisibile} setPreviewFileModalVisibile={this.setPreviewFileModalVisibile.bind(this)}   />*/}
        {/*) : ('')}*/}
        {/*{'RESPONSIBLE_TASK' === CardContentType || 'TO_DO' === CardContentType?(*/}
        {/*<TaskDetailModal {...this.props}  modalVisible={this.state.TaskDetailModalVisibile} setTaskDetailModalVisibile={this.setTaskDetailModalVisibile.bind(this)} setPreviewFileModalVisibile={this.setPreviewFileModalVisibile.bind(this)} />*/}
        {/*):('')}*/}
      </div>
    );
  }
}

export default CardContent;
