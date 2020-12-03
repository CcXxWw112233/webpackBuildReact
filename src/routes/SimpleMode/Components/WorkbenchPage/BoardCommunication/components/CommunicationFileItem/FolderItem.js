import React, { Component } from 'react'
import { connect } from 'dva'
import { Menu, Dropdown, Input, message, Tooltip } from 'antd'
import {
  getSubfixName,
  setBoardIdStorage
} from '../../../../../../../utils/businessFunction'
import { isApiResponseOk } from '../../../../../../../utils/handleResponseData'
import {
  fileRemove,
  updateFolder
} from '../../../../../../../services/technological/file'
import globalStyles from '@/globalset/css/globalClassName.less'
import styles from './index.less'

class FolderItem extends Component {
  constructor(props) {
    super(props)
    const { itemValue = {} } = this.props
    const { name } = itemValue
    this.state = {
      input_folder_value: '',
      local_name: name
    }
  }

  // 点击一整个item
  itemClick = itemValue => {
    const { local_name } = this.state
    const { type } = itemValue

    // type 1 文件夹 2 文件
    if (type == '1') {
      const new_item_value = { ...itemValue, name: local_name }
      // this.props.setBreadPaths && this.props.setBreadPaths({ path_item: new_item_value })
      this.props.showWhatComponent &&
        this.props.showWhatComponent('2', { path_item: new_item_value })
    } else if (type == '2') {
      this.previewFile(itemValue)
    }
  }

  // 预览文件/文件圈图显示
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
    // if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_INTERVIEW)) {
    //     message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME);
    //     return false;
    // }

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
    //         calback: function(data) {
    //             dispatch({
    //                 type: 'workbenchPublicDatas/getRelationsSelectionPre',
    //                 payload: {
    //                   _organization_id: data.base_info.org_id
    //                 }
    //             })
    //         }
    //     }
    // });
    // this.props.setPreviewFileModalVisibile();
    dispatch({
      type: 'publicFileDetailModal/updateDatas',
      payload: {
        filePreviewCurrentFileId: id,
        fileType: getSubfixName(file_name),
        isInOpenFile: true,
        filePreviewCurrentName: file_name
      }
    })
    dispatch({
      type: 'projectDetail/projectDetailInfo',
      payload: {
        id: board_id
      }
    })
    // this.props.setPreviewFileModalVisibile && this.props.setPreviewFileModalVisibile();
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

    // if (getSubfixName(file_name || name) == '.pdf') {
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
  }

  // 过滤名字logo
  judgeFileType({ type, name }) {
    if (type == '1') {
      //文件夹
      return '&#xe6c4;'
    }
    let themeCode = '&#xe691;'
    const file_type = getSubfixName(name)
    switch (type) {
      case '.xls':
        themeCode = '&#xe65c;'
        break
      case '.png':
        themeCode = '&#xe69a;'
        break
      case '.xlsx':
        themeCode = '&#xe65c;'
        break
      case '.ppt':
        themeCode = '&#xe655;'
        break
      case '.pptx':
        themeCode = '&#xe650;'
        break
      case '.gif':
        themeCode = '&#xe657;'
        break
      case '.jpeg':
        themeCode = '&#xe659;'
        break
      case '.pdf':
        themeCode = '&#xe651;'
        break
      case '.docx':
        themeCode = '&#xe64a;'
        break
      case '.txt':
        themeCode = '&#xe654;'
        break
      case '.doc':
        themeCode = '&#xe64d;'
        break
      case '.jpg':
        themeCode = '&#xe653;'
        break
      case '.mp4':
        themeCode = '&#xe6e1;'
        break
      case '.mp3':
        themeCode = '&#xe6e2;'
        break
      case '.skp':
        themeCode = '&#xe6e8;'
        break
      case '.gz':
        themeCode = '&#xe6e7;'
        break
      case '.7z':
        themeCode = '&#xe6e6;'
        break
      case '.zip':
        themeCode = '&#xe6e5;'
        break
      case '.rar':
        themeCode = '&#xe6e4;'
        break
      case '.3dm':
        themeCode = '&#xe6e0;'
        break
      case '.ma':
        themeCode = '&#xe65f;'
        break
      case '.psd':
        themeCode = '&#xe65d;'
        break
      case '.obj':
        themeCode = '&#xe65b;'
        break
      case '.bmp':
        themeCode = '&#xe6ee;'
        break
      default:
        themeCode = '&#xe660;'
        break
    }
    return themeCode
  }

  // 渲染菜单
  renderOperateItemDropMenu = () => {
    const { itemValue = {} } = this.props
    const { type } = itemValue

    return (
      <Menu onClick={this.menuItemClick}>
        {type == '1' && (
          <Menu.Item key={1} style={{ width: 248 }}>
            <span
              style={{ fontSize: 14, color: `rgba(0,0,0,0.65)`, width: 248 }}
            >
              <i className={globalStyles.authTheme} style={{ fontSize: 16 }}>
                &#xe86d;
              </i>
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

  // 菜单点击
  menuItemClick = e => {
    e.domEvent.stopPropagation()
    const { key } = e
    switch (key) {
      case '1':
        this.setIsShowChange(true)
        break
      case '2':
        this.requestRemoveItem()
        break
      default:
        break
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
    if (value.trimLR() == '') {
      message.warn('文件夹名称不能为空')
      return false
    }
    this.setState({
      input_folder_value: value
    })
  }

  // 重命名
  setIsShowChange = flag => {
    this.setState({
      is_show_change: flag,
      input_folder_value: ''
    })
  }

  requestUpdateFolder = async () => {
    const { input_folder_value } = this.state
    const { itemValue = {}, board_id } = this.props
    const { id } = itemValue
    if (input_folder_value == '') {
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
        local_name: input_folder_value
      })
    } else {
      message.warn(res.message)
    }
  }

  // 删除某一项
  requestRemoveItem = async () => {
    //
    const {
      board_id,
      current_folder_id,
      getSubFileData,
      itemValue = {},
      queryCommunicationFileData,
      isShowSub
    } = this.props
    const { id, type } = itemValue

    const params = {
      board_id,
      arrays: JSON.stringify([{ type, id }])
    }

    const res = await fileRemove(params)
    if (isApiResponseOk(res)) {
      // getSubFileData(current_folder_id, board_id);
      if (isShowSub) {
        getSubFileData(current_folder_id, board_id)
      } else {
        // getSubFileData(current_folder_id, board_id);
        queryCommunicationFileData()
      }
      this.props.hideUpdatedFileDetail()
    } else {
      message.error(res.message)
    }
  }

  render() {
    const { itemValue = {} } = this.props
    const { name, id, type, is_privilege } = itemValue
    const { is_show_change, input_folder_value, local_name } = this.state
    return (
      <div style={{ width: '100%' }}>
        {is_show_change ? (
          <div
            className={`${styles.folder_item} ${styles.add_item}`}
            style={{ height: 38 }}
          >
            <Input
              style={{ height: 38, marginTop: 16 }}
              autoFocus
              value={input_folder_value}
              onChange={this.inputOnchange}
              onPressEnter={this.inputOnPressEnter}
              onBlur={this.inputOnBlur}
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
            <Dropdown overlay={this.renderOperateItemDropMenu()}>
              <div className={`${globalStyles.authTheme} ${styles.operator}`}>
                &#xe7fd;
              </div>
            </Dropdown>
          </div>
        )}
      </div>
    )
  }
}

export default connect()(FolderItem)
