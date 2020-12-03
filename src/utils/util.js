export const handleTimeDetailReturn = timestamp => {
  if (!timestamp) {
    return {}
  }
  const time = new Date(timestamp)
  const year = time.getFullYear()
  const month = time.getMonth() + 1
  const date = time.getDate()
  const day = time.getDay()
  const hours = time.getHours()
  const minutes = time.getMinutes()
  return {
    year,
    month,
    date,
    day,
    hours,
    minutes
  }
}

//是否同一周。以周一开始
export const isSameWeek = (oldTimestamp, nowTimestamp) => {
  var oneDayTime = 1000 * 60 * 60 * 24
  var old_count = parseInt(oldTimestamp / oneDayTime)
  var now_other = parseInt(nowTimestamp / oneDayTime)
  return parseInt((old_count + 3) / 7) == parseInt((now_other + 3) / 7)
}

//日期转换为时间戳
export const timeToTimestamp = dateString => {
  // 示例 '2014-04-23 18:55:49'
  const date = new Date(dateString)
  return date.getTime()
}
//时间戳转日期(15000000000, '-', true)
export const timestampToTimeNormal = (timestamp, split, flag) => {
  if (!timestamp) {
    return false
  }
  const timestampNew =
    timestamp.toString().length === 10
      ? Number(timestamp) * 1000
      : Number(timestamp)
  const splitNew = split || '/'
  let date = new Date(timestampNew) //时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let Y = date.getFullYear() + splitNew
  let M =
    (date.getMonth() + 1 < 10
      ? '0' + (date.getMonth() + 1)
      : date.getMonth() + 1) + splitNew
  let D =
    date.getDate() < 10 ? '0' + date.getDate() + ' ' : date.getDate() + ' '
  let h =
    date.getHours() < 10 ? '0' + date.getHours() + ':' : date.getHours() + ':'
  let m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()

  const date_ =
    date.getFullYear() == new Date().getFullYear() ? M + D : Y + M + D
  return flag ? date_ + h + m : date_
}
export const timestampToTimeNormal2 = (timestamp, split, flag) => {
  if (!timestamp) {
    return false
  }
  const timestampNew =
    timestamp.toString().length === 10
      ? Number(timestamp) * 1000
      : Number(timestamp)
  const splitNew = split || '/'
  let date = new Date(timestampNew) //时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let Y = date.getFullYear() + splitNew
  let M =
    (date.getMonth() + 1 < 10
      ? '0' + (date.getMonth() + 1)
      : date.getMonth() + 1) + splitNew
  let D =
    date.getDate() < 10 ? '0' + date.getDate() + ' ' : date.getDate() + ' '
  let h =
    date.getHours() < 10 ? '0' + date.getHours() + ':' : date.getHours() + ':'
  let m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
  const date_ =
    date.getFullYear() == new Date().getFullYear() ? M + D : Y + M + D
  return !flag ? date_ + h + m : date_
}

//时间戳转日期
export const timestampToTime = (timestamp, flag) => {
  if (!timestamp) {
    return false
  }
  const timestampNew =
    timestamp.toString().length === 10
      ? Number(timestamp) * 1000
      : Number(timestamp)
  let date = new Date(timestampNew) //时间戳为10位需*1000，时间戳为13位的话不需乘1000
  const now_year = new Date().getFullYear()
  let Y = now_year == date.getFullYear() ? '' : date.getFullYear() + '年'
  let M =
    (date.getMonth() + 1 < 10
      ? '0' + (date.getMonth() + 1)
      : date.getMonth() + 1) + '月'
  let D =
    date.getDate() < 10 ? '0' + date.getDate() + '日 ' : date.getDate() + '日 '
  let h =
    date.getHours() < 10 ? '0' + date.getHours() + ':' : date.getHours() + ':'
  let m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
  const date_ =
    date.getFullYear() == new Date().getFullYear() ? M + D : Y + M + D
  return !flag ? date_ + h + m : date_
  // return flag ? Y + M + D + h + m : Y + M + D;
}

