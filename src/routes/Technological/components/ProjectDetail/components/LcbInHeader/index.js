import React, { Component } from 'react'
import indexStyles from './index.less'
import globalStyles from '../../../../../../globalset/css/globalClassName.less'
import { Progress, Dropdown, Menu } from 'antd';
import AddLCBModal from '../../../Gantt/components/AddLCBModal'
import { connect } from 'dva'
import MilestoneDetail from '../../../../components/Gantt/components/milestoneDetail'

const MenuItem = Menu.Item

@connect(mapStateToProps)
export default class LcbInHeader extends Component {
  constructor(props) {
    super(props)
    this.state = {
      add_lcb_modal_visible: false
    }
  }
  selectLCB = (e) => {
    const { key } = e
    // this.getMilestoneDetail(key)
    this.set_miletone_detail_modal_visible()
    //更新里程碑id
    const { dispatch } = this.props
    dispatch({
      type: 'milestoneDetail/updateDatas',
      payload: {
        milestone_id: key
      }
    })
  }
  //获取里程碑详情
  getMilestoneDetail = (id) => {
    const { dispatch } = this.props
    dispatch({
      type: 'milestoneDetail/getMilestoneDetail',
      payload: {
        id
      }
    })
  }
  set_miletone_detail_modal_visible = () => {
    const { miletone_detail_modal_visible } = this.state
    this.setState({
      miletone_detail_modal_visible: !miletone_detail_modal_visible
    })
  }

  renderLCBList = () => {
    const { milestoneList = [] } = this.props
    return (
      <Menu onClick={this.selectLCB}>
        {milestoneList.map((value, key) => {
          const { id, name } = value
          return (
            <MenuItem
              className={globalStyles.global_ellipsis}
              style={{width: 216}}
              key={id}>
              {name}
            </MenuItem>
          )
        })}
      </Menu>
    )
  }

  setAddLCBModalVisibile = () => {
    this.setState({
      add_lcb_modal_visible: !this.state.add_lcb_modal_visible
    });
  }

  submitCreatMilestone = (data) => {
    const { dispatch } = this.props
    const { users, currentSelectedProject, due_time, add_name } = data
    dispatch({
      type: 'projectDetail/createMilestone',
      payload: {
        board_id: currentSelectedProject,
        deadline: due_time,
        name: add_name,
        users
      }
    })
  }

  render() {
    const { data, board_id, board_name, milestoneList, org_id } = this.props
    const { add_lcb_modal_visible, miletone_detail_modal_visible } = this.state
    const userList = data.map(item => {
      const value = item
      value['id'] = item['user_id']
      value['full_name'] = item['name']
      return value
    })
    return(
      <div>
        <div className={indexStyles.coperate_lcb_out}>
          {milestoneList.length > 0 && (
            <div className={indexStyles.coperate_lcb_out_inner}>
              <Dropdown overlay={this.renderLCBList()}>
                <div className={`${globalStyles.authTheme} ${indexStyles.coperate_lcb_out_item} ${indexStyles.lcb_logo}`}>&#xe633;</div>
              </Dropdown>
              <div className={`${indexStyles.coperate_lcb_out_item}`}>0/{milestoneList.length}</div>
              <div className={`${indexStyles.coperate_lcb_out_item} ${indexStyles.progress_area}`}>
                <Progress percent={0}
                          status="active"
                          showInfo={false}
                          strokeColor={'#FAAD14'}
                />
              </div>
            </div>
          )}

          <div className={`${indexStyles.coperate_lcb_out_item} ${indexStyles.add_input}`}
             onClick={this.setAddLCBModalVisibile.bind(this)}>＋ 项目里程碑</div>
        </div>
        <AddLCBModal
          current_selected_board={{board_id, board_name, users: userList, org_id}}
          board_id={board_id}
          add_lcb_modal_visible={add_lcb_modal_visible}
          setAddLCBModalVisibile={this.setAddLCBModalVisibile.bind(this)}
          submitCreatMilestone={this.submitCreatMilestone}
        />
        <MilestoneDetail
          users={data}
          miletone_detail_modal_visible={this.state.miletone_detail_modal_visible}
          set_miletone_detail_modal_visible = {this.set_miletone_detail_modal_visible}
        />
      </div>
    )
  }


}
//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps(
  {
    projectDetail: { datas: { projectDetailInfoData = { }, milestoneList = [] }},
  }){
  const { data = [], board_id, board_name, org_id } = projectDetailInfoData
  return { data, board_id, board_name, milestoneList, org_id }
}
