import React, { Component } from 'react'
import indexStyles from './index.less'
import { date_area_height, gantt_panel_left_diff } from '../../constants'
import { message } from 'antd'
import { connect } from 'dva'
import { isApiResponseOk } from '../../../../../../utils/handleResponseData'
import { rebackCreateNotify } from '../../../../../../components/NotificationTodos'
import { onChangeCardHandleCardDetail } from '../../ganttBusiness'

const dateAreaHeight = date_area_height //日期区域高度，作为修正
@connect(mapStateToProps)
class HoverEars extends Component {
  constructor(props) {
    super(props)
    this.state = {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
      length: 0,
      angle: 0,
      move_to: '', //start/end
      line_to: '' //start/end
    }
    this.rela_x = 0
    this.rela_y = 0
    this.left_circle_ref = React.createRef()
    this.right_circle_ref = React.createRef()
    this.getXY = this.getXY.bind(this)
  }

  getXY = e => {
    const target_0 = document.getElementById('gantt_card_out')
    const target_1 = document.getElementById('gantt_card_out_middle')
    const target = this.left_circle_ref.current
    const { gantt_head_width } = this.props
    // 取得鼠标位置
    const x =
      e.pageX -
      target_0.offsetLeft +
      target_1.scrollLeft -
      gantt_head_width -
      gantt_panel_left_diff
    const y = e.pageY + target_1.scrollTop - dateAreaHeight - target_0.offsetTop
    return {
      x,
      y
    }
  }
  //鼠标拖拽移动
  onMousedown = e => {
    document.onmousemove = this.onMousemove.bind(this)
    document.onmouseup = this.onMouseup.bind(this)
    const { x, y } = this.getXY(e)
    const target_ref = e.target.dataset.ref
    const {
      itemValue: { width, top, left },
      setRelyLineDrawing
    } = this.props
    if (target_ref == 'left_circle_ref') {
      this.setState({
        x1: -10,
        y1: 20,
        transformOrigin: `0 0`,
        move_to: 'start'
      })
      this.rela_x = x //- 10
      this.rela_y = y //+ 20
    } else if (target_ref == 'right_circle_ref') {
      this.setState({
        x1: width + 46,
        y1: 1,
        transformOrigin: `${width + 46} ${8}`,
        move_to: 'end'
      })
      this.rela_x = left + width + 52 //x
      this.rela_y = top + 12 + 1 //y
    } else {
    }
    setRelyLineDrawing && setRelyLineDrawing(true)
  }

  onMousemove = e => {
    const { x1, y1 } = this.state
    const { x, y } = this.getXY(e)
    let x2 = x - this.rela_x //- 10 // - 10是为了让鼠标不落在箭头上
    let y2 = y - this.rela_y //- 10
    // const diff = 14
    // if (x2 < 0) {
    //     x2 = x2 + diff //+ 18
    // } else {
    //     x2 = x2 - diff//- 18
    // }
    // if (y2 < 0) {
    //     y2 = y2 + diff// + 18
    // } else {
    //     y2 = y2 - diff //- 18
    // }
    const { angle, length } = this.calHypotenuse({ x2, y2 })
    this.setState({
      angle,
      length,
      x2,
      y2
    })
  }
  onMouseup = e => {
    document.onmousemove = null
    document.onmouseup = null
    const { setRelyLineDrawing } = this.props
    setRelyLineDrawing && setRelyLineDrawing(false)
    this.setState({
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
      length: 0,
      angle: 0
    })
    this.rela_x = 0
    this.rela_y = 0
    this.handleCreateRely(e)
  }

  // 计算三角形 -----start
  // 计算斜边长度
  calHypotenuse = ({ x2, y2 }) => {
    const length = Math.sqrt(Math.pow(x2, 2) + Math.pow(y2, 2)) //勾股定理求出斜边长度
    let angle = 0 //夹角角度
    let deg = 0 ////夹角弧度
    deg = Math.acos(y2 / length) // 三角函数公式求得
    // deg = 2 * Math.PI * angle / 360
    angle = (deg * 180) / Math.PI
    if (x2 > 0) {
      angle = -angle
    }
    return {
      length,
      angle
    }
  }

  // 计算三角形 ----- end

