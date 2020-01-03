/*eslint-disable*/
import {
  Icon,
  Dropdown,
  Input,
  Menu,
  message
} from 'antd';
import indexstyles from '../index.less';
import TaskItem from './TaskItem';
import ProcessItem from './ProcessItem';
import FileItem from './FileItem';
import MeetingItem from './MeetingItem';
import React from 'react';
import MenuSearchMultiple from '../CardContent/MenuSearchMultiple';
import TaskDetailModal from '@/components/TaskDetailModal'
import FileDetailModal from '@/components/FileDetailModal'
import ProccessDetailModal from './Modal/ProccessDetailModal';
import AddTaskModal from './Modal/AddTaskModal';
import AddProgressModal from './Modal/AddProgressModal';
import { connect } from 'dva';
import { checkIsHasPermissionInBoard } from '../../../../../utils/businessFunction';
import { getProjectGoupList } from './../../../../../services/technological/task'
import {
  MESSAGE_DURATION_TIME,
  NOT_HAS_PERMISION_COMFIRN,
  PROJECT_TEAM_CARD_CREATE,
  PROJECT_FILES_FILE_UPLOAD,
  PROJECT_FLOWS_FLOW_CREATE
} from '../../../../../globalset/js/constant';
import CheckboxGroup from './CheckboxGroup/index'
import FileFolder from './FileFolder/index'

const SubMenu = Menu.SubMenu;

