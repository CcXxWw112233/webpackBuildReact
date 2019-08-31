const current_date = new Date()
const current_year = current_date.getFullYear()
const current_month = current_date.getMonth() + 1
const current_date_no= current_date.getDate()
const current_date_timestamp = current_date.getTime()

// console.log(current_date_timestamp, current_year, current_month, current_date_no)

//日期转换为时间戳
function timeToTimestamp(dateString) { // 示例 '2014-04-23 18:55:49'
  const date = new Date(dateString)
  return date.getTime()
}

//获取某年某月总共几天
function getDaysNumInMonth(year, month) {
  month = parseInt(month, 10);
  const d = new Date(year, month, 0);
  return d.getDate();
}

//获取某个一月份详细数据
function getOneMonthDateDetail(year, month) {
  const total_day = getDaysNumInMonth(year, month)
  const date_arr = []
  for(let i = 1; i < total_day + 1; i ++) {
    const obj = getNeedDate(`${year}/${month}/${i}`)
    date_arr.push(obj)
  }
  return date_arr
}

//获取周几
function getWeekDay(index) {
  const week_day_arr = new Array(7)
  week_day_arr[0] = '日'
  week_day_arr[1] = '一'
  week_day_arr[2] = '二'
  week_day_arr[3] = '三'
  week_day_arr[4] = '四'
  week_day_arr[5] = '五'
  week_day_arr[6] = '六'
  return week_day_arr[index]
}

//传入日期，获取所需传入日期的年月日周几
function getNeedDate(timestring) {
  if(!timestring) {
    return {}
  }
  const date = new Date(timestring)
  const year = date.getFullYear() //年
  const month = date.getMonth() + 1 //月
  const date_no = date.getDate() //日
  const week_day = date.getDay() //周几
  const date_string = `${year}/${month}/${date_no}`
  return {
    year,
    month,
    date_no, //: date_no < 10 ? `0${date_no}`: date_no,
    week_day,
    date_string,
    timestamp: new Date(date_string).getTime(),
    week_day_name: getWeekDay(week_day),
  }
}

//获取一系列日期所属月份
function getDateTop(gold_year, gold_month) {
  return current_year == gold_year ? `${gold_month}月` : `${gold_year}年${gold_month}月`
}
//获取固定日期的当前月份包括前后一个月的每天日期详情
function getAroundDate (timestamp) {
  const timestamp_trans = timestamp || current_date_timestamp
  const {
    year,
    month,
  } = getNeedDate(timestamp_trans)
  //前一个月
  const front_one_year = month == 1 ? year - 1 : year
  const front_one_month = month == 1 ? 12 : month - 1
  //后一个月
  const behind_one_year = month == 12 ? year + 1 : year
  const behind_one_month = month == 12 ? 1 : month + 1

  const base_month_date = getOneMonthDateDetail(year, month) //基准月份数据
  const front_month_date = getOneMonthDateDetail(front_one_year, front_one_month)
  const behind_month_date = getOneMonthDateDetail(behind_one_year, behind_one_month)
  const gold_date_arr = [
    {
      date_top: getDateTop(front_one_year, front_one_month),
      date_inner: front_month_date,
     },
    {
      date_top: getDateTop(year, month),
      date_inner: base_month_date,
    },
    {
      date_top: getDateTop(behind_one_year, behind_one_month),
      date_inner: behind_month_date,
    },
  ]
  // console.log('gold_date_arr', gold_date_arr)
  return gold_date_arr
}

//获取固定日期下一个月的数据
function getNextMonthDate(timestamp) {
  const timestamp_trans = timestamp || current_date_timestamp
  const {
    year,
    month,
  } = getNeedDate(timestamp_trans)
  //后一个月
  const behind_one_year = month == 12 ? year + 1 : year
  const behind_one_month = month == 12 ? 1 : month + 1
  const behind_month_date = getOneMonthDateDetail(behind_one_year, behind_one_month)
  const gold_date_arr = [
    {
      date_top: getDateTop(behind_one_year, behind_one_month),
      date_inner: behind_month_date,
    },
  ]
  // console.log({gold_date_arr})
  return gold_date_arr
}

export const getMonthDate = (timestamp) => {
  return getAroundDate(timestamp)
}
export const getNextMonthDatePush = (timestamp) => { //日期累加
  return getNextMonthDate(timestamp)
}
export const isToday = (timestamp) => {
  return new Date(timestamp).toDateString() === new Date().toDateString()
}

export const isSamDay = (timestamp, timestamp2) => {
  if(!!!timestamp || !!!timestamp2) {
    return false
  }
  const new_time_a = timestamp.toString().length < 13? Number(timestamp) * 1000: Number(timestamp)
  const new_time_b = timestamp2.toString().length < 13? Number(timestamp2) * 1000: Number(timestamp2)
  return new Date(new_time_a).toDateString() == new Date(new_time_b).toDateString()
}
