import React, { Component } from 'react'
import { connect } from 'dva'
import indexStyles from './index.less'
import globalStyles from '../../../../globalset/css/globalClassName.less'
import { Tooltip, Menu, Dropdown } from 'antd'
const MenuItem = Menu.Item

const getEffectOrReducerByName = name => `gantt/${name}`
@connect(mapStateToProps)
export default class DateListLCBItem extends Component {
  constructor(props) {
    super(props)
  }

  checkLCB = ({ has_lcb }) => {}

  selectLCB = e => {
    const id = e.key
    this.props.set_miletone_detail_modal_visible &&
      this.props.set_miletone_detail_modal_visible()
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
  //获取里程碑详情
  getMilestoneDetail = id => {
    const { dispatch } = this.props
    dispatch({
      type: 'milestoneDetail/getMilestoneDetail',
      payload: {
        id
      }
    })
  }

  renderLCBList = () => {
    const { current_date_miletones } = this.props
    return (
      <Menu onClick={this.selectLCB}>
        {current_date_miletones.map((value, key) => {
          const { id, name } = value
          return (
            <MenuItem
              className={globalStyles.global_ellipsis}
              style={{ width: 216 }}
              key={id}
            >
              {name}
            </MenuItem>
          )
        })}
      </Menu>
    )
  }
  setAddLCBModalVisibile = (timestamp, e) => {
    e.stopPropagation()
    this.props.setCreateLcbTime && this.props.setCreateLcbTime(timestamp)
    this.props.setAddLCBModalVisibile && this.props.setAddLCBModalVisibile()
  }
  render() {
    const { has_lcb, boardName = '', lcb_list = [], timestamp } = this.props
    return (
      <div
        // onClick={this.checkLCB.bind(this, {has_lcb})}
        className={`${indexStyles.lcb_area} ${
          has_lcb ? indexStyles.has_lcb : indexStyles.no_has_lcb
        }`}
      >
        {has_lcb ? (
          <Dropdown overlay={this.renderLCBList()}>
            <Tooltip title={`${boardName}`}>
              <div
                className={`${globalStyles.authTheme} ${indexStyles.lcb_logo}`}
                onClick={this.setAddLCBModalVisibile.bind(this, timestamp)}
              >
                &#xe633;
              </div>
            </Tooltip>
          </Dropdown>
        ) : (
          <div
            className={`${globalStyles.authTheme} ${indexStyles.lcb_logo}`}
            onClick={this.setAddLCBModalVisibile.bind(this, timestamp)}
          >
            &#xe633;
          </div>
        )}
      </div>
    )
  }
}
//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
  gantt: {
    datas: { gantt_board_id }
  }
}) {
  return { gantt_board_id }
}
