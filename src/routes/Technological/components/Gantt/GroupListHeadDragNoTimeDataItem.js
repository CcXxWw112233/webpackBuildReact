import React, { Component } from 'react'
import { Tooltip, message } from 'antd'
import indexStyles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import AvatarList from '@/components/avatarList'
import CheckItem from '@/components/CheckItem'
import {
  getXYDropPosition,
  getDropListPosition,
  onChangeCardHandleCardDetail
} from './ganttBusiness'
import { connect } from 'dva'
import { updateTaskVTwo } from '../../../../services/technological/task'
import { isApiResponseOk } from '../../../../utils/handleResponseData'
import { rebackCreateNotify } from '../../../../components/NotificationTodos'

@connect(mapStateToProps)
export default class GroupListHeadDragNoTimeDataItem extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.curret_panel = ''
  }

  setLableColor = label_data => {
    let bgColor = ''
    let b = ''
    if (label_data && label_data.length) {
      const color_arr = label_data.map(item => {
        return `rgb(${item.label_color})`
      })
      const color_arr_length = color_arr.length
      const color_percent_arr = color_arr.map((item, index) => {
        return ((index + 1) / color_arr_length) * 100
      })
      bgColor = color_arr.reduce((total, color_item, current_index) => {
        return `${total},  ${color_item} ${color_percent_arr[
          current_index - 1
        ] || 0}%, ${color_item} ${color_percent_arr[current_index]}%`
      }, '')

      b = `linear-gradient(to right${bgColor})`
    } else {
      b = '#ffffff'
    }
    return b
  }

  /**
   * 更新甘特图数据
   * @param {Array} datas 会影响的数组列表
   * @param {String} drop_group_id 下落的分组ID
   * @param {String} original_group_id 元素的原始的分组ID
   * @param {Object} updateData 更新的数据内容
   */
  updateGanttData = ({
    datas = [],
    drop_group_id,
    original_group_id,
    updateData = {}
  }) => {
    this.props.dispatch({
      type: `gantt/updateGroupListWithCardsNoTime`,
      payload: {
        datas,
        drop_group_id,
        original_group_id,
        updateData
      }
    })
  }

  // 拖拽完成后，修改成功，在弹出右方详情页的情况下，作比较更新
  onChangeTimeHandleCardDetail = props => {
    const {
      card_detail_id,
      selected_card_visible,
      parent_card_id,
      dispatch
    } = props
    onChangeCardHandleCardDetail({
      card_detail_id, //来自任务详情的id
      selected_card_visible, //任务详情弹窗是否弹开
      dispatch,
      operate_id: card_detail_id, //当前操作的id
      operate_parent_card_id: parent_card_id //当前操作的任务的父任务id
    })
  }

  // 处理document的drag事件
  listenDrag = () => {
    // const that = this
    document.body.addEventListener('dragstart', this.dragstart)
    /*对于drop,防止浏览器的默认处理数据(在drop中链接是默认打开)*/
    document.body.addEventListener('drop', this.drop)
  }
  removeEvent = () => {
    document.body.removeEventListener('dragstart', this.dragstart)
    document.body.removeEventListener('drop', this.drop)
  }

  componentDidMount() {
    this.listenDrag()
  }

  componentWillUnmount() {
    this.removeEvent()
  }

  dragstart = event => {
    if (!event) return
    const {
      dataset: { curret_panel }
    } = event.target
    if (curret_panel != 'list_no_time_data') {
      this.curret_panel = ''
      return
    }
    // if (this.state.currentOperateDragElement) return
    // this.curret_panel = 'list_no_time_data'
  }

  drop = event => {
    // if ('list_no_data') return
    if (!event) return
    if (!event.target) return
    if (!event.target.className) return
    if (this.curret_panel != 'list_no_time_data') return
    // 只有在分组视图以及日视图下
    const {
      gantt_view_mode,
      group_view_type,
      itemValue: { id },
      gantt_head_width
    } = this.props
    if (gantt_view_mode != 'month' && group_view_type != '1') return
    if (this.state.currentOperateDragElement != id) return
    event.preventDefault()
    try {
      if (event.target.id == 'gantt_svg_area') {
        // 表示下落在svg上
        const { x, y } = getXYDropPosition(event, { gantt_head_width })
        const {
          ceilWidth,
          group_list_area_section_height,
          date_arr_one_level = [],
          list_group = [],
          dispatch,
          itemValue = {},
          gantt_board_id,
          selected_card_visible,
          lane_id
        } = this.props
        const { id, board_id, parent_card_id } = itemValue
        // 找到原分组位置 -- 如果是默认分组 则任务中没有list_id 如果是其他的 则有list_id
        const group_original_list_index = list_group.findIndex(item =>
          lane_id ? item.lane_id == lane_id : item.lane_id == '0'
        )
        // 得到下落的分组位置
        let { group_list_index, belong_group_row } = getDropListPosition({
          group_list_area_section_height,
          position_top: y - 24
        })
        // console.log(group_list_index);
        // 获取下落的日期位置
        let date_position = parseInt(x / ceilWidth)
        let { timestamp, timestampEnd } = date_arr_one_level[date_position]
        // 这是下落的分组ID
        const { list_id } = list_group[group_list_index]
        // 找到这条任务是否是根据依赖保存过来的时间 plan_time_span
        const { plan_time_span } =
          list_group[group_original_list_index].lane_data.card_no_times.find(
            item => item.id == id
          ) || {}
        let due_time = ''
        let one_day_time = 24 * 60 * 60 * 1000
        let one_minute = 60 * 1000
        if (plan_time_span && plan_time_span != '0') {
          due_time = timestamp + (plan_time_span * one_day_time - one_minute)
        } else {
          due_time = timestampEnd
        }
        // return
        updateTaskVTwo(
          {
            card_id: id,
            list_id: list_id || '0',
            due_time: due_time,
            start_time: timestamp,
            board_id: board_id || gantt_board_id,
            row: belong_group_row
          },
          { isNotLoading: false }
        ).then(res => {
          if (isApiResponseOk(res)) {
            rebackCreateNotify.call(this, {
              res,
              id,
              board_id,
              group_view_type,
              dispatch,
              parent_card_id,
              card_detail_id: id,
              selected_card_visible
            })
            const updateData = {}
            updateData.start_time = timestamp //!is_has_start_time ? '' : parseInt(start_time_timestamp)
            updateData.due_time = due_time
            let datas = [
              { id, ...updateData, row: belong_group_row },
              ...res.data.scope_content.filter(item => item.id != id)
            ]
            this.updateGanttData({
              datas,
              drop_group_id: list_id,
              original_group_id: lane_id,
              updateData: {
                id: id,
                start_time: timestamp,
                due_time: due_time
              }
            })
            this.onChangeTimeHandleCardDetail({
              card_detail_id: id,
              selected_card_visible,
              parent_card_id: '',
              dispatch
            })
            this.curret_panel = ''
            this.setState({
              currentOperateDragElement: ''
            })
          } else {
            message.warn(res.message)
          }
        })
      } else {
        this.curret_panel = ''
        this.setState({
          currentOperateDragElement: ''
        })
      }
    } catch (err) {
      console.log(err)
    }
  }

  onDragStartCapture = e => {
    if (!e) return
    if (!e.target) return
    const { id } = e.target
    this.setState({
      currentOperateDragElement: id
    })
    this.curret_panel = 'list_no_time_data'
  }

  onDropCapture = e => {
    if (!e) return
    if (!e.target) return
    this.setState({
      currentOperateDragElement: ''
    })
    this.curret_panel = ''
  }

  render() {
    const { itemValue = {}, noTimeCardClick } = this.props
    const {
      name,
      id,
      is_realize,
      executors = [],
      label_data = [],
      board_id,
      is_privilege
    } = itemValue
    return (
      <div
        id={id}
        onDragStartCapture={this.onDragStartCapture}
        onDropCapture={this.onDropCapture}
        data-curret_panel="list_no_time_data"
        draggable={true}
        onClick={() => noTimeCardClick({ id, board_id })}
        style={{ background: this.setLableColor(label_data) }}
        className={indexStyles.no_time_card_area_card_item}
        key={`${id}-${is_privilege}`}
      >
        <div className={indexStyles.no_time_card_area_card_item_inner}>
          <div className={`${indexStyles.card_item_status}`}>
            <CheckItem is_realize={is_realize} />
          </div>
          <div
            className={`${indexStyles.card_item_name} ${globalStyles.global_ellipsis}`}
          >
            {name}
            {is_privilege == '1' && (
              <Tooltip title="已开启访问控制" placement="top">
                <span
                  style={{
                    color: 'rgba(0,0,0,0.50)',
                    marginRight: '5px',
                    marginLeft: '5px'
                  }}
                >
                  <span className={`${globalStyles.authTheme}`}>&#xe7ca;</span>
                </span>
              </Tooltip>
            )}
          </div>
          <div>
            <AvatarList users={executors} size={'small'} />
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps({
  gantt: {
    datas: {
      gantt_board_id,
      gantt_view_mode,
      ceilWidth,
      date_arr_one_level = [],
      group_list_area_section_height,
      group_view_type,
      list_group = [],
      selected_card_visible,
      gantt_head_width
    }
  }
}) {
  return {
    gantt_board_id,
    gantt_view_mode,
    ceilWidth,
    date_arr_one_level,
    group_list_area_section_height,
    group_view_type,
    list_group,
    selected_card_visible,
    gantt_head_width
  }
}
