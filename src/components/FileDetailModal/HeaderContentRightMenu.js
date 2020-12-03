import React, { Component } from 'react'
import headerStyles from './HeaderContent.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import VisitControl from '../../routes/Technological/components/VisitControl'
import InformRemind from '@/components/InformRemind'
import VersionSwitching from '@/components/VersionSwitching'
import { connect } from 'dva'
import {
  compareACoupleOfObjects,
  isArrayEqual,
  arrayNonRepeatfy
} from '@/utils/util'
import {
  checkIsHasPermissionInBoard,
  getSubfixName,
  checkIsHasPermissionInVisitControl
} from '@/utils/businessFunction'
import {
  MESSAGE_DURATION_TIME,
  NOT_HAS_PERMISION_COMFIRN,
  PROJECT_FILES_FILE_UPDATE,
  PROJECT_FILES_FILE_EDIT,
  UPLOAD_FILE_SIZE,
  REQUEST_DOMAIN_FILE,
  PROJECT_FILES_FILE_DOWNLOAD
} from '@/globalset/js/constant'
import {
  setCurrentVersionFile,
  updateVersionFileDescription,
  fileVersionist,
  fileDownload,
  saveAsNewVersion,
  fileCopy
} from '@/services/technological/file'
import { isApiResponseOk } from '../../utils/handleResponseData'
import { message, Tooltip, Dropdown, Menu, Button } from 'antd'
import Cookies from 'js-cookie'
import { setUploadHeaderBaseInfo } from '@/utils/businessFunction'
import {
  toggleContentPrivilege,
  setContentPrivilege,
  removeContentPrivilege
} from '../../services/technological/project'
import {
  createShareLink,
  modifOrStopShareLink
} from '@/services/technological/workbench'
import ShareAndInvite from '@/routes/Technological/components/ShareAndInvite/index'
import SaveAsNewVersionFile from './component/SaveAsNewVersionFile'
import { getFolderList } from '@/services/technological/file'
import { currentNounPlanFilterName } from '../../utils/businessFunction'
import { FILES } from '../../globalset/js/constant'
import DEvent from '../../utils/event'

@connect(mapStateToProps)
export default class HeaderContentRightMenu extends Component {
  constructor(props) {
    super(props)
    this.state = {
      // selectedKeys: []
    }
    this.isPdfInType = ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
  }

  // 这里是更新版本列表添加一个编辑的字段
  componentWillReceiveProps(nextProps) {
    const {
      filePreviewCurrentVersionList = [],
      filePreviewCurrentFileId
    } = nextProps
    const {
      filePreviewCurrentVersionList: old_filePreviewCurrentVersionList = []
    } = this.props
    if (
      !isArrayEqual(
        old_filePreviewCurrentVersionList,
        filePreviewCurrentVersionList
      )
    ) {
      let new_filePreviewCurrentVersionList = [...filePreviewCurrentVersionList]
      new_filePreviewCurrentVersionList = new_filePreviewCurrentVersionList.map(
        item => {
          let new_item = item
          new_item = { ...item, is_edit: false }
          return new_item
        }
      )

      this.setState({
        new_filePreviewCurrentVersionList
      })
      setTimeout(
        () =>
          this.judgeWhetherItIsNewVersion(
            new_filePreviewCurrentVersionList,
            filePreviewCurrentFileId
          ),
        200
      )
    }
  }

  // 判断是否是新版本
  judgeWhetherItIsNewVersion = (data, id) => {
    if (!data) return
    let currentPreviewFile = [...data] // 当前预览的文件
    let currentPreviewVersionFile = [...data] // 当前的版本文件
    currentPreviewFile = currentPreviewFile.find(
      item => item.is_new_version != '1' && item.id == id
    )
    currentPreviewVersionFile = currentPreviewVersionFile.find(
      item => item.is_new_version == '1'
    )
    if (
      currentPreviewFile &&
      Object.keys(currentPreviewFile) &&
      Object.keys(currentPreviewFile).length
    ) {
      this.props.updateStateDatas &&
        this.props.updateStateDatas({ selectedKeys: [currentPreviewFile.id] })
      // this.setState({
      //   selectedKeys: [currentPreviewFile.id]
      // })
    }
    if (
      currentPreviewVersionFile &&
      Object.keys(currentPreviewVersionFile) &&
      Object.keys(currentPreviewVersionFile).length
    ) {
      this.props.updateStateDatas &&
        this.props.updateStateDatas({
          filePreviewCurrentFileId: currentPreviewVersionFile.id
        })
      this.setState({
        // selectedKeys: [currentPreviewVersionFile.id]
      })
    }
  }

  /**
   * 检测是否进入圈评
   * @return {Boolean} true/false true表示正在进入圈评 false表示没有进入
   */
  checkWhetherEntryCircleEvaluation = () => {
    const { is_large_loading, is_petty_loading } = this.props
    let flag
    if (is_large_loading || is_petty_loading) {
      flag = true
    } else {
      flag = false
    }
    return flag
  }

