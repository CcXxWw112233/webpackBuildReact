import { routerRedux } from 'dva/router';
import { getFileList, getBoardFileList, getFolderList } from '@/services/technological/file'
import { projectDetailInfo } from '@/services/technological/prjectDetail'
import { MESSAGE_DURATION_TIME } from "../../globalset/js/constant";
import { isApiResponseOk } from '../../utils/handleResponseData'
import { getModelSelectState } from '@/models/utils'
import {
    checkIsHasPermission, checkIsHasPermissionInBoard, getSubfixName,
    setBoardIdStorage
} from "@/utils/businessFunction";
import { message } from 'antd'

export default {
    namespace: 'simpleWorkbenchbox',
    state: {
        boardListData: [],
        currentBoardDetail: undefined,
        boardFileListData: {},

    },
    subscriptions: {
        setup({ dispatch, history }) {
            history.listen(async (location) => {
                message.destroy()
                //头部table key
                if (location.pathname.indexOf('technological/simplemode/workbench') !== -1) {
                }
            });
        }


    },
    effects: {
        * routingJump({ payload }, { call, put }) {
            const { route } = payload
            yield put(routerRedux.push(route));
        },
        * initSimpleWorkbenchboxCommData({ payload }, { call, put }) {
            const { route } = payload

        },
        * getFileList({ payload }, { call, put }) {
            const { folder_id, board_id, calback} = payload;
            const res = yield call(getBoardFileList, { folder_id, board_id: board_id });
            //console.log("res", res);
            if (isApiResponseOk(res)) {

                let list = []
                let { folder_data = [], file_data = [] } = res.data;
                folder_data.map((folder, key) => {
                    list.push({ key: folder.folder_id, title: folder.folder_name, type: 1, selectable: false });
                });
                file_data.map((file, key) => {
                    list.push({ key: file.file_id, title: file.file_name, type: 2, version_id: file.version_id, file_resource_id: file.file_resource_id, folder_id: file.belong_folder_id, isLeaf: true, selectable: true });
                });

                yield put({
                    type: 'simpleBoardCommunication/updateDatas',
                    payload: {
                        boardFileTreeData: list,
                        is_file_tree_loading: false
                    }
                });
                if (typeof calback === 'function') {
                    calback()
                }
            } else {
                message.warn(res.message, MESSAGE_DURATION_TIME)
            }
        },
        * getFolderList({ payload }, { select, call, put }) {
            const { board_id, calback } = payload
            let res = yield call(getFolderList, { board_id })
            if (isApiResponseOk(res)) {
                yield put({
                    type: 'simpleBoardCommunication/updateDatas',
                    payload: {
                        boardFolderTreeData: res.data,
                        is_file_tree_loading: false
                    }
                })
                if (typeof calback === 'function') {
                    calback()
                }
            } else {

            }
        },
        * getBoardDetail({ payload }, { call, put }) {
            //debugger
            const { id } = payload;
            const res = yield call(projectDetailInfo, id);
            if (isApiResponseOk(res)) {
                yield put({
                    type: 'updateDatas',
                    payload: {
                        currentBoardDetail: res.data
                    }
                });
            } else {
                message.warn(res.message, MESSAGE_DURATION_TIME)
            }
        },

        * loadBoardFileInitData({ payload }, { call, put }) {
            console.log("初始化数据");
            const { id } = payload;
            yield put({
                type: 'projectDetailFile/initialget',
                payload: {
                    id: id
                }
            })
        },


        * initProjectDetailAndprojectDetailFile({ payload }, { select, call, put }) {
            const { id, entry } = payload //input 调用该方法入口
            setBoardIdStorage(id)
            yield put({
                type: 'projectDetail/updateDatas',
                payload: {
                    board_id: id
                }
            })
            let res = yield call(projectDetailInfo, id)

            if (isApiResponseOk(res)) {

                yield put({ //查询项目角色列表
                    type: 'projectDetail/getProjectRoles',
                    payload: {
                        type: '2',
                        board_id: id
                    }
                })
                yield put({
                    type: 'updateDatas',
                    payload: {
                        currentBoardDetail: res.data
                    }
                });
                yield put({
                    type: 'projectDetail/updateDatas',
                    payload: {
                        projectDetailInfoData: res.data,
                        appsSelectKey: 4, //默认文件
                        appsSelectKeyIsAreadyClickArray: 4, //设置默认
                    }
                })
                yield put({
                    type: 'projectDetail/getAppsList',
                    payload: {
                        type: '2',
                        _organization_id: res.data.org_id
                    }
                })

                yield put({
                    type: 'getMilestoneList',
                    payload: {
                        id
                    }
                })

                yield put({
                    type: 'projectDetailFile/getFolderList',
                    payload: {
                        board_id: id
                    }
                })

                yield put({
                    type: 'projectDetailFile/initialget',
                    payload: {
                        id
                    }
                })
                yield put({
                    type: 'projectDetail/getRelationsSelectionPre',
                    payload: {
                        
                    }
                })
                //缓存下来当前项目的权限
                // localStorage.setItem('currentBoardPermission', JSON.stringify(result.data.permissions || []))
            }
        },
    },
    reducers: {
        updateDatas(state, action) {
            return {
                ...state, ...action.payload
            }
        }
    },
}