import React, { Component } from 'react'
import { connect } from 'dva'
import {
  message,
  Upload,
  Modal,
  Button,
  Dropdown,
  Icon,
  Checkbox,
  TreeSelect
} from 'antd'
import styles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import MenuSearchPartner from '@/components/MenuSearchMultiple/MenuSearchPartner.js'
import { getFolderList } from '@/services/technological/file'
import { isApiResponseOk } from '@/utils/handleResponseData'
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
const { TreeNode } = TreeSelect
let uploadMaxFileSize = []
/**上传附件组件 */
@connect(mapStateToProps)
export default class UploadAttachment extends Component {
  constructor(props) {
    super(props)
    this.state = {
      uploadFileVisible: false,
      fileList: [],
      uploadFilePreviewList: [],
      toNoticeList: [],
      isOnlyNoticePersonsVisit: false,
      boardFolderTreeData: [],
      fileSavePath: null,
      uploading: false
    }
  }

  componentWillReceiveProps(nextProps) {
    const { projectDetailInfoData = {} } = nextProps
    if (
      projectDetailInfoData &&
      Object.keys(projectDetailInfoData) &&
      Object.keys(projectDetailInfoData).length
    ) {
      this.getDefaultNoticeUser(projectDetailInfoData.data)
    }
  }

  //确定，上传开始
  handleOk = e => {
    this.handleUpload()
  }

  closeUploadAttachmentModal = () => {
    if (this.state.uploading) {
      return message.error('上传中：暂不能操作')
    }
    const {
      projectDetailInfoData: { data = [] }
    } = this.props
    this.setState(
      {
        uploadFilePreviewList: [],
        fileList: [],
        toNoticeList: [],
        isOnlyNoticePersonsVisit: false,
        fileSavePath: null
      },
      () => {
        this.setUploadFileVisible(false)
        this.getDefaultNoticeUser(data)
      }
    )
    uploadMaxFileSize = []
  }

  setUploadFileVisible = visible => {
    this.setState({
      uploadFileVisible: visible
    })
  }

