import { routerRedux } from 'dva/router';
import { getUserBoxs, getAllBoxs, boxSet, boxCancel, getWallpaperList } from '@/services/technological/simplemode'
import { MESSAGE_DURATION_TIME } from "../../globalset/js/constant";
import { isApiResponseOk } from '../../utils/handleResponseData'
import { getModelSelectState } from '@/models/utils'
import { message } from 'antd'
import { getUserAllOrgsBoardList, } from '@/services/technological/index'
export default {
    namespace: 'simplemode',
    state: {
        initFlag: true,
        simpleHeaderVisiable: true, //显示隐藏用
        setWapperCenter: false, //显示隐藏用
        wallpaperSelectModalVisiable: false, //显示隐藏用
        leftMainNavIconVisible: true,
        leftMainNavVisible: false,
        chatImVisiable: false, //显示隐藏用

        workbenchBoxContentWapperModalStyle: { width: '100%' },
        myWorkbenchBoxList: [], //我的盒子列表
        workbenchBoxList: [], //所有可以选择的盒子列表
        currentSelectedWorkbenchBox: {}, //当然选中的工作台盒子
        init: true,
        allOrgBoardTreeList: [],
        allWallpaperList: [], //可选的壁纸列表
        currentUserWallpaperContent: null,
        simplemodeCurrentProject: {},
    },
    subscriptions: {
        setup({ dispatch, history }) {
            history.listen((location) => {
                if (location.pathname.indexOf('/technological/simplemode') !== -1) {
                    const initData = () => {
                        Promise.all([
                            dispatch({
                                type: 'initSimplemodeCommData',
                                payload: {}
                            }),


                        ])
                    }
                    initData()
                }
            });
        }
    }
    ,
    effects: {
        * initSimplemodeCommData({ payload }, { call, put, select }) {
            const initFlag = yield select(getModelSelectState("simplemode", "initFlag")) || [];

            if (initFlag) {
                yield put({
                    type: 'getProjectList',
                    payload: {}
                });
                yield put({
                    type: 'getOrgBoardData'
                });
                // yield put({
                //     type: 'workbenchPublicDatas/getRelationsSelectionPre'
                // });
                yield put({
                    type: 'getWallpaperList'
                });
            }

        },
        * routingJump({ payload }, { call, put }) {
            const { route } = payload
            yield put(routerRedux.push(route));
        },
        * getMyBoxs({ payload }, { call, put, select }) {
            let res = yield call(getUserBoxs, {});
            const currentSelectedWorkbenchBox = yield select(getModelSelectState('simplemode', 'currentSelectedWorkbenchBox')) || {}
            if (isApiResponseOk(res)) {
                let { data: myWorkbenchBoxList } = res;
                yield put({
                    type: 'updateDatas',
                    payload: {
                        myWorkbenchBoxList: myWorkbenchBoxList
                    }
                })
                if (!currentSelectedWorkbenchBox.id) { //当workbench界面刷新的时候，设置默认
                    //当前的box存储在会话中，如果有就取，没有取列表第一个
                    const sessionStorage_item = window.sessionStorage.getItem('session_currentSelectedWorkbenchBox')
                    const session_currentSelectedWorkbenchBox = JSON.parse(sessionStorage_item || '{}')
                    const is_has_this_box = !!myWorkbenchBoxList.findIndex(item => item.id == session_currentSelectedWorkbenchBox.id) //存在该盒子
                    const will_set_data = session_currentSelectedWorkbenchBox.id && is_has_this_box ? session_currentSelectedWorkbenchBox : myWorkbenchBoxList[0]
                    yield put({
                        type: 'updateDatas',
                        payload: {
                            currentSelectedWorkbenchBox: will_set_data
                        }
                    })
                    window.sessionStorage.setItem('session_currentSelectedWorkbenchBox', JSON.stringify(will_set_data))
                }
            } else {
                message.warn(res.message, MESSAGE_DURATION_TIME)
            }
        },
        * getAllBoxs({ payload }, { call, put }) {
            let res = yield call(getAllBoxs, {});
            if (isApiResponseOk(res)) {
                let { data: workbenchBoxList } = res;
                yield put({
                    type: 'updateDatas',
                    payload: {
                        workbenchBoxList: workbenchBoxList
                    }
                })
            } else {
                message.warn(res.message, MESSAGE_DURATION_TIME)
            }
        },
        * myboxSet({ payload }, { call, put, select }) {
            const { id } = payload;
            let res = yield call(boxSet, payload);

            if (isApiResponseOk(res)) {
                //我的盒子列表
                let myWorkbenchBoxList = yield select(getModelSelectState("simplemode", "myWorkbenchBoxList")) || [];
                //所有的盒子列表

                let workbenchBoxList = yield select(getModelSelectState("simplemode", "workbenchBoxList")) || [];
                let newMyboxArray = workbenchBoxList.filter(item => item.id == id);
                if (newMyboxArray.length > 0) {
                    myWorkbenchBoxList.push(newMyboxArray[0]);
                } else {
                    let newMybox = { id };
                    myWorkbenchBoxList.push(newMybox);
                }

                yield put({
                    type: 'updateDatas',
                    payload: {
                        myWorkbenchBoxList: [...myWorkbenchBoxList]
                    }
                });
            } else {
                message.warn(res.message, MESSAGE_DURATION_TIME)
            }
        },
        * myboxCancel({ payload }, { call, put, select }) {
            const { id } = payload;
            let res = yield call(boxCancel, payload);

            if (isApiResponseOk(res)) {
                let myWorkbenchBoxList = yield select(getModelSelectState("simplemode", "myWorkbenchBoxList")) || [];
                yield put({
                    type: 'updateDatas',
                    payload: {
                        myWorkbenchBoxList: myWorkbenchBoxList.filter(item => item.id !== id)
                    }
                });
            } else {
                message.warn(res.message, MESSAGE_DURATION_TIME)
            }
        },
        * getOrgBoardData({ payload }, { call, put, select }) {
            let res = yield call(getUserAllOrgsBoardList, payload);
            if (isApiResponseOk(res)) {

                yield put({
                    type: 'updateDatas',
                    payload: {
                        allOrgBoardTreeList: res.data
                    }
                });
            } else {
                message.warn(res.message, MESSAGE_DURATION_TIME)
            }
        },
        * getWallpaperList({ payload }, { call, put, select }) {
            let res = yield call(getWallpaperList, payload);
            if (isApiResponseOk(res)) {
                yield put({
                    type: 'updateDatas',
                    payload: {
                        allWallpaperList: res.data,
                        initFlag: false
                    }
                });
            } else {
                message.warn(res.message, MESSAGE_DURATION_TIME)
            }
        }
    },
    reducers: {
        updateDatas(state, action) {
            return {
                ...state, ...action.payload
            }
        }
    },
}