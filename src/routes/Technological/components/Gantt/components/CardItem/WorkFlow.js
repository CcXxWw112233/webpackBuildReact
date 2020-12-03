import React, { Component } from 'react'
import indexStyles from './index.less'
import { connect } from 'dva'
import globalStyles from '@/globalset/css/globalClassName.less'
import {
  task_item_height,
  task_item_margin_top,
  date_area_height,
  ganttIsOutlineView,
  ceil_width
} from '../../constants'
import { isApiResponseOk } from '../../../../../../utils/handleResponseData'
import { message } from 'antd'
import {
  setDateWithPositionInYearView,
  setDateWidthPositionWeekView
} from '../../ganttBusiness'
import { isSamDay } from '../../../../../../utils/util'
import { workflowUpdateTime } from '../../../../../../services/technological/workFlow'
// 参考自http://www.jq22.com/webqd1348

// const dateAreaHeight = date_area_height //日期区域高度，作为修正
const card_width_diff = 8 //宽度误差微调
const card_left_diff = 4 //位置误差微调
const pading_left_diff = 6 //pading
@connect(mapStateToProps)
export default class WorkFlowItem extends Component {
  constructor(props) {
    super(props)
    this.out_ref = React.createRef()
    this.is_down = false
    this.state = {
      local_width: 0,
      local_top: 0,
      local_left: 0,
      is_moved: false //当前mouseDown后，是否被拖动过
    }
    this.x = 0
    this.l = 0
  }

  componentDidMount() {
    this.initSetPosition(this.props)
  }

  // 设置位置
  initSetPosition = props => {
    const { itemValue = {} } = props
    const { left, top, width } = itemValue

    this.setState({
      local_top: top,
      local_left: left + pading_left_diff,
      local_width: width //实时变化
    })
  }

  onMouseDown = e => {
    e.stopPropagation()
    e.preventDefault && e.preventDefault() //解决拖拽卡顿？(尚未明确)
    const target = this.out_ref.current
    target.style.cursor = 'move'

    setTimeout(() => {
      this.is_down = true
    }, 50)
    this.x = e.clientX || e.changedTouches[0].clientX
    //获取左部和顶部的偏移量
    this.l = target.offsetLeft

    document.onmousemove = this.onMouseMove.bind(this)
    document.onmouseup = this.onMouseUp.bind(this)

    document.addEventListener('ontouchmove', this.onTouchMove, false)
    document.addEventListener('ontouchend', this.onTouchEnd, false)
    setTimeout(() => {
      this.props.setTaskIsDragging && this.props.setTaskIsDragging(true, 3) //当拖动时，有可能会捕获到创建任务的动作，阻断
    }, 300)
    // target.onmouseleave = this.onMouseUp.bind(this);
  }

  onMouseMove = e => {
    e.stopPropagation()
    if (this.is_down == false) {
      return
    }
    this.setState({
      is_moved: true
    })
    this.changePosition(e)
  }

  onTouchStart = e => {
    this.onMouseDown(e)
  }

  onTouchMove = e => {
    e.preventDefault && e.preventDefault()
    e.stopPropagation && e.stopPropagation()
    // console.log('ssssapreventDefault', e.preventDefault)
    this.onMouseMove(e)
  }

  onTouchEnd = e => {
    this.onMouseUp(e)
  }

  onMouseEnter = () => {
    //在鼠标hover到任务条上，非创建任务时，将虚线框隐藏
    const { ganttPanelDashedDrag } = this.props
    if (!ganttPanelDashedDrag) {
      this.props.setDasheRectShow && this.props.setDasheRectShow(false)
    }
  }

  // 整条拖动
  changePosition = e => {
    //获取x和y
    const nx = e.clientX || e.changedTouches[0].clientX
    //计算移动后的左偏移量和顶部的偏移量
    const nl = nx - (this.x - this.l)
    this.setState({
      local_left: nl
    })
  }

  // 拖拽完成后松开鼠标
  onMouseUp = e => {
    e.stopPropagation()
    this.x = 0
    this.l = 0
    if (this.is_down) {
      this.overDragCompleteHandlePositonAbout() //松开拖拽完成，继续操作
    }
    this.is_down = false
    const target = this.out_ref.current
    target.style.cursor = 'pointer'

    document.onmousemove = null
    document.onmouseup = null

    document.removeEventListener('ontouchmove', this.onTouchMove, false)
    document.removeEventListener('ontouchend', this.onTouchEnd, false)
    setTimeout(() => {
      this.setState({
        is_moved: false
      })
      this.props.setTaskIsDragging && this.props.setTaskIsDragging(false, 4) //当拖动完成后，释放创建任务的锁，让可以正常创建任务
    }, 300)
  }

