import { Table } from 'antd'
import React from 'react'
import styles from './nodeTreeTable.less'
import { connect } from 'dva'

@connect(mapStateToProps)
export default class NodeTreeTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      columns: [
        {
          dataIndex: 'name',
          title: '项目里程碑',
          key: 'name'
        },
        {
          dataIndex: 'start_time',
          title: '开始',
          key: 'start_time'
        },
        {
          dataIndex: 'due_time',
          title: '结束',
          key: 'due_time'
        },
        {
          dataIndex: 'h',
          title: '负责人',
          key: 'h'
        },
        {
          dataIndex: 't',
          title: '工时',
          key: 't'
        }
      ],
      dataSource: []
    }
  }

  componentDidMount() {
    console.log(this.props)
  }
  render() {
    return (
      <div className={styles.tableContainer}>
        <Table
          bordered
          className={styles.outline_table}
          columns={this.state.columns}
          size="small"
          rowKey={'id'}
          pagination={false}
          dataSource={this.props.outline_tree}
        />
      </div>
    )
  }
}

function mapStateToProps({
  gantt: {
    datas: {
      date_arr_one_level = [],
      ceilWidth,
      gantt_view_mode,
      drag_outline_node = {},
      outline_tree,
      outline_node_draging,
      selected_hide_term
    }
  }
}) {
  return {
    date_arr_one_level,
    ceilWidth,
    gantt_view_mode,
    drag_outline_node,
    outline_tree,
    outline_node_draging,
    selected_hide_term
  }
}
