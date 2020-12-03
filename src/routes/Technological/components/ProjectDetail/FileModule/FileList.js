import React from 'react'
import indexStyles from './index.less'
import { Table, Menu, Dropdown, Icon, message, Modal, Tooltip } from 'antd'
import CreatDirector from './CreatDirector'
import globalStyles from '../../../../../globalset/css/globalClassName.less'
import {
  MESSAGE_DURATION_TIME,
  NOT_HAS_PERMISION_COMFIRN,
  PROJECT_FILES_FILE_DOWNLOAD,
  PROJECT_FILES_FILE_DELETE,
  PROJECT_FILES_FILE_UPLOAD,
  PROJECT_FILES_FOLDER
} from '../../../../../globalset/js/constant'
import {
  checkIsHasPermissionInBoard,
  checkIsHasPermissionInVisitControl
} from '../../../../../utils/businessFunction'
import { FILES } from '../../../../../globalset/js/constant'
import {
  currentNounPlanFilterName,
  getSubfixName
} from '../../../../../utils/businessFunction'

import VisitControl from './../../VisitControl/index'
import {
  toggleContentPrivilege,
  setContentPrivilege,
  removeContentPrivilege
} from './../../../../../services/technological/project'
import { connect } from 'dva'
import { timestampToTimeNormal } from '@/utils/util'
import { arrayNonRepeatfy } from '../../../../../utils/util'

const bodyOffsetHeight = document.querySelector('body').offsetHeight

@connect(mapStateToProps)
export default class FileList extends React.Component {
  state = {
    //排序，tru为升序，false为降序
    nameSort: true,
    sizeSort: true,
    creatorSort: true,
    visitControlModalVisible: false, //访问控制Modal visible
    visitControlModalData: {}, //访问控制Modal data
    shouldHideVisitControlPopover: false, // 是否显示访问控制
    fileGroupOperatorDropdownMenuVisible: false, // 文件列表中的点点点
    isShouldBeFileGroupOperatorDropdownMenuVisible: false
  }
  //table变换
  handleChange = (pagination, filters, sorter) => {}
  //选择框单选或者全选
  onSelectChange = (selectedRowKeys, selectedRows) => {
    const { dispatch } = this.props
    dispatch({
      type: 'projectDetailFile/updateDatas',
      payload: {
        selectedRowKeys,
        selectedRows
      }
    })
    // console.log(selectedRowKeys)
  }

  //item操作
  operationMenuClick(data, board_id, e) {
    const { file_id, type, file_resource_id, privileges, is_privilege } = data
    const { projectDetailInfoData = {}, dispatch } = this.props
    // const { board_id } = projectDetailInfoData
    const { key } = e

    switch (key) {
      case '1':
        break
      case '2': // 下载
        if (
          !checkIsHasPermissionInVisitControl(
            'edit',
            privileges,
            is_privilege,
            [],
            checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DOWNLOAD, board_id)
          )
        ) {
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        dispatch({
          type: 'projectDetailFile/fileDownload',
          payload: {
            ids: file_resource_id,
            fileIds: file_id
          }
        })
        break
      case '3': // 移动
        if (
          !checkIsHasPermissionInVisitControl(
            'edit',
            privileges,
            is_privilege,
            [],
            checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPLOAD, board_id)
          )
        ) {
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }

        dispatch({
          type: 'projectDetailFile/updateDatas',
          payload: {
            copyOrMove: '0',
            openMoveDirectoryType: '2',
            moveToDirectoryVisiblie: true,
            currentFileListMenuOperatorId: file_id
          }
        })
        break
      case '4': // 复制
        if (
          !checkIsHasPermissionInVisitControl(
            'edit',
            privileges,
            is_privilege,
            [],
            checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPLOAD, board_id)
          )
        ) {
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }

