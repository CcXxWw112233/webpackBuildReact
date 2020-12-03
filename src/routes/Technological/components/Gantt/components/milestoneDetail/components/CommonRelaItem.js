import React from 'react'
import taskItemStyles from './taskItem.less'
import { Icon, Popconfirm } from 'antd'
import {
  caldiffDays,
  timestampToTimeNormal
} from '../../../../../../../utils/util'
import globalStyles from '../../../../../../../globalset/css/globalClassName.less'
import AvatarList from '../../../../../../../components/avatarList'
import { connect } from 'dva'
import { currentNounPlanFilterName } from '../../../../../../../utils/businessFunction'
import { TASKS } from '../../../../../../../globalset/js/constant'
import { isApiResponseOk } from '../../../../../../../utils/handleResponseData'

@connect(mapStateToProps)
export default class CommonRelaItem extends React.Component {
  state = {}
  deleteConfirm = ({ id }) => {
    const {
      milestone_id,
      dispatch,
      deleteRelationContent,
      card_id
    } = this.props
    dispatch({
      type: 'milestoneDetail/taskCancelRelaMiletones',
      payload: {
        id: milestone_id,
        rela_id: id
      }
    }).then(res => {
      if (isApiResponseOk(res)) {
        if (typeof deleteRelationContent == 'function') deleteRelationContent()
        // 更新弹窗数据
        dispatch({
          type: 'gantt/updateCardDetailDrawer',
          payload: {
            card_id
          }
        })
        // 如果是在大纲视图 则需要更新大纲视图下树变化
        dispatch({
          type: 'gantt/updateOutLineTreeNode',
          payload: {
            card_id: id
          }
        })
      }
    })
  }
  render() {
    const {
      itemValue = {},
      type,
      board_set = {},
      base_relative_time: relative_time
    } = this.props
    const { date_format, date_mode } = board_set
    const {
      id,
      name,
      deadline,
      is_completed,
      users = [],
      progress_percent
    } = itemValue
    const result_process = Math.round(progress_percent * 100) / 100
    return (
      <div className={`${taskItemStyles.taskItem}`}>
        <div className={`${taskItemStyles.item_1} ${taskItemStyles.pub_hover}`}>
          {/*完成*/}
          {type == '0' && (
            <div
              className={
                is_completed == '1'
                  ? taskItemStyles.nomalCheckBoxActive
                  : taskItemStyles.nomalCheckBox
              }
            >
              <Icon
                type="check"
                style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}
              />
            </div>
          )}

          {type == '4' && !!result_process && (
            <div style={{ marginRight: '6px', color: 'rgba(0,0,0,0.45)' }}>
              {result_process || '0'} %
            </div>
          )}

          {/*名称*/}
          <div
            style={{
              wordWrap: 'break-word',
              paddingTop: 2,
              marginRight: '6px'
            }}
          >
            {name}
          </div>
          {/*日期*/}
          {deadline && (
            <>
              {date_mode == '1' ? (
                <span style={{ color: '#d5d5d5' }}>
                  {caldiffDays(relative_time, deadline) &&
                    `T+ ${caldiffDays(relative_time, deadline)} 日 `}
                </span>
              ) : (
                <div style={{ color: '#d5d5d5' }}>
                  {timestampToTimeNormal(
                    deadline,
                    '/',
                    date_format == '1' ? false : true
                  )}
                </div>
              )}
            </>
          )}
          <div style={{ margin: '0 8px' }}>
            <AvatarList size={'small'} users={users} />
          </div>

          {/*cuozuo*/}
          {type == '0' && (
            <Popconfirm
              onConfirm={this.deleteConfirm.bind(this, { id })}
              title={`删除该子${currentNounPlanFilterName(TASKS)}`}
              zIndex={10000}
            >
              <div
                className={`${globalStyles.authTheme} ${taskItemStyles.deletedIcon}`}
                style={{ fontSize: 16 }}
              >
                &#xe70f;
              </div>
            </Popconfirm>
          )}
        </div>
      </div>
    )
  }
}
function mapStateToProps({
  milestoneDetail: { milestone_detail = {} },
  publicTaskDetailModal: { card_id }
}) {
  return { milestone_detail, card_id }
}

CommonRelaItem.defaultProps = {
  type: '', // 区分是什么关联类型 0:表示任务，4:表示里程碑
  itemValue: {}, // 当前关联item
  key: '', // 每条id标识
  milestone_id: '', // 里程碑ID
  deleteRelationContent: function() {} // 删除关联内容
}
