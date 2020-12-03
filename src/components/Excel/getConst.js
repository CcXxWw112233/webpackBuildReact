import styles from './index.less'
/**
 * 设置错误状态
 * @param {Array} columns 对应table中的列
 * @param {Array} data 对应table中的每一行数据
 * @param {String} text 表格中绑定的列columns 这里是 A B C D.... 表头
 * @param {String} name 表格中绑定的列的字段 这里是 number, name, type .... 等
 */
export const setErrorStageOrUpdate = ({
  columns = [],
  data = [],
  text,
  name
}) => {
  return data.map(item => {})
}

// 选择类型文字判断
export const GENRE_TYPE_REG = /^里程碑$|^任务$|^子任务$|^子里程碑$/

// 正整数
export const POSITIVE_INTEGER_REG = /^[0-9]*[1-9][0-9]*$/

// 获取对象中键的值
export const gold_value = (selectedKey = {}, gold_type) => {
  Object.keys(selectedKey).find(key => selectedKey[key] === gold_type)
}
// 获取序号有几个点
export const getCatogaryNoStage = scrstr => {
  var count = 0
  while (scrstr.indexOf('.') != -1) {
    scrstr = scrstr.replace('.', '')
    count++
  }
  return count
}
/**
 * 判断序号在表头第几列
 * @param {String|Number} gold_no 必须是数字类型
 * @param {String} gold_type 对应类型的值
 */
export const valiNameWithNo = (gold_no, gold_type) => {
  const align_type = {
    0: ['里程碑', '任务'],
    1: ['子里程碑', '任务', '子任务'],
    2: ['任务', '子任务'],
    3: ['子任务']
  }
  const point_no = getCatogaryNoStage(gold_no)
  return (align_type[point_no] || []).includes(gold_type)
}
/**
 * 当前需要做比较的列
 * @param {Object} item 当前表格中一行的数据 { A: 1, B: '任务', C: '描述' ... }
 * @param {String} gold_type 表示当前操作的列 A,B,C
 * @param {String} dictionary 需要比较的列 'number' | 'type'
 */
export const valiColumn = ({
  item,
  gold_type,
  dictionary,
  selectedKey = {}
}) => {
  let gold_no // A B C D E
  // let gold_type = dictionary // A B C D E
  // 找出需要做比较的列
  for (let i in selectedKey) {
    if (selectedKey[i] == dictionary) {
      gold_no = i
      break
    }
  }
  if (!gold_no) return true
  return dictionary == 'type'
    ? valiNameWithNo(item[gold_type], item[gold_no])
    : valiNameWithNo(item[gold_no], item[gold_type])
}

/**
 * 校验序号
 * @param {String} symbol 表示需要校验的符号类型
 * @param {String} val 表示需要校验的值
 * @param {Boolean} checkType 表示是否需要校验类型
 * @param {Object} item 当前表格中一行的数据 { A: 1, B: '任务', C: '描述' ... }
 * @param {String} gold_type 表示当前操作的列 A,B,C
 * @param {String} dictionary 需要比较的列 'number' | 'type'
 * @param {Object} selectedKey { A:number,B:type... }
 * @returns {Boolean} true 表示验证通过
 */
export const checkNumberReg = ({
  symbol = '.',
  val,
  checkType,
  item,
  gold_type,
  dictionary,
  selectedKey
}) => {
  let len = String(val).split(symbol).length
  if (!val || String(val).trimLR() == '') return false
  if (checkType) {
    if (String(val).indexOf(symbol) != -1) {
      // 表示有小数点的时候
      if (
        len > 4 ||
        !valiColumn({ item, gold_type, dictionary, selectedKey })
      ) {
        return false
      }
    } else {
      // 表示没有小数点的时候
      if (
        (isNaN(val) && !POSITIVE_INTEGER_REG.test(val)) ||
        !valiColumn({ item, gold_type, dictionary, selectedKey })
      ) {
        return false
      }
    }
  } else {
    if (!isNaN(+val) && +val % 1 === 0) {
      return true
    }
    // 表示没有小数点的时候
    if (String(val).indexOf(symbol) != -1) {
      // 表示有小数点的时候
      if (len > 4) {
        return false
      }
    } else {
      // 表示没有小数点的时候
      if (!val) {
        return false
      }
      return false
    }
  }
  return true
}

/**
 * 校验类型是否正确
 * @param {String} val 需要进行校验的值
 * @param {Boolean} checkNumer 是否需要校验序号 true表示需要
 * @param {Object} item 当前表格中一行的数据 { A: 1, B: '任务', C: '描述' ... }
 * @param {String} gold_type 表头 A,B,C,D....
 * @param {String} dictionary 需要比较的列 A,B,C
 * @param {Object} selectedKey { A:number,B:type... }
 * @returns {Boolean} true 表示校验通过
 */
export const checkTypeReg = ({
  val,
  checkNumer,
  item,
  gold_type,
  dictionary,
  selectedKey
}) => {
  if (!val || String(val).trimLR() == '') return false
  if (checkNumer) {
    if (
      val == '' ||
      String(val).trimLR() == '' ||
      !GENRE_TYPE_REG.test(val) ||
      !valiColumn({ item, gold_type, dictionary, selectedKey })
    ) {
      return false
    }
  } else {
    if (val == '' || String(val).trimLR() == '' || !GENRE_TYPE_REG.test(val)) {
      return false
    }
  }
  return true
}

