import React, { Component } from 'react'
import { connect } from 'dva'
import styles from './index.less'
import { Popconfirm, Modal, Popover } from 'antd'
import {
  ganttIsOutlineView,
  task_item_height,
  task_item_margin_top,
  date_area_height
} from '../../constants'
import PathOperateContent from './PathOperateContent'

const rely_map = [
  {
    id: '1265111963571195904',
    name: '开始',
    next: [
      {
        id: '1265112077387829248',
        name: '结尾1',
        relation: 'end_start'
      },
      {
        id: '1265112137341210624',
        name: '结尾2',
        relation: 'start_end'
      }
    ]
  }
]
const dateAreaHeight = date_area_height //日期区域高度，作为修正
// 60 40 20
const width_diff = 4 //8 //宽度误差微调
const left_diff = 6 //12 //位置误差微调
const top_diff_60 = task_item_height + task_item_margin_top //位置误差微调
const top_diff_30 = top_diff_60 / 2 + 2 //位置误差微调 ,+2由于任务间距太小，恢复可去掉
const top_diff_20 = task_item_margin_top //位置误差微调
const top_diff_10 = task_item_margin_top / 2 - 2 //位置误差微调, -2由于任务间距太小，恢复可去掉
let top_diff = task_item_height / 2 + task_item_margin_top /// 2 //位置误差微调
const top_diff_initial = top_diff

@connect(mapStateToProps)
export default class index extends Component {
  constructor(props) {
    super(props)
    this.state = {
      rely_map: [],
      cards_one_level: [], //所有任务平铺成一维数组
      operate_visible: false, //操作项的显示
      opreate_position: {
        x: 0,
        y: 0
      },
      operator: {
        move_id: '',
        line_id: ''
      }
    }
    this.could_structure_path_type = ['2', '3'] //可以构建依赖关系的类型
  }

  componentDidMount() {
    // this.getRelyMaps(this.props)
    // document.getElementById('gantt_svg_area')
    window.addEventListener('click', this.listenClick, true)
    window.addEventListener('scroll', this.closeOperate, true)
  }
  componentWillUnmount() {
    // document.getElementById('gantt_svg_area')
    window.removeEventListener('click', this.listenClick, true)
    window.addEventListener('scroll', this.closeOperate, true)
  }
  componentWillReceiveProps(nextProps) {
    if (
      ganttIsOutlineView({ group_view_type: nextProps.group_view_type }) &&
      nextProps.card_name_outside
    ) {
      top_diff = top_diff_initial + 9
    } else {
      top_diff = top_diff_initial
    }
    const { rely_map = [] } = nextProps
    this.setState(
      {
        rely_map
      },
      () => {
        this.setRelyMaps(nextProps)
      }
    )
  }

  // 递归设置点的的位置
  recusionSetMap = (data = [], cards_one_level) => {
    if (!data.length || !cards_one_level.length) return
    for (let val of data) {
      const { id, next = [] } = val
      const card_detail = cards_one_level.find(item => item.id == id) || {}
      const { left, width, top, start_time } = card_detail
      val.left = left
      val.top = top
      val.right = left + width
      val.start_time = start_time
      if (next.length) {
        this.recusionSetMap(next, cards_one_level)
      }
    }
  }
  // 设置最终依赖关系地图
  setRelyMaps = props => {
    let { rely_map = [] } = this.state
    const arr = this.getCardArr(props)
    this.setState(
      {
        cards_one_level: arr
      },
      () => {
        if (!arr.length) {
          this.setState({
            rely_map: []
          })
          return
        }
        this.recusionSetMap(rely_map, arr)
        this.setState({
          rely_map
        })
      }
    )
  }
  // 将所有任务铺开成一维数组
  getCardArr = props => {
    const { group_view_type } = props
    const { list_group = [], outline_tree_round = [] } = props
    let arr = []
    if (group_view_type == '4') {
      //大纲
      arr = outline_tree_round.filter(item =>
        this.could_structure_path_type.includes(item.tree_type)
      ) //大纲树中的任务
    } else {
      for (let val of list_group) {
        arr = [].concat(arr, val.list_data)
      }
    }

    return arr
  }

