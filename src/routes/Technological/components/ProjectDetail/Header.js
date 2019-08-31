/*eslint-disable*/
import React from 'react'
import indexStyle from './index.less'
import globalStyles from '../../../../globalset/css/globalClassName.less'

import {
  MESSAGE_DURATION_TIME, NOT_HAS_PERMISION_COMFIRN, ORG_TEAM_BOARD_JOIN, PROJECT_FILES_FILE_INTERVIEW,
  PROJECT_TEAM_CARD_INTERVIEW,
  UPLOAD_FILE_SIZE, PROJECT_TEAM_BOARD_EDIT, PROJECT_TEAM_BOARD_ARCHIVE, PROJECT_TEAM_BOARD_DELETE,PROJECT_TEAM_BOARD_MEMBER,
  ORG_TEAM_BOARD_QUERY, PROJECT_FLOW_FLOW_ACCESS,
  PROJECT_FILES_FILE_UPLOAD, PROJECT_FILES_FILE_DOWNLOAD, PROJECT_FILES_FOLDER, ORG_UPMS_ORGANIZATION_DELETE, PROJECT_FILES_FILE_DELETE, PROJECT_FILES_FILE_EDIT,
} from '../../../../globalset/js/constant'
import { Icon, Menu, Dropdown, Tooltip, Modal, Checkbox, Upload, Button, message, Input } from 'antd'
import ShowAddMenberModal from '../Project/ShowAddMenberModal'
import {REQUEST_DOMAIN_FILE} from "../../../../globalset/js/constant";
import Cookies from 'js-cookie'
import MenuSearch from '../TecPublic/MenuSearch'
import {checkIsHasPermissionInBoard, checkIsHasPermission} from "../../../../utils/businessFunction";
import {ORGANIZATION, TASKS, FLOWS, DASHBOARD, PROJECTS, FILES, MEMBERS, CATCH_UP} from "../../../../globalset/js/constant";
import {currentNounPlanFilterName} from "../../../../utils/businessFunction";
import AddModalForm from './components/AddModalForm'
import DetailInfo from './DetailInfo'
import VisitControl from './../../components/VisitControl/index'
import {toggleContentPrivilege, setContentPrivilege, removeContentPrivilege} from './../../../../services/technological/project'
import LcbInHeader from './components/LcbInHeader/index'
import { setUploadHeaderBaseInfo } from '@/utils/businessFunction'

let is_starinit = null


export default class Header extends React.Component {
  state = {
    isInitEntry: true, // isinitEntry isCollection用于处理收藏
    isCollection: false,
    ShowAddMenberModalVisibile: false,
    AddModalFormVisibile: false,
    ellipsisShow: false, //是否出现...菜单
    dropdownVisibleChangeValue: false, //是否出现...菜单辅助判断标志
    //修改项目名称所需state
    localBoardName: '',
    isInEditBoardName: false,
    isShouldBeDropdownVisible: false,
  }
  componentWillMount () {
    //设置默认项目名称
    this.initSet(this.props)
  }
  componentWillReceiveProps (nextProps) {
    this.initSet(nextProps)
  }
  //初始化根据props设置state
  initSet(props) {
    const { datas: { projectDetailInfoData = {} } } = props.model
    const { board_name } = projectDetailInfoData
    this.setState({
      localBoardName: board_name
    })
  }
  //项目操作----------------start
  //设置项目名称---start
  setIsInEditBoardName() {
    this.setState({
      isInEditBoardName: !this.state.isInEditBoardName,
    })
  }
  localBoardNameChange(e) {
    this.setState({
      localBoardName: e.target.value
    })
  }
  editBoardNameComplete(e) {
    this.setIsInEditBoardName()
    const { datas: { projectDetailInfoData = {} } } = this.props.model
    const { board_id } = projectDetailInfoData
    const { board_name } = projectDetailInfoData
    const { localBoardName } = this.state
    if(localBoardName == board_name) {
      return false
    }
    if(!localBoardName) {
      this.setState({
        localBoardName: board_name
      })
      return false
    }
    this.props.updateProject({
      board_id: board_id,
      name: this.state.localBoardName
    })
  }
  //设置项目名称---end

