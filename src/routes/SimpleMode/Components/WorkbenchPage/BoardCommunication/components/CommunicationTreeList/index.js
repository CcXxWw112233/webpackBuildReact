import React, { Component } from 'react'
import { connect } from 'dva'
import { Collapse, Icon, message, Tree, Button } from 'antd'
import {
  getOrgNameWithOrgIdFilter,
  isPaymentOrgUser
} from '@/utils/businessFunction'
import { getFileList } from '@/services/technological/file.js'
import { isApiResponseOk } from '@/utils/handleResponseData'
import styles from './index.less'
import { log } from 'util'

const { Panel } = Collapse
const { TreeNode, DirectoryTree } = Tree

@connect(mapStateToProps)
export default class CommunicationTreeList extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    const { isVisibleFileList } = this.props
    const {
      // is_show_board_file_area,
      boards_flies = []
    } = this.props
  }

  // 显示项目目录名（一级）
  showHeader = (item, isShowCompanyName) => {
    const { currentUserOrganizes = [] } = this.props
    return (
      <div className={styles.panelHeader}>
        <div className={styles.name}>{item.board_name}</div>
        {isShowCompanyName && (
          <div className={styles.org_name}>
            #{getOrgNameWithOrgIdFilter(item.org_id, currentUserOrganizes)}
          </div>
        )}
      </div>
    )
  }

  // 渲染当前项目子节点树
  renderTreeNodes = communicationSubFolderData =>
    communicationSubFolderData.map(item => {
      if (item.child_data) {
        return (
          <TreeNode
            title={item.folder_name}
            key={item.folder_id}
            dataRef={item}
          >
            {this.renderTreeNodes(item.child_data)}
          </TreeNode>
        )
      }
      return (
        <TreeNode title={item.folder_name} key={item.folder_id} {...item} />
      )
    })

  // 展开/收起节点时触发
  onExpand = expandedKeys => {
    // console.log('onExpand', expandedKeys);
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    console.log('onExpand', expandedKeys)
    const { dispatch } = this.props
    dispatch({
      type: 'projectCommunication/updateDatas',
      payload: {
        expandedKeys,
        autoExpandParent: false
      }
    })
  }

  // 点击树节点触发
  onSelect = (first_item, selectedKeys, info) => {
    // console.log('onSelect-first_item',first_item);
    // console.log('onSelect-selectedKeys',selectedKeys);
    // console.log('onSelect-info',info);
    // const currentInfo = info.selectedNodes[0].props.dataRef;
    const currentInfo = (
      info.selectedNodes.find(item => item.key == selectedKeys[0]) || {
        props: {}
      }
    ).props.dataRef
    // this.setState({ selectedKeys });
    this.props.onSelectTree(currentInfo, first_item)
  }

  render() {
    const {
      boards_flies = [],
      is_show_org_name,
      is_all_org,
      // currentUserOrganizes,
      // selectBoardFileModalVisible,
      isVisibleFileList,
      communicationSubFolderData = [],
      collapseActiveKeys,
      currentSelectBoardId,
      currentLayerSelectedStyle,
      expandedKeys,
      selectedKeys,
      currentFolderId
    } = this.props
    const isShowCompanyName = is_show_org_name && is_all_org // 是否显示归属组织
    const { child_data = [] } = communicationSubFolderData
    return (
      <div className={styles.communicationTreeList}>
        {/* 这里是左侧的项目交流列表 */}
        {isVisibleFileList && (
          <div className={styles.fileList}>
            <div
              className={`${styles.fileListContent} ${isShowCompanyName &&
                styles.arrowPosition}`}
            >
              <Collapse
                bordered={false}
                accordion
                // defaultActiveKey={collapseActiveKeys}
                defaultActiveKey={currentSelectBoardId}
                activeKey={currentSelectBoardId}
                expandIcon={({ isActive }) => (
                  <Icon type="caret-right" rotate={isActive ? 90 : 0} />
                )}
                onChange={this.props.setCollapseActiveKeys}
              >
                {boards_flies &&
                  boards_flies.map((item, key) => {
                    const {
                      board_name,
                      id,
                      type,
                      org_id,
                      file_data = []
                    } = item
                    // console.log("boards_flies",item);
                    return (
                      // <Panel header={this.showHeader(item, isShowCompanyName)} key={`${item.id}_${item.file_data.length}`} onClick={()=>this.panelOnClick(item)}>
                      //添加付费过滤 liuyingj 2019-11-13
                      isPaymentOrgUser(org_id) && (
                        <Panel
                          header={this.showHeader(item, isShowCompanyName)}
                          key={`${item.id}`}
                          onClick={() => this.panelOnClick(item)}
                        >
                          {child_data && child_data.length ? (
                            <DirectoryTree
                              multiple
                              defaultExpandAll
                              onSelect={this.onSelect.bind(this, item)}
                              onExpand={this.onExpand}
                              expandedKeys={expandedKeys}
                              autoExpandParent={this.state.autoExpandParent}
                              selectedKeys={[currentFolderId]}
                            >
                              {this.renderTreeNodes(child_data)}
                            </DirectoryTree>
                          ) : (
                            ''
                          )}
                        </Panel>
                      )
                    )
                  })}
              </Collapse>
            </div>
          </div>
        )}
      </div>
    )
  }
}

function mapStateToProps({
  gantt: {
    datas: { is_show_board_file_area, boards_flies = [] }
  },
  technological: {
    datas: { currentUserOrganizes = [], is_show_org_name, is_all_org }
  },
  // projectCommunication:{
  //     count,
  // }
  projectCommunication: {
    currentBoardId,
    communicationProjectListData,
    communicationSubFolderData,
    expandedKeys
  }
}) {
  return {
    is_show_board_file_area,
    boards_flies,
    currentUserOrganizes,
    is_show_org_name,
    is_all_org,
    // count
    communicationSubFolderData,
    expandedKeys
  }
}
