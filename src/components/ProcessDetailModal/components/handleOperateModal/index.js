import { Modal } from 'antd'

// 渲染删除模板信息confirm
const showDeleteTempleteConfirm = ({
  processTempleteDelete,
  title,
  content
}) => {
  const modal = Modal.confirm()
  modal.update({
    title: title ? title : '删除模板',
    content: content ? content : '确认删除该模板吗？',
    zIndex: 1110,
    okText: '确认',
    cancelText: '取消',
    style: {
      letterSpacing: '1px'
    },
    // getContainer: getContainer ? getContainer : triggerNode => triggerNode.parentNode,
    onOk: () => {
      processTempleteDelete()
    },
    onCancel: () => {
      modal.destroy()
    }
  })
}

// 数组去重
const arrayNonRepeatfy = arr => {
  let temp_arr = []
  let temp_id = []
  for (let i = 0; i < arr.length; i++) {
    if (!temp_id.includes(arr[i]['user_id'])) {
      //includes 检测数组是否有某个值
      temp_arr.push(arr[i])
      temp_id.push(arr[i]['user_id'])
    }
  }
  return temp_arr
}

/**
 * 获取流程执行人列表
 * 因为这个弹窗是共用的, 所以需要从外部接收一个 principalList执行人列表
 * 思路: 如果返回的 assignee_type == 1 那么表示需要获取项目列表中的成员
 * @param {Array} nodes 当前弹窗中所有节点的推进人
 */
const genPrincipalListFromAssignees = (nodes = []) => {
  return nodes.reduce((acc, curr) => {
    if (curr.assignees && curr.assignees.length) {
      // 表示当前节点中存在推进人
      const genNewPersonList = (arr = []) => {
        // 得到一个新的person列表
        return arr.map(user => ({
          avatar: user.avatar,
          name: user.full_name
            ? user.full_name
            : user.name
            ? user.name
            : user.user_id
            ? user.user_id
            : '',
          user_id: user.user_id
        }))
      }
      // 执行人去重
      const newPersonList = genNewPersonList(arrayNonRepeatfy(curr.assignees))
      return [
        ...acc,
        ...newPersonList.filter(i => !acc.find(a => a.name === i.name))
      ]
    } else if (curr.assignee_type && curr.assignee_type == '1') {
      // 这里表示是任何人, 那么就是获取项目列表中的成员
      const newPersonList = []
      return [
        ...acc,
        ...newPersonList.filter(i => !acc.find(a => a.name === i.name))
      ]
    }
    return acc
  }, [])
}

/**
 * 获取都是ID的执行人数组
 * @param {*} type
 */
const transformNewAssigneesToString = item => {
  if (!!!item) return []
  let tempItem
  if (item instanceof Array) {
    tempItem = [...item]
  } else {
    tempItem = new Array(item)
  }
  return tempItem.reduce((acc, curr) => {
    if (curr.assignee_type == '2' && curr.assignees && curr.assignees.length) {
      const genNewPersonList = (arr = []) => {
        // 得到一个新的person列表
        let temp = []
        arr.map(user => {
          temp.push(user.id)
        })
        return temp
      }
      // 执行人去重
      const newPersonList = genNewPersonList(curr.assignees)
      return [...new Set([...acc, ...newPersonList])]
    } else if (!curr.assignee_type || curr.assignee_type == '1') {
      const newPersonList = []
      return [...newPersonList]
    }
    return acc
  }, [])
}

/**
 * 获取都是ID的抄送人列表
 * @param {*} type
 */

const transformNewRecipientsToString = item => {
  if (!!!item) return []
  let tempItem
  if (item instanceof Array) {
    tempItem = [...item]
  } else {
    tempItem = new Array(item)
  }
  return tempItem.reduce((acc, curr) => {
    if (curr.cc_type == '1' && curr.recipients && curr.recipients.length) {
      const genNewPersonList = (arr = []) => {
        // 得到一个新的person列表
        let temp = []
        arr.map(user => {
          temp.push(user.id)
        })
        return temp
      }
      // 执行人去重
      const newPersonList = genNewPersonList(curr.recipients)
      return [...new Set([...acc, ...newPersonList])]
    } else if (!curr.cc_type || curr.cc_type == '0') {
      const newPersonList = []
      return [...newPersonList]
    }
    return acc
  }, [])
}

// 去除评分节点中的最终分数以及value值
const wipeOffSomeDataWithScoreNodes = item => {
  if (!!!item) return []
  const { score_items = [] } = item
  let newScoreItems = JSON.parse(JSON.stringify(score_items || []))
  newScoreItems = (newScoreItems.filter(val => val.is_total != '1') || []).map(
    item => {
      let new_item = { ...item }
      new_item && new_item.value ? delete new_item.value : ''
      return new_item
    }
  )
  return newScoreItems || []
}

// 获取当前需要下载文件的信息内容
// const getCurrentDownloadFileInfo = (forms = []) => {
//   if (!!!forms) return {}
//   let newData = JSON.parse(JSON.parse(forms || []))
//   newData = newData.reduce((acc, curr) => {
//     let fileInfo = curr.files
//   }, {})
// }

