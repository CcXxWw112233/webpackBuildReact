import React, { Component } from 'react';
import { connect } from "dva/index"
import indexStyles from './index.less';
import globalStyles from '@/globalset/css/globalClassName.less'
import FileDetail from '@/routes/Technological/components/Workbench/CardContent/Modal/FileDetail/index'
import { Modal, Dropdown, Button, Select, Icon, Tree, Upload, message } from 'antd';
import { REQUEST_DOMAIN_FILE } from "@/globalset/js/constant";
import axios from 'axios'
import Cookies from 'js-cookie'
import {
    checkIsHasPermission, checkIsHasPermissionInBoard, getSubfixName, openPDF,
    setBoardIdStorage, getOrgNameWithOrgIdFilter, setUploadHeaderBaseInfo
} from "@/utils/businessFunction";
import { isApiResponseOk } from "@/utils/handleResponseData";
import { getFileList, getBoardFileList, fileInfoByUrl } from '@/services/technological/file'
import coverIconSrc from '@/assets/simplemode/communication_cover_icon@2x.png'
import uploadIconSrc from '@/assets/simplemode/cloud-upload_icon@2x.png'
import { UPLOAD_FILE_SIZE, FILE_TYPE_UPLOAD_WHITELISTED } from "@/globalset/js/constant";

const { Option } = Select;
const { TreeNode, DirectoryTree } = Tree;
const { Dragger } = Upload;


const getEffectOrReducerByName = name => `technological/${name}`
const getEffectOrReducerByName_4 = name => `workbenchTaskDetail/${name}`
const getEffectOrReducerByName_5 = name => `workbenchFileDetail/${name}`
const getEffectOrReducerByName_6 = name => `workbenchPublicDatas/${name}`

class BoardCommunication extends Component {
    state = {
        selectBoardFileModalVisible: false,
        selectBoardDropdownVisible: false,
        selectBoardFileDropdownVisible: false,
        boardTreeData: [],
        currentfile: {},
        selectBoardFileCompleteDisabled: true,
        previewFileModalVisibile: false,
        is_selectFolder: false,
        awaitUploadFile: {},
        dragEnterCaptureFlag: false,
        showFileSelectDropdown: false,
    };

    constructor(props) {
        super(props)
        const { dispatch } = this.props;
    }

    initModalSelect = () => {
        const { dispatch } = this.props
        dispatch({
            type: 'simpleWorkbenchbox/updateDatas',
            payload: {
                currentBoardDetail: undefined
            }
        });
        this.setState({
            selectBoardFileCompleteDisabled: true,
            selectBoardFileModalVisible: false,
        });
    }

    openFileModal = () => {
        const { dispatch } = this.props;
        const { currentBoardDetail = {} } = this.props;
        const { currentfile = {} } = this.state;
        //console.log(currentfile);
        const { fileId, versionId, fileResourceId, folderId, fileName } = currentfile;
        const id = fileId;
        const { board_id } = currentBoardDetail;

        dispatch({
            type: 'workbenchFileDetail/getCardCommentListAll',
            payload: {
                id: id
            }
        });
        dispatch({
            type: 'workbenchFileDetail/getFileType',
            payload: {
                file_id: id
            }
        });

        this.setState({
            selectBoardFileModalVisible: false,
            previewFileModalVisibile: true
        });
        this.getFileModuleProps().updateFileDatas({
            seeFileInput: 'fileModule',
            board_id,
            filePreviewCurrentId: fileResourceId,
            currentParrentDirectoryId: folderId,
            filePreviewCurrentFileId: fileId,
            filePreviewCurrentVersionId: versionId, //file_id,
            pdfDownLoadSrc: '',
        });
        if (getSubfixName(fileName) == '.pdf') {
            dispatch({
                type: 'workbenchFileDetail/getFilePDFInfo',
                payload: {
                    id
                }
            })
        } else {
            this.getFileModuleProps().filePreview({ id: fileResourceId, file_id: id })
        }
        this.getFileModuleProps().fileVersionist({
            version_id: versionId, //file_id,
            isNeedPreviewFile: false,
        })
        this.updatePublicDatas({ board_id })
        this.getFileModuleProps().getBoardMembers({ id: board_id })

        this.initModalSelect()
    }
    setPreviewFileModalVisibile() {
        this.setState({
            previewFileModalVisibile: !this.state.previewFileModalVisibile
        })
    }

