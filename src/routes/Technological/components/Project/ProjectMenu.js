import React, { Component } from 'react'
import styles from './ProjectMenu.less'
import { connect } from 'dva'
import classNames from 'classnames/bind'
import { Tree, Tooltip, Menu, Dropdown, Input, message, Modal } from 'antd'
import {
  isHasOrgTeamBoardEditPermission,
  currentNounPlanFilterName
} from './../../../../utils/businessFunction'
import { PROJECTS } from '../../../../globalset/js/constant'

const { TreeNode } = Tree
const { Item } = Menu
let cx = classNames.bind(styles)

@connect(({ project }) => ({
  projectGroupTree: project.datas.projectGroupTree,
  projectList: project.datas.projectList,
  currentSelectedProjectMenuItem: project.datas.currentSelectedProjectMenuItem
}))
class ProjectMenu extends Component {
  constructor(props) {
    super(props)
    this.createTreeNodeRef = React.createRef()
    this.state = {
      expandedKeys: [], // 展开的节点 key
      selectedKeys: [], // 选中的节点 key
      autoExpandParent: true, // 是否自动展开父节点
      deleteGroupModalVisible: false, // 删除群组 modal visible
      create_tree_node: '', //需要创建子分组的节点 id
      new_tree_node_name: '', //创建的子分组的节点名称
      edit_tree_node: '', //需要编辑名称的节点id
      edit_tree_node_name: '', //要编辑的名称
      edit_tree_node_name_origin: '' //要编辑的名称的原始数值
    }
  }
  componentWillUnmount() {
    const { dispatch } = this.props
    dispatch({
      type: 'project/updateDatas',
      payload: {
        currentSelectedProjectMenuItem: ''
      }
    })
  }
  getSelectedItemKeywordOrId = () => {
    const { selectedKeys } = this.state
    //除了已归档项目的key为'archived-${组织id}'的形式，其他都是 id
    const [key] = selectedKeys
    if (key.includes('archived')) {
      return {
        type: 'keyword',
        keyword: 'archived',
        value: key.split('-')[1]
      }
    } else if (key.includes('org')) {
      return {
        type: 'org',
        value: key.split('-')[1]
      }
    } else {
      return {
        type: 'group_id',
        value: key
      }
    }
  }
  handleSelectedProjectMenuItem = () => {
    const { type, value, keyword } = this.getSelectedItemKeywordOrId()
    this.handleSelectedProjectMenuItemChange(value, null, type, keyword)
  }
  initSelectedKeys = () => {
    this.setState({
      selectedKeys: []
    })
  }
  handleSelectedProjectMenuItemChange = (item, e, type, keyword) => {
    const { dispatch, currentSelectedProjectMenuItem } = this.props
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    //如果是点击我参与的项目和我收藏的项目，则清空选中

    if (!type) {
      this.initSelectedKeys()
    }
    // if(item === currentSelectedProjectMenuItem) return
    Promise.resolve(
      dispatch({
        type: 'project/setCurrentSelectedProjectMenuItem',
        payload: {
          selected: item,
          type:
            !type || type === 'keyword'
              ? 'keyword'
              : type === 'group_id'
              ? 'group_id'
              : 'org_id'
        }
      })
    ).then(() => {
      return Promise.resolve(
        dispatch({
          type: 'project/fetchCurrentProjectGroupProjectList',
          payload: {
            keyword: type == 'keyword' ? keyword : !type ? item : '', //(!type) || type === 'keyword' ? item : "",
            group_id: type === 'group_id' ? item : '',
            org_id: type == 'org' || type == 'keyword' ? item : '' //type === 'org' ? item : ''
          }
        })
      )
    })
    // .catch(err => console.log('切换项目列表失败：' + err))
  }
  adjustArchivedProjectAlign = text => {
    const archivedProject = '已归档项目'
    const adjustMarginLeft = '0px'
    const isArchivedProject = () => text === archivedProject
    if (isArchivedProject()) {
      return {
        marginLeft: adjustMarginLeft,
        width: '100%'
      }
    }
    return {}
  }
  parseKeyId = (key = '') => key.split('-')[key.split('-').length - 1]
  parseKeyTitle = (key = '') => key.split('-')[1]
  handleCreateTreeNode = (key = '') => {
    const parentId = this.parseKeyId(key)
    const isOrg = key.split('-')[2] === 'org' ? true : false
    this.setState({
      create_tree_node: isOrg ? `org-${parentId}` : parentId,
      expandedKeys: [isOrg ? `org-${parentId}` : parentId],
      autoExpandParent: true
    })
  }
  handEditTreeNodeName = (key = '') => {
    const id = this.parseKeyId(key)
    const org_title = this.parseKeyTitle(key)
    this.setState({
      edit_tree_node: id,
      edit_tree_node_name: org_title,
      edit_tree_node_name_origin: org_title
    })
  }
  showDeleteModal = id => {
    Modal.confirm({
      title: '确定要删除这个分组吗？',
      content: '删除分组的同时也会删除它所包含的子分组',
      okText: '确定',
      cancelText: '取消',
      maskClosable: true,
      onCancel: () => {},
      onOk: () => this.comfirmedDeleteGroup(id)
    })
  }
  comfirmedDeleteGroup = id => {
    const { org_id } = this.state
    const { dispatch } = this.props
    Promise.resolve(
      dispatch({
        type: 'project/deleteProjectGroupTreeNode',
        payload: {
          id,
          _organization_id: org_id
        }
      })
    ).then(res => {
      if (res === 'error') {
        message.error('删除分组失败')
        return
      }
      message.success('删除分组成功')
    })
  }
  handleDeleteTreeNode = (key = '') => {
    const id = this.parseKeyId(key)
    const projectNum = this.shouldDeleteTreeNodeProjectNum(id)
    if (projectNum !== 0) {
      message.error('分组或其子分组中存在任务，删除失败')
      return
    }
    this.showDeleteModal(id)
  }
  shouldDeleteTreeNodeProjectNum = key => {
    const {
      projectGroupTree: { board_group }
    } = this.props
    const treeData = this.genTreeData(board_group)
    let treeNodeProjectNum = 0
    const findCurrentTreeNode = (arr = []) => {
      const finded = arr.find(item => item.key === key)
      const hasChildren = arr.filter(
        item => item.children && item.children.length
      )
      if (finded) {
        return finded
      }
      if (hasChildren.length) {
        const childrenArr = hasChildren.reduce(
          (acc, curr) => [...acc, ...curr.children],
          []
        )
        return findCurrentTreeNode(childrenArr)
      }
      if (!finded || !hasChildren.length) {
        return null
      }
    }
    const accumulateTreeNodeProjectNum = node => {
      treeNodeProjectNum += Number(node.board_count)
      if (!(node.children && node.children.length)) {
        return
      }
      return node.children.map(item => accumulateTreeNodeProjectNum(item))
    }
    const findedTreeNode = findCurrentTreeNode(treeData)
    if (!findedTreeNode) return treeNodeProjectNum
    accumulateTreeNodeProjectNum(findedTreeNode)
    return treeNodeProjectNum
  }
  handleClickedProjectMenuTreeNodeMenuItem = ({ item, key }) => {
    // debugger
    // 处理org_id
    const arr = key.split('-')
    const org_id = arr[arr.length - 1]
    this.setState({
      org_id
    })
    let new_key_arr = arr.slice()
    new_key_arr.pop()
    const new_key = new_key_arr.join('-')

    const caseMap = new Map([
      [/edit-/, () => this.handEditTreeNodeName(new_key)],
      [/create-child-/, () => this.handleCreateTreeNode(new_key)],
      [/delete-/, () => this.handleDeleteTreeNode(new_key)]
    ])
    const getCaseKey = [...caseMap].find(([k]) => k.test(new_key))
    if (getCaseKey) {
      const [, callback] = getCaseKey
      callback()
    }
  }
  onExpand = expandedKeys => {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    this.setState({
      expandedKeys,
      autoExpandParent: false
    })
  }
  onSelect = selectedKeys => {
    this.setState({ selectedKeys }, () => {
      const { selectedKeys } = this.state
      if (!selectedKeys.length) return
      this.handleSelectedProjectMenuItem()
    })
  }
  isNumberBigEnough = (num = 0) => {
    const toNum = Number(num)
    if (Number.isNaN(toNum)) return 0
    const maxNum = 99
    return toNum > maxNum
  }
  genChildTreeData = (node = {}, layer = 1) => {
    const { group_id, group_name, board_count, children } = node
    return {
      layer,
      title: group_name,
      key: group_id,
      board_count,
      children:
        children && children.length
          ? children.map(child => this.genChildTreeData(child, layer + 1))
          : null
    }
  }
  genTreeData = (tree = []) => {
    return tree.map(node => {
      const {
        org_name,
        org_id,
        board_count,
        archived_count,
        board_group_tree
      } = node
      const genTreeTopDataWithArchivedNode = () => {
        //已归档节点
        const archivedNode = {
          layer: 1,
          title: '已归档项目',
          key: `archived-${org_id}`,
          board_count: archived_count
        }
        if (!board_group_tree || !board_group_tree.length) {
          return [archivedNode]
        }
        const childNodeList = board_group_tree.map(childNode =>
          this.genChildTreeData(childNode, 1)
        )
        return [...childNodeList, archivedNode]
      }
      return {
        layer: 0,
        title: org_name,
        key: `org-${org_id}`,
        board_count,
        org_id,
        archived_count,
        children: genTreeTopDataWithArchivedNode()
      }
    })
  }
  genEditTreeNodeTitle = layer => {
    const { edit_tree_node_name } = this.state
    return (
      <Input
        size="small"
        style={{ width: '175px', marginLeft: `${-18 * (layer + 1)}px` }}
        ref={this.createTreeNodeRef}
        value={edit_tree_node_name}
        onChange={this.handleEditTreeNodeNameChange}
        onPressEnter={this.handleSubmitEditTreeNode}
        onBlur={this.handleEditTreeNodeInputBlur}
      />
    )
  }
  genTreeNodeTitle = ops => {
    const { title, layer, board_count, key, parentkey, org_id } = ops
    const { edit_tree_node } = this.state
    //生成修改名称的 tree node
    if (edit_tree_node === key) {
      return this.genEditTreeNodeTitle(layer)
    }
    //第一层，组织
    const editGroupName = (
      <Item key={`edit-${title}-${key}-${org_id}`}>修改分组名称</Item>
    )
    const createChildGroup = (
      <Item key={`create-child-${key}-${org_id}`}>新建子分组</Item>
    )
    const deleteGroup = <Item key={`delete-${key}-${org_id}`}>删除分组</Item>
    const isArchived = layer === 1 && title === '已归档项目'
    const isOrg = layer === 0
    const isLastLayer = layer === 6
    let item
    if (isOrg) {
      item = [createChildGroup]
    } else if (isLastLayer) {
      item = [editGroupName, deleteGroup]
    } else {
      item = [editGroupName, createChildGroup, deleteGroup]
    }
    const operatorMenu = (
      <Menu onClick={this.handleClickedProjectMenuTreeNodeMenuItem}>
        {item}
      </Menu>
    )
    const calculateWidthByLayer = scope => {
      const wrapperWidthMap = new Map([
        [0, '175px'],
        [1, '157px'],
        [2, '139px'],
        [3, '120px'],
        [4, '102px'],
        [5, '84px'],
        [6, '66px']
      ])
      const titleWidthMap = new Map([
        [0, '150px'],
        [1, '140px'],
        [2, '128px'],
        [3, '100px'],
        [4, '88px'],
        [5, '70px'],
        [6, '60px']
      ])
      let widthCase
      if (scope === 'wrapper') {
        widthCase = [...wrapperWidthMap].find(([key, _]) => layer === key)
        if (widthCase) {
          const [_, width] = widthCase
          return {
            width
          }
        }
        return {
          width: '175px'
        }
      }
      if (scope === 'title') {
        widthCase = [...titleWidthMap].find(([key, _]) => layer === key)
        if (widthCase) {
          const [_, width] = widthCase
          return {
            maxWidth: width
          }
        }
        return {
          maxWidth: '144px'
        }
      }
    }
    return (
      <div
        className={styles.projectMenuTree__treeNode_wrapper}
        style={Object.assign({}, calculateWidthByLayer('wrapper'))}
      >
        <Tooltip title={title}>
          <span className={styles.projectMenuTree__treeNode_title}>
            {title}
          </span>
        </Tooltip>
        {!isArchived && (
          <div onClick={e => (e ? e.stopPropagation() : null)}>
            {isHasOrgTeamBoardEditPermission() ? (
              <Dropdown overlay={operatorMenu} trigger={['click']}>
                <span
                  className={
                    styles.projectMenuTree__treeNode_boardCount_with_ellipsis
                  }
                >
                  {board_count}
                </span>
              </Dropdown>
            ) : (
              <span>{board_count}</span>
            )}
          </div>
        )}
        {isArchived && (
          <span className={styles.projectMenuTree__treeNode_boardCount}>
            {board_count}
          </span>
        )}
      </div>
    )
  }
  renderProjectGather = () => {
    const {
      projectList,
      currentSelectedProjectMenuItem,
      projectGroupTree
    } = this.props
    const NoContent = <div className={styles.projectGather__wrapper} />
    // if (!projectList) return NoContent;
    if (!projectGroupTree.participate_count) return NoContent
    const { participate_count, star_count } = projectGroupTree
    let participateWrapperClass = cx({
      [styles.projectGather__participate_wrapper]: true,
      [styles.menuItem_actived]:
        currentSelectedProjectMenuItem === 'participate' ? true : false
    })
    let collectionWrapperClass = cx({
      [styles.projectGather__collection_wrapper]: true,
      [styles.menuItem_actived]:
        currentSelectedProjectMenuItem === 'star' ? true : false
    })

    return (
      <div className={styles.projectGather__wrapper}>
        <a
          className={participateWrapperClass}
          onClick={e =>
            this.handleSelectedProjectMenuItemChange('participate', e)
          }
        >
          <span className={styles.projectGather__participate_title}>
            我参与的{currentNounPlanFilterName(PROJECTS)}
          </span>
          <span className={styles.projectGather__participate_length}>
            {this.isNumberBigEnough(participate_count)
              ? '99+'
              : participate_count}
          </span>
        </a>
        <a
          className={collectionWrapperClass}
          onClick={e => this.handleSelectedProjectMenuItemChange('star', e)}
        >
          <span className={styles.projectGather__collection_title}>
            我收藏的项目
          </span>
          <span className={styles.projectGather__collection_length}>
            {this.isNumberBigEnough(star_count) ? '99+' : star_count}
          </span>
        </a>
      </div>
    )
  }
  handleCreateTreeNodeNameChange = e => {
    this.setState({
      new_tree_node_name: e.target.value
    })
  }
  handleEditTreeNodeNameChange = e => {
    this.setState({
      edit_tree_node_name: e.target.value
    })
  }
  hasNotChangeEditTreeNodeName = () => {
    const { edit_tree_node_name, edit_tree_node_name_origin } = this.state
    return edit_tree_node_name === edit_tree_node_name_origin
  }
  isEditTreeNodeNameEmpty = () => {
    const { edit_tree_node_name } = this.state
    return !edit_tree_node_name.trim()
  }
  handleSubmitEditTreeNode = () => {
    const { dispatch } = this.props
    const { edit_tree_node_name, edit_tree_node, org_id } = this.state
    if (this.hasNotChangeEditTreeNodeName()) {
      return
    }
    if (this.isEditTreeNodeNameEmpty()) {
      message.destroy()
      message.error('分组名称不能为空')
      return
    }
    Promise.resolve(
      dispatch({
        type: 'project/editProjectGroupTreeNodeName',
        payload: {
          id: edit_tree_node,
          group_name: edit_tree_node_name,
          _organization_id: org_id
        }
      })
    ).then(res => this.createTreeNodeGetResponse(res))
  }
  handleSubmitCreateTreeNode = () => {
    const { new_tree_node_name, create_tree_node, org_id } = this.state
    const { dispatch } = this.props
    if (!new_tree_node_name.trim()) {
      message.destroy()
      message.info('分组名称不能为空')
      return
    }
    const isOrg = create_tree_node.split('-')[0] === 'org' ? true : false
    const arr = create_tree_node.split('-')
    let params = {
      group_name: new_tree_node_name,
      parent_id: isOrg ? arr[1] : create_tree_node
    }
    if (isOrg) {
      params['_organization_id'] = arr[1]
    } else {
      params['_organization_id'] = org_id
    }
    // console.log('sssss_1', { org_id })
    // debugger
    Promise.resolve(
      dispatch({
        type: 'project/createProjectGroupTreeNode',
        payload: {
          ...params
        }
      })
    ).then(res => this.createTreeNodeGetResponse(res))
  }
  createTreeNodeGetResponse = res => {
    if (res != 'success') {
      message.error(res)
      return
    }
    message.success('创建子分组成功')
    this.initCreateTreeNode()
  }
  initCreateTreeNode = () => {
    this.setState({
      create_tree_node: '',
      new_tree_node_name: ''
    })
  }
  createTreeNodeGetResponse = res => {
    if (res != 'success') {
      message.error(res)
      return
    }
    message.success('success')
    this.initEidtTreeNode()
  }
  initEidtTreeNode = () => {
    this.setState({
      edit_tree_node: '',
      edit_tree_node_name: '',
      edit_tree_node_name_origin: ''
    })
  }
  handleEditTreeNodeInputBlur = () => {
    this.initEidtTreeNode()
  }
  handleCreateTreeNodeInputBlur = () => {
    this.initCreateTreeNode()
  }
  renderCreateNode = () => {
    const { new_tree_node_name } = this.state
    return (
      <Input
        style={{ width: '175px' }}
        size="small"
        placeholder="输入分组名称，回车创建"
        ref={this.createTreeNodeRef}
        value={new_tree_node_name}
        onChange={this.handleCreateTreeNodeNameChange}
        onPressEnter={this.handleSubmitCreateTreeNode}
        onBlur={this.handleCreateTreeNodeInputBlur}
      />
    )
  }
  renderTreeNodes = (nodes = [], parentkey = null) => {
    const { create_tree_node } = this.state
    return nodes.map(node => {
      const { title, key, board_count, children, layer, org_id } = node

      let new_children = []
      if (children && children.length) {
        new_children = children.map(item => {
          return {
            ...item,
            org_id
          }
        })
      }

      if (children && children.length) {
        return (
          <TreeNode
            style={Object.assign({}, this.adjustArchivedProjectAlign(title), {
              width: '100%'
            })}
            title={this.genTreeNodeTitle({
              title,
              layer,
              board_count,
              key,
              parentkey,
              org_id
            })}
            key={key}
            dataRef={node}
          >
            {key === create_tree_node && (
              <TreeNode
                style={{ width: '100%', marginLeft: `${-18 * (layer + 1)}px` }}
                key={`create_input_${create_tree_node}_${org_id}`}
                title={this.renderCreateNode()}
              />
            )}
            {this.renderTreeNodes(new_children, key)}
          </TreeNode>
        )
      }
      return (
        <TreeNode
          {...node}
          style={Object.assign({}, this.adjustArchivedProjectAlign(title), {
            width: '100%'
          })}
          title={this.genTreeNodeTitle({
            title,
            layer,
            board_count,
            key,
            parentkey,
            org_id
          })}
        >
          {key === create_tree_node && (
            <TreeNode
              style={{ marginLeft: `${-18 * (layer + 1)}px` }}
              key={`create_input_${create_tree_node}_${org_id}`}
              title={this.renderCreateNode()}
            />
          )}
        </TreeNode>
      )
    })
  }
  renderProjectMenuTree = () => {
    const {
      projectGroupTree: { board_group }
    } = this.props
    const { expandedKeys, autoExpandParent, selectedKeys } = this.state
    const treeData = this.genTreeData(board_group)
    if (!board_group) return null
    return (
      <div className={styles.projectMenuTree__wrapper}>
        <div className={styles.projectMenuTree__title}>项目分组</div>
        <div className={styles.projectMenuTree__tree_wrapper}>
          <Tree
            onExpand={this.onExpand}
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
            onSelect={this.onSelect}
            selectedKeys={selectedKeys}
          >
            {this.renderTreeNodes(treeData)}
          </Tree>
        </div>
      </div>
    )
  }
  focusCreateTreeNode = () => {
    const { create_tree_node, edit_tree_node } = this.state
    if (
      this.createTreeNodeRef.current &&
      (create_tree_node || edit_tree_node)
    ) {
      this.createTreeNodeRef.current.focus()
    }
  }
  componentDidUpdate() {
    this.focusCreateTreeNode()
  }
  render() {
    // console.log('sssss', this.state.create_tree_node)
    return (
      <div className={styles.wrapper}>
        {this.renderProjectGather()}
        {this.renderProjectMenuTree()}
      </div>
    )
  }
}

export default ProjectMenu
