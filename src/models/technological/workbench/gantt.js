import { getGanttBoardsFiles, getGanttData, getGttMilestoneList, getContentFiterBoardTree, getContentFiterUserTree, getHoliday } from '../../../services/technological/gantt'
import { getProjectList, getProjectUserList } from '../../../services/technological/workbench'
import { isApiResponseOk } from '../../../utils/handleResponseData'
import { message } from 'antd'
import { MESSAGE_DURATION_TIME } from "../../../globalset/js/constant";
import { routerRedux } from "dva/router";
import queryString from 'query-string';
import { isSamDay } from "../../../routes/Technological/components/Gantt/getDate";
import {
  workbench_projectTabCurrentSelectedProject,
  workbench_start_date,
  workbench_end_date,
  workbench_list_group,
  workbench_group_rows,
  workbench_ceiHeight,
  workbench_ceilWidth,
  workbench_date_arr_one_level
} from './selects'
import { createMilestone } from "../../../services/technological/prjectDetail";
import { getGlobalData } from '../../../utils/businessFunction';
import { task_item_height, ceil_height } from '../../../routes/Technological/components/Gantt/constants';
import { getModelSelectDatasState } from '../../utils'
import { getProjectGoupList } from '../../../services/technological/task';
import { max } from 'moment';

export default {
  namespace: 'gantt',
  state: {
    datas: {
      gold_date_arr: [], //所需要的日期数据
      date_arr_one_level: [], //所有日期数据扁平成一级数组
      start_date: {}, //日期最开始的那一天
      end_date: {}, //日期最后那一天
      create_start_time: '', //创建任务开始时间
      create_end_time: '', //创建任务截至时间
      list_group: [], //分组列表
      ceilWidth: 44, //单元格的宽度
      ceiHeight: ceil_height, //单元格高度 40 + 12的外边距
      date_total: 0, //总天数
      group_rows: [], //每一个分组默认行数 [7, 7, 7]
      group_list_area: [], //分组高度区域 [组一行数 * ceiHeight，组二行数 * ceiHeight]
      isDragging: false, //甘特图是否在拖拽中
      target_scrollLeft: 0, //总体滚动条向左滑动位置
      target_scrollTop: 0, //总体滚动条偏离顶部滑动位置
      current_list_group_id: '0', //当前选中的分组id
      milestoneMap: [], //里程碑列表

      about_apps_boards: [], //带app的项目列表
      about_group_boards: [], //带分组的项目列表
      about_user_boards: [], //带用户的项目列表

      gantt_board_id: '0', //甘特图查看的项目id
      group_view_type: '1', //分组视图1项目， 2成员
      group_view_filter_boards: [], //内容过滤项目id 列表
      group_view_filter_users: [], //内容过滤成员id 列表
      group_view_boards_tree: [], //内容过滤项目分组树
      group_view_users_tree: [], //内容过滤成员分组树
      holiday_list: [], //日历列表（包含节假日农历）
      get_gantt_data_loading: false, //是否在请求甘特图数据状态
      is_show_board_file_area: '0', //显示文件区域 0默认不显示 1滑入 2滑出
      boards_flies: [], //带根目录文件列表的项目列表
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen((location) => {
        if (location.pathname.indexOf('/technological') != -1) {
          dispatch({
            type: 'updateDatas',
            payload: {
              list_group: [],
              group_rows: [5, 5, 5],
            }
          })
        } else {
        }
      })
    },
  },
  effects: {
    * returnContentFilterFinalParams({ payload }, { select, call, put }) { //返回内容过滤输出成的请求参数 { key: value}
      const group_view_filter_boards = yield select(getModelSelectDatasState('gantt', 'group_view_filter_boards'))
      const group_view_filter_users = yield select(getModelSelectDatasState('gantt', 'group_view_filter_users'))
      const group_view_boards_tree = yield select(getModelSelectDatasState('gantt', 'group_view_boards_tree'))
      const group_view_users_tree = yield select(getModelSelectDatasState('gantt', 'group_view_users_tree'))

      //内容过滤处理
      const setContentFilterParams = () => {
        let query_board_ids = []
        let query_user_ids = []

        //  项目id处理
        for (let val of group_view_filter_boards) {
          if (val.indexOf('board_org_') != -1) { //项目组织id
            const org_board_list = group_view_boards_tree.find(item => item.value == val).children
            const org_board_id_list = org_board_list.map(item => item.value.replace('board_', ''))
            query_board_ids = [].concat(query_board_ids, org_board_id_list)
          } else { //项目id
            const board_id = val.replace('board_', '')
            query_board_ids.push(board_id)
          }
        }

        // 用户id处理
        for (let val of group_view_filter_users) {
          if (val.indexOf('user_org_') != -1) { //用户组织id
            // 遍历得到了分组
            const org_groups = group_view_users_tree.find(item => item.value == val).children //得到组织的用户分组
            const org_groups_users = org_groups.map(item => item.children) //得到一个二维数组，组为一维，用户列表为二维
            const org_users = org_groups_users.reduce(function (a, b) { return a.concat(b) }); //该组织下所有分组用户铺开一维数组
            const org_user_ids = org_users.map(item => item.value.replace('user_', '').split('_')[2])
            query_user_ids = [].concat(query_user_ids, org_user_ids)

          } else if (val.indexOf('user_group_') != -1) { //分组id
            const org_groupr_id_arr = val.replace('user_group_', '').split('_')
            const group_org_id = org_groupr_id_arr[0]
            const group_id = org_groupr_id_arr[1]

            const org_groups = group_view_users_tree.find(item => item.value == `user_org_${group_org_id}`).children //得到组织对应分组列表
            const org_users = org_groups.find(item => item.value == `user_group_${group_org_id}_${group_id}`).children //得到对应分组
            const org_user_ids = org_users.map(item => item.value.replace('user_', '').split('_')[2])
            query_user_ids = [].concat(query_user_ids, org_user_ids)

          } else {//用户id
            // const user_id = val.replace('user_','')
            const user_id = val.replace('user_', '').split('_')[2]
            query_user_ids.push(user_id)
          }
        }
        // 去重
        query_board_ids = Array.from(new Set(query_board_ids))
        query_user_ids = Array.from(new Set(query_user_ids))
        return {
          query_board_ids,
          query_user_ids,
        }
      }
      return {
        ...setContentFilterParams()
      }
    },
    * getGanttData({ payload }, { select, call, put }) {
      const { not_set_loading } = payload //not_set_loading是否需要设置loading状态
      // 参数处理
      const start_date = yield select(workbench_start_date)
      const end_date = yield select(workbench_end_date)
      const group_view_type = yield select(getModelSelectDatasState('gantt', 'group_view_type'))
      const gantt_board_id = yield select(getModelSelectDatasState('gantt', 'gantt_board_id'))

      //内容过滤处理
      const Aa = yield put({
        type: 'returnContentFilterFinalParams',
      })
      const get_content_filter_params = () => new Promise(resolve => {
        resolve(Aa.then())
      })
      // 内容过滤处理end
      const content_filter_params = yield call(get_content_filter_params) || {}
      // console.log('ssssssssss', {
      //   group_view_filter_boards,
      //   group_view_filter_users,
      //   ...setContentFilterParams()
      // })

      const params = {
        start_time: start_date['timestamp'],
        end_time: end_date['timestamp'],
        chart_type: group_view_type,
        ...content_filter_params,
      }
      if (gantt_board_id != '0' && gantt_board_id) {
        params.board_id = gantt_board_id
      }
      yield put({
        type: 'updateDatas',
        payload: {
          get_gantt_data_loading: not_set_loading ? false : true,
        }
      })

      // 查询文件列表
      yield put({
        type: 'getGanttBoardsFiles',
        payload: {
          query_board_ids: content_filter_params.query_board_ids,
          board_id: gantt_board_id == '0' ? '' : gantt_board_id
        }
      })
      yield put({
        type: 'getGttMilestoneList',
        payload: {
        }
      })

      const res = yield call(getGanttData, params)
      yield put({
        type: 'updateDatas',
        payload: {
          get_gantt_data_loading: false,
        }
      })
      // console.log('sssss', {res})
      if (isApiResponseOk(res)) {
        yield put({
          type: 'handleListGroup',
          payload: {
            data: res.data
          }
        })
      } else {

      }
    },
    * handleListGroup({ payload }, { select, call, put }) {
      const { data } = payload
      let list_group = []
      const start_date = yield select(workbench_start_date)
      const end_date = yield select(workbench_end_date)

      const getDigit = (timestamp) => {
        if (!timestamp) {
          return 0
        }
        let new_timestamp = timestamp.toString()
        if (new_timestamp.length == 10) {
          new_timestamp = Number(new_timestamp) * 1000
        } else {
          new_timestamp = Number(new_timestamp)
        }
        return new_timestamp
      }
      for (let val of data) {
        const list_group_item = {
          ...val,
          list_name: val['lane_name'],
          list_id: val['lane_id'],
          list_data: [],
          list_no_time_data: val['lane_data']['card_no_times'] || []
        }
        if (val['lane_data']['cards']) {
          for (let val_1 of val['lane_data']['cards']) {
            const due_time = getDigit(val_1['due_time'])
            const start_time = getDigit(val_1['start_time']) || due_time //如果没有开始时间，那就取截止时间当天
            const create_time = getDigit(val_1['create_time'])
            let time_span = (!due_time || !start_time) ? 1 : (Math.floor((due_time - start_time) / (24 * 3600 * 1000))) + 1 //正常区间内
            if (due_time > end_date.timestamp && start_time > start_date.timestamp) { //右区间
              time_span = (Math.floor((end_date.timestamp - start_time) / (24 * 3600 * 1000))) + 1
            } else if (start_time < start_date.timestamp && due_time < end_date.timestamp) { //左区间
              time_span = (Math.floor((due_time - start_date.timestamp) / (24 * 3600 * 1000))) + 1
            } else if (due_time > end_date.timestamp && start_time < start_date.timestamp) { //超过左右区间
              time_span = (Math.floor((end_date.timestamp - start_date.timestamp) / (24 * 3600 * 1000))) + 1
            }
            // console.log('sssssss', val_1.name, time_span)
            // time_span = time_span > date_arr_one_level.length?  date_arr_one_level.length: time_span
            let list_data_item = {
              ...val_1,
              start_time,
              end_time: due_time,
              create_time,
              time_span,
              is_has_start_time: !!getDigit(val_1['start_time']),
              is_has_end_time: !!getDigit(val_1['due_time'])
            }
            list_group_item.list_data.push(list_data_item)
          }
        }
        list_group.push(list_group_item)
      }
      yield put({
        type: 'updateDatas',
        payload: {
          list_group
        }
      })
      yield put({
        type: 'setListGroup',
        payload: {
        }
      })
    },
    * setListGroup({ payload }, { select, call, put }) {

      //根据所获得的分组数据转换所需要的数据
      // const { datas: { list_group = [], group_rows = [], ceiHeight, ceilWidth, date_arr_one_level = [] } } = this.props.model
      const list_group = yield select(workbench_list_group)
      const group_rows = yield select(workbench_group_rows)
      const ceiHeight = yield select(workbench_ceiHeight)
      const ceilWidth = yield select(workbench_ceilWidth)
      const date_arr_one_level = yield select(workbench_date_arr_one_level)

      const group_list_area = [] //分组高度区域

      //设置分组区域高度, 并为每一个任务新增一条
      for (let i = 0; i < list_group.length; i++) {
        let list_data = list_group[i]['list_data']
        list_data = list_data.sort((a, b) => {
          return a.start_time - b.start_time
        })

        const length = 5 //list_data.length < 5 ? 5 : (list_data.length + 1)
        const group_height = length * ceiHeight
        group_list_area[i] = group_height
        group_rows[i] = length

        //设置纵坐标
        //根据历史分组统计纵坐标累加
        let after_group_height = 0
        for (let k = 0; k < i; k++) {
          after_group_height += group_list_area[k]
        }
        // console.log('ssssssssss', {
        //   i,
        //   after_group_height
        // })
        for (let j = 0; j < list_data.length; j++) { //设置每一个实例的位置
          const item = list_data[j]
          item.width = item.time_span * ceilWidth
          item.height = task_item_height

          //设置横坐标
          if (item['start_time'] < date_arr_one_level[0]['timestamp']) { //如果该任务的起始日期在当前查看面板日期之前，就从最左边开始摆放
            item.left == 0
          } else {
            for (let k = 0; k < date_arr_one_level.length; k++) {
              if (isSamDay(item['start_time'], date_arr_one_level[k]['timestamp'])) { //是同一天
                item.left = k * ceilWidth
                break
              }
            }
          }

          item.top = after_group_height + j * ceiHeight

          // {满足在时间区间外的，定义before_start_time_arr先记录符合项。
          // 该比较项和之前项存在交集，将交集项存入top_arr
          // 筛选before_start_time_arr，如果top_arr中含有top与某一遍历项相等，则过滤。最终高度取剩余的第一项
          let before_start_time_arr = []
          let top_arr = []
          let all_top = []
          for (let k = 0; k < j; k++) {
            all_top.push(list_data[k].top)
            if (item.start_time > list_data[k].end_time) {
              before_start_time_arr.push(list_data[k])
            }
            if (item.start_time <= list_data[k].end_time) {
              top_arr.push(list_data[k])
            }
          }

          before_start_time_arr = before_start_time_arr.filter(item => {
            let flag = true
            for (let val of top_arr) {
              if (item.top == val.top) {
                flag = false
                break
              }
            }
            return flag && item
          })

          all_top = Array.from(new Set(all_top)).sort((a, b) => a - b)
          const all_top_max = Math.max.apply(null, all_top) == -Infinity ? after_group_height : Math.max.apply(null, all_top)

          if (before_start_time_arr[0]) {
            item.top = before_start_time_arr[0].top
          } else {
            if (item.top > all_top_max) {
              item.top = all_top_max + ceiHeight
            }
          }
          list_group[i]['list_data'][j] = item
        }
        const list_height_arr = list_group[i]['list_data'].map(item => item.top)
        const list_group_item_height = Math.max.apply(null, list_height_arr) + 2 * ceiHeight - after_group_height
        group_rows[i] = (list_group_item_height / ceiHeight) < 5 ? 5 : list_group_item_height / ceiHeight
        group_list_area[i] = group_rows[i] * ceiHeight
       
      }

      yield put({
        type: 'updateDatas',
        payload: {
          group_list_area,
          group_rows,
          list_group
        }
      })
    },
    * setListGroup_copy({ payload }, { select, call, put }) {

      //根据所获得的分组数据转换所需要的数据
      // const { datas: { list_group = [], group_rows = [], ceiHeight, ceilWidth, date_arr_one_level = [] } } = this.props.model
      const list_group = yield select(workbench_list_group)
      const group_rows = yield select(workbench_group_rows)
      const ceiHeight = yield select(workbench_ceiHeight)
      const ceilWidth = yield select(workbench_ceilWidth)
      const date_arr_one_level = yield select(workbench_date_arr_one_level)

      const group_list_area = [] //分组高度区域

      //设置分组区域高度, 并为每一个任务新增一条
      for (let i = 0; i < list_group.length; i++) {
        const list_data = list_group[i]['list_data']
        // const length = (list_data.length || 1) + 1
        const length = list_data.length < 5 ? 5 : (list_data.length + 1)
        const group_height = length * ceiHeight
        group_list_area[i] = group_height
        group_rows[i] = length
        for (let j = 0; j < list_data.length; j++) { //设置每一个实例的位置
          const item = list_data[j]
          item.width = item.time_span * ceilWidth
          item.height = task_item_height

          //设置横坐标
          if (item['start_time'] < date_arr_one_level[0]['timestamp']) { //如果该任务的起始日期在当前查看面板日期之前，就从最左边开始摆放
            item.left == 0
          } else {
            for (let k = 0; k < date_arr_one_level.length; k++) {
              if (isSamDay(item['start_time'], date_arr_one_level[k]['timestamp'])) { //是同一天
                item.left = k * ceilWidth
                break
              }
            }
          }

          //设置纵坐标
          //根据历史分组统计纵坐标累加
          let after_group_height = 0
          for (let k = 0; k < i; k++) {
            after_group_height += group_list_area[k]
          }
          item.top = after_group_height + j * ceiHeight

          list_group[i]['list_data'][j] = item
        }
      }

      // console.log('sssssss_list_group', list_group)

      yield put({
        type: 'updateDatas',
        payload: {
          group_list_area,
          group_rows,
          list_group
        }
      })
    },
    * createMilestone({ payload }, { select, call, put }) { //
      const res = yield call(createMilestone, payload)
      if (isApiResponseOk(res)) {
        const { board_id } = payload
        yield put({
          type: 'getGttMilestoneList',
          payload: {
            id: board_id
          }
        })
        message.success(res.message)
      } else {
        message.error(res.message)
      }
    },
    * getGttMilestoneList({ payload }, { select, call, put }) { //

      const Aa = yield put({
        type: 'returnContentFilterFinalParams',
      })
      const get_content_filter_params = () => new Promise(resolve => {
        resolve(Aa.then())
      })
      const content_filter_params = yield call(get_content_filter_params) || {}
      // console.log('ssssssssss', { content_filter_params })

      const { query_board_ids = [] } = content_filter_params
      const gantt_board_id = yield select(getModelSelectDatasState('gantt', 'gantt_board_id'))

      const start_date = yield select(workbench_start_date)
      const end_date = yield select(workbench_end_date)
      const params = {
        start_time: Number(start_date['timestamp']) / 1000,
        end_time: Number(end_date['timestamp']) / 1000,
        _organization_id: localStorage.getItem('OrganizationId'),
        query_board_ids,
      }
      if (gantt_board_id != '0') { //只有在确认项目对应的一个组织id,才能够进行操作
        params.board_id = gantt_board_id
      }

      const res = yield call(getGttMilestoneList, params)
      // debugger
      // console.log('sssssss', { milestoneMap: res.data })
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            milestoneMap: res.data
          }
        })
      } else {
        message.error(res.message)
      }
    },
    * getContentFiterBoardTree({ payload }, { select, call, put }) {
      const res = yield call(getContentFiterBoardTree, {})
      if (isApiResponseOk) {
        const data = res.data || []
        const treeData = data.map(item => {
          const { org_name, org_id, board_list = [] } = item
          let new_item = {
            title: org_name,
            value: `board_org_${org_id}`,
            key: `board_org_${org_id}`,
            children: []
          }
          const children = board_list.map(item_board => {
            const { board_name, board_id } = item_board
            const new_item_board = {
              title: board_name,
              value: `board_${board_id}`,
              key: `board_${board_id}`,
            }
            return new_item_board
          })
          new_item['children'] = children
          return new_item
        })
        yield put({
          type: 'updateDatas',
          payload: {
            group_view_boards_tree: treeData
          }
        })
      }
    },
    * getContentFiterUserTree({ payload }, { select, call, put }) {
      const res = yield call(getContentFiterUserTree, {})
      if (isApiResponseOk) {
        const data = res.data || []
        const treeData = data.map(item => {
          const { org_name, org_id, groups = [] } = item
          let new_item = {
            title: org_name,
            value: `user_org_${org_id}`,
            key: `user_org_${org_id}`,
            children: []
          }
          const children = groups.map(item_group => {
            const { name, id, members = [] } = item_group
            const new_item_group = {
              title: name,
              value: `user_group_${org_id}_${id}`,
              key: `user_group_${org_id}_${id}`,
              children: []
            }
            const members_children = members.map(item_group_member => {
              const { name, id } = item_group_member
              const new_item_group_member = {
                title: name,
                value: `user_${org_id}_${item_group['id']}_${id}`, //`user_${id}`,//`user_${org_id}_${item_group['id']}_${id}`,
                key: `user_${org_id}_${item_group['id']}_${id}`, //`user_${id}`,
              }

              return new_item_group_member
            })
            new_item_group['children'] = members_children
            return new_item_group
          })
          new_item['children'] = children
          return new_item
        })
        yield put({
          type: 'updateDatas',
          payload: {
            group_view_users_tree: treeData
          }
        })
      }
    },
    // 获取日历（农历节假日）
    * getHoliday({ payload }, { select, call, put }) {
      const start_date = yield select(workbench_start_date)
      const end_date = yield select(workbench_end_date)
      const params = {
        start_time: Number(start_date['timestamp']) / 1000,
        end_time: Number(end_date['timestamp']) / 1000,
      }
      const res = yield call(getHoliday, { ...params })
      // console.log('ssssss', res)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            holiday_list: res.data,
          }
        })
      }
    },
    * getAboutAppsBoards({ payload }, { select, call, put }) {
      let res = yield call(getProjectList, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            about_apps_boards: res.data
          }
        })
      } else {

      }
    },
    * getAboutGroupBoards({ payload }, { select, call, put }) {
      let res = yield call(getProjectGoupList, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            about_group_boards: res.data
          }
        })
      } else {

      }
    },
    * getAboutUsersBoards({ payload }, { select, call, put }) {
      let res = yield call(getProjectUserList, payload)
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            about_user_boards: res.data
          }
        })
      } else {

      }
    },

    * getGanttBoardsFiles({ payload }, { select, call, put }) {
      const res = yield call(getGanttBoardsFiles, payload)
      // console.log('sssssssss', { boards_flies: res.data })
      if (isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            boards_flies: res.data
          }
        })
      } else {

      }
    }
  },

  reducers: {
    updateDatas(state, action) {
      return {
        ...state,
        datas: { ...state.datas, ...action.payload },
      }
    }
  },
}
// list_group: [
//   {
//     list_name: '分组一',
//     list_id: '111',
//     list_data: [
//       {
//         start_time: 1552233600000,
//         end_time: 1552838400000,
//         start_time_string: '2019/3/11',
//         end_time_sting: '2019/3/18',
//         time_span: 7,
//         create_time: 1,
//       }, {
//         start_time: 1552233600000,
//         end_time: 1552579200000,
//         start_time_string: '2019/3/11',
//         end_time_sting: '2019/3/15',
//         time_span: 4,
//         create_time: 1,
//       }, {
//         start_time: 1552320000000,
//         end_time: 1552838400000,
//         start_time_string: '2019/3/12',
//         end_time_sting: '2019/3/18',
//         time_span: 7,
//         create_time: 3,
//       }, {
//         start_time: 1552320000000,
//         end_time: 1552579200000,
//         start_time_string: '2019/3/12',
//         end_time_sting: '2019/3/15',
//         time_span: 4,
//         create_time: 1,
//       }, {
//         start_time: 1552924800000,
//         end_time: 1553184000000,
//         start_time_string: '2019/3/19',
//         end_time_sting: '2019/3/22',
//         time_span: 4,
//         create_time: 1,
//       }, {
//         start_time: 1552924800000,
//         end_time: 1553184000000,
//         start_time_string: '2019/3/19',
//         end_time_sting: '2019/3/22',
//         time_span: 4,
//         create_time: 1,
//       }, {
//         start_time: 1552924800000,
//         end_time: 1553184000000,
//         start_time_string: '2019/3/19',
//         end_time_sting: '2019/3/22',
//         time_span: 4,
//         create_time: 1,
//       }
//     ],
//     list_no_time_data: []
//   },
//   {
//     list_name: '分组二',
//     list_id: '222',
//     list_data: [
//       {
//         start_time: 1552233600000,
//         end_time: 1552838400000,
//         start_time_string: '2019/3/11',
//         end_time_sting: '2019/3/18',
//         time_span: 7,
//         create_time: 1,
//       }, {
//         start_time: 1552233600000,
//         end_time: 1552579200000,
//         start_time_string: '2019/3/11',
//         end_time_sting: '2019/3/15',
//         time_span: 4,
//         create_time: 2,
//       }, {
//         start_time: 1552320000000,
//         end_time: 1552838400000,
//         start_time_string: '2019/3/12',
//         end_time_sting: '2019/3/18',
//         time_span: 7,
//         create_time: 3,
//       }, {
//         start_time: 1552320000000,
//         end_time: 1552579200000,
//         start_time_string: '2019/3/12',
//         end_time_sting: '2019/3/15',
//         time_span: 4,
//         create_time: 4,
//       }
//     ],
//     list_no_time_data: []
//   },
//   {
//     list_name: '分组三',
//     list_id: '333',
//     list_data: [
//       {
//         start_time: 1552233600000,
//         end_time: 1552838400000,
//         start_time_string: '2019/3/11',
//         end_time_sting: '2019/3/18',
//         time_span: 7,
//         create_time: 1,
//       }, {
//         start_time: 1552233600000,
//         end_time: 1552579200000,
//         start_time_string: '2019/3/11',
//         end_time_sting: '2019/3/15',
//         time_span: 4,
//         create_time: 2,
//       }, {
//         start_time: 1552320000000,
//         end_time: 1552838400000,
//         start_time_string: '2019/3/12',
//         end_time_sting: '2019/3/18',
//         time_span: 7,
//         create_time: 3,
//       }, {
//         start_time: 1552320000000,
//         end_time: 1552579200000,
//         start_time_string: '2019/3/12',
//         end_time_sting: '2019/3/15',
//         time_span: 4,
//         create_time: 4,
//       }
//     ],
//     list_no_time_data: []
//   },
// ],