    getFileModuleProps() {
        const { dispatch } = this.props;
        return {

            getBoardMembers(payload) {
                dispatch({
                    type: getEffectOrReducerByName_4('getBoardMembers'),
                    payload: payload
                })
            },
            updateFileDatas(payload) {
                dispatch({
                    type: getEffectOrReducerByName_5('updateDatas'),
                    payload: payload
                })
            },
            getFileList(params) {
                dispatch({
                    type: getEffectOrReducerByName('getFileList'),
                    payload: params
                })
            },
            fileCopy(data) {
                dispatch({
                    type: getEffectOrReducerByName_5('fileCopy'),
                    payload: data
                })
            },
            fileDownload(params) {
                dispatch({
                    type: getEffectOrReducerByName_5('fileDownload'),
                    payload: params
                })
            },
            fileRemove(data) {
                dispatch({
                    type: getEffectOrReducerByName_5('fileRemove'),
                    payload: data
                })
            },
            fileMove(data) {
                dispatch({
                    type: getEffectOrReducerByName_5('fileMove'),
                    payload: data
                })
            },
            fileUpload(data) {
                dispatch({
                    type: getEffectOrReducerByName_5('fileUpload'),
                    payload: data
                })
            },
            fileVersionist(params) {
                dispatch({
                    type: getEffectOrReducerByName_5('fileVersionist'),
                    payload: params
                })
            },
            recycleBinList(params) {
                dispatch({
                    type: getEffectOrReducerByName_5('recycleBinList'),
                    payload: params
                })
            },
            deleteFile(data) {
                dispatch({
                    type: getEffectOrReducerByName_5('deleteFile'),
                    payload: data
                })
            },
            restoreFile(data) {
                dispatch({
                    type: getEffectOrReducerByName_5('restoreFile'),
                    payload: data
                })
            },
            getFolderList(params) {
                dispatch({
                    type: getEffectOrReducerByName_5('getFolderList'),
                    payload: params
                })
            },
            addNewFolder(data) {
                dispatch({
                    type: getEffectOrReducerByName_5('addNewFolder'),
                    payload: data
                })
            },
            updateFolder(data) {
                dispatch({
                    type: getEffectOrReducerByName_5('updateFolder'),
                    payload: data
                })
            },
            filePreview(params) {
                dispatch({
                    type: getEffectOrReducerByName_5('filePreview'),
                    payload: params
                })
            },
            getPreviewFileCommits(params) {
                dispatch({
                    type: getEffectOrReducerByName_5('getPreviewFileCommits'),
                    payload: params
                })
            },
            addFileCommit(params) {
                dispatch({
                    type: getEffectOrReducerByName_5('addFileCommit'),
                    payload: params
                })
            },
            deleteCommit(params) {
                dispatch({
                    type: getEffectOrReducerByName_5('deleteCommit'),
                    payload: params
                })
            },
        }
    }

    updateDatasFile = (payload) => {
        const { dispatch } = this.props;
        dispatch({
            type: getEffectOrReducerByName_5('updateDatas'),
            payload: payload
        })
    }

    updateDatas = (payload) => {
        const { dispatch } = this.props;
        dispatch({
            type: getEffectOrReducerByName('updateDatas'),
            payload: payload
        })
    }
    updatePublicDatas = (payload) => {
        const { dispatch } = this.props;
        dispatch({
            type: getEffectOrReducerByName_6('updateDatas'),
            payload: payload
        })
    }

    onBeforeUpload = (file, fileList) => {
        if (fileList.length > 1) {
            message.error("项目交流一次只能上传一个文件");
            //console.log(fileList);
            return false;

        }

        const { dispatch, simplemodeCurrentProject = {} } = this.props;
        if (file.size == 0) {
            message.error(`不能上传空文件`)
            return false
        } else if (file.size > UPLOAD_FILE_SIZE * 1024 * 1024) {
            message.error(`上传文件不能文件超过${UPLOAD_FILE_SIZE}MB`)
            return false
        }
        const lastIndex = file.name.lastIndexOf('.');
        //console.log(file.name.substr(lastIndex) + 1);
        if (!file.name || FILE_TYPE_UPLOAD_WHITELISTED.indexOf(file.name.substr(lastIndex + 1)) == -1) {
            message.error('暂不支持该文件格式上传')
            return false
        }
        this.setState(state => ({
            awaitUploadFile: file,
            selectBoardFileModalVisible: true,
            is_selectFolder: true,
            dragEnterCaptureFlag: false,
            currentfile: {}
        }));

        let currentBoardDetail = {}
        if (simplemodeCurrentProject && simplemodeCurrentProject.board_id) {
            currentBoardDetail = { ...simplemodeCurrentProject };
            dispatch({
                type: 'simpleWorkbenchbox/updateDatas',
                payload: {
                    currentBoardDetail: currentBoardDetail
                }
            });
        }

        dispatch({
            type: 'simpleBoardCommunication/updateDatas',
            payload: {
                is_file_tree_loading: true
            }
        });


        if (currentBoardDetail.board_id) {
            dispatch({
                type: 'simpleWorkbenchbox/getFolderList',
                payload: {
                    board_id: currentBoardDetail.board_id
                }
            });

        }
        return false;
    }