  // 绘制箭头规则
  calArrow = ({
    arrow_direction,
    diff_horizontal,
    diff_vertical,
    final_point: { x, y }
  }) => {
    // arrow_direction箭头方向
    // "M1662,299 L1666,296 L1666,302 Z"
    //diff_horizontal向左还是向右偏移
    let x2 = '',
      y2 = '',
      x3 = '',
      y3 = ''
    if ('top' == arrow_direction) {
      if (diff_horizontal == 'right') {
        x2 = x + 4
        y2 = y - 6
        x3 = x + 8
        y3 = y
      } else if (diff_horizontal == 'left') {
        x2 = x - 8
        y2 = y
        x3 = x - 4
        y3 = y - 6
      } else {
        x2 = x + 4
        y2 = y + 6
        x3 = x - 4
        y3 = y + 6
      }
    } else if ('down' == arrow_direction) {
      if (diff_horizontal == 'right') {
        x2 = x + 4
        y2 = y + 6
        x3 = x + 8
        y3 = y
      } else if (diff_horizontal == 'left') {
        x2 = x - 4
        y2 = y + 6
        x3 = x - 8
        y3 = y
      } else {
        x2 = x - 4
        y2 = y - 6
        x3 = x + 4
        y3 = y - 6
      }
    } else if ('left' == arrow_direction) {
      if (diff_vertical == 'top') {
        x2 = x - 6
        y2 = y - 4
        x3 = x
        y3 = y - 8
      } else if (diff_vertical == 'down') {
        x2 = x - 6
        y2 = y + 4
        x3 = x
        y3 = y + 8
      } else {
        x2 = x + 6
        y2 = y - 4
        x3 = x + 6
        y3 = y + 4
      }
    } else if ('right' == arrow_direction) {
      if (diff_vertical == 'top') {
        x2 = x + 6
        y2 = y - 4
        x3 = x
        y3 = y - 8
      } else if (diff_vertical == 'down') {
        x2 = x + 6
        y2 = y + 4
        x3 = x
        y3 = y + 8
      } else {
        x2 = x - 6
        y2 = y + 4
        x3 = x - 6
        y3 = y - 4
      }
    } else {
    }
    return `M${x},${y} L${x2},${y2} L${x3},${y3} Z`
  }
  // 绘制依赖路线
  pathFunc = {
    start_start: ({ move_left, move_top, line_top, line_left }) => {
      let Move_Line = ''
      let Arrow = ''
      if (move_top == line_top) {
        if (move_left < line_left) {
          Move_Line = `M ${move_left + left_diff},${move_top + top_diff}
                    L${move_left}, ${move_top + top_diff}
                    L${move_left}, ${line_top + top_diff + top_diff_30},
                    L${line_left}, ${line_top + top_diff + top_diff_30},
                    L${line_left + left_diff}, ${line_top +
            top_diff +
            top_diff_30},
                    ` //最后一个点 L${line_left + left_diff}, ${line_top + top_diff + top_diff_20},
          Arrow = this.calArrow({
            arrow_direction: 'top',
            final_point: {
              x: line_left + left_diff,
              y: line_top + top_diff + top_diff_30
            },
            diff_horizontal: 'left'
          })
        } else {
          Move_Line = `M ${move_left + left_diff},${move_top + top_diff}
                    L${move_left}, ${move_top + top_diff}
                    L${move_left}, ${line_top + top_diff + top_diff_30},
                    L${line_left + left_diff}, ${line_top +
            top_diff +
            top_diff_30},
                    ` //最后一个点 L${line_left + left_diff}, ${line_top + top_diff + top_diff_20},
          Arrow = this.calArrow({
            arrow_direction: 'top',
            final_point: {
              x: line_left + left_diff,
              y: line_top + top_diff + top_diff_30
            },
            diff_horizontal: 'right'
          })
        }
        return { Move_Line, Arrow }
      }
      if (move_left < line_left) {
        Move_Line = `M ${move_left + left_diff},${move_top + top_diff}
                            L${move_left}, ${move_top + top_diff}
                            L${move_left}, ${line_top + top_diff},
                            L${move_left}, ${line_top + top_diff},
                            L${line_left}, ${line_top + top_diff}`
        Arrow = this.calArrow({
          arrow_direction: 'right',
          final_point: { x: line_left, y: line_top + top_diff }
        })
      } else if (move_left == line_left) {
        if (move_top < line_top) {
          Move_Line = `M ${move_left + left_diff},${move_top + top_diff}
                    L${move_left}, ${move_top + top_diff}
                    L${move_left}, ${line_top + top_diff_10},
                    L${line_left + left_diff}, ${line_top + top_diff_10}`
          Arrow = this.calArrow({
            arrow_direction: 'down',
            diff_horizontal: 'left',
            final_point: { x: line_left + left_diff, y: line_top + top_diff_10 }
          })
        } else {
          Move_Line = `M ${move_left + left_diff},${move_top + top_diff}
                    L${move_left}, ${move_top + top_diff}
                    L${move_left}, ${line_top + top_diff + top_diff_30},
                    L${line_left + left_diff}, ${line_top +
            top_diff +
            top_diff_30}`
          Arrow = this.calArrow({
            arrow_direction: 'top',
            diff_horizontal: 'left',
            final_point: {
              x: line_left + left_diff,
              y: line_top + top_diff + top_diff_30
            }
          })
        }
      } else if (move_left > line_left) {
        Move_Line = `M ${move_left + left_diff},${move_top + top_diff}
                            L${line_left + width_diff}, ${move_top + top_diff}
                            L${line_left + width_diff}, ${line_top +
          (move_top > line_top ? top_diff_60 : top_diff_20)}`
        Arrow = this.calArrow({
          arrow_direction: move_top > line_top ? 'top' : 'down',
          final_point: {
            x: line_left + width_diff,
            y: line_top + (move_top > line_top ? top_diff_60 : top_diff_20)
          }
        })
      }
      return { Move_Line, Arrow }
    },
    start_end: ({ move_left, move_top, line_top, line_left, line_right }) => {
      let Move_Line = ''
      let Arrow = ''
      if (move_top == line_top) {
        if (move_left < line_left) {
          Move_Line = `M ${move_left + left_diff},${move_top + top_diff}
                    L${move_left}, ${move_top + top_diff}
                    L${move_left}, ${line_top + top_diff + top_diff_30},
                    L${line_right - width_diff}, ${line_top +
            top_diff +
            top_diff_30},
                    `
          Arrow = this.calArrow({
            arrow_direction: 'top',
            final_point: {
              x: line_right - width_diff,
              y: line_top + top_diff + top_diff_30
            },
            diff_horizontal: 'left'
          })
        } else {
          Move_Line = `M ${move_left + left_diff},${move_top + top_diff}
                    L${line_right - width_diff / 2}, ${line_top + top_diff}
                    `
          Arrow = this.calArrow({
            arrow_direction: 'left',
            final_point: {
              x: line_right - width_diff / 2,
              y: line_top + top_diff
            }
          })
        }
        return { Move_Line, Arrow }
      }
      if (move_left < line_right) {
        if (move_top < line_top) {
          Move_Line = `M ${move_left + left_diff},${move_top + top_diff}
                    L${move_left}, ${move_top + top_diff}
                    L${move_left}, ${line_top + top_diff_10},
                    L${line_right - left_diff}, ${line_top + top_diff_10}`
          Arrow = this.calArrow({
            arrow_direction: 'down',
            final_point: {
              x: line_right - left_diff,
              y: line_top + top_diff_10
            },
            diff_horizontal: 'left'
          })
        } else {
          Move_Line = `M ${move_left + left_diff},${move_top + top_diff}
                    L${move_left}, ${move_top + top_diff}
                    L${move_left}, ${line_top + top_diff_60 + top_diff_10},
                    L${line_right - left_diff}, ${line_top +
            top_diff_60 +
            top_diff_10}`
          Arrow = this.calArrow({
            arrow_direction: 'top',
            final_point: {
              x: line_right - left_diff,
              y: line_top + top_diff_60 + top_diff_10
            },
            diff_horizontal: 'left'
          })
        }
      } else if (move_left == line_right) {
        //和move_left > line_right一样
        Move_Line = `M ${move_left + left_diff},${move_top + top_diff}
                            L${line_right - left_diff}, ${move_top + top_diff}
                            L${line_right - left_diff}, ${line_top +
          (move_top > line_top ? top_diff_60 : top_diff_20)},
                           `
        Arrow = this.calArrow({
          arrow_direction: move_top > line_top ? 'top' : 'down',
          final_point: {
            x: line_right - left_diff,
            y: line_top + (move_top > line_top ? top_diff_60 : top_diff_20)
          }
        })
      } else if (move_left > line_right) {
        Move_Line = `M ${move_left + left_diff},${move_top + top_diff}
                            L${line_right - left_diff}, ${move_top + top_diff}
                            L${line_right - left_diff}, ${line_top +
          (move_top > line_top ? top_diff_60 : top_diff_20)},
                            `
        Arrow = this.calArrow({
          arrow_direction: move_top > line_top ? 'top' : 'down',
          final_point: {
            x: line_right - left_diff,
            y: line_top + (move_top > line_top ? top_diff_60 : top_diff_20)
          }
        })
      }
      return { Move_Line, Arrow }
    },
    end_start: ({
      move_left,
      move_top,
      line_top,
      line_left,
      line_right,
      move_right
    }) => {
      let Move_Line = ''
      let Arrow = ''
      if (move_top == line_top) {
        if (move_left < line_left) {
          Move_Line = `M ${move_right - left_diff},${move_top + top_diff}
                    L${line_left + width_diff / 2}, ${move_top + top_diff}`
          Arrow = this.calArrow({
            arrow_direction: 'right',
            final_point: {
              x: line_left + width_diff / 2,
              y: move_top + top_diff
            }
          })
        } else {
          Move_Line = `M ${move_right - left_diff},${move_top + top_diff}
                    L${move_right}, ${move_top + top_diff}
                    L${move_right}, ${line_top + top_diff + top_diff_30},
                    L${line_left + left_diff}, ${line_top +
            top_diff +
            top_diff_30},
                    `
          Arrow = this.calArrow({
            arrow_direction: 'top',
            final_point: {
              x: line_left + left_diff,
              y: line_top + top_diff + top_diff_30
            },
            diff_horizontal: 'right'
          })
        }

        return { Move_Line, Arrow }
      }
      if (move_right < line_left) {
        Move_Line = `M ${move_right - left_diff},${move_top + top_diff}
                            L${line_left + left_diff}, ${move_top + top_diff}
                            L${line_left + left_diff}, ${line_top +
          (move_top > line_top ? top_diff_60 : top_diff_20)},`
        Arrow = this.calArrow({
          arrow_direction: move_top > line_top ? 'top' : 'down',
          final_point: {
            x: line_left + left_diff,
            y: line_top + (move_top > line_top ? top_diff_60 : top_diff_20)
          }
        })
      } else if (move_right == line_left) {
        Move_Line = `M ${move_right - left_diff},${move_top + top_diff}
                            L${line_left + left_diff}, ${move_top + top_diff}
                            L${line_left + left_diff}, ${line_top +
          (move_top > line_top ? top_diff_60 : top_diff_20)},`
        Arrow = this.calArrow({
          arrow_direction: move_top > line_top ? 'top' : 'down',
          final_point: {
            x: line_left + left_diff,
            y: line_top + (move_top > line_top ? top_diff_60 : top_diff_20)
          }
        })
      } else if (move_right > line_left) {
        if (move_top < line_top) {
          Move_Line = `M ${move_right - left_diff},${move_top + top_diff}
                                L${move_right}, ${move_top + top_diff}
                                L${move_right}, ${line_top + top_diff_10}
                                L${line_left + width_diff}, ${line_top +
            top_diff_10}
                                `
          Arrow = this.calArrow({
            arrow_direction: 'down',
            final_point: {
              x: line_left + width_diff,
              y: line_top + top_diff_10
            },
            diff_horizontal: 'right'
          })
        } else {
          Move_Line = `M ${move_right - left_diff},${move_top + top_diff}
                                L${move_right}, ${move_top + top_diff}
                                L${move_right}, ${line_top +
            top_diff +
            top_diff_30}
                                L${line_left + width_diff}, ${line_top +
            top_diff +
            top_diff_30}`
          Arrow = this.calArrow({
            arrow_direction: 'top',
            final_point: {
              x: line_left + width_diff,
              y: line_top + top_diff + top_diff_30
            },
            diff_horizontal: 'right'
          })
        }
      }
      return { Move_Line, Arrow }
    },
    end_end: ({
      move_left,
      move_top,
      line_top,
      line_left,
      line_right,
      move_right
    }) => {
      let Move_Line = ''
      let Arrow = ''
      if (move_top == line_top) {
        Move_Line = `M ${move_right - left_diff},${move_top + top_diff}
                    L${move_right}, ${move_top + top_diff}
                    L${move_right}, ${move_top + top_diff + top_diff_30},
                    L${line_right - left_diff}, ${line_top +
          top_diff +
          top_diff_30},
                    `
        Arrow = this.calArrow({
          arrow_direction: 'top',
          final_point: {
            x: line_right - left_diff,
            y: line_top + top_diff + top_diff_30
          },
          diff_horizontal: move_right > line_right ? 'right' : 'left'
        })
        return { Move_Line, Arrow }
      }
      if (move_right < line_right) {
        if (move_top < line_top) {
          Move_Line = `M ${move_right - left_diff},${move_top + top_diff}
                                L${line_right - left_diff}, ${move_top +
            top_diff}
                                L${line_right - left_diff}, ${line_top +
            top_diff_20},`
          Arrow = this.calArrow({
            arrow_direction: 'down',
            final_point: {
              x: line_right - left_diff,
              y: line_top + top_diff_20
            }
          })
        } else {
          Move_Line = `M ${move_right - left_diff},${move_top + top_diff}
                                L${line_right - left_diff}, ${move_top +
            top_diff}
                                L${line_right - left_diff}, ${line_top +
            top_diff_60},`
          Arrow = this.calArrow({
            arrow_direction: 'top',
            final_point: {
              x: line_right - left_diff,
              y: line_top + top_diff_60
            }
          })
        }
      } else if (move_right == line_right) {
        if (move_top < line_top) {
          Move_Line = `M ${move_right - left_diff},${move_top + top_diff}
                    L${line_right}, ${move_top + top_diff}
                    L${line_right}, ${line_top + top_diff_10},
                    L${line_right - left_diff}, ${line_top + top_diff_10},`
          Arrow = this.calArrow({
            arrow_direction: 'down',
            final_point: {
              x: line_right - left_diff,
              y: line_top + top_diff_10
            },
            diff_horizontal: 'right'
          })
        } else {
          Move_Line = `M ${move_right - left_diff},${move_top + top_diff}
                    L${line_right}, ${move_top + top_diff}
                    L${line_right}, ${line_top + top_diff + top_diff_30},
                    L${line_right - left_diff}, ${line_top +
            top_diff +
            top_diff_30},`
          Arrow = this.calArrow({
            arrow_direction: 'top',
            final_point: {
              x: line_right - left_diff,
              y: line_top + top_diff + top_diff_30
            },
            diff_horizontal: 'right'
          })
        }
      } else if (move_right > line_right) {
        Move_Line = `M ${move_right - left_diff},${move_top + top_diff}
                    L${move_right}, ${move_top + top_diff}
                    L${move_right}, ${line_top + top_diff}
                    L${line_right}, ${line_top + top_diff}`
        Arrow = this.calArrow({
          arrow_direction: 'left',
          final_point: { x: line_right, y: line_top + top_diff }
        })
      }
      return { Move_Line, Arrow }
    }
  }
  calPath = data => {
    const { relation } = data
    return this.pathFunc[relation](data)
  }
  // 判断点击位置出现操作
  listenClick = e => {
    const { pageX, pageY } = e
    const { dataset = {} } = e.target
    const { gantt_head_width } = this.props
    if (dataset.svg_operate === 'yes') {
      //落点在操作区域
      return
    }
    if (e.target.nodeName !== 'path' || dataset.targetrelypath != 'relypath') {
      //不在svg path上
      this.setState({
        operate_visible: false
      })
      return
    }
    const target_0 = document.getElementById('gantt_card_out')
    const target_1 = document.getElementById('gantt_card_out_middle')
    const target = e.target
    // 取得鼠标位置
    const x =
      pageX - target_0.offsetLeft + target_1.scrollLeft - gantt_head_width
    const y = pageY - target_0.offsetTop + target_1.scrollTop - dateAreaHeight
    this.setState({
      operate_visible: true,
      opreate_position: {
        x,
        y
      }
    })
  }
  closeOperate = () => {
    if (this.state.operate_visible) {
      this.setOperateVisible(false)
    }
  }
  setOperateVisible = bool => {
    this.setState({
      operate_visible: bool
    })
  }
  // 设置当前操作的对象id
  pathClick = ({ move_id, line_id, color_mark }) => {
    this.setState({
      operator: {
        move_id,
        line_id,
        color_mark
      }
    })
  }
  onMouseOver = e => {
    const currentTarget = e.currentTarget
    document.getElementById('gantt_svg_area').appendChild(currentTarget) //为了让path凸显一层
  }
  // 删除依赖
  deleteRely = ({ move_id, line_id }) => {
    const { dispatch } = this.props
    Modal.confirm({
      title: '确认删除该依赖？',
      onOk: () => {
        dispatch({
          type: 'gantt/deleteCardRely',
          payload: {
            move_id,
            line_id
          }
        })
      }
    })
  }
  pathMouseEvent = {
    // 拖拽
    onMouseDown: e => {
      e.stopPropagation()
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
    }
  }

