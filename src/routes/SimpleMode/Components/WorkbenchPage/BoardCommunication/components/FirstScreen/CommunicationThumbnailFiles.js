import React, { Component } from 'react';
import { connect } from 'dva';
import { setUploadHeaderBaseInfo, getSubfixName, setBoardIdStorage } from '@/utils/businessFunction';
import { REQUEST_DOMAIN_FILE, UPLOAD_FILE_SIZE } from '@/globalset/js/constant';
import Cookies from 'js-cookie';
import ThumbnailFilesListShow from './ThumbnailFilesListShow';
import ThumbnailFilesTilingShow from './ThumbnailFilesTilingShow';
import defaultTypeImg from '@/assets/invite/user_default_avatar@2x.png';
import { Upload, Icon, message } from 'antd';
import styles from './CommunicationThumbnailFiles.less';
import UploadNormal from '../../../../../../../components/UploadNormal';


@connect(mapStateToProps)
export default class CommunicationThumbnailFiles extends Component {
    constructor(props){
        super(props);
        this.state = {
            currentFileschoiceTab: 0, // "0 搜索全部文件 1 搜索子集文件
            // thumbnailFilesList: thumbnailFilesList, // 缩略图数据
            // defaultFilesShowType: '0', // 缩略图呈现方式： 0 缩略图table呈现 1 缩略图平铺呈现
        }
    }


