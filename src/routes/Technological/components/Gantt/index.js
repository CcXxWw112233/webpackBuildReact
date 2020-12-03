import React, { Component } from 'react'
import { message } from 'antd'
import { connect } from 'dva/index'
import GanttFace from './GanttFace'
// import TaskDetailModal from '../Workbench/CardContent/Modal/TaskDetailModal';
// import TaskDetailModal from '@/components/TaskDetailModal'
import AddTaskModal from './components/AddTaskModal'
import {
  ganttIsFold,
  getDigitTime,
  ganttIsOutlineView,
  ceil_width,
  ganttIsSingleBoardGroupView
} from './constants'
import OutlineTree from './components/OutlineTree'
import {
  checkIsHasPermissionInBoard,
  checkIsHasPermissionInVisitControlWithGroup
} from '../../../../utils/businessFunction'
import {
  MESSAGE_DURATION_TIME,
  NOT_HAS_PERMISION_COMFIRN,
  PROJECT_TEAM_CARD_CREATE
} from '../../../../globalset/js/constant'

class Gantt extends Component {
  constructor(props) {
    super(props)
    this.state = {
      TaskDetailModalVisibile: false,
      previewFileModalVisibile: false
    }
    this.card_time_type = undefined //card_time_type为是否排期卡片
  }

  componentDidMount() {
    // this.getProjectGoupLists()
    // this.getProjectAppsLists()
    // this.getAboutUsersBoards()
  }

  componentWillReceiveProps(nextProps) {}

