import React, { Component } from 'react'
import styles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { connect } from 'dva'
import BoardsFilesItem from './BoardsFilesItem'

@connect(mapStateToProps)
export default class BoardsFilesArea extends Component {
    render() {
        const { is_show_board_file_area, boards_flies = [] } = this.props
        return (
            <div className={` ${globalStyles.global_vertical_scrollbar} ${styles.boards_files_area}
            ${is_show_board_file_area == '1' && styles.boards_files_area_show}
            ${is_show_board_file_area == '2' && styles.boards_files_area_hide}
            `}>
                <div>
                    {
                        boards_flies.map((item, key) => {
                            const { id, board_name } = item
                            return (
                                <div key={id}>
                                    <BoardsFilesItem itemValue={item} item={key} board_id={id} board_name={board_name} setPreviewFileModalVisibile={this.props.setPreviewFileModalVisibile} />
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}
function mapStateToProps({ gantt: { datas: { is_show_board_file_area, boards_flies = [] } } }) {
    return { is_show_board_file_area, boards_flies }
}