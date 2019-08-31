import React from "react";
import indexstyles from "../index.less";
import { Icon, Tooltip} from "antd";
import Cookies from "js-cookie";
import { timestampToTimeNormal2 } from './../../../../../utils/util'
import { checkIsHasPermissionInBoard, checkIsHasPermission } from './../../../../../utils/businessFunction'
import {message} from "antd/lib/index";
import { MESSAGE_DURATION_TIME, NOT_HAS_PERMISION_COMFIRN, PROJECT_TEAM_CARD_COMPLETE, PROJECT_TEAM_CARD_INTERVIEW, ORG_TEAM_BOARD_QUERY } from "../../../../../globalset/js/constant";
import {setBoardIdStorage, getOrgNameWithOrgIdFilter} from "../../../../../utils/businessFunction";
import { connect } from 'dva'

@connect((
  { 
    technological: { datas: { currentUserOrganizes = [], is_show_org_name, is_all_org } }, 
    workbench: { datas: { projectTabCurrentSelectedProject } }
  },
) => ({
  currentUserOrganizes, is_show_org_name, projectTabCurrentSelectedProject, is_all_org
}))
export default class TaskItem extends React.Component {
  itemOneClick(e) {
    e.stopPropagation();
    const {
      datas: { responsibleTaskList = [] }
    } = this.props.model;
    const { itemValue = {}, itemKey } = this.props;
    const { is_realize, board_id, board_name, name, id } = itemValue;
    const obj = {
      card_id: id,
      is_realize: is_realize === "1" ? "0" : "1"
    };
    setBoardIdStorage(board_id)
    if(!checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_COMPLETE)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    responsibleTaskList[itemKey]["is_realize"] = is_realize === "1" ? "0" : "1";
    this.props.updateDatas({ responsibleTaskList });
    this.props.completeTask(obj);
  }
  gotoBoardDetail({ id, board_id, org_id }, e) {
    // Cookies.set('board_id', board_id, {expires: 30, path: ''})
    setBoardIdStorage(board_id)
    // if(!checkIsHasPermission(ORG_TEAM_BOARD_QUERY, org_id)){
    //   message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
    //   return false
    // }
    this.props.routingJump(
      `/technological/projectDetail?board_id=${board_id}&appsSelectKey=3&card_id=${id}`
    );
  }
  itemClick(data, e) {
    const { dispatch} = this.props
    const { id, board_id, org_id } = data;
    setBoardIdStorage(board_id)
    if(!checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_INTERVIEW)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    dispatch({
      type: 'workbenchPublicDatas/getRelationsSelectionPre',
      payload: {
        _organization_id: org_id
      }
    })
    this.props.updatePublicDatas({ board_id });
    this.props.getCardDetail({ id, board_id });
    this.props.setTaskDetailModalVisibile();
    // debugger
    this.props.dispatch({
      type: 'workbenchTaskDetail/getCardCommentListAll',
      payload: {
        id: id
      }
    })
  }

  componentDidMount() {
    const { projectTabCurrentSelectedProject } = this.props
    // console.log(projectTabCurrentSelectedProject, 'sss')
  }


