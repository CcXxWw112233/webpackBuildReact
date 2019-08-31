import React, { Component } from 'react';
import { message } from 'antd'
import { connect } from "dva/index";
import GanttFace from './GanttFace'
import TaskDetailModal from '../Workbench/CardContent/Modal/TaskDetailModal';
import FileDetailModal from '../Workbench/CardContent/Modal/FileDetailModal';
import AddTaskModal from './components/AddTaskModal';

const getEffectOrReducerByName = name => `workbench/${name}`
const getEffectOrReducerByName_4 = name => `workbenchTaskDetail/${name}`
const getEffectOrReducerByName_5 = name => `workbenchFileDetail/${name}`

class Gantt extends Component {
  
  constructor(props) {
    super(props)
    this.state = {
      TaskDetailModalVisibile: false,
      previewFileModalVisibile: false,
    }
    this.card_time_type = undefined
  }

  componentDidMount() {
    this.getProjectGoupLists()
    this.getProjectAppsLists()
    this.getAboutUsersBoards()
  }

  componentWillReceiveProps(nextProps) {

  }


  //弹窗
  setPreviewFileModalVisibile = () => {
    this.setState({
      previewFileModalVisibile: !this.state.previewFileModalVisibile
    });
  }
  setTaskDetailModalVisibile(card_time_type) {
    //card_time_type为是否排期卡片
    this.card_time_type = card_time_type
    this.setState({
      TaskDetailModalVisibile: !this.state.TaskDetailModalVisibile
    });
  }

