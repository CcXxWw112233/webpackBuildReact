import { getModelSelectDatasState, getModelSelectState } from '../../utils'
import { getOrgIdByBoardId } from '../../../utils/businessFunction'
import { arrayNonRepeatfy } from '../../../utils/util'

// 该model是圈子推送已读未读的内容
const model_milestoneDetail = name => `milestoneDetail/${name}`
const model_gantt = name => `gantt/${name}`
const model_publicTaskDetailModal = name => `publicTaskDetailModal/${name}`
const getAfterNameId = coperateName => {
  //获取跟在名字后面的id
  return coperateName.substring(coperateName.indexOf('/') + 1)
}

let dispathes = null
export default {
  namespace: 'simpleModeCooperate',
  subscriptions: {
    setup({ dispatch, history }) {
      dispathes = dispatch
    }
  },
  state: {},
  effects: {
    *handleSimpleModeCooperate({ payload }, { select, call, put }) {
      //im的某一条消息设置已读
      const { res } = payload
      const { data } = res
      let coperate = data[0] //协作
      let news = data[1] || {} //消息
      //获取消息协作类型
      const coperateName = coperate.e
      const coperateType = coperateName.substring(0, coperateName.indexOf('/'))
      const coperateData = JSON.parse(coperate.d)

      yield put({
        type: 'handleGanttTask',
        payload: {
          coperateName,
          coperateType,
          coperateData
        }
      })
      yield put({
        type: 'handleGanttMilestone',
        payload: {
          coperateName,
          coperateType,
          coperateData
        }
      })
    },

    // 处理甘特图任务
    *handleGanttTask({ payload }, { select, call, put }) {
      const { coperateName, coperateType, coperateData } = payload

      const id_arr_ = getAfterNameId(coperateName).split('/') //name/id1/id2/...
      const drawContent = yield select(
        getModelSelectState('publicTaskDetailModal', 'drawContent')
      ) //任务详情
      const card_detail_card_id = yield select(
        getModelSelectState('publicTaskDetailModal', 'card_id')
      ) //任务弹窗的id
      const gantt_list_group = yield select(
        getModelSelectDatasState('gantt', 'list_group')
      ) //甘特图任务数据
      const gantt_board_id = yield select(
        getModelSelectDatasState('gantt', 'gantt_board_id')
      ) //甘特图项目id

      let cObj = { ...coperateData }
      let gantt_list_group_ = [...gantt_list_group]
      let drawContent_ = { ...drawContent }
      let belong_board_id_ = id_arr_[0] //推送过来所属项目id
      let belong_list_id_ = id_arr_[1] //所属分组id
      let belong_card_id_ = id_arr_[2] //所属任务id，针对子任务操作
      let curr_card_id = '' //对象的任务id

      switch (coperateType) {
        case 'change:cards':
          belong_board_id_ = id_arr_[0]
          belong_list_id_ = id_arr_[1]
          belong_card_id_ = id_arr_[2] //如果有则是添加子任务
          const is_level_one_task = !belong_card_id_ //(一级任务
          cObj = {
            ...cObj,
            name: coperateData['card_name'],
            id: coperateData['card_id'],
            board_id: belong_board_id_
          }
          if (is_level_one_task) {
            //新增父任务(一级任务)
            gantt_list_group_ = gantt_list_group_.map(item => {
              const new_item = { ...item }
              if (
                new_item.lane_id ==
                  (gantt_board_id == '0'
                    ? belong_board_id_
                    : belong_list_id_) ||
                (gantt_board_id != '0' &&
                  new_item.lane_id == '0' &&
                  !belong_list_id_) //分组情况下，默认分组处理，如果没有list_id_,则放到这里
              ) {
                //匹配上项目或者分组id
                if (coperateData.start_time || coperateData.due_time) {
                  new_item.lane_data.cards.push(cObj)
                } else {
                  new_item.lane_data.card_no_times.push(cObj)
                }
              }
              return new_item
            })
          } else {
            //新增子任务
            // if (selectCard_id == belong_card_id_) { //当前查看的card_id是父类任务id
            //     selectDrawContent['child_data'].push(coperateData['child_data'][0])
            // }
          }
          dispathes({
            type: model_gantt('handleListGroup'),
            payload: {
              data: gantt_list_group_
            }
          })
          break
        case 'delete:cards':
          belong_board_id_ = id_arr_[0]
          belong_list_id_ = id_arr_[1] == 'null' ? '0' : id_arr_[1]
          belong_card_id_ = id_arr_[2] //删除子任务
          if (!!belong_card_id_) {
            return
          }
          gantt_list_group_ = gantt_list_group_.map(item => {
            const new_item = { ...item }
            item.lane_data.card_no_times = item.lane_data.card_no_times.filter(
              item => item.id != coperateData.card_id
            )
            item.lane_data.cards = item.lane_data.cards.filter(
              item => item.id != coperateData.card_id
            )
            return new_item
          })
          dispathes({
            type: model_gantt('handleListGroup'),
            payload: {
              data: gantt_list_group_
            }
          })
          break
        case 'change:card':
          curr_card_id = id_arr_[0]
          if (curr_card_id == card_detail_card_id) {
            //当前推送的id和当前查看任务id一样
            dispathes({
              type: model_publicTaskDetailModal('updateDatas'),
              payload: {
                drawContent: { ...drawContent, ...coperateData }
              }
            })
          }
          gantt_list_group_ = gantt_list_group_.map(item => {
            const new_item = { ...item }
            const index_1 = item.lane_data.card_no_times.findIndex(
              item => item.id == curr_card_id
            )
            const index_2 = item.lane_data.cards.findIndex(
              item => item.id == curr_card_id
            )
            if (index_1 != -1) {
              if (coperateData.card_name) {
                cObj.name = coperateData.card_name
              }
              item.lane_data.card_no_times[index_1] = {
                ...item.lane_data.card_no_times[index_1],
                ...cObj
              }
            }
            if (index_2 != -1) {
              if (coperateData.card_name) {
                cObj.name = coperateData.card_name
              }
              item.lane_data.cards[index_2] = {
                ...item.lane_data.cards[index_2],
                ...cObj
              }
            }
            return new_item
          })
          dispathes({
            type: model_gantt('handleListGroup'),
            payload: {
              data: gantt_list_group_
            }
          })
          break
        case 'change:card:list':
          belong_board_id_ = coperateData.board_id
          if (gantt_board_id != '0' && gantt_board_id == belong_board_id_) {
            dispathes({
              type: model_gantt('getGanttData'),
              payload: {
                not_set_loading: true
              }
            })
          }
          break
        default:
          break
      }
    },
    // 处理甘特图里程碑
    *handleGanttMilestone({ payload }, { select, call, put }) {
      const { coperateName, coperateType, coperateData } = payload
      const currentSelectedWorkbenchBox = yield select(
        getModelSelectState('simplemode', 'currentSelectedWorkbenchBox')
      ) || {}
      const workbenchBoxcode = currentSelectedWorkbenchBox.code
      const gantt_board_id = yield select(
        getModelSelectDatasState('gantt', 'gantt_board_id')
      ) //甘特图项目id
      const workbench_show_gantt_card = yield select(
        getModelSelectDatasState('workbench', 'workbench_show_gantt_card')
      )
      const id_arr_ = getAfterNameId(coperateName).split('/') //name/id1/id2/...
      let belong_board_id_ = id_arr_[0] //推送过来所属项目id

      switch (coperateType) {
        case 'add:milestone':
          belong_board_id_ = getAfterNameId(coperateName)
          //如果是在甘特图模式下查看该项目
          if (
            'board:plans' == workbenchBoxcode ||
            workbench_show_gantt_card == '1'
          ) {
            if (gantt_board_id == '0' || gantt_board_id == belong_board_id_) {
              dispathes({
                type: 'gantt/getGttMilestoneList',
                payload: {}
              })
            }
          }
          break
        case 'delete:milestone':
          belong_board_id_ = id_arr_[0]
          //如果是在甘特图模式下查看该项目
          if (
            'board:plans' == workbenchBoxcode ||
            workbench_show_gantt_card == '1'
          ) {
            if (gantt_board_id == '0' || gantt_board_id == belong_board_id_) {
              dispathes({
                type: 'gantt/getGttMilestoneList',
                payload: {}
              })
            }
          }
          break
        //修改里程碑
        case 'change:milestone':
          //当前的里程碑id和返回的里程碑id对应上
          let milestone_id = yield select(
            getModelSelectState('milestoneDetail', 'milestone_id')
          )
          let milestone_detail = yield select(
            getModelSelectState('milestoneDetail', 'milestone_detail')
          )
          let cope_milestone_id = getAfterNameId(coperateName)
          //更新里程碑详情
          if (milestone_id == cope_milestone_id) {
            dispathes({
              type: 'milestoneDetail/updateDatas',
              payload: {
                milestone_detail: { ...milestone_detail, ...coperateData }
              }
            })
            // debugger
          }
          //如果是项目id匹配上了,并且在查看甘特图的情况下，则更新甘特图里程碑列表
          belong_board_id_ = coperateData['board_id']
          if (
            'board:plans' == workbenchBoxcode ||
            workbench_show_gantt_card == '1'
          ) {
            if (gantt_board_id == '0' || gantt_board_id == belong_board_id_) {
              dispathes({
                type: 'gantt/getGttMilestoneList',
                payload: {}
              })
            }
          }
          break
        //里程碑关联任务
        case 'add:milestone:content':
          //当前的里程碑id和返回的里程碑id对应上
          milestone_id = yield select(
            getModelSelectState('milestoneDetail', 'milestone_id')
          )
          milestone_detail = yield select(
            getModelSelectState('milestoneDetail', 'milestone_detail')
          )
          cope_milestone_id = getAfterNameId(coperateName)
          //更新里程碑详情
          if (milestone_id == cope_milestone_id) {
            const contents = coperateData['content']
            const new_milestone_detail = { ...milestone_detail }
            if (new_milestone_detail['content_list']) {
              new_milestone_detail['content_list'].push(contents)
            } else {
              new_milestone_detail['content_list'] = [contents]
            }
            dispathes({
              type: 'milestoneDetail/updateDatas',
              payload: {
                milestone_detail: new_milestone_detail
              }
            })
            // debugger
          }
          break
        //取消关联里程碑
        case 'remove:milestone:content':
          //当前的里程碑id和返回的里程碑id对应上
          milestone_id = yield select(
            getModelSelectState('milestoneDetail', 'milestone_id')
          )
          milestone_detail = yield select(
            getModelSelectState('milestoneDetail', 'milestone_detail')
          )
          cope_milestone_id = getAfterNameId(coperateName)
          let milestone_rela_id = coperateData['rela_id']
          let new_milestone_detail = { ...milestone_detail }
          //更新里程碑详情
          if (milestone_id == cope_milestone_id) {
            let content_list = new_milestone_detail['content_list']
            if (typeof content_list != 'object') {
              //array
              return
            }
            //如果删除的是某一条id则遍历 数组将之删除
            for (let i = 0; i < content_list.length; i++) {
              if (milestone_rela_id == content_list[i]['id']) {
                new_milestone_detail['content_list'].splice(i, 1)
              }
            }
            dispathes({
              type: 'milestoneDetail/updateDatas',
              payload: {
                milestone_detail: new_milestone_detail
              }
            })
          }
          break
        //关联里程碑的任务更新信息后
        case 'change:milestone:content:update':
          //当前的里程碑id和返回的里程碑id对应上
          milestone_id = yield select(
            getModelSelectState('milestoneDetail', 'milestone_id')
          )
          milestone_detail = yield select(
            getModelSelectState('milestoneDetail', 'milestone_detail')
          )
          cope_milestone_id = getAfterNameId(coperateName)
          if (milestone_id == cope_milestone_id) {
            new_milestone_detail = { ...milestone_detail }
            const content_list_ = new_milestone_detail['content_list'] || []
            const { rela_id, rela_name } = coperateData //返回的关联任务的id
            const new_content_list_ = content_list_.map(item => {
              const { id } = item
              let new_item = { ...item }
              if (id == rela_id) {
                new_item = {
                  ...item,
                  ...coperateData,
                  name: rela_name,
                  id: rela_id
                }
              }
              return new_item
            })
            new_milestone_detail['content_list'] = new_content_list_
            dispathes({
              type: 'milestoneDetail/updateDatas',
              payload: {
                milestone_detail: new_milestone_detail
              }
            })
          }
          break
        default:
          break
      }
    },
    // 处理首页代办(任务|流程)
    *handleCooperateToDoListAgent({ payload }, { select, call, put }) {
      const { res } = payload
      const { data } = res
      let coperate = data[0] //协作
      let news = data[1] || {} //消息
      //获取消息协作类型
      const coperateName = coperate.e
      const coperateType = coperateName.substring(0, coperateName.indexOf('/'))
      const coperateData = JSON.parse(coperate.d)
      // console.log(coperateData, coperateName, 'coperateData')
      // 代办任务列表
      let board_card_todo_list = yield select(
        getModelSelectState('simplemode', 'board_card_todo_list')
      )
      let new_board_card_todo_list_ = [...board_card_todo_list]
      // 代办流程列表
      let board_flow_todo_list = yield select(
        getModelSelectState('simplemode', 'board_flow_todo_list')
      )
      let new_board_flow_todo_list_ = [...board_flow_todo_list]
      // 项目列表
      let projectList = yield select(
        getModelSelectDatasState('workbench', 'projectList')
      )
      let new_projectList = [...projectList]
      // 用户信息
      const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
      const user_id = userInfo['id']
      // 当前用户执行人
      let coop_executors = coperateData.executors || [] // 获取当前任务的执行人
      let current_user =
        coop_executors.find(user => user.user_id == user_id) || {}

      const id_arr_ = getAfterNameId(coperateName).split('/') //name/id1/id2/...
      let belong_board_id_ = id_arr_[0] //推送过来所属项目id
      let curr_card_id = '' //对象的任务id
      let curr_flow_id = '' // 对象的流程实例id
      let curr_org_id = '' // 对象的组织ID
      let obj = {}
      switch (coperateType) {
        case 'add:board': // 新建项目
          current_user =
            (coperateData.data &&
              coperateData.data.length &&
              coperateData.data.find(item => item.user_id == user_id)) ||
            {}
          // 1.判断该项目中是否存在该成员, 如果存在, 那么就添加一条项目, 并且需要去重
          if (!(current_user && Object.keys(current_user).length)) return false
          new_projectList.unshift(coperateData)
          dispathes({
            type: 'workbench/updateDatas',
            payload: {
              projectList: arrayNonRepeatfy(new_projectList, 'board_id')
            }
          })
          break
        case 'change:board': // 修改项目
          if (
            coperateData.is_deleted == '1' ||
            coperateData.is_archived == '1'
          ) {
            // 表示是归档或者删除项目
            // 删除项目之后, 对应的代办任务|流程也需要删除
            new_projectList = new_projectList.filter(
              item => item.board_id != coperateData.board_id
            )
            new_board_card_todo_list_ = new_board_card_todo_list_.filter(
              item => item.board_id != coperateData.board_id
            )
            new_board_flow_todo_list_ = new_board_flow_todo_list_.filter(
              item => item.board_id != coperateData.board_id
            )
            dispathes({
              type: 'workbench/updateDatas',
              payload: {
                projectList: new_projectList
              }
            })
            dispathes({
              type: 'simplemode/updateDatas',
              payload: {
                board_card_todo_list: new_board_card_todo_list_,
                board_flow_todo_list: new_board_flow_todo_list_
              }
            })
          } else {
            // 表示修改项目的一些信息
            current_user =
              (coperateData.data &&
                coperateData.data.length &&
                coperateData.data.find(item => item.user_id == user_id)) ||
              {}
            if (!(current_user && Object.keys(current_user).length)) {
              // 表示该成员不在项目中了
              new_projectList = new_projectList.filter(
                item => item.board_id != coperateData.board_id
              )
              dispathes({
                type: 'workbench/updateDatas',
                payload: {
                  projectList: arrayNonRepeatfy(new_projectList, 'board_id')
                }
              })
              return
            } else {
              let whetherIsExitence = new_projectList.find(
                item => item.board_id == coperateData.board_id
              )
              if (whetherIsExitence && Object.keys(whetherIsExitence).length) {
                // 表示是已存在的项目, 那么就是更新
                new_projectList = new_projectList.map(item => {
                  if (item.board_id == coperateData.board_id) {
                    let new_item = { ...item, ...coperateData }
                    return new_item
                  } else {
                    return item
                  }
                })
                dispathes({
                  type: 'workbench/updateDatas',
                  payload: {
                    projectList: arrayNonRepeatfy(new_projectList, 'board_id')
                  }
                })
              } else {
                // 否则就是添加项目
                new_projectList.unshift(coperateData)
                dispathes({
                  type: 'workbench/updateDatas',
                  payload: {
                    projectList: arrayNonRepeatfy(new_projectList, 'board_id')
                  }
                })
              }
            }
          }
          break
        case 'change:board:role': // 修改项目角色
          current_user =
            (coperateData.data &&
              coperateData.data.length &&
              coperateData.data.find(item => item.user_id == user_id)) ||
            {} // 判断当前这个人在不在成员列表中
          if (!(current_user && Object.keys(current_user).length)) return false
          // 如果在: 根据该成员的角色来判断项目列表中是否是当前user负责
          const role_id = current_user.role_id || ''
          if (role_id == '3') {
            // 表示是项目负责人
            new_projectList = new_projectList.map(item => {
              if (item.board_id == coperateData.board_id) {
                // 找到这个
                let new_item = { ...item }
                new_item = { ...item, is_principal: '1' }
                return new_item
              } else {
                return item
              }
            })
            dispathes({
              type: 'workbench/updateDatas',
              payload: {
                projectList: new_projectList
              }
            })
          } else {
            new_projectList = new_projectList.map(item => {
              if (item.board_id == coperateData.board_id) {
                // 找到这个
                let new_item = { ...item }
                new_item = { ...item, is_principal: '0' }
                return new_item
              } else {
                return item
              }
            })
            dispathes({
              type: 'workbench/updateDatas',
              payload: {
                projectList: new_projectList
              }
            })
          }
          break
        case 'change:cards': // 添加任务
          // 1. 判断是否是该执行人的代办
          if (!(current_user && Object.keys(current_user).length)) return
          // 2. 是该执行人的代办任务, 那么就ping对应结构, 更新数据
          belong_board_id_ = id_arr_[0]
          curr_org_id = getOrgIdByBoardId(belong_board_id_)
          // 得到列表中需要的数据结构
          obj = {
            ...coperateData,
            board_id: belong_board_id_,
            org_id: curr_org_id,
            rela_type: '1',
            id: coperateData.card_id,
            name: coperateData.card_name
          }
          new_board_card_todo_list_.push(obj)
          dispathes({
            type: 'simplemode/updateDatas',
            payload: {
              board_card_todo_list: new_board_card_todo_list_
            }
          })
          break
        case 'delete:cards': // 删除任务
          curr_card_id = coperateData.card_id
          if (coperateData.is_deleted == '1') {
            new_board_card_todo_list_ = new_board_card_todo_list_.filter(
              item => item.id != curr_card_id
            )
            dispathes({
              type: 'simplemode/updateDatas',
              payload: {
                board_card_todo_list: new_board_card_todo_list_
              }
            })
          }
          break
        case 'change:card': // 修改任务中相关数据内容 (对于代办来说修改卡片 开始时间 | 截止时间 | 执行人)
          curr_card_id = id_arr_[0]
          if (current_user && Object.keys(current_user).length) {
            if (coperateData.is_realize == '1') {
              // 表示已完成
              new_board_card_todo_list_ = new_board_card_todo_list_.filter(
                item => item.id != curr_card_id
              )
              dispathes({
                type: 'simplemode/updateDatas',
                payload: {
                  board_card_todo_list: arrayNonRepeatfy(
                    new_board_card_todo_list_
                  )
                }
              })
              return
            }
            obj = {
              id: coperateData.card_id,
              name: coperateData.card_name,
              org_id: coperateData.org_id,
              board_id: coperateData.board_id,
              board_name: coperateData.board_name,
              start_time: coperateData.start_time,
              due_time: coperateData.due_time,
              rela_type: '1'
            }
            // 当修改时间会推送多条, 所以应该往前插入保存最新的一条 并且去重
            new_board_card_todo_list_.unshift(obj)
            dispathes({
              type: 'simplemode/updateDatas',
              payload: {
                board_card_todo_list: arrayNonRepeatfy(
                  new_board_card_todo_list_
                )
              }
            })
          } else {
            new_board_card_todo_list_ = new_board_card_todo_list_.filter(
              item => item.id != curr_card_id
            )
            dispathes({
              type: 'simplemode/updateDatas',
              payload: {
                board_card_todo_list: arrayNonRepeatfy(
                  new_board_card_todo_list_
                )
              }
            })
          }
          break
        case 'add:flow:instance': // 添加流程实例
          break
        case 'change:flow:instance': // 修改流程实例
          curr_flow_id = id_arr_[0] // 表示实例ID
          if (coperateData.status != '1') {
            // 如果状态不是进行中, 则过滤掉
            new_board_flow_todo_list_ = new_board_flow_todo_list_.filter(
              item => item.flow_instance_id != curr_flow_id
            )
            dispathes({
              type: 'simplemode/updateDatas',
              payload: {
                board_flow_todo_list: arrayNonRepeatfy(
                  new_board_flow_todo_list_,
                  'flow_instance_id'
                )
              }
            })
          } else {
            let assigneesList = coperateData.assignees
              ? coperateData.assignees.split(',')
              : []
            current_user = assigneesList.find(item => item == user_id) || {}
            if (!(current_user && Object.keys(current_user).length))
              return false
            // 1.需要判断代办列表中是否能够找到这一条, 如果能找到那么替换, 不能则是添加
            let whetherIsExitence =
              new_board_flow_todo_list_.find(item => item.id == curr_flow_id) ||
              {}
            obj = {
              ...coperateData,
              id: coperateData.flow_instance_id,
              name: coperateData.flow_instance_name,
              org_id: getOrgIdByBoardId(coperateData.board_id),
              total_node_name: coperateData.name,
              runtime_type: coperateData.runtime_type,
              rela_type: '3'
            }
            if (whetherIsExitence && Object.keys(whetherIsExitence).length) {
              // 表示能够找到
              let position_index = new_board_flow_todo_list_.findIndex(
                item => item.id == curr_flow_id
              )
              new_board_flow_todo_list_[position_index] = { ...obj }
            } else {
              // 表示找不到这一条
              new_board_flow_todo_list_.unshift(obj)
            }
            dispathes({
              type: 'simplemode/updateDatas',
              payload: {
                board_flow_todo_list: arrayNonRepeatfy(
                  new_board_flow_todo_list_,
                  'id'
                )
              }
            })
          }

          break
        default:
          break
      }
    }
  },

  reducers: {
    updateDatas(state, action) {
      return {
        ...state,
        ...action.payload
      }
    }
  }
}