  // setSVGHeight = () => {
  //   const rows = 7
  //   const { ceiHeight, group_view_type, outline_tree_round = [] } = this.props
  //   // return '100%'
  //   if (ganttIsOutlineView({ group_view_type })) {
  //     const outline_tree_round_length = outline_tree_round.length
  //     if (outline_tree_round_length > rows) {
  //       return (outline_tree_round_length + 8) * ceiHeight
  //     } else {
  //       return (rows + 5) * ceiHeight
  //     }
  //   } else {
  //     return '100%'
  //   }
  // }
  setSVGHeight = props => {
    const {
      gantt_card_height,
      group_list_area_section_height = [],
      ceiHeight,
      group_view_type,
      outline_tree_round = [],
      list_group
    } = this.props
    const outline_tree_round_length = outline_tree_round.length
    const gantt_area_height = gantt_card_height - date_area_height - 30 //视图区域高度
    const latest_group_height =
      group_list_area_section_height[list_group.length - 1] //最后一个分组的位置，即为最高
    let _finally_height = gantt_area_height
    if (ganttIsOutlineView({ group_view_type })) {
      _finally_height = Math.max(
        outline_tree_round_length * ceiHeight + date_area_height + 20, //在大纲头部渲染那里，添加利一个高度为date_area_height的div,加上未知的差异24
        gantt_area_height
      )
    } else {
      _finally_height = Math.max(
        latest_group_height || gantt_area_height,
        gantt_area_height
      )
    }
    return _finally_height
  }
  checkInvalid = obj => {
    let flag = true
    for (let [, value] of Object.entries(obj)) {
      // eslint-disable-next-line use-isnan
      if (value === undefined || value === NaN) {
        flag = false
        break
      }
    }
    return flag
  }
  renderPaths = () => {
    const { rely_map = [] } = this.state
    const { date_arr_one_level = [] } = this.props
    console.log('rely_map', rely_map)
    return (
      <>
        {rely_map.map(move_item => {
          const {
            left: move_left,
            right: move_right,
            top: move_top,
            next = [],
            id: move_id,
            start_time: move_start_time
          } = move_item
          return next.map(line_item => {
            let {
              left: line_left,
              right: line_right,
              top: line_top,
              relation,
              id: line_id,
              color_mark = '24,144,255',
              start_time: line_start_time
            } = line_item
            if (!color_mark) {
              color_mark = '24,144,255'
            }
            const params = {
              move_left,
              move_right,
              move_top,
              line_left,
              line_right,
              line_top,
              relation
            }
            // console.log('ssssssssssss', params)
            if (move_left == 0) {
              if (
                !move_start_time ||
                move_start_time < date_arr_one_level[0].timestamp ||
                move_start_time >
                  date_arr_one_level[date_arr_one_level.length - 1].timestampEnd
              ) {
                return ''
              }
            }
            if (line_left == 0) {
              if (
                !line_start_time ||
                line_start_time < date_arr_one_level[0].timestamp ||
                line_start_time >
                  date_arr_one_level[date_arr_one_level.length - 1].timestampEnd
              ) {
                return ''
              }
            }
            if (!this.checkInvalid(params)) return ''
            const { Move_Line, Arrow } = this.calPath({ ...params })
            return (
              <g
                data-targetclassname="specific_example"
                className={`${styles.path_g}`}
                // onMouseOver={this.onMouseOver}
              >
                <path
                  name="arrow"
                  stroke={`rgba(${color_mark},0.5)`}
                  stroke-width="1"
                  data-targetclassname="specific_example"
                  data-targetrelypath="relypath"
                  fill={`rgba(${color_mark},0.8)`}
                  d={Arrow}
                  onClick={() =>
                    this.pathClick({ move_id, line_id, color_mark })
                  }
                  // onClick={() => this.deleteRely({ move_id, line_id })}
                  className={`${styles.path} ${styles.path_arrow}`}
                  {...this.pathMouseEvent}
                />
                <path
                  stroke={`rgba(${color_mark},0.5)`}
                  fill="none"
                  data-targetclassname="specific_example"
                  data-targetrelypath="relypath"
                  d={Move_Line}
                  stroke-width="2"
                  onClick={() =>
                    this.pathClick({ move_id, line_id, color_mark })
                  }
                  // onClick={() => this.deleteRely({ move_id, line_id })}
                  className={`${styles.path} ${styles.path_line}`}
                  {...this.pathMouseEvent}
                />
              </g>
            )
          })
        })}
      </>
    )
  }
  render() {
    const {
      date_total,
      ceilWidth,
      group_view_type,
      gantt_view_mode
    } = this.props
    const { rely_map = [], opreate_position, operate_visible } = this.state
    // console.log('rely_map', rely_map)
    return (
      <div onClick={e => e.stopPropagation()}>
        <svg
          id={'gantt_svg_area'}
          onClick={e => e.stopPropagation()}
          className={`${'gantt_card_flag_special'}`}
          style={{
            position: 'absolute',
            width: date_total * ceilWidth,
            height: this.setSVGHeight(),
            // gantt_view_mode != 'year' &&
            display: !['2', '5'].includes(group_view_type) ? 'block' : 'none',
            zIndex: 1,
            left: 0
            // zIndex: ganttIsOutlineView({ group_view_type }) ? 1 : -1,
          }}
        >
          {this.renderPaths()}
        </svg>
        <Popover
          content={
            <PathOperateContent
              onSelectColor={this.pathClick}
              operator={this.state.operator}
              setOperateVisible={this.setOperateVisible}
            />
          }
          placement={'bottom'}
          trigger={'click'}
          zIndex={3}
          visible={operate_visible}
        >
          <div
            onMouseDown={e => e.stopPropagation()}
            onMouseUp={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
            className={styles.path}
            style={{
              position: 'absolute',
              left: opreate_position.x,
              top: opreate_position.y,
              height: 2,
              width: 2
            }}
          ></div>
        </Popover>
      </div>
    )
  }
}
function mapStateToProps({
  gantt: {
    datas: {
      ceilWidth,
      gantt_board_id,
      group_view_type,
      outline_tree_round,
      gantt_view_mode,
      list_group = [],
      date_total,
      ceiHeight,
      rely_map,
      gantt_head_width,
      card_name_outside,
      date_arr_one_level,
      outline_tree,
      group_list_area_section_height
    }
  }
}) {
  return {
    ceilWidth,
    gantt_board_id,
    group_view_type,
    outline_tree_round,
    gantt_view_mode,
    list_group,
    date_total,
    ceiHeight,
    rely_map,
    gantt_head_width,
    card_name_outside,
    date_arr_one_level,
    outline_tree,
    group_list_area_section_height
  }
}
