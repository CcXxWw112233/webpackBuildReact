
import { message } from 'antd'
import { MEMBERS, MESSAGE_DURATION_TIME, ORGANIZATION } from "../../../globalset/js/constant";
import { routerRedux } from "dva/router";
import Cookies from "js-cookie";
import { initWs } from '../../../components/WsNewsDynamic'
import QueryString from 'querystring'
import {
  selectDrawContent,
  selectCardId,
  selectTaskGroupList,
  selectGetTaskGroupListArrangeType,
  selectProjectDetailBoardId,
  selectCurrentProcessTemplateList,
  selectCurrentProcessList,
  selectCurrentProcessInstanceId,
  selectCurrentParrentDirectoryId,
  selectFileList,
  selectFilePreviewCurrentFileId,
  selectFilePreviewCommits,
  selectFilePreviewPointNumCommits,
  selectFilePreviewCommitPointNumber,
  filePreviewCommitPoints,
  selectFilePreviewCommitPoints,
  selectProjectDetailInfoData,
  selectProcessDoingList,
  selectProcessPageFlagStep
} from './../select'
import {
  workbench_selectProjectList,
  workbench_selectDrawContent,
  workbench_selectCard_id,
  workbench_selectrResponsibleTaskList,
  workbench_selectrMeetingLsit,
  workbench_selectrBackLogProcessList,
  workbench_selectrUploadedFileList,
  workbench_selectFilePreviewCurrentFileId,
  workbench_selectBreadcrumbList,
  workbench_selectFileList,
  workbench_selectFilePreviewCommits,
  workbench_selectFilePreviewPointNumCommits,
  workbench_selectFilePreviewCommitPoints,
  workbench_selectFilePreviewCommitPointNumber,
  workbench_currentProcessInstanceId,
} from '../workbench/selects'
import { getModelSelectState, getModelSelectDatasState } from '../../utils'

//定义model名称
const model_project = name => `project/${name}`
const model_projectDetail = name => `projectDetail/${name}`
const model_projectDetailTask = name => `projectDetailTask/${name}`
const model_projectDetailFile = name => `projectDetailFile/${name}`
const model_projectDetailProcess = name => `projectDetailProcess/${name}`
const model_workbench = name => `workbench/${name}`
const model_technological = name => `technological/${name}`
const model_newsDynamic = name => `newsDynamic/${name}`
const model_workbenchTaskDetail = name => `workbenchTaskDetail/${name}`
const model_workbenchFileDetail = name => `workbenchFileDetail/${name}`
const model_workbenchPublicDatas = name => `workbenchPublicDatas/${name}`
const model_workbenchDetailProcess = name => `workbenchDetailProcess/${name}`

