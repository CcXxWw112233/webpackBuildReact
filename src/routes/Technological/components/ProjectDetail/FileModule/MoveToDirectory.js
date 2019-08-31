import React from 'react'
import { Input, Button, Modal, Tree, message } from 'antd'
import indexStyles from './index.less'

const TreeNode = Tree.TreeNode;


export default class MoveToDirectory extends React.Component {

  state={
    selectFolderId: '',
  }

  onCancel = () => {
    this.props.updateDatasFile({moveToDirectoryVisiblie: false})
  }
  //重新改变面包屑，递归
  findChildrenParent = (arr, childDataKey, key, value, originalData, callback) => {
    const { datas: { breadcrumbList = [] } } = this.props.model
    for (var i = 0; i < arr.length; i++) {
      if (arr[i][key] == value) {
        callback(arr[i])
        this.findChildrenParent(originalData, 'child_data', 'folder_id', arr[i]['parent_id'], originalData, function (data) {
          data['type'] = '1'
          data['file_name'] = data['folder_name']
          data['file_id'] = data['folder_id']
          breadcrumbList.unshift(data)
        });
        break
      } else {
        this.findChildrenParent(arr[i][childDataKey], childDataKey, key, value, originalData, callback);
      }
    }
    this.props.updateDatasFile({
      breadcrumbList
    })
  }

  onOk = () => {
    const that = this
    const selectFolderId = this.state.selectFolderId
    if(!selectFolderId) {
      message.warn('请选择一个目标文件夹')
      return false
    }
    this.props.updateDatasFile({moveToDirectoryVisiblie: false})
    const { datas: { fileList, selectedRowKeys, copyOrMove, currentFileListMenuOperatorId, openMoveDirectoryType, filePreviewCurrentFileId, breadcrumbList, treeFolderData } } = this.props.model

    let file_ids
    //分别从多文件选择， fileList单条信息 ， 文件预览进来
    if(openMoveDirectoryType === '1') {
      let chooseArray = []
      for(let i=0; i < selectedRowKeys.length; i++ ){
        chooseArray.push(fileList[selectedRowKeys[i]].file_id)
      }
      file_ids = chooseArray.join(',')
    }else if (openMoveDirectoryType === '2'){
      file_ids = currentFileListMenuOperatorId
    }else if(openMoveDirectoryType === '3') {
      file_ids = filePreviewCurrentFileId
      //存在文件移动的情况同时是从文件预览进来的,移动过后改变面包屑路径
      if(copyOrMove === '0') {
        breadcrumbList.splice(0, breadcrumbList.length - 1)
        this.props.updateDatasFile({
          currentParrentDirectoryId: selectFolderId,
        })
        this.findChildrenParent([{...treeFolderData}], 'child_data', 'folder_id', selectFolderId, [{...treeFolderData}], function (data) {
          data['type'] = '1'
          data['file_name'] = data['folder_name']
          data['file_id'] = data['folder_id']
          breadcrumbList.unshift(data)
          that.props.updateDatasFile({
            breadcrumbList
          })
        });
      }
    }

    if(copyOrMove === '0'){ //移动0 复制1
      this.props.fileMove({
        file_ids,
        folder_id: selectFolderId
      })
    }else {
      this.props.fileCopy({
        file_ids,
        folder_id: selectFolderId
      })
    }

  }
  onSelect = (e) => {
    // console.log(e)
    this.setState({
      selectFolderId: e[0]
    })
  }

  render () {
    const { datas: { moveToDirectoryVisiblie, copyOrMove, treeFolderData = {}} } = this.props.model

    const loop = data => {
      if(!data || !data.length){
        return
      }
      return data.map((item) => {
        if (item.child_data) {
          return (
            <TreeNode key={item.folder_id} title={item.folder_name}>
              {loop(item.child_data)}
            </TreeNode>
          );
        }
        return <TreeNode key={item.folder_id} title={item.folder_name}/>;
      });
    }
    return (
      <div>
        <Modal
          title={`${copyOrMove === '1' ? '复制' : '移动'}文件`}
          visible={moveToDirectoryVisiblie} //
          width={472}
          zIndex={1020}
          destroyOnClose
          okText="确认"
          cancelText="取消"
          onCancel={this.onCancel}
          onOk={this.onOk}
        >
          <div className={indexStyles.MoveToDirectoryOut}>
            <Tree onSelect={this.onSelect.bind(this)}>
              <TreeNode key={treeFolderData.folder_id} title={treeFolderData.folder_name}>
                {loop(treeFolderData.child_data)}
              </TreeNode>
            </Tree>
          </div>
        </Modal>
      </div>
    )
  }
}