@connect((
  { workbench,
    workbenchDetailProcess: {
      datas: {
        processInfo = {}
      } },
    projectDetail: {
      datas: { projectDetailInfoData = {} }
    },
    publicTaskDetailModal: {
      drawContent = {},
      drawerVisible
    },
    publicFileDetailModal: {
      filePreviewCurrentFileId,
      fileType,
      isInOpenFile,
      isInAttachmentFile
    }
  }) => ({
    workbench, processInfo, projectDetailInfoData, drawerVisible, drawContent,
    filePreviewCurrentFileId, fileType, isInOpenFile, isInAttachmentFile
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
    projectGroupLists: []
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
    if (localTitle == title) {
      return false
    }
    if (!localTitle) {
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

  // 关闭文件弹窗的回调
  setPreviewFileModalVisibile() {
    // this.setState({
    //   previewFileModalVisibile: !this.state.previewFileModalVisibile
    // });
    this.props.dispatch({
      type: 'publicFileDetailModal/updateDatas',
      payload: {
        filePreviewCurrentFileId: '',
        fileType: '',
        isInOpenFile: false,
        currentPreviewFileName: ''
      }
    })
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
    if (!isResOk(res)) {
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
      type: 'projectDetail/projectDetailInfo',
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

  // 这是新的设置弹窗的回调
  setTaskDetailModalVisible = () => {
    this.props.dispatch({
      type: 'publicTaskDetailModal/updateDatas',
      payload: {
        drawerVisible: false,
        drawContent: {},
        card_id: ''
      }
    })

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
  handleSelectFileFolderChange = folder_id => { };
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
      if (curr.id === currentItem.id) {
        return currentItem.checked ? acc ? `${acc},${curr.id}` : `${curr.id}` : acc
      }
      return curr && curr.selected === '1' ? acc ? `${acc},${curr.id}` : `${curr.id}` : acc
    }, '')
  }
  handleSelectedCardFilterContentItem = (item, status) => {
    const { itemValue: { id: box_id, screen_list, code }, dispatch } = this.props

    const getSelectedCardFilterContentItemStatus = Object.assign({}, item, status)

    const ids = this.getCurrentBoxScreenListAllSelectedItemIdStr(screen_list, getSelectedCardFilterContentItemStatus)
    const data = {
      id: box_id,
      code,
      ids
    }
    dispatch({
      type: 'workbench/handleSetBoxFilterCon',
      payload: data
    })
  }
  strNumToBool = str => str === '0' ? false : str === '1' ? true : false
  tranScreenList = (arr = []) => {
    return arr.map(({ name, id, editable, selected }) => ({
      label: name,
      checked: this.strNumToBool(selected),
      disabled: !this.strNumToBool(editable),
      id,
    }))
  }
  contentSelectMenu = () => {
    const { itemValue: { screen_list = [] } = {} } = this.props

    return (
      <div>
        <CheckboxGroup
          dataList={this.tranScreenList(screen_list)}
          onItemChange={this.handleSelectedCardFilterContentItem}
        />
      </div>
    );
  }

  // 修改任务或会议回调
  handleChangeCard = ({ drawContent, card_id, name, value }) => {
    const {
      workbench: {
        datas: {
          responsibleTaskList = [],
          meetingLsit = []
        }
      },
      dispatch
    } = this.props;
    const new_responsibleTaskList = responsibleTaskList.map(item => {
      let new_item = { ...item }
      if (item.id == card_id) {
        new_item = { ...item, name: drawContent.card_name }
        if (name && value) new_item[name] = value
        return new_item
      } else {
        return new_item
      }
    })
    const new_meetingLsit = meetingLsit.map(item => {
      let new_item = { ...item }
      if (item.id == card_id) {
        new_item = { ...item, name: drawContent.card_name }
        if (name && value) new_item[name] = value
        return new_item
      } else {
        return new_item
      }
    })
    // const new_responsibleTaskList = responsibleTaskList.map(item => {
    //   let new_item = {...item}
    //   if(item.id == card_id) {
    //     new_item = {...item, ...drawContent, name: drawContent.card_name}
    //   }
    //   return new_item
    // })
    // const new_meetingLsit = meetingLsit.map(item => {
    //   let new_item = {...item}
    //   if(item.id == card_id) {
    //     new_item = {...item, ...drawContent, name: drawContent.card_name}
    //   }
    //   return new_item
    // })
    dispatch({
      type: 'workbench/updateDatas',
      payload: {
        responsibleTaskList: new_responsibleTaskList,
        meetingLsit: new_meetingLsit
      }
    })
  }

  // 删除某条卡片
  handleDeleteCard = ({ card_id }) => {
    const {
      workbench: {
        datas: {
          responsibleTaskList = [],
          meetingLsit = []
        }
      },
      dispatch
    } = this.props;

    const new_responsibleTaskList = responsibleTaskList.filter(item => {
      let new_item = { ...item }
      return new_item.id != card_id
    })
    const new_meetingLsit = meetingLsit.filter(item => {
      let new_item = { ...item }
      return new_item.id != card_id
    })
    dispatch({
      type: 'workbench/updateDatas',
      payload: {
        responsibleTaskList: new_responsibleTaskList,
        meetingLsit: new_meetingLsit
      }
    })
  }

  whetherUpdateFolderListData = () => {
    // if (this.props.isInAttachmentFile) return
    this.props.dispatch({
      type: 'workbench/getUploadedFileList',
      payload: {

      }
    })
  }

  // 数组去重
  arrayNonRepeatfy = arr => {
    let temp_arr = []
    let temp_id = []
    for (let i = 0; i < arr.length; i++) {
      if (!temp_id.includes(arr[i]['id'])) {//includes 检测数组是否有某个值
        temp_arr.push(arr[i]);
        temp_id.push(arr[i]['id'])
      }
    }
    return temp_arr
  }

  // 访问控制中更新数据
  commonProcessVisitControlUpdateCurrentModalData = (newProcessInfo, type) => {
    const { dispatch, processInfo = {} } = this.props
    dispatch({
      type: 'workbenchDetailProcess/updateDatas',
      payload: {
        processInfo: newProcessInfo
      }
    })
    if (type) {
      dispatch({
        type: 'workbenchDetailProcess/getBackLogProcessList',
        payload: {

        }
      })
    }
  }

  // 访问控制中流程操作
  visitControlUpdateCurrentModalData = obj => {
    const { processInfo = {} } = this.props
    const { privileges = [] } = processInfo

    // 访问控制开关
    if (obj && obj.type && obj.type == 'privilege') {
      let new_privileges = [...privileges]
      for (let item in obj) {
        if (item == 'privileges') {
          obj[item].map(val => {
            let temp_arr = this.arrayNonRepeatfy([].concat(...privileges, val))
            if (temp_arr && !temp_arr.length) return false
            return new_privileges = [...temp_arr]
          })
        }
      }
      let newProcessInfo = { ...processInfo, privileges: new_privileges, is_privilege: obj.is_privilege }
      // this.props.updateDatasProcess({
      //   processInfo: newProcessInfo
      // });
      // 这是需要获取一下流程列表 区分工作台和项目列表
      this.commonProcessVisitControlUpdateCurrentModalData(newProcessInfo, obj.type)

    };

    // 访问控制添加
    if (obj && obj.type && obj.type == 'add') {
      let new_privileges = []
      for (let item in obj) {
        if (item == 'privileges') {
          obj[item].map(val => {
            let temp_arr = this.arrayNonRepeatfy([].concat(...privileges, val))
            return new_privileges = [...temp_arr]
          })
        }
      }
      let newProcessInfo = { ...processInfo, privileges: new_privileges }
      this.commonProcessVisitControlUpdateCurrentModalData(newProcessInfo)
    }

    // 访问控制移除
    if (obj && obj.type && obj.type == 'remove') {
      let new_privileges = [...privileges]
      new_privileges.map((item, index) => {
        if (item.id == obj.removeId) {
          new_privileges.splice(index, 1)
        }
      })
      let newProcessInfo = { ...processInfo, privileges: new_privileges, is_privilege: obj.is_privilege }
      this.commonProcessVisitControlUpdateCurrentModalData(newProcessInfo)
    }

    // 这是更新type类型
    if (obj && obj.type && obj.type == 'change') {
      let { id, content_privilege_code, user_info } = obj.temp_arr
      let new_privileges = [...privileges]
      new_privileges = new_privileges.map((item) => {
        let new_item = item
        if (item.id == id) {
          new_item = { ...item, content_privilege_code: obj.code }
        } else {
          new_item = { ...item }
        }
        return new_item
      })
      let newProcessInfo = { ...processInfo, privileges: new_privileges }
      this.commonProcessVisitControlUpdateCurrentModalData(newProcessInfo)
    }

  }

  render() {

    const { datas = {} } = this.props.model;
    const {
      projectStarList = [],
      // responsibleTaskList = [],
      uploadedFileList: { file_list = [], folder_list = [] } = {},
      joinedProcessList = [],
      backLogProcessList = [],
      meetingLsit = [],
      projectList = [],
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
      },
      projectDetailInfoData = {}
    } = this.props;
    const { data = [], board_id } = projectDetailInfoData
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
                    // setTaskDetailModalVisible={this.setTaskDetailModalVisible}
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
                {backLogProcessList.map((value, key) => {
                  const { flow_instance_id } = value
                  return (
                    <ProcessItem
                      {...this.props}
                      key={`${flow_instance_id}_${key}`}
                      click={this.setPreviewProccessModalVisibile.bind(this)}
                      itemValue={value}
                    />
                  )
                }
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
                    // setTaskDetailModalVisible={this.setTaskDetailModalVisible}
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
                onClick={() => { }}
              />
            )}
          {/*<MenuSearchMultiple keyCode={'board_id'} onCheck={this.selectMultiple.bind(this)} selectedKeys={selected_board_data} menuSearchSingleSpinning={false} Inputlaceholder={'搜索项目'} searchName={'board_name'} listData={projectList} />*/}
          <Dropdown
            placement="bottomCenter"
            trigger={['click']}
            visible={this.state.dropDonwVisible}
            onVisibleChange={this.onVisibleChange.bind(this)}
            overlay={this.contentSelectMenu()}>
            <div className={indexstyles.operate}><Icon type="ellipsis" style={{ color: '#8c8c8c', fontSize: 20 }} /></div>
          </Dropdown>
        </div>
        <div className={indexstyles.contentBody}>
          {filterItem(CardContentType)}
          {/*<MyShowItem />*/}
          {/*<CollectionProjectItem />*/}
          {/*<MyCircleItem />*/}
        </div>
        {
          CardContentType == 'MY_DOCUMENT' && this.props.isInOpenFile && board_id && (
            <FileDetailModal
              filePreviewCurrentFileId={this.props.filePreviewCurrentFileId}
              fileType={this.props.fileType}
              board_id={board_id}
              file_detail_modal_visible={this.props.isInOpenFile}
              setPreviewFileModalVisibile={this.setPreviewFileModalVisibile.bind(this)}
              whetherUpdateFolderListData={this.whetherUpdateFolderListData}
            />
          )
        }
        {/* <FileDetailModal
          {...this.props}
          modalVisible={this.state.previewFileModalVisibile}
          setPreviewFileModalVisibile={this.setPreviewFileModalVisibile.bind(
            this
          )}
        /> */}
        {/* 我的流程 */}
        <ProccessDetailModal
          {...this.props}
          close={this.close.bind(this)}
          modalVisible={this.state.previewProccessModalVisibile}
          setPreviewProccessModalVisibile={this.setPreviewProccessModalVisibile.bind(
            this
          )}
          visitControlUpdateCurrentModalData={this.visitControlUpdateCurrentModalData}
          principalList={data}
        />
        {
          CardContentType == 'RESPONSIBLE_TASK' && (
            <TaskDetailModal
              task_detail_modal_visible={this.props.drawerVisible}
              // setTaskDetailModalVisible={this.setTaskDetailModalVisible}
              handleTaskDetailChange={this.handleChangeCard}
              handleDeleteCard={this.handleDeleteCard}
            />
          )
        }

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
