import React from 'react'
import DrawerContentStyles from './DrawerContent.less'
import { Icon, Tag, Input, Dropdown, Menu, DatePicker, Popconfirm, message } from 'antd'
import BraftEditor from 'braft-editor'
import NameChangeInput from '../../../../../../../components/NameChangeInput'

// import 'braft-editor/dist/braft.css'
import 'braft-editor/dist/index.css'
import PreviewFileModal from './PreviewFileModal'
import DCAddChirdrenTask from './DCAddChirdrenTask'
import DCMenuItemOne from './DCMenuItemOne'
import {Modal} from "antd/lib/index";
import Comment from './Comment'
import Cookies from 'js-cookie'
import { timestampToTimeNormal, timeToTimestamp, compareTwoTimestamp } from '../../../../../../../utils/util'
import { Button, Upload } from 'antd'
import {
  MESSAGE_DURATION_TIME, NOT_HAS_PERMISION_COMFIRN, PROJECT_TEAM_CARD_EDIT, PROJECT_TEAM_CARD_DELETE,
  PROJECT_FILES_FILE_EDIT, PROJECT_TEAM_CARD_COMPLETE, PROJECT_TEAM_BOARD_EDIT, REQUEST_DOMAIN_FILE, UPLOAD_FILE_SIZE,
  PROJECT_FILES_FILE_UPLOAD, REQUEST_DOMAIN_BOARD, TASKS, CONTENT_DATA_TYPE_CARD
} from "../../../../../../../globalset/js/constant";
import {
  checkIsHasPermissionInBoard, checkIsHasPermission,
  currentNounPlanFilterName, openPDF, getSubfixName
} from "../../../../../../../utils/businessFunction";
import {deleteTaskFile, } from '../../../../../../../services/technological/task'
import { filePreview } from '../../../../../../../services/technological/file'
import {getProcessList} from "../../../../../../../services/technological/process";
import globalStyle from '../../../../../../../globalset/css/globalClassName.less'
import TagDropDown from './components/TagDropDown'
import MeusearMutiple from './components/MeusearMutiple'
import ExcutorList from './components/ExcutorList'
import {isApiResponseOk} from "../../../../../../../utils/handleResponseData";
import ContentRaletion from '../../../../../../../components/ContentRaletion'
import {createMeeting, createShareLink, modifOrStopShareLink} from './../../../../../../../services/technological/workbench'
import ShareAndInvite from './../../../../ShareAndInvite/index'
import VisitControl from './../../../../VisitControl/index'
import {toggleContentPrivilege, setContentPrivilege, removeContentPrivilege} from './../../../../../../../services/technological/project'
import InformRemind from '@/components/InformRemind'
import { setUploadHeaderBaseInfo } from '@/utils/businessFunction'

const TextArea = Input.TextArea
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

let that
class DrawContent extends React.Component {
  state = {
    title: '',
    titleIsEdit: false,
    isInEdit: false,
    brafitEditHtml: '', //富文本编辑内容
    isInAddTag: false,
    tagDropdownVisible: false, //标签下拉内容是否可见
    // 第二行状态
    isSetedAlarm: false,
    alarmTime: '',
    previewFileModalVisibile: false, //文件预览是否打开状态
    attachment_fileList: [], //任务附件列表
    isUsable: true, //任务附件是否可预览
    showUploadList: false, //是否显示filelist， 用于做上传时和上传完成不同列表的渲染
    onlyReadingShareModalVisible: false, //只读分享modal
    onlyReadingShareData: {}
  }

  constructor() {
    super()
    this.initSet = true
  }

  componentWillMount() {
    //drawContent  是从taskGroupList点击出来设置当前项的数据。taskGroupList是任务列表，taskGroupListIndex表示当前点击的是哪个任务列表
    const { datas: { drawContent = {}} } = this.props.model
    let { description, attachment_data = [] } = drawContent
    this.setState({
      brafitEditHtml: description
    })
  }

  componentDidMount() {
    this.getMilestone()
  }

  componentWillReceiveProps(nextProps) {
    const { datas: { drawContent = {}} } = nextProps.model
    const { attachment_fileList = []} = this.state
    let { description, attachment_data = [] } = drawContent
    this.setState({
      brafitEditHtml: description
    })

    this.initSetAttachmentFileList(nextProps)

  }
  componentWillUnmount(){
    this.initSet = true
  }
  initSetAttachmentFileList(props) {
    const { datas: { drawContent = {}} } = props.model
    let { attachment_data = [] } = drawContent
    const attachment_fileList_local = this.state.attachment_fileList || []
    if(attachment_data.length == attachment_fileList_local.length) {
      return
    }

    let attachment_fileList = []
    for(let i = 0; i < attachment_data.length; i++) {
      if(attachment_data[i].status !== 'uploading') { //加此判断是 由于在上传的过程中退出详情抽屉，导致数据异常
        attachment_fileList.push(attachment_data[i])
        // attachment_fileList[i]['uid'] = attachment_data[i].id || (attachment_data[i].response && attachment_data[i].response.data? attachment_data[i].response.data.attachment_id:'')
        attachment_fileList[attachment_fileList.length-1]['uid'] = attachment_data[i].id || (attachment_data[i].response && attachment_data[i].response.data? attachment_data[i].response.data.attachment_id:'')
      }
    }
    this.setState({
      attachment_fileList
    })
  }

