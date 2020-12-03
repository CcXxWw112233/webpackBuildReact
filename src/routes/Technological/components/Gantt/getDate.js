import base_utils from './base_utils'
import { getWeekGoldData, getNextWeeksDate, getLastWeeksDate } from './calDate'

const _obj = {
  getMonthDate: timestamp => {
    //获取月视图数据
    return base_utils.getAroundDate(timestamp)
  },
  getNextMonthDatePush: timestamp => {
    //获取传入时间戳，获取下一个月的数据，用于日期累加（月视图）
    return base_utils.getNextMonthDate(timestamp)
  },
  getLastMonthDateShift: timestamp => {
    //获取传入时间戳，获取上一个月的数据，用于日期累加（月视图）
    return base_utils.getLastMonthDate(timestamp)
  },
  getDateInfo: timestring => base_utils.getNeedDate(timestring), //获取传入日期的详细信息

  // 年视图所需要数据
  getYearDate: timestamp => {
    //获取初始化年数据[上一年，今年，下年]
    return base_utils.getYearDateData(timestamp)
  },

  getNextYearDate: timestamp => {
    //获取传入时间戳，获取下一年的数据，用于日期累加（月视图）
    return base_utils.getNextYearDate(timestamp)
  },
  getLastYearDate: timestamp => {
    //获取传入时间戳，获取上一年的数据，用于日期累加（月视图）
    return base_utils.getLastYearDate(timestamp)
  },

  getWeekDate: timestamp => {
    //获取初始周数据以本周为基准点延申到前后50周
    return getWeekGoldData(timestamp)
  },
  getNextWeeksDate: timestamp => {
    //获取上一个区间的周数据
    return getNextWeeksDate(timestamp)
  },
  getLastWeeksDate: timestamp => {
    // //获取下一个区间的周数据
    return getLastWeeksDate(timestamp)
  },

  // 时视图所需要数据
  getHourDate: timestamp => {
    return base_utils.getHourDate(timestamp)
  },
  getLastHourDate: timestamp => {
    return base_utils.getLastHourDate(timestamp)
  },
  getNextHourDate: timestamp => {
    return base_utils.getNextHourDate(timestamp)
  },

  // 相对时间轴所需要数据
  getRelativeTime: timestamp => {
    return base_utils.getRelativeTime(timestamp)
  },
  getNextRelativeTime: (timestamp, T) => {
    return base_utils.getNextRelativeTime(timestamp, T)
  },

  // 获取目标数据
  getGoldDateData: ({ timestamp, gantt_view_mode }) => {
    if ('year' == gantt_view_mode) {
      return _obj.getYearDate(timestamp)
    } else if ('month' == gantt_view_mode) {
      return _obj.getMonthDate(timestamp)
    } else if ('week' == gantt_view_mode) {
      return _obj.getWeekDate(timestamp)
    } else if ('hours' == gantt_view_mode) {
      return _obj.getHourDate(timestamp)
    } else if ('relative_time' == gantt_view_mode) {
      return _obj.getRelativeTime(timestamp)
    } else {
      return _obj.getMonthDate(timestamp)
    }
  }
}
module.exports = _obj
