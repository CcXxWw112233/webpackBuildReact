import React, { Component } from 'react';
import { connect, } from 'dva';
import indexStyles from './index.less'
import GroupListHeadItem from './GroupListHeadItem'
import GroupListHeadElse from './GroupListHeadElse'
@connect(mapStateToProps)
export default class GroupListHead extends Component {
  constructor(props) {
    super(props)
    this.state = {
      offsetTop: 0,
      offsetLeft: 0
    }
  }

  componentDidMount = () => {
    this.setHeaderPostion()
  }
  setHeaderPostion = () => {
    const gantt_card_out = document.getElementById('gantt_card_out')
    if (gantt_card_out) {
      const offsetTop = gantt_card_out.offsetTop
      const offsetLeft = gantt_card_out.offsetLeft
      this.setState({
        offsetTop,
        offsetLeft
      })
    }
  }

  render() {
    const { list_group = [], group_rows = [], ceiHeight, target_scrollLeft } = this.props
    return (
      <div className={indexStyles.listHead} style={{ left: target_scrollLeft, }}>
        {list_group.map((value, key) => {
          const { list_name, list_id, list_data = [] } = value
          return (
            <div key={list_id}>
              <GroupListHeadItem
                list_id={list_id}
                setTaskDetailModalVisibile={this.props.setTaskDetailModalVisibile}
                itemValue={value} itemKey={key} rows={group_rows[key]} />
              {/*<div className={indexStyles.listHeadItem} key={list_id} style={{height: (group_rows[key] || 2) * ceiHeight}}>{list_name}</div>*/}
            </div>
          )
        })}
        <GroupListHeadElse gantt_card_height={this.props.gantt_card_height} dataAreaRealHeight={this.props.dataAreaRealHeight} />
      </div>
    )
  }

}
//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ gantt: {
  datas: {
    list_group = [],
    group_rows = [],
    ceiHeight,
    target_scrollLeft
  }
} }) {
  return {
    list_group,
    group_rows,
    ceiHeight,
    target_scrollLeft
  }
}
