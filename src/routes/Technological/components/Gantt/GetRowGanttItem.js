import React, { Component } from 'react';
import { connect, } from 'dva';
import indexStyles from './index.less'
import { isToday } from './getDate'
import globalStyles from '@/globalset/css/globalClassName.less'
import MilestoneDetail from './components/milestoneDetail'
import { isSamDay } from './getDate'
import { Dropdown, Menu } from 'antd'
const MenuItem = Menu.Item
const getEffectOrReducerByName = name => `gantt/${name}`
@connect(mapStateToProps)
export default class GetRowGanttItem extends Component {

  constructor(props) {
    super(props)
    this.state = {
      miletone_detail_modal_visible: false, //里程碑详情是否点开
      needs_task_arr: [], //实现以起始时间相同的为同一分组
    }
  }

  initSet(props) {
    const { list_id, list_data } = this.props
    // console.log(list_id, list_data)
    let start_time_arr = []
    let needs_task_arr = []
    const sortCreateTime = (a, b) => {
      return a.create_time - b.create_time
    }
    for (let val of list_data) {
      start_time_arr.push(val['start_time'])
    }
    start_time_arr = new Set(start_time_arr)
    for (let val of start_time_arr) {
      let arr = []
      for (let val2 of list_data) {
        if (val == val2['start_time']) {
          arr.push(val2)
        }
      }
      arr.sort(sortCreateTime)
      needs_task_arr = [].concat(needs_task_arr, arr)
    }
  }

  seeMiletones = () => {

  }

  isHasMiletoneList = (timestamp) => {
    const { milestoneMap = [], list_id, gantt_board_id, group_view_type } = this.props
    let flag = false
    let current_date_miletones = [] //当前日期的所有里程碑列表
    let current_date_board_miletones = [] //当前日期对应的项目的所有里程碑列表
    let is_over_duetime = false
    if (!timestamp || group_view_type != '1' || gantt_board_id != '0') { //只有在全部项目下的项目视图才可以看
      return {
        flag,
        current_date_board_miletones
      }
    }
    // console.log('ssssssssss', { gantt_board_id, list_id })
    for (let key in milestoneMap) {
      // 是同一天，并且在全部项目下里程碑所属的board_id和对应的分组id相等
      if (isSamDay(Number(timestamp), Number(key) * 1000)) {
        current_date_miletones = current_date_miletones.concat(milestoneMap[key])
      }
    }

    if(Number(timestamp) < new Date().getTime()) { //小于今天算逾期
      is_over_duetime = true
    }

    for(let val of current_date_miletones) {
      if(val['board_id'] == list_id) {
        flag = true
        current_date_board_miletones.push(val)
      }
    }

    return {
      is_over_duetime,
      flag,
      current_date_board_miletones,
    }
  }
  set_miletone_detail_modal_visible = () => {
    const { miletone_detail_modal_visible } = this.state
    this.setState({
      miletone_detail_modal_visible: !miletone_detail_modal_visible
    })
  }

  // 里程碑详情和列表
  renderLCBList = (current_date_miletones, timestamp) => {
    return (
      <Menu onClick={(e) => this.selectLCB(e, timestamp)}>
        {current_date_miletones.map((value, key) => {
          const { id, name, board_id } = value
          return (
            <MenuItem
              data-targetclassname="specific_example"
              className={globalStyles.global_ellipsis}
              style={{ width: 216 }}
              key={`${board_id}__${id}`}>
              {name}
            </MenuItem>
          )
        })}
      </Menu>
    )
  }
  // 过滤项目成员
  setCurrentSelectedProjectMembersList = ({ board_id }) => {
    const { about_user_boards = [] } = this.props
    const users = (about_user_boards.find(item => item.board_id == board_id) || {}).users
    // console.log('ssssssss', { users, board_id})
    this.setState({
      currentSelectedProjectMembersList: users
    })
  }
  // 选择里程碑
  selectLCB = (e, timestamp) => {
    const idarr = e.key.split('__')
    const id = idarr[1]
    const board_id = idarr[0]
    this.setCurrentSelectedProjectMembersList({board_id})
    this.set_miletone_detail_modal_visible()
    // this.getMilestoneDetail(id)
    //更新里程碑id,在里程碑的生命周期会监听到id改变，发生请求
    const { dispatch } = this.props
    dispatch({
      type: 'milestoneDetail/updateDatas',
      payload: {
        milestone_id: id
      }
    })
  }