  //firstLine -------start
  //分组状态选择
  projectGroupMenuClick(e) {
    const pathArr = e.keyPath
    const parentKey = Number(pathArr[1])
    const childKey = Number(pathArr[0])

    const { datas: { drawContent = {}, projectDetailInfoData = {}, projectGoupList = [] } } = this.props.model
    const { card_id } = drawContent
    const list_id = projectGoupList[parentKey].list_data[childKey].list_id
    const board_id = projectGoupList[parentKey].board_id
    const requestObj = {
      card_id,
      list_id,
      board_id,
    }
    const indexObj = {
      taskGroupListIndex: childKey,
      taskGroupListIndex_index: 0
    }
    this.props.changeTaskType({requestObj, indexObj})
  }
  topRightMenuClick({key}) {
    const { datas: { drawContent = {} } } = this.props.model
    const { card_id } = drawContent
    if(key === '1') {
      if(!checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_DELETE)){
        message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
        return false
      }
      this.props.archivedTask({
        card_id,
        is_archived: '1'
      })
    }else if(key === '2') {
      if(!checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_DELETE)){
        message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
        return false
      }
      this.confirm(card_id)
    }
  }
  confirm(card_id) {
    const that = this
    Modal.confirm({
      title: `确认删除该${currentNounPlanFilterName(TASKS)}吗？`,
      okText: '确认',
      cancelText: '取消',
      zIndex: 2000,
      onOk() {
        that.props.handleDeleteCard && that.props.handleDeleteCard({ card_id }) //gantt
        that.props.setTaskDetailModalVisibile && that.props.setTaskDetailModalVisibile() // gantt
        that.props.setDrawerVisibleClose && that.props.setDrawerVisibleClose()
        that.props.deleteTask(card_id)
      }
    });
  }
  //firstLine----------end
  //甘特图传递进来的方法，用于名称更新和时间更新渲染
  handleChangeCard({card_id, drawContent}) {
    this.props.handleChangeCard && this.props.handleChangeCard({card_id, drawContent})
  }

  //标题-------start
  setIsCheck() {
    if(!checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_COMPLETE)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const { datas: { drawContent = {}, projectDetailInfoData = {} } } = this.props.model
    const { is_realize = '0', card_id } = drawContent
    const obj = {
      card_id,
      is_realize: is_realize === '1' ? '0' : '1'
    }
    this.props.completeTask(obj)
    drawContent['is_realize'] = is_realize === '1' ? '0' : '1'
    this.props.updateTaskDatas({drawContent})
    this.handleChangeCard({drawContent, card_id})
  }
  titleTextAreaChangeBlur(e) {
    const { datas: { drawContent = {} } } = this.props.model
    const { card_id, description, due_time, start_time } = drawContent
    drawContent['card_name'] = e.target.value
    const updateObj ={
      card_id,
      name: e.target.value,
      card_name: e.target.value,
    }
    this.setState({
      titleIsEdit: false
    })
    // const newDrawContent = {...drawContent,card_name: e.target.value,}
    this.props.updateTask({updateObj})
    this.props.updateTaskDatas({drawContent})
    //处理甘特图
    this.handleChangeCard({drawContent, card_id})
  }
  setTitleIsEdit(titleIsEdit, e) {
    e.stopPropagation();
    this.setState({
      titleIsEdit: titleIsEdit
    })
  }
  //标题-------end

  //第二行状态栏编辑------------------start
    //设置任务负责人组件---------------start
  setList(id) {
    const { datas: { board_id } } = this.props.model
    this.props.removeProjectMenbers({board_id, user_id: id})
  }
  chirldrenTaskChargeChange(data) {
    const { datas: { drawContent = {}, projectDetailInfoData = {} } } = this.props.model
    const { card_id, executors=[] } = drawContent
    //单个任务执行人
    const { user_id, full_name, avatar } = data
    // executors[0] = {
    //   user_id,
    //   user_name: full_name,
    //   avatar: avatar
    // }
    // this.props.addTaskExecutor({
    //   card_id,
    //   users: user_id
    // })

   //  多个任务执行人
    const excutorData = projectDetailInfoData['data'] //所有的人
    let newExecutors = []
    const { selectedKeys = [] } = data
    for(let i = 0; i < selectedKeys.length; i++) {
      for(let j = 0; j < excutorData.length; j++) {
        if(selectedKeys[i] === excutorData[j]['user_id']) {
          newExecutors.push(excutorData[j])
        }
      }
    }
    drawContent['executors'] = newExecutors
    //用于判判断任务执行人菜单是否显示
    const that = this
    setTimeout(function () {
      const { excutorsOut_left = {}} = that.refs
      const excutorsOut_left_width = excutorsOut_left.clientWidth
      that.setState({
        excutorsOut_left_width
      })
    }, 300)

    this.props.addTaskExecutor({
      card_id,
      users: selectedKeys.join(',')
    })
    this.handleChangeCard({drawContent, card_id})
  }
  setChargeManIsSelf() {
    const { datas: { drawContent = {} } } = this.props.model
    const { card_id, executors=[] } = drawContent
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    const { id, full_name, fullName, email, mobile, avatar } = userInfo
    executors[0] = {
      user_id: id,
      user_name: full_name || fullName || mobile || email,
      avatar: avatar
    }
    this.props.addTaskExecutor({
      card_id,
      users: id
    })
  }
    //设置任务负责人组件---------------end
    //设置提醒
  alarmMenuClick({key}) {
    let alarmTime
    switch (key) {
      case '1':
        alarmTime = '15分钟后'
        break
      case '2':
        alarmTime = '30分钟后'
        break
      case '3':
        alarmTime = '1小时后'
        break
      case '4':
        alarmTime = '1天后'
        break
      case '5':
        alarmTime = `${currentNounPlanFilterName(TASKS)}开始时`
        break
      case '6':
        alarmTime = `${currentNounPlanFilterName(TASKS)}结束时`
        break
      default:
        break
    }
    this.setState({
      isSetedAlarm: true,
      alarmTime
    })
  }
    //开始时间
  startDatePickerChange(e, timeString) {
    const { datas: { drawContent = {} } } = this.props.model
    const start_timeStamp = timeToTimestamp(timeString)
    const { card_id, due_time } = drawContent
    if(!this.compareStartDueTime(start_timeStamp, due_time)) {
      message.warn('开始时间不能大于结束时间')
      return false
    }
    drawContent['start_time'] = start_timeStamp
    const updateObj ={
      card_id,
      start_time: start_timeStamp,
    }
    this.props.updateTask({updateObj})
    this.props.updateTaskDatas({drawContent})
    //处理甘特图
    this.handleChangeCard({drawContent, card_id})
  }
    //截止时间
  endDatePickerChange(e, timeString) {
    const { datas: { drawContent = {}, milestoneList = [] } } = this.props.model
    const { card_id, start_time, milestone_data = {} } = drawContent
    const milestone_deadline = (milestoneList.find((item => item.id == milestone_data.id)) || {}).deadline//关联里程碑的时间
    const due_timeStamp = timeToTimestamp(timeString)
    if(!this.compareStartDueTime(start_time, due_timeStamp)) {
      message.warn('开始时间不能大于结束时间')
      return false
    }
    if(!compareTwoTimestamp(milestone_deadline, due_timeStamp)) {
      message.warn('任务的截止日期不能大于关联里程碑的截止日期')
      return
    }
    drawContent['due_time'] = due_timeStamp
    const updateObj ={
      card_id,
      due_time: due_timeStamp,
    }
    this.props.updateTask({updateObj})
    this.props.updateTaskDatas({drawContent})
    //处理甘特图
    this.handleChangeCard({drawContent, card_id})
  }
  compareStartDueTime = (start_time, due_time) => {
    if(!start_time || !due_time) {
      return true
    }
    const newStartTime = start_time.toString().length > 10 ? Number(start_time) / 1000 : Number(start_time)
    const newDueTime = due_time.toString().length > 10 ? Number(due_time) / 1000 : Number(due_time)
    if(newStartTime >= newDueTime) {
      return false
    }
    return true
  }
  disabledDueTime = (due_time) => {
    const { datas: { drawContent = {} } } = this.props.model
    const { start_time } = drawContent
    if (!start_time || !due_time) {
      return false;
    }
    const newStartTime = start_time.toString().length > 10 ? Number(start_time).valueOf() / 1000 : Number(start_time).valueOf()
    return Number(due_time.valueOf()) / 1000 < newStartTime;
  }
  disabledStartTime = (start_time) => {
    const { datas: { drawContent = {} } } = this.props.model
    const { due_time } = drawContent
    if (!start_time || !due_time) {
      return false;
    }
    const newDueTime = due_time.toString().length > 10 ? Number(due_time).valueOf() / 1000 : Number(due_time).valueOf()
    return Number(start_time.valueOf()) / 1000 >= newDueTime//Number(due_time).valueOf();
  }
  //第二行状态栏编辑------------------end

  //有关于富文本编辑---------------start
  editWrapClick(e) {
    e.stopPropagation();
  }
  goEdit(e) {
    e.stopPropagation();
    // if(e.target.nodeName.toUpperCase() === 'IMG') {
    //   const src = e.target.getAttribute('src')
    // }
    this.setState({
      isInEdit: true
    })
  }
  quitBrafitEdit(e) {
    e.stopPropagation();
    const { datas: { drawContent = {}} } = this.props.model
    let { description } = drawContent
    this.setState({
      isInEdit: false,
      brafitEditHtml: description,
    })

  }
  saveBrafitEdit(e) {
    e.stopPropagation();
    const { datas: { drawContent = {} } } = this.props.model
    let { card_id} = drawContent
    let { brafitEditHtml } = this.state
    if(typeof brafitEditHtml === 'object') {
      brafitEditHtml = brafitEditHtml.toHTML()
    }
    this.setState({
      isInEdit: false,
    })
    const updateObj ={
      card_id,
      description: brafitEditHtml,
    }
    this.props.updateTask({updateObj})
  }
  drawerContentOutClick(e) {
    // if(this.state.isInEdit){
    //   const { datas:{ drawContent = {} } } = this.props.model
    //   let { card_id, description,} = drawContent
    //   if(typeof description === 'object') {
    //     description = description.toHTML()
    //   }
    //   const updateObj ={
    //     card_id,
    //     description,
    //   }
    //   this.props.updateTask({updateObj})
    // }
    this.setState({
      // isInEdit: false,
      titleIsEdit: false,
    })
  }
  isJSON = (str) => {
    if (typeof str === 'string') {
      try {
        var obj=JSON.parse(str);
        if(str.indexOf('{')>-1){
          return true;
        }else{
          return false;
        }

      } catch(e) {
        return false;
      }
    }
    return false;
  }
  myUploadFn = (param) => {
    const serverURL = `${REQUEST_DOMAIN_FILE}/upload`
    const xhr = new XMLHttpRequest()
    const fd = new FormData()

    const successFn = (response) => {
      // 假设服务端直接返回文件上传后的地址
      // 上传成功后调用param.success并传入上传后的文件地址
      if(xhr.status === 200 && this.isJSON(xhr.responseText)) {
        if(JSON.parse(xhr.responseText).code === '0') {
          param.success({
            url: JSON.parse(xhr.responseText).data ? JSON.parse(xhr.responseText).data.url : '',
            meta: {
              // id: 'xxx',
              // title: 'xxx',
              // alt: 'xxx',
              loop: false, // 指定音视频是否循环播放
              autoPlay: false, // 指定音视频是否自动播放
              controls: true, // 指定音视频是否显示控制栏
              // poster: 'http://xxx/xx.png', // 指定视频播放器的封面
            }
          })
        }else {
          errorFn()
        }
      }else {
        errorFn()
      }

    }

    const progressFn = (event) => {
      // 上传进度发生变化时调用param.progress
      param.progress(event.loaded / event.total * 100)
    }

    const errorFn = (response) => {
      // 上传发生错误时调用param.error
      param.error({
        msg: '图片上传失败!'
      })
    }

    xhr.upload.addEventListener("progress", progressFn, false)
    xhr.addEventListener("load", successFn, false)
    xhr.addEventListener("error", errorFn, false)
    xhr.addEventListener("abort", errorFn, false)

    fd.append('file', param.file)
    xhr.open('POST', serverURL, true)
    xhr.setRequestHeader('Authorization', Cookies.get('Authorization'))
    xhr.setRequestHeader('refreshToken', Cookies.get('refreshToken'))
    xhr.send(fd)
  }
  descriptionHTML(e) {
    if(e.target.nodeName.toUpperCase() === 'IMG') {
      const src = e.target.getAttribute('src')
      this.setState({
        previewFileType: 'img',
        previewFileSrc: src
      })
      this.setPreviewFileModalVisibile()
    }else if(e.target.nodeName.toUpperCase() === 'VIDEO') {
      const src = e.target.getAttribute('src')
      this.setState({
        previewFileType: 'video',
        previewFileSrc: src
      })
      this.setPreviewFileModalVisibile()
    }
  }
  setPreviewFileModalVisibile() {
    this.setState({
      previewFileModalVisibile: !this.state.previewFileModalVisibile
    })
  }
  //有关于富文本编辑---------------end

  //标签-------------start
  randomColorArray() {
    const colorArr = ['magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple']
    const n = Math.floor(Math.random() * colorArr.length + 1)-1;
    return colorArr[n]
  }
  tagClose({ label_id, label_name, key}) {
    const { datas: { drawContent = {} } } = this.props.model
    const { card_id } = drawContent
    const keyCode = label_id? 'label_id':'label_name'
    this.props.removeTaskTag({
      card_id,
      [keyCode]: label_id || label_name,
    })
    drawContent['label_data'].splice(key, 1)
    this.props.updateTaskDatas({drawContent})
    this.handleChangeCard({drawContent, card_id})

  }
  addTag() {
    this.setState({
      isInAddTag: true,
      tagDropdownVisible: true
    })
  }
  quitAddTag() {
    this.setState({
      isInAddTag: false,
      tagDropdownVisible: false
    })
  }
  tagAddComplete(e) {
    this.setState({
      isInAddTag: false,
      tagDropdownVisible: false,
      tagInputValue: ''
    })
    if(! e.target.value) {
      return false
    }
    const { datas: { drawContent = {}, board_id } } = this.props.model
    const { card_id, label_data = [] } = drawContent
    label_data.push({label_name: e.target.value})
    this.props.addTaskTag({
      card_id,
      board_id,
      name: e.target.value,
      label_name: e.target.value,
      length: label_data.length
    })
    this.handleChangeCard({drawContent, card_id})

  }
  tagDropItemClick(data) {
    this.setState({
      isInAddTag: false,
      tagDropdownVisible: false,
      tagInputValue: ''
    })
    const { datas: { drawContent = {}, board_id } } = this.props.model
    const { card_id, label_data = [] } = drawContent
    const { name, color } = data
    label_data.push({label_name: name, label_color: color})
    this.props.addTaskTag({
      card_id,
      board_id,
      name: name,
      color,
      label_name: name,
      length: label_data.length
    })
    this.handleChangeCard({drawContent, card_id})

  }
  setTagInputValue(e) {
    this.setState({
      tagInputValue: e.target.value, //用于标签检索
    })
  }
  //标签-------------end

  alarmNoEditPermission() {
    message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
  }
  //任务附件预览黄
  setPreivewProp(data) {
    this.setState({
      ...data,
    })
  }
  attachmentItemPreview(data) {
    const { datas: { board_id } } = this.props.model
    const file_name = data.name
    const file_resource_id = data.file_resource_id || data.response.data.file_resource_id
    const file_id = data.file_id || data.response.data.file_id

    this.props.setPreviewFileModalVisibile()
    this.props.updateFileDatas({
      seeFileInput: 'taskModule',
      board_id,
      filePreviewCurrentId: file_resource_id,
      filePreviewCurrentFileId: file_id,
      pdfDownLoadSrc: '',
    })
    if(getSubfixName(file_name) == '.pdf') {
      this.props.dispatch({
        type: 'workbenchFileDetail/getFilePDFInfo',
        payload: {
          id: file_id
        }
      })
    } else {
      this.props.filePreview({id: file_resource_id, file_id})
    }
  }
  attachmentItemOpera({type, data}, e) {
    e.stopPropagation()
    const attachment_id = data.id || (data.response && data.response.data && data.response.data.attachment_id)
    const file_resource_id = data.file_resource_id || (data.response && data.response.data.file_resource_id)
    if(!attachment_id){
      message.warn('上传中，请稍后...')
      return
    }
    if(type == 'remove') {
      this.deleteAttachmentFile(attachment_id)
    }else if(type == 'download') {
      this.props.fileDownload({ids: file_resource_id})
    }
  }
  deleteAttachmentFile(attachment_id) {
    const that = this
    const { attachment_fileList } = this.state
    const { datas: { drawContent = {} }} = this.props.model
    const atta_arr = [...attachment_fileList]
    Modal.confirm({
      title: `确认要删除这个附件吗？`,
      zIndex: 1007,
      content: <div style={{color: 'rgba(0,0,0, .8)', fontSize: 14}}>
        <span >删除后不可恢复</span>
      </div>,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        return new Promise((resolve, reject) => {
          deleteTaskFile({attachment_id}).then((value) => {
            if(value.code !=='0') {
              message.warn('删除失败，请重新删除。1')
              resolve()
            }else {
              for(let i = 0; i < atta_arr.length; i++) {
                if (attachment_id == atta_arr[i]['id'] || (atta_arr[i].response && atta_arr[i].response.data && atta_arr[i].response.data.attachment_id == attachment_id)) {
                  atta_arr.splice(i, 1)
                }
              }
              that.setState({
                attachment_fileList: atta_arr
              })
              const drawContentNew = {...drawContent}
              drawContentNew['attachment_data'] = atta_arr
              that.props.dispatch({
                type: 'workbenchTaskDetail/updateDatas',
                payload: {
                  drawContent: drawContentNew
                }
              })
              resolve()
            }
          }).catch(err => {
            message.warn('删除出了点问题，请重新删除。')
            resolve()
          })
        })

      }
    });
  }

  //发起会议按钮
  meetingMenuClick(e) {
    const { key } = e
    if (key == '1') {
      window.open('https://zoom.us/start/webmeeting')
    } else if(key == '2') {
      window.open('https://zoom.us/start/videomeeting')
    } else if(key == '3') {
      window.open('https://zoom.us/start/sharemeeting')
    }
  }
  openWinNiNewTabWithATag = url => {
    const aTag = document.createElement('a')
    aTag.href = url
    aTag.target = '_blank'
    document.querySelector('body').appendChild(aTag)
    aTag.click()
    aTag.parentNode.removeChild(aTag)
  }
  handleCreateVideoMeeting = (title, id, users = [], e) => {
    if(e) e.stopPropagation()
    const body = {
      flag: '1',
      board_id: id,
      topic: title,
      user_ids: users.reduce((acc, curr) => {
        if(!curr || !curr.user_id) return acc
        return acc ? acc + ',' + curr.user_id : curr.user_id
      }, '')
    }
    createMeeting(body).then(res => {
      if (res.code === "0") {
        const { start_url } = res.data;
        message.success("发起会议成功");
        this.openWinNiNewTabWithATag(start_url)
      } else if (res.code === "1") {
        message.error(res.message);
      } else {
        message.error("发起会议失败");
      }
    })
  }
  handleChangeOnlyReadingShareModalVisible = () => {
    const {onlyReadingShareModalVisible} = this.state
    //打开之前确保获取到数据
    if(!onlyReadingShareModalVisible) {
      Promise.resolve(this.createOnlyReadingShareLink()).then(() => {
        this.setState({
          onlyReadingShareModalVisible: true
        })
      }).catch(err => message.error('获取分享信息失败'))
    } else {
      this.setState({
        onlyReadingShareModalVisible: false
      })
    }
  }
  createOnlyReadingShareLink = () => {

    const { datas: { drawContent = {} } } = this.props.model
    const {board_id, card_id} = drawContent

    const payload = {
      board_id,
      rela_id: card_id,
      rela_type: '3'
    }
    return createShareLink(payload).then(({code, data}) => {
      if(code === '0') {
        this.setState(() => {
          return {
            onlyReadingShareData: data
          }
        })
      }else {
        message.error('获取分享信息失败')
        return new Error('can not create share link.')
      }
    })
  }
  handleOnlyReadingShareExpChangeOrStopShare = (obj) => {
    const isStopShare = obj && obj['status'] && obj['status'] === '0'
    return modifOrStopShareLink(obj).then(res => {
      if(res && res.code === '0') {
        if(isStopShare) {
          message.success('停止分享成功')
        } else {
          message.success('修改成功')
        }
        this.setState((state) => {
          const { onlyReadingShareData } = state
          return {
            onlyReadingShareData: Object.assign({}, onlyReadingShareData, obj)
          }
        })
      } else {
        message.error('操作失败')
      }
    }).catch(err => {
      message.error('操作失败')
    })
  }
  handleClickedOtherPersonListOperatorItem = (id, type) => {
    if(type === 'remove') {
      this.handleVisitControlRemoveContentPrivilege(id)
    } else {
      this.handleVisitControlChangeContentPrivilege(id, type)
    }

  }
  handleVisitControlChangeContentPrivilege = (id, type) => {
    const { datas: { drawContent = {}} } = this.props.model
    const {card_id, privileges} = drawContent
    const obj = {
      content_id: card_id,
      content_type: 'card',
      privilege_code: type,
      user_ids: id
    }
    setContentPrivilege(obj).then(res => {
      const isResOk = res => res && res.code === '0'
      if(isResOk(res)){
        let changedPrivileges = {}
        for(let item in privileges) {
          if(item !== id) {
            changedPrivileges[item] = privileges[item]
          } else {
            changedPrivileges[item] = type
          }
        }
        this.visitControlUpdateCurrentModalData({privileges: changedPrivileges})
      }else{
        message.error('更新用户控制类型失败')
      }
    })
  }
  handleVisitControlRemoveContentPrivilege = id => {
    const { datas: { drawContent = {}} } = this.props.model
    const {card_id, privileges} = drawContent
    removeContentPrivilege({content_id: card_id, content_type: 'card', user_id: id}).then(res => {
      const isResOk = res => res && res.code === '0'
      if(isResOk(res)){
        let remainPrivileges = {}
        for(let item in privileges) {
          if(item !== id) {
            remainPrivileges[item] = privileges[item]
          }
        }
        this.visitControlUpdateCurrentModalData({privileges: remainPrivileges})
      }else{
        message.error('移除用户内容控制权限失败')
      }
    })
  }
  handleVisitControlAddNewMember = (ids = []) => {
    if(!ids.length) return
    const user_ids = ids.reduce((acc, curr) => {
      if(!acc) return curr
      return `${acc},${curr}`
    }, '')
    const { datas: { drawContent = {}} } = this.props.model
    const {card_id, privileges} = drawContent
    const content_id = card_id
    const content_type = 'card'
    setContentPrivilege({
      content_id,
      content_type,
      privilege_code: 'read',
      user_ids,
    }).then(res => {
      if(res && res.code === '0') {
        const newMemberPrivilegesObj = ids.reduce((acc, curr) => {
          return Object.assign({}, acc, {[curr]: 'read'})
        }, {})
        this.visitControlUpdateCurrentModalData({privileges: Object.assign({}, newMemberPrivilegesObj, privileges)})
      }
    })
  }
  handleVisitControlChange = (flag) => {
    const { datas: { drawContent = {}} } = this.props.model
    const {is_privilege = '0', card_id} = drawContent
    const toBool = str => !!Number(str)
    const is_privilege_bool = toBool(is_privilege)
    if(flag === is_privilege_bool) {
      return
    }
    //toggle权限
    const data = {
      content_id: card_id,
      content_type: 'card',
      is_open: flag ? 1 : 0
    }
    toggleContentPrivilege(data).then(res => {
  if(res && res.code === '0') {
      this.visitControlUpdateCurrentModalData({is_privilege: flag ? '1':'0'}, flag)
    } else {
      message.error('设置内容权限失败，请稍后再试')
    }
    })
  }
  visitControlUpdateCurrentModalData = (obj = {}) => {
    const { datas: { drawContent = {}, taskGroupListIndex, taskGroupListIndex_index, taskGroupList=[] } } = this.props.model
    const {card_id} = drawContent

    for (let item in obj) {
      drawContent[item] = obj[item]
    }
    const updateObj ={
      card_id
    }
    this.props.updateTask({updateObj})
    this.props.updateTaskDatas({drawContent})
  }

  //里程碑
  renderMiletonesMenu = () => {
    const { datas: { milestoneList = [] }} = this.props.model
    return (
      <Menu onClick={this.setRelaMiletones}>
        {
          milestoneList.map(value => {
            const { id, name, deadline } = value
            return (
              <Menu.Item key={`${id}__${deadline}`}>{name}</Menu.Item>
            )
          })
        }
      </Menu>
    )
  }
  setRelaMiletones = (e) => {
    const id_time_arr = e.key.split('__')
    const id = id_time_arr[0]
    const deadline = id_time_arr[1]
    const { datas: { drawContent = {} } } = this.props.model
    const { card_id, type,  due_time} = drawContent
    if(!compareTwoTimestamp(deadline, due_time)) {
      message.warn('关联里程碑的截止日期不能小于任务的截止日期')
      return
    }
    const params = {
      rela_id: card_id,
      id,
      origin_type: type
    }
    const { dispatch } = this.props
    dispatch({
      type: 'workbenchTaskDetail/taskRelaMiletones',
      payload: {
        ...params
      }
    })
  }
  cancelRelaMiletone = ({card_id, id}) => {
    const params = {
      rela_id: card_id,
      id,
    }
    const { dispatch } = this.props
    dispatch({
      type: 'workbenchTaskDetail/taskCancelRelaMiletones',
      payload: {
        ...params
      }
    })
  }
  //获取项目里程碑列表
  getMilestone = (id) => {
    const { dispatch } = this.props
    const { datas: { board_id }} = this.props.model
    dispatch({
      type: 'workbenchPublicDatas/getMilestoneList',
      payload: {
        id: board_id
      }
    })
  }
  render() {
    that = this
    const { titleIsEdit, isInEdit, isInAddTag, isSetedAlarm, alarmTime, brafitEditHtml, attachment_fileList, excutorsOut_left_width, onlyReadingShareModalVisible, onlyReadingShareData, showUploadList} = this.state

    //drawContent  是从taskGroupList点击出来设置当前项的数据。taskGroupList是任务列表，taskGroupListIndex表示当前点击的是哪个任务列表
    const { datas: { card_id, drawContent = {}, projectDetailInfoData = {}, projectGoupList = [], taskGroupList = [], taskGroupListIndex = 0, boardTagList = [], board_id } } = this.props.model

    const { data = [] } = projectDetailInfoData //任务执行人列表
    // console.log('ssss', projectDetailInfoData)
    // const { list_name } = taskGroupList[taskGroupListIndex]

    let { milestone_data = {}, board_name, list_name, card_name, child_data = [], type = '0', start_time, due_time, description, label_data = [], is_realize = '0', executors = [], attachment_data=[], is_shared, is_privilege = '0', privileges = {} } = drawContent

    let executor = {//任务执行人信息 , 单个执行人情况
      user_id: '',
      user_name: '',
      avatar: '',
    }
    if(executors.length) {
      executor = executors[0]
    }
    label_data = label_data || []
    description = description //|| '<p style="font-size: 14px;color: #595959; cursor: pointer ">编辑描述</p>'
    const editorState = BraftEditor.createEditorState(brafitEditHtml)

    const editorProps = {
      height: 0,
      contentFormat: 'html',
      value: editorState,
      media: {uploadFn: this.myUploadFn},
      onChange: (e) => {
        // const { datas:{ drawContent = {} } } = this.props.model
        // drawContent['description'] = e
        // this.props.updateTaskDatas({drawContent})
        this.setState({
          brafitEditHtml: e
        })
      },
      fontSizes: [14],
      controls: [
        'text-color', 'bold', 'italic', 'underline', 'strike-through',
        'text-align', 'list_ul',
        'list_ol', 'blockquote', 'code', 'split', 'media'
      ]
    }
    const alarmMenu = (
      <Menu onClick={this.alarmMenuClick.bind(this)}>
        <Menu.Item key="1">15分钟后</Menu.Item>
        <Menu.Item key="2">30分钟后</Menu.Item>
        <Menu.Item key="3">1小时后</Menu.Item>
        <Menu.Item key="4">1天后</Menu.Item>
        <Menu.Item key="5" disabled>${currentNounPlanFilterName(TASKS)}开始时</Menu.Item>
        <Menu.Item key="6" disabled>${currentNounPlanFilterName(TASKS)}结束时</Menu.Item>

      </Menu>
    )

    const meetingMenu = (
      <Menu onClick={this.meetingMenuClick.bind(this)}>
        <Menu.Item key="1">
          <i className={`${globalStyle.authTheme}`} style={{marginRight: 8}}>
            &#xe760;
          </i>
          仅语音会议
        </Menu.Item>
        <Menu.Item key="2">
          <i className={`${globalStyle.authTheme}`} style={{marginRight: 8}}>
            &#xe601;
          </i>
          语音视频会议
        </Menu.Item>
        <Menu.Item key="3">
          <i className={`${globalStyle.authTheme}`} style={{marginRight: 8}}>
            &#xe746;
          </i>
          屏幕或白板共享会议
        </Menu.Item>
      </Menu>
    )
    const projectGroupMenu = (
      <Menu onClick={this.projectGroupMenuClick.bind(this)} mode="vertical">
        {projectGoupList.map((value, key) => {
          const { list_data } = value
          return (
            <SubMenu key={key} title={<span>{value.board_name}</span>}>
              {list_data.map((value2, key2) => {
                return (<Menu.Item key={key2}>{ value2.list_name }</Menu.Item>)
              })}
            </SubMenu>
            )
        })}
      </Menu>
    )

    const topRightMenu = (
      <Menu onClick={this.topRightMenuClick.bind(this)}>
        {/* <Menu.Item key={'1'} style={{textAlign: 'center', padding: 0, margin: 0}}>
          <div className={DrawerContentStyles.elseProjectMemu}>
            归档{currentNounPlanFilterName(TASKS)}
          </div>
        </Menu.Item> */}
        {checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_DELETE) && (
          <Menu.Item key={'2'} style={{textAlign: 'center', padding: 0, margin: 0}}>
            <div className={DrawerContentStyles.elseProjectDangerMenu}>
              删除{currentNounPlanFilterName(TASKS)}
            </div>
          </Menu.Item>
        )}
      </Menu>
    );

    const uploadProps = {
      name: 'file',
      fileList: attachment_fileList,
      withCredentials: true,
      action: `${REQUEST_DOMAIN_BOARD}/card/attachment/upload`,
      multiple: true,
      data: {
        card_id
      },
      headers: {
        Authorization: Cookies.get('Authorization'),
        refreshToken: Cookies.get('refreshToken'),
        ...setUploadHeaderBaseInfo({contentDataType: CONTENT_DATA_TYPE_CARD}),
      },
      showUploadList: true,
      beforeUpload(e) {
        if(e.size == 0) {
          message.error(`不能上传空文件`)
          return false
        }else if(e.size > UPLOAD_FILE_SIZE * 1024 * 1024) {
          message.error(`上传文件不能文件超过${UPLOAD_FILE_SIZE}MB`)
          return false
        }
        that.setState({
          showUploadList: true
        })
      },
      onChange({ file, fileList, event }) {
        if (file.size == 0) {
          return false;
        } else if (file.size > UPLOAD_FILE_SIZE * 1024 * 1024) {
          return false;
        }
        if (file.status === 'done' && file.response.code === '0') {
          for(let i=0; i < fileList.length; i++) {
            if(file.uid == fileList[i].uid) {
              fileList.splice(i, 1, {...file, ...file.response.data})
            }
          }
        } else if (file.status === 'error' || (file.response && file.response.code !== '0')) {
          for(let i=0; i < fileList.length; i++) {
            if(file.uid == fileList[i].uid) {
              fileList.splice(i, 1)
            }
          }
          message.error(file.response && file.response.message || '上传失败');
        }

        if(file.status === 'done' ) {
          that.setState({
            showUploadList: false
          })
        }
        that.setState({
          attachment_fileList: fileList
        })
        setTimeout(function () {
          const drawContentNew = {...drawContent}
          drawContentNew['attachment_data'] = fileList
          that.props.dispatch({
            type: 'workbenchTaskDetail/updateDatas',
            payload: {
              drawContent: drawContentNew
            }
          })
        }, 3000)
      },
      onPreview(e, a) {
        const file_name = e.name
        const file_resource_id = e.file_resource_id || e.response.data.file_resource_id
        const file_id = e.file_id || e.response.data.file_id

        if(getSubfixName(file_name) == '.pdf' && checkIsHasPermissionInBoard(PROJECT_FILES_FILE_EDIT)) {
          openPDF({id: file_id})
          return false
        }

        that.props.setPreviewFileModalVisibile()
        that.props.updateFileDatas({
          seeFileInput: 'task',
          board_id,
          filePreviewCurrentId: file_resource_id,
          filePreviewCurrentFileId: file_id,
        })
        that.props.filePreview({id: file_resource_id, file_id: file_id})
      },
      onRemove(e) {
        const attachment_id = e.id || (e.response.data && e.response.data.attachment_id)
        if(!attachment_id){
          return
        }
        return new Promise((resolve, reject) => {
          deleteTaskFile({attachment_id}).then((value) => {
            if(value.code !=='0') {
              message.warn('删除失败，请重新删除。')
              reject()
            }else {
              resolve()
            }
          }).catch(err => {
            message.warn('删除失败，请重新删除。')
            reject()
          })
        })

      }

    };

    //任务负责人显示 点点点
    const { excutorsOut_left = {}} = this.refs
    const excutorsOut_left_width_new = excutorsOut_left.clientWidth

    return(
      //
      <div className={DrawerContentStyles.DrawerContentOut} onClick={this.drawerContentOutClick.bind(this)}>
        <div style={{height: 'auto', width: '100%', position: 'relative'}}>
          {/*没有编辑项目时才有*/}
          {checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_EDIT)? ('') : (
            <div style={{height: '100%', width: '100%', position: 'absolute', zIndex: '3', left: 20}} onClick={this.alarmNoEditPermission.bind(this)}></div>
          )}
          {/*项目挪动*/}
          <div style={{display: 'flex', justifyContent: 'flex-end', textAlign: 'right', marginRight: '5px', marginTop: '-5px'}}>
          <span></span>
          {/* <ShareAndInvite is_shared={is_shared} onlyReadingShareModalVisible={onlyReadingShareModalVisible} handleChangeOnlyReadingShareModalVisible={this.handleChangeOnlyReadingShareModalVisible} data={onlyReadingShareData} handleOnlyReadingShareExpChangeOrStopShare={this.handleOnlyReadingShareExpChangeOrStopShare} /> */}
            {/*<div className={DrawerContentStyles.contain_1}>*/}
              {/*<Dropdown overlay={projectGroupMenu}>*/}
                {/*<div className={DrawerContentStyles.left}>*/}
                  {/*<span>{board_name} </span> <Icon type="right" /> <span>{'list_name'}</span>*/}
                {/*</div>*/}
              {/*</Dropdown>*/}
              {/*<Dropdown overlay={topRightMenu}>*/}
                {/*<div className={DrawerContentStyles.right}>*/}
                  {/*<Icon type="ellipsis" style={{fontSize: 20,marginTop:2}} />*/}
                {/*</div>*/}
              {/*</Dropdown>*/}
            {/* </div> */}
            <span style={{marginTop: '-2px', marginRight: '5px'}}><InformRemind workbenchExecutors={executors} rela_id={card_id} rela_type={type == '0'? '1' : '2'} user_remind_info={data} /></span>

            <span style={{marginTop: '-2px', marginRight: is_privilege === '1' ? '30px' : '10px'}}>
              {drawContent.card_id && (
                <VisitControl
                isPropVisitControl={is_privilege === '1' ? true : false}
                handleVisitControlChange={this.handleVisitControlChange}
                principalList={executors}
                otherPrivilege={privileges}
                handleClickedOtherPersonListOperatorItem={this.handleClickedOtherPersonListOperatorItem}
                handleAddNewMember={this.handleVisitControlAddNewMember}
                />
                )}
              </span>
              {this.props.needDelete && (
                <Dropdown overlay={topRightMenu}>
                <span style={{position: 'absolute', right: 80, top: -2}} >
                  <Icon type="ellipsis" style={{fontSize: 20, marginTop: 2}} />
                </span>
              </Dropdown>
              )}
          </div>

          {/*标题*/}
          <div className={DrawerContentStyles.divContent_2}>
             <div className={DrawerContentStyles.contain_2}>
               {type === '0' ?(
                 <div onClick={this.setIsCheck.bind(this)} className={is_realize === '1' ? DrawerContentStyles.nomalCheckBoxActive: DrawerContentStyles.nomalCheckBox} style={{width: 24, height: 24}}>
                   <Icon type="check" style={{color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginTop: 2}}/>
                 </div>
               ):(
                 <div style={{width: 24, height: 24, color: '#595959'}}>
                   <i className={globalStyle.authTheme} >&#xe709;</i>
                 </div>
               )}
               {/*<TextArea defaultValue={card_name}*/}
                         {/*autosize*/}
                         {/*onBlur={this.titleTextAreaChangeBlur.bind(this)}*/}
                         {/*onClick={this.setTitleIsEdit.bind(this, true)}*/}
                         {/*autoFocus={true}*/}
                         {/*maxLength={100}*/}
                         {/*style={{display: 'block', fontSize: 20, color: '#262626', resize: 'none', marginLeft: -4, padding: '0 4px'}}/>*/}
               {!titleIsEdit ? (
                 <div className={DrawerContentStyles.contain_2_title} onClick={this.setTitleIsEdit.bind(this, true)}>{card_name}</div>
               ) : (
                 <NameChangeInput
                   autosize
                   onBlur={this.titleTextAreaChangeBlur.bind(this)}
                   onClick={this.setTitleIsEdit.bind(this, true)}
                   setIsEdit={this.setTitleIsEdit.bind(this, true)}
                   autoFocus={true}
                   goldName={card_name}
                   maxLength={100}
                   nodeName={'textarea'}
                   style={{display: 'block', fontSize: 20, color: '#262626', resize: 'none', marginLeft: -4, padding: '0 4px'}}
                 />
               )}
             </div>
          </div>
          {/*<MeusearMutiple listData={data} keyCode={'user_id'}searchName={'name'} currentSelect = {executors} chirldrenTaskChargeChange={this.chirldrenTaskChargeChange.bind(this)}/>*/}
          {/*任务负责人*/}
          <div className={DrawerContentStyles.divContent_1}>
            <div className={DrawerContentStyles.contain_3}>
              <div>
            {!executors.length ? (
              <div>
                <span onClick={this.setChargeManIsSelf.bind(this)}>认领</span>&nbsp;<span style={{color: '#bfbfbf'}}>或</span>&nbsp;
                <Dropdown overlay={<MeusearMutiple listData={data} keyCode={'user_id'}searchName={'name'} currentSelect = {executors} chirldrenTaskChargeChange={this.chirldrenTaskChargeChange.bind(this)}/>}>
                  <span>指派负责人</span>
                </Dropdown>
              </div>
            ) : (
                <div className={DrawerContentStyles.excutorsOut}>
                  <Dropdown overlay={<MeusearMutiple listData={data} keyCode={'user_id'}searchName={'name'} currentSelect = {executors} chirldrenTaskChargeChange={this.chirldrenTaskChargeChange.bind(this)}/>}>
                  <div className={DrawerContentStyles.excutorsOut_left} ref={'excutorsOut_left'}>
                    {executors.map((value, key) => {
                      const { avatar, name, user_name, user_id } = value
                      return (
                        <div style={{display: 'flex', alignItems: 'center'}} key={user_id}>
                          {avatar? (
                            <img style={{ width: 20, height: 20, borderRadius: 20, marginRight: 4}} src={avatar} />
                          ) : (
                            <div style={{width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#f5f5f5', marginRight: 4, }}>
                              <Icon type={'user'} style={{fontSize: 12, color: '#8c8c8c'}}/>
                            </div>
                          )}
                          <div style={{overflow: 'hidden', verticalAlign: ' middle', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80, marginRight: 8}}>{name || user_name || '佚名'}</div>
                        </div>
                      )
                    })}
                  </div>
                  </Dropdown>

                  <Dropdown overlay={<ExcutorList listData={executors}/>}>
                    <div className={DrawerContentStyles.excutorsOut_right} style={{backgroundColor: (typeof excutorsOut_left_width ==='number'&& excutorsOut_left_width > 340) || (typeof excutorsOut_left_width_new ==='number'&& excutorsOut_left_width_new > 340) ?'#f5f5f5': ''}}>
                      <Icon type="ellipsis" style={{marginTop: 2, display: (typeof excutorsOut_left_width ==='number'&& excutorsOut_left_width > 340) || (typeof excutorsOut_left_width_new ==='number'&& excutorsOut_left_width_new > 340)?'block': 'none'}} />
                    </div>
                  </Dropdown>
                </div>
            )}
          </div>
            </div>
          </div>

          {/*第三行设置*/}
          <div className={DrawerContentStyles.divContent_1}>
            <div className={DrawerContentStyles.contain_3}>
              {/*负责人*/}
              <div style={{display: 'none'}}>
                {!executor.user_id ? (
                   <div>
                     <span onClick={this.setChargeManIsSelf.bind(this)}>认领</span>&nbsp;<span style={{color: '#bfbfbf'}}>或</span>&nbsp;
                     <Dropdown overlay={<DCMenuItemOne execusorList={data} setList={this.setList.bind(this)} currentExecutor={executor} chirldrenTaskChargeChange={this.chirldrenTaskChargeChange.bind(this)}/>}>
                       <span>指派负责人</span>
                     </Dropdown>
                   </div>
                  ) : (
                  <Dropdown overlay={<DCMenuItemOne execusorList={data} setList={this.setList.bind(this)} currentExecutor={executor} chirldrenTaskChargeChange={this.chirldrenTaskChargeChange.bind(this)}/>}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                      {executor.avatar? (
                        <img style={{ width: 20, height: 20, borderRadius: 20, marginRight: 8}} src={executor.avatar} />
                      ) : (
                        <div style={{width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#f5f5f5', marginRight: 8, }}>
                          <Icon type={'user'} style={{fontSize: 12, color: '#8c8c8c'}}/>
                        </div>
                      )}
                      <div style={{overflow: 'hidden', verticalAlign: ' middle', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80}}>{executor.user_name || '佚名'}</div>
                    </div>
                  </Dropdown>
                  )}
              </div>
              {/*时间*/}
              <div style={{display: 'none'}}>
                <span style={{color: '#bfbfbf'}}>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
              </div>
              <div>
                {start_time && due_time ? (''): (<span style={{color: '#bfbfbf'}}>设置</span>)}
                <span style={{position: 'relative', cursor: 'pointer'}}>&nbsp;{start_time ? timestampToTimeNormal(start_time, '/', true) : '开始' }
                  <DatePicker
                    disabledDate={this.disabledStartTime.bind(this)}
                    onChange={this.startDatePickerChange.bind(this)}
                    placeholder={'开始时间'}
                    format="YYYY/MM/DD HH:mm"
                    showTime={{format: 'HH:mm'}}
                    style={{opacity: 0, width: !start_time? 16 : 100, height: 20, background: '#000000', cursor: 'pointer', position: 'absolute', right: !start_time? 8 : 0, zIndex: 1}} />
                </span>
                 &nbsp;
                {start_time && due_time ?(<span style={{color: '#bfbfbf'}}>-</span>) : (<span style={{color: '#bfbfbf'}}>或</span>)}
                &nbsp;
                <span style={{position: 'relative'}}>{due_time ? timestampToTimeNormal(due_time, '/', true) : '截止时间'}
                  <DatePicker
                    disabledDate={this.disabledDueTime.bind(this)}
                    placeholder={'截止时间'}
                    format="YYYY/MM/DD HH:mm"
                    showTime={{format: 'HH:mm'}}
                    onChange={this.endDatePickerChange.bind(this)}
                    style={{opacity: 0, width: !due_time? 50 : 100, cursor: 'pointer', height: 20, background: '#000000', position: 'absolute', right: 0, zIndex: 1}} />
                </span>
              </div>
              {type === '0'?('') :(
                <div >
                  <span style={{color: '#bfbfbf'}}>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                </div>
              )}
              {type === '0'?('') :(
                <div>
                  {/* <Dropdown overlay={meetingMenu}> */}
                    <span onClick={(e) => this.handleCreateVideoMeeting(card_name, card_id, executors, e)}>发起远程会议</span>
                  {/* </Dropdown> */}
                </div>
              )}

              <div style={{display: 'none'}}>
                {!isSetedAlarm ? (
                  <Dropdown overlay={alarmMenu}>
                    <span>设置提醒</span>
                  </Dropdown>
                ) : (
                  <Dropdown overlay={alarmMenu}>
                     <span>{alarmTime}</span>
                  </Dropdown>
                )}
              </div>
            </div>
          </div>

          {/*富文本*/}
          {!isInEdit ? (
            <div className={DrawerContentStyles.divContent_1} >
              <div style={{marginTop: 20}}>
                <Button size={'small'} style={{fontSize: 12}} onClick={this.goEdit.bind(this)}>编辑描述</Button>
              </div>
              {/*onClick={this.goEdit.bind(this)}*/}
              <div className={DrawerContentStyles.contain_4} onClick={this.descriptionHTML.bind(this)} >
                <div style={{cursor: 'pointer'}} dangerouslySetInnerHTML={{__html: typeof description === 'object'? description.toHTML() :description}}></div>
              </div>
            </div>
          ) : (
            <div>
              <div className={DrawerContentStyles.editorWraper} onClick={this.editWrapClick.bind(this)}>
                <BraftEditor {...editorProps} style={{fontSize: 12}}/>
              </div>
              <div style={{marginTop: 20, textAlign: 'right'}}>
                <Button size={'small'} style={{fontSize: 12, marginRight: 16}} type={'primary'} onClick={this.saveBrafitEdit.bind(this)}>保存</Button>
                <Button size={'small'} style={{fontSize: 12}} onClick={this.quitBrafitEdit.bind(this)}>取消</Button>
              </div>
            </div>
          ) }

          {/*关联*/}
          <div className={DrawerContentStyles.divContent_1}>
            <ContentRaletion
              {...this.props}
              board_id ={board_id}
              link_id={card_id}
              link_local={'3'}
            />
            {/*<div className={DrawerContentStyles.contain_6}>*/}
              {/*<div className={DrawerContentStyles.contain_6_add}>*/}
                {/*<Icon type="plus" style={{marginRight: 4}}/>关联内容*/}
              {/*</div>*/}
            {/*</div>*/}
          </div>

          {/*添加里程碑*/}
          <div className={DrawerContentStyles.divContent_1}>
            <div className={DrawerContentStyles.miletones}>
              {
                milestone_data['id']? (
                  <div className={DrawerContentStyles.miletones_item}>
                    <div className={`${globalStyle.authTheme} ${DrawerContentStyles.miletones_item_logo}`}>&#xe633;</div>
                    <div className={`${globalStyle.global_ellipsis} ${DrawerContentStyles.miletones_item_name}`}>{milestone_data['name']}</div>
                    <Popconfirm title={'取消关联里程碑'} onConfirm={() => this.cancelRelaMiletone({card_id, id: milestone_data['id']})}>
                      <div className={`${globalStyle.authTheme} ${DrawerContentStyles.miletones_item_delete}`}>&#xe70f;</div>
                    </Popconfirm>
                  </div>
                ) : (
                  <Dropdown overlay={this.renderMiletonesMenu()}>
                    <div className={DrawerContentStyles.miletones_item_add} style={{marginTop: 8, width: 100}}>
                      <Icon type="plus" style={{marginRight: 4}}/>里程碑
                    </div>
                  </Dropdown>
                )
              }

            </div>
          </div>

          {/*标签*/}
          <div className={DrawerContentStyles.divContent_1}>
            <div className={DrawerContentStyles.contain_5}>
                {label_data.map((value, key) => {
                  let flag = false //如果项目列表
                  for(let i = 0; i < boardTagList.length; i++) {
                    if(value['label_id'] == boardTagList[i]['id']) {
                      flag = true
                      break;
                    }
                  }
                  const { label_color = '90,90,90' } = value
                  return(
                    flag && (
<Tag closable
                                 visible={true}
                                 style={{marginTop: 8, color: `rgba(${label_color})`, backgroundColor: `rgba(${label_color},0.1)`, border: `1px solid rgba(${label_color},1)`}}
                                 onClose={this.tagClose.bind(this, {label_id: value.label_id, label_name: value.label_name, key})}
                                 key={key} >{value.label_name}</Tag>
)
                  )
                })}

              <div>
                {!isInAddTag ? (
                  <div className={DrawerContentStyles.contain_5_add} style={{marginTop: 8, width: 100}} onClick={this.addTag.bind(this)}>
                    <Icon type="plus" style={{marginRight: 4}}/>标签
                  </div>
                ) : (
                  <Dropdown visible={this.state.tagDropdownVisible}
                            overlay={<TagDropDown {...this.props} tagDropItemClick={this.tagDropItemClick.bind(this)} tagInputValue={this.state.tagInputValue} />} >
                    <div style={{marginTop: 8, position: 'relative', width: 'auto', height: 'auto'}}>
                    <Input autoFocus={true} placeholder={'标签'}
                           style={{height: 24, paddingRight: 20, fontSize: 14, color: '#8c8c8c', minWidth: 62, maxWidth: 100}}
                           onChange={this.setTagInputValue.bind(this)}
                           // onBlur={this.tagAddComplete.bind(this)}
                           maxLength={8}
                           onPressEnter={this.tagAddComplete.bind(this)} />
                      <Icon type={'close'} style={{position: 'absolute', fontSize: 14, cursor: 'pointer', right: 6, top: 4}} onClick={this.quitAddTag.bind(this)}></Icon>
                    </div>
                  </Dropdown>
                ) }
              </div>

            </div>
          </div>
          {child_data.length?(
            <div className={DrawerContentStyles.divContent_1}>
              <div className={DrawerContentStyles.spaceLine}></div>
            </div>
          ):('')}


          {/*添加子任务*/}
          <DCAddChirdrenTask {...this.props}/>

          {/*上传任务附件*/}
          <div className={`${DrawerContentStyles.divContent_1} ${DrawerContentStyles.attach_file_list_out}`}>
            <Upload {...uploadProps}>
              <Button size={'small'} style={{fontSize: 12, marginTop: 16, }} >
                <Icon type="upload" />上传{currentNounPlanFilterName(TASKS)}附件
              </Button>
            </Upload>
            <div className={DrawerContentStyles.attach_file_list}>
              {attachment_fileList.map((value, key) => {
                if(!value) return null
                const { name, lastModified, create_time, file_id, uid} = value
                const now_time = new Date().getTime()
                return(
                  <div key={file_id || uid} className={DrawerContentStyles.attach_file_item} onClick={this.attachmentItemPreview.bind(this, value)}>
                    <div className={`${globalStyle.authTheme} ${DrawerContentStyles.link_pre}`}>&#xe632;</div>
                    <div className={DrawerContentStyles.attach_file_item_name}>{name}</div>
                    <div className={DrawerContentStyles.attach_file_time}>{timestampToTimeNormal(create_time || now_time, '/', true)}</div>
                    <div className={`${globalStyle.authTheme} ${DrawerContentStyles.link_opera}`} onClick={this.attachmentItemOpera.bind(this, { type: 'download', data: value})}>&#xe7f1;</div>
                    <div className={`${globalStyle.authTheme} ${DrawerContentStyles.link_opera}`} onClick={this.attachmentItemOpera.bind(this, { type: 'remove', data: value})}>&#xe70f;</div>
                  </div>
                )
              })}
            </div>
          </div>

          <PreviewFileModal {...this.props} isUsable={this.state.isUsable} setPreivewProp={this.setPreivewProp.bind(this)} previewFileType={this.state.previewFileType} previewFileSrc={this.state.previewFileSrc} modalVisible={this.state.previewFileModalVisibile} setPreviewFileModalVisibile={this.setPreviewFileModalVisibile.bind(this)} />
          <div className={DrawerContentStyles.divContent_1}>
            <div className={DrawerContentStyles.spaceLine} ></div>
          </div>
        </div>
        {/*评论*/}
        <div className={DrawerContentStyles.divContent_2} style={{marginTop: 20}}>
          <Comment {...this.props} leftSpaceDivWH={26}></Comment>
        </div>
        <div style={{height: 100}}></div>
      </div>
    )
  }

}

export default DrawContent
