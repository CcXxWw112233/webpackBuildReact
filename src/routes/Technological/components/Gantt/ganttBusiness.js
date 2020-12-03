import base_utils from './base_utils'
import {
  caldiffDays,
  isSamDay,
  transformTimestamp
} from '../../../../utils/util'
import {
  date_area_height,
  gantt_panel_left_diff,
  ceil_height,
  hours_view_total,
  hours_view_start_work_oclock
} from './constants'
import { lx_utils } from 'lingxi-im'
import moment from 'moment'

export const afterCreateBoardUpdateGantt = dispatch => {
  afterClearGanttData({ dispatch })
  dispatch({
    type: 'gantt/getGanttData',
    payload: {}
  })
  dispatch({
    type: 'gantt/getAboutAppsBoards',
    payload: {}
  })

  dispatch({
    type: 'gantt/getAboutGroupBoards',
    payload: {}
  })
  dispatch({
    type: 'gantt/getAboutUsersBoards',
    payload: {}
  })
  dispatch({
    type: 'gantt/getContentFiterBoardTree',
    payload: {}
  })
  dispatch({
    type: 'gantt/getContentFiterUserTree',
    payload: {}
  })
  dispatch({
    type: 'workbench/getProjectList',
    payload: {}
  })
  // lx_utils.updateUserList()
}
export const afterClearGanttData = ({ dispatch }) => {
  dispatch({
    type: 'gantt/updateDatas',
    payload: {
      outline_tree: [],
      startPlanType: 0
    }
  })
}
export const afterChangeBoardUpdateGantt = ({ dispatch, board_id }) => {
  dispatch({
    type: 'gantt/updateDatas',
    payload: {
      gantt_board_id: board_id
    }
  })
  afterCreateBoardUpdateGantt(dispatch)
}
export const handleChangeBoardViewScrollTop = ({
  group_view_type,
  gantt_board_id,
  target_scrollTop_board_storage
}) => {
  const target = document.getElementById('gantt_card_out_middle')
  const target2 = document.getElementById('gantt_group_head')
  if (!target || !target2) {
    return
  }
  if (gantt_board_id == '0' && group_view_type == '1') {
    //在查看项目的情况下
    target.scrollTop = target_scrollTop_board_storage
    target2.scrollTop = target_scrollTop_board_storage
  } else {
    target.scrollTop = 0
    target2.scrollTop = 0
  }
}
// 在删除项目后做的操作
export const deleteBoardFollow = () => {
  lx_utils.updateUserList()
}

// 计算时间跨度
const calTimeSpan = (init_time, end_time) => {
  const start_due_time_span_time = init_time - end_time
  const start_due_time_span = start_due_time_span_time / (24 * 60 * 60 * 1000)
  const span_date = Math.floor(start_due_time_span)
  const span_hour = ((start_due_time_span - span_date) * 24).toFixed(1)
  return {
    span_date,
    span_hour
  }
}

const handleDescription = (date, hour) => {
  // console.log('sssss', 'ss', 0 != '0')
  let date_des = `${date}天`
  let hour_des = `${hour}时`
  if (date == 0) {
    date_des = ``
  }
  if (hour == '0.0') {
    hour_des = ``
  } else if (hour == '24.0') {
    hour_des = ''
    date_des = `${Number(date) + 1}天`
  }
  return {
    date_des,
    hour_des
  }
}
// 计算任务的逾期情况和时间跨度
export const filterDueTimeSpan = ({
  start_time,
  due_time,
  is_has_end_time,
  is_has_start_time,
  is_realize
}) => {
  let due_description = ''
  if (!!!due_time) {
    return {
      is_overdue: false,
      due_description
    }
  }
  const now = new Date().getTime()
  const new_start_time =
    start_time.toString().length > 10
      ? Number(start_time)
      : Number(start_time) * 1000
  const new_due_time =
    due_time.toString().length > 10 ? Number(due_time) : Number(due_time) * 1000

  // 计算逾期
  const due_time_span = now - new_due_time

  //逾期
  const aready_due_date = calTimeSpan(now, new_due_time).span_date
  const aready_due_hour = calTimeSpan(now, new_due_time).span_hour

  //总长
  const { span_date, span_hour } = calTimeSpan(new_due_time, new_start_time)

  if (due_time_span < 0 || is_realize == '1') {
    //非逾期
    const { date_des, hour_des } = handleDescription(span_date, span_hour)
    if (is_has_end_time && is_has_start_time) {
      due_description = `共${date_des}${hour_des}`
    }
    return {
      is_overdue: false,
      due_description
    }
  } else {
    const { date_des, hour_des } = handleDescription(
      aready_due_date,
      aready_due_hour
    )
    return {
      is_overdue: true,
      due_description: `已逾期${date_des}${hour_des}`
    }
  }
}

