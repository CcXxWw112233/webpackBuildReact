import React from 'react';
import {connect} from "dva/index";
import Header from './Header'
import CreateTask from './TaskItemComponent/CreateTask'
import FileModule from './FileModule'
import ProcessIndex from './Process'
import indexStyles from './index.less'
import { Route, Router, Switch, Link } from 'dva/router'
import { Drawer } from 'antd'
import dynamic from "dva/dynamic";
import {checkIsHasPermissionInBoard} from "../../../../utils/businessFunction";
import {
  PROJECT_FILES_FILE_INTERVIEW, PROJECT_FLOW_FLOW_ACCESS,
  PROJECT_TEAM_CARD_INTERVIEW
} from "../../../../globalset/js/constant";
const getEffectOrReducerByName = name => `projectDetail/${name}`
const getEffectOrReducerByNameTask = name => `projectDetailTask/${name}`
const getEffectOrReducerByNameFile = name => `projectDetailFile/${name}`
const getEffectOrReducerByNameProcess = name => `projectDetailProcess/${name}`

const ProjectDetail = (props) => {
  const { dispatch, model, modal, match } = props
  const { datas = { } } = model
  const { projectInfoDisplay, appsSelectKey } = datas
  const HeaderListProps = {
    modal,
    model,
    dispatch,
    editProjectApp(data) {
      dispatch({
        type: getEffectOrReducerByName('editProjectApp'),
        payload: data
      })
    },
    addProjectApp(data) {
      dispatch({
        type: getEffectOrReducerByName('addProjectApp'),
        payload: data
      })
    },
    getTaskGroupList(data){
      dispatch({
        type: getEffectOrReducerByNameTask('getTaskGroupList'),
        payload: data
      })
    },
    collectionProject(id) {
      dispatch({
        type: getEffectOrReducerByName('collectionProject'),
        payload: {
          id
        }
      })
    },
    cancelCollection(id) {
      dispatch({
        type: getEffectOrReducerByName('cancelCollection'),
        payload: {
          id
        }
      })
    },
    quitProject(data){
      dispatch({
        type: getEffectOrReducerByName('quitProject'),
        payload: data
      })
    },
    deleteProject(id) {
      dispatch({
        type: getEffectOrReducerByName('deleteProject'),
        payload: {
          id,
          isJump: true
        }
      })
    },
    archivedProject(data) {
      dispatch({
        type: getEffectOrReducerByName('archivedProject'),
        payload: data
      })
    },
    addMenbersInProject(data) {
      dispatch({
        type: getEffectOrReducerByName('addMenbersInProject'),
        payload: data
      })
    },
    appsSelect(data) {
      dispatch({
        type: getEffectOrReducerByName('appsSelect'),
        payload: data
      })
    },
    changeFlowIdToUrl(data) {
      dispatch({
        type: getEffectOrReducerByNameProcess('changeFlowIdToUrl'),
        payload: data
      })
    },
    setMemberRoleInProject(data){
      dispatch({
        type: getEffectOrReducerByName('setMemberRoleInProject'),
        payload: data
      })
    },
    getProjectRoles(data){
      dispatch({
        type: getEffectOrReducerByName('getProjectRoles'),
        payload: data
      })
    },
    updateProject(data) {
      dispatch({
        type: getEffectOrReducerByName('updateProject'),
        payload: data
      })
    },
  }
  const DetailInfoProps = {
    modal,
    model,
    showModal() {
      dispatch({ type: 'modal/showModal' })
    },
    hideModal() {
      dispatch({ type: 'modal/hideModal' })
    },
    removeMenbers(data) {
      dispatch({
        type: getEffectOrReducerByName('removeMenbers'),
        payload: data
      })
    },
    updateProject(data) {
      dispatch({
        type: getEffectOrReducerByName('updateProject'),
        payload: data
      })
    },
    addMenbersInProject(data) {
      dispatch({
        type: getEffectOrReducerByName('addMenbersInProject'),
        payload: data
      })
      this.hideModal()
    },
    setMemberRoleInProject(data){
      dispatch({
        type: getEffectOrReducerByName('setMemberRoleInProject'),
        payload: data
      })
    },
    getProjectRoles(data){
      dispatch({
        type: getEffectOrReducerByName('getProjectRoles'),
        payload: data
      })
    }
  }

  const CreateTaskProps = {
    modal,
    model,
    match,
    dispatch,
    getRelations(data) {
      dispatch({
        type: getEffectOrReducerByNameTask('getRelations'),
        payload: data,
      })
    },
    JoinRelation(data) {
      dispatch({
        type: getEffectOrReducerByNameTask('JoinRelation'),
        payload: data,
      })
    },
    cancelRelation(data) {
      dispatch({
        type: getEffectOrReducerByNameTask('cancelRelation'),
        payload: data,
      })
    },
    getRelationsSelectionPre(data) {
      dispatch({
        type: getEffectOrReducerByNameTask('getRelationsSelectionPre'),
        payload: data,
      })
    },
    getRelationsSelectionSub(data) {
      dispatch({
        type: getEffectOrReducerByNameTask('getRelationsSelectionSub'),
        payload: data,
      })
    },

    cardItemClickEffect(data) {
      dispatch({
        type: getEffectOrReducerByNameTask('cardItemClickEffect'),
        payload: data,
      })
    },
    postCommentToDynamics(data) {
      dispatch({
        type: getEffectOrReducerByNameTask('postCommentToDynamics'),
        payload: data,
      })
    },
    deleteTaskFile(data) {
      dispatch({
        type: getEffectOrReducerByNameTask('deleteTaskFile'),
        payload: data,
      })
    },
    addTaskGroup(data) {
      dispatch({
        type: getEffectOrReducerByNameTask('addTaskGroup'),
        payload: data,
      })
    },
    deleteTaskGroup(data) {
      dispatch({
        type: getEffectOrReducerByNameTask('deleteTaskGroup'),
        payload: data,
      })
    },
    updateTaskGroup(data) {
      dispatch({
        type: getEffectOrReducerByNameTask('updateTaskGroup'),
        payload: data,
      })
    },
    getTaskGroupList(data){
      dispatch({
        type: getEffectOrReducerByNameTask('getTaskGroupList'),
        payload: data
      })
    },
    addTask(data){
      dispatch({
        type: getEffectOrReducerByNameTask('addTask'),
        payload: data
      })
    },
    updateTask(data){
      dispatch({
        type: getEffectOrReducerByNameTask('updateTask'),
        payload: data
      })
    },
    deleteTask(id){
      dispatch({
        type: getEffectOrReducerByNameTask('deleteTask'),
        payload: {
          id
        }
      })
    },
    updateChirldTask(data){
      dispatch({
        type: getEffectOrReducerByNameTask('updateChirldTask'),
        payload: data
      })
    },
    deleteChirldTask(data){
      dispatch({
        type: getEffectOrReducerByNameTask('deleteChirldTask'),
        payload: data
      })
    },
    archivedTask(data){
      dispatch({
        type: getEffectOrReducerByNameTask('archivedTask'),
        payload: data
      })
    },
    changeTaskType(data){
      dispatch({
        type: getEffectOrReducerByNameTask('changeTaskType'),
        payload: data
      })
    },
    addChirldTask(data){
      dispatch({
        type: getEffectOrReducerByNameTask('addChirldTask'),
        payload: data
      })
    },
    addTaskExecutor(data){
      dispatch({
        type: getEffectOrReducerByNameTask('addTaskExecutor'),
        payload: data
      })
    },
    removeTaskExecutor(data){
      dispatch({
        type: getEffectOrReducerByNameTask('removeTaskExecutor'),
        payload: data
      })
    },
    completeTask(data){
      dispatch({
        type: getEffectOrReducerByNameTask('completeTask'),
        payload: data
      })
    },
    addTaskTag(data){
      dispatch({
        type: getEffectOrReducerByNameTask('addTaskTag'),
        payload: data
      })
    },
    removeTaskTag(data){
      dispatch({
        type: getEffectOrReducerByNameTask('removeTaskTag'),
        payload: data
      })
    },
    removeProjectMenbers(data){
      dispatch({
        type: getEffectOrReducerByNameTask('removeProjectMenbers'),
        payload: data
      })
    },
    getCardCommentList(id) {
      dispatch({
        type: getEffectOrReducerByNameTask('getCardCommentList'),
        payload: {
          id
        }
      })
    },
    addCardNewComment(data) {
      dispatch({
        type: getEffectOrReducerByNameTask('addCardNewComment'),
        payload: data
      })
    },
    deleteCardNewComment(data) {
      dispatch({
        type: getEffectOrReducerByNameTask('deleteCardNewComment'),
        payload: data
      })
    },
    getBoardTagList(data) {
      dispatch({
        type: getEffectOrReducerByNameTask('getBoardTagList'),
        payload: data
      })
    },
    updateBoardTag(data) {
      dispatch({
        type: getEffectOrReducerByNameTask('updateBoardTag'),
        payload: data
      })
    },
    toTopBoardTag(data) {
      dispatch({
        type: getEffectOrReducerByNameTask('toTopBoardTag'),
        payload: data
      })
    },
    deleteBoardTag(data) {
      dispatch({
        type: getEffectOrReducerByNameTask('deleteBoardTag'),
        payload: data
      })
    }
  }
  const FileModuleProps = {
    modal,
    model,
    dispatch,
    openFileInUrl(data) {
      dispatch({
        type: getEffectOrReducerByNameFile('openFileInUrl'),
        payload: data,
      })
    },
    postCommentToDynamics(data) {
      dispatch({
        type: getEffectOrReducerByNameFile('postCommentToDynamics'),
        payload: data,
      })
    },
    getFileList(params){
      dispatch({
        type: getEffectOrReducerByNameFile('getFileList'),
        payload: params
      })
    },
    fileCopy(data){
      dispatch({
        type: getEffectOrReducerByNameFile('fileCopy'),
        payload: data
      })
    },
    fileDownload(params){
      dispatch({
        type: getEffectOrReducerByNameFile('fileDownload'),
        payload: params
      })
    },
    fileRemove(data){
      dispatch({
        type: getEffectOrReducerByNameFile('fileRemove'),
        payload: data
      })
    },
    fileMove(data){
      dispatch({
        type: getEffectOrReducerByNameFile('fileMove'),
        payload: data
      })
    },
    fileUpload(data){
      dispatch({
        type: getEffectOrReducerByNameFile('fileUpload'),
        payload: data
      })
    },
    fileVersionist(params){
      dispatch({
        type: getEffectOrReducerByNameFile('fileVersionist'),
        payload: params
      })
    },
    recycleBinList(params){
      dispatch({
        type: getEffectOrReducerByNameFile('recycleBinList'),
        payload: params
      })
    },
    deleteFile(data){
      dispatch({
        type: getEffectOrReducerByNameFile('deleteFile'),
        payload: data
      })
    },
    restoreFile(data){
      dispatch({
        type: getEffectOrReducerByNameFile('restoreFile'),
        payload: data
      })
    },
    getFolderList(params){
      dispatch({
        type: getEffectOrReducerByNameFile('getFolderList'),
        payload: params
      })
    },
    addNewFolder(data){
      dispatch({
        type: getEffectOrReducerByNameFile('addNewFolder'),
        payload: data
      })
    },
    updateFolder(data){
      dispatch({
        type: getEffectOrReducerByNameFile('updateFolder'),
        payload: data
      })
    },
    filePreview(params) {
      dispatch({
        type: getEffectOrReducerByNameFile('filePreview'),
        payload: params
      })
    },
    getPreviewFileCommits(params) {
      dispatch({
        type: getEffectOrReducerByNameFile('getPreviewFileCommits'),
        payload: params
      })
    },
    addFileCommit(params) {
      dispatch({
        type: getEffectOrReducerByNameFile('addFileCommit'),
        payload: params
      })
    },
    deleteCommit(params) {
      dispatch({
        type: getEffectOrReducerByNameFile('deleteCommit'),
        payload: params
      })
    },
  }
  const ProcessProps = {
    modal,
    model,
    deleteProcessTemplate(data) {
      dispatch({
        type: getEffectOrReducerByNameProcess('deleteProcessTemplate'),
        payload: data
      })
    },
    changeFlowIdToUrl(data) {
      dispatch({
        type: getEffectOrReducerByNameProcess('changeFlowIdToUrl'),
        payload: data
      })
    },
    getProcessListByType(data) {
      dispatch({
        type: getEffectOrReducerByNameProcess('getProcessListByType'),
        payload: data,
      })
    },
    postCommentToDynamics(data) {
      dispatch({
        type: getEffectOrReducerByNameProcess('postCommentToDynamics'),
        payload: data,
      })
    },
    getProcessTemplateList(data){
      dispatch({
        type: getEffectOrReducerByNameProcess('saveProcessTemplate'),
        payload: data
      })
    },
    saveProcessTemplate(data){
      dispatch({
        type: getEffectOrReducerByNameProcess('saveProcessTemplate'),
        payload: data
      })
    },
    getTemplateInfo(id) {
      dispatch({
        type: getEffectOrReducerByNameProcess('getTemplateInfo'),
        payload: id
      })
    },
    directStartSaveTemplate(id) {
      dispatch({
        type: getEffectOrReducerByNameProcess('directStartSaveTemplate'),
        payload: id
      })
    },
    getProcessList(data){
      dispatch({
        type: getEffectOrReducerByNameProcess('getProcessList'),
        payload: data
      })
    },
    createProcess(data){
      dispatch({
        type: getEffectOrReducerByNameProcess('createProcess'),
        payload: data
      })
    },
    completeProcessTask(data){
      dispatch({
        type: getEffectOrReducerByNameProcess('completeProcessTask'),
        payload: data
      })
    },
    fillFormComplete(data) {
      dispatch({
        type: 'projectDetailProcess/fillFormComplete',
        payload: data
      })
    },
    rebackProcessTask(data){
      dispatch({
        type: getEffectOrReducerByNameProcess('rebackProcessTask'),
        payload: data
      })
    },
    rejectProcessTask(data) {
      dispatch({
        type: getEffectOrReducerByNameProcess('rejectProcessTask'),
        payload: data
      })
    },
    resetAsignees(data) {
      dispatch({
        type: getEffectOrReducerByNameProcess('resetAsignees'),
        payload: data
      })
    },
    getProcessInfo(data){
      dispatch({
        type: getEffectOrReducerByNameProcess('getProcessInfo'),
        payload: data
      })
    },
    getProessDynamics(params) {
      dispatch({
        type: getEffectOrReducerByNameProcess('getProessDynamics'),
        payload: params
      })
    }
  }

  const routingJump = (path) => {
    dispatch({
      type: getEffectOrReducerByName('routingJump'),
      payload: {
        route: path,
      },
    })
  }


  const updateDatas = (payload) => {
    dispatch({
      type: getEffectOrReducerByName('updateDatas'),
      payload: payload
    })
  }
  const updateDatasTask = (payload) => {
    dispatch({
      type: getEffectOrReducerByNameTask('updateDatas'),
      payload: payload
    })
  }
  const updateDatasFile = (payload) => {
    dispatch({
      type: getEffectOrReducerByNameFile('updateDatas'),
      payload: payload
    })
  }
  const updateDatasProcess = (payload) => {
    dispatch({
      type: getEffectOrReducerByNameProcess('updateDatas'),
      payload: payload
    })
  }
  const getProjectDetailInfo = (payload) => {
    dispatch({
      type: 'workbenchTaskDetail/projectDetailInfo',
      payload: payload
    })
  }
  const workflowComments = {
    addWorkFlowComment(payload) {
      dispatch({
        type: 'projectDetailProcess/addWorkFlowComment',
        payload
      })
    },
    getWorkFlowComment(params) {
      dispatch({
        type: 'projectDetailProcess/getWorkFlowComment',
        payload: params
      })
    }
  }
  const filterAppsModule = (appsSelectKey) => {
    let appFace = (<div></div>)
    switch (appsSelectKey) {
      case '2':
        appFace = checkIsHasPermissionInBoard(PROJECT_FLOW_FLOW_ACCESS) && (
<ProcessIndex
          {...props}
          {...HeaderListProps}
          getProjectDetailInfo={getProjectDetailInfo}
          {...workflowComments}
          {...FileModuleProps}
          {...ProcessProps}
          updateDatas={updateDatas}
          updateDatasTask={updateDatasTask}
          updateDatasFile={updateDatasFile}
          updateDatasProcess={updateDatasProcess} />
)
        break
      case '3':
        appFace = checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_INTERVIEW) && (<CreateTask {...FileModuleProps} {...CreateTaskProps} updateDatas={updateDatas} updateDatasTask={updateDatasTask} updateDatasFile={updateDatasFile} updateDatasProcess={updateDatasProcess} />)
        break
      case '4':
        appFace = checkIsHasPermissionInBoard(PROJECT_FILES_FILE_INTERVIEW) && (<FileModule {...FileModuleProps} updateDatas={updateDatas} updateDatasTask={updateDatasTask} updateDatasFile={updateDatasFile} updateDatasProcess={updateDatasProcess} />)
        break
      default:
        // appFace = (<EditTeamShow {...EditTeamShowProps} updateDatas={updateDatas}/>)
        break
    }
    return appFace
  }
  return(
    // minHeight: '100%',
    //overflow: 'hidden', 03/20
    <div style={{ height: 'auto', position: 'relative', width: '100%', minHeight: '100vh', margin: '0 auto'}}>
      <div className={indexStyles.headerMaskDown}></div>
      <Header {...DetailInfoProps} {...HeaderListProps} {...FileModuleProps} routingJump={routingJump} updateDatas={updateDatas} updateDatasTask={updateDatasTask}
              updateDatasFile={updateDatasFile} updateDatasProcess={updateDatasProcess} />

      {/*应用界面*/}
      <div style={{padding: '0 20px'}}>
        {filterAppsModule(appsSelectKey)}
      </div>
    </div>
  )
};

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ modal, projectDetail, projectDetailTask, projectDetailFile, projectDetailProcess, loading }) {
  const modelObj = {
    datas: { ...projectDetail['datas'], ...projectDetailTask['datas'], ...projectDetailFile['datas'], ...projectDetailProcess['datas'], }
  }
  return { modal, model: modelObj, loading }
}
export default connect(mapStateToProps)(ProjectDetail)


