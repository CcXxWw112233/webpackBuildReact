import React, { Component } from 'react'
import { connect } from 'dva'
import indexStyles from './index.less'
import GroupListHeadItem from './GroupListHeadItem'
import GroupListHeadElse from './GroupListHeadElse'
import OutLineHeadItem from './OutLineHeadItem'
import { date_area_height, ganttIsOutlineView } from './constants'
import emptyBoxImageUrl from '@/assets/gantt/empty-box.png'
import { Button } from 'antd'
import OutlineGuideModal from './components/OutlineGuideModal'
import { milestoneInit } from '@/services/technological/task.js'
import ExcelRead from '../../../../components/Excel'
@connect(mapStateToProps)
export default class GroupListHead extends Component {
  constructor(props) {
    super(props)
    this.state = {
      offsetTop: 0,
      offsetLeft: 0,
      set_scroll_top_timer: null
    }
  }

  componentDidMount = () => {
    this.setHeaderPostion()
  }
  setHeaderPostion = () => {
    const gantt_card_out = document.getElementById('gantt_card_out')
    if (gantt_card_out) {
      const offsetTop = gantt_card_out.offsetTop
      const offsetLeft = gantt_card_out.offsetLeft
      this.setState({
        offsetTop,
        offsetLeft
      })
    }
  }

