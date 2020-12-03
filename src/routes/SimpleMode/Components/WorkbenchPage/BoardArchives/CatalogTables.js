import React, { Component } from 'react'
import { Table, Popconfirm, message, Tooltip } from 'antd'
import {
  timestampToTimeNormal,
  filterFileFormatType
} from '../../../../../utils/util'
import { connect } from 'dva'
import {
  getOrgNameWithOrgIdFilter,
  getSubfixName,
  setBoardIdStorage,
  currentNounPlanFilterName
} from '../../../../../utils/businessFunction'
import globalStyles from '@/globalset/css/globalClassName.less'
import indexStyles from './index.less'
import { archivedProject } from '../../../../../services/technological/project'
import { isApiResponseOk } from '../../../../../utils/handleResponseData'
import FileDetailModal from '@/components/FileDetailModal'
import { PROJECTS } from '../../../../../globalset/js/constant'

@connect(mapStateToProps)
export default class CatalogTables extends Component {
  constructor(props) {
    super(props)
    this.state = {
      columns: [],
      selectedRows: [] //已选列表
    }
  }
  componentDidMount() {
    this.setTableData()
  }
  componentWillReceiveProps() {
    this.setTableData()
  }
  setTableData = () => {
    const columns = [
      {
        title: this.renderTitleName(),
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        width: 260,
        render: (text, item) => {
          return this.renderKeyName(item)
        }
      },
      {
        title: this.renderOriginator(),
        dataIndex: 'originator',
        key: 'originator',
        ellipsis: true,
        width: 200,
        render: (_, item) => {
          const { archived_by = {}, size, type } = item
          if (type == '0' || !type) {
            return archived_by.name
          } else if (type == '1') {
            return ''
          } else if (type == '2') {
            return size
          } else {
          }
        }
      },
      {
        title: '更新时间',
        dataIndex: 'archived_time',
        key: 'archived_time',
        ellipsis: true,
        width: 200,
        render: text => {
          return timestampToTimeNormal(text, '/', true)
        }
      },
      {
        title: this.renderTitleOperate(),
        dataIndex: 'operate',
        key: 'operate',
        ellipsis: true,
        width: 200,
        render: (_, item) => {
          return this.renderKeyOperate(item)
        }
      }
    ]
    this.setState({
      columns
    })
  }

