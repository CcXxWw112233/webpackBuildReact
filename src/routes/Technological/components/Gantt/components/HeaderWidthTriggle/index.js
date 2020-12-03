import React, { Component } from 'react'
import styles from './index.less'
import { connect } from 'dva'
import Draggable from 'react-draggable'
import { gantt_panel_left_diff, date_area_height } from '../../constants'

const body = document.querySelector('body')
@connect(mapStateToProps)
export default class index extends Component {
  constructor(props) {
    super(props)
    this.state = {
      rela_top: 0,
      dragging: false,
      show_drag_trigger: false,
      drag_lock: false
    }
    this.cal_width = 0
  }
  setTriggerPosition = e => {
    if (this.state.dragging) return //拖拽中就不管了
    const { pageY } = e
    const { top } = e.currentTarget.getBoundingClientRect()
    const rela_top = pageY - top - 20
    const gold_top = Math.max(rela_top, 0)
    this.setState({
      rela_top: gold_top
    })
    // console.log('sssssssss_setTriggerPosition', pageX, pageY, e.currentTarget.getBoundingClientRect())
  }

  componentDidMount() {
    //初始化进来根据缓存中的头部设置宽度
    let storage_gantt_head_width = localStorage.getItem('gantt_head_width')
    let storage_gantt_head_width_origin = storage_gantt_head_width
    storage_gantt_head_width = Number(storage_gantt_head_width)
    if (isNaN(storage_gantt_head_width) || !storage_gantt_head_width) {
      storage_gantt_head_width = 280
    } else {
      if (storage_gantt_head_width > body.clientWidth / 2) {
        storage_gantt_head_width = body.clientWidth / 2
      } else if (storage_gantt_head_width < 120) {
        storage_gantt_head_width = 120
      } else {
      }
    }
    if (storage_gantt_head_width_origin != storage_gantt_head_width) {
      //当发现缓存中的数据和转化数据不一致，将转化后的宽度缓存
      localStorage.setItem('gantt_head_width', storage_gantt_head_width)
    }
    if (storage_gantt_head_width) {
      const target = document.getElementById('gantt_header_wapper')
      target.style.width = `${storage_gantt_head_width}px`
      const { dispatch } = this.props
      dispatch({
        type: 'gantt/updateDatas',
        payload: {
          gantt_head_width: storage_gantt_head_width
        }
      })
    }
  }

  set_gantt_header_wapper_width = pageX => {
    const target = document.getElementById('gantt_header_wapper')
    const gantt_card_out = document.getElementById('gantt_card_out')
    const gantt_card_out_offsetLeft = gantt_card_out.offsetLeft
    let width = pageX - gantt_card_out_offsetLeft - gantt_panel_left_diff
    if (width > body.clientWidth / 2) {
      width = body.clientWidth / 2
    } else if (width < 120) {
      width = 120
    } else {
    }
    target.style.width = `${width}px`
    this.cal_width = width
  }

  set_drag_lock = () => {
    this.setState(
      {
        drag_lock: true
      },
      () => {
        setTimeout(() => {
          this.setState({
            drag_lock: false
          })
        }, 200)
      }
    )
  }

  handleStart = e => {
    this.setState({
      dragging: true
    })
    this.set_drag_lock()
    document.getElementById('gantt_operate_area_panel').style.cursor = 'pointer'
  }
  handleDrag = e => {
    if (this.state.drag_lock) return
    const pageX =
      e.pageX !== undefined
        ? e.pageX
        : e.changedTouches
        ? e.changedTouches[0].pageX
        : 120
    this.set_gantt_header_wapper_width(pageX)
  }
  handleStop = e => {
    this.setState({
      dragging: false
    })
    document.getElementById('gantt_operate_area_panel').style.cursor =
      'crosshair'
    // console.log('ssssssss_handleStop', e)
    const { dispatch } = this.props
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        gantt_head_width: this.cal_width
      }
    })
    localStorage.setItem('gantt_head_width', this.cal_width)
  }
  onMouseEnter = () => {
    this.setState({
      show_drag_trigger: true
    })
  }
  onMouseLeave = () => {
    if (!this.state.dragging) {
      this.setState({
        show_drag_trigger: false
      })
    }
  }
  render() {
    const {
      group_list_area_section_height = [],
      gantt_card_height
    } = this.props
    const { rela_top, show_drag_trigger } = this.state
    const length = group_list_area_section_height.length
    return (
      <div
        className={`${styles.main} draggableSlidebar`}
        style={{
          height: gantt_card_height - 20 - date_area_height,
          top: date_area_height
        }}
        onMouseMoveCapture={e => this.setTriggerPosition(e)}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        <div
          className={styles.line}
          style={{ display: show_drag_trigger ? 'flex' : 'none' }}
        />

        <Draggable
          axis="x"
          // handle=".handle"
          // defaultPosition={{ x: 0, y: 0 }}
          // position={null}
          // grid={[25, 25]}
          // scale={1}
          onStart={this.handleStart}
          onDrag={this.handleDrag}
          onStop={this.handleStop}
        >
          <div
            className={styles.handle_shake}
            style={{
              display: show_drag_trigger ? 'flex' : 'none',
              top: rela_top
            }}
          >
            <div />
            <div />
            <div />
          </div>
        </Draggable>
      </div>
    )
  }
}

function mapStateToProps({
  gantt: {
    datas: { group_list_area_section_height, gantt_head_width }
  }
}) {
  return {
    group_list_area_section_height,
    gantt_head_width
  }
}
