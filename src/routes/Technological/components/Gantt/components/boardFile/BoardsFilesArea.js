import React, { Component } from 'react'
import styles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { connect } from 'dva'
import BoardsFilesItem from './BoardsFilesItem'
import { isPaymentOrgUser } from '../../../../../../utils/businessFunction'

@connect(mapStateToProps)
export default class BoardsFilesArea extends Component {
    state = {
        previewFileModalVisibile: false
    }
    //弹窗
    setPreviewFileModalVisibile = () => {
        this.setState({
            previewFileModalVisibile: !this.state.previewFileModalVisibile
        });
        this.props.dispatch({
            type: 'publicFileDetailModal/updateDatas',
            payload: {
                isInOpenFile: false,
                filePreviewCurrentFileId: '',
                fileType: '',
                currentPreviewFileName: ''
            }
        })
    }

    setBoardFileMessagesRead = () => {
        const { dispatch } = this.props
        const { im_all_latest_unread_messages = [] } = this.props
        const arr = im_all_latest_unread_messages.filter(item => {
            if (item.action == 'board.file.upload' || item.action == 'board.file.version.upload') {
                return item
            }
        })
        const reads = arr.map(item => (item.idServer))
        console.log('ssss_全部设置已读', reads)
        dispatch({
            type: 'imCooperation/listenImLatestAreadyReadMessages',
            payload: {
                messages: reads
            }
        })
    }

    // 仅出现当前查看的文件夹所属项目
    filterSeeingBoard = (board_id) => {
        const { folder_seeing_board_id = '0' } = this.props
        if (folder_seeing_board_id == '0') {
            return true
        } else {
            if (folder_seeing_board_id == board_id) {
                return true
            } else {
                return false
            }
        }
    }
    render() {
        const { is_show_board_file_area, boards_flies = [] } = this.props

        return (
            <div className={` ${globalStyles.global_vertical_scrollbar} ${styles.boards_files_area}
            ${is_show_board_file_area == '1' && styles.boards_files_area_show}
            ${is_show_board_file_area == '2' && styles.boards_files_area_hide}
            `}>
                <div onClick={this.setBoardFileMessagesRead} className={styles.all_set_read}>全部标为已读</div>
                <div>
                    {
                        boards_flies.map((item, key) => {
                            const { id, board_name, org_id } = item
                            return (
                                <div key={`${id}_${board_name}`}>
                                    {
                                        isPaymentOrgUser(org_id) &&
                                        this.filterSeeingBoard(id) &&
                                        <BoardsFilesItem
                                            itemValue={item}
                                            item={key}
                                            board_id={id}
                                            board_name={board_name}
                                            setPreviewFileModalVisibile={this.setPreviewFileModalVisibile} />
                                    }
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}
function mapStateToProps({
    gantt: { datas: { is_show_board_file_area, boards_flies = [], folder_seeing_board_id } },
    imCooperation: {
        im_all_latest_unread_messages = [],
    },

}) {
    return {
        is_show_board_file_area,
        boards_flies,
        folder_seeing_board_id,
        im_all_latest_unread_messages
    }
}


