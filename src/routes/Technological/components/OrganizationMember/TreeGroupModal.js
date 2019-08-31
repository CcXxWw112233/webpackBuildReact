import React from 'react'
import { Input, Button, Modal, Tree, message } from 'antd'
import indexStyles from './index.less'

const TreeNode = Tree.TreeNode;

export default class TreeGroupModal extends React.Component {

  state={
    groups: ''
  }

  onCancel = () => {
    this.props.updateDatas({TreeGroupModalVisiblie: false})
  }

  onOk = () => {
    const { datas: { currentBeOperateMemberId } } = this.props.model
    this.props.updateDatas({TreeGroupModalVisiblie: false})
    this.props.setMemberWitchGroup({
      groups: this.state.groups,
      member_id: currentBeOperateMemberId
    })
  }

  onCheck = (e) => {
    this.setState({
      groups: e.join(',')
    })
  }
  render () {
    const { datas: { TreeGroupModalVisiblie, groupTreeList = []} } = this.props.model

    const loop = data => {
      if(!data || !data.length){
        return
      }
      return data.map((item) => {
        if (item.child_data) {
          return (
            <TreeNode key={item.id} title={item.name}>
              {loop(item.child_data)}
            </TreeNode>
          );
        }
        return <TreeNode key={item.id} title={item.name}/>;
      });
    }
    return (
      <div>
        <Modal
          title={`选择分组`}
          visible={TreeGroupModalVisiblie} //moveToDirectoryVisiblie
          width={472}
          zIndex={1020}
          destroyOnClose
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          onCancel={this.onCancel}
          onOk={this.onOk}
        >
          <div className={indexStyles.MoveToDirectoryOut}>
            <Tree checkable multiple onCheck={this.onCheck.bind(this)}>
              {loop(groupTreeList)}
            </Tree>
          </div>
        </Modal>
      </div>
    )
  }
}
