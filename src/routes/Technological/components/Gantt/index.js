import React, { Component } from 'react';
import { message } from 'antd'
import { connect } from "dva/index";
import GanttFace from './GanttFace'
// import TaskDetailModal from '../Workbench/CardContent/Modal/TaskDetailModal';
import TaskDetailModal from '@/components/TaskDetailModal'
import AddTaskModal from './components/AddTaskModal';
import { ganttIsFold, getDigitTime } from './constants';

class Gantt extends Component {

  constructor(props) {
    super(props)
    this.state = {
      TaskDetailModalVisibile: false,
      previewFileModalVisibile: false,
    }
    this.card_time_type = undefined //card_time_type为是否排期卡片
  }

  componentDidMount() {
    this.getProjectGoupLists()
    this.getProjectAppsLists()
    this.getAboutUsersBoards()
  }

  componentWillReceiveProps(nextProps) {
  }

  componentWillUnmount() {
    const { dispatch, page_load_type } = this.props
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        is_show_board_file_area: '0'
      }
    })
    if (page_load_type != 1) {
      dispatch({
        type: 'gantt/updateDatas',
        payload: {
          gantt_board_id: '0'
        }
      })
    }
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

  // 点击设置卡片类型（未排期/已排期)
  setTaskDetailModalVisibile = (card_time_type) => {
    this.card_time_type = card_time_type
  }
  // 添加任务 -----------start
  addTaskModalVisibleChange = flag => {
    this.setAddTaskModalVisible(flag)
  };
  setAddTaskModalVisible = (flag) => {
    this.setState({
      addTaskModalVisible: flag
    });
  }
  addNewTask = (data) => {
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
          // dispatch({
          //   type: 'gantt/getGanttData',
          //   payload: {
          //     not_set_loading: true
          //   }
          // })
          this.insertTaskToListGroup(res)
        } else {
          message.warn('创建任务失败')
          if (res.code == 4041) {
            message.warn(res.message)
          }
        }
      })
    // .catch(err => message.error(err));
  }
  // 添加完一条任务后，将某1条任务塞进去
  insertTaskToListGroup = (data) => {
    const { dispatch, } = this.props
    const { list_group = [], current_list_group_id, gantt_board_id, group_view_type, show_board_fold } = this.props
    const list_group_new = [...list_group]
    const group_index = list_group_new.findIndex(item => item.lane_id == current_list_group_id)
    list_group_new[group_index].lane_data.cards.push(data)

    // if (ganttIsFold({ gantt_board_id, group_view_type, show_board_fold })) {
    const current_card_due_time = getDigitTime(data.due_time)
    const now = new Date().getTime()
    list_group_new[group_index].lane_schedule_count = (Number(list_group_new[group_index].lane_schedule_count) || 0) + 1
    if (current_card_due_time < now) { //截止时间在当前时间之前
      list_group_new[group_index].lane_status = '3' //创建的任务在当前时间之前，那就是逾期未完成
      list_group_new[group_index].lane_overdue_count = (Number(list_group_new[group_index].lane_overdue_count) || 0) + 1 //逾期未完成任务 +1
    } else {
      if (list_group_new[group_index].lane_status == '1') {
        list_group_new[group_index].lane_status = '2' //创建的任务在当前时间之后，那就是正常进行未完成
      }
    }
    // }

    dispatch({
      type: 'gantt/handleListGroup',
      payload: {
        data: list_group_new,
        not_set_scroll_top: true
      }
    })
  }
  handleGetNewTaskParams = (data) => {
    const { create_start_time, create_end_time, current_list_group_id, gantt_board_id, group_view_type } = this.props

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
        param.list_id = current_list_group_id == '0' ? '' : current_list_group_id
      }
    }

    this.addNewTask(param)
    this.setAddTaskModalVisible(false)
  }
  // 添加任务 -----------end

  //修改某一个任务
  handleChangeCard = ({ card_id, drawContent, operate_properties_code }) => {
    // operate_properties_code为新任务接口下properties数组的操作code,用来判断执行人和标签更新
    if (this.card_time_type == 'no_schedule') {
      this.handleNoHasScheduleCard({ card_id, drawContent, operate_properties_code })
    } else {
      this.handleHasScheduleCard({ card_id, drawContent, operate_properties_code })
    }
  }
  // 修改某一任务针对项目详情接口结构的数据变化处理
  cardPropertiesPromote = ({ operate_properties_code, drawContent = {} }) => {
    if (!!!operate_properties_code) {
      return drawContent
    }
    const { properties = [] } = drawContent
    const gold_data = (properties.find(item => item.code === operate_properties_code) || {}).data
    let gold_key = 'nothing'
    if ('EXECUTOR' == operate_properties_code) {
      gold_key = 'executors'
    } else if ('LABEL' == operate_properties_code) {
      gold_key = 'label_data'
    }
    return { ...drawContent, [gold_key]: gold_data }
  }
  // 修改没有排期的任务
  handleNoHasScheduleCard = ({ card_id, drawContent = {}, operate_properties_code }) => {
    const { dispatch } = this.props
    if (operate_properties_code == 'MILESTONE') { //修改的是里程碑
      dispatch({
        type: 'gantt/getGttMilestoneList',
        payload: {
        }
      })
      return
    }
    const new_drawContent = this.cardPropertiesPromote({ drawContent, operate_properties_code })
    const { start_time, due_time } = new_drawContent
    const { list_group = [], current_list_group_id } = this.props
    const list_group_new = [...list_group]

    const group_index = list_group_new.findIndex(item => item.lane_id == current_list_group_id)
    const group_index_cards_index = list_group_new[group_index].lane_data.cards.findIndex(item => item.id == card_id)
    const group_index_card_no_times_index = list_group_new[group_index].lane_data.card_no_times.findIndex(item => item.id == card_id)
    const schedule_cards_has_this = group_index_cards_index != -1 //排期任务是否含有该条

    // console.log('ssss', schedule_cards_has_this, !!start_time, !!due_time)

    if (schedule_cards_has_this) {
      this.handleHasScheduleCard({ card_id, new_drawContent })
      return
    }

    if ((!!start_time || !!due_time)) { //如果有截至时间或者开始时间 (!!start_time || !!due_time)
      // 排期了则过滤掉当前
      list_group_new[group_index].lane_data.cards.push(
        { ...list_group_new[group_index].lane_data.card_no_times[group_index_card_no_times_index], ...new_drawContent }
      )
      list_group_new[group_index].lane_data.card_no_times.splice(group_index_card_no_times_index, 1) //[group_index_card_no_times_index] = { ...list_group_new[group_index].lane_data.card_no_times[group_index_cards_index], ...new_drawContent }
    } else {
      list_group_new[group_index].lane_data.card_no_times[group_index_card_no_times_index] = { ...list_group_new[group_index].lane_data.card_no_times[group_index_card_no_times_index], ...new_drawContent }
      list_group_new[group_index].lane_data.card_no_times[group_index_card_no_times_index]['name'] = list_group_new[group_index].lane_data.card_no_times[group_index_card_no_times_index]['card_name']
    }
    dispatch({
      type: 'gantt/handleListGroup',
      payload: {
        data: list_group_new
      }
    })
  }

  // 修改有排期的任务
  handleHasScheduleCard = ({ card_id, drawContent, operate_properties_code }) => {
    const { dispatch } = this.props
    if (operate_properties_code == 'MILESTONE') { //修改的是里程碑
      dispatch({
        type: 'gantt/getGttMilestoneList',
        payload: {
        }
      })
      return
    }
    const new_drawContent = this.cardPropertiesPromote({ drawContent, operate_properties_code })

    const { list_group = [], current_list_group_id } = this.props
    const list_group_new = [...list_group]
    const group_index = list_group_new.findIndex(item => item.lane_id == current_list_group_id)
    const group_index_cards_index = list_group_new[group_index].lane_data.cards.findIndex(item => item.id == card_id)
    const current_item = { ...list_group_new[group_index].lane_data.cards[group_index_cards_index] }

    list_group_new[group_index].lane_data.cards[group_index_cards_index] = { ...list_group_new[group_index].lane_data.cards[group_index_cards_index], ...new_drawContent }
    list_group_new[group_index].lane_data.cards[group_index_cards_index]['name'] = list_group_new[group_index].lane_data.cards[group_index_cards_index]['card_name']

    dispatch({
      type: 'gantt/handleListGroup',
      payload: {
        data: list_group_new
      }
    })

    // 做判断完成或者未完成后，查询里程碑接口更新,（里程碑状态和任务完成与否有关）
    if (current_item.is_realize != new_drawContent.is_realize) {
      dispatch({
        type: 'gantt/getGttMilestoneList',
        payload: {
        }
      })
    }
  }

  // 删除某一条任务
  handleDeleteCard = ({ card_id }) => {
    const { dispatch } = this.props
    const { list_group = [], current_list_group_id } = this.props
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
    const { addTaskModalVisible, } = this.state
    const {
      about_apps_boards = [],
      gantt_board_id,
      group_view_type,
      current_list_group_id,
      about_group_boards = [],
      about_user_boards = [],
      drawerVisible,
    } = this.props;

    return (
      <div>
        <GanttFace
          setTaskDetailModalVisibile={this.setTaskDetailModalVisibile}
          addTaskModalVisibleChange={this.addTaskModalVisibleChange}
          gantt_board_id={gantt_board_id}
          gantt_card_height={this.props.gantt_card_height || 600} //引用组件的地方传递进来的甘特图高度
          is_need_calculate_left_dx={this.props.is_need_calculate_left_dx}
          insertTaskToListGroup={this.insertTaskToListGroup}
        />
        <TaskDetailModal
          task_detail_modal_visible={drawerVisible}
          // setTaskDetailModalVisible={this.setDrawerVisibleClose} //关闭任务弹窗回调
          handleTaskDetailChange={this.handleChangeCard}
          handleDeleteCard={this.handleDeleteCard}
        />

        {addTaskModalVisible && (
          <AddTaskModal
            board_card_group_id={gantt_board_id == '0' ? '' : current_list_group_id}
            handleGetNewTaskParams={this.handleGetNewTaskParams}
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
function mapStateToProps({
  gantt: {
    datas: {
      list_group = [],
      current_list_group_id,
      gantt_board_id,
      group_view_type,
      create_start_time,
      create_end_time,
      about_apps_boards = [],
      about_group_boards = [],
      about_user_boards = [],
      show_board_fold,
    }
  },
  technological: {
    datas: {
      page_load_type
    }
  },
  publicTaskDetailModal: { drawerVisible }
}) {
  return {
    list_group,
    current_list_group_id,
    gantt_board_id,
    group_view_type,
    create_start_time,
    create_end_time,
    drawerVisible,
    about_apps_boards,
    about_group_boards,
    about_user_boards,
    show_board_fold,
    page_load_type
  }
}

Gantt.defaultProps = {
  gantt_card_height: 600, //甘特图卡片默认高度
  is_need_calculate_left_dx: false, //是否需要计算甘特图左边距
}

export default connect(mapStateToProps)(Gantt)

