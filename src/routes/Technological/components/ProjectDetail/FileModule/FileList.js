
import React from 'react'
import indexStyles from './index.less'
import { Table, Button, Menu, Dropdown, Icon, Input, message, Modal } from 'antd';
import CreatDirector from './CreatDirector'
import globalStyles from '../../../../../globalset/css/globalClassName.less'
import {
  MESSAGE_DURATION_TIME, NOT_HAS_PERMISION_COMFIRN, PROJECT_FILES_FILE_DOWNLOAD,
  PROJECT_FILES_FILE_EDIT, PROJECT_FILES_FILE_DELETE, PROJECT_FILES_FILE_UPLOAD, PROJECT_FILES_FOLDER
} from "../../../../../globalset/js/constant";
import {checkIsHasPermissionInBoard} from "../../../../../utils/businessFunction";
import {ORGANIZATION, TASKS, FLOWS, DASHBOARD, PROJECTS, FILES, MEMBERS, CATCH_UP} from "../../../../../globalset/js/constant";
import {currentNounPlanFilterName, openPDF, getSubfixName} from "../../../../../utils/businessFunction";

import VisitControl from './../../VisitControl/index'
import {toggleContentPrivilege, setContentPrivilege, removeContentPrivilege} from './../../../../../services/technological/project'

const bodyOffsetHeight = document.querySelector('body').offsetHeight

export default class FileList extends React.Component {
  state = {
    //排序，tru为升序，false为降序
    nameSort: true,
    sizeSort: true,
    creatorSort: true,
    visitControlModalVisible: false, //访问控制Modal visible
    visitControlModalData: {}, //访问控制Modal data
  };
  //table变换
  handleChange = (pagination, filters, sorter) => {

  }
  //选择框单选或者全选
  onSelectChange = (selectedRowKeys) => {
    this.props.updateDatasFile({ selectedRowKeys });
    // console.log(selectedRowKeys)
  }

