import React, { Component } from 'react'
import styles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import {
  getSubfixName,
  setBoardIdStorage,
  getGlobalData,
  checkIsHasPermissionInVisitControl,
  checkIsHasPermissionInBoard
} from '../../../../../../../utils/businessFunction'
import { Input, Menu, Dropdown, message, Tooltip, Modal } from 'antd'
import {
  PROJECT_FILES_FILE_INTERVIEW,
  NOT_HAS_PERMISION_COMFIRN,
  MESSAGE_DURATION_TIME,
  PROJECT_FILES_FILE_UPDATE
} from '../../../../../../../globalset/js/constant'
import { connect } from 'dva'
import {
  fileRemove,
  updateFolder
} from '../../../../../../../services/technological/file'
import { isApiResponseOk } from '../../../../../../../utils/handleResponseData'
import {
  fileItemIsHasUnRead,
  cardItemIsHasUnRead,
  folderItemHasUnReadNo
} from '../../../ganttBusiness'
import VisitControl from '../../../../VisitControl'
import {
  toggleContentPrivilege,
  setContentPrivilege,
  removeContentPrivilege
} from '../../../../../../../services/technological/project'
import { arrayNonRepeatfy } from '../../../../../../../utils/util'

@connect(mapStateToProps)
export default class FolderItem extends Component {
  constructor(props) {
    super(props)
    const { itemValue = {} } = this.props
    const { name } = itemValue
    this.state = {
      input_folder_value: name, // '',
      last_input_input_folder_value: name, //上次成功设置的名称
      local_name: name,
      visitControlModalVisible: false,
      currentVisitControlModalVisibleItem: '' // 表示当前点击的凭证
    }
  }

  // 过滤名字logo
  judgeFileType({ type, local_name }) {
    if (type == '1') {
      //文件夹
      return '&#xe6c4;'
    }
    let themeCode = '&#xe691;'
    const file_type = getSubfixName(local_name)
    switch (file_type) {
      case '.xls':
        themeCode = '&#xe6d5;'
        break
      case '.png':
        themeCode = '&#xe6d4;'
        break
      case '.xlsx':
        themeCode = '&#xe6d3;'
        break
      case '.ppt':
        themeCode = '&#xe6d2;'
        break
      case '.gif':
        themeCode = '&#xe6d1;'
        break
      case '.jpeg':
        themeCode = '&#xe6d0;'
        break
      case '.pdf':
        themeCode = '&#xe6cf;'
        break
      case '.docx':
        themeCode = '&#xe6ce;'
        break
      case '.txt':
        themeCode = '&#xe6cd;'
        break
      case '.doc':
        themeCode = '&#xe6cc;'
        break
      case '.jpg':
        themeCode = '&#xe6cb;'
        break
      default:
        themeCode = '&#xe691;'
        break
    }
    return themeCode
  }

  // 删除某一项
  requestRemoveItem = async () => {
    //
    const {
      board_id,
      current_folder_id,
      getFolderFileList,
      itemValue = {}
    } = this.props
    const { id, type } = itemValue

    const params = {
      board_id,
      arrays: JSON.stringify([{ type, id }])
    }

    const res = await fileRemove(params)
    if (isApiResponseOk(res)) {
      getFolderFileList({ id: current_folder_id })
    } else {
      message.error(res.message)
    }
  }

