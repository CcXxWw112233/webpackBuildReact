import React from 'react'
import indexStyle from './index.less'
import globalStyles from '../../../../globalset/css/globalClassName.less'
import { Icon, Menu, Dropdown, Tooltip, Collapse, Card } from 'antd'
import CollectionProject from './CollectionProject'
import ElseProject from './ElseProject'
import AddModalForm from "./AddModalForm";
import ShowAddMenberModal from './ShowAddMenberModal'
import { checkIsHasPermission, currentNounPlanFilterName } from '../../../../utils/businessFunction'
import {MESSAGE_DURATION_TIME, NOT_HAS_PERMISION_COMFIRN, ORG_TEAM_BOARD_CREATE, PROJECTS} from "../../../../globalset/js/constant";
import { message } from 'antd'
import Cookies from 'js-cookie'
const Panel = Collapse.Panel

export default class Projectlist extends React.Component {

  addItem() {
    if(!checkIsHasPermission(ORG_TEAM_BOARD_CREATE)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    this.props.showModal()
  }
  collapseOnchange(e) {
    this.props.updateDatas({
      collapseActiveKeyArray: e
    })
  }
  render() {
    const { datas = {} } = this.props.model
    const { projectList = {}, collapseActiveKeyArray = [] } = datas
    const { star = [], create = [], participate = [] } = projectList
    const { current_org = {}} = localStorage.getItem('userInfo')? JSON.parse(localStorage.getItem('userInfo')): {}
    const { identity_type } = current_org //是否访客 1不是 0是
    const addItem = (
      <div className={indexStyle.addListItem} onClick={this.addItem.bind(this)}>
        <Icon type="plus-circle-o" style={{fontSize: 18, color: '#8c8c8c', marginTop: 6}} />
      </div>
    )
    return (
      <div className={indexStyle.projectListOut}>
        <Collapse onChange={this.collapseOnchange.bind(this)} bordered={false} style={{backgroundColor: '#f5f5f5', marginTop: 30}} activeKey	= {collapseActiveKeyArray} >
          <Panel header={`我收藏的${currentNounPlanFilterName(PROJECTS)}`} key="1" style={customPanelStyle}>
            {star.map((value, key) =>{
              const { is_star, board_id } = value
              return (
                <ElseProject {...this.props} itemDetailInfo={value} key={`${board_id}_${is_star}`}/>
              )}
              )}
            {/*{addItem}*/}
          </Panel>
          {identity_type == '1'? (
            <Panel header={`我管理的${currentNounPlanFilterName(PROJECTS)}`} key="2" style={customPanelStyle}>
              {create.map((value, key) => {
                const { is_star, board_id } = value
                return (
                  <ElseProject {...this.props} itemDetailInfo={value} key={`${board_id}_${is_star}`}/>
                )}
              )}
              {checkIsHasPermission(ORG_TEAM_BOARD_CREATE) && addItem}
            </Panel>
          ):('')}

          <Panel header={`我参与的${currentNounPlanFilterName(PROJECTS)}`} key="3" style={customPanelStyle}>
            {participate.map((value, key) => {
              const { is_star, board_id } = value
              return (
                <ElseProject {...this.props} itemDetailInfo={value} key={`${board_id}_${is_star}`}/>
              )
            })}
            {/*{addItem}*/}
          </Panel>
        </Collapse>
        <AddModalForm {...this.props}></AddModalForm>
        {/*<ShowAddMenberModal {...this.props}></ShowAddMenberModal>*/}
      </div>
    )
  }
}
const customPanelStyle = {
  background: '#f5f5f5',
  borderRadius: 4,
  fontSize: 16,
  marginBottom: 20,
  border: 0,
  overflow: 'hidden',
};
