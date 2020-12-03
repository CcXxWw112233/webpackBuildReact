import React from 'react'
import indexstyles from '../index.less'
import { Icon, Tooltip } from 'antd'
import globalStyles from '../../../../../globalset/css/globalClassName.less'
import { timestampToTimeNormal, timeColor } from '../../../../../utils/util'
import Cookies from 'js-cookie'
import {
  checkIsHasPermissionInBoard,
  setBoardIdStorage,
  getOrgNameWithOrgIdFilter,
  checkIsHasPermission
} from '../../../../../utils/businessFunction'
import { message } from 'antd/lib/index'
import {
  MESSAGE_DURATION_TIME,
  NOT_HAS_PERMISION_COMFIRN,
  PROJECT_TEAM_CARD_INTERVIEW,
  ORG_TEAM_BOARD_QUERY
} from '../../../../../globalset/js/constant'
import { connect } from 'dva'

@connect(
  ({
    technological: {
      datas: {
        currentUserOrganizes = [],
        is_show_org_name,
        is_all_org,
        userOrgPermissions,
        userBoardPermissions
      }
    },
    workbench: {
      datas: { projectTabCurrentSelectedProject }
    }
  }) => ({
    currentUserOrganizes,
    is_show_org_name,
    projectTabCurrentSelectedProject,
    is_all_org,
    userOrgPermissions,
    userBoardPermissions
  })
)
export default class MeetingItem extends React.Component {
  itemClick(e) {
    const { itemValue = {} } = this.props
    const { id, board_id, org_id } = itemValue
    const { dispatch } = this.props

    setBoardIdStorage(board_id)

    dispatch({
      type: 'workbenchPublicDatas/getRelationsSelectionPre',
      payload: {
        _organization_id: org_id
      }
    })
    this.props.updatePublicDatas({ board_id })
    this.props.getCardDetail({ id, board_id })

    dispatch({
      type: 'publicTaskDetailModal/updateDatas',
      payload: {
        drawerVisible: true,
        card_id: id
      }
    })
    // this.props.dispatch({
    //   type: 'workbenchTaskDetail/getCardCommentListAll',
    //   payload: {
    //     id: id
    //   }
    // })
  }

  // 去到列表的详情页信息
  gotoBoardDetail({ id, board_id, org_id }, e) {
    // Cookies.set('board_id', board_id, {expires: 30, path: ''})
    setBoardIdStorage(board_id)
    // if(!checkIsHasPermission(ORG_TEAM_BOARD_QUERY, org_id)){
    //   message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
    //   return false
    // }
    this.props.routingJump(
      `/technological/projectDetail?board_id=${board_id}&appsSelectKey=3&card_id=${id}`
    )
  }

  render() {
    const {
      itemValue = {},
      itemKey,
      currentUserOrganizes = [],
      is_show_org_name,
      projectTabCurrentSelectedProject,
      is_all_org
    } = this.props
    const { id, board_id, is_privilege } = itemValue

    const { name, start_time, due_time, org_id, board_name } = itemValue
    // console.log(itemValue, 'sss')
    return (
      <div className={indexstyles.meetingItem}>
        <div>
          <Icon type="calendar" style={{ fontSize: 16, color: '#8c8c8c' }} />
        </div>
        <div style={{ flex: '1', display: 'flex' }}>
          <Tooltip title={name} placement="topLeft">
            <span
              onClick={this.itemClick.bind(this)}
              style={{
                maxWidth: 100,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {name}
            </span>
          </Tooltip>
          {/* 添加访问控制小锁 */}
          {is_privilege == '1' && (
            <Tooltip title="已开启访问控制" placement="top">
              <span
                style={{
                  color: 'rgba(0,0,0,0.50)',
                  cursor: 'pointer',
                  marginRight: '5px',
                  marginLeft: '5px'
                }}
              >
                <span className={`${globalStyles.authTheme}`}>&#xe7ca;</span>
              </span>
            </Tooltip>
          )}
          {projectTabCurrentSelectedProject == '0' && (
            <span style={{ marginLeft: 5, marginRight: 2, color: '#8C8C8C' }}>
              #
            </span>
          )}
          <Tooltip
            placement="topLeft"
            title={
              is_show_org_name &&
              projectTabCurrentSelectedProject == '0' &&
              is_all_org ? (
                <span>
                  {getOrgNameWithOrgIdFilter(org_id, currentUserOrganizes)}{' '}
                  <Icon
                    type="caret-right"
                    style={{ fontSize: 8, color: '#8C8C8C' }}
                  />{' '}
                  {board_name}
                </span>
              ) : (
                <span>{board_name}</span>
              )
            }
          >
            <div
              style={{
                color: '#8c8c8c',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              onClick={this.gotoBoardDetail.bind(this, {
                id,
                board_id,
                org_id
              })}
            >
              {is_show_org_name &&
                projectTabCurrentSelectedProject == '0' &&
                is_all_org && (
                  <span className={indexstyles.org_name}>
                    {getOrgNameWithOrgIdFilter(org_id, currentUserOrganizes)}
                  </span>
                )}
              {is_show_org_name &&
                projectTabCurrentSelectedProject == '0' &&
                is_all_org && (
                  <span>
                    <Icon
                      type="caret-right"
                      style={{ fontSize: 8, color: '#8C8C8C' }}
                    />
                  </span>
                )}
              {projectTabCurrentSelectedProject == '0' && (
                <span className={indexstyles.ellipsis}>{board_name}</span>
              )}
            </div>
          </Tooltip>
        </div>
        <span
          style={{
            marginLeft: 6,
            color: timeColor(due_time),
            cursor: 'pointer',
            fontSize: 12,
            justifySelf: 'end'
          }}
        >{`${timestampToTimeNormal(
          start_time,
          '',
          true
        )}~${timestampToTimeNormal(due_time, '', true)}`}</span>
      </div>
    )
  }
}