  // 操作项合集
  actionsManager = (action, data, event) => {
    event.stopPropagation()
    const { dispatch, view_type, bread_paths = [] } = this.props
    const { selectedRows = [] } = this.state
    const {
      type,
      board_id,
      id,
      org_id,
      file_name,
      name,
      file_resource_id,
      file_id,
      folder_route = []
    } = data
    const actionHandles = {
      confirmArchives: () => {
        //项目归档
        event.stopPropagation()
        archivedProject({ board_id, is_archived: '0' }).then(res => {
          if (isApiResponseOk(res)) {
            message.success('已成功归档该项目')
            dispatch({
              type: 'workbench/getProjectList',
              payload: {}
            })
            dispatch({
              type: 'technological/getUserBoardPermissions',
              payload: {}
            })

            this.props.deleteDataSourceItem(board_id)
          } else {
            message.error(res.message)
          }
        })
        console.log('ssssssssss', 'confirmArchives')
      },
      tableRowClick: () => {
        setBoardIdStorage(board_id, org_id)
        if (type == '1') {
          const new_item_value = { ...data }
          if (view_type == '2' && !bread_paths.length) {
            //根目录下搜索状态下搜出来文件夹需要把全部路径塞进去
            let path = folder_route.reverse().map((item, key) => {
              const new_item = { ...item }
              const { board_id, folder_id, board_name, folder_name } = item // type undefine/1,2 项目/文件夹/文件
              if (key == 0) {
                new_item.name = board_name || '项目'
                new_item.board_name = board_name || '项目'
                new_item.id = board_id
              } else {
                new_item.name = folder_name
                new_item.id = folder_id
              }
              return new_item
            })
            this.props.setBreadAll && this.props.setBreadAll(path)
          } else {
            //项目目录下将当前item push进路径
            this.props.setBreadPaths &&
              this.props.setBreadPaths({ path_item: new_item_value })
          }
        } else if (type == '2') {
          // setBoardIdStorage(board_id, org_id)
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
              fileType: getSubfixName(name || file_name),
              isInOpenFile: true,
              filePreviewCurrentName: name || file_name
            }
          })
        } else if (!!!type || type == '0') {
          const new_item_value = { ...data }
          this.props.setBreadPaths &&
            this.props.setBreadPaths({ path_item: new_item_value })
        } else {
        }
      },
      download: () => {
        dispatch({
          type: 'projectDetailFile/fileDownload',
          payload: {
            ids: file_resource_id,
            fileIds: file_id
            // _organization_id: '1204601022929047552'
          }
        })
      },
      downloadMultiple: () => {
        const ids = selectedRows.map(item => item.file_resource_id).join(',')
        const fileIds = selectedRows.map(item => item.file_id).join(',')
        dispatch({
          type: 'projectDetailFile/fileDownload',
          payload: {
            ids,
            fileIds
            // _organization_id: '1204601022929047552'
          }
        })
      }
    }
    if (typeof actionHandles[action] == 'function')
      return actionHandles[action]()
  }

  // 列表name
  renderKeyName = item => {
    let name_dec = item
    const { name, board_name, org_id, board_id, type } = item
    const { currentUserOrganizes = [], view_type, bread_paths } = this.props
    const select_org_id = localStorage.getItem('OrganizationId')
    const org_dec =
      select_org_id == '0' || !select_org_id
        ? `(${getOrgNameWithOrgIdFilter(org_id, currentUserOrganizes)})`
        : ''
    const board_dec = `#${board_name}`
    const is_board = type == '0' || !type
    const is_folder = type == '1'
    const is_file = type == '2'

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'left',
          alignItems: 'center'
        }}
      >
        <>
          <div style={{ marginRight: 4 }}>
            {is_board && (
              <span
                className={`${globalStyles.authTheme}`}
                style={{ fontSize: 30, color: '#40A9FF', marginRight: 4 }}
              >
                &#xe716;
              </span>
            )}
            {is_folder && (
              <span
                className={`${globalStyles.authTheme}`}
                style={{ fontSize: 24, color: '#40A9FF', marginRight: 4 }}
              >
                &#xe6c4;
              </span>
            )}
            {is_file && (
              <span
                className={`${globalStyles.authTheme}`}
                dangerouslySetInnerHTML={{
                  __html: filterFileFormatType(getSubfixName(name))
                }}
                style={{ fontSize: 30, color: '#40A9FF', marginRight: 4 }}
              ></span>
            )}
          </div>
          {/* 名称部分 */}
          <div>
            <p style={{ marginBottom: 0 }}>
              <span>{name}</span>
            </p>
            {view_type != '1' && ( //非项目视图下
              <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 4 }}>
                {/* 搜索状态下， 并且当前条不为项目,在没有路径归置下，显示项目名称 */}
                {view_type == '2' &&
                  (type || type != '0') &&
                  !bread_paths.length &&
                  (board_name || '所属项目')}
                {select_org_id == '0' && org_dec}
              </p>
            )}
          </div>
          {/* {
                        select_org_id == '0' ? (
                            <div>
                                <p style={{ marginBottom: 0 }}>
                                    <span>{name}</span>
                                </p>
                                {
                                    view_type != '1' && ( //非项目视图下
                                        <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 4 }}>
                                            {org_dec}
                                        </p>
                                    )
                                }
                            </div>
                        ) : (
                                name
                            )
                    } */}
        </>
      </div>
    )
  }
  // 表头name
  renderTitleName = (item = {}) => {
    const { selectedRows = [] } = this.state
    const { view_type } = this.props
    let name = ''
    if (view_type == '0') {
      name = '档案'
    } else if (view_type == '1') {
      name = '文件'
    }
    const length = selectedRows.length
    return (
      <div>
        <div style={{ display: 'flex', paddingRight: 20 }}>
          <div style={{ lineHeight: '27px' }}> {`${name}名称`}</div>
          {length > 0 && view_type == '1' && (
            <>
              <div
                style={{
                  color: '#1890FF',
                  lineHeight: '27px',
                  fontWeight: 'normal'
                }}
              >
                （已选{length}项）
              </div>
              {view_type == '0' && (
                <div
                  className={`${globalStyles.authTheme}  ${indexStyles.table_operate}`}
                >
                  &#xe717;
                </div>
              )}
              <Tooltip title="下载">
                {view_type == '1' ? (
                  <div
                    className={`${globalStyles.authTheme}  ${indexStyles.table_operate}`}
                    onClick={e =>
                      this.actionsManager('downloadMultiple', item, e)
                    }
                    style={{ marginLeft: 16 }}
                  >
                    &#xe7f1;
                  </div>
                ) : (
                  <i></i>
                )}
              </Tooltip>
            </>
          )}
        </div>
      </div>
    )
  }
  // 表头上传人
  renderOriginator = () => {
    const { view_type } = this.props
    if (view_type == '0') {
      return '上传人'
    } else if (view_type == '1') {
      return '大小'
    } else {
    }
  }
  // 列表操作
  renderKeyOperate = item => {
    const { type } = item
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          paddingRight: 20
        }}
      >
        <Popconfirm
          title={`你确定要恢复${currentNounPlanFilterName(PROJECTS)}吗？`}
          onConfirm={e => this.actionsManager('confirmArchives', item, e)}
          onCancel={e => e.stopPropagation()}
          okText="确定"
          cancelText="取消"
        >
          <Tooltip title={'恢复归档'}>
            {type == '0' || !type ? (
              <div
                className={`${globalStyles.authTheme}  ${indexStyles.table_operate}`}
                onClick={e => e.stopPropagation()}
              >
                &#xe717;
              </div>
            ) : (
              <i></i>
            )}
          </Tooltip>
        </Popconfirm>
        <Tooltip title={'下载'}>
          {type == '2' ? (
            <div
              className={`${globalStyles.authTheme}  ${indexStyles.table_operate}`}
              style={{ marginLeft: 16 }}
              onClick={e => this.actionsManager('download', item, e)}
            >
              &#xe7f1;
            </div>
          ) : (
            <i></i>
          )}
        </Tooltip>
      </div>
    )
  }
  // 表头操作
  renderTitleOperate = () => {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div
          className={`${globalStyles.authTheme}  ${indexStyles.table_operate_2} ${indexStyles.table_operate_2_selected}`}
        >
          &#xe7f5;
        </div>
        {/* <div className={`${globalStyles.authTheme}  ${indexStyles.table_operate_2}`} style={{ marginLeft: 16 }}>&#xe6c5;</div> */}
      </div>
    )
  }
  rowSelection = () => {
    const { view_type } = this.props
    if (view_type != '1') {
      //只有在查询项目文件和文件夹列表下才有选择
      return false
    }
    return {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log('onChange', selectedRowKeys, selectedRows)
        this.setState(
          {
            selectedRows
          },
          () => {
            this.setTableData()
          }
        )
      },
      getCheckboxProps: record => ({
        disabled: record.type != '2' // Column configuration not to be checked
      })
    }
  }
  render() {
    const {
      workbenchBoxContent_height = 700,
      view_type,
      data_source = [],
      loading
    } = this.props
    const scroll_height = workbenchBoxContent_height - 200
    const { columns = [] } = this.state
    console.log('sdasdworkbenchBoxContent_height', workbenchBoxContent_height)
    return (
      <div style={{ cursor: 'pointer' }}>
        <Table
          loading={loading}
          onRow={record => {
            return {
              onClick: e => this.actionsManager('tableRowClick', record, e) // 点击行
            }
          }}
          dataSource={data_source}
          columns={columns}
          rowKey={'id'}
          showHeader={view_type != '2'}
          pagination={false}
          rowSelection={this.rowSelection()}
          scroll={{ y: scroll_height }}
        />
      </div>
    )
  }
}
//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
  simplemode: { simplemodeCurrentProject = {} },
  technological: {
    datas: { currentUserOrganizes = [] }
  }
}) {
  return {
    simplemodeCurrentProject,
    currentUserOrganizes
  }
}
