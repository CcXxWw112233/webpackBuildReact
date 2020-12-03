import React, { Component } from 'react'
import styles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { connect } from 'dva'
import { Modal } from 'antd'
import { isApiResponseOk } from '../../../../../../utils/handleResponseData'
import { onChangeCardHandleCardDetail } from '../../ganttBusiness'

@connect(mapStateToProps)
export default class PathOperateContent extends Component {
  constructor(props) {
    super(props)
    this.colors = [
      '24,144,255',
      '114,46,209',
      '245,34,45',
      '250,140,22',
      '250,219,20',
      '160,217,17'
    ]
  }
  onClose = () => {
    this.props.setOperateVisible && this.props.setOperateVisible(false)
  }
  onDelete = () => {
    const {
      operator: { move_id, line_id }
    } = this.props
    const { dispatch } = this.props
    Modal.confirm({
      title: '确认删除该依赖？',
      onOk: () => {
        this.onClose()
        dispatch({
          type: 'gantt/deleteCardRely',
          payload: {
            move_id,
            line_id
          }
        }).then(res => {
          if (isApiResponseOk(res)) {
            // 甘特图删除依赖后更新任务弹窗依赖数据
            const { selected_card_visible, dispatch } = this.props
            onChangeCardHandleCardDetail({
              card_detail_id: move_id,
              selected_card_visible,
              parent_card_id: '',
              operate_id: move_id,
              dispatch
            })
          }
        })
      }
    })
  }
  setRelyColor = rgb => {
    const {
      dispatch,
      operator: { move_id, line_id },
      onSelectColor
    } = this.props
    typeof onSelectColor == 'function' &&
      onSelectColor({ move_id, line_id, color_mark: rgb })
    dispatch({
      type: 'gantt/updateCardRely',
      payload: {
        from_id: move_id,
        to_id: line_id,
        color_mark: rgb
      }
    })
  }
  render() {
    const {
      dispatch,
      operator: { move_id, line_id, color_mark }
    } = this.props
    // console.log('color_mark', color_mark)
    return (
      <div
        className={styles.operate_wrapper}
        data-svg_operate="yes"
        data-targetclassname="specific_example"
      >
        <div
          className={styles.top}
          data-svg_operate="yes"
          data-targetclassname="specific_example"
        >
          <div
            className={`${globalStyles.authTheme} ${styles.close}`}
            onClick={this.onClose}
            data-svg_operate="yes"
            data-targetclassname="specific_example"
          >
            &#xe7fe;
          </div>
          <div
            className={`${globalStyles.authTheme} ${styles.delete}`}
            onClick={this.onDelete}
            data-svg_operate="yes"
            data-targetclassname="specific_example"
          >
            &#xe720;{' '}
          </div>
        </div>
        <div
          className={styles.color_wrapper}
          data-svg_operate="yes"
          data-targetclassname="specific_example"
        >
          {this.colors.map(value => {
            return (
              <div
                className={`${styles.color_selector} ${color_mark == value &&
                  styles.selected}`}
                onClick={() => {
                  this.setRelyColor(value)
                }}
                style={{ background: `rgb(${value})` }}
                data-svg_operate="yes"
                data-targetclassname="specific_example"
              ></div>
            )
          })}
        </div>
      </div>
    )
  }
}
function mapStateToProps({
  gantt: {
    datas: {
      ceilWidth,
      gantt_board_id,
      group_view_type,
      outline_tree_round,
      gantt_view_mode,
      list_group = [],
      date_total,
      ceiHeight,
      rely_map,
      selected_card_visible
    }
  }
}) {
  return {
    ceilWidth,
    gantt_board_id,
    group_view_type,
    outline_tree_round,
    gantt_view_mode,
    list_group,
    date_total,
    ceiHeight,
    rely_map,
    selected_card_visible
  }
}
