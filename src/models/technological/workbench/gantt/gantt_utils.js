import {
  setGantTimeSpan,
  setHourViewCardTimeSpan
} from '../../../../routes/Technological/components/Gantt/ganttBusiness'
import {
  getDigit,
  transformTimestamp,
  isSamDay,
  isSamHour
} from '../../../../utils/util'
import {
  task_item_height,
  ceil_height,
  hours_view_start_work_oclock,
  hours_view_due_work_oclock
} from '../../../../routes/Technological/components/Gantt/constants'
import { getDateInfo } from '../../../../routes/Technological/components/Gantt/getDate'
// 获取一级里程碑包含的高度
function getLeafCountTree(data = {}) {
  if (!data.children) return 1
  if (data.children.length == 0) {
    return 1
  } else {
    let leafCount = 1
    for (var i = 0; i < data.children.length; i++) {
      const { parent_expand } = data.children[i]
      if (parent_expand) {
        leafCount = leafCount + getLeafCountTree(data.children[i])
      } else {
      }
    }
    return leafCount
  }
}
// 获取里程碑下所有叶子（穿透多层）节点的任务的最早时间
function getMilestoneLeafCardsMinTime(node) {
  let min_time = undefined
  function recusion(node) {
    if (node.children && node.children.length) {
      node.children.forEach(item => {
        if (item.start_time && item.tree_type == '2') {
          min_time = Math.min(
            min_time || transformTimestamp(item.start_time),
            transformTimestamp(item.start_time)
          )
        }
        if (item.due_time && item.tree_type == '1') {
          min_time = Math.min(
            min_time || transformTimestamp(item.due_time),
            transformTimestamp(item.due_time)
          )
        }
        recusion(item)
      })
    }
  }
  recusion(node)
  return min_time
}
// 获取里程碑下所有叶子 (穿透多层) 节点的完成时间以及总时间差值 不统计子任务
function getMilestoneLeafWithCompleteCardsTimesPercentage(node) {
  let complete_time_diff = 0 // 已完成时间差总数
  let all_time_diff = 0 // 所有时间差总数
  function recusion(node) {
    if (node.children && node.children.length) {
      node.children.forEach(item => {
        // 只存在开始和结束时间的任务
        if (
          item.tree_type == '2' &&
          !!item.start_time &&
          !!item.due_time &&
          !item.parent_card_id
        ) {
          if (item.is_realize == '1') {
            complete_time_diff =
              item.due_time - item.start_time + complete_time_diff
          }
          all_time_diff = item.due_time - item.start_time + all_time_diff
        }
        recusion(item)
      })
    }
  }
  recusion(node)
  return { complete_time_diff, all_time_diff }
}
export function recusionItem(
  tree,
  {
    parent_expand,
    parent_type,
    parent_id,
    parent_milestone_id,
    parent_card_id,
    parent_ids = [],
    parrent_cat_no = undefined
  },
  {
    start_date,
    end_date,
    filter_display,
    gantt_view_mode,
    min_start_time,
    max_due_time
  }
) {
  let arr = tree.map((item, key) => {
    let new_item = { ...item, parent_expand }
    let { tree_type, children = [], is_expand, id } = item
    let new_item_children = [...children].filter(
      item => item.id || (item.add_id && item.editing)
    ) //一般项和正在编辑的输入框占位
    // let child_expand_length = 0 //第一级父节点下所有子孙元素展开的总长
    let added = new_item_children.find(item => item.tree_type == '0') //表示是否已经添加过虚拟节点
    if ((tree_type == '1' || tree_type == '2') && !added) {
      //是里程碑或者一级任务,并且没有添加过
      // new_item_children.push({ ...visual_add_item, add_id: item.id }) //添加虚拟节点
    }
    // 时间跨度设置
    let due_time = getDigit(item['due_time'])
    let start_time = getDigit(item['start_time']) || due_time //如果没有开始时间，那就取截止时间当天
    // new_item.is_has_start_time = !!getDigit(item['start_time'])
    let is_has_start_time = false
    if (!!getDigit(item['start_time']) && due_time != start_time) {
      //具有开始时间并且开始时间不等于截止时间,因为有可能 开始时间是截止时间赋值的
      is_has_start_time = true
    }
    new_item.is_has_start_time = is_has_start_time
    new_item.is_has_end_time = !!getDigit(item['due_time'])
    let time_span = item['time_span'] || item['plan_time_span']
    new_item.due_time = due_time
    new_item.start_time = start_time
    if (tree_type == '1') {
      //里程碑的周期（时间跨度）,根据一级任务计算
      let child_time_arr_start = children
        .map(item => transformTimestamp(item.start_time) || 0)
        .filter(item => item)
      let child_time_arr_due = children
        .map(item => transformTimestamp(item.due_time) || 0)
        .filter(item => item)
      let child_time_arr = [].concat(child_time_arr_due, child_time_arr_start) ////全部时间的集合， [0]防止math.max 。minw
      //里程碑总工时
      time_span = setGantTimeSpan({
        time_span: '0',
        start_time:
          transformTimestamp(Math.min.apply(null, child_time_arr)) == Infinity
            ? ''
            : transformTimestamp(Math.min.apply(null, child_time_arr)),
        due_time:
          transformTimestamp(due_time) ||
          (transformTimestamp(Math.max.apply(null, child_time_arr)) == -Infinity
            ? ''
            : transformTimestamp(Math.max.apply(null, child_time_arr))),
        start_date,
        end_date
      })
    } else {
      //其它类型就根据开始截至时间计算
      if (gantt_view_mode == 'hours') {
        time_span = setHourViewCardTimeSpan(
          start_time,
          due_time,
          min_start_time,
          max_due_time
        )
      } else {
        time_span = setGantTimeSpan({
          time_span,
          start_time,
          due_time,
          start_date,
          end_date
        })
      }
    }
    new_item.time_span = time_span
    new_item.parent_ids = []
      .concat(parent_ids, [parent_id])
      .filter(item => !!item)
    new_item.parent_id = parent_id
    new_item.parent_type = parent_type
    if (parent_type == '1') {
      new_item.parent_milestone_id = parent_milestone_id
    } else if (parent_type == '2') {
      new_item.parent_card_id = parent_card_id
    }
    new_item.cat_no =
      (parrent_cat_no || '') + `${parrent_cat_no ? '.' : ''}${key + 1}` //编号
    if (new_item_children.length) {
      new_item.children = recusionItem(
        new_item_children,
        {
          parent_type: tree_type,
          parent_expand: is_expand && parent_expand,
          parent_id: id,
          parent_milestone_id: id,
          parent_card_id: id,
          parent_ids: new_item.parent_ids,
          parrent_cat_no: new_item.cat_no
        },
        {
          start_date,
          end_date,
          filter_display,
          gantt_view_mode,
          min_start_time,
          max_due_time
        }
      )
      if (filter_display) {
        new_item.children = new_item.children.filter(item => item.is_display)
      }
    }
    //所有叶子 任务的最早时间
    if (tree_type == '1') {
      const min_leaf_card_time = getMilestoneLeafCardsMinTime(new_item)
      const {
        complete_time_diff,
        all_time_diff
      } = getMilestoneLeafWithCompleteCardsTimesPercentage(new_item)
      new_item.start_time = min_leaf_card_time
      new_item.min_leaf_card_time = min_leaf_card_time
      new_item.percent_card_non =
        complete_time_diff || all_time_diff
          ? (parseFloat(complete_time_diff / all_time_diff) * 100).toFixed(2)
          : new_item.progress_percent || 0
    }
    //一级里程碑展开的包含高度
    if (tree_type == '1' && !parent_id) {
      new_item.expand_length = getLeafCountTree(new_item)
    }
    return new_item
  })
  if (filter_display) {
    arr = arr.filter(item => item.is_display)
  }

  return arr
}

