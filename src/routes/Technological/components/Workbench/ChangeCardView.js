import React, { Component } from 'react'
import { connect } from "dva/index";
import globalstyles from '../../../../globalset/css/globalClassName.less'

class ChangeCardView extends Component {
  setCardView() {
    const { dispatch, workbench_show_gantt_card } = this.props
    dispatch({
      type: 'workbench/updateDatas',
      payload: {
        workbench_show_gantt_card: workbench_show_gantt_card == '0'? '1' : '0'
      }
    })
  }
  render() {
    const { workbench_show_gantt_card } = this.props
    const item_1 = (<i className={globalstyles.authTheme}>&#xe63a;</i>)
    const item_2 = (<i className={globalstyles.authTheme} style={{ fontSize: 20}}>&#xe6f7;</i>)
    return (
      <div
        onClick={this.setCardView.bind(this)} style={{fontSize: 16, textAlign: 'right', paddingRight: 8, cursor: 'pointer'}}>
        {workbench_show_gantt_card == '0'? item_1: item_2}
        </div>
    )
  }
}

export default connect(({ workbench: {datas: {workbench_show_gantt_card}} }) => ({
  workbench_show_gantt_card
}))(ChangeCardView)
