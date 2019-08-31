import React from 'react'
import indexstyles from '../index.less'
import { Icon, Button, notification, Tooltip } from 'antd'
import globalStyles from '../../../../../globalset/css/globalClassName.less'
import {stopPropagation, timestampToTimeNormal} from '../../../../../utils/util'
import Cookies from 'js-cookie'
import {
  checkIsHasPermission, checkIsHasPermissionInBoard, getSubfixName, openPDF, setBoardIdStorage, getOrgNameWithOrgIdFilter
} from "../../../../../utils/businessFunction";
import {message} from "antd/lib/index";
import {connect} from 'dva'
import {
  MESSAGE_DURATION_TIME, NOT_HAS_PERMISION_COMFIRN, ORG_TEAM_BOARD_QUERY, PROJECT_FILES_FILE_EDIT,
  PROJECT_FILES_FILE_INTERVIEW
} from "../../../../../globalset/js/constant";

@connect(({ workbench, technological: { datas: { currentUserOrganizes = [], is_show_org_name, is_all_org } } }) => ({
  uploadedFileNotificationIdList:
    workbench.datas.uploadedFileNotificationIdList,
  uploadedFileList: workbench.datas.uploadedFileList,
  projectTabCurrentSelectedProject: workbench.datas.projectTabCurrentSelectedProject,
  currentUserOrganizes, is_show_org_name, is_all_org
}))
class FileItem extends React.Component {
  judgeFileType(fileName) {
    let themeCode = '';
    const type = getSubfixName(fileName)
    switch (type) {
      case '.xls':
        themeCode = '&#xe6d5;';
        break;
      case '.png':
        themeCode = '&#xe6d4;';
        break;
      case '.xlsx':
        themeCode = '&#xe6d3;';
        break;
      case '.ppt':
        themeCode = '&#xe6d2;';
        break;
      case '.gif':
        themeCode = '&#xe6d1;';
        break;
      case '.jpeg':
        themeCode = '&#xe6d0;';
        break;
      case '.pdf':
        themeCode = '&#xe6cf;';
        break;
      case '.docx':
        themeCode = '&#xe6ce;';
        break;
      case '.txt':
        themeCode = '&#xe6cd;';
        break;
      case '.doc':
        themeCode = '&#xe6cc;';
        break;
      case '.jpg':
        themeCode = '&#xe6cb;';
        break;
      default:
        themeCode = '&#xe6c6;';
        break;
    }
    return themeCode;
  }
  gotoBoardDetail({ id, board_id, org_id }, e) {
    stopPropagation(e);
    setBoardIdStorage(board_id)

    // if (!checkIsHasPermission(ORG_TEAM_BOARD_QUERY, org_id)) {
    //   message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME);
    //   return false;
    // }
    this.props.routingJump(
      `/technological/projectDetail?board_id=${board_id}&appsSelectKey=4&file_id=${id}`
    );
  }
  previewFile(data, e) {
    const {
      board_id,
      board_name,
      file_name,
      create_time,
      file_resource_id,
      file_id,
      org_id,
      id,
      folder_id,
      version_id
    } = data;
    const { dispatch} = this.props

    setBoardIdStorage(board_id)
    if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_INTERVIEW)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME);
      return false;
    }
    dispatch({
      type: 'workbenchPublicDatas/getRelationsSelectionPre',
      payload: {
        _organization_id: org_id
      }
    })
    this.props.dispatch({
      type: 'workbenchFileDetail/getCardCommentListAll',
      payload: {
        id: id
      }
    });
    this.props.dispatch({
      type: 'workbenchFileDetail/getFileType',
      payload: {
        file_id: id
      }
    });
    this.props.setPreviewFileModalVisibile();
    this.props.updateFileDatas({
      seeFileInput: 'fileModule',
      board_id,
      filePreviewCurrentId: file_resource_id,
      currentParrentDirectoryId: folder_id,
      filePreviewCurrentFileId: id,
      filePreviewCurrentVersionId: version_id, //file_id,
      pdfDownLoadSrc: '',
    })

    if(getSubfixName(file_name) == '.pdf') {
      this.props.dispatch({
        type: 'workbenchFileDetail/getFilePDFInfo',
        payload: {
          id
        }
      })
    } else {
      this.props.filePreview({id: file_resource_id, file_id: id})
    }
    this.props.fileVersionist({
      version_id: version_id, //file_id,
      isNeedPreviewFile: false,
    })
    this.props.updatePublicDatas({ board_id })
    this.props.getBoardMembers({id: board_id})

  }
  createUploadFileSuccessNote = file => {
    const { file_name, id } = file;
    const handleJump = e => {
      if (e) e.stopPropagation();
      this.previewFile(file);
      notification.close(id)
    };
    const descirptionEle = (
      <div>
        <p>
          <span>
            上传文件“<span style={{ color: '#1D93FF' }}>{file_name}</span>
            ”成功，可在“项目》文件”中查看具体文件
          </span>
        </p>
        <div style={{ textAlign: 'right' }}>
          <Button type="primary" size="small" onClick={e => handleJump(e)}>
            查看详情
          </Button>
        </div>
      </div>
    );
    notification.success({
      message: '上传成功',
      description: descirptionEle,
      placement: 'bottomLeft',
      key: id
    });
  };
  genUploadFileSuccessNoteQueue(fileList = []) {
    const {dispatch} = this.props
    for (let file of fileList) {
      this.createUploadFileSuccessNote(file)
    }
    // fileList.map(file => )
    dispatch({
      type: 'workbench/updateUploadedFileNotificationIdList',
      payload: {
        idsList: []
      }
    })
  }
  showNewUploadedFileNotification = (
    uploadedFileNotificationIdList,
    uploadedFileList
  ) => {
    return this.genUploadFileSuccessNoteQueue(
      uploadedFileList && uploadedFileList.file_list ? uploadedFileList.file_list.filter(file =>
        uploadedFileNotificationIdList.find(eachId => file.id === eachId)
      ) : []
    );
  };
  handleNewUploadedFileNotification = nextProps => {
    const { uploadedFileNotificationIdList } = this.props;
    const isEmptyArr = arr => Array.isArray(arr) && arr.length == 0;
    if (isEmptyArr(uploadedFileNotificationIdList)) {
      const { uploadedFileNotificationIdList, uploadedFileList } = nextProps;
      if (uploadedFileNotificationIdList.length) {
        this.showNewUploadedFileNotification(
          uploadedFileNotificationIdList,
          uploadedFileList
        );
      }
    }
  };
  componentWillReceiveProps(nextProps) {
    this.handleNewUploadedFileNotification(nextProps);
  }

  render() {
    const { itemValue = {}, currentUserOrganizes, is_show_org_name, projectTabCurrentSelectedProject, is_all_org } = this.props;
    // console.log(is_show_org_name, is_all_org, projectTabCurrentSelectedProject, 'sss')
    const {
      board_id,
      org_id,
      board_name,
      file_name,
      create_time,
      file_resource_id,
      file_id,
      id,
    } = itemValue;
    return (
      <div
        className={indexstyles.fileItem}
        onClick={this.previewFile.bind(this, { ...itemValue })}
      >
        <div>
          <i
            className={globalStyles.authTheme}
            style={{
              fontStyle: 'normal',
              fontSize: 20,
              color: '#1890FF',
              cursor: 'pointer'
            }}
            dangerouslySetInnerHTML={{ __html: this.judgeFileType(file_name) }}
          />
        </div>
        <div className={indexstyles.file_text}>
          <span className={indexstyles.hoverUnderline}>{file_name}</span>
          {
            projectTabCurrentSelectedProject == '0' && (
              <span style={{marginLeft: 5, marginRight: 2, color: '#8C8C8C'}}>#</span>
            )
          }
          <Tooltip placement="topLeft" title={
           is_show_org_name && projectTabCurrentSelectedProject == '0' && is_all_org ? (<span>{getOrgNameWithOrgIdFilter(org_id, currentUserOrganizes)} <Icon type="caret-right" style={{fontSize: 8, color: '#8C8C8C'}}/> {board_name}</span>)
            : (<span>{board_name}</span>)
          }>
            <div
                style={{ color: "#8c8c8c", cursor: "pointer", display: 'flex', alignItems: 'center' }}
                onClick={this.gotoBoardDetail.bind(this, { id, board_id, org_id })}
              >
                {
                  is_show_org_name && projectTabCurrentSelectedProject == '0' && is_all_org && (
                    <span className={indexstyles.org_name}>
                      {getOrgNameWithOrgIdFilter(org_id, currentUserOrganizes)}
                    </span>
                  )
                }
                {
                  is_show_org_name && projectTabCurrentSelectedProject == '0' && is_all_org && (
                    <span>
                      <Icon type="caret-right" style={{fontSize: 8, color: '#8C8C8C'}}/>
                    </span>
                  )
                }
                {
                  projectTabCurrentSelectedProject == '0' && (
                    <span className={indexstyles.ellipsis}>{board_name}</span>
                  )
                }
                
              </div>
            </Tooltip>
        </div>
        <div>{timestampToTimeNormal(create_time, '/', true)}</div>
      </div>
    );
  }
}

export default FileItem
