import React, { Component } from 'react';
import { connect } from "dva/index"
import indexStyles from './index.less';
import globalStyles from '@/globalset/css/globalClassName.less'
import FileListRightBarFileDetailModal from '@/routes/Technological/components/Workbench/CardContent/Modal/FileListRightBarFileDetailModal';
import { getParent } from "./components/getCommunicationFileListFn";
// import UploadTemporaryFile from './components/UploadTemporaryFile';
import CommunicationFirstScreenHeader from './components/FirstScreen/CommunicationFirstScreenHeader';
import CommunicationTreeList from './components/CommunicationTreeList';
import CommunicationThumbnailFiles from './components/FirstScreen/CommunicationThumbnailFiles';
import { Select, Icon, Tree, Upload, message } from 'antd';
import { REQUEST_DOMAIN_FILE } from "@/globalset/js/constant";
import axios from 'axios'
import Cookies from 'js-cookie'
import {
    getSubfixName, setBoardIdStorage, setUploadHeaderBaseInfo
} from "@/utils/businessFunction";
import { isApiResponseOk } from "@/utils/handleResponseData";
import { getBoardFileList } from '@/services/technological/file'
import { UPLOAD_FILE_SIZE, FILE_TYPE_UPLOAD_WHITELISTED } from "@/globalset/js/constant";
import { openImChatBoard } from '../../../../../utils/businessFunction';
const { Im } = global.constants

const { TreeNode, DirectoryTree } = Tree;