/**
 * 时间戳转换成自定义格式
 * @param {new Date().getTime()} val
 * @param {yyyy-MM-dd HH:mm:ss} format
 */
export function dateFormat(val, format) {
  val = +val
  function Zero(number) {
    return number < 10 ? '0' + number : number
  }
  let date = new Date(val)
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  let hour = date.getHours()
  let minut = date.getMinutes()
  let secon = date.getSeconds()

  let obj = {
    yyyy: year,
    MM: Zero(month),
    dd: Zero(day),
    HH: Zero(hour),
    mm: Zero(minut),
    ss: Zero(secon)
  }

  let keys = Object.keys(obj)
  keys.forEach(item => {
    format = format.replace(item, obj[item])
  })

  return format
}
//时间戳转换为时分
export const timestampToHM = timestamp => {
  if (!timestamp) {
    return false
  }
  const timestampNew =
    timestamp.toString().length === 10
      ? Number(timestamp) * 1000
      : Number(timestamp)
  let date = new Date(timestampNew) //时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let h =
    date.getHours() < 10 ? '0' + date.getHours() + ':' : date.getHours() + ':'
  let m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
  return h + m
}

//判断是否是当天
export const judgeTimeDiffer = time => {
  let start = timestampToTimeNormal2(time)
  let end = timestampToTimeNormal2(Date.parse(new Date()))
  let startTime = new Date(start.replace('//-/g', '//'))
  let endTime = new Date(end.replace('//-/g', '//'))
  // console.log(startTime, endTime)
  let res = parseInt((endTime.getTime() - startTime.getTime()) / 1000 / 60 / 60)
  if (res >= 12) {
    return start
  } else {
    return timestampToHM(time)
  }
}
//判断评论是否超过十分钟
export const judgeTimeDiffer_ten = time => {
  let start = timestampToTimeNormal2(time)
  let end = timestampToTimeNormal2(Date.parse(new Date()))
  let startTime = new Date(start.replace('//-/g', '//'))
  let endTime = new Date(end.replace('//-/g', '//'))
  // console.log(startTime, endTime)
  let res = parseInt((endTime.getTime() - startTime.getTime()) / 1000 / 60)
  if (res > 10) {
    return true
  } else {
    return false
  }
}
//动态消息列表时间处理
export const newsDynamicHandleTime = timeStamp => {
  if (!timeStamp) {
    return false
  }
  const now = new Date()
  const day =
    new Date(timeStamp).getDay() !== 0 ? new Date(timeStamp).getDay() : 7
  const nowTime = now.getTime()

  const oneDayLong = 24 * 60 * 60 * 1000
  const MondayTime = nowTime - (now.getDay() - 1) * oneDayLong

  const differMonday = Math.floor((MondayTime - timeStamp) / (24 * 3600 * 1000)) //与本周一相差的天数1,2,3,4,5,6,7
  const NowdifferOld = Math.floor((nowTime - timeStamp) / (24 * 3600 * 1000)) //与本周一相差的天数1,2,3,4,5,6,7

  let DateDescription
  if (isSameWeek(timeStamp, nowTime)) {
    if (NowdifferOld === 0) {
      DateDescription = '今天'
    } else {
      switch (day) {
        case 1:
          DateDescription = '周一'
          break
        case 2:
          DateDescription = '周二'
          break
        case 3:
          DateDescription = '周三'
          break
        case 4:
          DateDescription = '周四'
          break
        case 5:
          DateDescription = '周五'
          break
        case 6:
          DateDescription = '周六'
          break
        case 7:
          DateDescription = '周日'
          break
        default:
          DateDescription = timestampToTime(timeStamp)
          break
      }
    }
  } else {
    if (NowdifferOld === 0) {
      DateDescription = '今天'
    } else {
      switch (differMonday) {
        case 1:
          DateDescription = '上周日'
          break
        case 2:
          DateDescription = '上周六'
          break
        case 3:
          DateDescription = '上周五'
          break
        case 4:
          DateDescription = '上周四'
          break
        case 5:
          DateDescription = '上周三'
          break
        case 6:
          DateDescription = '上周二'
          break
        case 7:
          DateDescription = '上周一'
          break
        default:
          DateDescription = timestampToTime(timeStamp)
          break
      }
    }
  }
  return DateDescription
}

