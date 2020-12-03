import React, { Component } from 'react'
import dva, { connect } from 'dva/index'
import indexStyles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import Header from './Header'
import CatalogTables from './CatalogTables'
import { isApiResponseOk } from '../../../../../utils/handleResponseData'
import { message } from 'antd'
import { getArchivesBoards } from '../../../../../services/technological/project'
import {
  searchArchives,
  getArchiveBoardFileList
} from '../../../../../services/technological/file'
import FileDetailModal from '@/components/FileDetailModal'
import {
  setBoardIdStorage,
  isPaymentOrgUser
} from '../../../../../utils/businessFunction'

class BoardArchives extends Component {
  constructor(props) {
    super(props)
    this.state = {
      bread_paths: [], // 面包屑路径
      data_source: [], //列表数据
      isSearchDetailOnfocusOrOnblur: false, // 搜索框聚焦显示当前搜索条件详情
      currentSearchValue: '', // 搜索框输入值
      view_type: '0', //0项目视图 1文件列表视图, 2混合视图(搜索状态)
      loading: false
    }
    this.timer = null
  }
  componentDidMount() {
    this.getDataSource()
  }
  setBreadAll = path => {
    this.setState(
      {
        bread_paths: path,
        view_type: '1',
        currentSearchValue: ''
      },
      () => {
        this.getDataSource()
      }
    )
  }
  setBreadPaths = ({ path_item = {} }) => {
    //面包屑设置路径 ，无长度是归档项目列表， 下标0是项目下文件（夹）列表
    const { bread_paths = [] } = this.state
    const { id } = path_item
    let new_bread_paths = []
    const index = bread_paths.findIndex(item => item.id == id)
    if (index == -1) {
      //如果路径中不包含就往后添加
      new_bread_paths = [].concat(bread_paths, [path_item])
    } else {
      //
      new_bread_paths = bread_paths.slice(0, index + 1)
    }
    const length = new_bread_paths.length
    // 设置当前操作项目缓存
    if (length > 0) {
      setBoardIdStorage(new_bread_paths[0].board_id, new_bread_paths[0].org_id)
    }
    this.setState(
      {
        bread_paths: new_bread_paths,
        view_type: length > 0 ? '1' : '0'
      },
      () => {
        this.getDataSource()
      }
    )
  }
  getDataSource = () => {
    //获取列表数据
    const { bread_paths = [] } = this.state
    const length = bread_paths.length
    if (length == 0) {
      this.getArchivesList()
    } else {
      this.getFList()
    }
  }

  // 将dataSource处理转化一变
  handleDataSource = (data = []) => {
    const data_source = data
      .map(item => {
        const new_item = { ...item }
        const {
          type,
          board_id,
          folder_id,
          file_id,
          id,
          board_name,
          file_name,
          folder_name,
          name
        } = item // type undefine/1,2 项目/文件夹/文件
        if (type == '1') {
          new_item.name = name || folder_name
          new_item.id = id || folder_id
        } else if (type == '2') {
          new_item.name = name || file_name
          new_item.id = id || file_id
        } else {
          new_item.name = name || board_name
          new_item.id = id || board_id
        }
        return new_item
      })
      .filter(item => isPaymentOrgUser(item.org_id))
    return data_source
  }
  // 请求位置------------start
  getArchivesList = () => {
    //获取归档的列表
    const params = {
      _organization_id: localStorage.getItem('OrganizationId')
    }
    this.setState({
      loading: true
    })
    getArchivesBoards(params)
      .then(res => {
        this.setState({
          loading: false
        })
        if (isApiResponseOk(res)) {
          const data_source = this.handleDataSource(res.data)
          this.setState({
            data_source
          })
        } else {
          message.error(res.message)
        }
      })
      .catch(err => {
        this.setState({
          loading: false
        })
      })
  }

