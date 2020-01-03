import React, { Component } from 'react'
import styles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { getSubfixName, setBoardIdStorage, checkIsHasPermissionInBoard, getGlobalData } from '../../../../../../../utils/businessFunction';
import { Input, Menu, Dropdown, message, Tooltip } from 'antd'
import { PROJECT_FILES_FILE_INTERVIEW, NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME } from '../../../../../../../globalset/js/constant';
import { connect } from 'dva';
import { fileRemove, updateFolder } from '../../../../../../../services/technological/file';
import { isApiResponseOk } from '../../../../../../../utils/handleResponseData';
import { fileItemIsHasUnRead, cardItemIsHasUnRead, folderItemHasUnReadNo } from '../../../ganttBusiness';

@connect(mapStateToProps)
export default class FolderItem extends Component {

    constructor(props) {
        super(props)
        const { itemValue = {} } = this.props
        const { name } = itemValue
        this.state = {
            input_folder_value: '',
            local_name: name,
        }
    }

    // 过滤名字logo
    judgeFileType({ type, local_name }) {
        if (type == '1') {//文件夹
            return '&#xe6c4;'
        }
        let themeCode = '&#xe691;'
        const file_type = getSubfixName(local_name)
        switch (file_type) {
            case '.xls':
                themeCode = '&#xe6d5;'
                break
            case '.png':
                themeCode = '&#xe6d4;'
                break
            case '.xlsx':
                themeCode = '&#xe6d3;'
                break
            case '.ppt':
                themeCode = '&#xe6d2;'
                break
            case '.gif':
                themeCode = '&#xe6d1;'
                break
            case '.jpeg':
                themeCode = '&#xe6d0;'
                break
            case '.pdf':
                themeCode = '&#xe6cf;'
                break
            case '.docx':
                themeCode = '&#xe6ce;'
                break
            case '.txt':
                themeCode = '&#xe6cd;'
                break
            case '.doc':
                themeCode = '&#xe6cc;'
                break
            case '.jpg':
                themeCode = '&#xe6cb;'
                break
            default:
                themeCode = '&#xe691;'
                break
        }
        return themeCode
    }

    // 删除某一项
    requestRemoveItem = async () => { //
        const { board_id, current_folder_id, getFolderFileList, itemValue = {} } = this.props
        const { id, type } = itemValue

        const params = {
            board_id,
            arrays: JSON.stringify([{ type, id }])
        }

        const res = await fileRemove(params)
        if (isApiResponseOk(res)) {
            getFolderFileList({ id: current_folder_id })
        } else {
            message.error(res.message)
        }
    }

    // 菜单点击
    menuItemClick = (e) => {
        e.domEvent.stopPropagation()
        const { key } = e
        switch (key) {
            case '1':
                this.setIsShowChange(true)
                break
            case '2':
                this.requestRemoveItem()
                break
            default:
                break
        }
    }

    // 渲染菜单
    renderOperateItemDropMenu = () => {
        const { itemValue = {} } = this.props
        const { type } = itemValue

        return (
            <Menu onClick={this.menuItemClick}>
                {
                    type == '1' && (
                        <Menu.Item key={1} style={{ width: 248 }}>
                            <span style={{ fontSize: 14, color: `rgba(0,0,0,0.65)`, width: 248 }}><i className={`${globalStyles.authTheme}`} style={{ fontSize: 16 }}>&#xe86d;</i> 重命名</span>
                        </Menu.Item>
                    )
                }
                <Menu.Item key={2}>
                    <span style={{ fontSize: 14, color: `rgba(0,0,0,0.65)`, width: 248 }}><i className={`${globalStyles.authTheme}`} style={{ fontSize: 16 }}>&#xe68d;</i> 移入回收站</span>
                </Menu.Item>
            </Menu>
        )
    }

    // 点击一整个item
    itemClick = (itemValue) => {
        const { local_name } = this.state
        const { type, board_id } = itemValue
        if (type == '1') {
            const new_item_value = { ...itemValue, name: local_name }
            this.props.setBreadPaths && this.props.setBreadPaths({ path_item: new_item_value })
        } else if (type == '2') {
            setBoardIdStorage(board_id)
            this.previewFile(itemValue)
        }
    }

