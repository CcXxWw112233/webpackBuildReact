
import React from 'react'
import indexStyles from './index.less'
import { Table, Button, Menu, Dropdown, Icon, Input, message } from 'antd';
import globalStyles from '../../../../../globalset/css/globalClassName.less'
import {
  MESSAGE_DURATION_TIME, NOT_HAS_PERMISION_COMFIRN, PROJECT_FILES_FILE_DOWNLOAD,
  PROJECT_FILES_FILE_EDIT, PROJECT_FILES_FILE_DELETE
} from "../../../../../globalset/js/constant";
import {checkIsHasPermissionInBoard} from "../../../../../utils/businessFunction";
import {timestampToTimeNormal} from "../../../../../utils/util";

import {ORGANIZATION, TASKS, FLOWS, DASHBOARD, PROJECTS, FILES, MEMBERS, CATCH_UP} from "../../../../../globalset/js/constant";
import {currentNounPlanFilterName} from "../../../../../utils/businessFunction";
import Cookies from 'js-cookie'
const bodyOffsetHeight = document.querySelector('body').offsetHeight

export default class FileList extends React.Component {
  state = {
    //排序，tru为升序，false为降序
    nameSort: true,
    sizeSort: true,
    creatorSort: true,
  };
  //table变换
  handleChange = (pagination, filters, sorter) => {

  }
  //选择框单选或者全选
  onSelectChange = (selectedRowKeys) => {
    this.props.updateDatas({ selectedRowKeys });
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
        this.props.fileDownload({ids: file_resource_id, fileIds: file_id})
        break
      case '3':
        if(!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_EDIT)){
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        this.props.updateDatas({
          copyOrMove: '0',
          openMoveDirectoryType: '2',
          moveToDirectoryVisiblie: true,
          currentFileListMenuOperatorId: file_id
        })
        break
      case '4':
        if(!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_EDIT)){
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        this.props.updateDatas({
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
    this.props.updateDatas({
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
    this.props.updateDatas({
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
    this.props.updateDatas({selectedRowKeys: []})

  }

  //文件名类型
  judgeFileType(fileName) {
    let themeCode = ''
    const type = fileName.substr(fileName.lastIndexOf(".")).toLowerCase()
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
    this.props.updateDatas({breadcrumbList, currentParrentDirectoryId: type === '1' ?file_id : currentParrentDirectoryId, isInAddDirectory: false})
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
    const { board_id, file_resource_id, file_id, id, folder_id } = data

    this.props.setPreviewFileModalVisibile()
    this.props.updateFileDatas({
      seeFileInput: 'file',
      board_id,
      filePreviewCurrentId: file_resource_id,
      currentParrentDirectoryId: folder_id,
      filePreviewCurrentFileId: id,
      filePreviewCurrentVersionId: file_id
    })
    this.props.filePreview({id: file_resource_id, file_id: id})
    this.props.fileVersionist({
      version_id: file_id,
      isNeedPreviewFile: false,
    })
  }

  gotoBoard(data) {
    const { board_id, file_resource_id, file_id, id, folder_id } = data
    Cookies.set('board_id', board_id, {expires: 30, path: ''})
    this.props.routingJump('/technological/projectDetail')
  }

  render() {
    const { datas = {} } = this.props.model
    const { currentOrgFileUploads } = datas
    const { nameSort, sizeSort, creatorSort, } = this.state;

    const {CardContentType} =this.props

    const operationMenu = (data) => {
      const { type } = data
      return (
        <Menu onClick={this.operationMenuClick.bind(this, data)}>
          <Menu.Item key="2">下载</Menu.Item>
        </Menu>
      )
    }

    const columns = [
      {
        title: <div style={{color: '#8c8c8c', cursor: 'pointer'}} >{currentNounPlanFilterName(FILES)}名<Icon type={nameSort? "caret-down" : "caret-up" } theme="outlined" style={{fontSize: 10, marginLeft: 6, color: '#595959'}}/></div>,
        key: 'file_name',
        render: (data) => {
          const { file_name} = data
          return (
            <span onClick={this.openFile.bind(this, data )} style={{cursor: 'pointer'}}><i className={globalStyles.authTheme} style={{fontStyle: 'normal', fontSize: 22, color: '#1890FF', marginRight: 8, cursor: 'pointer' }} dangerouslySetInnerHTML={{__html: this.judgeFileType(file_name)}}></i>{file_name}</span>
          )
        }
      }, {
        title: <div style={{color: '#8c8c8c', cursor: 'pointer'}} >所在项目</div>,
        key: 'board_name',
        render: (data) => {
          const { board_name } = data
          return (
            <span onClick={this.gotoBoard.bind(this, data )} style={{cursor: 'pointer'}}>
              {board_name}
            </span>
          )
        }
      }, {
        title: '更新时间',
        key: 'update_time',
        render: (data) => {
          const { update_time } = data
          return (
            <span style={{cursor: 'pointer'}}>
               {timestampToTimeNormal(update_time, '', true)}
            </span>
           )
        }
      }, {
        title: '操作',
        key: 'operator',
        render: (data) =>{
          const {isInAdd} = data
          if(!isInAdd) {
            return (
              <div style={{cursor: 'pointer'}}>
                <Dropdown overlay={operationMenu(data)} trigger={['click']}>
                  <Icon type="ellipsis" theme="outlined" style={{fontSize: 22, color: '#000000'}}/>
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


    return (
      <div className={indexStyles.tableOut}>
        <Table
          columns={columns}
          dataSource={'MY_UPLOAD_FILE'== CardContentType?currentOrgFileUploads:[]}
          pagination={false}
          onChange={this.handleChange.bind(this)}
        />
      </div>
    )
  }
}