// 甘特图消息未读
// 当前某一项任务是否拥有未读, type: card/file,  relaDataId: 所检测的对象id
export const cardItemIsHasUnRead = ({
  relaDataId,
  im_all_latest_unread_messages = []
}) => {
  const flag =
    im_all_latest_unread_messages.findIndex(
      item => item.relaDataId == relaDataId || item.cardId == relaDataId
    ) != -1
  if (flag) {
    return true
  }
  return false
}
// 解构消息的实例
const handleNewsItem = val => {
  const { content_data } = val
  const contentJson = JSON.parse(content_data) || {}
  const { data = {} } = contentJson
  const { d = '{}' } = data
  const gold_data = JSON.parse(d) || {}
  // console.log('sssss_gold_data', gold_data)
  return gold_data
}
// 文件模块是否存在未读数
export const fileModuleIsHasUnRead = ({
  board_id,
  im_all_latest_unread_messages = [],
  wil_handle_types = []
}) => {
  let count = 0
  for (let val of im_all_latest_unread_messages) {
    if (
      val.action == 'board.file.upload' ||
      val.action == 'board.file.version.upload'
    ) {
      count++
    }
  }
  return count
}

// 当前某一项文件item是否拥有未读,
export const fileItemIsHasUnRead = ({
  relaDataId,
  im_all_latest_unread_messages = []
}) => {
  // 递归查询父级id最终push到一个数组，然后在数组下检索传递进来的relaDataId，如果存在就是存在未读
  const arr = []
  const folderPathRecursion = ({ parent_folder }) => {
    const { id, parent_id } = parent_folder
    if (!id) {
      return
    }
    const parent_folder_ = parent_folder['parent_folder'] || {}
    if (parent_id != '0') {
      arr.push(id)
      folderPathRecursion({ parent_folder: parent_folder_ })
    }
  }
  const current_item = im_all_latest_unread_messages.find(
    item => relaDataId == item.relaDataId
  )
  if (!current_item) {
    return false
  }
  const { folder_path = {} } = handleNewsItem(current_item)
  const { parent_folder = {} } = folder_path
  folderPathRecursion({ parent_folder })
  if (arr.indexOf(relaDataId) != -1) {
    return true
  }
  return false
}
// 某一项文件夹拥有未读数, relaDataId: 当前文件夹id
export const folderItemHasUnReadNo = ({
  type,
  relaDataId,
  im_all_latest_unread_messages = [],
  wil_handle_types = []
}) => {
  // 递归查询父级id最终push到一个数组，然后在数组下检索传递进来的relaDataId，如果存在就是存在未读
  if (!im_all_latest_unread_messages.length) {
    return 0
  }

  if (type == '2') {
    //1文件2文件夹
    const file_has_unread = !!im_all_latest_unread_messages.find(
      item => relaDataId == item.relaDataId
    )
    if (file_has_unread) {
      return 1
    }
  }
  const current_item = im_all_latest_unread_messages.find(item => {
    const gold_item = handleNewsItem(item)
    const { action } = item
    if (
      action == 'board.file.upload' ||
      action == 'board.file.version.upload'
    ) {
      const {
        content: { folder_path = {} }
      } = gold_item
      const { id } = folder_path
      if (id == relaDataId) {
        return item
      }
    }
  })
  if (!current_item) {
    return false
  }

  // 这里arr已经更新
  let count = 0
  for (let val of im_all_latest_unread_messages) {
    if (
      val.action == 'board.file.upload' ||
      val.action == 'board.file.version.upload'
    ) {
      const {
        content: { folder_path = {} }
      } = handleNewsItem(val)
      const { parent_folder = {}, id } = folder_path
      let arr = [id]
      const folderPathRecursion = ({ parent_folder }) => {
        const { id, parent_id } = parent_folder
        if (!id) {
          return arr
        }
        const parent_folder_ = parent_folder['parent_folder'] || {}
        if (parent_id != '0') {
          arr.push(id)
          folderPathRecursion({ parent_folder: parent_folder_ })
        }
      }
      folderPathRecursion({ parent_folder })
      if (arr.indexOf(relaDataId) != -1) {
        count++
      }
    }
  }
  return count
}
// 当前文件夹判断最新推送消息属于board.file.upload   (场景： 点击多级文件夹后, 如果有文件上传，推送过来的所属文件夹id，和当前查阅文件夹id匹配)
export const currentFolderJudegeFileUpload = ({
  folder_id,
  im_all_latest_unread_messages = []
}) => {
  const length = im_all_latest_unread_messages.length
  const latest_item = im_all_latest_unread_messages[length - 1]
  if (!latest_item) {
    return false
  }
  const {
    action,
    content: { folder_path = {} }
  } = handleNewsItem(latest_item)

  if (action == 'board.file.upload') {
    const { id } = folder_path
    if (id == folder_id) {
      return true
    }
  }
  return false
}