  //用来实现创建任务弹窗方法
  // 获取带app的项目列表
  getProjectAppsLists = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'gantt/getAboutAppsBoards',
      payload: {

      }
    })
  }
  // 获取带分组的项目列表
  getProjectGoupLists = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'gantt/getAboutGroupBoards',
      payload: {

      }
    })
  }
  // 获取带用户的项目列表
  getAboutUsersBoards = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'gantt/getAboutUsersBoards',
      payload: {

      }
    })
  }

  addTaskModalVisibleChange = flag => {
    this.setAddTaskModalVisible(flag)
  };
  setAddTaskModalVisible = (flag) => {
    this.setState({
      addTaskModalVisible: flag
    });
  }
  addNewTask(data) {
    const { dispatch } = this.props
    Promise.resolve(
      dispatch({
        type: 'workbench/addTask',
        payload: {
          data
        }
      })
    )
      .then(res => {
        if (res) {
          dispatch({
            type: 'gantt/getGanttData',
            payload: {
              not_set_loading: true
            }
          })
        } else {
          message.warn('创建任务失败')
        }
      })
      .catch(err => console.log(err));
  }
  handleGetNewTaskParams(data) {
    const { datas: { create_start_time, create_end_time, current_list_group_id, gantt_board_id, group_view_type } } = this.props.model

    //设置截止日期最后一秒
    const create_end_time_date = new Date(create_end_time)
    const create_end_time_final = `${create_end_time_date.getFullYear()}/${create_end_time_date.getMonth() + 1}/${create_end_time_date.getDate()} 23:59:59`
    const create_end_time_final_timestamp = new Date(create_end_time_final).getTime()

    const param = {
      start_time: create_start_time,
      due_time: create_end_time_final_timestamp, //create_end_time,
      users: data['users'],
      name: data['name'],
      type: data['type'],
      board_id: data['board_id']
    }
    if (group_view_type == '1') {
      if (gantt_board_id == '0') {
        param.board_id = current_list_group_id
        param.list_id = data['list_id']
      } else {
        param.board_id = gantt_board_id
        param.list_id = current_list_group_id == '0'? '': current_list_group_id
      }
    }

    this.addNewTask(param)
    this.setAddTaskModalVisible(false)
  }

  //修改某一个任务
  handleChangeCard = ({ card_id, drawContent }) => {
    if (this.card_time_type == 'no_schedule') {
      this.handleNoHasScheduleCard({ card_id, drawContent })
    } else {
      this.handleHasScheduleCard({ card_id, drawContent })
    }
  }
  // 修改没有排期的任务
  handleNoHasScheduleCard = ({ card_id, drawContent = {} }) => {
    const { dispatch } = this.props
    const { start_time, due_time } = drawContent
    const { datas: { list_group = [], current_list_group_id } } = this.props.model
    const list_group_new = [...list_group]

    const group_index = list_group_new.findIndex(item => item.lane_id == current_list_group_id)
    const group_index_cards_index = list_group_new[group_index].lane_data.card_no_times.findIndex(item => item.id == card_id)

    if (!!start_time || !!due_time) { //如果有截至时间或者开始时间
      // 排期了则过滤掉当前
      list_group_new[group_index].lane_data.cards.push(
        { ...list_group_new[group_index].lane_data.card_no_times[group_index_cards_index], ...drawContent }
      )
      list_group_new[group_index].lane_data.card_no_times.splice(group_index_cards_index, 1) //[group_index_cards_index] = { ...list_group_new[group_index].lane_data.card_no_times[group_index_cards_index], ...drawContent }
    } else {
      list_group_new[group_index].lane_data.card_no_times[group_index_cards_index] = { ...list_group_new[group_index].lane_data.card_no_times[group_index_cards_index], ...drawContent }
      list_group_new[group_index].lane_data.card_no_times[group_index_cards_index]['name'] = list_group_new[group_index].lane_data.card_no_times[group_index_cards_index]['card_name']  
    }
    dispatch({
      type: 'gantt/handleListGroup',
      payload: {
        data: list_group_new
      }
    })
  }

  // 修改有排期的任务
  handleHasScheduleCard = ({ card_id, drawContent }) => {
    const { dispatch } = this.props

    const { datas: { list_group = [], gantt_board_id, current_list_group_id, board_id, group_view_type } } = this.props.model
    const list_group_new = [...list_group]
    const group_index = list_group_new.findIndex(item => item.lane_id == current_list_group_id)
    const group_index_cards_index = list_group_new[group_index].lane_data.cards.findIndex(item => item.id == card_id)
    list_group_new[group_index].lane_data.cards[group_index_cards_index] = { ...list_group_new[group_index].lane_data.cards[group_index_cards_index], ...drawContent }
    list_group_new[group_index].lane_data.cards[group_index_cards_index]['name'] = list_group_new[group_index].lane_data.cards[group_index_cards_index]['card_name']

    dispatch({
      type: 'gantt/handleListGroup',
      payload: {
        data: list_group_new
      }
    })
  }

  // 删除某一条任务
  handleDeleteCard = ({ card_id }) => {
    const { dispatch } = this.props
    const { datas: { list_group = [], current_list_group_id } } = this.props.model
    const list_group_new = [...list_group]
    let belong_group_name = ''
    if (this.card_time_type == 'no_schedule') {
      belong_group_name = 'card_no_times'
    } else {
      belong_group_name = 'cards'
    }
    const group_index = list_group_new.findIndex(item => item.lane_id == current_list_group_id)
    const group_index_cards_index = list_group_new[group_index].lane_data[belong_group_name].findIndex(item => item.id == card_id)
    list_group_new[group_index].lane_data[belong_group_name].splice(group_index_cards_index, 1)
    dispatch({
      type: 'gantt/handleListGroup',
      payload: {
        data: list_group_new
      }
    })
  }

  render() {
    const { dispatch, model = {}, modal } = this.props
    const { previewFileModalVisibile, TaskDetailModalVisibile, addTaskModalVisible, } = this.state
    const { datas = {} } = model;
    const {
      about_apps_boards = [],
      gantt_board_id,
      group_view_type,
      current_list_group_id,
      about_group_boards = [],
      about_user_boards = []
    } = datas;

    const CreateTaskProps = {
      modal,
      model,
      getBoardMembers(payload) {
        dispatch({
          type: getEffectOrReducerByName_4('getBoardMembers'),
          payload: payload
        })
      },
      getCardDetail(payload) {
        dispatch({
          type: getEffectOrReducerByName_4('getCardDetail'),
          payload: payload
        })
      },
      updateTaskDatas(payload) {
        dispatch({
          type: getEffectOrReducerByName_4('updateDatas'),
          payload: payload
        })
      },
      deleteTaskFile(data) {
        dispatch({
          type: getEffectOrReducerByName_4('deleteTaskFile'),
          payload: data,
        })
      },
      addTaskGroup(data) {
        dispatch({
          type: getEffectOrReducerByName_4('addTaskGroup'),
          payload: data,
        })
      },
      deleteTaskGroup(data) {
        dispatch({
          type: getEffectOrReducerByName_4('deleteTaskGroup'),
          payload: data,
        })
      },
      updateTaskGroup(data) {
        dispatch({
          type: getEffectOrReducerByName_4('updateTaskGroup'),
          payload: data,
        })
      },
      getTaskGroupList(data) {
        dispatch({
          type: getEffectOrReducerByName_4('getTaskGroupList'),
          payload: data
        })
      },
      addTask(data) {
        dispatch({
          type: getEffectOrReducerByName_4('addTask'),
          payload: data
        })
      },
      updateTask(data) {
        dispatch({
          type: getEffectOrReducerByName_4('updateTask'),
          payload: data
        })
      },
      deleteTask(id) {
        dispatch({
          type: getEffectOrReducerByName_4('deleteTask'),
          payload: {
            id
          }
        })
      },
      updateChirldTask(data) {
        dispatch({
          type: getEffectOrReducerByName_4('updateChirldTask'),
          payload: data
        })
      },
      deleteChirldTask(data) {
        dispatch({
          type: getEffectOrReducerByName_4('deleteChirldTask'),
          payload: data
        })
      },

      archivedTask(data) {
        dispatch({
          type: getEffectOrReducerByName_4('archivedTask'),
          payload: data
        })
      },
      changeTaskType(data) {
        dispatch({
          type: getEffectOrReducerByName_4('changeTaskType'),
          payload: data
        })
      },
      addChirldTask(data) {
        dispatch({
          type: getEffectOrReducerByName_4('addChirldTask'),
          payload: data
        })
      },
      addTaskExecutor(data) {
        dispatch({
          type: getEffectOrReducerByName_4('addTaskExecutor'),
          payload: data
        })
      },
      removeTaskExecutor(data) {
        dispatch({
          type: getEffectOrReducerByName_4('removeTaskExecutor'),
          payload: data
        })
      },
      completeTask(data) {
        dispatch({
          type: getEffectOrReducerByName_4('completeTask'),
          payload: data
        })
      },
      addTaskTag(data) {
        dispatch({
          type: getEffectOrReducerByName_4('addTaskTag'),
          payload: data
        })
      },
      removeTaskTag(data) {
        dispatch({
          type: getEffectOrReducerByName_4('removeTaskTag'),
          payload: data
        })
      },
      removeProjectMenbers(data) {
        dispatch({
          type: getEffectOrReducerByName_4('removeProjectMenbers'),
          payload: data
        })
      },
      getCardCommentList(id) {
        dispatch({
          type: getEffectOrReducerByName_4('getCardCommentList'),
          payload: {
            id
          }
        })
      },
      addCardNewComment(data) {
        dispatch({
          type: getEffectOrReducerByName_4('addCardNewComment'),
          payload: data
        })
      },
      deleteCardNewComment(data) {
        dispatch({
          type: getEffectOrReducerByName_4('deleteCardNewComment'),
          payload: data
        })
      },
      getBoardTagList(data) {
        dispatch({
          type: getEffectOrReducerByName_4('getBoardTagList'),
          payload: data
        })
      },
      updateBoardTag(data) {
        dispatch({
          type: getEffectOrReducerByName_4('updateBoardTag'),
          payload: data
        })
      },
      toTopBoardTag(data) {
        dispatch({
          type: getEffectOrReducerByName_4('toTopBoardTag'),
          payload: data
        })
      },
      deleteBoardTag(data) {
        dispatch({
          type: getEffectOrReducerByName_4('deleteBoardTag'),
          payload: data
        })
      }
    }
    const FileModuleProps = {
      modal,
      model,
      updateFileDatas(payload) {
        dispatch({
          type: getEffectOrReducerByName_5('updateDatas'),
          payload: payload
        })
      },
      getFileList(params) {
        dispatch({
          type: getEffectOrReducerByName('getFileList'),
          payload: params
        })
      },
      fileCopy(data) {
        dispatch({
          type: getEffectOrReducerByName_5('fileCopy'),
          payload: data
        })
      },
      fileDownload(params) {
        dispatch({
          type: getEffectOrReducerByName_5('fileDownload'),
          payload: params
        })
      },
      fileRemove(data) {
        dispatch({
          type: getEffectOrReducerByName_5('fileRemove'),
          payload: data
        })
      },
      fileMove(data) {
        dispatch({
          type: getEffectOrReducerByName_5('fileMove'),
          payload: data
        })
      },
      fileUpload(data) {
        dispatch({
          type: getEffectOrReducerByName_5('fileUpload'),
          payload: data
        })
      },
      fileVersionist(params) {
        dispatch({
          type: getEffectOrReducerByName_5('fileVersionist'),
          payload: params
        })
      },
      recycleBinList(params) {
        dispatch({
          type: getEffectOrReducerByName_5('recycleBinList'),
          payload: params
        })
      },
      deleteFile(data) {
        dispatch({
          type: getEffectOrReducerByName_5('deleteFile'),
          payload: data
        })
      },
      restoreFile(data) {
        dispatch({
          type: getEffectOrReducerByName_5('restoreFile'),
          payload: data
        })
      },
      getFolderList(params) {
        dispatch({
          type: getEffectOrReducerByName_5('getFolderList'),
          payload: params
        })
      },
      addNewFolder(data) {
        dispatch({
          type: getEffectOrReducerByName_5('addNewFolder'),
          payload: data
        })
      },
      updateFolder(data) {
        dispatch({
          type: getEffectOrReducerByName_5('updateFolder'),
          payload: data
        })
      },
      filePreview(params) {
        dispatch({
          type: getEffectOrReducerByName_5('filePreview'),
          payload: params
        })
      },
      getPreviewFileCommits(params) {
        dispatch({
          type: getEffectOrReducerByName_5('getPreviewFileCommits'),
          payload: params
        })
      },
      addFileCommit(params) {
        dispatch({
          type: getEffectOrReducerByName_5('addFileCommit'),
          payload: params
        })
      },
      deleteCommit(params) {
        dispatch({
          type: getEffectOrReducerByName_5('deleteCommit'),
          payload: params
        })
      },
    }
    const updateDatasTask = (payload) => {
      dispatch({
        type: getEffectOrReducerByName_4('updateDatas'),
        payload: payload
      })
    }
    const updateDatasFile = (payload) => {
      dispatch({
        type: getEffectOrReducerByName_5('updateDatas'),
        payload: payload
      })
    }

    return (
      <div>
        <GanttFace
          setTaskDetailModalVisibile={this.setTaskDetailModalVisibile.bind(this)}
          addTaskModalVisibleChange={this.addTaskModalVisibleChange.bind(this)}
          setPreviewFileModalVisibile={this.setPreviewFileModalVisibile.bind(this)}
          gantt_board_id={gantt_board_id}
          gantt_card_height={this.props.gantt_card_height || 600} //引用组件的地方传递进来的甘特图高度
          is_need_calculate_left_dx={this.props.is_need_calculate_left_dx}
        />
        <FileDetailModal
          {...this.props}
          {...CreateTaskProps}
          {...FileModuleProps}
          setTaskDetailModalVisibile={this.setTaskDetailModalVisibile.bind(this)}
          modalVisible={previewFileModalVisibile}
          setPreviewFileModalVisibile={this.setPreviewFileModalVisibile.bind(this)}
          updateDatasTask={updateDatasTask}
          updateDatasFile={updateDatasFile}
          updateTaskDatas={updateDatasTask}
          updateFileDatas={updateDatasFile}
        />

        <TaskDetailModal
          {...this.props}
          {...CreateTaskProps}
          {...FileModuleProps}
          modalVisible={TaskDetailModalVisibile}
          setTaskDetailModalVisibile={this.setTaskDetailModalVisibile.bind(this)}
          setPreviewFileModalVisibile={this.setPreviewFileModalVisibile.bind(this)}
          updateDatasTask={updateDatasTask}
          updateDatasFile={updateDatasFile}
          updateTaskDatas={updateDatasTask}
          updateFileDatas={updateDatasFile}
          handleChangeCard={this.handleChangeCard.bind(this)}
          updateDatas={updateDatasTask}
          needDelete={true}
          handleDeleteCard={this.handleDeleteCard}
        />

        {addTaskModalVisible && (
          <AddTaskModal
            board_card_group_id={gantt_board_id == '0' ? '' : current_list_group_id}
            handleGetNewTaskParams={this.handleGetNewTaskParams.bind(this)}
            current_operate_board_id={gantt_board_id == '0' ? current_list_group_id : gantt_board_id}
            current_list_group_id={current_list_group_id}
            group_view_type={group_view_type}
            gantt_board_id={gantt_board_id}
            about_apps_boards={about_apps_boards}
            addTaskModalVisible={addTaskModalVisible}
            setAddTaskModalVisible={this.setAddTaskModalVisible}
            about_group_boards={about_group_boards}
            about_user_boards={about_user_boards}
          />
        )}
      </div>
    )
  }

}

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ gantt, workbench, workbenchTaskDetail, workbenchFileDetail, workbenchDetailProcess, workbenchPublicDatas }) {
  const modelObj = {
    datas: { ...workbenchTaskDetail['datas'], ...workbenchFileDetail['datas'], ...workbenchDetailProcess['datas'], ...workbenchPublicDatas['datas'], ...gantt['datas'] }
  }
  return { model: modelObj }
}

Gantt.defaultProps = {
  gantt_card_height: 600, //甘特图卡片默认高度
  is_need_calculate_left_dx: false, //是否需要计算甘特图左边距
}

export default connect(mapStateToProps)(Gantt)

