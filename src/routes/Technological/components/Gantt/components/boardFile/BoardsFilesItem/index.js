
import React, { Component } from 'react'
import styles from './index.less'
import FolderBread from './FolderBread'
import FolderList from './FolderList'
import { getFileList } from '@/services/technological/file.js'
import { isApiResponseOk } from '../../../../../../../utils/handleResponseData';
import { message, Upload } from 'antd';
import globalStyles from '@/globalset/css/globalClassName.less'
import { REQUEST_DOMAIN_FILE, PROJECT_FILES_FILE_UPLOAD, NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME, UPLOAD_FILE_SIZE } from '../../../../../../../globalset/js/constant';
import Cookies from 'js-cookie'
import { setUploadHeaderBaseInfo, checkIsHasPermissionInBoard, getGlobalData } from '../../../../../../../utils/businessFunction';
import FileDetailModal from '@/components/FileDetailModal'
import { connect } from 'dva'
import { currentFolderJudegeFileUpload } from '../../../ganttBusiness'
const { Dragger } = Upload

@connect(mapStateToProps)
export default class Index extends Component {
    constructor(props) {
        super(props)
        const { board_id, board_name, itemValue = {} } = this.props
        const { file_data = [], folder_id } = itemValue

        const first_paths_item = {
            name: board_name,
            id: board_id,
            type: 'board',
            folder_id
        }
        this.state = {
            first_paths_item,
            current_folder_id: folder_id,
            file_data,
            bread_paths: [first_paths_item], //面包屑路径
            show_drag: false, //是否显示上传
        }
    }
    setBreadPaths = ({ path_item = {} }) => {
        const { bread_paths = [], first_paths_item } = this.state
        const { id, type } = path_item
        let new_bread_paths = [...bread_paths]
        if (type == 'board') { //项目
            new_bread_paths = [first_paths_item]
            this.getBoardFileList()
        } else { //文件夹
            const index = bread_paths.findIndex(item => item.id == id)
            if (index == -1) { //如果不存在就加上
                new_bread_paths.push(path_item)
            } else { //如果存在就截取
                new_bread_paths = bread_paths.slice(0, index + 1)
            }
            this.getFolderFileList(path_item)
        }
        this.setState({
            bread_paths: new_bread_paths
        })

        // 设置当前正在查看的文件夹所属项目id
        const board_id = new_bread_paths[0].id
        const { dispatch } = this.props
        if (new_bread_paths.length == 1) {
            dispatch({
                type: 'gantt/updateDatas',
                payload: {
                    folder_seeing_board_id: '0'
                }
            })
        } else {
            dispatch({
                type: 'gantt/updateDatas',
                payload: {
                    folder_seeing_board_id: board_id
                }
            })
        }
    }
    getBoardFileList = () => { // 获取项目根目录文件列表
        const { first_paths_item: { folder_id = ' ' } } = this.state
        this.getFolderFileList({ id: folder_id })
    }
    getFolderFileList = async ({ id }) => { //获取其他目录文件列表
        this.setState({
            current_folder_id: id
        })
        // debugger
        const { board_id } = this.props
        const res = await getFileList({ folder_id: id, board_id })
        if (isApiResponseOk(res)) {
            const data = res.data
            const files = data.file_data.map(item => {
                let new_item = { ...item }
                new_item['name'] = item['file_name']
                new_item['id'] = item['file_id']
                return new_item
            })
            const folders = data.folder_data.map(item => {
                let new_item = { ...item }
                new_item['name'] = item['folder_name']
                new_item['id'] = item['folder_id']
                return new_item
            })
            const file_data = [].concat(folders, files)
            this.setState({
                file_data
            })
        } else {
            message.error('获取数据失败')
        }
    }

    // 是否需要更新文件列表, 当访问控制设置时
    whetherUpdateFolderListData = ({folder_id}) => {
        if (folder_id) {
            this.getFolderFileList({ id: folder_id })
        }
    }

    setShowDrag = (bool) => {
        this.setState({
            show_drag: bool
        })
    }

    onDragEnterCapture = (e) => {
        // console.log('ssssss_3_enter', e.currentTarget.dataset)
        this.setShowDrag(true)
    }
    onDragLeaveCapture = (e) => {
        // console.log('ssssss_3_leave', e.currentTarget.dataset)

        // this.setShowDrag(false)
    }

    onDragEnterCaptureChild = (e) => {
        e.stopPropagation()
        // console.log('ssssss_2_enter',  e.currentTarget.dataset)
        this.setShowDrag(true)
    }
    onDragLeaveCaptureChild = (e) => {
        e.stopPropagation()
        this.setShowDrag(true)
    }

    onDragEnterCaptureChildChild = (e) => {
        e.stopPropagation()
        // console.log('ssssss_1_enter',  e.currentTarget.dataset)
        this.setShowDrag(true)
    }
    onDragLeaveCaptureChildChild = (e) => {
        // console.log('ssssss_1_leave',  e.currentTarget.dataset)
        e.stopPropagation()
        this.setShowDrag(true)
    }

