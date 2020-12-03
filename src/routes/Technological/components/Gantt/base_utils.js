import { dateFormat, timestampToTimeNormal } from '../../../../utils/util'
import { hours_view_start_work_oclock, hours_view_total } from './constants'

const current_date = new Date()
const current_year = current_date.getFullYear()
const current_month = current_date.getMonth() + 1
const current_date_no = current_date.getDate()
const current_date_timestamp = current_date.getTime()
class base_utils {
  //获取某年某月总共几天
  static getDaysNumInMonth(year, month) {
    month = parseInt(month, 10)
    const d = new Date(year, month, 0)
    return d.getDate()
  }

  //获取某个一月份详细数据
  static getOneMonthDateDetail(year, month) {
    const total_day = this.getDaysNumInMonth(year, month)
    const date_arr = []
    for (let i = 1; i < total_day + 1; i++) {
      const obj = this.getNeedDate(`${year}/${month}/${i}`)
      date_arr.push(obj)
    }
    return date_arr
  }

  //获取周几
  static getWeekDay(index) {
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
  static getNeedDate(timestring) {
    if (!timestring) {
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
      date_top: this.getDateTop(year, month),
      timestamp: new Date(date_string).getTime(),
      timestampEnd: new Date(`${date_string} 23:59`).getTime(),
      week_day_name: this.getWeekDay(week_day)
    }
  }

  //获取一系列日期所属月份
  static getDateTop(gold_year, gold_month) {
    return current_year == gold_year
      ? `${gold_month}月`
      : `${gold_year}年${gold_month}月`
  }
  //获取固定日期的当前月份包括前后一个月的每天日期详情
  static getAroundDate(timestamp) {
    const timestamp_trans = timestamp || current_date_timestamp
    const { year, month } = this.getNeedDate(timestamp_trans)
    //前一个月
    const front_one_year = month == 1 ? year - 1 : year
    const front_one_month = month == 1 ? 12 : month - 1
    //后一个月
    const behind_one_year = month == 12 ? year + 1 : year
    const behind_one_month = month == 12 ? 1 : month + 1

    const base_month_date = this.getOneMonthDateDetail(year, month) //基准月份数据
    const front_month_date = this.getOneMonthDateDetail(
      front_one_year,
      front_one_month
    )
    const behind_month_date = this.getOneMonthDateDetail(
      behind_one_year,
      behind_one_month
    )

    //前两月
    const front_two_year = month == 1 || month == 2 ? year - 1 : year
    const front_two_month = month == 1 ? 11 : month == 2 ? 12 : month - 2
    //后两月
    const behind_two_year = month == 11 || month == 12 ? year + 1 : year
    const behind_two_month = month == 11 ? 1 : month == 12 ? 2 : month + 2
    //后三月
    const behind_three_year =
      month == 11 || month == 12 || month == 10 ? year + 1 : year
    const behind_three_month =
      month == 10 ? 1 : month == 11 ? 2 : month == 12 ? 3 : month + 3

    const gold_date_arr = [
      {
        date_top: this.getDateTop(front_two_year, front_two_month),
        date_inner: this.getOneMonthDateDetail(front_two_year, front_two_month)
      },
      {
        date_top: this.getDateTop(front_one_year, front_one_month),
        date_inner: front_month_date
      },
      {
        //基准月份
        date_top: this.getDateTop(year, month),
        date_inner: base_month_date
      },
      {
        date_top: this.getDateTop(behind_one_year, behind_one_month),
        date_inner: behind_month_date
      },
      {
        date_top: this.getDateTop(behind_two_year, behind_two_month),
        date_inner: this.getOneMonthDateDetail(
          behind_two_year,
          behind_two_month
        )
      }
      // {
      //     date_top: this.getDateTop(behind_three_year, behind_three_month),
      //     date_inner: this.getOneMonthDateDetail(behind_three_year, behind_three_month),
      // },
    ]
    // console.log('gold_date_arr', gold_date_arr)
    return gold_date_arr
  }

  //获取固定日期下一个月的数据
  static getNextMonthDate(timestamp) {
    const timestamp_trans = timestamp || current_date_timestamp
    const { year, month } = this.getNeedDate(timestamp_trans)
    //后一个月
    const behind_one_year = month == 12 ? year + 1 : year
    const behind_one_month = month == 12 ? 1 : month + 1
    const behind_month_date = this.getOneMonthDateDetail(
      behind_one_year,
      behind_one_month
    )
    const gold_date_arr = [
      {
        date_top: this.getDateTop(behind_one_year, behind_one_month),
        date_inner: behind_month_date
      }
    ]
    // console.log({gold_date_arr})
    return gold_date_arr
  }
  static getLastMonthDate(timestamp) {
    const timestamp_trans = timestamp || current_date_timestamp
    const { year, month } = this.getNeedDate(timestamp_trans)
    //后一个月
    const behind_one_year = month == 1 ? year - 1 : year
    const behind_one_month = month == 1 ? 12 : month - 1
    const behind_month_date = this.getOneMonthDateDetail(
      behind_one_year,
      behind_one_month
    )
    const gold_date_arr = [
      {
        date_top: this.getDateTop(behind_one_year, behind_one_month),
        date_inner: behind_month_date
      }
    ]
    // console.log({gold_date_arr})
    return gold_date_arr
  }
  // 是否今天
  static isToday(timestamp) {
    return new Date(timestamp).toDateString() === new Date().toDateString()
  }

  // 年视图------------start
  static getYearQuater(quater_index) {
    //获取年视图的季度信息

    return 'quater_month'
  }
  static getYearQuaterMonthsDetail(quater_index, year) {
    //获取年视图的季度信息
    const quater_arr = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [10, 11, 12]
    ]
    const year_arr = [
      '一',
      '二',
      '三',
      '四',
      '五',
      '六',
      '七',
      '八',
      '九',
      '十',
      '十一',
      '十二'
    ]
    const quater_month = quater_arr[quater_index] //获取季度的月份

    const months_detail = quater_month.map(item => {
      //获取传入季度每个月份的详情
      const last_date = this.getDaysNumInMonth(year, item)
      return {
        year,
        month: item,
        last_date,
        date_no: item,
        description: year_arr[item - 1],
        timestamp: new Date(`${year}/${item}/1`).getTime(),
        include_today: current_year == year && current_month == item,
        timestampEnd: new Date(
          `${year}/${item}/${last_date} 23:59:59`
        ).getTime()
      }
    })
    return months_detail
  }

