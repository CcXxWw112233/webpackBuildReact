import React from 'react'
import styles from './index.less'
import { InputNumber } from 'antd'

export default function ManhourSet(props) {
  const { nodeValue = {}, value, onChange, tree_type, gantt_view_mode } = props
  const { plan_time_span = 0, start_time, due_time } = nodeValue
  const disabled = !start_time && !due_time && Number(plan_time_span) != 0
  console.log('nodeValue', gantt_view_mode, nodeValue)
  return (
    <div className={styles.manhourSetWrapper}>
      <InputNumber
        disabled={disabled}
        size="large"
        min={0}
        max={999}
        defaultValue={0}
        value={value}
        onChange={onChange}
      />
      <span style={{ marginLeft: '16px' }}>
        {tree_type == '1' ? '天' : gantt_view_mode == 'hours' ? '时' : '天'}
      </span>
    </div>
  )
}
