import React, { Component } from 'react'
import indexStyles from './index.less'
import { connect } from 'dva'
import AvatarList from '@/components/avatarList'
import globalStyles from '@/globalset/css/globalClassName.less'
import CheckItem from '@/components/CheckItem'
import { task_item_height, task_item_margin_top, date_area_height } from './constants'
import { isSamDay } from './getDate'
import { updateTask, changeTaskType } from '../../../../services/technological/task'
import { isApiResponseOk } from '../../../../utils/handleResponseData'
import { message, Dropdown, Popover, Tooltip } from 'antd'
import CardDropDetail from './components/gattFaceCardItem/CardDropDetail'
import { filterDueTimeSpan, cardIsHasUnRead, cardItemIsHasUnRead } from './ganttBusiness'

// 参考自http://www.jq22.com/webqd1348

const dateAreaHeight = date_area_height //日期区域高度，作为修正
const coperatedLeftDiv = 20 //滚动条左边还有一个div的宽度，作为修正
const coperatedX = 0
@connect(mapStateToProps)
export default class GetRowTaskItem extends Component {

    constructor(props) {
        super(props)
        this.out_ref = React.createRef()
        this.is_down = false
        this.state = {
            local_width: 0,
            local_top: 0,
            local_left: 0,
            drag_type: 'position', // position/left/right 拖动位置/延展左边/延展右边
            is_moved: false, //当前mouseDown后，是否被拖动过
        }

        this.x = 0
        this.y = 0
        this.l = 0
        this.t = 0
        this.drag_type_map = {
            position: 'pointer',
            left: 'w-resize',
            right: 'e-resize'
        }
    }

    componentDidMount() {
        this.initSetPosition(this.props)
    }

    componentWillReceiveProps(nextProps) {

    }

    // 设置位置
    initSetPosition = (props) => {
        const { itemValue = {} } = props
        const { left, top, width } = itemValue

        this.setState({
            local_top: top,
            local_left: left,
            local_width: width, //实时变化
            local_width_flag: width, //作为local_width实时变化在拖动松开后的标志宽度
            local_width_origin: width, //记载原始宽度，不变，除非传递进来的改变
        })

    }