  // 甘特图信息变化后，实时触发甘特图渲染在甘特图上变化
  handleMiletonsChangeMountInGantt = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'gantt/getGttMilestoneList',
      payload: {

      }
    })
  }

  render() {
    const { rows = 7 } = this.props
    const { gold_date_arr = [], ceiHeight, gantt_board_id, group_view_type } = this.props
    const { currentSelectedProjectMembersList } = this.state
    const item_height = rows * ceiHeight
    return (
      <div className={indexStyles.ganttAreaOut}>

        <div className={indexStyles.ganttArea} >
          {gold_date_arr.map((value, key) => {
            const { date_inner = [] } = value
            return (
              <div className={indexStyles.ganttAreaItem} key={key}>
                <div className={indexStyles.ganttDetail} style={{ height: item_height }}>
                  {date_inner.map((value2, key2) => {
                    const { week_day, timestamp, } = value2
                    const has_lcb = this.isHasMiletoneList(Number(timestamp)).flag
                    const current_date_board_miletones = this.isHasMiletoneList(Number(timestamp)).current_date_board_miletones
                    const is_over_duetime = this.isHasMiletoneList(Number(timestamp)).is_over_duetime
                    return (
                      <div className={`${indexStyles.ganttDetailItem}`}
                        key={key2}
                        style={{ backgroundColor: (week_day == 0 || week_day == 6) ? 'rgba(0, 0, 0, 0.04)' : (isToday(timestamp) ? 'rgb(242, 251, 255)' : 'rgba(0,0,0,.02)') }}
                      >
                        {/* 12为上下margin的总和 */}
                        {
                          gantt_board_id == '0' && has_lcb && group_view_type == '1' && (
                            <Dropdown overlay={this.renderLCBList(current_date_board_miletones, timestamp)}>
                              <div className={`${indexStyles.board_miletiones_flag} ${globalStyles.authTheme}`}
                                data-targetclassname="specific_example"
                                onClick={this.seeMiletones}
                                onMouseDown={e => e.stopPropagation()}
                                style={{color: is_over_duetime?'#FF7875': '#FAAD14'}}
                              >&#xe6a0;</div>
                            </Dropdown>
                          )
                        }
                        {
                          gantt_board_id == '0' && has_lcb && group_view_type == '1' && (
                            <Dropdown placement={'topRight'} overlay={this.renderLCBList(current_date_board_miletones, timestamp)}>
                              <div
                                data-targetclassname="specific_example"
                                className={`${indexStyles.board_miletiones_flagpole}`}
                                style={{ height: item_height - 12, backgroundColor: is_over_duetime?'#FF7875': '#FAAD14' }}
                                onClick={this.seeMiletones}
                                onMouseDown={e => e.stopPropagation()}
                                onMouseOver={e => e.stopPropagation()}
                                // onMouseMove
                              />
                            </Dropdown>
                          )
                        }
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        <MilestoneDetail
          handleMiletonesChange={this.handleMiletonsChangeMountInGantt}
          users={currentSelectedProjectMembersList}
          miletone_detail_modal_visible={this.state.miletone_detail_modal_visible}
          set_miletone_detail_modal_visible={this.set_miletone_detail_modal_visible}
        />
      </div>
    )
  }

}
//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ gantt: { datas: { gold_date_arr = [], ceiHeight, gantt_board_id, about_user_boards, milestoneMap, group_view_type } } }) {
  return { gold_date_arr, ceiHeight, gantt_board_id, about_user_boards, milestoneMap, group_view_type }
}