    handleUpload = () => {
        const { awaitUploadFile, currentfile = {} } = this.state;
        const { currentBoardDetail = {} } = this.props;
        //console.log(currentfile);
        const formData = new FormData();
        formData.append("file", awaitUploadFile);
        this.setState({
            selectBoardFileModalVisible: false,
        });
        let loading = message.loading('文件正在上传中...', 0)

        axios({
            url: `${REQUEST_DOMAIN_FILE}/file/upload`,
            method: 'post',
            //processData: false,
            data: formData,
            headers: {
                Authorization: Cookies.get('Authorization'),
                refreshToken: Cookies.get('refreshToken'),
                ...setUploadHeaderBaseInfo({}),
            },
            params: {
                board_id: currentBoardDetail.board_id,
                folder_id: currentfile.fileId,
                type: '1',
                upload_type: '1'
            }
        }).then(res => {
            //console.log(res);
            this.setState({
                awaitUploadFile: {},
                uploading: false,
            });
            const apiResult = res.data;
            if (isApiResponseOk(apiResult)) {
                const { dispatch, currentBoardDetail } = this.props;
                const fileId = apiResult.data.id
                axios({
                    url: `${REQUEST_DOMAIN_FILE}/file/info/${fileId}`,
                    method: 'GET',
                    headers: {
                        Authorization: Cookies.get('Authorization'),
                        refreshToken: Cookies.get('refreshToken'),
                        ...setUploadHeaderBaseInfo({}),
                    }
                }).then(fileInfoRes => {

                    const fileInfoApiResult = fileInfoRes.data
                    if (isApiResponseOk(fileInfoApiResult)) {
                        const id = fileId;
                        const { board_id } = currentBoardDetail;
                        const { base_info } = fileInfoApiResult.data;
                        dispatch({
                            type: 'workbenchFileDetail/getCardCommentListAll',
                            payload: {
                                id: id
                            }
                        });
                        dispatch({
                            type: 'workbenchFileDetail/getFileType',
                            payload: {
                                file_id: id
                            }
                        });

                        this.setState({
                            selectBoardFileModalVisible: false,
                            previewFileModalVisibile: true
                        });
                        this.getFileModuleProps().updateFileDatas({
                            seeFileInput: 'fileModule',
                            board_id,
                            filePreviewCurrentId: base_info.file_resource_id,
                            currentParrentDirectoryId: base_info.folder_id,
                            filePreviewCurrentFileId: fileId,
                            filePreviewCurrentVersionId: base_info.file_id, //file_id,
                            pdfDownLoadSrc: '',
                        });
                        if (getSubfixName(base_info.file_name) == '.pdf') {
                            dispatch({
                                type: 'workbenchFileDetail/getFilePDFInfo',
                                payload: {
                                    id
                                }
                            })
                        } else {
                            this.getFileModuleProps().filePreview({ id: base_info.file_resource_id, file_id: id })
                        }
                        this.getFileModuleProps().fileVersionist({
                            version_id: base_info.file_id, //file_id,
                            isNeedPreviewFile: false,
                        })
                        this.updatePublicDatas({ board_id })
                        this.getFileModuleProps().getBoardMembers({ id: board_id })
                    }
                }).catch((error, e) => {
                    console.log(error);
                    message.destroy()
                    message.error('上传失败');
                })

                this.setState({
                    selectBoardFileCompleteDisabled: false
                });
                message.destroy()
                message.success('上传成功');

            }

            this.initModalSelect()
        }).catch((error, e) => {
            console.log(error);
            message.destroy()
            this.initModalSelect()

            message.error('上传失败');
        });
    }