//获取url参数
export const getUrlQueryString = (href, name) => {
  const reg = new RegExp(name + '=([^&]*)')
  const r = href.match(reg) //window.location.href.match(reg);
  if (r != null) return unescape(r[1])
  return null
}
//获取url参数(比较通用)
export const getQueryString = (search, name) => {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
  const _search_ = search || window.location.search
  const r = _search_.substr(1).match(reg)
  if (r != null) {
    return unescape(r[2])
  }
  return null
}
export const getLocationUrlQueryString = name => {
  const reg = new RegExp(name + '=([^&]*)')
  const r = window.location.href.match(reg) //window.location.href.match(reg);
  if (r != null) return unescape(r[1])
  return null
}

//对象深拷贝
export const deepClone = obj => {
  if (!obj) {
    return
  }
  var newObj = obj.constructor === Array ? [] : {}
  if (typeof obj !== 'object') {
    return
  } else {
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        newObj[i] = typeof obj[i] === 'object' ? deepClone(obj[i]) : obj[i]
      }
    }
  }
  return newObj
}

//冒泡兼容
export const stopPropagation = e => {
  e = e || window.event
  if (e.stopPropagation) {
    //这是取消冒泡
    e.stopPropagation()
  } else {
    e.cancelBubble = true
  }
}

//去除空格
export const trimSpace = str => {
  return str.replace(/\s+/g, '')
}
//去除换行

export const trimLineBack = str => {
  return str.replace(/<\/?.+?>/g, '').replace(/[\r\n]/g, '')
}

//debounce

// fn是我们需要包装的事件回调, delay是每次推迟执行的等待时间
export function debounce(fn, delay) {
  // 定时器
  let timer = null

  // 将debounce处理结果当作函数返回
  return function() {
    // 保留调用时的this上下文
    let context = this
    // 保留调用时传入的参数
    let args = arguments

    // 每次事件被触发时，都去清除之前的旧定时器
    if (timer) {
      clearTimeout(timer)
    }
    // 设立新定时器
    timer = setTimeout(function() {
      fn.apply(context, args)
    }, delay)
  }
}

// fn是我们需要包装的事件回调, delay是时间间隔的阈值
export function throttle(fn, delay) {
  // last为上一次触发回调的时间, timer是定时器
  let last = 0,
    timer = null
  // 将throttle处理结果当作函数返回

  return function() {
    // 保留调用时的this上下文
    let context = this
    // 保留调用时传入的参数
    let args = arguments
    // 记录本次触发回调的时间
    let now = +new Date()

    // 判断上次触发的时间和本次触发的时间差是否小于时间间隔的阈值
    if (now - last < delay) {
      // 如果时间间隔小于我们设定的时间间隔阈值，则为本次触发操作设立一个新的定时器
      clearTimeout(timer)
      timer = setTimeout(function() {
        last = now
        fn.apply(context, args)
      }, delay)
    } else {
      // 如果时间间隔超出了我们设定的时间间隔阈值，那就不等了，无论如何要反馈给用户一次响应
      last = now
      fn.apply(context, args)
    }
  }
}

export function isColor(color) {
  var re1 = /^#([0-9a-f]{6}|[0-9a-f]{3})$/i
  var re2 = /^rgb\(([0-9]|[0-9][0-9]|25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9])\,([0-9]|[0-9][0-9]|25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9])\,([0-9]|[0-9][0-9]|25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9])\)$/i
  var re3 = /^rgba\(([0-9]|[0-9][0-9]|25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9])\,([0-9]|[0-9][0-9]|25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9])\,([0-9]|[0-9][0-9]|25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9])\,(1|1.0|0.[0-9])\)$/i
  return re2.test(color) || re1.test(color) || re3.test(color)
}

