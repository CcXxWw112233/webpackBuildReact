import { isApiResponseOk } from '../../../utils/handleResponseData'
import { message } from 'antd'
import { getSubfixName } from '../../../utils/businessFunction'
import {MESSAGE_DURATION_TIME, TASKS, PROJECTS, MEMBERS} from "../../../globalset/js/constant";
import { routerRedux } from "dva/router";
import {
  getFileCommitPoints, getPreviewFileCommits, addFileCommit, deleteCommit, getFileList, filePreview, fileCopy,
  fileDownload, saveAsNewVersion, fileRemove, fileMove, fileUpload, fileVersionist, recycleBinList, deleteFile, restoreFile,
  getFolderList, addNewFolder, updateFolder, getCardCommentListAll, fileInfoByUrl, getFilePDFInfo, setCurrentVersionFile,
  updateVersionFileDescription, fileConvertPdfAlsoUpdateVersion
} from '../../../services/technological/file'
import Cookies from "js-cookie";
import { workbench_selectFilePreviewCommitPointNumber, workbench_selectFilePreviewCurrentFileId, 
  workbench_selectFilePreviewCurrentVersionList, workbench_selectrUploadedFileList, workbench_selectBreadcrumbList,
  workbench_selectFilePreviewCurrentPreviewFileName, workbench_selectFilePreviewIsEntryCirclePreviewLoading, workbench_selectCurrentPreviewFileData
 } from './selects'
//状态说明：
//ProjectInfoDisplay ： 是否显示项目信息，第一次进来默认，以后点击显示隐藏

