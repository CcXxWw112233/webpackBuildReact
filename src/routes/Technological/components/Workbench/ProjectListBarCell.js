import React from "react";
import { Tooltip, message } from "antd";
import styles from "./index.less";
import globalStyles from './../../../../globalset/css/globalClassName.less';
import classNames from 'classnames/bind'
import {checkIsHasPermission, getOrgNameWithOrgIdFilter} from "../../../../utils/businessFunction";
import { MESSAGE_DURATION_TIME, NOT_HAS_PERMISION_COMFIRN, ORG_TEAM_BOARD_QUERY, } from "../../../../globalset/js/constant";
import { connect } from 'dva'

let cx = classNames.bind(styles)

const ProjectListBarCell = ({
  currentUserOrganizes,
  is_show_org_name,
  is_all_org,
  board_id,
  board_name,
  handleClickedCell,
  org_name,
  shouldActive,
  apps,
  org_id
}) => {
  const projectListBarCellClass = cx({
    [styles.projectListBarCellWrapper]: true,
    [styles.projectListBarCellActive]: shouldActive === board_id ? true : false
  })
  const handleClickedCell_ = (e, board_id) => {
    if(e) e.stopPropagation()
    handleClickedCell(board_id)
  }
  const promptWhenNoAppsItem = () => {
    const noAppsPromptText = '当前项目没有开启任何功能'
    message.error(noAppsPromptText)
  }
  const jumpToProject = (board_id, apps = []) => {
    // console.log(location.origin, 'location.origin')
    const getAppKey = apps => apps.find(item => item.unique_key === '3' ) ? '3' : apps[0]['unique_key']
    const url = `/#/technological/projectDetail?board_id=${board_id}&appsSelectKey=${getAppKey(apps)}`
    window.location.href = url

  }
  const handleJumpToProject = (e, board_id, apps, org_id) => {
    // if(!checkIsHasPermission(ORG_TEAM_BOARD_QUERY, org_id)){
    //   message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
    //   return false
    // }
    if(e) e.stopPropagation()
    const isAppsItem = arr => Array.isArray(arr) && arr.length
    if(!isAppsItem(apps)) {
      promptWhenNoAppsItem()
      return
    }
    return jumpToProject(board_id, apps)
  }

  org_name = is_show_org_name && getOrgNameWithOrgIdFilter(org_id, currentUserOrganizes)


  return (
    <li
      className={projectListBarCellClass}
      onClick={(e) => handleClickedCell_(e, board_id)}
    >
      <Tooltip title={org_name ? board_name + " #" + org_name : board_name} placement='topLeft'>
        <a className={styles.projectListBarCellContent}>
          <span style={{marginRight: 2}}>{board_name}</span>
          <span style={{color: 'rgba(0,0,0,0.45)'}}>{org_name && `#${org_name}`}</span>
        </a>
      </Tooltip>
      <Tooltip title='进入项目'>
        <span className={styles.projectListBarCellInterProject} onClick={e => handleJumpToProject(e, board_id, apps, org_id)}>
        <i className={`${globalStyles.authTheme}`}>
          &#xe793;
        </i>
        </span>
      </Tooltip>
    </li>
  );
};

export default connect(
  ({
    technological: {
      datas: { currentUserOrganizes = [], is_show_org_name, is_all_org }
    },
  }) => ({
    currentUserOrganizes,
    is_show_org_name,
    is_all_org,
  })
)(ProjectListBarCell) ;
