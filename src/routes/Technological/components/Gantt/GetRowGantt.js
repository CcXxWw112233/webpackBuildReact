import React, { Component } from 'react';
import { connect, } from 'dva';
import indexStyles from './index.less'
import GetRowGanttItem from './GetRowGanttItem'
import GetRowGanttItemElse from './GetRowGanttItemElse'
import globalStyles from '@/globalset/css/globalClassName.less'
import CheckItem from '@/components/CheckItem'
import AvatarList from '@/components/avatarList'
import { Tooltip, Dropdown } from 'antd'
import { date_area_height, task_item_height, task_item_margin_top } from './constants'
import CardDropDetail from './components/gattFaceCardItem/CardDropDetail'
import QueueAnim from 'rc-queue-anim'

const clientWidth = document.documentElement.clientWidth;//获取页面可见高度
const coperatedX = 0 //80 //鼠标移动和拖拽的修正位置
const coperatedLeftDiv = 20 //滚动条左边还有一个div的宽度，作为修正
const dateAreaHeight = date_area_height //日期区域高度，作为修正
const getEffectOrReducerByName = name => `gantt/${name}`
@connect(mapStateToProps)
export default class GetRowGantt extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentRect: { x: 0, y: 0, width: 0, height: task_item_height }, //当前操作的矩形属性
      dasheRectShow: false, //虚线框是否显示
      isDasheRect: false, //生成任务后在原始虚线框位置处生成一条数据
      start_time: '',
      due_time: '',
      specific_example_arr: [], //任务实例列表
    }
    this.x1 = 0 //用于做拖拽生成一条任务
    this.y1 = 0
    this.isDragging = false //判断是否在拖拽虚线框
    this.isMouseDown = false //是否鼠标按下
    this.SelectedRect = { x: 0, y: 0 }
  }
  setIsDragging(isDragging) {
    const { dispatch } = this.props
    this.isDragging = isDragging
    dispatch({
      type: getEffectOrReducerByName('updateDatas'),
      payload: {
        isDragging
      }
    })
  }

  componentDidMount() {
    this.setGanttCardOutOffsetLeft()
  }

  // 设置甘特图卡片距离页面文档左边距
  setGanttCardOutOffsetLeft = () => {
    const { is_need_calculate_left_dx } = this.props
    if (!is_need_calculate_left_dx) { //如果不需要计算做边距，从引用甘特图组件的地方设置
      this.setState({
        coperatedX: 0
      })
      return
    }
    const getPoint = (obj, e) => { //获取某元素以浏览器左上角为原点的坐标
      let left_to_body = obj.offsetLeft; //对应父容器的上边距
      //判断是否有父容器，如果存在则累加其边距
      while (obj = obj.offsetParent) {//等效 obj = obj.offsetParent;while (obj != undefined)
        left_to_body += obj.offsetLeft; //叠加父容器的左边距
      }
      return left_to_body
    }
    const element = document.getElementById('gantt_card_out')
    const card_offset_left = getPoint(element)
    this.setState({
      coperatedX: card_offset_left
    })
  }

  componentWillReceiveProps(nextProps) {

  }

  //鼠标拖拽移动
  dashedMousedown(e) {
    if (e.target.dataset.targetclassname == 'specific_example') { //不能滑动到某一个任务实例上
      return false
    }
    if (this.isDragging || this.isMouseDown) { //在拖拽中，还有防止重复点击
      return
    }
    const { currentRect = {} } = this.state
    this.x1 = currentRect.x
    this.y1 = currentRect.y
    this.setIsDragging(false)
    this.isMouseDown = true
    this.handleCreateTask({ start_end: '1', top: currentRect.y })
    const target = this.refs.operateArea//event.target || event.srcElement;
    target.onmousemove = this.dashedDragMousemove.bind(this);
    target.onmouseup = this.dashedDragMouseup.bind(this);
  }
  dashedDragMousemove(e) {
    if (e.target.dataset.targetclassname == 'specific_example') { //不能滑动到某一个任务实例上
      return false
    }
    this.setIsDragging(true)

    const { datas: { ceiHeight, ceilWidth } } = this.props.model

    const target_0 = document.getElementById('gantt_card_out')
    const target_1 = document.getElementById('gantt_card_out_middle')
    const target = this.refs.operateArea//event.target || event.srcElement;
    const { coperatedX } = this.state
    // 取得鼠标位置
    const x = e.pageX - target_0.offsetLeft + target_1.scrollLeft - coperatedLeftDiv - coperatedX
    const y = e.pageY - target.offsetTop + target_1.scrollTop - dateAreaHeight
    //设置宽度
    const offset_left = Math.abs(x - this.x1);
    // 更新拖拽的最新矩形
    let px = this.x1//x < this.x1 ? x : this.x1 //向左向右延申
    let py = this.y1
    let width = (offset_left < ceilWidth) || (x < this.x1) ? ceilWidth : offset_left //小于单位长度或者鼠标相对点击的起始点向左拖动都使用最小单位
    width = Math.ceil(width / ceilWidth) * ceilWidth - 6 //向上取整 4为微调
    const property = {
      x: px,
      y: py,
      width,
      height: task_item_height,
    }

    this.setState({
      currentRect: property
    })
  }
  dashedDragMouseup(e) {
    if (e.target.dataset.targetclassname == 'specific_example') { //不能滑动到某一个任务实例上
      return false
    }
    const { currentRect = {} } = this.state
    this.stopDragging()
    this.handleCreateTask({ start_end: '2', top: currentRect.y })
  }
  stopDragging() {
    const target = this.refs.operateArea
    target.onmousemove = null;
    target.onmuseup = null;
    const that = this
    setTimeout(function () {
      that.isMouseDown = false
      that.setIsDragging(false)
    }, 1000)
  }

  //鼠标移动
  dashedMouseMove(e) {
    const { dataAreaRealHeight } = this.props
    if (e.target.offsetTop >= dataAreaRealHeight) return //在全部分组外的其他区域（在创建项目那一栏）

    if (e.target.dataset.targetclassname == 'specific_example') { //不能滑动到某一个任务实例上
      this.setState({
        dasheRectShow: false
      })
      return false
    }
    const { datas: { ceiHeight, ceilWidth } } = this.props.model
    if (this.isMouseDown) { //按下的情况不处理
      return false
    }
    const { dasheRectShow, coperatedX } = this.state
    if (!dasheRectShow) {
      this.setState({
        dasheRectShow: true
      })
    }

    const target_0 = document.getElementById('gantt_card_out')
    const target_1 = document.getElementById('gantt_card_out_middle')
    // 取得鼠标位置
    let px = e.pageX - target_0.offsetLeft + target_1.scrollLeft - coperatedLeftDiv - coperatedX
    let py = e.pageY - target_0.offsetTop + target_1.scrollTop - dateAreaHeight

    const molX = px % ceilWidth
    const molY = py % ceiHeight
    const mulX = Math.floor(px / ceilWidth)
    const mulY = Math.floor(py / ceiHeight)
    const delX = Number((molX / ceilWidth).toFixed(1))
    const delY = Number((molY / ceiHeight).toFixed(1))

    px = px - molX
    py = py - molY

    const property = {
      x: px,
      y: py,
      width: 40,
      height: task_item_height,
    }

    this.setState({
      currentRect: property
    })
  }
  dashedMouseLeave(e) {
    if (!this.isMouseDown) {
      this.setState({
        dasheRectShow: false
      })
    }
  }

  //记录起始时间，做创建任务工作
  handleCreateTask({ start_end, top }) {
    const { dataAreaRealHeight } = this.props
    if (top >= dataAreaRealHeight) return //在全部分组外的其他区域（在创建项目那一栏）

    const { dispatch } = this.props
    const { datas: { gold_date_arr = [], ceilWidth, date_arr_one_level = [] } } = this.props.model
    const { currentRect = {} } = this.state
    const { x, y, width, height } = currentRect
    let counter = 0
    let date = {}
    for (let val of date_arr_one_level) {
      counter += 1
      if (counter * ceilWidth > x + width) {
        date = val
        break
      }
    }
    const { timestamp } = date
    const update_name = start_end == '1' ? 'create_start_time' : 'create_end_time'
    dispatch({
      type: getEffectOrReducerByName('updateDatas'),
      payload: {
        [update_name]: timestamp
      }
    })

    if (start_end == '2') { //拖拽或点击操作完成，进行生成单条任务逻辑
      this.setSpecilTaskExample({ top }) //出现任务创建或查看任务
    }
  }

  //获取当前所在的分组, 根据创建或者查看任务时的高度
  getCurrentGroup({ top }) {
    if (top == undefined || top == null) {
      return
    }
    const getSum = (total, num) => {
      return total + num;
    }
    const { dispatch } = this.props
    const { datas: { group_list_area = [], list_group = [] } } = this.props.model
    let conter_key = 0
    for (let i = 0; i < group_list_area.length; i++) {
      if (i == 0) {
        if (top < group_list_area[0]) {
          conter_key = 0
          break
        }
      } else {
        const arr = group_list_area.slice(0, i + 1)
        const sum = arr.reduce(getSum);
        if (top < sum) {
          conter_key = i
          break
        }
      }
    }
    const current_list_group_id = list_group[conter_key]['list_id']
    dispatch({
      type: getEffectOrReducerByName('updateDatas'),
      payload: {
        current_list_group_id
      }
    })
  }

  //遍历,做排序--交叉
  taskItemToTop() {
    const { dispatch } = this.props

    //根据所获得的分组数据转换所需要的数据
    const { datas: { list_group = [] } } = this.props.model

    const list_group_new = [...list_group]

    //设置分组区域高度, 并为每一个任务新增一条
    for (let i = 0; i < list_group_new.length; i++) {
      const list_data = list_group_new[i]['list_data']
      const length = list_data.length
      for (let j = 0; j < list_data.length; j++) { //设置每一个实例的位置
        const item = list_data[j]
        let isoverlap = true //是否重叠，默认不重叠
        if (j > 0) {
          for (let k = 0; k < j; k++) {
            if (list_data[j]['start_time'] < list_data[k]['end_time'] || list_data[k]['end_time'] < list_data[j]['start_time']) {

            } else {
              isoverlap = false
              item.top = list_data[k].top
              // console.log(k, j)
              break
            }
          }
        }
        list_group_new[i]['list_data'][j] = item

        if (!isoverlap) {
          break
        }

      }
    }

    dispatch({
      type: getEffectOrReducerByName('updateDatas'),
      payload: {
        list_group: list_group_new
      }
    })
  }

  //点击某个实例,或者创建任务
  setSpecilTaskExample({ id, board_id, top }, e) {
    if (e) {
      e.stopPropagation()
    }
    this.getCurrentGroup({ top })
    const { dispatch } = this.props
    if (id) { //如果有id 则是修改任务，否则是创建任务
      this.props.setTaskDetailModalVisibile && this.props.setTaskDetailModalVisibile()
      dispatch({
        type: 'workbenchTaskDetail/getCardDetail',
        payload: {
          id,
          board_id,
          calback: function (data) {
            dispatch({
              type: 'workbenchPublicDatas/getRelationsSelectionPre',
              payload: {
                _organization_id: data.org_id
              }
            })
          }
        }
      })
      dispatch({
        type: 'workbenchTaskDetail/getCardCommentListAll',
        payload: {
          id: id
        }
      })
      dispatch({
        type: 'workbenchPublicDatas/updateDatas',
        payload: {
          board_id
        }
      })
    } else {
      this.props.addTaskModalVisibleChange && this.props.addTaskModalVisibleChange(true)
    }
  }

  // 设置任务标签颜色
  setLableColor = (label_data) => {
    let bgColor = ''
    let b = ''
    if (label_data && label_data.length) {
      const color_arr = label_data.map(item => {
        return `rgb(${item.label_color})`
      })
      const color_arr_length = color_arr.length
      const color_percent_arr = color_arr.map((item, index) => {
        return (index + 1) / color_arr_length * 100
      })
      bgColor = color_arr.reduce((total, color_item, current_index) => {
        return `${total},  ${color_item} ${color_percent_arr[current_index - 1] || 0}%, ${color_item} ${color_percent_arr[current_index]}%`
      }, '')

      b = `linear-gradient(to right${bgColor})`
    } else {
      b = '#ffffff'
    }
    return b
  }

  // 任务单项拖拽
  onCardItemDrag = (e) => {
    // console.log('sssss', e)
  }

  render() {
    const { currentRect = {}, dasheRectShow } = this.state
    const { datas: { gold_date_arr = [], list_group = [], ceilWidth, group_rows = [], ceiHeight } } = this.props.model

    return (
      <div className={indexStyles.gantt_operate_top}
        onMouseDown={this.dashedMousedown.bind(this)} //用来做拖拽虚线框
        onMouseMove={this.dashedMouseMove.bind(this)}
        onMouseLeave={this.dashedMouseLeave.bind(this)}
        ref={'operateArea'}>
        {dasheRectShow && (
          <div className={indexStyles.dasheRect} style={{
            left: currentRect.x + 1, top: currentRect.y,
            width: currentRect.width, height: currentRect.height,
            boxSizing: 'border-box',
            marginTop: task_item_margin_top,
            color: 'rgba(0,0,0,0.45)',
            textAlign: 'right',
            lineHeight: `${ceiHeight - task_item_margin_top}px`,
            paddingRight: 8,
          }} >{Math.ceil(currentRect.width / ceilWidth) != 1 && Math.ceil(currentRect.width / ceilWidth)}</div>
        )}
        {list_group.map((value, key) => {
          const { list_data = [] } = value
          return (
            list_data.map((value2, key) => {
              const { left, top, width, height, name, id, board_id, is_realize, executors = [], label_data = [], is_has_start_time, is_has_end_time } = value2

              return (
                <QueueAnim type="right" key={id} duration={200}>
                  <Dropdown placement="bottomRight" overlay={<CardDropDetail {...value2} />} key={id}>
                    <div
                      className={`${indexStyles.specific_example} ${!is_has_start_time && indexStyles.specific_example_no_start_time} ${!is_has_end_time && indexStyles.specific_example_no_due_time}`}
                      data-targetclassname="specific_example"
                      // onDrag={this.onCardItemDrag}
                      style={{
                        left: left, top: top,
                        width: (width || 6) - 6, height: (height || task_item_height),
                        marginTop: task_item_margin_top,
                        background: this.setLableColor(label_data),// 'linear-gradient(to right,rgba(250,84,28, 1) 25%,rgba(90,90,90, 1) 25%,rgba(160,217,17, 1) 25%,rgba(250,140,22, 1) 25%)',//'linear-gradient(to right, #f00 20%, #00f 20%, #00f 40%, #0f0 40%, #0f0 100%)',
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onMouseMove={(e) => e.stopPropagation()}
                      onClick={this.setSpecilTaskExample.bind(this, { id, top, board_id })}
                    >
                      <div
                        data-targetclassname="specific_example"
                        className={`${indexStyles.specific_example_content} ${!is_has_start_time && indexStyles.specific_example_no_start_time} ${!is_has_end_time && indexStyles.specific_example_no_due_time}`}
                        onMouseDown={(e) => e.stopPropagation()} >
                        <div data-targetclassname="specific_example"
                          className={`${indexStyles.card_item_status}`} onMouseDown={(e) => e.stopPropagation()} onMouseMove={(e) => e.stopPropagation()}>
                          <CheckItem is_realize={is_realize} />
                        </div>
                        <div data-targetclassname="specific_example"
                          className={`${indexStyles.card_item_name} ${globalStyles.global_ellipsis}`} onMouseDown={(e) => e.stopPropagation()} onMouseMove={(e) => e.stopPropagation()}>{name}</div>
                        <div data-targetclassname="specific_example"
                          onMouseDown={(e) => e.stopPropagation()} onMouseMove={(e) => e.stopPropagation()}>
                          <AvatarList users={executors} size={'small'} />
                        </div>
                      </div>
                    </div>
                  </Dropdown>
                </QueueAnim>

              )
            })
          )
        })}


        {list_group.map((value, key) => {
          const { lane_data, list_id, list_data = [] } = value
          const { milestones = {} } = lane_data
          return (
            <GetRowGanttItem key={list_id} list_id={list_id} list_data={list_data} rows={group_rows[key]} milestones={milestones} />
          )
        })}
        <GetRowGanttItemElse gantt_card_height={this.props.gantt_card_height} dataAreaRealHeight={this.props.dataAreaRealHeight} />
      </div>
    )
  }

}
//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ modal, gantt, loading }) {
  return { modal, model: gantt, loading }
}

