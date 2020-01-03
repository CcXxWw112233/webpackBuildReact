import React, { Component } from 'react'
import GetRowGanttItem from './GetRowGanttItem'
import { connect, } from 'dva';


@connect(mapStateToProps)
export default class GetRowGanttVirtual extends Component {

    render() {
        const { list_group, group_rows, group_list_area } = this.props
        return (
            <div>
                {list_group.map((value, key) => {
                    const { lane_data, list_id, list_data = [] } = value
                    const { milestones = {} } = lane_data
                    return (
                        <GetRowGanttItem key={list_id} itemKey={key} list_id={list_id} list_data={list_data} rows={group_rows[key]} milestones={milestones} />
                    )
                })}
            </div>
        )
    }
}
function mapStateToProps({ gantt: {
    datas: {
        list_group = [],
        group_rows = [],
        group_list_area = [],
    }
} }) {
    return {
        list_group,
        group_rows,
        group_list_area,
    }
}