  static handleYeardate({ timestamp, type }) {
    const tran_time = timestamp || current_date_timestamp
    const year = new Date(tran_time).getFullYear()
    let year_arr = []
    if (!type || type == 'init') {
      year_arr = [year - 1, year, year + 1]
    } else if (type == 'last') {
      year_arr = [year - 1]
    } else if (type == 'next') {
      year_arr = [year + 1]
    }
    const quaters = ['第一季度', '第二季度', '第三季度', '第四季度']

    let year_date_arr = year_arr.map(item_1 => {
      return quaters.map((item_2, key) => {
        return {
          date_top: `${item_1}${item_2}`,
          date_inner: this.getYearQuaterMonthsDetail(key, item_1)
        }
      })
    }) //得到一个二维数组

    let gold_date_arr = []
    for (let val of year_date_arr) {
      //平铺成一个一维数组
      gold_date_arr = [].concat(gold_date_arr, val)
    }
    // console.log('gold_date_arr', gold_date_arr)
    return gold_date_arr
  }

  static getYearDateData(timestamp) {
    //获取timestamp前 今 后 三年的信息
    return this.handleYeardate({ timestamp, type: 'init' })
  }
  static getNextYearDate(timestamp) {
    //获取下一年
    return this.handleYeardate({ timestamp, type: 'next' })
  }
  static getLastYearDate(timestamp) {
    //获取上一年
    return this.handleYeardate({ timestamp, type: 'last' })
  }

