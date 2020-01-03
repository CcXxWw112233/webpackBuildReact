import React from 'react'
import { Modal, Tree, message } from 'antd'
import indexStyles from './index.less'
import { connect } from 'dva';

const TreeNode = Tree.TreeNode;

@connect(mapStateToProps)
export default class MoveToDirectory extends React.Component {

  state = {
    selectFolderId: '',
  }

  onCancel = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'projectDetailFile/updateDatas',
      payload: {
        moveToDirectoryVisiblie: false
      }
    })
  }
  //重新改变面包屑，递归
  findChildrenParent = (arr, childDataKey, key, value, originalData, callback) => {
    const { breadcrumbList = [] } = this.props
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
    const { dispatch } = this.props
    dispatch({
      type: 'projectDetailFile/updateDatas',
      payload: {
        breadcrumbList
      }
    })
  }

  onOk = () => {
    const { dispatch } = this.props
    const that = this
    const selectFolderId = this.state.selectFolderId
    if (!selectFolderId) {
      message.warn('请选择一个目标文件夹')
      return false
    }
    dispatch({
      type: 'projectDetailFile/updateDatas',
      payload: {
        moveToDirectoryVisiblie: false
      }
    })
    const { fileList, selectedRowKeys, selectedRows, copyOrMove, currentFileListMenuOperatorId, openMoveDirectoryType, filePreviewCurrentFileId, breadcrumbList, treeFolderData } = this.props

    let file_ids
    //分别从多文件选择， fileList单条信息 ， 文件预览进来
    if (openMoveDirectoryType === '1') {
      let chooseArray = []
      for (let i = 0; i < selectedRows.length; i++) {
        chooseArray.push(selectedRows[i].file_id)
      }
      file_ids = chooseArray.join(',')
    } else if (openMoveDirectoryType === '2') {
      file_ids = currentFileListMenuOperatorId
    } else if (openMoveDirectoryType === '3') {
      file_ids = filePreviewCurrentFileId
      //存在文件移动的情况同时是从文件预览进来的,移动过后改变面包屑路径
      if (copyOrMove === '0') {
        breadcrumbList.splice(0, breadcrumbList.length - 1)
        dispatch({
          type: 'projectDetailFile/updateDatas',
          payload: {
            currentParrentDirectoryId: selectFolderId,
          }
        })
        this.findChildrenParent([{ ...treeFolderData }], 'child_data', 'folder_id', selectFolderId, [{ ...treeFolderData }], function (data) {
          data['type'] = '1'
          data['file_name'] = data['folder_name']
          data['file_id'] = data['folder_id']
          breadcrumbList.unshift(data)
          dispatch({
            type: 'projectDetailFile/updateDatas',
            payload: {
              breadcrumbList
            }
          })
        });
      }
    }

    if (copyOrMove === '0') { //移动0 复制1
      dispatch({
        type: 'projectDetailFile/fileMove',
        payload: {
          file_ids,
          folder_id: selectFolderId
        }
      })
    } else {
      dispatch({
        type: 'projectDetailFile/fileCopy',
        payload: {
          file_ids,
          folder_id: selectFolderId
        }
      })
    }

  }
  onSelect = (e) => {
    // console.log(e)
    this.setState({
      selectFolderId: e[0]
    })
  }

  render() {
    const { moveToDirectoryVisiblie, copyOrMove, treeFolderData = {} } = this.props

    const loop = data => {
      if (!data || !data.length) {
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
        return <TreeNode key={item.folder_id} title={item.folder_name} />;
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
function mapStateToProps({
  projectDetailFile: {
    datas: {
      breadcrumbList = [],
      moveToDirectoryVisiblie,
      copyOrMove,
      treeFolderData = {},
      fileList = [],
      selectedRowKeys,
      selectedRows,
      currentFileListMenuOperatorId,
      openMoveDirectoryType,
      filePreviewCurrentFileId,


    }
  },
}) {
  return {
    breadcrumbList,
    moveToDirectoryVisiblie,
    copyOrMove,
    treeFolderData,
    fileList,
    selectedRowKeys,
    selectedRows,
    currentFileListMenuOperatorId,
    openMoveDirectoryType,
    filePreviewCurrentFileId,
  }
}