// 比较两个时间戳的大小, (10位和13位)
export const compareTwoTimestamp = (timeStampA, timestampB) => {
  if (!timeStampA || !timestampB) {
    return true
  }
  const new_time_a =
    timeStampA.toString().length < 13
      ? Number(timeStampA) * 1000
      : Number(timeStampA)
  const new_time_b =
    timestampB.toString().length < 13
      ? Number(timestampB) * 1000
      : Number(timestampB)
  return new_time_a > new_time_b
}

// 比较两个时间是否同一天
export const isSamDay = (timestamp, timestamp2) => {
  if (!!!timestamp || !!!timestamp2) {
    return false
  }
  const new_time_a =
    timestamp.toString().length < 13
      ? Number(timestamp) * 1000
      : Number(timestamp)
  const new_time_b =
    timestamp2.toString().length < 13
      ? Number(timestamp2) * 1000
      : Number(timestamp2)
  return (
    new Date(new_time_a).toDateString() == new Date(new_time_b).toDateString()
  )
}
// 比较两个时间是否同一天同一小时
export const isSamHour = (timestamp, timestamp2) => {
  if (isSamDay(timestamp, timestamp2)) {
    return (
      new Date(transformTimestamp(timestamp)).getHours() ===
      new Date(transformTimestamp(timestamp2)).getHours()
    )
  }
  return false
}

// 设置时间过期和当天方案
export const timeColor = timestamp => {
  if (!!!timestamp) {
    return ''
  }
  const new_timestamp =
    timestamp.toString().length === 10
      ? Number(timestamp) * 1000
      : Number(timestamp)
  const today = new Date()
  const today_timestamp = today.getTime()
  const today_year = today.getFullYear()
  const today_month = today.getMonth()
  const today_day = today.getDate()
  const today_last_time = new Date(
    today_year,
    today_month,
    today_day,
    '23',
    '59',
    '59'
  ).getTime()
  let color = ''
  if (new_timestamp < today_timestamp) {
    //逾期
    color = '#FF7875'
  } else {
    if (new_timestamp < today_last_time) {
      //此刻和今天最后一秒之间
      color = '#FAAD14'
    }
  }
  return color
}

// 时间戳转成相应的日期
export const handleTimeStampToDate = timeStamp => {
  if (!timeStamp) {
    return false
  }
  const now = new Date()
  const year_ = now.getFullYear()
  const month_ = now.getMonth() + 1
  const date_ = now.getDate() == '1' ? '2' : now.getDate()
  const nowTime = now.getTime()
  const new_now_time = new Date(`${year_}/${month_}/${date_} 0:0`).getTime()

  const ob_time = new Date(timeStamp)
  const ob_day = ob_time.getDay() !== 0 ? ob_time.getDay() : 7
  const ob_year = ob_time.getFullYear()
  const ob_month = ob_time.getMonth() + 1
  const ob_date = ob_time.getDate()
  const ob_new_timestamp = new Date(
    `${ob_year}/${ob_month}/${ob_date} 23:59`
  ).getTime()

  let DateDescription

  if (isSamDay(nowTime, timeStamp)) {
    DateDescription = '今天'
  } else {
    if (isSameWeek(ob_new_timestamp, new_now_time)) {
      switch (ob_day) {
        case 1:
          DateDescription = '本周一'
          break
        case 2:
          DateDescription = '本周二'
          break
        case 3:
          DateDescription = '本周三'
          break
        case 4:
          DateDescription = '本周四'
          break
        case 5:
          DateDescription = '本周五'
          break
        case 6:
          DateDescription = '本周六'
          break
        case 7:
          DateDescription = '本周日'
          break
        default:
          DateDescription = timestampToTime(timeStamp)
          break
      }
    } else {
      DateDescription = timestampToTime(timeStamp)
    }
  }

  return DateDescription
}

