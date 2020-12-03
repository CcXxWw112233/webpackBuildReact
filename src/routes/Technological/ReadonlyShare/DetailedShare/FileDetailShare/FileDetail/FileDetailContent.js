import React from 'react'
import indexStyles from './index.less'
import globalStyles from '../../../../../../globalset/css/globalClassName.less'
import { Button, Menu, Dropdown, Icon, Tooltip, Modal } from 'antd'
import FileDerailBreadCrumbFileNav from './FileDerailBreadCrumbFileNav'
import Comment from './Comment/Comment'
import Comment2 from './Comment/Comment2'
import CommentListItem2 from './Comment/CommentListItem2'
import ContentRaletion from '../../../../../../components/ContentRaletion'
import {
  checkIsHasPermissionInBoard,
  checkIsHasPermissionInVisitControl,
  getSubfixName,
  checkIsHasPermission
} from '../../../../../../utils/businessFunction'
import {
  MESSAGE_DURATION_TIME,
  NOT_HAS_PERMISION_COMFIRN,
  PROJECT_FILES_COMMENT_PUBLISH,
  PROJECT_FILES_FILE_EDIT,
  PROJECT_FILES_COMMENT_VIEW,
  ORGANIZATION,
  PROJECT_FILES_FILE_DOWNLOAD,
  UPLOAD_FILE_SIZE,
  PROJECT_FILES_FILE_UPLOAD,
  PROJECT_FILES_FILE_DELETE,
  PROJECT_FILES_FILE_UPDATE,
  REQUEST_DOMAIN_FILE
} from '../../../../../../globalset/js/constant'
import { message } from 'antd/lib/index'
import {
  createShareLink,
  modifOrStopShareLink
} from '../../../../../../services/technological/workbench'
import Cookies from 'js-cookie'
import VisitControl from '../../../../components/VisitControl/index'
import {
  setContentPrivilege,
  toggleContentPrivilege,
  removeContentPrivilege
} from '../../../../../../services/technological/project'
import ZoomPicture from './../../../../../../components/ZoomPicture/index'
import withBodyClientDimens from './../../../../../../components/HOC/withBodyClientDimens'
import InformRemind from './../../../../../../components/InformRemind'
import VersionSwitching from './../../../../../../components/VersionSwitching'
import { setUploadHeaderBaseInfo } from './../../../../../../utils/businessFunction'
// import ShareAndInvite from '../../../../../ShareAndInvite/index'
import { connect } from 'dva'

@connect(mapStateToProps)
class FileDetailContent extends React.Component {
  versionItemClick({ value, key }) {
    const { file_resource_id, file_id } = value
    this.setState({
      imgLoaded: false
    })
    const { dispatch } = this.props
    dispatch({
      type: 'projectDetailFile/updateDatas',
      payload: {
        filePreviewCurrentId: file_resource_id,
        filePreviewCurrentFileId: file_id
      }
    })
    dispatch({
      type: 'projectDetailFile/filePreview',
      payload: {
        id: file_resource_id,
        file_id
      }
    })

    this.setState({
      imgLoaded: false,
      editMode: true,
      currentRect: { x: 0, y: 0, width: 0, height: 0 },
      isInAdding: false,
      isInEdditOperate: false,
      mentionFocus: false
    })
  }

  state = {
    rects: [],
    imgHeight: 0,
    imgWidth: 0, //获取到的图片宽高
    punctuateArea: 48, //点击圈点的
    maxImageWidth: 600, //设置imagload的最大值
    currentRect: { x: 0, y: 0, width: 0, height: 0 }, //当前操作的矩形属性
    isInAdding: false, //用来判断是否显示评论下拉
    isInEdditOperate: false, //用来判断不是点击存在的圈
    mentionFocus: false,
    imgLoaded: false,
    editMode: checkIsHasPermissionInBoard(PROJECT_FILES_FILE_EDIT),
    relations: [], //关联的内容
    onlyReadingShareModalVisible: false, //只读分享modal
    onlyReadingShareData: {},
    isZoomPictureFullScreenMode: false, //图评全屏模式

    // 是否显示点击时候的样式颜色
    is_show_active_color: true,

    // 更新版本信息列表,将其保存一个状态
    new_filePreviewCurrentVersionList: [],

    // 是否显示编辑版本信息的描述
    is_edit_version_description: false,

    // 定义一个数组来保存编辑状态的数组
    // editVersionFileList: [],
    editValue: '' // 编辑时候的文本信息
  }
  constructor() {
    super()
    this.x1 = 0
    this.y1 = 0
    this.isDragging = false
    this.SelectedRect = { x: 0, y: 0 }
  }

  componentWillMount() {
    const { filePreviewCommitPoints = [] } = this.props
    this.setState({
      rects: filePreviewCommitPoints
    })
  }

  componentWillReceiveProps(nextProps) {
    const rects = []
    const {
      filePreviewCommitPoints = [],
      filePreviewCurrentVersionList = []
    } = nextProps
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
    this.setState({
      rects: filePreviewCommitPoints
    })
  }