// 修复开始时间和截止时间之差在24h之内但是跨天了，然而只显示一天
export const diffGanttTimeSpan = ({ time_span, start_time, due_time }) => {
  if (!start_time || !due_time) return time_span || 1
  if (isSamDay(start_time, due_time)) return 1
  const start_date = new Date(start_time)
  const due_date = new Date(due_time)
  const s_h = start_date.getHours()
  const s_m = start_date.getMinutes()
  const s_s = start_date.getSeconds()

  const e_h = due_date.getHours()
  const e_m = due_date.getMinutes()
  const e_s = due_date.getSeconds()

  // 截止的时分比开始的时分要小
  if (
    e_h < s_h ||
    (e_h == s_h && e_m < s_m) ||
    (e_h == s_h && e_m == s_m && e_s < s_s)
  ) {
    return time_span + 1
  }
  return time_span
}
// 计算任务时间长度对应在甘特图上的跨度
export const setGantTimeSpan = ({
  time_span,
  start_time,
  due_time,
  start_date,
  end_date
}) => {
  let new_time_span = 0
  if (!!!due_time && !!!start_time) {
    return Number(time_span) || 0 //1 //0//
  } else {
    if (!!due_time && !!start_time) {
      new_time_span =
        Math.floor((due_time - start_time) / (24 * 3600 * 1000)) + 1
      new_time_span = diffGanttTimeSpan({
        time_span: new_time_span,
        start_time,
        due_time
      })
      return new_time_span
    } else {
      return Number(time_span) || 0 //1 //1//
    }
    // if (due_time > end_date.timestamp && start_time > start_date.timestamp) { //右区间
    //     new_time_span = (Math.floor((end_date.timestamp - start_time) / (24 * 3600 * 1000))) + 1
    // } else if (start_time < start_date.timestamp && due_time < end_date.timestamp) { //左区间
    //     new_time_span = (Math.floor((due_time - start_date.timestamp) / (24 * 3600 * 1000))) + 1
    // } else if (due_time > end_date.timestamp && start_time < start_date.timestamp) { //超过左右区间
    //     new_time_span = (Math.floor((end_date.timestamp - start_date.timestamp) / (24 * 3600 * 1000))) + 1
    // }
  }
  return new_time_span
}
//计算任务时视图的长度跨度
export const setHourViewCardTimeSpan = (
  start_time,
  due_time,
  min_start_time,
  max_due_time
) => {
  const gold_start_time = Math.max(
    transformTimestamp(start_time),
    transformTimestamp(min_start_time)
  )
  const gold_due_time = Math.min(
    transformTimestamp(due_time),
    transformTimestamp(max_due_time)
  )
  // console.log(
  //   'saaaasss',
  //   transformTimestamp(due_time),
  //   transformTimestamp(max_due_time),
  //   gold_due_time
  // )
  if (!start_time || !due_time) return 1
  if (start_time == due_time) return 1
  const start_work_clock = hours_view_start_work_oclock //开始工作时间点
  const due_work_clock = start_work_clock + hours_view_total //下班时间点
  let diff_hour //小时差
  const start_time_hour = new Date(gold_start_time).getHours()
  const due_time_hour = new Date(gold_due_time).getHours()

  if (isSamDay(gold_start_time, gold_due_time)) {
    //如果是同一天, 取（最晚下班时间或任务截止时间最小值）  - （最早上班时间或任务开始时间最大值）
    diff_hour =
      Math.min(due_time_hour, due_work_clock) -
      Math.max(start_time_hour, start_work_clock)
    if (due_time_hour <= due_work_clock) {
      //处理误差
      diff_hour += 1
    }
    if (diff_hour < 0) {
      //代表任务起始时间在上班时间外
      diff_hour = 0
    }
    return diff_hour
  } else {
    const diff_day = caldiffDays(gold_start_time, gold_due_time) //相差天数
    let first_day_span = 0 //第一天跨度
    let finally_day_span = 0 //最后一天跨度

    // 计算第一天跨度
    if (start_time_hour <= due_work_clock) {
      //开始时间在
      first_day_span =
        due_work_clock - Math.max(start_time_hour, start_work_clock)
    } else {
      first_day_span = 0
    }
    // 计算最后一天跨度
    if (due_time_hour < start_work_clock) {
      finally_day_span = 0
    } else {
      finally_day_span =
        Math.min(due_time_hour, due_work_clock) - start_work_clock
      if (due_time_hour <= due_work_clock) {
        //处理误差
        finally_day_span += 1
      }
    }
    // console.log(
    //   'ssssssss_2',
    //   first_day_span,
    //   diff_day - 2 + 1,
    //   finally_day_span,
    //   start_time,
    //   due_time,
    //   min_start_time,
    //   gold_start_time,
    //   max_due_time,
    //   gold_due_time,
    //   moment(gold_start_time).format('MMMM Do YYYY, h:mm:ss a'),
    //   moment(gold_due_time).format('MMMM Do YYYY, h:mm:ss a')
    // )
    //第一天跨度+中间天数 * 一天工作时长 + 最后一天宽度
    return (
      first_day_span + (diff_day - 2 + 1) * hours_view_total + finally_day_span
    )
  }
}