/**
 * 校验名称
 * @param {String} val 校验的value值
 * @returns {Boolean} true 表示校验通过
 */
export const checkNameReg = val => {
  if (val == '' || String(val).trimLR() == '' || String(val).length > 100) {
    return false
  }
  return true
}

/**
 * 校验时间格式
 * @param {String} time_format 时间类型
 * @returns {Boolean} true表示验证通过
 */
export const checkTimerReg = (time_format, val) => {
  if (val == '') return true
  let time_reg = ''
  switch (time_format) {
    case 'YYYY-MM-DD':
      time_reg = YYYYMMDDREG
      break
    case 'YYYY-MM-DD HH:mm':
      time_reg = YYYYMMDD_HHMM_REG
      break
    case 'YYYY/MM/DD':
      time_reg = YYYYMMDD_REG_1
      break
    case 'YYYY/MM/DD HH:mm':
      time_reg = YYYYMMDD_HHMM_REG_1
      break
    default:
      break
  }
  return time_reg.test(val)
}

/**
 * 比较开始和结束时间
 * @param {*} start_time
 * @param {*} due_time
 * @returns {Boolean} true表示验证通过表示开始时间早于结束时间
 */
export const compareStartDueTime = (start_time, due_time) => {
  if (!start_time || !due_time) {
    return true
  }
  const newStartTime =
    start_time.toString().length > 10
      ? Number(start_time) / 1000
      : Number(start_time)
  const newDueTime =
    due_time.toString().length > 10 ? Number(due_time) / 1000 : Number(due_time)
  if (newStartTime > newDueTime) {
    return false
  }
  return true
}

/**
 * MSDN中定义的DateTime对象的有效范围是：0001-01-01 00:00:00到9999-12-31 23:59:59。
 * UNIX时间戳的0按照ISO 8601规范为 ：1970-01-01T00:00:00Z。
 * 先考虑与年份无关的前三条规则，年份可统一写作 (?!0000)[0-9]{4}
 *下面仅考虑月和日的正则

  1. 包括平年在内的所有年份的月份都包含1-28日

  (0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-8])

  2. 包括平年在内的所有年份除2月外都包含29和30日

  (0[13-9]|1[0-2])-(29|30)

  3. 包括平年在内的所有年份1、3、5、7、8、10、12月都包含31日

  (0[13578]|1[02])-31)

  合起来就是除闰年的2月29日外的其它所有日期

  (?!0000)[0-9]{4}-((0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-8])|(0[13-9]|1[0-2])-(29|30)|(0[13578]|1[02])-31)

  接下来考虑闰年的实现

  1 : 四年一闰
  ([0-9]{2}(0[48]|[2468][048]|[13579][26])

  2 : 百年不闰，四百年再闰
  (0[48]|[2468][048]|[13579][26])00

  3 : 合起来就是所有闰年的2月29日
  ([0-9]{2}(0[48]|[2468][048]|[13579][26])|(0[48]|[2468][048]|[13579][26])00)-02-29)

  四条规则都已实现，且互相间没有影响，合起来就是所有符合DateTime范围的日期的正则

  ^((?!0000)[0-9]{4}-((0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-8])|(0[13-9]|1[0-2])-(29|30)|(0[13578]|1[02])-31)|([0-9]{2}(0[48]|[2468][048]|[13579][26])|(0[48]|[2468][048]|[13579][26])00)-02-29)$


  考虑到这个正则表达式仅仅是用作验证，所以捕获组没有意义，只会占用资源，影响匹配效率，所以可以使用非捕获组来进行优化。

  ^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$
 *
 *
 *
 */
// 2020-10-15
export const YYYYMMDDREG = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/

// 2020/10/15
export const YYYYMMDD_REG_1 = /^(?:(?!0000)[0-9]{4}[\/](?:(?:0[1-9]|1[0-2])[\/](?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])[\/](?:29|30)|(?:0[13578]|1[02])[\/]31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)[\/]02[\/]29)$/

// 小时和分钟也可以是一位
// export const YYYYMMDD_HHMM = /^[1-2][0-9][0-9][0-9]-([1][0-2]|0?[1-9])-([12][0-9]|3[01]|0?[1-9]) ([01]?[0-9]|[2][0-3]):[0-5]?[0-9]$/

// 小时和分钟必须是两位 2020-10-15 09:40
export const YYYYMMDD_HHMM_REG = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29) ([01][0-9]|[2][0-3]):[0-5][0-9]$/

// 2020/10/15 09:40
export const YYYYMMDD_HHMM_REG_1 = /^(?:(?!0000)[0-9]{4}[\/](?:(?:0[1-9]|1[0-2])[\/](?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])[\/](?:29|30)|(?:0[13578]|1[02])[\/]31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)[\/]02[\/]29) ([01][0-9]|[2][0-3]):[0-5][0-9]$/
