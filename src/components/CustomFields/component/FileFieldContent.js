import React, { Component } from 'react'
import commonStyles from '../common.less'
import globalsetStyles from '@/globalset/css/globalClassName.less'
import {
  Select,
  Dropdown,
  Menu,
  Icon,
  DatePicker,
  Input,
  InputNumber,
  Upload,
  Progress,
  message
} from 'antd'
import { categoryIcon } from '../../../routes/organizationManager/CustomFields/handleOperateModal'
import { connect } from 'dva'
import { isApiResponseOk } from '../../../utils/handleResponseData'
import {
  isObjectValueEqual,
  timeToTimestamp,
  timestampFormat
} from '../../../utils/util'
import {
  setUploadHeaderBaseInfo,
  getSubfixName
} from '../../../utils/businessFunction'
import Cookies from 'js-cookie'
import axios from 'axios'
import { UPLOAD_FILE_SIZE } from '../../../globalset/js/constant'
import FileListRightBarFileDetailModal from '../../../routes/Technological/components/ProjectDetail/FileModule/FileListRightBarFileDetailModal'
import { fileDelete } from '../../../services/technological/file'
import { set } from 'core-js/fn/dict'
import { judgeFileType } from '../../TaskDetailModal/handleOperateModal'

let CancelToken = axios.CancelToken
@connect(
  ({
    projectDetail: {
      datas: { projectDetailInfoData = {} }
    },
    publicFileDetailModal: {
      filePreviewCurrentFileId,
      fileType,
      isInOpenFile,
      filePreviewCurrentName
    }
  }) => ({
    projectDetailInfoData,
    filePreviewCurrentFileId,
    fileType,
    isInOpenFile,
    filePreviewCurrentName
  })
)
export default class FileFieldContent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      itemValue: props.itemValue,
      itemKey: props.itemKey
    }
  }

  componentDidMount() {
    const { itemValue = {} } = this.state
    let { field_value: fileList = [] } = itemValue
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

  componentWillReceiveProps(nextProps) {
    if (isObjectValueEqual(this.props.itemValue, nextProps.itemValue)) return
    let { field_value: fileList = [] } = nextProps.itemValue
    fileList =
      fileList &&
      fileList.map(item => {
        item.uid = item.file_id
        return item
      })
    this.setState({
      itemValue: nextProps.itemValue,
      itemKey: nextProps.itemKey,
      fileList: fileList
    })
  }

  // 删除关联字段
  handleDeleteRelationField = (e, id) => {
    e && e.stopPropagation()
    this.props
      .dispatch({
        type: 'organizationManager/deleteRelationCustomField',
        payload: {
          id: id
        }
      })
      .then(res => {
        if (isApiResponseOk(res)) {
          this.props.handleUpdateModelDatas &&
            this.props.handleUpdateModelDatas({ type: 'delete', data: id })
        }
      })
  }

  onBeforeUpload = (file, fileList) => {
    const { size } = file
    if (size == 0) {
      file.status = 'error'
      file.errorMsg = `不能上传空文件`
      return false
    } else if (size > UPLOAD_FILE_SIZE * 1024 * 1024) {
      file.status = 'error'
      file.errorMsg = `上传文件不能超过${UPLOAD_FILE_SIZE}MB`
      return false
    } else {
    }
  }

  handleChange = ({ file, fileList, event }) => {
    const {
      itemValue: { id, field_value = [] }
    } = this.state
    if (file.status === 'done' && file.response.code === '0') {
      if (file.response && file.response.data) {
        let file_id = file.response.data.id
        let file_ids = []
        field_value.forEach(item => {
          file_ids.push(item.id)
        })
        file_ids.push(file_id)
        this.props
          .dispatch({
            type: 'organizationManager/setRelationCustomField',
            payload: {
              id: id,
              field_value: file_ids.join(',')
            }
          })
          .then(res => {
            if (isApiResponseOk(res)) {
              this.props.handleUpdateModelDatas &&
                this.props.handleUpdateModelDatas({
                  data: res.data,
                  type: 'update'
                })
            }
          })
      }
    }
    let new_filelist = [...fileList]
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
    this.setState({
      fileList: new_filelist
    })
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

  getUploadProps = () => {
    const { fileList = [] } = this.state
    const {
      projectDetailInfoData: { org_id, board_id }
    } = this.props
    return {
      name: 'file',
      action: '/api/projects/file/upload/common',
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
        board_id: board_id,
        source_type: '0'
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

  handleDeleteCustomFile = (e, shouldDeleteItem, UID) => {
    e && e.stopPropagation()
    this.setState({
      isDeleteCustomFile: true
    })
    if (this.state.isDeleteCustomFile) {
      message.warn('正在删除文件, 请稍后')
      return
    }
    const filterData = (shouldDeleteItem, UID) => {
      const { fileList = [] } = this.state
      let newFilesData = [...fileList] || []
      newFilesData = newFilesData.filter(item => item.uid != UID)
      this.setState({
        fileList: newFilesData
      })
    }
    if (!shouldDeleteItem && UID) {
      // 表示是文件上传失败之后
      this.setState({
        isDeleteCustomFile: false
      })
      filterData(shouldDeleteItem, UID)
      return
    } else {
      fileDelete({
        id: shouldDeleteItem
      }).then(res => {
        if (isApiResponseOk(res)) {
          setTimeout(() => {
            message.success('删除文件成功')
          }, 200)
          this.setState({
            isDeleteCustomFile: false
          })
          const {
            itemValue: { id, field_value = [] }
          } = this.state
          let file_ids = []
          field_value.forEach(item => {
            if (item.id != shouldDeleteItem) {
              file_ids.push(item.id)
            }
          })
          this.props
            .dispatch({
              type: 'organizationManager/setRelationCustomField',
              payload: {
                id: id,
                field_value: file_ids.join(',')
              }
            })
            .then(res => {
              if (isApiResponseOk(res)) {
                this.props.handleUpdateModelDatas &&
                  this.props.handleUpdateModelDatas({
                    data: res.data,
                    type: 'update'
                  })
                // filterData(shouldDeleteItem, UID)
              }
            })
        } else {
          this.setState({
            isDeleteCustomFile: false
          })
        }
      })
    }
  }

  onFilePreview = (e, item) => {
    e && e.stopPropagation()
    const file_id =
      item.id ||
      (item.response && item.response.data && item.response.data.id) ||
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
    this.setState({
      setPreviewFileModalVisibile: !this.state.setPreviewFileModalVisibile
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
    this.setState({
      setPreviewFileModalVisibile: !this.state.setPreviewFileModalVisibile
    })
  }

  getEllipsisFileName = name => {
    let str = name
    if (!name) return
    let arr = str.split('.')
    arr.splice(-1, 1)
    arr.join('.')
    return arr
  }

  renderFileList = item => {
    const { fileList = [] } = this.state
    let gold_item_id =
      item.status &&
      item.status == 'done' &&
      item.response &&
      item.response.code == '0' &&
      item.response.data.id
    let gold_item_error_messaage =
      item.status &&
      item.status == 'error' &&
      item.error &&
      item.error.response &&
      item.error.response.data &&
      item.error.response.data.code == '1' &&
      item.error.response.data.message
    const { percent, status, errorMsg } = item
    let gold_normal_message =
      (item.status &&
        item.status == 'done' &&
        item.response &&
        item.response.data.code == '0' &&
        item.response.data.file_name) ||
      item.file_name
    const alrm_obj = {}
    if (status == 'error') {
      if (errorMsg) {
        alrm_obj.title = errorMsg
      } else {
        alrm_obj.title = gold_item_error_messaage || '文件上传错误'
      }
    } else {
      alrm_obj.title = gold_normal_message
    }
    return (
      <>
        <div
          key={item.uid || item.id}
          className={commonStyles.file_item}
          onClick={e => {
            this.onFilePreview(e, item)
          }}
        >
          <span
            className={`${commonStyles.file_theme_code} ${globalsetStyles.authTheme}`}
            dangerouslySetInnerHTML={{
              __html: judgeFileType(item.file_name || item.name)
            }}
          ></span>
          <div
            style={{
              display: 'flex',
              flex: '1',
              flexDirection: 'column',
              cursor: 'pointer'
            }}
            {...alrm_obj}
          >
            <span
              style={{
                color: item.status && item.status == 'error' ? 'red' : 'inherit'
              }}
              className={commonStyles.file_name}
            >
              <span
                style={{
                  maxWidth: '315px',
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
            <div
              style={{
                marginLeft: '6px',
                color: 'rgba(0,0,0,0.45)',
                fontSize: '12px'
              }}
              className={commonStyles.file_info}
            >
              {(item.creator && item.creator.name) || ''} 上传于{' '}
              {item.create_time &&
                timestampFormat(item.create_time, 'MM-dd hh:mm')}
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            <span
              onClick={e => {
                this.handleDeleteCustomFile(
                  e,
                  item.id || gold_item_id,
                  item.uid
                )
              }}
              className={commonStyles.del_name}
            >
              删除
            </span>
          </div>
        </div>
        {/* <div className={commonStyles.file_percent}></div> */}
        {(percent && Number(percent) != 0 && Number(percent) != 100) ||
        status == 'uploading' ? (
          <span className={commonStyles.upload_file_progress}>
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
      itemKey,
      inputValue,
      setPreviewFileModalVisibile
    } = this.state
    const {
      field_id,
      id,
      field_value,
      field_content: { name, field_type }
    } = itemValue
    const { fileList = [] } = this.state
    const {
      filePreviewCurrentFileId,
      fileType,
      isInOpenFile,
      filePreviewCurrentName
    } = this.props
    const { onlyShowPopoverContent } = this.props
    return (
      <div
        key={id}
        className={`${
          commonStyles.custom_field_item_wrapper
        } ${onlyShowPopoverContent &&
          commonStyles.custom_field_item_wrapper_1}`}
      >
        <div className={commonStyles.custom_field_item}>
          <div className={commonStyles.c_left}>
            <span
              onClick={e => {
                this.handleDeleteRelationField(e, id)
              }}
              className={`${globalsetStyles.authTheme} ${commonStyles.delete_icon}`}
            >
              &#xe7fe;
            </span>
            <div className={commonStyles.field_name}>
              <span
                className={`${globalsetStyles.authTheme} ${commonStyles.field_name_icon}`}
              >
                {categoryIcon(field_type).icon}
              </span>
              <span title={name}>{name}</span>
            </div>
          </div>
          <div style={{ flex: '1' }}>
            <div
              className={`${commonStyles.field_value} ${commonStyles.pub_hover}`}
            >
              <Upload {...this.getUploadProps()}>
                <div
                  onClick={this.onClick}
                  className={commonStyles.common_select}
                >
                  <span style={{ color: 'rgba(0,0,0,0.45)' }}>
                    {'上传文件'}
                  </span>
                </div>
              </Upload>
            </div>
            {fileList &&
              fileList.map(item => {
                return this.renderFileList(item)
              })}
          </div>
        </div>
        {isInOpenFile && setPreviewFileModalVisibile && (
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