// 滚动条回复到顶部
export const resetGanttScrollTop = () => {
  const target = document.getElementById('gantt_card_out_middle')
  if (target) {
    target.scrollTop = 0
  }
}

// 获取到鼠标点的日期数据（年视图）
export const setDateWithPositionInYearView = ({
  _position,
  date_arr_one_level,
  ceilWidth,
  width,
  x,
  flag
}) => {
  // let month_data = { //年视图操作的月份数据
  //     month: {}, //所计数的月份
  //     month_date_length_total: 0,  //所计数月份前的所有月份总天数
  //     month_count: 0, //所计数月份的所有月份总数(当前+之前)
  //     date_no: 1
  // }
  let month = {}, //所计数的月份
    month_date_length_total = 0, //所计数月份前的所有月份总天数
    month_count = 0, //所计数月份的所有月份总数(当前+之前)
    date_no = 1
  let date = {}
  for (let val of date_arr_one_level) {
    month_date_length_total += val['last_date'] //每个月累加天数
    month_count += 1 //月份数累加
    if (month_date_length_total * ceilWidth >= x + width) {
      month = val //获得当前月份
      break
    }
  }
  //当前月份天数长度 - (所属月份和之前月份的总天数长度 - 当前点的位置（x(x是经过单元格乘以单元格长度转换而来)）) = 该月份日期
  date_no = Math.floor(
    month.last_date -
      (month_date_length_total - Math.floor(_position / ceilWidth))
  )
  // console.log('ssssssssssaaaa', date_no, month.last_date, month_date_length_total, Math.floor(_position / ceilWidth))
  let _year = month.year
  let _month = month.month
  const inital_year = _year
  const inital_month = _month

  //由于计算紧凑，会出现2010/02/0 或者2010/02/-1等日期号不正常情况，这种情况将日期设置为上一个月的最后一天
  // console.log('date_no_init', `${_year}/${_month}/${date_no}`)
  if (date_no < 0) {
    if (_month == 1) {
      _month = 12
      _year = _year - 1
    } else {
      _month = _month - 1
    }
    const _last_date = base_utils.getDaysNumInMonth(_month, _year)
    // 出现 2010/02/-40这种情况
    if (_last_date > Math.abs(date_no)) {
      date_no = _last_date - Math.abs(date_no) //出现负数的时候将当月天数份加上负数就是日期号
      // console.log('date_no_1', date_no)
    } else if (_last_date < Math.abs(date_no)) {
      _month = _month - 1
      if (_month == 1) {
        _month = 12
        _year = _year - 1
      }
      date_no =
        base_utils.getDaysNumInMonth(_month, _year) -
        Math.abs(
          Math.abs(date_no) -
            Math.abs(base_utils.getDaysNumInMonth(inital_year, inital_month))
        )
      // console.log('date_no_2', date_no)
      //出现负数的时候将当月天数份加上负数就是日期号
    } else if (_last_date == Math.abs(date_no)) {
      date_no = 1
      // console.log('date_no_3', date_no)
    }
  } else if (date_no == 0) {
    date_no = 1
    // console.log('date_no_4', date_no)
  } else {
  }
  let date_string = `${_year}/${_month}/${date_no}`
  // console.log('date_no_end', date_string)
  date = {
    timestamp: new Date(`${date_string} 00:00:00`).getTime(),
    timestampEnd: new Date(`${date_string} 23:59:59`).getTime()
  }
  // console.log('ssssssssssaaaa', date_string)
  return date
}