  getUploadProps = () => {
    let $that = this
    const { fileList } = this.state
    return {
      name: 'file',
      headers: {
        authorization: 'authorization-text'
      },
      fileList: fileList,
      withCredentials: true,
      multiple: true,
      showUploadList: false,
      beforeUpload: this.onBeforeUpload,
      onChange(info) {
        if (info.file.status !== 'uploading') {
          $that.onCustomPreviewFile(info)
        } else if (info.file.status === 'done') {
          message.success(`${info.file.name} file uploaded successfully`)
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name} file upload failed.`)
        }
      }
    }
  }

  handleUpload = () => {
    this.setState({
      uploading: true
    })
    const {
      projectDetailInfoData: { org_id, board_id },
      card_id,
      isNotShowNoticeList,
      url
    } = this.props
    const {
      fileSavePath = null,
      fileList = [],
      toNoticeList,
      isOnlyNoticePersonsVisit
    } = this.state

    const formData = new FormData()
    fileList.forEach(file => {
      formData.append('file', file)
    })

    let loading = message.loading('文件正在上传中...', 0)
    let notify_user_ids = []
    for (var i = 0; i < toNoticeList.length; i++) {
      notify_user_ids.push(toNoticeList[i].user_id)
    }
    let params = isNotShowNoticeList
      ? {
          board_id: board_id,
          card_id: card_id,
          folder_id: fileSavePath
        }
      : {
          board_id: board_id,
          card_id: card_id,
          folder_id: fileSavePath,
          is_limit_access: isOnlyNoticePersonsVisit ? 1 : 0,
          notify_user_ids: notify_user_ids.join(',')
        }
    axios({
      url: url ? url : `/api/projects/v2/card/attachment/upload`,
      method: 'post',
      //processData: false,
      data: formData,
      headers: {
        Authorization: Cookies.get('Authorization'),
        refreshToken: Cookies.get('refreshToken'),

        ...setUploadHeaderBaseInfo({
          orgId: org_id,
          boardId: board_id,
          aboutBoardOrganizationId: org_id,
          contentDataType: 'card',
          contentDataId: card_id
        })
      },
      params: {
        ...params
      },
      timeout: 0
    })
      .then(res => {
        const apiResult = res.data
        if (isApiResponseOk(apiResult)) {
          message.destroy()
          message.success('上传成功')
          this.props.onFileListChange(apiResult.data)
          this.setState(
            {
              uploading: false
            },
            () => {
              this.closeUploadAttachmentModal()
            }
          )
        } else {
          const apiResult = res.data
          message.warn(apiResult.message)
          this.setState({
            uploading: false
          })
          this.setUploadFileVisible(false)
          this.closeUploadAttachmentModal()
        }
      })
      .catch((error, e) => {
        console.log(error)
        message.destroy()
        if (_.has(error, 'response.status')) {
          switch (error.response.status) {
            case 413:
              message.error('总文件超过100M,请分多次上传')
              this.setState({
                uploading: false
              })
              // this.setUploadFileVisible(false);
              this.closeUploadAttachmentModal()
              break
            default:
              message.error('上传失败')
              this.setState({
                uploading: false
              })
              // this.setUploadFileVisible(false);
              this.closeUploadAttachmentModal()
              break
          }
        } else if (error.message.indexOf('timeout of') != -1) {
          message.error('上传文件超时了')
          this.setState({
            uploading: false
          })
          // this.setUploadFileVisible(false);
          this.closeUploadAttachmentModal()
          return false
        } else {
          // console.log('进来了');
          message.error('上传失败')
          this.setState({
            uploading: false
          })
          // this.setUploadFileVisible(false);
          this.closeUploadAttachmentModal()
        }
      })
  }

  onBeforeUpload = file => {
    const { board_id } = this.props
    if (
      !checkIsHasPermissionInBoard(
        PROJECT_TEAM_CARD_ATTACHMENT_UPLOAD,
        board_id
      )
    ) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const { size } = file
    uploadMaxFileSize.push(size)
    let sum = 0
    for (let i = 0; i < uploadMaxFileSize.length; i++) {
      sum += uploadMaxFileSize[i]
    }
    if (sum == 0) {
      message.error(`不能上传空文件`)
      // this.setUploadFileVisible(false);
      this.closeUploadAttachmentModal()
      uploadMaxFileSize = []
      return false
    } else if (sum > UPLOAD_FILE_SIZE * 1024 * 1024) {
      message.error(`上传文件不能超过${UPLOAD_FILE_SIZE}MB`)
      // this.setUploadFileVisible(false);
      setTimeout(() => {
        this.closeUploadAttachmentModal()
        uploadMaxFileSize = []
      }, 50)
      return false
    } else {
      this.setState(state => ({
        fileList: [...state.fileList, file]
      }))
      this.setUploadFileVisible(true)
      return false
    }
  }
  onCustomPreviewFile = info => {
    this.setState({
      uploadFilePreviewList: info.fileList
    })
  }

  //修改通知人的回调 S
  chirldrenTaskChargeChange = data => {
    if (this.state.uploading) {
      message.warn('正在上传中...请勿操作')
      return false
    }
    const { projectDetailInfoData = {} } = this.props
    // 多个任务执行人
    const membersData = projectDetailInfoData['data'] //所有的人
    // const excutorData = new_userInfo_data //所有的人
    let newNoticeUserList = []
    const { selectedKeys = [], type, key } = data
    for (let i = 0; i < selectedKeys.length; i++) {
      for (let j = 0; j < membersData.length; j++) {
        if (selectedKeys[i] === membersData[j]['user_id']) {
          newNoticeUserList.push(membersData[j])
        }
      }
    }

    this.setState({
      toNoticeList: newNoticeUserList
    })

    if (data.type === 'add') {
    } else if (data.type === 'remove') {
      //toNoticeList.add();
    }
  }
  // 添加执行人的回调 E

  // 移除执行人的回调 S
  handleRemoveExecutors = (e, shouldDeleteItem) => {
    e && e.stopPropagation()
    if (this.state.uploading) {
      message.warn('正在上传中...请勿操作')
      return false
    }
    const { toNoticeList = [] } = this.state
    let new_toNoticeList = [...toNoticeList]
    new_toNoticeList.map((item, index) => {
      if (item.user_id == shouldDeleteItem) {
        new_toNoticeList.splice(index, 1)
      }
    })
    this.setState({
      toNoticeList: new_toNoticeList
    })
  }
  // 移除执行人的回调 E

  onChangeOnlyNoticePersonsVisit = e => {
    const { board_id } = this.props
    if (
      !checkIsHasPermissionInBoard(
        PROJECT_TEAM_BOARD_CONTENT_PRIVILEGE,
        board_id
      )
    ) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    if (this.state.uploading) {
      message.warn('正在上传中...请勿操作')
      return false
    }
    this.setState({
      isOnlyNoticePersonsVisit: e.target.checked
    })
  }

  renderFolderTreeNodes = data => {
    return data.map(item => {
      if (item.child_data && item.child_data.length > 0) {
        return (
          <TreeNode
            title={item.folder_name}
            key={item.folder_id}
            value={item.folder_id}
            dataRef={item}
          >
            {this.renderFolderTreeNodes(item.child_data)}
          </TreeNode>
        )
      } else {
        return (
          <TreeNode
            disabled={item.disabled && item.disabled}
            title={item.folder_name}
            key={item.folder_id}
            value={item.folder_id}
            dataRef={item}
          />
        )
      }
    })
  }

  renderSelectBoardFileTreeList = () => {
    const { is_file_tree_loading, boardFolderTreeData = [] } = this.props
    // const { boardFolderTreeData } = this.state;
    if (is_file_tree_loading) {
      return (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            textAlign: 'center',
            height: '50px',
            lineHeight: '48px',
            overflow: 'hidden',
            color: 'rgba(0, 0, 0, 0.25)'
          }}
          className={`${styles.page_card_Normal} ${styles.directoryTreeWapper}`}
        >
          数据加载中
        </div>
      )
    }

    return this.renderFolderTreeNodes([boardFolderTreeData])
  }

  onChangeFileSavePath = value => {
    if (this.state.uploading) {
      message.warn('正在上传中...请勿操作')
      return false
    }
    if (value == '0' || value == '') {
      message.warn('请选择一个文件目录', MESSAGE_DURATION_TIME)
      return false
    } else {
      this.setState({
        fileSavePath: value
      })
    }
  }

  // 获取默认附件提醒人 负责人 || 操作人
  getDefaultNoticeUser = data => {
    if (!data) return
    const { executors = [] } = this.props
    const { id } = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : {}
    let new_toNoticeList = []
    let tempIds = []
    let new_executors = [...executors]
    let new_data = [...data]
    if (executors && executors.length) {
      new_executors.map(item => {
        tempIds.push(item.user_id)
      })
    }
    new_data &&
      new_data.map(item => {
        if (item.user_id == id || tempIds.indexOf(item.user_id) != -1) {
          new_toNoticeList.push(item)
        }
      })
    this.setState({
      toNoticeList: new_toNoticeList
    })
  }

  onVisibleChange = visible => {
    if (this.state.uploading) {
      message.warn('正在上传中...请勿操作')
      return false
    }
    this.setState({
      visible: visible
    })
  }

  render() {
    // 父组件传递的值
    const {
      visible,
      children,
      projectDetailInfoData = {},
      projectDetailInfoData: { board_id, org_id },
      boardFolderTreeData,
      title,
      listDescribe,
      isNotShowNoticeList
    } = this.props
    const {
      uploadFileVisible,
      uploadFilePreviewList = [],
      toNoticeList = [],
      fileSavePath,
      uploading
    } = this.state

    const { data: projectMemberData } = projectDetailInfoData
    return (
      <div>
        <Upload {...this.getUploadProps()} className={styles.uploadWrapper}>
          {children}
        </Upload>

        <Modal
          destroyOnClose={true}
          title={
            <div
              style={{
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: 600,
                color: 'rgba(0,0,0,0.85)'
              }}
            >
              {title ? title : '上传附件设置'}
            </div>
          }
          getContainer={() =>
            document.getElementById('technologicalLayoutWrapper') ||
            document.body
          }
          visible={uploadFileVisible || visible}
          onOk={this.handleOk}
          onCancel={this.closeUploadAttachmentModal}
          zIndex={1007}
          width={556}
          maskClosable={false}
          okButtonProps={{
            loading: uploading,
            disabled:
              (boardFolderTreeData && boardFolderTreeData.length == '0') ||
              !fileSavePath
          }}
          cancelButtonProps={uploading ? { disabled: true } : {}}
          okText={uploading ? '上传中……' : '确定'}
        >
          <div>
            <span
              style={{ fontSize: '16px', color: 'rgba(0,0,0,0.45)' }}
              className={`${globalStyles.authTheme}`}
            >
              &#xe6b3;
            </span>
            {listDescribe ? listDescribe : '附件列表'}：
          </div>
          <div className={styles.fileListWrapper}>
            {uploadFilePreviewList.length > 0
              ? uploadFilePreviewList.map(file => {
                  return (
                    <div key={file.uid} className={styles.fileItem}>
                      {file.name}
                    </div>
                  )
                })
              : ''}
            {/* <div className={styles.fileItem}><div className={styles.itemLeft}>结构方案.pdf</div><div className={styles.itemRight}> <Button size={'small'}>取消</Button></div></div>
                        <div className={styles.fileItem}>结构方案1.pdf</div> */}
          </div>
          {!isNotShowNoticeList && (
            <>
              <div style={{ marginTop: '14px' }}>
                <span
                  style={{ fontSize: '16px', color: 'rgba(0,0,0,0.45)' }}
                  className={`${globalStyles.authTheme}`}
                >
                  &#xe7b2;
                </span>
                提醒谁查看:
              </div>
              <div className={styles.noticeUsersWrapper}>
                {/* 通知人添加与显示区域 */}
                <span style={{ flex: '1' }}>
                  {!toNoticeList.length ? (
                    <div style={{ flex: '1', position: 'relative' }}>
                      <Dropdown
                        visible={this.state.visible}
                        trigger={['click']}
                        overlayClassName={styles.overlay_pricipal}
                        onVisibleChange={this.onVisibleChange}
                        getPopupContainer={triggerNode =>
                          triggerNode.parentNode
                        }
                        overlayStyle={{ maxWidth: '200px' }}
                        overlay={
                          <MenuSearchPartner
                            listData={projectMemberData}
                            keyCode={'user_id'}
                            searchName={'name'}
                            currentSelect={toNoticeList}
                            board_id={board_id}
                            invitationType="1"
                            invitationId={board_id}
                            invitationOrg={org_id}
                            chirldrenTaskChargeChange={
                              this.chirldrenTaskChargeChange
                            }
                          />
                        }
                      >
                        {/* 添加通知人按钮 */}

                        <div className={styles.addNoticePerson}>
                          <Icon
                            type="plus-circle"
                            style={{ fontSize: '40px', color: '#40A9FF' }}
                          />
                        </div>
                      </Dropdown>
                    </div>
                  ) : (
                    <div style={{ flex: '1', position: 'relative' }}>
                      <Dropdown
                        visible={this.state.visible}
                        trigger={['click']}
                        overlayClassName={styles.overlay_pricipal}
                        onVisibleChange={this.onVisibleChange}
                        getPopupContainer={triggerNode =>
                          triggerNode.parentNode
                        }
                        overlay={
                          <MenuSearchPartner
                            invitationType="1"
                            invitationId={board_id}
                            invitationOrg={org_id}
                            listData={projectMemberData}
                            keyCode={'user_id'}
                            searchName={'name'}
                            currentSelect={toNoticeList}
                            chirldrenTaskChargeChange={
                              this.chirldrenTaskChargeChange
                            }
                            board_id={board_id}
                          />
                        }
                      >
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                          {/* 添加通知人按钮 */}
                          <div className={styles.addNoticePerson}>
                            <Icon
                              type="plus-circle"
                              style={{ fontSize: '40px', color: '#40A9FF' }}
                            />
                          </div>

                          {toNoticeList.map(value => {
                            const { avatar, name, user_name, user_id } = value
                            return (
                              <div
                                style={{ display: 'flex', flexWrap: 'wrap' }}
                                key={user_id}
                              >
                                <div
                                  className={`${styles.user_item}`}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    position: 'relative',
                                    margin: '2px 0',
                                    textAlign: 'center'
                                  }}
                                  key={user_id}
                                >
                                  {avatar ? (
                                    <img
                                      style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: 20,
                                        margin: '0 2px'
                                      }}
                                      src={avatar}
                                    />
                                  ) : (
                                    <div
                                      style={{
                                        width: '40px',
                                        height: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 20,
                                        backgroundColor: '#f5f5f5',
                                        margin: '0 2px'
                                      }}
                                    >
                                      <Icon
                                        type={'user'}
                                        style={{
                                          fontSize: 12,
                                          color: '#8c8c8c'
                                        }}
                                      />
                                    </div>
                                  )}
                                  <div
                                    style={{ marginRight: 8, fontSize: '14px' }}
                                  >
                                    {name || user_name || '佚名'}
                                  </div>
                                  <span
                                    onClick={e => {
                                      this.handleRemoveExecutors(e, user_id)
                                    }}
                                    className={`${styles.userItemDeleBtn}`}
                                  ></span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </Dropdown>
                    </div>
                  )}
                </span>
              </div>
              <div style={{ marginTop: '16px' }}>
                <Checkbox
                  checked={this.state.isOnlyNoticePersonsVisit}
                  onChange={this.onChangeOnlyNoticePersonsVisit}
                >
                  仅被提醒的人可访问该文件
                </Checkbox>
              </div>
            </>
          )}
          {/* <div style={{ marginTop: '32px' }}>
            附件存放路径
                    </div> */}
          <div style={{ marginTop: '16px' }}>
            <div className={styles.selectFolderWapper}>
              <TreeSelect
                // defaultValue={fileSavePath}
                disabled={
                  boardFolderTreeData && boardFolderTreeData.length == '0'
                }
                value={fileSavePath}
                showSearch={false}
                style={{ width: 508 }}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                placeholder="请选择"
                allowClear={true}
                treeDefaultExpandAll={true}
                onChange={this.onChangeFileSavePath}
              >
                {this.renderSelectBoardFileTreeList()}
              </TreeSelect>
            </div>
            {boardFolderTreeData && boardFolderTreeData.length == '0' && (
              <span
                style={{
                  display: 'block',
                  marginTop: '15px',
                  marginLeft: '4px',
                  color: '#FAAD14'
                }}
              >
                暂无访问文件权限
              </span>
            )}
          </div>
        </Modal>
      </div>
    )
  }
}

// 只关联public弹窗内的数据
function mapStateToProps({
  technological: {
    datas: { userBoardPermissions }
  },
  projectDetail: {
    datas: { projectDetailInfoData = {} }
  }
}) {
  return { userBoardPermissions, projectDetailInfoData }
}

UploadAttachment.defaultProps = {
  card_id: '', // 对应上传的任务ID
  executors: [], // 默认通知人
  isNotShowNoticeList: false, // 是否不显示通知人列表
  boardFolderTreeData: [], //文件路径列表
  title: '', // 对应设置上传弹窗标题
  listDescribe: '', //说明列表名称
  url: '', // 上传路径
  onFileListChange: function() {} // 上传成功回调
}