  //评图功能
  previewImgLoad(e) {
    const { maxImageWidth } = this.state
    this.setState({
      imgWidth:
        e.target.width >= maxImageWidth ? maxImageWidth : e.target.width,
      imgHeight: e.target.height,
      imgLoaded: true
    })
  }
  commitReactArea(data, e) {
    e.stopPropagation()
    const { filePreviewCurrentFileId } = this.props
    this.setState(
      {
        ...data,
        isInEdditOperate: false,
        isInAdding: true
      },
      () => {
        const { point_number } = data
        const { dispatch } = this.props

        dispatch({
          type: 'projectDetailFile/getPreviewFileCommits',
          payload: {}
        })
        dispatch({
          type: 'projectDetailFile/updateDatas',
          payload: {
            filePreviewCommitPointNumber: point_number,
            filePreviewPointNumCommits: []
          }
        })
        dispatch({
          type: 'projectDetailFile/getPreviewFileCommits',
          payload: {
            id: filePreviewCurrentFileId,
            type: 'point'
          }
        })
      }
    )
  }
  commitReactArea2(e) {
    e.stopPropagation()
  }
  commitClicShowEdit(data) {
    return

    const { flag, coordinates } = data
    const { filePreviewCurrentFileId } = this.props
    this.setState({
      currentRect: JSON.parse(coordinates),
      isInAdding: true,
      isInEdditOperate: true
    })
    const { dispatch } = this.props
    dispatch({
      type: 'projectDetailFile/updateDatas',
      payload: {
        filePreviewCommitPointNumber: flag
      }
    })
    dispatch({
      type: 'projectDetailFile/getPreviewFileCommits',
      payload: {
        type: 'point',
        id: filePreviewCurrentFileId
      }
    })
  }
  isObj(obj) {
    if (!obj || typeof obj != 'object') {
      return false
    } else {
      return true
    }
  }
  operateAreaClick(e) {
    const target = this.refs.operateArea //event.target || event.srcElement;
    const { clientWidth, modalTop = 20 } = this.props
    const offsetDe = clientWidth * 0.1
    this.x1 = e.clientX - target.offsetLeft - offsetDe
    this.y1 = e.clientY - target.offsetTop - modalTop
    this.SelectedRect = { x: 0, y: 0 }
    if (!this.isDragging) {
      const { punctuateArea, imgHeight, imgWidth } = this.state

      let x = this.x1
      let y = this.y1

      if (imgWidth - x < punctuateArea / 2) {
        //右边界
        x = imgWidth - punctuateArea
      } else if (x < punctuateArea / 2) {
        //左边界
        x = 0
      } else {
        x = x - punctuateArea / 2
      }
      if (imgHeight - y < punctuateArea / 2) {
        //下边界
        y = imgHeight - punctuateArea
      } else if (y < punctuateArea / 2) {
        //上边界
        y = 0
      } else {
        y = y - punctuateArea / 2
      }
      const property = {
        x: x,
        y: y,
        width: punctuateArea,
        height: punctuateArea,
        isAready: false
      }

      const { dispatch } = this.props
      dispatch({
        type: 'projectDetailFile/updateDatas',
        payload: {
          filePreviewPointNumCommits: [],
          filePreviewCommitPointNumber: ''
        }
      })
      this.setState({
        currentRect: property,
        isInEdditOperate: true
      })
    }
  }
  operateAreaBlur(e) {
    const that = this
    const { dispatch } = this.props

    setTimeout(function() {
      if (that.state.mentionFocus) {
        return false
      }
      that.setState({
        isInAdding: false,
        currentRect: { x: 0, y: 0, width: 0, height: 0 }
      })

      dispatch({
        type: 'projectDetailFile/updateDatas',
        payload: {
          filePreviewPointNumCommits: []
        }
      })
    }, 100)
  }
  setMentionFocus(bool) {
    this.setState({
      mentionFocus: bool
    })
  }
  stopDragging() {
    this.right = false
    const target = this.refs.operateArea
    target.onmousemove = null
    target.onmuseup = null
  }
  onmousedown(e) {
    this.setState({
      isInAdding: false
    })
    // 取得target上被单击的点
    const target = this.refs.operateArea //event.target || event.srcElement;
    const { clientWidth, modalTop = 20 } = this.props
    const offsetDe = clientWidth * 0.1
    this.x1 = e.clientX - target.offsetLeft - offsetDe
    this.y1 = e.clientY - target.offsetTop - modalTop
    this.SelectedRect = { x: 0, y: 0 }
    this.isDragging = false

    /*定义鼠标移动事件*/
    target.onmousemove = this.onmousemove.bind(this)
    /*定义鼠标抬起事件*/
    target.onmouseup = this.onmouseup.bind(this)
  }
  onmousemove(e) {
    //mousedown 后开始拖拽时添加
    if (!this.isDragging) {
      const property = {
        x: this.x1,
        y: this.y1,
        width: this.SelectedRect.x,
        height: this.SelectedRect.y,
        isAready: false
      }
      this.setState({
        currentRect: property,
        isInEdditOperate: true
      })

      const { dispatch } = this.props
      dispatch({
        type: 'projectDetailFile/updateDatas',
        payload: {
          filePreviewPointNumCommits: [],
          filePreviewCommitPointNumber: ''
        }
      })
    }

    // 判断矩形是否开始拖拽
    const target = this.refs.operateArea //event.target || event.srcElement;
    this.isDragging = true

    // 判断拖拽对象是否存在
    const { clientWidth, modalTop = 20 } = this.props
    const offsetDe = clientWidth * 0.1
    if (this.isObj(this.SelectedRect)) {
      // 取得鼠标位置
      const x = e.clientX - target.offsetLeft - offsetDe
      const y = e.clientY - target.offsetTop - modalTop
      //------------------------
      //设置高度
      this.SelectedRect.x = x - this.x1
      this.SelectedRect.y = y - this.y1

      const { imgWidth, imgHeight, punctuateArea } = this.state

      // 更新拖拽的最新矩形
      let px =
        x < this.x1
          ? this.x1 - Math.abs(this.SelectedRect.x)
          : x - Math.abs(this.SelectedRect.x)
      let py =
        y < this.y1
          ? this.y1 - Math.abs(this.SelectedRect.y)
          : y - Math.abs(this.SelectedRect.y)
      let width = Math.abs(this.SelectedRect.x)
      let height = Math.abs(this.SelectedRect.y)

      if (imgWidth - px - width < 0) {
        //右边界
        width = imgWidth - px
      } else if (x < punctuateArea / 2) {
        //左边界
        width = 0
      } else {
        width = x - punctuateArea / 2
      }
      if (imgHeight - py - height < 0) {
        //下边界
        height = imgHeight - py
      } else if (y < punctuateArea / 2) {
        //上边界
        height = 0
      } else {
        height = y - punctuateArea / 2
      }
      const property = {
        x: px,
        y: py,
        width: Math.abs(this.SelectedRect.x),
        height: Math.abs(this.SelectedRect.y),
        isAready: false
      }

      this.setState({
        currentRect: property
      })
    }
  }
  onmouseup() {
    this.setState({
      isInAdding: true
    })
    this.stopDragging()
  }
  setEditMode() {
    return

    if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_EDIT)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    this.setState({
      editMode: !this.state.editMode
    })
  }
  deleteCommitSet(e) {
    return

    this.setState({
      isInAdding: false,
      currentRect: { x: 0, y: 0, width: 0, height: 0 }
    })
  }

  //header
  closeFile() {
    const { breadcrumbList = [], dispatch } = this.props
    const new_arr_ = [...breadcrumbList]
    new_arr_.splice(new_arr_.length - 1, 1)

    dispatch({
      type: 'projectDetailFile/updateDatas',
      payload: {
        isInOpenFile: false,
        filePreviewUrl: '',
        breadcrumbList: new_arr_
      }
    })
    dispatch({
      type: 'workbenchFileDetail/updateDatas',
      payload: {
        isInOpenFile: false,
        filePreviewUrl: '',
        breadcrumbList: new_arr_
      }
    })
  }
  zoomFrame() {
    const { isExpandFrame, dispatch } = this.props
    dispatch({
      type: 'projectDetailFile/updateDatas',
      payload: {
        isExpandFrame: !isExpandFrame
      }
    })
  }
  fileDownload({
    filePreviewCurrentId,
    filePreviewCurrentFileId,
    pdfDownLoadSrc
  }) {
    if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DOWNLOAD)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    //如果时pdf
    if (pdfDownLoadSrc) {
      window.open(pdfDownLoadSrc)
    } else {
      const { dispatch } = this.props
      dispatch({
        type: 'projectDetailFile/fileDownload',
        payload: {
          ids: filePreviewCurrentId,
          fileIds: filePreviewCurrentFileId
        }
      })
    }
  }
  //item操作
  operationMenuClick(data, e) {
    const { file_id, type, file_resource_id } = data
    const {
      projectDetailInfoData = {},
      breadcrumbList = [],
      pdfDownLoadSrc,
      dispatch
    } = this.props
    const new_breadcrumbList_ = [...breadcrumbList]
    const { board_id } = projectDetailInfoData
    const { key } = e
    switch (key) {
      case '1':
        break
      case '2':
        // if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DOWNLOAD)) {
        //   message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
        //   return false
        // }
        //如果时pdf
        if (pdfDownLoadSrc) {
          window.open(pdfDownLoadSrc)
        } else {
          dispatch({
            type: 'projectDetailFile/fileDownload',
            payload: {
              ids: file_resource_id,
              fileIds: file_id
            }
          })
        }
        break
      case '3':
        // if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_EDIT)) {
        //   message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
        //   return false
        // }
        dispatch({
          type: 'projectDetailFile/updateDatas',
          payload: {
            copyOrMove: '0',
            openMoveDirectoryType: '3',
            moveToDirectoryVisiblie: true
          }
        })
        break
      case '4':
        // if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DOWNLOAD)) {
        //   message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
        //   return false
        // }
        dispatch({
          type: 'projectDetailFile/updateDatas',
          payload: {
            copyOrMove: '1',
            openMoveDirectoryType: '3',
            moveToDirectoryVisiblie: true
          }
        })
        break
      case '5':
        // if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DELETE)) {
        //   message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
        //   return false
        // }

        dispatch({
          type: 'projectDetailFile/fileRemove',
          payload: {
            board_id,
            arrays: JSON.stringify([{ type, id: file_id }])
          }
        })
        new_breadcrumbList_.splice(new_breadcrumbList_.length - 1, 1)
        dispatch({
          type: 'projectDetailFile/updateDatas',
          payload: {
            isInOpenFile: false,
            breadcrumbList: new_breadcrumbList_
          }
        })
        break
      default:
        break
    }
  }
  getVersionItemMenuClick = ({ list, file_id, file_name }, e) => {
    e && e.domEvent && e.domEvent.stopPropagation()
    // console.log(list, 'sssss')
    const { dispatch } = this.props

    const key = e.key
    switch (key) {
      case '1': // 设置为主版本
        let file_resource_id = ''
        let file_version_id = ''
        let file_name = ''
        for (let val of list) {
          if (file_id == val['file_id']) {
            // console.log('进来了', 'sssss')
            file_resource_id = val['file_resource_id']
            file_version_id = val['version_id']
            file_name = val['file_name']
            break
          }
        }
        this.setState({
          imgLoaded: false
        })
        dispatch({
          type: 'projectDetailFile/updateDatas',
          payload: {
            filePreviewCurrentId: file_resource_id,
            filePreviewCurrentFileId: file_id
          }
        })
        //版本改变预览
        this.handleUploadPDForElesFilePreview({
          file_name,
          id: file_id,
          file_resource_id
        })

        dispatch({
          type: 'projectDetailFile/setCurrentVersionFile',
          payload: {
            id: file_id,
            set_major_version: '1',
            version_id: file_version_id,
            file_name: file_name
          }
        })

        this.setState({
          imgLoaded: false,
          editMode: true,
          currentRect: { x: 0, y: 0, width: 0, height: 0 },
          isInAdding: false,
          isInEdditOperate: false,
          mentionFocus: false
        })
        break
      case '2': // 移动回收站
        break
      case '3': // 编辑版本信息
        // console.log('进来了', 'ssssss')
        this.setState({
          is_edit_version_description: true
        })
        this.chgVersionFileEdit({ list, file_id, file_name })
        break
      default:
        break
    }
  }

  handleChangeOnlyReadingShareModalVisible = () => {
    const { onlyReadingShareModalVisible } = this.state
    //打开之前确保获取到数据
    if (!onlyReadingShareModalVisible) {
      Promise.resolve(this.createOnlyReadingShareLink())
        .then(() => {
          this.setState({
            onlyReadingShareModalVisible: true
          })
        })
        .catch(err => message.error('获取分享信息失败'))
    } else {
      this.setState({
        onlyReadingShareModalVisible: false
      })
    }
  }

  getSearchFromLocation = location => {
    if (!location.search) {
      return {}
    }
    return location.search
      .substring(1)
      .split('&')
      .reduce((acc, curr) => {
        const [key, value] = curr.split('=')
        return Object.assign({}, acc, { [key]: value })
      }, {})
  }

  createOnlyReadingShareLink = () => {
    // const { location } = this.props
    // //获取参数
    // const { board_id = '', appsSelectKey = '', file_id = '' } = this.getSearchFromLocation(location)
    const {
      currentPreviewFileBaseInfo: { file_id, board_id }
    } = this.props
    const payload = {
      board_id,
      rela_id: file_id,
      rela_type: '3'
    }
    return createShareLink(payload).then(({ code, data }) => {
      if (code === '0') {
        this.setState(() => {
          return {
            onlyReadingShareData: data
          }
        })
      } else {
        message.error('获取分享信息失败')
        return new Error('can not create share link.')
      }
    })
  }

  // 执行人列表去重
  arrayNonRepeatfy = arr => {
    let temp_arr = []
    let temp_id = []
    for (let i = 0; i < arr.length; i++) {
      if (!temp_id.includes(arr[i]['id'])) {
        //includes 检测数组是否有某个值
        temp_arr.push(arr[i])
        temp_id.push(arr[i]['id'])
      }
    }
    return temp_arr
  }

  // 访问控制权限弹窗
  alarmNoEditPermission = () => {
    message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
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
          }
          this.setState(state => {
            const { onlyReadingShareData } = state
            return {
              onlyReadingShareData: Object.assign({}, onlyReadingShareData, obj)
            }
          })
        } else {
          message.error('操作失败')
        }
      })
      .catch(err => {
        message.error('操作失败')
      })
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
  handleVisitControlChangeContentPrivilege = (id, type, errorText) => {
    const {
      version_id,
      privileges
    } = this.getFieldFromPropsCurrentPreviewFileData('version_id', 'privileges')
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
      version_id,
      privileges = []
    } = this.getFieldFromPropsCurrentPreviewFileData('version_id', 'privileges')
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

  /**
   * 访问控制的开关切换
   * @param {Boolean} flag 开关切换
   */
  handleVisitControlChange = flag => {
    const {
      is_privilege = '0',
      version_id
    } = this.getFieldFromPropsCurrentPreviewFileData(
      'is_privilege',
      'version_id'
    )
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

  // 访问控制更新数据
  visitControlUpdateCurrentModalData = obj => {
    const {
      currentPreviewFileBaseInfo,
      currentPreviewFileBaseInfo: { folder_id, privileges = [], is_privilege },
      board_id
    } = this.props
    const { dispatch } = this.props

    // 设置访问控制开关
    if (obj && obj.type && obj.type == 'privilege') {
      let new_privileges = [...privileges]
      for (let item in obj) {
        if (item == 'privileges') {
          // eslint-disable-next-line no-loop-func
          obj[item].map(val => {
            let temp_arr = this.arrayNonRepeatfy([].concat(...privileges, val))
            if (temp_arr && !temp_arr.length) return false
            return (new_privileges = [...temp_arr])
          })
        }
      }
      let newCurrentPreviewFileData = {
        ...currentPreviewFileBaseInfo,
        is_privilege: obj.is_privilege,
        privileges: new_privileges
      }
      dispatch({
        type: 'projectDetailFile/updateDatas',
        payload: {
          currentPreviewFileBaseInfo: newCurrentPreviewFileData
        }
      })
      dispatch({
        type: 'projectDetailFile/getFileList',
        payload: {
          folder_id: folder_id,
          whetherUpdateFileList: true
        }
      })
    }

    // 添加成员
    if (obj && obj.type && obj.type == 'add') {
      let new_privileges = []
      for (let item in obj) {
        if (item == 'privileges') {
          // eslint-disable-next-line no-loop-func
          obj[item].map(val => {
            let temp_arr = this.arrayNonRepeatfy([].concat(...privileges, val))
            if (!Array.isArray(temp_arr)) return false
            return (new_privileges = [...temp_arr])
          })
        }
      }
      let newCurrentPreviewFileData = {
        ...currentPreviewFileBaseInfo,
        privileges: new_privileges
      }

      dispatch({
        type: 'projectDetailFile/updateDatas',
        payload: {
          currentPreviewFileBaseInfo: newCurrentPreviewFileData
        }
      })

      dispatch({
        type: 'projectDetailFile/getFileList',
        payload: {
          folder_id: folder_id,
          whetherUpdateFileList: true
        }
      })
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
        ...currentPreviewFileBaseInfo,
        privileges: new_privileges
      }

      dispatch({
        type: 'projectDetailFile/updateDatas',
        payload: {
          currentPreviewFileBaseInfo: newCurrentPreviewFileData
        }
      })
      dispatch({
        type: 'projectDetailFile/getFileList',
        payload: {
          folder_id: folder_id,
          whetherUpdateFileList: true
        }
      })
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
        ...currentPreviewFileBaseInfo,
        privileges: new_privileges
      }

      dispatch({
        type: 'projectDetailFile/updateDatas',
        payload: {
          currentPreviewFileBaseInfo: newCurrentPreviewFileData
        }
      })

      dispatch({
        type: 'projectDetailFile/getFileList',
        payload: {
          folder_id: folder_id,
          whetherUpdateFileList: true
        }
      })
    }
  }

  getFieldFromPropsCurrentPreviewFileData = (...fields) => {
    const { currentPreviewFileBaseInfo = {} } = this.props
    return fields.reduce(
      (acc, curr) =>
        Object.assign({}, acc, { [curr]: currentPreviewFileBaseInfo[curr] }),
      {}
    )
  }
  async handleClickedCommentItem(flag) {
    const { filePreviewCurrentFileId, dispatch } = this.props

    await dispatch({
      type: 'projectDetailFile/updateDatas',
      payload: {
        filePreviewCommitPointNumber: flag
      }
    })
    await dispatch({
      type: 'projectDetailFile/getPreviewFileCommits',
      payload: {
        id: filePreviewCurrentFileId,
        type: 'point'
      }
    })
  }

  handleDeleteCommentItem = obj => {
    const { id } = obj
    const {
      filePreviewCurrentFileId,
      filePreviewPointNumCommits,
      dispatch
    } = this.props
    dispatch({
      type: 'projectDetailFile/deleteCommit',
      payload: {
        id,
        file_id: filePreviewCurrentFileId
      }
    })
    dispatch({
      type: 'projectDetailFile/updateDatas',
      payload: {
        filePreviewPointNumCommits: filePreviewPointNumCommits.filter(
          i => i.id !== id
        )
      }
    })
  }

  getCurrentUserId = () => {
    try {
      const { id } = localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo'))
        : {}
      return id
    } catch (e) {
      return ''
    }
  }

  handleGetNewComment = obj => {
    const { coordinates, comment, point_number } = obj
    const { filePreviewCurrentFileId, board_id, dispatch } = this.props
    dispatch({
      type: 'projectDetailFile/addFileCommit',
      payload: {
        board_id,
        point_number,
        comment,
        file_id: filePreviewCurrentFileId,
        type: '1',
        coordinates: JSON.stringify(coordinates)
      }
    })
  }

  handleZoomPictureFullScreen = flag => {
    this.setState({
      isZoomPictureFullScreenMode: flag
    })
  }

  //pdf文件和普通文件区别时做不同地处理预览
  handleUploadPDForElesFilePreview = ({ file_name, id, file_resource_id }) => {
    const { dispatch } = this.props
    if (getSubfixName(file_name) == '.pdf') {
      dispatch({
        type: 'projectDetailFile/getFilePDFInfo',
        payload: {
          id
        }
      })
    } else {
      dispatch({
        type: 'projectDetailFile/filePreview',
        payload: {
          id: file_resource_id,
          file_id: id
        }
      })
    }
  }

  // 修改编辑版本描述的方法
  chgVersionFileEdit({ list, file_id, file_name }) {
    // console.log(file_id, 'ssssss')
    // console.log(list, 'ssss')
    const { new_filePreviewCurrentVersionList } = this.state
    // console.log(new_filePreviewCurrentVersionList, 'ssssss')
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
    // console.log(temp_filePreviewCurrentVersionList, 'sssss')
    this.setState({
      new_filePreviewCurrentVersionList: temp_filePreviewCurrentVersionList,
      editValue: temp_val
    })
  }

  // 每一个menu菜单的item选项的切换 即点击切换预览文件版本
  handleVersionItem = e => {
    // console.log(e, 'ssss_22222')
    const { key } = e
    const { dispatch } = this.props
    const { new_filePreviewCurrentVersionList } = this.state
    // console.log(new_filePreviewCurrentVersionList, 'ssss')
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
    // console.log(temp_filePreviewCurrentVersionList, 'sssss')
    const {
      file_id,
      file_resource_id,
      version_id
    } = temp_filePreviewCurrentVersionList[0]
    dispatch({
      type: 'projectDetailFile/filePreview',
      payload: {
        file_id,
        file_resource_id,
        version_id,
        whetherToggleFilePriview: true
      }
    })
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
    // let val = e.target.value
    const { dispatch } = this.props
    const { editValue, is_edit_version_description } = this.state
    // console.log(is_edit_version_description, 'ssssss')
    // console.log(editValue, 'sssss')
    let new_list = [...list]
    // console.log(new_list, 'sssss')
    // let temp_id = [] // 定义一个空数组,用来保存正在编辑的版本文件的id
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
    // console.log(new_list, 'sssss')
    const { file_id, remarks } = temp_list[0]
    this.setState({
      is_edit_version_description: false,
      new_filePreviewCurrentVersionList: new_list
    })

    if (editValue != remarks) {
      dispatch({
        type: 'projectDetailFile/updateVersionFileDescription',
        payload: {
          id: file_id,
          version_info: editValue
        }
      })
      this.setState({
        editValue: ''
      })
    }
    dispatch({
      type: 'projectDetailFile/updateDatas',
      payload: {
        filePreviewCurrentVersionList: new_list
      }
    })
  }

  render() {
    const that = this
    const {
      rects,
      imgHeight = 0,
      imgWidth = 0,
      maxImageWidth,
      currentRect = {},
      isInAdding = false,
      isInEdditOperate = false,
      imgLoaded,
      editMode,
      relations,
      isZoomPictureFullScreenMode,
      is_edit_version_description,
      editVersionFileList,
      new_filePreviewCurrentVersionList,
      editValue,
      onlyReadingShareModalVisible,
      onlyReadingShareData
    } = this.state
    const {
      clientHeight,
      offsetTopDeviation,
      relations_Prefix = []
    } = this.props
    const { bodyClientWidth, bodyClientHeight } = this.props
    const fileDetailContentOutHeight = clientHeight - 60 - offsetTopDeviation

    let { componentHeight, componentWidth } = this.props
    if (!componentHeight && !componentWidth) {
      const container_fileDetailOut = document.getElementById(
        'container_fileDetailOut'
      )
      const fileDetailOutWidth = container_fileDetailOut
        ? container_fileDetailOut.offsetWidth
        : 800
      componentWidth = fileDetailOutWidth - 419
      componentHeight = fileDetailContentOutHeight - 20
    }

    const {
      projectDetailInfoData = {},
      currentParrentDirectoryId,
      filePreviewCurrentVersionId,
      pdfDownLoadSrc,
      filePreviewCurrentFileId,
      seeFileInput,
      filePreviewPointNumCommits,
      isExpandFrame = false,
      filePreviewUrl,
      filePreviewIsUsable,
      filePreviewCurrentId,
      filePreviewIsRealImage = false,
      currentPreviewFileBaseInfo = {},
      fileType,
      dispatch,
      clientWidth,
      board_id
    } = this.props

    const { data = [] } = projectDetailInfoData //任务执行人列表

    const { is_privilege, privileges = [] } = currentPreviewFileBaseInfo
    const zoomPictureParams = {
      board_id,
      is_privilege,
      privileges
    }

    const getIframe = src => {
      const iframe =
        '<iframe style="height: 100%;width: 100%;border:0px;" class="multi-download"  src="' +
        src +
        '"></iframe>'
      return iframe
    }
    const getVersionItem = (value, key) => {
      const { file_name, creator, create_time, file_size } = value
      return (
        <div
          className={indexStyles.versionInfoListItem}
          onClick={this.versionItemClick.bind(this, { value, key })}
        >
          {/*<div className={filePreviewCurrentVersionKey === key ?indexStyles.point : indexStyles.point2}></div>*/}
          <div className={indexStyles.name}>{creator}</div>
          <div className={indexStyles.info}>上传于{create_time}</div>
          <div className={indexStyles.size}>{file_size}</div>
        </div>
      )
    }
    const punctuateDom = (
      <div
        style={{
          minWidth: componentWidth + 'px',
          minHeight: componentHeight + 'px',
          overflow: 'auto',
          textAlign: 'center',
          paddingTop: '10px',
          position: 'relative'
        }}
      >
        {/* {
          checkIsHasPermissionInVisitControl('edit', privileges, is_privilege, [], checkIsHasPermissionInBoard(PROJECT_FILES_FILE_EDIT)) ? ('') : (
            <div onClick={this.alarmNoEditPermission} className={globalStyles.drawContent_mask}></div>
          )
        } */}
        {filePreviewUrl && (
          <ZoomPicture
            imgInfo={{ url: filePreviewUrl }}
            componentInfo={{
              width: componentWidth + 'px',
              height: componentHeight + 'px'
            }}
            commentList={
              rects && rects.length
                ? rects.map(i =>
                    Object.assign(
                      {},
                      {
                        flag: i.flag,
                        id: i.file_id,
                        coordinates: JSON.parse(i.coordinates)
                      }
                    )
                  )
                : []
            }
            handleClickedCommentItem={this.handleClickedCommentItem.bind(this)}
            currentSelectedCommentItemDetail={filePreviewPointNumCommits}
            handleDeleteCommentItem={this.handleDeleteCommentItem}
            userId={this.getCurrentUserId()}
            handleGetNewComment={this.handleGetNewComment}
            handleFullScreen={this.handleZoomPictureFullScreen}
            filePreviewCurrentFileId={filePreviewCurrentFileId}
            filePreviewCurrentId={filePreviewCurrentId}
            projectFileType={'projectFileType'}
            zoomPictureParams={zoomPictureParams}
            isShow_textArea={false}
            dispatch={dispatch}
          />
        )}
      </div>
    )
    const punctuateDom_old = (
      <div
        style={{ height: '100%', width: '100%' }}
        className={`${indexStyles.fileDetailContentLeft} ${indexStyles.noselect}`}
      >
        <div
          style={{
            margin: '0 auto',
            marginTop: (fileDetailContentOutHeight - imgHeight) / 2,
            width: imgWidth,
            height: imgHeight,
            overflow: 'hide'
          }}
          ref={'operateArea'}
        >
          <img
            src={filePreviewUrl}
            onLoad={this.previewImgLoad.bind(this)}
            style={{ maxWidth: maxImageWidth }}
          />
          {imgLoaded && editMode ? (
            <div
              tabIndex="0"
              hideFocus="true"
              id={'punctuateArea'}
              onClick={this.operateAreaClick.bind(this)}
              onBlur={this.operateAreaBlur.bind(this)}
              onMouseDown={this.onmousedown.bind(this)}
              style={{
                height: imgHeight,
                top: -imgHeight,
                left: 0,
                width: imgWidth,
                position: 'relative',
                zIndex: 3,
                outline: 0
              }}
            >
              {rects.map((value, key) => {
                const { flag, coordinates } = value
                const { x, y, width, height } = JSON.parse(coordinates)
                return (
                  <div
                    onClick={this.commitReactArea.bind(this, {
                      currentRect: JSON.parse(coordinates),
                      point_number: flag
                    })}
                    onMouseDown={this.commitReactArea2.bind(this)}
                    key={key}
                    style={{
                      position: 'absolute',
                      left: x,
                      top: y,
                      width: width,
                      height: height,
                      border: '1px solid rgba(24,144,255,.5)',
                      backgroundColor: 'rgba(24,144,255,.2)'
                    }}
                  >
                    <div className={indexStyles.flag}>{flag}</div>
                  </div>
                )
              })}
              {isInEdditOperate ? (
                <div
                  onClick={this.commitReactArea2.bind(this)}
                  onMouseDown={this.commitReactArea2.bind(this)}
                  style={{
                    position: 'absolute',
                    left: currentRect.x,
                    top: currentRect.y,
                    width: currentRect.width,
                    height: currentRect.height,
                    border: '1px solid rgba(24,144,255,.5)',
                    backgroundColor: 'rgba(24,144,255,.2)'
                  }}
                />
              ) : (
                ''
              )}

              {isInAdding ? (
                <div
                  style={{
                    position: 'absolute',
                    left: currentRect.x,
                    top: currentRect.y + currentRect.height + 10
                  }}
                >
                  <Comment
                    currentRect={currentRect}
                    setMentionFocus={this.setMentionFocus.bind(this)}
                  ></Comment>
                </div>
              ) : (
                ''
              )}
            </div>
          ) : (
            ''
          )}
        </div>
        {
          <div
            className={indexStyles.pictureEditState}
            style={{ left: (clientWidth - (isExpandFrame ? 0 : 420)) / 2 }}
            onClick={this.setEditMode.bind(this)}
          >
            {!editMode ? '添加圈点评论' : '退出圈点模式'}
          </div>
        }
      </div>
    )
    const iframeDom = (
      <div
        className={indexStyles.fileDetailContentLeft}
        dangerouslySetInnerHTML={{ __html: getIframe(filePreviewUrl) }}
      ></div>
    )
    const notSupport = type => {
      let content
      switch (type) {
        case '.obj':
          content = (
            <div style={{ textAlign: 'center' }}>
              <i
                className={globalStyles.authTheme}
                style={{ fontSize: '80px', color: '#5CA8F8' }}
              >
                &#xe62f;
              </i>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <i
                  className={globalStyles.authTheme}
                  style={{ fontSize: '58px' }}
                >
                  &#xe62f;
                </i>
                <i
                  className={globalStyles.authTheme}
                  style={{ fontSize: '58px' }}
                >
                  &#xe61e;
                </i>
                <i
                  className={globalStyles.authTheme}
                  style={{ fontSize: '58px' }}
                >
                  &#xe6cf;
                </i>
              </div>
              <i style={{ color: 'gray', fontSize: '12px' }}>
                把文件转换为pdf格式即可在聆悉上圈点协作
              </i>
            </div>
          )
          break
        case '.3dm':
          content = (
            <div style={{ textAlign: 'center' }}>
              <i
                className={globalStyles.authTheme}
                style={{ fontSize: '80px', color: '#5CA8F8' }}
              >
                &#xe626;
              </i>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <i
                  className={globalStyles.authTheme}
                  style={{ fontSize: '58px' }}
                >
                  &#xe626;
                </i>
                <i
                  className={globalStyles.authTheme}
                  style={{ fontSize: '58px' }}
                >
                  &#xe61e;
                </i>
                <i
                  className={globalStyles.authTheme}
                  style={{ fontSize: '58px' }}
                >
                  &#xe6cf;
                </i>
              </div>
              <i style={{ color: 'gray', fontSize: '12px' }}>
                把文件转换为pdf格式即可在聆悉上圈点协作
              </i>
            </div>
          )
          break
        case '.iges':
          content = (
            <div style={{ textAlign: 'center' }}>
              <i
                className={globalStyles.authTheme}
                style={{ fontSize: '80px', color: '#5CA8F8' }}
              >
                &#xe62b;
              </i>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <i
                  className={globalStyles.authTheme}
                  style={{ fontSize: '58px' }}
                >
                  &#xe62b;
                </i>
                <i
                  className={globalStyles.authTheme}
                  style={{ fontSize: '58px' }}
                >
                  &#xe61e;
                </i>
                <i
                  className={globalStyles.authTheme}
                  style={{ fontSize: '58px' }}
                >
                  &#xe6cf;
                </i>
              </div>
              <i style={{ color: 'gray', fontSize: '12px' }}>
                把文件转换为pdf格式即可在聆悉上圈点协作
              </i>
            </div>
          )
          break
        case '.ma':
          content = (
            <div style={{ textAlign: 'center' }}>
              <i
                className={globalStyles.authTheme}
                style={{ fontSize: '80px', color: '#5CA8F8' }}
              >
                &#xe630;
              </i>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <i
                  className={globalStyles.authTheme}
                  style={{ fontSize: '58px' }}
                >
                  &#xe630;
                </i>
                <i
                  className={globalStyles.authTheme}
                  style={{ fontSize: '58px' }}
                >
                  &#xe61e;
                </i>
                <i
                  className={globalStyles.authTheme}
                  style={{ fontSize: '58px' }}
                >
                  &#xe6cf;
                </i>
              </div>
              <i style={{ color: 'gray', fontSize: '12px' }}>
                把文件转换为pdf格式即可在聆悉上圈点协作
              </i>
            </div>
          )
          break
        case '.mb':
          content = (
            <div style={{ textAlign: 'center' }}>
              <i
                className={globalStyles.authTheme}
                style={{ fontSize: '80px', color: '#5CA8F8' }}
              >
                &#xe628;
              </i>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <i
                  className={globalStyles.authTheme}
                  style={{ fontSize: '58px' }}
                >
                  &#xe628;
                </i>
                <i
                  className={globalStyles.authTheme}
                  style={{ fontSize: '58px' }}
                >
                  &#xe61e;
                </i>
                <i
                  className={globalStyles.authTheme}
                  style={{ fontSize: '58px' }}
                >
                  &#xe6cf;
                </i>
              </div>
              <i style={{ color: 'gray', fontSize: '12px' }}>
                把文件转换为pdf格式即可在聆悉上圈点协作
              </i>
            </div>
          )
          break
        case '.skp':
          content = (
            <div style={{ textAlign: 'center' }}>
              <i
                className={globalStyles.authTheme}
                style={{ fontSize: '80px', color: '#5CA8F8' }}
              >
                &#xe62e;
              </i>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <i
                  className={globalStyles.authTheme}
                  style={{ fontSize: '58px' }}
                >
                  &#xe62e;
                </i>
                <i
                  className={globalStyles.authTheme}
                  style={{ fontSize: '58px' }}
                >
                  &#xe61e;
                </i>
                <i
                  className={globalStyles.authTheme}
                  style={{ fontSize: '58px' }}
                >
                  &#xe6cf;
                </i>
              </div>
              <i style={{ color: 'gray', fontSize: '12px' }}>
                把文件转换为pdf格式即可在聆悉上圈点协作
              </i>
            </div>
          )
          break
        case '.dwg':
          content = (
            <div style={{ textAlign: 'center' }}>
              <i
                className={globalStyles.authTheme}
                style={{ fontSize: '80px', color: '#5CA8F8' }}
              >
                &#xe62a;
              </i>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <i
                  className={globalStyles.authTheme}
                  style={{ fontSize: '58px' }}
                >
                  &#xe62a;
                </i>
                <i
                  className={globalStyles.authTheme}
                  style={{ fontSize: '58px' }}
                >
                  &#xe61e;
                </i>
                <i
                  className={globalStyles.authTheme}
                  style={{ fontSize: '58px' }}
                >
                  &#xe6cf;
                </i>
              </div>
              <i style={{ color: 'gray', fontSize: '12px' }}>
                把文件转换为pdf格式即可在聆悉上圈点协作
              </i>
            </div>
          )
          break
        case '.psd':
          content = (
            <div style={{ textAlign: 'center' }}>
              <i
                className={globalStyles.authTheme}
                style={{ fontSize: '80px', color: '#5CA8F8' }}
              >
                &#xe627;
              </i>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <i
                  className={globalStyles.authTheme}
                  style={{ fontSize: '58px' }}
                >
                  &#xe627;
                </i>
                <i
                  className={globalStyles.authTheme}
                  style={{ fontSize: '58px' }}
                >
                  &#xe61e;
                </i>
                <i
                  className={globalStyles.authTheme}
                  style={{ fontSize: '58px' }}
                >
                  &#xe6cf;
                </i>
              </div>
              <i style={{ color: 'gray', fontSize: '12px' }}>
                把文件转换为pdf格式即可在聆悉上圈点协作
              </i>
            </div>
          )
          break
        default:
          break
      }
      return content
    }

    //header
    const uploadProps = {
      name: 'file',
      withCredentials: true,
      action: `${REQUEST_DOMAIN_FILE}/file/version_upload`,
      data: {
        board_id,
        folder_id: currentParrentDirectoryId,
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
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        if (e.size == 0) {
          message.error(`不能上传空文件`)
          return false
        } else if (e.size > UPLOAD_FILE_SIZE * 1024 * 1024) {
          message.error(`上传文件不能文件超过${UPLOAD_FILE_SIZE}MB`)
          return false
        }
        let loading = message.loading('正在上传...', 0)
      },
      onChange({ file, fileList, event }) {
        if (file.status === 'uploading') {
        } else {
          message.destroy()
        }
        if (file.status === 'done' && file.response.code === '0') {
          message.success(`上传成功。`)
          // console.log('file', file)
          if (file.response && file.response.code == '0') {
            dispatch({
              type: 'projectDetailFile/updateDatas',
              payload: {
                filePreviewCurrentFileId: file.response.data.id,
                filePreviewCurrentId: file.response.data.file_resource_id
              }
            })
            dispatch({
              type: 'projectDetailFile/fileVersionist',
              payload: {
                version_id: filePreviewCurrentVersionId,
                isNeedPreviewFile: true,
                isPDF: getSubfixName(file.name) == '.pdf'
              }
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
    const operationMenu = data => {
      return (
        <Menu onClick={this.operationMenuClick.bind(this, data)}>
          {/*<Menu.Item key="1">收藏</Menu.Item>*/}
          {checkIsHasPermissionInVisitControl(
            'edit',
            privileges,
            is_privilege,
            [],
            checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DOWNLOAD, board_id)
          ) && <Menu.Item key="2">下载</Menu.Item>}
          {checkIsHasPermissionInVisitControl(
            'edit',
            privileges,
            is_privilege,
            [],
            checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPLOAD, board_id)
          ) && <Menu.Item key="3">移动</Menu.Item>}
          {checkIsHasPermissionInVisitControl(
            'edit',
            privileges,
            is_privilege,
            [],
            checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPLOAD, board_id)
          ) && <Menu.Item key="4">复制</Menu.Item>}
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

    // 定义一个版本列表的数据,而不用model中的数据
    // let new_filePreviewVersionList = editVersionFileList && editVersionFileList.length ? editVersionFileList : filePreviewCurrentVersionList

    const params = {
      board_id,
      filePreviewCurrentFileId,
      filePreviewUrl,
      filePreviewIsUsable,
      filePreviewCurrentId,
      new_filePreviewCurrentVersionList,
      is_edit_version_description,
      editValue
    }

    const visitControlParams = {
      privileges,
      is_privilege
    }

    return (
      <div>
        <div className={indexStyles.fileDetailHead}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div className={indexStyles.fileIcon}>
              <span
                className={`${globalStyles.authTheme} ${indexStyles.fileTitle}`}
              >
                &#xe691;
              </span>
              文件
            </div>
            {/* <div className={indexStyles.fileDetailHeadLeft}>
              {seeFileInput === 'fileModule' ? (
                <FileDerailBreadCrumbFileNav />
              ) : ('')}
            </div> */}
          </div>

          <div className={indexStyles.fileDetailHeadRight}>
            <div style={{ position: 'relative' }}>
              {/* {
                checkIsHasPermissionInVisitControl('edit', privileges, is_privilege, [], checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPDATE, board_id)) ? ('') : (
                  <div onClick={this.alarmNoEditPermission} className={globalStyles.drawContent_mask}></div>
                )
              } */}
              {seeFileInput === 'fileModule' && (
                <VersionSwitching
                  {...params}
                  is_show={false}
                  handleVersionItem={this.handleVersionItem}
                  getVersionItemMenuClick={this.getVersionItemMenuClick}
                  handleFileVersionDecription={this.handleFileVersionDecription}
                  handleFileVersionValue={this.handleFileVersionValue}
                  uploadProps={uploadProps}
                />
              )}
            </div>

            {/* <div style={{ position: 'relative' }}>
              {
                checkIsHasPermissionInVisitControl('edit', privileges, is_privilege, [], checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DOWNLOAD, board_id)) ? ('') : (
                  <div onClick={this.alarmNoEditPermission} className={globalStyles.drawContent_mask}></div>
                )
              }
              <Button style={{ height: 24, marginLeft: 14 }} onClick={this.fileDownload.bind(this, { filePreviewCurrentId, filePreviewCurrentFileId, pdfDownLoadSrc })}>
                <Icon type="download" />下载
              </Button>
            </div> */}
            <span style={{ marginLeft: '10px' }}></span>
            {/* <div style={{position: 'relative', display: 'flex'}}> */}
            {/* {
                checkIsHasPermissionInVisitControl('edit', privileges, is_privilege, [], checkIsHasPermissionInBoard(PROJECT_FILES_FILE_EDIT, board_id)) ? ('') : (
                  <div style={{height: '50px'}} onClick={this.alarmNoEditPermission} className={globalStyles.drawContent_mask}></div>
                )
              } */}

            {/* <div style={{ position: 'relative' }}>
              <span>
                {
                  checkIsHasPermissionInVisitControl('edit', privileges, is_privilege, [], checkIsHasPermissionInBoard(PROJECT_FILES_FILE_EDIT, board_id)) ? ('') : (
                    <div style={{ height: '50px' }} onClick={this.alarmNoEditPermission} className={globalStyles.drawContent_mask}></div>
                  )
                }
                <InformRemind rela_id={filePreviewCurrentVersionId} rela_type={'4'} user_remind_info={data} />
              </span>

            </div> */}
            {/* <div style={{position:'relative'}}> */}
            {/* <span style={{ marginRight: is_privilege === '1' ? '36px' : '10px' }}>
              <VisitControl
                board_id={board_id}
                isPropVisitControl={is_privilege === '0' ? false : true}
                handleVisitControlChange={this.handleVisitControlChange}
                otherPrivilege={privileges}
                notShowPrincipal={true}
                invitationType='9'
                invitationId={filePreviewCurrentFileId}
                invitationOrg={localStorage.getItem('OrganizationId')}
                handleClickedOtherPersonListOperatorItem={this.handleClickedOtherPersonListOperatorItem}
                handleAddNewMember={this.handleVisitControlAddNewMember}
              />
            </span> */}
            {/* </div> */}
            {/* </div> */}

            {/* <div style={{ cursor: 'pointer' }}>
              {seeFileInput === 'fileModule' ? (
                <Dropdown overlay={operationMenu({ file_resource_id: filePreviewCurrentId, file_id: filePreviewCurrentFileId, type: '2' })}>
                  <Icon type="ellipsis" style={{ fontSize: 20, marginLeft: 14 }} />
                </Dropdown>
              ) : ('')}
              <Icon type={!isExpandFrame ? 'fullscreen' : 'fullscreen-exit'} style={{ fontSize: 20, marginLeft: 14 }} theme="outlined" onClick={this.zoomFrame.bind(this)} />
              <Tooltip title={'关闭预览'} placement={'left'}>
                <Icon type="close" onClick={this.closeFile.bind(this)} style={{ fontSize: 20, marginLeft: 16 }} />
              </Tooltip>
            </div> */}
          </div>
        </div>
        {/*文件详情*/}
        <div
          className={indexStyles.fileDetailContentOut}
          ref={'fileDetailContentOut'}
          style={{ height: clientHeight - offsetTopDeviation - 60 }}
        >
          {filePreviewIsUsable ? (
            filePreviewIsRealImage ? (
              punctuateDom
            ) : (
              iframeDom
            )
          ) : (
            <div
              className={indexStyles.fileDetailContentLeft}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: 16,
                color: '#595959'
              }}
            >
              <div>{notSupport(fileType)}</div>
            </div>
          )}

          {/*width: isExpandFrame?0:420*/}

          <div
            className={indexStyles.fileDetailContentRight}
            style={{ minWidth: isExpandFrame ? 0 : 420, height: '100vh' }}
          >
            <div
              style={{ position: 'relative' }}
              className={indexStyles.fileDetailContentRight_top}
              ref={'versionInfoArea'}
            >
              {/* {
                checkIsHasPermissionInVisitControl('edit', privileges, is_privilege, [], checkIsHasPermissionInBoard(PROJECT_FILES_FILE_EDIT, board_id)) ? ('') : (
                  <div style={{ bottom: '62px' }} onClick={this.alarmNoEditPermission} className={globalStyles.drawContent_mask}></div>
                )
              } */}

              <div>
                <div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    zIndex: 100,
                    height: '100%'
                  }}
                ></div>
                {filePreviewCurrentFileId ? (
                  <ContentRaletion
                    relations_Prefix={relations_Prefix}
                    board_id={board_id}
                    link_id={filePreviewCurrentFileId}
                    link_local={'4'}
                    visitControlParams={visitControlParams}
                    is_showAdd={false}
                  />
                ) : (
                  ''
                )}
              </div>

              {/*{seeFileInput === 'fileModule'? (*/}
              {/*<div className={indexStyles.versionOut}>*/}
              {/* <div>版本信息</div> */}
              {/*<div className={indexStyles.versionInfoList}>*/}
              {/*{filePreviewCurrentVersionList.map((value, key ) => {*/}
              {/*return (<div key={key}>{getVersionItem(value, key )}</div>)*/}
              {/*})}*/}
              {/*</div>*/}
              {/*</div>*/}
              {/*) : ('')}*/}
            </div>

            {checkIsHasPermissionInBoard(PROJECT_FILES_COMMENT_VIEW) && (
              <div
                className={indexStyles.fileDetailContentRight_middle}
                style={{
                  height:
                    clientHeight -
                    offsetTopDeviation -
                    60 -
                    70 -
                    (this.refs.versionInfoArea
                      ? this.refs.versionInfoArea.clientHeight
                      : 0)
                }}
              >
                <CommentListItem2
                  commitClicShowEdit={this.commitClicShowEdit.bind(this)}
                  deleteCommitSet={this.deleteCommitSet.bind(this)}
                />
              </div>
            )}

            {/* {(checkIsHasPermissionInVisitControl('edit', privileges, is_privilege, [], checkIsHasPermissionInBoard(PROJECT_FILES_COMMENT_PUBLISH)) || checkIsHasPermissionInVisitControl('comment', privileges, is_privilege, checkIsHasPermissionInBoard(PROJECT_FILES_COMMENT_PUBLISH))) && (
              <div className={indexStyles.fileDetailContentRight_bott}>
                <Comment2 currentRect={currentRect}></Comment2>
              </div>
            )} */}
          </div>
        </div>
        {isZoomPictureFullScreenMode && (
          <Modal
            zIndex={9999999999}
            style={{ top: 0, left: 0, height: bodyClientHeight - 200 + 'px' }}
            footer={null}
            title={null}
            width={bodyClientWidth}
            visible={isZoomPictureFullScreenMode}
            onCancel={() =>
              this.setState({ isZoomPictureFullScreenMode: false })
            }
          >
            <div>
              {filePreviewUrl && (
                <ZoomPicture
                  imgInfo={{ url: filePreviewUrl }}
                  componentInfo={{
                    width: bodyClientWidth - 100,
                    height: bodyClientHeight - 60
                  }}
                  commentList={
                    rects && rects.length
                      ? rects.map(i =>
                          Object.assign(
                            {},
                            {
                              flag: i.flag,
                              id: i.file_id,
                              coordinates: JSON.parse(i.coordinates)
                            }
                          )
                        )
                      : []
                  }
                  handleClickedCommentItem={this.handleClickedCommentItem.bind(
                    this
                  )}
                  currentSelectedCommentItemDetail={filePreviewPointNumCommits}
                  handleDeleteCommentItem={this.handleDeleteCommentItem}
                  userId={this.getCurrentUserId()}
                  handleGetNewComment={this.handleGetNewComment}
                  isFullScreenMode={isZoomPictureFullScreenMode}
                  handleFullScreen={this.handleZoomPictureFullScreen}
                  filePreviewCurrentFileId={filePreviewCurrentFileId}
                  filePreviewCurrentId={filePreviewCurrentId}
                  projectFileType={'projectFileType'}
                  zoomPictureParams={zoomPictureParams}
                  isShow_textArea={false}
                  dispatch={dispatch}
                />
              )}
            </div>
          </Modal>
        )}
      </div>
    )
  }
}