  render() {
    const { itemValue = {}, isUsedInWorkbench, currentUserOrganizes = [], is_show_org_name, projectTabCurrentSelectedProject, is_all_org} = this.props;
    const { org_id, is_realize, board_id, board_name, name, id } = itemValue;

    //父级任务
    let parentCards = [];
    const returnParentCard = value => {
      const { parent_card } = value;
      if (parent_card) {
        const { name, id, board_id } = parent_card;
        parentCards.push({
          board_id,
          id,
          name
        });
        returnParentCard(parent_card);
      }
    };
    returnParentCard(itemValue);

    const transItemValueTimestampToDate = timestampToTimeNormal2(itemValue.create_time)
    const DateNoTimeStr = transItemValueTimestampToDate ? transItemValueTimestampToDate.split(' ')[0] : null

    const renderInWorkbench = (
      <div className={indexstyles.taskItem__workbench_wrapper}>
        <span
          className={
            `
            ${indexstyles.taskItem__workbench_check}
            ${is_realize === "1"
            ? indexstyles.nomalCheckBoxActive
            : indexstyles.nomalCheckBox}
            `
          }
          onClick={this.itemOneClick.bind(this)}
        >
          <Icon
            type="check"
            style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "bold" }}
          />
        </span>
        <div
          className={indexstyles.taskItem__workbench_content}
        >
          <Tooltip title={name}>
          <div
            className={`${indexstyles.taskItem__workbench_content_title} ${indexstyles.ellipsis}`}
            style={{
              maxWidth: 100,
              textDecoration: is_realize === "1" ? "line-through" : "none"
            }}
            onClick={this.itemClick.bind(this, { id, board_id, org_id })}
          >
            {name}
          </div>
          </Tooltip>
          <div className={indexstyles.taskItem__workbench_content_hier}>
            {parentCards.map((value, key) => {
              const { name, id, board_id } = value;
              return (
                <span
                  style={{ marginLeft: 6, color: "#8c8c8c", cursor: "pointer" }}
                  key={key}
                  onClick={this.itemClick.bind(this, { id, board_id, org_id })}
                >{`< ${name}`}</span>
              );
            })}
          </div>
          {
            projectTabCurrentSelectedProject == '0' && (
              <span style={{marginLeft: 5, marginRight: 2, color: '#8C8C8C'}}>#</span>
            )
          }
          <Tooltip title={
           is_show_org_name && projectTabCurrentSelectedProject == '0' && is_all_org ? (<span>{getOrgNameWithOrgIdFilter(org_id, currentUserOrganizes)} <Icon type="caret-right" style={{fontSize: 8, color: '#8C8C8C'}}/> {board_name}</span>)
            : (<span>{board_name}</span>)
          }>
            <div
              className={indexstyles.taskItem__workbench_content_projectname}
                style={{ color: "#8c8c8c", cursor: "pointer", display: 'flex', textDecoration: is_realize === "1" ? "line-through" : "none" }}
                onClick={this.gotoBoardDetail.bind(this, { id, board_id, org_id })}
              >
                {
                  is_show_org_name && projectTabCurrentSelectedProject == '0' && is_all_org && (
                    <span className={indexstyles.org_name}>
                      {getOrgNameWithOrgIdFilter(org_id, currentUserOrganizes)}
                    </span>
                  )
                }
                {
                  is_show_org_name && projectTabCurrentSelectedProject == '0' && is_all_org && (
                    <span>
                      <Icon type="caret-right" style={{fontSize: 8, color: '#8C8C8C'}}/>
                    </span>
                  )
                }
                {
                  projectTabCurrentSelectedProject == '0' && (
                    <span className={indexstyles.board_name}>{board_name}</span>
                  )
                }
              </div>
            </Tooltip>
          </div>
        <span className={indexstyles.taskItem__workbench_time}>
          {DateNoTimeStr}
        </span>
      </div>
    );
    if (isUsedInWorkbench) {
      return renderInWorkbench;
    }

    return (
      <div className={indexstyles.taskItem}>
        <div
          className={
            is_realize === "1"
              ? indexstyles.nomalCheckBoxActive
              : indexstyles.nomalCheckBox
          }
          onClick={this.itemOneClick.bind(this)}
        >
          <Icon
            type="check"
            style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "bold" }}
          />
        </div>
        <div>
          <span
            style={{
              textDecoration: is_realize === "1" ? "line-through" : "none"
            }}
            onClick={this.itemClick.bind(this, { id, board_id, org_id })}
          >
            {name}
          </span>
          {parentCards.map((value, key) => {
            const { name, id, board_id } = value;
            return (
              <span
                style={{ marginLeft: 6, color: "#8c8c8c", cursor: "pointer" }}
                key={key}
                onClick={this.itemClick.bind(this, { id, board_id, org_id })}
              >{`< ${name}`}</span>
            );
          })}
          <span
            style={{ marginLeft: 6, color: "#8c8c8c", cursor: "pointer" }}
            onClick={this.gotoBoardDetail.bind(this, { id, board_id, org_id })}
          >
            #{board_name}
          </span>
        </div>
      </div>
    );
  }
}
