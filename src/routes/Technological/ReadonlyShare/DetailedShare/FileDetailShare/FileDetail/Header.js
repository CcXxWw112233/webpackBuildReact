
import React from 'react'
import indexStyles from './index.less'
import { Table, Button, Menu, Dropdown, Icon, Input, Upload, message, Tooltip } from 'antd';
import FileDerailBreadCrumbFileNav from './FileDerailBreadCrumbFileNav'
import {
  MESSAGE_DURATION_TIME,
  NOT_HAS_PERMISION_COMFIRN, PROJECT_FILES_FILE_DELETE, PROJECT_FILES_FILE_DOWNLOAD, PROJECT_FILES_FILE_EDIT,
  REQUEST_DOMAIN_FILE, PROJECT_FILES_FILE_UPDATE, PROJECT_FILES_FILE_UPLOAD,
  UPLOAD_FILE_SIZE, ORGANIZATION
} from "../../../../../../globalset/js/constant";
import Cookies from 'js-cookie'
import { checkIsHasPermissionInBoard, currentNounPlanFilterName } from "../../../../../../utils/businessFunction";
import { withRouter } from 'react-router-dom'
import ShareAndInvite from './../../../ShareAndInvite/index'
import { createShareLink, modifOrStopShareLink } from './../../../../../../services/technological/workbench'
import { color_4 } from "../../../../../../globalset/js/styles";
import { setUploadHeaderBaseInfo } from '@/utils/businessFunction'

