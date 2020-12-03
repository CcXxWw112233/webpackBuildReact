import React from 'react'
import { Modal, Tree, Icon, message, Button } from 'antd'
import globalStyles from '@/globalset/css/globalClassName.less'
import styles from './index.less'
import { getFolderTreeWithArchives } from '../../../../../../services/technological/file'
import { isApiResponseOk } from '../../../../../../utils/handleResponseData'
import { archiveBoardSaveFile } from '../../../../../../services/technological/project'

const TreeNode = Tree.TreeNode

export default class ArchiveSelect extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      treeData: {},
      checkedKeys: []
    }
  }
  static defaultProps = {
    visible: false,
    board_id: '',
    board_name: '',
    setVisible: function() {},
    onOk: function() {}
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      //打开弹窗
      this.getTreeData()
    }
  }

  getTreeData = () => {
    const { board_id } = this.props
    getFolderTreeWithArchives({ board_id }).then(res => {
      if (isApiResponseOk(res)) {
        const {
          folder_data = [],
          file_data = [],
          board_id,
          board_name
        } = res.data
        let child_data = [].concat(folder_data, file_data)
        this.handleTreeData(child_data)
        this.setState({
          treeData: {
            board_name,
            board_id: `board_${board_id}`,
            child_data
          }
        })
      } else {
        message.error(res.message)
      }
    })
  }

  handleTreeData = data => {
    //为每个id前加个类型
    if (!data) return []
    for (let val of data) {
      let { child_data = [], folder_id, file_id, file_data = [] } = val
      val.child_data = [].concat(child_data, file_data)
      if (folder_id) val.folder_id = `folder_${folder_id}`
      else if (file_id) val.file_id = `file_${file_id}`
      else ''
      if (val.child_data.length) this.handleTreeData(val.child_data)
    }
  }

  onCancel = () => {
    this.setState({
      checkedKeys: []
    })
    this.props.setVisible()
  }

  onOk = () => {
    const { board_id } = this.props
    const { checkedKeys = [] } = this.state
    const is_archived_all = checkedKeys.find(
      item => item.indexOf('board') != -1
    ) //是否全选
    const params = {
      board_id,
      is_archived_all: '0',
      file_ids: [],
      folder_ids: []
    }
    if (is_archived_all) {
      params.is_archived_all = '1'
    } else {
      params.is_archived_all = '0'
      params.file_ids = checkedKeys
        .filter(item => item.indexOf('file') != -1)
        .map(item => item.split('_')[1])
      params.folder_ids = checkedKeys
        .filter(item => item.indexOf('folder') != -1)
        .map(item => item.split('_')[1])
    }
    archiveBoardSaveFile(params).then(res => {
      if (isApiResponseOk(res)) {
        this.props.onOk(params)
      } else {
        message.error(res.message)
      }
    })
    this.setState({
      checkedKeys: []
    })
  }
  onCheck = checkedKeys => {
    // console.log('checkedKeys', checkedKeys)
    this.setState({
      checkedKeys
    })
  }
  onCheckInhalfChecked = (checkedKeys, info, e) => {
    //严格受控时的操作（废弃）
    return
    const { board_id } = this.props
    const { checked = [] } = checkedKeys
    const _checkedKeys_ = { ...checkedKeys }
    //遍历拿到所选的父级，塞进halfChecked（表示半选状态）
    let arr = checked.map(item => {
      return this.recusions(item)
    })
    let arr_1 = []
    for (let val of arr) {
      arr_1 = [].concat(arr_1, val)
    }
    const _halfChecked_ = arr_1
      .map(item => item.folder_id)
      .filter(item => !checked.includes(item))
    _checkedKeys_.halfChecked = Array.from(
      new Set([..._halfChecked_, board_id])
    )

    console.log('onCheck_arr', _checkedKeys_)
    this.setState({
      checkedKeys: _checkedKeys_
    })
  }

  recusions = id => {
    //递归拿到选中元素的所有父元素（用于做checkStrictly选择做半选择id） 参考自https://www.jianshu.com/p/3ec45c6a5e06
    return
    const { treeData = {} } = this.state
    const { child_data = [] } = treeData
    function funTree(data, id) {
      let b = new Array()
      //树形转为一维数组
      function Family(data, id) {
        data.forEach(item => {
          const { child_data = [] } = item
          b.push(item)
          if (child_data.length !== 0) {
            Family(child_data, id)
          }
        })
        return [b, id]
      }

      let c = new Array()
      //查找整个树形家族
      function FamilyFun(data) {
        let n = data[0]
        for (let i = 0; i < n.length; i++) {
          const { folder_id } = n[i]
          if (folder_id === data[1]) {
            c.push(n[i])
            FamilyFun([n, n[i].parent_id])
          }
        }
        return c
      }
      return FamilyFun(Family(data, id))
    }
    return funTree(child_data, id)
  }
  loop = data => {
    if (!data || !data.length) {
      return ''
    }
    return data.map(item => {
      const {
        board_id,
        folder_id,
        file_id,
        board_name,
        folder_name,
        file_name
      } = item
      if (item.child_data) {
        return (
          <TreeNode
            icon={<i className={globalStyles.authTheme}>&#xe6f0;</i>}
            key={board_id || folder_id || file_id}
            title={board_name || folder_name || file_name}
          >
            {this.loop(item.child_data)}
          </TreeNode>
        )
      }
      return (
        <TreeNode
          key={board_id || folder_id || file_id}
          title={board_name || folder_name || file_name}
        />
      )
    })
  }

  render() {
    const { treeData = {}, checkedKeys = [] } = this.state
    const { visible, board_id, board_name } = this.props
    // console.log('checkedKeys_treeData', treeData)
    return (
      <div>
        <Modal
          title={`选择存入档案的文件`}
          visible={visible} //
          width={560}
          zIndex={1020}
          destroyOnClose
          okText={'确认'}
          okButtonProps={{
            disabled: !checkedKeys.length
          }}
          cancelText="取消"
          onCancel={this.onCancel}
          onOk={this.onOk}
        >
          <div
            style={{ maxHeight: 460, overflowY: 'auto' }}
            className={styles.main}
          >
            <Tree
              checkedKeys={checkedKeys}
              onCheck={this.onCheck}
              // checkStrictly
              defaultExpandedKeys={[`board_${board_id}`]}
              checkable
            >
              <TreeNode
                icon={
                  <Icon
                    type="caret-down"
                    style={{ fontSize: 20, color: 'rgba(0,0,0,.45)' }}
                  />
                }
                key={`board_${board_id}`}
                title={board_name}
              >
                {this.loop(treeData.child_data)}
              </TreeNode>
            </Tree>
          </div>
        </Modal>
      </div>
    )
  }
}