    // 预览文件
    previewFile = (data, e) => {
        const { board_id } = this.props
        const {
            file_name,
            name,
            file_resource_id,
            file_id,
            id,
            folder_id,
            version_id
        } = data;
        const { dispatch } = this.props
        setBoardIdStorage(board_id)
        // if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_INTERVIEW)) {
        //     message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME);
        //     return false;
        // }

        // dispatch({
        //     type: 'publicFileDetailModal/updateDatas',
        //     payload: {
        //         filePreviewCurrentFileId: id,
        //         fileType: getSubfixName(file_name)
        //     }
        // })
        dispatch({
            type: 'projectDetail/projectDetailInfo',
            payload: {
                id:board_id
            }
        })
        dispatch({
            type: 'publicFileDetailModal/updateDatas',
            payload: {
                filePreviewCurrentFileId: id,
                fileType: getSubfixName(name || file_name),
                isInOpenFile: true,
                currentPreviewFileName: name || file_name
            }
        })
        // this.props.setPreviewFileModalVisibile && this.props.setPreviewFileModalVisibile();
        // dispatch({
        //     type: 'workbenchFileDetail/getCardCommentListAll',
        //     payload: {
        //         id: id
        //     }
        // });
        // dispatch({
        //     type: 'workbenchFileDetail/getFileType',
        //     payload: {
        //         file_id: id,
        //         calback: function (data) {
        //             dispatch({
        //                 type: 'workbenchPublicDatas/getRelationsSelectionPre',
        //                 payload: {
        //                     _organization_id: data.base_info.org_id
        //                 }
        //             })
        //         }
        //     }
        // });
        // this.props.setPreviewFileModalVisibile();
        // dispatch({
        //     type: 'workbenchFileDetail/updateDatas',
        //     payload: {
        //         seeFileInput: 'fileModule',
        //         board_id,
        //         filePreviewCurrentId: file_resource_id,
        //         currentParrentDirectoryId: folder_id,
        //         filePreviewCurrentFileId: id,
        //         filePreviewCurrentVersionId: version_id, //file_id,
        //         pdfDownLoadSrc: '',
        //     }
        // })


        // if (getSubfixName(name) == '.pdf') {
        //     this.props.dispatch({
        //         type: 'workbenchFileDetail/getFilePDFInfo',
        //         payload: {
        //             id
        //         }
        //     })
        // } else {
        //     dispatch({
        //         type: 'workbenchFileDetail/filePreview',
        //         payload: {
        //             id: file_resource_id, file_id: id
        //         }
        //     })
        // }
        // dispatch({
        //     type: 'workbenchFileDetail/fileVersionist',
        //     payload: {
        //         version_id: version_id, //file_id,
        //         isNeedPreviewFile: false,
        //     }
        // })
        // dispatch({
        //     type: 'workbenchTaskDetail/getBoardMembers',
        //     payload: {
        //         id: board_id
        //     }
        // })
        dispatch({
            type: 'workbenchPublicDatas/updateDatas',
            payload: {
                board_id
            }
        })

        // 设置已读
        const { im_all_latest_unread_messages } = this.props
        if (cardItemIsHasUnRead({ relaDataId: id, im_all_latest_unread_messages })) {
            dispatch({
                type: 'imCooperation/imUnReadMessageItemClear',
                payload: {
                    relaDataId: id
                }
            })
        }
    }

    // 更改名称
    inputOnPressEnter = (e) => {
        this.requestUpdateFolder()
        this.setIsShowChange(false)
    }
    inputOnBlur = (e) => {
        this.setIsShowChange(false)
    }
    inputOnchange = (e) => {
        const { value } = e.target
        this.setState({
            input_folder_value: value
        })
    }
    setIsShowChange = (flag) => {
        this.setState({
            is_show_change: flag,
            input_folder_value: '',
        })
    }
    requestUpdateFolder = async () => {
        const { input_folder_value } = this.state
        const { itemValue = {}, board_id } = this.props
        const { id } = itemValue
        const params = {
            board_id,
            folder_id: id,
            folder_name: input_folder_value
        }
        const res = await updateFolder(params)
        if (isApiResponseOk(res)) {
            this.setState({
                local_name: input_folder_value
            })
        } else {
            message.warn(res.message);
        }
    }

    render() {
        const { itemValue = {}, im_all_latest_unread_messages = [], wil_handle_types = [], board_id } = this.props
        const { name, id, type, is_privilege, file_name } = itemValue
        const { is_show_change, input_folder_value, local_name } = this.state
        return (
            <div className={`${styles.folder_item_out}`}>
                {
                    is_show_change ? (
                        <div className={`${styles.folder_item} ${styles.add_item}`} style={{ height: 38 }}>
                            <Input style={{ height: 38 }}
                                autoFocus
                                value={input_folder_value}
                                onChange={this.inputOnchange}
                                onPressEnter={this.inputOnPressEnter}
                                onBlur={this.inputOnBlur} />
                        </div>
                    ) : (
                            <div className={styles.folder_item} onClick={() => this.itemClick(itemValue)} >
                                <div className={`${globalStyles.authTheme} ${styles.file_logo}`} dangerouslySetInnerHTML={{ __html: this.judgeFileType({ type, local_name }) }}></div>
                                <div className={`${globalStyles.global_ellipsis} ${styles.file_name}`}>{local_name}</div>
                                {
                                    is_privilege == '1' && (
                                        <Tooltip title="已开启访问控制" placement="top">
                                            <div style={{ color: 'rgba(0,0,0,0.50)', marginRight: '5px' }}>
                                                <span className={`${globalStyles.authTheme}`}>&#xe7ca;</span>
                                            </div>
                                        </Tooltip>
                                    )
                                }
                                <Dropdown overlay={this.renderOperateItemDropMenu()}>
                                    <div className={`${globalStyles.authTheme} ${styles.operator}`}>&#xe7fd;</div>
                                </Dropdown>
                                {/* 未读 */}
                                {
                                    folderItemHasUnReadNo({ type, relaDataId: id, im_all_latest_unread_messages, wil_handle_types }) > 0 &&
                                    // true &&
                                    (
                                        <div className={styles.has_no_read}>
                                            {
                                                folderItemHasUnReadNo({ type, relaDataId: id, im_all_latest_unread_messages, wil_handle_types }) > 99 ?
                                                    '99+' : folderItemHasUnReadNo({ type, relaDataId: id, im_all_latest_unread_messages, wil_handle_types })
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        )
                }
            </div>
        )
    }
}

function mapStateToProps({
    imCooperation: {
        im_all_latest_unread_messages = [], wil_handle_types = [],
    }
}) {
    return { im_all_latest_unread_messages, wil_handle_types }
}