    getBoardTreeData = (allOrgBoardTreeList) => {
        const { user_set = {} } = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : {};
        let list = []
        allOrgBoardTreeList.map((org, orgKey) => {
            //全组织或者当前组织
            if (user_set.current_org === '0' || user_set.current_org === org.org_id) {
                //children
                //isLeaf: true
                let children = []
                if (org.board_list && org.board_list.length > 0) {
                    org.board_list.map((board, boardKey) => {
                        children.push({ key: board.board_id, title: board.board_name, isLeaf: true, selectable: true });
                    });
                    list.push({ key: org.org_id, title: org.org_name, children, selectable: false });

                }
            }


        });
        return list;
    }


    getBoardFileTreeData = (data) => {
        let list = []
        let { folder_data = [], file_data = [] } = data;
        folder_data.map((folder, key) => {
            list.push({ key: folder.folder_id, title: folder.folder_name, type: 1, selectable: false });
        });
        file_data.map((file, key) => {
            //console.log(file);
            list.push({ key: file.file_id, title: file.file_name, type: 2, version_id: file.version_id, file_resource_id: file.file_resource_id, folder_id: file.belong_folder_id, isLeaf: true, selectable: true });
        });
        return list;
    }

    selectBoardFile = (e) => {
        e.stopPropagation();
        const { dispatch, simplemodeCurrentProject = {} } = this.props;
        let currentBoardDetail = {}
        if (simplemodeCurrentProject && simplemodeCurrentProject.board_id) {
            currentBoardDetail = { ...simplemodeCurrentProject };
            dispatch({
                type: 'simpleWorkbenchbox/updateDatas',
                payload: {
                    currentBoardDetail: currentBoardDetail
                }
            });
        }

        dispatch({
            type: 'simpleBoardCommunication/updateDatas',
            payload: {
                is_file_tree_loading: true
            }
        });


        if (currentBoardDetail.board_id) {
            dispatch({
                type: 'simpleWorkbenchbox/getFileList',
                payload: {
                    board_id: currentBoardDetail.board_id

                }
            });
        }

        this.setState({
            selectBoardFileModalVisible: true,
            is_selectFolder: false,
            currentfile: {}
        });

    }

    onChange = value => {
        console.log(value);
        this.setState({ value });
    };

    onSelectBoard = (keys, event) => {
        console.log(event, "event");
        const { dispatch } = this.props;
        const { is_selectFolder } = this.state;
        if (keys.length > 0) {
            const boardId = keys[0]
            setBoardIdStorage(boardId);
            dispatch({
                type: 'simpleBoardCommunication/updateDatas',
                payload: {
                    is_file_tree_loading: true
                }
            });
            dispatch({
                type: 'simpleWorkbenchbox/updateDatas',
                payload: {
                    currentBoardDetail: this.getSelectBoardBaseInfo(boardId)
                }
            });
            if (is_selectFolder) {
                dispatch({
                    type: 'simpleWorkbenchbox/getFolderList',
                    payload: {
                        board_id: boardId,
                        calback: () => {
                            dispatch({
                                type: 'simpleBoardCommunication/updateDatas'
                            });
                        }
                    }
                });
            } else {
                dispatch({
                    type: 'simpleWorkbenchbox/getFileList',
                    payload: {
                        board_id: boardId
                    }
                });
            }

            this.setState({
                selectBoardDropdownVisible: false,
                showFileSelectDropdown: true,
                currentfile: {}
            });
        }

    };

    onSelectFile = (keys, event) => {
        //console.log('Trigger Select', keys, event);
        const { dispatch } = this.props;
        if (!event.selectedNodes[0]) {
            return;
        }
        const fileId = keys[0]
        //console.log("selectedNodes", event.selectedNodes[0]);
        if (!event.selectedNodes[0] && event.selectedNodes[0].props.type === 1) {
            message.warn('文件夹不能被选择');
            return;
        }
        this.setState({
            selectBoardFileDropdownVisible: false,
            currentfile: { fileId: fileId, fileName: event.selectedNodes[0].props.title, versionId: event.selectedNodes[0].props.version_id, fileResourceId: event.selectedNodes[0].props.file_resource_id, folder_id: event.selectedNodes[0].props.folder_id },
            selectBoardFileCompleteDisabled: false
        });
    };