export const isOverdueTime = timestamp => {
  if (!!!timestamp) {
    return ''
  }
  const new_timestamp =
    timestamp.length === 10 ? Number(timestamp) * 1000 : Number(timestamp)
  const today = new Date()
  const today_timestamp = today.getTime()
  const today_year = today.getFullYear()
  const today_month = today.getMonth()
  const today_day = today.getDate()
  const today_last_time = new Date(
    today_year,
    today_month,
    today_day,
    '23',
    '59',
    '59'
  ).getTime()
  let color = ''
  if (new_timestamp < today_timestamp) {
    //逾期
    return true
  }
  return false
}

/* 过滤文件格式 (缩略图显示) */
export const filterFileFormatType = fileName => {
  let themeCode = ''
  const type = fileName.substr(fileName.lastIndexOf('.')).toLowerCase()
  switch (type) {
    case '.3dm':
      themeCode = '&#xe6e0;'
      break
    case '.iges':
      themeCode = '&#xe658;'
      break
    case '.obj':
      themeCode = '&#xe65b;'
      break
    case '.ma':
      themeCode = '&#xe65f;'
      break
    case '.mb':
      themeCode = '&#xe64f;'
      break
    case '.skp':
      themeCode = '&#xe6e8;'
      break
    case '.dwg':
      themeCode = '&#xe64c;'
      break
    case '.psd':
      themeCode = '&#xe65d;'
      break
    case '.pdf':
      themeCode = '&#xe651;'
      break
    case '.doc':
      themeCode = '&#xe64d;'
      break
    case '.xls':
      themeCode = '&#xe65e;'
      break
    case '.ppt':
      themeCode = '&#xe655;'
      break
    case '.docx':
      themeCode = '&#xe64a;'
      break
    case '.xlsx':
      themeCode = '&#xe65c;'
      break
    case '.pptx':
      themeCode = '&#xe650;'
      break
    case '.key':
      themeCode = '&#xe64e;'
      break
    case '.jpg':
      themeCode = '&#xe653;'
      break
    case '.jpeg':
      themeCode = '&#xe659;'
      break
    case '.png':
      themeCode = '&#xe69a;'
      break
    case '.gif':
      themeCode = '&#xe657;'
      break
    case '.mp4':
      themeCode = '&#xe6e1;'
      break
    case '.mp3':
      themeCode = '&#xe6e2;'
      break
    case '.txt':
      themeCode = '&#xe654;'
      break
    case '.rar':
      themeCode = '&#xe6e4;'
      break
    case '.zip':
      themeCode = '&#xe6e5;'
      break
    case '.7z':
      themeCode = '&#xe6e6;'
      break
    case '.gz':
      themeCode = '&#xe6e7;'
      break
    default:
      themeCode = '&#xe660;' // 未识别类型显示
      break
  }
  return themeCode
}

/**
 * 比较两个对象是否相等 (属性)
 * @return {Boolean} 该方法返回一个布尔值, fasle 表示不相等, true表示相等
 * @param {Object} obj1 对象1
 * @param {Object} obj2 对象2
 */
export const compareACoupleOfObjects = (obj1, obj2) => {
  let flag
  let o1 = obj1 instanceof Object
  let o2 = obj2 instanceof Object
  if (!o1 || !o2) {
    /*  判断不是对象  */
    return obj1 === obj2
  }

  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    flag = false
    return flag
    //Object.keys() 返回一个由对象的自身可枚举属性(key值)组成的数组,例如：数组返回下表：let arr = ["a", "b", "c"];console.log(Object.keys(arr))->0,1,2;
  }

  for (let attr in obj1) {
    let t1 = obj1[attr] instanceof Object
    let t2 = obj2[attr] instanceof Object
    if (t1 && t2) {
      return compareACoupleOfObjects(obj1[attr], obj2[attr])
    } else if (obj1[attr] !== obj2[attr]) {
      flag = false
      return flag
    }
  }
  flag = true
  return flag
}