    uploadProps = () => {
        const that = this
        const { board_id } = this.props
        const { current_folder_id } = this.state

        const props = {
            name: 'file',
            showUploadList: false,
            withCredentials: true,
            multiple: true,
            action: `${REQUEST_DOMAIN_FILE}/file/upload`,
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
                that.setShowDrag(false)
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
                let loading = message.loading('正在上传...', 0)
            },
            onChange({ file, fileList, event }) {
                if (file.status === 'uploading') {

                } else {
                    // message.destroy()
                }
                if (file.status === 'done') {

                    if (file.response && file.response.code == '0') {
                        message.success(`上传成功。`);
                        that.getFolderFileList({ id: current_folder_id })
                    } else {
                        message.error(file.response && file.response.message || '上传失败');
                    }
                } else if (file.status === 'error') {
                    message.error(`上传失败。`);
                    setTimeout(function () {
                        message.destroy()
                    }, 2000)
                }
            },
        };
        return props
    }

    // 监听到最新未读消息推送过来
    componentWillReceiveProps(nextProps) {
        const { im_all_latest_unread_messages = [], wil_handle_types = [] } = this.props
        const that = this
        const { current_folder_id } = this.state
        const im_all_latest_unread_messages_new = nextProps.im_all_latest_unread_messages
        const length_1 = im_all_latest_unread_messages.length
        const length_2 = im_all_latest_unread_messages_new.length
        // console.log('sssss_length', length_1, length_2)
        if (currentFolderJudegeFileUpload({ folder_id: current_folder_id, im_all_latest_unread_messages: im_all_latest_unread_messages_new }) && (length_1 != length_2)) {
            setTimeout(() => {
                that.getFolderFileList({ id: current_folder_id })
            }, 500)
            // debugger
        }
    }
    render() {
        const { bread_paths = [], file_data = [], current_folder_id, show_drag } = this.state
        const { board_id } = this.props
        return (
            <div
                data-drag_area={'area_top'}
                // style={{ background: 'red', height: 300, }}
                className={`${styles.board_file_area_item}`}
                onDragEnterCapture={this.onDragEnterCapture}
                onDragLeaveCapture={this.onDragLeaveCapture}>
                <FolderBread bread_paths={bread_paths} setBreadPaths={this.setBreadPaths} />
                <FolderList
                    file_data={file_data}
                    current_folder_id={current_folder_id}
                    board_id={board_id}
                    bread_paths={bread_paths}
                    setBreadPaths={this.setBreadPaths}
                    getFolderFileList={this.getFolderFileList}
                    setPreviewFileModalVisibile={this.props.setPreviewFileModalVisibile} />
                {/* {show_drag && ( */}
                <div className={styles.drag_out}
                    data-drag_area={'area_inner'}
                    style={{ display: false ? 'block' : 'none' }}
                    onDragEnterCapture={this.onDragEnterCaptureChild}
                    onDragLeaveCapture={this.onDragLeaveCaptureChild}>
                    <Dragger {...this.uploadProps()} className={styles.drag}>
                        <div className={styles.drag_inner}
                            data-drag_area={'area_inner'}
                            onDragEnterCapture={this.onDragEnterCaptureChildChild}
                            onDragLeaveCapture={this.onDragLeaveCaptureChildChild}>
                            <div className={`${globalStyles.authTheme} ${styles.upload_logo}`} data-drag_area={'area_inner'}
                            >&#xe692;</div>
                            <div className={styles.upload_des} data-drag_area={'area_inner'}
                            >松开鼠标左键即可上传文件到此项目</div>
                        </div>
                    </Dragger>
                </div>
                {/* )} */}
                {
                    this.props.isInOpenFile && board_id && (
                    <FileDetailModal
                        // {...this.props}
                        // {...this.props.fileDetailModalDatas}
                        // setTaskDetailModalVisibile={this.props.setTaskDetailModalVisibile}
                        fileType={this.props.fileType} filePreviewCurrentFileId={this.props.filePreviewCurrentFileId}
                        board_id={board_id}
                        file_detail_modal_visible={this.props.isInOpenFile && getGlobalData('storageCurrentOperateBoardId') == board_id}
                        setPreviewFileModalVisibile={this.props.setPreviewFileModalVisibile}
                        whetherUpdateFolderListData={this.whetherUpdateFolderListData}
                    />
                    )
                }
            </div>
        )
    }
}

function mapStateToProps({
    imCooperation: {
        im_all_latest_unread_messages = [], wil_handle_types = []
    },
    publicFileDetailModal: {
        filePreviewCurrentFileId,
        fileType,
        isInOpenFile
    }
}) {
    return { im_all_latest_unread_messages, wil_handle_types, filePreviewCurrentFileId, fileType, isInOpenFile }
}