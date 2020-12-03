import React, { Component } from 'react'
import { Breadcrumb, Tooltip, Icon } from 'antd'
import globalStyles from './../../../../../../globalset/css/globalClassName.less'
import FileItem from './../FileItem'
import styles from './index.less'
import { connect } from 'dva'
import { getOrgNameWithOrgIdFilter } from '@/utils/businessFunction'

/* eslint-disable */
@connect(({ workbench, technological: { datas: { currentUserOrganizes = [], is_show_org_name, is_all_org } } }) => ({
  projectTabCurrentSelectedProject: workbench.datas.projectTabCurrentSelectedProject,
  currentUserOrganizes, is_show_org_name, is_all_org
}))
class FileFolder extends Component {
  constructor(props) {
    super(props);
    const { file_list, folder_list } = this.props;
    this.state = {
      currentFolderLayer: 0, //当前的文件层级，默认是根目录0
      currentFileList: file_list, //当前层级的文件列表
      currentFolderList: folder_list, //当前层级的文件夹列表
      currentFolderInfo: {
        folder_name: '根目录',
        id: '0' //根目录的文件夹id，默认是 '0'
      }, //当前层级文件夹本身的信息
      breadCrumbList: [{ folder_name: '根目录', id: '0' }]
    };
  }
  initData = nextProps => {
    const { file_list, folder_list } = nextProps
    this.setState({
      currentFolderLayer: 0,
      currentFileList: file_list,
      currentFolderList: folder_list,
      currentFolderInfo: {
        folder_name: '根目录',
        id: '0',
      },
      breadCrumbList: [{ folder_name: '根目录', id: '0' }]
    })
  }
  genUpdateData = (dataObj, id) => {
    const { breadCrumbList } = this.state
    const newBreadCrumbList = breadCrumbList.reduce((acc, curr) => {
      const isResultBreadCrumbNodeInResult = acc.find(i => i.id === id)
      if (isResultBreadCrumbNodeInResult) {
        return acc
      }
      return [...acc, curr]
    }, [])
    this.handleUpdateCurrentData(dataObj, { breadCrumbList: newBreadCrumbList })
  }
  handleUpdateCurrentData = (folderInfo, { breadCrumbList }) => {
    const { folder_name, id, child_folder_list = [], file_list = [] } = folderInfo
    this.setState({
      currentFolderLayer: breadCrumbList.length,
      currentFileList: file_list,
      currentFolderList: child_folder_list,
      currentFolderInfo: {
        folder_name,
        id,
      },
      breadCrumbList,
    })
  }
  findFolderFromCurrentFolderLayer = id => {
    const { currentFolderList } = this.state
    return currentFolderList.find(i => i.id === id)
  }
  handleOpenFolder = (e, shouldOpendId) => {
    if (e) e.stopPropagation();
    //因为每次点击文件夹，只能点击到当前的下一层文件夹
    const folderInfo = this.findFolderFromCurrentFolderLayer(shouldOpendId)
    const { breadCrumbList } = this.state
    const { folder_name, id } = folderInfo
    const newBreadCrumbList = [...breadCrumbList, { folder_name, id }]
    this.handleUpdateCurrentData(folderInfo, { breadCrumbList: newBreadCrumbList })
  };
  isClickedCurrentLayer = clickedFolderId => {
    const { currentFolderInfo: { id } } = this.state
    return id === clickedFolderId ? true : false
  }
  handleCurrentLayer = shouldTurnedLayerFolderId => {
    const { breadCrumbList } = this.state
    const { folder_list } = this.props
    //因为点击的 folder 肯定会存在于 breadCumbList
    //如果点击的是根目录
    if (shouldTurnedLayerFolderId === '0') {
      this.initData(this.props)
      return
    }

    //如果点击的是其他层级的目录,则一层一层的匹配，直到匹配到
    let resultData = folder_list
    //第一层数据的数据结构，和其他层数据结构不同，所以需要区分
    let index = 0
    for (let folder of breadCrumbList.slice(1)) {
      const { id } = folder
      index++
      if (index === 1) {
        resultData = resultData.find(i => i.id === id)
      } else {
        resultData = resultData.child_folder_list.find(i => i.id === id)
      }
      if (id === shouldTurnedLayerFolderId) {
        break;
      }
    }
    return this.genUpdateData(resultData, shouldTurnedLayerFolderId)
  }
  handleClickedBreadCrumb = (e, folderId) => {
    if (e) e.stopPropagation();
    //如果点面包屑的当前层级
    if (this.isClickedCurrentLayer(folderId)) {
      return
    }
    //处理需要显示的层级数据
    this.handleCurrentLayer(folderId)
  };
  renderBreadCrumb = () => {
    const { breadCrumbList } = this.state;
    const { Item } = Breadcrumb;
    return (
      <Breadcrumb separator="/">
        {breadCrumbList.map(({ folder_name, id }, index) => (
          <Item
            key={id}
            className={`${styles.breadCrumbItem} ${index + 1 === breadCrumbList.length ? styles.breadCurmbActive : ''}`}
            onClick={e => this.handleClickedBreadCrumb(e, id)}
          >
            {folder_name}
          </Item>
        ))}
      </Breadcrumb>
    );
  };
  renderFolderItem = ({ folder_name = '新建文件夹', id, is_privilege, org_id, board_name } = {}) => {
    const { projectTabCurrentSelectedProject, is_show_org_name, is_all_org, currentUserOrganizes = [] } = this.props
    return (
      <div
        className={styles.folderListItem}
        onClick={e => this.handleOpenFolder(e, id)}
        key={id}
      >
        <span className={styles.folderListItemIcon}>
          <i
            className={`${globalStyles.authTheme} ${styles.folderListItemIcon}`}
          >
            &#xe6c4;
          </i>
        </span>
        {/* <span className={styles.folderListItemTitle}>{folder_name}</span> */}
        <div className={styles.file_text}>
          <span className={styles.folderListItemTitle}>{folder_name}</span>
          {
            is_privilege == '1' && (
              <Tooltip title="已开启访问控制" placement="top">
                <span style={{ color: 'rgba(0,0,0,0.50)', marginRight: '5px', marginLeft: '5px' }}>
                  <span className={`${globalStyles.authTheme}`}>&#xe7ca;</span>
                </span>
              </Tooltip>
            )
          }
          {
            projectTabCurrentSelectedProject == '0' && (
              <span style={{marginLeft: 5, marginRight: 2, color: '#8C8C8C'}}>#</span>
            )
          }
          <Tooltip placement="topLeft" title={
           is_show_org_name && projectTabCurrentSelectedProject == '0' && is_all_org ? (<span>{getOrgNameWithOrgIdFilter(org_id, currentUserOrganizes)} <Icon type="caret-right" style={{fontSize: 8, color: '#8C8C8C'}}/> {board_name}</span>)
            : (<span>{board_name}</span>)
          }>
            <div
                style={{ color: "#8c8c8c", cursor: "pointer", display: 'flex', alignItems: 'center' }}
                // onClick={this.gotoBoardDetail.bind(this, { id, board_id, org_id, folder_name })}
              >
                {
                  is_show_org_name && projectTabCurrentSelectedProject == '0' && is_all_org && (
                    <span className={styles.org_name}>
                      {getOrgNameWithOrgIdFilter(org_id, currentUserOrganizes)}
                    </span>
                  )
                }
                {
                  is_show_org_name && projectTabCurrentSelectedProject == '0' && is_all_org && (
                    <span>
                      <Icon type="caret-right" style={{fontSize: 8, color: '#8C8C8C'}}/>
                    </span>
                  )
                }
                {
                  projectTabCurrentSelectedProject == '0' && (
                    <span className={styles.ellipsis}>{board_name}</span>
                  )
                }
                
              </div>
            </Tooltip>
        </div>
      </div>
    );
  };
  renderFolderList = () => {
    const { currentFolderList } = this.state;
    return <>{currentFolderList.map(this.renderFolderItem)}</>;
  };
  renderFileItem = item => {
    const { shouldFileItemSetPreviewFileModalVisibile } = this.props;
    return (
      <div className={styles.fileListItemWrapper} key={`${item.id}-${item.is_privilege}`}>
        <FileItem
          {...this.props}
          itemValue={item}
          setPreviewFileModalVisibile={
            shouldFileItemSetPreviewFileModalVisibile
          }
        />
      </div>
    );
  };
  renderFileList = () => {
    const { currentFileList } = this.state;
    return <>{currentFileList.map(this.renderFileItem)}</>;
  };
  isTheSameArr = (arr1 = [], arr2 = []) => {
    if (!(Array.isArray(arr1) && Array.isArray(arr2))) {
      return false
    }
    if (arr1.length !== arr2.length) {
      return false
    }
    for (let i = 0, n = arr2.length; i < n; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true
    // return arr1.every(i1 => arr2.find(i2 => i1.id === i2.id))
  }
  handleGetNewFileListAndFolderList = nextProps => {
    const { file_list: next_file_list, folder_list: next_folder_list } = nextProps
    const { file_list, folder_list } = this.props
    const isTheSameFileList = this.isTheSameArr(file_list, next_file_list)
    const isTheSameFolderList = this.isTheSameArr(folder_list, next_folder_list)
    if (isTheSameFileList && isTheSameFolderList) {
      return
    }
    return this.initData(nextProps)
  }
  componentWillReceiveProps(nextProps) {
    this.handleGetNewFileListAndFolderList(nextProps)
  }
  render() {
    return (
      <div className={styles.wrapper}>
        <div className={styles.breadCrumbWrapper}>
          {this.renderBreadCrumb()}
        </div>
        <div className={styles.folderListWrapper}>
          {this.renderFolderList()}
        </div>
        <div className={styles.fileListWrapper}>{this.renderFileList()}</div>
      </div>
    );
  }
}

FileFolder.defaultProps = {
  file_list: [], //第一层(根目录)的文件列表
  folder_list: [], //文件夹列表
  shouldFileItemSetPreviewFileModalVisibile: function () { }, //点击file item 的回调函数
};

export default FileFolder;
