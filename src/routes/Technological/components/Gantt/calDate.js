import { timeToTimestamp } from '../../../../utils/util'

const current_date = new Date()
const current_date_timestamp = current_date.getTime()

//时间戳转换为日期
function timestampToTime(timestamp, flag) {
  let date = new Date(timestamp) //时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let Y = date.getFullYear() + '/'
  let M =
    (date.getMonth() + 1 < 10
      ? '0' + (date.getMonth() + 1)
      : date.getMonth() + 1) + '/'
  let D = date.getDate() + ' '
  let h = date.getHours() + ':'
  let m = date.getMinutes() + ':'
  let s = date.getSeconds()
  return flag ? Y + M + D + h + m + s : Y + M + D
}
//计算周的数据
function setWeekData({ timestamp, type }) {
  let weekData = [] // 周的数据
  let weekData2 = []
  let now = timestamp ? new Date(timestamp) : new Date()
  let nowTime = now.getTime()
  let day = now.getDay()
  let oneDayLong = 24 * 60 * 60 * 1000
  const setPre = () => {
    for (let i = 0; i < 50; i++) {
      const MondayTime = nowTime - (day - 1 + 7 * i) * oneDayLong
      const SundayTime = nowTime + (7 - day - 7 * i) * oneDayLong
      const MonDayTimeTranslate = timestampToTime(MondayTime)
      const SundayTimeTranslate = timestampToTime(SundayTime)
      const MondayMonth = MonDayTimeTranslate.substring(5, 7)
      const SundayMonth = SundayTimeTranslate.substring(5, 7)
      const MonDayDate = MonDayTimeTranslate.substring(8)
      const SunDayDate = SundayTimeTranslate.substring(8)
      const MonthText =
        Number(MonDayDate) < Number(SunDayDate)
          ? Number(MondayMonth).toString()
          : Number(MondayMonth) + '/' + Number(SundayMonth)
      const DayText = (MonDayDate + '-' + SunDayDate).replace(/\s/gim, '')

      const date_0 = new Date(MonDayTimeTranslate)
      const year_0 = date_0.getFullYear()
      const month_0 = date_0.getMonth() + 1
      const date_no_0 = date_0.getDate()

      const date_1 = new Date(SundayTimeTranslate)
      const year_1 = date_1.getFullYear()
      const month_1 = date_1.getMonth() + 1
      const date_no_1 = date_1.getDate()

      const obj = {
        year: year_1,
        month: month_1,
        Mon: MonDayTimeTranslate,
        Sun: SundayTimeTranslate,
        timestamp: timeToTimestamp(MonDayTimeTranslate + ' ' + '0:0:0'),
        timestampEnd: timeToTimestamp(SundayTimeTranslate + ' ' + '23:59:59'),
        monthText: MonthText,
        date_no: `${date_no_0}-${date_no_1}`, // `${month_0}/${date_no_0}-${month_1}/${date_no_1}`,
        description: `${year_1}年${month_1}月`
      }
      obj.include_today =
        timeToTimestamp(MonDayTimeTranslate + ' ' + '0:0:0') <=
          current_date_timestamp &&
        timeToTimestamp(SundayTimeTranslate + ' ' + '23:59:59') >=
          current_date_timestamp
      weekData.push(obj)
    }
  }
  const setNext = () => {
    for (let i = 0; i < 50; i++) {
      const MondayTime = nowTime - (day - 1 - 7 * i) * oneDayLong
      const SundayTime = nowTime + (7 - day + 7 * i) * oneDayLong
      const MonDayTimeTranslate = timestampToTime(MondayTime)
      const SundayTimeTranslate = timestampToTime(SundayTime)
      const MondayMonth = MonDayTimeTranslate.substring(5, 7)
      const SundayMonth = SundayTimeTranslate.substring(5, 7)
      const MonDayDate = MonDayTimeTranslate.substring(8)
      const SunDayDate = SundayTimeTranslate.substring(8)
      const MonthText =
        Number(MonDayDate) < Number(SunDayDate)
          ? Number(MondayMonth).toString()
          : Number(MondayMonth) + '/' + Number(SundayMonth)
      const DayText = (MonDayDate + '-' + SunDayDate).replace(/\s/gim, '')

      const date_0 = new Date(MonDayTimeTranslate)
      const year_0 = date_0.getFullYear()
      const month_0 = date_0.getMonth() + 1
      const date_no_0 = date_0.getDate()

      const date_1 = new Date(SundayTimeTranslate)
      const year_1 = date_1.getFullYear()
      const month_1 = date_1.getMonth() + 1
      const date_no_1 = date_1.getDate()

      const obj = {
        year: year_1,
        month: month_1,
        Mon: MonDayTimeTranslate,
        Sun: SundayTimeTranslate,
        timestamp: timeToTimestamp(MonDayTimeTranslate + ' ' + '0:0:0'),
        timestampEnd: timeToTimestamp(SundayTimeTranslate + ' ' + '23:59:59'),
        monthText: MonthText,
        date_no: `${date_no_0}-${date_no_1}`, //`${month_0}/${date_no_0}-${month_1}/${date_no_1}`,
        description: `${year_1}年${month_1}月`
      }
      obj.include_today =
        timeToTimestamp(MonDayTimeTranslate + ' ' + '0:0:0') <=
          current_date_timestamp &&
        timeToTimestamp(SundayTimeTranslate + ' ' + '23:59:59') >=
          current_date_timestamp
      weekData2.push(obj)
    }
  }
  if (!type || type == 'init') {
    setPre()
    setNext()
    return [].concat(weekData.reverse().slice(0, 49), weekData2)
  } else if (type == 'last') {
    setPre()
    return weekData.reverse().slice(0, 49)
  } else if (type == 'next') {
    setNext()
    weekData2.shift()
    return weekData2
  } else {
    setPre()
    setNext()
    return [].concat(weekData.reverse().slice(0, 49), weekData2)
  }
}

