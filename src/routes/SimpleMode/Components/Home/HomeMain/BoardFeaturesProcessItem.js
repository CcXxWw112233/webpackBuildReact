import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import styles from './featurebox.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import {
  timestampToTimeNormal,
  timeColor,
  isSamDay,
  transformTimestamp,
  timestampToHM,
  timestampToTimeNormal2
} from '../../../../../utils/util'
import {
  getOrgNameWithOrgIdFilter,
  currentNounPlanFilterName
} from '../../../../../utils/businessFunction'
import { compareOppositeTimer } from '../../../../../components/ProcessDetailModal/components/handleOperateModal'
import { FLOWS } from '../../../../../globalset/js/constant'

@connect(mapStateToProps)
export default class BoardFeaturesProcessItem extends Component {
  static propTypes = {
    prop: PropTypes
  }

  itemClick = () => {
    const {
      dispatch,
      itemValue: { id = '', board_id = '' }
    } = this.props
    this.props.whetherShowModalVisible &&
      this.props.whetherShowModalVisible({ type: 'flow', visible: true })
    dispatch({
      type: 'publicProcessDetailModal/getProcessInfo',
      payload: {
        id,
        calback: () => {
          dispatch({
            type: 'publicProcessDetailModal/updateDatas',
            payload: {
              process_detail_modal_visible: true,
              processPageFlagStep: '4'
            }
          })
        }
      }
    })
    dispatch({
      type: 'workbenchPublicDatas/updateDatas',
      payload: {
        board_id
      }
    })
  }

  renderTime = () => {
    const {
      itemValue,
      itemValue: { last_complete_time, deadline_type }
    } = this.props
    const is_today = timestamp => isSamDay(new Date().getTime(), timestamp) //今天截止
    let time = ''
    let dec = ''
    if (deadline_type == '1') {
      // 表示未限制时间
      return {
        time: '',
        dec: '未限制时间'
      }
    } else if (deadline_type == '2') {
      // 表示限制时间
      return {
        time: is_today(last_complete_time)
          ? `今天 ${timestampToHM(last_complete_time)}`
          : timestampToTimeNormal(last_complete_time, '/', true),
        dec: '截止'
      }
    }
  }

  renderBelong = () => {
    const {
      currentSelectOrganize = {},
      currentUserOrganizes,
      simplemodeCurrentProject = {},
      itemValue = {}
    } = this.props
    let { board_name, org_id } = itemValue
    const isAllOrg =
      !currentSelectOrganize.id || currentSelectOrganize.id == '0'
    const isAllBoard =
      !simplemodeCurrentProject.board_id ||
      simplemodeCurrentProject.board_id == '0'
    let org_name = ''
    if (isAllBoard) {
      board_name = `#${board_name}`
    } else {
      return ``
    }
    if (isAllOrg) {
      org_name = `(${getOrgNameWithOrgIdFilter(org_id, currentUserOrganizes)})`
    } else {
      org_name = ''
    }
    return `${board_name} ${org_name}`
  }

  render() {
    const { itemValue } = this.props
    const {
      name,
      total_node_name,
      total_node_num,
      completed_node_num,
      runtime_type,
      deadline_type,
      last_complete_time
    } = itemValue
    const belong_name = this.renderBelong()
    return (
      <div
        className={`${
          !!belong_name ? styles.feature_item2 : styles.feature_item
        }`}
        onClick={this.itemClick}
      >
        <div className={`${styles.feature_item_lf}`}>
          <span className={`${globalStyles.authTheme}`}>&#xe68c;</span>
          <span>
            {currentNounPlanFilterName(FLOWS, this.props.currentNounPlan)}
          </span>
        </div>
        <div
          className={`${styles.feature_item_middle}  ${globalStyles.global_ellipsis}`}
        >
          <div
            className={`${styles.feature_item_middle_name}  ${globalStyles.global_ellipsis}`}
          >
            <span className={`${globalStyles.authTheme}`}>&#xe68b;</span>
            <span>
              {name} <span className={globalStyles.authTheme}>&#xe7f0;</span>{' '}
              {total_node_name}{' '}
              {`( ${completed_node_num} / ${total_node_num} )`}
            </span>
          </div>
          {!!belong_name && (
            <div
              className={`${styles.feature_item_middle_orgname} ${globalStyles.global_ellipsis}`}
              title={belong_name}
            >
              {belong_name}
            </div>
          )}
        </div>
        <div
          className={`${styles.feature_item_rt}`}
          style={{
            color: deadline_type == '2' && timeColor(last_complete_time)
          }}
        >
          {' '}
          {this.renderTime().time} {this.renderTime().dec}
        </div>
        {!!runtime_type && runtime_type == '1' && (
          <div className={styles.feature_item_reject}>被驳回</div>
        )}
      </div>
    )
  }
}
function mapStateToProps({
  simplemode: { simplemodeCurrentProject },
  technological: {
    datas: { currentUserOrganizes, currentSelectOrganize = {} }
  },
  organizationManager: {
    datas: { currentNounPlan }
  }
}) {
  return {
    simplemodeCurrentProject,
    currentUserOrganizes,
    currentSelectOrganize,
    currentNounPlan
  }
}