  deleteLastArrItem = (arr = []) => {
    let _a = [...arr].slice()
    _a.pop()
    return _a
  }
  // 获取项目文件（夹）列表
  getFList = () => {
    //{ folder_id }
    const { bread_paths = [] } = this.state
    const board_id = bread_paths[0].board_id
    let folder_id = ''
    const length = bread_paths.length
    if (length > 1) {
      folder_id = bread_paths[length - 1].folder_id
    }
    this.setState({
      loading: true
    })
    getArchiveBoardFileList({
      folder_id,
      board_id
    })
      .then(res => {
        this.setState({
          loading: false
        })
        if (isApiResponseOk(res)) {
          const { file_data = [], folder_data = [] } = res.data
          const _folder_data = folder_data.map(item => {
            return { ...item, id: item.folder_id, name: item.folder_name }
          })
          const _file_data = file_data.map(item => {
            return { ...item, name: item.file_name }
          })

          const data_source = []
            .concat(_folder_data, _file_data)
            .filter(item => isPaymentOrgUser(item.org_id))
          this.setState({
            data_source
          })
        } else {
          this.setState({
            bread_paths: this.deleteLastArrItem(bread_paths)
          })
          message.error(res.message)
        }
      })
      .catch(err => {
        this.setState({
          bread_paths: this.deleteLastArrItem(bread_paths)
        })
        message.error('请求错误')
        this.setState({
          loading: false
        })
      })
  }
  deleteDataSourceItem = id => {
    const { data_source = [] } = this.state
    this.setState({
      data_source: data_source.filter(item => item.id != id)
    })
  }
  // 是否需要更新文件列表, 当访问控制设置时
  whetherUpdateFolderListData = () => {
    this.getDataSource()
  }
  //请求位置--------------end
  setPreviewFileModalVisibile = () => {
    this.props.dispatch({
      type: 'publicFileDetailModal/updateDatas',
      payload: {
        isInOpenFile: false,
        filePreviewCurrentFileId: '',
        fileType: '',
        filePreviewCurrentName: ''
      }
    })
  }

