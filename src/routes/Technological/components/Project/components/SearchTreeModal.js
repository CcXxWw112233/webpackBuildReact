import React, { Component } from 'react'
import { Modal, Tree, Input, message } from 'antd'
import { connect } from 'dva'

const { TreeNode } = Tree
const Search = Input.Search

@connect(({ project }) => ({
  projectGroupSearchTree: project.datas.projectGroupSearchTree
}))
class SearchTreeModal extends Component {
  constructor(props) {
    super(props)
    this.searchInputRef = React.createRef()
    this.state = {
      expandedKeys: [],
      searchValue: '',
      autoExpandParent: false,
      selectedKeys: []
    }
  }
  handleModalOk = () => {
    const { onOk } = this.props
    const { selectedKeys } = this.state
    if (!selectedKeys.length) {
      message.destroy()
      message.info('当前未选中任何项目分组')
      return
    }
    const isSelectedOrg = (str = '') => str.startsWith('org-')
    //如果是移动到组织根目录，那么就ground_id为空
    const selectedKey = isSelectedOrg(selectedKeys[0]) ? '' : selectedKeys[0]
    onOk(selectedKey)
  }
  handleModalCancel = () => {
    const { onCancel } = this.props
    onCancel()
  }
  getParentKey = (key, tree) => {
    let parentKey
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i]
      if (node.children) {
        if (node.children.some(item => item.key === key)) {
          parentKey = node.key
        } else if (this.getParentKey(key, node.children)) {
          parentKey = this.getParentKey(key, node.children)
        }
      }
    }
    return parentKey
  }
  flatTreeData = (treeArr = []) => {
    const getData = obj =>
      obj.children && obj.children.length
        ? [
            { key: obj.key, title: obj.title },
            ...obj.children.map(child => getData(child))
          ]
        : [{ title: obj.title, key: obj.key }]
    return treeArr
      .reduce((acc, curr) => {
        return [...acc, getData(curr)]
      }, [])
      .flat(Infinity)
  }
  onSearchChange = e => {
    const { value } = e.target
    const { projectGroupSearchTree } = this.props
    const treeData = this.genTreeData(projectGroupSearchTree)
    const flattedTreeData = this.flatTreeData(treeData)

    const expandedKeys = flattedTreeData
      .map(item => {
        if (item.title.indexOf(value) > -1) {
          return this.getParentKey(item.key, treeData)
        }
        return null
      })
      .filter((item, i, self) => item && self.indexOf(item) === i)
    this.setState({
      expandedKeys,
      searchValue: value,
      autoExpandParent: true
    })
  }
  onExpand = expandedKeys => {
    this.setState({
      expandedKeys,
      autoExpandParent: false
    })
  }
  onSelect = selectedKeys => {
    this.setState({ selectedKeys })
  }
  genChildTreeData = (node = {}) => {
    const { group_id, group_name, children } = node
    return {
      title: group_name,
      key: group_id,
      children:
        children && children.length
          ? children.map(child => this.genChildTreeData(child))
          : null
    }
  }
  genTreeData = (tree = []) => {
    const { org_id, org_name, board_group_tree = [] } = tree

    let children = board_group_tree.map(node => {
      const { group_id, group_name, children } = node
      const genTreeTopDataWithArchivedNode = () => {
        if (!children || children.length === 0) return null
        const childNodeList = children.map(childNode =>
          this.genChildTreeData(childNode)
        )
        return [...childNodeList]
      }
      return {
        title: group_name,
        key: group_id,
        children: genTreeTopDataWithArchivedNode()
      }
    })
    //生成组织根目录
    const org = {
      title: org_name,
      key: `org-${org_id}`,
      children: children
    }
    return [org]
  }
  renderProjectTree = () => {
    const { projectGroupSearchTree } = this.props
    const treeData = this.genTreeData(projectGroupSearchTree)
    return this.renderTreeNodes(treeData)
  }
  renderTreeNodes = (nodes = []) => {
    const { searchValue } = this.state

    return nodes.map(node => {
      const { title, key, children } = node
      const index = title.indexOf(searchValue)
      const beforeStr = title.substr(0, index)
      const afterStr = title.substr(index + searchValue.length)
      const genTitle =
        index > -1 ? (
          <span style={{ userSelect: 'none' }}>
            {beforeStr}
            <span style={{ color: '#f50' }}>{searchValue}</span>
            {afterStr}
          </span>
        ) : (
          <span style={{ userSelect: 'none' }}>{title}</span>
        )

      if (children && children.length) {
        return (
          <TreeNode title={genTitle} key={key} dataRef={node}>
            {this.renderTreeNodes(node.children)}
          </TreeNode>
        )
      }
      return <TreeNode {...node} title={genTitle} />
    })
  }
  componentDidMount() {
    if (this.searchInputRef.current) this.searchInputRef.current.focus()
  }
  render() {
    const { title, visible } = this.props
    const { expandedKeys, autoExpandParent } = this.state
    return (
      <Modal
        title={title}
        visible={visible}
        okText="确认"
        cancelText="取消"
        onCancel={this.handleModalCancel}
        onOk={this.handleModalOk}
      >
        <div>
          <Search
            ref={this.searchInputRef}
            placeholder="请输入项目分组名称"
            onChange={this.onSearchChange}
          />
        </div>
        <Tree
          onSelect={this.onSelect}
          onExpand={this.onExpand}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
        >
          {this.renderProjectTree()}
        </Tree>
      </Modal>
    )
  }
}

SearchTreeModal.defaultProps = {
  title: '移动到项目分组',
  visible: false,
  onOk: function() {
    message.error('SearchTreeModal need onOk callback')
  },
  onCancel: function() {
    message.error('SearchTreeModal need onCancel callback')
  }
}

export default SearchTreeModal
