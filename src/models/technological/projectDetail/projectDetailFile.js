import { message } from 'antd'
import { routerRedux } from "dva/router";
import Cookies from "js-cookie";
import modelExtend from 'dva-model-extend'
import projectDetail from './index'
import { getSubfixName } from '../../../utils/businessFunction'
import {
  filePreviewByUrl,
  fileInfoByUrl,
  addFileCommit, addNewFolder, deleteCommit, deleteFile, fileCopy, fileDownload, fileMove, filePreview, fileRemove,
  fileUpload,
  fileVersionist,
  getFileCommitPoints,
  getFileList,
  getFolderList,
  getPreviewFileCommits,
  recycleBinList,
  restoreFile,
  getFileDetailIssue,
  updateFolder,
  getCardCommentListAll,
  getFilePDFInfo
} from "../../../services/technological/file";
import {
  selectAppsSelectKey,
  selectBreadcrumbList,
  selectCurrentParrentDirectoryId,
  selectFilePreviewCommitPointNumber,
  selectFilePreviewCurrentFileId
} from "../select";
import {MESSAGE_DURATION_TIME} from "../../../globalset/js/constant";
import {isApiResponseOk} from "../../../utils/handleResponseData";
import QueryString from 'querystring'
import {projectDetailInfo} from "../../../services/technological/prjectDetail";

