import React, { Component } from 'react'
import globalStyles from '@/globalset/css/globalClassName.less'
import indexStyles from '../index.less'
import { Tooltip } from 'antd'
import DifferenceDeadlineType from '../../../../../../components/ProcessDetailModal/components/DifferenceDeadlineType'
export default class FlowsInstanceItem extends Component {
  handleProcessInfo = id => {
    this.props.handleProcessInfo && this.props.handleProcessInfo(id)
  }

  render() {
    const { itemValue } = this.props
    const {
      id,
      name,
      total_node_num,
      total_node_name,
      completed_node_num,
      deadline_value,
      is_privilege,
      status
    } = itemValue
    return (
      <div
        onClick={() => {
          this.handleProcessInfo(id)
        }}
        className={indexStyles.flowsInstanceItemContent}
      >
        <div className={indexStyles.flowsInstanceItem_left}>
          <span
            style={{ color: '#40A9FF' }}
            className={`${globalStyles.authTheme}`}
          >
            &#xe68c;
          </span>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '0 24px 0 5px',
              position: 'relative'
            }}
          >
            <span className={indexStyles.flow_instance_name}>{name}</span>
            {is_privilege == '1' && (
              <Tooltip
                overlayStyle={{ minWidth: '120px' }}
                title="已开启访问控制"
                placement="top"
                getPopupContainer={triggerNode => triggerNode.parentNode}
              >
                <span
                  style={{
                    color: 'rgba(0,0,0,0.50)',
                    marginRight: '5px',
                    marginLeft: '5px'
                  }}
                >
                  <span className={`${globalStyles.authTheme}`}>&#xe7ca;</span>
                </span>
              </Tooltip>
            )}
          </span>
          <span className={indexStyles.current_step}>
            {status == '3' || status == '0'
              ? ''
              : `当前步骤(${completed_node_num}/${total_node_num}) : `}
          </span>
          <span className={indexStyles.current_step_name}>
            {total_node_name}
          </span>
        </div>
        {
          <span>
            <DifferenceDeadlineType
              type="flowInstanceItem"
              itemValue={itemValue}
            />
          </span>
        }
      </div>
    )
  }
}