  // 关于右侧menu的点击事件
  handleDisabledOperator = () => {
    message.warn('正在进入圈评,请稍等...', MESSAGE_DURATION_TIME)
    return false
  }

  // ------------------------- 关于版本信息的事件 S --------------------------------

  // 设为主版本回调
  setCurrentVersionFile = data => {
    let { id, set_major_version, version_id, file_name, folder_id } = data
    setCurrentVersionFile({ id, set_major_version }).then(res => {
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success('设置主版本成功', MESSAGE_DURATION_TIME)
        }, 500)
        this.handleUploadPDForElesFilePreview({ file_name: file_name, id })
        this.props.updateStateDatas &&
          this.props.updateStateDatas({
            filePreviewCurrentFileId: id,
            selectedKeys: []
          })
        this.props.whetherUpdateFolderListData &&
          this.props.whetherUpdateFolderListData({
            folder_id,
            file_id: id,
            file_name
          })
      } else {
        message.warn(res.message)
      }
    })
  }

  getFileVersionist = data => {
    const { version_id, file_id, folder_id, calback } = data
    fileVersionist({ version_id, file_id }).then(res => {
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success('更新版本成功', MESSAGE_DURATION_TIME)
        }, 500)
        let { file_name, id, create_time } = res.data[0]
        this.handleUploadPDForElesFilePreview({ file_name, id })
        this.props.updateStateDatas &&
          this.props.updateStateDatas({
            filePreviewCurrentFileId: data.file_id,
            filePreviewCurrentVersionList: res.data,
            selectedKeys: []
          })
        this.setState({
          new_filePreviewCurrentVersionList: res.data
        })
        this.props.whetherUpdateFolderListData &&
          this.props.whetherUpdateFolderListData({
            folder_id,
            file_id: file_id,
            file_name: file_name,
            create_time: create_time
          })
        if (calback && typeof calback == 'function') {
          calback()
        }
      } else {
        message.warn(res.message)
      }
    })
  }

  // pdf文件和普通文件区别时做不同地处理预览
  handleUploadPDForElesFilePreview = ({ file_name, id }) => {
    if (getSubfixName(file_name) == '.pdf') {
      this.props.delayUpdatePdfDatas && this.props.delayUpdatePdfDatas({ id })
      this.props.updateStateDatas &&
        this.props.updateStateDatas({ fileType: getSubfixName(file_name) })
      this.props.getCurrentFilePreviewData &&
        this.props.getCurrentFilePreviewData({ id }).then(res => {
          DEvent.firEvent('pdfCommentUpdate', id)
        }) // 需要先获取一遍详情
    } else {
      this.props.getCurrentFilePreviewData &&
        this.props.getCurrentFilePreviewData({ id }).then(res => {
          DEvent.firEvent('pdfCommentUpdate', id)
        })
    }
  }

  // 修改编辑版本描述的方法
  chgVersionFileEdit({ list, file_id, file_name }) {
    const { new_filePreviewCurrentVersionList, editValue } = this.state
    let temp_val
    let temp_filePreviewCurrentVersionList = [
      ...new_filePreviewCurrentVersionList
    ]
    temp_filePreviewCurrentVersionList = temp_filePreviewCurrentVersionList.map(
      item => {
        let new_item = item
        if (new_item.file_id == file_id) {
          temp_val = new_item.remarks
          new_item = { ...item, is_edit: !item.is_edit }
        }
        return new_item
      }
    )
    this.setState({
      new_filePreviewCurrentVersionList: temp_filePreviewCurrentVersionList,
      editValue: temp_val
    })
  }

  // 每一个menu菜单的item选项的切换 即点击切换预览文件版本
  handleVersionItem = e => {
    const { key } = e
    const { new_filePreviewCurrentVersionList } = this.state
    let temp_filePreviewCurrentVersionList = [
      ...new_filePreviewCurrentVersionList
    ]
    temp_filePreviewCurrentVersionList = temp_filePreviewCurrentVersionList.filter(
      item => {
        if (item.file_id == key) {
          return item
        }
      }
    )
    const {
      file_id,
      file_resource_id,
      file_name
    } = temp_filePreviewCurrentVersionList[0]
    this.handleUploadPDForElesFilePreview({ file_name, id: file_id })
    this.props.updateStateDatas &&
      this.props.updateStateDatas({
        fileType: getSubfixName(file_name),
        selectedKeys: [key],
        pdfDownLoadSrc: getSubfixName(file_name) != '.pdf' && ''
      })
  }

  // 每一个Item的点点点 事件
  getVersionItemMenuClick = ({ list, file_id, file_name }, e) => {
    e && e.domEvent && e.domEvent.stopPropagation()
    const { currentPreviewFileData = {} } = this.props
    const { board_id, privileges = [], is_privilege } = currentPreviewFileData
    const key = e.key
    switch (key) {
      case '1': // 设置为主版本
        if (
          !checkIsHasPermissionInVisitControl(
            'edit',
            privileges,
            is_privilege,
            [],
            checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPDATE, board_id)
          )
        ) {
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        // if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPDATE, board_id)) {
        //   message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
        //   return false
        // }
        const { dispatch } = this.props
        let file_resource_id = ''
        let file_version_id = ''
        let file_name = ''
        let folder_id = ''
        for (let val of list) {
          if (file_id == val['file_id']) {
            file_resource_id = val['file_resource_id']
            file_version_id = val['version_id']
            file_name = val['file_name']
            folder_id = val['folder_id']
            break
          }
        }
        // console.log({file_resource_id, file_id}, 'sssss')
        this.setState({
          imgLoaded: false
        })
        //版本改变预览
        let data = {
          id: file_id,
          set_major_version: '1',
          version_id: file_version_id,
          file_name: file_name,
          folder_id: folder_id
        }
        this.setCurrentVersionFile(data)

        this.setState({
          imgLoaded: false,
          editMode: true,
          currentRect: { x: 0, y: 0, width: 0, height: 0 },
          isInAdding: false,
          isInEdditOperate: false,
          mentionFocus: false
        })
        break
      case '2':
        break
      // 编辑版本信息
      case '3':
        if (
          !checkIsHasPermissionInVisitControl(
            'edit',
            privileges,
            is_privilege,
            [],
            checkIsHasPermissionInBoard(PROJECT_FILES_FILE_EDIT, board_id)
          )
        ) {
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        // if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_EDIT, board_id)) {
        //   message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
        //   return false
        // }
        this.setState({
          is_edit_version_description: true
        })
        this.chgVersionFileEdit({ list, file_id, file_name })
        break
      default:
        break
    }
  }

  // 改变编辑描述的value onChange事件
  handleFileVersionValue = (list, e) => {
    let val = e.target.value
    this.setState({
      editValue: val
    })
  }

  // 失去焦点 的版本修改描述信息
  handleFileVersionDecription = (list, key) => {
    const { dispatch } = this.props
    const { editValue, is_edit_version_description } = this.state
    let new_list = [...list]
    let temp_list = [] // 定义一个空的数组列表用来保存之前编辑状态的哪一个元素
    temp_list =
      new_list &&
      new_list.filter(item => {
        let new_item = item
        if (new_item.is_edit) {
          return new_item
        }
      })
    new_list = new_list.map(item => {
      let new_item = item
      if (new_item.is_edit) {
        new_item = { ...item, is_edit: false, remarks: editValue }
        return new_item
      } else {
        return new_item
      }
    })
    const { file_id, remarks } = temp_list[0]
    this.setState({
      is_edit_version_description: false,
      new_filePreviewCurrentVersionList: new_list
    })

    if (editValue != remarks) {
      updateVersionFileDescription({
        id: file_id,
        version_info: editValue
      }).then(res => {
        if (isApiResponseOk(res)) {
          setTimeout(() => {
            message.success('编辑版本信息成功', MESSAGE_DURATION_TIME)
          }, 500)
        } else {
          message.warn(res.message)
        }
      })
      this.props.updateStateDatas &&
        this.props.updateStateDatas({ filePreviewCurrentVersionList: new_list })
      this.setState({
        editValue: ''
      })
    }
  }

  // ------------------------- 关于版本信息的事件 E --------------------------------

  // ------------------------- 关于另存为事件 S ------------------------------------

  openWin(url) {
    var element1 = document.createElement('a')
    element1.href = url
    element1.id = 'openWin'
    document.querySelector('body').appendChild(element1)
    document.getElementById('openWin').click() //点击事件
    document
      .getElementById('openWin')
      .parentNode.removeChild(document.getElementById('openWin'))
  }

  // 下载文件
  handleFileDownload({ filePreviewCurrentResourceId, pdfDownLoadSrc }) {
    if (this.isPdfInType.includes(this.props.fileType)) {
      DEvent.firEvent('pdfSave', {})
      return
    }
    if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DOWNLOAD)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    //如果时pdf
    if (pdfDownLoadSrc) {
      window.open(pdfDownLoadSrc)
    } else {
      const {
        currentPreviewFileData: { id }
      } = this.props
      fileDownload({ ids: filePreviewCurrentResourceId, fileIds: id }).then(
        res => {
          if (isApiResponseOk(res)) {
            const data = res.data
            if (data && data.length) {
              // for (let val of data ) {
              //   // window.open(val)
              //   this.openWin(val)
              // }
              for (let i = 0; i < data.length; i++) {
                setTimeout(() => this.openWin(data[i]), i * 500)
              }
            }
          } else {
            message.warn(res.message, MESSAGE_DURATION_TIME)
          }
        }
      )
    }
  }

  // 关闭弹窗的回调
  setSaveAsNewVersionVisible = () => {
    this.setState({
      saveAsNewVersionFileVisible: false,
      saveAsNewVersionFileTitle: ''
    })
  }

  // 保存为新版本的回调
  handleSaveAsNewVersionButton = ({
    id,
    notify_user_ids,
    folder_id,
    calback
  }) => {
    saveAsNewVersion({ id, notify_user_ids }).then(res => {
      if (isApiResponseOk(res)) {
        const { version_id, id } = res.data
        this.getFileVersionist({ version_id, file_id: id, folder_id, calback })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
        if (calback && typeof calback == 'function') {
          calback()
        }
      }
    })
  }

  // 另存为新版本的回调
  handleSaveAsOthersNewVersionButton = ({
    file_ids,
    folder_id,
    notify_user_ids,
    file_name,
    calback
  }) => {
    fileCopy({
      file_ids,
      folder_id,
      notify_user_ids,
      is_copy_version: false,
      file_name
    }).then(res => {
      if (isApiResponseOk(res)) {
        setTimeout(() => {
          message.success(`另存为${currentNounPlanFilterName(FILES)}成功`)
        }, 200)
        if (calback && typeof calback == 'function') {
          calback()
        }
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
        if (calback && typeof calback == 'function') {
          calback()
        }
      }
    })
  }

  // 保存为新版本
  handleSaveAsNewVersion = e => {
    const { key } = e
    const {
      currentPreviewFileData: { id, privileges = [], is_privilege },
      projectDetailInfoData: { folder_id, board_id }
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
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    this.setState({
      saveAsNewVersionFileVisible: true,
      saveAsNewVersionFileTitle: '保存为新版本',
      titleKey: key
    })
    // if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPDATE)) {
    //   message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
    //   return false
    // }

    // saveAsNewVersion({id}).then(res => {
    //   if (isApiResponseOk(res)) {
    //     const { version_id, id } = res.data
    //     this.getFileVersionist({version_id, file_id: id, folder_id})
    //   } else {
    //     message.warn(res.message, MESSAGE_DURATION_TIME)
    //   }
    // })
  }

  //获取项目里文件夹列表
  getProjectFolderList = ({ board_id, file_name, key }) => {
    getFolderList({ board_id }).then(res => {
      if (isApiResponseOk(res)) {
        this.setState({
          boardFolderTreeData: res.data,
          saveAsNewVersionFileVisible: true,
          saveAsNewVersionFileTitle: '另存为新版本',
          titleKey: key
        })
      } else {
        message.error(res.message)
      }
    })
  }

  // 另存文件为新版本
  handleSaveAsOthersNewVersion = e => {
    const { key } = e
    const {
      currentPreviewFileData: { id, file_name, privileges = [], is_privilege },
      projectDetailInfoData: { folder_id, board_id }
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
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    this.getProjectFolderList({ board_id, file_name, key })
    // this.setState({
    //   saveAsNewVersionFileVisible: true,
    //   saveAsNewVersionFileTitle: '另存新版本',
    //   titleKey: key,
    // })
  }

  handleSaveAs = () => {
    // console.log(this.props)
    DEvent.firEvent('pdfSaveAs', {})
  }

  saveAsMenu = () => {
    const {
      filePreviewCurrentResourceId,
      pdfDownLoadSrc,
      fileType
    } = this.props
    return (
      <Menu>
        {this.isPdfInType.includes(fileType) ? (
          <Menu.Item key="3" onClick={this.handleSaveAs}>
            另存为
          </Menu.Item>
        ) : (
          <Menu.Item key="2" onClick={this.handleSaveAsNewVersion}>
            保存
          </Menu.Item>
        )}

        {/* <Menu.Item key="3" onClick={this.handleSaveAsOthersNewVersion}>
          另存为
        </Menu.Item> */}
        <Menu.Item
          key="1"
          onClick={this.handleFileDownload.bind(this, {
            filePreviewCurrentResourceId,
            pdfDownLoadSrc
          })}
        >
          下载
        </Menu.Item>
      </Menu>
    )
  }
  // ------------------------- 关于另存为事件 E ------------------------------------

  // ------------------------- 关于分享协作事件 S ----------------------------------

  handleChangeOnlyReadingShareModalVisible = () => {
    const { onlyReadingShareModalVisible } = this.props
    //打开之前确保获取到数据
    if (!onlyReadingShareModalVisible) {
      Promise.resolve(this.createOnlyReadingShareLink())
        .then(() => {
          this.props.updateStateDatas &&
            this.props.updateStateDatas({ onlyReadingShareModalVisible: true })
        })
        .catch(err => message.error('获取分享信息失败'))
    } else {
      this.props.updateStateDatas &&
        this.props.updateStateDatas({ onlyReadingShareModalVisible: false })
    }
  }

  createOnlyReadingShareLink = () => {
    const {
      currentPreviewFileData: { file_id, board_id }
    } = this.props
    const payload = {
      board_id: board_id,
      rela_type: '3',
      rela_id: file_id
    }
    return createShareLink(payload).then(({ code, data }) => {
      if (code === '0') {
        this.props.updateStateDatas &&
          this.props.updateStateDatas({ onlyReadingShareData: data })
      } else {
        message.error('获取分享信息失败')
        return new Error('can not create share link.')
      }
    })
  }

  handleOnlyReadingShareExpChangeOrStopShare = obj => {
    const isStopShare = obj && obj['status'] && obj['status'] === '0'
    return modifOrStopShareLink(obj)
      .then(res => {
        if (res && res.code === '0') {
          if (isStopShare) {
            message.success('停止分享成功')
          } else {
            message.success('修改成功')
            // const { dispatch, } = this.props
            const { currentPreviewFileData = {} } = this.props
            const isShared = obj && obj['status'] && obj['status']
            if (isShared) {
              let new_currentPreviewFileData = {
                ...currentPreviewFileData,
                is_shared: obj['status']
              }
              this.props.updateStateDatas &&
                this.props.updateStateDatas({
                  currentPreviewFileData: new_currentPreviewFileData
                })
            }
          }
          const { onlyReadingShareData = {} } = this.props
          this.props.updateStateDatas &&
            this.props.updateStateDatas({
              onlyReadingShareData: Object.assign({}, onlyReadingShareData, obj)
            })
        } else {
          message.error('操作失败')
        }
      })
      .catch(err => {
        message.error('操作失败')
      })
  }

  // ------------------------- 关于分享协作事件 E ----------------------------------

  // ------------------------- 关于访问控制事件 S --------------------------------

  // 访问控制更新数据
  visitControlUpdateCurrentModalData = obj => {
    const {
      currentPreviewFileData,
      currentPreviewFileData: { folder_id, privileges = [], board_id }
    } = this.props
    const { dispatch } = this.props
    // 设置访问控制开关
    if (obj && obj.type && obj.type == 'privilege') {
      // console.log(obj, privileges,'sssssssssssssssss_我的天')
      let new_privileges = [...privileges]
      const { privileges: temp_privileges = [] } = obj
      // if (!(temp_privileges && temp_privileges.length)) return
      if (
        new_privileges.find(
          i => i.id == (temp_privileges[0] && temp_privileges[0].id)
        )
      ) {
        // 如果能找到表示替换 否则添加
        new_privileges = new_privileges.map(item => {
          if (item.id == (temp_privileges[0] && temp_privileges[0].id)) {
            // 表示在列表中找到该成员
            let new_item = { ...item }
            new_item = { ...item, ...temp_privileges[0] }
            return new_item
          } else {
            return item
          }
        })
      } else {
        if (temp_privileges && temp_privileges.length) {
          new_privileges.push(...temp_privileges)
        }
      }
      let newCurrentPreviewFileData = {
        ...currentPreviewFileData,
        is_privilege: obj.is_privilege,
        privileges: new_privileges
      }
      this.props.updateStateDatas &&
        this.props.updateStateDatas({
          currentPreviewFileData: newCurrentPreviewFileData
        })
      this.props.whetherUpdateFolderListData &&
        this.props.whetherUpdateFolderListData({ folder_id })
      // 更新项目交流左侧文件列表
    }

    // 添加成员
    if (obj && obj.type && obj.type == 'add') {
      let new_privileges = []
      for (let item in obj) {
        if (item == 'privileges') {
          // eslint-disable-next-line no-loop-func
          obj[item].map(val => {
            let temp_arr = arrayNonRepeatfy([].concat(...privileges, val))
            if (!Array.isArray(temp_arr)) return false
            return (new_privileges = [...temp_arr])
          })
        }
      }
      let newCurrentPreviewFileData = {
        ...currentPreviewFileData,
        privileges: new_privileges
      }

      this.props.updateStateDatas &&
        this.props.updateStateDatas({
          currentPreviewFileData: newCurrentPreviewFileData
        })
      this.props.shouldUpdateAllFolderListData &&
        this.props.whetherUpdateFolderListData &&
        this.props.whetherUpdateFolderListData({ folder_id })
    }

    // 移除成员
    if (obj && obj.type && obj.type == 'remove') {
      let new_privileges = [...privileges]
      new_privileges.map((item, index) => {
        if (item.id == obj.removeId) {
          new_privileges.splice(index, 1)
        }
      })
      let newCurrentPreviewFileData = {
        ...currentPreviewFileData,
        privileges: new_privileges
      }

      this.props.updateStateDatas &&
        this.props.updateStateDatas({
          currentPreviewFileData: newCurrentPreviewFileData
        })
      this.props.shouldUpdateAllFolderListData &&
        this.props.whetherUpdateFolderListData &&
        this.props.whetherUpdateFolderListData({ folder_id })
    }

    // 修改成员
    if (obj && obj.type && obj.type == 'change') {
      let { id } = obj.temp_arr
      let new_privileges = [...privileges]
      new_privileges = new_privileges.map(item => {
        let new_item = item
        if (item.id == id) {
          new_item = { ...item, content_privilege_code: obj.code }
        } else {
          new_item = { ...item }
        }
        return new_item
      })
      let newCurrentPreviewFileData = {
        ...currentPreviewFileData,
        privileges: new_privileges
      }

      this.props.updateStateDatas &&
        this.props.updateStateDatas({
          currentPreviewFileData: newCurrentPreviewFileData
        })
      this.props.shouldUpdateAllFolderListData &&
        this.props.whetherUpdateFolderListData &&
        this.props.whetherUpdateFolderListData({ folder_id })
    }
  }

  /**
   * 访问控制的开关切换
   * @param {Boolean} flag 开关切换
   */
  handleVisitControlChange = flag => {
    const {
      currentPreviewFileData: { version_id, is_privilege }
    } = this.props
    const toBool = str => !!Number(str)
    const is_privilege_bool = toBool(is_privilege)
    if (flag === is_privilege_bool) {
      return
    }
    //toggle权限
    const data = {
      content_id: version_id,
      content_type: 'file',
      is_open: flag ? 1 : 0
    }
    toggleContentPrivilege(data).then(res => {
      if (res && res.code === '0') {
        setTimeout(() => {
          message.success('设置成功')
        }, 500)
        let temp_arr = res && res.data
        this.visitControlUpdateCurrentModalData(
          {
            is_privilege: flag ? '1' : '0',
            type: 'privilege',
            privileges: temp_arr
          },
          flag
        )
      } else {
        message.warning(res.message)
      }
    })
    // console.log(flag, 'get visitcontrol change')
  }

  /**
   * 其他成员的下拉回调
   * @param {String} id 这是用户的user_id
   * @param {String} type 这是对应的用户字段
   * @param {String} removeId 这是对应移除用户的id
   */
  handleClickedOtherPersonListOperatorItem = (id, type, removeId) => {
    if (type === 'remove') {
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
   * 访问控制移除成员
   * @param {String} id 移除成员对应的id
   */
  handleVisitControlRemoveContentPrivilege = id => {
    removeContentPrivilege({
      id: id
    }).then(res => {
      const isResOk = res => res && res.code === '0'
      if (isResOk(res)) {
        setTimeout(() => {
          message.success('移除用户成功')
        }, 500)
        this.visitControlUpdateCurrentModalData({
          removeId: id,
          type: 'remove'
        })
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
  handleVisitControlChangeContentPrivilege = (id, type) => {
    const {
      currentPreviewFileData: { version_id }
    } = this.props
    const content_id = version_id
    const content_type = 'file'
    const privilege_code = type
    let temp_id = []
    temp_id.push(id)
    setContentPrivilege({
      content_id,
      content_type,
      privilege_code,
      user_ids: temp_id
    }).then(res => {
      if (res && res.code === '0') {
        setTimeout(() => {
          message.success('设置成功')
        }, 500)
        let temp_arr = []
        temp_arr = res && res.data[0]
        this.visitControlUpdateCurrentModalData({
          temp_arr: temp_arr,
          type: 'change',
          code: type
        })
      } else {
        message.warning(res.message)
      }
    })
  }

  /**
   * 添加成员的回调
   * @param {Array} users_arr 添加成员的数组
   */
  handleVisitControlAddNewMember = (users_arr = []) => {
    if (!users_arr.length) return
    this.handleSetContentPrivilege(users_arr, 'read')
  }

  // 访问控制设置回调
  handleSetContentPrivilege = (
    users_arr = [],
    type,
    errorText = '访问控制添加人员失败，请稍后再试'
  ) => {
    //debugger
    const { user_set = {} } = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : {}
    const { user_id } = user_set
    const {
      currentPreviewFileData: { version_id, privileges = [] }
    } = this.props
    const content_id = version_id
    const content_type = 'file'
    const privilege_code = type
    let temp_ids = [] // 用来保存添加用户的id
    let new_ids = [] // 用来保存权限列表中用户id
    let new_privileges = [...privileges]
    if (!Array.isArray(users_arr)) return false
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
      if (res && res.code === '0') {
        setTimeout(() => {
          message.success('添加用户成功')
        }, 500)
        let temp_arr = []
        temp_arr.push(res.data)
        if (!Array.isArray(temp_arr)) return false
        this.visitControlUpdateCurrentModalData({
          privileges: temp_arr,
          type: 'add'
        })
      } else {
        message.warning(res.message)
      }
    })
  }

  // ------------------------- 关于访问控制事件 E --------------------------------

  // --------------------- 关于全屏事件 S ---------------------------------

  /* 点击圈屏右上脚icon-是否全屏显示 */
  zoomFrame = () => {
    this.props.updateStateDatas &&
      this.props.updateStateDatas({
        isZoomPictureFullScreenMode: !this.props.isZoomPictureFullScreenMode,
        percent: 0
      })
  }

  //header
  closeFile() {
    // const { datas: { breadcrumbList = [], isExpandFrame } } = this.props.model
    // breadcrumbList.splice(breadcrumbList.length - 1, 1)
    // clearTimeout(timer)
    this.props.updateStateDatas && this.props.updateStateDatas({ percent: 0 })
    this.props.setPreviewFileModalVisibile &&
      this.props.setPreviewFileModalVisibile()
  }
  // --------------------- 关于全屏事件 E ---------------------------------

  render() {
    const that = this
    const {
      currentPreviewFileData = {},
      filePreviewCurrentFileId,
      filePreviewCurrentVersionId,
      projectDetailInfoData: { data = [], folder_id },
      projectDetailInfoData = {},
      isZoomPictureFullScreenMode,
      onlyReadingShareModalVisible,
      onlyReadingShareData,
      selectedKeys = [],
      targetFilePath = {},
      isOpenAttachmentFile
    } = this.props
    const {
      new_filePreviewCurrentVersionList = [],
      is_edit_version_description,
      editValue,
      boardFolderTreeData = []
    } = this.state
    const {
      board_id,
      is_privilege,
      privileges = [],
      id,
      file_id,
      is_shared
    } = currentPreviewFileData
    const params = {
      filePreviewCurrentFileId,
      new_filePreviewCurrentVersionList,
      is_edit_version_description,
      editValue,
      selectedKeys
    }

    const uploadProps = {
      name: 'file',
      withCredentials: true,
      action: `${REQUEST_DOMAIN_FILE}/file/version_upload`,
      data: {
        board_id,
        folder_id: folder_id,
        file_version_id: filePreviewCurrentVersionId
      },
      headers: {
        Authorization: Cookies.get('Authorization'),
        refreshToken: Cookies.get('refreshToken'),
        ...setUploadHeaderBaseInfo({})
      },
      beforeUpload(e) {
        if (
          !checkIsHasPermissionInVisitControl(
            'edit',
            privileges,
            is_privilege,
            [],
            checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPDATE, board_id)
          )
        ) {
          // message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        // if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPDATE, board_id)) {
        //   return false
        // }
        if (e.size == 0) {
          message.error(`不能上传空文件`)
          return false
        } else if (e.size > UPLOAD_FILE_SIZE * 1024 * 1024) {
          message.error(`上传文件不能文件超过${UPLOAD_FILE_SIZE}MB`)
          return false
        }
      },
      onChange({ file, fileList, event }) {
        if (
          !checkIsHasPermissionInVisitControl(
            'edit',
            privileges,
            is_privilege,
            [],
            checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPDATE, board_id)
          )
        ) {
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        // if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPDATE, board_id)) {
        //   message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
        //   return false
        // }
        if (file.status === 'uploading') {
        } else {
          message.destroy()
        }
        if (file.status === 'done' && file.response.code === '0') {
          message.success(`上传成功。`)
          if (file.response && file.response.code == '0') {
            that.getFileVersionist({
              version_id: filePreviewCurrentVersionId,
              file_id: file.response.data.id,
              folder_id: folder_id
            })
          }
        } else if (
          file.status === 'error' ||
          (file.response && file.response.code !== '0')
        ) {
          message.error((file.response && file.response.message) || '上传失败')
          setTimeout(function() {
            message.destroy()
          }, 2000)
        }
      }
    }

    return (
      <div
        className={headerStyles.header_rightMenuWrapper}
        style={{ position: 'relative' }}
      >
        {this.checkWhetherEntryCircleEvaluation() && (
          <div
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              bottom: '0',
              left: '0',
              margin: '0 auto',
              zIndex: 1
            }}
            onClick={this.handleDisabledOperator}
          />
        )}
        {!isOpenAttachmentFile && (
          <>
            {/* 版本信息 */}
            <div className={headerStyles.margin_right10}>
              <VersionSwitching
                {...params}
                is_show={true}
                handleVersionItem={this.handleVersionItem}
                getVersionItemMenuClick={this.getVersionItemMenuClick}
                handleFileVersionDecription={this.handleFileVersionDecription}
                handleFileVersionValue={this.handleFileVersionValue}
                uploadProps={uploadProps}
              />
            </div>
            {/* 另存为 */}
            <div
              className={headerStyles.margin_right10}
              style={{ position: 'relative' }}
            >
              <Dropdown
                trigger={['click']}
                overlay={this.saveAsMenu()}
                getPopupContainer={triggerNode => triggerNode.parentNode}
              >
                <Button
                  type={'primary'}
                  style={{ height: 24, lineHeight: '24px' }}
                >
                  <span
                    style={{ marginRight: '4px' }}
                    className={`${globalStyles.authTheme} ${headerStyles.right__shareIndicator_icon}`}
                  >
                    &#xe63b;
                  </span>
                  保存{' '}
                  <span
                    style={{
                      display: 'inline-block',
                      verticalAlign: 'middle',
                      fontSize: '12px',
                      marginLeft: '2px'
                    }}
                    className={`${globalStyles.authTheme}`}
                  >
                    &#xe7ee;
                  </span>
                </Button>
              </Dropdown>
            </div>

            {/* 分享协作 */}
            {/* <div className={headerStyles.share_wrapper}>
              {file_id && (
                <div
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    marginRight: '10px'
                  }}
                >
                  <span>
                    {is_shared === '1' ? (
                      <span
                        className={headerStyles.right__shareIndicator}
                        onClick={this.handleChangeOnlyReadingShareModalVisible}
                      >
                        <span
                          className={`${globalStyles.authTheme} ${headerStyles.right__shareIndicator_icon}`}
                        >
                          &#xe7e7;
                        </span>
                        <span
                          className={headerStyles.right__shareIndicator_text}
                        >
                          正在分享
                        </span>
                      </span>
                    ) : (
                      <span className={`${headerStyles.share_icon}`}>
                        <Tooltip title="分享协作" placement="top">
                          <span
                            onClick={
                              this.handleChangeOnlyReadingShareModalVisible
                            }
                            className={`${globalStyles.authTheme} ${headerStyles.right__share}`}
                            style={{ fontSize: '20px' }}
                          >
                            &#xe7e7;
                          </span>
                        </Tooltip>
                      </span>
                    )}
                    <ShareAndInvite
                      onlyReadingShareModalVisible={
                        onlyReadingShareModalVisible
                      }
                      handleChangeOnlyReadingShareModalVisible={
                        this.handleChangeOnlyReadingShareModalVisible
                      }
                      data={onlyReadingShareData}
                      handleOnlyReadingShareExpChangeOrStopShare={
                        this.handleOnlyReadingShareExpChangeOrStopShare
                      }
                    />
                  </span>
                </div>
              )}
            </div> */}

            {/* 访问控制 */}
            <div className={headerStyles.margin_right10}>
              {board_id && (
                <VisitControl
                  board_id={board_id}
                  isPropVisitControl={is_privilege === '0' ? false : true}
                  handleVisitControlChange={this.handleVisitControlChange}
                  otherPrivilege={privileges}
                  notShowPrincipal={true}
                  handleClickedOtherPersonListOperatorItem={
                    this.handleClickedOtherPersonListOperatorItem
                  }
                  handleAddNewMember={this.handleVisitControlAddNewMember}
                />
              )}
            </div>
            {/* 通知提醒 */}
            {checkIsHasPermissionInVisitControl(
              'edit',
              privileges,
              is_privilege,
              [],
              checkIsHasPermissionInBoard(PROJECT_FILES_FILE_EDIT, board_id)
            ) && (
              <div
                className={headerStyles.margin_right10}
                style={{ marginTop: '4px' }}
              >
                <InformRemind
                  rela_fileId={filePreviewCurrentFileId}
                  rela_id={filePreviewCurrentVersionId}
                  rela_type={'4'}
                  user_remind_info={data}
                />
              </div>
            )}
          </>
        )}

        {/* 全屏 */}
        <div>
          <div
            style={{ cursor: 'pointer' }}
            onClick={this.zoomFrame}
            className={`${globalStyles.authTheme}`}
          >
            <span style={{ fontSize: '22px' }}>&#xe7f3;</span>
          </div>
        </div>

        {/* 另存为Modal */}
        <div>
          <SaveAsNewVersionFile
            projectDetailInfoData={projectDetailInfoData}
            currentPreviewFileData={currentPreviewFileData}
            boardFolderTreeData={boardFolderTreeData}
            setSaveAsNewVersionVisible={this.setSaveAsNewVersionVisible}
            visible={this.state.saveAsNewVersionFileVisible}
            title={this.state.saveAsNewVersionFileTitle}
            titleKey={this.state.titleKey}
            handleSaveAsNewVersionButton={this.handleSaveAsNewVersionButton}
            handleSaveAsOthersNewVersionButton={
              this.handleSaveAsOthersNewVersionButton
            }
            whetherUpdateFolderListData={this.props.whetherUpdateFolderListData}
            shouldUpdateAllFolderListData={
              this.props.shouldUpdateAllFolderListData
            }
          />
        </div>
      </div>
    )
  }
}

function mapStateToProps({
  projectDetail: {
    datas: { projectDetailInfoData = {} }
  },
  technological: {
    datas: { userBoardPermissions }
  }
}) {
  return {
    projectDetailInfoData,
    userBoardPermissions
  }
}