    // 标签的颜色
    setLableColor = (label_data, is_realize) => {
        let bgColor = ''
        let b = ''
        if (label_data && label_data.length) {
            const color_arr = label_data.map(item => {
                return `rgb(${item.label_color}${is_realize == '1' ? ',0.5' : ''})`
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

    // 任务弹窗
    setSpecilTaskExample = (data) => {
        const { task_is_dragging } = this.props
        const { is_moved } = this.state
        if (is_moved || task_is_dragging) {
            return
        }
        const { setSpecilTaskExample } = this.props
        setSpecilTaskExample(data)

        // 设置已读
        const { dispatch, im_all_latest_unread_messages } = this.props
        const { id } = data
        if (cardItemIsHasUnRead({ relaDataId: id, im_all_latest_unread_messages })) {
            dispatch({
                type: 'imCooperation/imUnReadMessageItemClear',
                payload: {
                    relaDataId: id
                }
            })
        }

    }

    onMouseDown = (e) => {
        e.stopPropagation()
        e.preventDefault() //解决拖拽卡顿？(尚未明确)
        const target = this.out_ref.current
        this.is_down = true;
        const { drag_type, local_top } = this.state
        if ('position' == drag_type) { //在中间
            target.style.cursor = 'move';
        }
        this.x = e.clientX;
        this.y = e.clientY
        //获取左部和顶部的偏移量
        this.l = target.offsetLeft;
        this.t = target.offsetTop;

        const { getCurrentGroup } = this.props
        getCurrentGroup({ top: local_top }) //设置当前操作的list_id

        window.onmousemove = this.onMouseMove.bind(this);
        window.onmouseup = this.onMouseUp.bind(this);
        this.props.setTaskIsDragging && this.props.setTaskIsDragging(true) //当拖动时，有可能会捕获到创建任务的动作，阻断
        // target.onmouseleave = this.onMouseUp.bind(this);
    }

    onMouseMove = (e) => {
        e.stopPropagation()
        this.handleMouseMove(e) //设置flag依赖
        if (this.is_down == false) {
            return;
        }
        this.setState({
            is_moved: true
        })
        const { drag_type } = this.state
        if ('position' == drag_type) {
            this.changePosition(e)
        } else if ('left' == drag_type) {
            // this.extentionLeft(e)
        } else if ('right' == drag_type) {
            this.extentionRight(e)
        }
    }

    // 拖动到边界时，设置滚动条的位置
    // dragToBoundaryExpand = ({ delay = 300, position = 200 }) => {
    //     const that = this
    //     const target = document.getElementById('gantt_card_out_middle')
    //     setTimeout(function () {
    //         if (target.scrollTo) {
    //             target.scrollTo(position, 0)
    //         } else {
    //             target.scrollLeft = position
    //         }
    //     }, delay)
    // }

    // 延展左边
    extentionLeft = (e) => {
        const nx = e.clientX;
        //计算移动后的左偏移量和顶部的偏移量
        const nl = nx - (this.x - this.l);
        const nw = this.x - nx //宽度
        this.setState({
            local_left: nl,
            local_width: nw < 44 ? 44 : nw
        })
    }

    // 延展右边
    extentionRight = (e) => {
        const nx = e.clientX;
        const { local_width_flag } = this.state

        //计算移动后的左偏移量和顶部的偏移量
        const nw = nx - this.x + local_width_flag //宽度
        // console.log('sssss', {
        //     nx,
        //     x: this.x,
        //     pageX: e.pageX
        // })
        this.setState({
            local_width: nw < 44 ? 44 : nw
        })
    }

    // 整条拖动
    changePosition = (e) => {
        const target_0 = document.getElementById('gantt_card_out')
        const target_1 = document.getElementById('gantt_card_out_middle')
        const target = this.out_ref.current//event.target || event.srcElement;
        // // 取得鼠标位置
        // const x = e.pageX - target_0.offsetLeft + target_1.scrollLeft - coperatedLeftDiv - coperatedX
        // const y = e.pageY - target.offsetTop + target_1.scrollTop - dateAreaHeight

        //获取x和y
        const nx = e.clientX;
        const ny = e.clientY;
        //计算移动后的左偏移量和顶部的偏移量
        const nl = nx - (this.x - this.l);
        const nt = ny - (this.y - this.t);
        this.setState({
            // local_top: nt,
            local_left: nl,
        })

        // 在分组和特定高度下才能设置高度
        const { gantt_board_id, group_list_area_section_height = [], ceiHeight } = this.props
        const item_height = (ceiHeight + task_item_margin_top) / 2
        if (gantt_board_id != '0' && nt < group_list_area_section_height[group_list_area_section_height.length - 1] - item_height) { //只有在分组的情况下才能拖上下
            this.setState({
                local_top: nt,
            })
        }
    }

    // 针对于在某一条任务上滑动时，判别鼠标再不同位置的处理，(ui箭头, 事件处理等)
    handleMouseMove = (event) => {
        const { ganttPanelDashedDrag } = this.props
        if (this.is_down || ganttPanelDashedDrag) { //准备拖动时不再处理, 拖拽生成一条任务时也不再处理
            return
        }
        const { currentTarget, clientX, clientY } = event
        const { clientWidth } = currentTarget
        const oDiv = currentTarget
        const target_1 = document.getElementById('gantt_card_out_middle')
        const offsetLeft = this.getX(oDiv);
        const rela_left = clientX - offsetLeft - 2 + target_1.scrollLeft //鼠标在该任务内的相对位置
        if (clientWidth - rela_left <= 6) { //滑动到右边
            this.setTargetDragTypeCursor('right')
        }
        // else if (rela_left <= 6) { //滑动到左边
        //     this.setTargetDragTypeCursor('left')
        // }
        else { //中间
            this.setTargetDragTypeCursor('position')
        }
    }

    // 设置鼠标形状和拖拽类型
    setTargetDragTypeCursor = (cursorTypeKey) => {
        this.setState({
            drag_type: cursorTypeKey
        })
        const cursorType = this.drag_type_map[cursorTypeKey]
        const target = this.out_ref.current
        if (target) {
            target.style.cursor = cursorType;
        }
    }
    getX = (obj) => {
        var parObj = obj;
        var left = obj.offsetLeft;
        while (parObj = parObj.offsetParent) {
            left += parObj.offsetLeft;
        }
        return left;
    }

    getY = (obj) => {
        var parObj = obj;
        var top = obj.offsetTop;
        while (parObj = parObj.offsetParent) {
            top += parObj.offsetTop;
        }
        return top;
    }

    // 拖拽完成后松开鼠标
    onMouseUp = (e) => {
        e.stopPropagation()
        this.x = 0
        this.y = 0
        this.l = 0
        this.t = 0
        if (this.is_down) {
            this.overDragCompleteHandle() //松开拖拽完成，继续操作
        }
        this.is_down = false
        this.setTargetDragTypeCursor('pointer')
        this.setState({
            local_width_flag: this.state.local_width,
        })
        window.onmousemove = null;
        window.onmuseup = null;

        setTimeout(() => {
            this.setState({
                is_moved: false
            })
            this.props.setTaskIsDragging && this.props.setTaskIsDragging(false) //当拖动完成后，释放创建任务的锁，让可以正常创建任务
        }, 500)
    }

    // 拖拽完成后的事件处理-----start--------
    overDragCompleteHandle = () => {
        const { drag_type, local_top } = this.state
        if ('right' == drag_type) {
            this.overDragCompleteHandleRight()
        } else if ('position' == drag_type) {
            this.overDragCompleteHandlePositon()
        } else {

        }

    }
    overDragCompleteHandleRight = () => { //右侧增减时间
        const { itemValue: { id, end_time, start_time, board_id } } = this.props
        const { local_left, local_width, local_width_origin } = this.state
        const { date_arr_one_level, ceilWidth } = this.props
        const updateData = {}
        const end_time_position = local_left + local_width
        const end_time_index = Math.floor((end_time_position - 6) / ceilWidth)
        const date = date_arr_one_level[end_time_index]
        const end_time_timestamp = date.timestampEnd
        updateData.due_time = end_time_timestamp
        if (isSamDay(end_time, end_time_timestamp)) { //向右拖动时，如果是在同一天，则不去更新
            const time_span_ = (Math.floor((end_time - start_time) / (24 * 3600 * 1000))) + 1
            const time_width = time_span_ * ceilWidth
            this.setState({
                local_width: time_width,
                local_width_flag: time_width
            })
            return
        }
        updateTask({ card_id: id, due_time: end_time_timestamp, board_id }, { isNotLoading: false })
            .then(res => {
                if (isApiResponseOk(res)) {
                    this.handleHasScheduleCard({
                        card_id: id,
                        updateData
                    })
                } else {
                    this.setState({
                        local_width: local_width_origin,
                        local_width_flag: local_width_origin
                    })
                    message.error(res.message)
                }
            }).catch(err => {
                message.error('更新失败')
            })
    }
    overDragCompleteHandlePositon = () => {
        const { gantt_board_id, current_list_group_id } = this.props

        if (gantt_board_id == '0' || current_list_group_id == this.getDragAroundListId()) {// 不在分组里面 ，获取分组拖拽时只在当前分组拖拽
            this.overDragCompleteHandlePositonAbout()
        } else {
            this.overDragCompleteHandlePositonAround()
        }
    }
    // 获取分组拖拽后分组id,
    getDragAroundListId = () => {
        const { local_top } = this.state
        const { group_list_area_section_height = [], ceiHeight, list_group = [] } = this.props
        const item_height = (ceiHeight + task_item_margin_top) / 2
        const gold_area_position = local_top + item_height
        const length = group_list_area_section_height.length
        let list_group_index = 0
        for (let i = 0; i < length; i++) {
            if (gold_area_position < group_list_area_section_height[i]) {
                list_group_index = i
                break
            }
        }
        // console.log('ssss', local_top, gold_area_position)
        return list_group[list_group_index].list_id
    }
    // 不在项目分组内，左右移动
    overDragCompleteHandlePositonAbout = () => {
        const { itemValue: { id, top, start_time, board_id, left } } = this.props
        const { local_left, local_width, local_width_origin } = this.state
        const { date_arr_one_level, ceilWidth } = this.props
        const updateData = {}

        const date_span = local_width / ceilWidth
        const start_time_index = Math.floor(local_left / ceilWidth)
        const start_date = date_arr_one_level[start_time_index]
        const start_time_timestamp = start_date.timestamp
        //截至时间为起始时间 加上间隔天数的毫秒数, - 60 * 1000为一分钟的毫秒数，意为截至日期的23:59
        const end_time_timestamp = start_time_timestamp + ((24 * 60 * 60) * 1000) * date_span - 60 * 1000
        updateData.start_time = start_time_timestamp
        updateData.due_time = end_time_timestamp
        if (isSamDay(start_time, start_time_timestamp)) { //向右拖动时，如果是在同一天，则不去更新
            this.setState({
                local_left: left,
                local_top: top
            })
            return
        }
        updateTask({ card_id: id, due_time: end_time_timestamp, start_time: start_time_timestamp, board_id }, { isNotLoading: false })
            .then(res => {
                if (isApiResponseOk(res)) {
                    this.handleHasScheduleCard({
                        card_id: id,
                        updateData
                    })
                } else {
                    this.setState({
                        local_left: left
                    })
                    message.error(res.message)
                }
            }).catch(err => {
                message.error('更新失败')
            })
    }
    // 在项目分组内，上下左右移动
    overDragCompleteHandlePositonAround = (data = {}) => {
        const { itemValue: { id, end_time, start_time, board_id, left, top }, gantt_board_id } = this.props
        const { local_left, local_width, local_width_origin } = this.state
        const { date_arr_one_level, ceilWidth } = this.props
        const updateData = {}

        const date_span = local_width / ceilWidth
        const start_time_index = Math.floor(local_left / ceilWidth)
        const start_date = date_arr_one_level[start_time_index]
        const start_time_timestamp = start_date.timestamp
        //截至时间为起始时间 加上间隔天数的毫秒数, - 60 * 1000为一分钟的毫秒数，意为截至日期的23:59
        const end_time_timestamp = start_time_timestamp + ((24 * 60 * 60) * 1000) * date_span - 60 * 1000
        updateData.start_time = start_time_timestamp
        updateData.due_time = end_time_timestamp

        const params_list_id = this.getDragAroundListId()
        const params = {
            card_id: id,
            due_time: end_time_timestamp,
            start_time: start_time_timestamp,
            board_id,
            list_id: params_list_id
        }
        if (params_list_id == '0') {
            delete params.list_id
        }
        changeTaskType({ ...params }, { isNotLoading: false })
            .then(res => {
                if (isApiResponseOk(res)) {
                    this.changeCardBelongGroup({
                        card_id: id,
                        new_list_id: params_list_id,
                        updateData
                    })
                } else {
                    this.setState({
                        local_left: left,
                        local_top: top
                    })
                    message.error(res.message)
                }
            }).catch(err => {
                this.setState({
                    local_left: left,
                    local_top: top
                })
                message.error('更新失败')
                // console.log('ssss', err)
            })
    }
    // 拖拽完成后的事件处理------end---------

    // 改变任务分组
    changeCardBelongGroup = ({ new_list_id, card_id, updateData = {} }) => {
        // 该任务在新旧两个分组之间交替
        const { list_group = [], list_id, dispatch, current_list_group_id } = this.props
        const list_group_new = [...list_group]
        const group_index = list_group_new.findIndex(item => item.lane_id == list_id) //老分组的分组位置
        const group_index_cards_index = list_group_new[group_index].lane_data.cards.findIndex(item => item.id == card_id) //老分组的该分组的该任务的位置
        let group_index_cards_item = list_group_new[group_index].lane_data.cards[group_index_cards_index] //当前这条
        group_index_cards_item = { ...group_index_cards_item, ...updateData } //更新这条

        const group_index_gold_index = list_group_new.findIndex(item => item.lane_id == new_list_id) //新分组的分组位置
        list_group_new[group_index_gold_index].lane_data.cards.push(group_index_cards_item) //添加进新分组
        list_group_new[group_index].lane_data.cards.splice(group_index_cards_index, 1) //从老分组移除

        dispatch({
            type: 'gantt/handleListGroup',
            payload: {
                data: list_group_new,
                not_set_scroll_top: true
            }
        })
    }
    // 修改有排期的任务
    handleHasScheduleCard = ({ card_id, updateData = {} }) => {
        const { list_group = [], list_id, dispatch } = this.props
        const list_group_new = [...list_group]
        const group_index = list_group_new.findIndex(item => item.lane_id == list_id)
        const group_index_cards_index = list_group_new[group_index].lane_data.cards.findIndex(item => item.id == card_id)
        list_group_new[group_index].lane_data.cards[group_index_cards_index] = { ...list_group_new[group_index].lane_data.cards[group_index_cards_index], ...updateData }

        dispatch({
            type: 'gantt/handleListGroup',
            payload: {
                data: list_group_new,
                not_set_scroll_top: true
            }
        })
    }

    render() {
        const { itemValue = {}, im_all_latest_unread_messages } = this.props
        const {
            left,
            top, width,
            height,
            name, id,
            board_id, is_realize,
            type,
            executors = [], label_data = [],
            is_has_start_time, is_has_end_time,
            start_time, due_time, is_privilege,
        } = itemValue
        const { local_left, local_top, local_width } = this.state
        const { is_overdue, due_description } = filterDueTimeSpan({ start_time, due_time, is_has_end_time, is_has_start_time })
        // console.log('sssss', { id, im_all_latest_unread_messages })
        return (
            <Popover placement="bottom" content={<CardDropDetail list={[{ ...itemValue }]} />} key={id}>
                <div
                    className={`${indexStyles.specific_example} ${!is_has_start_time && indexStyles.specific_example_no_start_time} ${!is_has_end_time && indexStyles.specific_example_no_due_time}`}
                    data-targetclassname="specific_example"
                    // draggable
                    ref={this.out_ref}
                    style={{
                        zIndex: this.is_down ? 2 : 1,
                        left: local_left, top: local_top,
                        width: (local_width || 6) - 6, height: (height || task_item_height),
                        marginTop: task_item_margin_top,
                        background: this.setLableColor(label_data, is_realize), // 'linear-gradient(to right,rgba(250,84,28, 1) 25%,rgba(90,90,90, 1) 25%,rgba(160,217,17, 1) 25%,rgba(250,140,22, 1) 25%)',//'linear-gradient(to right, #f00 20%, #00f 20%, #00f 40%, #0f0 40%, #0f0 100%)',
                    }}
                    // 拖拽
                    onMouseDown={(e) => this.onMouseDown(e)}
                    onMouseMove={(e) => this.onMouseMove(e)}
                    onMouseUp={() => this.setSpecilTaskExample({ id, top, board_id })}
                // 不拖拽
                // onMouseMove={(e) => e.stopPropagation()}
                // onClick={() => this.setSpecilTaskExample({ id, top, board_id })}
                >
                    <div
                        data-targetclassname="specific_example"
                        className={`${indexStyles.specific_example_content} ${!is_has_start_time && indexStyles.specific_example_no_start_time} ${!is_has_end_time && indexStyles.specific_example_no_due_time}`}
                        // onMouseDown={(e) => e.stopPropagation()} 
                        onMouseMove={(e) => e.preventDefault()}
                        style={{ opacity: 1 }}
                    >
                        <div data-targetclassname="specific_example"
                            className={`${indexStyles.card_item_status}`}
                            //  onMouseDown={(e) => e.stopPropagation()} 
                            onMouseMove={(e) => e.preventDefault()}
                        >
                            <CheckItem is_realize={is_realize} card_type={type} styles={{ color: is_realize == '1' ? 'rgba(0,0,0,.25)' : '' }} />
                        </div>
                        <div data-targetclassname="specific_example"
                            className={`${indexStyles.card_item_name} ${globalStyles.global_ellipsis}`}
                            // onMouseDown={(e) => e.stopPropagation()}
                            onMouseMove={(e) => e.preventDefault()}
                            style={{ display: 'flex', color: is_realize == '1' ? 'rgba(0,0,0,.25)' : '' }}
                        >
                            {name}
                            {
                                is_privilege == '1' && (
                                    <Tooltip title="已开启访问控制" placement="top">
                                        <span className={`${globalStyles.authTheme}`}
                                            style={{ color: 'rgba(0,0,0,0.50)', marginLeft: '5px' }}
                                            data-targetclassname="specific_example">
                                            &#xe7ca;
                                        </span>
                                    </Tooltip>
                                )
                            }
                            <span className={indexStyles.due_time_description} data-targetclassname="specific_example">
                                {
                                    is_overdue && is_realize != '1' && due_description
                                }
                            </span>

                        </div>
                        <div data-targetclassname="specific_example"
                            // onMouseDown={(e) => e.stopPropagation()} 
                            onMouseMove={(e) => e.preventDefault()}
                            style={{
                                opacity: is_realize == '1' ? 0.5 : 1
                            }}
                        >
                            <AvatarList users={executors} size={'small'} targetclassname={'specific_example'} />
                        </div>
                    </div>
                    {/* 存在未读 */}
                    {
                        cardItemIsHasUnRead({ relaDataId: id, im_all_latest_unread_messages }) && (
                            <div
                                className={indexStyles.has_unread_news}
                                data-targetclassname="specific_example"
                                style={{}}
                            ></div>
                        )
                    }
                </div>
            </Popover>
        )
    }
}
function mapStateToProps({ gantt: {
    datas: {
        list_group = [],
        date_arr_one_level = [],
        ceilWidth,
        ceiHeight,
        gantt_board_id,
        group_list_area,
        current_list_group_id,
        group_list_area_section_height = [],
    }
},
    imCooperation: {
        im_all_latest_unread_messages = []
    }
}) {
    return {
        list_group,
        date_arr_one_level,
        ceilWidth,
        ceiHeight,
        gantt_board_id,
        group_list_area,
        current_list_group_id,
        group_list_area_section_height,
        im_all_latest_unread_messages
    }
}
