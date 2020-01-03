import React, { Component } from 'react';
import { connect, } from 'dva';
import indexStyles from './index.less'
import { isToday } from './getDate'
import globalStyles from '@/globalset/css/globalClassName.less'
import MilestoneDetail from './components/milestoneDetail'
import { isSamDay } from './getDate'
import { Dropdown, Menu } from 'antd'
import { ganttIsFold } from './constants';
import { caldiffDays } from '../../../../utils/util';
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
    let is_all_realized = '1'
    if (!timestamp || group_view_type != '1') { //只有在项目视图才可以看
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

    if (Number(timestamp) < new Date().getTime()) { //小于今天算逾期
      is_over_duetime = true
    }

    if (gantt_board_id == '0') {
      for (let val of current_date_miletones) {
        if (val['board_id'] == list_id) {
          flag = true
          current_date_board_miletones.push(val)
        }
      }
    } else {
      if (current_date_miletones.length) {
        flag = true
      }
      current_date_board_miletones = current_date_miletones
    }


    for (let val of current_date_board_miletones) {
      if (val['is_all_realized'] == '0') {
        is_all_realized = '0'
        break
      }
    }
    return {
      is_over_duetime,
      flag,
      is_all_realized,
      current_date_board_miletones,
    }
  }

  // 根据下一个里程碑日期，来获取当前里程碑日期的‘name1,name2,name3...’应该有的宽度
  setMiletonesNamesWidth = (timestamp) => {
    const { milestoneMap = {}, ceilWidth, gantt_board_id } = this.props
    const { list_id } = this.props //gantt_board_id为0的情况下，分组id就是各个项目的id
    let times_arr = Object.keys(milestoneMap) //[timestamp1, timestamp2,...]
    if (gantt_board_id == '0') { //以分组划分，过滤掉不属于该项目分组的里程碑所属于的时间
      times_arr = times_arr.filter(time => milestoneMap[time].findIndex(item => item.board_id == list_id) != -1)
    }
    // console.log('ssssss', times_arr)
    times_arr = times_arr.sort((a, b) => Number(a) - Number(b))
    const index = times_arr.findIndex((item) => isSamDay(item, timestamp)) //对应上当前日期所属的下标
    const next_miletones_time = times_arr[index + 1] //当前里程碑日期的对应下一个里程碑日期所在时间
    if (!next_miletones_time) {
      return 'auto'
    }
    return caldiffDays(timestamp, next_miletones_time) * ceilWidth
  }

  // 渲染里程碑的名字列表
  renderMiletonesNames = (list = []) => {
    const names = list.reduce((total, item, index) => {
      const split = index < list.length - 1 ? '，' : ''
      return total + item.name + split
    }, '')
    return names
  }
  // 设置里程碑的名字随着窗口上下滚动保持在窗口顶部
  setMiletonesNamesPostionTop = () => {
    let top = 0
    const { target_scrollTop, itemKey = 0, group_list_area_section_height = [], gantt_board_id } = this.props
    // console.log('ssssss_top',
    //   target_scrollTop,
    //   group_list_area_section_height[itemKey - 1],
    //   group_list_area_section_height[itemKey],
    //   target_scrollTop > group_list_area_section_height[itemKey - 1] && target_scrollTop < group_list_area_section_height[itemKey]
    // )
    if (gantt_board_id && gantt_board_id != '0') { //项目任务分组的情况下
      return target_scrollTop
    }
    if (itemKey == 0) {
      if (target_scrollTop < group_list_area_section_height[itemKey]) {
        top = target_scrollTop
      }
      // console.log('ssssss_top_11', itemKey, target_scrollTop, group_list_area_section_height[itemKey])
    } else {
      if (target_scrollTop > group_list_area_section_height[itemKey - 1] && target_scrollTop < group_list_area_section_height[itemKey]) {
        top = target_scrollTop - group_list_area_section_height[itemKey - 1]
      }
      // console.log('ssssss_top_22', itemKey, target_scrollTop, group_list_area_section_height[itemKey])
    }
    return top
  }

  // 里程碑是否过期的颜色设置
  setMiletonesColor = ({ is_over_duetime, has_lcb, is_all_realized }) => {
    if (!has_lcb) {
      return ''
    }
    if (is_over_duetime) {
      if (is_all_realized == '0') { //存在未完成任务
        return '#FFA39E'
      } else { //全部任务已完成
        return 'rgba(0,0,0,0.15)'
      }
    }
    // if (is_all_realized == '0') { //存在未完成任务
    //   if (is_over_duetime) {
    //     return '#FFA39E'
    //   }
    // } else { //全部任务已完成
    //   return 'rgba(0,0,0,0.15)'
    // }

    return ''
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
      <Menu onClick={(e) => this.selectLCB(e, timestamp)} style={{ width: 216 }}>
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
    this.setCurrentSelectedProjectMembersList({ board_id })
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
  deleteMiletone = ({ id }) => {
    const { milestoneMap = {}, dispatch } = this.props
    const new_milestoneMap = { ...milestoneMap }
    let flag = false
    for (let key in new_milestoneMap) {
      const item = new_milestoneMap[key]
      const length = item.length
      for (let i = 0; i < length; i++) {
        if (item[i].id == id) {
          flag = true
          new_milestoneMap[key].splice(i, 1)
          break
        }
      }
      if (flag) {
        break
      }
    }
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        milestoneMap: new_milestoneMap
      }
    })
  }
  // 里程碑删除子任务回调
  deleteRelationContent = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'gantt/getGttMilestoneList',
      payload: {
      }
    })
  }
  render() {
    const { rows = 7, itemKey } = this.props
    const { gold_date_arr = [], ceiHeight, gantt_board_id, group_view_type, show_board_fold, group_list_area_section_height, list_id } = this.props
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
                    const { week_day, timestamp, timestampEnd } = value2
                    const has_lcb = this.isHasMiletoneList(Number(timestampEnd)).flag
                    const current_date_board_miletones = this.isHasMiletoneList(Number(timestampEnd)).current_date_board_miletones
                    const is_over_duetime = this.isHasMiletoneList(Number(timestampEnd)).is_over_duetime
                    const is_all_realized = this.isHasMiletoneList(Number(timestampEnd)).is_all_realized
                    return (
                      <div className={`${indexStyles.ganttDetailItem}`}
                        data-list_id={list_id}
                        data-start_time={timestamp}
                        data-end_time={timestampEnd}
                        key={key2}
                        style={{ backgroundColor: (week_day == 0 || week_day == 6) ? 'rgba(0, 0, 0, 0.04)' : (isToday(timestamp) ? 'rgb(242, 251, 255)' : 'rgba(0,0,0,.02)') }}
                      >
                        {/* 12为上下margin的总和 */}
                        {
                          group_view_type == '1' &&
                          (gantt_board_id == '0' || (gantt_board_id != '0' && itemKey == 0)) &&
                          has_lcb && (
                            // <Dropdown overlay={this.renderLCBList(current_date_board_miletones, timestamp)}>
                            <div style={{ position: 'relative' }}>
                              {/* 旗帜 */}
                              <div className={`${indexStyles.board_miletiones_flag} ${globalStyles.authTheme}`}
                                data-targetclassname="specific_example"
                                onClick={this.seeMiletones}
                                onMouseDown={e => e.stopPropagation()}
                                style={{
                                  color: this.setMiletonesColor({ is_over_duetime, has_lcb, is_all_realized })
                                }}
                              >&#xe6a0;</div>
                              {/* 渲染里程碑名称铺开 */}
                              <Dropdown overlay={this.renderLCBList(current_date_board_miletones, timestamp)}>
                                <div className={`${indexStyles.board_miletiones_names} ${globalStyles.global_ellipsis}`}
                                  data-targetclassname="specific_example"
                                  style={{
                                    top: this.setMiletonesNamesPostionTop(),
                                    maxWidth: this.setMiletonesNamesWidth(timestampEnd) - 30,
                                    color: this.setMiletonesColor({ is_over_duetime, has_lcb, is_all_realized })
                                  }}>
                                  {this.renderMiletonesNames(current_date_board_miletones)}
                                </div>
                              </Dropdown>
                            </div>
                            // </Dropdown>
                          )
                        }
                        {
                          group_view_type == '1' &&
                          (gantt_board_id == '0' || (gantt_board_id != '0' && itemKey == 0)) &&
                          has_lcb && (
                            // <Dropdown placement={'topRight'} overlay={this.renderLCBList(current_date_board_miletones, timestamp)}>
                            <div
                              data-targetclassname="specific_example"
                              className={`${indexStyles.board_miletiones_flagpole}`}
                              style={{
                                height: gantt_board_id != '0' ? group_list_area_section_height[group_list_area_section_height.length - 1] - 11 : //在任务分组视图下
                                  (ganttIsFold({ gantt_board_id, group_view_type, show_board_fold }) ? 29 : item_height - 12),//,
                                //  backgroundColor: is_over_duetime ? '#FFA39E' : '#FFC069' ,
                                background: this.setMiletonesColor({ is_over_duetime, has_lcb, is_all_realized })
                              }}
                              onClick={this.seeMiletones}
                              onMouseDown={e => e.stopPropagation()}
                              onMouseOver={e => e.stopPropagation()}
                            // onMouseMove
                            />
                            // </Dropdown>
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
          deleteMiletone={this.deleteMiletone}
          handleMiletonesChange={this.handleMiletonsChangeMountInGantt}
          users={currentSelectedProjectMembersList}
          miletone_detail_modal_visible={this.state.miletone_detail_modal_visible}
          set_miletone_detail_modal_visible={this.set_miletone_detail_modal_visible}
          deleteRelationContent={this.deleteRelationContent}
        />
      </div>
    )
  }

}
//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ gantt: { datas: { target_scrollTop, gold_date_arr = [], group_list_area_section_height, ceiHeight, gantt_board_id, about_user_boards, milestoneMap, group_view_type, show_board_fold, ceilWidth } } }) {
  return { target_scrollTop, gold_date_arr, ceiHeight, gantt_board_id, about_user_boards, milestoneMap, group_view_type, show_board_fold, group_list_area_section_height, ceilWidth }
}