  // 处理传值
  getSearchParams = () => {
    const { bread_paths = [] } = this.state

    let board_id = ''
    let folder_id = ''
    const length = bread_paths.length
    switch (length) {
      case 0:
        board_id = ''
        folder_id = ''
        break
      case 1:
        board_id = bread_paths[0].board_id
        folder_id = ''
        break
      default:
        board_id = bread_paths[0].board_id
        folder_id = bread_paths[length - 1].folder_id
        break
    }
    const params = {
      board_id,
      folder_id
    }
    return params
  }
  // 触发搜索框，是否选择搜索详情
  inputOnChange = (value, searchValue) => {
    this.setState(
      {
        isSearchDetailOnfocusOrOnblur: !!value,
        currentSearchValue: searchValue
      },
      () => {
        if (this.timer) clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.searchList()
        }, 300)
      }
    )
  }

  // 搜索
  searchList = () => {
    const { currentSearchValue } = this.state
    if (!!!currentSearchValue) {
      this.setState({
        view_type: '1'
      })
      this.getDataSource()
      return
    }
    const { board_id, folder_id } = this.getSearchParams()
    const _organization_id = localStorage.getItem('OrganizationId')
    const params = {
      board_id,
      keywork: currentSearchValue,
      _organization_id
    }
    searchArchives({
      ...params
    }).then(res => {
      if (isApiResponseOk(res)) {
        const { board_data = [], file_data = [], folder_data = [] } = res.data
        const data_source = this.handleDataSource(
          [].concat(board_data, folder_data, file_data)
        )
        this.setState({
          data_source,
          view_type: '2'
        })
      } else {
        message.error(res.message)
      }
    })
  }
  // 回到项目文件-全部文件展示状态
  goAllFileStatus = () => {
    const { view_type } = this.state
    this.setState(
      {
        bread_paths: [],
        isSearchDetailOnfocusOrOnblur: false
      },
      () => {
        if (view_type != '2') {
          //非搜索状态
          this.setState({
            currentSearchValue: '',
            view_type: '0'
          })
          this.getDataSource()
        } else {
          this.searchList()
        }
      }
    )
  }
  // 搜索-全部文件/当前文件点击
  changeChooseType = (type, item) => {
    if (type == 'all_files') {
      this.goAllFileStatus()
    } else if ((type = 'sub_files')) {
      this.searchList()
    } else {
    }
  }
  render() {
    const {
      workbenchBoxContent_height = 600,
      isInOpenFile,
      fileType,
      filePreviewCurrentFileId
    } = this.props
    const {
      currentSearchValue,
      bread_paths = [],
      isSearchDetailOnfocusOrOnblur,
      view_type,
      data_source = [],
      loading
    } = this.state
    const currentIayerFolderName =
      bread_paths &&
      bread_paths.length &&
      (bread_paths[bread_paths.length - 1].board_name ||
        bread_paths[bread_paths.length - 1].folder_name)
    console.log('sssssssssss_data_source', view_type, data_source)
    console.log('sssssssssss_data_path', view_type, bread_paths)

    return (
      <div
        className={indexStyles.main_out}
        style={{ height: workbenchBoxContent_height }}
      >
        <div className={indexStyles.main}>
          {/* 首屏-文件路径面包屑/搜索 */}
          {
            <Header
              descriptionTitle={'档案'}
              bread_paths={bread_paths}
              currentSearchValue={currentSearchValue}
              inputOnChange={this.inputOnChange}
              searchList={this.searchList}
              goAllFileStatus={this.goAllFileStatus}
              setBreadPaths={this.setBreadPaths}
            />
          }
          {isSearchDetailOnfocusOrOnblur && (
            <div className={indexStyles.searchTypeBox}>
              搜索：
              <span
                className={!bread_paths.length ? indexStyles.currentFile : ''}
                onClick={() => this.changeChooseType('all_files')}
              >
                “全部档案”
              </span>
              {bread_paths.length ? (
                <span
                  className={bread_paths.length ? indexStyles.currentFile : ''}
                  onClick={() => this.changeChooseType('sub_files')}
                >
                  {bread_paths[0].board_name}
                </span>
              ) : (
                ''
              )}
            </div>
          )}
          <CatalogTables
            deleteDataSourceItem={this.deleteDataSourceItem}
            workbenchBoxContent_height={workbenchBoxContent_height}
            view_type={view_type}
            loading={loading}
            data_source={data_source}
            bread_paths={bread_paths}
            setBreadAll={this.setBreadAll}
            setBreadPaths={this.setBreadPaths}
          />
          {isInOpenFile && (
            <FileDetailModal
              fileType={fileType}
              filePreviewCurrentFileId={filePreviewCurrentFileId}
              file_detail_modal_visible={isInOpenFile}
              board_id={bread_paths.length ? bread_paths[0].board_id : '0'}
              setPreviewFileModalVisibile={this.setPreviewFileModalVisibile}
              whetherUpdateFolderListData={this.whetherUpdateFolderListData}
            />
          )}
        </div>
      </div>
    )
  }
}

function mapStateToProps({
  simpleWorkbenchbox: { boardListData, currentBoardDetail, boardFileListData },
  simplemode: { allOrgBoardTreeList, simplemodeCurrentProject },
  publicFileDetailModal: { isInOpenFile, fileType, filePreviewCurrentFileId },
  projectDetailFile: {
    datas: { selectedRowKeys }
  }
}) {
  return {
    selectedRowKeys,
    boardListData,
    currentBoardDetail,
    boardFileListData,
    allOrgBoardTreeList,
    simplemodeCurrentProject,
    isInOpenFile,
    fileType,
    filePreviewCurrentFileId
  }
}
export default connect(mapStateToProps)(BoardArchives)