const getEffectOrReducerByName = name => `technological/${name}`
const getEffectOrReducerByName_4 = name => `workbenchTaskDetail/${name}`
const getEffectOrReducerByName_5 = name => `workbenchFileDetail/${name}`
const getEffectOrReducerByName_6 = name => `workbenchPublicDatas/${name}`
const getEffectOrReducerByName_7 = name => `gantt/${name}`
const getEffectOrReducerByName_8 = name => `projectCommunication/${name}`

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
        // 左侧目录上传文件/选择文件是否打开圈图
        showFileListisOpenFileDetailModal: false,
        collapseActiveKeys: [], // 折叠面板展示列keys
        // 是否显示/隐藏文件列表，默认显示
        isVisibleFileList: true,
        bread_paths: [], // 面包屑路径
        currentItemIayerData: [], // 当前层数据
        currentItemLayerId: '', // 当前层级ID
        currentSelectBoardId: '', // 当前选择的项目ID
        currentFolderId: '', // 当前选择文件folder_id
        isSearchDetailOnfocusOrOnblur: false, // 搜索框聚焦显示当前搜索条件详情
        currentFileDataType: '0', // 当前文件数据类型 '0' 全部文件 '1' 项目下全部文件 '2' 文件夹下全部文件
        currentSearchValue: '', // 搜索框输入值
        currentFileschoiceTab: '0', // tab切换 "0 搜索全部文件 1 搜索子集文件
    };

    constructor(props) {
        super(props)
        const { dispatch } = this.props;
        Im.addEventListener('visible', (val) => { // 获取圈子显示隐藏状态
            // this.setState({ isShowlingxiIm: val});
        })
    }

    componentWillReceiveProps(nextProps) { //当捕获到全局所选的项目id变化时，查询
        const { board_id: next_board_id } = nextProps.simplemodeCurrentProject
        const { board_id: last_board_id } = this.props.simplemodeCurrentProject
        if (next_board_id != last_board_id) {
            const is_all_boards = next_board_id == '0' || !next_board_id
            const { boards_flies = [] } = this.props
            const cur_bread_paths = boards_flies.filter(item => item.id == next_board_id)
            this.setState({
                currentFileDataType: is_all_boards ? '0' : '1',
                currentSelectBoardId: next_board_id,
                currentFolderId: '',
                bread_paths: is_all_boards ? [] : cur_bread_paths
            }, () => {
                // console.log('ssss_bread_paths', {path:this.state.bread_paths, boards_flies})
                this.getThumbnailFilesData();
            })
        }
    }

    componentDidMount() {
        this.queryCommunicationFileData();
        this.getThumbnailFilesData();
        // const { simplemodeCurrentProject = {} } = this.props
        // this.getThumbnailFilesData({init_board_id: simplemodeCurrentProject.board_id});
    }

    // 获取项目交流项目文件列表数据'0'
    queryCommunicationFileData = () => {
        const { dispatch, gantt_board_id } = this.props;
        const boardId = gantt_board_id == '0' ? '' : gantt_board_id
        dispatch({
            type: getEffectOrReducerByName_7('getGanttBoardsFiles'),
            payload: {
                // query_board_ids: content_filter_params.query_board_ids,
                // board_id: gantt_board_id == '0' ? '' : gantt_board_id
                board_id: boardId,
                query_board_ids: [],
            }
        });
        this.setState({ currentFileDataType: '0' });
    }

    // 获取项目交流目录下项目数据'1'
    getCommunicationFolderList = (boardId) => {
        const { dispatch } = this.props;
        if (boardId) {
            dispatch({
                type: getEffectOrReducerByName_8('getFolderList'),
                payload: {
                    board_id: boardId,
                }
            });
        }

        this.setState({
            showFileListisOpenFileDetailModal: false, // 关闭圈屏组件
            previewFileModalVisibile: false, // 显示首屏展示组件（头部面包屑,右侧文件按列表）
            currentFileDataType: '1', // 当前文件数据所属层：0全部文件/1项目内文件/2文件夹内文件
            currentSearchValue: '', // 清空搜索关键字
        });
        this.setcurrentItemLayerId(boardId);

    }

    setcurrentItemLayerId = (id) => { // 设置当前所在的项目/层级ID
        this.setState({
            currentSelectBoardId: id,
            currentItemLayerId: id,
        }, () => {
            this.changeFirstBreadPaths(); // 改变第一层面包屑路径
            this.getThumbnailFilesData(); // 更新右侧缩略图列表
        });
    }

    changeFirstBreadPaths = () => { // 改变第一层（项目层）面包屑路径
        // console.log('点击了当前层');
        const { currentItemLayerId } = this.state;
        const { boards_flies } = this.props;
        const firstLayerData = boards_flies.filter(item => item.id == currentItemLayerId);
        firstLayerData.map(item => item.layerType = 'projectLayer');
        // firstLayerData[0].layerType = 'firstLayer';
        this.setState({
            bread_paths: firstLayerData,
            currentFolderId: firstLayerData && firstLayerData[0] && firstLayerData[0].folder_id,
        });
    }

    // 改变当前文件夹tree层级-处理当前层【文件夹层面包屑路径】
    onSelectTree = (currentfloor, first_item) => {
        if (!currentfloor) return
        first_item.layerType = 'projectLayer';
        const { communicationSubFolderData } = this.props;
        const { child_data = [] } = communicationSubFolderData;
        const { folder_id, parent_id } = currentfloor;
        let newLevel = getParent(child_data, folder_id);
        newLevel.unshift(first_item);
        this.setState({
            bread_paths: newLevel,
            currentItemLayerId: folder_id,
            showFileListisOpenFileDetailModal: false, // 关闭圈屏组件
            previewFileModalVisibile: false, // 显示首屏展示组件（头部面包屑,右侧文件按列表）
            currentFileDataType: '2', // 当前文件数据所属层：0全部文件/1项目内文件/2文件夹内文件
            currentFolderId: folder_id,
            currentSearchValue: '', // 清空搜索关键字
        }, () => {
            this.getThumbnailFilesData();
        });

    }

    // 处理传值
    getParams = () => {
        const {
            currentFileDataType, // currentFileDataType 0 全部（包括项目） 1 项目全部（包括文件夹内） 2 文件Tree的文件夹内
            currentSelectBoardId,
            // currentItemLayerId,
            currentFolderId,
            currentSearchValue, // 搜索关键字
        } = this.state;
        let boardId = '';
        let folderId = '';
        let queryConditions = "";
        switch (currentFileDataType) {
            case '0':
                boardId = '';
                folderId = '';
                queryConditions = "";
                break
            case '1':
                boardId = currentSelectBoardId;
                folderId = '';
                queryConditions = currentSelectBoardId ? [{ id: '1135447108158099461', value: currentSelectBoardId }] : null;
                break
            case '2':
                boardId = currentSelectBoardId;
                folderId = currentFolderId;
                queryConditions = [
                    { id: '1135447108158099461', value: currentSelectBoardId },
                    { id: '1192646538984296448', value: currentFolderId },
                ];
                break
            default:
                boardId = '';
                folderId = '';
                queryConditions = "";
                break
        }
        const params = {
            boardId,
            folderId,
            queryConditions,
            currentSearchValue,
        }
        return params;
    }

    // 获取右侧缩略图展示列表显示
    getThumbnailFilesData = (data = {}) => {
        // console.log('获取右侧缩略图显示');
        const { dispatch, simplemodeCurrentProject = {} } = this.props;
        const { board_id } = simplemodeCurrentProject
        const params = this.getParams();
        const { boardId, folderId } = params;
        // console.log('params......',params);

        dispatch({
            type: getEffectOrReducerByName_8('getOnlyFileList'),
            payload: {
                board_id: board_id || boardId,
                folder_id: folderId,
            }
        });
    }

    // 搜索
    searchCommunicationFilelist = () => {
        // console.log('搜索');
        const { dispatch } = this.props;
        const params = this.getParams();
        const { boardId, folderId, queryConditions, currentSearchValue } = params;

        dispatch({
            type: getEffectOrReducerByName_8('getSearchCommunicationFilelist'),
            payload: {
                board_id: boardId,
                folder_id: folderId,
                search_term: currentSearchValue, // 搜索关键字
                search_type: '6', // 搜索类型 '6' 文件类型（目前这里固定'6'，按文件类型搜索）
                query_conditions: queryConditions ? JSON.stringify(queryConditions) : null, // 原详细搜索附带条件
                page_size: 100,
                // page_number: 1,
            }
        });
    }


    // 触发搜索框，是否选择搜索详情
    isShowSearchOperationDetail = (value, searchValue) => {
        this.setState({
            isSearchDetailOnfocusOrOnblur: value,
            currentSearchValue: searchValue,
        }, () => {
            this.searchCommunicationFilelist();
        });
    }



    // 更新数据
    updataApiData = (type) => {
        // this.queryCommunicationFileData();
        // this.getCommunicationFolderList();
        // this.getThumbnailFilesData(type);
        this.getThumbnailFilesData();
    }

    // 回到项目文件-全部文件展示状态
    goAllFileStatus = () => {
        // console.log('回到全部文件状态');
        // bread_paths: [], // 面包屑路径
        // currentItemIayerData: [], // 当前层数据
        // currentItemLayerId: '', // 当前层级ID
        // currentSelectBoardId: '', // 当前选择的项目ID
        // isSearchDetailOnfocusOrOnblur: false, // 搜索框聚焦显示当前搜索条件详情
        // currentFileDataType: '0', // 当前文件数据类型 '0' 全部文件 '1' 项目下全部文件 '2' 文件夹下全部文件
        // currentSearchValue: '', // 搜索框输入值

        // 待处理 

        this.setState({
            bread_paths: [],
            currentItemIayerData: [],
            currentItemLayerId: '',
            currentSelectBoardId: '',
            currentFileDataType: '0',
            currentSearchValue: '',
            isSearchDetailOnfocusOrOnblur: false,
        }, () => {
            this.queryCommunicationFileData();
            this.getThumbnailFilesData();
        });
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

    // 设置文件弹窗显示隐藏
    setPreviewFileModalVisibile = () => {
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
                    } else {
                        message.warn(apiResult.message)
                    }
                }).catch((error, e) => {
                    // console.log(error);
                    message.destroy()
                    message.error('上传失败');
                })

                this.setState({
                    selectBoardFileCompleteDisabled: false
                });
                message.destroy()
                message.success('上传成功');

            } else {
                message.warn(apiResult.message)
            }

            this.initModalSelect()
        }).catch((error, e) => {
            // console.log(error);
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
        // console.log(value);
        this.setState({ value });
    };

    onSelectBoard = (keys, event) => {
        // console.log(event, "event");
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
        const fileName = (event.selectedNodes[0] && event.selectedNodes[0].props && event.selectedNodes[0].props.title) && event.selectedNodes[0].props.title
        const versionId = (event.selectedNodes[0] && event.selectedNodes[0].props && event.selectedNodes[0].props.version_id) && event.selectedNodes[0].props.version_id
        const fileResourceId = (event.selectedNodes[0] && event.selectedNodes[0].props && event.selectedNodes[0].props.file_resource_id) && event.selectedNodes[0].props.file_resource_id
        const folder_id = (event.selectedNodes[0] && event.selectedNodes[0].props && event.selectedNodes[0].props.folder_id) && event.selectedNodes[0].props.folder_id
        this.setState({
            selectBoardFileDropdownVisible: false,
            currentfile: { fileId: fileId, fileName: fileName, versionId: versionId, fileResourceId: fileResourceId, folder_id: folder_id },
            selectBoardFileCompleteDisabled: false
        });
    };

    onSelectFolder = (keys, event) => {
        //console.log('文件夹', keys, event);
        const { dispatch } = this.props;
        if (!event.selectedNodes[0]) {
            return;
        }
        const fileId = keys[0]
        const fileName = (event.selectedNodes[0] && event.selectedNodes[0].props && event.selectedNodes[0].props.title) && event.selectedNodes[0].props.title
        const versionId = (event.selectedNodes[0] && event.selectedNodes[0].props && event.selectedNodes[0].props.version_id) && event.selectedNodes[0].props.version_id
        const fileResourceId = (event.selectedNodes[0] && event.selectedNodes[0].props && event.selectedNodes[0].props.file_resource_id) && event.selectedNodes[0].props.file_resource_id
        const folder_id = (event.selectedNodes[0] && event.selectedNodes[0].props && event.selectedNodes[0].props.folder_id) && event.selectedNodes[0].props.folder_id
        this.setState({
            selectBoardFileDropdownVisible: false,
            currentfile: { fileId: fileId, fileName: fileName, versionId: versionId, fileResourceId: fileResourceId, folder_id: folder_id },
            selectBoardFileCompleteDisabled: false
        });
    };

    handleSelectBoardDropdownVisibleChange = flag => {
        this.setState({ selectBoardDropdownVisible: flag });
    };

    handleSelectBoardFileDropdownVisibleChange = flag => {
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
        // console.log('is_selectFolder', { boardFolderTreeData, boardFileTreeData });
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
        // console.log("ssssss");
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
        // console.log(e);
        this.setState({
            selectBoardFileModalVisible: false,
        });
    };

    handleCancel = e => {
        // console.log(e);
        this.initModalSelect()
    };

    // 显示/隐藏项目文件列表
    isShowFileList = () => {
        this.setState({ isVisibleFileList: !this.state.isVisibleFileList });
    }

    // 是否需要更新文件列表, 当访问控制设置时
    whetherUpdateFolderListData = () => {
        // this.queryCommunicationFileData();
        this.getThumbnailFilesData()
        // if (folder_id) {
        //     this.getFolderFileList({ id: folder_id })
        // }
    }

    // 

    // 显示圈图组件
    showUpdatedFileDetail = () => {
        // this.setState({ previewFileModalVisibile: true});
        this.setState({
            isVisibleFileList: false,
            showFileListisOpenFileDetailModal: true
        });
        this.setPreviewFileModalVisibile();
    }

    // 关闭圈图组件
    hideUpdatedFileDetail = () => {
        this.setState({
            isVisibleFileList: true,
            showFileListisOpenFileDetailModal: false,
        });
        this.setPreviewFileModalVisibile();
        this.getThumbnailFilesData();
        this.props.dispatch({
            type: 'publicFileDetailModal/updateDatas',
            payload: {
                filePreviewCurrentFileId: '',
                fileType: '',
                isInOpenFile: false,
                currentPreviewFileName: ''
            }
        })
        global.constants.lx_utils && global.constants.lx_utils.setCommentData(null)
    }

    // 设置折叠面板keys
    setCollapseActiveKeys = (keys) => {
        // this.setState({ collapseActiveKeys: keys },()=>{
        const { dispatch, expandedKeys } = this.props;
        // if(expandedKeys && expandedKeys.length){
        //     dispatch({
        //         type: getEffectOrReducerByName_8('updateDatas'),
        //         payload: {
        //             expandedKeys: null,
        //         }
        //     })
        // }

        this.setState({ currentSelectBoardId: keys }, () => {
            // console.log('keys_lalala', keys);
            // if(keys){
            this.getCommunicationFolderList(keys); // 获取项目交流目录下子集数据
            // }
            openImChatBoard({ board_id: keys || '', autoOpenIm: true })
        });
    }


    // 改变搜索状态tab-全局搜索/局部搜索
    changeChooseType = (type) => {
        // console.log('点击的层:', type);
        this.setState({
            currentFileDataType: type,
        }, () => {
            const { currentSearchValue } = this.props;
            if (type == '0') {
                this.goAllFileStatus();
            } else {
                this.searchCommunicationFilelist();
            }
        });
    }


    render() {
        const {
            // currentBoardDetail = {},
            // dispatch, model = {},
            // modal,
            // simplemodeCurrentProject,
            // communicationProjectListData,
            // communicationSubFolderData,
            currentLayerSelectedStyle,
        } = this.props;
        const {
            // currentfile = {},
            // is_selectFolder,
            // dragEnterCaptureFlag,
            // showFileSelectDropdown,
            // selectBoardFileModalVisible,
            showFileListisOpenFileDetailModal,
            isVisibleFileList,
            bread_paths,
            currentSelectBoardId,
            currentItemLayerId,
            isSearchDetailOnfocusOrOnblur,
            collapseActiveKeys,
            currentFileschoiceTab,
            currentSearchValue,
            currentFileDataType,
            currentFolderId
        } = this.state;
        // const container_workbenchBoxContent = document.getElementById('container_workbenchBoxContent');
        // const zommPictureComponentHeight = container_workbenchBoxContent ? container_workbenchBoxContent.offsetHeight - 60 - 10 : 600; //60为文件内容组件头部高度 50为容器padding
        // const zommPictureComponentWidth = container_workbenchBoxContent ? container_workbenchBoxContent.offsetWidth - 419 - 50 - 5 : 600; //60为文件内容组件评论等区域宽带   50为容器padding  
        // const zommPictureComponentWidth = container_workbenchBoxContent ? container_workbenchBoxContent.offsetWidth - 50 - 5 : 600; //60为文件内容组件评s论等区域宽带   50为容器padding  

        // const CreateTaskProps = {
        //     modal,
        //     model,
        //     getBoardMembers(payload) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('getBoardMembers'),
        //             payload: payload
        //         })
        //     },
        //     getCardDetail(payload) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('getCardDetail'),
        //             payload: payload
        //         })
        //     },
        //     updateTaskDatas(payload) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('updateDatas'),
        //             payload: payload
        //         })
        //     },
        //     deleteTaskFile(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('deleteTaskFile'),
        //             payload: data,
        //         })
        //     },
        //     addTaskGroup(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('addTaskGroup'),
        //             payload: data,
        //         })
        //     },
        //     deleteTaskGroup(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('deleteTaskGroup'),
        //             payload: data,
        //         })
        //     },
        //     updateTaskGroup(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('updateTaskGroup'),
        //             payload: data,
        //         })
        //     },
        //     getTaskGroupList(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('getTaskGroupList'),
        //             payload: data
        //         })
        //     },
        //     addTask(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('addTask'),
        //             payload: data
        //         })
        //     },
        //     updateTask(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('updateTask'),
        //             payload: data
        //         })
        //     },
        //     deleteTask(id) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('deleteTask'),
        //             payload: {
        //                 id
        //             }
        //         })
        //     },
        //     updateChirldTask(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('updateChirldTask'),
        //             payload: data
        //         })
        //     },
        //     deleteChirldTask(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('deleteChirldTask'),
        //             payload: data
        //         })
        //     },

        //     archivedTask(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('archivedTask'),
        //             payload: data
        //         })
        //     },
        //     changeTaskType(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('changeTaskType'),
        //             payload: data
        //         })
        //     },
        //     addChirldTask(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('addChirldTask'),
        //             payload: data
        //         })
        //     },
        //     addTaskExecutor(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('addTaskExecutor'),
        //             payload: data
        //         })
        //     },
        //     removeTaskExecutor(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('removeTaskExecutor'),
        //             payload: data
        //         })
        //     },
        //     completeTask(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('completeTask'),
        //             payload: data
        //         })
        //     },
        //     addTaskTag(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('addTaskTag'),
        //             payload: data
        //         })
        //     },
        //     removeTaskTag(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('removeTaskTag'),
        //             payload: data
        //         })
        //     },
        //     removeProjectMenbers(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('removeProjectMenbers'),
        //             payload: data
        //         })
        //     },
        //     getCardCommentList(id) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('getCardCommentList'),
        //             payload: {
        //                 id
        //             }
        //         })
        //     },
        //     addCardNewComment(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('addCardNewComment'),
        //             payload: data
        //         })
        //     },
        //     deleteCardNewComment(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('deleteCardNewComment'),
        //             payload: data
        //         })
        //     },
        //     getBoardTagList(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('getBoardTagList'),
        //             payload: data
        //         })
        //     },
        //     updateBoardTag(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('updateBoardTag'),
        //             payload: data
        //         })
        //     },
        //     toTopBoardTag(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('toTopBoardTag'),
        //             payload: data
        //         })
        //     },
        //     deleteBoardTag(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_4('deleteBoardTag'),
        //             payload: data
        //         })
        //     }
        // }
        // const FileModuleProps = {
        //     modal,
        //     model,
        //     updateFileDatas(payload) {
        //         dispatch({
        //             type: getEffectOrReducerByName_5('updateDatas'),
        //             payload: payload
        //         })
        //     },
        //     getFileList(params) {
        //         dispatch({
        //             type: getEffectOrReducerByName('getFileList'),
        //             payload: params
        //         })
        //     },
        //     fileCopy(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_5('fileCopy'),
        //             payload: data
        //         })
        //     },
        //     fileDownload(params) {
        //         dispatch({
        //             type: getEffectOrReducerByName_5('fileDownload'),
        //             payload: params
        //         })
        //     },
        //     fileRemove(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_5('fileRemove'),
        //             payload: data
        //         })
        //     },
        //     fileMove(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_5('fileMove'),
        //             payload: data
        //         })
        //     },
        //     fileUpload(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_5('fileUpload'),
        //             payload: data
        //         })
        //     },
        //     fileVersionist(params) {
        //         dispatch({
        //             type: getEffectOrReducerByName_5('fileVersionist'),
        //             payload: params
        //         })
        //     },
        //     recycleBinList(params) {
        //         dispatch({
        //             type: getEffectOrReducerByName_5('recycleBinList'),
        //             payload: params
        //         })
        //     },
        //     deleteFile(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_5('deleteFile'),
        //             payload: data
        //         })
        //     },
        //     restoreFile(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_5('restoreFile'),
        //             payload: data
        //         })
        //     },
        //     getFolderList(params) {
        //         dispatch({
        //             type: getEffectOrReducerByName_5('getFolderList'),
        //             payload: params
        //         })
        //     },
        //     addNewFolder(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_5('addNewFolder'),
        //             payload: data
        //         })
        //     },
        //     updateFolder(data) {
        //         dispatch({
        //             type: getEffectOrReducerByName_5('updateFolder'),
        //             payload: data
        //         })
        //     },
        //     filePreview(params) {
        //         dispatch({
        //             type: getEffectOrReducerByName_5('filePreview'),
        //             payload: params
        //         })
        //     },
        //     getPreviewFileCommits(params) {
        //         dispatch({
        //             type: getEffectOrReducerByName_5('getPreviewFileCommits'),
        //             payload: params
        //         })
        //     },
        //     addFileCommit(params) {
        //         dispatch({
        //             type: getEffectOrReducerByName_5('addFileCommit'),
        //             payload: params
        //         })
        //     },
        //     deleteCommit(params) {
        //         dispatch({
        //             type: getEffectOrReducerByName_5('deleteCommit'),
        //             payload: params
        //         })
        //     },
        // }
        // const updateDatasTask = (payload) => {
        //     dispatch({
        //         type: getEffectOrReducerByName_4('updateDatas'),
        //         payload: payload
        //     })
        // }
        // const updateDatasFile = (payload) => {
        //     dispatch({
        //         type: getEffectOrReducerByName_5('updateDatas'),
        //         payload: payload
        //     })
        // }
        // const fileDetailModalDatas = {
        //     ...this.props,
        //     ...CreateTaskProps,
        //     ...FileModuleProps,
        //     showFileListisOpenFileDetailModal,
        //     updateDatasTask,
        //     updateDatasFile,
        //     model,
        //     modal,
        // }

        return (
            <div className={`${indexStyles.boardCommunicationWapper}`}
                onDragOverCapture={this.onDragEnterCapture.bind(this)}
                onDragLeaveCapture={this.onDragLeaveCapture.bind(this)}
                onDragEndCapture={this.onDragLeaveCapture.bind(this)}>

                {/* 首屏-文件路径面包屑/搜索 */}
                {
                    !this.state.previewFileModalVisibile &&
                    <CommunicationFirstScreenHeader
                        bread_paths={bread_paths}
                        currentSelectBoardId={currentSelectBoardId}
                        currentSearchValue={currentSearchValue}
                        currentItemLayerId={currentItemLayerId}
                        isShowSearchOperationDetail={this.isShowSearchOperationDetail}
                        getThumbnailFilesData={this.getThumbnailFilesData}
                        searchCommunicationFilelist={this.searchCommunicationFilelist}
                        goAllFileStatus={this.goAllFileStatus}
                        // setBreadPaths={this.setBreadPaths}
                        {...this.props}
                    />
                }


                {/* 控制列表是否显示隐藏的控制按钮 */}
                <div
                    className={indexStyles.operationBtn}
                    style={{ left: isVisibleFileList ? '299px' : '0' }}
                    onClick={this.isShowFileList}
                >
                    <Icon type={isVisibleFileList ? 'left' : 'right'} />
                </div>

                {/* 首屏-项目交流Tree目录列表 */}
                {
                    isVisibleFileList &&
                    <CommunicationTreeList
                        // communicationProjectListData={communicationProjectListData}
                        // communicationSubFolderData={communicationSubFolderData}
                        onSelectTree={this.onSelectTree}
                        getCommunicationFolderList={this.getCommunicationFolderList}
                        queryCommunicationFileData={this.queryCommunicationFileData}
                        showUpdatedFileDetail={this.showUpdatedFileDetail}
                        hideUpdatedFileDetail={this.hideUpdatedFileDetail}
                        isVisibleFileList={isVisibleFileList}
                        isShowFileList={this.isShowFileList}
                        collapseActiveKeys={collapseActiveKeys}
                        setCollapseActiveKeys={this.setCollapseActiveKeys}
                        currentItemLayerId={currentItemLayerId}
                        currentFileDataType={currentFileDataType}
                        currentSelectBoardId={currentSelectBoardId}
                        currentFolderId={currentFolderId}
                        currentLayerSelectedStyle={currentLayerSelectedStyle}
                        {...this.props}
                    />
                }

                {/* 首屏-右侧展示文件区域 */}
                {
                    !this.state.previewFileModalVisibile &&
                    <CommunicationThumbnailFiles
                        isVisibleFileList={isVisibleFileList}
                        currentSelectBoardId={currentSelectBoardId}
                        currentItemLayerId={currentItemLayerId}
                        current_folder_id={currentFolderId}
                        bread_paths={bread_paths}
                        isSearchDetailOnfocusOrOnblur={isSearchDetailOnfocusOrOnblur}
                        getThumbnailFilesData={this.getThumbnailFilesData}
                        updataApiData={this.updataApiData}
                        showUpdatedFileDetail={this.showUpdatedFileDetail}
                        previewFile={this.previewFile}
                        setPreviewFileModalVisibile={this.showUpdatedFileDetail}
                        goAllFileStatus={this.goAllFileStatus}
                        currentFileschoiceTab={currentFileschoiceTab}
                        currentFileDataType={currentFileDataType}
                        changeChooseType={this.changeChooseType}
                        {...this.props}
                    />
                }


                {/* 项目交流列表(1025版本) */}
                {/* <CommunicationFileList
                    queryCommunicationFileData={this.queryCommunicationFileData}
                    showUpdatedFileDetail={this.showUpdatedFileDetail}
                    // setPreviewFileModalVisibile={this.hideUpdatedFileDetail}
                    hideUpdatedFileDetail={this.hideUpdatedFileDetail}
                    isVisibleFileList={isVisibleFileList}
                    isShowFileList={this.isShowFileList}
                    {...this.props}
                /> */}


                {/* 左侧列表点击文件圈图显示 */}
                {
                    showFileListisOpenFileDetailModal && (
                        <FileListRightBarFileDetailModal
                            filePreviewCurrentFileId={this.props.filePreviewCurrentFileId}
                            fileType={this.props.fileType}
                            file_detail_modal_visible={this.state.previewFileModalVisibile}
                            currentPreviewFileName={this.props.currentPreviewFileName}
                            setPreviewFileModalVisibile={this.showUpdatedFileDetail}
                            whetherUpdateFolderListData={this.whetherUpdateFolderListData}
                            // updateCommunicationFolderListData={this.updateCommunicationFolderListData}
                            hideUpdatedFileDetail={this.hideUpdatedFileDetail}
                        />
                    )
                }

                {/* {
                    showFileListisOpenFileDetailModal && (
                        <FileListRightBarFileDetailModal
                            {...this.props}
                            {...fileDetailModalDatas}
                            showFileListisOpenFileDetailModal={showFileListisOpenFileDetailModal}
                            setPreviewFileModalVisibile={this.hideUpdatedFileDetail}
                            modalVisible={fileDetailModalDatas.previewFileModalVisibile}
                            // setPreviewFileModalVisibile={this.props.setPreviewFileModalVisibile}
                            updateDatasTask={fileDetailModalDatas.updateDatasTask}
                            updateDatasFile={fileDetailModalDatas.updateDatasFile}
                            whetherUpdateFolderListData={this.whetherUpdateFolderListData}
                            updateCommunicationFolderListData={this.updateCommunicationFolderListData}
                        />
                    )
                } */}

                {/* 右侧上传文件的圈图详情（1025前版本功能） */}
                {/* {
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
                    )
                } */}

                {/* 右侧上传/临时文件（暂时保留，后期版本可能会做） */}
                {/* {
                    !this.state.previewFileModalVisibile && (
                        <UploadTemporaryFile
                            isVisibleFileList={isVisibleFileList}
                            // 
                            getDraggerProps={this.getDraggerProps}
                            onBeforeUpload={this.onBeforeUpload}
                            dragEnterCaptureFlag={dragEnterCaptureFlag}
                            // 
                            simplemodeCurrentProject={simplemodeCurrentProject}
                            currentBoardId = {this.props.gantt_board_id}
                        />
                    )
                } */}


                {/* 拖拽上传文件（1025前版本） */}
                {/* {
                    !this.state.previewFileModalVisibile && (
                        <div className={`${indexStyles.draggerContainerStyle} ${isVisibleFileList ? indexStyles.changeDraggerWidth : null}`}>
                            <Dragger multiple={false} {...this.getDraggerProps()} beforeUpload={this.onBeforeUpload}>
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
                                                        <div className={indexStyles.linkTitle}>
                                                            // 选择 <a className={indexStyles.alink} onClick={this.selectBoardFile}>项目文件</a> 或  //
                                                            <a className={indexStyles.alink}>点击上传</a> 文件</div>
                                                        <div className={indexStyles.detailDescription}>选择或上传图片格式文件、PDF格式文件即可开启圈点交流</div>
                                                    </div>
                                                </>
                                            )}

                                </div>
                            </Dragger>
                        </div>
                    )} */}


                {/* 选择项目列表弹出框（1025前版本） */}
                {/* <Modal
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

                </Modal> */}


            </div >
        )
    }

}


