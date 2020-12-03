import React, { useState, useMemo } from 'react'
import styles from './baselineitem.less'
import globalStyles from '../../../../../../globalset/css/globalClassName.less'
import { connect } from 'dva'
import { ceil_height } from '../../constants'

function BaseLineItem(props) {
  let [itemStyle, setItemStyle] = useState({})
  useMemo(() => {
    let data = props.data
    // console.log(props.data)
    let style = {
      width: data.width,
      height: data.height,
      top: props.top,
      left: data.left,
      marginTop: 12
    }
    setItemStyle(style)
  }, [props.data])
  // 基线的基础数据
  // const data = props.data;
  const gantt_view_mode = props.gantt_view_mode
  // 甘特图中对应的数据
  const ganttData = props.ganttData
  //自里程碑位置调整
  const child_milestone_margin_left = {
    month: 9,
    hours: 4
  }
  let diff_left_obj = 0 //不同视图位置差异的微调
  if (gantt_view_mode == 'relative_time') {
    //里程碑
    if (props.type == '1') {
      // 父里程碑
      if (!ganttData.parent_id) {
        diff_left_obj = 32
      } else {
        //子里程碑
        diff_left_obj = 9
      }
    }
  }
  return (
    <div
      className={styles.baselineitem_box}
      style={{
        top: itemStyle.top,
        left: itemStyle.left + diff_left_obj,
        marginTop: itemStyle.marginTop
      }}
    >
      {props.type === '1' ? (
        <div className={styles.milepost}>
          {!ganttData.parent_id ? (
            <div
              className={`${styles.parentMilepost} ${styles[gantt_view_mode]}`}
            >
              <span
                className={styles.milepostLine}
                style={{
                  height: (ganttData.expand_length - 0.5) * ceil_height
                }}
              ></span>
              <div className={`${styles.icons} ${globalStyles.authTheme}`}>
                &#xe6a0;
              </div>
            </div>
          ) : (
            <div
              className={`${styles.subMilepost} `}
              style={{
                marginLeft: child_milestone_margin_left[gantt_view_mode] || 0
              }}
            ></div>
          )}
        </div>
      ) : props.type === '2' ? (
        <div
          className={styles.task}
          style={{ width: itemStyle.width, height: itemStyle.height }}
        ></div>
      ) : (
        <div className={styles.process}></div>
      )}
    </div>
  )
}

export default connect()(BaseLineItem)