//消息推送model
let dispathes = null
let locationPath = null
export default {
  namespace: 'cooperationPush',
  state: [],
  subscriptions: {
    setup({ dispatch, history }) {
      dispathes = dispatch
      history.listen((location) => {
        locationPath = location.pathname
        message.destroy()
        //头部table key
        // if (location.pathname.indexOf('/technological') !== -1 || true) {
        //   //websocket连接判定
        //   setTimeout(function () {
        //     // console.log('1111', Cookies.get('wsLinking'))
        //     if(Cookies.get('wsLinking') === 'false' || !Cookies.get('wsLinking')){
        //       const calback = function (event) {
        //         dispatch({
        //           type: 'connectWsToModel',
        //           payload: {
        //             event
        //           }
        //         })
        //       }
        //       initWs(calback)
        //     }
        //     // const calback = function (event) {
        //     //   dispatch({
        //     //     type: 'connectWsToModel',
        //     //     payload: {
        //     //       event
        //     //     }
        //     //   })
        //     // }
        //     // initWs(calback)
        //   }, 3000)
        //   //页面移出时对socket和socket缓存的内容清除
        //   window.onload = function () {
        //     Cookies.set('wsLinking', 'false', {expires: 30, path: ''})
        //     localStorage.removeItem(`newMessage`)
        //   }
        // }

      })
    },
  },
  effects: {
    * connectWsToModel({ payload }, { call, put }) {
      const { event } = payload
      if (!event) {
        return
      }
      let data = event.data;
      //服务器端回复心跳内容
      if (data == "pong") {
        return;
      }
      //当前操作人
      data = JSON.parse(data)
      const news = data['data'][1] || {}
      const news_d = JSON.parse(news['d'] || '{}')
      const { creator = {}, org_id } = news_d
      const creator_id = creator['id']
      const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
      const user_id = userInfo['id']
      const { current_org = {} } = userInfo
      const current_org_id = current_org['id']
      // if(creator_id == user_id || current_org_id != org_id) {
      //   return false
      // }
      if (creator_id == user_id) {
        return false
      }
      let handleType = 'handleWsData_board_detail'
      if (locationPath.indexOf('technological/workbench') != -1) {
        handleType = 'handleWsData_workbench'
      } else if (locationPath.indexOf('technological/projectDetail') != -1) {
        handleType = 'handleWsData_board_detail'
      } else if (locationPath.indexOf('technological/project') != -1) {
        handleType = 'handleWsData_board_list'
      } else if (locationPath.indexOf('/technological/simplemode/workbench') != -1) {
        handleType = 'simpleModeCooperate/handleSimpleModeCooperate'
      }
      yield put({
        type: handleType,
        payload: {
          res: data
        }
      })
      yield put({
        type: 'handleWsData_public',
        payload: {
          res: data
        }
      })
    },

    * handleWsData_board_detail({ payload }, { call, put, select }) {
      const { res } = payload
      const { data } = res
      // console.log('eee', data)
      //当前查看项目的项目id
      const currentProjectBoardId = yield select(selectProjectDetailBoardId)

      let coperate = data[0] //协作
      let news = data[1] //消息
      //获取消息协作类型
      const coperateName = coperate.e
      const coperateType = coperateName.substring(0, coperateName.indexOf('/'))
      let coperateData = JSON.parse(coperate.d)

      // console.log('eee_name',coperateName)
      // console.log('eee_coperateData',coperateData)

      const getAfterNameId = (coperateName) => { //获取跟在名字后面的id
        return coperateName.substring(coperateName.indexOf('/') + 1)
      }

      // 03.13
      //  'change:cards',增加子任务
      // delete:cards， 删除子任务
      // change:card 改变任务

      let board_id_ //推送中返回来的board_id
      switch (coperateType) {
        case 'change:board':
          let op_board_id = getAfterNameId(coperateName)
          let is_deleted_ = coperateData['is_deleted']
          if (op_board_id == currentProjectBoardId) {
            if (is_deleted_ == '0') {
              let projectDetailInfoData = yield select(selectProjectDetailInfoData)
              projectDetailInfoData = { ...projectDetailInfoData, ...coperateData }
              dispathes({
                type: model_projectDetail('updateDatas'),
                payload: {
                  projectDetailInfoData
                }
              })
            } else if (is_deleted_ == '1') {
              message.warn('当前项目已被删除')
            }

          }
          break
        case 'change:card': //监听到修改任务
          const drawContent = yield select(selectDrawContent)
          const card_id = yield select(selectCardId)
          id_arr_ = getAfterNameId(coperateName).split('/')
          parent_card_id = id_arr_[0]
          const child_card_id = id_arr_[1]
          let taskGroupList_ = yield select(selectTaskGroupList)

          let is_archived_ = coperateData['is_archived']

          if (is_archived_ == '1') { //归档
            for (let i = 0; i < taskGroupList_.length; i++) {
              for (let j = 0; j < taskGroupList_[i]['card_data'].length; j++) {
                if (parent_card_id == taskGroupList_[i]['card_data'][j]['card_id']) {
                  taskGroupList_[i]['card_data'].splice(j, 1)
                  break
                }
              }
            }
          }
          //如果当前查看的任务和推送的任务id一样，会发生更新
          if (card_id == parent_card_id) {
            if (is_archived_ == '1') {
              dispathes({
                type: model_projectDetailTask('updateDatas'),
                payload: {
                  drawerVisible: false
                }
              })
            }

            if (!child_card_id) { //父任务
              dispathes({
                type: model_projectDetailTask('updateDatas'),
                payload: {
                  drawContent: { ...drawContent, ...coperateData }
                }
              })

            } else { //子任务

              for (let i = 0; i < drawContent['child_data'].length; i++) {
                if (drawContent['child_data'][i]['card_id'] == child_card_id) {
                  drawContent['child_data'][i] = { ...drawContent['child_data'][i], ...coperateData['child_data'][0] }
                  break
                }
              }

              dispathes({
                type: model_projectDetailTask('updateDatas'),
                payload: {
                  drawContent: drawContent
                }
              })
              // for(let i = 0; i < taskGroupList.length; i++ ) {
              //   if(list_id === taskGroupList[i]['list_id']){ //匹配到list_id
              //     //如果某一列里面有完成的任务，则在完成的任务前面增加一条，否则直接往后塞
              //     let is_has_realize = false
              //     for(let j = 0; j < taskGroupList[i]['card_data'].length; j++) {
              //       if(taskGroupList[i]['card_data'][j]['card_id'] == parent_card_id) {
              //         taskGroupList[i]['card_data'][j]['child_data'].push(coperateData['child_data'][0])
              //         break
              //       }
              //     }
              //
              //     break
              //   }
              // }

            }
          }
          dispathes({
            type: model_projectDetailTask('updateDatas'),
            payload: {
              taskGroupList: taskGroupList_
            }
          })
          break
        case 'change:cards':
          let taskGroupList = yield select(selectTaskGroupList)
          let drawContent_ = yield select(selectDrawContent)
          let card_id_ = yield select(selectCardId)
          let id_arr_ = getAfterNameId(coperateName).split('/')
          let board_id_ = id_arr_[0]
          let list_id = id_arr_[1]
          let parent_card_id = id_arr_[2] //如果有则是添加子任务
          let { is_archived, is_deleted } = coperateData
          if (is_archived == '1' || is_deleted == '1') {

          }
          if (board_id_ == currentProjectBoardId) { //当前查看的项目
            if (parent_card_id) { //二级任务
              if (parent_card_id == card_id_) {
                drawContent_['child_data'].push(coperateData['child_data'][0])
              }
              for (let i = 0; i < taskGroupList.length; i++) {
                if (list_id === taskGroupList[i]['list_id']) { //匹配到list_id
                  //如果某一列里面有完成的任务，则在完成的任务前面增加一条，否则直接往后塞
                  let is_has_realize = false
                  for (let j = 0; j < taskGroupList[i]['card_data'].length; j++) {
                    if (taskGroupList[i]['card_data'][j]['card_id'] == parent_card_id) {
                      taskGroupList[i]['card_data'][j]['child_data'].push(coperateData['child_data'][0])
                      break
                    }
                  }

                  break
                }
              }

            } else { //一级任务
              for (let i = 0; i < taskGroupList.length; i++) {
                if (list_id === taskGroupList[i]['list_id']) { //匹配到list_id
                  //如果某一列里面有完成的任务，则在完成的任务前面增加一条，否则直接往后塞
                  let is_has_realize = false
                  for (let j = 0; j < taskGroupList[i]['card_data'].length; j++) {
                    if (taskGroupList[i]['card_data'][j]['is_realize'] == '1') {
                      is_has_realize = true
                      taskGroupList[i]['card_data'].splice(j, 0, coperateData)
                      break
                    }
                  }
                  if (!is_has_realize) {
                    taskGroupList[i]['card_data'].push(coperateData)
                  }
                  break
                }
              }
            }
          }

          dispathes({
            type: model_projectDetailTask('updateDatas'),
            payload: {
              taskGroupList,
              drawContent: drawContent_
            }
          })
          break
        case 'delete:cards':
          id_arr_ = getAfterNameId(coperateName).split('/')
          taskGroupList = yield select(selectTaskGroupList)
          drawContent_ = yield select(selectDrawContent)
          board_id_ = id_arr_[0]
          list_id = id_arr_[1]
          parent_card_id = id_arr_[2]
          let op_card_id = coperateData['card_id']
          if (board_id_ == currentProjectBoardId) { //当前查看的项目
            if (!parent_card_id) { //删除父类任务
              for (let i = 0; i < taskGroupList.length; i++) {
                if (list_id == taskGroupList[i]['list_id']) {
                  for (let j = 0; j < taskGroupList[i]['card_data'].length; j++) {
                    if (op_card_id == taskGroupList[i]['card_data'][j]['card_id']) {
                      taskGroupList[i]['card_data'].splice(j, 1)
                      break
                    }
                  }
                  break
                }
              }
            } else { //删除子类任务
              for (let i = 0; i < taskGroupList.length; i++) {
                if (list_id == taskGroupList[i]['list_id']) {
                  for (let j = 0; j < taskGroupList[i]['card_data'].length; j++) {
                    if (parent_card_id == taskGroupList[i]['card_data'][j]['card_id']) {
                      for (let k = 0; k < taskGroupList[i]['card_data'][j]['child_data'].length; k++) {
                        if (op_card_id == taskGroupList[i]['card_data'][j]['child_data'][k]['card_id']) {
                          taskGroupList[i]['card_data'][j]['child_data'].splice(k, 1)
                          break
                        }
                      }
                      break
                    }
                  }
                  break
                }
              }

              for (let i = 0; i < drawContent_['child_data'].length; i++) {
                if (op_card_id == drawContent_['child_data'][i]['card_id']) {
                  drawContent_['child_data'].splice(i, 1)
                  break
                }
              }
            }
          }
          dispathes({
            type: model_projectDetailTask('updateDatas'),
            payload: {
              taskGroupList,
              drawContent: drawContent_
            }
          })
          break
        case 'change:card:list':
          taskGroupList = yield select(selectTaskGroupList)
          board_id_ = getAfterNameId(coperateName)
          is_deleted = coperateData['is_deleted']
          let op_list_id = coperateData['list_id']
          if (board_id_ !== currentProjectBoardId) {
            if (is_deleted == '0') { //增加列表或修改列表
              //如果时修改则替换，如果时增加则push
              let is_has_list = false
              for (let i = 0; i < taskGroupList.length; i++) {
                if (op_list_id == taskGroupList[i]['list_id']) {
                  is_has_list = true
                  taskGroupList[i] = coperateData
                  break
                }
              }
              if (!is_has_list) {
                taskGroupList.push(coperateData)
              }
            } else if (is_deleted == '1') { //删除列表
              for (let i = 0; i < taskGroupList.length; i++) {
                if (op_list_id == taskGroupList[i]['list_id']) {
                  taskGroupList.splice(i, 1)
                  break
                }
              }
            } else {

            }
          }
          dispathes({
            type: model_projectDetailTask('updateDatas'),
            payload: {
              taskGroupList
            }
          })

          break
        case 'change:flow:template': //新增流程模板
          board_id_ = getAfterNameId(coperateName)
          if (board_id_ == currentProjectBoardId) {
            const processTemplateList = yield select(selectCurrentProcessTemplateList)
            processTemplateList.push(coperateData)
            dispathes({
              type: model_projectDetailProcess('updateDatas'),
              payload: {
                processTemplateList
              }
            })
          }
          break
        case 'delete:flow:template': //删除流程模板
          board_id_ = getAfterNameId(coperateName)
          if (board_id_ == currentProjectBoardId) {
            const processTemplateList = yield select(selectCurrentProcessTemplateList)
            const processTemplateList_New = [...processTemplateList]
            let template_id = coperateData['id']
            for (let i = 0; i < processTemplateList_New.length; i++) {
              if (template_id == processTemplateList_New[i]['id']) {
                processTemplateList_New.splice(i, 1)
                break
              }
            }
            dispathes({
              type: model_projectDetailProcess('updateDatas'),
              payload: {
                processTemplateList: processTemplateList_New
              }
            })
          }
          break
        case 'change:flow:instance':
          board_id_ = coperateData['board_id']
          if (board_id_ == currentProjectBoardId) {
            const processDoingList = yield select(selectProcessDoingList)
            processDoingList.unshift(coperateData)
            dispathes({
              type: model_projectDetailProcess('updateDatas'),
              payload: {
                processDoingList
              }
            })
          }
          break
        case 'change:flow':
          const currentProcessInstanceId = yield select(selectCurrentProcessInstanceId)
          const processPageFlagStep = yield select(selectProcessPageFlagStep) //1为编辑界面，编辑界面不更新
          const flow_id = getAfterNameId(coperateName)
          // debugger
          if (currentProcessInstanceId == flow_id && processPageFlagStep == '4') {
            const curr_node_id = coperateData.curr_node_id
            let curr_node_sort
            for (let i = 0; i < coperateData.nodes.length; i++) {
              if (curr_node_id === coperateData.nodes[i].id) {
                curr_node_sort = coperateData.nodes[i].sort
                break
              }
            }
            curr_node_sort = curr_node_sort || coperateData.nodes.length + 1 //如果已全部完成了会是一个undefind,所以给定一个值
            dispathes({
              type: model_projectDetailProcess('updateDatas'),
              payload: {
                processInfo: { ...coperateData, curr_node_sort },
                processEditDatas: coperateData.nodes || [],
              }
            })
          }

          break
        case 'change:file':
          const currentParrentDirectoryId = yield select(selectCurrentParrentDirectoryId)
          const directoryId = getAfterNameId(coperateName)
          //当当前的文件夹id 和操作的文件id的所属文件夹id 一样
          if (currentParrentDirectoryId == directoryId) {
            const fileList = yield select(selectFileList)
            const fileType = coperateData.type

            const { status } = coperateData
            //status 2删除
            if (status == '2') {
              const { id } = coperateData
              for (let i = 0; i < fileList.length; i++) {
                if (fileList[i]['file_id'] == id) {
                  fileList.splice(i, 1)
                  break
                }

              }
            } else {
              //fileType 2 表示新增文件 1 表示新增文件夹
              //处理数据结构根据projectDetailFile =》 getFileList方法
              if (fileType == '2') {
                fileList.push(coperateData)
                dispathes({
                  type: model_projectDetailFile('updateDatas'),
                  payload: {
                    fileList
                  }
                })
              } else if (fileType == '1') {
                //先文件夹后文件
                const obj = { ...coperateData, file_name: coperateData['folder_name'], file_id: coperateData['folder_id'] }
                for (let i = 0; i < fileList.length; i++) {
                  if (fileList[i].type == '2') {
                    if (i > 0) {
                      fileList.splice(i, 0, obj)
                    } else {
                      fileList.unshift(obj)
                    }
                    break
                  }
                }
              }
            }
            dispathes({
              type: model_projectDetailFile('updateDatas'),
              payload: {
                fileList
              }
            })

          }
          break
        case 'change:file:comment':
          const comment_file_id = getAfterNameId(coperateName)
          let file_id = yield select(selectFilePreviewCurrentFileId)
          if (comment_file_id == file_id) { //如果推送评论的文档id和查看的id是一样
            const filePreviewCommits = yield select(selectFilePreviewCommits) || []
            const filePreviewPointNumCommits = yield select(selectFilePreviewPointNumCommits) || []
            const filePreviewCommitPointNumber = yield select(selectFilePreviewCommitPointNumber) || []
            const filePreviewCommitPoints = yield select(selectFilePreviewCommitPoints) || []

            let pointNo = coperateData['flag']
            if (pointNo) { //圈评
              if (pointNo == filePreviewCommitPointNumber) { //如果是当前圈评的这个点
                filePreviewPointNumCommits.push(coperateData)
              } else {
                let isHasPoint = false
                //如果没有这个点，则添加这个点
                for (let i = 0; i < filePreviewCommitPoints.length; i++) {
                  if (filePreviewCommitPoints[i]['flag'] == pointNo) {
                    isHasPoint = true
                    break
                  }
                }
                if (!isHasPoint) {
                  filePreviewCommitPoints.push(coperateData)
                }
              }
            }
            filePreviewCommits.push(coperateData)
            dispathes({
              type: model_projectDetailFile('updateDatas'),
              payload: {
                filePreviewCommits,
                filePreviewPointNumCommits,
                filePreviewCommitPoints
              }
            })
          }
          break
        case 'change:file:comment:delete':
          let commitId = getAfterNameId(coperateName)
          const filePreviewCommits = yield select(selectFilePreviewCommits) || []
          const filePreviewPointNumCommits = yield select(selectFilePreviewPointNumCommits) || []
          const filePreviewCommitPointNumber = yield select(selectFilePreviewCommitPointNumber) || []
          const filePreviewCommitPoints = yield select(selectFilePreviewCommitPoints) || []

          //删除点 存在最后一条is_last和点flag
          let flag_ = coperateData['flag']
          let is_last = coperateData['is_last']
          if (flag_ && is_last == '1') {
            for (let i = 0; i < filePreviewCommitPoints.length; i++) {
              if (filePreviewCommitPoints[i]['flag'] == flag_) {
                filePreviewCommitPoints.splice(i, 1)
                break
              }
            }
          }

          if (filePreviewPointNumCommits) { //处理点的评论
            for (let i = 0; i < filePreviewPointNumCommits.length; i++) {
              if (filePreviewPointNumCommits[i]['id'] == commitId) {
                filePreviewPointNumCommits.splice(i, 1)
                break
              }
            }
          }

          if (filePreviewCommits) { //处理整体评论
            for (let i = 0; i < filePreviewCommits.length; i++) {
              if (filePreviewCommits[i]['id'] == commitId) {
                filePreviewCommits.splice(i, 1)
                break
              }
            }
          }

          dispathes({
            type: model_projectDetailFile('updateDatas'),
            payload: {
              filePreviewCommits,
              filePreviewPointNumCommits,
              filePreviewCommitPoints
            }
          })
          break
        case 'change:file:operation':
          let ids = getAfterNameId(coperateName)
          let idArr = ids.split('/')
          let fileList_ = yield select(selectFileList)
          let folder_id = yield select(selectCurrentParrentDirectoryId)
          let coFileList = coperateData['file_list']
          if (idArr.length == 1) { //复制
            if (idArr[0] == folder_id) {
              fileList_ = [].concat(fileList_, coFileList)
            }
          } else if (idArr.length == 2) { //移动
            if (idArr[0] != idArr[1]) { ////移入的文件和移除的文件夹不是同一个
              if (idArr[1] == folder_id) { //当前文件夹有文件移除
                for (let i = 0; i < fileList_.length; i++) {
                  for (let j = 0; j < coFileList.length; j++) {
                    if (fileList_[i]['file_id'] == coFileList[j]['file_id']) {
                      fileList_.splice(i, 1)
                      break
                    }

                  }
                }
              } else if (idArr[0] == folder_id) { //当前文件夹有文件移进
                fileList_ = [].concat(fileList_, coFileList)
              }

            }
          } else {

          }
          dispathes({
            type: model_projectDetailFile('updateDatas'),
            payload: {
              fileList: fileList_
            }
          })

          break
        //添加里程碑
        case 'add:milestone':
          board_id_ = getAfterNameId(coperateName)
          if (board_id_ == currentProjectBoardId) {
            dispathes({
              type: 'projectDetail/updateDatas',
              payload: {
                milestoneList: coperateData['milestoneList']
              }
            })
          }
          break
        //修改里程碑
        case 'change:milestone':
          //当前的里程碑id和返回的里程碑id对应上
          let milestone_id = yield select(getModelSelectState('milestoneDetail', 'milestone_id'))
          let milestone_detail = yield select(getModelSelectState('milestoneDetail', 'milestone_detail'))
          let milestone_list = yield select(getModelSelectDatasState('projectDetail', 'milestoneList'))
          let cope_milestone_id = getAfterNameId(coperateName)
          //更新里程碑详情
          if (milestone_id == cope_milestone_id) {
            dispathes({
              type: 'milestoneDetail/updateDatas',
              payload: {
                milestone_detail: { ...milestone_detail, ...coperateData }
              }
            })
            // debugger
          }
          //如果是项目id匹配上了，则更新里程碑列表
          board_id_ = coperateData['board_id']
          if (board_id_ == currentProjectBoardId) {
            const new_miletone_list = milestone_list.map(item => {
              let new_item = { ...item }
              const { id } = item
              if (id == cope_milestone_id) {
                new_item = { ...item, ...coperateData }
              }
              return new_item
            })
            dispathes({
              type: 'projectDetail/updateDatas',
              payload: {
                milestoneList: new_miletone_list
              }
            })
          }
          break
        //里程碑关联任务
        case 'add:milestone:content':
          //当前的里程碑id和返回的里程碑id对应上
          milestone_id = yield select(getModelSelectState('milestoneDetail', 'milestone_id'))
          milestone_detail = yield select(getModelSelectState('milestoneDetail', 'milestone_detail'))
          milestone_list = yield select(getModelSelectDatasState('projectDetail', 'milestoneList'))
          cope_milestone_id = getAfterNameId(coperateName)
          //更新里程碑详情
          if (milestone_id == cope_milestone_id) {
            const contents = coperateData['content']
            const new_milestone_detail = { ...milestone_detail }
            if (new_milestone_detail['content_list']) {
              new_milestone_detail['content_list'].push(contents)
            } else {
              new_milestone_detail['content_list'] = [contents]
            }
            dispathes({
              type: 'milestoneDetail/updateDatas',
              payload: {
                milestone_detail: new_milestone_detail
              }
            })
            // debugger
          }
          break
        //取消关联里程碑
        case 'remove:milestone:content':
          //当前的里程碑id和返回的里程碑id对应上
          milestone_id = yield select(getModelSelectState('milestoneDetail', 'milestone_id'))
          milestone_detail = yield select(getModelSelectState('milestoneDetail', 'milestone_detail'))
          milestone_list = yield select(getModelSelectDatasState('projectDetail', 'milestoneList'))
          cope_milestone_id = getAfterNameId(coperateName)
          let milestone_rela_id = coperateData['rela_id']
          let new_milestone_detail = { ...milestone_detail }
          //更新里程碑详情
          if (milestone_id == cope_milestone_id) {
            let content_list = new_milestone_detail['content_list']
            if (typeof content_list != 'object') { //array
              return
            }
            //如果删除的是某一条id则遍历 数组将之删除
            for (let i = 0; i < content_list.length; i++) {
              if (milestone_rela_id == content_list[i]['id']) {
                new_milestone_detail['content_list'].splice(i, 1)
              }
            }
            dispathes({
              type: 'milestoneDetail/updateDatas',
              payload: {
                milestone_detail: new_milestone_detail
              }
            })
          }
          break
        //关联里程碑的任务更新信息后
        case 'change:milestone:content:update':
          //当前的里程碑id和返回的里程碑id对应上
          milestone_id = yield select(getModelSelectState('milestoneDetail', 'milestone_id'))
          milestone_detail = yield select(getModelSelectState('milestoneDetail', 'milestone_detail'))
          cope_milestone_id = getAfterNameId(coperateName)
          if (milestone_id == cope_milestone_id) {
            new_milestone_detail = { ...milestone_detail }
            const content_list_ = new_milestone_detail['content_list'] || []
            const { rela_id, rela_name } = coperateData //返回的关联任务的id
            const new_content_list_ = content_list_.map(item => {
              const { id } = item
              let new_item = { ...item }
              if (id == rela_id) {
                new_item = { ...item, ...coperateData, name: rela_name, id: rela_id }
              }
              return new_item
            })
            new_milestone_detail['content_list'] = new_content_list_
            dispathes({
              type: 'milestoneDetail/updateDatas',
              payload: {
                milestone_detail: new_milestone_detail
              }
            })
          }
          break
        default:
          break
      }

    },

    * handleWsData_workbench({ payload }, { call, put, select }) {
      const { res } = payload
      const { data } = res
      // console.log('eee', data)
      const currentProjectBoardId = yield select(getModelSelectDatasState('workbenchPublicDatas', 'board_id'))

      let coperate = data[0] //协作
      let news = data[1] || {} //消息
      //获取消息协作类型
      const coperateName = coperate.e
      const coperateType = coperateName.substring(0, coperateName.indexOf('/'))
      let coperateData = JSON.parse(coperate.d)
      // console.log('eee_coperateName', coperateName)
      // console.log('eee_coperateData', coperateData)

      const getAfterNameId = (coperateName) => { //获取跟在名字后面的id
        return coperateName.substring(coperateName.indexOf('/') + 1)
      }

      let board_id_
      switch (coperateType) {
        case 'change:board':
          let op_board_id = getAfterNameId(coperateName)
          let is_deleted_ = coperateData['is_deleted']
          let projectList = yield select(workbench_selectProjectList) || []
          let arr = [...projectList]
          if (is_deleted_ == '0') {
            for (let i = 0; i < projectList.length; i++) {
              if (op_board_id == projectList[i]['board_id']) {
                arr.splice(i, 1, coperateData)
                break
              }
            }
          } else if (is_deleted_ == '1') {
            for (let i = 0; i < projectList.length; i++) {
              if (op_board_id == projectList[i]['board_id']) {
                arr.splice(i, 1)
                break
              }
            }
          }
          dispathes({
            type: model_workbench('updateDatas'),
            payload: {
              projectList: arr
            }
          })
          break
        case 'change:card': //监听到修改任务
          const drawContent = yield select(workbench_selectDrawContent)
          const card_id = yield select(workbench_selectCard_id)
          id_arr_ = getAfterNameId(coperateName).split('/')
          let parent_card_id = id_arr_[0]
          const child_card_id = id_arr_[1]
          const task_list = yield select(workbench_selectrResponsibleTaskList) || []
          let is_archived_ = coperateData['is_archived']

          if (is_archived_ == '1') { //归档
            for (let i = 0; i < task_list.length; i++) {
              if (parent_card_id == task_list[i]['id']) {
                task_list.splice(i, 1)
                break
              }
            }
          }
          //如果当前查看的任务和推送的任务id一样，会发生更新

          if (card_id == parent_card_id) {
            if (!child_card_id) { //父任务
              //归档
              if (is_archived_ == '1') {
                dispathes({
                  type: model_workbenchTaskDetail('updateDatas'),
                  payload: {
                    drawerVisible: false
                  }
                })
              }
              dispathes({
                type: model_workbenchTaskDetail('updateDatas'),
                payload: {
                  drawContent: { ...drawContent, ...coperateData }
                }
              })
            } else { //子任务
              for (let i = 0; i < drawContent['child_data'].length; i++) {
                if (drawContent['child_data'][i]['card_id'] == child_card_id) {
                  drawContent['child_data'][i] = { ...drawContent['child_data'][i], ...coperateData['child_data'][0] }
                  break
                }
              }
              dispathes({
                type: model_projectDetailTask('updateDatas'),
                payload: {
                  drawContent: drawContent
                }
              })

            }
          }

          dispathes({
            type: model_projectDetailTask('updateDatas'),
            payload: {
              responsibleTaskList: task_list
            }
          })
          break
        case 'change:cards':
          let task_list_ = yield select(workbench_selectrResponsibleTaskList) || []
          let meetingList = yield select(workbench_selectrMeetingLsit) || []
          let selectDrawContent = yield select(workbench_selectDrawContent)
          let id_arr_ = getAfterNameId(coperateName).split('/')
          let board_id_ = id_arr_[0]
          let list_id = id_arr_[1]
          let work_parent_card_id_ = id_arr_[2] //如果有则是添加子任务
          let selectCard_id = yield select(workbench_selectCard_id)
          let { is_archived, is_deleted, executors = [] } = coperateData
          let card_type = coperateData['type']
          let is_has_realize = false //插入还是push标志
          let cObj = { ...coperateData, name: coperateData['card_name'], id: coperateData['card_id'], board_id: board_id_ }

          const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
          const user_id = userInfo['id']
          const is_handler = executors.find(item => item.user_id == user_id)
          // if (!is_handler) {
          //   return
          // }

          if (!work_parent_card_id_) { //新增父任务
            if (is_handler) { //并且执行人有当前操作人
              if (card_type == '0') { //任务
                for (let i = 0; i < task_list_.length; i++) {
                  //如果某一列里面有完成的任务，则在完成的任务前面增加一条，否则直接往后塞
                  if (task_list_[i]['is_realize'] == '1') {
                    is_has_realize = true
                    task_list_.splice(i, 0, cObj)
                    break
                  }

                }
              } else if (card_type == '1') { //会议
                meetingList.push(cObj)
              } else {

              }
              if (!is_has_realize) {
                if (card_type == '0') {
                  task_list_.push(cObj)
                }
              }
            }
          } else { //新增子任务
            if (selectCard_id == work_parent_card_id_) { //当前查看的card_id是父类任务id
              selectDrawContent['child_data'].push(coperateData['child_data'][0])
            }
          }

          dispathes({
            type: model_workbenchTaskDetail('updateDatas'),
            payload: {
              responsibleTaskList: task_list_,
              meetingLsit: meetingList,
              drawContent: selectDrawContent
            }
          })
          break
        case 'delete:cards':
          id_arr_ = getAfterNameId(coperateName).split('/')
          selectDrawContent = yield select(workbench_selectDrawContent)
          selectCard_id = yield select(workbench_selectCard_id)
          task_list_ = yield select(workbench_selectrResponsibleTaskList)
          meetingList = yield select(workbench_selectrMeetingLsit) || []
          board_id_ = id_arr_[0]
          list_id = id_arr_[1]
          parent_card_id = id_arr_[2]
          let op_card_id = coperateData['card_id']
          if (!parent_card_id) { //删除父类任务
            for (let i = 0; i < task_list_.length; i++) {
              if (op_card_id == task_list_[i]['id']) {
                task_list_.splice(i, 1)
                break
              }
            }
            for (let i = 0; i < meetingList.length; i++) {
              if (op_card_id == meetingList[i]['id']) {
                meetingList.splice(i, 1)
                break
              }
            }
          } else { //删除子任务
            if (selectCard_id == parent_card_id) {
              for (let i = 0; i < selectDrawContent['child_data'].length; i++) {
                if (selectDrawContent['child_data'][i]['card_id'] == op_card_id) {
                  selectDrawContent['child_data'].splice(i, 1)
                  break
                }
              }
            }
          }
          dispathes({
            type: model_workbenchTaskDetail('updateDatas'),
            payload: {
              responsibleTaskList: task_list_,
              meetingLsit: meetingList,
              drawContent: selectDrawContent
            }
          })
          break
        case 'change:flow:instance':
          // board_id_
          // if(board_id_ == currentProjectBoardId) {
          //   const processList = yield select(selectCurrentProcessList)
          //   processList.push(coperateData)
          //   dispathes({
          //     type: model_projectDetailProcess('updateDatas'),
          //     payload: {
          //       processList
          //     }
          //   })
          // }
          break
        case 'change:flow':
          const currentProcessInstanceId = yield select(workbench_currentProcessInstanceId)
          const flow_id = getAfterNameId(coperateName)
          // debugger
          if (currentProcessInstanceId == flow_id) {
            const curr_node_id = coperateData.curr_node_id
            let curr_node_sort
            for (let i = 0; i < coperateData.nodes.length; i++) {
              if (curr_node_id === coperateData.nodes[i].id) {
                curr_node_sort = coperateData.nodes[i].sort
                break
              }
            }
            curr_node_sort = curr_node_sort || coperateData.nodes.length + 1 //如果已全部完成了会是一个undefind,所以给定一个值
            dispathes({
              type: model_workbenchDetailProcess('updateDatas'),
              payload: {
                processInfo: { ...coperateData, curr_node_sort },
                processEditDatas: coperateData.nodes || [],
              }
            })
          }

          break
        case 'change:file':
          //增减filelist
          //当当前的文件夹id 和操作的文件id的所属文件夹id 一样
          const uploadedFileList = yield select(workbench_selectrUploadedFileList)
          const fileType = coperateData.type
          const { status } = coperateData
          //status 2删除
          if (status == '2') {
            const { id } = coperateData
            for (let i = 0; i < uploadedFileList.length; i++) {
              if (uploadedFileList[i]['id'] == id) {
                uploadedFileList.splice(i, 1)
                break
              }
            }
            dispathes({
              type: model_workbench('updateDatas'),
              payload: {
                uploadedFileList
              }
            })
          }
          break
        case 'change:file:comment':
          const comment_file_id = getAfterNameId(coperateName)
          let file_id = yield select(workbench_selectFilePreviewCurrentFileId) || ''
          if (comment_file_id == file_id) { //如果推送评论的文档id和查看的id是一样
            const filePreviewCommits = yield select(workbench_selectFilePreviewCommits) || []
            const filePreviewPointNumCommits = yield select(workbench_selectFilePreviewPointNumCommits) || []
            const filePreviewCommitPointNumber = yield select(workbench_selectFilePreviewCommitPointNumber) || []
            const filePreviewCommitPoints = yield select(workbench_selectFilePreviewCommitPoints) || []

            let pointNo = coperateData['flag']
            if (pointNo) { //圈评
              if (pointNo == filePreviewCommitPointNumber) { //如果是当前圈评的这个点
                filePreviewPointNumCommits.push(coperateData)
              } else {
                let isHasPoint = false
                //如果没有这个点，则添加这个点
                for (let i = 0; i < filePreviewCommitPoints.length; i++) {
                  if (filePreviewCommitPoints[i]['flag'] == pointNo) {
                    isHasPoint = true
                    break
                  }
                }
                if (!isHasPoint) {
                  filePreviewCommitPoints.push(coperateData)
                }
              }
            }
            filePreviewCommits.push(coperateData)
            dispathes({
              type: model_workbenchFileDetail('updateDatas'),
              payload: {
                filePreviewCommits,
                filePreviewPointNumCommits,
                filePreviewCommitPoints
              }
            })
          }
          break
        case 'change:file:comment:delete':
          let commitId = getAfterNameId(coperateName)
          const filePreviewCommits = yield select(workbench_selectFilePreviewCommits) || []
          const filePreviewPointNumCommits = yield select(workbench_selectFilePreviewPointNumCommits) || []
          const filePreviewCommitPointNumber = yield select(workbench_selectFilePreviewCommitPointNumber) || []
          const filePreviewCommitPoints = yield select(workbench_selectFilePreviewCommitPoints) || []

          //删除点 存在最后一条is_last和点flag
          let flag_ = coperateData['flag']
          let is_last = coperateData['is_last']
          if (flag_ && is_last == '1') {
            for (let i = 0; i < filePreviewCommitPoints.length; i++) {
              if (filePreviewCommitPoints[i]['flag'] == flag_) {
                filePreviewCommitPoints.splice(i, 1)
                break
              }
            }
          }

          if (filePreviewPointNumCommits) { //处理点的评论
            for (let i = 0; i < filePreviewPointNumCommits.length; i++) {
              if (filePreviewPointNumCommits[i]['id'] == commitId) {
                filePreviewPointNumCommits.splice(i, 1)
                break
              }
            }
          }

          if (filePreviewCommits) { //处理整体评论
            for (let i = 0; i < filePreviewCommits.length; i++) {
              if (filePreviewCommits[i]['id'] == commitId) {
                filePreviewCommits.splice(i, 1)
                break
              }
            }
          }

          dispathes({
            type: model_workbenchFileDetail('updateDatas'),
            payload: {
              filePreviewCommits,
              filePreviewPointNumCommits,
              filePreviewCommitPoints
            }
          })
          break
        case 'change:file:operation': //移动和复制
        // let ids = getAfterNameId(coperateName)
        // let idArr = ids.split('/')
        // let fileList_ = yield select(selectFileList)
        // let folder_id = yield select(selectCurrentParrentDirectoryId)
        // let coFileList = coperateData['file_list']
        // if(idArr.length == 1) { //复制
        //   if(idArr[0] == folder_id) {
        //     fileList_ = [].concat(fileList_, coFileList)
        //   }
        // }else if(idArr.length == 2) { //移动
        //   if(idArr[0] != idArr[1]) { ////移入的文件和移除的文件夹不是同一个
        //     if(idArr[1] == folder_id) { //当前文件夹有文件移除
        //       for(let i = 0; i< fileList_.length; i++) {
        //         for (let j = 0; j < coFileList.length; j++) {
        //           if(fileList_[i]['file_id'] == coFileList[j]['file_id']) {
        //             fileList_.splice(i, 1)
        //             break
        //           }
        //
        //         }
        //       }
        //     }else if(idArr[0] == folder_id){ //当前文件夹有文件移进
        //       fileList_ = [].concat(fileList_, coFileList)
        //     }
        //
        //   }
        // } else {
        //
        // }
        // dispathes({
        //   type: model_projectDetailFile('updateDatas'),
        //   payload: {
        //     fileList: fileList_
        //   }
        // })
        //添加里程碑
        case 'add:milestone':
          let workbench_show_gantt_card = yield select(getModelSelectDatasState('workbench', 'workbench_show_gantt_card'))
          board_id_ = getAfterNameId(coperateName)
          //如果是在甘特图模式下查看该项目
          if (board_id_ == currentProjectBoardId && workbench_show_gantt_card == '1') {
            dispathes({
              type: 'gantt/getGttMilestoneList',
              payload: {
              }
            })
          }
          break
        //修改里程碑
        case 'change:milestone':
          //当前的里程碑id和返回的里程碑id对应上
          let milestone_id = yield select(getModelSelectState('milestoneDetail', 'milestone_id'))
          let milestone_detail = yield select(getModelSelectState('milestoneDetail', 'milestone_detail'))
          workbench_show_gantt_card = yield select(getModelSelectDatasState('workbench', 'workbench_show_gantt_card'))
          let cope_milestone_id = getAfterNameId(coperateName)
          //更新里程碑详情
          if (milestone_id == cope_milestone_id) {
            dispathes({
              type: 'milestoneDetail/updateDatas',
              payload: {
                milestone_detail: { ...milestone_detail, ...coperateData }
              }
            })
            // debugger
          }
          //如果是项目id匹配上了,并且在查看甘特图的情况下，则更新甘特图里程碑列表
          board_id_ = coperateData['board_id']
          if (board_id_ == currentProjectBoardId && workbench_show_gantt_card == '1') {
            dispathes({
              type: 'gantt/getGttMilestoneList',
              payload: {
              }
            })
          }
          break
        //里程碑关联任务
        case 'add:milestone:content':
          //当前的里程碑id和返回的里程碑id对应上
          milestone_id = yield select(getModelSelectState('milestoneDetail', 'milestone_id'))
          milestone_detail = yield select(getModelSelectState('milestoneDetail', 'milestone_detail'))
          cope_milestone_id = getAfterNameId(coperateName)
          //更新里程碑详情
          if (milestone_id == cope_milestone_id) {
            const contents = coperateData['content']
            const new_milestone_detail = { ...milestone_detail }
            if (new_milestone_detail['content_list']) {
              new_milestone_detail['content_list'].push(contents)
            } else {
              new_milestone_detail['content_list'] = [contents]
            }
            dispathes({
              type: 'milestoneDetail/updateDatas',
              payload: {
                milestone_detail: new_milestone_detail
              }
            })
            // debugger
          }
          break
        //取消关联里程碑
        case 'remove:milestone:content':
          //当前的里程碑id和返回的里程碑id对应上
          milestone_id = yield select(getModelSelectState('milestoneDetail', 'milestone_id'))
          milestone_detail = yield select(getModelSelectState('milestoneDetail', 'milestone_detail'))
          cope_milestone_id = getAfterNameId(coperateName)
          let milestone_rela_id = coperateData['rela_id']
          let new_milestone_detail = { ...milestone_detail }
          //更新里程碑详情
          if (milestone_id == cope_milestone_id) {
            let content_list = new_milestone_detail['content_list']
            if (typeof content_list != 'object') { //array
              return
            }
            //如果删除的是某一条id则遍历 数组将之删除
            for (let i = 0; i < content_list.length; i++) {
              if (milestone_rela_id == content_list[i]['id']) {
                new_milestone_detail['content_list'].splice(i, 1)
              }
            }
            dispathes({
              type: 'milestoneDetail/updateDatas',
              payload: {
                milestone_detail: new_milestone_detail
              }
            })
          }
          break
        //关联里程碑的任务更新信息后
        case 'change:milestone:content:update':
          //当前的里程碑id和返回的里程碑id对应上
          milestone_id = yield select(getModelSelectState('milestoneDetail', 'milestone_id'))
          milestone_detail = yield select(getModelSelectState('milestoneDetail', 'milestone_detail'))
          cope_milestone_id = getAfterNameId(coperateName)
          if (milestone_id == cope_milestone_id) {
            new_milestone_detail = { ...milestone_detail }
            const content_list_ = new_milestone_detail['content_list'] || []
            const { rela_id, rela_name } = coperateData //返回的关联任务的id
            const new_content_list_ = content_list_.map(item => {
              const { id } = item
              let new_item = { ...item }
              if (id == rela_id) {
                new_item = { ...item, ...coperateData, name: rela_name, id: rela_id }
              }
              return new_item
            })
            new_milestone_detail['content_list'] = new_content_list_
            dispathes({
              type: 'milestoneDetail/updateDatas',
              payload: {
                milestone_detail: new_milestone_detail
              }
            })
          }
          break
        default:
          break
      }
      // 处理甘特图临时方案
      yield put({
        type: 'simpleModeCooperate/handleSimpleModeCooperate',
        payload: {
          res
        }
      })
      //跨组织不推送消息
      const news_d = JSON.parse(news['d'] || '{}')
      const { org_id } = news_d
      const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
      const { current_org = {} } = userInfo
      const current_org_id = current_org['id']
      if (current_org_id != org_id) {
        return false
      }
      dispathes({
        type: model_newsDynamic('handleWs'),
        payload: {
          newsItem: JSON.parse(news['d'] || '{}')
        }
      })

    },

    * handleWsData_public({ payload }, { call, put, select }) {
      const { res } = payload
      const { data } = res
      let coperate = data[0] //协作
      let news = data[1] //消息
      //获取消息协作类型
      const coperateName = coperate.e
      const coperateType = coperateName.substring(0, coperateName.indexOf('/'))
      let coperateData = JSON.parse(coperate.d)
      const getAfterNameId = (coperateName) => { //获取跟在名字后面的id
        return coperateName.substring(coperateName.indexOf('/') + 1)
      }
      switch (coperateType) {
        case 'remove:visitor:member':
          const remove_user_id = getAfterNameId(coperateName)
          const remove_org_id = coperateData['org_id']
          const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
          const user_id = userInfo['id']
          const { current_org = {} } = userInfo
          const current_org_id = current_org['id']
          if (current_org_id == remove_org_id && remove_user_id == user_id) {
            message.error('您已被当前组织移除访客身份，即将跳转到登陆界面。', MESSAGE_DURATION_TIME)
            const delay = (ms) => new Promise(resolve => {
              setTimeout(resolve, ms)
            })
            yield call(delay, MESSAGE_DURATION_TIME * 1000)
            yield put({
              type: model_technological('logout'),
              payload: {

              }
            })
          }

          break
        case 'change:permission':
          const permission_type = coperateData['type']
          if (permission_type == '1') {
            dispathes({
              type: model_technological('getUserOrgPermissions'),
              payload: {

              }
            })
          } else if (permission_type == '2') {
            dispathes({
              type: model_technological('getUserBoardPermissions'),
              payload: {

              }
            })
          } else {

          }
          break
        default:
          break
      }

    },

    * handleWsData_board_list({ payload }, { call, put, select }) {
      const { res } = payload
      const { data } = res
      let coperate = data[0] //协作
      let news = data[1] //消息
      //获取消息协作类型
      const coperateName = coperate.e
      const coperateType = coperateName.substring(0, coperateName.indexOf('/'))
      let coperateData = JSON.parse(coperate.d)
      const getAfterNameId = (coperateName) => { //获取跟在名字后面的id
        return coperateName.substring(coperateName.indexOf('/') + 1)
      }
      switch (coperateType) {
        case 'change:permission':
          const permission_type = coperateData['type']
          if (permission_type == '1') {
          } else if (permission_type == '2') {
            dispathes({
              type: model_project('getProjectList'),
              payload: {
                type: '1'
              }
            })
          } else {

          }
          break
        default:
          break
      }

    },

    * handleWsData_comments_dynamics_in_detail_modal({ payload }, { call, put, select }) {
      const { res } = payload
      const { data } = res
      let coperate = data[0] //协作
      let news = data[1] //消息
      //获取消息协作类型
      const coperateName = coperate.e
      const coperateType = coperateName.substring(0, coperateName.indexOf('/'))
      let coperateData = JSON.parse(coperate.d)
      const getAfterNameId = (coperateName) => { //获取跟在名字后面的id
        return coperateName.substring(coperateName.indexOf('/') + 1)
      }
      switch (coperateType) {
        case 'remove:visitor:member':
          const remove_user_id = getAfterNameId(coperateName)
          const remove_org_id = coperateData['org_id']
          const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
          const user_id = userInfo['id']
          const { current_org = {} } = userInfo
          const current_org_id = current_org['id']
          if (current_org_id == remove_org_id && remove_user_id == user_id) {
            message.error('您已被当前组织移除访客身份，即将跳转到登陆界面。', MESSAGE_DURATION_TIME)
            const delay = (ms) => new Promise(resolve => {
              setTimeout(resolve, ms)
            })
            yield call(delay, MESSAGE_DURATION_TIME * 1000)
            yield put({
              type: model_technological('logout'),
              payload: {

              }
            })
          }

          break
        case 'change:permission':
          const permission_type = coperateData['type']
          if (permission_type == '1') {
            dispathes({
              type: model_technological('getUserOrgPermissions'),
              payload: {

              }
            })
          } else if (permission_type == '2') {
            dispathes({
              type: model_technological('getUserBoardPermissions'),
              payload: {

              }
            })
          } else {

          }
          break
        default:
          break
      }

    },

    * routingJump({ payload }, { call, put }) {
      const { route } = payload
      yield put(routerRedux.push(route));
    },
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