  //item操作
  operationMenuClick(data, e) {
    const { file_id, type, file_resource_id } = data
    const { datas: { projectDetailInfoData= {} } } = this.props.model
    const { board_id } = projectDetailInfoData
    const { key } = e
    switch (key) {
      case '1':
        break
      case '2':
        if(!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DOWNLOAD)){
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        this.props.fileDownload({ids: file_resource_id, fileIds: file_id })
        break
      case '3':
        if(!checkIsHasPermissionInBoard(PROJECT_FILES_FOLDER)){
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        this.props.updateDatasFile({
          copyOrMove: '0',
          openMoveDirectoryType: '2',
          moveToDirectoryVisiblie: true,
          currentFileListMenuOperatorId: file_id
        })
        break
      case '4':
        if(!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPLOAD)){
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        this.props.updateDatasFile({
          copyOrMove: '1',
          openMoveDirectoryType: '2',
          moveToDirectoryVisiblie: true,
          currentFileListMenuOperatorId: file_id
        })
        break
      case '5':
        if(!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DELETE)){
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        this.props.fileRemove({
          board_id,
          arrays: JSON.stringify([{type, id: file_id}])
        })
        break
        case '99':
        this.handleShowVisitControlModal(data)
        break
      default:
        break
    }
  }

  //列表排序, 有限排序文件夹
  normalSort(filedata_1, filedata_2, key, state) {
    const that = this
    filedata_1.sort(function(a, b){
      if(that.state[state]) {
        return a[key].localeCompare(b[key]);
      } else {
        return b[key].localeCompare(a[key]);
      }
    });
    filedata_2.sort(function(a, b){
      if(that.state[state]) {
        return a[key].localeCompare(b[key]);
      } else {
        return b[key].localeCompare(a[key]);
      }
    });
    this.props.updateDatasFile({
      fileList: [...filedata_1, ...filedata_2]
    })
  }
  fiterSizeUnit(file_size) {
    let transSize
    const sizeTransNumber = parseFloat(file_size)
    if(!file_size) {
      return
    }
    if(file_size.indexOf('G') !== -1){
      transSize = 1024*1024*1024* sizeTransNumber
    }else if(file_size.indexOf('MB') !== -1){
      transSize = 1024*1024 * sizeTransNumber
    }else if(file_size.indexOf('KB') !== -1){
      transSize = 1024 * sizeTransNumber
    }else{
      transSize = sizeTransNumber
    }
    return transSize
  }
  sizeSort(filedata_1, filedata_2, key, state) {
    const that = this
    filedata_1.sort(function(a, b){
      if(that.state[state]) {
        return that.fiterSizeUnit(a[key]) - that.fiterSizeUnit(b[key]);
      } else {
        return that.fiterSizeUnit(b[key]) - that.fiterSizeUnit(a[key])
      }
    });
    filedata_2.sort(function(a, b){
      if(that.state[state]) {
        return that.fiterSizeUnit(a[key]) - that.fiterSizeUnit(b[key]);
      } else {
        return that.fiterSizeUnit(b[key]) - that.fiterSizeUnit(a[key])
      }
    });
    this.props.updateDatasFile({
      fileList: [...filedata_1, ...filedata_2]
    })
  }
  listSort(key) {
    const { datas = {} } = this.props.model
    const { fileList, filedata_1, filedata_2, selectedRowKeys } = datas
    switch (key) {
      case '1':
        this.setState({
          nameSort: !this.state.nameSort
        }, function () {
          this.normalSort(filedata_1, filedata_2, 'file_name', 'nameSort')
        })
        break
      case '2':
        this.setState({
          sizeSort: !this.state.sizeSort
        }, function () {
          this.sizeSort(filedata_1, filedata_2, 'file_size', 'sizeSort')
        })
        break
      case '3':
        this.setState({
          creatorSort: !this.state.creatorSort
        }, function () {
          this.normalSort(filedata_1, filedata_2, 'creator', 'creatorSort')
        })
        break
      default:
        break
    }
    //排序的时候清空掉所选项
    this.props.updateDatasFile({selectedRowKeys: []})

  }

  //文件名类型
  judgeFileType(fileName) {
    let themeCode = ''
    const type = getSubfixName(fileName)
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
        themeCode = ''
        break
    }
    return themeCode
  }

