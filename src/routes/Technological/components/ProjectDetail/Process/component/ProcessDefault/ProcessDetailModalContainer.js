import React from 'react'
import { Collapse } from 'antd'
import ProccessDetailModal from '../../../../Workbench/CardContent/Modal/ProccessDetailModal'
import { connect } from 'dva'

@connect(mapStateToProps)
export default class ProccessDetailModalContainer extends React.Component {
  processDetailProps = () => {
    const getEffectOrReducerByName = name => `projectDetail/${name}`
    const getEffectOrReducerByNameTask = name => `projectDetailTask/${name}`
    const getEffectOrReducerByNameFile = name => `projectDetailFile/${name}`
    const getEffectOrReducerByNameProcess = name =>
      `projectDetailProcess/${name}`
    const { model, dispatch } = this.props
    const ProcessProps = {
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
          payload: data
        })
      },
      postCommentToDynamics(data) {
        dispatch({
          type: getEffectOrReducerByNameProcess('postCommentToDynamics'),
          payload: data
        })
      },
      getProcessTemplateList(data) {
        dispatch({
          type: getEffectOrReducerByNameProcess('saveProcessTemplate'),
          payload: data
        })
      },
      saveProcessTemplate(data) {
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
      getProcessList(data) {
        dispatch({
          type: getEffectOrReducerByNameProcess('getProcessList'),
          payload: data
        })
      },
      createProcess(data) {
        dispatch({
          type: getEffectOrReducerByNameProcess('createProcess'),
          payload: data
        })
      },
      completeProcessTask(data) {
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
      rebackProcessTask(data) {
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
      getProcessInfo(data) {
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
    const FileModuleProps = {
      dispatch,
      openFileInUrl(data) {
        dispatch({
          type: getEffectOrReducerByNameFile('openFileInUrl'),
          payload: data
        })
      },
      postCommentToDynamics(data) {
        dispatch({
          type: getEffectOrReducerByNameFile('postCommentToDynamics'),
          payload: data
        })
      },
      getFileList(params) {
        dispatch({
          type: getEffectOrReducerByNameFile('getFileList'),
          payload: params
        })
      },
      fileCopy(data) {
        dispatch({
          type: getEffectOrReducerByNameFile('fileCopy'),
          payload: data
        })
      },
      fileDownload(params) {
        dispatch({
          type: getEffectOrReducerByNameFile('fileDownload'),
          payload: params
        })
      },
      fileRemove(data) {
        dispatch({
          type: getEffectOrReducerByNameFile('fileRemove'),
          payload: data
        })
      },
      fileMove(data) {
        dispatch({
          type: getEffectOrReducerByNameFile('fileMove'),
          payload: data
        })
      },
      fileUpload(data) {
        dispatch({
          type: getEffectOrReducerByNameFile('fileUpload'),
          payload: data
        })
      },
      fileVersionist(params) {
        dispatch({
          type: getEffectOrReducerByNameFile('fileVersionist'),
          payload: params
        })
      },
      recycleBinList(params) {
        dispatch({
          type: getEffectOrReducerByNameFile('recycleBinList'),
          payload: params
        })
      },
      deleteFile(data) {
        dispatch({
          type: getEffectOrReducerByNameFile('deleteFile'),
          payload: data
        })
      },
      restoreFile(data) {
        dispatch({
          type: getEffectOrReducerByNameFile('restoreFile'),
          payload: data
        })
      },
      getFolderList(params) {
        dispatch({
          type: getEffectOrReducerByNameFile('getFolderList'),
          payload: params
        })
      },
      addNewFolder(data) {
        dispatch({
          type: getEffectOrReducerByNameFile('addNewFolder'),
          payload: data
        })
      },
      updateFolder(data) {
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
      }
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
    const updateDatas = payload => {
      dispatch({
        type: getEffectOrReducerByName('updateDatas'),
        payload: payload
      })
    }
    const updateDatasTask = payload => {
      dispatch({
        type: getEffectOrReducerByNameTask('updateDatas'),
        payload: payload
      })
    }
    const updateDatasFile = payload => {
      dispatch({
        type: getEffectOrReducerByNameFile('updateDatas'),
        payload: payload
      })
    }
    const updateDatasProcess = payload => {
      dispatch({
        type: getEffectOrReducerByNameProcess('updateDatas'),
        payload: payload
      })
    }
    return {
      model,
      ...ProcessProps,
      ...FileModuleProps,
      ...workflowComments,
      updateDatas,
      updateDatasFile,
      updateDatasProcess,
      updateDatasTask
    }
  }

  render() {
    const { modalVisible, close, status, getProcessListByType } = this.props
    return (
      <div>
        <ProccessDetailModal
          {...this.processDetailProps()}
          status={status}
          getProcessListByType={getProcessListByType}
          close={close}
          modalVisible={modalVisible}
          visitControlUpdateCurrentModalData={
            this.props.visitControlUpdateCurrentModalData
          }
          principalList={this.props.principalList}
        />
      </div>
    )
  }
}

function mapStateToProps({
  projectDetail,
  projectDetailFile,
  projectDetailProcess
}) {
  const modelObj = {
    datas: {
      ...projectDetail['datas'],
      ...projectDetailFile['datas'],
      ...projectDetailProcess['datas']
    }
  }
  return {
    model: modelObj
  }
}
