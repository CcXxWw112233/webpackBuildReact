import React from 'react'
import indexStyles from './index.less'
import styles from './index.css'
import {
  Card,
  Icon,
  DatePicker,
  Dropdown,
  Button,
  Upload,
  message,
  Tooltip
  // Avatar
} from 'antd'
// import MenuSearchMultiple from '../ProcessStartConfirm/MenuSearchMultiple'
import globalStyles from '../../../../../../globalset/css/globalClassName.less'
import {
  timestampToTimeNormal,
  timeToTimestamp
} from '../../../../../../utils/util'
import {
  deleteProcessFile
  // getProcessList
} from '../../../../../../services/technological/process'
import Cookies from 'js-cookie'
import OpinionModal from './OpinionModal'
import {
  PROJECT_FILES_FILE_EDIT,
  REQUEST_DOMAIN_FLOWS
  // UPLOAD_FILE_SIZE
} from '../../../../../../globalset/js/constant'
import PreviewFileModal from '../../TaskItemComponent/PreviewFileModal'
// import { filePreview } from '../../../../../../services/technological/file'
import {
  checkIsHasPermissionInBoard,
  getSubfixName,
  openPDF
} from '../../../../../../utils/businessFunction'
import ContentRaletion from '../../../../../../components/ContentRaletion'
// import {
//   getRelations,
//   JoinRelation
// } from '../../../../../../services/technological/task'
// import { isApiResponseOk } from '../../../../../../utils/handleResponseData'
import AvatarComps from '../../../../../../components/avatarMore'
import { setUploadHeaderBaseInfo } from '../../../../../../utils/businessFunction'
import MenuSearchPartner from '../../../../../../components/MenuSearchMultiple/MenuSearchPartner.js'
import { connect } from 'dva/index'
const { RangePicker } = DatePicker
const Dragger = Upload.Dragger