  // 头部鼠标滚动设置位置
  onWheel = e => {
    const { target_scrollTop, dispatch, target_scrollLeft } = this.props
    const ele = document.getElementById('gantt_card_out_middle')
    const panel_scroll_top = ele.scrollTop
    let new_target_scrollTop = panel_scroll_top
    // console.log('ssssssssssss0', ele.scrollTop)
    if (e.nativeEvent.deltaY <= 0) {
      /* scrolling up */
      if (ele.scrollTop <= 0) {
        e.preventDefault()
        // console.log('ssssssssssss1', 'scrolling up')
        return
      } else {
        new_target_scrollTop -= 50
        // console.log('ssssssssssss1', new_target_scrollTop)
      }
    } else {
      /* scrolling down */
      if (ele.scrollTop + ele.clientHeight >= ele.scrollHeight) {
        e.preventDefault()
        // console.log('ssssssssssss2', 'scrolling down')
        return
      } else {
        new_target_scrollTop += 50
        // console.log('ssssssssssss2', new_target_scrollTop)
      }
    }
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        target_scrollTop: new_target_scrollTop
      }
    })
    if (ele.scrollTo) {
      ele.scrollTo(target_scrollLeft, new_target_scrollTop)
    } else {
      ele.scrollTop = new_target_scrollTop
    }
  }

  openBoardTemplateDrawer = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        boardTemplateShow: 1
      }
    })
  }

  guideModalHandleClose = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        startPlanType: -1
      }
    })
  }

  openGuideModal = boardId => {
    const { dispatch } = this.props
    dispatch({
      type: 'gantt/getGanttData',
      payload: {}
    })
    dispatch({
      type: 'gantt/updateDatas',
      payload: {
        startPlanType: 1
      }
    })
    // milestoneInit({ board_id: boardId }).then((res) => {
    //   dispatch({
    //     type: 'gantt/getGanttData',
    //     payload: {

    //     }
    //   });
    //   dispatch({
    //     type: 'gantt/updateDatas',
    //     payload: {
    //       startPlanType: 1
    //     }
    //   });
    // });
  }
  headScroll = e => {
    e.stopPropagation()
    if (this.props.scroll_area == 'gantt_body') {
      return
    }
    if ('gantt_group_head' != e.target.getAttribute('id')) return
    const { scrollTop } = e.target
    const gantt_card_out_middle = document.getElementById(
      'gantt_card_out_middle'
    )
    if (gantt_card_out_middle) {
      gantt_card_out_middle.scrollTop = scrollTop
    }
    this.handleScrollVertical({ scrollTop })
  }
  // 处理上下滚动
  handleScrollVertical = ({ scrollTop }) => {
    const {
      group_view_type,
      gantt_board_id,
      target_scrollTop,
      dispatch
    } = this.props
    if (target_scrollTop == scrollTop) return
    if (group_view_type == '1' && gantt_board_id == '0') {
      const { set_scroll_top_timer } = this.state
      if (set_scroll_top_timer) {
        clearTimeout(set_scroll_top_timer)
      }
      this.setState({
        set_scroll_top_timer: setTimeout(() => {
          dispatch({
            type: 'gantt/updateDatas',
            payload: {
              target_scrollTop_board_storage: scrollTop,
              target_scrollTop: scrollTop
            }
          })
        }, 500)
      })
    }
  }

  // 鼠标事件设置滚动区域
  onMouseOverCapture = () => {
    const { scroll_area } = this.props
    if (scroll_area == 'gantt_head') return
    this.props.setScrollArea('gantt_head')
  }
  render() {
    const {
      list_group = [],
      group_rows = [],
      ceiHeight,
      target_scrollLeft,
      target_scrollTop,
      group_view_type,
      outline_tree = [],
      get_gantt_data_loaded,
      gantt_board_id
    } = this.props
    const { startPlanType } = this.props
    const isNewProject =
      !outline_tree || outline_tree.length == 0 ? true : false
    // if (get_gantt_data_loaded == false) {
    //   return (
    //     <div className={indexStyles.listHead}></div>
    //   );
    // }
    // if (ganttIsOutlineView({ group_view_type })) {
    //   if (get_gantt_data_loaded == false) {
    //     return (
    //       <div className={indexStyles.listHead}></div>
    //     );
    //   } else {
    //     if (isNewProject && startPlanType == 0) {
    //       return (
    //         <div className={indexStyles.newProjectGuideWrapper}>
    //           <div className={indexStyles.emptyBox}>
    //             <div><img src={emptyBoxImageUrl} width={88} height={88} /></div>
    //             <div>还没有计划，赶快新建一个吧</div>
    //           </div>
    //           <div className={indexStyles.guideButtons}>
    //             <Button type="primary" className={indexStyles.selectMakePlanBtn} block onClick={() => { this.openGuideModal(gantt_board_id) }}>制定计划</Button>
    //             <Button block onClick={this.openBoardTemplateDrawer}>选择模版</Button>
    //           </div>
    //         </div>
    //       )
    //     } else {
    //       return (
    //         <div className={`${ganttIsOutlineView({ group_view_type }) ? indexStyles.listTree : indexStyles.listHead}`}
    //           onScroll={this.headScroll}
    //           onMouseEnter={() => this.props.setScrollArea('gantt_head')}
    //           id={'gantt_group_head'}>
    //           <div style={{
    //             width: '280px',
    //             boxShadow: '1px 0px 4px 0px rgba(0,0,0,0.15);'
    //           }}>
    //             <OutLineHeadItem
    //               setScrollPosition={this.props.setScrollPosition}
    //               setGoldDateArr={this.props.setGoldDateArr}
    //               gantt_card_height={this.props.gantt_card_height}
    //               dataAreaRealHeight={this.props.dataAreaRealHeight}
    //               changeOutLineTreeNodeProto={this.props.changeOutLineTreeNodeProto} deleteOutLineTreeNode={this.props.deleteOutLineTreeNode}
    //             />
    //             <GroupListHeadElse gantt_card_height={this.props.gantt_card_height} dataAreaRealHeight={this.props.dataAreaRealHeight} />
    //             {/* {
    //             startPlanType == 1 &&
    //             <OutlineGuideModal handleClose={this.guideModalHandleClose} />
    //           } */}
    //           </div>
    //         </div>
    //       )
    //     }
    //   }
    // } else {
    //   return (
    //     <div className={`${ganttIsOutlineView({ group_view_type }) ? indexStyles.listTree : indexStyles.listHead}`}
    //       onScroll={this.headScroll}
    //       onMouseEnter={() => this.props.setScrollArea('gantt_head')}
    //       id={'gantt_group_head'}>
    //       <>
    //         {
    //           list_group.map((value, key) => {
    //             const { list_name, list_id, list_data = [] } = value
    //             return (
    //               <div key={list_id}>
    //                 <GroupListHeadItem
    //                   list_id={list_id}
    //                   setTaskDetailModalVisibile={this.props.setTaskDetailModalVisibile}
    //                   itemValue={value} itemKey={key} rows={group_rows[key]} />
    //               </div>
    //             )
    //           })
    //         }
    //         <GroupListHeadElse gantt_card_height={this.props.gantt_card_height} dataAreaRealHeight={this.props.dataAreaRealHeight} />
    //       </>
    //     </div>
    //   )
    // }

    if (
      ganttIsOutlineView({ group_view_type }) &&
      isNewProject &&
      startPlanType == 0
    ) {
      if (get_gantt_data_loaded == false) {
        return <div className={indexStyles.listHead}></div>
      }
      return (
        <div className={indexStyles.newProjectGuideWrapper}>
          <div className={indexStyles.emptyBox}>
            <div>
              <img src={emptyBoxImageUrl} width={88} height={88} />
            </div>
            <div>暂无计划，赶快新建一个吧</div>
          </div>
          <div className={indexStyles.guideButtons}>
            <Button
              type="primary"
              className={indexStyles.selectMakePlanBtn}
              block
              onClick={() => {
                this.openGuideModal(gantt_board_id)
              }}
            >
              创建计划
            </Button>
            <Button block onClick={this.openBoardTemplateDrawer}>
              使用计划模版
            </Button>
            <ExcelRead board_id={gantt_board_id} />
          </div>
        </div>
      )
    } else {
      return (
        <div
          className={`${
            ganttIsOutlineView({ group_view_type })
              ? indexStyles.listTree
              : indexStyles.listHead
          }`}
          onScroll={this.headScroll}
          onMouseOverCapture={this.onMouseOverCapture}
          onMouseEnter={() => this.props.setScrollArea('gantt_head')}
          onTouchStart={() => {
            this.props.setScrollArea('gantt_head')
          }}
          id={'gantt_group_head'}
        >
          <div>
            {ganttIsOutlineView({ group_view_type }) && (
              <div
                style={{
                  // width: '280px',
                  boxShadow: '1px 0px 4px 0px rgba(0,0,0,0.15);'
                }}
              >
                <OutLineHeadItem
                  setScrollPosition={this.props.setScrollPosition}
                  setGoldDateArr={this.props.setGoldDateArr}
                  gantt_card_height={this.props.gantt_card_height}
                  dataAreaRealHeight={this.props.dataAreaRealHeight}
                  changeOutLineTreeNodeProto={
                    this.props.changeOutLineTreeNodeProto
                  }
                  deleteOutLineTreeNode={this.props.deleteOutLineTreeNode}
                />
                {/* <GroupListHeadElse
                  gantt_card_height={this.props.gantt_card_height}
                  dataAreaRealHeight={this.props.dataAreaRealHeight}
                /> */}
                <div style={{ height: date_area_height }}></div>
                {
                  // startPlanType == 1 &&
                  <OutlineGuideModal handleClose={this.guideModalHandleClose} />
                }
              </div>
            )}
            {!ganttIsOutlineView({ group_view_type }) && (
              <>
                {list_group.map((value, key) => {
                  const { list_name, list_id, list_data = [] } = value
                  return (
                    <div key={list_id}>
                      <GroupListHeadItem
                        list_id={list_id}
                        setTaskDetailModalVisibile={
                          this.props.setTaskDetailModalVisibile
                        }
                        itemValue={value}
                        itemKey={key}
                        rows={group_rows[key]}
                      />
                    </div>
                  )
                })}
                {/* <GroupListHeadElse
                  gantt_card_height={this.props.gantt_card_height}
                  dataAreaRealHeight={this.props.dataAreaRealHeight}
                /> */}
              </>
            )}
          </div>
        </div>
      )
    }
  }
}
//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
  gantt: {
    datas: {
      list_group = [],
      group_rows = [],
      ceiHeight,
      target_scrollLeft,
      target_scrollTop,
      group_list_area,
      group_list_area_section_height,
      group_view_type,
      outline_tree,
      startPlanType,
      get_gantt_data_loaded,
      gantt_board_id
    }
  }
}) {
  return {
    list_group,
    group_rows,
    ceiHeight,
    target_scrollLeft,
    target_scrollTop,
    group_list_area,
    group_list_area_section_height,
    group_view_type,
    outline_tree,
    startPlanType,
    get_gantt_data_loaded,
    gantt_board_id
  }
}