  //文件夹或文件点击
  open(data, type) {
    const { datas = {} } = this.props.model
    const { breadcrumbList = [], currentParrentDirectoryId } = datas
    const { belong_folder_id, file_id } = data
    if(belong_folder_id === currentParrentDirectoryId){
      breadcrumbList.push(data)
    }else {
      breadcrumbList[breadcrumbList.length - 1] = data
    }
    //顺便将isInAddDirectory设置为不在添加文件夹状态
    this.props.updateDatasFile({breadcrumbList, currentParrentDirectoryId: type === '1' ?file_id : currentParrentDirectoryId, isInAddDirectory: false})
  }
  openDirectory(data) {
    this.open(data, '1')
    //接下来做文件夹请求的操作带id
    const { file_id } = data
    this.props.getFileList({
      folder_id: file_id
    })
  }
  openFile(data) {
    const { file_id, version_id, file_resource_id, file_name } = data
    // if(getSubfixName(file_name) == '.pdf' && checkIsHasPermissionInBoard(PROJECT_FILES_FILE_EDIT)) {
    //   openPDF({id: file_id})
    //   return false
    // }
    this.open(data, '2')

    this.props.dispatch({
      type: 'projectDetailFile/getCardCommentListAll',
      payload: {
        id: file_id
      }
    })
    this.props.dispatch({
      type: 'projectDetailFile/updateDatas',
      payload: {
        filePreviewCurrentFileId: file_id
      }
    })
    this.props.dispatch({
      type: 'projectDetailFile/getFileType',
      payload: {
        fileList: this.props.model.datas.fileList,
        file_id
      }
    })
    //接下来打开文件
    this.props.updateDatasFile({
      isInOpenFile: true,
      seeFileInput: 'fileModule',
      currentPreviewFileData: data,
      filePreviewCurrentFileId: file_id,
      filePreviewCurrentId: file_resource_id,
      filePreviewCurrentVersionId: version_id,
      pdfDownLoadSrc: '',
    })
    if(getSubfixName(file_name) == '.pdf') {
      this.props.dispatch({
        type: 'projectDetailFile/getFilePDFInfo',
        payload: {
          id: file_id
        }
      })
    } else {
      this.props.filePreview({id: file_resource_id, file_id})
    }
    this.props.fileVersionist({version_id: version_id})

    //通过url
    // this.props.openFileInUrl({file_id})
  }
  async handleShowVisitControlModal(data){
    await this.initVisitControlModalData(data)
    await this.toggleVisitControlModal(true)
  }
  handleVisitControlModalOk = () => {
    this.toggleVisitControlModal(false)
  }
  handleVisitControlModalCancel = () => {
    this.toggleVisitControlModal(false)
  }
  initVisitControlModalData = data => {
    this.setState({
      visitControlModalData: data
    })
  }
  toggleVisitControlModal = flag => {
    this.setState({
      visitControlModalVisible: flag,
    })
  }
  genVisitContorlData = (originData = {}) => {
    const isEmptyObj = obj => !Object.getOwnPropertyNames(obj).length
    if(isEmptyObj(originData)) {
      return {}
    }
    const {type, folder_name, file_name, is_privilege, privileges, child_privilegeuser_ids} = originData
    const fileTypeName = type === '1' ? '文件夹' : '文件'
    const fileOrFolderName = type === '1' ? folder_name : file_name
    const genVisitControlOtherPersonOperatorMenuItem = type => {
      if(type === '1') {
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
      if(type === '2') {
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
    const visitControlOtherPersonOperatorMenuItem = genVisitControlOtherPersonOperatorMenuItem(type)
    return {
      child_privilegeuser_ids,
      fileTypeName,
      fileOrFolderName,
      visitControlOtherPersonOperatorMenuItem,
      is_privilege,
      privileges,
      removeMemberPromptText: type === '1' ? '移出后用户将不能访问此文件夹' : '移出后用户将不能访问此文件',
    }
  }
  getVisitControlModalDataType = () => {
    const {visitControlModalData: {type}} = this.state
    return type === '1' ? 'folder' : 'file'
  }
  getVisitControlModalDataId = () => {
    const dataType = this.getVisitControlModalDataType()
    const {visitControlModalData: {folder_id, file_id}} = this.state
    return dataType === 'file' ? file_id : folder_id
  }
  isTheSameVisitControlState = (flag) => {
    const {visitControlModalData: {is_privilege}} = this.state
    const toBool = str => !!Number(str)
    const is_privilege_bool = toBool(is_privilege)
    if(flag === is_privilege_bool) {
      return true
    }
    return false
  }
  handleVisitControlRemoveContentPrivilege = id => {
    const content_id = this.getVisitControlModalDataId()
    const content_type = this.getVisitControlModalDataType()
    removeContentPrivilege({
      content_id,
      content_type,
      user_id: id
    }).then(res => {
      const isResOk = res => res && res.code === '0'
      if(isResOk(res)) {
        message.success('移出用户成功')
        const {visitControlModalData: {privileges}} = this.state
        const newPrivileges = {}
        for(let item in privileges) {
          if(item !== id) {
            newPrivileges[item] = privileges[item]
          }
        }
        this.visitControlUpdateCurrentProjectData({privileges: newPrivileges})
      } else {
        message.error('移出用户失败')
      }
    })
  }
  handleClickedOtherPersonListOperatorItem = (id, type) => {
    if(type === 'remove') {
      this.handleVisitControlRemoveContentPrivilege(id)
    } else {
      this.handleSetContentPrivilege(id, type, '更新用户控制类型失败')
    }
  }
  handleVisitControlAddNewMember = (ids = []) => {
    if(!ids.length) return
    const user_ids = ids.reduce((acc, curr) => {
      if(!acc) return curr
      return `${acc},${curr}`
    }, '')
    this.handleSetContentPrivilege(user_ids, 'read')
  }
  handleSetContentPrivilege = (ids, type, errorText='访问控制添加人员失败，请稍后再试') => {
    //debugger
    const {visitControlModalData: {folder_id, version_id, privileges}} = this.state
    const dataType = this.getVisitControlModalDataType()
    const content_id = dataType === 'file' ? version_id : folder_id
    const content_type = dataType === 'file' ? 'file' : 'folder'
    const privilege_code = type
    const user_ids = ids
    setContentPrivilege({
      content_id,
      content_type,
      privilege_code,
      user_ids
    }).then(res => {
      if(res && res.code === '0') {
        const addedPrivileges = ids.split(',').reduce((acc, curr) => Object.assign({}, acc, {[curr]: type}), {})
        this.visitControlUpdateCurrentProjectData({privileges: Object.assign({}, privileges, addedPrivileges)})
      } else {
        message.error(errorText)
      }
    })
  }
  handleVisitControlChange = flag => {
    if(this.isTheSameVisitControlState(flag)) {
      return
    }
    this.handleToggleContentPrivilege(flag)
  }
  handleToggleContentPrivilege = flag => {
    const {visitControlModalData: {folder_id, file_id}} = this.state
    const dataType = this.getVisitControlModalDataType()
    const data = {
      content_id: dataType === "file" ? file_id : folder_id,
      content_type: dataType === 'file' ? 'file' : 'folder',
      is_open: flag ? 1 : 0
    }
    toggleContentPrivilege(data).then(res => {
      const resOk = res => res && res.code === '0'
      if(resOk(res)) {
        this.visitControlUpdateCurrentProjectData({is_privilege: flag ? '1' : '0'})
      } else {
        message.error('设置内容权限失败，请稍后再试')
      }
    })
  }
  visitControlUpdateCurrentProjectData = obj => {
    const {visitControlModalData, visitControlModalData: {belong_folder_id}} = this.state
    this.setState({
      visitControlModalData: Object.assign({}, visitControlModalData, obj)
    })
    this.props.getFileList({
      folder_id: belong_folder_id
    })
  }

  render() {
    const { datas = {} } = this.props.model
    const { selectedRowKeys, fileList = [] } = datas
    const { nameSort, sizeSort, creatorSort, visitControlModalVisible, visitControlModalData } = this.state;

    const operationMenu = (data) => {
      const { type } = data
      return (
        <Menu onClick={this.operationMenuClick.bind(this, data)}>
          {/*<Menu.Item key="1">收藏</Menu.Item>*/}
          {type !== '1' && checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DOWNLOAD) ? (
          <Menu.Item key="2">下载</Menu.Item>
            ):('')}
           {/* {checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DOWNLOAD) ? (
          <Menu.Item key="99"><span>访问控制&nbsp;&nbsp;<span className={globalStyles.authTheme}>&#xe7eb;</span></span></Menu.Item>
            ):('')} */}
          {type !== '1' && checkIsHasPermissionInBoard(PROJECT_FILES_FOLDER)? (
            <Menu.Item key="3">移动</Menu.Item>
          ):('')}
          {type !== '1' && checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPLOAD)? (
            <Menu.Item key="4">复制</Menu.Item>
          ):('')}
          {checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DELETE) && (
            <Menu.Item key="5" >移到回收站</Menu.Item>
          )}
        </Menu>
      )
    }

    const columns = [
      {
        title: <div style={{color: '#8c8c8c', cursor: 'pointer'}} onClick={this.listSort.bind(this, '1')} >{currentNounPlanFilterName(FILES)}名<Icon type={nameSort? "caret-down" : "caret-up" } theme="outlined" style={{fontSize: 10, marginLeft: 6, color: '#595959'}}/></div>,
        key: 'file_name',
        render: (data) => {
          const {type, file_name, isInAdd} = data
          if(isInAdd) {
            return(
              <CreatDirector {...this.props} />
            )
          }else {
            return(type === '1' ?
              (<span onClick={this.openDirectory.bind(this, data)} style={{cursor: 'pointer'}}><i className={globalStyles.authTheme} style={{fontStyle: 'normal', fontSize: 22, color: '#1890FF', marginRight: 8, cursor: 'pointer' }}>&#xe6c4;</i>{file_name}</span>)
              : (<span onClick={this.openFile.bind(this, data )} style={{cursor: 'pointer'}}><i className={globalStyles.authTheme} style={{fontStyle: 'normal', fontSize: 22, color: '#1890FF', marginRight: 8, cursor: 'pointer' }} dangerouslySetInnerHTML={{__html: this.judgeFileType(file_name)}}></i>{file_name}</span>))
          }
        }
      }, {
        title: <div style={{color: '#8c8c8c', cursor: 'pointer'}} onClick={this.listSort.bind(this, '2')}>大小<Icon type={sizeSort? "caret-down" : "caret-up" } theme="outlined" style={{fontSize: 10, marginLeft: 6, color: '#595959'}}/></div>,
        dataIndex: 'file_size',
        key: 'file_size',
      }, {
        title: '更新时间',
        dataIndex: 'update_time',
        key: 'update_time',
      }, {
        title: <div style={{color: '#8c8c8c', cursor: 'pointer'}} onClick={this.listSort.bind(this, '3')}>创建人<Icon type={creatorSort? "caret-down" : "caret-up" } theme="outlined" style={{fontSize: 10, marginLeft: 6, color: '#595959'}}/></div>,
        dataIndex: 'creator',
        key: 'creator',
      },
      {
        title: '操作',
        key: 'operator',
        render: (data) =>{
          const {isInAdd} = data
          if(!isInAdd) {
            return (
              <div style={{cursor: 'pointer'}}>
                <Dropdown overlay={operationMenu(data)} trigger={['click']} >
                  <Icon type="ellipsis" theme="outlined" style={{fontSize: 22, color: '#000000'}} onClick={this.toggleDropdownVisible} />
                </Dropdown>
              </div>
            )
          }else {
             return (
               <div>--</div>
             )
          }
        }


      },
    ];
    const {child_privilegeuser_ids, removeMemberPromptText, is_privilege, privileges = {}, fileTypeName, fileOrFolderName, visitControlOtherPersonOperatorMenuItem} = this.genVisitContorlData(visitControlModalData)
    const visitControlModalTitle = (
      <div><span>内容访问设置 - </span><span>{fileTypeName}: </span><span style={{maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1890FF'}}>{fileOrFolderName}</span></div>
    )
    return (
      <div className={indexStyles.tableOut} style={{minHeight: (bodyOffsetHeight)}}>
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: this.onSelectChange,
            getCheckboxProps: data => ({
              disabled: data.type === '1', //data.isInAdd === true || data.type === '1', // Column configuration not to be checked
              name: data.file_id, //data.file_id,
            }),
          }}
          columns={columns}
          dataSource={fileList}
          pagination={false}
          onChange={this.handleChange.bind(this)}
        />
           <Modal
           title={visitControlModalTitle}
           width={400}
           footer={null}
           destroyOnClose={true}
           visible={visitControlModalVisible}
           onCancel={this.handleVisitControlModalCancel}
          //  onOk={this.handleVisitControlModalOk}
        >
        <div style={{paddingTop: '-24px', paddingBottom: '-24px'}}>
        <VisitControl
          onlyShowPopoverContent={true}
          isPropVisitControl={is_privilege === '0' ? false : true}
          principalInfo='位文件访问人'
          principalList={this.getVisitControlModalDataType() === 'file' ? [] : child_privilegeuser_ids}
          notShowPrincipal={this.getVisitControlModalDataType() === 'file' ? true : false}
          otherPrivilege={privileges}
          otherPersonOperatorMenuItem={visitControlOtherPersonOperatorMenuItem}
          removeMemberPromptText={removeMemberPromptText}
          handleVisitControlChange={this.handleVisitControlChange}
          handleAddNewMember={this.handleVisitControlAddNewMember}
          handleClickedOtherPersonListOperatorItem={this.handleClickedOtherPersonListOperatorItem}
        />
        </div>
        </Modal>
      </div>
    )
  }
}