//里程碑确认信息
@connect(mapStateToProps)
export default class DetailConfirmInfoTwo extends React.Component {
  state = {
    opinionModalVisible: false,
    due_time: '',
    isShowBottDetail: false, //是否显示底部详情
    fileList: [],
    previewFileModalVisibile: false, //预览
    filePreviewIsUsable: true,
    filePreviewUrl: '',
    current_file_resource_id: ''
  }
  componentWillMount(nextProps) {
    const { itemKey } = this.props
    //设置底部可伸缩部分id
    this.setState({
      ConfirmInfoOut_1_bott_Id: `ConfirmInfoOut_1_bott_Id__${itemKey * 100 + 1}`
    })
    this.propsChangeSetIsShowBottDetail(this.props)
    // console.log('fileList', 2, this.props)

    this.initSetFileList(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.propsChangeSetIsShowBottDetail(nextProps)
    // console.log('fileList', 3, nextProps)

    // this.initSetFileList(nextProps)
  }
  //初始化设置fileList
  initSetFileList(props) {
    const { itemKey } = props
    const {
      datas: { processEditDatas }
    } = this.props.model
    const fileDataList = processEditDatas[itemKey].data || [] //已上传文件列表
    // console.log('fileList', 1, fileDataList)
    let fileList = []
    for (let i = 0; i < fileDataList.length; i++) {
      if (fileDataList[i]) {
        fileList.push(fileDataList[i])
        fileList[fileList.length - 1]['name'] =
          fileDataList[i].file_name ||
          (fileDataList[i].response && fileDataList[i].response.data
            ? fileDataList[i].response.data.file_name
            : '')
        fileList[fileList.length - 1]['uid'] =
          fileDataList[i].id ||
          (fileDataList[i].response && fileDataList[i].response.data
            ? fileDataList[i].response.data.id
            : '')
      } else {
      }
    }
    for (let i = 0; i < fileList.length; i++) {
      if (!fileList[i]['status']) {
        fileList[i]['status'] = 'done'
      }
    }
    this.setState({
      fileList: fileList
    })
  }

  //isShowBottDetail是否在当前步骤
  propsChangeSetIsShowBottDetail(props) {
    const {
      datas: { processEditDatas, processInfo = {} }
    } = props.model
    const { itemKey } = props //所属列表位置
    const { curr_node_sort } = processInfo //当前节点
    const { sort } = processEditDatas[itemKey]
    if (curr_node_sort == sort) {
      this.setState({
        isShowBottDetail: true
      })
    } else {
      this.setState({
        isShowBottDetail: false
      })
    }
  }
  //截止日期
  datePikerOnOpenChange(bool) {
    //关闭后
    if (!bool) {
      const { due_time } = this.state
      if (!due_time) {
        return
      }
      const {
        datas: {
          processEditDatas = [],
          projectDetailInfoData = [],
          currentProcessInstanceId
        }
      } = this.props.model
      const { itemKey, dispatch } = this.props
      const { id } = processEditDatas[itemKey]
      processEditDatas[itemKey]['deadline_value'] = timeToTimestamp(due_time)
      //业务逻辑修改deadline_value作废
      processEditDatas[itemKey]['deadline'] = timeToTimestamp(due_time)
      this.props.updateDatasProcess({
        processEditDatas
      })
      dispatch({
        type: 'projectDetailProcess/setDueTimeInFlowsNode',
        payload: {
          deadline: timeToTimestamp(due_time),
          flow_node_instance_id: id,
          flow_instance_id: currentProcessInstanceId
        }
      })
    }
  }
  datePickerChange(date, dateString) {
    if (!dateString) {
      return
    }
    this.setState({
      due_time: dateString
    })
  }
  setAssignees(data) {
    //替换掉当前操作人
    const {
      datas: {
        processEditDatas = [],
        projectDetailInfoData = [],
        processInfo = {}
      }
    } = this.props.model
    const { itemKey } = this.props
    const { assignees = [] } = processEditDatas[itemKey]
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    const currentUserId = userInfo.id //当前用户id, 用于替换
    const users = projectDetailInfoData.data //项目参与人
    //将当前用户替换成所选用户
    let willSetAssignee = ''
    for (let i = 0; i < assignees.length; i++) {
      if (assignees[i].user_id === currentUserId) {
        // assignees[i] = data.[0]
        // willSetAssignee = data.[0]
        assignees[i] = data.selectedKeys[0]
        willSetAssignee = data.selectedKeys[0]
        break
      }
    }

    processEditDatas[itemKey]['assignees'] = assignees
    this.props.updateDatasProcess({
      processEditDatas
    })
    //重新指派推进人接口
    this.props.resetAsignees({
      assignee: willSetAssignee,
      flow_node_instance_id: processEditDatas[itemKey].id,
      instance_id: processInfo.id
    })
  }
  setIsShowBottDetail() {
    this.setState(
      {
        isShowBottDetail: !this.state.isShowBottDetail
      },
      function() {
        this.funTransitionHeight(element, 500, this.state.isShowBottDetail)
      }
    )
    const { ConfirmInfoOut_1_bott_Id } = this.state
    const element = document.getElementById(ConfirmInfoOut_1_bott_Id)
  }
  funTransitionHeight = function(element, time, type) {
    // time, 数值，可缺省
    if (typeof window.getComputedStyle === 'undefined') return
    const height = window.getComputedStyle(element).height
    element.style.transition = 'none' // 本行2015-05-20新增，mac Safari下，貌似auto也会触发transition, 故要none下~
    element.style.height = 'auto'
    const targetHeight = window.getComputedStyle(element).height
    element.style.height = height
    element.offsetWidth
    if (time) element.style.transition = 'height ' + time + 'ms'
    element.style.height = type ? targetHeight : 0
  }
  setOpinionModalVisible(operateType) {
    this.setState({
      operateType, //1完成 0 撤回
      opinionModalVisible: !this.state.opinionModalVisible
    })
  }

  //文件名类型
  judgeFileType(fileName) {
    let themeCode = ''
    const type = fileName.substr(fileName.lastIndexOf('.')).toLowerCase()
    switch (type) {
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
      case 'txt':
        themeCode = '&#xe6cd;'
        break
      case '.doc':
        themeCode = '&#xe6cc;'
        break
      case '.jpg':
        themeCode = '&#xe6cb;'
        break
      default:
        themeCode = ''
        break
    }
    return themeCode
  }

  //预览
  setPreviewFileModalVisibile() {
    this.setState({
      previewFileModalVisibile: !this.state.previewFileModalVisibile
    })
  }
  setPreview(data) {
    this.setState({
      ...data
    })
  }
  onPreview(e) {
    const file_name = e.name || e.file_name
    const file_id = e.file_id || e.response.data.file_id || e.response.data.id
    const file_resource_id =
      e.file_resource_id || e.response.data.file_resource_id

    if (
      getSubfixName(file_name) == '.pdf' &&
      checkIsHasPermissionInBoard(PROJECT_FILES_FILE_EDIT)
    ) {
      openPDF({ id: file_id })
      return false
    }
    this.props.updateDatasFile({
      seeFileInput: 'taskModule',
      isInOpenFile: true,
      filePreviewCurrentId: file_resource_id,
      filePreviewCurrentFileId: file_id
    })

    this.props.dispatch({
      type: 'projectDetailFile/updateDatas',
      payload: {
        seeFileInput: 'taskModule',
        isInOpenFile: true,
        filePreviewCurrentId: file_resource_id,
        filePreviewCurrentFileId: file_id
      }
    })
    // this.props.filePreview({ id: file_resource_id, file_id: file_id })
    this.props.dispatch({
      type: 'projectDetailFile/filePreview',
      payload: {
        id: file_resource_id,
        file_id: file_id
      }
    })
    this.props.dispatch({
      type: 'projectDetailFile/fileInfoByUrl',
      payload: {
        file_id
      }
    })
  }

  render() {
    const that = this
    const { due_time, isShowBottDetail, fileList, relations = [] } = this.state
    // console.log('fileList', fileList)
    const { ConfirmInfoOut_1_bott_Id } = this.state

    const {
      datas: {
        processEditDatas,
        projectDetailInfoData = [],
        processInfo = {},
        isInOpenFile,
        relations_Prefix
      }
    } = this.props.model
    const { itemKey, itemValue, dispatch } = this.props //所属列表位置
    const { board_id } = projectDetailInfoData

    const { curr_node_sort, status, curr_node_id } = processInfo //当前节点
    const {
      id,
      name,
      description,
      assignees = [],
      assignee_type,
      deadline_type,
      deadline,
      deadline_value,
      is_workday,
      sort,
      enable_opinion,
      enable_revocation,
      require_data = {}
    } = processEditDatas[itemKey]
    const { limit_file_num, limit_file_type, limit_file_size } = require_data
    const fileDataList = processEditDatas[itemKey].data || [] //已上传文件列表
    const fileTypeArray = limit_file_type.split(',') //文档类型
    let fileTypeArrayText = [] //文档类型转化中文
    for (let i = 0; i < fileTypeArray.length; i++) {
      if (fileTypeArray[i] === '1') {
        fileTypeArrayText.push('文档')
      } else if (fileTypeArray[i] === '2') {
        fileTypeArrayText.push('图像')
      } else if (fileTypeArray[i] === '3') {
        fileTypeArrayText.push('音频')
      } else if (fileTypeArray[i] === '4') {
        fileTypeArrayText.push('视频')
      }
    }
    const invitationId = processInfo.id
    //推进人来源
    const users = projectDetailInfoData.data

    //推进人
    const assigneesArray = assignees || []
    //判断当前用户是否有操作权限--从推进人列表里面获得id，和当前操作人的id
    let currentUserCanOperate = false //操作
    let currentUserCanReback = true //用户是否有撤回权限，属于操作权限的子范畴
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    const currentUserId = userInfo.id //当前用户id, 用于替换
    //任何人的情况下,需要匹配在不在项目内，否则需要确认是否是指定的推进人
    let compare_user_arr = []
    if (assignee_type == '1') {
      compare_user_arr = users
      if (Array.isArray(assignees)) {
        currentUserCanReback =
          assignees.findIndex(item => item.user_id == currentUserId) != -1 //在任何人的情况下，谁完成谁才能撤回
      }
    } else {
      compare_user_arr = assignees
    }
    for (let val of compare_user_arr) {
      if (val['user_id'] == currentUserId) {
        currentUserCanOperate = true
        break
      }
    }

    const imgOrAvatar = img => {
      return img ? (
        <div>
          <img
            src={img}
            style={{
              width: 18,
              height: 18,
              marginRight: 8,
              borderRadius: 16,
              margin: '0 8px'
            }}
          />
        </div>
      ) : (
        <div
          style={{
            lineHeight: '18px',
            height: 18,
            width: 16,
            borderRadius: 18,
            backgroundColor: '#e8e8e8',
            marginRight: 8,
            textAlign: 'center',
            margin: '0 8px',
            marginTop: 2
          }}
        >
          <Icon type={'user'} style={{ fontSize: 10, color: '#8c8c8c' }} />
        </div>
      )
    }
    const filterAssignee = assignee_type => {
      let container = <div></div>
      switch (assignee_type) {
        case '1':
          container = <div style={{ color: '#595959' }}>任何人</div>
          break
        case '2':
          container = (
            <div style={{ display: 'flex' }}>
              {assigneesArray.map((value, key) => {
                const { avatar, name, mobile, email } = value
                if (key <= 1)
                  return (
                    <Tooltip
                      key={key}
                      placement="top"
                      title={name || mobile || email || '佚名'}
                    >
                      <div>{imgOrAvatar(avatar)}</div>
                    </Tooltip>
                  )
              })}
              {assigneesArray.length > 2 ? (
                <span style={{ color: '#595959' }}>
                  <AvatarComps datas={assigneesArray} />
                </span>
              ) : (
                ''
              )}
            </div>
          )
          break
        case '3':
          container = (
            <div style={{ display: 'flex' }}>
              {assigneesArray.map((value, key) => {
                const { avatar, name } = value
                if (key <= 1)
                  return (
                    <Tooltip key={key} placement="top" title={name || '佚名'}>
                      <div>{imgOrAvatar(avatar)}</div>
                    </Tooltip>
                  )
              })}
              {assigneesArray.length > 2 ? (
                <span style={{ color: '#595959' }}>
                  <AvatarComps datas={assigneesArray} />
                </span>
              ) : (
                ''
              )}
            </div>
          )
          break
        default:
          container = <div></div>
          break
      }
      return container
    }
    const filterDueTime = deadline_type => {
      let container = <div></div>
      switch (deadline_type) {
        case '1':
          container = <div style={{ color: '#595959' }}>无限期</div>
          break
        case '2':
          // container = (
          //   <div style={{color: '#595959'}}>
          //     {timestampToTimeNormal(deadline, '/', true)}
          //   </div>
          // )
          container = (
            <div
              style={{
                color:
                  Number(sort) >= Number(curr_node_sort)
                    ? '#1890FF'
                    : '#595959',
                position: 'relative'
              }}
            >
              {timestampToTimeNormal(deadline, '/', true) || '设置截止时间'}
              {Number(sort) >= Number(curr_node_sort) && currentUserCanOperate && (
                <DatePicker
                  onChange={this.datePickerChange.bind(this)}
                  onOpenChange={this.datePikerOnOpenChange.bind(this)}
                  placeholder={'选择截止时间'}
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  style={{
                    opacity: 0,
                    height: 16,
                    minWidth: 0,
                    maxWidth: '88px',
                    background: '#000000',
                    position: 'absolute',
                    right: 0,
                    zIndex: 2,
                    cursor: 'pointer'
                  }}
                />
              )}
            </div>
          )
          break
        case '3':
          container = (
            <div style={{ color: '#595959' }}>{`${
              is_workday === '0' ? '固定' : '工作日'
            }${deadline_value}天`}</div>
          )
          break
        default:
          container = <div></div>
          break
      }
      return container
    }
    const filterBorderStyle = sort => {
      if (Number(sort) < Number(curr_node_sort)) {
        return { border: '2px solid rgba(83,196,26,1)' }
      } else if (Number(sort) === Number(curr_node_sort)) {
        return { border: '2px solid rgba(24,144,255,1)' }
      } else if (Number(sort) > Number(curr_node_sort)) {
        return { border: '2px solid rgba(140,140,140,1)' }
      } else {
      }
    }
    const filterBottOperate = () => {
      let container = <div></div>
      if (currentUserCanOperate && status !== '3') {
        if (Number(sort) < Number(curr_node_sort)) {
          if (Number(curr_node_sort) - Number(sort) === 1) {
            //相邻才能有撤回
            container = (
              <div>
                {enable_revocation === '1' && currentUserCanReback ? (
                  <div
                    className={indexStyles.ConfirmInfoOut_1_bott_right_operate}
                  >
                    <Button
                      onClick={this.setOpinionModalVisible.bind(this, '0')}
                      style={{ color: 'red' }}
                    >
                      撤回
                    </Button>
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
            )
          }
        } else if (Number(sort) === Number(curr_node_sort)) {
          container = (
            <div
              style={{ marginRight: '120px' }}
              className={indexStyles.ConfirmInfoOut_1_bott_right_operate}
            >
              <Dropdown
                overlay={
                  // <MenuSearchMultiple
                  // noMutiple={true}
                  // usersArray={users}
                  // filterUserArray={assigneesArray}
                  // setAssignees={this.setAssignees.bind(this)} />
                  <MenuSearchPartner
                    invitationType="8"
                    invitationId={invitationId}
                    rela_Condition={curr_node_id}
                    listData={users}
                    keyCode={'user_id'}
                    searchName={'name'}
                    chirldrenTaskChargeChange={this.setAssignees.bind(this)}
                    board_id={board_id}
                  />
                }
              >
                {assignee_type !== '1' ? (
                  <div>重新指派推进人</div>
                ) : (
                  <div></div>
                )}
              </Dropdown>
              <Button
                type={'primary'}
                onClick={this.setOpinionModalVisible.bind(this, '1')}
              >
                完成
              </Button>
            </div>
          )
        } else if (Number(sort) > Number(curr_node_sort)) {
          container = (
            <div
              className={indexStyles.ConfirmInfoOut_1_bott_right_operate}
            ></div>
          )
        } else {
        }
      } else {
      }
      return container
    }

    const filterUploadContain = () => {
      let contianner = <div></div>
      if (currentUserCanOperate) {
        // console.log('sss', itemKey, 'all')
        if (Number(sort) < Number(curr_node_sort)) {
          // console.log('sss', itemKey, 2)
          contianner = (
            <div className={indexStyles.fileList}>
              {fileDataList.map((value, key) => {
                if (value) {
                  return (
                    <div
                      style={{
                        cursor: 'pointer',
                        lineHeight: '33px',
                        marginRight: 40
                      }}
                      key={key}
                      onClick={this.onPreview.bind(this, value)}
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
                        dangerouslySetInnerHTML={{
                          __html: this.judgeFileType(value.file_name)
                        }}
                      ></i>
                      {value.file_name}
                    </div>
                  )
                }
              })}
            </div>
          )
        } else if (Number(sort) === Number(curr_node_sort)) {
          // console.log('sss', itemKey, 3)
          contianner = (
            <div className={indexStyles.uploadAreaOut}>
              <Upload {...dragProps} style={{ width: '748px' }}>
                <div className={indexStyles.uploadArea}>
                  <div className={indexStyles.uploadArea_left}></div>
                  <div className={indexStyles.uploadArea_right}>
                    <div style={{ color: '#1890FF', fontSize: 16 }}>
                      拖拽文件到此开始上传
                    </div>
                    <div style={{ color: '#8c8c8c', fontSize: 12 }}>
                      20MB以内，
                      {Number(limit_file_num) === 0
                        ? '不限文件数量'
                        : `${limit_file_num}个文件以内`}
                      ，{fileTypeArrayText.join('，')}
                    </div>
                  </div>
                </div>
              </Upload>
            </div>
          )
        } else if (Number(sort) > Number(curr_node_sort)) {
          // console.log('sss', itemKey, 4)
          contianner = <div></div>
        } else {
          // console.log('sss', itemKey, 5)
        }
      } else {
        contianner = (
          <div className={indexStyles.fileList}>
            {fileDataList.map((value, key) => {
              if (value) {
                return (
                  <div
                    style={{
                      cursor: 'pointer',
                      lineHeight: '33px',
                      marginRight: 40
                    }}
                    key={key}
                    onClick={this.onPreview.bind(this, value)}
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
                      dangerouslySetInnerHTML={{
                        __html: this.judgeFileType(value.file_name)
                      }}
                    ></i>
                    {value.file_name}
                  </div>
                )
              }
            })}
          </div>
        )
        // console.log('sss', itemKey, 'no')
      }
      return contianner
    }
    const AnnotationListItem = value => {
      const { name, avatar, comment, time, id } = value
      return (
        <div className={indexStyles.commentListItem}>
          <div className={indexStyles.left}>
            {/* <Avatar src={avatar} icon="user" style={{color: '#8c8c8c'}}></Avatar> */}
          </div>
          <div className={indexStyles.right}>
            <div className={indexStyles.top}>
              <div className={indexStyles.full_name}>{name}</div>
              <div className={indexStyles.create_time}>
                {time ? timestampToTimeNormal(time, '', true) : ''}
              </div>
            </div>
            <div className={indexStyles.text}>{comment}</div>
          </div>
        </div>
      )
    }

    const dragProps = {
      name: 'file',
      multiple: true,
      withCredentials: true,
      action: `${REQUEST_DOMAIN_FLOWS}/flowtask/upload`,
      data: {
        flow_instance_id: processInfo.id,
        node_instance_id: processEditDatas[itemKey].id
      },
      headers: {
        Authorization: Cookies.get('Authorization'),
        refreshToken: Cookies.get('refreshToken'),
        ...setUploadHeaderBaseInfo({})
      },
      fileList: this.state.fileList,
      beforeUpload(e) {
        // console.log('beforeUpload', e)
        if (fileList.length >= limit_file_num) {
          //已经上传的文件达到限制
          message.warn(`上传文件数量最大为${limit_file_num}个`)
          return false
        }
        if (e.size == 0) {
          message.error(`不能上传空文件`)
          return false
        } else if (e.size > Number(limit_file_size) * 1024 * 1024) {
          message.error(`上传文件不能文件超过${Number(limit_file_size)}MB`)
          return false
        } else {
        }
      },
      onChange(info, e, d) {
        if (fileList.length >= limit_file_num) {
          //已经上传的文件达到限制
          return false
        }
        if (info.file.size == 0) {
          return false
        } else if (info.file.size > Number(limit_file_size) * 1024 * 1024) {
          return false
        } else {
        }
        // console.log('info',info)
        if (info.file.status === 'done' && info.file.response.code === '0') {
          message.success(`${info.file.name} 上传成功。`)
        } else if (
          info.file.status === 'error' ||
          (info.file.response && info.file.response.code !== '0')
        ) {
          // info.fileList.pop()
          for (let i = 0; i < info.fileList.length; i++) {
            if (info.file.uid == info.fileList[i].uid) {
              info.fileList.splice(i, 1)
            }
          }
          message.error(`${info.file.name} 上传失败。`)
        }
        that.setState({
          fileList:
            info.fileList.length < limit_file_num
              ? info.fileList
              : info.fileList.slice(0, limit_file_num)
        })
        const element = document.getElementById(ConfirmInfoOut_1_bott_Id)
        that.funTransitionHeight(element, 500, true)
      },
      onRemove(e) {
        // const message = e.response.message
        const id = e.id || (e.response.data ? e.response.data.id : '')
        return new Promise((resolve, reject) => {
          deleteProcessFile({ id })
            .then(value => {
              if (value.code !== '0') {
                message.warn('删除失败，请重新删除。')
                reject()
              } else {
                const element = document.getElementById(
                  ConfirmInfoOut_1_bott_Id
                )
                that.funTransitionHeight(element, 500, true)
                resolve()
              }
            })
            .catch(err => {
              message.warn('删除失败，请重新删除。')
              reject()
            })
        })
      },
      onPreview(e) {
        const id =
          e.file_resource_id ||
          (e.response.data ? e.response.data.file_resource_id : '')
        const file_name = e.name || e.file_name
        const file_id =
          e.file_id || e.response.data.file_id || e.response.data.id
        const file_resource_id =
          e.file_resource_id || e.response.data.file_resource_id

        if (
          getSubfixName(file_name) == '.pdf' &&
          checkIsHasPermissionInBoard(PROJECT_FILES_FILE_EDIT)
        ) {
          openPDF({ id: file_id })
          return false
        }
        that.props.updateDatasFile({
          seeFileInput: 'taskModule',
          isInOpenFile: true,
          filePreviewCurrentId: file_resource_id,
          filePreviewCurrentFileId: file_id
        })
        // that.props.filePreview({ id: file_resource_id, file_id: file_id })
        // that.props.dispatch({
        //   type: 'projectDetailFile/fileInfoByUrl',
        //   payload: {
        //     file_id
        //   }
        // })
        // console.log('sssss', {
        //   dispatch
        // })
        dispatch({
          type: 'projectDetailFile/updateDatas',
          payload: {
            seeFileInput: 'taskModule',
            isInOpenFile: true,
            filePreviewCurrentId: file_resource_id,
            filePreviewCurrentFileId: file_id
          }
        })
        // this.props.filePreview({ id: file_resource_id, file_id: file_id })
        dispatch({
          type: 'projectDetailFile/filePreview',
          payload: {
            id: file_resource_id,
            file_id: file_id
          }
        })
        dispatch({
          type: 'projectDetailFile/fileInfoByUrl',
          payload: {
            file_id
          }
        })
      }
    }
    let node_amount =
      this.props.model.datas &&
      this.props.model.datas.processInfo &&
      this.props.model.datas.processInfo.node_amount
    let stylLine, stylCircle
    if (this.props.model.datas.processInfo.completed_amount >= itemKey + 1) {
      //0 1    1  2 | 1 3 | 1 4
      stylLine = styles.line
      stylCircle = styles.circle
    } else if (this.props.model.datas.processInfo.completed_amount == itemKey) {
      stylLine = styles.doingLine
      stylCircle = styles.doingCircle
    } else {
      stylLine = styles.hasnotCompetedLine
      stylCircle = styles.hasnotCompetedCircle
    }
    let juge = {
      bordered: false
    }
    return (
      <div
        className={indexStyles.ConfirmInfoOut_1}
        style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}
      >
        {node_amount <= itemKey + 1 ? null : <div className={stylLine}></div>}
        <div className={stylCircle}> {itemKey + 1} </div>
        <div className={styles.outDiv}>
          {/* <div className={styles.arrow}></div> */}
          <Card
            {...juge}
            bordered="false"
            style={{ backgroundColor: '#f5f5f5' }}
          >
            <div className={indexStyles.ConfirmInfoOut_1_top}>
              <div className={indexStyles.ConfirmInfoOut_1_top_left}>
                <div className={indexStyles.ConfirmInfoOut_1_top_left_right}>
                  <div>{name}</div>
                  <div style={{ marginTop: '10px' }}>
                    {' '}
                    <Icon type="upload" /> 上传
                  </div>
                </div>
              </div>
              <div className={indexStyles.ConfirmInfoOut_1_top_right}>
                {filterAssignee(assignee_type)}
                {/*{filterDueTime(deadline_type)}*/}
                {filterDueTime('2')}

                <div
                  className={
                    isShowBottDetail
                      ? indexStyles.upDown_up
                      : indexStyles.upDown_down
                  }
                >
                  <Icon
                    onClick={this.setIsShowBottDetail.bind(this)}
                    type="down"
                    theme="outlined"
                    style={{ color: '#595959' }}
                  />
                </div>
              </div>
            </div>
            <div
              className={
                isShowBottDetail
                  ? indexStyles.ConfirmInfoOut_1_bottShow
                  : indexStyles.ConfirmInfoOut_1_bottNormal
              }
              id={ConfirmInfoOut_1_bott_Id}
            >
              <div className={indexStyles.ConfirmInfoOut_1_bott_left}></div>
              <div className={indexStyles.ConfirmInfoOut_1_bott_right}>
                <div className={indexStyles.ConfirmInfoOut_1_bott_right_dec}>
                  {description}
                </div>
                <div>
                  <ContentRaletion
                    relations_Prefix={relations_Prefix}
                    board_id={board_id}
                    link_id={id}
                    link_local={'21'}
                  />
                </div>
                {filterUploadContain()}

                {assignees.map((value, key) => {
                  const { comment } = value
                  return (
                    !!comment && (
                      <div key={key}>{AnnotationListItem(value)}</div>
                    )
                  )
                })}

                <div
                  className={indexStyles.ConfirmInfoOut_1_bott_right_operate}
                >
                  {filterBottOperate()}
                </div>
              </div>
            </div>
          </Card>
          <OpinionModal
            itemValue={itemValue}
            operateType={this.state.operateType}
            enableOpinion={enable_opinion}
            {...this.props}
            setOpinionModalVisible={this.setOpinionModalVisible.bind(this)}
            opinionModalVisible={this.state.opinionModalVisible}
          />
          {/*<PreviewFileModal {...this.props} filePreviewIsUsable={this.state.filePreviewIsUsable} filePreviewUrl={this.state.filePreviewUrl} current_file_resource_id={this.state.current_file_resource_id} setPreview={this.setPreview.bind(this)} modalVisible={this.state.previewFileModalVisibile} setPreviewFileModalVisibile={this.setPreviewFileModalVisibile.bind(this)} />*/}
          <PreviewFileModal {...this.props} modalVisible={isInOpenFile} />
        </div>
      </div>
    )
  }
}

function mapStateToProps({
  technological: {
    datas: { userBoardPermissions }
  }
}) {
  return {
    userBoardPermissions
  }
}