    onSelectFolder = (keys, event) => {
        //console.log('文件夹', keys, event);
        const { dispatch } = this.props;
        const fileId = keys[0]
        //console.log("selectedNodes", event.selectedNodes[0].props.title);

        this.setState({
            selectBoardFileDropdownVisible: false,
            currentfile: { fileId: fileId, fileName: event.selectedNodes[0].props.title, versionId: event.selectedNodes[0].props.version_id, fileResourceId: event.selectedNodes[0].props.file_resource_id, folder_id: event.selectedNodes[0].props.folder_id },
            selectBoardFileCompleteDisabled: false
        });
    };

    handleSelectBoardDropdownVisibleChange = flag => {
        this.setState({ selectBoardDropdownVisible: flag });
    };

    handleSelectBoardFileDropdownVisibleChange = flag => {
        console.log('sddddff');
        this.setState({ selectBoardFileDropdownVisible: flag });
    };

    getSelectBoardBaseInfo(boardId) {
        const { allOrgBoardTreeList = [] } = this.props;
        let currentBoard
        allOrgBoardTreeList.map((org, orgKey) => {
            if (org.board_list && org.board_list.length > 0) {
                let newBoardList = org.board_list.filter(item => item.board_id == boardId);
                if (newBoardList.length > 0) {
                    currentBoard = newBoardList[0];
                };
            }
        });
        return currentBoard;
    }

    async onLoadFileTreeData(treeNode) {
        const { dispatch, currentBoardDetail = {}, simpleBoardCommunication = {} } = this.props;
        const { boardFileTreeData = {} } = simpleBoardCommunication;
        const res = await getBoardFileList({ board_id: currentBoardDetail.board_id, folder_id: treeNode.props.eventKey });
        if (isApiResponseOk(res)) {
            //console.log(treeNode.props);
            const childTreeData = this.getBoardFileTreeData(res.data);
            treeNode.props.dataRef.children = [...childTreeData];
            if (!childTreeData || childTreeData.length == 0) {
                treeNode.props.dataRef.title = (
                    <span>
                        {treeNode.props.dataRef.title}
                        <span style={{ color: 'rgba(0, 0, 0, 0.25)' }}>&nbsp;(没有可选文件)</span>
                    </span>
                )
            }
            dispatch({
                type: 'simpleBoardCommunication/updateDatas',
                payload: {
                    boardFileTreeData: boardFileTreeData
                }
            });

        }
    }



