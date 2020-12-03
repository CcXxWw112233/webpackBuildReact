import React, { Component } from 'react'
import { connect } from 'dva'
import { timeToTimestamp, timestampToTimeNormal } from '../../../../utils/util'
import globalStyles from '@/globalset/css/globalClassName.less'
import { currentNounPlanFilterName } from '../../../../utils/businessFunction'
import { FLOWS } from '../../../../globalset/js/constant'
import { renderTimeType, renderRestrictionsTime } from '../handleOperateModal'

@connect(mapStateToProps)
export default class DifferenceDeadlineType extends Component {
  // 未限制
  renderNotRestrictionsTime = () => {
    let description = ''
    description = '未限制'
    return description
  }

  // 渲染未开始的流程
  renderNotBeginningProcess = () => {
    const { itemValue } = this.props
    const { plan_start_time } = itemValue
    let start_time = timestampToTimeNormal(plan_start_time, '/', true)
    let description = start_time
    return description
  }

  // 渲染流程实例列表内容
  renderFlowInstanceItemContent = () => {
    const { itemValue } = this.props
    const { status, deadline_type } = itemValue
    let container = <span></span>
    let str = renderRestrictionsTime(itemValue)
    let overdue_color = str.indexOf('已逾期') != -1
    switch (status) {
      case '1':
        if (deadline_type == '1') {
          return (container = (
            <span>
              当前步骤完成期限:{' '}
              <span style={{ color: 'rgba(24,144,255,1)', marginLeft: '5px' }}>
                {this.renderNotRestrictionsTime()}
              </span>
            </span>
          ))
        } else if (deadline_type == '2') {
          return (container = (
            <span>
              当前步骤完成期限:{' '}
              <span
                style={{
                  color: overdue_color ? '#F5222D' : 'rgba(24,144,255,1)',
                  marginLeft: '5px'
                }}
              >
                <span>{renderRestrictionsTime(itemValue)}</span>
              </span>
            </span>
          ))
        }
        break
      case '2':
        container = (
          <span>
            {currentNounPlanFilterName(FLOWS)}状态:{' '}
            <span style={{ color: '#F5222D', marginLeft: '5px' }}>已中止</span>
          </span>
        )
        break
      case '3': // 表示已完成
        container = (
          <span>
            {currentNounPlanFilterName(FLOWS)}状态:{' '}
            <span style={{ color: 'rgba(24,144,255,1)', marginLeft: '5px' }}>
              已完成
            </span>
          </span>
        )
        break
      case '0': // 表示未开始
        container = (
          <span>
            {currentNounPlanFilterName(FLOWS)}开始时间:{' '}
            <span style={{ color: 'rgba(24,144,255,1)', marginLeft: '5px' }}>
              {this.renderNotBeginningProcess()}
            </span>
          </span>
        )
        break
      default:
        break
    }
    return container
  }

  // 渲染步骤详情中的内容
  renderNodesStepItemContent = () => {
    const { itemValue } = this.props
    const {
      status,
      deadline_type,
      deadline_value,
      deadline_time_type,
      complete_time
    } = itemValue
    let container = <span></span>
    let overdue_color =
      renderRestrictionsTime(itemValue).indexOf('已逾期') != -1
    switch (status) {
      case '1':
        if (deadline_type == '1') {
          return (container = (
            <span style={{ color: 'rgba(0,0,0,0.45)', display: 'flex' }}>
              <span
                style={{
                  display: 'flex',
                  flexShrink: 0,
                  lineHeight: '16px',
                  marginRight: '5px'
                }}
                className={globalStyles.authTheme}
              >
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: 900,
                    marginRight: '5px'
                  }}
                >
                  &#xe686;
                </span>{' '}
                完成期限:{' '}
              </span>{' '}
              <span style={{ flexShrink: 0, lineHeight: '16px' }}>
                {this.renderNotRestrictionsTime()}
              </span>
            </span>
          ))
        } else if (deadline_type == '2') {
          return (container = (
            <span style={{ color: 'rgba(0,0,0,0.45)', display: 'flex' }}>
              <span
                style={{
                  display: 'flex',
                  flexShrink: 0,
                  lineHeight: '16px',
                  marginRight: '5px'
                }}
                className={globalStyles.authTheme}
              >
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: 900,
                    marginRight: '5px'
                  }}
                >
                  &#xe686;
                </span>{' '}
                完成期限:{' '}
              </span>
              <span
                style={{
                  flexShrink: 0,
                  lineHeight: '16px',
                  color: overdue_color ? '#F5222D' : 'rgba(0,0,0,0.45)'
                }}
              >
                {renderRestrictionsTime(itemValue)}
              </span>
            </span>
          ))
        }
        break
      case '2': // 表示已完成
        container = (
          <span style={{ color: 'rgba(0,0,0,0.45)', display: 'flex' }}>
            <span
              style={{
                display: 'flex',
                flexShrink: 0,
                lineHeight: '16px',
                marginRight: '5px'
              }}
              className={globalStyles.authTheme}
            >
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 900,
                  marginRight: '5px'
                }}
              >
                &#xe686;
              </span>{' '}
              完成时间:{' '}
            </span>
            <span style={{ flexShrink: 0, lineHeight: '16px' }}>
              {timestampToTimeNormal(complete_time, '/', true)}
            </span>
          </span>
        )
        break
      case '0': // 表示未开始
        if (deadline_type == '1') {
          container = (
            <span style={{ color: 'rgba(0,0,0,0.45)', display: 'flex' }}>
              <span
                style={{
                  display: 'flex',
                  flexShrink: 0,
                  lineHeight: '16px',
                  marginRight: '5px'
                }}
                className={globalStyles.authTheme}
              >
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: 900,
                    marginRight: '5px'
                  }}
                >
                  &#xe686;
                </span>{' '}
                完成期限:{' '}
              </span>{' '}
              <span style={{ flexShrink: 0, lineHeight: '16px' }}>
                {this.renderNotRestrictionsTime()}
              </span>
            </span>
          )
        } else if (deadline_type == '2') {
          container = (
            <span style={{ color: 'rgba(0,0,0,0.45)', display: 'flex' }}>
              <span
                style={{
                  display: 'flex',
                  flexShrink: 0,
                  lineHeight: '16px',
                  marginRight: '5px'
                }}
                className={globalStyles.authTheme}
              >
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: 900,
                    marginRight: '5px'
                  }}
                >
                  &#xe686;
                </span>{' '}
                完成期限:{' '}
              </span>{' '}
              <span style={{ flexShrink: 0, lineHeight: '16px' }}>
                步骤开始后
                {`${deadline_value}${renderTimeType(deadline_time_type)}内`}
              </span>
            </span>
          )
        }
        break
      default:
        break
    }
    return container
  }

  // 根据不同的Type渲染不同的时间文案内容
  renderAccordingToDiffTypeContent = () => {
    const { type } = this.props
    switch (type) {
      case 'flowInstanceItem': // 表示流程实例列表
        return this.renderFlowInstanceItemContent()
      case 'nodesStepItem': // 表示步骤中节点详情
        return this.renderNodesStepItemContent()
      default:
        break
    }
  }

  render() {
    return <span>{this.renderAccordingToDiffTypeContent()}</span>
  }
}

// 不同期限类型
DifferenceDeadlineType.defaultProps = {
  type: '' // 需要一个类型来区分是流程实例列表 还是步骤节点详情 flowInstanceItem | nodesStepItem ....等等
}

function mapStateToProps({
  publicProcessDetailModal: { processPageFlagStep }
}) {
  return { processPageFlagStep }
}