// 统一更新计算left width
export function formatItem(
  data,
  { ceilWidth, date_arr_one_level, gantt_view_mode }
) {
  if (data && data.length) {
    return data.map((item, key) => {
      let new_item = {}
      const { tree_type, children = [], child_card_status = {} } = item //  里程碑/任务/子任务/虚拟占位 1/2/3/4
      const cal_left_field = tree_type == '1' ? 'due_time' : 'start_time' //计算起始位置的字段
      item.top = key * ceil_height
      const due_time = getDigit(item['due_time'])
      const start_time = getDigit(item['start_time']) || due_time //如果没有开始时间，那就取截止时间当天

      let time_span = item['time_span'] || Number(item['plan_time_span'] || 0)
      // time_span = setGantTimeSpan({ time_span, start_time, due_time, start_date, end_date })
      // 获取子任务状态
      child_card_status.has_child = children.length ? '1' : '0'
      child_card_status.min_start_time =
        Math.min.apply(
          null,
          children.map(item => item.start_time)
        ) || ''
      child_card_status.max_due_time =
        Math.max.apply(
          null,
          children.map(item => item.due_time)
        ) || ''
      new_item = {
        ...item,
        start_time,
        end_time: due_time || getDateInfo(start_time).timestampEnd,
        time_span,
        width: time_span * ceilWidth,
        height: task_item_height,
        child_card_status
      }
      let time_belong_area = false
      let date_arr_one_level_length = date_arr_one_level.length
      if (
        (tree_type == '1' &&
          (getDigit(new_item['due_time']) <
            getDigit(date_arr_one_level[0]['timestamp']) ||
            getDigit(new_item['due_time']) >
              getDigit(
                date_arr_one_level[date_arr_one_level_length - 1]['timestamp']
              ))) || //里程碑只需考虑截止在区间外
        (tree_type == '2' && //任务在可视区域左右区间外
          getDigit(new_item['due_time']) <
            getDigit(date_arr_one_level[0]['timestamp']) &&
          getDigit(start_time) <
            getDigit(date_arr_one_level[0]['timestamp'])) ||
        getDigit(new_item['start_time']) >
          getDigit(
            date_arr_one_level[date_arr_one_level_length - 1]['timestamp']
          )
      ) {
        //如果该任务的起始日期在当前查看面板日期之前，就从最左边开始摆放
        // new_item.left = -500
        new_item.width = 0
        new_item.left = 0
      } else {
        for (let k = 0; k < date_arr_one_level_length; k++) {
          // if (isSamDay(new_item[cal_left_field], date_arr_one_level[k]['timestamp'])) { //是同一天
          //   const max_width = (date_arr_one_level_length - k) * ceilWidth //剩余最大可放长度
          //   new_item.left = k * ceilWidth
          //   new_item.width = Math.min.apply(Math, [max_width, (time_span || 1) * ceilWidth]) //取最小可放的
          //   time_belong_area = true
          //   break
          // }
          if (
            gantt_view_mode == 'month' ||
            gantt_view_mode == 'relative_time'
          ) {
            //月视图下遍历得到和开始时间对的上的日期
            if (
              isSamDay(
                new_item[cal_left_field],
                date_arr_one_level[k]['timestamp']
              )
            ) {
              //是同一天
              const max_width = (date_arr_one_level_length - k) * ceilWidth //剩余最大可放长度
              new_item.left = k * ceilWidth
              new_item.width = Math.min.apply(Math, [
                max_width,
                (time_span || 1) * ceilWidth
              ]) //取最小可放的
              time_belong_area = true
              break
            }
          } else if (gantt_view_mode == 'year') {
            //年视图下遍历时间，如果时间戳在某个月的区间内，定位到该位置
            if (
              new_item[cal_left_field] <=
                date_arr_one_level[k]['timestampEnd'] &&
              new_item[cal_left_field] >= date_arr_one_level[k]['timestamp']
            ) {
              // 该月之前每个月的天数+这一条的日期 = 所在的位置索引（需要再乘以单位长度才是真实位置）
              const all_date_length = date_arr_one_level
                .slice()
                .map(item => item.last_date)
                .reduce((total, num) => total + num) //该月之前所有日期长度之和
              const date_length = date_arr_one_level
                .slice(0, k < 1 ? 1 : k)
                .map(item => item.last_date)
                .reduce((total, num) => total + num) //该月之前所有日期长度之和
              const date_no = new Date(+new_item[cal_left_field]).getDate() //所属该月几号
              const max_width =
                (all_date_length - date_length - date_no) * ceilWidth //剩余最大可放长度
              new_item.left = (date_length + date_no - 1) * ceilWidth
              new_item.width = Math.min.apply(Math, [
                max_width,
                (time_span || 1) * ceilWidth
              ]) //取最小可放的
              time_belong_area = true
              break
            }
          } else if (gantt_view_mode == 'week') {
            if (
              new_item[cal_left_field] <=
                date_arr_one_level[k]['timestampEnd'] &&
              new_item[cal_left_field] >= date_arr_one_level[k]['timestamp']
            ) {
              const date_day = new Date(+new_item[cal_left_field]).getDay() //周几
              new_item.left =
                ((k + (date_day == 0 ? 1 : 0)) * 7 + date_day - 1) * ceilWidth
              new_item.width = (time_span || 1) * ceilWidth
              break
            }
          } else if (gantt_view_mode == 'hours') {
            if (
              //如果重合
              isSamHour(
                new_item[cal_left_field],
                date_arr_one_level[k]['timestamp']
              )
            ) {
              new_item.left = k * ceilWidth
              break
            } else {
              //如果是在同一天，开始时间不在工作时间内
              if (
                isSamDay(
                  new_item[cal_left_field],
                  date_arr_one_level[k]['timestamp']
                )
              ) {
                // 开始时间在工作时间之前
                if (
                  new_item[cal_left_field] <
                    date_arr_one_level[k]['timestamp'] &&
                  date_arr_one_level[k]['date_no'] ==
                    hours_view_start_work_oclock
                ) {
                  new_item.left = k * ceilWidth
                  break
                } else if (
                  //开始时间在工作时间之后
                  new_item[cal_left_field] >
                    date_arr_one_level[k]['timestamp'] &&
                  date_arr_one_level[k]['date_no'] ==
                    hours_view_due_work_oclock - 1
                ) {
                  if (new_item.tree_type == '2') {
                    new_item.left = (k + 1) * ceilWidth
                  } else {
                    new_item.left = k * ceilWidth
                  }
                  break
                }
              }
            }
          } else {
          }
        }
        // if (!time_belong_area) {//如果在当前视图右期间外
        //   new_item.width = 0
        //   new_item.time_span = 0
        //   new_item.left = 0
        // }
      }
      return new_item
    })
  }
  return []
}

function getNode(outline_tree, id) {
  let nodeValue = null
  if (outline_tree) {
    nodeValue = outline_tree.find(item => item.id == id)
    if (nodeValue) {
      return nodeValue
    } else {
      for (let i = 0; i < outline_tree.length; i++) {
        let node = outline_tree[i]
        if (node.children && node.children.length > 0) {
          nodeValue = getNode(node.children, id)
          if (nodeValue) {
            return nodeValue
          }
        } else {
          continue
          // return null;
        }
      }
    }
  }
  return nodeValue
}

export function getTreeNodeValue(outline_tree, id) {
  if (outline_tree) {
    for (let i = 0; i < outline_tree.length; i++) {
      let node = outline_tree[i]
      if (node.id == id) {
        return node
      } else {
        if (node.children && node.children.length > 0) {
          let childNode = getNode(node.children, id)
          if (childNode) {
            return childNode
          }
        } else {
          continue
          // return null;
        }
      }
    }
  } else {
    return null
  }
}
