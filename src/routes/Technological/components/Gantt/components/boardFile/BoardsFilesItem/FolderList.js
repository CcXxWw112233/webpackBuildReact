import React, { Component } from 'react'
import styles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import FolderItem from './FolderItem'
import { Input, Menu, Dropdown, message, Upload, notification } from 'antd'
import { REQUEST_DOMAIN_FILE, PROJECT_FILES_FILE_UPLOAD, NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME, UPLOAD_FILE_SIZE } from '../../../../../../../globalset/js/constant';
import { setUploadHeaderBaseInfo, checkIsHasPermissionInBoard } from '../../../../../../../utils/businessFunction';
import Cookies from 'js-cookie'
import { addNewFolder } from '../../../../../../../services/technological/file';
import { isApiResponseOk } from '../../../../../../../utils/handleResponseData';
import UploadNotification from '@/components/UploadNotification'
import UploadNormal from '@/components/UploadNormal'

export default class FolderList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            file_data: [],
            is_show_add_item: false,
            add_folder_value: '',
            uploading_file_list: [], //正在上传的文件
            show_upload_notification: false,
            swich_render_upload: true, //是否显示加号
        }
    }

    componentWillReceiveProps(nexProps) {
        const { file_data = [] } = nexProps
        this.setState({
            file_data
        })
    }

    componentDidMount() {
        const { file_data = [] } = this.props
        this.setState({
            file_data
        })
    }

    addItemClick = ({ key }) => {
        if (key == 2) {
            this.setIsShowAddItem(true)
        } else if (key == 1) {

        }
    }
    setIsShowAddItem = (flag) => {
        this.setState({
            is_show_add_item: flag,
            add_folder_value: '',
        })
    }
    uploadProps = () => {
        const that = this
        const { board_id, current_folder_id } = this.props
        const propsObj = {
            name: 'file',
            withCredentials: true,
            multiple: true,
            action: `${REQUEST_DOMAIN_FILE}/file/upload`,
            showUploadList: true,
            onRemove: () => false,
            onDownload: () => false,
            data: {
                board_id,
                folder_id: current_folder_id,
                type: '1',
                upload_type: '1'
            },
            headers: {
                Authorization: Cookies.get('Authorization'),
                refreshToken: Cookies.get('refreshToken'),
                ...setUploadHeaderBaseInfo({ boardId: board_id }),
            },
            beforeUpload(e) {
                // if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPLOAD, board_id)) {
                //     message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
                //     return false
                // }
                if (e.size == 0) {
                    message.error(`不能上传空文件`)
                    return false
                } else if (e.size > UPLOAD_FILE_SIZE * 1024 * 1024) {
                    message.error(`上传文件不能文件超过${UPLOAD_FILE_SIZE}MB`)
                    return false
                }
                // let loading = message.loading('正在上传...', 0)
            },
            onChange({ file, fileList, event }) {
                let fileList_will = [...fileList]
                fileList_will = fileList_will.filter(item => {
                    if (item.status == 'done') {
                        if (item.response && item.response.code == '0') {

                        } else {
                            item.status = 'error'
                        }
                    }
                    return item
                })
                that.setState({
                    uploading_file_list: fileList_will
                }, () => {
                    that.setShowUploadNotification(true)
                })
                const is_has_uploading = fileList_will.length && (fileList_will.findIndex(item => item.status == 'uploading') != -1)
                // console.log('sssss_is_has_uploading', {
                //     is_has_uploading,
                //     length: fileList_will.length,
                //     bool: (fileList_will.findIndex(item => item.status == 'uploading'))
                // })
                if (!is_has_uploading) { //没有上传状态了
                    that.props.getFolderFileList({ id: current_folder_id })
                }
                // if (file.status === 'uploading') {
                // } else {
                //     // message.destroy()
                // }
                // if (file.status === 'done') {
                //     if (file.response && file.response.code == '0') {
                //         message.success(`上传成功。`);
                //         that.props.getFolderFileList({ id: current_folder_id })
                //     } else {
                //         message.error(file.response && file.response.message || '上传失败');
                //     }
                // } else if (file.status === 'error') {
                //     message.error(`上传失败。`);
                //     setTimeout(function () {
                //         message.destroy()
                //     }, 2000)
                // }
            },
        };
        return propsObj
    }
    getFolderFileList = () => {
        const { current_folder_id, getFolderFileList } = this.props
        if (typeof getFolderFileList == 'function') {
            getFolderFileList({ id: current_folder_id })
        }
    }
    renderAddItemDropMenu = () => {
        return (
            <Menu onClick={this.addItemClick} style={{ transform: 'none' }}>
                <Menu.Item key={1} style={{ width: 248, transform: 'none' }}>
                    {/* <Upload {...this.uploadProps()}>
                        <div style={{ width: 220, height: 26 }}>上传文件</div>
                    </Upload> */}
                    {this.renderUpload()}
                </Menu.Item>
                <Menu.Item key={2}>
                    <div>新建文件夹</div>
                </Menu.Item>
            </Menu>
        )
    }
    inputOnPressEnter = (e) => {
        this.requestAddNewFolder()
        this.setIsShowAddItem(false)
    }
    inputOnBlur = (e) => {
        this.setIsShowAddItem(false)
    }
    inputOnchange = (e) => {
        const { value } = e.target
        this.setState({
            add_folder_value: value
        })
    }
    requestAddNewFolder = async () => {
        const { board_id, current_folder_id, getFolderFileList } = this.props
        const { add_folder_value } = this.state
        const res = await addNewFolder({
            board_id,
            parent_id: current_folder_id,
            folder_name: add_folder_value
        })
        if (isApiResponseOk(res)) {
            getFolderFileList({ id: current_folder_id })
        } else {
            message.error(res.message)
        }
    }

    setBreadPaths = (data) => {
        this.props.setBreadPaths(data)
        this.setState({
            swich_render_upload: false
        })
        setTimeout(() => {
            this.setState({
                swich_render_upload: true
            })
        }, 1000)
    }

    // 文件上传
    renderUpload = () => {
        const { uploading_file_list = [], swich_render_upload } = this.state
        const props = {
            uploadProps: this.uploadNormalProps(),
            uploadCompleteCalback: this.getFolderFileList,
            // is_need_parent_notification: true,  //是需要在父组件种做回调还是在子组件内自完成
            // setShowUploadNotification: this.setShowUploadNotification,
            // setUploadingFileList: this.setUploadingFileList,
            // setUploadNotiVisible: this.setUploadNotiVisible
        }
        return (
            // swich_render_upload && 
            // (
            <UploadNormal {...props}>
                <div style={{ width: 220, height: 26 }}>上传文件</div>
            </UploadNormal>
            // )
        )
    }
    // 设置右边弹窗出现
    setUploadNotiVisible = () => {
        this.setShowUploadNotification(false)
        this.setUploadingFileList([])
        this.setState({
            swich_render_upload: false
        })
        setTimeout(() => {
            this.setState({
                swich_render_upload: true
            })
        }, 1000)
    }
    setUploadingFileList = (uploading_file_list) => {
        this.setState({
            uploading_file_list
        })
    }
    // 设置出现右边弹窗
    setShowUploadNotification = (bool) => {
        this.setState({
            show_upload_notification: bool
        })
    }
    //文件上传参数传递
    uploadNormalProps = () => {
        const { board_id, current_folder_id } = this.props
        return {
            action: `${REQUEST_DOMAIN_FILE}/file/upload`,
            data: {
                board_id,
                folder_id: current_folder_id,
                type: '1',
                upload_type: '1'
            },
        }
    }

    render() {
        const { is_show_add_item, add_folder_value, show_upload_notification, uploading_file_list } = this.state
        const { board_id, current_folder_id, file_data } = this.props
        return (
            <div className={styles.folder_list}>
                {
                    file_data.map(item => {
                        const { id, is_privilege } = item
                        return (
                            <div key={`${id}-${is_privilege}`}>
                                <FolderItem
                                    current_folder_id={current_folder_id}
                                    getFolderFileList={this.props.getFolderFileList}
                                    itemValue={item}
                                    board_id={board_id}
                                    setBreadPaths={this.setBreadPaths}
                                    setPreviewFileModalVisibile={this.props.setPreviewFileModalVisibile} />
                            </div>
                        )
                    })
                }
                {
                    is_show_add_item && (
                        <div className={`${styles.folder_item} ${styles.add_item}`} style={{ height: 38 }}>
                            <Input style={{ height: 38 }}
                                autoFocus
                                value={add_folder_value}
                                onChange={this.inputOnchange}
                                onPressEnter={this.inputOnPressEnter}
                                onBlur={this.inputOnBlur} />
                        </div>
                    )
                }
                <Dropdown overlay={this.renderAddItemDropMenu()} >
                    <div className={`${styles.folder_item} ${globalStyles.authTheme} ${styles.add_item}`}>&#xe8fe;</div>
                </Dropdown>
                {/* {
                    show_upload_notification && (
                        <UploadNotification uploading_file_list={uploading_file_list} setUploadNotiVisible={this.setUploadNotiVisible} />
                    )
                } */}
            </div>
        )
    }
}