function handleWeekData({ timestamp, type }) {
  const arr = setWeekData({ timestamp, type })
  let title_arr = arr.map(item => item.description)
  title_arr = Array.from(new Set(title_arr)) //得到不重的多组
  let gold_arr = []
  for (let val of title_arr) {
    const obj = {
      date_top: val,
      date_inner: []
    }
    for (let val2 of arr) {
      if (val == val2.description) {
        obj.date_inner.push(val2)
      }
    }
    gold_arr.push(obj)
  }
  return gold_arr
}

// export const weekDataArray = (timestamp) => {setWeekData({ timestamp })}
/**
 *   计算周的日期数量
 *  @param week_data = [] 符合 handleWeekData({ timestamp, type: 'init' })这个调用方式的数据结构
 *  @return jsonArray
 **/
export const weekDataArray = (week_data = []) => {
  let init_arr = []
  for (let val of week_data) {
    init_arr = [].concat(init_arr, val.date_inner)
  }
  return init_arr
  // if (!week_data.length) {
  //   return 0
  // }
  // const arr = handleWeekData({ timestamp, type: 'init' })
  // const len = arr.reduce((prev, cur, index, arr) => {
  //   return prev + cur.date_inner.length
  // }, 0)
  // return len
}

export const getWeekGoldData = timestamp =>
  handleWeekData({ timestamp, type: 'init' })
export const getNextWeeksDate = timestamp =>
  handleWeekData({ timestamp, type: 'next' })
export const getLastWeeksDate = timestamp =>
  handleWeekData({ timestamp, type: 'last' })

// console.log('weekDataArray', weekDataArray())
// console.log('weekDataArray_1', getWeekGoldData())
// console.log('weekDataArray_2', getNextWeeksDate())
// console.log('weekDataArray_3', getLastWeeksDate())