  handleCreateRely = e => {
    //当落点在具体任务上
    const {
      itemValue: { id: move_id, parent_id, board_id },
      dispatch
    } = this.props
    const target = e.target
    const { rely_top, rely_right, rely_left, rely_type } = e.target.dataset
    if (!rely_top && !rely_right && !rely_left) return
    let line_to
    const line_id = rely_top || rely_right || rely_left
    if (parent_id == line_id) {
      message.warn('已和父任务存在依赖')
      return
    }
    if (move_id == line_id) return
    if (rely_left) {
      //落点在左耳朵
      line_to = 'start'
    } else if (rely_right) {
      //落点在右耳朵
      line_to = 'end'
    } else if (rely_top) {
      //hover 到具体的任务上
      const clientX = e.clientX
      const { clientWidth } = target
      const target_1 = document.getElementById('gantt_card_out_middle')
      const offsetLeft = this.props.getX(target)
      const rela_left = clientX - offsetLeft - 2 + target_1.scrollLeft //鼠标在该任务内的相对位置
      if (rely_type == 'flow') {
        //流程的依赖关联只有start|end => start
        line_to = 'start'
      } else {
        if (clientWidth - rela_left < clientWidth / 2) {
          line_to = 'end'
        } else {
          line_to = 'start'
        }
      }
    } else {
    }
    const { move_to } = this.state
    dispatch({
      type: 'gantt/addCardRely',
      payload: {
        from_id: move_id,
        to_id: line_id,
        relation: `${move_to}_${line_to}`
      }
    }).then(res => {
      if (isApiResponseOk(res)) {
        // 添加依赖之后 需撤回 以及 更新弹窗数据
        const { selected_card_visible, group_view_type } = this.props
        rebackCreateNotify.call(this, {
          res,
          id: move_id,
          board_id,
          group_view_type,
          dispatch,
          parent_card_id: parent_id,
          card_detail_id: move_id,
          selected_card_visible
        })
        // 甘特图删除依赖后更新任务弹窗依赖数据
        onChangeCardHandleCardDetail({
          card_detail_id: move_id,
          selected_card_visible,
          parent_card_id: parent_id,
          operate_id: move_id,
          dispatch
        })
      }
    })
    console.log('最终结果', { line_id, move_id, move_to, line_to })
  }

  setTriangleTreeColor = (label_data = [], index) => {
    // 获取颜色
    let label_color = ''
    const length = label_data.length
    if (index == 'start') {
      label_color = label_data[0] ? `rgb(${label_data[0].label_color})` : ''
    } else if (index == 'end') {
      label_color = label_data[length - 1]
        ? `rgb(${label_data[length - 1].label_color})`
        : ''
    } else {
    }
    return label_color
  }
  eventObj = {
    onMouseDown: e => {
      e.stopPropagation()
      this.onMousedown(e)
    },
    onMouseMove: e => {
      e.stopPropagation()
    },
    onMouseUp: e => {
      e.stopPropagation()
    }, //查看子任务是查看父任务

    onTouchStart: e => {
      e.stopPropagation()
    },
    onTouchMove: e => {
      e.stopPropagation()
    },
    onTouchEnd: e => {
      e.stopPropagation()
    }, //查看子任务是查看父任务
    onMouseEnter: e => {
      e.stopPropagation()
    },
    onMouseLeave: e => {
      e.stopPropagation()
    }
  }
  render() {
    const {
      itemValue: { label_data = [], id },
      rely_down
    } = this.props
    const { x1, y1, length, angle, transformOrigin, x2, y2 } = this.state
    return (
      <div
        className={indexStyles.ears_out}
        style={{ display: rely_down ? 'block' : '' }}
      >
        {/* <div
                    data-rely_left={id}
                    className={`${indexStyles.ears} ${indexStyles.left_ear}`}
                    style={{ backgroundColor: `${this.setTriangleTreeColor(label_data, 'start') || '#D7D7D7'}` }}>
                    <div />
                    <div />
                </div>
                <div
                    data-rely_right={id}
                    className={`${indexStyles.ears} ${indexStyles.right_ear}`}
                    style={{ backgroundColor: `${this.setTriangleTreeColor(label_data, 'start') || '#D7D7D7'}` }}>
                    <div />
                    <div />
                </div> */}

        {/* <div
                    // data-ref={'left_circle_ref'}
                    // ref={this.left_circle_ref}
                    // {...this.eventObj}
                    className={`${indexStyles.ears_circle} ${indexStyles.left_ear_circle}`}
                /> */}

        {/* <div
                    data-ref={'left_circle_ref'}
                    ref={this.left_circle_ref}
                    {...this.eventObj}
                    className={`${indexStyles.ears_circle_mask} ${indexStyles.left_ear_circle_mask}`}
                /> */}

        <div className={indexStyles.right_circle_wrapper}>
          <div className={indexStyles.link_right_circle}></div>
          <div
            data-ref={'right_circle_ref'}
            ref={this.right_circle_ref}
            {...this.eventObj}
            className={`${indexStyles.ears_circle_mask} ${indexStyles.right_ear_circle_mask}`}
          />
          <div
            // data-ref={'right_circle_ref'}
            // ref={this.right_circle_ref}
            // {...this.eventObj}
            className={`${indexStyles.ears_circle} ${indexStyles.right_ear_circle}`}
          />
          <div />
        </div>

        <div
          style={{
            top: y1,
            left: x1,
            height: length ? length - 12 : 0,
            transform: `rotate(${angle}deg)`,
            transformOrigin
          }}
          className={indexStyles.line}
        >
          {rely_down && (
            <div
              className={indexStyles.triangle_down}
              // style={{
              //     // top: '100%',
              //     // left: '100%',
              // }}
            />
          )}
        </div>
      </div>
    )
  }
}

export default HoverEars

function mapStateToProps({
  gantt: {
    datas: { gantt_head_width, group_view_type, selected_card_visible }
  }
}) {
  return {
    gantt_head_width,
    group_view_type,
    selected_card_visible
  }
}