// 获取到鼠标点的日期数据（周视图）
export const setDateWidthPositionWeekView = ({
  position,
  date_arr_one_level = [],
  ceilWidth
}) => {
  const week_length = date_arr_one_level.length //总周数
  const day_total = week_length * 7 //总天数
  const area_width = day_total * ceilWidth //区域总宽度
  const belong_week = parseInt(position / (7 * ceilWidth)) //所属在第几周
  const belong_day = Math.floor(
    (position - belong_week * 7 * ceilWidth) / ceilWidth
  ) //在所属周的周几

  const week_data = date_arr_one_level[belong_week]
  const week_data_timestamp = week_data.timestamp
  const timestamp = week_data_timestamp + belong_day * 24 * 60 * 60 * 1000
  const timestampEnd =
    week_data_timestamp +
    belong_day * 24 * 60 * 60 * 1000 +
    23 * 60 * 60 * 1000 +
    59 * 60 * 1000 +
    59 * 1000

  // console.log('ssssssssss', {
  //     area_width,
  //     day_total,
  //     belong_week,
  //     belong_day,
  //     timestamp,
  //     timestampEnd
  // })
  return {
    timestamp,
    timestampEnd
  }
}

// 拖拽完成后，修改成功，在弹出右方详情页的情况下，作比较更新
export const onChangeCardHandleCardDetail = ({
  card_detail_id, //来自任务详情的id
  selected_card_visible, //任务详情弹窗是否弹开
  dispatch,
  operate_id, //当前操作的id
  operate_parent_card_id //当前操作的任务的父任务id
}) => {
  if (selected_card_visible) {
    //当当前打开的任务是该任务或者是该任务父任务，则做查询更新
    if (
      card_detail_id == operate_id ||
      card_detail_id == operate_parent_card_id
    ) {
      dispatch({
        type: 'publicTaskDetailModal/getCardWithAttributesDetail',
        payload: {
          id: card_detail_id
        }
      })
    }
  }
}
// 获取pageX
export const getPageXY = e => {
  const pageX = e.pageX || (e.changedTouches && e.changedTouches[0].pageX)
  const pageY = e.pageY || (e.changedTouches && e.changedTouches[0].pageY)
  return { pageX, pageY }
}

// 获取鼠标下落的相对位置
export const getXYDropPosition = (e, { gantt_head_width }) => {
  if (!e) return
  if (!e.target) return
  const { pageX, pageY } = getPageXY(e)
  const target_0 = document.getElementById('gantt_card_out')
  const target_1 = document.getElementById('gantt_card_out_middle')
  // 取得鼠标位置
  const x =
    pageX -
    target_0.offsetLeft +
    target_1.scrollLeft -
    gantt_head_width -
    gantt_panel_left_diff
  const y = pageY - target_0.offsetTop + target_1.scrollTop - date_area_height
  return {
    x,
    y
  }
}

// /**
//  * 获取下落后落在的分组位置
//  * @param {Array} arr
//  * @param {Number|String} compare_ele 需要比较的元素
//  */
// export const getDropListPosition = (arr, compare_ele) => {
//     let group_list_index = 0;
//     let flag = false;
//     for (let index = 0; index < arr.length; index++) {
//         if (compare_ele <= arr[index]) {
//             group_list_index = index;
//             flag = true;
//             break;
//         }
//     }
//     if (!flag) {
//         group_list_index = arr.length;
//     }
//     return group_list_index
// }
/**
 * 获取下落后落在的分组位置
 * @param {Array} group_list_area_section_height 甘特图分组高度累加组
 * @param {Number|String} position_top 需要比较的位置高度
 * @returns {object} {group_list_index:分组索引, belong_group_row： 所在第几行}
 */
export const getDropListPosition = ({
  group_list_area_section_height = [],
  position_top = 0
}) => {
  let group_list_index = 0
  let belong_group_row = 0

  const len = group_list_area_section_height.length
  for (let i = 0; i < len; i++) {
    if (position_top <= group_list_area_section_height[i]) {
      group_list_index = i
      break
    }
  }
  if (group_list_index == 0) {
    belong_group_row = position_top / ceil_height + 1
  } else {
    belong_group_row =
      (position_top - group_list_area_section_height[group_list_index - 1]) /
        ceil_height +
      1
  }
  return { group_list_index, belong_group_row: Math.round(belong_group_row) }
}