// 找到当前的文件信息
const findCurrentFileInfo = (forms = []) => {
  let flag = false
  if (!!!forms) return {}
  let newData = JSON.parse(JSON.stringify(forms || []))
  let arr = []
  newData.map(item => {
    if (!item.files) return
    arr.push(...item.files)
  })
  let temp = arr.find(item => item.status && item.status == 'uploading') || {}
  if (temp && Object.keys(temp).length) flag = true
  return flag
}

// 找到当前审批节点进行中的位置
const findCurrentApproveNodesPosition = (data = []) => {
  if (!data) return
  if (!data.length) return ''
  let findData = JSON.parse(JSON.stringify(data || []))
  let curr_position =
    findData.findIndex(item => item.status == '1' && item.node_type == '2') ||
    ''
  if (curr_position < 0) return ''
  return curr_position
}

// 找到当前被驳回的位置
const findCurrentOverruleNodesPosition = (data = []) => {
  if (!data) return
  if (!data.length) return ''
  let findData = JSON.parse(JSON.stringify(data || []))
  let overrule_position =
    findData.findIndex(
      item => item.status == '1' && item.runtime_type == '1'
    ) || ''
  if (overrule_position < 0) return ''
  return overrule_position
}

// 找到当前评分节点的位置
const findCurrentRatingScoreNodesPosition = (data = []) => {
  if (!data) return
  if (!data.length) return ''
  let findData = JSON.parse(JSON.stringify(data || []))
  let curr_position =
    findData.findIndex(item => item.status == '1' && item.node_type == '3') ||
    ''
  if (curr_position < 0) return ''
  return curr_position
}

// 光标移动末尾
const cursorMoveEnd = obj => {
  if (!obj) return
  obj.focus()
  let len = obj.value.length
  if (document.selection) {
    let sel = obj.createTextRange()
    sel.moveStart('character', len)
    sel.collapse()
    sel.select()
  } else if (
    typeof obj.selectionStart == 'number' &&
    typeof obj.selectionEnd == 'number'
  ) {
    obj.selectionStart = obj.selectionEnd = len
  }
}

// 渲染时、天、月
const renderTimeType = type => {
  let description = ''
  switch (type) {
    case 'hour':
      description = '小时'
      break
    case 'day':
      description = '天'
      break
    case 'month':
      description = '月'
      break
    default:
      break
  }
  return description
}

// 渲染计算方式
const computing_mode = type => {
  let field_text = ''
  switch (type) {
    case '1': // 表示各分项相加
      field_text = '各分项相加'
      break
    case '2':
      field_text = '总分值/评分项数'
      break
    case '3':
      field_text = '总分值/评分人数'
      break
    default:
      break
  }
  return field_text
}

// 渲染结果分数选项内容
const result_score_option = type => {
  let field_text = ''
  switch (type) {
    case '1':
      field_text = '大于'
      break
    case '2':
      field_text = '小于'
      break
    case '3':
      field_text = '等于'
      break
    case '4':
      field_text = '大于或等于'
      break
    case '5':
      field_text = '小于或等于'
      break
    default:
      break
  }
  return field_text
}

// 渲染结果导向 以及其余情况
const result_score_fall_through_with_others = type => {
  let field_text = ''
  switch (type) {
    case '1':
      field_text = '流程流转到上一步'
      break
    case '2':
      field_text = '流程流转到下一步'
      break
    case '3':
      field_text = '流程中止'
      break
    default:
      break
  }
  return field_text
}

// 获取当前月份的天数
const getDaysOfEveryMonth = () => {
  //返回天数
  var baseMonthsDay = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] //各月天数
  var thisYear = new Date().getFullYear() //今年
  var thisMonth = new Date().getMonth() //今月
  var thisMonthDays = [] //这个月有多少天
  //判断是闰年吗？闰年2月29天
  const isLeapYear = fullYear => {
    return fullYear % 4 == 0 && (fullYear % 100 != 0 || fullYear % 400 == 0)
  }

  const getThisMonthDays = days => {
    //传天数，返天数数组
    var arr = []
    for (var i = 1; i <= days; i++) {
      arr.push(i)
    }
    return arr
  }

  if (isLeapYear(thisYear) && thisMonth == 1) {
    //闰年2月29天
    thisMonthDays = getThisMonthDays(baseMonthsDay[thisMonth] + 1)
  } else {
    thisMonthDays = getThisMonthDays(baseMonthsDay[thisMonth])
  }
  return thisMonthDays.length
}