/**
 * 比较两个对象是否相等 (值)
 * @param {*} arrya1
 * @param {*} array2
 */
export const isObjectValueEqual = (obj1, obj2) => {
  if (!obj1 || !obj2) {
    return obj1 === obj2
  }
  let aProps = Object.getOwnPropertyNames(obj1)
  let bProps = Object.getOwnPropertyNames(obj2)
  if (aProps.length != bProps.length) {
    return false
  }
  for (let i = 0; i < aProps.length; i++) {
    let propName = aProps[i]

    let propA = obj1[propName]
    let propB = obj2[propName]
    if (typeof propA === 'object') {
      if (isObjectValueEqual(propA, propB)) {
        // return true     这里不能return ,后面的对象还没判断
      } else {
        return false
      }
    } else if (propA !== propB) {
      return false
    } else {
    }
  }
  return true
}

/**
 * 比较两个数组是否相等
 * @param {Array} arrya1 数组1
 * @param {Array} array2 数组2
 * @returns {Boolean} 该方法返回一个布尔值, false 表示不相等 true表示相等
 */
export const isArrayEqual = (arrya1, array2) => {
  if (!arrya1 || !array2) return false
  // 比较长度
  if (arrya1.length != array2.length) return false
  for (let i in arrya1) {
    if (arrya1[i] instanceof Array && array2[i] instanceof Array) {
      // 这里递归判断嵌套数组
      if (!isArrayEqual.call(this, arrya1[i], array2[i])) return false
    } else if (arrya1[i] != array2[i]) {
      // 注意: 对象不等于对象
      return false
    }
  }
  // for (let i = 0, l = arrya1.length; i < l; i++) {
  //   // 检查是否是嵌套数组
  //   if (arrya1[i] instanceof Array && array2[i] instanceof Array) {
  //     // 这里递归判断嵌套数组
  //     if (!isArrayEqual.call(this, arrya1[i], array2[i]))
  //       return false;
  //   }
  //   else if (arrya1[i] != array2[i]) {
  //     // 注意: 对象不等于对象
  //     return false;
  //   }
  // }
  return true
}

// 将时间戳统一转化成13位
export const transformTimestamp = timestamp => {
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

// json对象数组排序 arr.sort(jsonArrayCompareSort(key))
export const jsonArrayCompareSort = function(prop, handleValue) {
  return function(obj1, obj2) {
    let val1 = obj1[prop]
    let val2 = obj2[prop]
    if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
      val1 = Number(val1)
      val2 = Number(val2)
    }
    if (typeof handleValue == 'function') {
      //数据需要再进一步处理
      val1 = handleValue(val1)
      val2 = handleValue(val2)
    }
    if (val1 < val2) {
      return -1
    } else if (val1 > val2) {
      return 1
    } else {
      return 0
    }
  }
}

/**
 * 时间冒泡排序
 * 想要根据传入的字段进行排序
 * @param {Array} theTimeArr 当前需要排序的时间数组
 * @param {prop} 当前需要用来比较的字段
 * @returns {Array} 返回了一个从小->大的时间数组
 */
// 时间冒泡排序
export const timeSort = (theTimeArr, prop) => {
  if (!theTimeArr) return []
  if (!prop) return theTimeArr
  let maxLen = theTimeArr.length
  for (let i = 0; i < maxLen; i++) {
    for (let j = 0; j < maxLen - i - 1; j++) {
      // 如果说不存在这个元素
      if (!theTimeArr[j][prop]) theTimeArr[j][prop] = ''
      if (!theTimeArr[j + 1][prop]) theTimeArr[j + 1][prop] = ''
      if (theTimeArr[j][prop] > theTimeArr[j + 1][prop]) {
        // 如果说前面的时间比后面的大, 那么把大的时间放在后面

        let tmplObj = theTimeArr[j]

        theTimeArr[j] = theTimeArr[j + 1]

        theTimeArr[j + 1] = tmplObj
      } else {
        // 如果说前面的时间比后面的小, 保持不变
        let tmplObj = theTimeArr[j]
        theTimeArr[j] = tmplObj
      }
    }
  }
  return theTimeArr
}