  // 不在项目分组内，左右移动
  overDragCompleteHandlePositonAbout = () => {
    const {
      itemValue: { id, start_time, left },
      gantt_view_mode,
      dispatch
    } = this.props
    const { local_left, local_width } = this.state
    const { date_arr_one_level, ceilWidth } = this.props
    const updateData = {}
    const start_time_index = Math.floor(local_left / ceilWidth)
    let start_date = {}
    if (gantt_view_mode == 'month' || gantt_view_mode == 'relative_time') {
      start_date = date_arr_one_level[start_time_index] || {}
    } else if (gantt_view_mode == 'year') {
      start_date = setDateWithPositionInYearView({
        _position: local_left,
        date_arr_one_level,
        ceilWidth,
        width: local_width,
        x: local_left
      })
    } else if (gantt_view_mode == 'week') {
      start_date = setDateWidthPositionWeekView({
        position: local_left,
        date_arr_one_level,
        ceilWidth
      })
    } else {
    }
    const start_time_timestamp = parseInt(start_date.timestamp)
    if (!start_time_timestamp) return

    updateData.start_time = parseInt(start_time_timestamp)
    if (isSamDay(start_time, start_time_timestamp)) {
      //向右拖动时，如果是在同一天，则不去更新
      this.setState({
        local_left: left + pading_left_diff
      })
      return
    }
    workflowUpdateTime(
      { id, plan_start_time: start_time_timestamp },
      { isNotLoading: false }
    )
      .then(res => {
        if (isApiResponseOk(res)) {
          const status = isSamDay(new Date().getTime(), start_time_timestamp)
            ? '1'
            : '0' //如果是今天则设置为未开始
          dispatch({
            type: 'gantt/updateOutLineTree',
            payload: {
              datas: [{ id, ...updateData, status }]
            }
          })
        } else {
          this.setState({
            local_left: left + pading_left_diff
          })
          message.warn(res.message)
        }
      })
      .catch(err => {
        this.setState({
          local_left: left + pading_left_diff
        })
        message.error('更新失败')
      })
  }

  // 是否可以拖动
  couldChangeCard = () => {
    const {
      itemValue: { child_card_status = {} },
      group_view_type
    } = this.props
    const { has_child, max_due_time, min_start_time } = child_card_status
    // 大纲视图下的任务，存在子任务并且子任务有时间
    if (
      ganttIsOutlineView({ group_view_type }) &&
      has_child == '1' &&
      (!!max_due_time || min_start_time)
    ) {
      return false
    }
    return true
  }
  handleObj = () => {
    return {
      // 拖拽
      onMouseDown: e => {
        this.onMouseDown(e)
      },
      onMouseMove: e => {},
      onMouseUp: () => {}, //查看子任务是查看父任务

      onTouchStart: e => {
        this.onTouchStart(e)
      },
      onTouchMove: e => {},
      onTouchEnd: e => {}, //查看子任务是查看父任务
      onMouseEnter: () => {
        this.onMouseEnter()
      }
    }
  }

  renderFlowStatus = status => {
    const obj = {
      '0': '未开始',
      '1': '运行中',
      '2': '已中止',
      '3': '已完成'
    }
    return obj[status]
  }

  render() {
    const { itemValue = {}, gantt_view_mode } = this.props
    const { height, name, id, status } = itemValue
    const { local_left, local_top, rely_down } = this.state
    return (
      <div
        className={`${indexStyles.flow} ${'gantt_card_flag_special'}`}
        data-targetclassname="specific_example"
        data-rely_top={id}
        data-rely_type={'flow'}
        id={id} //大纲视图需要获取该id作为父级id来实现子任务拖拽影响父任务位置
        ref={this.out_ref}
        style={{
          touchAction: 'none',
          zIndex: rely_down || this.is_down ? 2 : 1,
          left: local_left + (gantt_view_mode == 'year' ? 0 : card_left_diff),
          top: local_top,
          // width: (local_width || 6) - (gantt_view_mode == 'year' ? 0 : card_width_diff),
          height: height || task_item_height,
          marginTop: task_item_margin_top
        }}
        {...this.handleObj()}
      >
        <div
          className={`${indexStyles.flow_log} ${globalStyles.authTheme}`}
          data-rely_top={id}
          data-rely_type={'flow'}
        >
          &#xe68c;
        </div>
        <div
          className={indexStyles.name}
          data-rely_top={id}
          data-rely_type={'flow'}
        >
          {name}
        </div>
        <div
          className={indexStyles.status}
          data-rely_top={id}
          data-rely_type={'flow'}
        >
          （{this.renderFlowStatus(status)}）
        </div>
      </div>
    )
  }
}
function mapStateToProps({
  gantt: {
    datas: {
      date_arr_one_level = [],
      ceilWidth,
      gantt_board_id,
      group_view_type,
      gantt_view_mode
    }
  }
}) {
  return {
    date_arr_one_level,
    ceilWidth,
    gantt_board_id,
    group_view_type,
    gantt_view_mode
  }
}