  componentWillUnmount() {
    const { dispatch, page_load_type } = this.props
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        is_show_board_file_area: '0',
        group_view_filter_boards: [],
        group_view_filter_users: [],
        boards_flies: [],
        outline_tree: [],
        gantt_view_mode: 'month',
        ceilWidth: ceil_width,
        list_group: [],
        date_arr_one_level: [],
        gold_date_arr: [],
        milestoneMap: {},
        rely_map: [],
        outline_tree_round: []
      }
    })
    if (page_load_type != 1) {
      dispatch({
        type: 'gantt/updateDatas',
        payload: {
          gantt_board_id: '0',
          group_view_type: '1'
        }
      })
    }
  }

  //用来实现创建任务弹窗方法
  // 获取带app的项目列表
  // getProjectAppsLists = () => {
  //   const { dispatch } = this.props
  //   dispatch({
  //     type: 'gantt/getAboutAppsBoards',
  //     payload: {

  //     }
  //   })
  // }
  // // 获取带分组的项目列表
  // getProjectGoupLists = () => {
  //   const { dispatch } = this.props
  //   dispatch({
  //     type: 'gantt/getAboutGroupBoards',
  //     payload: {

  //     }
  //   })
  // }
  // // 获取带用户的项目列表
  // getAboutUsersBoards = () => {
  //   const { dispatch } = this.props
  //   dispatch({
  //     type: 'gantt/getAboutUsersBoards',
  //     payload: {

  //     }
  //   })
  // }

  // 任务详情弹窗关闭回调
  setDrawerVisibleClose = () => {
    const { group_view_type, dispatch } = this.props
    if (group_view_type == '5') {
      dispatch({
        type: 'gantt/getGanttData',
        payload: {}
      })
    }
  }

  // 点击设置卡片类型（未排期/已排期)
  setTaskDetailModalVisibile = card_time_type => {
    this.card_time_type = card_time_type
  }
  // 添加任务 -----------start
  addTaskModalVisibleChange = flag => {
    const {
      list_group = [],
      current_list_group_id,
      gantt_board_id
    } = this.props
    const permissionsValue = checkIsHasPermissionInBoard(
      PROJECT_TEAM_CARD_CREATE,
      gantt_board_id
    )
    if (
      !checkIsHasPermissionInVisitControlWithGroup({
        code: 'read',
        list_id: current_list_group_id,
        list_group,
        permissionsValue
      })
    ) {
      message.warn('权限不足，操作未被许可', MESSAGE_DURATION_TIME)
      return
    }
    this.setAddTaskModalVisible(flag)
  }
  setAddTaskModalVisible = flag => {
    this.setState({
      addTaskModalVisible: flag
    })
  }
  addNewTask = data => {
    const { dispatch, group_view_type } = this.props
    Promise.resolve(
      dispatch({
        type: 'workbench/addTask',
        payload: {
          data
        }
      })
    ).then(res => {
      if (res) {
        if (!ganttIsOutlineView({ group_view_type })) {
          // debugger
          this.insertTaskToListGroup({ ...data, ...res })
        } else {
          this.insertOutLineTreeNode({ res, params: data })
        }
      } else {
        // message.warn('创建任务失败')
        // if (res.code == 4041) {
        //   message.warn(res.message)
        // }
      }
    })
    // .catch(err => message.error(err));
  }
  // 添加完一条任务后，将某1条任务塞进去
  insertTaskToListGroup = data => {
    const { dispatch } = this.props
    const {
      list_group = [],
      current_list_group_id,
      gantt_board_id,
      group_view_type,
      show_board_fold
    } = this.props
    const list_group_new = [...list_group]
    const group_index = list_group_new.findIndex(
      item => item.lane_id == current_list_group_id
    )
    list_group_new[group_index].lane_data.cards.push(data)

    // if (ganttIsFold({ gantt_board_id, group_view_type, show_board_fold })) {
    const current_card_due_time = getDigitTime(data.due_time)
    const now = new Date().getTime()
    list_group_new[group_index].lane_schedule_count =
      (Number(list_group_new[group_index].lane_schedule_count) || 0) + 1
    if (current_card_due_time < now) {
      //截止时间在当前时间之前
      list_group_new[group_index].lane_status = '3' //创建的任务在当前时间之前，那就是逾期未完成
      list_group_new[group_index].lane_overdue_count =
        (Number(list_group_new[group_index].lane_overdue_count) || 0) + 1 //逾期未完成任务 +1
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

    setTimeout(async () => {
      const list_group_ = await dispatch({
        type: 'gantt/getGanttGroupElseInfo',
        payload: {
          list_id: current_list_group_id
        }
      })
      dispatch({
        type: 'gantt/handleListGroup',
        payload: {
          data: list_group_
        }
      })
    }, 2000)
  }
  handleGetNewTaskParams = data => {
    const {
      create_start_time,
      create_end_time,
      current_list_group_id,
      gantt_board_id,
      group_view_type,
      panel_outline_create_card_params,
      gantt_board_list_id,
      belong_group_row,
      gantt_view_mode
    } = this.props

    //设置截止日期最后一秒
    const create_end_time_date = new Date(create_end_time)
    const create_end_time_final =
      gantt_view_mode == 'hours' //时视图取精确小时，其它视图取当天的最后一分钟
        ? create_end_time
        : `${create_end_time_date.getFullYear()}/${create_end_time_date.getMonth() +
            1}/${create_end_time_date.getDate()} 23:59:59`
    const create_end_time_final_timestamp = new Date(
      create_end_time_final
    ).getTime()

    let param = {
      start_time: create_start_time,
      due_time: create_end_time_final_timestamp, //create_end_time,
      users: data['users'],
      name: data['name'],
      type: data['type'],
      board_id: data['board_id'],
      milestone_id: data['milestone_id']
    }
    if (group_view_type == '1') {
      if (gantt_board_id == '0') {
        param.board_id = current_list_group_id
        param.list_id = data['list_id']
      } else {
        param.board_id = gantt_board_id
        param.list_id =
          current_list_group_id == '0' ? '' : current_list_group_id
      }
    } else if (group_view_type == '5') {
      param.list_id = data['list_id'] || gantt_board_list_id
    } else if (group_view_type == '2') {
      param.list_id = data['list_id'] || ''
    } else {
    }
    if (ganttIsOutlineView({ group_view_type })) {
      param = {
        ...param,
        ...panel_outline_create_card_params
      }
    }
    if (ganttIsSingleBoardGroupView({ group_view_type, gantt_board_id })) {
      //单任务分组下需要传行高
      param.row = belong_group_row
    }
    this.addNewTask(param)
    this.setAddTaskModalVisible(false)
  }
  // 添加任务 -----------end

  //修改某一个任务
  handleChangeCard = ({
    card_id,
    drawContent,
    operate_properties_code,
    ...other_params
  }) => {
    // operate_properties_code为新任务接口下properties数组的操作code,用来判断执行人和标签更新
    if (this.card_time_type == 'no_schedule') {
      this.handleNoHasScheduleCard({
        card_id,
        drawContent,
        operate_properties_code,
        ...other_params
      })
    } else {
      this.handleHasScheduleCard({
        card_id,
        drawContent,
        operate_properties_code,
        ...other_params
      })
    }
  }
  // 修改某一任务针对项目详情接口结构的数据变化处理
  cardPropertiesPromote = ({ operate_properties_code, drawContent = {} }) => {
    if (!!!operate_properties_code) {
      return drawContent
    }
    const { properties = [] } = drawContent
    const gold_data =
      (properties.find(item => item.code === operate_properties_code) || {})
        .data || []
    let gold_key = 'nothing'
    const obj = {
      EXECUTOR: 'executors',
      LABEL: 'label_data',
      MILESTONE: 'milestone',
      SUBTASK: 'children'
    }
    gold_key = obj[operate_properties_code]
    // if ('EXECUTOR' == operate_properties_code) {
    //   gold_key = 'executors'
    // } else if ('LABEL' == operate_properties_code) {
    //   gold_key = 'label_data'
    // } else if ('MILESTONE' == operate_properties_code) {
    //   gold_key = 'milestone'
    // }else if('SUBTASK' == operate_properties_code) {

    // }
    return { ...drawContent, [gold_key]: gold_data }
  }
  // 修改没有排期的任务
  handleNoHasScheduleCard = ({
    card_id,
    drawContent = {},
    operate_properties_code,
    ...other_params
  }) => {
    const {
      group_view_type,
      dispatch,
      gantt_board_id,
      show_board_fold,
      gantt_view_mode
    } = this.props
    if (operate_properties_code == 'MILESTONE') {
      //修改的是里程碑
      dispatch({
        type: 'gantt/getGttMilestoneList',
        payload: {}
      })
      return
    }

    // 后台会返回行高和时间等信息
    let update_from_response = {}
    if (
      Object.prototype.toString.call(other_params.rely_card_datas) ==
      '[object Array]'
    ) {
      update_from_response =
        other_params.rely_card_datas.find(item => item.id == card_id) || {}
    }
    const new_drawContent = {
      ...this.cardPropertiesPromote({ drawContent, operate_properties_code }),
      ...update_from_response
    }

    const { start_time, due_time } = new_drawContent
    const { list_group = [], current_list_group_id } = this.props
    const list_group_new = [...list_group]

    const group_index = list_group_new.findIndex(
      item => item.lane_id == current_list_group_id
    )
    const group_index_cards_index = list_group_new[
      group_index
    ].lane_data.cards.findIndex(item => item.id == card_id)
    const group_index_card_no_times_index = list_group_new[
      group_index
    ].lane_data.card_no_times.findIndex(item => item.id == card_id)
    const schedule_cards_has_this = group_index_cards_index != -1 //排期任务是否含有该条

    // console.log('ssss', schedule_cards_has_this, !!start_time, !!due_time)

    if (schedule_cards_has_this) {
      this.handleHasScheduleCard({ card_id, drawContent: new_drawContent })
      return
    }

    if (!!start_time || !!due_time) {
      //如果有截至时间或者开始时间 (!!start_time || !!due_time)
      // 排期了则过滤掉当前
      list_group_new[group_index].lane_data.cards.push({
        ...list_group_new[group_index].lane_data.card_no_times[
          group_index_card_no_times_index
        ],
        ...new_drawContent
      })
      list_group_new[group_index].lane_data.card_no_times.splice(
        group_index_card_no_times_index,
        1
      ) //[group_index_card_no_times_index] = { ...list_group_new[group_index].lane_data.card_no_times[group_index_cards_index], ...new_drawContent }
      this.setTaskDetailModalVisibile('schedule')
      if (
        ganttIsFold({
          gantt_board_id,
          group_view_type,
          show_board_fold,
          gantt_view_mode
        })
      ) {
        //统计的时候不知道怎么更新只好调接口
        dispatch({
          type: 'gantt/getGanttData',
          payload: {}
        })
        return
      }
    } else {
      list_group_new[group_index].lane_data.card_no_times[
        group_index_card_no_times_index
      ] = {
        ...list_group_new[group_index].lane_data.card_no_times[
          group_index_card_no_times_index
        ],
        ...new_drawContent
      }
      list_group_new[group_index].lane_data.card_no_times[
        group_index_card_no_times_index
      ]['name'] =
        list_group_new[group_index].lane_data.card_no_times[
          group_index_card_no_times_index
        ]['card_name']
    }
    dispatch({
      type: 'gantt/handleListGroup',
      payload: {
        data: list_group_new
      }
    })
    // 修改的是这些则更新分组头部信息
    // if (['EXECUTOR'].includes(operate_properties_code) || (other_params ? ['is_realize', 'start_time', 'due_time'].includes(other_params.name) : false)) {
    //   setTimeout(() => {
    //     dispatch({
    //       type: 'gantt/getGanttGroupElseInfo',
    //       payload: {
    //       }
    //     })
    //   }, 500);
    // }
  }

  // 修改有排期的任务
  handleHasScheduleCard = ({
    card_id,
    drawContent,
    operate_properties_code,
    ...other_params
  }) => {
    const {
      group_view_type,
      dispatch,
      gantt_board_id,
      show_board_fold,
      gantt_view_mode
    } = this.props
    const new_drawContent = this.cardPropertiesPromote({
      drawContent,
      operate_properties_code
    })
    if (operate_properties_code == 'MILESTONE') {
      //修改的是里程碑
      this.handleChangeMilestone({
        milestone: new_drawContent.milestone,
        card_id
      })
      return
    }

    if (
      ganttIsFold({
        gantt_board_id,
        group_view_type,
        show_board_fold,
        gantt_view_mode
      }) &&
      ['is_realize', 'start_time', 'due_time'].includes(other_params.name)
    ) {
      //统计的时候不知道怎么更新只好调接口
      dispatch({
        type: 'gantt/getGanttData',
        payload: {}
      })
      return
    }

    if (ganttIsOutlineView({ group_view_type })) {
      if (
        Object.prototype.toString.call(other_params.rely_card_datas) ==
        '[object Array]'
      ) {
        // setTimeout(() => {
        if (
          Object.prototype.toString.call(other_params.rely_card_datas) ==
          '[object Array]'
        ) {
          dispatch({
            type: 'gantt/updateOutLineTree',
            payload: {
              datas: other_params.rely_card_datas //.filter(item => item.id != card_id)
            }
          })
        }
        // })
      } else {
        this.changeOutLineTreeNodeProto(card_id, {
          ...new_drawContent,
          name: drawContent.card_name
        })
      }
      return
    } else {
      // 如果将所有相关的任务时间传递进来
      if (
        Object.prototype.toString.call(other_params.rely_card_datas) ==
        '[object Array]'
      ) {
        // setTimeout(() => {
        dispatch({
          type: `gantt/updateListGroup`,
          payload: {
            datas: other_params.rely_card_datas
          }
        })
        // }, 1000)
      } else {
        // 修改的是这些则更新分组头部信息
        if (
          ['EXECUTOR'].includes(operate_properties_code) ||
          (other_params
            ? ['is_realize', 'start_time', 'due_time'].includes(
                other_params.name
              )
            : false)
        ) {
          dispatch({
            type: `gantt/updateListGroup`,
            payload: {
              datas: [{ ...new_drawContent, id: card_id }]
            }
          })
          return
        }

        const { list_group = [], current_list_group_id } = this.props
        const list_group_new = [...list_group]
        const group_index = list_group_new.findIndex(
          item => item.lane_id == current_list_group_id
        )
        const group_index_cards_index = list_group_new[
          group_index
        ].lane_data.cards.findIndex(item => item.id == card_id)
        const current_item = {
          ...list_group_new[group_index].lane_data.cards[
            group_index_cards_index
          ]
        }

        const { start_time, due_time } = new_drawContent
        if (!!!start_time && !!!due_time) {
          list_group_new[group_index].lane_data.card_no_times.push({
            ...list_group_new[group_index].lane_data.cards[
              group_index_cards_index
            ],
            ...new_drawContent
          })
          list_group_new[group_index].lane_data.cards.splice(
            group_index_cards_index,
            1
          ) //[group_index_card_no_times_index] = { ...list_group_new[group_index].lane_data.card_no_times[group_index_cards_index], ...new_drawContent }
          this.setTaskDetailModalVisibile('no_schedule')
        } else {
          list_group_new[group_index].lane_data.cards[
            group_index_cards_index
          ] = {
            ...list_group_new[group_index].lane_data.cards[
              group_index_cards_index
            ],
            ...new_drawContent
          }
          list_group_new[group_index].lane_data.cards[group_index_cards_index][
            'name'
          ] =
            list_group_new[group_index].lane_data.cards[
              group_index_cards_index
            ]['card_name']
        }

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
            payload: {}
          })
        }
      }
      return
    }
  }

  // 修改任务详情中里程碑的回调
  handleChangeMilestone = ({ milestone = {}, card_id }) => {
    const { dispatch, group_view_type, outline_tree } = this.props
    let outline_tree_ = JSON.parse(JSON.stringify(outline_tree))
    if (!ganttIsOutlineView({ group_view_type })) {
      dispatch({
        type: 'gantt/getGttMilestoneList',
        payload: {}
      })
      return
    }
    const { id: milestone_id } = milestone
    //大纲视图下，任务详情改变里程碑，要将任务位置改变
    const current_node = OutlineTree.getTreeNodeValue(outline_tree_, card_id)
    const from_parent_id = current_node.parent_id
    const parent_from_node = OutlineTree.getTreeNodeValue(
      outline_tree_,
      from_parent_id
    )
    const parent_to_node = OutlineTree.getTreeNodeValue(
      outline_tree_,
      milestone_id
    )
    if (parent_from_node) {
      //删除该条
      parent_from_node.children = parent_from_node.children.filter(
        item => item.id != card_id
      )
    } else {
      outline_tree_ = outline_tree_.filter(item => item.id != card_id)
    }
    if (!milestone_id) {
      outline_tree_.push({
        ...current_node,
        parent_id: '',
        parent_milestone_id: ''
      })
    } else {
      if (parent_to_node) {
        //将该条移动到指定里程碑之下
        parent_to_node.children.push(current_node)
      }
    }
    dispatch({
      type: 'gantt/handleOutLineTreeData',
      payload: {
        data: outline_tree_
      }
    })
  }

  // 删除某一条任务
  handleDeleteCard = ({ card_id }) => {
    const {
      gantt_board_id,
      group_view_type,
      show_board_fold,
      gantt_view_mode
    } = this.props
    if (ganttIsOutlineView({ group_view_type })) {
      this.deleteOutLineTreeNode(card_id)
      return
    }
    const { dispatch } = this.props
    const { list_group = [], current_list_group_id } = this.props
    const list_group_new = [...list_group]
    let belong_group_name = ''
    if (this.card_time_type == 'no_schedule') {
      belong_group_name = 'card_no_times'
    } else {
      belong_group_name = 'cards'
      if (
        ganttIsFold({
          gantt_board_id,
          group_view_type,
          show_board_fold,
          gantt_view_mode
        })
      ) {
        //统计的时候不知道怎么更新只好调接口
        dispatch({
          type: 'gantt/getGanttData',
          payload: {}
        })
        return
      }
    }
    const group_index = list_group_new.findIndex(
      item => item.lane_id == current_list_group_id
    )
    const group_index_cards_index = list_group_new[group_index].lane_data[
      belong_group_name
    ].findIndex(item => item.id == card_id)
    list_group_new[group_index].lane_data[belong_group_name].splice(
      group_index_cards_index,
      1
    )
    dispatch({
      type: 'gantt/handleListGroup',
      payload: {
        data: list_group_new
      }
    })
    setTimeout(async () => {
      const list_group_ = await dispatch({
        type: 'gantt/getGanttGroupElseInfo',
        payload: {
          list_id: current_list_group_id
        }
      })
      dispatch({
        type: 'gantt/handleListGroup',
        payload: {
          data: list_group_
        }
      })
    }, 2000)
  }

  // 大纲视图的修改
  changeOutLineTreeNodeProto = (id, data = {}) => {
    let { dispatch, outline_tree } = this.props
    let outline_tree_ = JSON.parse(JSON.stringify(outline_tree))
    let nodeValue = OutlineTree.getTreeNodeValue(outline_tree_, id)
    const mapSetProto = data => {
      Object.keys(data).map(item => {
        nodeValue[item] = data[item]
      })
      // 为了避免删除开始时间后，关闭弹窗再删除截至时间，大纲树结构item的time覆盖问题
      if (!data.start_time) nodeValue['start_time'] = ''
      if (!data.due_time) nodeValue['due_time'] = ''
    }
    if (nodeValue) {
      mapSetProto(data)
      dispatch({
        type: 'gantt/handleOutLineTreeData',
        payload: {
          data: outline_tree_
        }
      })
    } else {
      console.error('OutlineTree.getTreeNodeValue:未查询到节点')
    }
  }
  // 大纲视图删除某个节点（如果是删除任务则删除挂载的全部节点， 如果是删除里程碑， 则释放任务到无归属区域）
  deleteOutLineTreeNode = (id, add_id, change_node_data) => {
    let { dispatch, outline_tree } = this.props
    let node = {}
    if (!!id) {
      //删除实际节点
      node = OutlineTree.getTreeNodeValue(outline_tree, id)
      if (node) {
        const { tree_type, children = [] } = node
        outline_tree = OutlineTree.filterTreeNode(outline_tree, id) //删除节点
        if (tree_type == '1') {
          //删除掉里程碑，将里面所有叶子节点的任务提到最外面，删除掉叶子里程碑
          // 将数据平铺
          let arr = []
          const recusion = obj => {
            //将树递归平铺成一级
            if (obj.tree_type != '1' && !obj.parent_card_id) {
              //非里程碑，非子任务的节点添加进去
              arr.push(obj)
            }
            if (obj.children && obj.children.length) {
              for (let val of obj.children) {
                recusion(val)
              }
            }
          }
          for (let val of children) {
            recusion(val)
          }
          outline_tree = [].concat(outline_tree, arr)
        } else if (tree_type == '2') {
          //删除任务
        }
      }
      // outline_tree = OutlineTree.filterTreeNode(outline_tree, id); //删除节点
    }
    if (!!add_id) {
      //删除添加占位节点
      outline_tree = OutlineTree.filterTreeNodeByName(
        outline_tree,
        'add_id',
        add_id
      )
    }
    dispatch({
      type: 'gantt/handleOutLineTreeData',
      payload: {
        data: outline_tree
      }
    })
    // 删除之后会返回相关依赖的变动
    if (Object.prototype.toString.call(change_node_data) == '[object Array]') {
      dispatch({
        type: 'gantt/updateOutLineTree',
        payload: {
          datas: change_node_data
        }
      })
    }
  }
  // 大纲视图插入某个节点
  insertOutLineTreeNode = ({ res, params }) => {
    let { dispatch, outline_tree } = this.props
    const { milestone_id, parent_id } = params
    let nodeValue = OutlineTree.getTreeNodeValue(
      outline_tree,
      milestone_id || parent_id
    )

    let addNodeValue = {
      // id: res.id,
      tree_type: '2',
      name: params.name,
      is_expand: true,
      children: [],
      ...res
    }

    let children = nodeValue.children || []
    if (children.length > 0) {
      const index = children.findIndex(item => item.tree_type == '0')
      children.splice(index, 0, addNodeValue)
    } else {
      children.push(addNodeValue)
    }
    nodeValue.children = children
    dispatch({
      type: 'gantt/handleOutLineTreeData',
      payload: {
        data: outline_tree
      }
    })
  }
  // 子任务增删改
  handleChildTaskChange = ({
    action,
    parent_card_id,
    card_id,
    data,
    rely_card_datas
  }) => {
    const { group_view_type, dispatch } = this.props
    if (!ganttIsOutlineView({ group_view_type })) {
      //修改相关任务,子任务的修改会影响父任务
      if (Object.prototype.toString.call(rely_card_datas) == '[object Array]') {
        setTimeout(() => {
          dispatch({
            type: 'gantt/updateListGroup',
            payload: {
              datas: rely_card_datas
            }
          })
        }, 1000)
      }
      // return
    } else {
      if (action == 'delete') {
        this.deleteOutLineTreeNode(card_id)
      } else if (action == 'add') {
        const params = {
          parent_id: parent_card_id,
          name: data.card_name
        }
        const res = {
          id: data.card_id,
          ...data
        }
        this.insertOutLineTreeNode({ res, params })
      } else if (action == 'update') {
        if (data.card_name) {
          data.name = data.card_name
        }
        setTimeout(() => {
          this.changeOutLineTreeNodeProto(card_id, data)
        }, 500)
      } else {
      }
      //修改相关任务
      if (Object.prototype.toString.call(rely_card_datas) == '[object Array]') {
        setTimeout(() => {
          dispatch({
            type: 'gantt/updateOutLineTree',
            payload: {
              datas: rely_card_datas
            }
          })
        }, 1000)
      }
    }
  }
  // 在相关中上传文件（子任务，父任务）
  handleRelyUploading = ({ folder_id }) => {
    const { dispatch } = this.props
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        uploading_folder_id: folder_id
      }
    })
  }
  render() {
    const { addTaskModalVisible } = this.state
    const { outline_tree_round } = this.props
    // if (outline_tree_round.length) {
    //   console.log(
    //     'ssssououtline_tree_round1',
    //     outline_tree_round[1].editing,
    //     outline_tree_round[1].start_time
    //   )
    //   // console.log('ssssououtline_tree_round2', outline_tree_round[3].editing)
    // }

    const {
      about_apps_boards = [],
      gantt_board_id,
      group_view_type,
      current_list_group_id,
      about_group_boards = [],
      about_user_boards = [],
      drawerVisible,
      gantt_board_list_id
    } = this.props

    return (
      <div>
        <GanttFace
          changeOutLineTreeNodeProto={this.changeOutLineTreeNodeProto}
          deleteOutLineTreeNode={this.deleteOutLineTreeNode}
          setTaskDetailModalVisibile={this.setTaskDetailModalVisibile}
          addTaskModalVisibleChange={this.addTaskModalVisibleChange}
          gantt_board_id={gantt_board_id}
          gantt_card_height={this.props.gantt_card_height || 600} //引用组件的地方传递进来的甘特图高度
          is_need_calculate_left_dx={this.props.is_need_calculate_left_dx}
          insertTaskToListGroup={this.insertTaskToListGroup}
          task_detail_props={{
            task_detail_modal_visible: drawerVisible,
            setTaskDetailModalVisible: this.setDrawerVisibleClose, //关闭任务弹窗回调
            handleTaskDetailChange: this.handleChangeCard,
            handleDeleteCard: this.handleDeleteCard,
            handleChildTaskChange: this.handleChildTaskChange,
            handleRelyUploading: this.handleRelyUploading
          }}
        />
        {/* <TaskDetailModal
          task_detail_modal_visible={drawerVisible}
          setTaskDetailModalVisible={this.setDrawerVisibleClose} //关闭任务弹窗回调
          handleTaskDetailChange={this.handleChangeCard}
          handleDeleteCard={this.handleDeleteCard}
          handleChildTaskChange={this.handleChildTaskChange}
        /> */}

        {addTaskModalVisible && (
          <AddTaskModal
            board_card_group_id={
              gantt_board_id == '0'
                ? ''
                : group_view_type == '5'
                ? gantt_board_list_id
                : current_list_group_id
            }
            handleGetNewTaskParams={this.handleGetNewTaskParams}
            current_operate_board_id={
              gantt_board_id == '0' ? current_list_group_id : gantt_board_id
            }
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
      outline_tree,
      outline_tree_round,
      panel_outline_create_card_params = {},
      gantt_board_list_id,
      gantt_view_mode,
      belong_group_row
    }
  },
  technological: {
    datas: { page_load_type }
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
    page_load_type,
    outline_tree,
    panel_outline_create_card_params,
    outline_tree_round,
    gantt_board_list_id,
    gantt_view_mode,
    belong_group_row
  }
}

Gantt.defaultProps = {
  gantt_card_height: 600, //甘特图卡片默认高度
  is_need_calculate_left_dx: false //是否需要计算甘特图左边距
}

export default connect(mapStateToProps)(Gantt)