// 将时间戳转换成所需要的时间戳
export const getDigit = timestamp => {
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

/**
 * 数组去重
 * @param {Array} arr 需要去重的数组
 * @param {*} key 需要判断的字段 默认为ID
 */
export const arrayNonRepeatfy = (arr, key = 'id') => {
  let temp_arr = []
  let temp_id = []
  for (let i = 0; i < arr.length; i++) {
    if (!temp_id.includes(arr[i][key])) {
      //includes 检测数组是否有某个值
      temp_arr.push(arr[i])
      temp_id.push(arr[i][key])
    }
  }
  return temp_arr
}

/**
 * 去除空数组
 * @param {Array} arr 需要去除的数组
 */
export const removeEmptyArrayEle = arr => {
  if (!arr) return []
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == undefined) {
      arr.splice(i, 1)
      i = i - 1 // i - 1 ,因为空元素在数组下标 2 位置，删除空之后，后面的元素要向前补位，
    }
  }
  return arr
}

/*处理时间格式 */
// eslint-disable-next-line no-extend-native
Date.prototype.Format = function(fmt) {
  //author: meizz
  var o = {
    'M+': this.getMonth() + 1, //月份
    'd+': this.getDate(), //日
    'h+': this.getHours(), //小时
    'm+': this.getMinutes(), //分
    's+': this.getSeconds(), //秒
    'q+': Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds() //毫秒
  }
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (this.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  for (var k in o)
    if (new RegExp('(' + k + ')').test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
  return fmt
}

/**
 * 处理时间格式方法
 * @param {*} millisecond 时间错
 * @param {*} format 格式
 */
export const timestampFormat = (millisecond, format) => {
  millisecond =
    millisecond.length === 10 ? Number(millisecond) * 1000 : Number(millisecond)
  if (millisecond) {
    var date = new Date()
    date.setTime(millisecond)
    return date.Format(format || 'yyyy-MM-dd hh:mm:ss')
  } else {
    return null
  }
}

export const delayInGenerator = ms =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, ms)
  })

/**
 * 获取相对时间
 * @param {Sring|Number} value 需要增加的天数
 * @param {String|Number} timestamp 基准时间
 */
export const getRelativeTimeTamp = (value, timestamp) => {
  let timestamp_ =
    String(timestamp).length == 10
      ? Number(timestamp)
      : parseInt(timestamp / 1000)
  return timestamp_ + value * (24 * 3600)
}

/**
 * 计算两个日期的相差天数 不比较小时分钟
 * @param {String|Number} timestamp1 设置的基准时间
 * @param {String|Number} timestamp2 需要比较的时间
 */
export const caldiffDays = (timestamp1, timestamp2) => {
  if (!timestamp1 || !timestamp2) return ''
  let dateSpan, tempDate, iDays
  let timestamp1_ =
    String(timestamp1).length == 10
      ? Number(timestamp1) * 1000
      : Number(timestamp1)
  let timestamp2_ =
    String(timestamp2).length == 10
      ? Number(timestamp2) * 1000
      : Number(timestamp2)
  let sDate1 = dateFormat(timestamp1_, 'yyyy-MM-dd') //timestampToTimeNormal(timestamp1, '/')
  let sDate2 = dateFormat(timestamp2_, 'yyyy-MM-dd') //timestampToTimeNormal(timestamp2, '/')
  sDate1 = Date.parse(sDate1)
  sDate2 = Date.parse(sDate2)
  dateSpan = sDate2 - sDate1
  dateSpan = Math.abs(dateSpan)
  iDays = Math.floor(dateSpan / (24 * 3600 * 1000))
  return iDays
}

/**
 * base64转file
 * @param {string} dataurl base64的字符串
 * @param {string} filename 文件名称
 */
export const dataURLtoFile = (dataurl, filename) => {
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}