    renderTreeNodes = data => {
        return data.map(item => {
            if (item.children) {
                return (
                    <TreeNode key={item.key} {...item} dataRef={item} selectable={item.selectable == true ? true : false}>
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            } else {
                return <TreeNode key={item.key} {...item} dataRef={item} selectable={item.selectable == true ? true : false} />;
            }

        });
    }

    renderFolderTreeNodes = data => {
        return data.map(item => {
            if (item.child_data) {
                return (
                    <TreeNode title={item.folder_name} key={item.folder_id} dataRef={item} >
                        {this.renderFolderTreeNodes(item.child_data)}
                    </TreeNode>
                );
            } else {
                return <TreeNode title={item.folder_name} key={item.folder_id} dataRef={item} />;
            }

        });

    }

    renderSelectBoardTreeList = () => {
        const { allOrgBoardTreeList = [] } = this.props;
        const boardTreeData = this.getBoardTreeData(allOrgBoardTreeList);
        if (boardTreeData.length == 0) {
            return (
                <div style={{ backgroundColor: '#FFFFFF', textAlign: 'center', height: '50px', lineHeight: '48px', overflow: 'hidden', color: 'rgba(0, 0, 0, 0.25)' }} className={`${globalStyles.page_card_Normal} ${indexStyles.directoryTreeWapper}`}>
                    没有可选项目
                </div>
            )
        }
        return (
            <>
                <div style={{ backgroundColor: '#FFFFFF' }} className={`${globalStyles.page_card_Normal} ${indexStyles.directoryTreeWapper}`}>
                    <Tree
                        blockNode={true}

                        defaultExpandAll
                        //defaultSelectedKeys={['0-0-0']}

                        onSelect={this.onSelectBoard}>
                        {this.renderTreeNodes(boardTreeData)}
                    </Tree>
                </div>
            </>
        );
    }

    renderSelectBoardFileTreeList = () => {
        const { boardFileTreeData = [], boardFolderTreeData = [], is_file_tree_loading } = this.props.simpleBoardCommunication;
        const { is_selectFolder } = this.state;
        console.log('is_selectFolder', { boardFolderTreeData, boardFileTreeData });
        if (is_file_tree_loading) {
            return (
                <div style={{ backgroundColor: '#FFFFFF', textAlign: 'center', height: '50px', lineHeight: '48px', overflow: 'hidden', color: 'rgba(0, 0, 0, 0.25)' }} className={`${globalStyles.page_card_Normal} ${indexStyles.directoryTreeWapper}`}>
                    数据加载中
                </div>
            )
        }
        if (boardFileTreeData.length == 0 && boardFolderTreeData.length == 0) {
            return (
                <div style={{ backgroundColor: '#FFFFFF', textAlign: 'center', height: '50px', lineHeight: '48px', overflow: 'hidden', color: 'rgba(0, 0, 0, 0.25)' }} className={`${globalStyles.page_card_Normal} ${indexStyles.directoryTreeWapper}`}>
                    没有可选文件
                </div>
            )
        }
        return (
            <>
                <div style={{ backgroundColor: '#FFFFFF' }} className={`${globalStyles.page_card_Normal} ${indexStyles.directoryTreeWapper}`}>
                    {
                        is_selectFolder ? (
                            <DirectoryTree onSelect={this.onSelectFolder}>
                                {this.renderFolderTreeNodes([boardFolderTreeData])}
                            </DirectoryTree>
                        ) : (
                                <DirectoryTree loadData={this.onLoadFileTreeData.bind(this)} onSelect={this.onSelectFile} >
                                    {this.renderTreeNodes(boardFileTreeData)}
                                </DirectoryTree>
                            )}

                </div>
            </>
        );
    }


    getDraggerProps = () => {
        return {
            name: 'file',
            multiple: false,
            withCredentials: true,
        };
    }

    onDragEnterCapture = (e) => {
        console.log("ssssss");
        this.setState({
            dragEnterCaptureFlag: true
        });
    }


    onDragLeaveCapture = (e) => {
        this.setState({
            dragEnterCaptureFlag: false
        });
    }

    handleOk = e => {
        console.log(e);
        this.setState({
            selectBoardFileModalVisible: false,
        });
    };

    handleCancel = e => {
        console.log(e);
        this.initModalSelect()
    };

    render() {
        const { currentBoardDetail = {} } = this.props;
        const { currentfile = {}, is_selectFolder, dragEnterCaptureFlag, showFileSelectDropdown } = this.state;
        const container_workbenchBoxContent = document.getElementById('container_workbenchBoxContent');
        const zommPictureComponentHeight = container_workbenchBoxContent ? container_workbenchBoxContent.offsetHeight - 60 - 10 : 600; //60为文件内容组件头部高度 50为容器padding
        const zommPictureComponentWidth = container_workbenchBoxContent ? container_workbenchBoxContent.offsetWidth - 419 - 50 - 5 : 600; //60为文件内容组件评论等区域宽带   50为容器padding  
        console.log(showFileSelectDropdown, "sssss");

        return (
            <div className={`${indexStyles.boardCommunicationWapper}`}
                onDragOverCapture={this.onDragEnterCapture.bind(this)}
                onDragLeaveCapture={this.onDragLeaveCapture.bind(this)}
                onDragEndCapture={this.onDragLeaveCapture.bind(this)}>
                {
                    this.state.previewFileModalVisibile && (
                        <FileDetail
                            {...this.props}
                            updateDatasFile={this.updateDatasFile}
                            updatePublicDatas={this.updatePublicDatas}
                            {...this.getFileModuleProps()}
                            offsetTopDeviation={85}
                            modalTop={0}
                            setPreviewFileModalVisibile={this.setPreviewFileModalVisibile.bind(this)}
                            componentHeight={zommPictureComponentHeight}
                            componentWidth={zommPictureComponentWidth} />
                    )}
                {
                    !this.state.previewFileModalVisibile && (
                        <Dragger multiple={false} {...this.getDraggerProps()} className={indexStyles.dragStyle}
                            beforeUpload={this.onBeforeUpload}>
                            <div className={`${indexStyles.indexCoverWapper} ${dragEnterCaptureFlag ? indexStyles.draging : ''}`}>

                                {
                                    dragEnterCaptureFlag ? (
                                        <div className={indexStyles.iconDescription}>
                                            <img src={uploadIconSrc} style={{ width: '48px', height: '48px' }} />
                                            <span className={indexStyles.iconDescription}>松开鼠标左键即可上传文件</span>
                                        </div>
                                    ) : (
                                            <>
                                                <div className={indexStyles.icon}>
                                                    <img src={coverIconSrc} style={{ width: '80px', height: '84px' }} />
                                                </div>
                                                <div className={indexStyles.descriptionWapper}>
                                                    <div className={indexStyles.linkTitle}>选择 <a className={indexStyles.alink} onClick={this.selectBoardFile}>项目文件</a> 或 <a className={indexStyles.alink}>点击上传</a> 文件</div>
                                                    <div className={indexStyles.detailDescription}>选择或上传图片格式文件、PDF格式文件即可开启圈点交流</div>
                                                </div>
                                            </>
                                        )}

                            </div>
                        </Dragger>
                    )}

                <Modal
                    width={248}
                    bodyStyle={{ padding: '0px' }}
                    footer={
                        <div style={{ width: '100%' }}>
                            {
                                !is_selectFolder && <Button type="primary" disabled={this.state.selectBoardFileCompleteDisabled} style={{ width: '100%' }} onClick={this.openFileModal}>完成</Button>
                            }
                            {
                                is_selectFolder && <Button type="primary" disabled={this.state.selectBoardFileCompleteDisabled} style={{ width: '100%' }} onClick={this.handleUpload}>开始上传</Button>
                            }

                        </div>
                    }
                    title={<div style={{ textAlign: 'center' }}>{is_selectFolder ? '选择上传文件夹' : '选择文件'}</div>}
                    visible={this.state.selectBoardFileModalVisible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >
                    {
                        this.state.selectBoardFileModalVisible && (
                            <div>
                                <div className={`${indexStyles.selectWapper} ${indexStyles.borderBottom}`}>
                                    <Dropdown
                                        overlay={this.renderSelectBoardTreeList()}
                                        trigger={['click']}
                                        className={`${indexStyles.dropdownSelect}`}
                                        onVisibleChange={this.handleSelectBoardDropdownVisibleChange}
                                        visible={this.state.selectBoardDropdownVisible}>
                                        <div className={indexStyles.dropdownLinkWapper}>
                                            <span style={{ display: 'block', width: '28px' }}>项目</span>
                                            <span className={indexStyles.dropdownLink}>
                                                {currentBoardDetail.board_id ? currentBoardDetail.board_name : '请选择'} <Icon type="down" />
                                            </span>
                                        </div>
                                    </Dropdown>
                                </div>

                                <div className={indexStyles.selectWapper}>
                                    <Dropdown
                                        disabled={!currentBoardDetail || !currentBoardDetail.board_id}
                                        overlay={this.renderSelectBoardFileTreeList()}
                                        trigger={['click']}
                                        className={`${indexStyles.dropdownSelect}`}
                                        onVisibleChange={this.handleSelectBoardFileDropdownVisibleChange}
                                        visible={this.state.selectBoardFileDropdownVisible}>
                                        <div className={indexStyles.dropdownLinkWapper}>
                                            {is_selectFolder ?
                                                <span style={{ display: 'block', width: '44px' }}>文件夹</span>
                                                :
                                                <span style={{ display: 'block', width: '28px' }}>文件</span>
                                            }

                                            <span className={indexStyles.dropdownLink}>
                                                {currentfile.fileId ? currentfile.fileName : '请选择'} <Icon type="down" />
                                            </span>
                                        </div>
                                    </Dropdown>
                                </div>
                            </div>

                        )
                    }

                </Modal>


            </div >
        )
    }

}


function mapStateToProps({
    workbenchFileDetail,
    simpleWorkbenchbox: {
        boardListData,
        currentBoardDetail,
        boardFileListData
    },
    simplemode: {
        allOrgBoardTreeList,
        simplemodeCurrentProject
    },
    simpleBoardCommunication,
    workbench: {
        datas: { projectList }
    },
    workbenchPublicDatas
}) {
    const modelObj = {
        datas: { ...workbenchFileDetail['datas'], ...workbenchPublicDatas['datas'] }
    }
    return {
        model: modelObj,
        allOrgBoardTreeList,
        projectList,
        boardListData,
        currentBoardDetail,
        boardFileListData,
        simpleBoardCommunication,
        simplemodeCurrentProject
    }
}
export default connect(mapStateToProps)(BoardCommunication)