class Header extends React.Component {
  state = {
    onlyReadingShareModalVisible: false, //只读分享modal
    onlyReadingShareData: {},
  }
  closeFile() {
    const { datas: { breadcrumbList = [] } } = this.props.model
    breadcrumbList.splice(breadcrumbList.length - 1, 1)
    this.props.updateDatasFile({ isInOpenFile: false, filePreviewUrl: '', filePreviewCurrentVersionKey: 0 })
  }
  zoomFrame() {
    const { datas: { isExpandFrame = false } } = this.props.model
    this.props.updateDatasFile({
      isExpandFrame: !isExpandFrame,
    })
  }
  fileDownload({ filePreviewCurrentId, pdfDownLoadSrc }) {
    if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DOWNLOAD)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    //如果时pdf
    if (pdfDownLoadSrc) {
      window.open(pdfDownLoadSrc)
    } else {
      this.props.fileDownload({ ids: filePreviewCurrentId })
    }
  }
  //item操作
  operationMenuClick(data, e) {
    const { file_id, type, file_resource_id } = data
    const { datas: { projectDetailInfoData = {}, breadcrumbList = [], pdfDownLoadSrc } } = this.props.model
    const { board_id } = projectDetailInfoData
    const { key } = e
    switch (key) {
      case '1':
        break
      case '2':
        if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DOWNLOAD)) {
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        //如果时pdf
        if (pdfDownLoadSrc) {
          window.open(pdfDownLoadSrc)
        } else {
          this.props.fileDownload({ ids: file_resource_id })
        }
        break
      case '3':
        if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_EDIT)) {
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        this.props.updateDatasFile({
          copyOrMove: '0',
          openMoveDirectoryType: '3',
          moveToDirectoryVisiblie: true,
        })
        break
      case '4':
        if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DOWNLOAD)) {
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        this.props.updateDatasFile({
          copyOrMove: '1',
          openMoveDirectoryType: '3',
          moveToDirectoryVisiblie: true,
        })
        break
      case '5':
        if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DELETE)) {
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        this.props.fileRemove({
          board_id,
          arrays: JSON.stringify([{ type, id: file_id }])
        })
        breadcrumbList.splice(breadcrumbList.length - 1, 1)
        this.props.updateDatasFile({ isInOpenFile: false })
        break
      default:
        break
    }
  }

  handleChangeOnlyReadingShareModalVisible = () => {
    const { onlyReadingShareModalVisible } = this.state
    //打开之前确保获取到数据
    if (!onlyReadingShareModalVisible) {
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
  getSearchFromLocation = location => {
    if (!location.search) {
      return {}
    }
    return location.search.substring(1).split('&').reduce((acc, curr) => {
      const [key, value] = curr.split('=')
      return Object.assign({}, acc, { [key]: value })
    }, {})
  }
  createOnlyReadingShareLink = () => {
    const { location } = this.props
    //获取参数
    const { board_id = '', appsSelectKey = '', file_id = '' } = this.getSearchFromLocation(location)

    const payload = {
      board_id,
      rela_id: file_id,
      rela_type: appsSelectKey
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
  handleOnlyReadingShareExpChangeOrStopShare = (obj) => {
    const isStopShare = obj && obj['status'] && obj['status'] === '0'
    return modifOrStopShareLink(obj).then(res => {
      if (res && res.code === '0') {
        if (isStopShare) {
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
  render() {
    const that = this
    const { datas: { seeFileInput, filePreviewCurrentVersionList = [], filePreviewCurrentVersionKey, isExpandFrame = false, pdfDownLoadSrc, filePreviewCurrentId, filePreviewCurrentFileId, filePreviewCurrentVersionId, currentParrentDirectoryId, projectDetailInfoData = {} } } = this.props.model //isExpandFrame缩放iframe标志
    const { board_id, is_shared } = projectDetailInfoData
    const { onlyReadingShareModalVisible, onlyReadingShareData } = this.state
    //文件版本更新
    const uploadProps = {
      name: 'file',
      withCredentials: true,
      action: `${REQUEST_DOMAIN_FILE}/file/version_upload`,
      data: {
        board_id,
        folder_id: currentParrentDirectoryId,
        file_version_id: filePreviewCurrentVersionId,
      },
      headers: {
        Authorization: Cookies.get('Authorization'),
        refreshToken: Cookies.get('refreshToken'),
        ...setUploadHeaderBaseInfo({}),
      },
      beforeUpload(e) {
        if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPDATE)) {
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
          // message.destroy()
        }
        if (file.status === 'done') {
          message.success(`上传成功。`);
          that.props.updateDatasFile({ filePreviewCurrentVersionKey: 0 })
          that.props.fileVersionist({ version_id: filePreviewCurrentVersionId, isNeedPreviewFile: true })
        } else if (file.status === 'error') {
          message.error(`上传失败。`);
          setTimeout(function () {
            message.destroy()
          }, 2000)
        }
      },
    };
    const operationMenu = (data) => {
      return (
        <Menu onClick={this.operationMenuClick.bind(this, data)}>
          {/*<Menu.Item key="1">收藏</Menu.Item>*/}
          {checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DOWNLOAD) && (
            <Menu.Item key="2">下载</Menu.Item>
          )}
          <Menu.Item key="3">移动</Menu.Item>
          {checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPLOAD) && (
            <Menu.Item key="4">复制</Menu.Item>
          )}
          {checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DELETE) && (
            <Menu.Item key="5" >移到回收站</Menu.Item>
          )}
        </Menu>
      )
    }
    //版本信息列表
    const getVersionItemMenu = (list) => {
      return (
        <Menu selectable={true} style={{ marginTop: -20 }} >
          {list.map((value, key) => {
            const { file_name, creator, create_time, file_size, file_id } = value
            return (
              <Menu.Item key={file_id} >
                {file_name}
                {filePreviewCurrentVersionKey == key
                  && (<span style={{ display: 'inline-block', backgroundColor: '#e5e5e5', padding: '0 4px', borderRadius: 40, marginLeft: 6 }}>当前</span>)}
              </Menu.Item>
            )
          })}
          <Menu.Item key="10" >
            <div className={indexStyles.itemDiv} style={{ color: color_4 }}>
              <Icon type="plus-circle" theme="outlined" style={{ margin: 0, fontSize: 16 }} /> 创建或加入新{currentNounPlanFilterName(ORGANIZATION)}
            </div>
          </Menu.Item>
        </Menu>
      )
    }

    return (
      <div className={indexStyles.fileDetailHead}>
        <div className={indexStyles.fileDetailHeadLeft}>
          {seeFileInput === 'fileModule' ? (
            <FileDerailBreadCrumbFileNav {...this.props} />
          ) : ('')}
        </div>

        <div className={indexStyles.fileDetailHeadRight}>
          <Dropdown overlay={getVersionItemMenu(filePreviewCurrentVersionList)}>
            <Button style={{ height: 24, marginLeft: 14 }}>
              <Icon type="upload" />版本信息
            </Button>
          </Dropdown>
          {/*{seeFileInput === 'fileModule'? (*/}
          {/*<Upload {...uploadProps} showUploadList={false}>*/}
          {/*<Button style={{height: 24, marginLeft: 14}}>*/}
          {/*<Icon type="upload" />更新版本*/}
          {/*</Button>*/}
          {/*</Upload>*/}
          {/*):('')}*/}
          {checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DOWNLOAD) && (
            <Button style={{ height: 24, marginLeft: 14 }} onClick={this.fileDownload.bind(this, { filePreviewCurrentId, pdfDownLoadSrc })}>
              <Icon type="download" />下载
            </Button>
          )}

          {/* <span style={{ marginLeft: '10px' }}>
            <ShareAndInvite is_shared={is_shared} onlyReadingShareModalVisible={onlyReadingShareModalVisible} handleChangeOnlyReadingShareModalVisible={this.handleChangeOnlyReadingShareModalVisible} data={onlyReadingShareData} handleOnlyReadingShareExpChangeOrStopShare={this.handleOnlyReadingShareExpChangeOrStopShare} />
          </span> */}
          {/*<Button style={{height: 24, marginLeft:14}} >*/}
          {/*<Icon type="star" />收藏*/}
          {/*</Button>*/}
          <div style={{ cursor: 'pointer' }}>
            {seeFileInput === 'fileModule' ? (
              <Dropdown overlay={operationMenu({ file_resource_id: filePreviewCurrentId, file_id: filePreviewCurrentFileId, type: '2' })}>
                <Icon type="ellipsis" style={{ fontSize: 20, marginLeft: 14 }} />
              </Dropdown>
            ) : ('')}
            <Icon type={!isExpandFrame ? 'fullscreen' : 'fullscreen-exit'} style={{ fontSize: 20, marginLeft: 14 }} theme="outlined" onClick={this.zoomFrame.bind(this)} />
            <Tooltip title={'关闭预览'} placement={'left'}>
              <Icon type="close" onClick={this.closeFile.bind(this)} style={{ fontSize: 20, marginLeft: 16 }} />
            </Tooltip>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(Header)
