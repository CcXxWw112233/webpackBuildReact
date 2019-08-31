//是否同一周。以周一开始
export const isSameWeek = (oldTimestamp, nowTimestamp) => {
  var oneDayTime = 1000 * 60 * 60 * 24;
  var old_count = parseInt(oldTimestamp / oneDayTime);
  var now_other = parseInt(nowTimestamp / oneDayTime);
  return parseInt((old_count + 3) / 7) == parseInt((now_other + 3) / 7);
}

//日期转换为时间戳
export const timeToTimestamp = (dateString) => { // 示例 '2014-04-23 18:55:49'
  const date = new Date(dateString)
  return date.getTime()
}
//时间戳转日期(15000000000, '-', true)
export const timestampToTimeNormal = (timestamp, split, flag) => {
  if(!timestamp){
    return false
  }
  const timestampNew = timestamp.length === 10 ? Number(timestamp) * 1000: Number(timestamp)
  const splitNew = split || '/'
  let date = new Date(timestampNew);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let Y = date.getFullYear() + splitNew;
  let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + splitNew;
  let D = date.getDate() < 10 ? '0' + date.getDate() + ' ' : date.getDate() + ' ';
  let h = date.getHours() < 10 ? '0' + date.getHours() + ':' : date.getHours() + ':';
  let m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes() ;
  return flag ? Y + M + D + h + m : Y + M + D;
}
export const timestampToTimeNormal2 = (timestamp, split, flag) => {
  if(!timestamp){
    return false
  }
  const timestampNew = timestamp.length === 10 ? Number(timestamp) * 1000: Number(timestamp)
  const splitNew = split || '/'
  let date = new Date(timestampNew);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let Y = date.getFullYear() + splitNew;
  let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + splitNew;
  let D = date.getDate() < 10 ? '0' + date.getDate() + ' ' : date.getDate() + ' ';
  let h = date.getHours() < 10 ? '0' + date.getHours() + ':' : date.getHours() + ':';
  let m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes() ;
  return !flag ? Y + M + D + h + m : Y + M + D;
}

//时间戳转日期
export const timestampToTime = (timestamp, flag) => {
  if(!timestamp){
    return false
  }
  const timestampNew = timestamp.length === 10 ? Number(timestamp) * 1000: Number(timestamp)
  let date = new Date(timestampNew);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let Y = date.getFullYear() + '年';
  let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '月';
  let D = date.getDate() < 10 ? '0' + date.getDate() + '日 ' : date.getDate() + '日 ';
  let h = date.getHours() < 10 ? '0' + date.getHours() + ':' : date.getHours() + ':';
  let m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes() ;
  return flag ? Y + M + D + h + m : Y + M + D;
}
//时间戳转换为时分
export const timestampToHM = (timestamp) => {
  if(!timestamp){
    return false
  }
  const timestampNew = timestamp.length === 10 ? Number(timestamp) * 1000: Number(timestamp)
  let date = new Date(timestampNew);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let h = date.getHours() < 10 ? '0' + date.getHours() + ':' : date.getHours() + ':';
  let m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes() ;
  return h + m
}

//判断是否是当天
export const judgeTimeDiffer = (time) => {
  let start = timestampToTimeNormal2(time)
  let end = timestampToTimeNormal2(Date.parse(new Date()));
  let startTime =new Date(start.replace("//-/g", "//"));
  let endTime = new Date(end.replace("//-/g", "//"));
  // console.log(startTime, endTime)
  let res = parseInt((endTime.getTime() - startTime.getTime()) / 1000 / 60 / 60);
  if(res >= 12){
    return (
      start
    )
  } else {
    return (
      timestampToHM(time)
    )
  }
}
//判断评论是否超过十分钟
export const judgeTimeDiffer_ten = (time) => {
  let start = timestampToTimeNormal2(time)
  let end = timestampToTimeNormal2(Date.parse(new Date()));
  let startTime =new Date(start.replace("//-/g", "//"));
  let endTime = new Date(end.replace("//-/g", "//"));
  // console.log(startTime, endTime)
  let res = parseInt((endTime.getTime() - startTime.getTime()) / 1000 / 60);
  if(res > 10){
    return (
      true
    )
  } else {
    return (
      false
    )
  }
}
//动态消息列表时间处理
export const newsDynamicHandleTime = (timeStamp) => {
  if(!timeStamp) {
    return false
  }
  const now = new Date();
  const day = new Date(timeStamp).getDay() !== 0 ? new Date(timeStamp).getDay() : 7 ;
  const nowTime = now.getTime();

  const oneDayLong = 24 * 60 * 60 * 1000;
  const MondayTime = nowTime - (now.getDay() - 1 ) * oneDayLong;

  const differMonday = Math.floor((MondayTime - timeStamp)/ (24 * 3600 * 1000)) //与本周一相差的天数1,2,3,4,5,6,7
  const NowdifferOld = Math.floor((nowTime - timeStamp)/ (24 * 3600 * 1000)) //与本周一相差的天数1,2,3,4,5,6,7

  let DateDescription
  if(isSameWeek(timeStamp, nowTime)) {
    if(NowdifferOld === 0) {
      DateDescription = '今天'
    }else{
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
  }else{
    if(NowdifferOld === 0) {
      DateDescription = '今天'
    }else{
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
  const reg = new RegExp(name +"=([^&]*)");
  const r = href.match(reg)//window.location.href.match(reg);
  if(r!=null)return unescape(r[1]); return null;
}

export const getLocationUrlQueryString = (name) => {
  const reg = new RegExp(name +"=([^&]*)");
  const r = window.location.href.match(reg)//window.location.href.match(reg);
  if(r!=null)return unescape(r[1]); return null;
}

//对象深拷贝
export const deepClone = (obj) => {
  if(!obj) {
    return
  }
  var newObj = obj.constructor === Array ? []:{};
  if(typeof obj !== 'object'){
    return
  }else{
    for(var i in obj){
      if(obj.hasOwnProperty(i)){
        newObj[i] = typeof obj[i] === 'object'?deepClone(obj[i]):obj[i];
      }
    }
  }
  return newObj
}

//冒泡兼容
export const stopPropagation = (e) => {
  e = e||window.event;
  if (e.stopPropagation) {//这是取消冒泡
    e.stopPropagation();
  } else{
    e.cancelBubble = true;
  };
}

//去除空格
export const trimSpace = str => {
  return str.replace(/\s+/g, "");
};
//去除换行

export const trimLineBack = str => {
  return str.replace(/<\/?.+?>/g, "").replace(/[\r\n]/g, "");
};

//debounce

// fn是我们需要包装的事件回调, delay是每次推迟执行的等待时间
export function debounce(fn, delay) {
  // 定时器
  let timer = null

  // 将debounce处理结果当作函数返回
  return function () {
    // 保留调用时的this上下文
    let context = this
    // 保留调用时传入的参数
    let args = arguments

    // 每次事件被触发时，都去清除之前的旧定时器
    if(timer) {
        clearTimeout(timer)
    }
    // 设立新定时器
    timer = setTimeout(function () {
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
  return re2.test(color) || re1.test(color) || re3.test(color);
}

// 比较两个时间戳的大小, (10位和13位)
export const compareTwoTimestamp = (timeStampA, timestampB) => {
  if(!timeStampA || !timestampB) {
    return true
  }
  const new_time_a = timeStampA.toString().length < 13? Number(timeStampA) * 1000: Number(timeStampA)
  const new_time_b = timestampB.toString().length < 13? Number(timestampB) * 1000: Number(timestampB)
  return new_time_a > new_time_b
}