export default withBodyClientDimens(FileDetailContent)

function mapStateToProps({
  projectDetailFile: {
    datas: {
      filePreviewCommitPoints = [],
      filePreviewCurrentVersionList = [],
      filePreviewCurrentFileId,
      breadcrumbList,
      isExpandFrame,
      pdfDownLoadSrc,
      currentPreviewFileBaseInfo = {},
      filePreviewPointNumCommits,
      fileType,
      currentParrentDirectoryId,
      filePreviewCurrentVersionId,
      seeFileInput,
      filePreviewUrl,
      filePreviewIsUsable,
      filePreviewCurrentId,
      filePreviewIsRealImage = false
    }
  },
  projectDetail: {
    datas: { projectDetailInfoData = {}, board_id, relations_Prefix }
  },
  technological: {
    datas: { userOrgPermissions, userBoardPermissions }
  }
}) {
  return {
    filePreviewCommitPoints,
    filePreviewCurrentVersionList,
    filePreviewCurrentFileId,
    breadcrumbList,
    isExpandFrame,
    pdfDownLoadSrc,
    currentPreviewFileBaseInfo,
    filePreviewPointNumCommits,
    fileType,
    currentParrentDirectoryId,
    filePreviewCurrentVersionId,
    seeFileInput,
    filePreviewUrl,
    filePreviewIsUsable,
    filePreviewCurrentId,
    filePreviewIsRealImage,
    projectDetailInfoData,
    // board_id,
    relations_Prefix,
    userOrgPermissions,
    userBoardPermissions
  }
}