function mapStateToProps({
    // workbenchFileDetail,
    // workbenchTaskDetail,
    // workbenchDetailProcess,
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
    // workbenchPublicDatas,
    gantt: {
        datas: {
            gantt_board_id,
            boards_flies = []
        }
    },
    // gantt,
    projectCommunication: {
        currentBoardId,
        communicationProjectListData,
        communicationSubFolderData,
        rootDirectoryFolder_id,
        currentLayerSelectedStyle,
    },
    publicFileDetailModal: {
        filePreviewCurrentFileId,
        fileType,
        isInOpenFile,
        currentPreviewFileName
    }
}) {
    // const modelObj = {
    //     datas: {
    //         // ...workbenchFileDetail['datas'],
    //         // ...workbenchPublicDatas['datas'],
    //         ...workbenchTaskDetail['datas'],
    //         ...workbenchFileDetail['datas'],
    //         ...workbenchDetailProcess['datas'],
    //         ...workbenchPublicDatas['datas'],
    //         ...gantt['datas']
    //     }
    // }
    return {
        // model: modelObj,
        allOrgBoardTreeList,
        projectList,
        boardListData,
        currentBoardDetail,
        boardFileListData,
        simpleBoardCommunication,
        simplemodeCurrentProject,
        gantt_board_id,
        currentBoardId,
        communicationProjectListData,
        communicationSubFolderData,
        boards_flies,
        rootDirectoryFolder_id,
        currentLayerSelectedStyle,
        filePreviewCurrentFileId,
        fileType,
        isInOpenFile,
        currentPreviewFileName
    }
}
export default connect(mapStateToProps)(BoardCommunication)