  setProjectInfoDisplay() {
    this.props.updateDatas({ projectInfoDisplay: !this.props.model.datas.projectInfoDisplay, isInitEntry: true })
  }
  gobackToProject(){
    // window.history.go(-1)
    const defferBoardDetailRoute = localStorage.getItem('defferBoardDetailRoute')
    if(defferBoardDetailRoute) {
      this.props.routingJump(defferBoardDetailRoute)
    } else {
      this.props.routingJump('/technological/project')
    }
  }
  //出现confirm-------------start
  setIsSoundsEvrybody(e){
    this.setState({
      isSoundsEvrybody: e.target.checked
    })
  }
  confirm(board_id) {
    const that = this
    const { datas: { projectDetailInfoData = {} } } = this.props.model
    const { org_id } = projectDetailInfoData
    if(!checkIsHasPermission(ORG_TEAM_BOARD_JOIN, org_id)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    Modal.confirm({
      title: `确认要退出该${currentNounPlanFilterName(PROJECTS)}吗？`,
      content: <div style={{color: 'rgba(0,0,0, .8)', fontSize: 14}}>
        <span >退出后将无法获取该{currentNounPlanFilterName(PROJECTS)}的相关动态</span>
        {/*<div style={{marginTop:20,}}>*/}
        {/*<Checkbox style={{color:'rgba(0,0,0, .8)',fontSize: 14, }} onChange={this.setIsSoundsEvrybody.bind(this)}>通知项目所有参与人</Checkbox>*/}
        {/*</div>*/}
      </div>,
      zIndex: 2000,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        that.props.quitProject({ board_id})
      }
    });
  }
  confirm_2(board_id, type) {
    const that = this
    let defineNoun = '操作'
    switch (type){
      case '0':
        defineNoun='删除'
        break
      case '1':
        defineNoun='归档'
        break
      default:
        break
    }
    Modal.confirm({
      title: `确认要${defineNoun}该${currentNounPlanFilterName(PROJECTS)}吗？`,
      zIndex: 2000,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        if(type ==='1'){
          that.props.archivedProject({board_id, is_archived: '1'})
        }else if(type === '0') {
          that.props.deleteProject(board_id)
        }
      }
    });
  }

  //出现confirm-------------end
  //添加项目组成员操作
  setShowAddMenberModalVisibile() {
    this.setState({
      ShowAddMenberModalVisibile: !this.state.ShowAddMenberModalVisibile
    })
  }
  setAddModalFormVisibile() {
    this.setState({
      AddModalFormVisibile: !this.state.AddModalFormVisibile
    })
  }
  //菜单按钮点击
  handleMenuClick(board_id, e ) {
    e.domEvent.stopPropagation();
    this.setState({
      ellipsisShow: false,
      dropdownVisibleChangeValue: false
    })
    const { key } = e
    switch (key) {
      case '1':
        if(!checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MEMBER)){
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        this.setShowAddMenberModalVisibile()
        break
      case '2':
        if(!checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_ARCHIVE)){
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        this.confirm_2(board_id, '1')
        break
      case '3':
        if(!checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_DELETE)){
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        this.confirm_2(board_id, '0')
        // this.props.deleteProject(board_id)
        break
      case '4':
        this.confirm(board_id )
        break
      case '5':
        if(!checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_EDIT)){
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        this.setAddModalFormVisibile()
        break
      default:
        return
    }
  }
  //收藏
  starClick({ board_id }, e) {
    const { datas: { projectDetailInfoData = {} } } = this.props.model
    const { org_id } = projectDetailInfoData
    const { dispatch } = this.props
    // if(!checkIsHasPermission(ORG_TEAM_BOARD_QUERY, org_id)){
    //   message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
    //   return false
    // }
    e.stopPropagation();
    this.setState({
      isInitEntry: false,
    }, function () {
      this.setState({
        isCollection: is_starinit === '1' ? false : this.state.isInitEntry ? false : !this.state.isCollection,
        starOpacity: 1
      }, function () {
        if(this.state.isCollection) {
          dispatch({
            type: 'projectDetail/collectionProject',
            payload: {
              org_id, board_id
            }
          })
        }else{
          dispatch({
            type: 'projectDetail/cancelCollection',
            payload: {
              org_id, board_id
            }
          })
        }
      })
    })
  }
  //...菜单变化点击
  ellipsisClick(e) {
    e.stopPropagation();
  }
  setEllipsisShow() {
    this.setState({
      ellipsisShow: true
    })
  }
  setEllipsisHide() {
    this.setState({
      ellipsisShow: false
    })
  }
  toggleDropdownVisible = () => {
    const {dropdownVisibleChangeValue} = this.state
    this.setState({
      dropdownVisibleChangeValue: !dropdownVisibleChangeValue,
    })
  }
  onDropdownVisibleChange(visible){
    const {isShouldBeDropdownVisible} = this.state
    if(isShouldBeDropdownVisible) return
    this.setState({
      dropdownVisibleChangeValue: visible,
    })
  }
  //项目操作---------------end

  //右方部分点击-----------------start
  //右方app应用点击
  appClick(key) {
    if(key === '2') {
      //流程
      if(!checkIsHasPermissionInBoard(PROJECT_FLOW_FLOW_ACCESS)){
        message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
        return false
      }
    }else if(key === '3') { // 任务
      if(!checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_INTERVIEW)){
        message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
        return false
      }
    }else if(key === '4'){ //文档
      if(!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_INTERVIEW)){
        message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
        return false
      }
    }else {

    }

    this.props.updateDatas({
      appsSelectKey: key
    })
    this.props.appsSelect({
      appsSelectKey: key
    })
  }
  //文档操作----start
  quitOperateFile() {
    this.props.updateDatasFile({
      selectedRowKeys: [],
    })
  }
  reverseSelection() {
    const {datas: { selectedRowKeys = [], fileList = []}} = this.props.model
    const newSelectedRowKeys = []
    for (let i = 0; i < fileList.length; i++) {
      for (let val of selectedRowKeys) {
        if(val !== i){
          // console.log(i)
          newSelectedRowKeys.push(i)
        }
      }
    }
    this.props.updateDatasFile({selectedRowKeys: newSelectedRowKeys})
  }
  createDirectory() {
    if(!checkIsHasPermissionInBoard(PROJECT_FILES_FOLDER)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const { datas: { fileList = [], filedata_1 = [], isInAddDirectory = false } } = this.props.model
    if(isInAddDirectory) { //正在创建的过程中不能添加多个
      return false
    }
    const obj = {
      file_id: '',
      file_name: '',
      file_size: '-',
      update_time: '-',
      creator: `-`,
      type: '1',
      isInAdd: true
    }
    fileList.unshift(obj)
    filedata_1.unshift(obj)
    this.props.updateDatasFile({fileList, filedata_1, isInAddDirectory: true})
  }
  collectionFile() {

  }
  downLoadFile() {
    if(!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DOWNLOAD)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const { datas: { fileList, selectedRowKeys } } = this.props.model
    let chooseArray = []
    for(let i=0; i < selectedRowKeys.length; i++ ){
      chooseArray.push(fileList[selectedRowKeys[i]].file_resource_id)
    }
    const ids = chooseArray.join(',')
    this.props.fileDownload({ids})

    //将要进行多文件下载的mp3文件地址，以组数的形式存起来（这里只例了3个地址）
    // let mp3arr = ["http://pe96wftsc.bkt.clouddn.com/ea416183ad91220856c8ff792e5132e1.zip?e=1536660365&token=OhRq8qrZN_CtFP_HreTEZh-6KDu4BW2oW876LYzj:XK9eRCWcG8yDztiL7zct2jrpIvc=","http://pe96wftsc.bkt.clouddn.com/2fc83d8439ab0d4507dc7154f3d50d3.pdf?e=1536659325&token=OhRq8qrZN_CtFP_HreTEZh-6KDu4BW2oW876LYzj:DGertCGKCr3Y407F6fY9ZGgkP4M=", "http://pe96wftsc.bkt.clouddn.com/ec611c887680f9264bb5db8e4cb33141.docx?e=1536659379&token=OhRq8qrZN_CtFP_HreTEZh-6KDu4BW2oW876LYzj:9IkALD1DjOBvQtv3uAvtzk5y694=",];

    // const download = (name, href) => {
    //   var a = document.createElement("a"), //创建a标签
    //     e = document.createEvent("MouseEvents"); //创建鼠标事件对象
    //   e.initEvent("click", false, false); //初始化事件对象
    //   a.href = href; //设置下载地址
    //   a.download = name; //设置下载文件名
    //   a.dispatchEvent(e); //给指定的元素，执行事件click事件
    // }
    // let iframes = ''
    // for (let index = 0; index < mp3arr.length; index++) {
      // const iframe = '<iframe style="display: none;" class="multi-download"  src="'+mp3arr[index]+'"></iframe>'
      // iframes += iframe
      // window.open(mp3arr[index])
      // download('第'+ index +'个文件', mp3arr[index]);
    // }
    // this.setState({
    //   iframes
    // })
  }
  moveFile() {
    if(!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_EDIT)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    this.props.updateDatasFile({
      copyOrMove: '0', //copy是1
      openMoveDirectoryType: '1',
      moveToDirectoryVisiblie: true
    })
  }
  copyFile() {
    if(!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_EDIT)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    this.props.updateDatasFile({
      copyOrMove: '1', //copy是1
      openMoveDirectoryType: '1',
      moveToDirectoryVisiblie: true
    })
  }
  deleteFile() {
    if(!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DELETE)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const { datas: { fileList, selectedRowKeys, projectDetailInfoData= {} } } = this.props.model
    const { board_id } = projectDetailInfoData
    let chooseArray = []
    for(let i=0; i < selectedRowKeys.length; i++ ){
      chooseArray.push({type: fileList[selectedRowKeys[i]].type, id: fileList[selectedRowKeys[i]].file_id})
    }
    this.props.fileRemove({
      board_id,
      arrays: JSON.stringify(chooseArray),
    })
  }
  //文档操作 ---end

  //任务操作---start
  //查询列表，改变方式
  handleaskAppMenuClick(board_id, e) {
    e.domEvent.stopPropagation();
    const { key } = e
    this.props.updateDatasTask({
      getTaskGroupListArrangeType: key
    })
    this.props.getTaskGroupList({
      type: '2',
      board_id: board_id,
      arrange_type: key,
      operateType: '1'
    })
  }
  //任务操作---end

  //团队展示发布编辑
  editTeamShowPreview() {
    const that = this
    this.props.updateDatas({
      editTeamShowPreview: true
    })
    setTimeout(function () { //延迟获取
      const html = document.getElementById('editTeamShow').innerHTML
      // console.log(html)
    }, 200)
  }
  editTeamShowSave() {
    this.props.updateDatas({
      editTeamShowSave: true
    })
    setTimeout(function () { //延迟获取
      const html = document.getElementById('editTeamShow').innerHTML
      // console.log(html)
    }, 200)
  }
  //右方部分点击-----------------end
  getFieldFromProjectDetailInfoData = (...fields) => {
    const {datas: { projectDetailInfoData = {}}} = this.props.model
    if(!fields.length) return {}
    return fields.reduce((acc, curr) => {
      let fieldObj = {}
      curr in projectDetailInfoData ? fieldObj[curr] = projectDetailInfoData[curr] : null
      return Object.assign({}, acc, fieldObj)
    }, {})
  }
  handleVisitControlPopoverVisible = (flag) => {
      if(!flag) {
        this.setState({
          dropdownVisibleChangeValue: false
        })
      }
      this.setState({
        isShouldBeDropdownVisible: flag,
      })
  }
  handleVisitControlChange = flag => {
    const {is_privilege, board_id} = this.getFieldFromProjectDetailInfoData('is_privilege', 'board_id')
    const toBool = str => !!Number(str)
    const is_privilege_bool = toBool(is_privilege)
    if(flag === is_privilege_bool) {
      return
    }
    //toggle权限
    const data = {
      content_id: board_id,
      content_type: 'board',
      is_open: flag ? 1 : 0
    }
    toggleContentPrivilege(data).then(res => {
      if(res && res.code === '0') {
          this.visitControlUpdateCurrentProjectData(board_id)
        } else {
          message.error('设置内容权限失败，请稍后再试')
        }
    })
  }
  handleVisitControlRemoveContentPrivilege = id => {
    const {board_id, board_id: content_id} = this.getFieldFromProjectDetailInfoData('board_id')
    removeContentPrivilege({
      content_id,
      content_type: 'board',
      user_id: id
    }).then(res => {
      const isResOk = res => res && res.code === '0'
      if(isResOk(res)) {
        message.success('移出用户成功')
        this.visitControlUpdateCurrentProjectData(board_id)
      } else {
        message.error('移出用户失败')
      }
    })
  }
  handleVisitControlChangeContentPrivilege = (id, type) => {
    this.handleSetContentPrivilege(id, type)
  }
  handleClickedOtherPersonListOperatorItem = (id, type) => {
    if(type === 'remove') {
      this.handleVisitControlRemoveContentPrivilege(id)
    } else {
      this.handleSetContentPrivilege(id, type, '更新用户控制类型失败')
    }
    console.log(id, type, 'handleClickedOtherPersonListOperatorItem')
  }
  handleSetContentPrivilege = (ids, type, errorText='访问控制添加人员失败，请稍后再试') => {
    const {board_id, board_id: content_id} = this.getFieldFromProjectDetailInfoData('board_id')
    const content_type = 'board'
    const privilege_code = type
    const user_ids = ids
    setContentPrivilege({
      content_id,
      content_type,
      privilege_code,
      user_ids
    }).then(res => {
      if(res && res.code === '0') {
        this.visitControlUpdateCurrentProjectData(board_id)
      } else {
        message.error(errorText)
      }
    })
  }
  handleVisitControlAddNewMember = (ids = []) => {
    if(!ids.length) return
    const user_ids = ids.reduce((acc, curr) => {
      if(!acc) return curr
      return `${acc},${curr}`
    }, '')
    this.handleSetContentPrivilege(user_ids, 'read')
  }
  async visitControlUpdateCurrentProjectData(board_id) {
    await this.props.updateProject({
      board_id
    })

  }
  render() {
    const that = this
    const {datas: { projectInfoDisplay, projectDetailInfoData = {}, appsSelectKey, selectedRowKeys = [], currentParrentDirectoryId, processInfo = {}, getTaskGroupListArrangeType = '1'}} = this.props.model
    const { ellipsisShow, dropdownVisibleChangeValue, isInitEntry, isCollection, localBoardName, isInEditBoardName } = this.state
    const { board_name, board_id, is_star, is_create, app_data = [], folder_id, is_privilege, data: projectParticipant, privileges } = projectDetailInfoData
    const processName = processInfo.name
    is_starinit = is_star

    const visitControlOtherPersonOperatorMenuItem = [
      {
        key: '可访问',
        value: 'read'
      },
      {
        key: '移出',
        value: 'remove',
        style: {
          color: '#f73b45'
        }
      }
    ]
    //项目操作菜单
    const menu = (
      <Menu onClick={this.handleMenuClick.bind(this, board_id)}>
        {checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_EDIT) && (
          <Menu.Item key={'5'} style={{textAlign: 'center', padding: 0, margin: 0}}>
            <div className={indexStyle.elseProjectMemu}>
              编辑应用
            </div>
          </Menu.Item>
        )}
        {checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MEMBER) && (
          <Menu.Item key={'1'} style={{textAlign: 'center', padding: 0, margin: 0}}>
            <div className={indexStyle.elseProjectMemu}>
              邀请成员加入
            </div>
          </Menu.Item>
        )}
        {<Menu.Item key={'99'} style={{textAlign: 'center', padding: 0, margin: 0}}>
            <div className={indexStyle.elseProjectMemu} style={{marginLeft: '-35px'}}>
            <VisitControl
              popoverPlacement={'leftTop'}
              isPropVisitControl={is_privilege === '0' ? false : true}
              principalList={projectParticipant}
              principalInfo='位项目参与人'
              otherPrivilege={privileges}
              otherPersonOperatorMenuItem={visitControlOtherPersonOperatorMenuItem}
              removeMemberPromptText='移出后用户将不能访问此项目'
              handleVisitControlChange={this.handleVisitControlChange}
              handleVisitControlPopoverVisible={this.handleVisitControlPopoverVisible}
              handleClickedOtherPersonListOperatorItem={this.handleClickedOtherPersonListOperatorItem}
              handleAddNewMember={this.handleVisitControlAddNewMember}
              >
              <span>访问控制&nbsp;&nbsp;<span className={globalStyles.authTheme}>&#xe7eb;</span></span>
            </VisitControl>
            </div>
          </Menu.Item>}
        {/*<Menu.Item key={'2'} style={{textAlign: 'center',padding:0,margin: 0}}>*/}
          {/*<div className={indexStyle.elseProjectMemu}>*/}
            {/*{currentNounPlanFilterName(PROJECTS)}归档*/}
          {/*</div>*/}
        {/*</Menu.Item>*/}
        <Menu.Item key={'3'} style={{textAlign: 'center', padding: 0, margin: 0}}>
          <div className={indexStyle.elseProjectMemu}>
            删除{currentNounPlanFilterName(PROJECTS)}
          </div>
        </Menu.Item>
        {is_create !== '1'? (
          <Menu.Item key={'4'} style={{textAlign: 'center', padding: 0, margin: 0}}>
            <div className={indexStyle.elseProjectDangerMenu}>
              退出{currentNounPlanFilterName(PROJECTS)}
            </div>
          </Menu.Item>
        ) : ('')}

      </Menu>
    );
    //文件上传
    const uploadProps = {
      name: 'file',
      withCredentials: true,
      multiple: true,
      action: `${REQUEST_DOMAIN_FILE}/file/upload`,
      data: {
        board_id,
        folder_id: currentParrentDirectoryId,
        type: '1',
        upload_type: '1'
      },
      headers: {
        Authorization: Cookies.get('Authorization'),
        refreshToken: Cookies.get('refreshToken'),
        ...setUploadHeaderBaseInfo({}),
      },
      beforeUpload(e) {
        if(!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPLOAD)){
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        if(e.size == 0) {
          message.error(`不能上传空文件`)
          return false
        }else if(e.size > UPLOAD_FILE_SIZE * 1024 * 1024) {
          message.error(`上传文件不能文件超过${UPLOAD_FILE_SIZE}MB`)
          return false
        }
        let loading = message.loading('正在上传...', 0)
      },
      onChange({ file, fileList, event }) {
        if (file.status === 'uploading') {

        }else{
          // message.destroy()
        }
        if (file.status === 'done') {

          if(file.response && file.response.code == '0') {
            message.success(`上传成功。`);
            that.props.getFileList({folder_id: currentParrentDirectoryId})
          } else {
            message.error(file.response && file.response.message || '上传失败');
          }
        } else if (file.status === 'error') {
          message.error(`上传失败。`);
          setTimeout(function () {
            message.destroy()
          }, 2000)
        }
      },
    };

    //任务列表查询方式
    const taskAppMenu = (
      <Menu onClick={this.handleaskAppMenuClick.bind(this, board_id)}>
        <Menu.Item key={'1'} style={{textAlign: 'center', padding: 0, margin: 0}}>
          <div className={indexStyle.elseProjectMemu}>
            按分组名称排序
          </div>
        </Menu.Item>
        <Menu.Item key={'2'} style={{textAlign: 'center', padding: 0, margin: 0}}>
          <div className={indexStyle.elseProjectMemu}>
            按执行人排序
          </div>
        </Menu.Item>
        <Menu.Item key={'3'} style={{textAlign: 'center', padding: 0, margin: 0}}>
          <div className={indexStyle.elseProjectMemu}>
            按标签排序
          </div>
        </Menu.Item>
      </Menu>
    )
    const filterGetTaskGroupListType = (getTaskGroupListArrangeType) => {
      let name = ''
      switch (getTaskGroupListArrangeType) {
        case '1':
          name = '按分组名称排序'
          break
        case '2':
          name = '按执行人排序'
          break
        case '3':
          name = '按标签排序'
          break
        default:
          name = '按分组名称排序'
          break
      }
      return name
    }

    const appsOperator = (appsSelectKey) => { //右方操作图标
      let operatorConent = <div style={{ color: '#ffffff'}}>s</div>
      switch (appsSelectKey) {
        case '2':
          operatorConent = checkIsHasPermissionInBoard(PROJECT_FLOW_FLOW_ACCESS) && (
            <div style={{color: '#595959'}}>
              {/*<Dropdown overlay={<MenuSearch {...this.props}/>}>*/}
                 {/*<span>{processName || `请选择${currentNounPlanFilterName(FLOWS)}`}<Icon type="down" style={{fontSize: 14, color: '#595959'}}/></span>*/}
              {/*</Dropdown>*/}
              <Icon type="appstore-o" style={{fontSize: 14, marginTop: 18, marginLeft: 16, color: '#ffffff'}}/>
              {/*<Icon type="appstore-o" style={{fontSize: 14, marginTop: 18, marginLeft: 16}}/>*/}
            </div>
          )
          break
        case '3':
          operatorConent = checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_INTERVIEW) && (
            <div>
              <Dropdown overlay={taskAppMenu}>
              <span style={{fontSize: 14, color: '#595959'}}>{filterGetTaskGroupListType(getTaskGroupListArrangeType)} <Icon type="down" /></span>
              </Dropdown>
              <Icon type="appstore-o" style={{fontSize: 14, marginTop: 18, marginLeft: 14}}/>
              {/*<Icon type="appstore-o" style={{fontSize:14,marginTop:18,marginLeft:16}}/>*/}
              {/*<Icon type="appstore-o" style={{fontSize:14,marginTop:18,marginLeft:16}}/>*/}
            </div>
          )
          break
        case '4':
          if(selectedRowKeys.length) { //选择文件会改变
            operatorConent = checkIsHasPermissionInBoard(PROJECT_FILES_FILE_INTERVIEW) && (
              <div style={{display: 'flex', alignItems: 'center', color: '#595959' }} className={indexStyle.fileOperator}>
                <div dangerouslySetInnerHTML={{__html: this.state.iframes}}></div>
                <div style={{marginTop: 18}}>
                  <span style={{color: '#8c8c8c'}}>
                    已选择{selectedRowKeys.length}项
                  </span>
                  <span style={{marginLeft: 14}} onClick={this.quitOperateFile.bind(this)}>
                    取消
                  </span>
                  {/*<span style={{marginLeft:14}} onClick={this.reverseSelection.bind(this)}>*/}
                    {/*反选*/}
                  {/*</span>*/}
                </div>
                {/*<Button style={{height: 24, marginTop:16,marginLeft:14}} >*/}
                  {/*<Icon type="star" />收藏*/}
                {/*</Button>*/}
                <Button style={{height: 24, marginTop: 16, marginLeft: 14}} onClick={this.downLoadFile.bind(this)} >
                  <Icon type="download" />下载
                </Button>
                <Button style={{height: 24, marginTop: 16, marginLeft: 14}} onClick={this.moveFile.bind(this)}>
                  <Icon type="export" />移动
                </Button>
                <Button style={{height: 24, marginTop: 16, marginLeft: 14}} onClick={this.copyFile.bind(this)}>
                  <Icon type="copy" />复制
                </Button>
                <Button style={{height: 24, marginTop: 16, marginLeft: 14, backgroundColor: '#f5f5f5', color: 'red'}} onClick={this.deleteFile.bind(this)}>
                  <Icon type="delete" />移动到回收站
                </Button>
                <div>
                  <Icon type="appstore-o" style={{fontSize: 14, marginTop: 20, marginLeft: 14}}/>
                  {/*<Icon type="appstore-o" style={{fontSize:14,marginTop:20,marginLeft:16}}/>*/}
                </div>
              </div>
            )
          }else {
            operatorConent = checkIsHasPermissionInBoard(PROJECT_FILES_FILE_INTERVIEW) && (
              <div style={{display: 'flex', alignItems: 'center', }}>
                {checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPLOAD) && (
                  <Upload {...uploadProps} showUploadList={false}>
                    <Button style={{height: 24, marginTop: 16, }} type={'primary'}>
                      <Icon type="upload" />上传
                    </Button>
                  </Upload>
                )}

                {checkIsHasPermissionInBoard(PROJECT_FILES_FOLDER) && (
                  <Button style={{height: 24, marginTop: 16, marginLeft: 14}} onClick={this.createDirectory.bind(this)}>
                    <Icon type="plus" />创建文件夹
                  </Button>
                )}

                <div>
                  <Icon type="appstore-o" style={{fontSize: 14, marginTop: 20, marginLeft: 14}}/>
                  {/*<Icon type="appstore-o" style={{fontSize:14,marginTop:20,marginLeft:16}}/>*/}
                </div>
              </div>
            )
          }
          break;
        default:
          // operatorConent = (
          //   <div style={{display: 'flex',alignItems: 'center', }}>
          //     <Button  style={{height: 24, marginTop:16,}} onClick={this.editTeamShowPreview.bind(this)}>预览</Button>
          //     <Button type={'primary'}  style={{height: 24, marginTop:16,marginLeft:14}} onClick={this.editTeamShowSave.bind(this)}>保存</Button>
          //   </div>
          // )
          break
      }
      return operatorConent
    }

    const cancelStarProjet = (
      <i className={globalStyles.authTheme}
         onClick={this.starClick.bind(this, { board_id })}
         style={{margin: '0 0 0 8px', color: '#FAAD14 ', fontSize: 20}}>&#xe70e;</i>
    )
    const starProject = (
      <i className={globalStyles.authTheme}
         onClick={this.starClick.bind(this, { board_id })}
         style={{margin: '0 0 0 8px', color: '#FAAD14 ', fontSize: 20}}>&#xe6f8;</i>
    )

    return (
      // style={{position:'fixed',width: '100%', zIndex: 1, backgroundColor: '#ffffff'}}
      <div className={`${globalStyles.page_min_width} ${indexStyle.headoutMaskDown}`} >
      <div className={indexStyle.headout}>
         <div className={indexStyle.left}>
           <div className={indexStyle.left_top} onMouseLeave={this.setEllipsisHide.bind(this)} onMouseOver={this.setEllipsisShow.bind(this)}>
              <Icon type="left-square-o" className={indexStyle.projectNameIcon} onClick={this.gobackToProject.bind(this)}/>
             {/*<span className={indexStyle.projectName}>{board_name}</span> 原来项目名称*/}
             {!isInEditBoardName?(
               <span className={indexStyle.projectName} onClick={this.setIsInEditBoardName.bind(this)}>{localBoardName}</span>
             ) : (
               <Input value={localBoardName}
                      className={indexStyle.projectName}
                      autoFocus
                      onChange={this.localBoardNameChange.bind(this)}
                      onPressEnter={this.editBoardNameComplete.bind(this)}
                      onBlur={this.editBoardNameComplete.bind(this)} />
             )}
             {isInitEntry ? (is_star === '1'? (starProject):(cancelStarProjet)):(isCollection? (starProject):(cancelStarProjet))}

             {/*<Icon className={indexStyle.star}*/}
                     {/*onClick={this.starClick.bind(this, board_id)}*/}
                     {/*type={isInitEntry ? (is_star === '1'? 'star':'star-o'):(isCollection? 'star':'star-o')}*/}
                     {/*style={{margin: '6px 0 0 8px',fontSize: 20,color: '#FAAD14'}} />*/}
               <Dropdown overlay={menu} trigger={['click']} visible={dropdownVisibleChangeValue} onVisibleChange={this.onDropdownVisibleChange.bind(this)}>
                 <Icon type="ellipsis" style={{fontSize: 24, margin: '4px 0 0 8px', display: (ellipsisShow || dropdownVisibleChangeValue) ? 'inline-block': 'inline-block'}} onClick={this.toggleDropdownVisible} />
               </Dropdown>
           </div>
           <div className={indexStyle.lcb_boardinfo_out}>
             <div className={indexStyle.displayProjectinfo} onClick={this.setProjectInfoDisplay.bind(this)}>
               {currentNounPlanFilterName(PROJECTS)}信息
               {/*{projectInfoDisplay ? (*/}
               {/*<span><Icon type="left" style={{marginRight: 2}}/>收起{currentNounPlanFilterName(PROJECTS)}信息</span>*/}
               {/*):(*/}
               {/*<span>查看{currentNounPlanFilterName(PROJECTS)}信息<Icon type="right" style={{marginLeft: 2}}/></span>*/}
               {/*)}*/}
             </div>
             <div className={indexStyle.spaceLine}></div>
             <div>
               <LcbInHeader />
             </div>
           </div>

         </div>
        <div className={indexStyle.right}>
          <div className={indexStyle.right_top} >
            {app_data.map((value, itemkey) => {
              const { app_name, key, app_code } = value
              let flag = true
              switch (key) {
                case '2':
                  flag = checkIsHasPermissionInBoard(PROJECT_FLOW_FLOW_ACCESS)
                  break
                case '3':
                  flag = checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_INTERVIEW)
                  break
                case '4':
                  flag = checkIsHasPermissionInBoard(PROJECT_FILES_FILE_INTERVIEW)
                  break
              }
              return flag && (
                <div className={appsSelectKey === key?indexStyle.appsSelect : indexStyle.appsNoSelect} key={itemkey} onClick={this.appClick.bind(this, key)}>{app_code && currentNounPlanFilterName(app_code) ?currentNounPlanFilterName(app_code) : app_name}</div>
              )
            })}
          </div>
          <div className={indexStyle.right_bott}>
            {appsOperator(appsSelectKey)}
          </div>
        </div>
      </div>
        <DetailInfo {...this.props} modalVisible={projectInfoDisplay} />
        <ShowAddMenberModal show_wechat_invite={true} {...this.props} board_id = {board_id} modalVisible={this.state.ShowAddMenberModalVisibile} setShowAddMenberModalVisibile={this.setShowAddMenberModalVisibile.bind(this)}/>
        <AddModalForm {...this.props} board_id = {board_id} modalVisible={this.state.AddModalFormVisibile} setAddModalFormVisibile={this.setAddModalFormVisibile.bind(this)}/>
      </div>
  )
  }
}