// 显示不同类型的时间 时、天、月
const renderRestrictionsTime = itemValue => {
  if (!itemValue) return ''
  const {
    deadline_time_type,
    deadline_value,
    deadline_type,
    last_complete_time
  } = itemValue
  let total_time = '' //总时间
  let surplus_time = '' //剩余时间戳
  let now = parseInt(new Date().getTime() / 1000)
  let time_ceil = 60 * 60 //单位(3600秒)
  const take_time = now - Number(last_complete_time) //花费时间
  switch (deadline_time_type) {
    case 'hour': // 天
      total_time = deadline_value * time_ceil
      break
    case 'day':
      total_time = deadline_value * 24 * time_ceil
      break
    case 'month':
      total_time = 30 * deadline_value * 24 * time_ceil
      break
    default:
      break
  }
  surplus_time = total_time - take_time //86400

  let description = ''
  let time_dec = surplus_time < 0 ? '已逾期' : '剩余'
  let month_day_total = getDaysOfEveryMonth() //当前月份总天数

  let month = ''
  let day = ''
  let hour = ''
  let min = ''

  let modulus_time = Math.abs(surplus_time)
  if (modulus_time <= time_ceil) {
    //
    description = `${time_dec}${parseInt(modulus_time / 60)}分钟`
    // 分
  } else if (modulus_time > time_ceil && modulus_time <= 24 * time_ceil) {
    hour = parseInt(modulus_time / time_ceil)
    min = parseInt((modulus_time % time_ceil) / 60)
    if (min < 1) {
      description = `${time_dec}${hour}小时`
    } else {
      description = `${time_dec}${hour}小时${min}分钟`
    }
    // 时/分
  } else if (
    modulus_time > 24 * time_ceil &&
    modulus_time <= month_day_total * 24 * time_ceil
  ) {
    day = parseInt(modulus_time / (24 * time_ceil))
    hour = parseInt((modulus_time % (24 * time_ceil)) / time_ceil)
    if (hour < 1) {
      description = `${time_dec}${day}天`
    } else {
      description = `${time_dec}${day}天${hour}小时`
    }
    // 天/时
  } else if (modulus_time > month_day_total * 24 * time_ceil) {
    month = parseInt(modulus_time / (month_day_total * 24 * time_ceil))
    hour = parseInt(
      (modulus_time % (month_day_total * 24 * time_ceil)) / (24 * time_ceil)
    )
    description = `${time_dec}${month}月${hour}小时`
  } else {
  }
  return description
}

// 获取相对时间
const compareOppositeTimer = data => {
  if (!data) return ''
  const {
    deadline_time_type,
    deadline_value,
    deadline_type,
    last_complete_time
  } = data
  let total_time = '' //总时间
  let opposite_time = '' //相对时间
  let time_ceil = 60 * 60 //单位(3600秒)
  switch (deadline_time_type) {
    case 'hour': // 天
      total_time = deadline_value * time_ceil
      break
    case 'day':
      total_time = deadline_value * 24 * time_ceil
      break
    case 'month':
      total_time = 30 * deadline_value * 24 * time_ceil
      break
    default:
      break
  }
  opposite_time = Number(last_complete_time) + total_time //86400
  return opposite_time
}

// 去除空数组
const removeEmptyArrayEle = arr => {
  if (!arr) return []
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == undefined) {
      arr.splice(i, 1)
      i = i - 1 // i - 1 ,因为空元素在数组下标 2 位置，删除空之后，后面的元素要向前补位，
      // 这样才能真正去掉空元素,觉得这句可以删掉的连续为空试试，然后思考其中逻辑
    }
  }
  return arr
}

// 设置用户流程缓存 (更新对应字段内容)
const updateUserStorage = async ({ forms = [] }) => {
  const pro_info = localStorage.getItem('userProcessWithNodesStatusStorage')
    ? JSON.parse(localStorage.getItem('userProcessWithNodesStatusStorage'))
    : {}
  if (!(pro_info && Object.keys(pro_info).length)) return
  const { user_id, nodes = [] } = pro_info
  nodes[0]['forms'] = forms
  await localStorage.removeItem('userProcessWithNodesStatusStorage')
  await localStorage.setItem(
    'userProcessWithNodesStatusStorage',
    JSON.stringify(pro_info)
  )
}

// 判断是否存在 在线表格字段
const whetherIsExistOnlineExcel = ({ forms = [] }) => {
  let flag = false
  if (!forms.length) return false
  let newFormsData = [...forms]
  let curr = newFormsData.find(i => i.field_type == '6')
  if (curr && Object.keys(curr).length) {
    flag = true
  }
  return flag
}

export {
  showDeleteTempleteConfirm,
  genPrincipalListFromAssignees,
  renderTimeType,
  arrayNonRepeatfy,
  transformNewAssigneesToString,
  transformNewRecipientsToString,
  wipeOffSomeDataWithScoreNodes,
  findCurrentFileInfo,
  findCurrentApproveNodesPosition,
  findCurrentOverruleNodesPosition,
  findCurrentRatingScoreNodesPosition,
  cursorMoveEnd,
  computing_mode,
  result_score_option,
  result_score_fall_through_with_others,
  getDaysOfEveryMonth,
  renderRestrictionsTime,
  compareOppositeTimer,
  removeEmptyArrayEle,
  updateUserStorage,
  whetherIsExistOnlineExcel
}