  // 时视图 ----------start
  static getHours = () => {
    const arr = []
    let init_oclock = hours_view_start_work_oclock
    let i = 0
    while (i < hours_view_total) {
      arr.push(init_oclock + i)
      ++i
    }
    return arr
    // return [9, 10, 11, 12, 13, 14, 15, 16, 17]
  }
  // 设置一天内工作时间的处理
  static setOneDayHours = ({ date_string, week_day_name }) => {
    const date_inner = this.getHours().map(item => {
      return {
        date_string,
        timestamp: new Date(`${date_string} ${item}:00:00`).getTime(),
        timestampEnd: new Date(`${date_string} ${item}:59:59`).getTime(),
        date_no: item
      }
    })
    const _obj = {
      date_top: `${this.handleDateString(date_string)} 周${week_day_name}`,
      date_inner
    }
    return _obj
  }
  static handleDateString = date_string => {
    const reg = new RegExp(`${current_year}/`)
    return date_string.replace(reg, '')
  }
  // 获取当前视图 所需天数
  static getHourDate = timestamp => {
    const timestamp_trans = timestamp || current_date_timestamp
    const { date_string, week_day_name } = this.getNeedDate(timestamp_trans)

    const current_date_hour = this.setOneDayHours({
      date_string,
      week_day_name
    })
    return [].concat(
      this.getLastHourDate(timestamp_trans),
      [current_date_hour],
      this.getNextHourDate(timestamp_trans)
    )
  }
  // 获取上一个时间段时间列表
  static getLastHourDate = timestamp => {
    const timestamp_trans = timestamp || current_date_timestamp
    const gold_arr = []

    for (let i = 15; i > 0; i--) {
      const cal_timestamp = timestamp_trans - i * 24 * 60 * 60 * 1000
      const { date_string, week_day_name } = this.getNeedDate(cal_timestamp)
      gold_arr.push(this.setOneDayHours({ date_string, week_day_name }))
    }
    return gold_arr
  }
  // 获取下一个时间段时间列表
  static getNextHourDate = timestamp => {
    const timestamp_trans = timestamp || current_date_timestamp
    const gold_arr = []
    for (let i = 1; i < 15; i++) {
      const cal_timestamp = timestamp_trans + i * 24 * 60 * 60 * 1000
      const { date_string, week_day_name } = this.getNeedDate(cal_timestamp)
      gold_arr.push(this.setOneDayHours({ date_string, week_day_name }))
    }
    return gold_arr
  }

  // 相对时间轴----------start
  /**
   @param string timestamp '2020-02-02 0:0:0' =>时间戳
   */
  static getRelativeTime = (timestamp = new Date().getTime()) => {
    const trans_timestamp = new Date(
      `${dateFormat(timestamp, 'yyyy/MM/dd')} 0:0:0`
    ).getTime() //转化到0：0：0
    const date_inner = []
    const obj = {
      date_no: 'T',
      timestamp: trans_timestamp, //0:0:0
      timestampEnd: trans_timestamp + 24 * 60 * 60 * 1000 - 1000, //23:59:59
      week_day: new Date(trans_timestamp).getDay()
    }
    date_inner[0] = obj
    for (let i = 1; i < 150; i++) {
      const timestamp_start = trans_timestamp + i * 24 * 60 * 60 * 1000
      const obj = {
        date_no: '+' + i,
        timestamp: timestamp_start, //0:0:0
        timestampEnd: trans_timestamp + (i + 1) * 24 * 60 * 60 * 1000 - 1000, //23:59:59
        week_day: new Date(timestamp_start).getDay()
      }
      date_inner.push(obj)
    }
    return [
      {
        // date_top: '',
        date_top: timestampToTimeNormal(timestamp),
        date_inner: date_inner
      }
    ]
  }
  /**
   @param String timestamp '2020-02-02 0:0:0' =>时间戳
   @param Number T 最新的相对时间n+T天
   @return []
   */
  static getNextRelativeTime = (timestamp, T) => {
    if (!timestamp || !T) return []
    let date_inner = []
    for (let i = 1; i < 30; i++) {
      const timestamp_start = timestamp + (T + i) * 24 * 60 * 60 * 1000 //0:0:0
      const obj = {
        date_no: '+' + (T + i),
        timestamp: timestamp_start,
        timestampEnd: timestamp + (T + i + 1) * 24 * 60 * 60 * 1000 - 1000, //23:59:59
        week_day: new Date(timestamp_start).getDay()
      }
      date_inner.push(obj)
    }
    return date_inner
  }
}
// base_utils.getYearDateData()
module.exports = base_utils
console.log('sssssssss', {
  // next: base_utils.getNextRelativeTime(),
  current: base_utils.getRelativeTime(),
  stand: base_utils.getNextMonthDate()
})