    // 上传文件
    uploadProps = () => {
        const that = this
        const { currentSelectBoardId, board_id, current_folder_id, updataApiData, getThumbnailFilesData, getSubFileData, queryCommunicationFileData, isShowSub } = this.props
        const propsObj = {
            name: 'file',
            withCredentials: true,
            multiple: true,
            action: `${REQUEST_DOMAIN_FILE}/file/upload`,
            data: {
                board_id: currentSelectBoardId,
                folder_id: current_folder_id,
                type: '1',
                upload_type: '1'
            },
            headers: {
                Authorization: Cookies.get('Authorization'),
                refreshToken: Cookies.get('refreshToken'),
                ...setUploadHeaderBaseInfo({ boardId: currentSelectBoardId }),
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
                let loading = message.loading('正在上传...', 0)
            },
            onChange({ file, fileList, event }) {
                // debugger;
                if (file.status === 'uploading') {

                } else {
                    // message.destroy()
                }
                if (file.status === 'done') {

                    if (file.response && file.response.code == '0') {
                        message.success(`上传成功。`);
                        getThumbnailFilesData();
                        // updataApiData('1');
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
        return propsObj
    }

    // 预览文件/文件圈图显示
    previewFile = (data, e) => {
        const { currentSelectBoardId, current_folder_id } = this.props;
        const {
            file_name,
            name,
            file_resource_id,
            file_id,
            id,
            board_id="",
            folder_id="",
            version_id
        } = data;
        // const id = file_id;
        // const board_id = board_id || currentSelectBoardId;
        // const folder_id = folder_id || current_folder_id;
        const { dispatch } = this.props
        if(!board_id || !folder_id){
            message.info('board_id或folder_id为空');
            return;
        }
        if(!id){
            return;
        }
        setBoardIdStorage(board_id)
        // if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_INTERVIEW)) {
        //     message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME);
        //     return false;
        // }

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
        //         // calback: function (data) {
        //         //     dispatch({
        //         //         type: 'workbenchPublicDatas/getRelationsSelectionPre',
        //         //         payload: {
        //         //             _organization_id: data.base_info.org_id
        //         //         }
        //         //     })
        //         // }
        //     }
        // });
        dispatch({
            type: 'publicFileDetailModal/updateDatas',
            payload: {
                filePreviewCurrentFileId: id,
                fileType: getSubfixName(file_name),
                // isInOpenFile: true
                currentPreviewFileName: file_name
            }
        })
        dispatch({
            type: 'projectDetail/projectDetailInfo',
            payload: {
                id:board_id
            }
        })
        this.props.setPreviewFileModalVisibile && this.props.setPreviewFileModalVisibile();
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


        // if (getSubfixName(file_name || name) == '.pdf') {
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


    }

    // 切换tab
    changeShowTab = (tab) => {
        // this.setState({ filesShowType: tab},()=>{
        //     this.props.getThumbnailFilesData();
        // });
        const { dispatch } = this.props;
        dispatch({
            type: 'projectCommunication/updateDatas',
            payload: {
                filesShowType: tab,
            }
        })
        this.props.getThumbnailFilesData();
    }

    // 搜索-全部文件/当前文件点击
    changeChooseType = (type, item) => {
        const { bread_paths } = this.props;
        console.log('currentIayerSearch', item);
        console.log('bread_paths', bread_paths);
        let tabType = '';
        if(type == 'all_files'){
            tabType = '0';
        } else if(type ="sub_files"){
            if(item.layerType == "projectLayer"){
                tabType = '1';
            } else {
                tabType = '2';
            }
        }
        this.props.changeChooseType(tabType);
    }

    // 公用上传组件
    renderUpload = () => {
        const { currentSelectBoardId, current_folder_id, getThumbnailFilesData } = this.props
        const props = {
            uploadProps: {
                action: `${REQUEST_DOMAIN_FILE}/file/upload`,
                data: {
                    board_id: currentSelectBoardId,
                    folder_id: current_folder_id,
                    type: '1',
                    upload_type: '1'
                },
            },
            uploadCompleteCalback: getThumbnailFilesData,
        }
        return (
            <UploadNormal {...props}>
                <><Icon type="upload" /> 上传文件</>
            </UploadNormal>
        )
    }

    render(){
        const {
            isVisibleFileList,
            onlyFileList,
            onlyFileTableLoading,
            isSearchDetailOnfocusOrOnblur,
            bread_paths,
            currentFileschoiceTab,
            filesShowType,
            currentFileDataType
        } = this.props;
        const currentIayerSearch = bread_paths && bread_paths.length && bread_paths[bread_paths.length-1];
        const currentIayerFolderName = bread_paths && bread_paths.length && (bread_paths[bread_paths.length-1].board_name || bread_paths[bread_paths.length-1].folder_name);
        // console.log('bread_paths',bread_paths);
        return(
            <div className={`${styles.communicationThumbnailFiles} ${isVisibleFileList ? styles.changeContentWidth : null}`}>
                {/* 上传文件和切换列表显示操作 */}
                <div className={styles.thumbnailFilesHeader}>
                    <div className={styles.uploadFile}>
                        {
                            bread_paths && bread_paths.length ?(
                                this.renderUpload()
                                // <Upload {...this.uploadProps()} showUploadList={false}>
                                //     <Icon type="upload" /> 上传文件
                                // </Upload>
                            ): ''
                        }
                        
                    </div>
                    <div className={styles.changeTypeOperation}>
                        <div
                            className={`${styles.listShow} ${filesShowType == '0' ? styles.currentFilesShowType : ''}`}
                            onClick={()=>this.changeShowTab('0')}
                        >
                            <Icon type="bars" />
                        </div>
                        {/* <div className={styles.tilingShow}> */}
                        <div
                            className={`${styles.tilingShow} ${filesShowType == '1' ? styles.currentFilesShowType : ''}`}
                            onClick={()=>this.changeShowTab('1')}
                        >
                            <Icon type="appstore" />
                        </div>
                    </div>
                </div>

                {/* 搜索input触发-显示组件 */}
                {
                    isSearchDetailOnfocusOrOnblur && (
                        <div className={styles.searchTypeBox}>
                            搜索：
                            <span
                                className={ currentFileDataType == '0' ? styles.currentFile : ''}
                                onClick={()=>this.changeChooseType('all_files')}
                            >
                                “全部文件”
                            </span>
                            {
                                currentIayerFolderName ? (
                                    <span
                                        className={ currentFileDataType !== '0' ? styles.currentFile : '' }
                                        onClick={()=>this.changeChooseType('sub_files', currentIayerSearch)}
                                    >
                                        { currentIayerFolderName }
                                    </span>
                                ) :
                                ''
                            }
                            
                        </div>
                    )
                }
                

                {/* 首屏-右侧缩略图列表 */}
                {/* <ThumbnailFilesListShow
                    // thumbnailFilesList={thumbnailFilesList}
                    thumbnailFilesList={onlyFileList}
                    onlyFileTableLoading={onlyFileTableLoading}
                    isSearchDetailOnfocusOrOnblur={isSearchDetailOnfocusOrOnblur}
                    previewFile={this.previewFile}
                /> */}

                {
                    filesShowType == '0' ? (
                        <ThumbnailFilesListShow
                            // thumbnailFilesList={thumbnailFilesList}
                            thumbnailFilesList={onlyFileList}
                            onlyFileTableLoading={onlyFileTableLoading}
                            isSearchDetailOnfocusOrOnblur={isSearchDetailOnfocusOrOnblur}
                            previewFile={this.previewFile}
                        />
                    ) : (
                        <ThumbnailFilesTilingShow
                            thumbnailFilesList={onlyFileList}
                            previewFile={this.previewFile}
                        />
                    )
                }
                
            </div>
        )
    }
}

function mapStateToProps({
    projectCommunication:{
        onlyFileList,
        onlyFileTableLoading,
        filesShowType
    }
}) {
    return {
        onlyFileList,
        onlyFileTableLoading,
        filesShowType
    }
}

CommunicationThumbnailFiles.defaultProps = {
    // 这是一个项目交流中的每一个文件item列表,
}