        dispatch({
          type: 'projectDetailFile/updateDatas',
          payload: {
            copyOrMove: '1',
            openMoveDirectoryType: '2',
            moveToDirectoryVisiblie: true,
            currentFileListMenuOperatorId: file_id
          }
        })
        break
      case '5': // 移动到回收站
        if (
          !checkIsHasPermissionInVisitControl(
            'edit',
            privileges,
            is_privilege,
            [],
            checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DELETE, board_id)
          )
        ) {
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }

        dispatch({
          type: 'projectDetailFile/fileRemove',
          payload: {
            board_id,
            arrays: JSON.stringify([{ type, id: file_id }])
          }
        })
        break
      case '99': // 访问控制
        // this.handleShowVisitControlModal(data)
        break
      default:
        break
    }
  }

  //列表排序, 有限排序文件夹
  normalSort(filedata_1, filedata_2, key, state) {
    const that = this
    filedata_1.sort(function(a, b) {
      if (that.state[state]) {
        return a[key].localeCompare(b[key])
      } else {
        return b[key].localeCompare(a[key])
      }
    })
    filedata_2.sort(function(a, b) {
      if (that.state[state]) {
        return a[key].localeCompare(b[key])
      } else {
        return b[key].localeCompare(a[key])
      }
    })
    const { dispatch } = this.props
    dispatch({
      type: 'projectDetailFile/updateDatas',
      payload: {
        fileList: [...filedata_1, ...filedata_2]
      }
    })
  }

  fiterSizeUnit(file_size) {
    let transSize
    const sizeTransNumber = parseFloat(file_size)
    if (!file_size) {
      return
    }
    if (file_size.indexOf('G') !== -1) {
      transSize = 1024 * 1024 * 1024 * sizeTransNumber
    } else if (file_size.indexOf('MB') !== -1) {
      transSize = 1024 * 1024 * sizeTransNumber
    } else if (file_size.indexOf('KB') !== -1) {
      transSize = 1024 * sizeTransNumber
    } else {
      transSize = sizeTransNumber
    }
    return transSize
  }

  sizeSort(filedata_1, filedata_2, key, state) {
    const that = this
    filedata_1.sort(function(a, b) {
      if (that.state[state]) {
        return that.fiterSizeUnit(a[key]) - that.fiterSizeUnit(b[key])
      } else {
        return that.fiterSizeUnit(b[key]) - that.fiterSizeUnit(a[key])
      }
    })
    filedata_2.sort(function(a, b) {
      if (that.state[state]) {
        return that.fiterSizeUnit(a[key]) - that.fiterSizeUnit(b[key])
      } else {
        return that.fiterSizeUnit(b[key]) - that.fiterSizeUnit(a[key])
      }
    })

    const { dispatch } = this.props
    dispatch({
      type: 'projectDetailFile/updateDatas',
      payload: {
        fileList: [...filedata_1, ...filedata_2]
      }
    })
  }

  listSort(key) {
    const { filedata_1, filedata_2 } = this.props
    switch (key) {
      case '1':
        this.setState(
          {
            nameSort: !this.state.nameSort
          },
          function() {
            this.normalSort(filedata_1, filedata_2, 'file_name', 'nameSort')
          }
        )
        break
      case '2':
        this.setState(
          {
            sizeSort: !this.state.sizeSort
          },
          function() {
            this.sizeSort(filedata_1, filedata_2, 'file_size', 'sizeSort')
          }
        )
        break
      case '3':
        this.setState(
          {
            creatorSort: !this.state.creatorSort
          },
          function() {
            this.normalSort(filedata_1, filedata_2, 'creator', 'creatorSort')
          }
        )
        break
      default:
        break
    }
    //排序的时候清空掉所选项
    const { dispatch } = this.props
    dispatch({
      type: 'projectDetailFile/updateDatas',
      payload: {
        selectedRowKeys: [],
        selectedRows: []
      }
    })
  }

  //文件名类型
  judgeFileType(fileName) {
    let themeCode = ''
    const type = getSubfixName(fileName)
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

  //文件夹或文件点击
  open(data, type) {
    const { breadcrumbList = [], currentParrentDirectoryId } = this.props
    const { belong_folder_id, file_id } = data
    const new_breadcrumbList = [...breadcrumbList]
    if (belong_folder_id === currentParrentDirectoryId) {
      new_breadcrumbList.push(data)
    } else {
      new_breadcrumbList[new_breadcrumbList.length - 1] = data
    }
    //顺便将isInAddDirectory设置为不在添加文件夹状态
    const { dispatch } = this.props
    dispatch({
      type: 'projectDetailFile/updateDatas',
      payload: {
        breadcrumbList: new_breadcrumbList,
        currentParrentDirectoryId:
          type === '1' ? file_id : currentParrentDirectoryId,
        isInAddDirectory: false
      }
    })
  }

  openDirectory(data) {
    this.open(data, '1')
    //接下来做文件夹请求的操作带id
    const { file_id } = data

    const { dispatch } = this.props
    dispatch({
      type: 'projectDetailFile/getFileList',
      payload: {
        folder_id: file_id
      }
    })
    dispatch({
      type: 'projectDetailFile/updateDatas',
      payload: {
        selectedRows: [],
        selectedRowKeys: []
      }
    })
  }

  openFile(data) {
    const {
      file_id,
      version_id,
      file_resource_id,
      file_name,
      board_id,
      id
    } = data
    // console.log(data, 'ssssss')
    // if(getSubfixName(file_name) == '.pdf' && checkIsHasPermissionInBoard(PROJECT_FILES_FILE_EDIT)) {
    //   openPDF({id: file_id})
    //   return false
    // }
    this.open(data, '2')

    const { fileList = [], dispatch } = this.props
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
        fileType: getSubfixName(file_name),
        isInOpenFile: true,
        filePreviewCurrentName: file_name
      }
    })
    // this.props.setPreviewFileModalVisibile && this.props.setPreviewFileModalVisibile();
    // dispatch({
    //   type: 'projectDetailFile/getCardCommentListAll',
    //   payload: {
    //     id: file_id
    //   }
    // })
    // dispatch({
    //   type: 'projectDetailFile/updateDatas',
    //   payload: {
    //     filePreviewCurrentFileId: file_id
    //   }
    // })
    // dispatch({
    //   type: 'projectDetailFile/getFileType',
    //   payload: {
    //     fileList,
    //     file_id
    //   }
    // })
    // //接下来打开文件
    // dispatch({
    //   type: 'projectDetailFile/updateDatas',
    //   payload: {
    //     isInOpenFile: true,
    //     seeFileInput: 'fileModule',
    //     // currentPreviewFileData: data,
    //     filePreviewCurrentFileId: file_id,
    //     filePreviewCurrentId: file_resource_id,
    //     filePreviewCurrentVersionId: version_id,
    //     pdfDownLoadSrc: '',
    //   }
    // })
    // if (getSubfixName(file_name) == '.pdf') {
    //   dispatch({
    //     type: 'projectDetailFile/getFilePDFInfo',
    //     payload: {
    //       id: file_id
    //     }
    //   })
    // } else {
    //   dispatch({
    //     type: 'projectDetailFile/filePreview',
    //     payload: {
    //       id: file_resource_id, file_id
    //     }
    //   })
    //   // 这里调用是用来获取以及更新访问控制文件弹窗详情中的数据, 一开始没有的
    //   // 但是这样会影响 文件路径, 所以传递一个参数来阻止更新
    //   dispatch({
    //     type: 'projectDetailFile/fileInfoByUrl',
    //     payload: {
    //       file_id: file_id,
    //       isNotNecessaryUpdateBread: true
    //     }
    //   })
    // }
    // dispatch({
    //   type: 'projectDetailFile/fileVersionist',
    //   payload: {
    //     version_id
    //   }
    // })
    //通过url
    // this.props.openFileInUrl({file_id})
  }

  // // 点击访问控制的回调
  // async handleShowVisitControlModal(data) {
  //   console.log(data, 'sssssss')
  //   await this.initVisitControlModalData(data) // 初始化数据
  //   await this.toggleVisitControlModal(true) // 初始化弹窗变量
  // }

  // 点击弹窗ok的回调
  handleVisitControlModalOk = () => {
    this.toggleVisitControlModal(false)
  }

  // 点击弹窗取消的回调
  handleVisitControlModalCancel = () => {
    this.toggleVisitControlModal(false)
  }

  // 初始化访问控制中modal中的数据
  initVisitControlModalData = data => {
    this.setState({
      visitControlModalData: data
    })
  }

  // 访问控制切换的数据
  toggleVisitControlModal = flag => {
    this.setState({
      visitControlModalVisible: flag
    })
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
      privileges
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
      fileTypeName,
      fileOrFolderName,
      visitControlOtherPersonOperatorMenuItem,
      is_privilege,
      privileges,
      removeMemberPromptText:
        type === '1'
          ? '移出后用户将不能访问此文件夹'
          : '移出后用户将不能访问此文件'
    }
  }

  /**
   * 点击点点点的回调
   * @param {Boolean} visible 显示隐藏
   */
  toggleDropdownVisible = (visible, data) => {
    const { isShouldBeFileGroupOperatorDropdownMenuVisible } = this.state
    if (isShouldBeFileGroupOperatorDropdownMenuVisible) return
    if (visible == true) {
      this.setState({
        shouldHideVisitControlPopover: false // 不让他隐藏
      })
      this.initVisitControlModalData(data)
    }
    this.setState({
      fileGroupOperatorDropdownMenuVisible: visible // 让文件的dropdown跟随点击的状态变化
    })
  }

  // 访问控制的popover显示
  handleVisitControlPopoverVisible = flag => {
    if (!flag) {
      this.setState({
        fileGroupOperatorDropdownMenuVisible: false // 如果flag为false, 则相当于点击了两次,则要控制隐藏
      })
    }
    this.setState({
      isShouldBeFileGroupOperatorDropdownMenuVisible: flag
    })
  }

  // 暂时...??
  hideFileGroupOperatorDropdownMenuWhenScroll = nextProps => {
    const { isScrolling: nextIsScrolling } = nextProps
    if (nextIsScrolling) {
      this.setState({
        isShouldBeFileGroupOperatorDropdownMenuVisible: false,
        fileGroupOperatorDropdownMenuVisible: false,
        shouldHideVisitControlPopover: true
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    this.hideFileGroupOperatorDropdownMenuWhenScroll(nextProps)
  }

  // 获取访问控制弹窗中的数据类型??
  getVisitControlModalDataType = () => {
    const {
      visitControlModalData: { type }
    } = this.state
    return type == '1' ? 'folder' : 'file'
  }

  getVisitControlModalDataId = () => {
    const dataType = this.getVisitControlModalDataType()
    const {
      visitControlModalData: { folder_id, file_id }
    } = this.state
    return dataType == 'file' ? file_id : folder_id
  }

  isTheSameVisitControlState = flag => {
    const {
      visitControlModalData: { is_privilege }
    } = this.state
    const toBool = str => !!Number(str)
    const is_privilege_bool = toBool(is_privilege)
    if (flag == is_privilege_bool) {
      return true
    }
    return false
  }

  /**
   * 访问控制移除成员
   * @param {String} id 移除成员对应的id
   */
  handleVisitControlRemoveContentPrivilege = id => {
    const content_id = this.getVisitControlModalDataId()
    const content_type = this.getVisitControlModalDataType()
    removeContentPrivilege({
      id: id
    }).then(res => {
      const isResOk = res => res && res.code == '0'
      if (isResOk(res)) {
        setTimeout(() => {
          message.success('移除用户成功')
        }, 500)
        this.visitControlUpdateCurrentProjectData({
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
  handleVisitControlChangeContentPrivilege = (id, type, errorText) => {
    const {
      visitControlModalData: { folder_id, version_id, privileges }
    } = this.state
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
        let temp_arr = []
        temp_arr = res && res.data[0]
        // const addedPrivileges = ids.split(',').reduce((acc, curr) => Object.assign({}, acc, { [curr]: type }), {})
        this.visitControlUpdateCurrentProjectData({
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
    // const users_arr = ids.reduce((acc, curr) => {
    //   if (!acc) return curr
    //   return `${acc},${curr}`
    // }, '')
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
      visitControlModalData: { folder_id, version_id, privileges }
    } = this.state
    const dataType = this.getVisitControlModalDataType()
    const content_id = dataType == 'file' ? version_id : folder_id
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
        let temp_arr = res && res.data
        if (!Array.isArray(temp_arr)) return false
        this.visitControlUpdateCurrentProjectData({
          privileges: temp_arr,
          type: 'add'
        })
      } else {
        message.warning(res.message)
      }
    })
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

  /**
   * 访问控制的开关切换
   * @param {Boolean} flag 开关切换
   */
  handleToggleContentPrivilege = flag => {
    const {
      visitControlModalData: { folder_id, file_id, version_id }
    } = this.state
    const dataType = this.getVisitControlModalDataType()
    const data = {
      content_id: dataType == 'file' ? version_id : folder_id,
      content_type: dataType == 'file' ? 'file' : 'folder',
      is_open: flag ? 1 : 0
    }
    toggleContentPrivilege(data).then(res => {
      const resOk = res => res && res.code == '0'
      if (resOk(res)) {
        setTimeout(() => {
          message.success('设置成功')
        }, 500)
        let temp_arr = res && res.data
        if (!Array.isArray(temp_arr)) return false
        this.visitControlUpdateCurrentProjectData({
          is_privilege: flag ? '1' : '0',
          type: 'privilege',
          privileges: temp_arr
        })
      } else {
        message.warning(res.message)
      }
    })
  }

  // 访问控制更新数据
  visitControlUpdateCurrentProjectData = obj => {
    const {
      visitControlModalData,
      visitControlModalData: { belong_folder_id, privileges, file_id }
    } = this.state
    const { dispatch, selectedRows = [] } = this.props

    // 访问控制开关切换
    if (obj && obj.type && obj.type == 'privilege') {
      let new_privileges = []

      for (let item in obj) {
        if (item == 'privileges') {
          obj[item].map(val => {
            let temp_arr = arrayNonRepeatfy([].concat(...privileges, val))
            if (!Array.isArray(temp_arr)) return false
            return (new_privileges = [...temp_arr])
          })
        }
      }
      let new_visitControlModalData = {
        ...visitControlModalData,
        is_privilege: obj.is_privilege,
        privileges: new_privileges
      }
      this.setState({
        visitControlModalData: new_visitControlModalData
      })
      dispatch({
        type: 'projectDetailFile/getFileList',
        payload: {
          folder_id: belong_folder_id,
          whetherUpdateFileList: true
        }
      })
      // 这里是也要更新选中的列表, 但是需要这个选择列表存在的情况下
      if (selectedRows && selectedRows.length) {
        this.updateSelectedRowsData({
          new_privileges,
          is_privilege: obj.is_privilege,
          file_id
        })
      }
    }

    // 访问控制添加
    if (obj && obj.type && obj.type == 'add') {
      let new_privileges = []
      for (let item in obj) {
        if (item == 'privileges') {
          obj[item].map(val => {
            let temp_arr = arrayNonRepeatfy([].concat(...privileges, val))
            if (!Array.isArray(temp_arr)) return false
            return (new_privileges = [...temp_arr])
          })
        }
      }
      let new_visitControlModalData = {
        ...visitControlModalData,
        privileges: new_privileges
      }

      this.setState({
        visitControlModalData: new_visitControlModalData
      })
      dispatch({
        type: 'projectDetailFile/getFileList',
        payload: {
          folder_id: belong_folder_id,
          whetherUpdateFileList: true
        }
      })
      if (selectedRows && selectedRows.length) {
        this.updateSelectedRowsData({ new_privileges, file_id })
      }
    }

    // 访问控制移除
    if (obj && obj.type && obj.type == 'remove') {
      let new_privileges = [...privileges]
      new_privileges.map((item, index) => {
        if (item.id == obj.removeId) {
          new_privileges.splice(index, 1)
        }
      })
      let new_visitControlModalData = {
        ...visitControlModalData,
        privileges: new_privileges
      }
      this.setState({
        visitControlModalData: new_visitControlModalData
      })

      dispatch({
        type: 'projectDetailFile/getFileList',
        payload: {
          folder_id: belong_folder_id,
          whetherUpdateFileList: true
        }
      })
      if (selectedRows && selectedRows.length) {
        this.updateSelectedRowsData({ new_privileges, file_id })
      }
    }

    // 访问控制设置
    if (obj && obj.type && obj.type == 'change') {
      let { id, content_privilege_code, user_info } = obj.temp_arr
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
      let new_visitControlModalData = {
        ...visitControlModalData,
        privileges: new_privileges
      }
      this.setState({
        visitControlModalData: new_visitControlModalData
      })

      dispatch({
        type: 'projectDetailFile/getFileList',
        payload: {
          folder_id: belong_folder_id,
          whetherUpdateFileList: true
        }
      })
      if (selectedRows && selectedRows.length) {
        this.updateSelectedRowsData({ new_privileges, file_id })
      }
    }
  }

  // 文件选中列表中的更新数据
  updateSelectedRowsData = obj => {
    const { selectedRows = [], dispatch } = this.props
    let new_selectedRows = [...selectedRows]
    new_selectedRows =
      new_selectedRows &&
      new_selectedRows.map(item => {
        let new_item = item
        if (item.file_id == obj.file_id) {
          new_item = {
            ...item,
            privileges: obj.new_privileges,
            is_privilege: obj.is_privilege
              ? obj.is_privilege
              : item.is_privilege
          }
        } else {
          new_item = { ...item }
        }
        return new_item
      })
    dispatch({
      type: 'projectDetailFile/updateDatas',
      payload: {
        selectedRows: new_selectedRows
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

  render() {
    const {
      selectedRowKeys,
      selectedRows,
      fileList = [],
      board_id
    } = this.props
    const {
      nameSort,
      sizeSort,
      creatorSort,
      visitControlModalVisible,
      visitControlModalData,
      visitControlModalData: {
        belong_folder_id,
        privileges = [],
        privileges_extend = []
      },
      shouldHideVisitControlPopover
    } = this.state
    const new_projectParticipant =
      privileges_extend && privileges_extend.length
        ? arrayNonRepeatfy([].concat(...privileges_extend))
        : []
    // 文件列表的点点点选项
    const operationMenu = (data, board_id) => {
      const { type, is_privilege, privileges, file_id } = data
      // 当type为1的时候为文件夹: 只有访问控制和移动回收站
      return (
        <Menu
          getPopupContainer={triggerNode => triggerNode.parentNode}
          onClick={this.operationMenuClick.bind(this, data, board_id)}
        >
          {/*<Menu.Item key="1">收藏</Menu.Item>*/}
          {type != '1' &&
          checkIsHasPermissionInVisitControl(
            'edit',
            privileges,
            is_privilege,
            [],
            checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DOWNLOAD, board_id)
          ) ? (
            <Menu.Item key="2">下载</Menu.Item>
          ) : (
            ''
          )}
          {
            <Menu.Item key="99">
              {!shouldHideVisitControlPopover && (
                <div
                // style={{marginLeft: '-35px', minWidth: '130px'}}
                >
                  <VisitControl
                    board_id={board_id}
                    popoverPlacement={'rightTop'}
                    isPropVisitControl={is_privilege == '0' ? false : true}
                    principalList={new_projectParticipant}
                    principalInfo="位任务列表负责人"
                    // notShowPrincipal={true}
                    otherPrivilege={privileges}
                    otherPersonOperatorMenuItem={
                      visitControlOtherPersonOperatorMenuItem
                    }
                    removeMemberPromptText="移出后用户将不能访问此任务列表"
                    handleVisitControlChange={this.handleVisitControlChange}
                    handleVisitControlPopoverVisible={
                      this.handleVisitControlPopoverVisible
                    }
                    handleClickedOtherPersonListOperatorItem={
                      this.handleClickedOtherPersonListOperatorItem
                    }
                    handleAddNewMember={this.handleVisitControlAddNewMember}
                  >
                    <span>
                      访问控制&nbsp;&nbsp;
                      <span className={globalStyles.authTheme}>&#xe7eb;</span>
                    </span>
                  </VisitControl>
                </div>
              )}
            </Menu.Item>
          }
          {/* PROJECT_FILES_FOLDER */}
          {type != '1' &&
          checkIsHasPermissionInVisitControl(
            'edit',
            privileges,
            is_privilege,
            [],
            checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPLOAD, board_id)
          ) ? (
            <Menu.Item key="3">移动</Menu.Item>
          ) : (
            ''
          )}
          {type != '1' &&
          checkIsHasPermissionInVisitControl(
            'edit',
            privileges,
            is_privilege,
            [],
            checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPLOAD, board_id)
          ) ? (
            <Menu.Item key="4">复制</Menu.Item>
          ) : (
            ''
          )}
          {checkIsHasPermissionInVisitControl(
            'edit',
            privileges,
            is_privilege,
            [],
            checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DELETE, board_id)
          ) && <Menu.Item key="5">移到回收站</Menu.Item>}
        </Menu>
      )
    }

    // 采用的table组件, 这是每一列的标题等内容
    const columns = [
      {
        title: (
          <div
            style={{ color: '#8c8c8c', cursor: 'pointer' }}
            onClick={this.listSort.bind(this, '1')}
          >
            {currentNounPlanFilterName(FILES)}名
            <Icon
              type={nameSort ? 'caret-down' : 'caret-up'}
              theme="outlined"
              style={{ fontSize: 10, marginLeft: 6, color: '#595959' }}
            />
          </div>
        ),
        key: 'file_name',
        render: data => {
          const { type, file_name, isInAdd, is_privilege } = data
          if (isInAdd) {
            return <CreatDirector />
          } else {
            return type === '1' ? (
              <span
                onClick={this.openDirectory.bind(this, data)}
                style={{
                  cursor: 'pointer',
                  display: 'inline-block',
                  maxWidth: '700px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis'
                }}
              >
                <i
                  className={globalStyles.authTheme}
                  style={{
                    fontStyle: 'normal',
                    fontSize: 22,
                    color: '#1890FF',
                    marginRight: 8,
                    cursor: 'pointer'
                  }}
                >
                  &#xe6c4;
                </i>
                {file_name}
                {is_privilege == '1' && (
                  <Tooltip title="已开启访问控制" placement="top">
                    <span
                      style={{
                        color: 'rgba(0,0,0,0.50)',
                        marginRight: '5px',
                        marginLeft: '5px'
                      }}
                    >
                      <span className={`${globalStyles.authTheme}`}>
                        &#xe7ca;
                      </span>
                    </span>
                  </Tooltip>
                )}
              </span>
            ) : (
              <span
                onClick={this.openFile.bind(this, data)}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <i
                  className={globalStyles.authTheme}
                  style={{
                    fontStyle: 'normal',
                    fontSize: 30,
                    color: '#1890FF',
                    marginRight: 8,
                    cursor: 'pointer'
                  }}
                  dangerouslySetInnerHTML={{
                    __html: this.judgeFileType(file_name)
                  }}
                ></i>
                <span style={{ display: 'flex' }}>
                  <span
                    style={{
                      maxWidth: '500px',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {this.getEllipsisFileName(file_name)}
                  </span>
                  {getSubfixName(file_name)}
                </span>
                {/* {file_name} */}
                {is_privilege == '1' && (
                  <Tooltip title="已开启访问控制" placement="top">
                    <span
                      style={{
                        color: 'rgba(0,0,0,0.50)',
                        marginRight: '5px',
                        marginLeft: '5px'
                      }}
                    >
                      <span className={`${globalStyles.authTheme}`}>
                        &#xe7ca;
                      </span>
                    </span>
                  </Tooltip>
                )}
              </span>
            )
          }
        }
      },
      {
        title: (
          <div
            style={{ color: '#8c8c8c', cursor: 'pointer' }}
            onClick={this.listSort.bind(this, '2')}
          >
            大小
            <Icon
              type={sizeSort ? 'caret-down' : 'caret-up'}
              theme="outlined"
              style={{ fontSize: 10, marginLeft: 6, color: '#595959' }}
            />
          </div>
        ),
        dataIndex: 'file_size',
        key: 'file_size'
      },
      {
        title: '更新时间',
        dataIndex: 'update_time',
        key: 'update_time',
        render: (text, record, index) => {
          const { type } = record
          // console.log({text, record}, 'ssssssss')
          return (
            <div>
              {/* { timestampToTime(text, true)} */}
              {type == '2' ? timestampToTimeNormal(text, '/', true) : text}
            </div>
          )
        }
      },
      {
        title: (
          <div
            style={{ color: '#8c8c8c', cursor: 'pointer' }}
            onClick={this.listSort.bind(this, '3')}
          >
            创建人
            <Icon
              type={creatorSort ? 'caret-down' : 'caret-up'}
              theme="outlined"
              style={{ fontSize: 10, marginLeft: 6, color: '#595959' }}
            />
          </div>
        ),
        dataIndex: 'creator',
        key: 'creator'
      },
      {
        title: '操作',
        key: 'operator',
        render: data => {
          // 这个data为当前行的值, 有以下这些等等, 这是antd中自带的组件
          /**
           * belong_folder_id: "1173834546270048258"
              create_time: "2019-09-17 13:42:19"
              creator: "加菲猫"
              file_id: "1173834546270048260"
              file_name: "过程文件"
              folder_id: "1173834546270048260"
              folder_name: "过程文件"
              is_privilege: "0"
              privileges: []
              privileges_extend: []
              type: "1"
              update_time: "2019-09-17 13:42:19"
           */
          const { isInAdd } = data
          if (!isInAdd) {
            return (
              <div style={{ cursor: 'pointer', position: 'relative' }}>
                <Dropdown
                  zIndex={5}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  overlay={operationMenu(data, board_id)}
                  trigger={['click']}
                  onVisibleChange={visible => {
                    this.toggleDropdownVisible(visible, data)
                  }}
                >
                  <Icon
                    type="ellipsis"
                    theme="outlined"
                    style={{ fontSize: 22, color: '#000000' }}
                    // onClick={this.toggleDropdownVisible}
                  />
                </Dropdown>
              </div>
            )
          } else {
            return <div>--</div>
          }
        }
      }
    ]
    const {
      // child_privilegeuser_ids,
      removeMemberPromptText,
      is_privilege,
      fileTypeName,
      fileOrFolderName,
      visitControlOtherPersonOperatorMenuItem
    } = this.genVisitContorlData(visitControlModalData)

    return (
      <div
        className={indexStyles.tableOut}
        style={{ minHeight: bodyOffsetHeight }}
      >
        <Table
          rowSelection={{
            selectedRowKeys,
            selectedRows,
            onChange: this.onSelectChange,
            // onSelectAll: this.onSelectAll,
            getCheckboxProps: data => ({
              disabled: data.type === '1', //data.isInAdd === true || data.type === '1', // Column configuration not to be checked
              name: data.type === '2' ? data.folder_id : data.file_id, //data.file_id,
              type: data.type
            })
          }}
          columns={columns}
          dataSource={fileList}
          pagination={false}
          onChange={this.handleChange.bind(this)}
          rowKey={record =>
            record.type == '2' ? record.file_id : record.folder_id
          }
        />
        {/* <Modal
          title={visitControlModalTitle}
          width={400}
          footer={null}
          destroyOnClose={true}
          visible={visitControlModalVisible}
          onCancel={this.handleVisitControlModalCancel}
        //  onOk={this.handleVisitControlModalOk}
        >
          <div style={{ paddingTop: '-24px', paddingBottom: '-24px' }}>
            <VisitControl
              onlyShowPopoverContent={true}
              isPropVisitControl={is_privilege == '0' ? false : true}
              principalInfo='位文件访问人'
              principalList={this.getVisitControlModalDataType() == 'file' ? privileges : [] }
              notShowPrincipal={this.getVisitControlModalDataType() == 'file' ? true : false}
              otherPrivilege={privileges}
              otherPersonOperatorMenuItem={visitControlOtherPersonOperatorMenuItem}
              removeMemberPromptText={removeMemberPromptText}
              handleVisitControlChange={this.handleVisitControlChange}
              handleAddNewMember={this.handleVisitControlAddNewMember}
              handleClickedOtherPersonListOperatorItem={this.handleClickedOtherPersonListOperatorItem}
            />
          </div>
        </Modal> */}
      </div>
    )
  }
}
function mapStateToProps({
  projectDetailFile: {
    datas: {
      filedata_1,
      filedata_2,
      selectedRowKeys,
      selectedRows,
      fileList = [],
      breadcrumbList = [],
      currentParrentDirectoryId
    }
  },
  projectDetail: {
    datas: { projectDetailInfoData = {}, board_id }
  },
  technological: {
    datas: { userBoardPermissions }
  }
}) {
  return {
    filedata_1,
    filedata_2,
    projectDetailInfoData,
    selectedRowKeys,
    selectedRows,
    fileList,
    board_id,
    breadcrumbList,
    currentParrentDirectoryId,
    userBoardPermissions
  }
}