  // 访问控制切换的数据
  toggleVisitControlModal = (flag, calback) => {
    const {
      itemValue: { id }
    } = this.props
    this.setState(
      {
        visitControlModalVisible: flag,
        currentVisitControlModalVisibleItem: id
      },
      () => {
        // if (calback && typeof calback == 'function') calback()
      }
    )
  }
  // 点击弹窗取消的回调
  handleVisitControlModalCancel = () => {
    const { getFolderFileList, current_folder_id } = this.props
    const calback = () => {
      getFolderFileList({ id: current_folder_id })
    }
    this.toggleVisitControlModal(false, calback)
  }
  // 菜单点击
  menuItemClick = e => {
    e.domEvent.stopPropagation()
    const { key } = e
    switch (key) {
      case '1':
        const {
          itemValue: { board_id, privileges = [], is_privilege }
        } = this.props
        if (
          !checkIsHasPermissionInVisitControl(
            'edit',
            privileges,
            is_privilege,
            [],
            checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPDATE, board_id)
          )
        ) {
          setTimeout(() => {
            message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          }, 50)
          return
        }
        this.setIsShowChange(true)
        break
      case '2':
        this.requestRemoveItem()
        break
      case '3':
        setBoardIdStorage(this.props.itemValue.board_id)
        this.toggleVisitControlModal(true)
        break
      default:
        break
    }
  }

  // 渲染菜单
  renderOperateItemDropMenu = () => {
    const { itemValue = {} } = this.props
    const { type } = itemValue

    return (
      <Menu onClick={this.menuItemClick}>
        <Menu.Item key={3}>
          <span style={{ fontSize: 14, color: `rgba(0,0,0,0.65)`, width: 248 }}>
            <i className={`${globalStyles.authTheme}`} style={{ fontSize: 16 }}>
              &#xe86a;
            </i>{' '}
            访问控制
          </span>
        </Menu.Item>
        {type == '1' && (
          <Menu.Item key={1} style={{ width: 248 }}>
            <span
              style={{ fontSize: 14, color: `rgba(0,0,0,0.65)`, width: 248 }}
            >
              <i
                className={`${globalStyles.authTheme}`}
                style={{ fontSize: 16 }}
              >
                &#xe86d;
              </i>{' '}
              重命名
            </span>
          </Menu.Item>
        )}
        <Menu.Item key={2}>
          <span style={{ fontSize: 14, color: `rgba(0,0,0,0.65)`, width: 248 }}>
            <i className={`${globalStyles.authTheme}`} style={{ fontSize: 16 }}>
              &#xe68d;
            </i>{' '}
            移入回收站
          </span>
        </Menu.Item>
      </Menu>
    )
  }

  // 点击一整个item
  itemClick = itemValue => {
    const { local_name } = this.state
    const { type, board_id } = itemValue
    if (type == '1') {
      const new_item_value = { ...itemValue, name: local_name }
      this.props.setBreadPaths &&
        this.props.setBreadPaths({ path_item: new_item_value })
    } else if (type == '2') {
      setBoardIdStorage(board_id)
      this.previewFile(itemValue)
    }
  }

  // 预览文件
  previewFile = (data, e) => {
    const { board_id } = this.props
    const {
      file_name,
      name,
      file_resource_id,
      file_id,
      id,
      folder_id,
      version_id
    } = data
    const { dispatch } = this.props
    setBoardIdStorage(board_id)

    // dispatch({
    //     type: 'publicFileDetailModal/updateDatas',
    //     payload: {
    //         filePreviewCurrentFileId: id,
    //         fileType: getSubfixName(file_name)
    //     }
    // })
    dispatch({
      type: 'projectDetail/projectDetailInfo',
      payload: {
        id: board_id
      }
    })
    dispatch({
      type: 'publicFileDetailModal/updateDatas',
      payload: {
        filePreviewCurrentFileId: id,
        fileType: getSubfixName(name || file_name),
        isInOpenFile: true,
        filePreviewCurrentName: name || file_name
      }
    })
    this.props.updatePrivateVariablesWithOpenFile &&
      this.props.updatePrivateVariablesWithOpenFile()
    // this.props.setPreviewFileModalVisibile && this.props.setPreviewFileModalVisibile();
    // dispatch({
    //     type: 'workbenchFileDetail/getCardCommentListAll',
    //     payload: {
    //         id: id
    //     }
    // });
    // dispatch({
    //     type: 'workbenchFileDetail/getFileType',
    //     payload: {
    //         file_id: id,
    //         calback: function (data) {
    //             dispatch({
    //                 type: 'workbenchPublicDatas/getRelationsSelectionPre',
    //                 payload: {
    //                     _organization_id: data.base_info.org_id
    //                 }
    //             })
    //         }
    //     }
    // });
    // this.props.setPreviewFileModalVisibile();
    // dispatch({
    //     type: 'workbenchFileDetail/updateDatas',
    //     payload: {
    //         seeFileInput: 'fileModule',
    //         board_id,
    //         filePreviewCurrentId: file_resource_id,
    //         currentParrentDirectoryId: folder_id,
    //         filePreviewCurrentFileId: id,
    //         filePreviewCurrentVersionId: version_id, //file_id,
    //         pdfDownLoadSrc: '',
    //     }
    // })

    // if (getSubfixName(name) == '.pdf') {
    //     this.props.dispatch({
    //         type: 'workbenchFileDetail/getFilePDFInfo',
    //         payload: {
    //             id
    //         }
    //     })
    // } else {
    //     dispatch({
    //         type: 'workbenchFileDetail/filePreview',
    //         payload: {
    //             id: file_resource_id, file_id: id
    //         }
    //     })
    // }
    // dispatch({
    //     type: 'workbenchFileDetail/fileVersionist',
    //     payload: {
    //         version_id: version_id, //file_id,
    //         isNeedPreviewFile: false,
    //     }
    // })
    // dispatch({
    //     type: 'workbenchTaskDetail/getBoardMembers',
    //     payload: {
    //         id: board_id
    //     }
    // })
    dispatch({
      type: 'workbenchPublicDatas/updateDatas',
      payload: {
        board_id
      }
    })

    // 设置已读
    const { im_all_latest_unread_messages } = this.props
    if (
      cardItemIsHasUnRead({ relaDataId: id, im_all_latest_unread_messages })
    ) {
      dispatch({
        type: 'imCooperation/imUnReadMessageItemClear',
        payload: {
          relaDataId: id
        }
      })
    }
  }

  // 更改名称
  inputOnPressEnter = e => {
    this.requestUpdateFolder()
    this.setIsShowChange(false)
  }
  inputOnBlur = e => {
    this.setIsShowChange(false)
  }
  inputOnchange = e => {
    const { value } = e.target
    // if (value.trimLR() == '') {
    // 	message.warn('文件夹名称不能为空')
    // 	return false
    // }
    this.setState({
      input_folder_value: value
    })
  }
  setIsShowChange = flag => {
    this.setState({
      is_show_change: flag
      // input_folder_value: '',
    })
    const {
      itemValue: { name }
    } = this.props
    const { last_input_input_folder_value } = this.state
    if (flag) {
      this.setState({
        input_folder_value: last_input_input_folder_value || name
      })
    }
  }
  requestUpdateFolder = async () => {
    const { input_folder_value, last_input_input_folder_value } = this.state
    const { itemValue = {}, board_id } = this.props
    const { id } = itemValue
    if (
      input_folder_value == '' ||
      input_folder_value == last_input_input_folder_value
    ) {
      return false
    }
    const params = {
      board_id,
      folder_id: id,
      folder_name: input_folder_value
    }
    const res = await updateFolder(params)
    if (isApiResponseOk(res)) {
      this.setState({
        last_input_input_folder_value: input_folder_value,
        local_name: input_folder_value
      })
    } else {
      message.warn(res.message)
    }
  }
  // 获取访问控制的数据
  genVisitContorlData = (originData = {}) => {
    // 判断是不是空对象
    const isEmptyObj = obj => !Object.getOwnPropertyNames(obj).length
    if (isEmptyObj(originData)) {
      return {}
    }
    const {
      type,
      folder_name,
      file_name,
      is_privilege,
      privileges = [],
      privileges_extend = [],
      id
      // child_privilegeuser_ids
    } = originData
    const fileTypeName = type == '1' ? '文件夹' : '文件'
    const fileOrFolderName = type == '1' ? folder_name : file_name
    const genVisitControlOtherPersonOperatorMenuItem = type => {
      if (type == '1') {
        return [
          {
            key: '可访问',
            value: 'read'
          },
          {
            key: '可编辑',
            value: 'edit'
          },
          {
            key: '移出',
            value: 'remove',
            style: {
              color: '#f73b45'
            }
          }
        ]
      }
      if (type == '2') {
        return [
          {
            key: '仅查看',
            value: 'read'
          },
          {
            key: '可编辑',
            value: 'edit'
          },
          {
            key: '可评论',
            value: 'comment'
          },
          {
            key: '移出',
            value: 'remove',
            style: {
              color: '#f73b45'
            }
          }
        ]
      }
      return []
    }
    const visitControlOtherPersonOperatorMenuItem = genVisitControlOtherPersonOperatorMenuItem(
      type
    )
    return {
      // child_privilegeuser_ids,
      id,
      fileTypeName,
      fileOrFolderName,
      visitControlOtherPersonOperatorMenuItem,
      is_privilege,
      privileges,
      privileges_extend,
      removeMemberPromptText:
        type === '1'
          ? '移出后用户将不能访问此文件夹'
          : '移出后用户将不能访问此文件'
    }
  }

  isTheSameVisitControlState = flag => {
    const {
      itemValue: { is_privilege }
    } = this.props
    const toBool = str => !!Number(str)
    const is_privilege_bool = toBool(is_privilege)
    if (flag == is_privilege_bool) {
      return true
    }
    return false
  }

  /**
   * 访问控制的开关切换
   * @param {Boolean} flag 开关切换
   */
  handleVisitControlChange = flag => {
    if (this.isTheSameVisitControlState(flag)) {
      return
    }
    this.handleToggleContentPrivilege(flag)
  }

  // 获取访问控制弹窗中的数据类型??
  getVisitControlModalDataType = () => {
    const {
      itemValue: { type }
    } = this.props
    return type == '1' ? 'folder' : 'file'
  }

  /**
   * 访问控制的开关切换
   * @param {Boolean} flag 开关切换
   */
  handleToggleContentPrivilege = flag => {
    const _this = this
    const {
      itemValue: { version_id, id },
      current_folder_id,
      getFolderFileList,
      updateParentFileStateData
    } = this.props
    const dataType = this.getVisitControlModalDataType()
    const data = {
      content_id: dataType == 'file' ? version_id : id,
      content_type: dataType == 'file' ? 'file' : 'folder',
      is_open: flag ? 1 : 0
    }
    toggleContentPrivilege(data).then(res => {
      const resOk = res => res && res.code == '0'
      if (resOk(res)) {
        setTimeout(() => {
          message.success('设置成功')
        }, 500)
        getFolderFileList({ id: current_folder_id })
        // updateParentFileStateData({ value: flag ? '1' : '0', id: id }, 'is_privilege')
      } else {
        message.warning(res.message)
      }
    })
  }

  /**
   * 访问控制移除成员
   * @param {String} id 移除成员对应的id
   */
  handleVisitControlRemoveContentPrivilege = id => {
    const { current_folder_id, getFolderFileList } = this.props
    removeContentPrivilege({
      id: id
    }).then(res => {
      const isResOk = res => res && res.code == '0'
      if (isResOk(res)) {
        setTimeout(() => {
          message.success('移除用户成功')
        }, 500)
        getFolderFileList({ id: current_folder_id })
      } else {
        message.warning(res.message)
      }
    })
  }

  /**
   * 访问控制设置更新成员
   * @param {String} id 设置成员对应的id
   * @param {String} type 设置成员对应的字段
   */
  handleVisitControlChangeContentPrivilege = (id, type, errorText) => {
    const { itemValue = {} } = this.props
    const { current_folder_id, getFolderFileList } = this.props
    const { version_id, belong_folder_id, id: folder_id } = itemValue
    const dataType = this.getVisitControlModalDataType()
    const content_id = dataType == 'file' ? version_id : folder_id
    const content_type = dataType == 'file' ? 'file' : 'folder'
    const privilege_code = type
    let temp_id = []
    temp_id.push(id)
    setContentPrivilege({
      content_id,
      content_type,
      privilege_code,
      user_ids: temp_id
    }).then(res => {
      if (res && res.code == '0') {
        setTimeout(() => {
          message.success('设置成功')
        }, 500)
        getFolderFileList({ id: current_folder_id })
      } else {
        message.warning(res.message)
      }
    })
  }

  /**
   * 其他成员的下拉回调
   * @param {String} id 这是用户的user_id
   * @param {String} type 这是对应的用户字段
   * @param {String} removeId 这是对应移除用户的id
   */
  handleClickedOtherPersonListOperatorItem = (id, type, removeId) => {
    if (type == 'remove') {
      this.handleVisitControlRemoveContentPrivilege(removeId)
    } else {
      this.handleVisitControlChangeContentPrivilege(
        id,
        type,
        '更新用户控制类型失败'
      )
    }
  }

  /**
   * 添加成员的回调
   * @param {Array} users_arr 添加成员的数组
   */
  handleVisitControlAddNewMember = (users_arr = []) => {
    if (!users_arr.length) return
    this.handleSetContentPrivilege(users_arr, 'read')
  }

  // 访问控制设置成员
  handleSetContentPrivilege = (
    users_arr = [],
    type,
    errorText = '访问控制添加人员失败，请稍后再试'
  ) => {
    const { user_set = {} } = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : {}
    const { user_id } = user_set
    const {
      itemValue = {},
      itemValue: {
        version_id,
        belong_folder_id: folder_id,
        id,
        privileges = []
      },
      getFolderFileList,
      current_folder_id
    } = this.props
    const dataType = this.getVisitControlModalDataType()
    const content_id = dataType == 'file' ? version_id : id
    const content_type = dataType == 'file' ? 'file' : 'folder'
    const privilege_code = type
    let temp_ids = [] // 用来保存添加用户的id
    let new_ids = [] // 用来保存权限列表中用户id
    let new_privileges = [...privileges]

    // 这是所有添加成员的id列表
    users_arr &&
      users_arr.map(item => {
        temp_ids.push(item.id)
      })

    let flag
    // 权限列表中的id
    new_privileges =
      new_privileges &&
      new_privileges.map(item => {
        let { id } = item && item.user_info && item.user_info
        if (user_id == id) {
          // 从权限列表中找到自己
          if (temp_ids.indexOf(id) != -1) {
            // 判断自己是否在添加的列表中
            flag = true
          }
        }
        new_ids.push(id)
      })

    // 这里是需要做一个只添加了自己的一条提示
    if (flag && temp_ids.length == '1') {
      // 表示只选择了自己, 而不是全选
      message.warn('该成员已存在, 请不要重复添加', MESSAGE_DURATION_TIME)
      return false
    } else {
      // 否则表示进行了全选, 那么就过滤
      temp_ids =
        temp_ids &&
        temp_ids.filter(item => {
          if (new_ids.indexOf(item) == -1) {
            return item
          }
        })
    }

    setContentPrivilege({
      content_id,
      content_type,
      privilege_code,
      user_ids: temp_ids
    }).then(res => {
      if (res && res.code == '0') {
        setTimeout(() => {
          message.success('添加用户成功')
        }, 500)
        getFolderFileList({ id: current_folder_id })
      } else {
        message.warning(res.message)
      }
    })
  }

  // 渲染访问控制
  renderVisitControlContent = () => {
    const { itemValue = {} } = this.props
    const {
      id,
      removeMemberPromptText,
      is_privilege,
      privileges = [],
      privileges_extend = [],
      fileTypeName,
      fileOrFolderName,
      visitControlOtherPersonOperatorMenuItem
    } = this.genVisitContorlData(itemValue)
    const new_projectParticipant =
      privileges_extend && privileges_extend.length
        ? arrayNonRepeatfy([].concat(...privileges_extend))
        : []
    const {
      currentVisitControlModalVisibleItem,
      visitControlModalVisible
    } = this.state
    return (
      <div id={id} onClick={e => e && e.stopPropagation()}>
        <Modal
          title={null}
          width={400}
          footer={null}
          destroyOnClose={true}
          visible={
            visitControlModalVisible &&
            id == currentVisitControlModalVisibleItem
          }
          maskClosable={false}
          onCancel={this.handleVisitControlModalCancel}
          getContainer={
            document.getElementById('process_file_detail_container')
              ? () => document.getElementById('process_file_detail_container')
              : ''
          }
        >
          <div
            style={{
              paddingTop: '54px',
              marginLeft: '-7px',
              marginRight: '-5px'
            }}
          >
            <VisitControl
              onlyShowPopoverContent={true}
              isPropVisitControl={is_privilege == '0' ? false : true}
              principalInfo="位文件访问人"
              principalList={
                this.getVisitControlModalDataType() == 'folder'
                  ? new_projectParticipant
                  : []
              }
              notShowPrincipal={
                this.getVisitControlModalDataType() == 'file' ? true : false
              }
              otherPrivilege={privileges}
              otherPersonOperatorMenuItem={
                visitControlOtherPersonOperatorMenuItem
              }
              removeMemberPromptText={removeMemberPromptText}
              handleVisitControlChange={this.handleVisitControlChange}
              handleAddNewMember={this.handleVisitControlAddNewMember}
              handleClickedOtherPersonListOperatorItem={
                this.handleClickedOtherPersonListOperatorItem
              }
            />
          </div>
        </Modal>
      </div>
    )
  }

  render() {
    const {
      itemValue = {},
      im_all_latest_unread_messages = [],
      wil_handle_types = [],
      board_id
    } = this.props
    const { name, id, type, is_privilege, file_name } = itemValue
    const {
      is_show_change,
      input_folder_value,
      local_name,
      currentVisitControlModalVisibleItem,
      visitControlModalVisible
    } = this.state
    return (
      <div className={`${styles.folder_item_out}`}>
        {is_show_change ? (
          <div
            className={`${styles.folder_item} ${styles.add_item}`}
            style={{ height: 38 }}
          >
            <Input
              style={{ height: 38 }}
              autoFocus
              value={input_folder_value}
              onChange={this.inputOnchange}
              onPressEnter={this.inputOnPressEnter}
              onBlur={this.inputOnPressEnter}
              // onBlur={this.inputOnBlur}
            />
          </div>
        ) : (
          <div
            className={styles.folder_item}
            onClick={() => this.itemClick(itemValue)}
          >
            <div
              className={`${globalStyles.authTheme} ${styles.file_logo}`}
              dangerouslySetInnerHTML={{
                __html: this.judgeFileType({ type, local_name })
              }}
            ></div>
            <div
              className={`${globalStyles.global_ellipsis} ${styles.file_name}`}
            >
              {local_name}
            </div>
            {is_privilege == '1' && (
              <Tooltip title="已开启访问控制" placement="top">
                <div style={{ color: 'rgba(0,0,0,0.50)', marginRight: '5px' }}>
                  <span className={`${globalStyles.authTheme}`}>&#xe7ca;</span>
                </div>
              </Tooltip>
            )}
            <Dropdown
              getPopupContainer={triggerNode => triggerNode.parentNode}
              overlay={this.renderOperateItemDropMenu()}
              trigger={['click']}
            >
              <div
                className={`${globalStyles.authTheme} ${styles.operator}`}
                onClick={e => e.stopPropagation()}
              >
                &#xe7fd;
              </div>
            </Dropdown>
            {/* 未读 */}
            {folderItemHasUnReadNo({
              type,
              relaDataId: id,
              im_all_latest_unread_messages,
              wil_handle_types
            }) > 0 && (
              // true &&
              <div className={styles.has_no_read}>
                {folderItemHasUnReadNo({
                  type,
                  relaDataId: id,
                  im_all_latest_unread_messages,
                  wil_handle_types
                }) > 99
                  ? '99+'
                  : folderItemHasUnReadNo({
                      type,
                      relaDataId: id,
                      im_all_latest_unread_messages,
                      wil_handle_types
                    })}
              </div>
            )}
          </div>
        )}
        {visitControlModalVisible &&
          id == currentVisitControlModalVisibleItem && (
            <>{this.renderVisitControlContent()}</>
          )}
      </div>
    )
  }
}

function mapStateToProps({
  imCooperation: { im_all_latest_unread_messages = [], wil_handle_types = [] }
}) {
  return { im_all_latest_unread_messages, wil_handle_types }
}