// appsSelectKey 项目详情里面应用的app标志
let actionReducer
export default {
  namespace: 'workbenchFileDetail',
  state: [{
  }],
  subscriptions: {
    setup({ dispatch, history }) {
      actionReducer = dispatch
      history.listen((location) => {
        if (location.pathname === '/technological/workbench' || location.pathname === '/technological/simplemode') {
          const initialData = () => {
            dispatch({
              type: 'updateDatas',
              payload: {
                seeFileInput: 'file', //看文件的入口
                currentParrentDirectoryId: '', //当前预览文件的文件夹id
                board_id: '',
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
                filePreviewIsRealImage: true, //当前预览的图片是否真正图片,
                pdfDownLoadSrc: '', //pdf下载路径，如果有则open如果不是pdf则没有该路径，调用普通下载

                breadcrumbList: [],
                isEntryCirclePreviewLoading: false


              }
            })
          }
          // initialData()
        }

      })
    },
  },
  effects: {
    * filePreview({ payload }, { select, call, put }) {
      const { file_id, file_resource_id } = payload
      yield put({
        type: 'fileInfoByUrl',
        payload: {
          file_id
        }
      })
      return
      const res = yield call(filePreview, {id: file_id})
      if(isApiResponseOk(res)) {
        // console.log(res, 'ssssssss')
        // return
        // yield put({
        //   type: 'updateDatas',
        //   payload: {
        //     filePreviewIsUsable: res.data.is_usable,
        //     filePreviewUrl: res.data.url,
        //     filePreviewIsRealImage: res.data.is_real_image,
        //     // filePreviewCurrentId: file_resource_id
        //     // filePreviewCurrentFileId: file_id
        //   }
        // })
        // yield put({
        //   type: 'getPreviewFileCommits',
        //   payload: {
        //     id: file_id
        //   }
        // })
        // yield put({
        //   type: 'getFileCommitPoints',
        //   payload: {
        //     id: file_id
        //   }
        // })
        yield put({
          type: 'fileInfoByUrl',
          payload: {
            file_id
          }
        })
      }else{
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    // 更新面包屑路径
    * updateBreadcrumbList({ payload }, { select, call, put }) {
      const { file_id } = payload
      let res = yield call(fileInfoByUrl, {id: file_id})
      if (isApiResponseOk(res)) {
        let arr = []
        let target_path = res.data.target_path
        //递归添加路径
        const digui = (name, data) => {
          if(data[name]) {
            arr.push({file_name: data.folder_name, file_id: data.id, type: '1'})
            digui(name, data[name])
          }else if(data['parent_id'] == '0'){
            arr.push({file_name: '根目录', file_id: data.id, type: '1'})
          }
        }
        digui('parent_folder', target_path)
        const newbreadcrumbList = arr.reverse()
        newbreadcrumbList.push({file_name: res.data.base_info.file_name, file_id: res.data.base_info.id, type: '2', folder_id: res.data.base_info.folder_id})
        yield put({
          type: 'updateDatas',
          payload: {
            breadcrumbList: newbreadcrumbList
          }
        })
      }
    },

    * fileInfoByUrl({ payload }, { select, call, put }) {
      const { file_id } = payload
      let res = yield call(fileInfoByUrl, {id: file_id})
      if(isApiResponseOk(res)) {
        // console.log(res, 'ssssssss_1111')
        // return
        // let breadcrumbList = []
        // let arr = []
        // const target_path = res.data.target_path
        // //递归添加路径
        // const digui = (name, data) => {
        //   if(data[name]) {
        //     arr.push({file_name: data.folder_name, file_id: data.id, type: '1'})
        //     digui(name, data[name])
        //   }else if(data['parent_id'] == '0'){
        //     arr.push({file_name: '根目录', file_id: data.id, type: '1'})
        //   }
        // }
        // digui('parent_folder', target_path)
        // const newbreadcrumbList = arr.reverse()
        // newbreadcrumbList.push({file_name: res.data.base_info.file_name, file_id: res.data.base_info.id, type: '2', folder_id: res.data.base_info.folder_id})
        yield put({
          type: 'updateDatas',
          payload: {
            // breadcrumbList: newbreadcrumbList,
            currentPreviewFileData: res.data.base_info,
            filePreviewIsUsable: res.data.preview_info.is_usable,
            filePreviewUrl: res.data.preview_info.url,
            filePreviewIsRealImage: res.data.preview_info.is_real_image,
            currentPreviewFileName: res.data.base_info.file_name
          }
        })
        yield put({
          type: 'updateBreadcrumbList',
          payload: {
            file_id: res.data.base_info.id,
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
      const { id } = payload // id = file_id
      let fileListData = yield select(workbench_selectCurrentPreviewFileData)
      let res = yield call(getFilePDFInfo, payload)
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            filePreviewIsUsable: true,
            filePreviewUrl: res.data.edit_url,
            pdfDownLoadSrc: res.data.download_annotation_url,
            filePreviewIsRealImage: false,
            currentPreviewFileData: { ...fileListData, id: id }
          }
        })
        yield put({
          type: 'updateBreadcrumbList',
          payload: {
            file_id: id
          }
        })
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
    
    // 另存为 - 保存为新版本
    *saveAsNewVersion({ payload }, { select, call, put }){
        let res = yield call(saveAsNewVersion, payload)
        if(isApiResponseOk(res)) {
          const data = res.data
            const version_id = data.version_id;
            setTimeout(() => {
              message.success('保存为新版本成功', MESSAGE_DURATION_TIME)
            }, 200)
            yield put({
              type: 'workbenchFileDetail/fileVersionist',
              payload: {
                version_id: version_id, //file_id,
                isNeedPreviewFile: false,
              }
            })
            yield put({
              type: 'updateDatas',
              payload: {
                filePreviewCurrentFileId: data.id
              }
            })
            // return data;
        }else{
          message.warn(res.message, MESSAGE_DURATION_TIME)
        }
    },

    * fileVersionist({ payload }, { select, call, put }) {
      const { isNeedPreviewFile, isPDF, file_id, calback, version_id } = payload //是否需要重新读取文档
      let res = yield call(fileVersionist, {file_id, version_id})
      // console.log(payload, 'sss_worek')
      let new_breadcrumbList = yield select(workbench_selectBreadcrumbList)
      new_breadcrumbList = new_breadcrumbList || []
      const filePreviewCurrentFileId = yield select(workbench_selectFilePreviewCurrentFileId)
      // console.log(res.data, 'ssssss')
      let temp_list = [...res.data]
      // console.log(temp_list, 'sssss')
      let temp_arr = []
      let default_arr = []
      for (let val of temp_list) {
        if (val['file_id'] == file_id) {
          // console.log(val, 'ssssss')
          temp_arr.unshift(val)
        }
        if (val['file_id'] == filePreviewCurrentFileId) { // 如果说当前版本是主版本的默认选项
          default_arr.push(val)
        }
      }
      // console.log(temp_arr, default_arr, 'sssss')
      if(isApiResponseOk(res)) {
        if(new_breadcrumbList.length) {
          new_breadcrumbList[new_breadcrumbList.length - 1] = temp_arr && temp_arr.length ? temp_arr[0] : default_arr[0]
        }
        // console.log(res.data, 'sssssssss')
        yield put({
          type: 'updateDatas',
          payload: {
            filePreviewCurrentVersionList: res.data,
            breadcrumbList: new_breadcrumbList,
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
        }
        yield put({
          type: 'workbench/getUploadedFileList',
          payload: {

          }
        })
        
      }else{

      }
    },
    * getPreviewFileCommits({ payload }, { select, call, put }) {
      const filePreviewCommitPointNumber = yield select(workbench_selectFilePreviewCommitPointNumber)
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
      const filePreviewCommitPointNumber = yield select(workbench_selectFilePreviewCommitPointNumber)
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
    // 设为当前版本
    * setCurrentVersionFile({ payload }, { select, call, put }) {
      // console.log(payload, 'ssssss')
      const { id, set_major_version, version_id, file_name, isNeedPreviewFile } = payload
      let res = yield call(setCurrentVersionFile, { id, set_major_version })
      // const new_fileList = yield select(workbench_selectrUploadedFileList)
      // const new_filePreviewId= yield select(workbench_selectFilePreviewCurrentFileId)
      // const new_filePreviewCurrentVersionList = yield select(workbench_selectFilePreviewCurrentVersionList)
      if (isApiResponseOk(res)) {
        // console.log(res, 'ssssss')
        yield put({
          type: 'fileVersionist',
          payload: {
            version_id: version_id,
            file_id: id,
            isNeedPreviewFile: isNeedPreviewFile, 
          }
        })
       
        // let temp_arr = [] // 用来保存当前要替换的版本列表的一条信息
        // for(let val of new_filePreviewCurrentVersionList) {
        //   if (val['file_id'] == new_filePreviewId) {
        //     temp_arr.push(val)
        //   }
        // }
        // let temp_obj = temp_arr[0] // 这个是用来保存得到当前的元素对象
        // 需要做的操作是在 new_fileList 里面去查询到这条元素然后替换
        // 需要根据工作台的条件来进行切换
        
        // yield put({
        //   type: 'workbench/updateDatas',
        //   payload: {
        //     fileList: temp_list
        //   }
        // })
       
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    // 文件版本更新描述
    * updateVersionFileDescription({ payload }, { select, call, put }) {
      // console.log(payload, 'sssss')
      let res = yield call(updateVersionFileDescription, payload)
      if (isApiResponseOk(res)) {
        // console.log(res, 'ssssss')
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    },
    * routingJump({ payload }, { call, put }) {
      const { route } = payload
      yield put(routerRedux.push(route));
    },
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
      let { file_id, calback } = payload
      let res = yield call(fileInfoByUrl, {id: file_id})
      // debugger
      if(isApiResponseOk(res)) {
        yield put({
          type: 'updateDatas',
          payload: {
            fileType: getSubfixName(res.data.base_info.file_name)
          }
        })
        if(calback && typeof calback == 'function') {
          calback(res.data)
        }
      }
     
      // let  res = fileList.reduce((r, c) => {
      //     return [
      //       ...r,
      //       ...(c.file_id === file_id?[c]:[])
      //     ]
      //   }, [])

      // if(res.length === 0) {
      //   yield put({
      //     type: 'updateDatas',
      //     payload: {
      //       fileType: ''
      //     }
      //   })
      // }else {
      //   yield put({
      //     type: 'updateDatas',
      //     payload: {
      //       fileType: res[0].file_name?getSubfixName(res[0].file_name): ''
      //     }
      //   })
      // }
    },

    // 圈评转换pdf并且设置为新版本
    * fileConvertPdfAlsoUpdateVersion({payload}, {select, call, put}) {
      // const timer = setTimeout(() => {
      //   actionReducer({
      //     type: 'updateDatas',
      //     payload: {
      //       isEntryCirclePreviewLoading: true
      //     }
      //   })
      // }, 2000)
      const { id } = payload
      let fileName = getSubfixName(yield select(workbench_selectFilePreviewCurrentPreviewFileName))
      let is_loading = yield select(workbench_selectFilePreviewIsEntryCirclePreviewLoading)
      let fileListData = yield select(workbench_selectCurrentPreviewFileData)
      const supportFileTypeArray = ['.xlsx', '.xls', '.doc', '.docx', '.ppt', '.pptx', '.png', '.txt']
      // [png,gif,jpg,jpeg,tif,bmp,ico]
      const supportPictureFileTypeArray = ['.png', '.gif', '.jpg', '.jpeg', '.tif', '.bmp', '.ico']
      if (is_loading) return
      if (supportFileTypeArray.indexOf(fileName) != -1 || supportPictureFileTypeArray.indexOf(fileName) != -1) { // 表示存在
        let res = yield call(fileConvertPdfAlsoUpdateVersion, {id})
        if (isApiResponseOk(res)) {
          let isPDF = getSubfixName(res.data.file_name) == '.pdf'
          if (isPDF) {
            yield put({
              type: 'getFilePDFInfo',
              payload: {
                id: res.data.id
              }
            })
            yield put({
              type: 'setCurrentVersionFile',
              payload: {
                set_major_version: '1',
                id: res.data.id,
                version_id: res.data.version_id,
                isNeedPreviewFile: false,
              }
            })
            yield put({
              type: 'getFileType',
              payload: {
                file_id: res.data.id
              }
            })
            yield put({
              type: 'updateDatas',
              payload: {
                filePreviewCurrentFileId: res.data.id,
                currentPreviewFileData: { ...fileListData, id: res.data.id },
                currentPreviewFileName: res.data.file_name
              }
            })
            // setTimeout(() => {
            //   message.success('进入圈评成功')
            // }, 500);
          } else {
            yield put({
              type: 'fileInfoByUrl',
              payload: {
                file_id: res.data.id
              }
            })
          }
          // clearTimeout(timer)
          // yield put({
          //   type: 'updateDatas',
          //   payload: {
          //     isEntryCirclePreviewLoading: false
          //   }
          // })
        } else {
          message.warn(res.message, MESSAGE_DURATION_TIME)
          if (res.code == 4047) { // 表示转换失败
            message.error(res.message, MESSAGE_DURATION_TIME)
          }
        }
        return res || {}
      } else {
        message.warn('暂不支持该格式转换', MESSAGE_DURATION_TIME)
      }
    }
  },

  reducers: {
    updateDatas(state, action) {
      return {
        ...state,
        datas: { ...state.datas, ...action.payload },
      }
    }
  },
};
