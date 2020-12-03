import React, { Component } from 'react'
import indexStyles from '../index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { Upload, message, Spin, Progress, Icon } from 'antd'
import { connect } from 'dva'
import axios from 'axios'
import Cookies from 'js-cookie'
import {
  getSubfixName,
  setUploadHeaderBaseInfo,
  checkIsHasPermissionInBoard
} from '@/utils/businessFunction'
import {
  MESSAGE_DURATION_TIME,
  NOT_HAS_PERMISION_COMFIRN,
  PROJECT_TEAM_CARD_ATTACHMENT_UPLOAD,
  PROJECT_TEAM_BOARD_CONTENT_PRIVILEGE,
  PROJECT_FILES_FILE_INTERVIEW,
  UPLOAD_FILE_SIZE
} from '@/globalset/js/constant'
import _ from 'lodash'
import { currentNounPlanFilterName } from '../../../../../utils/businessFunction'
import { FILES } from '../../../../../globalset/js/constant'
import FileListRightBarFileDetailModal from '../../../../../routes/Technological/components/ProjectDetail/FileModule/FileListRightBarFileDetailModal'
import { updateUserStorage } from '../../handleOperateModal'

let uploadMaxFileSize = []
let CancelToken = axios.CancelToken
@connect(mapStateToProps)
export default class BeginningStepOne_five extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fileList: []
    }
    // const { itemValue = {} } = props
    // let { files: fileList } = itemValue
    // fileList = fileList && fileList.map(item => {
    //   item.uid = item.file_id
    //   return item
    // })
    // this.state = {
    //   fileList: props.itemValue && props.itemValue.files ? fileList : [],
    // }
  }
  componentDidMount() {
    const { itemValue = {} } = this.props
    let { files: fileList } = itemValue
    fileList =
      fileList &&
      fileList.map(item => {
        item.uid = item.file_id
        return item
      })
    this.setState({
      fileList
    })
  }

  componentWillUnmount() {
    this.setState({
      fileList: []
    })
    if (this.cancelAxios) {
      this.cancelAxios()
    }
  }

  updateEdit = (data, key) => {
    const { itemKey, parentKey, processEditDatas = [] } = this.props
    const { forms = [] } = processEditDatas[parentKey]
    forms[itemKey][key] = data.value
    this.props.updateCorrespondingPrcodessStepWithNodeContent &&
      this.props.updateCorrespondingPrcodessStepWithNodeContent('forms', forms)
    if (data.update_storage) {
      updateUserStorage({ forms: forms })
    }
  }

  onBeforeUpload = (file, fileList) => {
    const { board_id, itemValue } = this.props
    const { limit_file_num, limit_file_size } = itemValue
    const { fileList: state_filelist } = this.state

    const { size } = file
    if (size == 0) {
      file.status = 'error'
      file.errorMsg = `不能上传空文件`
      return false
    } else if (
      size > UPLOAD_FILE_SIZE * 1024 * 1024 ||
      size > limit_file_size * 1024 * 1024
    ) {
      file.status = 'error'
      file.errorMsg = `上传文件不能超过${
        UPLOAD_FILE_SIZE > limit_file_size ? limit_file_size : UPLOAD_FILE_SIZE
      }MB`
      return false
    } else {
    }
    const effective_file_list =
      fileList.filter(item => item.status != 'error') || []
    const effective_state_file_list =
      (state_filelist &&
        state_filelist.filter(item => item.status != 'error')) ||
      []

    if (
      limit_file_num != 0 &&
      effective_file_list.length + effective_state_file_list.length >
        limit_file_num
    ) {
      file.status = 'up_limit'
      message.warn(`上传文件总数不能超过${limit_file_num}个`)
      return false
    }
  }

  handleChange = ({ file, fileList, event }) => {
    let new_filelist = fileList.filter(item => item.status != 'up_limit')
    new_filelist = new_filelist.map(item => {
      if (item.response && item.response.code == '1') {
        let new_item = {
          ...item,
          status: 'error',
          errorMsg: item.response.message
        }
        return new_item
      } else {
        return item
      }
    })
    let temp_list = new_filelist.filter(item => item.status != 'error')
    this.setState({
      fileList: new_filelist
    })
    this.updateEdit({ value: temp_list, update_storage: true }, 'files')
  }

  onFilePreview = (e, item) => {
    e && e.stopPropagation()
    const file_id =
      item.file_id ||
      (item.response && item.response.data && item.response.data.file_id) ||
      ''
    const file_name =
      item.file_name ||
      (item.response && item.response.data && item.response.data.file_name) ||
      ''
    const file_size =
      item.file_size ||
      (item.response && item.response.data && item.response.data.file_size) ||
      ''
    const file_resource_id =
      item.file_resource_id ||
      (item.response &&
        item.response.data &&
        item.response.data.file_resource_id) ||
      ''
    if (!file_id) return
    this.props.dispatch({
      type: 'publicFileDetailModal/updateDatas',
      payload: {
        isInOpenFile: true,
        filePreviewCurrentFileId: file_id,
        fileType: getSubfixName(file_name),
        filePreviewCurrentName: file_name,
        filePreviewCurrentSize: file_size,
        filePreviewCurrentFileResourceId: file_resource_id,
        isOpenAttachmentFile: true
      }
    })
  }

  setPreviewFileModalVisibile = () => {
    this.props.dispatch({
      type: 'publicFileDetailModal/updateDatas',
      payload: {
        filePreviewCurrentFileId: '',
        fileType: '',
        isInOpenFile: false,
        isOpenAttachmentFile: false,
        filePreviewCurrentSize: '',
        filePreviewCurrentName: '',
        filePreviewCurrentFileResourceId: ''
      }
    })
  }

  getUploadProps = () => {
    const { fileList } = this.state
    const {
      processInfo = {},
      itemValue,
      processEditDatas = [],
      parentKey
    } = this.props
    const { id: flow_node_instance_id } = processEditDatas[parentKey]
    const { org_id, board_id, folder_id, id: flow_instance_id } = processInfo
    const { id: field_id } = itemValue
    return {
      name: 'file',
      action: '/api/projects/v2/flow/task/upload',
      headers: {
        Authorization: Cookies.get('Authorization'),
        refreshToken: Cookies.get('refreshToken'),

        ...setUploadHeaderBaseInfo({
          orgId: org_id,
          boardId: board_id,
          aboutBoardOrganizationId: org_id,
          contentDataType: 'file'
        })
      },
      method: 'post',
      data: {
        flow_instance_id,
        flow_node_instance_id,
        field_id
      },
      fileList: fileList,
      withCredentials: true,
      multiple: false,
      showUploadList: false,
      beforeUpload: this.onBeforeUpload,
      onChange: this.handleChange,
      customRequest: this.customRequest
    }
  }

  // 自定义上传
  customRequest = async e => {
    let {
      action,
      data,
      file,
      filename,
      headers,
      onError,
      onProgress,
      onSuccess,
      withCredentials
    } = e
    const formData = new FormData()
    formData.append(filename, file)
    // 小文件上传
    if (data) {
      Object.keys(data).forEach(key => {
        formData.append(key, data[key])
      })
    }
    const context = this
    // 进行文件上传
    axios
      .post(action, formData, {
        withCredentials,
        headers,
        timeout: 0,
        onUploadProgress: ({ total, loaded }) => {
          onProgress(
            { percent: Math.round((loaded / total) * 100).toFixed(0) },
            file
          )
        },
        cancelToken: new CancelToken(function executor(c) {
          context.cancelAxios = c
        })
      })
      .then(({ data: response }) => {
        onSuccess(response, file)
      })
      .catch(onError)

    return {
      abort() {}
    }
  }

  // 删除文件
  handleDeleteProcessFile = (e, shouldDeleteItem, UID) => {
    e && e.stopPropagation()
    const { dispatch } = this.props
    let that = this
    this.setState({
      isDeleteProcessFile: true
    })
    // if (!shouldDeleteItem) {
    //   this.setState({
    //     isDeleteProcessFile: false
    //   })
    // }
    if (this.state.isDeleteProcessFile) {
      message.warn(`正在删除${currentNounPlanFilterName(FILES)}中...`)
      return
    }
    const filterData = (shouldDeleteItem, UID) => {
      const { itemKey, parentKey, processEditDatas = [] } = this.props
      const { forms = [] } = processEditDatas[parentKey]
      const { fileList = [], fileFlow = [] } = this.state
      let newFilesData = [...fileList] || []
      newFilesData = newFilesData.filter(item => item.uid != UID)
      this.setState({
        fileList: newFilesData
      })
      let temp_list =
        (newFilesData && newFilesData.filter(item => item.status != 'error')) ||
        []
      this.updateEdit({ value: temp_list }, 'files')
    }
    setTimeout(() => {
      if (!shouldDeleteItem && UID) {
        // 表示是文件上传失败之后
        this.setState({
          isDeleteProcessFile: false
        })
        filterData(shouldDeleteItem, UID)
        return
      } else {
        dispatch({
          type: 'publicProcessDetailModal/deleteProcessFile',
          payload: {
            id: shouldDeleteItem,
            calback: () => {
              setTimeout(() => {
                message.success(`删除${currentNounPlanFilterName(FILES)}成功`)
                that.setState({
                  isDeleteProcessFile: false
                })
                filterData(shouldDeleteItem, UID)
              }, 50)
            }
          }
        })
      }
    })
  }

  getEllipsisFileName = name => {
    // wx6535e025f795dca9.o6zAJs5_pqZsbrr7sJng7qkxKKbM.ZhMftVUvAIJ9b5dcb721199c1b8f4f84b0954a80e589.png
    // let str = 'wx6535e025f795dca9.o6zAJs5_pqZsbrr7sJng7qkxKKbM.ZhMftVUvAIJ9b5dcb721199c1b8f4f84b0954a80e589.png'
    let str = name
    if (!name) return
    let arr = str.split('.')
    arr.splice(-1, 1)
    arr.join('.')
    return arr
  }

  renderFileTypeArrayText = () => {
    const { itemValue } = this.props
    const { limit_file_type = [] } = itemValue
    const fileTypeArray = [...limit_file_type]
    let fileTypeArrayText = [] //文档类型转化中文
    for (let i = 0; i < fileTypeArray.length; i++) {
      if (fileTypeArray[i] === 'document') {
        fileTypeArrayText.push('文档')
      } else if (fileTypeArray[i] === 'image') {
        fileTypeArrayText.push('图像')
      } else if (fileTypeArray[i] === 'audio') {
        fileTypeArrayText.push('音频')
      } else if (fileTypeArray[i] === 'video') {
        fileTypeArrayText.push('视频')
      }
    }
    return fileTypeArrayText.join('、')
  }

  renderFileList = item => {
    const { fileList = [] } = this.state
    let gold_item_id =
      item.status &&
      item.status == 'done' &&
      item.response &&
      item.response.code == '0' &&
      item.response.data.flow_file_id
    let gold_item_error_messaage =
      item.status &&
      item.status == 'error' &&
      item.error &&
      item.error.response &&
      item.error.response.data &&
      item.error.response.data.code == '1' &&
      item.error.response.data.message
    const { percent, status, errorMsg } = item
    // let flag = fileList && fileList.find(item => item.percent && Number(item.percent) != 0 && Number(item.percent) != 100)
    // console.log(flag,'sssssssssssssss_flag')
    // if (flag) {
    //   this.props.updateState && this.props.updateState(true)
    // } else {
    //   this.props.updateState && this.props.updateState(false)
    // }
    const alrm_obj = {}
    if (status == 'error') {
      if (errorMsg) {
        alrm_obj.title = errorMsg
      } else {
        alrm_obj.title = gold_item_error_messaage || '文件上传错误'
      }
    }
    return (
      <>
        <div
          key={item.uid}
          className={indexStyles.file_item}
          onClick={e => {
            this.onFilePreview(e, item)
          }}
        >
          <div
            style={{ display: 'flex', alignItems: 'center', flex: '1' }}
            {...alrm_obj}
          >
            <span
              className={`${globalStyles.authTheme} ${indexStyles.file_theme_code}`}
            >
              &#xe64d;
            </span>
            <span
              style={{
                color: item.status && item.status == 'error' ? 'red' : 'inherit'
              }}
              className={indexStyles.file_name}
            >
              <span
                style={{
                  maxWidth: '874px',
                  display: 'inline-block',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  color:
                    item.status && item.status == 'error' ? 'red' : 'inherit'
                }}
              >
                {this.getEllipsisFileName(item.file_name || item.name)}
              </span>
              {getSubfixName(item.file_name || item.name)}
            </span>
          </div>
          <div style={{ flexShrink: 0 }}>
            <span
              onClick={e => {
                this.handleDeleteProcessFile(
                  e,
                  item.flow_file_id || gold_item_id,
                  item.uid
                )
              }}
              className={indexStyles.del_name}
            >
              删除
            </span>
          </div>
        </div>
        {/* <div className={indexStyles.file_percent}></div> */}
        {(percent && Number(percent) != 0 && Number(percent) != 100) ||
        status == 'uploading' ? (
          <span className={indexStyles.upload_file_progress}>
            <Progress
              style={{ top: '-12px', height: '2px' }}
              showInfo={false}
              percent={percent}
            />
          </span>
        ) : (
          ''
        )}
      </>
    )
  }

  render() {
    const {
      itemValue,
      isInOpenFile,
      fileType,
      filePreviewCurrentFileId,
      filePreviewCurrentName
    } = this.props
    const {
      title,
      limit_file_num,
      limit_file_type,
      limit_file_size,
      is_required
    } = itemValue
    const { fileList = [] } = this.state
    return (
      <div className={indexStyles.text_form}>
        <p>
          <span>
            {title}:&nbsp;&nbsp;
            {is_required == '1' && <span style={{ color: '#F5222D' }}>*</span>}
          </span>
        </p>
        <Upload
          {...this.getUploadProps()}
          className={indexStyles.upload_process_file}
        >
          <div className={indexStyles.upload_static}>
            <span
              style={{ color: '#1890FF', fontSize: '28px', marginTop: '-6px' }}
              className={`${globalStyles.authTheme}`}
            >
              &#xe692;
            </span>
            <div style={{ flex: 1, marginLeft: '12px' }}>
              <div className={indexStyles.file_drap_tips}>
                点击或拖拽文件到此开始上传
              </div>
              <div className={indexStyles.file_layout}>
                {limit_file_size == 0
                  ? `不限制大小`
                  : `${limit_file_size}MB以内`}
                、
                {limit_file_num == 0 ? `不限制数量` : `最多${limit_file_num}个`}
                、 {this.renderFileTypeArrayText()}格式
              </div>
            </div>
          </div>
        </Upload>
        {fileList &&
          fileList.map(item => {
            return this.renderFileList(item)
          })}
        {isInOpenFile && (
          <FileListRightBarFileDetailModal
            filePreviewCurrentFileId={filePreviewCurrentFileId}
            fileType={fileType}
            filePreviewCurrentName={filePreviewCurrentName}
            file_detail_modal_visible={isInOpenFile}
            setPreviewFileModalVisibile={this.setPreviewFileModalVisibile}
          />
        )}
      </div>
    )
  }
}

function mapStateToProps({
  publicProcessDetailModal: { processEditDatas = [], processInfo = {} },
  publicFileDetailModal: {
    filePreviewCurrentFileId,
    fileType,
    isInOpenFile,
    filePreviewCurrentName
  }
}) {
  return {
    processEditDatas,
    processInfo,
    filePreviewCurrentFileId,
    fileType,
    isInOpenFile,
    filePreviewCurrentName
  }
}