let board_id = null
let appsSelectKey = null
let file_id = null
let folder_id = null
export default modelExtend(projectDetail, {
  namespace: 'projectDetailFile',
  state: {
    datas: {
          // 文档
          fileList: [], //文档列表
          filedata_1: [], //文档列表--文件夹breadcrumbList
          filedata_2: [], //文档列表--文件
          selectedRowKeys: [], //选择的列表项
          isInAddDirectory: false, //是否正在创建文件家判断标志
          moveToDirectoryVisiblie: false, // 是否显示移动到文件夹列表
          openMoveDirectoryType: '', //打开移动或复制弹窗方法 ‘1’：多文件选择。 2：‘单文件选择’，3 ‘从预览入口进入’
          currentFileListMenuOperatorId: '', //文件列表项点击菜单选项设置当前要操作的id
          breadcrumbList: [], //文档路劲面包屑{id: '123456', name: '根目录', type: '1'},从项目详情里面初始化
          currentParrentDirectoryId: '', //当前文件夹id，根据该id来判断点击文件或文件夹时是否打开下一级，从项目详情里面初始化
          isInOpenFile: false, //当前是否再打开文件状态，用来判断文件详情是否显示
          treeFolderData: {}, //文件夹树状结构
          filePreviewIsUsable: true, //文件是否可以预览标记
          filePreviewUrl: '', //预览文件url
          filePreviewCurrentId: '', //当前预览的文件resource_id
          filePreviewCurrentFileId: '', //当前预览的文件id
          filePreviewCurrentVersionId: '', //当前预览文件版本id
          filePreviewCurrentVersionList: [], //预览文件的版本列表
          filePreviewCurrentVersionKey: 0, //预览文件选中的key
          filePreviewCommits: [], //文件评论列表
          filePreviewPointNumCommits: [], //文件评论列表某个点的评论列表
          filePreviewCommitPoints: [], //文件图评点列表
          filePreviewCommitType: '0', //新增评论 1 回复圈点评论
          filePreviewCommitPointNumber: '', //评论当前的点
          filePreviewIsRealImage: true, //当前预览的图片是否真正图片
          seeFileInput: '', //查看文件详情入口
          cardCommentAll: [], //文件动态列表
          pdfDownLoadSrc: '', //pdf下载路径，如果有则open如果不是pdf则没有该路径，调用普通下载
    }
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen((location) => {

        const param = QueryString.parse(location.search.replace('?', ''))
        board_id = param.board_id
        appsSelectKey = param.appsSelectKey
        file_id = param.file_id
        folder_id = param.folder_id

        dispatch({
          type: 'updateDatas',
          payload: {
            filePreviewCurrentFileId: file_id
          }
        })

        if (location.pathname.indexOf('/technological/projectDetail') !== -1 && appsSelectKey == '4') {

          dispatch({
            type: 'getFolderList',
            payload: {
              board_id: board_id
            }
          })

          if(folder_id) {
            dispatch({
              type: 'getfolderInfo',
              payload: {
                folder_id
              }
            })
          }else {
            dispatch({
              type: 'initialget',
              payload: {
                id: board_id
              }
            })
          }
          if(file_id) {
            dispatch({
              type: 'previewFileByUrl',
              payload: {
                file_id,
              }
            })

            dispatch({
              type: 'getCardCommentListAll',
              payload: {
                id: file_id
              }
            })

          }

        }
      })
    },
  },
  effects: {
    //文档----------start
    * initialget({ payload }, { select, call, put }) {
      const { id } = payload
      let result = yield call(projectDetailInfo, id)
      if(isApiResponseOk(result)) {
        yield put({
          type: 'updateDatas',
          payload: {
            //文档需要数据初始化
            breadcrumbList: [{file_name: result.data.folder_name, file_id: result.data.folder_id, type: '1'}],
            currentParrentDirectoryId: result.data.folder_id,
          }
        })

        if(file_id) {
          yield put({
            type: 'fileInfoByUrl',
            payload: {
              file_id,
            }
          })
        } else {
          yield put({
            type: 'getFileList',
            payload: {
              folder_id: result.data.folder_id
            }
          })
        }
      }else{
      }
    },
    // 从url预览
    * previewFileByUrl({ payload }, { select, call, put }) {
      const { file_id } = payload
      let res = yield call(filePreviewByUrl, {id: file_id})
      yield put({
        type: 'updateDatas',
        payload: {
          isInOpenFile: true,
          seeFileInput: 'fileModule',
          filePreviewCurrentFileId: file_id,
          // filePreviewCurrentId: file_resource_id,
          // filePreviewCurrentVersionId: version_id
        }

      })
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            filePreviewIsUsable: res.data.isUsable,
            filePreviewUrl: res.data.url,
            filePreviewIsRealImage: res.data.isRealImage,
          }
        })
        const { file_id } = payload
        yield put({
          type: 'getPreviewFileCommits',
          payload: {
            id: file_id
          }
        })
        yield put({
          type: 'getFileCommitPoints',
          payload: {
            id: file_id
          }
        })

      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * fileInfoByUrl({ payload }, { select, call, put }) {
      const { file_id } = payload
      let res = yield call(fileInfoByUrl, {id: file_id})
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            filePreviewCurrentVersionList: res.data.version_list,
            filePreviewCurrentVersionId: res.data.version_list.length?res.data.version_list[0]['version_id']: '',
            filePreviewCurrentId: res.data.base_info.file_resource_id
          }
        })
        let breadcrumbList = yield select(selectBreadcrumbList) || []
        let arr = []
        const target_path = res.data.target_path
        //递归添加路径
        const digui = (name, data) => {
          if(data[name] && data['parent_id'] != '0') {
            arr.push({file_name: data.folder_name, file_id: data.id, type: '1'})
            digui(name, data[name])
          }
        }
        digui('parent_folder', target_path)
        const newbreadcrumbList = [].concat(breadcrumbList, arr.reverse())
        newbreadcrumbList.push({file_name: res.data.base_info.file_name, file_id: res.data.base_info.id, type: '2'})

        yield put({
          type: 'updateDatas',
          payload: {
            breadcrumbList: newbreadcrumbList
          }
        })
        yield put({
          type: 'getFileList',
          payload: {
            folder_id: newbreadcrumbList[newbreadcrumbList.length - 2].file_id // -2
          }
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * openFileInUrl({ payload }, { select, call, put }) {
      const { file_id, file_name } = payload
      yield put({
        type: 'routingJump',
        payload: {
          route: `/technological/projectDetail?board_id=${board_id}&appsSelectKey=${appsSelectKey}&file_id=${file_id}`
        }
      })

      yield put({
        type: 'updateDatas',
        payload: {
          fileName: file_name
        }
      })
    },
    * getfolderInfo({ payload }, { select, call, put }) {
      const { folder_id } = payload
      let res = yield call(fileInfoByUrl, {id: folder_id})
      if(isApiResponseOk(res)) {
        let breadcrumbList = yield select(selectBreadcrumbList) || []
        let arr = []
        const target_path = res.data.target_path
        //递归添加路径
        const digui = (name, data) => {
          if(data[name] && data['parent_id'] != '0') {
            arr.push({file_name: data.folder_name, file_id: data.id, type: '1'})
            digui(name, data[name])
          }
        }
        digui('parent_folder', target_path)
        const newbreadcrumbList = [].concat(breadcrumbList, arr.reverse())
        yield put({
          type: 'updateDatas',
          payload: {
            breadcrumbList: newbreadcrumbList
          }
        })
        yield put({
          type: 'getFileList',
          payload: {
            folder_id
          }
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    * getFileList({ payload }, { select, call, put }) {
      const { folder_id, calback } = payload
      let res = yield call(getFileList, {folder_id})
      if(isApiResponseOk(res)) {
        const filedata_1 = res.data.folder_data;
        for(let val of filedata_1) {
          val['file_name'] = val['folder_name']
          val['file_id'] = val['folder_id']
        }
        const filedata_2 = res.data.file_data;
        yield put({
          type: 'updateDatas',
          payload: {
            filedata_1,
            filedata_2,
            fileList: [...filedata_1, ...filedata_2]
          }
        })
        yield put({
          type: 'getFileType',
          payload: {
            file_id: folder_id,
            fileList: [...filedata_1, ...filedata_2]
          }
        })
        if (typeof calback === 'funciton') {
          calback()
        }
      }else{

      }
    },
    * getFolderList({ payload }, { select, call, put }) {
      const { board_id, calback } = payload
      let res = yield call(getFolderList, {board_id})
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            treeFolderData: res.data
          }
        })
        if (typeof calback === 'function') {
          calback()
        }
      }else{

      }
    },
    * filePreview({ payload }, { select, call, put }) {
      const { file_id } = payload
      const res = yield call(filePreview, {id: file_id})
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            filePreviewIsUsable: res.data.isUsable,
            filePreviewUrl: res.data.url,
            filePreviewIsRealImage: res.data.isRealImage,
          }
        })
        yield put({
          type: 'getPreviewFileCommits',
          payload: {
            id: file_id
          }
        })
        yield put({
          type: 'getFileCommitPoints',
          payload: {
            id: file_id
          }
        })

      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * getFilePDFInfo({ payload }, { select, call, put }) {
      //pdf做了特殊处理
      let res = yield call(getFilePDFInfo, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            filePreviewIsUsable: true,
            filePreviewUrl: res.data.edit_url,
            pdfDownLoadSrc: res.data.download_annotation_url,
            filePreviewIsRealImage: false,
          }
        })
        const { id } = payload // id = file_id
        yield put({
          type: 'getPreviewFileCommits',
          payload: {
            id: id
          }
        })
        yield put({
          type: 'getFileCommitPoints',
          payload: {
            id: id
          }
        })

      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },

    * fileUpload({ payload }, { select, call, put }) {
      let res = yield call(fileUpload, payload)
      if(isApiResponseOk(res)) {

      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * fileCopy({ payload }, { select, call, put }) {
      let res = yield call(fileCopy, payload)
      const currentParrentDirectoryId = yield select(selectCurrentParrentDirectoryId)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            selectedRowKeys: []
          }
        })
        yield put({
          type: 'getFileList',
          payload: {
            folder_id: currentParrentDirectoryId
          }
        })
        yield put({
          type: 'getFolderList',
          payload: {
            board_id: board_id,
            calback: function () {
              message.success('复制成功', MESSAGE_DURATION_TIME)
            }
          }
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * fileDownload({ payload }, { select, call, put }) {
      function openWin(url) {
        var element1 = document.createElement("a");
        element1.href= url;
        element1.id = 'openWin'
        document.querySelector('body').appendChild(element1)
        document.getElementById("openWin").click();//点击事件
        document.getElementById("openWin").parentNode.removeChild(document.getElementById("openWin"))
      }
      let res = yield call(fileDownload, payload)
      if(isApiResponseOk(res)) {
        const data = res.data
        if(data && data.length) {
          for (let val of data ) {
            // window.open(val)
            openWin(val)
          }
        }
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * fileRemove({ payload }, { select, call, put }) {
      let res = yield call(fileRemove, payload)
      const currentParrentDirectoryId = yield select(selectCurrentParrentDirectoryId)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            selectedRowKeys: []
          }
        })
        yield put({
          type: 'getFileList',
          payload: {
            folder_id: currentParrentDirectoryId
          }
        })
        yield put({
          type: 'getFolderList',
          payload: {
            board_id: board_id,
            calback: function () {
              message.success('已成功移入回收站', MESSAGE_DURATION_TIME)
            }
          }
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * fileMove({ payload }, { select, call, put }) {
      let res = yield call(fileMove, payload)
      const currentParrentDirectoryId = yield select(selectCurrentParrentDirectoryId)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            selectedRowKeys: []
          }
        })
        yield put({
          type: 'getFileList',
          payload: {
            folder_id: currentParrentDirectoryId
          }
        })
        yield put({
          type: 'getFolderList',
          payload: {
            board_id: board_id,
            calback: function () {
              message.success('移动成功', MESSAGE_DURATION_TIME)
            }
          }
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * fileVersionist({ payload }, { select, call, put }) {
      let res = yield call(fileVersionist, payload)
      const { isNeedPreviewFile, isPDF } = payload //是否需要重新读取文档
      const breadcrumbList = yield select(selectBreadcrumbList)
      const currentParrentDirectoryId = yield select(selectCurrentParrentDirectoryId)

      if(isApiResponseOk(res)) {
        breadcrumbList[breadcrumbList.length - 1] = res.data[0]
        yield put({
          type: 'updateDatas',
          payload: {
            filePreviewCurrentVersionList: res.data,
            breadcrumbList,
          }
        })
        if(isNeedPreviewFile) {
          if(!isPDF) {
            yield put({
              type: 'filePreview',
              payload: {
                id: res.data[0].file_resource_id,
                file_id: res.data[0].file_id
              }
            })
          }else {
            yield put({
              type: 'getFilePDFInfo',
              payload: {
                id: res.data[0].file_id,
              }
            })
          }
          yield put({
            type: 'getFileList',
            payload: {
              folder_id: currentParrentDirectoryId,
            }
          })
        }
      }else{

      }
    },
    * recycleBinList({ payload }, { select, call, put }) {
      let res = yield call(recycleBinList, payload)
      if(isApiResponseOk(res)) {

      }else{

      }
    },
    * deleteFile({ payload }, { select, call, put }) {
      let res = yield call(deleteFile, payload)
      if(isApiResponseOk(res)) {

      }else{

      }
    },
    * restoreFile({ payload }, { select, call, put }) {
      let res = yield call(restoreFile, payload)
      if(isApiResponseOk(res)) {

      }else{

      }
    },
    * addNewFolder({ payload }, { select, call, put }) {
      let res = yield call(addNewFolder, payload)
      const { parent_id } = payload
      if(isApiResponseOk(res)) {
        yield put({
          type: 'getFileList',
          payload: {
            folder_id: parent_id
          }
        })
        yield put({
          type: 'getFolderList',
          payload: {
            board_id: board_id,
            calback: function () {
              message.success('已成功添加文件夹', MESSAGE_DURATION_TIME)
            }
          }
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * updateFolder({ payload }, { select, call, put }) {
      let res = yield call(updateFolder, payload)
      if(isApiResponseOk(res)) {

      }else{

      }
    },
    * getPreviewFileCommits({ payload }, { select, call, put }) {
      const filePreviewCommitPointNumber = yield select(selectFilePreviewCommitPointNumber)
      const { type } = payload
      let name = type != 'point' ? 'filePreviewCommits':'filePreviewPointNumCommits'
      let res = yield call(getPreviewFileCommits, {...payload, point_number: type == 'point'?filePreviewCommitPointNumber: ''})

      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            [name]: res.data,
          }
        })
      }else{

      }
    },
    * getFileCommitPoints({ payload }, { select, call, put }) {
      let res = yield call(getFileCommitPoints, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            filePreviewCommitPoints: res.data,
          }
        })
      }else{

      }
    },
    * addFileCommit({ payload }, { select, call, put }) {
      let res = yield call(addFileCommit, payload)
      const { file_id, type, filePreviewCommitType = '0' } = payload
      //filePreviewCommitType 0 新增 1 回复
      if(isApiResponseOk(res)) {
        const flag = res.data.flag

        yield put({
          type: 'updateDatas',
          payload: {
            filePreviewCommitPointNumber: flag
          }
        })

        if(type == '1') {
          yield put({
            type: 'getPreviewFileCommits',
            payload: {
              id: file_id,
              type: 'point',
              point_number: flag
            }
          })
        }

        yield put({
          type: 'getPreviewFileCommits',
          payload: {
            id: file_id,
          }
        })

        yield put({
          type: 'getFileCommitPoints',
          payload: {
            id: file_id
          }
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)

      }
    },
    * deleteCommit({ payload }, { select, call, put }) {
      let res = yield call(deleteCommit, payload)
      const filePreviewCommitPointNumber = yield select(selectFilePreviewCommitPointNumber)
      const { file_id, type, point_number } = payload
      if(isApiResponseOk(res)) {
        yield put({
          type: 'getPreviewFileCommits',
          payload: {
            id: file_id,
          }
        })

        if(type === '1') {
          yield put({
            type: 'getPreviewFileCommits',
            payload: {
              id: file_id,
              type: 'point',
              point_number: filePreviewCommitPointNumber
            }
          })
        }
        yield put({
          type: 'getFileCommitPoints',
          payload: {
            id: file_id
          }
        })

      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)

      }
    },
    //获取文件详情的动态
    * getCardCommentListAll({payload}, {select, call, put}) {
      yield put({
        type: 'updateDatas',
        payload: {
          cardCommentAll: []
        }
      })
      let res = yield call(getCardCommentListAll, payload)
      yield put({
        type: 'updateDatas',
        payload: {
          cardCommentAll: res.data
        }
      })
    },

    * getFileType({payload}, {select, call, put}) {
      let { fileList, file_id } = payload
      let fileId = yield select(selectFilePreviewCurrentFileId)
      let res
      if(fileId) {
        res = fileList.reduce((r, c) => {
          return [
            ...r,
            ...(c.file_id === fileId?[c]:[])
          ]
        }, [])
      } else {
        res = fileList.reduce((r, c) => {
          return [
            ...r,
            ...(c.file_id === file_id?[c]:[])
          ]
        }, [])
      }

      if(res.length === 0) {
        yield put({
          type: 'updateDatas',
          payload: {
            fileType: ''
          }
        })
      }else {
        yield put({
          type: 'updateDatas',
          payload: {
            fileType: res[0].file_name?getSubfixName(res[0].file_name): ''
          }
        })
      }
    }
    //文档----------end
  },

  reducers: {
    updateDatas(state, action) {
      return {
        ...state,
        datas: { ...state.datas, ...action.payload },
      }
    }
  },
});
